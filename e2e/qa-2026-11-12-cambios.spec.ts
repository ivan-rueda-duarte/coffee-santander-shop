import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { leerConfig } from "./ayudas";

// Ronda QA 2026-11-12 (docs/qa/2026-11-12-cambios-pago-botones-vendedor.md).
// Cada prueba es el criterio de cierre de un defecto: hoy fallan a propósito.

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? archivos(p) : p.endsWith(".html") || p.endsWith(".txt") ? [p] : [];
  });
}

test("QA-013: la historia de portada no usa superlativos ni afirmaciones sin respaldo (marca v4.1, modelo C)", async ({ page }) => {
  await page.goto("/");
  const texto = (await page.locator("main").innerText()).replace(/\s+/g, " ");
  expect(texto).not.toMatch(/los mejores|el mejor|exclusiv|directamente por sus productores|puente directo entre|mucho más una tienda/i);
});

test("QA-014: /legal/vendedor/ no muestra marcadores de dato pendiente", async ({ page }) => {
  await page.goto("/legal/vendedor/");
  const texto = await page.locator("main").innerText();
  expect(texto).not.toMatch(/\[[^\]]*___[^\]]*\]|TODO/);
});

// QA-015 actualizado el 2026-11-14: D-1 confirmado (la dirección de config.csv es la del certificado) y P38 = b
// (el dueño la publica solo en /legal/vendedor/, como dato de D4). Ninguna otra página de out/ la lleva, tampoco en
// el payload del navegador. (D1, D2 y D3 la citan en minúscula, «calle 37 n.° 23-77…», como redactó el abogado.)
test("QA-015: la dirección de notificación de config.csv solo está en /legal/vendedor/ (P38 = b)", () => {
  const direccion = leerConfig("direccion_notificacion");
  test.skip(!direccion, "config.csv ya no trae direccion_notificacion");
  const con = archivos("out").filter((f) => readFileSync(f, "utf8").includes(direccion)).map((f) => f.replaceAll("\\", "/"));
  expect(con.length).toBeGreaterThan(0);
  expect(con.filter((f) => !f.includes("legal/vendedor"))).toEqual([]);
});
