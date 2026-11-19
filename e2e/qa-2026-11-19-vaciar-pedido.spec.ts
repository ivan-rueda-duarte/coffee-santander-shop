import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { enviarPorWhatsapp, pestanasAbiertas } from "./ayudas";

// Ronda QA 2026-11-19: verificación del vaciado del pedido al enviarlo por WhatsApp (b6f091f, c89ce30, 2b8bcc2, 259a80d).
// Fuentes: docs/diseno/2026-11-19-vaciar-carrito.md («Para QA»); docs/legal/revisiones/2026-11-19-vaciar-pedido.md
// (LEG-188 a LEG-191, seis condiciones de LEG-188); docs/legal/microcopy-legal.md v1.12 §9.4 a §9.6.
// Complementa e2e/vaciar-pedido-al-enviar.spec.ts (del desarrollador): aquí se cubre lo que ese archivo no mira.

const CLAVE = "desantander.carrito.v2";
const DOS_LINEAS = [
  { cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 2 },
  { cafeSlug: "cafe-arreboles", gramos: 500, molienda: "molido", cantidad: 1 },
];
// 11 bolsas de 500 g = 5.500 g + 80 g de empaque = 5.580 g > 5.080 g: «por cotizar» aun con destino de zona 1.
const MAS_DE_5_KG = [
  { cafeSlug: "cafe-casa-martinez", gramos: 500, molienda: "grano", cantidad: 6 },
  { cafeSlug: "cafe-arreboles", gramos: 500, molienda: "molido", cantidad: 5 },
];
const DATOS = { nombre: "Ana Rueda", celular: "300 123 4567", direccion: "Calle 45 # 12-30", indicaciones: "Portería del edificio azul" };
const DS = /DS-\d{6}-\d{4}-[A-Z2-9]{4}/;
const SERIAS = ["serious", "critical"];

// Textos letra por letra leídos de la microcopy v1.12 §9.6 (no copiados a mano del código de producción).
const MICROCOPY = readFileSync("docs/legal/microcopy-legal.md", "utf8");
function fila96(donde: RegExp): string {
  const seccion = MICROCOPY.split("### 9.6")[1].split("\n### ")[0];
  const fila = seccion.split("\n").find((l) => l.startsWith("|") && donde.test(l.split("|")[1]));
  if (!fila) throw new Error(`No encontré la fila ${donde} en microcopy §9.6`);
  return /`([^`]+)`/.exec(fila.split("|")[2])![1];
}
const T = {
  titulo: fila96(/^ h1 $/),
  bajadaTarifa: fila96(/Bajada, envío con tarifa/),
  bajadaCotizar: fila96(/Bajada, por cotizar/),
  nota: fila96(/Nota bajo la bajada/),
  rotulo: fila96(/Rótulo del bloque/),
  boton: fila96(/Botón principal/),
  recuperar: "Recuperar el pedido",
  seguir: "Seguir viendo cafés",
  respaldo: "¿No se abrió WhatsApp? Copia el mensaje y envíalo al +57 300 112 9874.",
};

const textoDe = (href: string) => decodeURIComponent(href.split("?text=")[1]);
const numeroDe = (href: string) => DS.exec(textoDe(href))?.[0];
const vista = (page: Page) => page.getByTestId("pedido-enviado");
const respaldo = (page: Page) => page.getByTestId("respaldo-whatsapp");
const lineasGuardadas = (page: Page) => page.evaluate((k) => (JSON.parse(localStorage.getItem(k) ?? "{}") as { lineas?: unknown[] }).lineas ?? null, CLAVE);

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
  const indicaciones = page.getByLabel(/^Indicaciones/);
  if (await indicaciones.count()) await indicaciones.fill(DATOS.indicaciones);
  await page.getByRole("button", { name: /Ver el resumen/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

async function marcarObligatorias(page: Page) {
  await page.locator("#c-ter").check();
  await page.locator("#c-aut").check();
}

async function axeSerio(page: Page, soloMain = false) {
  const b = soloMain ? new AxeBuilder({ page }).include("main") : new AxeBuilder({ page });
  const r = await b.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  return r.violations.filter((v) => SERIAS.includes(v.impact ?? "")).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

async function tema(page: Page, t: "light" | "dark") {
  await page.evaluate((v) => {
    document.documentElement.setAttribute("data-theme", v);
    document.querySelector("main")?.setAttribute("data-theme", v);
  }, t);
  await page.waitForTimeout(400);
}

/**
 * Registra cada window.open: si ocurrió dentro del gesto (navigator.userActivation.isActive) y qué líneas había en
 * localStorage en ese instante (LEG-188 (1): el vaciado va después de window.open, nunca antes).
 */
async function espiarWindowOpen(page: Page) {
  await page.addInitScript((clave) => {
    const w = window as unknown as { __aperturas: { activo: boolean; lineas: number; url: string }[] };
    w.__aperturas = [];
    const original = window.open.bind(window);
    window.open = (url?: string | URL, ...resto: unknown[]) => {
      const guardado = JSON.parse(localStorage.getItem(clave) ?? "{}") as { lineas?: unknown[] };
      w.__aperturas.push({ activo: navigator.userActivation?.isActive ?? false, lineas: guardado.lineas?.length ?? -1, url: String(url) });
      return original(url, ...(resto as [string?, string?]));
    };
  }, CLAVE);
}
const aperturas = (page: Page) => page.evaluate(() => (window as unknown as { __aperturas: { activo: boolean; lineas: number; url: string }[] }).__aperturas);

/** Cuenta cuántas veces se inserta en el DOM un role=status con el texto del respaldo (se anuncia una sola vez). */
async function contarAnunciosRespaldo(page: Page) {
  await page.evaluate((texto) => {
    const w = window as unknown as { __anuncios: number };
    w.__anuncios = 0;
    new MutationObserver((ms) => {
      for (const m of ms) {
        for (const n of Array.from(m.addedNodes)) {
          if (!(n instanceof HTMLElement)) continue;
          const estados = [n, ...Array.from(n.querySelectorAll("[role=status]"))].filter((e) => e.getAttribute?.("role") === "status");
          w.__anuncios += estados.filter((e) => e.textContent?.includes(texto.slice(0, 20))).length;
        }
        if (m.type === "characterData" && m.target.parentElement?.closest("[role=status]")?.textContent?.includes(texto.slice(0, 20))) w.__anuncios++;
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }, T.respaldo);
}

/**
 * Pone líneas en el carrito sin pasar por la depuración de lectura (el carrito filtra las agotadas al leer
 * localStorage y al sincronizar): despacha «reemplazar» en el reductor del CarritoProvider. Solo para forzar el caso
 * «línea agotada al pulsar», que la interfaz no deja provocar.
 */
async function forzarLineas(page: Page, lineas: object[]) {
  await page.evaluate((l) => {
    const el = document.getElementById("boton-pedido") as unknown as Record<string, unknown>;
    const k = Object.keys(el).find((x) => x.startsWith("__reactFiber$"))!;
    type Hook = { memoizedState: unknown; queue?: { dispatch?: (a: unknown) => void }; next: Hook | null };
    type Fibra = { memoizedState: Hook | null; return: Fibra | null };
    let f = el[k] as Fibra | null;
    while (f) {
      let h = f.memoizedState;
      while (h && typeof h === "object" && "next" in h) {
        const s = h.memoizedState as { lineas?: unknown; deshacer?: unknown } | null;
        if (s && Array.isArray(s.lineas) && "deshacer" in s && h.queue?.dispatch) {
          h.queue.dispatch({ tipo: "reemplazar", lineas: l });
          return;
        }
        h = h.next;
      }
      f = f.return;
    }
    throw new Error("No encontré el reductor del carrito");
  }, lineas);
}

// =====================================================================================================================
// 1. Clic válido a 360 × 740 y 1.280 × 900
// =====================================================================================================================
for (const [ancho, alto] of [[360, 740], [1280, 900]] as const) {
  test.describe(`clic válido a ${ancho} × ${alto}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: alto });
    });

    test("wa.me se abre en el gesto antes del vaciado; cabecera en 0; localStorage con lineas: []; BarraPedido ausente al salir", async ({ page }) => {
      await espiarWindowOpen(page);
      await alResumen(page);
      await marcarObligatorias(page);
      await contarAnunciosRespaldo(page);
      const href = await enviarPorWhatsapp(page);
      const ap = await aperturas(page);
      expect(ap).toHaveLength(1);
      expect(ap[0].activo, "window.open fuera del gesto del clic").toBe(true);
      expect(ap[0].lineas, "el pedido se vació antes de window.open").toBe(2);
      expect(ap[0].url).toBe(href);

      await expect(vista(page)).toBeVisible();
      await expect(page.getByRole("heading", { level: 1, name: T.titulo })).toBeFocused();
      expect(await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), CLAVE)).toEqual({ version: 2, lineas: [] });
      // Contador de la cabecera oculto: el botón «Pedido» sin número.
      await expect(page.locator("#boton-pedido")).toHaveText("Pedido");
      expect(await page.locator("#boton-pedido").innerText()).not.toMatch(/\d/);

      // Sin el aviso «Vaciaste el pedido.» (ni ningún otro aviso) durante 1,5 s; el respaldo se anuncia una sola vez.
      await page.waitForTimeout(1500);
      await expect(page.getByText("Vaciaste el pedido.")).toHaveCount(0);
      await expect(page.locator("[data-aviso]")).toHaveCount(0);
      const estados = await page.locator("[role=status]").evaluateAll((els) => els.map((e) => e.textContent?.trim() ?? "").filter(Boolean));
      expect(estados).toEqual([T.respaldo]);
      expect(await page.evaluate(() => (window as unknown as { __anuncios: number }).__anuncios)).toBe(1);

      await page.screenshot({ path: `docs/qa/capturas/2026-11-19-mensaje-listo-${ancho}.png`, fullPage: true });

      // Salir de /pedido/ con «Seguir viendo cafés»: BarraPedido no está; el cajón vacío ofrece «Deshacer».
      await page.getByRole("link", { name: T.seguir }).click();
      await expect(page).toHaveURL(/\/cafes\/$/);
      await page.waitForLoadState("networkidle");
      await expect(page.getByTestId("espaciador-barra-pedido")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Ver pedido" })).toHaveCount(0);
      await expect(page.locator("#boton-pedido")).toHaveText("Pedido");
      expect(await lineasGuardadas(page)).toEqual([]);

      // Volver a /pedido/ por navegación del cliente: la copia se perdió (Contenido se desmontó).
      await page.goBack();
      await expect(page).toHaveURL(/\/pedido\/\?paso=resumen$/);
      await expect(page.getByRole("heading", { name: "Tu pedido está vacío" })).toBeVisible();
      await expect(vista(page)).toHaveCount(0);
    });

    test("«Copiar mensaje», «Ver el mensaje», reintento y bloque «En el mensaje» salen de la misma copia (LEG-188 (3))", async ({ page, context }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await espiarWindowOpen(page);
      await alResumen(page);
      await marcarObligatorias(page);
      const href = await enviarPorWhatsapp(page);
      const texto = textoDe(href);
      const ds = numeroDe(href)!;
      expect(ds).toMatch(DS);

      await page.getByText("Ver el mensaje").click();
      expect(await page.locator("#mensaje-pedido").textContent()).toBe(texto);
      await page.getByRole("button", { name: "Copiar mensaje" }).click();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(texto);

      // Bloque «En el mensaje»: cada línea compacta corresponde a una línea del texto (café, gramos, presentación, cantidad).
      const compactas = await page.getByTestId("bloque-en-el-mensaje").getByRole("listitem").allInnerTexts();
      const delMensaje = texto.split("\n").filter((l) => l.startsWith("• "));
      expect(compactas).toHaveLength(delMensaje.length);
      for (const c of compactas) {
        const [, nombre, g, pres, n] = /^(.+) · (\d+) g · (\w+) × (\d+)$/.exec(c)!;
        expect(delMensaje.some((m) => m.startsWith(`• ${nombre} (`) && m.includes(`— ${pres[0].toUpperCase()}${pres.slice(1)} — ${g} g × ${n} =`)), c).toBe(true);
      }
      await expect(page.getByTestId("bloque-en-el-mensaje")).toContainText("3 bolsas");

      // Reintento: mismo enlace, mismo DS, sin vaciar de nuevo ni cambiar la vista; también dentro del gesto.
      const otra = await enviarPorWhatsapp(page);
      expect(otra).toBe(href);
      const ap = await aperturas(page);
      expect(ap.map((a) => a.activo)).toEqual([true, true]);
      await expect(vista(page)).toBeVisible();
      expect(await page.locator("#mensaje-pedido").textContent()).toBe(texto);
    });
  });
}

// QA-030: el diseño (docs/diseno/2026-11-19-vaciar-carrito.md, «Vista Mensaje listo, 360 px») pide que «Copiar mensaje»
// quede en la primera pantalla a 360 × 740. La prueba del desarrollador usa toBeInViewport() sin ratio, que pasa con un
// solo píxel visible; aquí se exige el botón completo. Criterio de cierre de QA-030.
test("QA-030: a 360 × 740, «Copiar mensaje» entero en la primera pantalla de «Mensaje listo»", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await alResumen(page);
  await marcarObligatorias(page);
  await enviarPorWhatsapp(page);
  await expect(page.getByRole("heading", { level: 1, name: T.titulo })).toBeFocused();
  const copiar = page.getByRole("button", { name: "Copiar mensaje" });
  const caja = await copiar.boundingBox();
  await page.screenshot({ path: "docs/qa/capturas/2026-11-19-qa-030-primera-pantalla-360.png" });
  expect(await page.evaluate(() => scrollY), "la vista no debe desplazarse al recibir el foco").toBe(0);
  await expect(copiar, `«Copiar mensaje» va de y=${caja?.y} a y=${(caja?.y ?? 0) + (caja?.height ?? 0)} con 740 px de alto`).toBeInViewport({ ratio: 1 });
});

// =====================================================================================================================
// 2. Clic no válido: sin casillas y con una línea agotada
// =====================================================================================================================
test.describe("clic no válido no vacía nada (LEG-188 (1))", () => {
  test("sin casilla 2 (solo términos) y sin casilla 1 (solo datos): no se abre nada ni se vacía", async ({ page }) => {
    await alResumen(page);
    for (const marcar of ["#c-ter", "#c-aut"]) {
      await page.locator("#c-ter").setChecked(marcar === "#c-ter");
      await page.locator("#c-aut").setChecked(marcar === "#c-aut");
      const n = await pestanasAbiertas(page, () => page.getByRole("button", { name: "Enviar por WhatsApp" }).click({ force: true }));
      expect(n).toBe(0);
      await expect(vista(page)).toHaveCount(0);
      expect(await lineasGuardadas(page)).toHaveLength(2);
      await expect(page.locator("#boton-pedido")).toContainText("3");
    }
  });

  test("línea agotada al pulsar (forzada): caja de error, no se abre wa.me, el pedido no se vacía ni aparece la vista", async ({ page }) => {
    await sembrar(page, [{ cafeSlug: "cafe-arreboles", gramos: 250, molienda: "grano", cantidad: 1 }]);
    // Casa Martínez 250 g agotado solo en el HTML de /pedido/ (los CSV no se tocan).
    let reemplazado = false;
    await page.route(/\/pedido\/(\?.*)?$/, async (r) => {
      const res = await r.fetch();
      const original = await res.text();
      const cuerpo = original.replace('{\\"gramos\\":250,\\"precioCop\\":30000,\\"disponible\\":true}', '{\\"gramos\\":250,\\"precioCop\\":30000,\\"disponible\\":false}');
      if (r.request().resourceType() === "document") reemplazado = cuerpo !== original;
      await r.fulfill({ response: res, body: cuerpo });
    });
    await page.goto("/pedido/");
    expect(reemplazado, "el reemplazo del catálogo no encontró la presentación en el HTML").toBe(true);
    await page.getByLabel("Nombre completo").fill(DATOS.nombre);
    await page.getByLabel("Celular").fill(DATOS.celular);
    await page.getByLabel("Departamento").selectOption("Santander");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    await page.getByLabel("Dirección").fill(DATOS.direccion);
    await page.getByRole("button", { name: /Ver el resumen/ }).click();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    await marcarObligatorias(page);
    await forzarLineas(page, [
      { cafeSlug: "cafe-arreboles", gramos: 250, molienda: "grano", cantidad: 1 },
      { cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 },
    ]);
    // La línea agotada no tiene precio: no suma bolsas en la cabecera, pero está en el carrito.
    await expect.poll(() => lineasGuardadas(page)).toHaveLength(2);
    const n = await pestanasAbiertas(page, () => page.getByRole("button", { name: "Enviar por WhatsApp" }).click());
    expect(n).toBe(0);
    await expect(page.getByTestId("error-lineas")).toContainText("Café Casa Martínez en 250 g está agotado.");
    await expect(page.getByTestId("error-lineas")).toBeFocused();
    await expect(vista(page)).toHaveCount(0);
    await expect(respaldo(page)).toHaveCount(0);
    expect(await lineasGuardadas(page)).toHaveLength(2);
    await expect(page.locator("#boton-pedido")).toContainText("1 bolsa");
  });
});

// =====================================================================================================================
// 3. Textos T1 a T5 letra por letra contra la microcopy v1.12; DS solo en el mensaje
// =====================================================================================================================
test.describe("textos de «Mensaje listo» contra la microcopy v1.12 §9.6", () => {
  test("T1, T2a, T3, T4, botón, T5 y «Seguir viendo cafés» exactos; ningún texto prohibido; DS solo en el mensaje", async ({ page }) => {
    // Comprobación de la lectura de la microcopy: si la tabla cambia de forma, la prueba debe fallar aquí y no pasar en falso.
    expect(T.titulo).toBe("Envía el mensaje en WhatsApp");
    expect(T.nota.startsWith("Vaciamos «Tu pedido»")).toBe(true);
    await alResumen(page);
    await marcarObligatorias(page);
    const href = await enviarPorWhatsapp(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(T.titulo);
    expect(await page.getByTestId("bajada-mensaje-listo").textContent()).toBe(T.bajadaTarifa);
    expect(await page.getByTestId("nota-vaciado").textContent()).toBe(T.nota);
    expect(await page.getByTestId("bloque-en-el-mensaje").getByRole("heading").textContent()).toBe(T.rotulo);
    expect((await vista(page).getByRole("button", { name: T.boton }).innerText()).trim()).toBe(T.boton);
    expect((await page.getByRole("button", { name: T.recuperar }).innerText()).trim()).toBe(T.recuperar);
    expect((await page.getByRole("link", { name: T.seguir }).innerText()).trim()).toBe(T.seguir);
    expect(await respaldo(page).getByRole("status").textContent()).toBe(T.respaldo);

    // Toda la página visible, el título y los atributos accesibles, sin el <pre> del mensaje: sin DS ni textos prohibidos.
    const fuera = await page.evaluate(() => {
      const c = document.body.cloneNode(true) as HTMLElement;
      c.querySelectorAll("pre, script, template").forEach((n) => n.remove());
      const atributos = Array.from(c.querySelectorAll("*")).flatMap((e) => ["aria-label", "title", "alt", "data-ds"].map((a) => e.getAttribute(a) ?? ""));
      return [document.title, c.textContent ?? "", ...atributos].join("\n");
    });
    expect(fuera).not.toContain(numeroDe(href)!);
    expect(fuera).not.toMatch(DS);
    const vistaTexto = await vista(page).evaluate((el) => {
      const c = el.cloneNode(true) as HTMLElement;
      c.querySelector("pre")?.remove();
      return c.textContent ?? "";
    });
    expect(vistaTexto).not.toMatch(/enviad|recibid|confirmad|compra|finaliz|número de pedido/i);
  });

  test("T2b con más de 5 kg (por cotizar) en Bucaramanga sin comuna", async ({ page }) => {
    await alResumen(page, { lineas: MAS_DE_5_KG });
    await marcarObligatorias(page);
    const href = await enviarPorWhatsapp(page);
    expect(textoDe(href)).toContain("POR COTIZAR");
    expect(await page.getByTestId("bajada-mensaje-listo").textContent()).toBe(T.bajadaCotizar);
    await expect(page.getByTestId("bloque-en-el-mensaje")).toContainText("11 bolsas");
  });

  test("T2b con Leticia (zona 5)", async ({ page }) => {
    await alResumen(page, { departamento: "Amazonas", municipio: "Leticia" });
    await marcarObligatorias(page);
    const href = await enviarPorWhatsapp(page);
    expect(textoDe(href)).toContain("POR COTIZAR");
    expect(await page.getByTestId("bajada-mensaje-listo").textContent()).toBe(T.bajadaCotizar);
  });
});

// =====================================================================================================================
// 4. Foco y teclado
// =====================================================================================================================
for (const ancho of [360, 1280]) {
  test(`foco al h1 y Tab h1 → Enviar → Copiar → Ver el mensaje → Recuperar → Seguir; Shift+Tab vuelve (${ancho} px)`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: ancho === 360 ? 740 : 900 });
    await alResumen(page);
    await marcarObligatorias(page);
    // Clic con teclado (Enter sobre el botón), como lo haría quien no usa ratón.
    await page.context().route(/^https:\/\/(api\.)?wa\.me\//, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<title>WhatsApp</title>" }));
    await page.getByRole("button", { name: "Enviar por WhatsApp" }).focus();
    const [popup] = await Promise.all([page.waitForEvent("popup"), page.keyboard.press("Enter")]);
    await popup.close();
    const h1 = page.getByRole("heading", { level: 1, name: T.titulo });
    await expect(h1).toBeFocused();
    const nombre = () => page.evaluate(() => (document.activeElement as HTMLElement).innerText.trim());
    const orden: string[] = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      orden.push(await nombre());
    }
    expect(orden).toEqual([T.boton, "Copiar mensaje", "Ver el mensaje", T.recuperar, T.seguir]);
    for (let i = 0; i < 4; i++) await page.keyboard.press("Shift+Tab");
    expect(await nombre()).toBe(T.boton);
    // Espacio sobre «Recuperar el pedido» (botón): vuelve el Resumen con el foco en su h1.
    for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
    expect(await nombre()).toBe(T.recuperar);
    await page.keyboard.press(" ");
    await expect(page.getByRole("heading", { level: 1, name: "Revisa tu pedido" })).toBeFocused();
  });
}

// =====================================================================================================================
// 5. Recuperar, atrás, recarga, otra pestaña
// =====================================================================================================================
test.describe("recuperar y navegación", () => {
  test("atrás → «Mensaje listo» en /pedido/; recuperar allí lleva a Envío con los datos; «Ver el resumen» da el mismo DS", async ({ page }) => {
    await alResumen(page);
    await marcarObligatorias(page);
    const href = await enviarPorWhatsapp(page);
    await page.goBack();
    await expect(page).toHaveURL(/\/pedido\/$/);
    await expect(vista(page)).toBeVisible();
    await page.getByRole("button", { name: T.recuperar }).click();
    await expect(page.getByRole("heading", { level: 1, name: "¿A dónde enviamos?" })).toBeFocused();
    await expect(page.getByLabel("Nombre completo")).toHaveValue(DATOS.nombre);
    await page.getByRole("button", { name: /Ver el resumen/ }).click();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    await expect(page.locator("#c-ter")).toBeChecked();
    await expect(page.locator("#c-aut")).toBeChecked();
    await expect(respaldo(page)).toBeVisible();
    expect(await enviarPorWhatsapp(page)).toBe(href);
  });

  test("tras recuperar, «Vaciar pedido» del cajón descarta la copia: «Deshacer» vuelve al Resumen sin respaldo y el siguiente clic da DS nuevo", async ({ page }) => {
    await alResumen(page);
    await marcarObligatorias(page);
    const href = await enviarPorWhatsapp(page);
    await page.getByRole("button", { name: T.recuperar }).click();
    await expect(respaldo(page)).toBeVisible();
    await page.locator("#boton-pedido").click();
    const cajon = page.getByRole("dialog", { name: "Tu pedido" });
    await cajon.getByRole("button", { name: "Vaciar pedido" }).click();
    // Este vaciado sí lo pidió el cliente: aviso con «Deshacer» y nunca «Mensaje listo».
    await expect(page.getByText("Vaciaste el pedido.")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(vista(page)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Tu pedido está vacío" })).toBeVisible();
    await page.locator("[data-aviso]").getByRole("button", { name: "Deshacer" }).click();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    await expect(respaldo(page)).toHaveCount(0);
    const nuevo = await enviarPorWhatsapp(page);
    expect(numeroDe(nuevo)).not.toBe(numeroDe(href));
  });

  test("abrir otra pestaña después del envío no quita «Recuperar el pedido» ni la vista", async ({ page, context }) => {
    await alResumen(page);
    await marcarObligatorias(page);
    await enviarPorWhatsapp(page);
    const otra = await context.newPage();
    await otra.goto("/cafes/");
    await otra.waitForLoadState("networkidle");
    await expect(otra.locator("#boton-pedido")).toHaveText("Pedido");
    await otra.goto("/pedido/");
    await expect(otra.getByRole("heading", { name: "Tu pedido está vacío" })).toBeVisible();
    await expect(otra.getByText(DATOS.nombre)).toHaveCount(0);
    await page.bringToFront();
    await expect(vista(page)).toBeVisible();
    await expect(page.getByRole("button", { name: T.recuperar })).toBeVisible();
    // Recuperar en la primera pestaña devuelve el pedido también a la otra (solo líneas, sin datos de envío).
    await page.getByRole("button", { name: T.recuperar }).click();
    await expect(otra.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
    await expect(otra.getByLabel("Nombre completo")).toHaveValue("");
  });

  test("agregar un café desde el cajón (vía ficha en la misma pestaña) descarta la vista y lleva a Envío", async ({ page }) => {
    await alResumen(page);
    await marcarObligatorias(page);
    await enviarPorWhatsapp(page);
    await page.getByRole("link", { name: T.seguir }).click();
    await page.getByRole("button", { name: /^Agregar Café Arreboles/ }).click();
    await page.goto("/pedido/");
    await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
    await expect(vista(page)).toHaveCount(0);
  });
});

// =====================================================================================================================
// 6. Datos personales: almacenamiento, URL, history.state, cookies y red (LEG-188 (2), (6); LEG-149)
// =====================================================================================================================
test("ni el mensaje ni los datos de envío salen de la memoria: almacenamiento, history.state, URL, cookies y peticiones", async ({ page }) => {
  const peticiones: string[] = [];
  page.on("request", (r) => {
    if (!/wa\.me/.test(r.url())) peticiones.push(`${r.method()} ${r.url()} ${r.postData() ?? ""}`);
  });
  await alResumen(page);
  await marcarObligatorias(page);
  await page.locator("#c-promo-wa").check();
  const href = await enviarPorWhatsapp(page);
  const ds = numeroDe(href)!;
  const volcar = () =>
    page.evaluate(() => {
      const v = (s: Storage) => Object.fromEntries(Array.from({ length: s.length }, (_, i) => s.key(i)!).map((k) => [k, s.getItem(k)]));
      return JSON.stringify({ local: v(localStorage), session: v(sessionStorage), historia: history.state, ruta: location.pathname + location.search + location.hash, cookies: document.cookie });
    });
  const sensibles = [DATOS.nombre, "3001234567", "300 123 4567", DATOS.direccion, DATOS.indicaciones, "Bucaramanga", ds, "Acepto los Términos", "promociones"];
  const momentos: Record<string, string> = { tras_envio: await volcar() };
  await page.getByText("Ver el mensaje").click();
  momentos.ver_mensaje = await volcar();
  await page.goBack();
  momentos.atras = await volcar();
  await page.goForward();
  momentos.adelante = await volcar();
  await page.getByRole("button", { name: T.recuperar }).click();
  momentos.recuperado = await volcar();
  await page.reload();
  momentos.recarga = await volcar();
  for (const [m, volcado] of Object.entries(momentos)) for (const s of sensibles) expect(volcado, `${m}: ${s}`).not.toContain(s);
  // Tras recargar, las casillas no se restauran (LEG-188 (6)) y el Resumen sin datos vuelve a Envío con el formulario vacío.
  await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
  await expect(page.getByLabel("Nombre completo")).toHaveValue("");
  const todas = peticiones.join("\n");
  for (const s of sensibles) expect(todas, `petición con ${s}`).not.toContain(encodeURIComponent(s).slice(0, 12));
  for (const s of sensibles) expect(todas, `petición con ${s}`).not.toContain(s);
});

// =====================================================================================================================
// 7. axe claro y oscuro; prefers-reduced-motion
// =====================================================================================================================
for (const ancho of [360, 1280]) {
  test(`axe en «Mensaje listo» a ${ancho} px, claro y oscuro, con «Ver el mensaje» abierto; capturas`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: ancho === 360 ? 740 : 900 });
    await alResumen(page);
    await marcarObligatorias(page);
    await enviarPorWhatsapp(page);
    await expect(vista(page)).toBeVisible();
    expect(await axeSerio(page), "claro").toEqual([]);
    await respaldo(page).locator("summary").click();
    expect(await axeSerio(page), "claro, mensaje abierto").toEqual([]);
    await tema(page, "dark");
    expect(await axeSerio(page, true), "oscuro").toEqual([]);
    await page.addStyleTag({ content: "header{visibility:hidden !important}" });
    await vista(page).screenshot({ path: `docs/qa/capturas/2026-11-19-mensaje-listo-${ancho}-dark.png` });
  });
}

test("prefers-reduced-motion: «Mensaje listo» sin animación ni transición perceptible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await alResumen(page);
  await marcarObligatorias(page);
  await enviarPorWhatsapp(page);
  await expect(vista(page)).toBeVisible();
  const movidos = await vista(page).evaluate((raiz) =>
    [raiz, ...Array.from(raiz.querySelectorAll("*"))].flatMap((e) => {
      const cs = getComputedStyle(e);
      const dur = (v: string) => Math.max(...v.split(",").map((x) => parseFloat(x) * (x.trim().endsWith("ms") ? 1 : 1000)));
      const t = dur(cs.transitionDuration);
      const a = cs.animationName !== "none" ? dur(cs.animationDuration) : 0;
      return t > 1 || a > 1 ? [`${e.tagName}.${e.className}: transición ${cs.transitionDuration}, animación ${cs.animationName} ${cs.animationDuration}`] : [];
    }),
  );
  expect(movidos).toEqual([]);
  expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
});

// =====================================================================================================================
// 8. Bajo el basePath de GitHub Pages
// =====================================================================================================================
test.describe("«Mensaje listo» bajo basePath", () => {
  const base = process.env.E2E_BASEPATH_URL;
  const REPO = "/coffee-santander-shop";
  test.skip(!base, "Define E2E_BASEPATH_URL con un build GITHUB_PAGES=true servido bajo /coffee-santander-shop/");

  test("vista con el prefijo: «Seguir viendo cafés» y «Recuperar el pedido» funcionan", async ({ page }) => {
    await page.goto(`${base}${REPO}/`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(([k, l]) => localStorage.setItem(k as string, JSON.stringify({ version: 2, lineas: l })), [CLAVE, DOS_LINEAS] as const);
    await page.goto(`${base}${REPO}/pedido/`);
    await page.getByLabel("Nombre completo").fill(DATOS.nombre);
    await page.getByLabel("Celular").fill(DATOS.celular);
    await page.getByLabel("Departamento").selectOption("Santander");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    await page.getByLabel("Dirección").fill(DATOS.direccion);
    await page.getByRole("button", { name: /Ver el resumen/ }).click();
    await marcarObligatorias(page);
    const href = await enviarPorWhatsapp(page);
    await expect(vista(page)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${REPO}/pedido/\\?paso=resumen$`));
    await expect(page.getByRole("link", { name: T.seguir })).toHaveAttribute("href", `${REPO}/cafes/`);
    await page.getByRole("button", { name: T.recuperar }).click();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    expect(await enviarPorWhatsapp(page)).toBe(href);
    await page.getByRole("link", { name: T.seguir }).click();
    await expect(page).toHaveURL(new RegExp(`${REPO}/cafes/$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
