import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { clicEnProvincia } from "./ayudas";

async function violacionesGraves(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return r.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

test.describe("6. accesibilidad", () => {
  test("inicio: axe sin violaciones serias", async ({ page }) => {
    await page.goto("/");
    await page.locator("#mapa").scrollIntoViewIfNeeded();
    await expect(page.locator('g[data-provincia="guanenta"]')).toBeVisible();
    expect(await violacionesGraves(page)).toEqual([]);
  });

  test("ficha de café: axe sin violaciones serias", async ({ page }) => {
    await page.goto("/cafes/cafe-casa-martinez/");
    expect(await violacionesGraves(page)).toEqual([]);
  });

  test("pedido: axe sin violaciones serias en cada paso", async ({ page }) => {
    await page.goto("/cafes/cafe-arreboles/");
    await page.getByRole("button", { name: "Agregar al pedido" }).click();
    await page.goto("/pedido/");
    await expect(page.getByRole("heading", { name: "Tu pedido", level: 1 })).toBeVisible();
    expect(await violacionesGraves(page)).toEqual([]);
    await page.getByRole("button", { name: /Continuar con el envío/ }).click();
    await page.getByRole("button", { name: /Revisar el pedido/ }).click(); // con errores visibles
    expect(await violacionesGraves(page)).toEqual([]);
  });

  test("cajón del pedido y página legal: axe sin violaciones serias", async ({ page }) => {
    await page.goto("/cafes/cafe-arreboles/");
    await page.getByRole("button", { name: "Agregar al pedido" }).click();
    await page.getByRole("button", { name: /^Pedido/ }).click();
    await expect(page.getByRole("dialog", { name: "Tu pedido" })).toBeVisible();
    expect(await violacionesGraves(page)).toEqual([]);
    await page.goto("/legal/privacidad/");
    expect(await violacionesGraves(page)).toEqual([]);
  });

  test("teclado: el cajón atrapa el foco, Esc lo cierra y devuelve el foco", async ({ page }) => {
    await page.goto("/cafes/cafe-arreboles/");
    await page.getByRole("button", { name: "Agregar al pedido" }).click();
    const abrir = page.getByRole("button", { name: /^Pedido/ });
    await abrir.focus();
    await page.keyboard.press("Enter");
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await expect(cajon).toBeVisible();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => Boolean(document.activeElement?.closest("[role=dialog]")))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(cajon).toBeHidden();
    await expect(abrir).toBeFocused();
  });

  test("teclado: se puede filtrar y comprar sin ratón", async ({ page }) => {
    await page.goto("/");
    const guanenta = page.locator("aside[aria-label=Filtros]").getByRole("button", { name: /^Guanentá/ });
    await guanenta.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#resultados-catalogo")).toHaveText("1 café en Guanentá");
    await page.getByRole("button", { name: /Agregar Café Casa Martínez/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: /^Pedido 1 bolsa/ })).toBeVisible();
  });

  test("movimiento reducido: el mapa cambia de encuadre sin animar", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#mapa").scrollIntoViewIfNeeded();
    const svg = page.locator('svg[aria-label="Mapa de Santander por provincias"]');
    const antes = await svg.getAttribute("viewBox");
    await clicEnProvincia(page, "guanenta");
    await expect.poll(() => svg.getAttribute("viewBox"), { timeout: 150 }).not.toBe(antes);
  });
});
