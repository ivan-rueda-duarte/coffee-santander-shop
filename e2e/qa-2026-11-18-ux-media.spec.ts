import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { puntoEnProvincia } from "./ayudas";

// Ronda QA 2026-11-18: verificación de la severidad media de la auditoría UX.
// Fuentes: docs/diseno/2026-11-18-ux-auditoria-media.md («Entrega para qa-pruebas»: M1, M2, M3, leyenda de promociones y
// ficha agotada) y los commits c738edf (M5), f7ce7cb (M6), abe255a (M10), 9925886 (M7), 5bbf1f8 (QA-018), ec4b442 (M1),
// 1e579b9 (M2), 19fe7bc (M3), 8072c37 (leyenda) y bbd2923 (píldoras agotadas). M4 y M8 se verifican en
// e2e/qa-2026-11-18-cierre-media.spec.ts (ronda de cierre, que también actualizó aquí los titulares de M4 y la medida de los
// deslizadores por su raíz). Reporte: docs/qa/2026-11-18-ux-auditoria-media.md.
// Variables opcionales:
// - E2E_AGOTADO_URL: build de una copia con data/catalogo.csv modificado (arreboles agotado 250|500, casa-martinez 250).
//   Nunca se commitea.

const SERIAS = ["serious", "critical"];
const UNA_BOLSA = [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }];

async function conBolsas(page: Page, lineas = UNA_BOLSA) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate((l) => localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: l })), lineas);
}

async function alResumen(page: Page) {
  await conBolsas(page);
  await page.goto("/pedido/");
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByLabel("Departamento").selectOption("Santander");
  await page.getByLabel("Municipio").selectOption("Bucaramanga");
  await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
  await page.getByRole("button", { name: /Ver el resumen/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

async function axeSerio(page: Page, soloMain = false) {
  const r = await (soloMain ? new AxeBuilder({ page }).include("main") : new AxeBuilder({ page })).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  return r.violations.filter((v) => SERIAS.includes(v.impact ?? "")).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

async function tema(page: Page, t: "light" | "dark") {
  await page.evaluate((v) => {
    document.documentElement.setAttribute("data-theme", v);
    document.querySelector("main")?.setAttribute("data-theme", v);
  }, t);
  await page.waitForTimeout(400);
}

/** Contraste WCAG entre el color del texto y el primer fondo opaco de sus ancestros. */
async function contraste(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const texto = rgb(getComputedStyle(el).color);
    let n: Element | null = el;
    let fondo = [255, 255, 255];
    while (n) {
      const c = rgb(getComputedStyle(n).backgroundColor);
      if (c.length >= 3 && (c.length === 3 || c[3] > 0.95)) {
        fondo = c.slice(0, 3);
        break;
      }
      n = n.parentElement;
    }
    const [a, b] = [lum(texto), lum(fondo)].sort((x, y) => y - x);
    return { ratio: (a + 0.05) / (b + 0.05), texto: getComputedStyle(el).color, fondo: `rgb(${fondo.join(", ")})`, opacidad: getComputedStyle(el).opacity };
  });
}

// =====================================================================================================================
// M1 · objetivos táctiles de 44 px
// =====================================================================================================================

interface Control {
  tag: string;
  nombre: string;
  w: number;
  h: number;
  tw: number;
  th: number;
  ampliada: boolean;
  enLinea: boolean;
  zona: string;
  caja: { L: number; T: number; R: number; B: number };
}

/**
 * Controles visibles con su área táctil: caja del elemento ∪ ::before/::after absolutos (del elemento, de su etiqueta o de
 * un hijo). Los <input> ocultos (sr-only) se miden por su <label>. «enLinea»: enlace en línea dentro de un texto más largo.
 */
function medirTactil(): Control[] {
  const sel =
    'a[href], button, select, input:not([type=hidden]), summary, textarea, [role=button], [role=link], [role=slider], [role=checkbox], [role=radio], [tabindex]:not([tabindex="-1"])';
  const res: Control[] = [];
  for (const el0 of document.querySelectorAll<HTMLElement>(sel)) {
    if (el0.closest('[inert], [aria-hidden="true"]')) continue;
    const cs = getComputedStyle(el0);
    if (cs.visibility === "hidden") continue;
    let el: HTMLElement = el0;
    let r = el0.getBoundingClientRect();
    if (el0 instanceof HTMLInputElement) {
      const lab = (el0.closest("label") ?? (el0.id ? document.querySelector<HTMLElement>(`label[for="${el0.id}"]`) : null)) as HTMLElement | null;
      const oculto = r.width <= 2 || r.height <= 2 || cs.opacity === "0";
      if (oculto && !lab) continue;
      if (lab && (oculto || ["checkbox", "radio"].includes(el0.type))) {
        const lr = lab.getBoundingClientRect();
        if (oculto || lr.width * lr.height > r.width * r.height) {
          el = lab;
          r = lr;
        }
      }
    }
    // QA-026 n.º 3 (especificación, «Entrega para qa-pruebas»): en los deslizadores el toque lo recibe la raíz del Slider de
    // Radix (touch-action: none; cualquier punto mueve el pulgar más cercano), así que se mide la raíz y no el pulgar.
    if (el0.getAttribute("role") === "slider") {
      let raiz: HTMLElement | null = el0.parentElement;
      while (raiz && getComputedStyle(raiz).touchAction !== "none") raiz = raiz.parentElement;
      if (raiz) {
        el = raiz;
        r = raiz.getBoundingClientRect();
      }
    }
    if (r.width === 0 || r.height === 0 || el.getClientRects().length === 0) continue;
    let [L, T, R, B] = [r.left, r.top, r.right, r.bottom];
    let ampliada = false;
    for (const e of new Set<Element>([el, el0, ...el.querySelectorAll("span")])) {
      for (const pseudo of ["::before", "::after"]) {
        const b = getComputedStyle(e, pseudo);
        if (!b.content || b.content === "none" || b.position !== "absolute") continue;
        // El pseudo-elemento absoluto se coloca respecto al control si está posicionado; si no, respecto a su ancestro
        // posicionado (enlace extendido de la tarjeta: «after:absolute after:inset-0» cubre todo el <article>).
        const contenedor = getComputedStyle(e).position === "static" ? (e as HTMLElement).offsetParent : e;
        if (!contenedor) continue;
        const er = contenedor.getBoundingClientRect();
        const ecs = getComputedStyle(contenedor);
        const l = er.left + (parseFloat(ecs.borderLeftWidth) || 0) + (parseFloat(b.left) || 0);
        const t = er.top + (parseFloat(ecs.borderTopWidth) || 0) + (parseFloat(b.top) || 0);
        const w = parseFloat(b.width);
        const h = parseFloat(b.height);
        if (w > 0 && h > 0) {
          L = Math.min(L, l);
          T = Math.min(T, t);
          R = Math.max(R, l + w);
          B = Math.max(B, t + h);
          ampliada = true;
        }
      }
    }
    const padre = el.parentElement;
    const textoPadre = (padre?.textContent ?? "").replace(/\s+/g, " ").trim();
    const textoEl = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    const display = getComputedStyle(el).display;
    res.push({
      tag: el0.tagName.toLowerCase() + (el !== el0 ? ">label" : ""),
      nombre: (el0.getAttribute("aria-label") ?? textoEl).slice(0, 60),
      w: Math.round(r.width * 10) / 10,
      h: Math.round(r.height * 10) / 10,
      tw: Math.round((R - L) * 10) / 10,
      th: Math.round((B - T) * 10) / 10,
      ampliada,
      enLinea: el.tagName === "A" && display.startsWith("inline") && textoPadre.length > textoEl.length + 3,
      zona: el0.closest("[data-testid]")?.getAttribute("data-testid") ?? "",
      caja: { L, T, R, B },
    });
  }
  return res;
}

/**
 * Excepciones del criterio (spec M1): enlaces en línea dentro de una frase, las provincias del mapa (formas grandes, la
 * especificación las da por buenas), el enlace «Ir al contenido» (sr-only hasta recibir el foco) y la tabla de /envios/,
 * que rehace M8 en paralelo (fuera de esta ronda).
 */
function excluido(c: Control) {
  if (c.nombre === "Ir al contenido") return true;
  if (c.tag === "g" || c.tag === "path") return true;
  if (c.zona === "nota-envio-gratis-tabla" || c.zona === "tabla-envios") return true;
  return c.enLinea;
}

async function controlesPequenos(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const todos = await page.evaluate(medirTactil);
  return {
    todos,
    pequenos: todos.filter((c) => Math.min(c.tw, c.th) < 43.5 && !excluido(c)).map((c) => `${c.tag} «${c.nombre}» ${c.tw}×${c.th}${c.ampliada ? " (área ampliada)" : ""}`),
  };
}

test.describe("M1 · objetivos táctiles a 360 × 740", () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });

  const escenarios: { nombre: string; preparar: (page: Page) => Promise<void> }[] = [
    { nombre: "inicio con bolsas", preparar: async (p) => { await conBolsas(p); await p.goto("/"); await p.waitForLoadState("networkidle"); } },
    {
      nombre: "inicio con el cajón abierto",
      preparar: async (p) => {
        await conBolsas(p);
        await p.goto("/");
        await p.getByRole("button", { name: /^Pedido/ }).click();
        await expect(p.getByRole("dialog", { name: "Tu pedido" })).toBeVisible();
      },
    },
    {
      nombre: "inicio con la hoja de filtros",
      preparar: async (p) => {
        await p.goto("/");
        await p.waitForLoadState("networkidle");
        await p.getByRole("button", { name: /^Filtros/ }).click();
        await expect(p.getByRole("dialog", { name: "Filtros" })).toBeVisible();
      },
    },
    {
      nombre: "inicio con la tarjeta de provincia",
      preparar: async (p) => {
        await p.goto("/");
        await p.locator("#mapa").scrollIntoViewIfNeeded();
        await expect(p.locator('g[data-provincia="guanenta"]')).toBeVisible();
        const { x, y } = await puntoEnProvincia(p, "guanenta");
        await p.touchscreen.tap(x, y);
        await expect(p.getByRole("dialog", { name: /Provincia de Guanentá/ })).toBeVisible();
      },
    },
    { nombre: "ficha", preparar: async (p) => { await p.goto("/cafes/cafe-casa-martinez/"); await p.waitForLoadState("networkidle"); } },
    { nombre: "/envios/", preparar: async (p) => { await p.goto("/envios/"); await p.waitForLoadState("networkidle"); } },
    { nombre: "/pedido/ (envío)", preparar: async (p) => { await conBolsas(p); await p.goto("/pedido/"); await p.waitForLoadState("networkidle"); } },
    { nombre: "/pedido/ (resumen)", preparar: alResumen },
  ];

  for (const e of escenarios) {
    test(`${e.nombre}: ningún control con área táctil menor de 44 × 44 (QA-025, QA-026)`, async ({ page }) => {
      await e.preparar(page);
      const { todos, pequenos } = await controlesPequenos(page);
      test.info().annotations.push({ type: "controles", description: String(todos.length) });
      expect(todos.length).toBeGreaterThan(5);
      expect(pequenos, e.nombre).toEqual([]);
    });
  }

  test("QA-025: el área ampliada de un chip de filtro llega 4 px por encima y por debajo de su caja (prueba de impacto)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const chip = page.getByRole("button", { name: /^Guanentá/ }).first();
    await chip.scrollIntoViewIfNeeded();
    const r = (await chip.boundingBox())!;
    // Spec M1 n.º 2: 36 visibles + 4 + 4 = 44. Se mide con elementFromPoint (lo que recibe el toque), no con estilos.
    const alcance = await page.evaluate(({ x, top, bottom }) => {
      const pega = (y: number) => /^Guanentá/.test(document.elementFromPoint(x, y)?.closest("button")?.textContent?.trim() ?? "");
      let arriba = 0;
      let abajo = 0;
      for (let k = 0.5; k <= 8; k += 0.5) if (pega(top - k)) arriba = k;
      for (let k = 0.5; k <= 8; k += 0.5) if (pega(bottom + k)) abajo = k;
      return { arriba, abajo, total: bottom - top + arriba + abajo };
    }, { x: r.x + r.width / 2, top: r.y, bottom: r.y + r.height });
    test.info().annotations.push({ type: "alcance", description: JSON.stringify({ caja: r.height, ...alcance }) });
    expect(alcance.total, `alto táctil del chip (caja ${r.height} px)`).toBeGreaterThanOrEqual(44);
  });

  test("pines del mapa: área de 44 px y sin solape entre dos pines", async ({ page }) => {
    await page.goto("/");
    await page.locator("#mapa").scrollIntoViewIfNeeded();
    await expect(page.locator(".mapa-pin").first()).toBeVisible();
    const pines = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".mapa-pin")].map((e) => {
        const r = e.getBoundingClientRect();
        const b = getComputedStyle(e, "::before");
        const t = r.top + parseFloat(b.top);
        const l = r.left + parseFloat(b.left);
        return { nombre: e.textContent?.trim(), L: l, T: t, R: l + parseFloat(b.width), B: t + parseFloat(b.height), h: parseFloat(b.height), w: parseFloat(b.width) };
      }),
    );
    test.info().annotations.push({ type: "pines", description: JSON.stringify(pines) });
    expect(pines.length).toBeGreaterThan(0);
    for (const p of pines) expect(Math.min(p.w, p.h), p.nombre).toBeGreaterThanOrEqual(44);
    for (let i = 0; i < pines.length; i++)
      for (let j = i + 1; j < pines.length; j++) {
        const [a, b] = [pines[i], pines[j]];
        const solapan = a.L < b.R && b.L < a.R && a.T < b.B && b.T < a.B;
        expect(solapan, `${a.nombre} y ${b.nombre}`).toBe(false);
      }
  });

  test("selects a 16 px en celular (sin zoom de iOS al enfocar; WebKit no está en el entorno) y 44 px de alto", async ({ page }) => {
    await conBolsas(page);
    await page.goto("/");
    const orden = page.getByRole("combobox", { name: "Ordenar" });
    await page.waitForLoadState("networkidle");
    const enLinea = page.getByRole("dialog", { name: "Tu pedido" }).getByRole("combobox", { name: /^Tamaño de/ });
    for (const [donde, sel] of [["Ordenar", orden], ["línea del cajón", enLinea]] as const) {
      if (donde !== "Ordenar") {
        await page.getByRole("button", { name: /^Pedido/ }).click();
        await expect(enLinea).toBeVisible();
      }
      const ruta = donde;
      const m = await sel.evaluate((e) => ({ fs: parseFloat(getComputedStyle(e).fontSize), h: e.getBoundingClientRect().height }));
      expect(m.fs, ruta).toBeGreaterThanOrEqual(16);
      expect(m.h, ruta).toBeGreaterThanOrEqual(44);
    }
  });

  test("encabezado de 75 px a 360 y 320 px (U de QA-023 = 665)", async ({ page }) => {
    await conBolsas(page, [{ ...UNA_BOLSA[0], cantidad: 12 }]);
    for (const ancho of [360, 320]) {
      await page.setViewportSize({ width: ancho, height: 740 });
      for (const ruta of ["/", "/pedido/"]) {
        await page.goto(ruta);
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);
        const alto = await page.locator("header").evaluate((h) => h.getBoundingClientRect().height);
        expect(alto, `${ruta} a ${ancho}`).toBeLessThanOrEqual(75);
      }
    }
  });

  test("«Pedido» a 280 px: sin desborde, solo ícono y número, nombre accesible con «Pedido» y las bolsas", async ({ page }) => {
    await conBolsas(page, [{ ...UNA_BOLSA[0], cantidad: 3 }]);
    await page.setViewportSize({ width: 280, height: 740 });
    for (const ruta of ["/", "/provincias/guanenta/", "/pedido/", "/legal/terminos/"]) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      const boton = page.getByRole("button", { name: "Pedido 3 bolsas", exact: true });
      await expect(boton).toBeVisible();
      const caja = (await boton.boundingBox())!;
      expect(caja.x + caja.width, ruta).toBeLessThanOrEqual(280);
      expect(caja.height).toBeGreaterThanOrEqual(44);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), ruta).toBeLessThanOrEqual(0);
    }
  });

  test("sin desborde horizontal a 320 px", async ({ page }) => {
    await conBolsas(page, [{ ...UNA_BOLSA[0], cantidad: 12 }]);
    await page.setViewportSize({ width: 320, height: 740 });
    for (const ruta of ["/", "/cafes/", "/cafes/cafe-casa-martinez/", "/cafes/cafe-arreboles/", "/provincias/guanenta/", "/envios/", "/pedido/", "/legal/terminos/", "/legal/vendedor/"]) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), ruta).toBeLessThanOrEqual(0);
    }
  });
});

// =====================================================================================================================
// M2 · espaciador de la barra «Tu pedido»
// =====================================================================================================================
test.describe("M2 · barra «Tu pedido» y espaciador a 360 × 740", () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });

  test("en cada página, al final: vendedor, © con IVA y franja completos encima de la barra; espaciador = barra", async ({ page }) => {
    await conBolsas(page);
    for (const ruta of ["/", "/cafes/", "/cafes/cafe-arreboles/", "/provincias/guanenta/", "/envios/", "/legal/terminos/", "/legal/vendedor/"]) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      const barra = page.locator("div.fixed.inset-x-0.bottom-0");
      await expect(barra, ruta).toContainText("Tu pedido · 1 bolsa");
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(150);
      const m = await page.evaluate(() => {
        const caja = (s: string) => document.querySelector(s)?.getBoundingClientRect() ?? null;
        const barra = document.querySelector("div.fixed.inset-x-0.bottom-0")!.getBoundingClientRect();
        return {
          barraTop: barra.top,
          barraAlto: barra.height,
          espaciador: caja('[data-testid="espaciador-barra-pedido"]')?.height ?? -1,
          pie: caja("footer")!.bottom,
          copy: caja('[data-testid="pie-copyright"]')!.bottom,
          vendedor: caja('[data-testid="pie-vendedor"]')?.bottom ?? 0,
          ventana: window.innerHeight,
          fin: document.documentElement.scrollHeight - window.scrollY - window.innerHeight,
        };
      });
      test.info().annotations.push({ type: ruta, description: JSON.stringify(m) });
      expect(m.fin, `${ruta}: desplazada hasta el final`).toBeLessThanOrEqual(1);
      expect(Math.abs(m.espaciador - m.barraAlto), `${ruta}: espaciador y barra`).toBeLessThanOrEqual(1);
      expect(m.pie, `${ruta}: franja`).toBeLessThanOrEqual(m.barraTop + 1);
      expect(m.copy, `${ruta}: ©`).toBeLessThanOrEqual(m.barraTop);
      expect(m.vendedor, `${ruta}: vendedor`).toBeLessThanOrEqual(m.barraTop);
    }
    await page.screenshot({ path: "docs/qa/capturas/2026-11-18-m2-final-360.png" });
  });

  test("sin bolsas, con el cajón abierto, en /pedido/ y desde md: sin espaciador visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("espaciador-barra-pedido")).toHaveCount(0);
    await conBolsas(page);
    await page.goto("/");
    await expect(page.getByTestId("espaciador-barra-pedido")).toHaveCount(1);
    await page.getByRole("button", { name: "Ver pedido" }).click();
    await expect(page.getByRole("dialog", { name: "Tu pedido" })).toBeVisible();
    await expect(page.getByTestId("espaciador-barra-pedido")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("espaciador-barra-pedido")).toHaveCount(1);
    await page.goto("/pedido/");
    await expect(page.getByTestId("espaciador-barra-pedido")).toHaveCount(0);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("espaciador-barra-pedido")).toBeHidden();
    await expect(page.locator("div.fixed.inset-x-0.bottom-0")).toBeHidden();
    const finPie = await page.evaluate(() => document.documentElement.scrollHeight - (document.querySelector("footer")!.getBoundingClientRect().bottom + window.scrollY));
    expect(finPie, "desde md la franja es el borde de la página").toBeLessThanOrEqual(1);
  });
});

// =====================================================================================================================
// M3 · navegación en celular
// =====================================================================================================================
test.describe("M3 · tira de navegación", () => {
  test("una sola navegación «Principal» en el árbol a 360, 767, 768 y 1.280 px, con los cinco destinos", async ({ page }) => {
    for (const ancho of [360, 767, 768, 1280]) {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const nav = page.getByRole("navigation", { name: "Principal" });
      await expect(nav, `${ancho}`).toHaveCount(1);
      await expect(nav.getByRole("link")).toHaveText(["Mapa", "Cafés", "Cómo pedir", "Historia", "Envíos"]);
    }
  });

  test("QA-027: a 360 px Tab recorre los cinco enlaces; cada uno queda a la vista dentro de la tira y el contorno no se recorta", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const tira = page.getByTestId("tira-navegacion");
    await page.locator("#boton-pedido").focus();
    const vistos: string[] = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(300);
      const m = await page.evaluate(() => {
        const a = document.activeElement as HTMLElement;
        const ul = a.closest("ul");
        if (!ul) return null;
        const r = a.getBoundingClientRect();
        const u = ul.getBoundingClientRect();
        const cs = getComputedStyle(a);
        const ancho = parseFloat(cs.outlineWidth) || 0;
        const off = parseFloat(cs.outlineOffset) || 0;
        // El contorno ocupa [caja − off − ancho] hacia fuera si off ≥ 0; con off negativo queda dentro de la caja.
        const fuera = Math.max(0, ancho + off);
        return {
          texto: a.textContent,
          dentro: r.left - fuera >= u.left - 0.5 && r.right + fuera <= u.right + 0.5 && r.top - fuera >= u.top - 0.5 && r.bottom + fuera <= u.bottom + 0.5,
          estilo: cs.outlineStyle,
          ancho,
          off,
        };
      });
      if (i === 4) await tira.screenshot({ path: "docs/qa/capturas/2026-11-18-m3-tira-foco-envios-360.png" });
      expect(m, `Tab ${i + 1} cae en la tira`).not.toBeNull();
      vistos.push(m!.texto!);
      expect(m!.estilo, m!.texto!).not.toBe("none");
      expect(m!.ancho).toBeGreaterThan(0);
      expect(m!.dentro, `${m!.texto}: el enlace y su contorno quedan dentro de la tira visible`).toBe(true);
    }
    expect(vistos).toEqual(["Mapa", "Cafés", "Cómo pedir", "Historia", "Envíos"]);
  });

  test("al deslizar la tira hasta el final, «Envíos» sale entero del fundido de 24 px (pr-6)", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    const m = await page.getByTestId("tira-navegacion").locator("ul").evaluate((ul) => {
      ul.scrollLeft = ul.scrollWidth;
      const u = ul.getBoundingClientRect();
      const r = [...ul.querySelectorAll("a")].at(-1)!.getBoundingClientRect();
      return { derecha: r.right, fundido: u.right - 24 };
    });
    expect(m.derecha).toBeLessThanOrEqual(m.fundido + 0.5);
  });

  test("«Ir al contenido» salta la tira", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Ir al contenido" })).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    const dentro = await page.evaluate(() => ({ main: !!document.activeElement?.closest("main"), tira: !!document.activeElement?.closest('[data-testid="tira-navegacion"]') }));
    expect(dentro).toEqual({ main: true, tira: false });
  });

  test("aria-current solo en /envios/ (tira y escritorio) y nunca en los «#»; la tira no es fija; sin tira en /pedido/", async ({ page }) => {
    for (const ancho of [360, 1280]) {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto("/envios/");
      const nav = page.getByRole("navigation", { name: "Principal" });
      await expect(nav.getByRole("link", { name: "Envíos" })).toHaveAttribute("aria-current", "page");
      await expect(page.locator('nav[aria-label="Principal"] [aria-current]')).toHaveCount(2); // las dos navegaciones están en el DOM (una oculta)
      await page.goto("/");
      await expect(page.locator('nav[aria-label="Principal"] a[aria-current]')).toHaveCount(0);
      await page.goto("/cafes/");
      await expect(page.locator('nav[aria-label="Principal"] a[aria-current]')).toHaveCount(0);
    }
    await page.setViewportSize({ width: 360, height: 740 });
    await conBolsas(page);
    await page.goto("/pedido/");
    await expect(page.getByTestId("tira-navegacion")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Principal" })).toHaveCount(0);
  });
});

// =====================================================================================================================
// M5 · aria-labelledby y M6 · titulares
// =====================================================================================================================
const PAGINAS = ["/", "/cafes/", "/cafes/cafe-casa-martinez/", "/provincias/guanenta/", "/envios/", "/pedido/", "/legal/terminos/", "/legal/vendedor/"];

test.describe("M5 · referencias ARIA", () => {
  test("todo aria-labelledby y aria-describedby apunta a ids existentes, en cada página", async ({ page }) => {
    await conBolsas(page);
    for (const ruta of PAGINAS) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      const rotas = await page.evaluate(() =>
        [...document.querySelectorAll("[aria-labelledby], [aria-describedby]")].flatMap((el) =>
          ["aria-labelledby", "aria-describedby"].flatMap((a) =>
            (el.getAttribute(a) ?? "").split(/\s+/).filter((id) => id && !document.getElementById(id)).map((id) => `${el.tagName.toLowerCase()}[${a}=${id}]`),
          ),
        ),
      );
      expect(rotas, ruta).toEqual([]);
    }
  });

  test("las secciones del inicio se llaman como su titular (también en el HTML sin JavaScript)", async ({ browser }) => {
    // M4 (2643d92): titulares nuevos del mapa y del catálogo.
    const esperado = ["El café que crece entre cañones y montañas de Santander", "Santander, provincia a provincia", "Elige por provincia", "Cómo pedir"];
    for (const js of [true, false]) {
      const ctx = await browser.newContext({ javaScriptEnabled: js });
      const page = await ctx.newPage();
      await page.goto("/");
      for (const nombre of esperado) await expect(page.getByRole("region", { name: nombre, exact: true }), `${nombre} (js=${js})`).toHaveCount(1);
      const historia = await page.locator("#historia").evaluate((s) => document.getElementById(s.getAttribute("aria-labelledby")!)?.textContent?.trim());
      expect(historia, "historia").toBeTruthy();
      await expect(page.getByRole("region", { name: historia!, exact: true })).toHaveCount(1);
      await ctx.close();
    }
  });
});

test.describe("M6 · un H1 por página", () => {
  test("cada página tiene exactamente un h1; /cafes/ lo tiene en #titulo-catalogo y el inicio conserva el h2", async ({ page }) => {
    for (const ruta of PAGINAS) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("h1"), ruta).toHaveCount(1);
    }
    await page.goto("/cafes/");
    await expect(page.locator("h1#titulo-catalogo")).toHaveText("Elige por provincia");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Elige por provincia");
    await page.goto("/");
    await expect(page.locator("h2#titulo-catalogo")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(/El café que crece/);
  });

  test("el h1 de /cafes/ se ve igual que el h2 del inicio a 360 y 1.280 px", async ({ page }) => {
    const estilo = () =>
      page.locator("#titulo-catalogo").evaluate((e) => {
        const c = getComputedStyle(e);
        return { fontFamily: c.fontFamily, fontSize: c.fontSize, lineHeight: c.lineHeight, fontWeight: c.fontWeight, color: c.color, marginTop: c.marginTop, letterSpacing: c.letterSpacing };
      });
    for (const ancho of [360, 1280]) {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto("/");
      const inicio = await estilo();
      await page.goto("/cafes/");
      expect(await estilo(), `${ancho}`).toEqual(inicio);
    }
  });
});

// =====================================================================================================================
// M7 · el catálogo no salta al hidratar
// =====================================================================================================================
async function cajasCatalogo(browser: Browser, ruta: string, ancho: number, js: boolean) {
  const ctx = await browser.newContext({ viewport: { width: ancho, height: ancho < 768 ? 800 : 900 }, javaScriptEnabled: js, baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto(ruta, { waitUntil: js ? "networkidle" : "load" });
  await page.evaluate(() => document.fonts.ready);
  if (js) await page.waitForTimeout(600);
  const m = await page.evaluate(() => {
    const caja = (el: Element | null | undefined) => (el ? (({ x, y, width, height }) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(width), h: Math.round(height) }))(el.getBoundingClientRect()) : null);
    const sec = document.querySelector("#catalogo");
    return {
      contador: caja(document.querySelector("#resultados-catalogo")),
      tarjetas: [...(sec?.querySelectorAll("li article") ?? [])].map(caja),
      seccion: caja(sec),
      siguiente: caja(document.querySelector("#pedir") ?? document.querySelector("footer")),
    };
  });
  await ctx.close();
  return m;
}

test.describe("M7 · respaldo de Suspense igual al explorador hidratado", () => {
  for (const ruta of ["/", "/cafes/"])
    for (const ancho of [360, 768, 1024, 1440])
      test(`${ruta} a ${ancho} px: contador, tarjetas y sección en la misma caja sin JS y con JS`, async ({ browser }) => {
        const sinJs = await cajasCatalogo(browser, ruta, ancho, false);
        const conJs = await cajasCatalogo(browser, ruta, ancho, true);
        test.info().annotations.push({ type: "sin-js", description: JSON.stringify(sinJs) }, { type: "con-js", description: JSON.stringify(conJs) });
        expect(sinJs.tarjetas.length).toBeGreaterThan(0);
        expect(conJs).toEqual(sinJs);
      });
});

// =====================================================================================================================
// M10 · el aviso con acción se pausa con el cursor o el foco
// Los avisos con acción son «Agregaste…: Ver pedido» (catálogo, fuera de diálogos) y «… quitado del pedido. Deshacer» /
// «Vaciaste el pedido. Deshacer» (desde el cajón, con el diálogo abierto). /pedido/ no tiene «Quitar» (líneas no editables).
// =====================================================================================================================
test.describe("M10 · aviso con acción", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  async function agregarDesdeTarjeta(page: Page) {
    await page.goto("/cafes/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Agregar Café Arreboles, 250 g, al pedido", exact: true }).click();
    const aviso = page.locator("[data-aviso]");
    await expect(aviso).toContainText("Agregaste Café Arreboles");
    return aviso;
  }

  async function quitarEnCajon(page: Page) {
    await conBolsas(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /^Pedido/ }).click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await expect(cajon).toBeVisible();
    await cajon.getByRole("button", { name: /^Quitar Café Casa Martínez, 250 g/ }).click();
    const aviso = page.locator("[data-aviso]");
    await expect(aviso).toContainText("quitado del pedido");
    return { aviso, cajon };
  }

  test("cursor encima 9 s: no se cierra; al salir se cierra con el tiempo restante (≈ 3 s), no con 6 s nuevos", async ({ page }) => {
    test.setTimeout(60_000);
    const aviso = await agregarDesdeTarjeta(page);
    await page.waitForTimeout(3000);
    await aviso.hover();
    await page.waitForTimeout(9000);
    await expect(aviso, "pausado con el cursor encima").toBeVisible();
    await page.mouse.move(5, 5);
    const salida = Date.now();
    await page.waitForTimeout(1200);
    await expect(aviso, "sigue un momento después de salir").toBeVisible();
    await expect(aviso).toBeHidden({ timeout: 4500 });
    const restante = Date.now() - salida;
    test.info().annotations.push({ type: "cierre tras salir (ms)", description: String(restante) });
    expect(restante, "≈ 3 s restantes (6 s − 3 s antes del cursor)").toBeLessThan(4500);
  });

  test("foco dentro (Tab hasta «Ver pedido»): no se cierra; al salir el foco se reanuda y se cierra", async ({ page }) => {
    test.setTimeout(60_000);
    const aviso = await agregarDesdeTarjeta(page);
    await page.mouse.move(5, 5);
    const accion = aviso.getByRole("button", { name: "Ver pedido" });
    await accion.focus();
    await page.waitForTimeout(8000);
    await expect(aviso, "pausado con el foco dentro").toBeVisible();
    await page.keyboard.press("Shift+Tab");
    await expect(accion).not.toBeFocused();
    await expect(aviso, "reanuda al salir el foco").toBeHidden({ timeout: 7500 });
  });

  test("cursor y foco a la vez: salir solo con el cursor no lo reanuda", async ({ page }) => {
    test.setTimeout(60_000);
    const aviso = await agregarDesdeTarjeta(page);
    await aviso.hover();
    await aviso.getByRole("button", { name: "Ver pedido" }).focus();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(8000);
    await expect(aviso, "sigue pausado por el foco").toBeVisible();
  });

  test("sin cursor ni foco se cierra a los ≈ 6 s", async ({ page }) => {
    test.setTimeout(30_000);
    const aviso = await agregarDesdeTarjeta(page);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(4500);
    await expect(aviso).toBeVisible();
    await expect(aviso).toBeHidden({ timeout: 3500 });
  });

  test("con el cajón abierto: «Deshacer» del aviso se pausa con el cursor, se pulsa sin cerrar el cajón y devuelve la línea", async ({ page }) => {
    test.setTimeout(60_000);
    const { aviso, cajon } = await quitarEnCajon(page);
    await aviso.hover();
    await page.waitForTimeout(8000);
    await expect(aviso).toBeVisible();
    await aviso.getByRole("button", { name: "Deshacer" }).click();
    await expect(aviso).toBeHidden();
    await expect(cajon).toBeVisible();
    await expect(cajon.getByRole("button", { name: /^Quitar Café Casa Martínez, 250 g/ })).toBeVisible();
  });
});

// =====================================================================================================================
// QA-018 · JS inicial y «Agregar» de las tarjetas (5bbf1f8)
// =====================================================================================================================
test.describe("QA-018 · JS inicial de inicio", () => {
  test("JS que descarga Chromium al cargar / (hasta networkidle), gzip -9: ≤ 150 KiB; el polyfill noModule no se descarga", async ({ page }) => {
    const { gzipSync } = await import("node:zlib");
    const cuerpos: Promise<[string, number]>[] = [];
    page.on("response", (r) => {
      if (r.request().resourceType() === "script") cuerpos.push(r.body().then((b) => [r.url(), gzipSync(b, { level: 9 }).length] as [string, number]));
    });
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const js = await Promise.all(cuerpos);
    const total = js.reduce((a, [, n]) => a + n, 0);
    const nomodule = await page.evaluate(() => [...document.querySelectorAll("script[nomodule]")].map((s) => (s as HTMLScriptElement).src));
    test.info().annotations.push({ type: "js", description: JSON.stringify({ total, kib: +(total / 1024).toFixed(1), scripts: js.map(([u, n]) => `${u.replace(/^https?:\/\/[^/]+/, "")} ${n}`) }) });
    for (const src of nomodule) expect(js.map(([u]) => u), "noModule no se descarga").not.toContain(src);
    expect(total, `JS inicial ${total} B = ${(total / 1024).toFixed(1)} KiB`).toBeLessThanOrEqual(150 * 1024);
  });
});

test.describe("«Agregar» de las tarjetas (tarjetas renderizadas en servidor, 5bbf1f8)", () => {
  for (const ruta of ["/", "/cafes/", "/provincias/soto/"])
    test(`${ruta}: «Agregar» agrega el primer tamaño disponible en grano, avisa y fusiona al repetir`, async ({ page }) => {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      const boton = page.getByRole("button", { name: "Agregar Café Arreboles, 250 g, al pedido", exact: true });
      await expect(boton).toHaveCount(1);
      await boton.click();
      await expect(page.locator("[data-aviso]")).toContainText("Agregaste Café Arreboles: 250 g, grano.");
      await expect(page.locator("#boton-pedido")).toContainText("1");
      await boton.click();
      await expect(page.locator("#boton-pedido")).toContainText("2");
      const lineas = await page.evaluate(() => JSON.parse(localStorage.getItem("desantander.carrito.v2") ?? "{}").lineas);
      expect(lineas).toEqual([{ cafeSlug: "cafe-arreboles", gramos: 250, molienda: "grano", cantidad: 2 }]);
      // La tarjeta sigue enlazando a su ficha (enlace extendido) y el botón no navega.
      expect(page.url()).not.toContain("/cafes/cafe-arreboles/");
    });

  test("el HTML estático trae las tarjetas completas (nombre, precio, botón) en / y /cafes/", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    for (const ruta of ["/", "/cafes/"]) {
      await page.goto(ruta);
      const tarjetas = page.locator("#catalogo li article");
      await expect(tarjetas).toHaveCount(2);
      await expect(page.getByRole("link", { name: "Café Arreboles" })).toHaveAttribute("href", "/cafes/cafe-arreboles/");
      await expect(page.getByRole("button", { name: /^Agregar Café Arreboles/ })).toHaveCount(1);
      await expect(tarjetas.first()).toContainText("$");
    }
    await ctx.close();
  });
});

// =====================================================================================================================
// Leyenda «Promociones (opcional)» (8072c37)
// =====================================================================================================================
test.describe("Leyenda «Promociones (opcional)»", () => {
  for (const ancho of [360, 1280])
    test(`overline ink-muted, mismo estilo que «Tamaño» de la ficha, contraste ≥ 4,5:1 en claro y oscuro (${ancho} px)`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto("/cafes/cafe-casa-martinez/");
      const ref = await page.locator("legend", { hasText: "Tamaño" }).evaluate((e) => {
        const c = getComputedStyle(e);
        return { tt: c.textTransform, fw: c.fontWeight, fs: c.fontSize, ls: c.letterSpacing, color: c.color, ff: c.fontFamily };
      });
      await alResumen(page);
      const leyenda = page.getByTestId("leyenda-promociones");
      await expect(leyenda).toHaveText("Promociones (opcional)");
      const m = await leyenda.evaluate((e) => {
        const c = getComputedStyle(e);
        return { tt: c.textTransform, fw: c.fontWeight, fs: c.fontSize, ls: c.letterSpacing, color: c.color, ff: c.fontFamily };
      });
      expect(m).toEqual(ref);
      for (const t of ["light", "dark"] as const) {
        await tema(page, t);
        const c = await contraste(page, '[data-testid="leyenda-promociones"]');
        test.info().annotations.push({ type: `contraste-${t}`, description: JSON.stringify(c) });
        expect(c.ratio, t).toBeGreaterThanOrEqual(4.5);
      }
    });
});

// =====================================================================================================================
// Píldoras de tamaño agotadas (bbd2923), con E2E_AGOTADO_URL
// =====================================================================================================================
test.describe("Ficha con tamaños agotados (copia con CSV temporal)", () => {
  for (const ancho of [360, 1280])
    test(`píldoras punteadas sin opacidad, «Agotado» ≥ 4,5:1, ninguna marcada si todo está agotado, la primera disponible si no (${ancho} px)`, async ({ page }) => {
      const base = process.env.E2E_AGOTADO_URL;
      test.skip(!base, "sin E2E_AGOTADO_URL");
      await page.setViewportSize({ width: ancho, height: 800 });
      for (const slug of ["cafe-arreboles", "cafe-casa-martinez"]) {
        await page.goto(`${base}/cafes/${slug}/`);
        await page.waitForLoadState("networkidle");
        const form = page.locator("main article form").first();
        const radios = form.locator('input[name="gramos"]');
        const estado = await radios.evaluateAll((els) => els.map((e) => ({ v: (e as HTMLInputElement).value, dis: (e as HTMLInputElement).disabled, chk: (e as HTMLInputElement).checked })));
        test.info().annotations.push({ type: `${slug}-${ancho}`, description: JSON.stringify(estado) });
        expect(estado.some((e) => e.dis), `${slug} tiene algún tamaño agotado en la copia`).toBe(true);
        const primeraDisponible = estado.find((e) => !e.dis);
        expect(estado.filter((e) => e.chk).map((e) => e.v), slug).toEqual(primeraDisponible ? [primeraDisponible.v] : []);
        expect(estado.filter((e) => e.chk && e.dis)).toEqual([]);
        for (const t of ["light", "dark"] as const) {
          await tema(page, t);
          const pildoras = await form.locator('input[name="gramos"]:disabled + span').evaluateAll((spans) =>
            spans.map((s) => {
              const c = getComputedStyle(s);
              const lab = s.parentElement!;
              // Con todo agotado (1ec9f29) la píldora lleva el precio y debajo «Agotado»: se mide el último <small>.
              const small = [...s.querySelectorAll("small")].at(-1)!;
              return { borde: c.borderTopStyle, opLabel: getComputedStyle(lab).opacity, opSpan: c.opacity, opSmall: getComputedStyle(small).opacity, texto: small.textContent };
            }),
          );
          for (const p of pildoras) {
            expect(p).toMatchObject({ borde: "dashed", opLabel: "1", opSpan: "1", opSmall: "1", texto: "Agotado" });
          }
          const c = await contraste(page, 'main article form input[name="gramos"]:disabled + span small:last-of-type');
          test.info().annotations.push({ type: `contraste-${slug}-${t}-${ancho}`, description: JSON.stringify(c) });
          expect(c.ratio, `${slug} ${t}`).toBeGreaterThanOrEqual(4.5);
          expect(await axeSerio(page, t === "dark"), `${slug} ${t} ${ancho}`).toEqual([]);
        }
        await tema(page, "light");
        if (ancho === 360) await form.screenshot({ path: `docs/qa/capturas/2026-11-18-agotado-${slug}-360.png` });
      }
    });
});

// =====================================================================================================================
// axe a 360 y 1.280 px, claro y oscuro, en las páginas tocadas
// =====================================================================================================================
test.describe("axe · páginas tocadas por la severidad media", () => {
  const casos: { nombre: string; ir: (p: Page) => Promise<void> }[] = [
    { nombre: "inicio con bolsas", ir: async (p) => { await conBolsas(p); await p.goto("/"); } },
    { nombre: "/cafes/", ir: async (p) => { await p.goto("/cafes/"); } },
    { nombre: "ficha", ir: async (p) => { await p.goto("/cafes/cafe-arreboles/"); } },
    { nombre: "provincia", ir: async (p) => { await p.goto("/provincias/guanenta/"); } },
    { nombre: "/envios/", ir: async (p) => { await p.goto("/envios/"); } },
    { nombre: "/pedido/", ir: async (p) => { await conBolsas(p); await p.goto("/pedido/"); } },
    { nombre: "resumen", ir: alResumen },
    {
      nombre: "aviso con acción (pausado)",
      ir: async (p) => {
        await p.goto("/cafes/");
        await p.waitForLoadState("networkidle");
        await p.getByRole("button", { name: "Agregar Café Arreboles, 250 g, al pedido", exact: true }).click();
        await p.locator("[data-aviso]").hover();
      },
    },
  ];
  for (const ancho of [360, 1280])
    for (const c of casos)
      test(`${c.nombre} a ${ancho} px, claro y oscuro: sin violaciones serias ni críticas`, async ({ page }) => {
        await page.setViewportSize({ width: ancho, height: 800 });
        await c.ir(page);
        await page.waitForLoadState("networkidle");
        expect(await axeSerio(page), `claro`).toEqual([]);
        await tema(page, "dark");
        expect(await axeSerio(page, true), `oscuro`).toEqual([]);
      });
});
