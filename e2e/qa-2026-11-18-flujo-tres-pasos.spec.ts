import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { constanciaMensaje, enviarPorWhatsapp, pestanasAbiertas } from "./ayudas";

// Ronda QA 2026-11-18: verificación de A1, flujo del pedido en tres pasos (5fd2edc, 2dad5c4, 1c64aa2, e046bdc).
// Fuentes: docs/diseno/2026-11-18-ux-auditoria-alta.md (A1); docs/legal/revisiones/2026-11-18-flujo-pedido-un-clic.md
// (LEG-171 a LEG-175, §4 bis); docs/legal/microcopy-legal.md v1.10 (§5.9, §9). Complementa e2e/flujo-tres-pasos.spec.ts.

const UNA_BOLSA = [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }];
const SERIAS = ["serious", "critical"];

// Microcopy v1.10, letra por letra.
const T = {
  siguienteTarifa:
    "Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido escrito. Con ese mensaje nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.",
  siguienteCotizar:
    "Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido escrito. Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.",
  ayudaDos: "Para enviar tu pedido, marca las dos casillas: los términos y condiciones y la autorización de tus datos.",
  ayudaTerminos: "Para enviar tu pedido, falta que aceptes los términos y condiciones.",
  ayudaDatos: "Para enviar tu pedido, falta que autorices el tratamiento de tus datos.",
  errorDatos: "Debes autorizar el tratamiento de tus datos para continuar.",
  errorTerminos: "Debes aceptar los términos para continuar.",
  respaldo: "¿No se abrió WhatsApp? Copia el mensaje y envíalo al +57 300 112 9874.",
  porCotizarTotales: "Este valor no incluye el envío. Te lo informamos por WhatsApp y tú decides si lo aceptas antes de pagar.",
};

async function sembrar(page: Page, lineas: object[] = UNA_BOLSA) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate((l) => localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: l })), lineas);
}

async function alResumen(page: Page, { departamento = "Santander", municipio = "Bucaramanga", lineas = UNA_BOLSA }: { departamento?: string; municipio?: string; lineas?: object[] } = {}) {
  await sembrar(page, lineas);
  await page.goto("/pedido/");
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByLabel("Departamento").selectOption(departamento);
  await page.getByLabel("Municipio").selectOption(municipio);
  await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
  await page.getByRole("button", { name: /Ver el resumen/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

const terminos = (page: Page) => page.locator("#c-ter");
const datos = (page: Page) => page.locator("#c-aut");
const promoWa = (page: Page) => page.locator("#c-promo-wa");
const boton = (page: Page) => page.getByRole("button", { name: "Enviar por WhatsApp" });
const respaldo = (page: Page) => page.getByTestId("respaldo-whatsapp");
const textoDe = (href: string) => decodeURIComponent(href.split("?text=")[1]);
const numeroDe = (href: string) => /DS-\d{6}-\d{4}-[A-Z2-9]{4}/.exec(textoDe(href))?.[0];

async function axeSerio(page: Page, soloMain = false) {
  const b = soloMain ? new AxeBuilder({ page }).include("main") : new AxeBuilder({ page });
  const r = await b.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  return r.violations.filter((v) => SERIAS.includes(v.impact ?? "")).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

async function tema(page: Page, t: "light" | "dark") {
  await page.evaluate((v) => {
    document.documentElement.setAttribute("data-theme", v);
    document.querySelector("main")?.setAttribute("data-theme", v);
  }, t);
  await page.waitForTimeout(400);
}

/** Cuenta las llamadas a crypto.getRandomValues (el sufijo del número DS sale de ahí) y a window.open. */
async function espiar(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __qa: { azar: number; open: string[] } };
    w.__qa = { azar: 0, open: [] };
    const azar = crypto.getRandomValues.bind(crypto);
    crypto.getRandomValues = (<T extends ArrayBufferView | null>(a: T) => {
      w.__qa.azar++;
      return azar(a as never) as T;
    }) as typeof crypto.getRandomValues;
    const abrir = window.open.bind(window);
    window.open = (url?: string | URL, ...r: [string?, string?]) => {
      w.__qa.open.push(String(url));
      return abrir(url, ...r);
    };
  });
}
const espia = (page: Page) => page.evaluate(() => (window as unknown as { __qa: { azar: number; open: string[] } }).__qa);

test.describe("QA 2026-11-18 · A1 flujo en tres pasos", () => {
  test("rutas: ?paso=envio, carrito, confirmacion y otro valor se reemplazan por /pedido/", async ({ page }) => {
    await sembrar(page);
    for (const p of ["envio", "carrito", "confirmacion", "xyz"]) {
      await page.goto(`/pedido/?paso=${p}`);
      await expect(page).toHaveURL(/\/pedido\/$/);
      await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
    }
  });

  test("recargar en el Resumen vuelve a Envío (los datos solo viven en memoria)", async ({ page }) => {
    await alResumen(page);
    await expect(page).toHaveURL(/\?paso=resumen$/);
    await page.reload();
    await expect(page).toHaveURL(/\/pedido\/$/);
    await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
    await expect(page.getByLabel("Nombre completo")).toHaveValue("");
  });

  test("LEG-172: sin casillas 1 y 2 no se genera número DS (sin getRandomValues), ni window.open, ni respaldo; errores exactos", async ({ page }) => {
    await espiar(page);
    await alResumen(page);
    await expect(page.getByTestId("ayuda-preparar")).toHaveText(T.ayudaDos);
    const antes = (await espia(page)).azar;
    expect(await pestanasAbiertas(page, () => boton(page).click({ force: true }))).toBe(0);
    expect((await espia(page)).azar, "se generó azar (número DS) sin casillas").toBe(antes);
    expect((await espia(page)).open).toEqual([]);
    await expect(respaldo(page)).toHaveCount(0);
    await expect(terminos(page)).toBeFocused();
    await expect(page.locator("#e-ter")).toHaveText(T.errorTerminos);
    await expect(page.locator("#e-aut")).toHaveText(T.errorDatos);
    await expect(terminos(page)).not.toBeChecked();
    await expect(datos(page)).not.toBeChecked();
    // Solo términos: microayuda y foco de datos; teclado (Enter) tampoco abre nada.
    await terminos(page).check();
    await expect(page.getByTestId("ayuda-preparar")).toHaveText(T.ayudaDatos);
    await expect(page.locator("#e-ter")).toHaveCount(0);
    await boton(page).focus();
    expect(await pestanasAbiertas(page, () => page.keyboard.press("Enter"))).toBe(0);
    await expect(datos(page)).toBeFocused();
    await terminos(page).uncheck();
    await datos(page).check();
    await expect(page.getByTestId("ayuda-preparar")).toHaveText(T.ayudaTerminos);
    await boton(page).focus();
    expect(await pestanasAbiertas(page, () => page.keyboard.press("Space"))).toBe(0);
    await expect(terminos(page)).toBeFocused();
    expect((await espia(page)).azar).toBe(antes);
    expect((await espia(page)).open).toEqual([]);
    // Casillas 3 y 4 nunca bloquean y no sustituyen a 1 y 2.
    await promoWa(page).check();
    await datos(page).uncheck();
    expect(await pestanasAbiertas(page, () => boton(page).click({ force: true }))).toBe(0);
  });

  test("LEG-172: con teclado (Enter) y las dos casillas, una sola apertura de wa.me con constancia v1.0 y número DS", async ({ page }) => {
    await espiar(page);
    await alResumen(page);
    await terminos(page).check();
    await datos(page).check();
    await expect(page.getByTestId("ayuda-preparar")).toHaveCount(0);
    await expect(boton(page)).not.toHaveAttribute("aria-disabled", /.*/);
    await page.context().route(/^https:\/\/(api\.)?wa\.me\//, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<title>WhatsApp</title>" }));
    await boton(page).focus();
    const [popup] = await Promise.all([page.waitForEvent("popup"), page.keyboard.press("Enter")]);
    await popup.waitForURL(/wa\.me\//);
    const href = popup.url();
    await popup.close();
    expect((await espia(page)).open).toEqual([href]);
    expect(href.startsWith("https://wa.me/573001129874?text=")).toBe(true);
    expect(textoDe(href)).toContain(constanciaMensaje());
    expect(numeroDe(href)).toBeTruthy();
    // El foco se queda en el botón y el respaldo se anuncia con role=status.
    await expect(boton(page)).toBeFocused();
    await expect(respaldo(page).getByRole("status")).toHaveText(T.respaldo);
    // Siguiente Tab: «Copiar mensaje».
    await page.keyboard.press("Tab"); // Volver al envío (secundario, va después en el DOM)
    await page.keyboard.press("Tab");
    await expect(respaldo(page).getByRole("button", { name: "Copiar mensaje" })).toBeFocused();
  });

  test("LEG-173: el respaldo no reaparece sin un nuevo clic al deshacer un cambio (casilla opcional)", async ({ page }) => {
    await alResumen(page);
    await terminos(page).check();
    await datos(page).check();
    await enviarPorWhatsapp(page);
    await expect(respaldo(page)).toBeVisible();
    await promoWa(page).check();
    await expect(respaldo(page)).toHaveCount(0);
    await promoWa(page).uncheck();
    // LEG-173 (2): «se oculta hasta un nuevo clic válido».
    await page.waitForTimeout(200);
    await expect(respaldo(page), "el respaldo reapareció sin un nuevo clic").toHaveCount(0);
  });

  test("LEG-173: el respaldo no reaparece sin un nuevo clic al desmarcar y volver a marcar la casilla 1", async ({ page }) => {
    await alResumen(page);
    await terminos(page).check();
    await datos(page).check();
    await enviarPorWhatsapp(page);
    await terminos(page).uncheck();
    await expect(respaldo(page)).toHaveCount(0);
    await terminos(page).check();
    await page.waitForTimeout(200);
    await expect(respaldo(page), "el respaldo reapareció sin un nuevo clic").toHaveCount(0);
  });

  test("LEG-173: el respaldo se oculta al cambiar la cantidad desde el cajón en la misma pestaña; segundo clic = DS nuevo", async ({ page }) => {
    await alResumen(page);
    await terminos(page).check();
    await datos(page).check();
    const href = await enviarPorWhatsapp(page);
    await page.getByRole("list", { name: "Pasos del pedido" }).getByRole("button", { name: /^Pedido/ }).click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await cajon.getByRole("button", { name: /^Una bolsa más de/ }).first().click();
    await page.keyboard.press("Escape");
    await expect(respaldo(page)).toHaveCount(0);
    const nuevo = await enviarPorWhatsapp(page);
    expect(numeroDe(nuevo)).not.toBe(numeroDe(href));
    expect(textoDe(nuevo)).toMatch(/× ?2|2 ×|x ?2/);
  });

  test("LEG-171: variante por cotizar (Leticia) encima del botón y nota bajo el total; mensaje por cotizar", async ({ page }) => {
    await alResumen(page, { departamento: "Amazonas", municipio: "Leticia" });
    await expect(page.getByTestId("texto-siguiente-paso")).toHaveText(T.siguienteCotizar);
    await expect(page.getByTestId("aviso-por-cotizar")).toHaveText(T.porCotizarTotales);
    await terminos(page).check();
    await datos(page).check();
    const href = await enviarPorWhatsapp(page);
    expect(textoDe(href)).toContain("Envío: POR COTIZAR (zona 5 o más de 5 kg)");
    // Con tarifa: Bucaramanga.
    await page.getByRole("button", { name: "Volver al envío" }).click();
    await page.getByLabel("Departamento").selectOption("Santander");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    await page.getByRole("button", { name: /Ver el resumen/ }).click();
    await expect(page.getByTestId("texto-siguiente-paso")).toHaveText(T.siguienteTarifa);
    await expect(page.getByTestId("aviso-por-cotizar")).toHaveCount(0);
  });

  test("textos de botones letra por letra (§9.1) y ninguno prohibido en Envío ni en Resumen", async ({ page }) => {
    await sembrar(page);
    await page.goto("/");
    await page.getByRole("banner").getByRole("button", { name: /^Pedido/ }).click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await expect(cajon.getByRole("link", { name: /^Continuar con el envío/ })).toHaveAttribute("href", "/pedido/");
    await page.keyboard.press("Escape");
    await page.goto("/pedido/");
        await expect(page.getByRole("button", { name: /^Ver el resumen/ })).toHaveText("Ver el resumen");
    await expect(page.getByRole("link", { name: "Seguir viendo cafés" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Editar el pedido" })).toHaveText("Editar");
    await expect(page.getByTestId("aviso-privacidad")).toBeVisible();
    const envioTxt = await page.locator("main").innerText();
    expect(envioTxt).not.toMatch(/Finalizar|Confirmación|Abrir WhatsApp|Preparar pedido|Revisar el pedido/);
    await page.getByLabel("Nombre completo").fill("Ana Rueda");
    await page.getByLabel("Celular").fill("300 123 4567");
    await page.getByLabel("Departamento").selectOption("Santander");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
    await page.getByRole("button", { name: /Ver el resumen/ }).click();
    await expect(page.getByRole("button", { name: /Volver al envío/ })).toHaveText("Volver al envío");
    await terminos(page).check();
    await datos(page).check();
    await enviarPorWhatsapp(page);
    await expect(respaldo(page).getByRole("button")).toHaveText(["Copiar mensaje", "Vaciar pedido"]);
    await expect(respaldo(page).locator("summary")).toHaveText("Ver el mensaje");
    const todo = await page.locator("body").innerText();
    expect(todo).not.toMatch(/Finalizar|Confirmación|Abrir WhatsApp|Preparar pedido|Tu pedido está listo/);
    expect(await page.getByText("Enviar por WhatsApp", { exact: true }).count()).toBe(1);
    // Nombres accesibles: ningún «Abrir WhatsApp».
    const nombres = await page.locator("a, button").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? "").join("|"));
    expect(nombres).not.toMatch(/Abrir WhatsApp/i);
  });

  test("indicador: árbol de accesibilidad de los pasos (nombre del paso hecho)", async ({ page }) => {
    await alResumen(page);
    const pasos = page.getByRole("list", { name: "Pasos del pedido" });
    const arbol = await pasos.ariaSnapshot();
    test.info().annotations.push({ type: "aria-indicador", description: arbol });
    // Nombre accesible del botón «Pedido» y del enlace «Envío».
    const nombre = async (sel: string) => (await page.locator(sel).first().evaluate((e) => e.textContent ?? "")).replace(/\s+/g, " ");
    test.info().annotations.push({ type: "textContent-pedido", description: await nombre("ol[aria-label='Pasos del pedido'] li button") });
    // QA-024: Chromium calcula «Pedido , hecho» (el span sr-only es absoluto y se separa con un espacio).
    expect(arbol, "QA-024: nombre accesible con espacio antes de la coma").not.toContain(" , hecho");
  });

  test("altura a 360 × 740: casilla 1 → borde inferior del botón (presupuesto de A1 ≈ 660 px; altura útil ≈ 676 px)", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await alResumen(page);
    const tope = await terminos(page).evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
    const fin = await boton(page).evaluate((b) => b.getBoundingClientRect().bottom + window.scrollY);
    const encabezado = await page.locator("header").first().evaluate((h) => h.getBoundingClientRect().height);
    const util = 740 - encabezado;
    const medida = Math.round(fin - tope);
    test.info().annotations.push({ type: "casilla1-boton-360", description: `${medida} px; altura útil ${Math.round(util)} px` });
    // Evidencia: captura con la casilla 1 alineada bajo el encabezado.
    await page.evaluate(([t, h]) => window.scrollTo(0, t - h - 8), [tope, encabezado]);
    await page.screenshot({ path: "docs/qa/capturas/2026-11-18-a1-resumen-360-casilla1.png" });
    expect(medida, "QA-023: la casilla 1 y el botón no caben en una pantalla de 360 × 740").toBeLessThanOrEqual(util);
  });

  for (const ancho of [360, 1280]) {
    for (const t of ["light", "dark"] as const) {
      test(`axe ${ancho} px · tema ${t}: Envío, Envío con errores, Resumen con errores de casillas y Resumen con respaldo`, async ({ page }) => {
        await page.setViewportSize({ width: ancho, height: ancho === 360 ? 740 : 900 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await sembrar(page);
        await page.goto("/pedido/");
        await tema(page, t);
        expect(await axeSerio(page, t === "dark"), "Envío").toEqual([]);
        await page.getByRole("button", { name: /Ver el resumen/ }).click();
        await expect(page.locator(".ds-alerta").first()).toBeVisible();
        expect(await axeSerio(page, t === "dark"), "Envío con errores").toEqual([]);
        await page.getByLabel("Nombre completo").fill("Ana Rueda");
        await page.getByLabel("Celular").fill("300 123 4567");
        await page.getByLabel("Departamento").selectOption("Santander");
        await page.getByLabel("Municipio").selectOption("Bucaramanga");
        await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
        await page.getByRole("button", { name: /Ver el resumen/ }).click();
        await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
        await tema(page, t);
        await boton(page).click({ force: true });
        await expect(page.locator("#e-ter")).toBeVisible();
        expect(await axeSerio(page, t === "dark"), "Resumen con errores").toEqual([]);
        await terminos(page).check();
        await datos(page).check();
        await enviarPorWhatsapp(page);
        await respaldo(page).locator("summary").click();
        await tema(page, t);
        expect(await axeSerio(page, t === "dark"), "Resumen con respaldo").toEqual([]);
        await respaldo(page).screenshot({ path: `docs/qa/capturas/2026-11-18-a1-respaldo-${ancho}-${t}.png` });
      });
    }
  }

  test("error de líneas: una presentación agotada nunca llega al mensaje (el carrito la filtra al cargar y al sincronizar)", async ({ page }) => {
    // La caja «error-lineas» (M9 fila 5) no se puede provocar desde el cliente: el carrito descarta las líneas
    // agotadas antes del Resumen. Se prueba lo que importa: el mensaje no lleva la línea agotada.
    await page.setViewportSize({ width: 360, height: 740 });
    await sembrar(page, [{ cafeSlug: "cafe-arreboles", gramos: 250, molienda: "grano", cantidad: 1 }]);
    // Agota Casa Martínez 250 g solo en el HTML de /pedido/ (los CSV no se tocan): simula un build con el café agotado.
    await page.route(/\/pedido\/(\?.*)?$/, async (r) => {
      const res = await r.fetch();
      const cuerpo = (await res.text()).replace('{\\"gramos\\":250,\\"precioCop\\":30000,\\"disponible\\":true}', '{\\"gramos\\":250,\\"precioCop\\":30000,\\"disponible\\":false}');
      await r.fulfill({ response: res, body: cuerpo });
    });
    await page.goto("/pedido/");
    await page.getByLabel("Nombre completo").fill("Ana Rueda");
    await page.getByLabel("Celular").fill("300 123 4567");
    await page.getByLabel("Departamento").selectOption("Santander");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
    await page.getByRole("button", { name: /Ver el resumen/ }).click();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    await terminos(page).check();
    await datos(page).check();
    const otra = await page.context().newPage();
    await otra.goto("/");
    await otra.getByRole("button", { name: /Agregar Café Casa Martínez/ }).click();
    await otra.close();
    const href = await enviarPorWhatsapp(page);
    expect(textoDe(href)).toContain("Café Arreboles");
    expect(textoDe(href)).not.toContain("Casa Martínez");
    expect(await axeSerio(page)).toEqual([]);
  });
});

test.describe("QA 2026-11-18 · A1 bajo basePath", () => {
  const base = process.env.E2E_BASEPATH_URL;
  const REPO = "/coffee-santander-shop";
  test.skip(!base, "Define E2E_BASEPATH_URL con un build GITHUB_PAGES=true servido bajo /coffee-santander-shop/");

  test("cajón → Envío → Resumen → wa.me con el prefijo; ?paso=confirmacion se reemplaza; «Envío» del indicador vuelve", async ({ page }) => {
    await page.goto(`${base}${REPO}/`);
    await page.waitForLoadState("networkidle");
    await page.evaluate((l) => localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: l })), UNA_BOLSA);
    await page.reload();
    await page.getByRole("banner").getByRole("button", { name: /^Pedido/ }).click();
    const continuar = page.getByRole("dialog", { name: "Tu pedido" }).getByRole("link", { name: /^Continuar con el envío/ });
    await expect(continuar).toHaveAttribute("href", `${REPO}/pedido/`);
    await continuar.click();
    await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
    await page.goto(`${base}${REPO}/pedido/?paso=confirmacion`);
    await expect(page).toHaveURL(new RegExp(`${REPO}/pedido/$`));
    await page.getByLabel("Nombre completo").fill("Ana Rueda");
    await page.getByLabel("Celular").fill("300 123 4567");
    await page.getByLabel("Departamento").selectOption("Santander");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
    await page.getByRole("button", { name: /Ver el resumen/ }).click();
    await expect(page).toHaveURL(new RegExp(`${REPO}/pedido/\\?paso=resumen$`));
    await expect(page.getByRole("list", { name: "Pasos del pedido" }).getByRole("link", { name: /^Envío/ })).toHaveAttribute("href", `${REPO}/pedido/`);
    await terminos(page).check();
    await datos(page).check();
    const href = await enviarPorWhatsapp(page);
    expect(textoDe(href)).toContain(constanciaMensaje());
    expect(numeroDe(href)).toBeTruthy();
  });
});
