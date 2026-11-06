import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// D5 (LEG-064): aviso de exclusión del retracto en el resumen, texto exacto de microcopy §5.3, solo ahí.
// D6 (LEG-068): /envios/ cierra «Plazos orientativos» con la línea de 30 días y la llamada nombra la zona 5.

const AVISO_RETRACTO = "El café es un alimento: no admite retracto. Si llega dañado o equivocado, te respondemos con la garantía.";
const PLAZO_LEGAL = "Si no publicamos un plazo máximo para tu zona, entregamos en máximo 30 días calendario, como manda la ley.";
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

const graves = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);

const sinDesborde = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

/** Apariciones de «retracto» en el <main> que NO sean el nombre de un enlace legal. */
async function retractoFueraDeEnlaces(page: Page) {
  return page.locator("main").evaluate((main) => {
    const resultado: string[] = [];
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      if (!/retracto/i.test(n.textContent ?? "")) continue;
      if ((n.parentElement as HTMLElement).closest("a")) continue;
      resultado.push((n.textContent ?? "").trim());
    }
    return resultado;
  });
}

test.describe("D5: aviso de retracto en el resumen", () => {
  for (const vp of VIEWPORTS) {
    test(`a ${vp.width} px con tarifa (Bucaramanga): texto exacto, antes de las casillas, axe y sin desborde`, async ({ page }) => {
      await page.setViewportSize(vp);
      await irAlResumen(page, "Santander", "Bucaramanga");
      const aviso = page.getByTestId("aviso-retracto");
      await expect(aviso).toHaveCount(1);
      await expect(aviso).toBeVisible();
      await expect(aviso).toHaveText(AVISO_RETRACTO);
      // Va antes de las casillas de autorización y después del total.
      const yAviso = (await aviso.boundingBox())!.y;
      const yCasillas = (await page.getByRole("group", { name: "Autorizaciones" }).boundingBox())!.y;
      const yTotal = (await page.getByTestId("linea-total").boundingBox())!.y;
      expect(yTotal).toBeLessThan(yAviso);
      expect(yAviso).toBeLessThan(yCasillas);
      // Con tarifa no hay aviso de «por cotizar».
      await expect(page.getByTestId("aviso-por-cotizar")).toHaveCount(0);
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
    await page.goto("/pedido/?paso=envio");
    await page.getByLabel("Nombre completo").fill("Ana Rueda");
    await page.getByLabel("Celular").fill("300 123 4567");
    await page.getByLabel("Departamento").selectOption("Santander");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
    await page.getByRole("radio", { name: "Efectivo contraentrega" }).check({ force: true });
    await page.getByRole("button", { name: /Revisar el pedido/ }).click();
    await expect(page.getByTestId("aviso-por-cotizar")).toBeVisible();
    await expect(page.getByTestId("aviso-retracto")).toHaveText(AVISO_RETRACTO);
  });

  test("el aviso no está en la ficha, en el cajón, en el carrito, en el paso de envío ni en la confirmación; tampoco en el mensaje de WhatsApp", async ({ page }) => {
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
    expect(await cajon.innerText()).not.toMatch(/retracto|garantía/i);
    await page.keyboard.press("Escape");
    // Carrito (/pedido/)
    await page.goto("/pedido/");
    await expect(page.getByRole("heading", { name: "Tu pedido", level: 1 })).toBeVisible();
    await expect(page.getByTestId("aviso-retracto")).toHaveCount(0);
    expect(await retractoFueraDeEnlaces(page)).toEqual([]);
    // Envío
    await page.getByRole("button", { name: /Continuar con el envío/ }).click();
    await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
    await expect(page.getByTestId("aviso-retracto")).toHaveCount(0);
    expect(await retractoFueraDeEnlaces(page)).toEqual([]);
    // Resumen → confirmación
    await page.getByLabel("Nombre completo").fill("Ana Rueda");
    await page.getByLabel("Celular").fill("300 123 4567");
    await page.getByLabel("Departamento").selectOption("Santander");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
    await page.getByRole("radio", { name: "Transferencia Bre-B" }).check({ force: true });
    await page.getByRole("button", { name: /Revisar el pedido/ }).click();
    await expect(page.getByTestId("aviso-retracto")).toHaveText(AVISO_RETRACTO);
    await page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ }).check();
    await page.getByRole("checkbox", { name: /Acepto los términos/ }).check();
    await page.getByRole("button", { name: "Preparar pedido para WhatsApp" }).click();
    await expect(page.getByRole("heading", { name: "Tu pedido está listo para enviar por WhatsApp" })).toBeVisible();
    await expect(page.getByTestId("aviso-retracto")).toHaveCount(0);
    const href = (await page.getByRole("link", { name: /Enviar por WhatsApp/ }).getAttribute("href")) ?? "";
    expect(decodeURIComponent(href.split("?text=")[1])).not.toMatch(/retracto/i);
  });

  test("inicio y catálogo: «retracto» solo como nombre del enlace legal del pie", async ({ page }) => {
    for (const ruta of ["/", "/cafes/"]) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      await expect(page.getByTestId("aviso-retracto")).toHaveCount(0);
      expect(await retractoFueraDeEnlaces(page), ruta).toEqual([]);
      const enlaces = page.locator("footer a").filter({ hasText: /retracto/i });
      await expect(enlaces).toHaveCount(1);
      await expect(enlaces).toHaveAttribute("href", "/legal/envios-devoluciones/");
    }
  });
});

test.describe("D6: /envios/ con la línea de 30 días y la pregunta de zona 5", () => {
  for (const vp of VIEWPORTS) {
    test(`a ${vp.width} px: plazo-legal al cierre de «Plazos orientativos», pregunta nueva, sin textos retirados, axe y sin desborde`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/envios/");
      await page.waitForLoadState("networkidle");
      const plazo = page.getByTestId("plazo-legal");
      await expect(plazo).toHaveCount(1);
      await expect(plazo).toBeVisible();
      await expect(plazo).toHaveText(PLAZO_LEGAL);
      // Cierra la sección: va después de la lista de zonas y antes del siguiente h2.
      const yDl = (await page.locator("dl").first().boundingBox())!;
      const yPlazo = (await plazo.boundingBox())!.y;
      const ySiguienteH2 = (await page.getByRole("heading", { name: "Si no hay reparto a domicilio" }).boundingBox())!.y;
      expect(yDl.y + yDl.height).toBeLessThanOrEqual(yPlazo + 1);
      expect(yPlazo).toBeLessThan(ySiguienteH2);
      // Dentro de la sección «Plazos orientativos» (el h2 anterior más cercano).
      expect(await plazo.evaluate((el) => {
        let n: Element | null = el;
        while ((n = n.previousElementSibling)) if (n.tagName === "H2") return n.textContent;
        return null;
      })).toBe("Plazos orientativos");

      const pregunta = page.getByText(PREGUNTA_ZONA5, { exact: true });
      await expect(pregunta).toHaveCount(1);
      await expect(pregunta).toBeVisible();
      const texto = (await page.locator("body").innerText()).replace(/\s+/g, " ");
      expect(texto).not.toContain("¿Tu destino no aparece");
      expect(texto).not.toMatch(/Máximo:?\s*\d+\s*días hábiles/i);
      // Los cinco plazos orientativos siguen publicados como orientación (sin fechas prometidas).
      for (const z of [1, 2, 3, 4, 5]) await expect(page.locator("dt", { hasText: `Zona ${z}` })).toBeVisible();
      expect(texto).toContain("Son una referencia, no una fecha de entrega");
      // Botón de WhatsApp al número de la tienda.
      await expect(page.getByRole("link", { name: "Escribir por WhatsApp" })).toHaveAttribute("href", "https://wa.me/573001129874");
      await expect(page.getByText("Escríbenos al +57 300 112 9874 y te cotizamos.")).toBeVisible();
      expect(await sinDesborde(page)).toBe(true);
      expect(await graves(page)).toEqual([]);
    });
  }
});
