import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { AVISO_RETRACTO, constanciaMensaje, estadoEnvioGratisE2E, fechaEnLetras, leerConfig, TEXTO_PAGO_FORMULARIO, textosCasillas } from "./ayudas";

// Ronda QA 2026-11-06 «paquete legal v1» (docs/qa/2026-11-06-paquete-legal-v1.md), actualizada el 2026-11-14 al
// paquete del abogado v1.0 (docs/legal/revisiones/2026-11-14-paquete-abogado-v1.md, LEG-140 a LEG-167; pruebas de §7.4).
// Verificación independiente de la entrega de docs/legal/revisiones/2026-11-06-paquete-v1.md contra
// docs/legal/microcopy-legal.md v1.0 y la sección «## Texto para el consumidor» de los documentos legales.
// Los valores esperados se leen de los .md y de data/*.csv con un extractor propio (no el del sitio).

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

// ---------------------------------------------------------------------------------------------------------
// 1. Páginas legales letra por letra
// ---------------------------------------------------------------------------------------------------------

// Títulos h1 del paquete v1.0; D3 se publica en /envios/ (LEG-141).
const LEGALES = [
  { ruta: "/legal/terminos/", archivo: "terminos-y-condiciones.md", titulo: "Términos y condiciones de compra" },
  { ruta: "/legal/privacidad/", archivo: "politica-tratamiento-datos.md", titulo: "Política de tratamiento de datos personales" },
  { ruta: "/envios/", archivo: "envios-devoluciones-retracto.md", titulo: "Envíos, devoluciones, retracto y garantía" },
  { ruta: "/legal/vendedor/", archivo: "informacion-vendedor.md", titulo: "Información del vendedor" },
];

/** Valores entre llaves que pone el código (paquete §0; LEG-142). */
const VALORES: Record<string, string> = {
  version_terminos: leerConfig("version_terminos"),
  fecha_terminos: fechaEnLetras(leerConfig("fecha_terminos")),
  version_politica_datos: leerConfig("version_politica_datos"),
  fecha_politica_datos: fechaEnLetras(leerConfig("fecha_politica_datos")),
};
const sustituir = (t: string) => t.replace(/\{([a-z_]+)\}/g, (m, k: string) => VALORES[k] ?? m);

type BloqueEsperado = [etiqueta: "H2" | "P" | "LI", texto: string];

/** Extractor propio de «## Texto para el consumidor»: ### → h2, «- » y «N. » → li, resto → p. */
function textoConsumidor(archivo: string): BloqueEsperado[] {
  const lineas = readFileSync(`docs/legal/${archivo}`, "utf8").split(/\r?\n/);
  const inicio = lineas.findIndex((l) => l.trim() === "## Texto para el consumidor");
  expect(inicio, `${archivo} sin «## Texto para el consumidor»`).toBeGreaterThan(-1);
  const salida: BloqueEsperado[] = [];
  for (const cruda of lineas.slice(inicio + 1)) {
    const l = sustituir(cruda.trim());
    if (l.startsWith("## ") || l === "---") break;
    if (!l) continue;
    if (l.startsWith("### ")) salida.push(["H2", l.slice(4)]);
    else if (l.startsWith("- ")) salida.push(["LI", l.slice(2)]);
    else if (/^\d+\.\s+/.test(l)) salida.push(["LI", l.replace(/^\d+\.\s+/, "")]);
    else salida.push(["P", l]);
  }
  return salida;
}

test.describe("páginas legales 1.0: texto público letra por letra", () => {
  for (const doc of LEGALES) {
    test(`${doc.ruta}: título, rótulo, texto idéntico al .md y sin marcadores`, async ({ page }) => {
      const respuesta = await page.goto(doc.ruta);
      expect(respuesta?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(doc.titulo);
      // §7.4: versión 1.0 y fecha del 17/11/2026, leídas de config.csv.
      const version = doc.archivo === "politica-tratamiento-datos.md" ? "version_politica_datos" : "version_terminos";
      const fecha = doc.archivo === "politica-tratamiento-datos.md" ? "fecha_politica_datos" : "fecha_terminos";
      await expect(page.getByTestId("rotulo-legal")).toHaveText(`Versión ${leerConfig(version)} · vigente desde el ${fechaEnLetras(leerConfig(fecha))}`);
      await expect(page.getByTestId("rotulo-legal")).toHaveText("Versión 1.0 · vigente desde el 17 de noviembre de 2026");
      await expect(page).toHaveTitle(new RegExp(`^${doc.titulo}`));

      // Lo generado de los CSV (tabla de tarifas de /envios/, aviso de la promoción terminada) no es texto del documento.
      const publicado = await page.locator("article .body-l").first().evaluate((cont) => {
        const salida: [string, string][] = [];
        for (const el of Array.from(cont.children)) {
          if (el.tagName === "SECTION" || el.hasAttribute("data-testid")) continue;
          if (el.tagName === "UL" || el.tagName === "OL") for (const li of Array.from(el.children)) salida.push(["LI", li.textContent ?? ""]);
          else salida.push([el.tagName, el.textContent ?? ""]);
        }
        return salida;
      });
      expect(publicado).toEqual(textoConsumidor(doc.archivo));

      const texto = await page.locator("main").innerText();
      expect(texto).not.toMatch(/en preparación|TODO|VERIFICAR|DECISIÓN|BORRADOR|\[|\]|\{|\}|\*\*|`|<!--/);
    });
  }

  test("/legal/vendedor/: D4 sin el dl duplicado; la lista coincide con config.csv e incluye la dirección de notificación (LEG-148)", async ({ page }) => {
    await page.goto("/legal/vendedor/");
    await expect(page.getByTestId("datos-vendedor")).toHaveCount(0);
    await expect(page.locator("main dl")).toHaveCount(0);
    const items = await page.locator("article .body-l li").allTextContents();
    expect(items).toEqual([
      `Razón social: ${leerConfig("razon_social")}`,
      `NIT: ${leerConfig("nit")}`,
      `Matrícula mercantil: ${leerConfig("matricula_mercantil")}`,
      `Representante legal: ${leerConfig("representante_legal")}`,
      `Domicilio: ${leerConfig("domicilio")}`,
      `Dirección de notificación judicial: ${leerConfig("direccion_notificacion")}`,
      `Correo de notificación judicial: ${leerConfig("correo_notificacion")}`,
      `Correo de atención: ${leerConfig("correo_contacto")}`,
      "WhatsApp y teléfono: +57 300 112 9874",
      `Despachamos desde: ${leerConfig("ciudad_despacho")}, Santander`,
    ]);
  });

  test("/legal/privacidad/: D2 §13 con las llaves sustituidas (LEG-142)", async ({ page }) => {
    await page.goto("/legal/privacidad/");
    await expect(page.getByText(/^Esta política rige desde el 17 de noviembre de 2026 \(versión 1\.0\)\./)).toBeVisible();
  });

  for (const vp of VIEWPORTS) {
    test(`QA-007 a ${vp.width} px: las cuatro páginas legales sin violaciones serias de axe ni desborde`, async ({ page }) => {
      await page.setViewportSize(vp);
      for (const doc of LEGALES) {
        await page.goto(doc.ruta);
        expect(await graves(page), doc.ruta).toEqual([]);
        expect(await sinDesborde(page), doc.ruta).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------------------------------------
// 2–3. Resumen del pedido y mensaje de WhatsApp
// ---------------------------------------------------------------------------------------------------------

type Linea = { cafeSlug: string; gramos: number; molienda: "grano" | "molido"; cantidad: number };

async function sembrar(page: Page, lineas: Linea[]) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate((lineas) => localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas })), lineas);
}

const DATOS = {
  nombre: "Ana Rueda",
  celular: "300 123 4567",
  direccion: "Calle 45 # 12-30",
};

async function llenarEnvio(page: Page, departamento: string, municipio: string, extra: { correo?: string; barrio?: string; indicaciones?: string } = {}) {
  await page.goto("/pedido/?paso=envio");
  await page.getByLabel("Nombre completo").fill(DATOS.nombre);
  await page.getByLabel("Celular").fill(DATOS.celular);
  if (extra.correo) await page.getByLabel(/^Correo/).fill(extra.correo);
  await page.getByLabel("Departamento").selectOption(departamento);
  await page.getByLabel("Municipio").selectOption(municipio);
  await page.getByLabel("Dirección").fill(DATOS.direccion);
  if (extra.barrio) await page.getByLabel(/^Barrio/).fill(extra.barrio);
  if (extra.indicaciones) await page.getByLabel(/^Indicaciones/).fill(extra.indicaciones);
}

async function irAlResumen(page: Page, departamento: string, municipio: string, lineas: Linea[] = [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 2 }], extra = {}) {
  await sembrar(page, lineas);
  await llenarEnvio(page, departamento, municipio, extra);
  await page.getByRole("button", { name: /Finalizar el pedido/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

async function mensaje(page: Page) {
  await page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ }).check();
  await page.getByRole("checkbox", { name: /acepto los Términos y condiciones/ }).check();
  await page.getByRole("button", { name: "Enviar por WhatsApp" }).click();
  const href = (await page.getByRole("link", { name: /Enviar por WhatsApp/ }).getAttribute("href")) ?? "";
  expect(href.startsWith("https://wa.me/573001129874?text=")).toBe(true);
  return decodeURIComponent(href.split("?text=")[1]);
}

const PLAZOS = Object.fromEntries(
  readFileSync("data/plazos_envio.csv", "utf8").trim().split("\n").slice(1).map((l) => {
    const [zona, estimado, maximo] = l.split(",");
    return [zona, { estimado, maximo }];
  }),
);

// D5 §6.3: «Te vende De Santander SAS · NIT 902.121.184-8 · Información del vendedor».
const LINEA_VENDEDOR = `Te vende ${leerConfig("razon_social")} · NIT ${leerConfig("nit")} · Información del vendedor`;
const NOTA_PRECIO = "Los precios incluyen todos los impuestos y el envío se muestra por separado (art. 50 de la Ley 1480 de 2011). Más en envíos, devoluciones, retracto y garantía.";
// D5 §6.2.
const LEYENDA_IVA = `Precio con IVA del ${leerConfig("iva_tarifa")} % incluido.`;
const CONSTANCIA = constanciaMensaje();

test.describe("resumen del pedido (paquete legal v1)", () => {
  const casos = [
    { zona: "1", departamento: "Santander", municipio: "Bucaramanga" },
    { zona: "4", departamento: "Chocó", municipio: "Quibdó" },
    { zona: "5", departamento: "Amazonas", municipio: "Leticia" },
  ];
  for (const c of casos) {
    test(`zona ${c.zona} (${c.municipio}): plazo, leyenda de IVA, nota del precio, retracto, vendedor y casillas`, async ({ page }) => {
      await irAlResumen(page, c.departamento, c.municipio);
      const p = PLAZOS[c.zona];
      // D5 §6.3 (LEG-143): zona 5 con su propia fila de plazos_envio.csv.
      await expect(page.getByTestId("linea-plazo")).toHaveText(`Entrega estimada: ${p.estimado}. Plazo máximo: ${p.maximo}, contado desde el día hábil siguiente a tu pago.`);
      await expect(page.getByTestId("leyenda-iva")).toHaveText(LEYENDA_IVA);
      await expect(page.getByTestId("nota-precio-total")).toHaveText(NOTA_PRECIO);
      await expect(page.getByTestId("nota-precio-total").getByRole("link", { name: "envíos, devoluciones, retracto y garantía" })).toHaveAttribute("href", "/envios/");
      await expect(page.getByTestId("resumen-pago")).toHaveText("Pago: transferencia o Bre-B");
      await expect(page.getByTestId("aviso-retracto")).toHaveText(AVISO_RETRACTO);
      await expect(page.getByTestId("linea-vendedor")).toHaveText(LINEA_VENDEDOR);
      await expect(page.getByTestId("linea-vendedor")).not.toContainText(/Rueda Duarte|740574|Matrícula|Representante/);

      const casillas = textosCasillas();
      expect(casillas.enlacePolitica).toBe("Política de tratamiento de datos versión 1.0 del 17 de noviembre de 2026");
      expect(casillas.enlaceTerminos).toBe("Términos y condiciones versión 1.0 del 17 de noviembre de 2026");
      await expect(page.getByRole("checkbox", { name: casillas.autorizacion, exact: true })).not.toBeChecked();
      await expect(page.getByRole("checkbox", { name: casillas.terminos, exact: true })).not.toBeChecked();
      await expect(page.getByRole("checkbox", { name: casillas.promoWhatsapp, exact: true })).not.toBeChecked();
      await expect(page.getByRole("button", { name: "Enviar por WhatsApp" })).toBeDisabled();
      // §7.4: las promociones no desbloquean ni bloquean.
      await page.getByRole("checkbox", { name: casillas.promoWhatsapp, exact: true }).check();
      await expect(page.getByRole("button", { name: "Enviar por WhatsApp" })).toBeDisabled();
    });
  }

  test("QA-006: el botón deshabilitado explica qué falta (texto visible y asociado con aria-describedby)", async ({ page }) => {
    await irAlResumen(page, "Santander", "Bucaramanga");
    const boton = page.getByRole("button", { name: "Enviar por WhatsApp" });
    await expect(boton).toBeDisabled();
    // Un lector de pantalla o quien navega con Tab no llega al botón deshabilitado ni sabe por qué no avanza:
    // debe haber una indicación visible, junto al botón, enlazada con aria-describedby.
    const describedby = await boton.getAttribute("aria-describedby");
    expect(describedby, "el botón deshabilitado no tiene aria-describedby").toBeTruthy();
    const ayuda = page.locator(`[id="${describedby}"]`);
    await expect(ayuda).toBeVisible();
    await expect(ayuda).toHaveText(/casilla/i);

    // Vía elegida (microcopy §5.9 v1.1, LEG-101/102): sin `disabled`, con aria-disabled; textos exactos por caso.
    await expect(boton).not.toHaveAttribute("disabled", /.*/);
    await expect(boton).toHaveAttribute("aria-disabled", "true");
    const AYUDA_DOS = "Para preparar tu pedido, marca las dos casillas: los términos y condiciones y la autorización de tus datos.";
    const AYUDA_DATOS = "Para preparar tu pedido, falta que autorices el tratamiento de tus datos.";
    const AYUDA_TERMINOS = "Para preparar tu pedido, falta que aceptes los términos y condiciones.";
    const ERROR_DATOS = "Debes autorizar el tratamiento de tus datos para continuar.";
    const ERROR_TERMINOS = "Debes aceptar los términos para continuar.";
    await expect(ayuda).toHaveText(AYUDA_DOS);
    await expect(ayuda).not.toHaveAttribute("aria-live", /.*/);

    const autorizacion = page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ });
    const terminos = page.getByRole("checkbox", { name: /acepto los Términos y condiciones/ });

    // El botón recibe foco con el teclado y, al pulsarlo, no avanza: errores bajo cada casilla y foco a la primera sin marcar.
    await boton.focus();
    await expect(boton).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Enviar por WhatsApp/ })).toHaveCount(0);
    await expect(page.locator('a[href^="https://wa.me/"]').filter({ hasText: /Enviar/ })).toHaveCount(0);
    await expect(autorizacion).not.toBeChecked();
    await expect(terminos).not.toBeChecked();
    // D5 §6.3: términos es la casilla 1; el foco va a ella.
    await expect(terminos).toBeFocused();
    for (const [casilla, texto] of [[autorizacion, ERROR_DATOS], [terminos, ERROR_TERMINOS]] as const) {
      await expect(casilla).toHaveAttribute("aria-invalid", "true");
      const id = await casilla.getAttribute("aria-describedby");
      expect(id).toBeTruthy();
      await expect(page.locator(`[id="${id}"]`)).toHaveText(texto);
    }
    expect(await graves(page)).toEqual([]);

    // Al marcar la de datos su error desaparece y la microayuda cambia al caso que falta.
    await autorizacion.check();
    await expect(autorizacion).not.toHaveAttribute("aria-invalid", /.*/);
    await expect(page.getByText(ERROR_DATOS)).toHaveCount(0);
    await expect(ayuda).toHaveText(AYUDA_TERMINOS);
    await boton.click({ force: true });
    await expect(terminos).toBeFocused();
    await expect(terminos).not.toBeChecked();

    // Solo falta la de datos.
    await terminos.check();
    await autorizacion.uncheck();
    await expect(ayuda).toHaveText(AYUDA_DATOS);
    await expect(boton).toHaveAttribute("aria-disabled", "true");

    // Con las dos marcadas: sin microayuda ni aria-disabled, y avanza.
    await autorizacion.check();
    await expect(page.getByText(/^Para preparar tu pedido/)).toHaveCount(0);
    await expect(boton).not.toHaveAttribute("aria-disabled", /.*/);
    await expect(boton).not.toHaveAttribute("aria-describedby", /.*/);
    await boton.click();
    await expect(page.getByRole("heading", { name: "Tu pedido está listo para enviar por WhatsApp" })).toBeVisible();
  });

  test("§7.4 mensaje con tarifa (zona 1): solicitud DS, líneas, subtotal con IVA, envío, total y versiones", async ({ page }) => {
    await irAlResumen(page, "Santander", "Bucaramanga");
    const texto = await mensaje(page);
    const lineas = texto.split("\n");
    expect(lineas[0]).toMatch(/^¡Hola, De Santander! Envío mi solicitud de compra N\.° DS-\d{6}-\d{4}-[A-Z2-9]{4} para que me confirmen el total con el envío\.$/);
    expect(texto).toContain("• Café Casa Martínez (Guanentá) — Grano — 250 g × 2 = ");
    expect(texto).toContain("Subtotal de productos: $60.000 (IVA del 5 % incluido)");
    expect(texto).toMatch(/^Envío: zona 1, \$[\d.]+ \(IVA incluido\)$/m);
    expect(texto).toMatch(/^Total: \$[\d.]+$/m);
    expect(lineas[lineas.length - 1]).toBe(CONSTANCIA);
    expect(lineas[lineas.length - 2]).toBe("");
    expect(lineas[lineas.length - 3]).toBe("Pago: transferencia o Bre-B");
    expect(CONSTANCIA).toBe("Acepto los Términos v1.0 y autorizo el tratamiento de mis datos según la Política v1.0 del 17 de noviembre de 2026.");
    expect(texto).not.toMatch(/finalizar|sin IVA|promociones|contraentrega/i);
    expect(texto.length).toBeLessThan(2000);
  });

  test("§7.4 mensaje con promociones por WhatsApp: línea de promociones después de la constancia", async ({ page }) => {
    await irAlResumen(page, "Santander", "Bucaramanga");
    await page.getByRole("checkbox", { name: textosCasillas().promoWhatsapp, exact: true }).check();
    const texto = await mensaje(page);
    expect(texto.endsWith(`${CONSTANCIA}\nAutorizo recibir promociones por WhatsApp.`)).toBe(true);
  });

  test("mensaje en el peor caso (8 líneas × 20, todos los opcionales y 300 caracteres de indicaciones): < 2.000 y constancia intacta", async ({ page }) => {
    const lineas: Linea[] = [];
    for (const cafeSlug of ["cafe-casa-martinez", "cafe-arreboles"]) for (const gramos of [250, 500]) for (const molienda of ["grano", "molido"] as const) lineas.push({ cafeSlug, gramos, molienda, cantidad: 20 });
    const indicaciones = "Portería sur, torre 3, apartamento 1204; llamar antes de subir. ".repeat(6).slice(0, 300);
    await irAlResumen(page, "Santander", "Bucaramanga", lineas, { correo: "ana.rueda.compras.oficina@ejemplo-empresa-largo.com.co", barrio: "Cabecera del Llano, sector comercial", indicaciones });
    const texto = await mensaje(page);
    expect(texto.length).toBeLessThan(2000);
    expect(texto.split("\n").filter((l) => l.startsWith("• "))).toHaveLength(8);
    expect(texto).toContain("Envío: POR COTIZAR (zona 5 o más de 5 kg)");
    expect(texto.endsWith(`${CONSTANCIA}\nQuedo atento al valor del envío para confirmar mi pedido.`)).toBe(true);
    expect(texto.split("\n")[0]).toMatch(/^¡Hola, De Santander! Envío mi solicitud de compra N\.° DS-/);
  });

  for (const vp of VIEWPORTS) {
    test(`a ${vp.width} px: resumen sin violaciones serias de axe ni desborde`, async ({ page }) => {
      await page.setViewportSize(vp);
      await irAlResumen(page, "Amazonas", "Leticia");
      expect(await graves(page)).toEqual([]);
      expect(await sinDesborde(page)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------------------------------------
// 4. Pie
// ---------------------------------------------------------------------------------------------------------

test.describe("pie con el vendedor (D4; §7.4: celular 360 × 740 y escritorio)", () => {
  for (const vp of [{ width: 360, height: 740 }, { width: 1440, height: 900 }]) {
    test(`a ${vp.width} px: líneas del vendedor sin dirección de notificación (P38 = b), envíos y pagos de D5, © con IVA, axe y sin desborde`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/");
      const lineas = await page.getByTestId("pie-vendedor").locator("p").allTextContents();
      expect(lineas).toEqual([
        `${leerConfig("razon_social")} · NIT ${leerConfig("nit")}`,
        `Domicilio: ${leerConfig("domicilio")}`,
        `Correo de atención y de notificación judicial: ${leerConfig("correo_contacto")}`,
        "WhatsApp +57 300 112 9874",
      ]);
      await expect(page.getByTestId("pie-vendedor").getByRole("link", { name: leerConfig("correo_contacto") })).toHaveAttribute("href", `mailto:${leerConfig("correo_contacto")}`);
      await expect(page.getByTestId("pie-copyright")).toHaveText(`© ${new Date().getFullYear()} De Santander SAS. Precios en pesos colombianos, con IVA del 5 % incluido.`);
      await expect(page.locator("footer")).toContainText("Café de origen de provincias de Santander, Colombia.");
      await expect(page.locator("footer")).not.toContainText(/Rueda Duarte|740574|Matrícula|Representante|Calle 37/);
      await expect(page.locator("footer")).toContainText("Enviamos a todo Colombia desde Bucaramanga. Ves el valor del envío en tu carrito; en algunos destinos y en pedidos de más de 5 kg te lo confirmamos por WhatsApp antes de que pagues.");
      await expect(page.locator("footer")).toContainText("Transferencia bancaria o Bre-B");
      const legales = await page.locator("footer ul a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
      expect(legales).toEqual(["/legal/terminos/", "/legal/privacidad/", "/envios/", "/legal/vendedor/"]);
      for (const l of await page.getByTestId("pie-vendedor").locator("p").all()) await expect(l).toBeVisible();
      await page.locator("footer").scrollIntoViewIfNeeded();
      expect(await graves(page)).toEqual([]);
      expect(await sinDesborde(page)).toBe(true);
      await page.locator("footer").screenshot({ path: `docs/qa/capturas/pie-vendedor-${vp.width}.png` });
    });
  }

  test("HTML estático de inicio sin nombre del representante ni matrícula", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).not.toMatch(/Rueda Duarte|740574/);
  });
});

// ---------------------------------------------------------------------------------------------------------
// 5. Fichas
// ---------------------------------------------------------------------------------------------------------

async function filasFicha(page: Page) {
  return page.locator("#ficha-tecnica + dl > div").evaluateAll((ds) => ds.map((d) => [d.querySelector("dt")?.textContent ?? "", d.querySelector("dd")?.textContent ?? ""]));
}

test.describe("ficha del café (microcopy §3)", () => {
  test("Casa Martínez: notificación sanitaria, Comercializa, «Presentación: Grano · Molido», IVA y JSON-LD sin brand De Santander", async ({ page }) => {
    await page.goto("/cafes/cafe-casa-martinez/");
    const filas = await filasFicha(page);
    expect(filas).toContainEqual(["Notificación sanitaria INVIMA", "N.° NSA-003219-2017"]);
    expect(filas.at(-1)).toEqual(["Comercializa", "De Santander SAS"]);
    expect(filas.map(([k]) => k)).not.toContain("Registro sanitario");
    expect(JSON.stringify(filas)).not.toMatch(/Titular:|Fabricante:|pendiente|TODO/i);
    await expect(page.getByRole("group", { name: "Presentación" }).getByRole("radio")).toHaveCount(2);
    await expect(page.getByRole("radio", { name: "Grano", exact: true })).toBeAttached();
    await expect(page.getByRole("radio", { name: "Molido", exact: true })).toBeAttached();
    await expect(page.getByTestId("ayuda-molienda")).toHaveText("Grano o molido, tal como lo empaca el fabricante. No molemos el café.");
    await expect(page.getByTestId("plazo-ficha").getByRole("link", { name: "Ver plazos" })).toHaveAttribute("href", "/envios/#6-plazos-de-entrega");
    expect((await page.locator("main").innerText()).toLowerCase()).not.toMatch(/molienda|grano entero/);
    await expect(page.getByTestId("leyenda-iva")).toHaveText(LEYENDA_IVA);
    const jsonld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}");
    expect(jsonld["@type"]).toBe("Product");
    expect(JSON.stringify(jsonld.brand ?? null)).not.toContain("De Santander");
    expect(jsonld.aggregateRating).toBeUndefined();
  });

  // LEG-146: el paquete (§7.4) pide «Un café sin NSA no aparece»; el dueño mantiene Arreboles activo (2026-11-14).
  // Esta prueba documenta la decisión vigente; pasa a «no aparece» cuando el dueño la cambie.
  test("Arreboles: activo por decisión del dueño, sin fila sanitaria ni marcador, se puede agregar", async ({ page }) => {
    await page.goto("/cafes/cafe-arreboles/");
    const filas = await filasFicha(page);
    expect(filas.map(([k]) => k)).not.toContain("Notificación sanitaria INVIMA");
    expect(JSON.stringify(filas)).not.toMatch(/NSA|pendiente|TODO|Registro sanitario/i);
    expect(filas.at(-1)).toEqual(["Comercializa", "De Santander SAS"]);
    await page.getByRole("button", { name: /Agregar al pedido/ }).click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("desantander.carrito.v2") ?? "")).toContain("cafe-arreboles");
  });

  for (const vp of VIEWPORTS) {
    test(`a ${vp.width} px: ficha de Casa Martínez sin violaciones serias de axe ni desborde`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/cafes/cafe-casa-martinez/");
      expect(await graves(page)).toEqual([]);
      expect(await sinDesborde(page)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------------------------------------
// 6–7. /envios/ y forma de pago (contraentrega retirada)
// ---------------------------------------------------------------------------------------------------------

test("/envios/: D3 1.0, leyenda de IVA, metadatos y sin textos retirados", async ({ page }) => {
  await page.goto("/envios/");
  await expect(page.getByText("Para cada zona te informamos dos plazos: el estimado, que es lo que suele tardar, y el máximo, que es el plazo que nos comprometemos a cumplir. Se cuentan desde el día hábil siguiente a aquel en que recibimos tu pago.", { exact: true })).toBeVisible();
  // Con la promoción vigente, la leyenda agrega la salvedad de las comunas.
  const eg = estadoEnvioGratisE2E();
  const salvedad = eg.tipo === "vigente" ? " Salvo en las siete comunas de Bucaramanga con envío gratis." : "";
  await expect(page.getByTestId("leyenda-iva")).toHaveText(`Tarifas en pesos colombianos, con IVA del 5 % incluido. Más de 5 kg, en cualquier zona, se cotiza aparte.${salvedad} Nunca cobramos primero y ajustamos después.`);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "Cómo calculamos el envío de tu pedido: zonas, tarifas por peso con IVA incluido y plazos de entrega desde Bucaramanga; retracto, devoluciones y garantía.");
  const texto = (await page.locator("main").innerText()).replace(/\s+/g, " ");
  expect(texto).not.toMatch(/¿Tu destino no aparece|Plazos orientativos|sin IVA|no admite retracto/i);
});

test("§7.4 formulario: sin campo de forma de pago ni contraentrega; texto fijo de pago (LEG-144)", async ({ page }) => {
  await sembrar(page, [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }]);
  await page.goto("/pedido/?paso=envio");
  await expect(page.getByRole("group", { name: /Forma de pago/ })).toHaveCount(0);
  await expect(page.getByRole("radio")).toHaveCount(0);
  await expect(page.getByTestId("texto-pago")).toContainText(TEXTO_PAGO_FORMULARIO);
  expect((await page.locator("main").innerText()).toLowerCase()).not.toMatch(/contraentrega|forma de pago|efectivo/);
});

test("§7.4 ninguna pantalla ofrece contraentrega (solo el texto legal que la excluye)", async ({ page }) => {
  for (const ruta of ["/", "/cafes/", "/cafes/cafe-casa-martinez/", "/pedido/", "/envios/", "/legal/terminos/", "/legal/privacidad/", "/legal/vendedor/"]) {
    await page.goto(ruta);
    const texto = (await page.locator("body").innerText()).replace(/\s+/g, " ").replaceAll("No recibimos pagos contraentrega ni en efectivo", "");
    expect(texto, ruta).not.toMatch(/contraentrega/i);
  }
});

// ---------------------------------------------------------------------------------------------------------
// 10. Privacidad: ningún dato personal en URL, localStorage ni peticiones a terceros
// ---------------------------------------------------------------------------------------------------------

test("flujo completo sin datos personales en la URL, en localStorage ni en peticiones salientes", async ({ page }) => {
  const urls: string[] = [];
  page.on("framenavigated", (f) => urls.push(f.url()));
  const peticiones: string[] = [];
  page.on("request", (r) => peticiones.push(`${r.url()} ${r.postData() ?? ""}`));
  await irAlResumen(page, "Santander", "Bucaramanga", undefined, { correo: "ana@ejemplo.co", barrio: "Cabecera", indicaciones: "Portería sur" });
  await mensaje(page);
  const personales = [/Ana(%20|\+| )Rueda/i, /3001234567|300(%20|\+| )123/, /Calle(%20|\+| )45/i, /ana(%40|@)ejemplo/i, /Cabecera/i, /Porter/i];
  for (const u of [...urls, page.url()]) for (const p of personales) expect(u, u).not.toMatch(p);
  const almacen = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  for (const p of personales) expect(almacen).not.toMatch(p);
  const externas = peticiones.filter((r) => !r.startsWith("http://localhost"));
  expect(externas).toEqual([]);
  for (const r of peticiones) for (const p of personales) expect(r).not.toMatch(p);
});

// ---------------------------------------------------------------------------------------------------------
// basePath de GitHub Pages (solo con E2E_BASEPATH_URL; ver e2e/basepath.spec.ts)
// ---------------------------------------------------------------------------------------------------------

test.describe("paquete legal v1 bajo basePath", () => {
  const base = process.env.E2E_BASEPATH_URL;
  const REPO = "/coffee-santander-shop";
  test.skip(!base, "Define E2E_BASEPATH_URL con un build GITHUB_PAGES=true servido bajo /coffee-santander-shop/");

  test("páginas legales, ficha y pie: rótulo, enlaces prefijados y 0 recursos con error", async ({ page }) => {
    const fallos: string[] = [];
    page.on("response", (r) => { if (r.status() >= 400) fallos.push(`${r.status()} ${r.url()}`); });
    for (const doc of LEGALES) {
      await page.goto(`${base}${REPO}${doc.ruta}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(doc.titulo);
      await expect(page.getByTestId("rotulo-legal")).toHaveText("Versión 1.0 · vigente desde el 17 de noviembre de 2026");
    }
    await page.goto(`${base}${REPO}/cafes/cafe-casa-martinez/`);
    await expect(page.getByTestId("ayuda-molienda")).toBeVisible();
    const legales = await page.locator("footer ul a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(legales).toEqual([`${REPO}/legal/terminos/`, `${REPO}/legal/privacidad/`, `${REPO}/envios/`, `${REPO}/legal/vendedor/`]);
    expect(fallos).toEqual([]);
  });
});

test("QA-008 y LEG-165: «Cómo pedir» paso 3 con el texto fijo de pago («Bre-B», no «bre-b»)", async ({ page }) => {
  await page.goto("/");
  const paso3 = page.getByText(/^Despachamos desde .+ Pagas por /);
  await expect(paso3).toContainText("Pagas por transferencia bancaria o por Bre-B después de aceptar el total.");
  await expect(paso3).not.toContainText("bre-b");
});
