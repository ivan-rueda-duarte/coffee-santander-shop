import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { enviarPorWhatsapp, pestanasAbiertas } from "./ayudas";

// Vaciar el pedido al enviarlo por WhatsApp (pedido del dueño del 2026-11-19).
// Fuentes: docs/diseno/2026-11-19-vaciar-carrito.md; docs/legal/revisiones/2026-11-19-vaciar-pedido.md (LEG-188 a
// LEG-191); docs/legal/microcopy-legal.md v1.12 (§9.4, §9.5 regla 4, §9.6). Textos letra por letra de §9.6.

const CLAVE = "desantander.carrito.v2";
const DOS_LINEAS = [
  { cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 2 },
  { cafeSlug: "cafe-arreboles", gramos: 500, molienda: "molido", cantidad: 1 },
];
const DATOS = { nombre: "Ana Rueda", celular: "300 123 4567", direccion: "Calle 45 # 12-30" };
const T = {
  titulo: "Envía el mensaje en WhatsApp",
  bajadaTarifa: "Con ese mensaje nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.",
  bajadaCotizar: "Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.",
  nota: "Vaciamos «Tu pedido» en este navegador para que puedas armar uno nuevo. El mensaje de WhatsApp lleva todos los cafés.",
  rotulo: "En el mensaje",
  recuperar: "Recuperar el pedido",
  seguir: "Seguir viendo cafés",
  respaldo: "¿No se abrió WhatsApp? Copia el mensaje y envíalo al +57 300 112 9874.",
};
const DS = /DS-\d{6}-\d{4}-[A-Z2-9]{4}/;
const SERIAS = ["serious", "critical"];

const textoDe = (href: string) => decodeURIComponent(href.split("?text=")[1]);
const numeroDe = (href: string) => DS.exec(textoDe(href))?.[0];
const vista = (page: Page) => page.getByTestId("pedido-enviado");
const respaldo = (page: Page) => page.getByTestId("respaldo-whatsapp");

async function sembrar(page: Page, lineas: object[] = DOS_LINEAS) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(([k, l]) => localStorage.setItem(k as string, JSON.stringify({ version: 2, lineas: l })), [CLAVE, lineas] as const);
}

async function alResumen(page: Page, { departamento = "Santander", municipio = "Bucaramanga", lineas = DOS_LINEAS }: { departamento?: string; municipio?: string; lineas?: object[] } = {}) {
  await sembrar(page, lineas);
  await page.goto("/pedido/");
  await page.getByLabel("Nombre completo").fill(DATOS.nombre);
  await page.getByLabel("Celular").fill(DATOS.celular);
  await page.getByLabel("Departamento").selectOption(departamento);
  await page.getByLabel("Municipio").selectOption(municipio);
  await page.getByLabel("Dirección").fill(DATOS.direccion);
  await page.getByRole("button", { name: /Ver el resumen/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

async function marcarObligatorias(page: Page) {
  await page.locator("#c-ter").check();
  await page.locator("#c-aut").check();
}

const lineasGuardadas = (page: Page) => page.evaluate((k) => (JSON.parse(localStorage.getItem(k) ?? "{}") as { lineas?: unknown[] }).lineas ?? null, CLAVE);

/** Todo lo que el navegador guarda o expone fuera de la memoria de React (LEG-188 (2); LEG-149). */
const almacenado = (page: Page) =>
  page.evaluate(() => {
    const volcar = (s: Storage) => Object.fromEntries(Array.from({ length: s.length }, (_, i) => s.key(i)!).map((k) => [k, s.getItem(k)]));
    return JSON.stringify({ local: volcar(localStorage), session: volcar(sessionStorage), historia: history.state, url: location.href, cookies: document.cookie });
  });

async function axeSerio(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  return r.violations.filter((v) => SERIAS.includes(v.impact ?? "")).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

test.describe("Vaciar el pedido al enviarlo (LEG-188 a LEG-191)", () => {
  test("clic válido: abre wa.me, vacía el pedido sin aviso y muestra «Mensaje listo» con los textos de §9.6", async ({ page }) => {
    await alResumen(page);
    await marcarObligatorias(page);
    const href = await enviarPorWhatsapp(page);
    expect(href).toMatch(/^https:\/\/(api\.)?wa\.me\//);

    await expect(vista(page)).toBeVisible();
    await expect(page).toHaveURL(/\/pedido\/\?paso=resumen$/);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveText(T.titulo);
    await expect(h1).toBeFocused();
    await expect(page.getByTestId("bajada-mensaje-listo")).toHaveText(T.bajadaTarifa);
    await expect(page.getByTestId("nota-vaciado")).toHaveText(T.nota);
    const bloque = page.getByTestId("bloque-en-el-mensaje");
    await expect(bloque.getByRole("heading", { name: T.rotulo })).toBeVisible();
    await expect(bloque.getByRole("listitem")).toHaveText(["Café Casa Martínez · 250 g · grano × 2", "Café Arreboles · 500 g · molido × 1"]);
    await expect(bloque).toContainText("3 bolsas");
    await expect(respaldo(page).getByRole("status")).toHaveText(T.respaldo);
    await expect(page.getByRole("button", { name: T.recuperar })).toBeVisible();
    await expect(page.getByRole("link", { name: T.seguir })).toHaveAttribute("href", /\/cafes\/$/);

    // Sin indicador de pasos (LEG-175), sin «Vaciar pedido» (LEG-190) y sin aviso flotante (diseño, decisión 7).
    await expect(page.getByRole("list", { name: "Pasos del pedido" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Vaciar pedido" })).toHaveCount(0);
    await expect(page.getByText("Vaciaste el pedido.")).toHaveCount(0);

    // Pedido en 0 en el navegador y en la cabecera.
    expect(await lineasGuardadas(page)).toEqual([]);
    await expect(page.locator("#boton-pedido")).toHaveText("Pedido");

    // El número DS no aparece fuera del mensaje (LEG-191); la vista no dice enviado, recibido, confirmado, compra ni
    // finalizado (LEG-188 (4)).
    const fuera = await vista(page).evaluate((el) => {
      const c = el.cloneNode(true) as HTMLElement;
      c.querySelector("pre")?.remove();
      return c.innerText;
    });
    expect(fuera).not.toMatch(DS);
    expect(fuera).not.toMatch(/enviad|recibid|confirmad|compra|finaliz|número de pedido/i);
  });

  test("«Copiar mensaje», «Ver el mensaje» y el segundo clic usan la misma copia: mismo texto y mismo DS", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await alResumen(page);
    await marcarObligatorias(page);
    const href = await enviarPorWhatsapp(page);
    await expect(vista(page)).toBeVisible();

    await page.getByText("Ver el mensaje").click();
    await expect(page.locator("#mensaje-pedido")).toHaveText(textoDe(href));
    await page.getByRole("button", { name: "Copiar mensaje" }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(textoDe(href));

    const otra = await enviarPorWhatsapp(page);
    expect(otra).toBe(href);
    await expect(vista(page)).toBeVisible();
    expect(await lineasGuardadas(page)).toEqual([]);
  });

  test("clic sin casillas: no se abre nada, no se vacía nada y no aparece la vista (LEG-188 (1))", async ({ page }) => {
    await alResumen(page);
    // aria-disabled mientras falten casillas: el clic se fuerza, como el de una persona.
    const n = await pestanasAbiertas(page, () => page.getByRole("button", { name: "Enviar por WhatsApp" }).click({ force: true }));
    expect(n).toBe(0);
    await expect(vista(page)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    expect(await lineasGuardadas(page)).toHaveLength(2);
    await page.locator("#c-ter").check();
    const n2 = await pestanasAbiertas(page, () => page.getByRole("button", { name: "Enviar por WhatsApp" }).click({ force: true }));
    expect(n2).toBe(0);
    expect(await lineasGuardadas(page)).toHaveLength(2);
  });

  test("ningún dato del formulario ni el mensaje en localStorage, sessionStorage, history.state, URL ni cookies (LEG-188 (2))", async ({ page }) => {
    await alResumen(page);
    await marcarObligatorias(page);
    const antes = await almacenado(page);
    const href = await enviarPorWhatsapp(page);
    await expect(vista(page)).toBeVisible();
    const despues = await almacenado(page);
    const ds = numeroDe(href)!;
    for (const volcado of [antes, despues]) {
      for (const dato of [DATOS.nombre, DATOS.celular, DATOS.direccion, "Bucaramanga", ds, "wa.me", "Acepto los Términos"]) {
        expect(volcado, dato).not.toContain(dato);
      }
    }
    // Tras recuperar, solo vuelven las líneas del carrito.
    await page.getByRole("button", { name: T.recuperar }).click();
    const recuperado = await almacenado(page);
    for (const dato of [DATOS.nombre, DATOS.celular, DATOS.direccion, ds]) expect(recuperado, dato).not.toContain(dato);
  });

  test("«Recuperar el pedido»: vuelve al Resumen con datos y casillas, foco en el h1, respaldo y el mismo DS (§4 bis)", async ({ page }) => {
    await alResumen(page);
    await marcarObligatorias(page);
    await page.locator("#c-promo-wa").check();
    const href = await enviarPorWhatsapp(page);
    await page.getByRole("button", { name: T.recuperar }).click();

    const h1 = page.getByRole("heading", { level: 1, name: "Revisa tu pedido" });
    await expect(h1).toBeVisible();
    await expect(h1).toBeFocused();
    expect(await lineasGuardadas(page)).toHaveLength(2);
    await expect(page.locator("#boton-pedido")).toContainText("3");
    await expect(page.getByText(DATOS.nombre, { exact: true })).toBeVisible();
    await expect(page.locator("#c-ter")).toBeChecked();
    await expect(page.locator("#c-aut")).toBeChecked();
    await expect(page.locator("#c-promo-wa")).toBeChecked();
    await expect(respaldo(page)).toBeVisible();
    await expect(respaldo(page).getByRole("button")).toHaveText(["Copiar mensaje"]);

    // Sin cambios: el mismo enlace y el mismo DS; y el pedido se vuelve a vaciar.
    const otra = await enviarPorWhatsapp(page);
    expect(otra).toBe(href);
    await expect(vista(page)).toBeVisible();
    expect(await lineasGuardadas(page)).toEqual([]);

    // Recuperar otra vez y cambiar una casilla: el respaldo se va y el siguiente clic da un DS nuevo (QA-022).
    await page.getByRole("button", { name: T.recuperar }).click();
    await expect(respaldo(page)).toBeVisible();
    await page.locator("#c-promo-wa").uncheck();
    await expect(respaldo(page)).toHaveCount(0);
    await page.locator("#c-promo-wa").check();
    await expect(respaldo(page)).toHaveCount(0);
    const nueva = await enviarPorWhatsapp(page);
    expect(numeroDe(nueva)).not.toBe(numeroDe(href));
  });

  test("«Deshacer» del cajón vacío recupera el pedido igual que el enlace de la vista", async ({ page }) => {
    await alResumen(page);
    await marcarObligatorias(page);
    const href = await enviarPorWhatsapp(page);
    await page.locator("#boton-pedido").click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await expect(cajon).toContainText("Tu pedido está vacío");
    await cajon.getByRole("button", { name: "Deshacer" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { level: 1, name: "Revisa tu pedido" })).toBeVisible();
    await expect(respaldo(page)).toBeVisible();
    expect(await enviarPorWhatsapp(page)).toBe(href);
  });

  test("atrás desde el Resumen sigue en «Mensaje listo»; recargar deja «Tu pedido está vacío»", async ({ page }) => {
    await alResumen(page);
    await marcarObligatorias(page);
    await enviarPorWhatsapp(page);
    await page.goBack();
    await expect(page).toHaveURL(/\/pedido\/$/);
    await expect(vista(page)).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "Tu pedido está vacío" })).toBeVisible();
    await expect(vista(page)).toHaveCount(0);
  });

  test("otra pestaña: recibe el pedido en 0 sin el mensaje; agregar un café allí descarta la vista y muestra Envío", async ({ page, context }) => {
    await alResumen(page);
    await marcarObligatorias(page);
    const otra = await context.newPage();
    await otra.goto("/pedido/");
    await expect(otra.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();

    await enviarPorWhatsapp(page);
    await expect(vista(page)).toBeVisible();
    await expect(otra.getByRole("heading", { name: "Tu pedido está vacío" })).toBeVisible();
    await expect(otra.getByTestId("pedido-enviado")).toHaveCount(0);
    await expect(otra.locator("#boton-pedido")).toHaveText("Pedido");

    await otra.goto("/cafes/");
    await otra.getByRole("button", { name: /^Agregar Café Casa Martínez/ }).click();
    await expect(vista(page)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
    await expect(page).toHaveURL(/\/pedido\/$/);
    await expect(page.getByRole("button", { name: T.recuperar })).toHaveCount(0);
  });

  test("por cotizar (Leticia): bajada T2b", async ({ page }) => {
    await alResumen(page, { departamento: "Amazonas", municipio: "Leticia" });
    await marcarObligatorias(page);
    await enviarPorWhatsapp(page);
    await expect(page.getByTestId("bajada-mensaje-listo")).toHaveText(T.bajadaCotizar);
  });

  for (const ancho of [360, 1280]) {
    test(`axe y orden de tabulación en «Mensaje listo» a ${ancho} px`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: ancho === 360 ? 740 : 900 });
      await alResumen(page);
      await marcarObligatorias(page);
      await enviarPorWhatsapp(page);
      await expect(page.getByRole("heading", { level: 1, name: T.titulo })).toBeFocused();
      expect(await axeSerio(page)).toEqual([]);
      // «Copiar mensaje» en la primera pantalla a 360 × 740 (diseño, altura aproximada).
      if (ancho === 360) await expect(page.getByRole("button", { name: "Copiar mensaje" })).toBeInViewport();

      const orden: string[] = [];
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        orden.push(await page.evaluate(() => (document.activeElement as HTMLElement).innerText.trim()));
      }
      expect(orden).toEqual(["Enviar por WhatsApp", "Copiar mensaje", "Ver el mensaje", T.recuperar, T.seguir]);
    });
  }
});
