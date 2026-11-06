import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Documento opcional y código postal manual (LEG-040 a LEG-048; docs/legal/microcopy-legal.md §4).

async function sembrar(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 2 }] }));
  });
  await page.goto("/pedido/?paso=envio");
  await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
}

async function basico(page: Page, departamento = "Santander", municipio = "Bucaramanga") {
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByLabel("Departamento").selectOption(departamento);
  await page.getByLabel("Municipio").selectOption(municipio);
  await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
  await page.getByRole("radio", { name: "Transferencia Bre-B" }).check({ force: true });
}

const revisar = (page: Page) => page.getByRole("button", { name: /Revisar el pedido/ }).click();
const tipo = (page: Page) => page.getByLabel("Tipo de documento");
const numero = (page: Page) => page.getByLabel("Número de documento");
const postal = (page: Page) => page.getByLabel("Código postal");
const enResumen = (page: Page) => expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();

async function mensaje(page: Page) {
  await page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ }).check();
  await page.getByRole("checkbox", { name: /Acepto los términos/ }).check();
  await page.getByRole("button", { name: "Preparar pedido para WhatsApp" }).click();
  const href = (await page.getByRole("link", { name: /Enviar por WhatsApp/ }).getAttribute("href")) ?? "";
  expect(href.startsWith("https://wa.me/573001129874?text=")).toBe(true);
  return decodeURIComponent(href.split("?text=")[1]);
}

test.describe("documento opcional y código postal", () => {
  test("pedido sin documento ni código postal pasa; sin líneas ni «Cédula»; casillas sin marcar", async ({ page }) => {
    await sembrar(page);
    await basico(page);
    await expect(page.getByText("Tipo de documento (opcional)")).toBeVisible();
    await expect(page.getByText("Número de documento (opcional)")).toBeVisible();
    await expect(page.getByText("Código postal (opcional)")).toBeVisible();
    await revisar(page);
    await enResumen(page);
    await expect(page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ })).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: /Acepto los términos/ })).not.toBeChecked();
    await expect(page.getByText(/^Documento:/)).toHaveCount(0);
    await expect(page.getByText(/^Código postal:/)).toHaveCount(0);
    await expect(page.getByText(/y, si escribí mi documento, emitir la factura a mi nombre/)).toBeVisible();
    // Las casillas siguen separadas: marcar una no marca la otra.
    await page.getByRole("checkbox", { name: /Acepto los términos/ }).check();
    await expect(page.getByRole("checkbox", { name: /Autorizo a/ })).not.toBeChecked();
    await page.getByRole("checkbox", { name: /Acepto los términos/ }).uncheck();
    const texto = await mensaje(page);
    expect(texto).not.toMatch(/Documento:|Código postal:|Cédula/);
  });

  test("tipo elegido sin número: se ignora, el pedido pasa", async ({ page }) => {
    await sembrar(page);
    await basico(page);
    await tipo(page).selectOption("CE");
    await revisar(page);
    await enResumen(page);
    await expect(page.getByText(/^Documento:/)).toHaveCount(0);
  });

  test("número sin tipo → «Elige el tipo de documento.»", async ({ page }) => {
    await sembrar(page);
    await basico(page);
    await numero(page).fill("12345678");
    await revisar(page);
    await expect(page.getByText("Elige el tipo de documento.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toHaveCount(0);
  });

  test("CC: solo dígitos hasta 10 y normaliza «1.098.765.432»", async ({ page }) => {
    await sembrar(page);
    await basico(page);
    await tipo(page).selectOption("CC");
    for (const malo of ["ABC1234", "12345678901", "12"]) {
      await numero(page).fill(malo);
      await revisar(page);
      await expect(page.locator("#numeroDocumento-error")).toBeVisible();
      await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toHaveCount(0);
    }
    await numero(page).fill("1.098.765.432");
    await revisar(page);
    await enResumen(page);
    await expect(page.getByText("Documento: CC 1098765432")).toBeVisible();
    expect(await mensaje(page)).toContain("Documento: CC 1098765432");
  });

  for (const [t, sigla, bueno] of [["CE", "CE", "ab12345"], ["PPT", "PPT", "1234567890123456789A"], ["PAS", "Pasaporte", "pa-123456"]] as const) {
    test(`${t}: alfanumérico 3–20; rechaza símbolos, Ñ y largos`, async ({ page }) => {
      await sembrar(page);
      await basico(page);
      await tipo(page).selectOption(t);
      for (const malo of ["AB", "AB#123", "AÑ1234", "AB 12$"]) {
        await numero(page).fill(malo);
        await revisar(page);
        await expect(page.locator("#numeroDocumento-error"), `rechaza «${malo}»`).toBeVisible();
        await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toHaveCount(0);
      }
      await numero(page).fill(bueno);
      await revisar(page);
      await enResumen(page);
      const esperado = bueno.replace(/[\s.-]/g, "").toUpperCase();
      await expect(page.getByText(`Documento: ${sigla} ${esperado}`)).toBeVisible();
      expect(await mensaje(page)).toContain(`Documento: ${sigla} ${esperado}`);
    });
  }

  test("código postal: 6 dígitos con prefijo del departamento", async ({ page }) => {
    await sembrar(page);
    await basico(page);
    for (const malo of ["68000", "68abcd", "110111", "050001"]) {
      await postal(page).fill(malo);
      await revisar(page);
      await expect(page.locator("#codigoPostal-error"), `rechaza «${malo}»`).toBeVisible();
    }
    // El enlace al visor sigue visible junto al error.
    await expect(page.getByRole("link", { name: "visor de 4-72" })).toBeVisible();
    await expect(page.locator("#codigoPostal")).toHaveAttribute("aria-invalid", "true");
    // Bogotá (11) acepta 11xxxx y rechaza 68xxxx.
    await page.getByLabel("Departamento").selectOption("Bogotá, D.C.");
    await page.getByLabel("Municipio").selectOption("Bogotá, D.C.");
    await postal(page).fill("680001");
    await revisar(page);
    await expect(page.locator("#codigoPostal-error")).toContainText("Bogotá");
    await postal(page).fill("110111");
    await revisar(page);
    await enResumen(page);
    expect(await mensaje(page)).toContain("Código postal: 110111");
  });

  test("los campos limitan la entrada (20 y 6 caracteres) en vez de aceptar de más", async ({ page }) => {
    await sembrar(page);
    await numero(page).fill("123456789012345678901");
    await expect(numero(page)).toHaveValue("12345678901234567890");
    await postal(page).fill("6800012");
    await expect(postal(page)).toHaveValue("680001");
  });

  test("el enlace del visor abre en pestaña nueva con noopener noreferrer", async ({ page, context }) => {
    await sembrar(page);
    const visor = page.getByRole("link", { name: "visor de 4-72" });
    await expect(visor).toHaveAttribute("href", "https://visor.codigopostal.gov.co/472/visor/");
    await expect(visor).toHaveAttribute("target", "_blank");
    await expect(visor).toHaveAttribute("rel", /noopener/);
    await expect(visor).toHaveAttribute("rel", /noreferrer/);
    void context;
  });

  test("volver del resumen conserva lo escrito y localStorage no guarda documento ni código postal", async ({ page }) => {
    await sembrar(page);
    await basico(page);
    await tipo(page).selectOption("PAS");
    await numero(page).fill("PA123456");
    await postal(page).fill("680001");
    await revisar(page);
    await enResumen(page);
    await page.getByRole("button", { name: "Volver", exact: true }).click();
    await expect(numero(page)).toHaveValue("PA123456");
    await revisar(page);
    await enResumen(page);
    await page.reload();
    const todo = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }) + location.href);
    for (const dato of ["PA123456", "680001", "tipoDocumento", "numeroDocumento", "codigoPostal", "PAS"]) expect(todo).not.toContain(dato);
  });
});

async function graves(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

for (const ancho of [320, 360]) {
  test.describe(`paso de envío a ${ancho} px`, () => {
    test.use({ viewport: { width: ancho, height: 740 } });
    const sinDesborde = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

    test("con errores de documento y código postal: axe, sin desborde, selector largo legible", async ({ page }) => {
      await sembrar(page);
      await basico(page);
      await tipo(page).selectOption("PPT");
      await numero(page).fill("AB#1");
      await postal(page).fill("110111");
      await revisar(page);
      await expect(page.locator("#numeroDocumento-error")).toBeVisible();
      await expect(page.locator("#codigoPostal-error")).toBeVisible();
      expect(await graves(page)).toEqual([]);
      expect(await sinDesborde(page)).toBe(true);
      // El selector largo no se sale de su columna ni de la ventana.
      const caja = await tipo(page).boundingBox();
      expect(caja!.x).toBeGreaterThanOrEqual(0);
      expect(caja!.x + caja!.width).toBeLessThanOrEqual(ancho);
      await tipo(page).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `docs/qa/capturas/documento-postal-errores-${ancho}.png`, fullPage: true });
    });

    test("vacío: sin desborde y axe", async ({ page }) => {
      await sembrar(page);
      expect(await graves(page)).toEqual([]);
      expect(await sinDesborde(page)).toBe(true);
    });

    test("resumen y confirmación con documento: sin desborde y axe", async ({ page }) => {
      await sembrar(page);
      await basico(page);
      await tipo(page).selectOption("PPT");
      await numero(page).fill("12345678901234567890");
      await postal(page).fill("680001");
      await revisar(page);
      await enResumen(page);
      expect(await graves(page)).toEqual([]);
      expect(await sinDesborde(page)).toBe(true);
      await mensaje(page);
      expect(await sinDesborde(page)).toBe(true);
    });
  });
}
