import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { expect, test, type Page, type Request } from "@playwright/test";
import { leerConfig } from "./ayudas";

// Envío gratis en siete comunas de Bucaramanga (ronda QA 2026-11-09; microcopy-legal §8 v1.4; diseño 2026-11-09).
// Dos modos, según el build que sirve out/:
// - Encendida: `envio_gratis_desde` con fecha y ENVIO_GRATIS_PRUEBA=si (build de PRUEBA, nunca se despliega).
// - Apagada (repositorio): `envio_gratis_desde` vacía. Nada de la promoción aparece.

const ENCENDIDA = leerConfig("envio_gratis_desde") !== "" && process.env.ENVIO_GRATIS_PRUEBA === "si";
const COMUNAS = readFileSync("data/comunas_envio_gratis.csv", "utf8")
  .trim()
  .split("\n")
  .slice(1)
  .map((l) => l.split(",")[2]);
const ALFABETICAS = [...COMUNAS].sort((a, b) => a.localeCompare(b, "es"));
const OTRA = "Otra comuna o no la sé";

const PLAZO_RESUMEN = "Entrega estimada: mismo día o siguiente día hábil. Plazo máximo: 1 día hábil desde que validamos tu pedido y te damos el aprobado por el chat.";
const PLAZO_MENSAJE = "Plazo de entrega: máximo 1 día hábil desde que validen mi pedido y me den el aprobado por el chat.";
const AYUDA_SIN_COMUNA = `Envío gratis si tu dirección está en ${COMUNAS.slice(0, -1).join(", ")} o ${COMUNAS.at(-1)}. Si no eliges una de ellas, pagas la tarifa normal. Verificamos tu dirección por el chat antes de que aceptes el total. Condiciones`;
const ANUNCIO = "Envío gratis en siete comunas de Bucaramanga. Ver condiciones";

const CM = "cafe-casa-martinez"; // 250 g $30.000 · 500 g $47.000
const AR = "cafe-arreboles"; // 250 g $23.000 · 500 g $40.000
type Linea = { cafeSlug: string; gramos: 250 | 500; molienda?: "grano" | "molido"; cantidad: number };
const KG1: Linea[] = [{ cafeSlug: CM, gramos: 500, cantidad: 2 }]; // 1.080 g · $94.000
const KG6: Linea[] = [{ cafeSlug: CM, gramos: 500, cantidad: 12 }]; // 6.080 g · $564.000
const KG30: Linea[] = [
  { cafeSlug: CM, gramos: 500, cantidad: 20 },
  { cafeSlug: CM, gramos: 500, molienda: "molido", cantidad: 20 },
  { cafeSlug: AR, gramos: 500, cantidad: 20 },
]; // 30.080 g · $2.680.000
const MAXIMO: Linea[] = [CM, AR].flatMap((cafeSlug) =>
  ([250, 500] as const).flatMap((gramos) => (["grano", "molido"] as const).map((molienda) => ({ cafeSlug, gramos, molienda, cantidad: 20 }))),
);

async function sembrar(page: Page, lineas: Linea[]) {
  await page.goto("/");
  // Como en envios.spec.ts: esperar a que el proveedor del carrito se monte, para que no pise lo sembrado.
  await page.waitForLoadState("networkidle");
  await page.evaluate((ls) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: ls.map((l) => ({ molienda: "grano", ...l })) }));
  }, lineas);
}

async function pasoEnvio(page: Page, lineas: Linea[]) {
  await sembrar(page, lineas);
  await page.goto("/pedido/?paso=envio");
  await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
}

const destino = async (page: Page, municipio: string, departamento = "Santander") => {
  await page.getByLabel("Departamento").selectOption(departamento);
  await page.getByLabel("Municipio").selectOption(municipio);
};
const comuna = (page: Page) => page.getByLabel("Comuna (opcional)");
const envio = (page: Page) => page.getByTestId("linea-envio");
const total = (page: Page) => page.getByTestId("linea-total");
const estado = (page: Page) => page.getByTestId("anuncio-envio");

async function graves(page: Page) {
  // Espera a que termine la aparición del campo (opacidad, 150 ms): axe a mitad del fundido mide contraste parcial.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running"));
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

/** Clases prohibidas en los textos de la función (diseño, «Tokens de color»): hoja, success, oro, grana, terracota. */
async function clasesProhibidas(page: Page, selector: string) {
  return page.$$eval(selector, (raices) => {
    const malas: string[] = [];
    const re = /(^|[-:!])(hoja|success|oro|grana|chicamocha|terracota|accent)(-|$)|ds-tag--origen|ds-badge--region/;
    for (const r of raices) for (const el of [r, ...r.querySelectorAll("*")]) for (const c of el.classList) if (re.test(c)) malas.push(`${el.tagName.toLowerCase()}.${c}`);
    return malas;
  });
}

async function completarDatos(page: Page, extra: { lleno?: boolean } = {}) {
  if (extra.lleno) {
    await page.getByLabel("Nombre completo").fill("N".repeat(80));
    await page.getByLabel("Correo (opcional)").fill(`${"c".repeat(100)}@correo.co`);
    await page.getByLabel("Tipo de documento (opcional)").selectOption("PAS");
    await page.getByLabel("Número de documento (opcional)").fill("A".repeat(20));
    await page.getByLabel("Código postal (opcional)").fill("680001");
    await page.getByLabel("Dirección").fill("D".repeat(120));
    await page.getByLabel("Barrio (opcional)").fill("B".repeat(60));
    await page.getByLabel("Indicaciones para la entrega (opcional)").fill("I".repeat(300));
  } else {
    await page.getByLabel("Nombre completo").fill("Ana Rueda");
    await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
  }
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByRole("radio", { name: "Efectivo contraentrega" }).check({ force: true });
}

async function irAResumen(page: Page) {
  await page.getByRole("button", { name: /Revisar el pedido/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

async function mensaje(page: Page) {
  await page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ }).check();
  await page.getByRole("checkbox", { name: /acepto los Términos y condiciones/ }).check();
  await page.getByRole("button", { name: "Preparar pedido para WhatsApp" }).click();
  await expect(page.getByRole("heading", { name: "Tu pedido está listo para enviar por WhatsApp" })).toBeVisible();
  const href = (await page.getByRole("link", { name: /Enviar por WhatsApp/ }).getAttribute("href")) ?? "";
  expect(href.startsWith("https://wa.me/573001129874?text=")).toBe(true);
  return decodeURIComponent(href.split("?text=")[1]);
}

test.describe("envío gratis por comunas: ENCENDIDA (build de prueba)", () => {
  test.skip(!ENCENDIDA, "Requiere envio_gratis_desde con fecha y ENVIO_GRATIS_PRUEBA=si");

  test("el campo solo existe con Bucaramanga, tras Municipio, con las opciones de §8.2", async ({ page }) => {
    await pasoEnvio(page, KG1);
    for (const m of ["Floridablanca", "Piedecuesta", "Girón"]) {
      await destino(page, m);
      await expect(page.getByTestId("campo-comuna")).toHaveCount(0);
    }
    await destino(page, "Bogotá, D.C.", "Bogotá, D.C.");
    await expect(page.getByTestId("campo-comuna")).toHaveCount(0);
    await destino(page, "Bucaramanga");
    await expect(comuna(page)).toBeVisible();
    await expect(comuna(page)).toHaveValue("");
    await expect(comuna(page)).toHaveAttribute("autocomplete", "off");
    await expect(comuna(page)).not.toHaveAttribute("aria-invalid", /.*/);
    const opciones = await comuna(page).locator("option").allTextContents();
    expect(opciones).toEqual(["Elige tu comuna", ...ALFABETICAS, OTRA]);
    await expect(page.locator("#comuna-ayuda")).toHaveText(AYUDA_SIN_COMUNA);
    await expect(page.locator("#comuna-ayuda a")).toHaveAttribute("href", "/envios/#envio-gratis");
    await expect(comuna(page)).toHaveAttribute("aria-describedby", "comuna-ayuda");
    // Orden del DOM: Municipio → Comuna → Código postal.
    const ids = await page.$$eval("form select, form input, form textarea", (els) => els.map((e) => e.id).filter(Boolean));
    expect(ids.indexOf("comuna")).toBe(ids.indexOf("municipio") + 1);
    expect(ids.indexOf("codigoPostal")).toBe(ids.indexOf("comuna") + 1);
  });

  test("el campo se vacía al cambiar el municipio o el departamento", async ({ page }) => {
    await pasoEnvio(page, KG1);
    await destino(page, "Bucaramanga");
    await comuna(page).selectOption("Centro");
    await page.getByLabel("Municipio").selectOption("Floridablanca");
    await expect(page.getByTestId("campo-comuna")).toHaveCount(0);
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    await expect(comuna(page)).toHaveValue("");
    await expect(envio(page)).toContainText("$8.800");
    await comuna(page).selectOption("Mutis");
    await page.getByLabel("Departamento").selectOption("Antioquia");
    await expect(page.getByTestId("campo-comuna")).toHaveCount(0);
    await destino(page, "Bucaramanga");
    await expect(comuna(page)).toHaveValue("");
    await expect(page.getByTestId("etiqueta-envio-gratis")).toHaveCount(0);
  });

  for (const c of COMUNAS) {
    test(`${c}, 1 kg: $0 con «Envío gratis», «Total» = subtotal, nota con la tarifa y el total alternativos, plazo propio`, async ({ page }) => {
      await pasoEnvio(page, KG1);
      await destino(page, "Bucaramanga");
      await comuna(page).selectOption(c);
      await expect(envio(page)).toContainText(`Envío a Bucaramanga · zona 1 · ${c}`);
      await expect(page.getByTestId("etiqueta-envio-gratis")).toHaveText("Envío gratis");
      await expect(envio(page)).toContainText("$0");
      await expect(page.getByTestId("referencia-tarifa")).toHaveText(
        `Envío gratis en ${c}, si verificamos por el chat que tu dirección está en esa comuna. Si no lo está, el envío es de $8.800 y el total queda en $102.800; tú decides si lo aceptas antes de pagar.`,
      );
      await expect(page.getByTestId("linea-plazo")).toHaveText(PLAZO_RESUMEN);
      await expect(total(page)).toHaveText(/^Total\s*\$94\.000$/);
      await expect(estado(page)).toHaveText(`Envío gratis en ${c}, sujeto a verificar tu dirección: $0. Total: $94.000.`);
      await expect(page.locator("#comuna-ayuda")).toHaveText(`Tu envío es gratis si tu dirección está en ${c}. Lo verificamos por el chat antes de que aceptes el total. Condiciones`);
    });
  }

  const pesos: [string, Linea[], string, string][] = [
    ["2 kg", [{ cafeSlug: CM, gramos: 500, cantidad: 4 }], "$188.000", "el envío es de $11.600 y el total queda en $199.600"],
    ["5 kg", [{ cafeSlug: CM, gramos: 500, cantidad: 10 }], "$470.000", "el envío es de $15.400 y el total queda en $485.400"],
    ["6 kg", KG6, "$564.000", "el envío de más de 5 kg se cotiza"],
    ["10 kg", [{ cafeSlug: CM, gramos: 500, cantidad: 20 }], "$940.000", "el envío de más de 5 kg se cotiza"],
    ["30 kg", KG30, "$2.680.000", "el envío de más de 5 kg se cotiza"],
  ];
  for (const [nombre, lineas, subtotal, alternativa] of pesos) {
    test(`Cabecera del Llano, ${nombre}: $0, «Total» (nunca «Total sin envío») y plazo de 1 día hábil`, async ({ page }) => {
      await pasoEnvio(page, lineas);
      await destino(page, "Bucaramanga");
      await comuna(page).selectOption("Cabecera del Llano");
      await expect(page.getByTestId("etiqueta-envio-gratis")).toBeVisible();
      await expect(total(page)).toHaveText(new RegExp(`^Total\\s*${subtotal.replace(/[$.]/g, "\\$&")}$`));
      await expect(page.getByTestId("referencia-tarifa")).toContainText(alternativa);
      await expect(page.getByTestId("linea-plazo")).toHaveText(PLAZO_RESUMEN);
      await expect(page.locator("main")).not.toContainText("5 a 12 días hábiles");
      await expect(page.locator("main")).not.toContainText("Por cotizar");
    });
  }

  test("sin comuna o con «Otra comuna o no la sé»: tarifa normal y, con más de 5 kg, «por cotizar» y «Total sin envío»", async ({ page }) => {
    await pasoEnvio(page, KG6);
    await destino(page, "Bucaramanga");
    await expect(envio(page)).toContainText("Por cotizar");
    await expect(total(page)).toHaveText(/^Total sin envío/);
    await comuna(page).selectOption(OTRA);
    await expect(envio(page)).toContainText("Por cotizar");
    await expect(total(page)).toHaveText(/^Total sin envío\s*\$564\.000$/);
    await expect(page.getByTestId("etiqueta-envio-gratis")).toHaveCount(0);
    await expect(page.locator("#comuna-ayuda")).toHaveText(AYUDA_SIN_COMUNA);
    await expect(estado(page)).toHaveText("Envío por cotizar. Total sin envío: $564.000.");
  });

  test("región role=status: vacía al entrar al paso, una frase por cambio (LEG-120)", async ({ page }) => {
    await pasoEnvio(page, KG1);
    const region = estado(page);
    await expect(region).toHaveAttribute("role", "status");
    await expect(region).toHaveAttribute("aria-live", "polite");
    await expect(region).toHaveAttribute("aria-atomic", "true");
    await expect(estado(page)).toHaveText("");
    await destino(page, "Bucaramanga");
    await expect(estado(page)).toHaveText("Envío: $8.800. Total: $102.800.");
    await comuna(page).selectOption("Ciudadela Real de Minas");
    await expect(estado(page)).toHaveText("Envío gratis en Ciudadela Real de Minas, sujeto a verificar tu dirección: $0. Total: $94.000.");
    await comuna(page).selectOption(OTRA);
    await expect(estado(page)).toHaveText("Envío: $8.800. Total: $102.800.");
    await page.getByLabel("Municipio").selectOption("Girón");
    await expect(estado(page)).toHaveText("Envío: $10.500. Total: $104.500.");
    // El contenedor visible de totales ya no es región viva (diseño §2): solo la frase, más los avisos globales del sitio.
    expect(await envio(page).evaluate((el) => el.closest("[aria-live]") === null)).toBe(true);
    expect(await page.locator("form [aria-live]").count()).toBe(1);
    // Al volver del resumen («Editar»), el paso se monta de nuevo y no anuncia nada.
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    await comuna(page).selectOption("Centro");
    await completarDatos(page);
    await irAResumen(page);
    await page.getByRole("button", { name: "Editar" }).click();
    await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
    await expect(estado(page)).toHaveText("");
  });

  test("orden de foco: Municipio → Comuna → «Condiciones» → Código postal", async ({ page }) => {
    await pasoEnvio(page, KG1);
    await destino(page, "Bucaramanga");
    await page.getByLabel("Municipio").focus();
    const ruta: string[] = [];
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("Tab");
      ruta.push(await page.evaluate(() => (document.activeElement?.id || document.activeElement?.textContent?.trim()) ?? ""));
    }
    expect(ruta).toEqual(["comuna", "Condiciones", "codigoPostal"]);
  });

  test("resumen y mensaje de WhatsApp con comuna (§8.3 y §8.4), ≤ 2.000 caracteres con todos los campos", async ({ page }) => {
    await pasoEnvio(page, KG1);
    await destino(page, "Bucaramanga");
    await comuna(page).selectOption("Ciudadela Real de Minas");
    await completarDatos(page, { lleno: true });
    await irAResumen(page);
    await expect(page.getByTestId("resumen-comuna")).toHaveText("Comuna: Ciudadela Real de Minas");
    await expect(page.getByTestId("etiqueta-envio-gratis")).toBeVisible();
    await expect(total(page)).toHaveText(/^Total\s*\$94\.000$/);
    await expect(page.getByTestId("aviso-por-cotizar")).toHaveCount(0);
    expect(await graves(page)).toEqual([]);
    const texto = await mensaje(page);
    expect(texto.length).toBeLessThanOrEqual(2000);
    expect(texto).toContain(`Envío (Bucaramanga · zona 1 · Ciudadela Real de Minas): $0 (envío gratis, sujeto a verificar la dirección)\nTotal: $94.000\n${PLAZO_MENSAJE}`);
    expect(texto).toMatch(/\nDirección: D{120} · Barrio: B{60}\nComuna: Ciudadela Real de Minas\nIndicaciones: /);
    expect(texto).toContain("\n\nSi mi dirección no está en esa comuna, el envío es de $8.800 y el total queda en $102.800; espero su confirmación.\n\nAcepto los Términos");
    expect(texto).not.toContain("Total sin envío");
  });

  test("carrito máximo (8 líneas de 20 bolsas, 60 kg) con todos los campos y comuna: ≤ 2.000 caracteres", async ({ page }) => {
    await pasoEnvio(page, MAXIMO);
    await destino(page, "Bucaramanga");
    await comuna(page).selectOption("Ciudadela Real de Minas");
    await completarDatos(page, { lleno: true });
    await irAResumen(page);
    const texto = await mensaje(page);
    expect(texto.length).toBeLessThanOrEqual(2000);
    expect(texto).toContain("Comuna: Ciudadela Real de Minas");
    expect(texto).toContain("Si mi dirección no está en esa comuna, quedo atento al valor del envío para confirmar mi pedido.");
  });

  test("sin comuna: el mensaje no lleva ninguna línea nueva", async ({ page }) => {
    await pasoEnvio(page, KG1);
    await destino(page, "Bucaramanga");
    await comuna(page).selectOption(OTRA);
    await completarDatos(page);
    await irAResumen(page);
    await expect(page.getByTestId("resumen-comuna")).toHaveCount(0);
    const texto = await mensaje(page);
    expect(texto).toContain("Envío (Bucaramanga · zona 1): $8.800\nTotal: $102.800\n");
    expect(texto).not.toMatch(/Comuna|gratis|Plazo de entrega|Si mi dirección/);
  });

  test("privacidad: la comuna no va a localStorage, sessionStorage, cookies, URL ni peticiones de red", async ({ page, context }) => {
    const peticiones: Request[] = [];
    context.on("request", (r) => peticiones.push(r));
    const urls: string[] = [];
    page.on("framenavigated", (f) => urls.push(f.url()));
    await pasoEnvio(page, KG1);
    await destino(page, "Bucaramanga");
    await comuna(page).selectOption("Cabecera del Llano");
    await completarDatos(page);
    await irAResumen(page);
    await mensaje(page);
    urls.push(page.url());
    const almacen = await page.evaluate(() => JSON.stringify({ l: { ...localStorage }, s: { ...sessionStorage }, c: document.cookie, h: history.state }));
    const busca = /cabecera|comuna/i;
    expect(almacen).not.toMatch(busca);
    expect(urls.filter((u) => busca.test(decodeURIComponent(u)))).toEqual([]);
    const conComuna = peticiones.filter((r) => busca.test(decodeURIComponent(r.url())) || busca.test(r.postData() ?? ""));
    expect(conComuna.map((r) => r.url())).toEqual([]);
    expect(peticiones.filter((r) => !r.url().startsWith("http://localhost")).map((r) => r.url())).toEqual([]);
  });

  test("prefers-reduced-motion: el campo aparece sin transición; sin la preferencia, solo opacidad 150 ms", async ({ page }) => {
    await pasoEnvio(page, KG1);
    await destino(page, "Bucaramanga");
    const animado = await page.getByTestId("campo-comuna").evaluate((el) => ({ p: getComputedStyle(el).transitionProperty, d: getComputedStyle(el).transitionDuration }));
    expect(animado).toEqual({ p: "opacity", d: "0.15s" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByLabel("Municipio").selectOption("Girón");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    const quieto = await page.getByTestId("campo-comuna").evaluate((el) => ({ d: parseFloat(getComputedStyle(el).transitionDuration), o: getComputedStyle(el).opacity }));
    // La regla global de movimiento reducido deja 0,01 ms: a efectos prácticos, sin transición.
    expect(quieto.d).toBeLessThanOrEqual(0.00001);
    expect(quieto.o).toBe("1");
    // El paso de tarifa a $0 no se anima.
    await comuna(page).selectOption("Centro");
    const animaciones = await envio(page).evaluate((el) => [el, ...el.querySelectorAll("*")].flatMap((e) => e.getAnimations()).length);
    expect(animaciones).toBe(0);
  });

  test("ninguna clase hoja/success/oro/grana/terracota en los textos de la función", async ({ page }) => {
    await pasoEnvio(page, KG1);
    await destino(page, "Bucaramanga");
    await comuna(page).selectOption("Centro");
    expect(await clasesProhibidas(page, "[data-testid=campo-comuna], [data-testid=linea-envio], [data-testid=linea-total]")).toEqual([]);
    await page.goto("/envios/");
    expect(await clasesProhibidas(page, "[data-testid=seccion-envio-gratis], [data-testid=nota-envio-gratis-tabla], [data-testid=parrafo-inicial-envios], [data-testid=caja-cotizar], [data-testid=plazo-zona-1], [data-testid=plazo-zona-5]")).toEqual([]);
    await page.goto("/");
    expect(await clasesProhibidas(page, "[data-testid=anuncio-envio-gratis-inicio]")).toEqual([]);
  });

  test("/envios/: párrafo inicial, fila de zona 1, salvedad, sección #envio-gratis, plazos y caja de cotizar (§8.5)", async ({ page }) => {
    await page.goto("/envios/#envio-gratis");
    const titulo = page.locator("#envio-gratis");
    await expect(titulo).toHaveText("Envío gratis en comunas de Bucaramanga");
    // El ancla deja el título visible bajo el encabezado fijo.
    const top = await titulo.evaluate((el) => el.getBoundingClientRect().top);
    const alto = await page.locator("header").first().evaluate((el) => el.getBoundingClientRect().bottom);
    expect(top).toBeGreaterThanOrEqual(alto);
    await expect(page.getByTestId("parrafo-inicial-envios")).toHaveText(
      "El envío se calcula por zona y por peso, y lo ves en tu pedido en cuanto eliges la ciudad. Pagas el valor que te mostramos; solo se cotiza aparte en zonas especiales y en pedidos de más de 5 kg. En siete comunas de Bucaramanga el envío es gratis con cualquier peso, si verificamos por el chat que tu dirección está en una de ellas. Ver condiciones",
    );
    await expect(page.getByTestId("parrafo-inicial-envios").getByRole("link", { name: "Ver condiciones" })).toHaveAttribute("href", "#envio-gratis");
    const nota = page.getByTestId("tarifa-bucaramanga").getByTestId("nota-envio-gratis-tabla");
    await expect(nota).toHaveText("Gratis en siete comunas, con cualquier peso (ver condiciones).");
    await expect(nota).toHaveAttribute("href", "#envio-gratis");
    await expect(page.getByTestId("nota-envio-gratis-tabla")).toHaveCount(1);
    await expect(page.getByTestId("tarifa-bucaramanga")).toContainText("$8.800");
    await expect(page.getByTestId("leyenda-iva")).toContainText("Más de 5 kg, en cualquier zona, se cotiza aparte. Salvo en las siete comunas de Bucaramanga con envío gratis.");
    await expect(page.getByTestId("lista-comunas").locator("li")).toHaveText(ALFABETICAS);
    await expect(page.getByTestId("seccion-envio-gratis").getByRole("link", { name: "envíos, devoluciones, retracto y garantía" })).toHaveAttribute("href", "/legal/envios-devoluciones/");
    await expect(page.getByTestId("plazo-zona-1")).toContainText(
      "Con envío gratis en comunas de Bucaramanga, el máximo es 1 día hábil con cualquier peso, contado desde que validamos tu pedido y te damos el aprobado por el chat (ver condiciones).",
    );
    await expect(page.getByTestId("plazo-zona-1").getByRole("link", { name: "ver condiciones" })).toHaveAttribute("href", "#envio-gratis");
    await expect(page.getByTestId("plazo-zona-5")).toContainText("No aplica a las siete comunas de Bucaramanga con envío gratis.");
    await expect(page.getByTestId("caja-cotizar")).toHaveText(
      "Escríbenos al +57 300 112 9874 y te cotizamos. Si tu dirección está en una de las siete comunas de Bucaramanga con envío gratis, no hace falta: el envío es gratis con cualquier peso.",
    );
    // La lista de comunas tiene el ancho de los párrafos (max-w-2xl) y no lleva pastillas.
    const anchos = await page.getByTestId("seccion-envio-gratis").evaluate((s) => ({
      lista: s.querySelector("[data-testid=lista-comunas]")!.getBoundingClientRect().width,
      parrafo: s.querySelector("p")!.getBoundingClientRect().width,
    }));
    expect(anchos.lista).toBeLessThanOrEqual(anchos.parrafo + 1);
    // Sin envío gratis en JSON-LD ni en metadatos (LEG-116).
    const cabeza = await page.evaluate(() => [...document.querySelectorAll("script[type='application/ld+json'], meta")].map((e) => e.outerHTML).join("\n"));
    expect(cabeza).not.toMatch(/gratis|comuna|shippingRate|OfferShippingDetails/i);
  });

  test("cajón del carrito: el anuncio con «Ver condiciones» lleva a /envios/#envio-gratis", async ({ page }) => {
    await sembrar(page, KG1);
    await page.goto("/cafes/");
    await page.getByRole("button", { name: /^Pedido/ }).click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await expect(cajon.getByTestId("anuncio-envio-gratis")).toHaveText(ANUNCIO);
    await cajon.getByRole("link", { name: "Ver condiciones" }).click();
    await expect(page).toHaveURL(/\/envios\/#envio-gratis$/);
    await expect(page.getByRole("dialog", { name: "Tu pedido" })).toHaveCount(0);
  });

  test("inicio: la línea de «Cómo pedir» con su enlace", async ({ page }) => {
    await page.goto("/");
    const linea = page.getByTestId("anuncio-envio-gratis-inicio");
    await expect(linea).toHaveText(ANUNCIO);
    await expect(linea.getByRole("link")).toHaveAttribute("href", "/envios/#envio-gratis");
    const alto = await linea.getByRole("link").evaluate((el) => el.getBoundingClientRect().height);
    expect(alto).toBeGreaterThanOrEqual(24);
  });

  for (const ancho of [360, 1280]) {
    test.describe(`a ${ancho} px`, () => {
      test.use({ viewport: { width: ancho, height: ancho === 360 ? 740 : 900 } });

      test("axe en el paso Envío, estados A, B, C y D, sin desborde", async ({ page }) => {
        await pasoEnvio(page, KG1);
        const sinDesborde = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
        await destino(page, "Floridablanca"); // A
        expect(await graves(page)).toEqual([]);
        await destino(page, "Bucaramanga"); // B
        expect(await graves(page)).toEqual([]);
        await comuna(page).selectOption("Ciudadela Real de Minas"); // C, la comuna más larga
        expect(await graves(page)).toEqual([]);
        expect(await sinDesborde()).toBe(true);
        await page.getByTestId("linea-envio").screenshot({ path: test.info().outputPath(`linea-envio-gratis-${ancho}.png`) });
        await comuna(page).selectOption(OTRA); // D
        expect(await graves(page)).toEqual([]);
      });

      test("«Envío gratis» y «$0» a la línea base de «Envío a Bucaramanga»", async ({ page }) => {
        await pasoEnvio(page, KG1);
        await destino(page, "Bucaramanga");
        await comuna(page).selectOption("Centro");
        // Sonda inline-block de 0 × 0 junto al primer texto: su borde inferior es la línea base de ese texto. En la
        // etiqueta (inline-flex) se envuelve el texto en un span para que la sonda no sea un elemento flex propio.
        const bases = await envio(page).evaluate((fila) => {
          const sonda = (el: Element) => {
            const envoltura = document.createElement("span");
            const s = document.createElement("span");
            s.style.cssText = "display:inline-block;width:0;height:0";
            const texto = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
            if (!texto) throw new Error("sin texto");
            texto.replaceWith(envoltura);
            envoltura.append(s, texto);
            const y = s.getBoundingClientRect().bottom;
            envoltura.replaceWith(texto);
            return y;
          };
          const dt = fila.querySelector("dt")!;
          const etiqueta = fila.querySelector("[data-testid=etiqueta-envio-gratis]")!;
          const cero = etiqueta.nextElementSibling!;
          return { rotulo: sonda(dt), etiqueta: sonda(etiqueta), cero: sonda(cero), ceroTop: cero.getBoundingClientRect().top, etiquetaTop: etiqueta.getBoundingClientRect().top };
        });
        expect(Math.abs(bases.etiqueta - bases.cero)).toBeLessThanOrEqual(1);
        // «$0» comparte línea con la etiqueta salvo que el dd parta (no a 1280 px).
        if (ancho >= 1280 || Math.abs(bases.ceroTop - bases.etiquetaTop) < 10) expect(Math.abs(bases.rotulo - bases.cero)).toBeLessThanOrEqual(1);
      });

      test("rejilla: a 360 Comuna bajo Municipio; desde sm, Comuna | Código postal en la misma fila", async ({ page }) => {
        await pasoEnvio(page, KG1);
        await destino(page, "Bucaramanga");
        // Celdas de la rejilla del formulario (hijos directos de la rejilla gap-5).
        const celda = (id: string) =>
          page.evaluate((i) => {
            const el = document.getElementById(i)!;
            let c: Element = el;
            while (c.parentElement && !c.parentElement.classList.contains("gap-5")) c = c.parentElement;
            const b = c.getBoundingClientRect();
            return { x: b.left, y: b.top, bottom: b.bottom };
          }, id);
        const mun = await celda("municipio");
        const com = await celda("comuna");
        const cp = await celda("codigoPostal");
        const dir = await celda("direccion");
        if (ancho < 640) {
          expect(Math.abs(com.y - (mun.bottom + 20))).toBeLessThanOrEqual(1);
          expect(Math.abs(cp.y - (com.bottom + 20))).toBeLessThanOrEqual(1);
          expect(com.x).toBe(mun.x);
        } else {
          expect(Math.abs(com.y - cp.y)).toBeLessThanOrEqual(1);
          expect(com.x).toBeLessThan(cp.x);
        }
        // Sin celda vacía de más: la dirección va en la fila siguiente, a un gap-5 (20 px).
        expect(Math.abs(dir.y - (Math.max(com.bottom, cp.bottom) + 20))).toBeLessThanOrEqual(1);
      });

      test("axe en el resumen (estado C), el cajón, /envios/ e inicio", async ({ page }) => {
        await pasoEnvio(page, KG1);
        await destino(page, "Bucaramanga");
        await comuna(page).selectOption("Cabecera del Llano");
        await completarDatos(page);
        await irAResumen(page);
        expect(await graves(page)).toEqual([]);
        await page.goto("/cafes/");
        await page.getByRole("button", { name: /^Pedido/ }).click();
        await expect(page.getByRole("dialog", { name: "Tu pedido" }).getByTestId("anuncio-envio-gratis")).toBeVisible();
        expect(await graves(page)).toEqual([]);
        await page.goto("/envios/#envio-gratis");
        expect(await graves(page)).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await page.goto("/");
        await page.getByTestId("anuncio-envio-gratis-inicio").scrollIntoViewIfNeeded();
        expect(await graves(page)).toEqual([]);
      });
    });
  }
});

test.describe("envío gratis por comunas: APAGADA (repositorio)", () => {
  test.skip(ENCENDIDA, "Solo con envio_gratis_desde vacía");

  test("Bucaramanga no muestra el campo; la comuna no existe en el formulario ni en los totales", async ({ page }) => {
    await pasoEnvio(page, KG6);
    await destino(page, "Bucaramanga");
    await expect(page.getByTestId("campo-comuna")).toHaveCount(0);
    await expect(page.locator("#comuna")).toHaveCount(0);
    await expect(envio(page)).toContainText("Por cotizar");
    await expect(total(page)).toHaveText(/^Total sin envío/);
    await expect(page.locator("main")).not.toContainText(/gratis|comuna/i);
  });

  test("cajón, /envios/ e inicio sin la promoción", async ({ page }) => {
    await sembrar(page, KG1);
    await page.goto("/cafes/");
    await page.getByRole("button", { name: /^Pedido/ }).click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await expect(cajon).toBeVisible();
    await expect(cajon.getByTestId("anuncio-envio-gratis")).toHaveCount(0);
    await expect(cajon).not.toContainText(/gratis/i);
    await page.goto("/envios/");
    await expect(page.locator("#envio-gratis")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/gratis|comuna/i);
    await page.goto("/");
    await expect(page.getByTestId("anuncio-envio-gratis-inicio")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/envío gratis/i);
  });
});
