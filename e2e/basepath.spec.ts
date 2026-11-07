import { expect, test } from "@playwright/test";
import { AVISO_RETRACTO, textosCasillas } from "./ayudas";

// QA-003: los enlaces internos del resumen deben llevar el basePath de GitHub Pages.
// Solo corre contra un build con GITHUB_PAGES=true servido bajo /coffee-santander-shop/:
//   GITHUB_PAGES=true npm run build
//   (copiar out/ a <dir>/coffee-santander-shop y servir <dir> con `npx serve <dir> -l 4180 -n`)
//   E2E_BASEPATH_URL=http://localhost:4180 npx playwright test e2e/basepath.spec.ts
const base = process.env.E2E_BASEPATH_URL;
const REPO = "/coffee-santander-shop";

test.describe("basePath de GitHub Pages", () => {
  test.skip(!base, "Define E2E_BASEPATH_URL con un build GITHUB_PAGES=true servido bajo /coffee-santander-shop/");

  test("resumen: los 4 enlaces internos llevan el prefijo, abren en pestaña nueva y responden 200", async ({ page, request }) => {
    await page.goto(`${base}${REPO}/`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }] }));
    });
    await page.goto(`${base}${REPO}/pedido/?paso=envio`);
    await page.getByLabel("Nombre completo").fill("Ana Rueda");
    await page.getByLabel("Celular").fill("300 123 4567");
    await page.getByLabel("Departamento").selectOption("Santander");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
    await page.getByRole("radio", { name: "Transferencia Bre-B" }).check({ force: true });
    await page.getByRole("button", { name: /Revisar el pedido/ }).click();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();

    // Casillas (microcopy §4.3 y §5.1, paquete v1) también bajo basePath, con sus enlaces prefijados.
    const casillas = textosCasillas();
    await expect(page.getByRole("checkbox", { name: casillas.autorizacion, exact: true })).not.toBeChecked();
    await expect(page.getByRole("link", { name: casillas.enlacePolitica, exact: true })).toHaveAttribute("href", `${REPO}/legal/privacidad/`);
    await expect(page.getByRole("link", { name: casillas.enlaceTerminos, exact: true })).toHaveAttribute("href", `${REPO}/legal/terminos/`);
    // QA (2026-11-06): el pie también tiene «Información del vendedor»; se busca el de la línea del vendedor del resumen.
    await expect(page.getByTestId("linea-vendedor").getByRole("link", { name: "Información del vendedor", exact: true })).toHaveAttribute("href", `${REPO}/legal/vendedor/`);

    const esperados = ["/envios/", "/legal/envios-devoluciones/", "/legal/privacidad/", "/legal/terminos/", "/legal/vendedor/"];
    for (const ruta of esperados) {
      const enlace = page.locator(`main a[target="_blank"][href$="${ruta}"]`).first();
      await expect(enlace, ruta).toHaveAttribute("href", `${REPO}${ruta}`);
      await expect(enlace).toHaveAttribute("target", "_blank");
      const rel = (await enlace.getAttribute("rel")) ?? "";
      expect(rel).toContain("noopener");
      expect(rel).toContain("noreferrer");
      expect((await request.get(`${base}${REPO}${ruta}`)).status()).toBe(200);
    }
    // Ningún <a> interno sin prefijo en el resumen.
    const sinPrefijo = await page.locator("main a[href^='/']").evaluateAll((as, repo) => as.map((a) => a.getAttribute("href")).filter((h) => h && !h.startsWith(repo + "/")), REPO);
    expect(sinPrefijo).toEqual([]);

    // Microcopy §5.3 (paquete v1): el aviso de retracto también bajo basePath, con el texto exacto.
    await expect(page.getByTestId("aviso-retracto")).toHaveText(AVISO_RETRACTO);
  });

  test("/envios/ bajo basePath: línea de 30 días (D6), pregunta de zona 5 y botón de WhatsApp", async ({ page }) => {
    await page.goto(`${base}${REPO}/envios/`);
    await expect(page.getByTestId("plazo-legal")).toHaveText("Si no publicamos un plazo máximo para tu zona, entregamos en máximo 30 días calendario, como manda la ley.");
    await expect(page.getByText("¿Tu destino es de zona 5 o pides más de 5 kg?", { exact: true })).toBeVisible();
    await expect(page.getByText("¿Tu destino no aparece")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Escribir por WhatsApp" })).toHaveAttribute("href", "https://wa.me/573001129874");
    // Los recursos (CSS/JS) cargan con el prefijo: sin estilos rotos.
    const fallidos: string[] = [];
    page.on("response", (r) => { if (r.status() >= 400) fallidos.push(`${r.status()} ${r.url()}`); });
    await page.reload();
    await page.waitForLoadState("networkidle");
    expect(fallidos).toEqual([]);
  });

  test("QA-005 bajo basePath: Departamento con San Andrés en /pedido/ pinta el nombre completo", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(`${base}${REPO}/`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }] }));
    });
    await page.goto(`${base}${REPO}/pedido/?paso=envio`);
    const nombre = "Archipiélago de San Andrés, Providencia y Santa Catalina";
    await page.getByLabel("Departamento").selectOption({ label: nombre });
    const span = page.locator("#departamento").locator("xpath=..").locator("span[aria-hidden='true']");
    await expect(span).toHaveText(nombre);
    expect(await span.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  });
});
