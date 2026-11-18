import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { AVISO_RETRACTO, enviarPorWhatsapp } from "./ayudas";

// D5 §6.3 (paquete del abogado v1.0): aviso de retracto de 5 días hábiles en el resumen, texto exacto.
// /envios/ publica D3 completo (LEG-141): plazos, retracto y 30 días los dice el documento, no textos paralelos (LEG-164).

const PREGUNTA_ZONA5 = "¿Tu destino es de zona 5 o pides más de 5 kg?";
const VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 360, height: 740 },
  { width: 1440, height: 900 },
];

async function sembrar(page: Page, cantidad = 2) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate((cantidad) => {
    localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad }] }));
  }, cantidad);
}

async function irAlResumen(page: Page, departamento: string, municipio: string) {
  await sembrar(page);
  await page.goto("/pedido/");
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByLabel("Departamento").selectOption(departamento);
  await page.getByLabel("Municipio").selectOption(municipio);
  await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
  await page.getByRole("button", { name: /Ver el resumen/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

const graves = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);

const sinDesborde = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

/** Apariciones de «retracto»/«retractarte» en el <main> que NO sean el nombre de un enlace legal. */
async function retractoFueraDeEnlaces(page: Page) {
  return page.locator("main").evaluate((main) => {
    const resultado: string[] = [];
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      if (!/retract/i.test(n.textContent ?? "")) continue;
      if ((n.parentElement as HTMLElement).closest("a")) continue;
      // El aviso de privacidad del formulario (D2) nombra el retracto entre las finalidades.
      if ((n.parentElement as HTMLElement).closest('[data-testid="aviso-privacidad"]')) continue;
      resultado.push((n.textContent ?? "").trim());
    }
    return resultado;
  });
}

test.describe("aviso de retracto en el resumen", () => {
  for (const vp of VIEWPORTS) {
    test(`a ${vp.width} px con tarifa (Bucaramanga): texto exacto, antes de las casillas, plazo de zona 1, axe y sin desborde`, async ({ page }) => {
      await page.setViewportSize(vp);
      await irAlResumen(page, "Santander", "Bucaramanga");
      const aviso = page.getByTestId("aviso-retracto");
      await expect(aviso).toHaveCount(1);
      await expect(aviso).toBeVisible();
      await expect(aviso).toHaveText(AVISO_RETRACTO);
      // Va antes de las casillas de autorización y después del total.
      const yAviso = (await aviso.boundingBox())!.y;
      const yCasillas = (await page.getByRole("group", { name: "Autorizaciones obligatorias" }).boundingBox())!.y;
      const yTotal = (await page.getByTestId("linea-total").boundingBox())!.y;
      expect(yTotal).toBeLessThan(yAviso);
      expect(yAviso).toBeLessThan(yCasillas);
      // Con tarifa no hay aviso de «por cotizar»; el plazo es el de la zona 1 (D5 §6.3, LEG-143).
      await expect(page.getByTestId("aviso-por-cotizar")).toHaveCount(0);
      await expect(page.getByTestId("linea-plazo")).toHaveText("Entrega estimada: el mismo día o el siguiente día hábil. Plazo máximo: 3 días hábiles, contado desde el día hábil siguiente a tu pago.");
      await expect(page.getByTestId("leyenda-iva").first()).toContainText(/^(Precio con IVA del \d+ % incluido|Precios en pesos colombianos con todos los impuestos incluidos)\.$/);
      await expect(page.getByTestId("nota-precio-total")).toContainText("Los precios incluyen todos los impuestos y el envío se muestra por separado (art. 50 de la Ley 1480 de 2011).");
      // «retracto» solo aparece en el aviso (y en los nombres de los enlaces legales).
      expect(await retractoFueraDeEnlaces(page)).toEqual([AVISO_RETRACTO]);
      expect(await sinDesborde(page)).toBe(true);
      expect(await graves(page)).toEqual([]);
      await page.screenshot({ path: `docs/qa/capturas/resumen-retracto-${vp.width}.png`, fullPage: true });
    });

    test(`a ${vp.width} px por cotizar (Leticia, zona 5): el aviso convive con «aviso-por-cotizar» y «Total sin envío»`, async ({ page }) => {
      await page.setViewportSize(vp);
      await irAlResumen(page, "Amazonas", "Leticia");
      await expect(page.getByTestId("aviso-por-cotizar")).toBeVisible();
      await expect(page.getByTestId("linea-total")).toContainText("Total sin envío");
      const aviso = page.getByTestId("aviso-retracto");
      await expect(aviso).toHaveText(AVISO_RETRACTO);
      await expect(aviso).toBeVisible();
      expect(await retractoFueraDeEnlaces(page)).toEqual([AVISO_RETRACTO]);
      expect(await sinDesborde(page)).toBe(true);
      expect(await graves(page)).toEqual([]);
    });
  }

  test("por cotizar por peso (11 × 500 g en Bucaramanga): el aviso también está", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: [{ cafeSlug: "cafe-casa-martinez", gramos: 500, molienda: "grano", cantidad: 11 }] }));
    });
    await page.goto("/pedido/");
    await page.getByLabel("Nombre completo").fill("Ana Rueda");
    await page.getByLabel("Celular").fill("300 123 4567");
    await page.getByLabel("Departamento").selectOption("Santander");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
    // Contraentrega retirada (2026-11-12): sin ayuda de comisión de recaudo.
    await expect(page.getByTestId("ayuda-contraentrega")).toHaveCount(0);
    await page.getByRole("button", { name: /Ver el resumen/ }).click();
    await expect(page.getByTestId("aviso-por-cotizar")).toBeVisible();
    await expect(page.getByTestId("aviso-retracto")).toHaveText(AVISO_RETRACTO);
  });

  test("el aviso no está en la ficha, en el cajón, en el paso de envío ni en el respaldo del resumen; tampoco en el mensaje de WhatsApp", async ({ page }) => {
    // Ficha
    await page.goto("/cafes/cafe-casa-martinez/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("aviso-retracto")).toHaveCount(0);
    expect(await retractoFueraDeEnlaces(page)).toEqual([]);
    // Cajón «Tu pedido»
    await page.getByRole("button", { name: "Agregar al pedido" }).click();
    await page.getByRole("button", { name: /^Pedido/ }).click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await expect(cajon).toBeVisible();
    expect(await cajon.innerText()).not.toMatch(/retract|garantía/i);
    await page.keyboard.press("Escape");
    // Envío (/pedido/; A1: sin paso Carrito)
    await page.goto("/pedido/");
    await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
    await expect(page.getByTestId("aviso-retracto")).toHaveCount(0);
    expect(await retractoFueraDeEnlaces(page)).toEqual([]);
    // Resumen → «Enviar por WhatsApp» (A1: sin panel de Confirmación)
    await page.getByLabel("Nombre completo").fill("Ana Rueda");
    await page.getByLabel("Celular").fill("300 123 4567");
    await page.getByLabel("Departamento").selectOption("Santander");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
    await page.getByRole("button", { name: /Ver el resumen/ }).click();
    await expect(page.getByTestId("aviso-retracto")).toHaveText(AVISO_RETRACTO);
    await page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ }).check();
    await page.getByRole("checkbox", { name: /acepto los Términos y condiciones/ }).check();
    const href = await enviarPorWhatsapp(page);
    await expect(page.getByTestId("respaldo-whatsapp")).toBeVisible();
    await expect(page.getByTestId("aviso-retracto")).toHaveCount(1);
    expect(await page.getByTestId("respaldo-whatsapp").getByRole("status").innerText()).not.toMatch(/retract/i);
    expect(decodeURIComponent(href.split("?text=")[1])).not.toMatch(/retract/i);
  });

  test("inicio y catálogo: «retracto» solo como nombre del enlace legal del pie", async ({ page }) => {
    for (const ruta of ["/", "/cafes/"]) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      await expect(page.getByTestId("aviso-retracto")).toHaveCount(0);
      expect(await retractoFueraDeEnlaces(page), ruta).toEqual([]);
      const enlaces = page.locator("footer a").filter({ hasText: /retracto/i });
      await expect(enlaces).toHaveCount(1);
      await expect(enlaces).toHaveText("Envíos, devoluciones, retracto y garantía");
      await expect(enlaces).toHaveAttribute("href", "/envios/");
    }
  });
});

test.describe("/envios/: D3 1.0 con plazos y pregunta de zona 5", () => {
  for (const vp of VIEWPORTS) {
    test(`a ${vp.width} px: plazos de D3 §6, máximo de 30 días, pregunta de zona 5, sin textos retirados, axe y sin desborde`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/envios/");
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading", { name: "6. Plazos de entrega" })).toBeVisible();
      await expect(page.getByText(/Se cuentan desde el día hábil siguiente a aquel en que recibimos tu pago\./)).toBeVisible();
      await expect(page.getByText(/el máximo se informa al cotizar y no supera treinta \(30\) días calendario/)).toBeVisible();
      for (const id of ["plazo-legal", "retracto-envios"]) await expect(page.getByTestId(id)).toHaveCount(0);
      const pregunta = page.getByText(PREGUNTA_ZONA5, { exact: true });
      await expect(pregunta).toHaveCount(1);
      await expect(pregunta).toBeVisible();
      const texto = (await page.locator("body").innerText()).replace(/\s+/g, " ");
      expect(texto).not.toContain("¿Tu destino no aparece");
      expect(texto).not.toMatch(/Plazos orientativos|Son una referencia, no una fecha de entrega/);
      await expect(page.getByRole("link", { name: "Escribir por WhatsApp" })).toHaveAttribute("href", "https://wa.me/573001129874");
      await expect(page.getByText("Escríbenos al +57 300 112 9874 y te cotizamos.")).toBeVisible();
      expect(await sinDesborde(page)).toBe(true);
      expect(await graves(page)).toEqual([]);
    });
  }
});
