import { expect, test, type Page } from "@playwright/test";
import { puntoEnProvincia } from "./ayudas";

// Ronda QA 2026-11-19: verificación de QA-031 (4429277) y QA-032 (5d2b5a6).
// Variables opcionales:
// - E2E_ESCAPE_URL: otra URL base (p. ej. main) para correr las pruebas de QA-031 contra ella.

const URL_INICIO = process.env.E2E_ESCAPE_URL ?? "/";

async function prepararMapa(page: Page, ancho: number, alto: number) {
  await page.setViewportSize({ width: ancho, height: alto });
  await page.goto(URL_INICIO, { waitUntil: "networkidle" });
  await page.locator("#mapa").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 200));
  await page.mouse.move(2, 2);
  await expect(page.locator("#mapa-provincias .mapa-capa")).toHaveCount(0, { timeout: 10_000 });
  await expect(page.locator("#mapa .mapa-pin").first()).toBeVisible();
}

/** Cuenta los diálogos abiertos cada 100 ms durante 1,2 s. */
async function muestrear(page: Page): Promise<number[]> {
  const m: number[] = [];
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(100);
    m.push(await page.getByRole("dialog").count());
  }
  return m;
}

const provinciaBajo = (page: Page, x: number, y: number) =>
  page.evaluate(([px, py]) => document.elementFromPoint(px, py)?.closest("g[data-provincia]")?.getAttribute("data-provincia") ?? "fuera", [x, y]);

/** A 360 px: deja Guanentá bajo el puntero en un punto que la hoja tapa al abrirse (escenario de QA-031). */
async function hojaBajoElPuntero(page: Page) {
  const p = await puntoEnProvincia(page, "guanenta");
  await page.evaluate(() => window.scrollBy(0, -80));
  const punto = { x: p.x, y: p.y + 80 };
  expect(await provinciaBajo(page, punto.x, punto.y)).toBe("guanenta");
  await page.mouse.move(punto.x, punto.y);
  const hoja = page.getByRole("dialog", { name: /Guanentá/ });
  await expect(hoja).toBeVisible();
  expect(punto.y, "el puntero queda dentro de la hoja").toBeGreaterThan((await hoja.boundingBox())!.y);
  return { hoja, punto };
}

test.describe("QA-031 verificación (4429277)", () => {
  // Reapertura de QA-031: sin Escape, con la hoja bajo el puntero quieto, la hoja se quita y se vuelve a poner cada
  // ≈ 200 ms (main: 1 inserción en 2 s). Se cuentan las inserciones del diálogo en el DOM.
  test("a 360 px con ratón: con la hoja bajo el puntero quieto, la hoja no se quita y se vuelve a poner sola", async ({ page }) => {
    await prepararMapa(page, 360, 740);
    await page.evaluate(() => {
      const w = window as unknown as { __ins: number };
      w.__ins = 0;
      new MutationObserver((ms) => {
        for (const m of ms) for (const n of m.addedNodes) if (n instanceof Element && (n.matches("[role=dialog]") || n.querySelector("[role=dialog]"))) w.__ins++;
      }).observe(document.body, { childList: true, subtree: true });
    });
    await hojaBajoElPuntero(page);
    await page.waitForTimeout(2000);
    const inserciones = await page.evaluate(() => (window as unknown as { __ins: number }).__ins);
    await page.screenshot({ path: "docs/qa/capturas/2026-11-19-qa-031-reposo-360.png" });
    expect(inserciones, "inserciones de la hoja en 2 s con el puntero quieto").toBe(1);
  });

  test("a 1.280 px: Escape con el puntero sobre la tarjeta la cierra y no se reabre; al salir y volver a entrar, se abre", async ({ page }) => {
    await prepararMapa(page, 1280, 900);
    const p = await puntoEnProvincia(page, "guanenta");
    await page.mouse.move(p.x, p.y);
    const tarjeta = page.getByRole("dialog", { name: /Guanentá/ });
    await expect(tarjeta).toBeVisible();
    const c = (await tarjeta.boundingBox())!;
    // Del punto de la provincia al centro de la tarjeta, en pasos (el puntero cruza el hueco sin que se cierre).
    await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2, { steps: 8 });
    await page.waitForTimeout(300);
    await expect(tarjeta).toBeVisible();
    const debajo = { x: c.x + c.width / 2, y: c.y + c.height / 2 };
    await page.keyboard.press("Escape");
    await expect(tarjeta).toBeHidden();
    test.info().annotations.push({ type: "bajo el puntero tras Escape", description: await provinciaBajo(page, debajo.x, debajo.y) });
    expect(await muestrear(page), "diálogos cada 100 ms tras Escape").toEqual(Array(12).fill(0));
    // Salir del mapa y volver a entrar a Guanentá: se abre de nuevo.
    await page.mouse.move(2, 2, { steps: 4 });
    await page.mouse.move(p.x, p.y, { steps: 4 });
    await expect(tarjeta).toBeVisible();
  });

  test("a 360 px con ratón: «Cerrar» con clic cierra la hoja y no se reabre; al salir y volver a entrar, se abre", async ({ page }) => {
    await prepararMapa(page, 360, 740);
    const { hoja, punto } = await hojaBajoElPuntero(page);
    const b = (await hoja.getByRole("button", { name: "Cerrar" }).boundingBox())!;
    const enBoton = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    await page.mouse.move(enBoton.x, enBoton.y, { steps: 5 });
    await page.waitForTimeout(300);
    await expect(hoja).toBeVisible();
    await page.mouse.down();
    await page.mouse.up();
    await expect(hoja).toBeHidden();
    test.info().annotations.push({ type: "bajo el puntero tras Cerrar", description: await provinciaBajo(page, enBoton.x, enBoton.y) });
    expect(await muestrear(page), "diálogos cada 100 ms tras «Cerrar»").toEqual(Array(12).fill(0));
    await page.mouse.move(2, 2, { steps: 4 });
    await page.mouse.move(punto.x, punto.y, { steps: 4 });
    await expect(hoja).toBeVisible();
  });

  test("a 360 px con ratón: tras Escape, salir de la provincia y volver a entrar abre la hoja otra vez (y Escape vuelve a cerrarla sin bucle)", async ({ page }) => {
    await prepararMapa(page, 360, 740);
    const { hoja, punto } = await hojaBajoElPuntero(page);
    await page.keyboard.press("Escape");
    await expect(hoja).toBeHidden();
    expect(await muestrear(page)).toEqual(Array(12).fill(0));
    // Salir a otra zona fuera de Guanentá y volver.
    await page.mouse.move(2, 2, { steps: 4 });
    await page.waitForTimeout(250);
    await page.mouse.move(punto.x, punto.y, { steps: 4 });
    await expect(hoja).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(hoja).toBeHidden();
    expect(await muestrear(page), "segunda vez").toEqual(Array(12).fill(0));
  });

  test("a 360 px con ratón: tras Escape, mover el puntero dentro de la misma provincia no reabre; salir y volver sí", async ({ page }) => {
    await prepararMapa(page, 360, 740);
    const { hoja, punto } = await hojaBajoElPuntero(page);
    await page.keyboard.press("Escape");
    await expect(hoja).toBeHidden();
    await page.mouse.move(punto.x + 1, punto.y + 1);
    await page.waitForTimeout(400);
    // Seguir dentro de Guanentá no es un `pointerenter` nuevo: no reabre (igual que main).
    if ((await provinciaBajo(page, punto.x + 1, punto.y + 1)) === "guanenta") await expect(hoja).toBeHidden();
  });

  test("a 360 px: hoja abierta con el teclado y el ratón quieto donde cae la hoja; Escape la cierra sin bucle", async ({ page }) => {
    await prepararMapa(page, 360, 740);
    const p = await puntoEnProvincia(page, "guanenta");
    await page.evaluate(() => window.scrollBy(0, -80));
    const punto = { x: p.x, y: p.y + 80 };
    // El ratón descansa sobre el mapa, fuera de las provincias con cafés no importa: lo que cuenta es que la hoja caiga debajo.
    await page.mouse.move(punto.x, punto.y);
    const hoja = page.getByRole("dialog", { name: /Guanentá/ });
    await expect(hoja).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(hoja).toBeHidden();
    await page.waitForTimeout(400);
    await page.locator('g[data-provincia="guanenta"]').focus();
    await expect(hoja).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(hoja).toBeHidden();
    expect(await muestrear(page), "diálogos tras Escape con el foco").toEqual(Array(12).fill(0));
    await expect(page.locator('g[data-provincia="guanenta"]')).toBeFocused();
  });
});

// QA-033: con la isla nativa (7693b25), llevar el ratón de una provincia a su tarjeta en un movimiento rápido (el
// puntero pasa del trazo de la provincia a la tarjeta sin tocar el fondo del mapa) cierra la tarjeta a los 180 ms. El
// `pointerenter` de React en la tarjeta llega antes que el `pointerleave` nativo del grupo, así que el temporizador de
// cierre ya no se cancela. En main (a32e00d) la tarjeta queda abierta.
test.describe("QA-033: la tarjeta de la provincia se alcanza con el ratón", () => {
  for (const [ancho, alto] of [[360, 740], [768, 1024], [1280, 900], [1440, 900]] as const)
    for (const pasos of [1, 3])
      test(`a ${ancho} px, de Guanentá a «Ver cafés» en ${pasos} paso(s): la tarjeta sigue abierta y el botón filtra`, async ({ page }) => {
        await prepararMapa(page, ancho, alto);
        const p = await puntoEnProvincia(page, "guanenta");
        let y = p.y;
        if (ancho < 768 && y > 300) {
          // A 360 la hoja va fija abajo: el puntero arranca por encima de ella (sin el caso de QA-031).
          await page.evaluate((d) => window.scrollBy(0, d), y - 250);
          y = 250;
        }
        await page.mouse.move(p.x, y);
        const tarjeta = page.getByRole("dialog", { name: /Guanentá/ });
        await expect(tarjeta).toBeVisible();
        const b = (await tarjeta.getByRole("button", { name: /Ver cafés/ }).boundingBox())!;
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: pasos });
        await page.waitForTimeout(400);
        await expect(tarjeta, "la tarjeta sigue abierta con el puntero encima").toBeVisible();
        await page.mouse.down();
        await page.mouse.up();
        await expect(page).toHaveURL(/[?&]provincia=guanenta/);
      });
});

// QA-034: con 5d2b5a6, a 366 px de ventana (contenedor de 326 px) el HTML sin JS pone «VÉLEZ» 80 px más arriba que la
// capa que calcula la interacción: al llegar la interacción el rótulo salta. En 7693b25 coincidían. Se barre de 290 a
// 500 px con las dos capas redimensionando la ventana y cada diferencia se confirma con cargas nuevas.
const MAPA_CAJA = "#mapa [data-mapa-interactivo][style*='aspect-ratio']";
async function rotulos(page: Page): Promise<Record<string, string>> {
  return page.locator(MAPA_CAJA).evaluate((m) => {
    const c = m.getBoundingClientRect();
    const o: Record<string, string> = {};
    for (const e of m.querySelectorAll(".mapa-rotulo")) {
      const s = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      o[e.firstChild!.textContent!] = s.visibility === "visible" && s.opacity !== "0" ? `${Math.round(r.left - c.left)},${Math.round(r.top - c.top)}` : "oculto";
    }
    return o;
  });
}
const distintos = (a: Record<string, string>, b: Record<string, string>) =>
  Object.keys({ ...a, ...b }).filter((k) => {
    if (a[k] === b[k]) return false;
    if (a[k] === "oculto" || b[k] === "oculto" || !a[k] || !b[k]) return true;
    const [x1, y1] = a[k].split(",").map(Number);
    const [x2, y2] = b[k].split(",").map(Number);
    return Math.abs(x1 - x2) > 1.5 || Math.abs(y1 - y2) > 1.5;
  });

test.describe("QA-034: la capa del HTML coincide con la de la interacción en todo ancho de celular", () => {
  test.setTimeout(240_000);
  test("de 290 a 500 px, cada rótulo está en el mismo sitio sin JS y con la interacción", async ({ browser }) => {
    const abrir = async (js: boolean, ancho: number) => {
      const ctx = await browser.newContext({ javaScriptEnabled: js, viewport: { width: ancho, height: 900 }, baseURL: test.info().project.use.baseURL });
      const page = await ctx.newPage();
      await page.goto("/", { waitUntil: js ? "networkidle" : "load" });
      await page.locator("#mapa").scrollIntoViewIfNeeded();
      await page.locator(MAPA_CAJA).scrollIntoViewIfNeeded();
      if (js) {
        await page.mouse.move(2, 2);
        await expect(page.locator("#mapa-provincias .mapa-capa")).toHaveCount(0, { timeout: 10_000 });
        await page.waitForTimeout(300);
      }
      await page.evaluate(() => document.fonts.ready);
      return { ctx, page };
    };
    const sin = await abrir(false, 290);
    const con = await abrir(true, 290);
    const sospechosos: number[] = [];
    for (let w = 290; w <= 500; w++) {
      await sin.page.setViewportSize({ width: w, height: 900 });
      await con.page.setViewportSize({ width: w, height: 900 });
      await con.page.waitForTimeout(150);
      if (distintos(await rotulos(sin.page), await rotulos(con.page)).length) sospechosos.push(w);
    }
    await sin.ctx.close();
    await con.ctx.close();
    const confirmados: string[] = [];
    for (const w of sospechosos) {
      const a = await abrir(false, w);
      const b = await abrir(true, w);
      const [ra, rb] = [await rotulos(a.page), await rotulos(b.page)];
      for (const k of distintos(ra, rb)) confirmados.push(`${w} px: ${k} sin JS ${ra[k]} / con JS ${rb[k]}`);
      await a.ctx.close();
      await b.ctx.close();
    }
    test.info().annotations.push({ type: "sospechosos", description: sospechosos.join(", ") });
    expect(confirmados).toEqual([]);
  });
});

// QA-036 (ronda 2026-11-19, docs/qa/2026-11-19-verificacion-qa-031-032.md): al elegir una provincia con la interacción
// montada, los rótulos que se ocultan saltan a translate(0, 0) y se desvanecen ahí durante 0,25 s: cinco o seis nombres se
// amontonan en la esquina superior izquierda del mapa. Ya ocurre en main (a32e00d). Un rótulo que se oculta debe
// desvanecerse en su sitio (o desaparecer de golpe), nunca verse en otro lugar.
test.describe("QA-036: un rótulo que se oculta no se ve en la esquina del mapa", () => {
  for (const [ancho, alto] of [
    [1280, 900],
    [768, 1024],
  ])
    test(`a ${ancho} px: al elegir Guanentá con el chip, ningún rótulo con opacidad > 0 aparece en (0, 0) de la caja`, async ({ page }) => {
      await prepararMapa(page, ancho, alto);
      await page.waitForTimeout(400);
      await page.evaluate((sel) => {
        const w = window as unknown as { __fantasmas: string[] };
        w.__fantasmas = [];
        const m = document.querySelector(sel)!;
        const t0 = performance.now();
        const tick = () => {
          const c = m.getBoundingClientRect();
          for (const e of m.querySelectorAll(".mapa-rotulo")) {
            const op = Number(getComputedStyle(e).opacity);
            const r = e.getBoundingClientRect();
            if (op > 0.02 && Math.abs(r.left - c.left) < 1 && Math.abs(r.top - c.top) < 1)
              w.__fantasmas.push(`${(performance.now() - t0).toFixed(0)} ms ${e.firstChild?.textContent} opacidad ${op.toFixed(2)}`);
          }
          if (performance.now() - t0 < 1500) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, MAPA_CAJA);
      await page.locator("button[aria-pressed]:visible", { hasText: "Guanentá" }).first().click();
      await expect(page).toHaveURL(/provincia=guanenta/);
      await page.waitForTimeout(1600);
      const fantasmas = await page.evaluate(() => (window as unknown as { __fantasmas: string[] }).__fantasmas);
      test.info().annotations.push({ type: "fantasmas", description: fantasmas.slice(0, 12).join(" | ") });
      expect([...new Set(fantasmas.map((f) => f.replace(/^\d+ ms /, "").replace(/ opacidad.*/, "")))]).toEqual([]);
    });
});
