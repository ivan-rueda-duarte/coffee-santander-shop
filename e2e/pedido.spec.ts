import { expect, test, type Page } from "@playwright/test";

async function agregarBarichara(page: Page) {
  await page.goto("/cafes/cafe-barichara/");
  await page.getByRole("radio", { name: "Molido" }).check({ force: true });
  await page.getByRole("radio", { name: /^500 g/ }).check({ force: true });
  await expect(page.getByText("1 × 500 g · molido")).toBeVisible();
  await page.getByRole("button", { name: "Agregar al pedido" }).click();
  await expect(page.getByRole("status")).toContainText("Agregaste Café Barichara: 500 g, molido");
}

async function llenarEnvio(page: Page) {
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByLabel("Departamento").selectOption("Santander");
  await page.getByLabel("Municipio").selectOption("Bucaramanga");
  await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
  await page.getByLabel("Barrio").fill("Cabecera");
  await page.getByLabel(/Indicaciones/).fill("Dejar en portería");
  await page.getByRole("radio", { name: "Transferencia Bre-B" }).check({ force: true });
}

test.describe("pedido", () => {
  test("4. ficha → carrito → envío → resumen → confirmación con el enlace de WhatsApp", async ({ page }) => {
    await agregarBarichara(page);

    // Cajón «Tu pedido»
    await page.getByRole("button", { name: /^Pedido/ }).click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await expect(cajon).toContainText("Café Barichara");
    await expect(cajon).toContainText("$50.000");
    await cajon.getByRole("link", { name: /Continuar con el pedido/ }).click();

    // 1. Carrito
    await expect(page).toHaveURL(/\/pedido\/$/);
    await expect(page.getByRole("heading", { name: "Tu pedido", level: 1 })).toBeVisible();
    await page.getByRole("button", { name: /Continuar con el envío/ }).click();

    // 2. Envío: errores claros por campo
    await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeFocused();
    await page.getByRole("button", { name: /Revisar el pedido/ }).click();
    await expect(page.getByRole("alert").filter({ hasText: "datos por corregir" })).toBeVisible();
    await expect(page.getByText("Escribe tu nombre.")).toBeVisible();
    await expect(page.getByLabel("Nombre completo")).toBeFocused();
    await llenarEnvio(page);
    await page.getByLabel("Celular").fill("12345");
    await page.getByRole("button", { name: /Revisar el pedido/ }).click();
    await expect(page.getByText(/celular colombiano de 10 dígitos/)).toBeVisible();
    await page.getByLabel("Celular").fill("300 123 4567");
    await page.getByRole("button", { name: /Revisar el pedido/ }).click();

    // 3. Resumen: las casillas vienen sin marcar
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    await expect(page.getByText("El costo del envío y la forma de pago se confirman por WhatsApp")).toBeVisible();
    const autorizacion = page.getByRole("checkbox", { name: /Autorizo el tratamiento/ });
    const terminos = page.getByRole("checkbox", { name: /Acepto los términos/ });
    await expect(autorizacion).not.toBeChecked();
    await expect(terminos).not.toBeChecked();
    await page.getByRole("button", { name: "Finalizar compra" }).click();
    await expect(page.getByText("Debes autorizar el tratamiento de tus datos")).toBeVisible();
    await expect(page.getByText("Debes aceptar los términos")).toBeVisible();
    await autorizacion.check();
    await terminos.check();
    await page.getByRole("button", { name: "Finalizar compra" }).click();

    // 4. Confirmación
    await expect(page.getByRole("heading", { name: "Tu pedido está listo en WhatsApp" })).toBeVisible();
    const enlace = page.getByRole("link", { name: /Abrir WhatsApp/ });
    const href = (await enlace.getAttribute("href")) ?? "";
    expect(href.startsWith("https://wa.me/573001129874?text=")).toBe(true);
    const texto = decodeURIComponent(href.split("?text=")[1]);
    expect(texto).toContain("• Café Barichara (Guanentá) — Molido — 500 g × 1 = $50.000");
    expect(texto).toContain("Subtotal: $50.000");
    expect(texto).toContain("Envío: por confirmar según la ciudad");
    expect(texto).toContain("Nombre: Ana Rueda");
    expect(texto).toContain("Celular: 300 123 4567");
    expect(texto).toContain("Ciudad: Bucaramanga, Santander");
    expect(texto).toContain("Dirección: Calle 45 # 12-30 · Barrio: Cabecera");
    expect(texto).toContain("Indicaciones: Dejar en portería");
    expect(texto).toContain("Forma de pago: Transferencia Bre-B");
    await expect(enlace).toHaveAttribute("target", "_blank");
    await expect(page.locator("#mensaje-pedido")).toHaveText(texto);

    // Editar y Vaciar
    await page.getByRole("button", { name: "Editar pedido" }).click();
    await expect(page.getByRole("heading", { name: "Tu pedido", level: 1 })).toBeVisible();
  });

  test("Vaciar pedido se puede deshacer", async ({ page }) => {
    await agregarBarichara(page);
    await page.getByRole("button", { name: /^Pedido/ }).click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await cajon.getByRole("button", { name: "Vaciar pedido" }).click();
    await expect(cajon).toContainText("Tu pedido está vacío");
    await cajon.getByRole("button", { name: "Deshacer" }).click();
    await expect(cajon).toContainText("Café Barichara");
  });

  test("cantidad: máximo de 20 bolsas por línea", async ({ page }) => {
    await page.goto("/cafes/cafe-oiba/");
    const mas = page.getByRole("button", { name: "Una bolsa más" });
    for (let i = 0; i < 25; i++) if (await mas.isEnabled()) await mas.click();
    await expect(mas).toBeDisabled();
    await expect(page.getByRole("group", { name: "Cantidad de bolsas" })).toContainText("20");
    await page.getByRole("button", { name: "Agregar al pedido" }).click();
    await page.getByRole("button", { name: "Agregar al pedido" }).click();
    await expect(page.getByRole("status")).toContainText("hasta 20 bolsas");
  });

  test("5. recargar conserva el carrito y se sincroniza entre pestañas", async ({ page, context }) => {
    await agregarBarichara(page);
    await page.reload();
    await expect(page.getByRole("button", { name: /^Pedido 1 bolsa/ })).toBeVisible();

    const otra = await context.newPage();
    await otra.goto("/");
    await expect(otra.getByRole("button", { name: /^Pedido 1 bolsa/ })).toBeVisible();
    await otra.getByRole("button", { name: /Agregar Café Oiba/ }).click();
    await expect(page.getByRole("button", { name: /^Pedido 2 bolsas/ })).toBeVisible();
  });

  test("el carrito guardado por la v1 se migra", async ({ page }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem("desantander.carrito.v2") && !sessionStorage.getItem("migrado")) {
        localStorage.setItem(
          "desantander.carrito.v1",
          JSON.stringify({ lines: [{ cafeId: 5, gramos: 250, molienda: "Molido", qty: 3 }], ciudad: "Cali", pago: "Efectivo contraentrega", sent: false }),
        );
        sessionStorage.setItem("migrado", "1");
      }
    });
    await page.goto("/pedido/");
    await expect(page.getByText("Café Oiba")).toBeVisible();
    await expect(page.getByRole("button", { name: "Una bolsa más de Café Oiba" })).toBeVisible();
    const guardado = await page.evaluate(() => [localStorage.getItem("desantander.carrito.v1"), localStorage.getItem("desantander.carrito.v2")]);
    expect(guardado[0]).toBeNull();
    expect(JSON.parse(guardado[1]!).lineas).toEqual([{ cafeSlug: "cafe-oiba", gramos: 250, molienda: "molido", cantidad: 3 }]);
    // «Cali» coincide con un solo municipio: se propone en el envío
    await page.getByRole("button", { name: /Continuar con el envío/ }).click();
    await expect(page.getByLabel("Departamento")).toHaveValue("Valle del Cauca");
    await expect(page.getByLabel("Municipio")).toHaveValue("Cali");
    await expect(page.getByRole("radio", { name: "Efectivo contraentrega" })).toBeChecked();
  });

  test("sin pedido, /pedido/ explica que está vacío y recargar el resumen vuelve al envío", async ({ page }) => {
    await page.goto("/pedido/?paso=envio");
    await expect(page.getByRole("heading", { name: "Tu pedido está vacío" })).toBeVisible();
    await agregarBarichara(page);
    await page.goto("/pedido/?paso=resumen");
    await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
  });
});
