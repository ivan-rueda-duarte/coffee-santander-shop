import { expect, test, type Page } from "@playwright/test";
import { clicEnProvincia, pasarPorProvincia } from "./ayudas";

const filtros = (page: Page) => page.locator("aside[aria-label=Filtros]");
const contador = (page: Page) => page.locator("#resultados-catalogo");
const chip = (page: Page, nombre: RegExp) => filtros(page).getByRole("button", { name: nombre });

async function irAlMapa(page: Page) {
  await page.locator("#mapa").scrollIntoViewIfNeeded();
  await expect(page.locator('g[data-provincia="guanenta"]')).toBeVisible();
}

test.describe("catálogo y mapa", () => {
  test("1. elegir una provincia en los chips la resalta en el mapa", async ({ page }) => {
    await page.goto("/");
    await expect(contador(page)).toHaveText("5 cafés");
    await chip(page, /^Guanentá/).click();
    await expect(chip(page, /^Guanentá/)).toHaveAttribute("aria-pressed", "true");
    await expect(contador(page)).toHaveText("2 cafés en Guanentá");
    await expect(page).toHaveURL(/provincia=guanenta/);

    await irAlMapa(page);
    await expect(page.locator('g[data-provincia="guanenta"]')).toHaveClass(/prov--elegida/);
    await expect(page.locator('g[data-provincia="comunera"]')).not.toHaveClass(/prov--elegida/);
    await expect(page.getByRole("button", { name: "Ver todo Santander" })).toBeVisible();
  });

  test("2. tocar una provincia en el mapa cambia chips, resultados y URL (ida y vuelta)", async ({ page }) => {
    await page.goto("/");
    await irAlMapa(page);
    await clicEnProvincia(page, "comunera");
    await expect(page).toHaveURL(/provincia=comunera/);
    await expect(contador(page)).toHaveText("2 cafés en Comunera");
    await expect(chip(page, /^Comunera/)).toHaveAttribute("aria-pressed", "true");

    // Segunda provincia: la selección es múltiple.
    await clicEnProvincia(page, "guanenta");
    await expect(contador(page)).toHaveText("4 cafés en Comunera y Guanentá");

    // Volver a tocar la quita.
    await clicEnProvincia(page, "comunera");
    await expect(contador(page)).toHaveText("2 cafés en Guanentá");

    // «Ver todo Santander» limpia las provincias.
    await page.getByRole("button", { name: "Ver todo Santander" }).click();
    await expect(contador(page)).toHaveText("5 cafés");
    await expect(page).not.toHaveURL(/provincia=/);
  });

  test("las provincias sin cafés no se pueden elegir y dicen «Próximamente»", async ({ page }) => {
    await page.goto("/");
    await irAlMapa(page);
    await expect(page.locator('g[data-provincia="soto"]')).toHaveClass(/prov--vacia/);
    await expect(page.locator('g[data-provincia="soto"]')).not.toHaveAttribute("role", "button");
    await expect(page.getByText("Próximamente").first()).toBeVisible();
  });

  test("al pasar el ratón sale la tarjeta de la provincia con su botón", async ({ page }) => {
    await page.goto("/");
    await irAlMapa(page);
    await pasarPorProvincia(page, "guanenta");
    const tarjeta = page.getByRole("dialog", { name: /Provincia de Guanentá/ });
    await expect(tarjeta).toBeVisible();
    await expect(tarjeta).toContainText("2 cafés");
    await page.keyboard.press("Escape");
    await expect(tarjeta).toBeHidden();
  });

  test("«Ver cafés de…» filtra, lleva al catálogo y enfoca el contador", async ({ page }) => {
    await page.goto("/");
    await irAlMapa(page);
    await pasarPorProvincia(page, "guanenta");
    await page.getByRole("button", { name: /Ver cafés de Guanentá/ }).click();
    await expect(contador(page)).toBeFocused();
    await expect(contador(page)).toHaveText("2 cafés en Guanentá");
  });

  test("el teclado alterna la provincia con Enter y con Espacio", async ({ page }) => {
    await page.goto("/");
    await irAlMapa(page);
    const comunera = page.locator('g[data-provincia="comunera"]');
    await comunera.focus();
    await page.keyboard.press("Enter");
    await expect(comunera).toHaveAttribute("aria-pressed", "true");
    await expect(comunera).toHaveAttribute("aria-label", "Provincia de Comunera, 2 cafés");
    await page.keyboard.press("Space");
    await expect(comunera).toHaveAttribute("aria-pressed", "false");
  });

  test("3. un enlace compartido reproduce los filtros", async ({ page }) => {
    await page.goto("/?provincia=guanenta,comunera&tueste=medio&orden=altitud#catalogo");
    await expect(contador(page)).toHaveText("2 cafés en Guanentá y Comunera");
    await expect(chip(page, /^Guanentá/)).toHaveAttribute("aria-pressed", "true");
    await expect(chip(page, /^Comunera/)).toHaveAttribute("aria-pressed", "true");
    await expect(filtros(page).getByRole("button", { name: /^Medio/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel("Ordenar")).toHaveValue("altitud");
    // Chips de filtros activos, removibles
    await page.getByRole("button", { name: "Quitar filtro Tueste medio" }).click();
    await expect(page).not.toHaveURL(/tueste=/);
    await expect(contador(page)).toHaveText("4 cafés en Guanentá y Comunera");
  });

  test("acepta el enlace de la v1 y ignora valores desconocidos", async ({ page }) => {
    await page.goto("/?provincia=guanenta&marca=Caf%C3%A9+Oiba&tueste=morado");
    await expect(contador(page)).toHaveText("2 cafés en Guanentá");
    await page.goto("/?provincia=mares");
    await expect(contador(page)).toHaveText("5 cafés");
  });

  test("filtros múltiples: las opciones sin resultados quedan deshabilitadas y hay estado vacío útil", async ({ page }) => {
    await page.goto("/?provincia=garcia-rovira&tueste=oscuro");
    await expect(contador(page)).toHaveText("0 cafés en García Rovira");
    await expect(page.getByText("No hay cafés con esos filtros")).toBeVisible();
    await page.getByRole("button", { name: "Quitar el último filtro" }).click();
    await expect(contador(page)).toHaveText("1 café en García Rovira");
    await page.getByRole("button", { name: "Limpiar filtros" }).first().click();
    await expect(contador(page)).toHaveText("5 cafés");
  });

  test("ordenar por precio muestra una lista plana", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Ordenar").selectOption("altitud");
    await expect(page.getByRole("heading", { level: 3, name: /^Provincia/ })).toHaveCount(0);
    const primero = page.locator("#catalogo article h3").first();
    await expect(primero).toContainText("Málaga"); // 1.850 m
  });
});
