import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Ronda QA 2026-11-19 (cierre de la severidad baja): verificación de QA-028 (f310098), 79c7dc4 (sin precarga de la
// itálica de Montserrat), 361eef4 («Ver los cafés» del cajón vacío), 6520ae3 («Cómo calculamos el envío» →
// #tarifas-por-zona), bfc3f46 (un solo anuncio en la ficha), 66ee813 (aria-required) y QA-017.
// Reporte: docs/qa/2026-11-19-cierre-baja.md.

const SERIAS = ["serious", "critical"];
const CARRITO = "desantander.carrito.v2";

/** En oscuro solo se mide <main>: el sitio no tiene tema oscuro de página y el encabezado fija data-theme="light"
 * (mismo criterio que qa-2026-11-18-ux-media.spec.ts). */
async function axeSerio(page: Page, soloMain = false) {
  const r = await (soloMain ? new AxeBuilder({ page }).include("main") : new AxeBuilder({ page })).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  return r.violations.filter((v) => SERIAS.includes(v.impact ?? "")).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

async function tema(page: Page, t: "light" | "dark") {
  await page.evaluate((v) => {
    document.documentElement.setAttribute("data-theme", v);
    document.querySelector("main")?.setAttribute("data-theme", v);
  }, t);
  await page.waitForTimeout(300);
}

async function sembrar(page: Page, lineas: { gramos: number; molienda: "grano" | "molido"; cantidad: number }[]) {
  await page.goto("/");
  // Tras hidratar, el proveedor del carrito escribe su estado: se siembra después para que no lo pise.
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ([clave, l]) => {
      localStorage.removeItem("desantander.carrito.v1");
      localStorage.setItem(clave as string, JSON.stringify({ version: 2, lineas: (l as object[]).map((x) => ({ cafeSlug: "cafe-casa-martinez", ...x })) }));
    },
    [CARRITO, lineas] as const,
  );
}

async function abrirCajon(page: Page) {
  await page.getByRole("button", { name: /^Pedido/ }).click();
  const cajon = page.getByRole("dialog", { name: "Tu pedido" });
  await expect(cajon).toBeVisible();
  return cajon;
}

/** El título #tarifas-por-zona queda entero en la ventana y por debajo del encabezado fijo. */
async function tituloTarifasVisible(page: Page) {
  await expect(page).toHaveURL(/\/envios\/#tarifas-por-zona$/);
  const titulo = page.locator("#tarifas-por-zona");
  await expect(titulo).toHaveText("Tarifas por zona y municipios de cada zona");
  // Se espera a que el desplazamiento al ancla termine (dos lecturas iguales).
  let previo = -1;
  await expect
    .poll(async () => {
      const y = await page.evaluate(() => Math.round(window.scrollY));
      const quieto = y === previo && y > 0;
      previo = y;
      return quieto;
    }, { intervals: [150, 150, 250, 250, 500] })
    .toBe(true);
  const m = await page.evaluate(() => {
    const h = document.querySelector("header")!.getBoundingClientRect();
    const t = document.getElementById("tarifas-por-zona")!.getBoundingClientRect();
    return { header: Math.round(h.bottom), top: Math.round(t.top), bottom: Math.round(t.bottom), alto: window.innerHeight };
  });
  test.info().annotations.push({ type: "ancla", description: JSON.stringify(m) });
  expect(m.top, "el título no queda bajo el encabezado").toBeGreaterThanOrEqual(m.header);
  expect(m.bottom, "el título queda dentro de la ventana").toBeLessThanOrEqual(m.alto);
}

/** Alto del área de clic de un enlace: su caja o la de su ::before absoluto. */
async function areaClic(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((a) => {
    const r = a.getBoundingClientRect();
    const b = getComputedStyle(a, "::before");
    const top = parseFloat(b.top), bottom = parseFloat(b.bottom);
    const ampliada = b.position === "absolute" && b.content !== "none" && !Number.isNaN(top) ? r.height - top - bottom : 0;
    return { h: r.height, w: r.width, alto: Math.max(r.height, ampliada) };
  });
}

// =====================================================================================================================
// 79c7dc4 · sin precarga de la itálica de Montserrat; ninguna itálica sintetizada visible
// =====================================================================================================================
const RUTAS = ["/", "/cafes/", "/cafes/cafe-casa-martinez/", "/cafes/cafe-arreboles/", "/provincias/guanenta/", "/provincias/soto/", "/envios/", "/legal/terminos/", "/legal/privacidad/", "/legal/vendedor/", "/legal/envios-devoluciones/", "/pedido/", "/404/"];

test.describe("79c7dc4 · fuentes", () => {
  test("cada página precarga 3 fuentes y ninguna @font-face de Montserrat es itálica", async ({ page }) => {
    for (const ruta of RUTAS) {
      const res = await page.goto(ruta);
      const html = await res!.text();
      const precargas = [...html.matchAll(/<link[^>]+rel="preload"[^>]+as="font"[^>]*>/g)].map((m) => /href="([^"]+)"/.exec(m[0])![1]);
      // La 404 de Next no precarga fuentes (las carga por @font-face): se exige 0 allí y 3 en el resto.
      expect(precargas, ruta).toHaveLength(ruta === "/404/" ? 0 : 3);
      expect(precargas.filter((h) => /Montserrat_Italic/i.test(h)), ruta).toEqual([]);
      const caras = await page.evaluate(async () => {
        await document.fonts.ready;
        return [...document.fonts].map((f) => `${f.family}|${f.style}|${f.status}`);
      });
      expect(caras.filter((c) => /montserrat/i.test(c) && /\|italic\|/.test(c)), ruta).toEqual([]);
      // Las tres precargas son las que la página usa: dos de Fraunces (normal e itálica) y una de Montserrat.
      expect(caras.filter((c) => /\|loaded$/.test(c) && !/fallback/i.test(c)).length, ruta).toBeLessThanOrEqual(3);
    }
  });

  for (const ancho of [360, 1280])
    test(`a ${ancho} px ningún texto visible en Montserrat (o cualquier familia que no sea Fraunces) pide itálica`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 900 });
      const hallazgos: string[] = [];
      const revisar = async (donde: string) => {
        const r = await page.evaluate(() => {
          const malos: string[] = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const texto = n.textContent?.trim();
            const el = n.parentElement;
            if (!texto || !el) continue;
            const cs = getComputedStyle(el);
            if (cs.fontStyle === "normal") continue;
            if (/fraunces/i.test(cs.fontFamily)) continue;
            const rect = el.getBoundingClientRect();
            const oculto = rect.width === 0 || rect.height === 0 || cs.visibility === "hidden" || el.closest("[hidden],[aria-hidden=true]") !== null;
            malos.push(`${oculto ? "(oculto) " : ""}<${el.tagName.toLowerCase()}> ${cs.fontStyle} ${cs.fontFamily.split(",")[0]}: «${texto.slice(0, 50)}»`);
          }
          return malos;
        });
        hallazgos.push(...r.map((x) => `${donde}: ${x}`));
      };
      for (const ruta of RUTAS) {
        await page.goto(ruta);
        await page.waitForLoadState("networkidle");
        // Abre todos los desplegables para que su contenido cuente.
        await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
        await revisar(ruta);
      }
      // Cajón con un café y resumen del pedido.
      await sembrar(page, [{ gramos: 250, molienda: "grano", cantidad: 2 }]);
      await page.goto("/cafes/");
      await abrirCajon(page);
      await revisar("cajón");
      await page.goto("/pedido/");
      await page.getByLabel("Nombre completo").fill("Ana Rueda");
      await page.getByLabel("Celular").fill("300 123 4567");
      await page.getByLabel("Departamento").selectOption("Santander");
      await page.getByLabel("Municipio").selectOption("Bucaramanga");
      await page.getByLabel("Dirección").fill("Calle 1 # 2-3");
      await revisar("pedido (envío)");
      await page.getByRole("button", { name: /Ver el resumen/ }).click();
      await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
      await revisar("pedido (resumen)");
      expect(hallazgos).toEqual([]);
    });
});

// =====================================================================================================================
// 361eef4 · «Ver los cafés» del cajón vacío
// =====================================================================================================================
test.describe("361eef4 · cajón vacío", () => {
  for (const ancho of [360, 1280])
    test(`a ${ancho} px «Ver los cafés» va a /cafes/ y cierra el cajón (ratón y teclado)`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 800 });
      for (const modo of ["clic", "enter"] as const) {
        await page.goto("/envios/");
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        const cajon = await abrirCajon(page);
        await expect(cajon).toContainText("Tu pedido está vacío");
        const enlace = cajon.getByRole("link", { name: "Ver los cafés" });
        await expect(enlace).toHaveAttribute("href", "/cafes/");
        if (modo === "clic") await enlace.click();
        else {
          await enlace.focus();
          await page.keyboard.press("Enter");
        }
        await expect(page).toHaveURL(/\/cafes\/$/);
        await expect(page.getByRole("dialog", { name: "Tu pedido" })).toHaveCount(0);
        await expect(page.locator("#catalogo li article").first()).toBeVisible();
        // Sin restos del diálogo: el fondo no queda inerte.
        expect(await page.evaluate(() => document.querySelectorAll("[inert]").length), modo).toBe(0);
      }
    });
});

// =====================================================================================================================
// 6520ae3 · «Cómo calculamos el envío» → /envios/#tarifas-por-zona
// =====================================================================================================================
test.describe("6520ae3 · «Cómo calculamos el envío»", () => {
  for (const ancho of [360, 1440]) {
    test(`a ${ancho} px desde el cajón: va a la tabla, cierra el cajón, título bajo el encabezado y área de 44 px`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: ancho === 360 ? 740 : 900 });
      await sembrar(page, [{ gramos: 250, molienda: "grano", cantidad: 2 }]);
      await page.goto("/cafes/");
      const cajon = await abrirCajon(page);
      const enlace = cajon.getByRole("link", { name: "Cómo calculamos el envío" });
      await expect(enlace).toHaveAttribute("href", "/envios/#tarifas-por-zona");
      const area = await areaClic(page, '[role=dialog] a[href="/envios/#tarifas-por-zona"]');
      test.info().annotations.push({ type: "área", description: JSON.stringify(area) });
      expect(area.alto).toBeGreaterThanOrEqual(43.5);
      await enlace.click();
      await expect(page.getByRole("dialog", { name: "Tu pedido" })).toHaveCount(0);
      await tituloTarifasVisible(page);
      await page.screenshot({ path: `docs/qa/capturas/2026-11-19-ancla-tarifas-cajon-${ancho}.png` });
    });

    test(`a ${ancho} px desde el envío y el resumen del pedido: va a la tabla con el título visible`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: ancho === 360 ? 740 : 900 });
      await sembrar(page, [{ gramos: 250, molienda: "grano", cantidad: 2 }]);
      await page.goto("/pedido/");
      await page.getByLabel("Departamento").selectOption("Santander");
      await page.getByLabel("Municipio").selectOption("Bucaramanga");
      const sel = 'main a[href="/envios/#tarifas-por-zona"]';
      await expect(page.locator(sel).filter({ hasText: "Cómo calculamos el envío" })).toHaveCount(1);
      expect((await areaClic(page, sel)).alto).toBeGreaterThanOrEqual(43.5);
      await page.getByLabel("Nombre completo").fill("Ana Rueda");
      await page.getByLabel("Celular").fill("300 123 4567");
      await page.getByLabel("Dirección").fill("Calle 1 # 2-3");
      await page.getByRole("button", { name: /Ver el resumen/ }).click();
      await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
      const enlace = page.locator(sel).filter({ hasText: "Cómo calculamos el envío" });
      await expect(enlace).toHaveCount(1);
      expect((await areaClic(page, sel)).alto).toBeGreaterThanOrEqual(43.5);
      await enlace.click();
      await tituloTarifasVisible(page);
      await page.screenshot({ path: `docs/qa/capturas/2026-11-19-ancla-tarifas-resumen-${ancho}.png` });
    });

    test(`a ${ancho} px /envios/#tarifas-por-zona cargada directamente deja el título visible`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: ancho === 360 ? 740 : 900 });
      await page.goto("/envios/#tarifas-por-zona");
      await tituloTarifasVisible(page);
    });
  }
});

// =====================================================================================================================
// bfc3f46 · un solo anuncio en la ficha
// =====================================================================================================================
test.describe("bfc3f46 · anuncio de la ficha", () => {
  test("una sola región aria-live en el bloque de compra; dice cantidad, tamaño, presentación y total tras cada cambio", async ({ page }) => {
    await page.goto("/cafes/cafe-casa-martinez/");
    await page.waitForLoadState("networkidle");
    const anuncio = page.getByTestId("anuncio-compra");
    await expect(anuncio).toHaveCount(1);
    await expect(anuncio).toHaveAttribute("aria-live", "polite");
    await expect(anuncio).toHaveClass(/sr-only/);
    // Las regiones vivas de <main>: solo la del bloque de compra (los avisos globales viven fuera de main).
    const vivas = await page.evaluate(() => [...document.querySelectorAll("main [aria-live], main [role=status], main [role=alert], main output")].map((e) => (e as HTMLElement).dataset.testid ?? e.outerHTML.slice(0, 80)));
    expect(vivas).toEqual(["anuncio-compra"]);
    // Ni la cantidad ni el precio visibles están dentro de otra región viva.
    const total = page.getByText("$30.000", { exact: true }).first();
    expect(await total.evaluate((e) => e.closest("[aria-live]") === null)).toBe(true);

    await expect(anuncio).toHaveText(/^1 bolsa de 250 g, grano: \$\s?30\.000$/);
    await page.getByRole("button", { name: "Una bolsa más" }).click();
    await expect(anuncio).toHaveText(/^2 bolsas de 250 g, grano: \$\s?60\.000$/);
    await page.getByRole("radio", { name: /^500 g/ }).check({ force: true });
    await expect(anuncio).toHaveText(/^2 bolsas de 500 g, grano: \$\s?94\.000$/);
    await page.getByRole("radio", { name: "Molido" }).check({ force: true });
    await expect(anuncio).toHaveText(/^2 bolsas de 500 g, molido: \$\s?94\.000$/);
    await page.getByRole("button", { name: "Una bolsa menos" }).click();
    await expect(anuncio).toHaveText(/^1 bolsa de 500 g, molido: \$\s?47\.000$/);
    // Lo visible sigue igual que antes del cambio.
    await expect(page.getByText("1 × 500 g · molido")).toBeVisible();
    // Sigue siendo una sola región tras los cambios (no se duplica al rehidratar).
    expect(await page.locator("main [aria-live]").count()).toBe(1);
  });

  test("la región se anuncia con un solo cambio de texto por acción (sin vaciados intermedios)", async ({ page }) => {
    await page.goto("/cafes/cafe-casa-martinez/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      const el = document.querySelector("[data-testid=anuncio-compra]")!;
      const w = window as unknown as { cambios: string[] };
      w.cambios = [];
      new MutationObserver(() => w.cambios.push(el.textContent ?? "")).observe(el, { childList: true, subtree: true, characterData: true });
    });
    await page.getByRole("button", { name: "Una bolsa más" }).click();
    await page.waitForTimeout(300);
    const cambios = await page.evaluate(() => [...new Set((window as unknown as { cambios: string[] }).cambios)]);
    expect(cambios.every((c) => /^2 bolsas de 250 g, grano: /.test(c)), JSON.stringify(cambios)).toBe(true);
  });
});

// =====================================================================================================================
// 66ee813 · aria-required en el formulario de envío
// =====================================================================================================================
test.describe("66ee813 · aria-required", () => {
  test("solo los obligatorios llevan aria-required; ninguno lleva required; el formulario es noValidate; los demás dicen (opcional)", async ({ page }) => {
    await sembrar(page, [{ gramos: 250, molienda: "grano", cantidad: 1 }]);
    await page.goto("/pedido/");
    await page.getByLabel("Departamento").selectOption("Santander");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    const campos = await page.evaluate(() =>
      [...document.querySelectorAll("main form input, main form select, main form textarea")]
        .filter((e) => (e as HTMLInputElement).type !== "hidden" && (e as HTMLInputElement).type !== "checkbox")
        .map((e) => {
          const id = e.id;
          const etiqueta = (document.querySelector(`label[for="${id}"]`)?.textContent ?? e.getAttribute("aria-label") ?? "").replace(/\s+/g, " ").trim();
          return { id, requerido: e.getAttribute("aria-required"), nativo: e.hasAttribute("required"), etiqueta };
        }),
    );
    test.info().annotations.push({ type: "campos", description: JSON.stringify(campos) });
    expect(campos.filter((c) => c.requerido === "true").map((c) => c.id)).toEqual(["nombre", "celular", "departamento", "municipio", "direccion"]);
    expect(campos.filter((c) => c.nativo)).toEqual([]);
    expect(campos.filter((c) => c.requerido !== null && c.requerido !== "true")).toEqual([]);
    for (const c of campos) {
      if (c.requerido === "true") expect(c.etiqueta, c.id).not.toMatch(/opcional/i);
      else expect(c.etiqueta, c.id).toMatch(/\(opcional\)/i);
    }
    expect(await page.locator("main form").first().evaluate((f) => (f as HTMLFormElement).noValidate)).toBe(true);
    // Con todo vacío, el botón muestra la validación propia (no el globo del navegador) y el foco va al primer error.
    await page.getByLabel("Departamento").selectOption("");
    await page.getByRole("button", { name: /Ver el resumen/ }).click();
    await expect(page.getByRole("alert").filter({ hasText: "datos por corregir" })).toBeVisible();
    await expect(page.getByLabel("Nombre completo")).toBeFocused();
    await expect(page.getByLabel("Nombre completo")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Nombre completo")).toHaveAttribute("aria-required", "true");
  });
});

// =====================================================================================================================
// QA-017 · nombre accesible de «Agregar»
// =====================================================================================================================
test.describe("QA-017 · «Agregar» de las tarjetas", () => {
  test("el nombre accesible dice café y tamaño, sin presentación, y el aviso dice la presentación que se agregó", async ({ page }) => {
    for (const ruta of ["/", "/cafes/", "/provincias/guanenta/", "/provincias/soto/"]) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      const nombres = await page.getByRole("button", { name: /^Agregar Café/ }).evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
      expect(nombres.length, ruta).toBeGreaterThan(0);
      for (const n of nombres) expect(n, ruta).toMatch(/^Agregar Café [^,]+, \d+ g, al pedido$/);
    }
    await page.goto("/cafes/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => localStorage.clear());
    await page.getByRole("button", { name: "Agregar Café Casa Martínez, 250 g, al pedido", exact: true }).click();
    const linea = await page.evaluate((c) => JSON.parse(localStorage.getItem(c) ?? "{}").lineas?.[0], CARRITO);
    await expect(page.locator("[data-aviso]")).toContainText(`Agregaste Café Casa Martínez: 250 g, ${linea.molienda}.`);
  });
});

// =====================================================================================================================
// axe en las vistas tocadas, a 360 y 1.280 px, claro y oscuro
// =====================================================================================================================
for (const ancho of [360, 1280])
  for (const t of ["light", "dark"] as const)
    test(`axe a ${ancho} px (${t}): ficha tras cambiar cantidad, cajón vacío, /envios/#tarifas-por-zona y formulario de envío`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 900 });
      await page.goto("/cafes/cafe-casa-martinez/");
      await page.getByRole("button", { name: "Una bolsa más" }).click();
      await tema(page, t);
      expect(await axeSerio(page, t === "dark"), "ficha").toEqual([]);
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await abrirCajon(page);
      await tema(page, t);
      expect(await axeSerio(page, t === "dark"), "cajón vacío").toEqual([]);
      await page.goto("/envios/#tarifas-por-zona");
      await tema(page, t);
      expect(await axeSerio(page, t === "dark"), "envios").toEqual([]);
      await sembrar(page, [{ gramos: 250, molienda: "grano", cantidad: 1 }]);
      await page.goto("/pedido/");
      await page.getByRole("button", { name: /Ver el resumen/ }).click();
      await tema(page, t);
      expect(await axeSerio(page, t === "dark"), "pedido con errores").toEqual([]);
    });

// =====================================================================================================================
// QA-029 · las clases de marca.css y componentes.css (importadas sin capa en globals.css) anulan las utilidades de
// Tailwind (que viven en @layer utilities): font-bold/font-semibold y text-sm no se aplican con .body, .small o .ds-tag.
// Ejemplos: título de la tabla y «Zona n» de /envios/ a 400, enlaces de la navegación y chips a 500, chips a 12 px.
// Verificación (5982339, diseño § QA-029): la expresión acepta el «!» delante o detrás (`font-bold!`, `!font-bold`), y
// además todo elemento con `text-sm`/`text-sm!` debe pintarse a 14 px. Los elementos del grupo B ya no llevan la utilidad.
// =====================================================================================================================
const PESOS: Record<string, number> = { "font-normal": 400, "font-medium": 500, "font-semibold": 600, "font-bold": 700, "font-extrabold": 800 };
for (const ancho of [360, 1280])
  test(`QA-029: a ${ancho} px toda utilidad font-(peso) se pinta con su peso y todo text-sm a 14 px en /, ficha y /envios/`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: 900 });
    const mal: string[] = [];
    for (const ruta of ["/", "/cafes/cafe-casa-martinez/", "/envios/"]) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      const r = await page.evaluate((W) =>
        [...document.querySelectorAll("[class]")]
          .flatMap((e) => {
            const clase = e.getAttribute("class") ?? "";
            const cs = getComputedStyle(e);
            const id = `<${e.tagName.toLowerCase()}> «${(e.textContent ?? "").trim().slice(0, 30)}» (${clase.split(" ").slice(0, 2).join(" ")})`;
            const fallos: string[] = [];
            const m = clase.match(/(?:^|\s)!?(font-(?:normal|medium|semibold|bold|extrabold))!?(?:\s|$)/);
            if (m && +cs.fontWeight !== W[m[1]]) fallos.push(`${m[1]} → ${cs.fontWeight}: ${id}`);
            if (/(?:^|\s)!?text-sm!?(?:\s|$)/.test(clase) && cs.fontSize !== "14px") fallos.push(`text-sm → ${cs.fontSize}: ${id}`);
            return fallos;
          }), PESOS);
      mal.push(...[...new Set(r)].map((x) => `${ruta} ${x}`));
    }
    expect(mal).toEqual([]);
  });
