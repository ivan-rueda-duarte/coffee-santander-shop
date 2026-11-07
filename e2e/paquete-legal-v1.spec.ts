import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { AVISO_RETRACTO, fechaEnLetras, leerConfig, textosCasillas } from "./ayudas";

// Ronda QA 2026-11-06 «paquete legal v1» (docs/qa/2026-11-06-paquete-legal-v1.md).
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

const LEGALES = [
  { ruta: "/legal/terminos/", archivo: "terminos-y-condiciones.md", titulo: "Términos y condiciones" },
  { ruta: "/legal/privacidad/", archivo: "politica-tratamiento-datos.md", titulo: "Política de tratamiento de datos" },
  { ruta: "/legal/envios-devoluciones/", archivo: "envios-devoluciones-retracto.md", titulo: "Envíos, devoluciones, retracto y garantía" },
  { ruta: "/legal/vendedor/", archivo: "informacion-vendedor.md", titulo: "Información del vendedor" },
];

type BloqueEsperado = [etiqueta: "H2" | "P" | "LI", texto: string];

/** Extractor propio de «## Texto para el consumidor»: ### → h2, «- » y «N. » → li, resto → p. */
function textoConsumidor(archivo: string): BloqueEsperado[] {
  const lineas = readFileSync(`docs/legal/${archivo}`, "utf8").split(/\r?\n/);
  const inicio = lineas.findIndex((l) => l.trim() === "## Texto para el consumidor");
  expect(inicio, `${archivo} sin «## Texto para el consumidor»`).toBeGreaterThan(-1);
  const salida: BloqueEsperado[] = [];
  for (const cruda of lineas.slice(inicio + 1)) {
    const l = cruda.trim();
    if (l.startsWith("## ") || l === "---") break;
    if (!l) continue;
    if (l.startsWith("### ")) salida.push(["H2", l.slice(4)]);
    else if (l.startsWith("- ")) salida.push(["LI", l.slice(2)]);
    else if (/^\d+\.\s+/.test(l)) salida.push(["LI", l.replace(/^\d+\.\s+/, "")]);
    else salida.push(["P", l]);
  }
  return salida;
}

test.describe("páginas legales v1: texto público letra por letra", () => {
  for (const doc of LEGALES) {
    test(`${doc.ruta}: título, rótulo, texto idéntico al .md y sin marcadores`, async ({ page }) => {
      const respuesta = await page.goto(doc.ruta);
      expect(respuesta?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(doc.titulo);
      await expect(page.getByText(`Versión ${leerConfig("version_terminos")} · vigente desde ${leerConfig("fecha_terminos")}`, { exact: true })).toBeVisible();
      await expect(page.getByText("Versión 1 · vigente desde 2026-11-06", { exact: true })).toHaveCount(1);
      await expect(page).toHaveTitle(new RegExp(`^${doc.titulo}`));

      const publicado = await page.locator("article .body-l").evaluate((cont) => {
        const salida: [string, string][] = [];
        for (const el of Array.from(cont.children)) {
          if (el.tagName === "UL" || el.tagName === "OL") for (const li of Array.from(el.children)) salida.push(["LI", li.textContent ?? ""]);
          else salida.push([el.tagName, el.textContent ?? ""]);
        }
        return salida;
      });
      expect(publicado).toEqual(textoConsumidor(doc.archivo));

      const texto = await page.locator("main").innerText();
      expect(texto).not.toMatch(/en preparación|TODO|VERIFICAR|DECISIÓN|BORRADOR|\[|\]|\*\*|`|<!--/);
    });
  }

  test("/legal/vendedor/: dl con las 8 filas de microcopy §5.4 y los datos de config.csv", async ({ page }) => {
    await page.goto("/legal/vendedor/");
    const filas = await page.getByTestId("datos-vendedor").locator("dt").evaluateAll((dts) => dts.map((dt) => [dt.textContent, dt.nextElementSibling?.textContent]));
    expect(filas).toEqual([
      ["Razón social", leerConfig("razon_social")],
      ["NIT", leerConfig("nit")],
      ["Matrícula mercantil", leerConfig("matricula_mercantil")],
      ["Representante legal", leerConfig("representante_legal")],
      ["Domicilio", leerConfig("domicilio")],
      ["Dirección de notificación judicial", leerConfig("direccion_notificacion")],
      ["Correo", leerConfig("correo_contacto")],
      ["WhatsApp", "+57 300 112 9874"],
    ]);
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

async function llenarEnvio(page: Page, departamento: string, municipio: string, extra: { correo?: string; barrio?: string; indicaciones?: string; formaPago?: string } = {}) {
  await page.goto("/pedido/?paso=envio");
  await page.getByLabel("Nombre completo").fill(DATOS.nombre);
  await page.getByLabel("Celular").fill(DATOS.celular);
  if (extra.correo) await page.getByLabel(/^Correo/).fill(extra.correo);
  await page.getByLabel("Departamento").selectOption(departamento);
  await page.getByLabel("Municipio").selectOption(municipio);
  await page.getByLabel("Dirección").fill(DATOS.direccion);
  if (extra.barrio) await page.getByLabel(/^Barrio/).fill(extra.barrio);
  if (extra.indicaciones) await page.getByLabel(/^Indicaciones/).fill(extra.indicaciones);
  await page.getByRole("radio", { name: extra.formaPago ?? "Transferencia Bre-B" }).check({ force: true });
}

async function irAlResumen(page: Page, departamento: string, municipio: string, lineas: Linea[] = [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 2 }], extra = {}) {
  await sembrar(page, lineas);
  await llenarEnvio(page, departamento, municipio, extra);
  await page.getByRole("button", { name: /Revisar el pedido/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

async function mensaje(page: Page) {
  await page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ }).check();
  await page.getByRole("checkbox", { name: /acepto los Términos y condiciones/ }).check();
  await page.getByRole("button", { name: "Preparar pedido para WhatsApp" }).click();
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

const LINEA_VENDEDOR =
  `Te vende ${leerConfig("razon_social")} · NIT ${leerConfig("nit")} · ${leerConfig("domicilio")} · ${leerConfig("direccion_notificacion")} · ${leerConfig("correo_contacto")} · WhatsApp +57 300 112 9874. Información del vendedor`;
const NOTA_PRECIO =
  "Los precios incluyen todos los impuestos y el envío se muestra por separado (art. 50 de la Ley 1480 de 2011). La forma de pago se confirma por WhatsApp antes de que pagues. Más en envíos: zonas, tarifas y plazos y en envíos, devoluciones, retracto y garantía.";
const LEYENDA_IVA = `Precios con IVA del ${leerConfig("iva_tarifa")} % incluido (art. 468-1 del Estatuto Tributario).`;
const CONSTANCIA = `Acepto los Términos y condiciones versión ${leerConfig("version_terminos")} y autorizo el tratamiento de mis datos según la Política de tratamiento de datos versión ${leerConfig("version_politica_datos")} del ${fechaEnLetras(leerConfig("fecha_politica_datos"))}.`;

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
      await expect(page.getByTestId("linea-plazo")).toHaveText(
        p.maximo === "por cotizar"
          ? `Entrega estimada: ${p.estimado}, en la oficina de la transportadora. Plazo máximo: se informa al cotizar; nunca más de 30 días calendario.`
          : `Entrega estimada: ${p.estimado}. Plazo máximo: ${p.maximo}.`,
      );
      await expect(page.getByTestId("leyenda-iva")).toHaveText(LEYENDA_IVA);
      await expect(page.getByTestId("nota-precio-total")).toHaveText(NOTA_PRECIO);
      await expect(page.getByTestId("nota-precio-total").getByRole("link", { name: "envíos: zonas, tarifas y plazos" })).toHaveAttribute("href", "/envios/");
      await expect(page.getByTestId("nota-precio-total").getByRole("link", { name: "envíos, devoluciones, retracto y garantía" })).toHaveAttribute("href", "/legal/envios-devoluciones/");
      await expect(page.getByTestId("aviso-retracto")).toHaveText(AVISO_RETRACTO);
      await expect(page.getByTestId("linea-vendedor")).toHaveText(LINEA_VENDEDOR);
      await expect(page.getByTestId("linea-vendedor")).not.toContainText(/Rueda Duarte|740574|Matrícula|Representante/);

      const casillas = textosCasillas();
      expect(casillas.enlacePolitica).toBe("Política de Tratamiento de Datos versión 1 del 6 de noviembre de 2026");
      expect(casillas.enlaceTerminos).toBe("Términos y condiciones versión 1 del 6 de noviembre de 2026");
      await expect(page.getByRole("checkbox", { name: casillas.autorizacion, exact: true })).not.toBeChecked();
      await expect(page.getByRole("checkbox", { name: casillas.terminos, exact: true })).not.toBeChecked();
      await expect(page.getByRole("button", { name: "Preparar pedido para WhatsApp" })).toBeDisabled();
    });
  }

  test("QA-006: el botón deshabilitado explica qué falta (texto visible y asociado con aria-describedby)", async ({ page }) => {
    await irAlResumen(page, "Santander", "Bucaramanga");
    const boton = page.getByRole("button", { name: "Preparar pedido para WhatsApp" });
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
    const AYUDA_DOS = "Para preparar tu pedido, marca las dos casillas: la autorización de tus datos y los términos y condiciones.";
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
    await expect(autorizacion).toBeFocused();
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

  test("mensaje con tarifa (zona 1): primera línea, subtotal con IVA, total, constancia final, sin DS-", async ({ page }) => {
    await irAlResumen(page, "Santander", "Bucaramanga");
    const texto = await mensaje(page);
    const lineas = texto.split("\n");
    expect(lineas[0]).toBe("¡Hola, De Santander! Envío mi solicitud de compra para que me confirmen el total con el envío.");
    expect(texto).toContain("Subtotal de productos: $60.000 (IVA del 5 % incluido)");
    expect(texto).toMatch(/^Envío \(Bucaramanga · zona 1\): \$[\d.]+$/m);
    expect(texto).toMatch(/^Total: \$[\d.]+$/m);
    expect(lineas[lineas.length - 1]).toBe(CONSTANCIA);
    expect(lineas[lineas.length - 2]).toBe("");
    expect(lineas[lineas.length - 3]).toBe("Forma de pago: Transferencia Bre-B");
    expect(CONSTANCIA.match(/versión 1\b/g)).toHaveLength(2);
    expect(texto).not.toMatch(/DS-|finalizar|N\.° ?DS|sin IVA/i);
    expect(texto.length).toBeLessThan(2000);
  });

  test("mensaje en el peor caso (8 líneas × 20, todos los opcionales y 300 caracteres de indicaciones): < 2.000 y constancia intacta", async ({ page }) => {
    const lineas: Linea[] = [];
    for (const cafeSlug of ["cafe-casa-martinez", "cafe-arreboles"]) for (const gramos of [250, 500]) for (const molienda of ["grano", "molido"] as const) lineas.push({ cafeSlug, gramos, molienda, cantidad: 20 });
    const indicaciones = "Portería sur, torre 3, apartamento 1204; llamar antes de subir. ".repeat(6).slice(0, 300);
    await irAlResumen(page, "Santander", "Bucaramanga", lineas, { correo: "ana.rueda.compras.oficina@ejemplo-empresa-largo.com.co", barrio: "Cabecera del Llano, sector comercial", indicaciones });
    const texto = await mensaje(page);
    expect(texto.length).toBeLessThan(2000);
    expect(texto.split("\n").filter((l) => l.startsWith("• "))).toHaveLength(8);
    expect(texto).toContain("Envío: POR COTIZAR (más de 5 kg)");
    expect(texto).toMatch(/Quedo atento al valor del envío para confirmar mi pedido\.\n\n/);
    expect(texto.split("\n").at(-1)).toBe(CONSTANCIA);
    expect(texto.split("\n")[0]).toBe("¡Hola, De Santander! Envío mi solicitud de compra para que me confirmen el total con el envío.");
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

test.describe("pie con el vendedor (microcopy §5.4 y §1.4)", () => {
  for (const vp of [{ width: 360, height: 740 }, { width: 1440, height: 900 }]) {
    test(`a ${vp.width} px: cinco líneas del vendedor, © con IVA, sin representante ni matrícula, axe y sin desborde`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/");
      const lineas = await page.getByTestId("pie-vendedor").locator("p").allTextContents();
      expect(lineas).toEqual([
        `${leerConfig("razon_social")} · NIT ${leerConfig("nit")}`,
        `Domicilio: ${leerConfig("domicilio")}`,
        `Notificaciones judiciales: ${leerConfig("direccion_notificacion")}`,
        `Correo de atención y de notificación judicial: ${leerConfig("correo_contacto")}`,
        "WhatsApp +57 300 112 9874",
      ]);
      await expect(page.getByTestId("pie-vendedor").getByRole("link", { name: leerConfig("correo_contacto") })).toHaveAttribute("href", `mailto:${leerConfig("correo_contacto")}`);
      await expect(page.getByTestId("pie-copyright")).toHaveText(`© ${new Date().getFullYear()} De Santander SAS. Precios en pesos colombianos, con IVA del 5 % incluido.`);
      await expect(page.locator("footer")).toContainText("Café de origen de provincias de Santander, Colombia.");
      await expect(page.locator("footer")).not.toContainText(/Rueda Duarte|740574|Matrícula|Representante/);
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
  test("Casa Martínez: notificación sanitaria, Comercializa, ayuda de molienda, IVA y JSON-LD sin brand De Santander", async ({ page }) => {
    await page.goto("/cafes/cafe-casa-martinez/");
    const filas = await filasFicha(page);
    expect(filas).toContainEqual(["Notificación sanitaria INVIMA", "N.° NSA-003219-2017"]);
    expect(filas.at(-1)).toEqual(["Comercializa", "De Santander SAS"]);
    expect(filas.map(([k]) => k)).not.toContain("Registro sanitario");
    expect(JSON.stringify(filas)).not.toMatch(/Titular:|Fabricante:|pendiente|TODO/i);
    await expect(page.getByTestId("ayuda-molienda")).toHaveText("Grano entero o molido, tal como lo empaca el fabricante. No molemos el café.");
    await expect(page.getByTestId("leyenda-iva")).toHaveText(LEYENDA_IVA);
    const jsonld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}");
    expect(jsonld["@type"]).toBe("Product");
    expect(JSON.stringify(jsonld.brand ?? null)).not.toContain("De Santander");
    expect(jsonld.aggregateRating).toBeUndefined();
  });

  test("Arreboles: activo, sin fila sanitaria ni marcador, se puede agregar", async ({ page }) => {
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
// 6–7. /envios/ y ayuda de contraentrega
// ---------------------------------------------------------------------------------------------------------

test("/envios/: frase de plazos exacta, metadatos, enlace final y sin textos retirados", async ({ page }) => {
  await page.goto("/envios/");
  await expect(page.getByText("El estimado es lo que suele tardar. El máximo es el plazo que nos comprometemos a cumplir. Los dos se cuentan en días hábiles desde que aceptas el total en el chat y, si pagas por transferencia Bre-B, desde que recibimos el pago. Si no entregamos en el máximo, puedes cancelar y te devolvemos todo en 15 días calendario.", { exact: true })).toBeVisible();
  await expect(page.getByTestId("leyenda-iva")).toHaveText("Tarifas en pesos colombianos, con IVA del 5 % incluido. Más de 5 kg, en cualquier zona, se cotiza aparte. Nunca cobramos primero y ajustamos después.");
  await expect(page.getByTestId("retracto-envios")).toHaveText(`${AVISO_RETRACTO} Más en envíos, devoluciones, retracto y garantía.`);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "Cómo calculamos el envío de tu pedido: zonas, tarifas por peso con IVA incluido y plazos de entrega desde Bucaramanga.");
  await expect(page.getByRole("link", { name: "Lee la política completa de envíos, devoluciones, retracto y garantía." })).toHaveAttribute("href", "/legal/envios-devoluciones/");
  const texto = (await page.locator("main").innerText()).replace(/\s+/g, " ");
  expect(texto).not.toMatch(/¿Tu destino no aparece|Plazos orientativos|sin IVA|no admite retracto/i);
});

test("formulario: ayuda de contraentrega solo con efectivo contraentrega y enlazada al grupo", async ({ page }) => {
  await sembrar(page, [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }]);
  await page.goto("/pedido/?paso=envio");
  await expect(page.getByTestId("ayuda-contraentrega")).toHaveCount(0);
  await page.getByRole("radio", { name: "Efectivo contraentrega" }).check({ force: true });
  await expect(page.getByTestId("ayuda-contraentrega")).toHaveText("Pagas al recibir. La tarifa de envío ya incluye la comisión de recaudo; no hay recargos.");
  await expect(page.getByRole("group", { name: /Forma de pago/ })).toHaveAccessibleDescription("Pagas al recibir. La tarifa de envío ya incluye la comisión de recaudo; no hay recargos.");
  await page.getByRole("radio", { name: "Transferencia Bre-B" }).check({ force: true });
  await expect(page.getByTestId("ayuda-contraentrega")).toHaveCount(0);
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
      await expect(page.getByText("Versión 1 · vigente desde 2026-11-06", { exact: true })).toBeVisible();
    }
    await page.goto(`${base}${REPO}/cafes/cafe-casa-martinez/`);
    await expect(page.getByTestId("ayuda-molienda")).toBeVisible();
    const legales = await page.locator("footer a[href*='/legal/']").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(legales).toEqual([`${REPO}/legal/terminos/`, `${REPO}/legal/privacidad/`, `${REPO}/legal/envios-devoluciones/`, `${REPO}/legal/vendedor/`]);
    await page.goto(`${base}${REPO}/envios/`);
    await expect(page.getByTestId("retracto-envios").getByRole("link")).toHaveAttribute("href", `${REPO}/legal/envios-devoluciones/`);
    expect(fallos).toEqual([]);
  });
});

test("QA-008: «Cómo pedir» paso 3 escribe las formas de pago como en config.csv («Bre-B», no «bre-b»)", async ({ page }) => {
  await page.goto("/");
  const paso3 = page.getByText(/^Despachamos desde .+ Pagas con /);
  await expect(paso3).toContainText("Bre-B");
  await expect(paso3).not.toContainText("bre-b");
});
