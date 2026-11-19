import { gzipSync } from "node:zlib";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { puntoEnProvincia } from "./ayudas";

// Ronda QA 2026-11-19: mapa dibujado en el servidor con la interacción como isla (1a7b097, 7693b25; O-1 de
// docs/qa/2026-11-18-cierre-media.md, aprobada por el dueño).
// Variables opcionales:
// - E2E_MAIN_URL: build de main (a32e00d), para comparar posiciones de rótulos y pines y el orden de foco.
// - E2E_BASEPATH_URL: build GITHUB_PAGES=true servido bajo /coffee-santander-shop/.

const MAPA = "#mapa [data-mapa-interactivo][style*='aspect-ratio']";
const SVG = 'svg[aria-label="Mapa de Santander por provincias"]';
const PROVINCIAS = ["Comunera", "García Rovira", "Guanentá", "Metropolitana", "Soto Norte", "Vélez", "Yariguíes"];
const ACTIVAS = ["guanenta", "soto"];
const SERIAS = ["serious", "critical"];
const MARCA_INTERACCION = "Ver todo Santander"; // texto que solo vive en el trozo de la interacción
const ANCHOS = [320, 360, 390, 768, 1024, 1280, 1440];

const sinDesborde = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
const capaFija = (page: Page) => page.locator("#mapa-provincias .mapa-capa");

/** La interacción montada: la capa medida reemplazó a la fija. */
async function esperarInteraccion(page: Page) {
  await expect(capaFija(page)).toHaveCount(0, { timeout: 10_000 });
  await expect(page.locator("#mapa .mapa-pin").first()).toBeVisible();
}

/** Retrasa el trozo de la interacción `ms` milisegundos para poder actuar antes de que llegue. */
async function retrasarInteraccion(page: Page, ms: number) {
  const estado = { pedida: false, servida: false, url: "" };
  await page.route(/\/_next\/static\/chunks\/[^/]+\.js$/, async (r) => {
    // Si la prueba termina con un trozo aún en camino, la página se cierra y la respuesta queda descartada: ese error
    // no es del sitio (intermitencia de la prueba vista el 2026-11-19, «Response has been disposed»).
    try {
      const res = await r.fetch();
      const cuerpo = await res.text();
      if (cuerpo.includes(MARCA_INTERACCION)) {
        estado.pedida = true;
        estado.url = r.request().url();
        await new Promise((f) => setTimeout(f, ms));
        estado.servida = true;
      }
      await r.fulfill({ response: res, body: cuerpo });
    } catch (e) {
      if (!page.isClosed()) throw e;
    }
  });
  return estado;
}

async function axeSerio(page: Page, incluir?: string) {
  const b = incluir ? new AxeBuilder({ page }).include(incluir) : new AxeBuilder({ page });
  const r = await b.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  return r.violations.filter((v) => SERIAS.includes(v.impact ?? "")).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

interface Pieza {
  clave: string;
  x: number;
  y: number;
  w: number;
  h: number;
  extra: string;
}

/** Rótulos, pines, marcas y escala visibles, con su caja relativa al contenedor del mapa. */
async function medirCapa(page: Page): Promise<{ caja: { w: number; h: number }; piezas: Pieza[] }> {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate((sel) => {
    const mapa = document.querySelector<HTMLElement>(sel)!;
    const c = mapa.getBoundingClientRect();
    const visible = (e: Element) => {
      const s = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      // Un rótulo que choca queda oculto: con visibility en el HTML y con opacidad 0 en la capa medida (y en main).
      return s.visibility === "visible" && s.display !== "none" && s.opacity !== "0" && r.width > 0;
    };
    const rel = (e: Element) => {
      const r = e.getBoundingClientRect();
      return { x: +(r.left - c.left).toFixed(1), y: +(r.top - c.top).toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
    };
    const piezas: { clave: string; x: number; y: number; w: number; h: number; extra: string }[] = [];
    for (const e of mapa.querySelectorAll(".mapa-rotulo"))
      if (visible(e)) piezas.push({ clave: `rotulo:${e.firstChild?.textContent}`, ...rel(e), extra: "" });
    for (const e of mapa.querySelectorAll(".mapa-pin")) {
      if (!visible(e)) continue;
      const punto = e.querySelector(".mapa-pin__punto")!;
      const nombre = e.querySelector(".mapa-pin__nombre")!;
      const n = nombre.getBoundingClientRect();
      const p = punto.getBoundingClientRect();
      const lado = n.width <= 1 ? "compacto" : n.left < p.left ? "izquierda" : "derecha";
      piezas.push({ clave: `pin:${e.getAttribute("aria-label")}`, ...rel(punto), extra: lado });
      if (lado !== "compacto") piezas.push({ clave: `pin-nombre:${e.getAttribute("aria-label")}`, ...rel(nombre), extra: "" });
    }
    for (const e of mapa.querySelectorAll(".mapa-marca")) if (visible(e)) piezas.push({ clave: `marca:${e.textContent}`, ...rel(e), extra: "" });
    for (const e of mapa.querySelectorAll(".mapa-escala")) if (visible(e)) piezas.push({ clave: `escala:${e.textContent}`, ...rel(e), extra: "" });
    return { caja: { w: +c.width.toFixed(1), h: +c.height.toFixed(1) }, piezas };
  }, MAPA);
}

/** Diferencias de más de `tol` px (o de lado/visibilidad) entre dos capas. */
function diferencias(a: Pieza[], b: Pieza[], tol = 1.5): string[] {
  const mb = new Map(b.map((p) => [p.clave, p]));
  const ma = new Map(a.map((p) => [p.clave, p]));
  const fuera: string[] = [];
  for (const p of a) {
    const q = mb.get(p.clave);
    if (!q) {
      fuera.push(`${p.clave}: solo en la primera`);
      continue;
    }
    const d = Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y), Math.abs(p.w - q.w), Math.abs(p.h - q.h));
    if (d > tol || p.extra !== q.extra) fuera.push(`${p.clave}: ${JSON.stringify(p)} ≠ ${JSON.stringify(q)}`);
  }
  for (const q of b) if (!ma.has(q.clave)) fuera.push(`${q.clave}: solo en la segunda`);
  return fuera;
}

async function nuevaPagina(browser: Browser, { js = true, ancho = 1280, alto = 900, base, toque = false }: { js?: boolean; ancho?: number; alto?: number; base?: string; toque?: boolean } = {}) {
  const ctx = await browser.newContext({
    javaScriptEnabled: js,
    viewport: { width: ancho, height: alto },
    baseURL: base ?? test.info().project.use.baseURL,
    hasTouch: toque,
    isMobile: toque,
    locale: "es-CO",
  });
  return { ctx, page: await ctx.newPage() };
}

// =====================================================================================================================
// 1. Sin JavaScript: el mapa completo viene en el HTML
// =====================================================================================================================
test.describe("mapa sin JavaScript (HTML del build)", () => {
  for (const ancho of [320, 360, 1440])
    test(`a ${ancho} px: dibujo completo, nombres, pines enlazados, «Próximamente», sin desborde y axe`, async ({ browser }) => {
      const { ctx, page } = await nuevaPagina(browser, { js: false, ancho, alto: 800 });
      await page.goto("/");
      const mapa = page.locator(MAPA);
      await mapa.scrollIntoViewIfNeeded();
      await expect(page.locator(`#mapa ${SVG}`)).toHaveCount(1);
      await expect(page.locator("#mapa g.prov")).toHaveCount(7);
      expect(await page.locator("#mapa path[data-municipio]").count()).toBeGreaterThanOrEqual(87);
      for (const slug of ACTIVAS) await expect(page.locator(`g[data-provincia="${slug}"]`)).toHaveAttribute("role", "button");
      await expect(page.locator("#mapa g.prov--vacia")).toHaveCount(5);
      await expect(page.locator("#mapa g.prov--vacia[role]")).toHaveCount(0);

      const m = await medirCapa(page);
      // Los siete rótulos están en el HTML; los que chocan con un pin se ocultan en su tramo de ancho (como en main,
      // ver «posiciones frente a main»). Al menos cinco a la vista y todas las vacías visibles con «Próximamente».
      const todos = await page.locator("#mapa .mapa-rotulo").evaluateAll((es) => es.map((e) => e.firstChild?.textContent));
      expect(todos.sort()).toEqual([...PROVINCIAS].sort());
      const rotulos = m.piezas.filter((p) => p.clave.startsWith("rotulo:")).map((p) => p.clave.slice(7));
      expect(rotulos.length).toBeGreaterThanOrEqual(5);
      const vacias = await page.locator("#mapa .mapa-rotulo").evaluateAll((es) =>
        es.filter((e) => getComputedStyle(e).visibility === "visible").map((e) => [e.firstChild?.textContent, e.querySelector("small")?.textContent ?? null]),
      );
      for (const [nombre, prox] of vacias) expect(prox, nombre ?? "").toBe(["Guanentá", "Soto Norte"].includes(nombre ?? "") ? null : "Próximamente");
      // Ningún rótulo de provincia fuera de la caja del mapa. (El nombre de un pin puede rebasar unos px el borde a
      // 360 px, igual que en main: observación O-3 de la ronda, cubierta por «posiciones frente a main».)
      for (const p of m.piezas.filter((q) => q.clave.startsWith("rotulo:"))) {
        expect(p.x, p.clave).toBeGreaterThanOrEqual(-1);
        expect(p.x + p.w, p.clave).toBeLessThanOrEqual(m.caja.w + 1);
      }

      const pines = page.locator("#mapa-provincias a.mapa-pin:visible");
      await expect(pines).toHaveCount(2);
      expect((await pines.evaluateAll((as) => as.map((a) => `${a.getAttribute("aria-label")} → ${a.getAttribute("href")}`))).sort()).toEqual([
        "Ver la ficha de Café Arreboles, Tona → /cafes/cafe-arreboles/",
        "Ver la ficha de Café Casa Martínez, Pinchote → /cafes/cafe-casa-martinez/",
      ]);
      expect(await sinDesborde(page)).toBe(true);
      await mapa.screenshot({ path: `docs/qa/capturas/2026-11-19-mapa-sin-js-${ancho}.png` });
      await ctx.close();
    });

  // axe necesita JavaScript en la página: se pasa sobre el mismo marcado del build (capa fija), con JS y sin ningún
  // gesto, de modo que la interacción todavía no llegó.
  for (const ancho of [360, 1440])
    test(`a ${ancho} px: axe sin violaciones serias en el mapa del HTML (antes de que llegue la interacción)`, async ({ page }) => {
      const estado = await retrasarInteraccion(page, 0);
      await page.setViewportSize({ width: ancho, height: ancho === 360 ? 740 : 900 });
      await page.goto("/", { waitUntil: "networkidle" });
      await expect(capaFija(page)).toHaveCount(1);
      expect(await axeSerio(page, "#mapa")).toEqual([]);
      expect(estado.pedida, "axe corrió sobre la capa del HTML").toBe(false);
    });

  test("un pin del HTML navega a su ficha sin JavaScript", async ({ browser }) => {
    const { ctx, page } = await nuevaPagina(browser, { js: false, ancho: 1280 });
    await page.goto("/");
    await page.locator('#mapa-provincias a.mapa-pin:visible[href="/cafes/cafe-arreboles/"]').click();
    await expect(page).toHaveURL(/\/cafes\/cafe-arreboles\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Café Arreboles");
    await ctx.close();
  });
});

// =====================================================================================================================
// 2. Con JavaScript: la interacción llega como isla
// =====================================================================================================================
test.describe("mapa con JavaScript", () => {
  test("escritorio: el trozo de la interacción no se pide al cargar; llega con el primer gesto (mapa a la vista)", async ({ page }) => {
    const estado = await retrasarInteraccion(page, 0);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    expect(estado.pedida).toBe(false);
    await expect(capaFija(page)).toHaveCount(1);
    await page.mouse.move(700, 450);
    await expect.poll(() => estado.pedida).toBe(true);
    await esperarInteraccion(page);
  });

  for (const ancho of [1280, 360])
    test(`a ${ancho} px: tarjeta con ratón y con teclado; Escape la cierra`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: ancho === 360 ? 740 : 900 });
      await page.goto(process.env.E2E_ESCAPE_URL ?? "/", { waitUntil: "networkidle" });
      await page.locator("#mapa").scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.mouse.move(2, 2);
      await esperarInteraccion(page);
      // El puntero queda en la mitad superior: así la hoja (a 360 px, fija abajo) no cae debajo de él (ver QA-031).
      const punto = await puntoEnProvincia(page, "guanenta");
      const x = punto.x;
      let y = punto.y;
      if (y > 300) {
        await page.evaluate((d) => window.scrollBy(0, d), y - 250);
        y = 250;
      }
      await page.mouse.move(x, y);
      const tarjeta = page.getByRole("dialog", { name: /Guanentá/ });
      await expect(tarjeta).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(tarjeta).toBeHidden();
      await page.mouse.move(2, 2);
      await page.locator('g[data-provincia="soto"]').focus();
      const soto = page.getByRole("dialog", { name: /Soto Norte/ });
      await expect(soto).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(soto).toBeHidden();
      await expect(page.locator('g[data-provincia="soto"]')).toBeFocused();
    });

  // QA-031: a 360 px con ratón, si la hoja aparece debajo del puntero, al cerrarla con Escape vuelve a abrirse y se
  // cierra cada ≈ 200 ms mientras el puntero no se mueva. En main (a32e00d) no pasa. Corre también contra main con
  // E2E_ESCAPE_URL=<url de main>/.
  test("QA-031: a 360 px con ratón, Escape cierra la hoja aunque el puntero quede donde estaba la hoja (sin reabrir)", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(process.env.E2E_ESCAPE_URL ?? "/", { waitUntil: "networkidle" });
    await page.locator("#mapa").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.mouse.move(2, 2);
    await esperarInteraccion(page);
    // Guanentá al centro y luego 80 px más abajo: el punto queda bajo el borde superior de la hoja (y ≈ 378).
    const punto = await puntoEnProvincia(page, "guanenta");
      const x = punto.x;
      let y = punto.y;
    await page.evaluate(() => window.scrollBy(0, -80));
    y += 80;
    expect(await page.evaluate(([px, py]) => document.elementFromPoint(px, py)?.closest("g")?.getAttribute("data-provincia"), [x, y])).toBe("guanenta");
    await page.mouse.move(x, y);
    const hoja = page.getByRole("dialog", { name: /Guanentá/ });
    await expect(hoja).toBeVisible();
    const arriba = (await hoja.boundingBox())!.y;
    expect(y, "el puntero queda dentro de la hoja").toBeGreaterThan(arriba);
    await page.keyboard.press("Escape");
    await expect(hoja).toBeHidden();
    // Durante 1,2 s, la hoja no vuelve a abrirse.
    const muestras: number[] = [];
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(100);
      muestras.push(await page.getByRole("dialog").count());
    }
    await page.screenshot({ path: "docs/qa/capturas/2026-11-19-qa-031-hoja-escape-360.png" });
    expect(muestras, "diálogos abiertos cada 100 ms tras Escape").toEqual(Array(12).fill(0));
  });

  test("360 con toque: tocar abre la hoja y no filtra", async ({ browser }) => {
    const { ctx, page } = await nuevaPagina(browser, { ancho: 360, alto: 740, toque: true });
    await page.goto("/");
    await page.locator(MAPA).scrollIntoViewIfNeeded();
    await esperarInteraccion(page);
    const { x, y } = await puntoEnProvincia(page, "guanenta");
    await page.touchscreen.tap(x, y);
    await expect(page.getByRole("dialog", { name: /Guanentá/ })).toBeVisible();
    await expect(page).not.toHaveURL(/provincia=/);
    await ctx.close();
  });

  // Antes de que llegue la interacción (retrasada 1,5 s): el gesto se anota y se repite una sola vez al llegar.
  test("escritorio: clic de ratón antes de que llegue la interacción → filtra una sola vez", async ({ page }) => {
    const estado = await retrasarInteraccion(page, 1500);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    const { x, y } = await puntoEnProvincia(page, "guanenta");
    await page.mouse.click(x, y);
    expect(estado.servida, "el clic debe ocurrir antes de que llegue la interacción").toBe(false);
    await expect(page).toHaveURL(/provincia=guanenta/);
    expect(estado.servida).toBe(true);
    await expect(page.locator('g[data-provincia="guanenta"]')).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/provincia=guanenta/); // no se alterna dos veces
    await expect(page.getByRole("button", { name: "Ver todo Santander" })).toBeVisible();
  });

  for (const tecla of ["Enter", "Space"] as const)
    test(`escritorio: ${tecla} sobre una provincia antes de que llegue la interacción → filtra una sola vez`, async ({ page }) => {
      const estado = await retrasarInteraccion(page, 1500);
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto("/", { waitUntil: "networkidle" });
      await page.locator('g[data-provincia="soto"]').focus();
      const scrollAntes = await page.evaluate(() => scrollY);
      await page.keyboard.press(tecla);
      expect(estado.servida).toBe(false);
      // Espacio no debe desplazar la página aunque la interacción aún no esté.
      expect(await page.evaluate(() => scrollY)).toBe(scrollAntes);
      await expect(page).toHaveURL(/provincia=soto/);
      await expect(page.locator('g[data-provincia="soto"]')).toHaveAttribute("aria-pressed", "true");
      await page.waitForTimeout(800);
      await expect(page).toHaveURL(/provincia=soto/);
    });

  test("360 con toque antes de que llegue la interacción → abre la hoja, no filtra", async ({ browser }) => {
    const { ctx, page } = await nuevaPagina(browser, { ancho: 360, alto: 740, toque: true });
    const estado = await retrasarInteraccion(page, 1500);
    await page.goto("/", { waitUntil: "networkidle" });
    const { x, y } = await puntoEnProvincia(page, "guanenta");
    await page.touchscreen.tap(x, y);
    expect(estado.servida).toBe(false);
    await expect(page.getByRole("dialog", { name: /Guanentá/ })).toBeVisible({ timeout: 5000 });
    await expect(page).not.toHaveURL(/provincia=/);
    await ctx.close();
  });

  test("360 con ratón antes de que llegue la interacción → filtra", async ({ page }) => {
    const estado = await retrasarInteraccion(page, 1500);
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/", { waitUntil: "networkidle" });
    const { x, y } = await puntoEnProvincia(page, "soto");
    await page.mouse.click(x, y);
    expect(estado.servida).toBe(false);
    await expect(page).toHaveURL(/provincia=soto/);
  });

  for (const ancho of [360, 1440])
    test(`a ${ancho} px: los chips reencuadran el mapa y «Ver todo Santander» vuelve al departamento completo`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: ancho === 360 ? 740 : 900 });
      await page.goto("/", { waitUntil: "networkidle" });
      const completo = await page.locator(`#mapa ${SVG}`).getAttribute("viewBox");
      // El chip «Guanentá» del catálogo (en la tira del inicio a 360, en el panel de filtros en escritorio).
      await page.locator("#catalogo").getByRole("button", { name: /^Guanentá/ }).locator("visible=true").first().click();
      await expect(page).toHaveURL(/provincia=guanenta/);
      await esperarInteraccion(page);
      await expect.poll(() => page.locator(`#mapa ${SVG}`).getAttribute("viewBox"), { timeout: 5000 }).not.toBe(completo);
      await expect(page.locator('g[data-provincia="guanenta"]')).toHaveClass(/prov--elegida/);
      await page.locator(MAPA).scrollIntoViewIfNeeded();
      await page.getByRole("button", { name: "Ver todo Santander" }).click();
      await expect(page).not.toHaveURL(/provincia=/);
      await expect.poll(() => page.locator(`#mapa ${SVG}`).getAttribute("viewBox"), { timeout: 5000 }).toBe(completo);
      await expect(page.getByRole("button", { name: "Ver todo Santander" })).toHaveCount(0);
    });

  test("movimiento reducido: el encuadre cambia de golpe, sin cuadros intermedios", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.locator(MAPA).scrollIntoViewIfNeeded();
    await page.mouse.move(5, 5);
    await esperarInteraccion(page);
    await page.evaluate((sel) => {
      const svg = document.querySelector(sel)!;
      const w = window as unknown as { __vb: string[] };
      w.__vb = [];
      new MutationObserver(() => w.__vb.push(svg.getAttribute("viewBox")!)).observe(svg, { attributes: true, attributeFilter: ["viewBox"] });
    }, `#mapa ${SVG}`);
    await page.locator('g[data-provincia="soto"]').focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/provincia=soto/);
    await page.waitForTimeout(900);
    const cambios = await page.evaluate(() => (window as unknown as { __vb: string[] }).__vb);
    expect(cambios, "un solo cambio de encuadre").toHaveLength(1);
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
  });

  for (const ancho of [360, 1440])
    test(`a ${ancho} px /?provincia=soto al cargar: la interacción llega sola y encuadra Soto Norte`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: ancho === 360 ? 740 : 900 });
      await page.goto("/?provincia=soto", { waitUntil: "networkidle" });
      await esperarInteraccion(page);
      await expect(page.locator('g[data-provincia="soto"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator('g[data-provincia="guanenta"]')).toHaveAttribute("aria-pressed", "false");
      const vb = (await page.locator(`#mapa ${SVG}`).getAttribute("viewBox"))!.split(" ").map(Number);
      const html = await (await page.request.get("/")).text();
      const completo = /viewBox="([\d. -]+)"[^>]*aria-label="Mapa de Santander/.exec(html)![1].split(" ").map(Number);
      expect(vb[2], "encuadre más estrecho que el departamento").toBeLessThan(completo[2]);
      await expect(page.locator("#resultados-catalogo")).toHaveText("1 café en Soto Norte");
    });
});

// =====================================================================================================================
// 3. Estabilidad: CLS al pasar de la capa fija a la medida, caja igual con y sin JS, área táctil y foco
// =====================================================================================================================
test.describe("estabilidad del mapa", () => {
  for (const ancho of [360, 1440])
    test(`a ${ancho} px: cambio de capa fija → medida sin desplazamiento de diseño y la caja del mapa igual sin JS`, async ({ browser }) => {
      const alto = ancho === 360 ? 740 : 900;
      const sin = await nuevaPagina(browser, { js: false, ancho, alto });
      await sin.page.goto("/");
      await sin.page.locator(MAPA).scrollIntoViewIfNeeded();
      const cajaSin = await medirCapa(sin.page);
      const seccionSin = await sin.page.locator("#mapa").evaluate((e) => e.getBoundingClientRect().height);
      await sin.ctx.close();

      const con = await nuevaPagina(browser, { ancho, alto });
      await con.page.addInitScript(() => {
        const w = window as unknown as { __cls: number; __f: string[] };
        w.__cls = 0;
        w.__f = [];
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean; sources?: { node?: Node }[] }[]) {
            w.__cls += e.value;
            w.__f.push(`${e.value.toFixed(4)} ${(e.sources ?? []).map((s) => (s.node as Element | undefined)?.className ?? "?").join(",")}`);
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      await con.page.goto("/", { waitUntil: "networkidle" });
      await con.page.evaluate(() => document.fonts.ready);
      await con.page.locator(MAPA).scrollIntoViewIfNeeded();
      const fija = await medirCapa(con.page);
      const antes = await con.page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      await con.page.mouse.move(ancho / 2, alto / 2);
      await esperarInteraccion(con.page);
      await con.page.waitForTimeout(500);
      const medida = await medirCapa(con.page);
      const r = await con.page.evaluate(() => ({ cls: (window as unknown as { __cls: number }).__cls, f: (window as unknown as { __f: string[] }).__f }));
      const seccionCon = await con.page.locator("#mapa").evaluate((e) => e.getBoundingClientRect().height);
      await con.ctx.close();

      test.info().annotations.push({ type: "cls", description: JSON.stringify({ antes, despues: r.cls, f: r.f }) });
      expect(r.cls - antes, r.f.join("\n")).toBeLessThan(0.001);
      expect(Math.abs(cajaSin.caja.h - medida.caja.h)).toBeLessThanOrEqual(1);
      expect(Math.abs(cajaSin.caja.w - medida.caja.w)).toBeLessThanOrEqual(1);
      expect(Math.abs(seccionSin - seccionCon)).toBeLessThanOrEqual(1);
      expect(diferencias(fija.piezas, medida.piezas), "capa fija (HTML) frente a capa medida (interacción)").toEqual([]);
    });

  for (const [ancho, js] of [[360, false], [360, true], [1440, false], [1440, true]] as const)
    test(`a ${ancho} px ${js ? "con" : "sin"} la interacción: área táctil de los pines ≥ 44 px y sin solape`, async ({ browser }) => {
      const { ctx, page } = await nuevaPagina(browser, { js, ancho, alto: 800 });
      await page.goto("/", { waitUntil: js ? "networkidle" : "load" });
      await page.locator(MAPA).scrollIntoViewIfNeeded();
      if (js) {
        await page.mouse.move(5, 5);
        await esperarInteraccion(page);
      }
      const pines = await page.locator("#mapa-provincias a.mapa-pin:visible").evaluateAll((as) =>
        as.map((e) => {
          const r = e.getBoundingClientRect();
          const b = getComputedStyle(e, "::before");
          const t = r.top + parseFloat(b.top);
          const l = r.left + parseFloat(b.left);
          return { nombre: e.getAttribute("aria-label"), L: l, T: t, R: l + parseFloat(b.width), B: t + parseFloat(b.height), w: parseFloat(b.width), h: parseFloat(b.height) };
        }),
      );
      expect(pines).toHaveLength(2);
      for (const p of pines) expect(Math.min(p.w, p.h), p.nombre!).toBeGreaterThanOrEqual(44);
      const [a, b] = pines;
      expect(a.L < b.R && b.L < a.R && a.T < b.B && b.T < a.B, "los dos pines no se solapan").toBe(false);
      await ctx.close();
    });
});

/** Recorre con Tab el mapa desde «Ir a los cafés» y devuelve lo que recibe el foco hasta salir de la sección. */
async function ordenDeFoco(page: Page) {
  await page.locator("#mapa").getByRole("link", { name: "Ir a los cafés" }).focus();
  const orden: string[] = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const a = document.activeElement as HTMLElement;
      return { dentro: Boolean(a.closest("#mapa")), nombre: a.getAttribute("aria-label") ?? a.innerText.trim() };
    });
    if (!info.dentro) break;
    orden.push(info.nombre);
  }
  return orden;
}

test.describe("orden de foco del mapa", () => {
  test("sin JS y con JS (escritorio): provincias con cafés y luego los pines; igual que en main si hay E2E_MAIN_URL", async ({ browser }) => {
    const sin = await nuevaPagina(browser, { js: false });
    await sin.page.goto("/");
    const ordenSin = await ordenDeFoco(sin.page);
    await sin.ctx.close();
    const con = await nuevaPagina(browser);
    await con.page.goto("/", { waitUntil: "networkidle" });
    const ordenCon = await ordenDeFoco(con.page);
    await con.ctx.close();
    test.info().annotations.push({ type: "orden", description: JSON.stringify({ ordenSin, ordenCon }) });
    expect(ordenSin.slice(0, 4)).toEqual([
      "Provincia de Guanentá, 1 café",
      "Provincia de Soto Norte, 1 café",
      expect.stringMatching(/^Ver la ficha de Café/),
      expect.stringMatching(/^Ver la ficha de Café/),
    ]);
    // Con JS, el foco en una provincia abre su tarjeta; las provincias y los pines van en el mismo orden.
    const sinTarjeta = (o: string[]) => o.filter((n) => /^Provincia de|^Ver la ficha/.test(n));
    expect(sinTarjeta(ordenCon)).toEqual(sinTarjeta(ordenSin));
    const main = process.env.E2E_MAIN_URL;
    if (main) {
      const m = await nuevaPagina(browser, { base: main });
      await m.page.goto("/", { waitUntil: "networkidle" });
      await expect(m.page.locator("#mapa .mapa-pin").first()).toBeVisible();
      const ordenMain = await ordenDeFoco(m.page);
      await m.ctx.close();
      test.info().annotations.push({ type: "orden-main", description: JSON.stringify(ordenMain) });
      expect(sinTarjeta(ordenCon)).toEqual(sinTarjeta(ordenMain));
    }
  });
});

// =====================================================================================================================
// 4. Posiciones de rótulos y pines frente a main (a32e00d)
// =====================================================================================================================
// QA-032 (5d2b5a6) cambia a propósito algunos rótulos en celular (contenedor = ventana − 40 px). Medido el 2026-11-19
// con un barrido de 280 a 1.500 px contra main (a32e00d): Vélez se oculta < 291; Vélez −40/−40 de 291 a 302 y −40/0
// de 303 a 354; Guanentá visible (en main oculto) de 304 a 354 y de 368 a 386; Vélez 0/−40 de 355 a 365, 0/+40 de 366
// a 386 y 0/+20 de 387 a 451; Guanentá 0/+40 de 442 a 482. Desde 483 px, igual que main.
type Esperado = { dx: number; dy: number } | "solo-head";
const CAMBIOS_QA_032: Record<number, Record<string, Esperado>> = {
  300: { "rotulo:Vélez": { dx: -40, dy: -40 } },
  320: { "rotulo:Vélez": { dx: -40, dy: 0 }, "rotulo:Guanentá": "solo-head" },
  360: { "rotulo:Vélez": { dx: 0, dy: -40 } },
  390: { "rotulo:Vélez": { dx: 0, dy: 20 } },
  412: { "rotulo:Vélez": { dx: 0, dy: 20 } },
  430: { "rotulo:Vélez": { dx: 0, dy: 20 } },
  442: { "rotulo:Vélez": { dx: 0, dy: 20 }, "rotulo:Guanentá": { dx: 0, dy: 40 } },
  460: { "rotulo:Guanentá": { dx: 0, dy: 40 } },
  482: { "rotulo:Guanentá": { dx: 0, dy: 40 } },
  483: {},
};
const CAPTURAS_QA_032 = [300, 320, 360, 390, 412, 460, 1280];

/** Diferencias con main que no son las esperadas de QA-032 (y las esperadas que no se cumplen). */
function diferenciasQa032(head: Pieza[], main: Pieza[], ancho: number): string[] {
  const esperado = CAMBIOS_QA_032[ancho] ?? {};
  const fuera: string[] = [];
  for (const [clave, e] of Object.entries(esperado)) {
    const h = head.find((p) => p.clave === clave);
    const m = main.find((p) => p.clave === clave);
    if (e === "solo-head") {
      if (!h || m) fuera.push(`${clave}: se esperaba visible solo en HEAD (HEAD ${!!h}, main ${!!m})`);
    } else if (!h || !m || Math.abs(h.x - m.x - e.dx) > 1.5 || Math.abs(h.y - m.y - e.dy) > 1.5)
      fuera.push(`${clave}: se esperaba ${JSON.stringify(e)} frente a main; HEAD ${JSON.stringify(h)}, main ${JSON.stringify(m)}`);
  }
  const quitar = (l: Pieza[]) => l.filter((p) => !(p.clave in esperado));
  return [...fuera, ...diferencias(quitar(head), quitar(main))];
}

test.describe("posiciones frente a main (a32e00d)", () => {
  const main = process.env.E2E_MAIN_URL;
  test.skip(!main, "Define E2E_MAIN_URL con el build de main (a32e00d)");
  for (const ancho of [...new Set([...ANCHOS, ...Object.keys(CAMBIOS_QA_032).map(Number)])].sort((a, b) => a - b))
    test(`a ${ancho} px: rótulos, pines, marcas y escala en el mismo sitio que en main, salvo los cambios de QA-032 (sin JS y con la interacción)`, async ({ browser }) => {
      const alto = 900;
      const m = await nuevaPagina(browser, { base: main!, ancho, alto });
      await m.page.goto("/", { waitUntil: "networkidle" });
      await m.page.locator("#mapa").scrollIntoViewIfNeeded();
      await m.page.evaluate(() => window.scrollBy(0, 200));
      await expect(m.page.locator("#mapa .mapa-pin").first()).toBeVisible();
      await m.page.waitForTimeout(400);
      await m.page.locator(MAPA).scrollIntoViewIfNeeded();
      const deMain = await medirCapa(m.page);
      if (CAPTURAS_QA_032.includes(ancho)) await m.page.locator(MAPA).screenshot({ path: `docs/qa/capturas/2026-11-19-qa-032-main-${ancho}.png` });
      await m.ctx.close();

      const s = await nuevaPagina(browser, { js: false, ancho, alto });
      await s.page.goto("/");
      await s.page.locator(MAPA).scrollIntoViewIfNeeded();
      const sinJs = await medirCapa(s.page);
      if (CAPTURAS_QA_032.includes(ancho)) await s.page.locator(MAPA).screenshot({ path: `docs/qa/capturas/2026-11-19-qa-032-head-sin-js-${ancho}.png` });
      await s.ctx.close();

      const c = await nuevaPagina(browser, { ancho, alto });
      await c.page.goto("/", { waitUntil: "networkidle" });
      await c.page.locator(MAPA).scrollIntoViewIfNeeded();
      await c.page.mouse.move(2, 2);
      await esperarInteraccion(c.page);
      await c.page.waitForTimeout(400);
      const conJs = await medirCapa(c.page);
      if (CAPTURAS_QA_032.includes(ancho)) await c.page.locator(MAPA).screenshot({ path: `docs/qa/capturas/2026-11-19-qa-032-head-${ancho}.png` });
      await c.ctx.close();

      test.info().annotations.push({ type: "main", description: JSON.stringify(deMain) }, { type: "sin-js", description: JSON.stringify(sinJs) });
      expect(Math.abs(deMain.caja.w - sinJs.caja.w)).toBeLessThanOrEqual(1);
      expect(Math.abs(deMain.caja.h - sinJs.caja.h)).toBeLessThanOrEqual(1);
      expect(diferenciasQa032(sinJs.piezas, deMain.piezas, ancho), "HTML sin JS frente a main").toEqual([]);
      expect(diferenciasQa032(conJs.piezas, deMain.piezas, ancho), "con la interacción frente a main").toEqual([]);
      expect(diferencias(sinJs.piezas, conJs.piezas), "HTML sin JS frente a la interacción").toEqual([]);
    });
});

// QA-032 (cerrado en la ronda de verificación, 5d2b5a6): a 320 y 360 px los rótulos de Comunera y Vélez se pisaban.
// Se mide cada línea de texto visible (nombre, «Próximamente», nombre de pin); además, ningún rótulo de provincia queda
// cortado por el borde de la caja del mapa (`overflow: hidden`). El nombre del pin al borde es la observación O-1.
const ANCHOS_QA_032 = [...new Set([...ANCHOS, 300, 412, 430, ...Array.from({ length: 41 }, (_, i) => 440 + i)])].sort((a, b) => a - b);
test.describe("QA-032: rótulos del mapa sin solaparse", () => {
  for (const ancho of ANCHOS_QA_032)
    test(`a ${ancho} px, sin JS y con la interacción: ninguna línea de texto del mapa pisa a otra ni queda cortada`, async ({ browser }) => {
      const solapes: string[] = [];
      for (const js of [false, true]) {
        const { ctx, page } = await nuevaPagina(browser, { js, ancho, alto: 900 });
        await page.goto("/", { waitUntil: js ? "networkidle" : "load" });
        await page.locator(MAPA).scrollIntoViewIfNeeded();
        if (js) {
          await page.mouse.move(2, 2);
          await esperarInteraccion(page);
          await page.waitForTimeout(400);
        }
        await page.evaluate(() => document.fonts.ready);
        const cajas = await page.locator(MAPA).evaluate((m) => {
          const vis = (e: Element) => getComputedStyle(e).visibility === "visible" && getComputedStyle(e).opacity !== "0";
          const caja = (n: Node) => {
            const r = document.createRange();
            r.selectNodeContents(n);
            const b = r.getBoundingClientRect();
            return { l: b.left, r: b.right, t: b.top, b: b.bottom };
          };
          const c = m.getBoundingClientRect();
          const out: { n: string; l: number; r: number; t: number; b: number }[] = [];
          for (const e of m.querySelectorAll(".mapa-rotulo"))
            if (vis(e)) {
              out.push({ n: e.firstChild!.textContent!, ...caja(e.firstChild!) });
              const sm = e.querySelector("small");
              if (sm) out.push({ n: `${e.firstChild!.textContent}/Próximamente`, ...caja(sm) });
            }
          for (const e of m.querySelectorAll(".mapa-pin__nombre"))
            if (vis(e.parentElement!) && e.getBoundingClientRect().width > 2) {
              const b = e.getBoundingClientRect();
              out.push({ n: `pin ${e.textContent}`, l: b.left, r: b.right, t: b.top, b: b.bottom });
            }
          const cortados = out
            .filter((o) => !o.n.startsWith("pin ") && (o.l < c.left - 0.5 || o.r > c.right + 0.5 || o.t < c.top - 0.5 || o.b > c.bottom + 0.5))
            .map((o) => `${o.n} [${(o.l - c.left).toFixed(0)}..${(o.r - c.left).toFixed(0)} de ${c.width.toFixed(0)}]`);
          return { out, cortados };
        });
        for (const k of cajas.cortados) solapes.push(`${js ? "con JS" : "sin JS"}: ${k} cortado por el borde`);
        for (let i = 0; i < cajas.out.length; i++)
          for (let j = i + 1; j < cajas.out.length; j++) {
            const [a, b] = [cajas.out[i], cajas.out[j]];
            if (a.n.split("/")[0] === b.n.split("/")[0]) continue;
            const ox = Math.min(a.r, b.r) - Math.max(a.l, b.l);
            const oy = Math.min(a.b, b.b) - Math.max(a.t, b.t);
            if (ox > 0.5 && oy > 0.5) solapes.push(`${js ? "con JS" : "sin JS"}: ${a.n} × ${b.n} (${ox.toFixed(0)} × ${oy.toFixed(0)} px)`);
          }
        await ctx.close();
      }
      expect(solapes).toEqual([]);
    });
});

// =====================================================================================================================
// 5. Peso: HTML de / (presupuesto de QA) y trozo de la interacción
// =====================================================================================================================
test.describe("peso del inicio con el mapa en el HTML", () => {
  // Presupuesto fijado por QA el 2026-11-19: el HTML de / pasó de ≈ 12,9 a 32,5 KB gzip con el mapa dibujado.
  // 40 KiB deja ≈ 8 KB de margen para el contenido del inicio y detiene un mapa más pesado (p. ej., un GeoJSON sin simplificar).
  test("HTML de / ≤ 40 KiB gzip -9; trozo de la interacción ≤ 16 KiB gzip -9", async ({ page, request }) => {
    const html = await (await request.get("/")).body();
    const htmlGz = gzipSync(html, { level: 9 }).length;
    const trozos: number[] = [];
    page.on("response", async (r) => {
      if (r.request().resourceType() !== "script") return;
      const b = await r.body().catch(() => Buffer.from(""));
      if (b.toString("utf8").includes(MARCA_INTERACCION)) trozos.push(gzipSync(b, { level: 9 }).length);
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.mouse.move(700, 450);
    await esperarInteraccion(page);
    await expect.poll(() => trozos.length).toBe(1);
    test.info().annotations.push({ type: "peso", description: JSON.stringify({ htmlGz, interaccionGz: trozos[0] }) });
    expect(htmlGz, `HTML de / = ${htmlGz} B gzip`).toBeLessThanOrEqual(40 * 1024);
    expect(trozos[0], `interacción = ${trozos[0]} B gzip`).toBeLessThanOrEqual(16 * 1024);
  });
});

// =====================================================================================================================
// 6. basePath de GitHub Pages
// =====================================================================================================================
test.describe("mapa bajo basePath", () => {
  const base = process.env.E2E_BASEPATH_URL;
  test.skip(!base, "Define E2E_BASEPATH_URL con un build GITHUB_PAGES=true servido bajo /coffee-santander-shop/");
  const REPO = "/coffee-santander-shop";

  test("sin JS: pines con el prefijo; con JS: la interacción llega del prefijo, filtra y nada responde 4xx", async ({ browser }) => {
    const s = await nuevaPagina(browser, { js: false, base });
    await s.page.goto(`${REPO}/`);
    const hrefs = await s.page.locator("#mapa-provincias a.mapa-pin:visible").evaluateAll((as) => as.map((a) => a.getAttribute("href")).sort());
    expect(hrefs).toEqual([`${REPO}/cafes/cafe-arreboles/`, `${REPO}/cafes/cafe-casa-martinez/`]);
    for (const h of hrefs) expect((await s.page.request.get(`${base}${h}`)).status()).toBe(200);
    await s.ctx.close();

    const c = await nuevaPagina(browser, { base });
    const fallos: string[] = [];
    c.page.on("response", (r) => r.status() >= 400 && fallos.push(`${r.status()} ${r.url()}`));
    const estado = await retrasarInteraccion(c.page, 800);
    await c.page.goto(`${REPO}/`, { waitUntil: "networkidle" });
    const { x, y } = await puntoEnProvincia(c.page, "guanenta");
    await c.page.mouse.click(x, y);
    await expect(c.page).toHaveURL(new RegExp(`${REPO}/\\?provincia=guanenta$`));
    expect(estado.url).toContain(`${REPO}/_next/static/chunks/`);
    await esperarInteraccion(c.page);
    await c.page.getByRole("button", { name: "Ver todo Santander" }).click();
    await expect(c.page).toHaveURL(new RegExp(`${REPO}/$`));
    await c.page.goto(`${REPO}/?provincia=soto`, { waitUntil: "networkidle" });
    await esperarInteraccion(c.page);
    await expect(c.page.locator('g[data-provincia="soto"]')).toHaveAttribute("aria-pressed", "true");
    expect(fallos).toEqual([]);
    await c.ctx.close();
  });
});
