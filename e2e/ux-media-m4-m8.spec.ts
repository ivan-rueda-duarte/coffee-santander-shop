import { expect, test, type Page } from "@playwright/test";

// Pruebas del desarrollador para M4 y M8 (docs/diseno/2026-11-18-ux-auditoria-media.md; LEG-183, LEG-187).
// La ficha totalmente agotada se prueba en src/ui/componentes/ficha/bloque-compra.test.tsx (ningún café del CSV lo está).

const sinDesborde = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

const TEXTO_MAPA = "Elige una provincia para ver sus cafés y filtrar el catálogo. Los puntos marcan el municipio de cada café.";

test.describe("M4 · orden del inicio y texto del mapa", () => {
  for (const ancho of [360, 1280]) {
    test(`a ${ancho} px: Portada → Mapa → Catálogo → Cómo pedir → Historia; navegación en el mismo orden; fuente visible`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto("/");
      const ids = await page.locator("main section[id]").evaluateAll((s) => s.map((e) => e.id).filter((id) => ["mapa", "catalogo", "pedir", "historia"].includes(id)));
      expect(ids).toEqual(["mapa", "catalogo", "pedir", "historia"]);
      // La portada va primero: es la primera sección del main.
      const primera = await page.locator("main section").first().getAttribute("aria-labelledby");
      expect(primera).not.toBe("titulo-mapa");

      // Los enlaces de la navegación visible (tira en celular, cabecera en escritorio) siguen el orden de las secciones.
      const nav = page.getByRole("navigation", { name: "Principal" });
      const hrefs = await nav.getByRole("link").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
      expect(hrefs.filter((h) => h?.startsWith("/#"))).toEqual(["/#mapa", "/#catalogo", "/#pedir", "/#historia"]);

      const mapa = page.locator("#mapa");
      await expect(mapa.getByRole("heading", { level: 2 })).toHaveText("Santander, provincia a provincia");
      await expect(mapa.getByText(TEXTO_MAPA, { exact: true })).toBeVisible();
      const ir = mapa.getByRole("link", { name: "Ir a los cafés" });
      await expect(ir).toHaveAttribute("href", "#catalogo");
      // LEG-187: la nota de fuente sigue en la misma columna, visible.
      await expect(mapa.getByText(/DANE/)).toBeVisible();

      await expect(page.locator("#catalogo").getByRole("heading", { level: 2 })).toHaveText("Elige por provincia");
      await expect(page.locator("#catalogo").getByText("Nuestros cafés")).toBeVisible();
      await expect(page.locator("#pedir")).toHaveClass(/\bborder-t\b/);

      await ir.click();
      await expect(page).toHaveURL(/#catalogo$/);
    });
  }
});

test.describe("M8 · tarifas de /envios/", () => {
  for (const ancho of [360, 768]) {
    test(`a ${ancho} px: tarjetas por zona, sin desplazamiento horizontal; «Cubre» igual al de la tabla`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto("/envios/");
      expect(await sinDesborde(page)).toBe(true);
      await expect(page.getByTestId("tabla-envios")).toBeHidden();
      const tarjetas = page.getByTestId("tarjetas-envios").locator('> li[data-testid^="tarjeta-zona-"]');
      const filas = page.locator('tr[data-testid^="tarifa-"]');
      const n = await filas.count();
      expect(n).toBeGreaterThan(0);
      await expect(tarjetas).toHaveCount(n);
      for (let i = 0; i < n; i++) {
        const fila = filas.nth(i);
        const tarjeta = tarjetas.nth(i);
        const clave = (await fila.getAttribute("data-testid"))!.replace("tarifa-", "");
        await expect(tarjeta).toHaveAttribute("data-testid", `tarjeta-zona-${clave}`);
        const zona = (await fila.locator("th").textContent())!.trim();
        await expect(tarjeta.locator("h4")).toHaveText(zona);
        // Texto de «Cubre» en la celda: el primer nodo de texto de la segunda columna.
        const cubreTabla = await fila.locator("td").first().evaluate((td) => td.firstChild?.textContent ?? "");
        await expect(tarjeta.getByTestId("cubre")).toHaveText(cubreTabla);
        const numero = Number(zona.replace("Zona ", ""));
        const resumen = tarjeta.locator("summary");
        if (numero <= 2) {
          await expect(resumen).toHaveCount(0);
          await expect(tarjeta.getByTestId("cubre")).toBeVisible();
        } else {
          await expect(resumen).toHaveText(`Qué cubre la zona ${numero}`);
          await expect(tarjeta.getByTestId("cubre")).toBeHidden();
          // Medio y precios fuera del desplegable, visibles sin abrirlo.
          await expect(tarjeta.locator("details").getByText(/Transportadora|Mensajero|\$|Por cotizar/)).toHaveCount(0);
          await resumen.focus();
          await page.keyboard.press("Enter");
          await expect(tarjeta.getByTestId("cubre")).toBeVisible();
          await page.keyboard.press("Space");
          await expect(tarjeta.getByTestId("cubre")).toBeHidden();
        }
        const precios = (await fila.locator("td").evaluateAll((tds) => tds.slice(1).map((t) => t.textContent!.trim())));
        for (const p of precios) await expect(tarjeta.getByText(p, { exact: true })).toBeVisible();
      }
    });
  }

  test("a 1.280 px: la tabla, sin tarjetas", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/envios/");
    await expect(page.getByTestId("tabla-envios")).toBeVisible();
    await expect(page.getByTestId("tarjetas-envios")).toBeHidden();
  });
});
