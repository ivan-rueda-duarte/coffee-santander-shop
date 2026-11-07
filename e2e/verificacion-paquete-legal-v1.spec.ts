import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

// Ronda de verificación QA 2026-11-06 (docs/qa/2026-11-06-paquete-legal-v1.md): QA-006, QA-007, QA-008,
// LEG-104, /envios/ (diseño #12 y #13) y regresiones del cambio de estilo 37ae67c (pie, ficha, totales,
// aviso de retracto, tarjeta). Pruebas independientes de las del desarrollador.

const VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 360, height: 740 },
  { width: 1440, height: 900 },
];

const graves = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);

const sinDesborde = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

/** Contraste WCAG entre el color del texto y el primer fondo opaco de sus ancestros. */
function contraste(loc: Locator) {
  return loc.evaluate((el) => {
    const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const texto = rgb(getComputedStyle(el).color);
    let nodo: Element | null = el;
    let fondo = [255, 255, 255];
    while (nodo) {
      const c = rgb(getComputedStyle(nodo).backgroundColor);
      if (c.length >= 3 && (c.length === 3 || c[3] > 0.99)) {
        fondo = c.slice(0, 3);
        break;
      }
      nodo = nodo.parentElement;
    }
    const [a, b] = [lum(texto.slice(0, 3)), lum(fondo)].sort((x, y) => y - x);
    return { ratio: (a + 0.05) / (b + 0.05), texto: getComputedStyle(el).color, fondo: `rgb(${fondo.join(", ")})` };
  });
}

type Linea = { cafeSlug: string; gramos: number; molienda: "grano" | "molido"; cantidad: number };

async function irAlResumen(page: Page, departamento: string, municipio: string, lineas: Linea[] = [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 2 }]) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate((l) => localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: l })), lineas);
  await page.goto("/pedido/?paso=envio");
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByLabel("Departamento").selectOption(departamento);
  await page.getByLabel("Municipio").selectOption(municipio);
  await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
  await page.getByRole("radio", { name: "Transferencia Bre-B" }).check({ force: true });
  await page.getByRole("button", { name: /Revisar el pedido/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

const AYUDA_DOS = "Para preparar tu pedido, marca las dos casillas: la autorización de tus datos y los términos y condiciones.";
const AYUDA_DATOS = "Para preparar tu pedido, falta que autorices el tratamiento de tus datos.";
const AYUDA_TERMINOS = "Para preparar tu pedido, falta que aceptes los términos y condiciones.";
const ERROR_DATOS = "Debes autorizar el tratamiento de tus datos para continuar.";
const ERROR_TERMINOS = "Debes aceptar los términos para continuar.";

/** Pulsa Tab hasta que el foco llegue al botón (máximo 15 pulsaciones) y devuelve cuántas hicieron falta. */
async function tabHastaBoton(page: Page, boton: Locator) {
  for (let i = 1; i <= 15; i++) {
    await page.keyboard.press("Tab");
    if (await boton.evaluate((b) => b === document.activeElement)) return i;
  }
  return -1;
}

const enlacePedido = (page: Page) => page.locator('a[href*="wa.me/"][href*="text="]');

// ---------------------------------------------------------------------------------------------------------
// QA-006
// ---------------------------------------------------------------------------------------------------------

test.describe("QA-006 verificación: botón con aria-disabled, microayuda y errores (microcopy §5.9 v1.1)", () => {
  test("con 0 casillas: Tab llega al botón, Espacio no avanza, errores exactos, aria-invalid y foco a la primera", async ({ page }) => {
    await irAlResumen(page, "Santander", "Bucaramanga");
    const boton = page.getByRole("button", { name: "Preparar pedido para WhatsApp" });
    const aut = page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ });
    const ter = page.getByRole("checkbox", { name: /acepto los Términos y condiciones/ });
    await expect(boton).not.toHaveAttribute("disabled", /.*/);
    await expect(boton).toHaveAttribute("aria-disabled", "true");
    await expect(boton).toHaveAccessibleDescription(AYUDA_DOS);
    await expect(page.getByTestId("ayuda-preparar")).toHaveText(AYUDA_DOS);
    await expect(page.getByTestId("ayuda-preparar")).toBeVisible();
    // Antes de pulsar no hay errores ni aria-invalid.
    await expect(page.getByText(ERROR_DATOS)).toHaveCount(0);
    await expect(page.getByText(ERROR_TERMINOS)).toHaveCount(0);
    await expect(aut).not.toHaveAttribute("aria-invalid", /.*/);

    // Teclado real: desde la casilla de términos, Tab llega al botón.
    await ter.focus();
    expect(await tabHastaBoton(page, boton), "Tab no llega al botón").toBeGreaterThan(0);
    await page.keyboard.press("Space");
    await expect(aut).toBeFocused();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    await expect(enlacePedido(page)).toHaveCount(0);
    await expect(aut).not.toBeChecked();
    await expect(ter).not.toBeChecked();
    await expect(page.getByRole("alert").filter({ hasText: ERROR_DATOS })).toHaveText(ERROR_DATOS);
    await expect(page.getByRole("alert").filter({ hasText: ERROR_TERMINOS })).toHaveText(ERROR_TERMINOS);
    await expect(aut).toHaveAttribute("aria-invalid", "true");
    await expect(ter).toHaveAttribute("aria-invalid", "true");
    await expect(aut).toHaveAccessibleDescription(ERROR_DATOS);
    await expect(ter).toHaveAccessibleDescription(ERROR_TERMINOS);
    expect(await graves(page)).toEqual([]);
    expect(page.url()).not.toContain("wa.me");
  });

  test("con 1 casilla (solo datos): microayuda de términos, al pulsar solo el error de términos y foco en términos", async ({ page }) => {
    await irAlResumen(page, "Santander", "Bucaramanga");
    const boton = page.getByRole("button", { name: "Preparar pedido para WhatsApp" });
    const aut = page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ });
    const ter = page.getByRole("checkbox", { name: /acepto los Términos y condiciones/ });
    await aut.check();
    await expect(page.getByTestId("ayuda-preparar")).toHaveText(AYUDA_TERMINOS);
    await expect(boton).toHaveAccessibleDescription(AYUDA_TERMINOS);
    await boton.focus();
    await page.keyboard.press("Enter");
    await expect(ter).toBeFocused();
    await expect(page.getByText(ERROR_TERMINOS, { exact: true })).toBeVisible();
    await expect(page.getByText(ERROR_DATOS)).toHaveCount(0);
    await expect(ter).toHaveAttribute("aria-invalid", "true");
    await expect(aut).not.toHaveAttribute("aria-invalid", /.*/);
    await expect(aut).toBeChecked();
    await expect(ter).not.toBeChecked();
    await expect(enlacePedido(page)).toHaveCount(0);
    // Al marcarla, su error desaparece.
    await page.keyboard.press("Space");
    await expect(ter).toBeChecked();
    await expect(page.getByText(ERROR_TERMINOS)).toHaveCount(0);
    await expect(ter).not.toHaveAttribute("aria-invalid", /.*/);
    await expect(page.getByTestId("ayuda-preparar")).toHaveCount(0);
  });

  test("con 1 casilla (solo términos): microayuda de datos, al pulsar solo el error de datos y foco en datos", async ({ page }) => {
    await irAlResumen(page, "Santander", "Bucaramanga");
    const boton = page.getByRole("button", { name: "Preparar pedido para WhatsApp" });
    const aut = page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ });
    const ter = page.getByRole("checkbox", { name: /acepto los Términos y condiciones/ });
    await ter.check();
    await expect(page.getByTestId("ayuda-preparar")).toHaveText(AYUDA_DATOS);
    // Clic real de ratón en el centro del botón (Playwright trata aria-disabled como deshabilitado y no haría clic).
    const caja = (await boton.boundingBox())!;
    await page.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await expect(aut).toBeFocused();
    await expect(page.getByText(ERROR_DATOS, { exact: true })).toBeVisible();
    await expect(page.getByText(ERROR_TERMINOS)).toHaveCount(0);
    await expect(aut).toHaveAttribute("aria-invalid", "true");
    await expect(ter).not.toHaveAttribute("aria-invalid", /.*/);
    await expect(enlacePedido(page)).toHaveCount(0);
    await expect(aut).not.toBeChecked();
  });

  for (const vp of VIEWPORTS) {
    test(`a ${vp.width} px: contraste ≥ 4,5:1 del botón aria-disabled y de la microayuda; axe sin serias con errores visibles`, async ({ page }) => {
      await page.setViewportSize(vp);
      await irAlResumen(page, "Santander", "Bucaramanga");
      const boton = page.getByRole("button", { name: "Preparar pedido para WhatsApp" });
      const cb = await contraste(boton);
      expect(cb.ratio, `botón ${cb.texto} sobre ${cb.fondo}`).toBeGreaterThanOrEqual(4.5);
      const ca = await contraste(page.getByTestId("ayuda-preparar"));
      expect(ca.ratio, `microayuda ${ca.texto} sobre ${ca.fondo}`).toBeGreaterThanOrEqual(4.5);
      expect(await graves(page)).toEqual([]);
      await boton.click({ force: true });
      for (const t of [ERROR_DATOS, ERROR_TERMINOS]) {
        const ce = await contraste(page.getByText(t, { exact: true }));
        expect(ce.ratio, `error ${ce.texto} sobre ${ce.fondo}`).toBeGreaterThanOrEqual(4.5);
      }
      expect(await graves(page)).toEqual([]);
      expect(await sinDesborde(page)).toBe(true);
      if (vp.width === 360) {
        await boton.evaluate((b) => b.scrollIntoView({ block: "end" }));
        await page.screenshot({ path: "docs/qa/capturas/boton-aria-disabled-360.png" });
      }
    });
  }
});

// ---------------------------------------------------------------------------------------------------------
// QA-007
// ---------------------------------------------------------------------------------------------------------

const LEGALES = ["/legal/terminos/", "/legal/privacidad/", "/legal/envios-devoluciones/", "/legal/vendedor/"];

test.describe("QA-007 verificación: páginas legales", () => {
  for (const vp of [{ width: 320, height: 740 }, { width: 360, height: 740 }]) {
    test(`a ${vp.width} px: ningún elemento más ancho que la ventana en las cuatro páginas`, async ({ page }) => {
      await page.setViewportSize(vp);
      for (const ruta of LEGALES) {
        await page.goto(ruta);
        expect(await sinDesborde(page), ruta).toBe(true);
        const anchos = await page.evaluate(() =>
          [...document.querySelectorAll("main *")]
            .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 0.5)
            .map((e) => `${e.tagName}.${e.className}`.slice(0, 80)),
        );
        expect(anchos, ruta).toEqual([]);
      }
      if (vp.width === 320) {
        await page.goto("/legal/privacidad/");
        await page.screenshot({ path: "docs/qa/capturas/legal-privacidad-320.png", fullPage: true });
      }
    });
  }

  test("a 1440 px: columna de lectura de 68ch (≤ 70 caracteres por línea)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const ruta of LEGALES.slice(0, 3)) {
      await page.goto(ruta);
      const m = await page.locator("article .body-l").evaluate((el) => {
        const s = getComputedStyle(el);
        const sonda = document.createElement("span");
        sonda.style.font = s.font;
        sonda.style.position = "absolute";
        sonda.textContent = "0".repeat(68);
        document.body.appendChild(sonda);
        const ch68 = sonda.getBoundingClientRect().width;
        sonda.remove();
        return { ancho: el.getBoundingClientRect().width, ch68, maxWidth: s.maxWidth };
      });
      expect(m.ancho, `${ruta} ${JSON.stringify(m)}`).toBeLessThanOrEqual(m.ch68 + 1);
      expect(m.ancho, `${ruta} ${JSON.stringify(m)}`).toBeGreaterThan(m.ch68 * 0.9);
    }
    await page.goto("/legal/terminos/");
    await page.screenshot({ path: "docs/qa/capturas/legal-terminos-1440.png" });
  });

  for (const vp of [{ width: 360, height: 740 }, { width: 1440, height: 900 }]) {
    test(`a ${vp.width} px: índice de anclas completo; el salto deja el título bajo el encabezado fijo y el foco sigue desde ahí`, async ({ page }) => {
      await page.setViewportSize(vp);
      for (const ruta of LEGALES.slice(0, 3)) {
        await page.goto(ruta);
        const indice = page.getByRole("navigation", { name: "En este documento" });
        await expect(indice).toBeVisible();
        const titulos = await page.locator("article .body-l h2").evaluateAll((hs) => hs.map((h) => ({ id: h.id, texto: h.textContent })));
        const enlaces = await indice.getByRole("link").evaluateAll((as) => as.map((a) => ({ href: a.getAttribute("href"), texto: a.textContent })));
        expect(titulos.length).toBeGreaterThan(5);
        expect(enlaces).toEqual(titulos.map((t) => ({ href: `#${t.id}`, texto: t.texto })));
        expect(new Set(titulos.map((t) => t.id)).size, "ids repetidos").toBe(titulos.length);
        for (const t of titulos) expect(t.id, t.texto ?? "").toMatch(/^[a-z0-9-]+$/);

        // Uno del medio y el último, con teclado.
        for (const i of [Math.floor(titulos.length / 2), titulos.length - 1]) {
          await page.goto(ruta);
          const enlace = indice.getByRole("link").nth(i);
          await enlace.focus();
          await page.keyboard.press("Enter");
          await expect(page).toHaveURL(new RegExp(`#${titulos[i].id}$`));
          await page.waitForTimeout(300);
          const pos = await page.evaluate((id) => {
            const h = document.getElementById(id)!.getBoundingClientRect();
            const enc = document.querySelector("header")!.getBoundingClientRect();
            return { top: h.top, bottom: h.bottom, encabezado: enc.bottom, alto: window.innerHeight, alFinal: Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 1 };
          }, titulos[i].id);
          expect(pos.top, `${ruta} #${titulos[i].id} ${JSON.stringify(pos)}`).toBeGreaterThanOrEqual(pos.encabezado - 0.5);
          expect(pos.bottom, `${ruta} #${titulos[i].id} ${JSON.stringify(pos)}`).toBeLessThanOrEqual(pos.alto);
          // Si no está al final de la página, el título queda cerca del borde del encabezado (no a media pantalla).
          if (!pos.alFinal) expect(pos.top - pos.encabezado, `${ruta} #${titulos[i].id}`).toBeLessThan(80);
          // Punto de partida del foco: el siguiente Tab cae después del título, no vuelve al índice.
          await page.keyboard.press("Tab");
          const despues = await page.evaluate((id) => {
            const h = document.getElementById(id)!;
            const a = document.activeElement;
            return Boolean(a && a !== document.body && h.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING);
          }, titulos[i].id);
          expect(despues, `${ruta}: Tab después del salto a #${titulos[i].id} no sigue desde el título`).toBe(true);
        }
      }
    });
  }

  test("/legal/vendedor/ (2 títulos) no lleva índice", async ({ page }) => {
    await page.goto("/legal/vendedor/");
    await expect(page.getByTestId("indice-legal")).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------------------------------------
// QA-008 y LEG-104
// ---------------------------------------------------------------------------------------------------------

function archivosHtml(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? archivosHtml(p) : p.endsWith(".html") || p.endsWith(".txt") ? [p] : [];
  });
}

test("QA-008 verificación: paso 3 exacto y ningún «bre-b» en minúscula en out/", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/^Despachamos desde .+ Pagas con /)).toHaveText(
    "Despachamos desde Bucaramanga a todo Colombia. Ves el envío en tu carrito; si hay que cotizarlo, te lo confirmamos antes de que pagues. Pagas con efectivo contraentrega o transferencia Bre-B.",
  );
  // Texto visible de todas las páginas generadas (los ids de ancla como «#11-si-pagaste-por-bre-b…» son slugs, no texto).
  const rutas = archivosHtml("out").filter((f) => f.endsWith("index.html")).map((f) => f.slice(3, -"index.html".length) || "/");
  const malos: string[] = [];
  for (const r of rutas) {
    await page.goto(r);
    const t = await page.locator("body").innerText();
    const meta = await page.evaluate(() => [...document.querySelectorAll("meta[content], [alt], [aria-label], [title]")].map((e) => e.getAttribute("content") ?? e.getAttribute("alt") ?? e.getAttribute("aria-label") ?? e.getAttribute("title")).join(" "));
    if (/bre-b/.test(`${t} ${meta}`)) malos.push(r);
  }
  expect(rutas.length).toBeGreaterThan(10);
  expect(malos).toEqual([]);
});

test("LEG-104 verificación: foto de la Historia con alt neutro exacto y sin figcaption", async ({ page }) => {
  await page.goto("/");
  const foto = page.locator('img[src*="cafetal-montana"]');
  await expect(foto).toHaveCount(1);
  await expect(foto).toHaveAttribute("alt", "Montañas verdes con cultivos en ladera, un camino de tierra y nubes bajas.");
  const figura = foto.locator("xpath=ancestor::figure[1]");
  await expect(figura.locator("figcaption")).toHaveCount(0);
  // «montañas de Santander» sigue en el h1 de inicio (texto de portada, no de la foto): solo se exige que no esté en el alt ni en un crédito.
  const malos = archivosHtml("out").filter((f) => /niebla de la mañana|Cafetal entre montañas/i.test(readFileSync(f, "utf8")));
  expect(malos).toEqual([]);
  await expect(page.locator(".ds-photo__caption")).toHaveCount(0);
});

// ---------------------------------------------------------------------------------------------------------
// /envios/ (diseño #12 y #13)
// ---------------------------------------------------------------------------------------------------------

test.describe("/envios/ verificación: aclaraciones en small y columna Zona sin corte", () => {
  for (const vp of VIEWPORTS) {
    test(`a ${vp.width} px`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/envios/");
      for (const id of ["leyenda-iva", "comision-incluida"]) {
        const el = page.getByTestId(id);
        await expect(el).toHaveClass(/\bsmall\b/);
        await expect(el).toHaveCSS("font-size", "14px");
        await expect(el).toHaveCSS("line-height", "22px");
        const c = await contraste(el);
        expect(c.ratio, id).toBeGreaterThanOrEqual(4.5);
      }
      const zonas = await page.locator('tr[data-testid^="tarifa-"] > th').evaluateAll((ths) =>
        ths.map((th) => {
          const r = document.createRange();
          r.selectNodeContents(th);
          const lineas = new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size;
          return { texto: th.textContent, lineas, ws: getComputedStyle(th).whiteSpace };
        }),
      );
      expect(zonas.length).toBeGreaterThan(0);
      for (const z of zonas) {
        expect(z.lineas, `${z.texto}`).toBe(1);
        expect(z.ws).toBe("nowrap");
      }
      expect(await sinDesborde(page)).toBe(true);
      expect(await graves(page)).toEqual([]);
      if (vp.width === 320) {
        await page.locator("table").first().scrollIntoViewIfNeeded();
        await page.screenshot({ path: "docs/qa/capturas/envios-tabla-320.png" });
      }
    });
  }
});

// ---------------------------------------------------------------------------------------------------------
// Regresiones del cambio de estilo 37ae67c
// ---------------------------------------------------------------------------------------------------------

test.describe("regresión del estilo 37ae67c", () => {
  for (const vp of VIEWPORTS) {
    test(`a ${vp.width} px: ficha técnica apilada bajo sm y a dos columnas desde sm`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/cafes/cafe-casa-martinez/");
      const filas = await page.locator("#ficha-tecnica + dl > div").evaluateAll((ds) =>
        ds.map((d) => {
          const dt = d.querySelector("dt")!.getBoundingClientRect();
          const dd = d.querySelector("dd")!.getBoundingClientRect();
          return { k: d.querySelector("dt")!.textContent, apilada: dd.top >= dt.bottom - 1, mismaFila: Math.abs(dd.top - dt.top) < 2 };
        }),
      );
      for (const f of filas) {
        if (vp.width < 640) expect(f.apilada, `${f.k}`).toBe(true);
        else expect(f.mismaFila, `${f.k}`).toBe(true);
      }
      expect(await sinDesborde(page)).toBe(true);
      expect(await graves(page)).toEqual([]);
      // Leyenda de IVA a 4 px del precio y alineada a la derecha.
      await expect(page.getByTestId("leyenda-iva")).toHaveCSS("text-align", "right");
      await expect(page.getByTestId("leyenda-iva")).toHaveCSS("margin-top", "4px");
      if (vp.width !== 1440) {
        await page.locator("#ficha-tecnica").scrollIntoViewIfNeeded();
        await page.locator("#ficha-tecnica").locator("xpath=..").screenshot({ path: `docs/qa/capturas/ficha-tecnica-${vp.width}.png` });
      }
    });

    test(`a ${vp.width} px: pie con enlaces legales de ≥ 28 px de alto, filete, sin desborde y axe`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/");
      const altos = await page.locator("footer a[href*='/legal/']").evaluateAll((as) => as.map((a) => a.getBoundingClientRect().height));
      expect(altos).toHaveLength(4);
      for (const h of altos) expect(h).toBeGreaterThanOrEqual(28);
      await expect(page.getByTestId("pie-vendedor")).toHaveCSS("border-top-width", "1px");
      await page.locator("footer").scrollIntoViewIfNeeded();
      expect(await sinDesborde(page)).toBe(true);
      expect(await graves(page)).toEqual([]);
      const fuera = await page.evaluate(() => [...document.querySelectorAll("footer *")].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 0.5).map((e) => e.tagName));
      expect(fuera).toEqual([]);
      if (vp.width === 320) await page.locator("footer").screenshot({ path: "docs/qa/capturas/pie-vendedor-320.png" });
    });

    test(`a ${vp.width} px: línea «por cotizar» (Leticia) apilada en celular y a dos columnas desde sm; aviso de retracto en small y tinta`, async ({ page }) => {
      await page.setViewportSize(vp);
      await irAlResumen(page, "Amazonas", "Leticia");
      const fila = page.locator("main").getByTestId("linea-envio");
      await expect(fila).toHaveCSS("flex-direction", vp.width < 640 ? "column" : "row");
      const dd = fila.locator("dd");
      await expect(dd).toHaveText("Por cotizar · te confirmamos el valor por WhatsApp antes de que pagues");
      await expect(dd).toHaveCSS("text-align", vp.width < 640 ? "start" : "right");
      const g = await fila.evaluate((f) => {
        const r = f.getBoundingClientRect();
        const d = f.querySelector("dd")!.getBoundingClientRect();
        const t = f.querySelector("dt")!.getBoundingClientRect();
        return { fila: r.width, dd: d.width, ddLeft: d.left, filaLeft: r.left, apilada: d.top >= t.bottom - 1 };
      });
      if (vp.width < 640) {
        expect(g.apilada).toBe(true);
        expect(Math.abs(g.ddLeft - g.filaLeft)).toBeLessThan(1);
      }
      const aviso = page.getByTestId("aviso-retracto");
      await expect(aviso).toHaveCSS("font-size", "14px");
      const ca = await contraste(aviso);
      expect(ca.ratio).toBeGreaterThanOrEqual(7);
      const cp = await contraste(page.locator("main").getByTestId("linea-plazo"));
      expect(cp.ratio).toBeGreaterThanOrEqual(4.5);
      expect(await sinDesborde(page)).toBe(true);
      if (vp.width === 360) {
        await fila.scrollIntoViewIfNeeded();
        await fila.locator("xpath=ancestor::dl[1]").screenshot({ path: "docs/qa/capturas/linea-por-cotizar-360.png" });
        await aviso.scrollIntoViewIfNeeded();
        await aviso.screenshot({ path: "docs/qa/capturas/aviso-retracto-360.png" });
      }
    });

    test(`a ${vp.width} px: tarjeta con una marca larga sin desborde ni violaciones serias`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/cafes/");
      const tarjeta = page.locator("article.ds-card").first();
      await expect(tarjeta).toBeVisible();
      // La columna `marca` está vacía en data/catalogo.csv: se inyecta una fila como la que pinta tarjeta-cafe.tsx.
      await tarjeta.locator(".ds-card__meta").evaluate((dl) => {
        const div = document.createElement("div");
        div.innerHTML = "<dt>Marca</dt><dd>Tostadores Asociados del Cañón del Chicamocha y la Mesa de Los Santos®</dd>";
        dl.prepend(div);
        const div2 = document.createElement("div");
        div2.innerHTML = "<dt>Marca</dt><dd>CAFÉ_ESPECIAL_FINCA_LASPALMASDELSUAREZ_LOTE0001</dd>";
        dl.prepend(div2);
      });
      const fuera = await tarjeta.evaluate((t) => {
        const r = t.getBoundingClientRect();
        return [...t.querySelectorAll("dd")].filter((d) => d.scrollWidth > d.clientWidth + 1 || d.getBoundingClientRect().right > r.right + 0.5).map((d) => d.textContent);
      });
      expect(fuera).toEqual([]);
      expect(await sinDesborde(page)).toBe(true);
      expect(await graves(page)).toEqual([]);
      if (vp.width === 320) {
        await tarjeta.scrollIntoViewIfNeeded();
        await tarjeta.screenshot({ path: "docs/qa/capturas/tarjeta-marca-larga-320.png" });
      }
    });
  }

  test("a 320 px: ficha con titular y fabricante largos (inyectados) sin desborde", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto("/cafes/cafe-casa-martinez/");
    await page.locator("#ficha-tecnica + dl").evaluate((dl) => {
      const div = document.createElement("div");
      div.className = dl.querySelector("div")!.className;
      div.innerHTML = `<dt class="${dl.querySelector("dt")!.className}">Fabricante</dt><dd class="${dl.querySelector("dd")!.className}">FABRICADO POR: TOSTADORAINDUSTRIALDELORIENTECOLOMBIANOSAS NIT 900.000.000-0, Kilómetro 7 vía Girón</dd>`;
      dl.append(div);
    });
    expect(await sinDesborde(page)).toBe(true);
    const fuera = await page.evaluate(() => [...document.querySelectorAll("#ficha-tecnica + dl dd")].filter((d) => d.scrollWidth > d.clientWidth + 1).map((d) => d.textContent));
    expect(fuera).toEqual([]);
  });
});
