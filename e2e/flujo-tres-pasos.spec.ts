import { expect, test, type Page } from "@playwright/test";
import { constanciaMensaje, enviarPorWhatsapp, pestanasAbiertas } from "./ayudas";

// A1 (docs/diseno/2026-11-18-ux-auditoria-alta.md) y LEG-171 a LEG-175 (docs/legal/revisiones/2026-11-18-flujo-pedido-un-clic.md;
// microcopy v1.10 §9): cajón → Envío → Resumen, y «Enviar por WhatsApp» valida y abre wa.me en el mismo clic.

const UNA_BOLSA = [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }];
const SIGUIENTE_TARIFA =
  "Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido escrito. Con ese mensaje nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.";

async function sembrar(page: Page, lineas: object[] = UNA_BOLSA) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate((l) => localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: l })), lineas);
}

async function alResumen(page: Page, lineas: object[] = UNA_BOLSA) {
  await sembrar(page, lineas);
  await page.goto("/pedido/");
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByLabel("Departamento").selectOption("Santander");
  await page.getByLabel("Municipio").selectOption("Bucaramanga");
  await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
  await page.getByRole("button", { name: /Ver el resumen/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

const terminos = (page: Page) => page.getByRole("checkbox", { name: /acepto los Términos y condiciones/ });
const datos = (page: Page) => page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ });
const boton = (page: Page) => page.getByRole("button", { name: "Enviar por WhatsApp" });
const respaldo = (page: Page) => page.getByTestId("respaldo-whatsapp");
const textoDe = (href: string) => decodeURIComponent(href.split("?text=")[1]);
const numeroDe = (href: string) => /DS-\d{6}-\d{4}-[A-Z2-9]{4}/.exec(textoDe(href))?.[0];

test.describe("A1: flujo del pedido en tres pasos", () => {
  test("LEG-172: sin las casillas 1 y 2 no se abre ninguna pestaña, no hay respaldo y el foco va a la primera sin marcar", async ({ page }) => {
    await alResumen(page);
    for (const marcar of [[], [datos], [terminos]] as const) {
      for (const c of [terminos, datos]) await c(page).setChecked(false);
      for (const c of marcar) await c(page).check();
      await page.getByRole("checkbox", { name: /promociones .+ por WhatsApp/ }).setChecked(marcar.length === 0);
      const n = await pestanasAbiertas(page, () => boton(page).click({ force: true }));
      expect(n).toBe(0);
      await expect(respaldo(page)).toHaveCount(0);
      await expect(page.locator("#mensaje-pedido")).toHaveCount(0);
      await expect(marcar[0] === terminos ? datos(page) : terminos(page)).toBeFocused();
    }
  });

  test("LEG-172: con las dos casillas, window.open corre dentro del gesto del usuario (sin espera) y abre wa.me con la constancia", async ({ page }) => {
    await page.addInitScript(() => {
      const original = window.open.bind(window);
      const w = window as unknown as { __aperturas: { url: string; activo: boolean }[] };
      w.__aperturas = [];
      window.open = (url?: string | URL, ...resto: [string?, string?]) => {
        w.__aperturas.push({ url: String(url), activo: navigator.userActivation.isActive });
        return original(url, ...resto);
      };
    });
    await alResumen(page);
    await terminos(page).check();
    await datos(page).check();
    const href = await enviarPorWhatsapp(page);
    const aperturas = await page.evaluate(() => (window as unknown as { __aperturas: { url: string; activo: boolean }[] }).__aperturas);
    expect(aperturas).toHaveLength(1);
    expect(aperturas[0].activo, "window.open fuera del gesto del usuario").toBe(true);
    expect(aperturas[0].url).toBe(href);
    expect(href.startsWith("https://wa.me/573001129874?text=")).toBe(true);
    expect(textoDe(href).endsWith(constanciaMensaje())).toBe(true);
    expect(numeroDe(href)).toBeTruthy();
  });

  test("LEG-173: «Copiar mensaje» copia el mismo texto y número del enlace; cambiar una casilla, un dato o el carrito oculta el respaldo", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await alResumen(page);
    await terminos(page).check();
    await datos(page).check();
    const href = await enviarPorWhatsapp(page);
    await expect(respaldo(page).getByRole("status")).toHaveText("¿No se abrió WhatsApp? Copia el mensaje y envíalo al +57 300 112 9874.");
    await respaldo(page).getByRole("button", { name: "Copiar mensaje" }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(textoDe(href));
    // «Ver el mensaje» cerrado por defecto, con el mismo texto.
    await expect(respaldo(page).locator("details")).not.toHaveAttribute("open", /.*/);
    await respaldo(page).getByText("Ver el mensaje").click();
    await expect(page.locator("#mensaje-pedido")).toHaveText(textoDe(href));

    // §4 bis 1: segundo clic sin cambios, mismo enlace y mismo número.
    expect(await enviarPorWhatsapp(page)).toBe(href);

    // Una casilla opcional cambia: se oculta; el siguiente clic genera número y texto nuevos.
    await page.getByRole("checkbox", { name: /promociones .+ por WhatsApp/ }).check();
    await expect(respaldo(page)).toHaveCount(0);
    const conPromo = await enviarPorWhatsapp(page);
    expect(numeroDe(conPromo)).not.toBe(numeroDe(href));
    expect(textoDe(conPromo)).toContain("\nAutorizo recibir promociones por WhatsApp.");
    await expect(respaldo(page)).toBeVisible();

    // Un dato de envío cambia (vía «Volver al envío»): el respaldo ya no está al volver.
    await page.getByRole("button", { name: "Volver al envío" }).click();
    await page.getByLabel("Dirección").fill("Calle 45 # 12-31");
    await page.getByRole("button", { name: /Ver el resumen/ }).click();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    await expect(respaldo(page)).toHaveCount(0);
    const otraDireccion = await enviarPorWhatsapp(page);
    expect(textoDe(otraDireccion)).toContain("Calle 45 # 12-31");

    // El carrito cambia desde otra pestaña (localStorage): el respaldo se oculta.
    await expect(respaldo(page)).toBeVisible();
    const otra = await context.newPage();
    await otra.goto("/");
    await otra.getByRole("button", { name: /Agregar Café Arreboles/ }).click();
    await expect(respaldo(page)).toHaveCount(0);
    await otra.close();
  });

  test("indicador «Pedido · Envío · Resumen»: sin Carrito ni Confirmación; «Pedido» abre el cajón y «Envío» vuelve desde el Resumen", async ({ page }) => {
    await alResumen(page);
    const pasos = page.getByRole("list", { name: "Pasos del pedido" });
    await expect(pasos.getByRole("listitem")).toHaveText(["Pedido, hecho", "Envío, hecho", "3Resumen"]);
    await expect(pasos.locator('[aria-current="step"]')).toContainText("Resumen");
    await pasos.getByRole("link", { name: /^Envío/ }).click();
    await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeFocused();
    await expect(page).toHaveURL(/\/pedido\/$/);
    // Los datos siguen en memoria al volver por el indicador.
    await expect(page.getByLabel("Nombre completo")).toHaveValue("Ana Rueda");
    await pasos.getByRole("button", { name: /^Pedido/ }).click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await expect(cajon).toBeVisible();
    await expect(cajon.getByRole("link", { name: /Continuar con el envío/ })).toHaveAttribute("href", "/pedido/");
    await page.keyboard.press("Escape");
    await expect(pasos.getByRole("button", { name: /^Pedido/ })).toBeFocused();
  });

  test("Envío: bloque «Tu pedido» con tres líneas y «y n más»; vaciar desde el cajón deja el estado vacío", async ({ page }) => {
    const lineas = [250, 500].flatMap((gramos) => (["grano", "molido"] as const).map((molienda) => ({ cafeSlug: "cafe-casa-martinez", gramos, molienda, cantidad: 1 })));
    await sembrar(page, lineas);
    await page.goto("/pedido/");
    const bloque = page.getByTestId("bloque-tu-pedido");
    await expect(bloque.getByRole("heading", { name: "Tu pedido", level: 2 })).toBeVisible();
    await expect(bloque.getByRole("listitem")).toHaveCount(3);
    await expect(bloque).toContainText("y 1 más");
    await expect(bloque).toContainText("4 bolsas");
    await expect(page.getByRole("link", { name: "Seguir viendo cafés" })).toHaveAttribute("href", "/cafes/");
    await bloque.getByRole("button", { name: "Editar el pedido" }).click();
    await page.getByRole("dialog", { name: "Tu pedido" }).getByRole("button", { name: "Vaciar pedido" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { name: "Tu pedido está vacío" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Pasos del pedido" })).toHaveCount(0);
  });

  test("Resumen: LEG-171 encima de la microayuda y del botón; respaldo debajo; un solo «Enviar por WhatsApp» y ningún «Finalizar»", async ({ page }) => {
    await alResumen(page);
    await expect(page.getByTestId("texto-siguiente-paso")).toHaveText(SIGUIENTE_TARIFA);
    // Posición en el documento (no en la ventana: el clic desplaza la página).
    const y = (sel: string) => page.locator(sel).evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
    const texto = await y('[data-testid="texto-siguiente-paso"]');
    const ayuda = await y('[data-testid="ayuda-preparar"]');
    const casillaPromo = await y("#c-promo-wa");
    const yBoton = await boton(page).evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
    expect(casillaPromo).toBeLessThan(texto);
    expect(texto).toBeLessThan(ayuda);
    expect(ayuda).toBeLessThan(yBoton);
    await terminos(page).check();
    await datos(page).check();
    await enviarPorWhatsapp(page);
    expect(await y('[data-testid="respaldo-whatsapp"]')).toBeGreaterThan(yBoton);
    await expect(page.getByRole("button", { name: /Enviar por WhatsApp/ })).toHaveCount(1);
    await expect(page.getByRole("link", { name: /WhatsApp/ }).filter({ hasText: /Enviar/ })).toHaveCount(0);
    const main = await page.locator("main").innerText();
    expect(main).not.toMatch(/Finalizar|Confirmación|Abrir WhatsApp|Tu pedido está listo|Preparar pedido/);
    // El aviso de privacidad sigue en Envío, no en el Resumen.
    await expect(page.getByTestId("aviso-privacidad")).toHaveCount(0);
  });

  test("360 × 740: indicador en una línea, sin desborde y distancia casilla 1 → botón medida; a 320 px solo el rótulo del paso actual", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await alResumen(page);
    const pasos = page.getByRole("list", { name: "Pasos del pedido" });
    expect((await pasos.boundingBox())!.height).toBeLessThan(50);
    const tope = await page.locator("#c-ter").evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
    const fin = await boton(page).evaluate((b) => b.getBoundingClientRect().bottom + window.scrollY);
    const encabezado = await page.locator("header").first().evaluate((h) => h.getBoundingClientRect().height);
    // Diseño A1 pide que la casilla 1 y el botón quepan en 740 px menos el encabezado fijo. Con los textos legales
    // actuales no cabe (las casillas 1 y 2 solas miden ≈ 290 px): queda medido para que diseño y QA decidan.
    test.info().annotations.push({ type: "casilla-1-a-boton-360", description: `${Math.round(fin - tope)} px; altura útil ${Math.round(740 - encabezado)} px` });
    // Entre la casilla 1 y el botón no entra nada fuera de lo que la especificación enumera.
    const entre = await page.locator("main section[aria-labelledby='t-resumen'] > *").evaluateAll((els, [a, b]) =>
      els.filter((e) => { const r = e.getBoundingClientRect(); const t = r.top + window.scrollY; return t > a && t < b; }).map((e) => e.getAttribute("data-testid") ?? e.tagName.toLowerCase()),
      [tope, fin] as const,
    );
    expect(entre).toEqual(["casillas-promociones", "linea-vendedor", "texto-siguiente-paso", "ayuda-preparar", "div"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

    await page.setViewportSize({ width: 320, height: 740 });
    // Rótulos de los pasos que no son el actual: sr-only (1 × 1 px); el del actual se ve.
    const anchos = await pasos.locator("li span.font-semibold, li span.font-medium").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
    expect(anchos).toHaveLength(2);
    for (const a of anchos) expect(a).toBeLessThanOrEqual(1);
    expect((await pasos.locator("li span.font-extrabold.text-ink-title").boundingBox())!.width).toBeGreaterThan(20);
    expect((await pasos.boundingBox())!.height).toBeLessThan(50);
  });
});
