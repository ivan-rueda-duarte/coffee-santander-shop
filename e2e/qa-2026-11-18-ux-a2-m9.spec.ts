import { execFileSync } from "node:child_process";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Locator, type Page } from "@playwright/test";

// Ronda QA 2026-11-18: auditoría UX A2 (ficha a 360 px, 8c7b943) y M9 (errores en tinta con ícono, 0a23225).
// Especificación: docs/diseno/2026-11-18-ux-auditoria-alta.md.
// Servidores opcionales (las pruebas que los usan se omiten sin la variable):
// - E2E_AGOTADO_URL: build de una copia con data/catalogo.csv modificado (arreboles agotado 250|500, casa-martinez 500). Nunca se commitea.
// - E2E_BASE_URL: build del commit anterior a A2 (ba6e063), para comparar el escritorio píxel a píxel.
// - E2E_MAIN_URL: build de main (8162ccf), para comparar las cajas del escritorio.

const FICHAS = ["/cafes/cafe-casa-martinez/", "/cafes/cafe-arreboles/"];
const SERIAS = ["serious", "critical"];

async function axeSerio(page: Page, soloMain = false) {
  // soloMain: con el tema oscuro forzado por la prueba, el encabezado (data-theme="light" propio, con la marca) queda fuera.
  const r = await (soloMain ? new AxeBuilder({ page }).include("main") : new AxeBuilder({ page })).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  return r.violations.filter((v) => SERIAS.includes(v.impact ?? "")).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

async function caja(l: Locator) {
  const b = await l.boundingBox();
  if (!b) throw new Error("sin caja");
  // Coordenadas de documento (no de ventana).
  const sy = await l.page().evaluate(() => window.scrollY);
  return { x: Math.round(b.x), y: Math.round(b.y + sy), w: Math.round(b.width), h: Math.round(b.height) };
}

/** Bloques de la ficha (A cabecera, B foto, D compra, E resto, G medios). */
function bloques(page: Page) {
  const art = page.locator("main article").first();
  return {
    antetitulo: art.locator("p.overline").first(),
    h1: art.getByRole("heading", { level: 1 }),
    foto: art.locator(".grid > div").nth(1),
    compra: art.locator("form").first(),
    boton: art.getByRole("button", { name: /Agregar al pedido|Agotado/ }).first(),
    perfil: art.locator("section").first(),
    mapa: art.locator(".grid > div").nth(3),
  };
}

// ---------- Contraste (WCAG 2.x) calculado en el navegador sobre colores computados ----------
async function contrastes(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const rgb = (c: string) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const lum = (c: { r: number; g: number; b: number }) => {
      const f = (v: number) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const ratio = (a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
      return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
    };
    const fondo = (el: Element | null): { r: number; g: number; b: number } => {
      for (let e = el; e; e = e.parentElement) {
        const c = rgb(getComputedStyle(e).backgroundColor);
        if (c && c.a > 0.99) return c;
      }
      return { r: 255, g: 255, b: 255 };
    };
    return [...document.querySelectorAll(sel)].map((el) => {
      const cs = getComputedStyle(el);
      const svg = el.querySelector("svg");
      const bg = fondo(el.parentElement);
      const bgPropio = fondo(el);
      const texto = rgb(cs.color)!;
      const borde = rgb(cs.borderLeftColor)!;
      const icono = svg ? rgb(getComputedStyle(svg).color) : null;
      const spans = [...el.querySelectorAll("span, li, p")].map((s) => ratio(rgb(getComputedStyle(s).color)!, bgPropio));
      return {
        texto: cs.color,
        textoRatio: ratio(texto, bgPropio),
        textoHijosMin: spans.length ? Math.min(...spans) : null,
        bordeAncho: cs.borderLeftWidth,
        borde: cs.borderLeftColor,
        bordeRatio: ratio(borde, bg),
        icono: svg ? getComputedStyle(svg).color : null,
        iconoRatio: icono ? ratio(icono, bgPropio) : null,
        fondo: `rgb(${bgPropio.r}, ${bgPropio.g}, ${bgPropio.b})`,
      };
    });
  }, selector);
}

/** Contraste entre dos colores CSS (para comparar el contorno de foco con el de error). */
async function ratioEntre(page: Page, a: string, b: string) {
  return page.evaluate(([x, y]) => {
    const rgb = (c: string) => c.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number);
    const lum = (c: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const [p, q] = [lum(rgb(x)), lum(rgb(y))].sort((m, n) => n - m);
    return Math.round(((p + 0.05) / (q + 0.05)) * 100) / 100;
  }, [a, b]);
}

async function tema(page: Page, t: "light" | "dark") {
  await page.evaluate((v) => {
    document.documentElement.setAttribute("data-theme", v);
    document.querySelector("main")?.setAttribute("data-theme", v);
  }, t);
  // Los botones tienen transición de color: axe mediría un color intermedio justo después del cambio de tema.
  await page.waitForTimeout(400);
}

async function irAlEnvio(page: Page, lineas: object[] = [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }], base = "") {
  await page.goto(`${base}/`);
  await page.waitForLoadState("networkidle");
  await page.evaluate((l) => localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: l })), lineas);
  await page.goto(`${base}/pedido/`);
  await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
}

async function llenarEnvio(page: Page) {
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByLabel("Departamento").selectOption("Santander");
  await page.getByLabel("Municipio").selectOption("Bucaramanga");
  await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
}

// =====================================================================================
test.describe("A2 · ficha a 360 px", () => {
  for (const ruta of FICHAS) {
    test(`${ruta}: orden visual y del DOM A, B, D, E, G a 360 × 740`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(ruta);
      const b = bloques(page);
      const y = {
        antetitulo: (await caja(b.antetitulo)).y,
        h1: (await caja(b.h1)).y,
        foto: (await caja(b.foto)).y,
        compra: (await caja(b.compra)).y,
        perfil: (await caja(b.perfil)).y,
        mapa: (await caja(b.mapa)).y,
      };
      test.info().annotations.push({ type: "y-360", description: JSON.stringify(y) });
      expect(y.antetitulo).toBeLessThan(y.h1);
      expect(y.h1).toBeLessThan(y.foto);
      expect(y.foto).toBeLessThan(y.compra);
      expect(y.compra).toBeLessThan(y.perfil);
      expect(y.perfil).toBeLessThan(y.mapa);
      // El DOM sigue el mismo orden (WCAG 1.3.2): h1 antes que la foto, la foto antes que el formulario, el formulario antes que el mapa.
      const ordenDom = await page.evaluate(() => {
        const a = document.querySelector("main article")!;
        const h1 = a.querySelector("h1")!;
        const fig = a.querySelector(".grid > div:nth-child(2)")!;
        const form = a.querySelector("form")!;
        const mapa = a.querySelector(".grid > div:nth-child(4)")!;
        const antes = (x: Element, z: Element) => Boolean(x.compareDocumentPosition(z) & Node.DOCUMENT_POSITION_FOLLOWING);
        return [antes(h1, fig), antes(fig, form), antes(form, mapa)];
      });
      expect(ordenDom).toEqual([true, true, true]);
      // Foto 4:3 con tope de 55vh.
      const f = await caja(b.foto);
      expect(Math.abs(f.w / f.h - 4 / 3)).toBeLessThan(0.02);
      expect(f.h).toBeLessThanOrEqual(Math.ceil(740 * 0.55));
    });

    test(`${ruta}: el Tab dentro de la ficha sigue el orden visual a 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      // Se parte del último enlace de las migas.
      await page.locator('main nav[aria-label="Ruta de navegación"] a').last().focus();
      const recorrido: { y: number; x: number; que: string }[] = [];
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press("Tab");
        const r = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          const art = document.querySelector("main article .grid");
          if (!el || !art || !art.contains(el)) return null;
          // Los radios sr-only se miden por su etiqueta visible.
          const visible = (el.closest("label") ?? el) as HTMLElement;
          const b = visible.getBoundingClientRect();
          return { y: Math.round(b.top + window.scrollY), x: Math.round(b.left), que: `${el.tagName.toLowerCase()} ${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 40)}` };
        });
        if (!r) {
          if (recorrido.length) break;
          continue;
        }
        recorrido.push(r);
      }
      test.info().annotations.push({ type: "tab-360", description: recorrido.map((r) => `${r.y}:${r.que}`).join(" → ") });
      expect(recorrido.length).toBeGreaterThan(4);
      // Orden visual: cada elemento enfocado está en la misma fila o más abajo que el anterior (tolerancia de 4 px para una misma fila).
      for (let i = 1; i < recorrido.length; i++) {
        const [a, z] = [recorrido[i - 1], recorrido[i]];
        const mismaFila = Math.abs(z.y - a.y) <= 4;
        expect(mismaFila ? z.x >= a.x - 4 : z.y > a.y, `${a.que} (${a.y}) → ${z.que} (${z.y})`).toBe(true);
      }
    });
  }

  test("360 × 780: H1 sin desplazar y «Agregar al pedido» a menos de una pantalla de desplazamiento", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    const medidas: Record<string, unknown> = {};
    for (const ruta of FICHAS) {
      await page.goto(ruta);
      const b = bloques(page);
      const h1 = await caja(b.h1);
      const boton = await caja(b.boton);
      medidas[ruta] = { h1: [h1.y, h1.y + h1.h], boton: [boton.y, boton.y + boton.h] };
      expect(h1.y + h1.h).toBeLessThanOrEqual(780);
      expect(boton.y + boton.h).toBeLessThanOrEqual(2 * 780);
    }
    test.info().annotations.push({ type: "medidas-780", description: JSON.stringify(medidas) });
  });

  test("límite lg: 1.023 px una columna; 1.024 px dos columnas (foto a la izquierda, H1 a la derecha en la primera fila)", async ({ page }) => {
    for (const ruta of FICHAS) {
      await page.setViewportSize({ width: 1023, height: 900 });
      await page.goto(ruta);
      let b = bloques(page);
      let [h1, foto] = [await caja(b.h1), await caja(b.foto)];
      expect(foto.y).toBeGreaterThan(h1.y);
      expect(Math.abs(foto.x - h1.x)).toBeLessThanOrEqual(2);

      await page.setViewportSize({ width: 1024, height: 900 });
      await page.goto(ruta);
      b = bloques(page);
      [h1, foto] = [await caja(b.h1), await caja(b.foto)];
      const [compra, mapa] = [await caja(b.compra), await caja(b.mapa)];
      expect(foto.x).toBeLessThan(h1.x);
      expect(foto.y).toBeLessThanOrEqual(h1.y);
      expect(Math.abs(foto.w / foto.h - 3 / 4)).toBeLessThan(0.02);
      expect(compra.x).toBe(h1.x);
      expect(mapa.x).toBe(foto.x);
      expect(mapa.y).toBeGreaterThanOrEqual(foto.y + foto.h + 30);
      // Sin desbordamiento horizontal en el límite.
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1024);
    }
  });

  async function cajasEscritorio(browser: Browser, base: string, ruta: string) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${base}${ruta}`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    const art = page.locator("main article").first();
    const sel = {
      antetitulo: art.locator("p.overline").first(),
      h1: art.getByRole("heading", { level: 1 }),
      foto: art.locator("figure, svg[role='img']").first(),
      compra: art.locator("form").first(),
      perfil: art.locator("section").first(),
      mapa: art.locator(".max-w-xs").first(),
      relacionados: page.locator("main").getByRole("heading", { name: /Más cafés/ }).first(),
    };
    const out: Record<string, { x: number; y: number; w: number; h: number } | null> = {};
    for (const [k, l] of Object.entries(sel)) out[k] = (await l.count()) ? await caja(l) : null;
    const alto = await page.evaluate(() => document.documentElement.scrollHeight);
    const png = await page.screenshot({ fullPage: true, animations: "disabled" });
    await ctx.close();
    return { cajas: out, alto, png };
  }

  for (const [variable, nombre] of [["E2E_BASE_URL", "ba6e063 (antes de A2)"], ["E2E_MAIN_URL", "main 8162ccf"]] as const) {
    test(`1.280 px: escritorio igual que ${nombre}`, async ({ browser }) => {
      const base = process.env[variable];
      test.skip(!base, `sin ${variable}`);
      for (const ruta of FICHAS) {
        const ahora = await cajasEscritorio(browser, "", ruta);
        const antes = await cajasEscritorio(browser, base!, ruta);
        test.info().annotations.push({ type: `cajas-1280 ${ruta}`, description: JSON.stringify({ ahora: ahora.cajas, antes: antes.cajas }) });
        for (const k of Object.keys(antes.cajas)) {
          const [a, z] = [antes.cajas[k], ahora.cajas[k]];
          if (!a || !z) {
            expect(z, k).toEqual(a);
            continue;
          }
          for (const d of ["x", "y", "w", "h"] as const) expect(Math.abs(a[d] - z[d]), `${ruta} ${k}.${d}: antes ${a[d]}, ahora ${z[d]}`).toBeLessThanOrEqual(1);
        }
        expect(Math.abs(ahora.alto - antes.alto), `${ruta} alto de página`).toBeLessThanOrEqual(1);
        if (variable === "E2E_BASE_URL") {
          // Mismas fotos (A3 ya estaba): la captura debe ser idéntica.
          const igual = Buffer.compare(ahora.png, antes.png) === 0;
          if (!igual) {
            await test.info().attach(`ahora ${ruta}`, { body: ahora.png, contentType: "image/png" });
            await test.info().attach(`antes ${ruta}`, { body: antes.png, contentType: "image/png" });
          }
          expect(igual, `${ruta}: captura de 1.280 px distinta a ${nombre}`).toBe(true);
        }
      }
    });
  }

  test("LCP de la ficha en móvil (Slow 4G, CPU 4×) < 2,5 s; foto principal con prioridad; CLS < 0,01", async ({ browser }) => {
    const resultados: Record<string, unknown> = {};
    for (const ruta of FICHAS) {
      const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await page.addInitScript(() => {
        const w = window as unknown as { __lcp: { t: number; el: string }; __cls: number };
        w.__lcp = { t: 0, el: "" };
        w.__cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as (PerformanceEntry & { element?: Element; url?: string })[]) w.__lcp = { t: e.startTime, el: `${e.element?.tagName ?? ""} ${e.url ?? ""}` };
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) w.__cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto(ruta, { waitUntil: "load", timeout: 60_000 });
      await page.waitForTimeout(1500);
      const img = page.locator("main article .grid > div > figure picture img");
      if (await img.count()) {
        await expect(img).toHaveAttribute("loading", "eager");
        await expect(img).toHaveAttribute("fetchpriority", "high");
      }
      const m = await page.evaluate(() => {
        const w = window as unknown as { __lcp: { t: number; el: string }; __cls: number };
        return { __lcp: w.__lcp, __cls: w.__cls };
      });
      resultados[ruta] = { lcpMs: Math.round(m.__lcp.t), lcp: m.__lcp.el, cls: m.__cls };
      expect(m.__lcp.t, ruta).toBeLessThan(2500);
      expect(m.__cls, ruta).toBeLessThan(0.01);
      await ctx.close();
    }
    test.info().annotations.push({ type: "lcp-movil", description: JSON.stringify(resultados) });
  });

  test("axe en las fichas a 360 y 1.280 px", async ({ page }) => {
    for (const ancho of [360, 1280]) {
      await page.setViewportSize({ width: ancho, height: 800 });
      for (const ruta of FICHAS) {
        await page.goto(ruta);
        await page.waitForLoadState("networkidle");
        expect(await axeSerio(page), `${ruta} a ${ancho}`).toEqual([]);
      }
    }
  });
});

// =====================================================================================
test.describe("M9 · errores en tinta con ícono", () => {
  test("no queda text-danger en src/", () => {
    let salida = "";
    try {
      salida = execFileSync("grep", ["-rn", "text-danger", "src/"], { encoding: "utf8" });
    } catch (e) {
      // grep devuelve 1 cuando no hay coincidencias.
      expect((e as { status: number }).status).toBe(1);
    }
    expect(salida).toBe("");
  });

  for (const t of ["light", "dark"] as const) {
    for (const ancho of [360, 1280]) {
      test(`/pedido/ envío con errores de campo, tema ${t}, ${ancho} px: texto en tinta ≥ 4,5:1, ícono y borde ≥ 3:1, axe limpio`, async ({ page }) => {
        await page.setViewportSize({ width: ancho, height: 800 });
        await irAlEnvio(page);
        await tema(page, t);
        await page.getByRole("button", { name: /Ver el resumen/ }).click();
        await expect(page.locator(".ds-alerta")).toBeVisible();
        await expect(page.locator(".ds-error").first()).toBeVisible();

        const alerta = await contrastes(page, ".ds-alerta");
        const errores = await contrastes(page, ".ds-error");
        test.info().annotations.push({ type: `contraste-envio-${t}-${ancho}`, description: JSON.stringify({ alerta: alerta[0], error: errores[0], n: errores.length }) });
        for (const c of [...alerta, ...errores]) {
          expect(c.textoRatio).toBeGreaterThanOrEqual(4.5);
          if (c.textoHijosMin !== null) expect(c.textoHijosMin).toBeGreaterThanOrEqual(4.5);
          expect(c.iconoRatio).not.toBeNull();
          expect(c.iconoRatio!).toBeGreaterThanOrEqual(3);
        }
        for (const c of alerta) expect(c.bordeRatio).toBeGreaterThanOrEqual(3);
        // Texto en --ink, ícono en --danger.
        const [ink, danger] = await page.evaluate(() => {
          const p = document.createElement("p");
          document.querySelector("main")!.appendChild(p);
          p.style.color = "var(--ink)";
          const a = getComputedStyle(p).color;
          p.style.color = "var(--danger)";
          const b = getComputedStyle(p).color;
          p.remove();
          return [a, b];
        });
        for (const c of [...alerta, ...errores]) {
          expect(c.texto).toBe(ink);
          expect(c.icono).toBe(danger);
        }
        // Campo inválido: borde y anillo grana ≥ 3:1 contra su fondo.
        const campos = await page.locator('main [aria-invalid="true"]').evaluateAll((els) =>
          els.map((el) => {
            const cs = getComputedStyle(el);
            return { id: el.id, borde: cs.borderTopColor, sombra: cs.boxShadow, fondo: cs.backgroundColor, fondoPadre: getComputedStyle(el.parentElement!).backgroundColor };
          }),
        );
        expect(campos.length).toBeGreaterThan(2);
        for (const c of campos) {
          expect(c.borde, c.id).toBe(danger);
          expect(c.sombra, c.id).toContain("inset");
          // El borde se ve contra el fondo del campo (surface-raised) y contra el de la página.
          expect(await ratioEntre(page, c.borde, c.fondo)).toBeGreaterThanOrEqual(3);
        }
        expect(await axeSerio(page, t === "dark")).toEqual([]);
        if (ancho === 360) await page.screenshot({ path: `docs/qa/capturas/2026-11-18-m9-envio-errores-${t}-360.png`, fullPage: true });
      });
    }
  }

  async function resumenConErrorCasillas(page: Page) {
    await irAlEnvio(page);
    await llenarEnvio(page);
    await page.getByRole("button", { name: /Ver el resumen/ }).click();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    // aria-disabled: Playwright no lo da por habilitado; el usuario sí puede pulsarlo (QA-006).
    await page.getByRole("button", { name: "Enviar por WhatsApp" }).click({ force: true });
    await expect(page.locator("#e-ter")).toBeVisible();
    await expect(page.locator("#e-aut")).toBeVisible();
  }

  for (const t of ["light", "dark"] as const) {
    for (const ancho of [360, 1280]) {
      test(`resumen con errores de casillas, tema ${t}, ${ancho} px: contraste y axe`, async ({ page }) => {
        await page.setViewportSize({ width: ancho, height: 800 });
        await resumenConErrorCasillas(page);
        await tema(page, t);
        const errores = await contrastes(page, "#e-ter, #e-aut");
        test.info().annotations.push({ type: `contraste-casillas-${t}-${ancho}`, description: JSON.stringify(errores[0]) });
        for (const c of errores) {
          expect(c.textoRatio).toBeGreaterThanOrEqual(4.5);
          expect(c.iconoRatio!).toBeGreaterThanOrEqual(3);
        }
        // Contorno grana de la casilla sin foco: ≥ 3:1 contra el fondo.
        const aut = await page.locator("#c-aut").evaluate((el) => {
          const cs = getComputedStyle(el);
          let bg = "";
          for (let e: Element | null = el.parentElement; e && !bg; e = e.parentElement) {
            const c = getComputedStyle(e).backgroundColor;
            if (c !== "rgba(0, 0, 0, 0)") bg = c;
          }
          return { estilo: cs.outlineStyle, ancho: cs.outlineWidth, color: cs.outlineColor, bg, activo: document.activeElement === el };
        });
        expect(aut.activo).toBe(false);
        expect(aut.estilo).toBe("solid");
        expect(aut.ancho).toBe("2px");
        expect(await ratioEntre(page, aut.color, aut.bg)).toBeGreaterThanOrEqual(3);
        expect(await axeSerio(page, t === "dark")).toEqual([]);
        if (ancho === 360) await page.screenshot({ path: `docs/qa/capturas/2026-11-18-m9-casillas-${t}-360.png`, fullPage: false });
      });
    }
  }

  test("foco en una casilla con error: se distingue de la casilla con error sin foco (≥ 3:1 entre estados)", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await resumenConErrorCasillas(page);
    // Tras el clic, el foco va a la primera sin marcar (términos), por programa. Se fuerza el foco de teclado.
    await page.locator("#c-ter").focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    const estados = await page.evaluate(() => {
      const leer = (id: string) => {
        const el = document.getElementById(id)!;
        const cs = getComputedStyle(el);
        return { foco: el.matches(":focus-visible"), estilo: cs.outlineStyle, ancho: cs.outlineWidth, offset: cs.outlineOffset, color: cs.outlineColor, sombra: cs.boxShadow };
      };
      return { ter: leer("c-ter"), aut: leer("c-aut") };
    });
    test.info().annotations.push({ type: "foco-casilla", description: JSON.stringify(estados) });
    // El contorno de foco está a 4 px fuera de la casilla: la captura lleva margen para que se vea (la del elemento solo no lo muestra).
    const bt = (await page.locator("#c-ter").boundingBox())!;
    await page.screenshot({ path: "docs/qa/capturas/2026-11-18-m9-foco-casilla-ter.png", clip: { x: bt.x - 12, y: bt.y - 12, width: bt.width + 24, height: bt.height + 24 } });
    // Con margen: el contorno de foco sobresale 6 px del fieldset y la captura del elemento solo lo recortaba.
    const bf = (await page.getByTestId("casillas-obligatorias").boundingBox())!;
    await page.screenshot({ path: "docs/qa/capturas/2026-11-18-m9-foco-casillas-360.png", clip: { x: Math.max(0, bf.x - 12), y: bf.y - 12, width: bf.width + 24, height: bf.height + 24 } });
    expect(estados.ter.foco).toBe(true);
    // Hay contorno visible en la casilla enfocada.
    expect(estados.ter.estilo).toBe("solid");
    // Criterio de cierre: el estado con foco se distingue del estado con error sin foco.
    const distintoEnForma = estados.ter.ancho !== estados.aut.ancho || estados.ter.offset !== estados.aut.offset || estados.ter.sombra !== estados.aut.sombra;
    const r = await ratioEntre(page, estados.ter.color, estados.aut.color);
    test.info().annotations.push({ type: "ratio-foco-vs-error", description: String(r) });
    expect(distintoEnForma || r >= 3, `foco ${estados.ter.color} vs error ${estados.aut.color}: ${r}:1, misma forma`).toBe(true);
  });

  // Verificación de QA-021 (commit 2b98981): valores exactos de la especificación, en claro y oscuro.
  // Con error: anillo grana de 2 px pegado (outline offset 0 + box-shadow). Con error y foco: además contorno --focus a 4 px.
  for (const t of ["light", "dark"] as const) {
    test(`QA-021 (verificación), tema ${t}: error sin foco = anillo --danger pegado; error con foco = contorno --focus a 4 px y anillo grana`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await resumenConErrorCasillas(page);
      await tema(page, t);
      await page.locator("#c-ter").focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const e = await page.evaluate(() => {
        const sonda = document.createElement("span");
        document.getElementById("c-aut")!.parentElement!.appendChild(sonda);
        const resolver = (v: string) => {
          sonda.style.color = `var(${v})`;
          return getComputedStyle(sonda).color;
        };
        const leer = (id: string) => {
          const el = document.getElementById(id)!;
          const cs = getComputedStyle(el);
          return { foco: el.matches(":focus-visible"), estilo: cs.outlineStyle, ancho: cs.outlineWidth, offset: cs.outlineOffset, color: cs.outlineColor, sombra: cs.boxShadow };
        };
        const r = { ter: leer("c-ter"), aut: leer("c-aut"), focus: resolver("--focus"), danger: resolver("--danger") };
        sonda.remove();
        return r;
      });
      test.info().annotations.push({ type: `qa-021-${t}`, description: JSON.stringify(e) });
      expect(e.focus).not.toBe(e.danger);
      // Error con foco (términos).
      expect(e.ter.foco).toBe(true);
      expect(e.ter).toMatchObject({ estilo: "solid", ancho: "2px", offset: "4px", color: e.focus });
      expect(e.ter.sombra).toBe(`${e.danger} 0px 0px 0px 2px`);
      // Error sin foco (autorización).
      expect(e.aut.foco).toBe(false);
      expect(e.aut).toMatchObject({ estilo: "solid", ancho: "2px", offset: "0px", color: e.danger });
      expect(e.aut.sombra).toBe(`${e.danger} 0px 0px 0px 2px`);
      if (t === "dark") {
        const bt = (await page.locator("#c-ter").boundingBox())!;
        await page.screenshot({ path: "docs/qa/capturas/2026-11-18-m9-foco-casilla-ter-dark.png", clip: { x: bt.x - 12, y: bt.y - 12, width: bt.width + 24, height: bt.height + 24 } });
      }
    });
  }

  // El error de líneas no se alcanza desde la interfaz: el carrito depura al cargar las líneas que el catálogo ya no vende
  // (carrito-provider.tsx, esValida) y el catálogo es estático. Se mide el marcado exacto de flujo-pedido.tsx:366-373
  // insertado en el resumen real, con el ícono que renderiza IconoAlerta.
  test("error de líneas en el resumen (marcado de flujo-pedido.tsx insertado): contraste y axe en claro y oscuro", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await resumenConErrorCasillas(page);
    await page.evaluate(() => {
      const icono = document.querySelector("#e-ter svg")!.cloneNode(true) as SVGElement;
      icono.setAttribute("class", "ds-alerta__icon");
      const div = document.createElement("div");
      div.setAttribute("role", "alert");
      div.className = "ds-alerta mt-4";
      div.dataset.qa = "lineas";
      div.innerHTML = '<div><p class="font-semibold">Revisa tu pedido: hay productos que cambiaron.</p><ul class="mt-1 list-disc pl-5 text-ink"><li>Café Casa Martínez ya no se vende en 1000 g.</li></ul></div>';
      div.prepend(icono);
      document.querySelector('[data-testid="casillas-obligatorias"]')!.after(div);
    });
    const caja = page.locator('[data-qa="lineas"]');
    for (const t of ["light", "dark"] as const) {
      await tema(page, t);
      const c = await contrastes(page, '[data-qa="lineas"]');
      test.info().annotations.push({ type: `contraste-lineas-${t}`, description: JSON.stringify(c[0]) });
      expect(c[0].textoRatio).toBeGreaterThanOrEqual(4.5);
      expect(c[0].textoHijosMin!).toBeGreaterThanOrEqual(4.5);
      expect(c[0].bordeRatio).toBeGreaterThanOrEqual(3);
      expect(c[0].iconoRatio!).toBeGreaterThanOrEqual(3);
      expect(await axeSerio(page, t === "dark"), t).toEqual([]);
      await caja.screenshot({ path: `docs/qa/capturas/2026-11-18-m9-lineas-${t}.png` });
    }
  });

  test("ficha agotada (copia con CSV temporal): sin pastilla repetida, botón deshabilitado, pastilla de tarjeta sin grana; axe", async ({ page }) => {
    const base = process.env.E2E_AGOTADO_URL;
    test.skip(!base, "sin E2E_AGOTADO_URL");
    for (const ancho of [360, 1280]) {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto(`${base}/cafes/cafe-arreboles/`);
      await page.waitForLoadState("networkidle");
      const form = page.locator("main article form").first();
      const boton = form.getByRole("button", { name: "Agotado" });
      await expect(boton).toBeVisible();
      await expect(boton).toBeDisabled();
      await expect(form.locator(".ds-badge--soldout")).toHaveCount(0);
      // «Agotado» solo en el botón y en las píldoras de tamaño, no en una pastilla aparte.
      const textos = await form.getByText("Agotado", { exact: true }).evaluateAll((els) => els.map((e) => (e.closest("button") ? "boton" : e.closest("label") ? "pildora" : e.className)));
      test.info().annotations.push({ type: `agotado-textos-${ancho}`, description: JSON.stringify(textos) });
      expect(textos.filter((x) => x !== "boton" && x !== "pildora")).toEqual([]);
      expect(textos.filter((x) => x === "boton")).toHaveLength(1);
      expect(await axeSerio(page), `ficha agotada ${ancho}`).toEqual([]);
      if (ancho === 360) await page.screenshot({ path: "docs/qa/capturas/2026-11-18-m9-ficha-agotada-360.png", fullPage: true });

      // Tamaño agotado de un café disponible: la píldora sigue diciendo «Agotado».
      await page.goto(`${base}/cafes/cafe-casa-martinez/`);
      await expect(page.locator("main article form").getByRole("radio", { name: /500 g/ })).toBeDisabled();
      expect(await axeSerio(page), `ficha con tamaño agotado ${ancho}`).toEqual([]);

      // Tarjeta del catálogo: pastilla «Agotado» en tinta con borde line-strong e ícono.
      await page.goto(`${base}/cafes/`);
      await page.waitForLoadState("networkidle");
      const pastilla = page.locator(".ds-badge--soldout").first();
      await expect(pastilla).toBeVisible();
      await expect(pastilla).toHaveText("Agotado");
      await expect(pastilla.locator("svg")).toHaveCount(1);
      for (const t of ["light", "dark"] as const) {
        await tema(page, t);
        const c = await contrastes(page, ".ds-badge--soldout");
        test.info().annotations.push({ type: `contraste-pastilla-${t}-${ancho}`, description: JSON.stringify(c[0]) });
        expect(c[0].textoRatio).toBeGreaterThanOrEqual(4.5);
        expect(c[0].bordeRatio).toBeGreaterThanOrEqual(3);
        expect(c[0].iconoRatio!).toBeGreaterThanOrEqual(3);
      }
      await tema(page, "light");
      expect(await axeSerio(page), `catálogo con agotado ${ancho}`).toEqual([]);
      if (ancho === 360) await pastilla.locator("xpath=ancestor::article[1]").screenshot({ path: "docs/qa/capturas/2026-11-18-m9-tarjeta-agotada-360.png" });
    }
  });
});
