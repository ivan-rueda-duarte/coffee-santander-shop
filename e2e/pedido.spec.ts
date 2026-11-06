import { expect, test, type Page } from "@playwright/test";

async function agregarCasaMartinez(page: Page) {
  await page.goto("/cafes/cafe-casa-martinez/");
  await page.getByRole("radio", { name: "Molido" }).check({ force: true });
  await page.getByRole("radio", { name: /^500 g/ }).check({ force: true });
  await expect(page.getByText("1 × 500 g · molido")).toBeVisible();
  await page.getByRole("button", { name: "Agregar al pedido" }).click();
  await expect(page.getByRole("status")).toContainText("Agregaste Café Casa Martínez: 500 g, molido");
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
    await agregarCasaMartinez(page);

    // Cajón «Tu pedido»
    await page.getByRole("button", { name: /^Pedido/ }).click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await expect(cajon).toContainText("Café Casa Martínez");
    await expect(cajon).toContainText("$47.000");
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
    await expect(page.getByText("La forma de pago se confirma por WhatsApp antes de que pagues")).toBeVisible();
    const autorizacion = page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ });
    const terminos = page.getByRole("checkbox", { name: /Acepto los términos/ });
    await expect(autorizacion).not.toBeChecked();
    await expect(terminos).not.toBeChecked();
    // Textos exactos de docs/legal/microcopy-legal.md §4.3 y §5.1 (v0.4); la razón social sale de data/config.csv.
    await expect(autorizacion).toHaveAccessibleName(
      "Autorizo a De Santander SAS a tratar mis datos personales para gestionar este pedido: confirmarlo, coordinar la entrega con la transportadora o el mensajero y, si escribí mi documento, emitir la factura a mi nombre. Entiendo que el pedido se envía por WhatsApp (Meta), que puede tratar mis datos fuera de Colombia. Más en la política de tratamiento de datos.",
    );
    await expect(terminos).toHaveAccessibleName("Acepto los términos y condiciones.");
    await page.getByRole("button", { name: "Preparar pedido para WhatsApp" }).click();
    await expect(page.getByText("Debes autorizar el tratamiento de tus datos")).toBeVisible();
    await expect(page.getByText("Debes aceptar los términos")).toBeVisible();
    await autorizacion.check();
    await terminos.check();
    await page.getByRole("button", { name: "Preparar pedido para WhatsApp" }).click();

    // 4. Confirmación
    await expect(page.getByRole("heading", { name: "Tu pedido está listo para enviar por WhatsApp" })).toBeVisible();
    const enlace = page.getByRole("link", { name: /Enviar por WhatsApp/ });
    const href = (await enlace.getAttribute("href")) ?? "";
    expect(href.startsWith("https://wa.me/573001129874?text=")).toBe(true);
    const texto = decodeURIComponent(href.split("?text=")[1]);
    expect(texto).toContain("• Café Casa Martínez (Guanentá) — Molido — 500 g × 1 = $47.000");
    expect(texto).toContain("Subtotal: $47.000");
    expect(texto).toContain("Envío (Bucaramanga · zona 1): $8.800");
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
    await agregarCasaMartinez(page);
    await page.getByRole("button", { name: /^Pedido/ }).click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await cajon.getByRole("button", { name: "Vaciar pedido" }).click();
    await expect(cajon).toContainText("Tu pedido está vacío");
    await cajon.getByRole("button", { name: "Deshacer" }).click();
    await expect(cajon).toContainText("Café Casa Martínez");
  });

  test("cantidad: máximo de 20 bolsas por línea", async ({ page }) => {
    await page.goto("/cafes/cafe-arreboles/");
    const mas = page.getByRole("button", { name: "Una bolsa más" });
    for (let i = 0; i < 25; i++) if (await mas.isEnabled()) await mas.click();
    await expect(mas).toBeDisabled();
    await expect(page.getByRole("group", { name: "Cantidad de bolsas" })).toContainText("20");
    await page.getByRole("button", { name: "Agregar al pedido" }).click();
    await page.getByRole("button", { name: "Agregar al pedido" }).click();
    await expect(page.getByRole("status")).toContainText("hasta 20 bolsas");
  });

  test("5. recargar conserva el carrito y se sincroniza entre pestañas", async ({ page, context }) => {
    await agregarCasaMartinez(page);
    await page.reload();
    await expect(page.getByRole("button", { name: /^Pedido 1 bolsa/ })).toBeVisible();

    const otra = await context.newPage();
    await otra.goto("/");
    await expect(otra.getByRole("button", { name: /^Pedido 1 bolsa/ })).toBeVisible();
    await otra.getByRole("button", { name: /Agregar Café Arreboles/ }).click();
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
    // Los ids de la v1 apuntan a cafés que ya no están en data/catalogo.csv (cafe-oiba): el pedido se muestra vacío.
    await expect(page.getByRole("heading", { name: "Tu pedido está vacío" })).toBeVisible();
    const guardado = await page.evaluate(() => [localStorage.getItem("desantander.carrito.v1"), localStorage.getItem("desantander.carrito.v2")]);
    expect(guardado[0]).toBeNull();
    expect(JSON.parse(guardado[1]!).lineas).toEqual([]); // la línea huérfana se descarta
  });

  test("documento y código postal: opcionales, validados, en el mensaje y nunca en localStorage", async ({ page }) => {
    await agregarCasaMartinez(page);
    await page.goto("/pedido/?paso=envio");
    await llenarEnvio(page);

    // Sin documento ni código postal no hay error; el selector ofrece los cuatro tipos.
    await expect(page.getByLabel("Tipo de documento")).toContainText("Cédula de ciudadanía");
    await expect(page.getByLabel("Tipo de documento")).toContainText("Permiso por Protección Temporal (PPT)");
    const visor = page.getByRole("link", { name: "visor de 4-72" });
    await expect(visor).toHaveAttribute("href", "https://visor.codigopostal.gov.co/472/visor/");
    await expect(visor).toHaveAttribute("target", "_blank");
    await expect(visor).toHaveAttribute("rel", "noopener noreferrer");
    await expect(page.getByLabel("Código postal")).toHaveAttribute("autocomplete", "postal-code");
    await expect(page.getByLabel("Número de documento")).toHaveAttribute("autocomplete", "off");

    // Número sin tipo y código postal de otro departamento.
    await page.getByLabel("Número de documento").fill("1.098.765.432");
    await page.getByLabel("Código postal").fill("110111");
    await page.getByRole("button", { name: /Revisar el pedido/ }).click();
    await expect(page.getByText("Elige el tipo de documento.")).toBeVisible();
    await expect(page.getByText("Este código no corresponde a Santander. Revísalo en el visor de 4-72.")).toBeVisible();

    await page.getByLabel("Tipo de documento").selectOption("CC");
    await expect(page.getByLabel("Número de documento")).toHaveAttribute("inputmode", "numeric");
    await page.getByLabel("Código postal").fill("680001");
    await page.getByRole("button", { name: /Revisar el pedido/ }).click();

    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    await expect(page.getByText("Documento: CC 1098765432")).toBeVisible();
    await expect(page.getByText("Código postal: 680001")).toBeVisible();
    await page.getByRole("checkbox", { name: /Autorizo a .+ a tratar mis datos personales/ }).check();
    await page.getByRole("checkbox", { name: /Acepto los términos/ }).check();
    await page.getByRole("button", { name: "Preparar pedido para WhatsApp" }).click();

    const href = (await page.getByRole("link", { name: /Enviar por WhatsApp/ }).getAttribute("href")) ?? "";
    const texto = decodeURIComponent(href.split("?text=")[1]);
    expect(texto).toContain("Documento: CC 1098765432");
    expect(texto).toContain("Ciudad: Bucaramanga, Santander\nCódigo postal: 680001");
    expect(texto).not.toContain("Cédula");

    const almacenado = await page.evaluate(() => Object.keys(localStorage).map((k) => `${k}=${localStorage.getItem(k)}`).join("\n"));
    expect(almacenado).toContain("desantander.carrito.v2");
    for (const dato of ["1098765432", "1.098.765.432", "680001", "110111", "numeroDocumento", "tipoDocumento", "codigoPostal"]) expect(almacenado).not.toContain(dato);
  });

  test("sin pedido, /pedido/ explica que está vacío y recargar el resumen vuelve al envío", async ({ page }) => {
    await page.goto("/pedido/?paso=envio");
    await expect(page.getByRole("heading", { name: "Tu pedido está vacío" })).toBeVisible();
    await agregarCasaMartinez(page);
    await page.goto("/pedido/?paso=resumen");
    await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
  });
});
