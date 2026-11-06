import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// D2: casillas de autorización de datos (microcopy §4.3, v0.4) y de términos (§5.1) en el resumen de /pedido/.

const razonSocial = (() => {
  const fila = readFileSync("data/config.csv", "utf8").split("\n").find((l) => l.startsWith("razon_social,"));
  return fila?.slice("razon_social,".length).trim() ?? "";
})();

const TEXTO_AUTORIZACION =
  `Autorizo a ${razonSocial} a tratar mis datos personales para gestionar este pedido: confirmarlo, coordinar la entrega con la transportadora o el mensajero y, si escribí mi documento, emitir la factura a mi nombre. Entiendo que el pedido se envía por WhatsApp (Meta), que puede tratar mis datos fuera de Colombia. Más en la política de tratamiento de datos.`;
const TEXTO_TERMINOS = "Acepto los términos y condiciones.";
const ERROR_AUTORIZACION = "Debes autorizar el tratamiento de tus datos para continuar.";
const ERROR_TERMINOS = "Debes aceptar los términos para continuar.";

// Terceros que no han pasado por legal: ninguno puede aparecer en las casillas (solo WhatsApp/Meta está aprobado).
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

test.describe("D2: casillas de autorización de datos y de términos", () => {
  test("razón social disponible en data/config.csv", () => {
    expect(razonSocial.length).toBeGreaterThan(0);
    expect(razonSocial).not.toMatch(/TODO/i);
  });

  for (const ancho of [320, 360]) {
    test(`a ${ancho} px: textos exactos (§4.3 y §5.1), sin premarcar, separadas, errores y axe limpio`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 740 });
      await irAlResumen(page);

      const casillas = page.getByRole("group", { name: "Autorizaciones" }).getByRole("checkbox");
      await expect(casillas).toHaveCount(2);
      const autorizacion = casillas.nth(0);
      const terminos = casillas.nth(1);
      await expect(autorizacion).toHaveAccessibleName(TEXTO_AUTORIZACION);
      await expect(terminos).toHaveAccessibleName(TEXTO_TERMINOS);
      await expect(autorizacion).not.toBeChecked();
      await expect(terminos).not.toBeChecked();

      // Ningún tercero sin aprobación legal en el texto de las casillas.
      const textoGrupo = (await page.getByRole("group", { name: "Autorizaciones" }).innerText()).replace(/\s+/g, " ");
      for (const patron of TERCEROS_NO_APROBADOS) expect(textoGrupo).not.toMatch(patron);
      expect(textoGrupo).toContain("WhatsApp (Meta)");

      // Enlaces: destino, pestaña nueva, rel seguro. El prefijo basePath lo cubre e2e/basepath.spec.ts.
      const privacidad = page.getByRole("link", { name: "política de tratamiento de datos", exact: true });
      const terminosEnlace = page.getByRole("link", { name: "términos y condiciones", exact: true });
      await expect(privacidad).toHaveAttribute("href", /\/legal\/privacidad\/$/);
      await expect(terminosEnlace).toHaveAttribute("href", /\/legal\/terminos\/$/);
      for (const enlace of [privacidad, terminosEnlace]) {
        await expect(enlace).toHaveAttribute("target", "_blank");
        const rel = (await enlace.getAttribute("rel")) ?? "";
        expect(rel).toContain("noopener");
        expect(rel).toContain("noreferrer");
      }

      // Sin marcar ninguna: los dos errores, con el texto exacto, y el botón no avanza.
      const boton = page.getByRole("button", { name: "Preparar pedido para WhatsApp" });
      await boton.click();
      await expect(page.getByText(ERROR_AUTORIZACION, { exact: true })).toBeVisible();
      await expect(page.getByText(ERROR_TERMINOS, { exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
      await expect(autorizacion).toHaveAttribute("aria-describedby", "e-aut");
      await expect(terminos).toHaveAttribute("aria-describedby", "e-ter");

      // Son independientes: marcar una no marca la otra; el error de la otra sigue.
      await terminos.check();
      await expect(autorizacion).not.toBeChecked();
      await boton.click();
      await expect(page.getByText(ERROR_AUTORIZACION, { exact: true })).toBeVisible();
      await expect(page.getByText(ERROR_TERMINOS, { exact: true })).toHaveCount(0);
      await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();

      // Sin desborde horizontal y sin violaciones serias/críticas de axe (con el error visible).
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const graves = (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
      await page.screenshot({ path: `docs/qa/capturas/autorizacion-datos-${ancho}.png`, fullPage: true });

      // Con las dos marcadas avanza.
      await autorizacion.check();
      await boton.click();
      await expect(page.getByRole("heading", { name: "Tu pedido está listo para enviar por WhatsApp" })).toBeVisible();
    });

    test(`a ${ancho} px: teclado (Espacio marca, Tab pasa por casilla → enlace → casilla)`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 740 });
      await irAlResumen(page);
      const casillas = page.getByRole("group", { name: "Autorizaciones" }).getByRole("checkbox");
      await casillas.nth(0).focus();
      await page.keyboard.press("Space");
      await expect(casillas.nth(0)).toBeChecked();
      await expect(casillas.nth(1)).not.toBeChecked();
      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name: "política de tratamiento de datos", exact: true })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(casillas.nth(1)).toBeFocused();
      await page.keyboard.press("Space");
      await expect(casillas.nth(1)).toBeChecked();
    });
  }
});
