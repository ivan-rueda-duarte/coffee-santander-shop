import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Ronda QA 2026-11-14 «paquete del abogado v1.0» (docs/qa/2026-11-14-paquete-abogado-v1.md).
// Verificación independiente: los textos esperados se copian a mano del paquete del abogado (D5 §6.2 a §6.4, D2
// «Aviso de privacidad» y «Textos de las casillas») y NO se leen de los .md ni de config.csv, para no validar el sitio
// contra su propia fuente. Si cambia la versión o la fecha, estas pruebas deben fallar y actualizarse a mano.

const TERMINOS = "Leí y acepto los Términos y condiciones versión 1.0 del 17 de noviembre de 2026.";
const DATOS =
  "Autorizo a De Santander SAS a tratar mis datos personales para gestionar mi pedido: confirmarlo, cobrarlo, coordinar la entrega con la transportadora o el mensajero y emitir la factura. Entiendo que el pedido se envía por WhatsApp (Meta) y que algunos servicios pueden tratar mis datos fuera de Colombia. Leí la Política de tratamiento de datos versión 1.0 del 17 de noviembre de 2026.";
const PROMO_WA =
  "Quiero recibir novedades y promociones de De Santander SAS por WhatsApp, de lunes a viernes de 7:00 a. m. a 7:00 p. m. y sábados de 8:00 a. m. a 3:00 p. m. Puedo cancelarlo cuando quiera escribiendo «BAJA» al mismo chat. Es opcional y no afecta mi pedido.";
const PROMO_CORREO =
  "Quiero recibir novedades y promociones de De Santander SAS por correo electrónico. Puedo cancelarlo cuando quiera con el enlace de cada correo o escribiendo a desantander.tienda@gmail.com. Es opcional y no afecta mi pedido.";
const AVISO_PRIVACIDAD =
  "De Santander SAS (NIT 902.121.184-8, desantander.tienda@gmail.com, WhatsApp +57 300 112 9874) trata los datos de tu pedido para confirmarlo, cobrarlo, entregarlo, facturarlo y atender tu retracto, tus garantías y tus reclamos; y, solo si marcas las casillas aparte, para enviarte promociones por el canal que elijas. Los datos viajan en el mensaje que mandas por WhatsApp (Meta) y se comparten con la transportadora o el mensajero. Algunos servicios los tratan fuera de Colombia. Puedes conocer, corregir o borrar tus datos y retirar tu autorización. Lee la política en /legal/privacidad/.";
const RETRACTO =
  "Puedes retractarte dentro de los 5 días hábiles siguientes a la entrega, salvo si el empaque está abierto o el sello roto. El transporte de la devolución corre por tu cuenta. Te devolvemos el dinero en máximo 15 días calendario, por el medio que prefieras.";
const CONSTANCIA = "Acepto los Términos v1.0 y autorizo el tratamiento de mis datos según la Política v1.0 del 17 de noviembre de 2026.";
const CONFIRMACION_TARIFA = "Pulsa «Enviar por WhatsApp» y manda el mensaje. Con él nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.";
const CONFIRMACION_COTIZAR = "Pulsa «Enviar por WhatsApp» y manda el mensaje. Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.";
const BOTON = "Enviar por WhatsApp";

type Linea = { cafeSlug: string; gramos: number; molienda: "grano" | "molido"; cantidad: number };
const DOS_BOLSAS: Linea[] = [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 2 }];

const graves = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);

async function sembrar(page: Page, lineas: Linea[]) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate((l) => localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: l })), lineas);
}

async function envio(page: Page, departamento: string, municipio: string, extra: Partial<Record<"correo" | "barrio" | "indicaciones" | "codigoPostal" | "documento", string>> = {}) {
  await page.goto("/pedido/?paso=envio");
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  if (extra.correo) await page.getByLabel(/^Correo/).fill(extra.correo);
  if (extra.documento) {
    await page.getByLabel(/^Tipo de documento/).selectOption({ label: "Cédula de ciudadanía" });
    await page.getByLabel(/^Número de documento/).fill(extra.documento);
  }
  await page.getByLabel("Departamento").selectOption(departamento);
  await page.getByLabel("Municipio").selectOption(municipio);
  await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
  if (extra.barrio) await page.getByLabel(/^Barrio/).fill(extra.barrio);
  if (extra.codigoPostal) await page.getByLabel(/^Código postal/).fill(extra.codigoPostal);
  if (extra.indicaciones) await page.getByLabel(/^Indicaciones/).fill(extra.indicaciones);
}

async function resumen(page: Page, departamento: string, municipio: string, lineas: Linea[] = DOS_BOLSAS, extra = {}) {
  await sembrar(page, lineas);
  await envio(page, departamento, municipio, extra);
  await page.getByRole("button", { name: /Finalizar el pedido/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

async function prepararYLeer(page: Page) {
  await page.getByRole("checkbox", { name: TERMINOS, exact: true }).check();
  await page.getByRole("checkbox", { name: DATOS, exact: true }).check();
  await page.getByRole("button", { name: BOTON }).click();
  await expect(page.getByRole("heading", { name: "Tu pedido está listo para enviar por WhatsApp" })).toBeVisible();
  const href = (await page.getByRole("link", { name: /Enviar por WhatsApp/ }).getAttribute("href")) ?? "";
  expect(href.startsWith("https://wa.me/573001129874?text=")).toBe(true);
  return decodeURIComponent(href.split("?text=")[1]);
}

// ---------------------------------------------------------------------------------------------------------
// §7.4 (1): las dos casillas obligatorias cargan sin marcar y bloquean; las de promociones no bloquean.
// ---------------------------------------------------------------------------------------------------------
test.describe("casillas (D5 §6.3, D2 «Textos de las casillas»)", () => {
  test("orden 1 a 4, textos exactos, sin marcar; 1 y 2 bloquean; 3 y 4 nunca bloquean ni desbloquean", async ({ page }) => {
    await resumen(page, "Santander", "Bucaramanga", DOS_BOLSAS, { correo: "ana@ejemplo.co" });
    const nombres = await page.getByRole("checkbox").evaluateAll((els) =>
      els.map((e) => {
        const l = e.closest("label") ?? document.querySelector(`label[for="${e.id}"]`);
        return (l?.textContent ?? "").replace(/\s+/g, " ").trim();
      }),
    );
    expect(nombres).toEqual([TERMINOS, DATOS, PROMO_WA, PROMO_CORREO]);
    for (const n of [TERMINOS, DATOS, PROMO_WA, PROMO_CORREO]) await expect(page.getByRole("checkbox", { name: n, exact: true })).not.toBeChecked();
    const boton = page.getByRole("button", { name: BOTON });
    await expect(boton).toHaveAttribute("aria-disabled", "true");
    // 3 y 4 marcadas no desbloquean.
    await page.getByRole("checkbox", { name: PROMO_WA, exact: true }).check();
    await page.getByRole("checkbox", { name: PROMO_CORREO, exact: true }).check();
    await expect(boton).toHaveAttribute("aria-disabled", "true");
    // Solo la 1: sigue bloqueado. Solo la 2: sigue bloqueado.
    await page.getByRole("checkbox", { name: TERMINOS, exact: true }).check();
    await expect(boton).toHaveAttribute("aria-disabled", "true");
    await page.getByRole("checkbox", { name: TERMINOS, exact: true }).uncheck();
    await page.getByRole("checkbox", { name: DATOS, exact: true }).check();
    await expect(boton).toHaveAttribute("aria-disabled", "true");
    // 1 y 2 sin 3 ni 4: avanza.
    await page.getByRole("checkbox", { name: TERMINOS, exact: true }).check();
    await page.getByRole("checkbox", { name: PROMO_WA, exact: true }).uncheck();
    await page.getByRole("checkbox", { name: PROMO_CORREO, exact: true }).uncheck();
    await expect(boton).not.toHaveAttribute("aria-disabled", /.*/);
    await boton.click();
    await expect(page.getByRole("heading", { name: "Tu pedido está listo para enviar por WhatsApp" })).toBeVisible();
  });

  test("errores exactos de las casillas 1 y 2 al pulsar el botón bloqueado", async ({ page }) => {
    await resumen(page, "Santander", "Bucaramanga");
    await page.getByRole("button", { name: BOTON }).click({ force: true });
    await expect(page.getByText("Debes aceptar los términos para continuar.", { exact: true })).toBeVisible();
    await expect(page.getByText("Debes autorizar el tratamiento de tus datos para continuar.", { exact: true })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: TERMINOS, exact: true })).toBeFocused();
  });

  test("sin correo no existe la casilla 4; al borrar el correo desaparece y no viaja en el mensaje", async ({ page }) => {
    await resumen(page, "Santander", "Bucaramanga");
    await expect(page.getByRole("checkbox")).toHaveCount(3);
    await expect(page.getByRole("checkbox", { name: PROMO_CORREO, exact: true })).toHaveCount(0);
  });

  test("las casillas 1 y 2 enlazan a su documento (los enlaces responden 200)", async ({ page, request }) => {
    await resumen(page, "Santander", "Bucaramanga");
    const c1 = page.getByTestId("casillas-obligatorias").getByRole("link", { name: /Términos y condiciones versión 1\.0/ });
    const c2 = page.getByTestId("casillas-obligatorias").getByRole("link", { name: /Política de tratamiento de datos versión 1\.0/ });
    await expect(c1).toHaveAttribute("href", "/legal/terminos/");
    await expect(c2).toHaveAttribute("href", "/legal/privacidad/");
    for (const h of ["/legal/terminos/", "/legal/privacidad/"]) expect((await request.get(h)).status()).toBe(200);
  });
});

// ---------------------------------------------------------------------------------------------------------
// Aviso de privacidad (D2) y texto de pago (D5 §6.3) en el formulario.
// ---------------------------------------------------------------------------------------------------------
test("formulario: aviso de privacidad exacto con enlace; texto fijo de pago; sin campo ni palabra «forma de pago»", async ({ page }) => {
  await sembrar(page, DOS_BOLSAS);
  await page.goto("/pedido/?paso=envio");
  await expect(page.getByTestId("aviso-privacidad")).toHaveText(AVISO_PRIVACIDAD);
  await expect(page.getByTestId("aviso-privacidad").getByRole("link", { name: "/legal/privacidad/" })).toHaveAttribute("href", "/legal/privacidad/");
  await expect(page.getByText("Pagas por transferencia bancaria o por Bre-B después de aceptar el total por WhatsApp. En esta página no se paga.", { exact: true })).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(0);
  expect(await page.locator("main").innerText()).not.toMatch(/forma de pago|contraentrega|efectivo/i);
});

// ---------------------------------------------------------------------------------------------------------
// Resumen (D5 §6.3) y plazos 3/6/6/10 (LEG-143), escritos a mano.
// ---------------------------------------------------------------------------------------------------------
const PLAZOS: [zona: number, dep: string, mun: string, destino: string, estimado: string, maximo: string][] = [
  [1, "Santander", "Bucaramanga", "Bucaramanga", "el mismo día o el siguiente día hábil", "3 días hábiles"],
  [2, "Santander", "San Gil", "San Gil", "de 1 a 3 días hábiles", "6 días hábiles"],
  [3, "Bogotá, D.C.", "Bogotá, D.C.", "Bogotá", "de 1 a 3 días hábiles", "6 días hábiles"],
  [4, "Chocó", "Quibdó", "Quibdó", "de 2 a 6 días hábiles", "10 días hábiles"],
];
for (const [zona, dep, mun, destino, estimado, maximo] of PLAZOS) {
  test(`resumen zona ${zona} (${mun}): línea de envío, plazo ${maximo}, retracto, vendedor y confirmación con tarifa`, async ({ page }) => {
    await resumen(page, dep, mun);
    await expect(page.getByTestId("linea-envio")).toContainText(`Envío a ${destino} · zona ${zona}`);
    await expect(page.getByTestId("linea-envio")).toContainText(/\$[\d.]+/);
    await expect(page.getByTestId("linea-envio")).toContainText("(IVA incluido)");
    await expect(page.getByTestId("linea-plazo")).toHaveText(`Entrega estimada: ${estimado}. Plazo máximo: ${maximo}, contado desde el día hábil siguiente a tu pago.`);
    await expect(page.getByTestId("aviso-retracto")).toHaveText(RETRACTO);
    await expect(page.getByTestId("linea-vendedor")).toHaveText("Te vende De Santander SAS · NIT 902.121.184-8 · Información del vendedor");
    await expect(page.getByTestId("linea-vendedor").getByRole("link", { name: "Información del vendedor" })).toHaveAttribute("href", "/legal/vendedor/");
    await expect(page.getByTestId("linea-total")).toHaveText(/^Total\s*\$/);
    await prepararYLeer(page);
    await expect(page.getByTestId("texto-confirmacion")).toHaveText(CONFIRMACION_TARIFA);
  });
}

test("resumen por cotizar (Leticia): línea, «Total sin envío», nota y confirmación por cotizar exactas", async ({ page }) => {
  await resumen(page, "Amazonas", "Leticia");
  // Se pinta como rótulo «Envío» + valor (el plazo va debajo del rótulo): mismo texto de D5 §6.3 en dos piezas.
  await expect(page.getByTestId("linea-envio")).toContainText("por cotizar · te confirmamos el valor por WhatsApp antes de que pagues");
  await expect(page.getByTestId("linea-total")).toHaveText(/^Total sin envío\s*\$60\.000$/);
  await expect(page.getByTestId("aviso-por-cotizar")).toHaveText("Este valor no incluye el envío. Te lo informamos por WhatsApp y tú decides si lo aceptas antes de pagar.");
  const texto = await prepararYLeer(page);
  await expect(page.getByTestId("texto-confirmacion")).toHaveText(CONFIRMACION_COTIZAR);
  expect(texto).toContain("\nEnvío: POR COTIZAR (zona 5 o más de 5 kg)\nTotal sin envío: $60.000\n");
  expect(texto.endsWith(`${CONSTANCIA}\nQuedo atento al valor del envío para confirmar mi pedido.`)).toBe(true);
});

// ---------------------------------------------------------------------------------------------------------
// Mensaje (D5 §6.4) completo, línea por línea, con todos los campos y las dos promociones.
// ---------------------------------------------------------------------------------------------------------
test("mensaje D5 §6.4 línea por línea con todos los campos y promociones por WhatsApp y correo", async ({ page }) => {
  await resumen(page, "Bogotá, D.C.", "Bogotá, D.C.", [
    { cafeSlug: "cafe-casa-martinez", gramos: 500, molienda: "molido", cantidad: 1 },
    { cafeSlug: "cafe-arreboles", gramos: 250, molienda: "grano", cantidad: 2 },
  ], { correo: "ana@ejemplo.co", documento: "1098765432", barrio: "Chapinero", codigoPostal: "110231", indicaciones: "Portería norte" });
  await page.getByRole("checkbox", { name: PROMO_WA, exact: true }).check();
  await page.getByRole("checkbox", { name: PROMO_CORREO, exact: true }).check();
  const texto = await prepararYLeer(page);
  const l = texto.split("\n");
  const ds = l[0].match(/N\.° (DS-\d{6}-\d{4}-[A-Z2-9]{4}) /)?.[1];
  expect(ds, l[0]).toBeTruthy();
  const envioLinea = l.find((x) => x.startsWith("Envío: zona 3, $")) ?? "";
  const totalLinea = l.find((x) => x.startsWith("Total: $")) ?? "";
  expect(l).toEqual([
    `¡Hola, De Santander! Envío mi solicitud de compra N.° ${ds} para que me confirmen el total con el envío.`,
    "",
    "• Café Casa Martínez (Guanentá) — Molido — 500 g × 1 = $47.000",
    "• Café Arreboles (Soto Norte) — Grano — 250 g × 2 = $46.000",
    "",
    "Subtotal de productos: $93.000 (IVA del 5 % incluido)",
    envioLinea,
    totalLinea,
    "",
    "Envío a:",
    "Nombre: Ana Rueda",
    "Celular: 300 123 4567",
    "Correo: ana@ejemplo.co",
    "Documento: CC 1098765432",
    "Departamento y municipio: Bogotá, D.C., Bogotá, D.C.",
    "Dirección: Calle 45 # 12-30 · Barrio: Chapinero",
    "Código postal: 110231",
    "Indicaciones: Portería norte",
    "Pago: transferencia o Bre-B",
    "",
    CONSTANCIA,
    "Autorizo recibir promociones por WhatsApp y correo.",
  ]);
  expect(envioLinea).toMatch(/^Envío: zona 3, \$[\d.]+ \(IVA incluido\)$/);
  expect(texto.length).toBeLessThan(2000);
  expect(texto).not.toMatch(/molienda|Grano entero|Forma de pago|contraentrega|S\.A\.S/i);
});

test("el número DS cambia en cada preparación y no queda en el navegador", async ({ page }) => {
  await resumen(page, "Santander", "Bucaramanga");
  const a = (await prepararYLeer(page)).split("\n")[0];
  await page.goto("/pedido/?paso=resumen");
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible({ timeout: 5000 }).catch(() => undefined);
  const almacen = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }) + document.cookie);
  expect(almacen).not.toMatch(/DS-\d{6}/);
  expect(a).toMatch(/DS-\d{6}-\d{4}-/);
});

// ---------------------------------------------------------------------------------------------------------
// Datos personales: solo el carrito en localStorage; nada en URL, sessionStorage, cookies ni red externa.
// ---------------------------------------------------------------------------------------------------------
test("flujo desde la ficha: Molido + 500 g; localStorage = solo líneas; sin datos en URL, cookies ni peticiones externas", async ({ page }) => {
  const externas: string[] = [];
  const urls: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://localhost")) externas.push(r.url());
  });
  page.on("framenavigated", (f) => urls.push(f.url()));
  await page.goto("/cafes/cafe-casa-martinez/");
  await page.getByRole("radio", { name: "Molido" }).check({ force: true });
  await page.getByRole("radio", { name: /500 g/ }).check({ force: true });
  await expect(page.getByRole("radio", { name: "Molido" })).toBeChecked();
  await page.getByRole("button", { name: "Agregar al pedido" }).click();
  await page.goto("/pedido/?paso=envio");
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByLabel(/^Correo/).fill("ana@ejemplo.co");
  await page.getByLabel("Departamento").selectOption("Santander");
  await page.getByLabel("Municipio").selectOption("Bucaramanga");
  await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
  await page.getByRole("button", { name: /Finalizar el pedido/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
  await expect(page.locator("main")).toContainText("Molido");
  const texto = await prepararYLeer(page);
  expect(texto).toContain("— Molido — 500 g × 1 = $47.000");
  const almacen = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie }));
  expect(Object.keys(almacen.local)).toEqual(["desantander.carrito.v2"]);
  expect(JSON.parse(almacen.local["desantander.carrito.v2"])).toEqual({ version: 2, lineas: [{ cafeSlug: "cafe-casa-martinez", gramos: 500, molienda: "molido", cantidad: 1 }] });
  expect(JSON.stringify(almacen.session)).not.toMatch(/Ana|300 ?123|Calle 45|ejemplo|Bucaramanga/);
  expect(almacen.cookies).toBe("");
  for (const u of [...urls, page.url()]) expect(u).not.toMatch(/Ana|300|Calle|ejemplo|Bucaramanga|bucaramanga|correo|celular/i);
  expect(externas).toEqual([]);
});

// ---------------------------------------------------------------------------------------------------------
// Pie (§7.4 último punto; decisión del dueño P38 = b): datos del vendedor sin dirección de notificación.
// ---------------------------------------------------------------------------------------------------------
for (const vp of [{ width: 360, height: 740 }, { width: 1440, height: 900 }]) {
  test(`pie a ${vp.width} px: vendedor visible, sin dirección de notificación, 4 enlaces legales que responden 200`, async ({ page, request }) => {
    await page.setViewportSize(vp);
    await page.goto("/cafes/");
    const pie = page.locator("footer").last();
    await pie.scrollIntoViewIfNeeded();
    for (const t of ["De Santander SAS · NIT 902.121.184-8", "Domicilio: Bucaramanga, Santander", "desantander.tienda@gmail.com", "+57 300 112 9874", "Transferencia bancaria o Bre-B"]) await expect(pie.getByText(t, { exact: false }).first()).toBeVisible();
    await expect(pie).not.toContainText(/23-77|Calle 37|calle 37|notificación judicial: Calle|Rueda Duarte|740574/);
    const destinos = { "Términos y condiciones": "/legal/terminos/", "Tratamiento de datos": "/legal/privacidad/", "Envíos, devoluciones, retracto y garantía": "/envios/", "Información del vendedor": "/legal/vendedor/" };
    for (const [nombre, href] of Object.entries(destinos)) {
      await expect(pie.getByRole("link", { name: nombre, exact: true })).toHaveAttribute("href", href);
      expect((await request.get(href)).status()).toBe(200);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

// ---------------------------------------------------------------------------------------------------------
// LEG-155 / D5 §6.6: ningún texto, tampoco el nombre accesible, dice «grano entero» o «molienda» (QA-017).
// ---------------------------------------------------------------------------------------------------------
test("QA-017: el nombre accesible de «Agregar» en las tarjetas no dice «grano entero»", async ({ page }) => {
  for (const ruta of ["/", "/cafes/", "/provincias/guanenta/", "/provincias/soto/"]) {
    await page.goto(ruta);
    const nombres = await page.locator("[aria-label]").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? ""));
    expect(nombres.filter((n) => /grano entero|molienda/i.test(n)), ruta).toEqual([]);
  }
});

// ---------------------------------------------------------------------------------------------------------
// Accesibilidad: axe en las páginas de esta ronda, a 360 y 1440.
// ---------------------------------------------------------------------------------------------------------
for (const vp of [{ width: 360, height: 740 }, { width: 1440, height: 900 }]) {
  test(`axe a ${vp.width} px: catálogo, provincia, /envios/, remisión, legales y resumen con 4 casillas`, async ({ page }) => {
    await page.setViewportSize(vp);
    for (const ruta of ["/cafes/", "/provincias/soto/", "/envios/", "/legal/envios-devoluciones/", "/legal/terminos/", "/legal/privacidad/", "/legal/vendedor/"]) {
      await page.goto(ruta);
      expect(await graves(page), ruta).toEqual([]);
    }
    await resumen(page, "Santander", "Bucaramanga", DOS_BOLSAS, { correo: "ana@ejemplo.co" });
    expect(await graves(page), "resumen").toEqual([]);
    await page.screenshot({ path: `docs/qa/capturas/2026-11-14-resumen-casillas-${vp.width}.png`, fullPage: true });
  });
}

test("/legal/envios-devoluciones/: remisión con enlace a /envios/, noindex y canónica a /envios/ si hay URL pública", async ({ page }) => {
  await page.goto("/legal/envios-devoluciones/");
  await expect(page.locator("main")).toContainText("Este documento está en Envíos (/envios/).");
  await expect(page.locator("main").getByRole("link", { name: /\/envios\/|Envíos/ }).first()).toHaveAttribute("href", "/envios/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
