import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// Envío por zonas (docs/ENVIOS.md). Los límites de escalón incluyen el empaque de 80 g:
// ≤ 1.080 g → 1 kg, ≤ 2.080 g → 2 kg, ≤ 5.080 g → 5 kg, más → por cotizar.
// Cafés reales de data/catalogo.csv: sólo 250 g y 500 g (no hay 1.000 g).

const CAFE = "cafe-casa-martinez";
type Linea = { gramos: 250 | 500; cantidad: number };

async function sembrarCarrito(page: Page, lineas: Linea[]) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ({ lineas, cafe }) => {
      localStorage.removeItem("desantander.carrito.v1");
      localStorage.setItem(
        "desantander.carrito.v2",
        JSON.stringify({ version: 2, lineas: lineas.map((l) => ({ cafeSlug: cafe, gramos: l.gramos, molienda: "grano", cantidad: l.cantidad })) }),
      );
    },
    { lineas, cafe: CAFE },
  );
}

async function abrirCarrito(page: Page) {
  await page.goto("/pedido/");
  await expect(page.getByRole("heading", { name: "Tu pedido", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: /Continuar con el envío/ }).click();
}

async function pasoEnvio(page: Page, lineas: Linea[], departamento?: string, municipio?: string) {
  await sembrarCarrito(page, lineas);
  await abrirCarrito(page);
  await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
  if (departamento && municipio) await elegirDestino(page, departamento, municipio);
}

async function elegirDestino(page: Page, departamento: string, municipio: string) {
  await page.getByLabel("Departamento").selectOption(departamento);
  await page.getByLabel("Municipio").selectOption(municipio);
}

async function completarYFinalizar(page: Page) {
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
  await page.getByRole("radio", { name: "Transferencia Bre-B" }).check({ force: true });
  await page.getByRole("button", { name: /Revisar el pedido/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
  await page.getByRole("checkbox", { name: /Autorizo el tratamiento/ }).check();
  await page.getByRole("checkbox", { name: /Acepto los términos/ }).check();
  await page.getByRole("button", { name: "Finalizar compra" }).click();
  await expect(page.getByRole("heading", { name: "Tu pedido está listo en WhatsApp" })).toBeVisible();
  const href = (await page.getByRole("link", { name: /Abrir WhatsApp/ }).getAttribute("href")) ?? "";
  expect(href.startsWith("https://wa.me/573001129874?text=")).toBe(true);
  const texto = decodeURIComponent(href.split("?text=")[1]);
  expect(texto.length).toBeLessThan(2000);
  return texto;
}

const pedirHasta = async (page: Page, lineas: Linea[], departamento: string, municipio: string) => {
  await pasoEnvio(page, lineas, departamento, municipio);
  return completarYFinalizar(page);
};

const envioDe = (page: Page) => page.getByTestId("linea-envio");
const totalDe = (page: Page) => page.getByTestId("linea-total");

test.describe("envío por zonas: con tarifa", () => {
  test("Bogotá 2 × 250 g → $18.000 (zona 3) en el paso, el resumen y el mensaje", async ({ page }) => {
    await pasoEnvio(page, [{ gramos: 250, cantidad: 2 }], "Bogotá, D.C.", "Bogotá, D.C.");
    await expect(envioDe(page)).toContainText("zona 3");
    await expect(envioDe(page)).toContainText("$18.000");
    await expect(page.getByTestId("linea-subtotal")).toContainText("$60.000");
    await expect(totalDe(page)).toHaveText(/^Total\s*\$78\.000$/);
    const texto = await completarYFinalizar(page);
    expect(texto).toContain("Envío (Bogotá · zona 3): $18.000");
    expect(texto).toContain("Total: $78.000");
    expect(texto).not.toContain("POR COTIZAR");
    expect(texto).not.toContain("Quedo atento");
  });

  test("Bogotá 2 × 500 g → $18.000 (1.080 g caen en el escalón de 1 kg)", async ({ page }) => {
    await pasoEnvio(page, [{ gramos: 500, cantidad: 2 }], "Bogotá, D.C.", "Bogotá, D.C.");
    await expect(envioDe(page)).toContainText("$18.000");
    const texto = await completarYFinalizar(page);
    expect(texto).toContain("Envío (Bogotá · zona 3): $18.000");
    expect(texto).toContain("Total: $112.000");
  });

  test("Bogotá 4 × 500 g (2.080 g) → escalón de 2 kg, $23.000; 5 × 500 g → escalón de 5 kg, $33.000", async ({ page }) => {
    await pasoEnvio(page, [{ gramos: 500, cantidad: 4 }], "Bogotá, D.C.", "Bogotá, D.C.");
    await expect(envioDe(page)).toContainText("$23.000");
    await sembrarCarrito(page, [{ gramos: 500, cantidad: 5 }]);
    await abrirCarrito(page);
    await elegirDestino(page, "Bogotá, D.C.", "Bogotá, D.C.");
    await expect(envioDe(page)).toContainText("$33.000");
  });

  test("Bogotá 1 × 500 g y 1 × 250 g (830 g) → $18.000; 10 × 500 g (5.080 g) sigue con tarifa de 5 kg", async ({ page }) => {
    await pasoEnvio(page, [{ gramos: 500, cantidad: 1 }, { gramos: 250, cantidad: 1 }], "Bogotá, D.C.", "Bogotá, D.C.");
    await expect(envioDe(page)).toContainText("$18.000");
    await sembrarCarrito(page, [{ gramos: 500, cantidad: 10 }]);
    await abrirCarrito(page);
    await elegirDestino(page, "Bogotá, D.C.", "Bogotá, D.C.");
    await expect(envioDe(page)).toContainText("$33.000");
    await expect(page.getByTestId("aviso-por-cotizar")).toHaveCount(0);
  });

  test("Florencia y Quibdó son zona 4 ($22.000 para 2 × 250 g)", async ({ page }) => {
    await pasoEnvio(page, [{ gramos: 250, cantidad: 2 }], "Caquetá", "Florencia");
    await expect(envioDe(page)).toContainText("zona 4");
    await expect(envioDe(page)).toContainText("$22.000");
    await elegirDestino(page, "Chocó", "Quibdó");
    await expect(envioDe(page)).toContainText("zona 4");
    await expect(envioDe(page)).toContainText("$22.000");
    await expect(page.getByTestId("aviso-por-cotizar")).toHaveCount(0);
  });

  test("Girón y Bucaramanga: ambas zona 1 con tarifa distinta, y cambiar de municipio recalcula sin recargar", async ({ page }) => {
    await pasoEnvio(page, [{ gramos: 250, cantidad: 2 }]);
    await expect(envioDe(page)).toContainText("Se calcula al elegir tu ciudad");
    await page.evaluate(() => ((window as unknown as { __marca: number }).__marca = 42));
    await elegirDestino(page, "Santander", "Bucaramanga");
    await expect(envioDe(page)).toContainText("zona 1");
    await expect(envioDe(page)).toContainText("$8.800");
    await elegirDestino(page, "Santander", "Girón");
    await expect(envioDe(page)).toContainText("zona 1");
    await expect(envioDe(page)).toContainText("$10.500");
    await elegirDestino(page, "Bogotá, D.C.", "Bogotá, D.C.");
    await expect(envioDe(page)).toContainText("$18.000");
    await elegirDestino(page, "Santander", "Barichara");
    await expect(envioDe(page)).toContainText("zona 2");
    await expect(envioDe(page)).toContainText("$12.100");
    expect(await page.evaluate(() => (window as unknown as { __marca: number }).__marca)).toBe(42); // sin recarga
  });
});

test.describe("envío por zonas: por cotizar", () => {
  test("Leticia (zona 5): sin valor de envío, «Total sin envío», aviso y mensaje con cierre", async ({ page }) => {
    await pasoEnvio(page, [{ gramos: 250, cantidad: 2 }], "Amazonas", "Leticia");
    await expect(envioDe(page)).toContainText("Por cotizar");
    await expect(totalDe(page)).toContainText("Total sin envío");
    await expect(totalDe(page)).toContainText("$60.000");
    await page.getByLabel("Nombre completo").fill("Ana Rueda");
    await page.getByLabel("Celular").fill("300 123 4567");
    await page.getByLabel("Dirección").fill("Calle 1 # 2-3");
    await page.getByRole("radio", { name: "Transferencia Bre-B" }).check({ force: true });
    await page.getByRole("button", { name: /Revisar el pedido/ }).click();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    await expect(page.getByTestId("aviso-por-cotizar")).toBeVisible();
    await expect(page.getByTestId("aviso-por-cotizar")).toHaveText("Este valor no incluye el envío. Te lo informamos por WhatsApp y tú decides si lo aceptas antes de pagar.");
    await expect(totalDe(page)).toContainText("Total sin envío");
    await page.getByRole("checkbox", { name: /Autorizo el tratamiento/ }).check();
    await page.getByRole("checkbox", { name: /Acepto los términos/ }).check();
    await page.getByRole("button", { name: "Finalizar compra" }).click();
    await expect(page.getByTestId("texto-confirmacion")).toContainText("Tu pedido queda en firme cuando aceptas ese valor.");
    await expect(page.getByTestId("texto-confirmacion")).not.toContainText("el pedido se hace cuando lo envías");
    const href = (await page.getByRole("link", { name: /Abrir WhatsApp/ }).getAttribute("href")) ?? "";
    const texto = decodeURIComponent(href.split("?text=")[1]);
    expect(texto.length).toBeLessThan(2000);
    expect(texto).toContain("Envío: POR COTIZAR (zona especial)");
    expect(texto).toContain("Total sin envío: $60.000");
    expect(texto).not.toMatch(/^Total: /m);
    expect(texto.trimEnd().endsWith("Quedo atento al valor del envío para confirmar mi pedido.")).toBe(true);
  });

  test("más de 5 kg (11 × 500 g = 5.580 g) → por cotizar en cualquier zona, motivo «más de 5 kg»", async ({ page }) => {
    const texto = await pedirHasta(page, [{ gramos: 500, cantidad: 11 }], "Bogotá, D.C.", "Bogotá, D.C.");
    expect(texto).toContain("Envío: POR COTIZAR (más de 5 kg)");
    expect(texto).toContain("Total sin envío: $517.000");
    expect(texto.trimEnd().endsWith("Quedo atento al valor del envío para confirmar mi pedido.")).toBe(true);
  });

  test("máximo permitido (20 × 500 g) en Bucaramanga también es por cotizar", async ({ page }) => {
    await pasoEnvio(page, [{ gramos: 500, cantidad: 20 }], "Santander", "Bucaramanga");
    await expect(envioDe(page)).toContainText("Por cotizar");
    await expect(totalDe(page)).toContainText("Total sin envío");
  });

  test("con tarifa no aparecen el aviso ni el texto alterno de confirmación", async ({ page }) => {
    await pasoEnvio(page, [{ gramos: 250, cantidad: 2 }], "Bogotá, D.C.", "Bogotá, D.C.");
    await page.getByLabel("Nombre completo").fill("Ana Rueda");
    await page.getByLabel("Celular").fill("300 123 4567");
    await page.getByLabel("Dirección").fill("Calle 1 # 2-3");
    await page.getByRole("radio", { name: "Efectivo contraentrega" }).check({ force: true });
    await page.getByRole("button", { name: /Revisar el pedido/ }).click();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    await expect(page.getByTestId("aviso-por-cotizar")).toHaveCount(0);
    await expect(totalDe(page)).not.toContainText("sin envío");
    await page.getByRole("checkbox", { name: /Autorizo el tratamiento/ }).check();
    await page.getByRole("checkbox", { name: /Acepto los términos/ }).check();
    await page.getByRole("button", { name: "Finalizar compra" }).click();
    await expect(page.getByTestId("texto-confirmacion")).toContainText("el pedido se hace cuando lo envías");
    await expect(page.getByTestId("texto-confirmacion")).not.toContainText("queda en firme");
  });
});

test.describe("página /envios/ y enlaces", () => {
  test("la tabla tiene una fila por tarifa del CSV con sus valores", async ({ page }) => {
    const filas = readFileSync("data/tarifas_envio.csv", "utf8").trim().split("\n").slice(1).map((l) => l.split(","));
    await page.goto("/envios/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("tabla-envios").locator("tbody tr")).toHaveCount(filas.length);
    const cop = (n: string) => "$" + Number(n).toLocaleString("es-CO");
    for (const [zona, clave, , , a, b, c] of filas) {
      const fila = page.getByTestId(`tarifa-${clave}`);
      await expect(fila).toBeVisible();
      await expect(fila).toContainText(`Zona ${zona}`);
      if (a === "por_cotizar") await expect(fila).toContainText("Por cotizar");
      else for (const v of [a, b, c]) await expect(fila).toContainText(cop(v));
    }
  });

  test("enlaces del pie, del carrito y del resumen a /envios/ y /legal/envios-devoluciones/ responden 200", async ({ page }) => {
    await page.goto("/");
    const pie = page.locator("footer");
    for (const href of ["/envios/", "/legal/envios-devoluciones/"]) {
      const enlace = pie.locator(`a[href="${href}"]`).first();
      await expect(enlace, `pie → ${href}`).toBeVisible();
      expect((await page.request.get(href)).status(), href).toBe(200);
    }
    await pasoEnvio(page, [{ gramos: 250, cantidad: 2 }], "Santander", "Bucaramanga");
    await expect(page.locator('a[href="/envios/"]').filter({ hasText: "Cómo calculamos el envío" }).first()).toBeVisible();
    await completarResumen(page);
    for (const href of ["/envios/", "/legal/envios-devoluciones/"]) {
      await expect(page.locator(`main a[href="${href}"], #contenido a[href="${href}"]`).first()).toBeVisible();
    }
  });
});

async function completarResumen(page: Page) {
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByLabel("Dirección").fill("Calle 1 # 2-3");
  await page.getByRole("radio", { name: "Efectivo contraentrega" }).check({ force: true });
  await page.getByRole("button", { name: /Revisar el pedido/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

async function graves(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return r.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

const VIEWPORTS = [
  { nombre: "360", size: { width: 360, height: 740 } },
  { nombre: "1440", size: { width: 1440, height: 900 } },
];

for (const vp of VIEWPORTS) {
  test.describe(`accesibilidad y capturas a ${vp.nombre} px`, () => {
    test.use({ viewport: vp.size });
    const sinDesborde = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

    test("/envios/: axe sin violaciones serias, sin desborde de la página, captura", async ({ page }) => {
      await page.goto("/envios/");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `docs/qa/capturas/envios-pagina-${vp.nombre}.png`, fullPage: true });
      expect(await graves(page)).toEqual([]);
      expect(await sinDesborde(page)).toBe(true);
    });

    test("paso de envío con Bogotá y con Leticia: axe y capturas", async ({ page }) => {
      await pasoEnvio(page, [{ gramos: 250, cantidad: 2 }], "Bogotá, D.C.", "Bogotá, D.C.");
      await expect(envioDe(page)).toContainText("$18.000");
      expect(await graves(page)).toEqual([]);
      expect(await sinDesborde(page)).toBe(true);
      await page.screenshot({ path: `docs/qa/capturas/envio-bogota-${vp.nombre}.png`, fullPage: true });
      await elegirDestino(page, "Amazonas", "Leticia");
      await expect(envioDe(page)).toContainText("Por cotizar");
      expect(await graves(page)).toEqual([]);
      expect(await sinDesborde(page)).toBe(true);
      await page.screenshot({ path: `docs/qa/capturas/envio-leticia-${vp.nombre}.png`, fullPage: true });
    });

    test("resumen con tarifa y por cotizar: axe", async ({ page }) => {
      await pasoEnvio(page, [{ gramos: 250, cantidad: 2 }], "Bogotá, D.C.", "Bogotá, D.C.");
      await completarResumen(page);
      expect(await graves(page)).toEqual([]);
      await page.screenshot({ path: `docs/qa/capturas/resumen-bogota-${vp.nombre}.png`, fullPage: true });
      await page.getByRole("button", { name: "Volver", exact: true }).click();
      await elegirDestino(page, "Amazonas", "Leticia");
      await page.getByRole("button", { name: /Revisar el pedido/ }).click();
      await expect(page.getByTestId("aviso-por-cotizar")).toBeVisible();
      expect(await graves(page)).toEqual([]);
      expect(await sinDesborde(page)).toBe(true);
      await page.screenshot({ path: `docs/qa/capturas/resumen-leticia-${vp.nombre}.png`, fullPage: true });
    });
  });
}
