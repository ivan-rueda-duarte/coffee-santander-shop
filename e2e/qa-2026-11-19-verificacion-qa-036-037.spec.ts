import { expect, test, type Browser, type Page } from "@playwright/test";

// Ronda QA 2026-11-19 (ronda 3 de docs/qa/2026-11-19-verificacion-qa-031-032.md): verificación de QA-037 (01d517e, la
// interacción adopta los pines y rótulos de la capa del HTML en lugar de reemplazarla) y de QA-036 (e4aede7, un rótulo
// oculto conserva la posición de su sitio central). Riesgo señalado por el desarrollador: la interacción manipula DOM que
// React hidrató (estilos, clases, display:none y pines sacados del documento). Estas pruebas buscan sus efectos.
// Variables opcionales:
// - E2E_MAIN_URL: build de main (a32e00d), para comparar la precarga de las fichas.

const MAPA = "#mapa [data-mapa-interactivo][style*='aspect-ratio']";
const MARCA_INTERACCION = "Ver todo Santander"; // texto que solo vive en el trozo de la interacción
const CM = "Ver la ficha de Café Casa Martínez, Pinchote";
const AR = "Ver la ficha de Café Arreboles, Tona";

const capaFija = (page: Page) => page.locator("#mapa-provincias .mapa-capa");
const enfocado = (page: Page) =>
  page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.tagName ?? "");

async function esperarInteraccion(page: Page) {
  await expect(capaFija(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#mapa .mapa-pin").first()).toBeVisible();
}

async function prepararMapa(page: Page, ancho: number, alto: number) {
  await page.setViewportSize({ width: ancho, height: alto });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator(MAPA).scrollIntoViewIfNeeded();
  await page.mouse.move(2, 2);
  await esperarInteraccion(page);
}

/** Red lenta de verdad (DevTools): latencia y ancho de banda de un 3G lento, sin `page.route`. */
async function redLenta(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 400, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8 });
  return cdp;
}

/** Errores de React, de hidratación o de DOM que la consola y la página reporten. */
function vigilarErrores(page: Page) {
  const errores: string[] = [];
  page.on("pageerror", (e) => errores.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" || (m.type() === "warning" && /hydrat|React|removeChild|insertBefore/i.test(m.text()))) errores.push(`${m.type()}: ${m.text()}`);
  });
  return errores;
}

/** Pines y rótulos en el documento: cuántos hay, cuántos se ven y cuántos expone el árbol de accesibilidad. */
async function inventario(page: Page) {
  return page.evaluate((sel) => {
    const m = document.querySelector(sel)!;
    const vivo = (e: Element) => {
      const s = getComputedStyle(e);
      return s.display !== "none" && s.visibility === "visible";
    };
    const pines = [...m.querySelectorAll<HTMLAnchorElement>("a.mapa-pin")];
    const rotulos = [...m.querySelectorAll<HTMLElement>(".mapa-rotulo")];
    const marcas = [...m.querySelectorAll<HTMLElement>(".mapa-marca")];
    const escalas = [...m.querySelectorAll<HTMLElement>(".mapa-escala")];
    const contar = (xs: string[]) => xs.reduce<Record<string, number>>((a, x) => ((a[x] = (a[x] ?? 0) + 1), a), {});
    return {
      pines: contar(pines.map((a) => a.getAttribute("aria-label") ?? "")),
      pinesVivos: contar(pines.filter(vivo).map((a) => a.getAttribute("aria-label") ?? "")),
      rotulos: contar(rotulos.map((e) => e.firstChild?.textContent ?? "")),
      rotulosSinAriaHidden: rotulos.filter((e) => e.getAttribute("aria-hidden") !== "true").length,
      marcasSinAriaHidden: marcas.filter((e) => e.getAttribute("aria-hidden") !== "true").length,
      escalasVivas: escalas.filter(vivo).length,
    };
  }, MAPA);
}

async function nuevaPagina(browser: Browser, { js = true, ancho = 1280, alto = 900, base }: { js?: boolean; ancho?: number; alto?: number; base?: string } = {}) {
  const ctx = await browser.newContext({ javaScriptEnabled: js, viewport: { width: ancho, height: alto }, baseURL: base ?? test.info().project.use.baseURL, locale: "es-CO" });
  return { ctx, page: await ctx.newPage() };
}

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
  return orden.filter((n) => /^Provincia de|^Ver la ficha/.test(n));
}

// =====================================================================================================================
// 1. Teclado con red lenta: el foco en un pin cuando llega la interacción
// =====================================================================================================================
// E2E_COMPACTO_URL: build del árbol de HEAD con el nombre de Casa Martínez alargado solo en la copia
// («Café Casa Martínez Reserva Especial del Cañón»), para que el HTML traiga dos variantes de su pin (compacta en los
// tramos 0–11 y a la izquierda en 12–13) y la interacción tenga que escoger cuál adoptar.
const CASOS_LENTA: { nombre: string; base?: string; ancho: number; alto: number; compacto: boolean }[] = [
  { nombre: "HEAD", ancho: 360, alto: 740, compacto: false },
  { nombre: "HEAD", ancho: 1280, alto: 900, compacto: false },
  { nombre: "variante compacta", base: process.env.E2E_COMPACTO_URL, ancho: 360, alto: 740, compacto: true },
];
test.describe("QA-037 con red lenta (3G emulado por DevTools)", () => {
  test.setTimeout(120_000);
  for (const caso of CASOS_LENTA)
    test(`${caso.nombre} a ${caso.ancho} px: Tab hasta el pin de Casa Martínez antes de que llegue la interacción; al llegar, el foco, la forma del pin y el orden siguen`, async ({ browser }) => {
      test.skip(caso.compacto && !caso.base, "Define E2E_COMPACTO_URL con el build de la variante compacta");
      const { ancho, alto } = caso;
      const { ctx, page } = await nuevaPagina(browser, { ancho, alto, base: caso.base });
      const errores = vigilarErrores(page);
      await page.goto("/", { waitUntil: "load", timeout: 60_000 });
      await page.waitForLoadState("networkidle", { timeout: 60_000 });
      const pedidas: string[] = [];
      page.on("request", (r) => {
        if (/\/_next\/static\/chunks\/.+\.js$/.test(r.url())) pedidas.push(r.url());
      });
      await redLenta(page);
      await page.locator("#mapa").getByRole("link", { name: "Ir a los cafés" }).focus();
      for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
      const cm = await enfocado(page);
      expect(cm).toMatch(/^Ver la ficha de Café Casa Martínez/);
      await expect(capaFija(page), "la interacción todavía no llegó").toHaveCount(1);
      const forma = () =>
        page.evaluate(() => {
          const a = document.activeElement as HTMLElement;
          const n = a.querySelector(".mapa-pin__nombre")!.getBoundingClientRect();
          const p = a.querySelector(".mapa-pin__punto")!.getBoundingClientRect();
          const clase = a.classList.contains("mapa-pin--compacto") ? "compacto" : a.classList.contains("mapa-pin--izquierda") ? "izquierda" : "derecha";
          return { clase, lado: n.width <= 1 ? "compacto" : n.left < p.left ? "izquierda" : "derecha", x: Math.round(p.left), y: Math.round(p.top), focoVisible: a.matches(":focus-visible") };
        });
      const antes = await forma();
      // Sin la variante compacta, el pin de Casa Martínez va a la derecha desde 356 px de ventana (a la izquierda por debajo).
      expect(antes.clase).toBe(caso.compacto ? "compacto" : "derecha");
      expect(antes.focoVisible).toBe(true);
      const nodo = await page.evaluateHandle(() => document.activeElement);
      await esperarInteraccion(page);
      expect(pedidas.length, "el Tab pidió trozos por la red lenta").toBeGreaterThan(0);
      await page.waitForTimeout(400);
      expect(await enfocado(page), "el foco sigue en el pin").toBe(cm);
      expect(await page.evaluate((n) => n === document.activeElement, nodo), "es el mismo nodo del HTML").toBe(true);
      const despues = await forma();
      expect(despues.clase).toBe(antes.clase);
      expect(despues.lado).toBe(antes.lado);
      expect(Math.abs(despues.x - antes.x), "el punto no se mueve").toBeLessThanOrEqual(1);
      expect(Math.abs(despues.y - antes.y), "el punto no se mueve").toBeLessThanOrEqual(1);
      expect(despues.focoVisible, "sigue el anillo de foco").toBe(true);
      await page.keyboard.press("Tab");
      expect(await enfocado(page)).toBe(AR);
      await page.keyboard.press("Shift+Tab");
      expect(await enfocado(page)).toBe(cm);
      // Un solo enlace por café en el árbol de accesibilidad (la otra variante queda fuera con display: none).
      expect(await page.locator("#mapa-provincias").getByRole("link").evaluateAll((as) => as.map((a) => a.getAttribute("aria-label")))).toEqual([cm, AR]);
      // Enter abre la ficha con el router (navegación del cliente, sin recargar el documento).
      await page.evaluate(() => ((window as unknown as { __sinRecarga: boolean }).__sinRecarga = true));
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/cafes\/cafe-casa-martinez\/$/, { timeout: 60_000 });
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Casa Martínez", { timeout: 60_000 });
      expect(await page.evaluate(() => (window as unknown as { __sinRecarga?: boolean }).__sinRecarga), "navegación del cliente").toBe(true);
      expect(errores).toEqual([]);
      await ctx.close();
    });
});

// =====================================================================================================================
// 2. Elegir y quitar provincias con el foco en un pin
// =====================================================================================================================
test.describe("QA-037: elegir y quitar provincias con el foco en un pin", () => {
  for (const [ancho, alto] of [
    [360, 740],
    [1280, 900],
  ])
    test(`a ${ancho} px: el pin que sale del encuadre vuelve en el mismo sitio del orden de foco; el que queda conserva el foco`, async ({ page }) => {
      const errores = vigilarErrores(page);
      await prepararMapa(page, ancho, alto);
      const ordenInicial = await ordenDeFoco(page);
      expect(ordenInicial).toEqual(["Provincia de Guanentá, 1 café", "Provincia de Soto Norte, 1 café", CM, AR]);
      const ordenDom = () => page.evaluate((sel) => [...document.querySelectorAll(`${sel} a.mapa-pin`)].map((a) => a.getAttribute("aria-label")), MAPA);
      const domInicial = await ordenDom();
      // El chip se pulsa sin moverle el foco (como un clic que no enfoca), para dejar el foco en el pin.
      const chip = (nombre: string) => page.locator("#catalogo").getByRole("button", { name: new RegExp(`^${nombre}`) }).locator("visible=true").first();

      // a) Foco en Arreboles (Soto Norte) y se elige Soto Norte: Arreboles queda en el encuadre y conserva el foco.
      await page.locator(`a.mapa-pin[aria-label="${AR}"]`).focus();
      await chip("Soto Norte").dispatchEvent("click");
      await expect(page).toHaveURL(/provincia=soto/);
      await page.waitForTimeout(700);
      expect(await enfocado(page), "el pin que sigue en el encuadre no pierde el foco").toBe(AR);
      expect(await ordenDom()).toEqual([AR]);

      // b) Se quita Soto Norte: vuelve Casa Martínez antes de Arreboles, y el foco sigue en Arreboles.
      await chip("Soto Norte").dispatchEvent("click");
      await expect(page).not.toHaveURL(/provincia=/);
      await page.waitForTimeout(700);
      expect(await enfocado(page)).toBe(AR);
      expect(await ordenDom()).toEqual(domInicial);
      await page.keyboard.press("Shift+Tab");
      expect(await enfocado(page), "Shift+Tab desde Arreboles va a Casa Martínez").toBe(CM);

      // c) Con el foco en Casa Martínez se elige Soto Norte: el pin sale del documento. Se anota a dónde va el foco.
      await chip("Soto Norte").dispatchEvent("click");
      await expect(page).toHaveURL(/provincia=soto/);
      await page.waitForTimeout(700);
      const focoAlSalir = await enfocado(page);
      test.info().annotations.push({ type: "foco al salir del encuadre", description: focoAlSalir });
      expect(await page.locator(`a.mapa-pin[aria-label="${CM}"]`).count(), "fuera del encuadre: fuera del documento").toBe(0);
      expect((await page.locator("#mapa").ariaSnapshot()).includes(CM), "y fuera del árbol de accesibilidad").toBe(false);

      // d) Guanentá y Soto Norte, luego «Ver todo Santander»: el orden de foco y del DOM es el inicial, sin duplicados.
      await chip("Guanentá").dispatchEvent("click");
      await expect(page).toHaveURL(/guanenta/);
      await page.waitForTimeout(700);
      expect(await ordenDom()).toEqual(domInicial);
      await page.locator(MAPA).scrollIntoViewIfNeeded();
      await page.getByRole("button", { name: MARCA_INTERACCION }).click();
      await expect(page).not.toHaveURL(/provincia=/);
      await page.waitForTimeout(700);
      expect(await ordenDom()).toEqual(domInicial);
      expect(await ordenDeFoco(page)).toEqual(ordenInicial);
      const inv = await inventario(page);
      expect(inv.pines).toEqual({ [CM]: 1, [AR]: 1 });
      expect(errores).toEqual([]);
    });
});

// =====================================================================================================================
// 3. Cambio de tamaño en vivo: nada en (0, 0) de la caja; pines y rótulos sin duplicados
// =====================================================================================================================
test.describe("QA-036: cambio de tamaño de la ventana en vivo con la interacción montada", () => {
  test.setTimeout(240_000);
  for (const [desde, hasta] of [
    [280, 1500],
    [1500, 280],
  ])
    test(`de ${desde} a ${hasta} px, cada px: ningún rótulo ni pin visible en la esquina (0, 0) del mapa; un rótulo y un pin por elemento`, async ({ page }) => {
      const errores = vigilarErrores(page);
      await prepararMapa(page, desde, 900);
      await page.evaluate(() => document.fonts.ready);
      const fuera: string[] = [];
      const duplicados: string[] = [];
      const paso = desde < hasta ? 1 : -1;
      for (let w = desde; paso > 0 ? w <= hasta : w >= hasta; w += paso) {
        await page.setViewportSize({ width: w, height: 900 });
        const r = await page.locator(MAPA).evaluate(
          (m) =>
            new Promise<{ esquina: string[]; pines: number; rotulos: number }>((f) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                  const c = m.getBoundingClientRect();
                  const esquina: string[] = [];
                  for (const e of m.querySelectorAll(".mapa-rotulo, .mapa-pin")) {
                    const s = getComputedStyle(e);
                    if (s.display === "none" || s.visibility !== "visible") continue;
                    const b = e.getBoundingClientRect();
                    if (Number(s.opacity) > 0.02 && Math.abs(b.left - c.left) < 2 && Math.abs(b.top - c.top) < 2)
                      esquina.push(e.getAttribute("aria-label") ?? e.firstChild?.textContent ?? "?");
                  }
                  f({ esquina, pines: m.querySelectorAll("a.mapa-pin").length, rotulos: m.querySelectorAll(".mapa-rotulo").length });
                }),
              ),
            ),
        );
        if (r.esquina.length) fuera.push(`${w} px: ${r.esquina.join(", ")}`);
        if (r.pines > 2 || r.rotulos !== 7) duplicados.push(`${w} px: ${r.pines} pines, ${r.rotulos} rótulos`);
      }
      expect(fuera).toEqual([]);
      expect(duplicados).toEqual([]);
      expect(errores).toEqual([]);
    });
});

// =====================================================================================================================
// 4. La ficha se precarga con la interacción montada (router.prefetch), y no antes (QA-018)
// =====================================================================================================================
test.describe("precarga de las fichas desde los pines", () => {
  for (const [nombre, base] of [
    ["HEAD", undefined],
    ["main", process.env.E2E_MAIN_URL],
  ] as const)
    test(`${nombre}: sin precarga antes de la interacción; con la interacción montada se precargan las dos fichas y el clic no recarga el documento`, async ({ browser }) => {
      test.skip(nombre === "main" && !base, "Define E2E_MAIN_URL con el build de main (a32e00d)");
      const { ctx, page } = await nuevaPagina(browser, { base });
      const fichas: string[] = [];
      page.on("request", (r) => {
        const u = new URL(r.url());
        if (/^\/cafes\/cafe-[^/]+\//.test(u.pathname) && r.resourceType() !== "document") fichas.push(u.pathname + u.search);
      });
      await page.goto("/", { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      // Las tarjetas del catálogo también precargan su ficha si están a la vista (main lo hace al cargar). En HEAD, sin
      // gesto, no se pide ninguna ficha: lo que llegue después del gesto es de la interacción (router.prefetch).
      const alCargar = [...fichas];
      test.info().annotations.push({ type: "al cargar", description: alCargar.join(" ") });
      if (nombre === "HEAD") expect(alCargar, "sin precarga de fichas en la carga inicial (QA-018)").toEqual([]);
      await page.locator(MAPA).scrollIntoViewIfNeeded();
      await page.mouse.move(2, 2);
      await esperarInteraccion(page);
      await expect.poll(() => fichas.some((f) => f.includes("cafe-casa-martinez")), { message: `precarga Casa Martínez: ${fichas.join(" ")}` }).toBe(true);
      await expect.poll(() => fichas.some((f) => f.includes("cafe-arreboles"))).toBe(true);
      test.info().annotations.push({ type: "precargas", description: fichas.join(" ") });
      await page.evaluate(() => ((window as unknown as { __sinRecarga: boolean }).__sinRecarga = true));
      const antes = fichas.length;
      await page.locator(`a.mapa-pin[aria-label="${AR}"]`).click();
      await expect(page).toHaveURL(/\/cafes\/cafe-arreboles\/$/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Arreboles");
      expect(await page.evaluate(() => (window as unknown as { __sinRecarga?: boolean }).__sinRecarga)).toBe(true);
      test.info().annotations.push({ type: "pedidas al hacer clic", description: String(fichas.length - antes) });
      await ctx.close();
    });
});

// =====================================================================================================================
// 5. Árbol de accesibilidad del mapa igual que antes de la interacción, sin duplicados de la capa oculta
// =====================================================================================================================
test.describe("árbol de accesibilidad del mapa con la interacción", () => {
  for (const [ancho, alto] of [
    [360, 740],
    [768, 1024],
    [1280, 900],
  ])
    test(`a ${ancho} px: mismo árbol que sin JS (y que antes de la interacción); un pin y un rótulo por elemento`, async ({ browser }) => {
      const sin = await nuevaPagina(browser, { js: false, ancho, alto });
      await sin.page.goto("/");
      const arbolSin = await sin.page.locator("#mapa-provincias").ariaSnapshot();
      const invSin = await inventario(sin.page);
      await sin.ctx.close();
      const con = await nuevaPagina(browser, { ancho, alto });
      const errores = vigilarErrores(con.page);
      await con.page.goto("/", { waitUntil: "networkidle" });
      const arbolAntes = await con.page.locator("#mapa-provincias").ariaSnapshot();
      await con.page.locator(MAPA).scrollIntoViewIfNeeded();
      await con.page.mouse.move(2, 2);
      await esperarInteraccion(con.page);
      await con.page.waitForTimeout(400);
      const arbolCon = await con.page.locator("#mapa-provincias").ariaSnapshot();
      const invCon = await inventario(con.page);
      test.info().annotations.push({ type: "árbol con la interacción", description: arbolCon });
      expect(arbolAntes).toBe(arbolSin);
      expect(arbolCon).toBe(arbolSin);
      expect(invSin.pines).toEqual({ [CM]: 1, [AR]: 1 });
      expect(invCon.pines, "un solo .mapa-pin por café").toEqual({ [CM]: 1, [AR]: 1 });
      expect(invCon.pinesVivos).toEqual({ [CM]: 1, [AR]: 1 });
      expect(Object.values(invCon.rotulos).every((n) => n === 1), `un solo .mapa-rotulo por provincia: ${JSON.stringify(invCon.rotulos)}`).toBe(true);
      expect(Object.keys(invCon.rotulos)).toHaveLength(7);
      expect(invCon.rotulosSinAriaHidden).toBe(0);
      expect(invCon.marcasSinAriaHidden).toBe(0);
      expect(invCon.escalasVivas, "una sola escala visible").toBeLessThanOrEqual(1);
      // Los enlaces y botones del mapa expuestos: los mismos nombres, sin repetidos.
      const nombres = await con.page.locator("#mapa-provincias").getByRole("link").evaluateAll((as) => as.map((a) => a.getAttribute("aria-label")));
      expect(nombres).toEqual([CM, AR]);
      expect(errores).toEqual([]);
      await con.ctx.close();
    });
});

// =====================================================================================================================
// 6. Errores de React o de hidratación en las páginas y al navegar con el router
// =====================================================================================================================
const PAGINAS = ["/", "/?provincia=guanenta", "/?provincia=soto", "/cafes/", "/provincias/guanenta/", "/provincias/soto/", "/cafes/cafe-casa-martinez/", "/cafes/cafe-arreboles/", "/envios/", "/pedido/"];

test.describe("sin errores de React ni de hidratación", () => {
  for (const ruta of PAGINAS)
    test(`carga directa de ${ruta}, con gesto y desplazamiento`, async ({ page }) => {
      const errores = vigilarErrores(page);
      await page.goto(ruta, { waitUntil: "networkidle" });
      await page.mouse.move(5, 5);
      await page.keyboard.press("Tab");
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(600);
      if (ruta.startsWith("/?") || ruta === "/") await esperarInteraccion(page);
      expect(errores).toEqual([]);
    });

  for (const [ancho, alto] of [
    [360, 740],
    [1280, 900],
  ])
    test(`a ${ancho} px: ida y vuelta con el router entre /, la ficha, /cafes/ y las provincias, con la interacción montada y un pin fuera del documento`, async ({ page }) => {
      test.setTimeout(90_000);
      const errores = vigilarErrores(page);
      await prepararMapa(page, ancho, alto);
      await page.evaluate(() => ((window as unknown as { __sinRecarga: boolean }).__sinRecarga = true));
      const sinRecarga = () => page.evaluate(() => (window as unknown as { __sinRecarga?: boolean }).__sinRecarga === true);

      // 1. Se elige Soto Norte (el pin de Casa Martínez sale del documento) y se abre Arreboles desde su pin.
      await page.locator("#catalogo").getByRole("button", { name: /^Soto Norte/ }).locator("visible=true").first().click();
      await expect(page).toHaveURL(/provincia=soto/);
      await page.waitForTimeout(600);
      expect(await page.locator(`a.mapa-pin[aria-label="${CM}"]`).count()).toBe(0);
      await page.locator(MAPA).scrollIntoViewIfNeeded();
      await page.locator(`a.mapa-pin[aria-label="${AR}"]`).click();
      await expect(page).toHaveURL(/\/cafes\/cafe-arreboles\/$/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Arreboles");

      // 2. Atrás: vuelve el inicio con Soto Norte; la interacción y los pines están bien.
      await page.goBack();
      await expect(page).toHaveURL(/provincia=soto/);
      await page.locator(MAPA).scrollIntoViewIfNeeded();
      await page.mouse.move(3, 3);
      await esperarInteraccion(page);
      await page.waitForTimeout(600);
      expect((await inventario(page)).pines).toEqual({ [AR]: 1 });

      // 3. «Ver todo Santander»: vuelve Casa Martínez; se abre su ficha; atrás; adelante; atrás.
      await page.getByRole("button", { name: MARCA_INTERACCION }).click();
      await expect(page).not.toHaveURL(/provincia=/);
      await page.waitForTimeout(600);
      expect((await inventario(page)).pines).toEqual({ [CM]: 1, [AR]: 1 });
      await page.locator(`a.mapa-pin[aria-label="${CM}"]`).click();
      await expect(page).toHaveURL(/\/cafes\/cafe-casa-martinez\/$/);
      await page.goBack();
      await expect(page).toHaveURL(/\/$/);
      await page.goForward();
      await expect(page).toHaveURL(/\/cafes\/cafe-casa-martinez\/$/);
      await page.goBack();
      await expect(page).toHaveURL(/\/$/);
      await page.locator(MAPA).scrollIntoViewIfNeeded();
      await page.mouse.move(4, 4);
      await esperarInteraccion(page);

      // 4. A /cafes/ con un enlace interno, a una provincia y de vuelta al inicio con el logo.
      await page.goto("/cafes/", { waitUntil: "networkidle" }).catch(() => {});
      await page.evaluate(() => ((window as unknown as { __sinRecarga: boolean }).__sinRecarga = true));
      const enlaceProvincia = page.locator('a[href$="/provincias/guanenta/"]').first();
      if (await enlaceProvincia.count()) {
        await enlaceProvincia.click();
        await expect(page).toHaveURL(/\/provincias\/guanenta\/$/);
      }
      const inicio = page.locator('header a[href="/"], header a[href$="/coffee-santander-shop/"]').first();
      await inicio.click();
      await expect(page).toHaveURL(/\/$/);
      await page.locator(MAPA).scrollIntoViewIfNeeded();
      await page.mouse.move(6, 6);
      await esperarInteraccion(page);
      await page.waitForTimeout(400);
      expect((await inventario(page)).pines).toEqual({ [CM]: 1, [AR]: 1 });
      expect(await sinRecarga(), "las idas y vueltas fueron navegaciones del cliente").toBe(true);
      expect(await ordenDeFoco(page)).toEqual(["Provincia de Guanentá, 1 café", "Provincia de Soto Norte, 1 café", CM, AR]);
      expect(errores).toEqual([]);
    });
});

// =====================================================================================================================
// 7. QA-038: un rótulo que se oculta salta al centro de su provincia y se desvanece ahí, encima de otro rótulo o pin
// =====================================================================================================================
// Con e4aede7 (QA-036), un rótulo oculto ya no va a (0, 0): toma la posición de su sitio central, sin el desplazamiento
// con el que se veía. Al ocultarse, salta ≈ 40 px y se desvanece 0,25 s sobre el pin de Arreboles o sobre otros rótulos.
// Se ve al cambiar el tamaño de la ventana en el ancho en que el rótulo deja de caber y al elegir una provincia.
test.describe("QA-038: un rótulo que se oculta se desvanece donde estaba", () => {
  for (const [desde, hasta, nombre] of [
    [331, 332, "Metropolitana"],
    [302, 301, "Comunera"],
    [377, 376, "Metropolitana"],
  ] as const)
    test(`de ${desde} a ${hasta} px: ${nombre} se oculta sin moverse más de 3 px de donde se veía`, async ({ page }) => {
      await prepararMapa(page, desde, 900);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      const leer = () =>
        page.locator(MAPA).evaluate(
          (m, n) =>
            new Promise<{ x: number; y: number; oculto: boolean; opacidad: number } | null>((f) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                  const c = m.getBoundingClientRect();
                  const e = [...m.querySelectorAll<HTMLElement>(".mapa-rotulo")].find((x) => x.firstChild?.textContent === n);
                  if (!e) return f(null);
                  const r = e.getBoundingClientRect();
                  f({ x: Math.round(r.left - c.left), y: Math.round(r.top - c.top), oculto: e.classList.contains("mapa-rotulo--oculto"), opacidad: Number(getComputedStyle(e).opacity) });
                }),
              ),
            ),
          nombre,
        );
      const antes = await leer();
      expect(antes?.oculto, `${nombre} se ve a ${desde} px`).toBe(false);
      await page.setViewportSize({ width: hasta, height: 900 });
      const despues = await leer();
      expect(despues?.oculto, `${nombre} se oculta a ${hasta} px`).toBe(true);
      test.info().annotations.push({ type: "posiciones", description: JSON.stringify({ antes, despues }) });
      expect(Math.max(Math.abs(despues!.x - antes!.x), Math.abs(despues!.y - antes!.y)), "salto del rótulo al ocultarse (px)").toBeLessThanOrEqual(3);
    });
});

// =====================================================================================================================
// 8. QA-039: la cuadrícula del catálogo se reemplaza entera al hidratar; el foco de teclado en una tarjeta se pierde
// =====================================================================================================================
// El catálogo (useSearchParams dentro de <Suspense>) llega en el HTML como respaldo y, al hidratar, React lo cambia por
// nodos nuevos (≈ 100 ms después de cargar con la red local; con el JS lento, lo que tarde en llegar). Si el foco estaba
// en una tarjeta, pasa al body (mismo caso que QA-037, en el catálogo). También en main (a32e00d). Es además la causa de
// la falla intermitente de «fotos bajo basePath › /» (el <img> se desprende mientras la prueba lo desplaza).
test.describe("QA-039: el foco en una tarjeta del catálogo sobrevive a la hidratación", () => {
  for (const ruta of ["/", "/cafes/"])
    test(`${ruta} a 360 px con el JS retrasado 2 s: el foco sigue en el enlace de la tarjeta y la tarjeta no se reemplaza`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.route(/\/_next\/static\/chunks\/.+\.js$/, async (r) => {
        await new Promise((f) => setTimeout(f, 2000));
        await r.continue().catch(() => {});
      });
      await page.addInitScript(() => {
        const w = window as unknown as { __quitadas: number };
        w.__quitadas = 0;
        new MutationObserver((ms) => {
          for (const m of ms) for (const n of m.removedNodes) if (n instanceof Element && n.querySelector("a[href*='/cafes/cafe-']")) w.__quitadas++;
        }).observe(document, { childList: true, subtree: true });
      });
      await page.goto(ruta, { waitUntil: "domcontentloaded" });
      const enlace = page.locator("#catalogo a[href*='/cafes/cafe-casa-martinez/']").first();
      await enlace.focus();
      const antes = await page.evaluate(() => document.activeElement?.getAttribute("href"));
      expect(antes).toMatch(/\/cafes\/cafe-casa-martinez\/$/);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(800);
      expect(await page.evaluate(() => document.activeElement?.getAttribute("href") ?? document.activeElement?.tagName), "el foco sigue en la tarjeta").toBe(antes);
      expect(await page.evaluate(() => (window as unknown as { __quitadas: number }).__quitadas), "ninguna tarjeta sale del documento al hidratar").toBe(0);
    });
});
