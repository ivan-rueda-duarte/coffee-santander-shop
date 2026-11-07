import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { leerConfig, textosCasillas } from "./ayudas";

// Casillas de autorización de datos (microcopy §4.3, paquete legal v1, P21 = a) y de términos (§5.1) en el resumen de /pedido/.
// La versión y la fecha salen de data/config.csv; el botón queda deshabilitado mientras falte una casilla.

const casillas = textosCasillas();

// Terceros que no han pasado por legal: ninguno puede aparecer en las casillas.
// La transportadora «Envía» va aparte, con mayúscula, para no confundirla con «se envía por WhatsApp».
const TERCEROS_NO_APROBADOS = [/servientrega|interrapid|coordinadora|\btcc\b|deprisa|4-72|nequi|daviplata|bancolombia|\bpse\b|wompi|mercado ?pago|google|facebook|instagram|telegram/i, /\bEnv[ií]a\b/];

async function irAlResumen(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }] }));
  });
  await page.goto("/pedido/?paso=envio");
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByLabel("Departamento").selectOption("Santander");
  await page.getByLabel("Municipio").selectOption("Bucaramanga");
  await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
  await page.getByRole("radio", { name: "Transferencia Bre-B" }).check({ force: true });
  await page.getByRole("button", { name: /Revisar el pedido/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

test.describe("casillas de autorización de datos y de términos", () => {
  test("versiones y fechas legales disponibles en data/config.csv", () => {
    for (const clave of ["version_terminos", "fecha_terminos", "version_politica_datos", "fecha_politica_datos", "nombre_tienda"]) {
      expect(leerConfig(clave).length, clave).toBeGreaterThan(0);
      expect(leerConfig(clave)).not.toMatch(/TODO/i);
    }
    expect(leerConfig("fecha_politica_datos")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  for (const ancho of [320, 360]) {
    test(`a ${ancho} px: textos exactos (§4.3 y §5.1), sin premarcar, separadas, botón deshabilitado y axe limpio`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 740 });
      await irAlResumen(page);

      const grupo = page.getByRole("group", { name: "Autorizaciones" });
      const checks = grupo.getByRole("checkbox");
      await expect(checks).toHaveCount(2);
      const autorizacion = checks.nth(0);
      const terminos = checks.nth(1);
      await expect(autorizacion).toHaveAccessibleName(casillas.autorizacion);
      await expect(terminos).toHaveAccessibleName(casillas.terminos);
      await expect(autorizacion).not.toBeChecked();
      await expect(terminos).not.toBeChecked();

      // Ningún tercero sin aprobación legal en el texto de las casillas; sin «Meta» (P21 = a) ni promociones (LEG-093).
      const textoGrupo = (await grupo.innerText()).replace(/\s+/g, " ");
      for (const patron of TERCEROS_NO_APROBADOS) expect(textoGrupo).not.toMatch(patron);
      expect(textoGrupo).not.toMatch(/Meta|promocion/i);

      // Enlaces: destino, pestaña nueva, rel seguro. El prefijo basePath lo cubre e2e/basepath.spec.ts.
      const privacidad = page.getByRole("link", { name: casillas.enlacePolitica, exact: true });
      const terminosEnlace = page.getByRole("link", { name: casillas.enlaceTerminos, exact: true });
      await expect(privacidad).toHaveAttribute("href", /\/legal\/privacidad\/$/);
      await expect(terminosEnlace).toHaveAttribute("href", /\/legal\/terminos\/$/);
      for (const enlace of [privacidad, terminosEnlace]) {
        await expect(enlace).toHaveAttribute("target", "_blank");
        const rel = (await enlace.getAttribute("rel")) ?? "";
        expect(rel).toContain("noopener");
        expect(rel).toContain("noreferrer");
      }

      // Línea del vendedor (§5.4) bajo las casillas, con enlace a /legal/vendedor/.
      const vendedor = page.getByTestId("linea-vendedor");
      await expect(vendedor).toContainText(`Te vende ${leerConfig("razon_social")} · NIT ${leerConfig("nit")}`);
      await expect(vendedor).not.toContainText(/740574|Rueda Duarte/);
      await expect(vendedor.getByRole("link", { name: "Información del vendedor" })).toHaveAttribute("href", /\/legal\/vendedor\/$/);

      // Sin marcar ninguna: el botón está deshabilitado y no avanza.
      const boton = page.getByRole("button", { name: "Preparar pedido para WhatsApp" });
      await expect(boton).toBeDisabled();

      // Son independientes: marcar una no marca la otra; el botón sigue deshabilitado hasta marcar las dos.
      await terminos.check();
      await expect(autorizacion).not.toBeChecked();
      await expect(boton).toBeDisabled();
      await terminos.uncheck();
      await autorizacion.check();
      await expect(terminos).not.toBeChecked();
      await expect(boton).toBeDisabled();

      // Sin desborde horizontal y sin violaciones serias/críticas de axe.
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const graves = (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
      await page.screenshot({ path: `docs/qa/capturas/autorizacion-datos-${ancho}.png`, fullPage: true });

      // Con las dos marcadas avanza.
      await terminos.check();
      await expect(boton).toBeEnabled();
      await boton.click();
      await expect(page.getByRole("heading", { name: "Tu pedido está listo para enviar por WhatsApp" })).toBeVisible();
    });

    test(`a ${ancho} px: teclado (Espacio marca, Tab pasa por casilla → enlace → casilla)`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 740 });
      await irAlResumen(page);
      const checks = page.getByRole("group", { name: "Autorizaciones" }).getByRole("checkbox");
      await checks.nth(0).focus();
      await page.keyboard.press("Space");
      await expect(checks.nth(0)).toBeChecked();
      await expect(checks.nth(1)).not.toBeChecked();
      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name: casillas.enlacePolitica, exact: true })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(checks.nth(1)).toBeFocused();
      await page.keyboard.press("Space");
      await expect(checks.nth(1)).toBeChecked();
    });
  }
});
