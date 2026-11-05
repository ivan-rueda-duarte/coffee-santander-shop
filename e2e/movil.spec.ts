import { expect, test, type Page } from "@playwright/test";
import { puntoEnProvincia } from "./ayudas";

test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });

const sinDesborde = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test.describe("7. celular (360 × 740)", () => {
  test("ninguna página se desborda horizontalmente", async ({ page }) => {
    for (const ruta of ["/", "/cafes/cafe-casa-martinez/", "/provincias/guanenta/", "/pedido/", "/legal/terminos/"]) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      expect(await sinDesborde(page), `desborde en ${ruta}`).toBe(true);
    }
  });

  test("filtros en una hoja inferior con el botón «Ver N cafés»", async ({ page }) => {
    await page.goto("/");
    await page.locator("#catalogo").scrollIntoViewIfNeeded();
    await expect(page.locator("aside[aria-label=Filtros]")).toBeHidden();
    await page.getByRole("button", { name: "Guanentá 1" }).click();
    await expect(page.locator("#resultados-catalogo")).toHaveText("1 café en Guanentá");
    const abrir = page.getByRole("button", { name: /^Filtros/ });
    await expect(abrir).toContainText("(1)");
    await abrir.click();
    const hoja = page.getByRole("dialog", { name: "Filtros" });
    await expect(hoja).toBeVisible();
    await hoja.getByRole("button", { name: /^Medio/ }).click();
    await expect(hoja.getByRole("button", { name: /^Ver 1 café/ })).toBeVisible();
    await hoja.getByRole("button", { name: /^Ver 1 café/ }).click();
    await expect(hoja).toBeHidden();
    await expect(page.locator("#resultados-catalogo")).toHaveText("1 café en Guanentá");
  });

  test("barra inferior «Tu pedido» y botones con tamaño táctil de al menos 40 px", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/^Tu pedido ·/)).toBeHidden();
    await page.getByRole("button", { name: /Agregar Café Arreboles/ }).click();
    const barra = page.locator("div.fixed.inset-x-0.bottom-0");
    await expect(barra).toContainText("Tu pedido · 1 bolsa");
    await expect(barra).toContainText("$23.000");
    await barra.getByRole("button", { name: "Ver pedido" }).click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await expect(cajon).toBeVisible();
    await expect(barra).toBeHidden();
    for (const boton of await cajon.getByRole("button").all()) {
      const caja = await boton.boundingBox();
      if (caja) expect(Math.min(caja.width, caja.height), await boton.innerText()).toBeGreaterThanOrEqual(40);
    }
  });

  test("tocar una provincia del mapa abre una hoja con su botón", async ({ page }) => {
    await page.goto("/");
    await page.locator("#mapa").scrollIntoViewIfNeeded();
    await expect(page.locator('g[data-provincia="guanenta"]')).toBeVisible();
    const { x, y } = await puntoEnProvincia(page, "guanenta");
    await page.touchscreen.tap(x, y);
    const hoja = page.getByRole("dialog", { name: /Provincia de Guanentá/ });
    await expect(hoja).toBeVisible();
    await expect(page).not.toHaveURL(/provincia=/); // tocar solo abre; el botón elige
    await hoja.getByRole("button", { name: /Ver cafés de Guanentá/ }).click();
    await expect(page.locator("#resultados-catalogo")).toHaveText("1 café en Guanentá");
  });
});
