import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { enviarPorWhatsapp, leerConfig, puntoEnProvincia } from "./ayudas";

// Ronda QA 2026-11-18 (cierre de la severidad media): M4, M8 y ficha totalmente agotada (2643d92, 1a0eb04, 1ec9f29,
// 1117886, fc8b8f8), y verificación de QA-018, QA-025, QA-026 y QA-027 (ff08d1d, 50bb2ca, 25af37b, a131ef3).
// Especificación: docs/diseno/2026-11-18-ux-auditoria-media.md. Dictamen: docs/legal/revisiones/2026-11-18-ux-auditoria-media.md
// (LEG-183 a LEG-187). Reporte: docs/qa/2026-11-18-cierre-media.md.
// Variables opcionales (nunca se commitea el CSV de prueba):
// - E2E_AGOTADO_URL: build de una copia con data/catalogo.csv modificado (cafe-arreboles agotados 250|500, cafe-casa-martinez 250).
// - E2E_MAIN_URL: build de la rama main, para comparar la tabla de /envios/ a 1.280 px.

const SERIAS = ["serious", "critical"];
const WHATSAPP = leerConfig("whatsapp");

async function axeSerio(page: Page, soloMain = false) {
  const r = await (soloMain ? new AxeBuilder({ page }).include("main") : new AxeBuilder({ page })).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  return r.violations.filter((v) => SERIAS.includes(v.impact ?? "")).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

async function tema(page: Page, t: "light" | "dark") {
  await page.evaluate((v) => {
    document.documentElement.setAttribute("data-theme", v);
    document.querySelector("main")?.setAttribute("data-theme", v);
  }, t);
  await page.waitForTimeout(400);
}

/** Contraste WCAG entre el color del texto y el primer fondo opaco de sus ancestros. */
async function contrasteDe(page: Page, selector: string, n = 0) {
  return page.locator(selector).nth(n).evaluate((el) => {
    const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    let n2: Element | null = el;
    let fondo = [255, 255, 255];
    while (n2) {
      const c = rgb(getComputedStyle(n2).backgroundColor);
      if (c.length >= 3 && (c.length === 3 || c[3] > 0.95)) {
        fondo = c.slice(0, 3);
        break;
      }
      n2 = n2.parentElement;
    }
    const [a, b] = [lum(rgb(getComputedStyle(el).color)), lum(fondo)].sort((x, y) => y - x);
    return { ratio: (a + 0.05) / (b + 0.05), color: getComputedStyle(el).color, opacidad: getComputedStyle(el).opacity };
  });
}

const sinDesborde = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

// =====================================================================================================================
// M4 · mapa e inicio
// =====================================================================================================================
const TEXTO_MAPA = "Elige una provincia para ver sus cafés y filtrar el catálogo. Los puntos marcan el municipio de cada café.";

test.describe("M4 · orden, titulares, texto del mapa y fuente", () => {
  for (const ancho of [360, 768, 1280]) {
    test(`a ${ancho} px: Portada → Mapa → Catálogo → Cómo pedir (filete) → Historia; textos exactos; nota de fuente visible (LEG-187)`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      // Orden de las secciones de primer nivel del main, por su nombre accesible (el de su titular).
      const secciones = await page.locator("main section[aria-labelledby]").evaluateAll((ss) =>
        ss.filter((s) => !s.parentElement?.closest("section")).map((s) => ({ id: s.id, titulo: document.getElementById(s.getAttribute("aria-labelledby")!)?.textContent?.trim() })),
      );
      expect(secciones.map((s) => s.id).slice(1)).toEqual(["mapa", "catalogo", "pedir", "historia"]);
      expect(secciones[0].titulo).toMatch(/^El café que crece/);
      expect(secciones[1].titulo).toBe("Santander, provincia a provincia");
      expect(secciones[2].titulo).toBe("Elige por provincia");
      expect(secciones[3].titulo).toBe("Cómo pedir");
      // Remate en itálica 400 en los dos titulares (marca v4.1).
      for (const [id, remate] of [["titulo-mapa", "provincia a provincia"], ["titulo-catalogo", "provincia"]]) {
        const em = page.locator(`#${id} em`);
        await expect(em).toHaveText(remate);
        await expect(em).toHaveCSS("font-style", "italic");
        await expect(em).toHaveCSS("font-weight", "400");
      }
      // Antetítulo del catálogo sin cambio (LEG-185).
      await expect(page.locator("#catalogo").getByText("Nuestros cafés", { exact: true })).toBeVisible();

      // Texto del mapa, letra por letra.
      const parrafo = page.locator("#mapa p", { hasText: "Elige una provincia" });
      await expect(parrafo).toHaveCount(1);
      expect(await parrafo.evaluate((p) => p.textContent)).toBe(TEXTO_MAPA);
      expect(TEXTO_MAPA.split(/\s+/).length).toBeLessThanOrEqual(25);

      // «Ir a los cafés», después de la bajada y antes de la fuente.
      const ir = page.locator("#mapa").getByRole("link", { name: "Ir a los cafés", exact: true });
      await expect(ir).toHaveAttribute("href", "#catalogo");
      const fuente = page.locator("#mapa p.caption");
      await expect(fuente).toHaveCount(1);
      await expect(fuente).toBeVisible();
      await expect(fuente).toContainText("DANE");
      await expect(fuente).toContainText("Ordenanza 009 de 2019");
      const orden = await page.evaluate(() => {
        const y = (el: Element | null) => el!.getBoundingClientRect().top;
        const p = [...document.querySelectorAll("#mapa p")].find((e) => e.textContent?.startsWith("Elige una provincia"))!;
        return { bajada: y(p), ir: y(document.querySelector('#mapa a[href="#catalogo"]')), fuente: y(document.querySelector("#mapa p.caption")) };
      });
      expect(orden.bajada).toBeLessThan(orden.ir);
      expect(orden.ir).toBeLessThan(orden.fuente);
      expect(await contrasteDe(page, "#mapa p.caption").then((c) => c.ratio)).toBeGreaterThanOrEqual(4.5);

      // Filete superior de Cómo pedir; catálogo y Cómo pedir con el mismo fondo.
      const fondos = await page.evaluate(() => {
        const cs = (id: string) => getComputedStyle(document.getElementById(id)!);
        return { catalogo: cs("catalogo").backgroundColor, pedir: cs("pedir").backgroundColor, borde: cs("pedir").borderTopWidth, estilo: cs("pedir").borderTopStyle, mapa: cs("mapa").backgroundColor };
      });
      expect(fondos.pedir).toBe(fondos.catalogo);
      expect(fondos.mapa).not.toBe(fondos.catalogo);
      expect(fondos).toMatchObject({ borde: "1px", estilo: "solid" });

      // La navegación sigue el orden de las secciones.
      const nav = page.getByRole("navigation", { name: "Principal" });
      await expect(nav).toHaveCount(1);
      await expect(nav.getByRole("link")).toHaveText(["Mapa", "Cafés", "Cómo pedir", "Historia", "Envíos"]);

      // El botón de la portada sigue yendo al catálogo (salta el mapa).
      await expect(page.locator("main section").first().getByRole("link", { name: "Ver cafés" })).toHaveAttribute("href", /#catalogo$/);

      // «Ir a los cafés» lleva al titular del catálogo, visible bajo el encabezado fijo.
      await ir.click();
      await expect(page).toHaveURL(/\/#catalogo$/);
      await page.waitForTimeout(300);
      const titulo = await page.locator("#titulo-catalogo").boundingBox();
      const cabecera = await page.locator("header").first().boundingBox();
      expect(titulo!.y).toBeGreaterThanOrEqual(cabecera!.y + cabecera!.height - 1);
      expect(titulo!.y).toBeLessThan(800);
    });
  }

  test("sin JavaScript: mismo orden y la fuente del mapa en el HTML", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 740 } });
    const page = await ctx.newPage();
    await page.goto("/");
    const ids = await page.locator("main section[id]").evaluateAll((s) => s.map((e) => e.id).filter((id) => ["mapa", "catalogo", "pedir", "historia"].includes(id)));
    expect(ids).toEqual(["mapa", "catalogo", "pedir", "historia"]);
    await expect(page.locator("#mapa p.caption")).toBeVisible();
    await ctx.close();
  });
});

test.describe("M4 · tocar abre la tarjeta; ratón y Enter filtran", () => {
  test.describe("con el dedo (360 px, táctil)", () => {
    test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });
    test("tocar Guanentá abre la tarjeta y no filtra; «Ver cafés de Guanentá» filtra", async ({ page }) => {
      await page.goto("/");
      await page.locator("#mapa").scrollIntoViewIfNeeded();
      await expect(page.locator('g[data-provincia="guanenta"]')).toBeVisible();
      const { x, y } = await puntoEnProvincia(page, "guanenta");
      await page.touchscreen.tap(x, y);
      const tarjeta = page.getByRole("dialog", { name: /Provincia de Guanentá/ });
      await expect(tarjeta).toBeVisible();
      expect(new URL(page.url()).searchParams.get("provincia")).toBeNull();
      await tarjeta.getByRole("button", { name: /Ver cafés de Guanentá/ }).click();
      await expect(page).toHaveURL(/provincia=guanenta/);
    });
  });

  test("con el ratón (1.280 px): clic filtra sin abrir diálogo modal", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const { x, y } = await puntoEnProvincia(page, "guanenta");
    await page.mouse.click(x, y);
    await expect(page).toHaveURL(/provincia=guanenta/);
  });

  test("con el teclado (1.280 px): Enter sobre la provincia filtra", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const g = page.locator('#mapa [role="button"][aria-label^="Provincia de Guanentá"]');
    await expect(g).toHaveCount(1);
    await g.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/provincia=guanenta/);
  });
});

test.describe("M4 · CLS del inicio y carga del mapa", () => {
  async function clsAlRecorrer(page: Page, ancho: number, alto: number) {
    await page.setViewportSize({ width: ancho, height: alto });
    await page.addInitScript(() => {
      const w = window as unknown as { __cls: { v: number; f: string[] } };
      w.__cls = { v: 0, f: [] };
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean; sources?: { node?: Node }[] }[]) {
          if (e.hadRecentInput) continue;
          w.__cls.v += e.value;
          w.__cls.f.push(`${e.value.toFixed(4)} ${(e.sources ?? []).map((s) => (s.node as Element | undefined)?.outerHTML?.slice(0, 80) ?? "?").join(" | ")}`);
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    // Recorre la página por programa (no es entrada del usuario: los saltos cuentan) para que el mapa se cargue.
    const altoTotal = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < altoTotal; y += Math.round(alto * 0.6)) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(150);
    }
    await expect(page.locator("#mapa svg").first()).toBeVisible();
    await page.waitForTimeout(800);
    return page.evaluate(() => (window as unknown as { __cls: { v: number; f: string[] } }).__cls);
  }

  for (const [ancho, alto] of [[360, 740], [1440, 900]]) {
    test(`CLS a ${ancho} px al cargar y recorrer el inicio (el mapa entra en su hueco): < 0,01`, async ({ page }) => {
      const cls = await clsAlRecorrer(page, ancho, alto);
      test.info().annotations.push({ type: `cls-${ancho}`, description: JSON.stringify(cls) });
      expect(cls.v, cls.f.join("\n")).toBeLessThan(0.01);
    });
  }

  for (const ancho of [360, 768, 1440]) {
    test(`a ${ancho} px el hueco del mapa mide lo mismo que el mapa cargado`, async ({ browser }) => {
      // Sin JS: el hueco del HTML estático. Con JS y desplazado: el mapa.
      const medir = async (js: boolean) => {
        const ctx = await browser.newContext({ javaScriptEnabled: js, viewport: { width: ancho, height: 800 }, baseURL: test.info().project.use.baseURL });
        const page = await ctx.newPage();
        await page.goto("/", { waitUntil: js ? "networkidle" : "load" });
        await page.evaluate(() => document.fonts.ready);
        if (js) {
          await page.locator("#mapa").scrollIntoViewIfNeeded();
          await expect(page.locator("#mapa svg").first()).toBeVisible();
          await page.waitForTimeout(400);
        }
        const r = await page.evaluate(() => {
          const s = document.getElementById("mapa")!.getBoundingClientRect();
          const caja = (document.querySelector("#mapa .grid > div:last-child > div") as HTMLElement).getBoundingClientRect();
          return { seccion: Math.round(s.height * 10) / 10, caja: Math.round(caja.height * 10) / 10, ancho: Math.round(caja.width * 10) / 10 };
        });
        await ctx.close();
        return r;
      };
      const hueco = await medir(false);
      const mapa = await medir(true);
      test.info().annotations.push({ type: "hueco", description: JSON.stringify(hueco) }, { type: "mapa", description: JSON.stringify(mapa) });
      expect(Math.abs(hueco.caja - mapa.caja)).toBeLessThanOrEqual(1);
      expect(Math.abs(hueco.seccion - mapa.seccion)).toBeLessThanOrEqual(1);
    });
  }

  test("a 360 px el mapa no se descarga al cargar; se carga al desplazarse hasta él", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await expect(page.locator("#mapa svg")).toHaveCount(0);
    await page.locator("#mapa h2").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 400));
    await expect(page.locator("#mapa svg").first()).toBeVisible();
    await expect(page.getByText("Cargando el mapa…")).toHaveCount(0);
  });

  test("a 360 px desde /#mapa el mapa se carga sin desplazar a mano y la sección queda arriba", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/#mapa", { waitUntil: "networkidle" });
    await expect(page.locator("#mapa svg").first()).toBeVisible();
    await page.waitForTimeout(500);
    const top = await page.locator("#mapa").evaluate((s) => s.getBoundingClientRect().top);
    expect(Math.abs(top)).toBeLessThan(120);
    // Se puede usar: tocar una provincia (ratón aquí) filtra o abre su tarjeta.
    await expect(page.locator('#mapa [role="button"][aria-label^="Provincia de"]').first()).toBeVisible();
  });
});

// =====================================================================================================================
// M8 · tarifas de /envios/
// =====================================================================================================================
test.describe("M8 · tarjetas por zona", () => {
  for (const ancho of [320, 360, 768, 1023]) {
    test(`a ${ancho} px: sin desplazamiento horizontal (también con los desplegables abiertos); tarjetas en el orden de la tabla; «Cubre» letra por letra`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto("/envios/");
      await page.waitForLoadState("networkidle");
      expect(await sinDesborde(page)).toBe(0);
      await expect(page.getByTestId("tabla-envios")).toBeHidden();
      await expect(page.getByRole("table")).toHaveCount(0); // fuera del árbol de accesibilidad
      const filas = await page.locator('tr[data-testid^="tarifa-"]').evaluateAll((trs) =>
        trs.map((tr) => {
          const tds = [...tr.querySelectorAll("td")];
          return {
            clave: tr.getAttribute("data-testid")!.replace("tarifa-", ""),
            zona: tr.querySelector("th")!.textContent,
            cubre: tds[0].firstChild!.textContent,
            medio: tds[0].querySelector("span")!.textContent,
            promo: tds[0].querySelector("a")?.textContent ?? null,
            precios: tds.slice(1).map((t) => t.textContent),
          };
        }),
      );
      const tarjetas = await page.getByTestId("tarjetas-envios").locator(":scope > li").evaluateAll((lis) =>
        lis.map((li) => {
          const det = li.querySelector("details");
          return {
            clave: li.getAttribute("data-testid")!.replace("tarjeta-zona-", ""),
            zona: li.querySelector("h4")!.textContent,
            cubre: li.querySelector('[data-testid="cubre"]')!.textContent,
            resumen: det?.querySelector("summary")?.textContent ?? null,
            abierto: det ? det.open : null,
            dentroDelDesplegable: det ? det.textContent!.replace(det.querySelector("summary")!.textContent!, "").replace(li.querySelector('[data-testid="cubre"]')!.textContent!, "").trim() : "",
            medio: [...li.querySelectorAll(":scope > p")].map((p) => p.textContent)[li.querySelector(":scope > details") ? 0 : 1],
            promo: li.querySelector(':scope > [data-testid="nota-envio-gratis-tarjeta"]')?.textContent ?? null,
            precios: li.querySelector("dl") ? [...li.querySelectorAll("dd")].map((d) => d.textContent) : [li.querySelector(":scope > p:last-child")!.textContent],
          };
        }),
      );
      test.info().annotations.push({ type: "filas", description: JSON.stringify(filas) });
      expect(filas.length).toBeGreaterThan(4);
      expect(new Set(filas.map((f) => f.zona))).toEqual(new Set(["Zona 1", "Zona 2", "Zona 3", "Zona 4", "Zona 5"]));
      expect(tarjetas.map((t) => t.clave)).toEqual(filas.map((f) => f.clave));
      for (const [i, f] of filas.entries()) {
        const t = tarjetas[i];
        expect(t.zona).toBe(f.zona);
        expect(t.cubre, `${f.zona}: «Cubre» letra por letra`).toBe(f.cubre);
        expect(t.medio).toBe(f.medio);
        expect(t.promo).toBe(f.promo);
        expect(t.precios).toEqual(f.precios);
        const n = Number(f.zona!.replace("Zona ", ""));
        if (n <= 2) {
          expect(t.resumen, `${f.zona} abierta, sin desplegable`).toBeNull();
        } else {
          expect(t.resumen).toBe(`Qué cubre la zona ${n}`);
          expect(t.abierto, `${f.zona} cerrada al cargar`).toBe(false);
          expect(t.dentroDelDesplegable, "solo «Cubre» dentro del desplegable").toBe("");
        }
      }
      // Medio, nota de la promoción y precios visibles sin abrir nada.
      for (const f of filas) {
        const li = page.getByTestId(`tarjeta-zona-${f.clave}`);
        await expect(li.getByText(f.medio!, { exact: true })).toBeVisible();
        for (const p of f.precios) await expect(li.getByText(p!, { exact: true })).toBeVisible();
        if (f.promo) await expect(li.getByTestId("nota-envio-gratis-tarjeta")).toBeVisible();
      }
      // Con todos los desplegables abiertos tampoco hay desplazamiento horizontal.
      await page.evaluate(() => document.querySelectorAll('[data-testid="tarjetas-envios"] details').forEach((d) => ((d as HTMLDetailsElement).open = true)));
      expect(await sinDesborde(page)).toBe(0);
    });
  }

  test("a 360 px el desplegable se abre y se cierra con Enter y con Espacio, y su summary mide 44 px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/envios/");
    for (const li of await page.locator('[data-testid="tarjetas-envios"] > li:has(details)').all()) {
      const resumen = li.locator("summary");
      const cubre = li.getByTestId("cubre");
      expect((await resumen.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await expect(resumen).toHaveCSS("display", "flex");
      await resumen.focus();
      await page.keyboard.press("Enter");
      await expect(cubre).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(cubre).toBeHidden();
      await page.keyboard.press("Space");
      await expect(cubre).toBeVisible();
      await page.keyboard.press("Space");
      await expect(cubre).toBeHidden();
    }
  });

  test("a 1.024 px se ve la tabla y no las tarjetas", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/envios/");
    await expect(page.getByTestId("tabla-envios")).toBeVisible();
    await expect(page.getByTestId("tarjetas-envios")).toBeHidden();
    expect(await sinDesborde(page)).toBe(0);
  });

  // Hasta f310098 (QA-028) la tabla era idéntica a la de main. Desde f310098 difiere a propósito: los rótulos «Hasta n kg» y
  // los precios llevan whitespace-nowrap. La prueba exige ahora que esa sea la única diferencia de marcado, que la caja
  // conserve el ancho y que la tabla no crezca (ronda 2026-11-19, docs/qa/2026-11-19-cierre-baja.md).
  test("a 1.280 px la tabla es la de main con whitespace-nowrap en escalones y precios, y la caja conserva el ancho (QA-028)", async ({ page, browser }) => {
    const main = process.env.E2E_MAIN_URL;
    test.skip(!main, "sin E2E_MAIN_URL");
    const capturar = async (p: Page, url: string) => {
      await p.setViewportSize({ width: 1280, height: 1600 });
      await p.goto(url);
      await p.waitForLoadState("networkidle");
      await p.evaluate(() => document.fonts.ready);
      const region = p.getByRole("region", { name: "Tarifas de envío" });
      await p.addStyleTag({ content: "header, [data-testid=tira-navegacion] { visibility: hidden !important; }" });
      await region.scrollIntoViewIfNeeded();
      const caja = await region.boundingBox();
      const html = await p.getByTestId("tabla-envios").evaluate((t) => t.outerHTML);
      return { png: await p.getByTestId("tabla-envios").screenshot({ animations: "disabled" }), caja: { w: caja!.width, h: caja!.height }, html };
    };
    const ahora = await capturar(page, "/envios/");
    const ctx = await browser.newContext();
    const otra = await ctx.newPage();
    const antes = await capturar(otra, `${main}/envios/`);
    await ctx.close();
    const { writeFileSync } = await import("node:fs");
    writeFileSync("docs/qa/capturas/2026-11-19-qa-028-tabla-1280-head.png", ahora.png);
    writeFileSync("docs/qa/capturas/2026-11-19-qa-028-tabla-1280-main.png", antes.png);
    // main ya llevaba whitespace-nowrap en el rótulo «Zona n» de cada fila; f310098 lo añade a los alineados a la derecha.
    const cuenta = (h: string) => (h.match(/class="whitespace-nowrap px-4 py-3 text-right/g) ?? []).length;
    const filas = (ahora.html.match(/<tr data-testid="tarifa-/g) ?? []).length;
    const conEscalones = filas - (ahora.html.match(/colSpan="3"|colspan="3"/g) ?? []).length;
    test.info().annotations.push({ type: "diferencia", description: JSON.stringify({ ahora: cuenta(ahora.html), antes: cuenta(antes.html), filas, conEscalones, cajaAhora: ahora.caja, cajaAntes: antes.caja }) });
    expect(cuenta(antes.html), "main no trae el arreglo").toBe(0);
    // 3 rótulos «Hasta n kg» + 3 precios por cada fila con escalones.
    expect(cuenta(ahora.html)).toBe(3 + 3 * conEscalones);
    expect(ahora.html.replaceAll('class="whitespace-nowrap px-4 py-3 text-right', 'class="px-4 py-3 text-right'), "única diferencia de marcado").toBe(antes.html);
    expect(ahora.caja.w).toBe(antes.caja.w);
    // La tabla crece (961 → 1.021 px el 2026-11-19): los precios ocupan su ancho y «Cubre» parte más renglones. Es lo
    // esperado y se acepta; solo se registra en la anotación.
  });

  for (const ancho of [1024, 1280, 1440])
    test(`QA-028: a ${ancho} px cada precio y cada rótulo «Hasta n kg» de la tabla caben en un renglón`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 900 });
      await page.goto("/envios/");
      await page.evaluate(() => document.fonts.ready);
      const cortadas = await page.getByTestId("tabla-envios").evaluate((t) => {
        const lineas = (el: Element) => {
          const r = document.createRange();
          r.selectNodeContents(el);
          return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size;
        };
        const celdas = [...t.querySelectorAll("thead th:nth-child(n+3), tbody td:nth-child(n+3)")].filter((c) => /^\$|^Hasta/.test(c.textContent!.trim()));
        return { total: celdas.length, cortadas: celdas.filter((c) => lineas(c) > 1).map((c) => `${c.textContent} (${lineas(c)} renglones, ${Math.round(c.getBoundingClientRect().width)} px)`) };
      });
      expect(cortadas.total).toBeGreaterThan(10);
      expect(cortadas.cortadas).toEqual([]);
    });

  test("a 360 px el enlace de la nota de la promoción en la tarjeta tiene un área táctil de 44 px (M1)", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/envios/");
    const nota = page.getByTestId("nota-envio-gratis-tarjeta");
    test.skip((await nota.count()) === 0, "promoción no vigente en este build");
    const m = await nota.evaluate((a) => {
      const r = a.getBoundingClientRect();
      const b = getComputedStyle(a, "::before");
      const ampl = b.position === "absolute" && b.content !== "none" ? parseFloat(b.height) : 0;
      return { h: r.height, w: r.width, ampliada: ampl };
    });
    test.info().annotations.push({ type: "nota", description: JSON.stringify(m) });
    expect(Math.max(m.h, m.ampliada)).toBeGreaterThanOrEqual(43.5);
  });
});

// =====================================================================================================================
// Ficha totalmente agotada (1ec9f29; LEG-184 alternativa elegida por el dueño, LEG-186), con E2E_AGOTADO_URL
// =====================================================================================================================
test.describe("Ficha totalmente agotada (copia con CSV temporal)", () => {
  for (const ancho of [360, 1280])
    test(`Café Arreboles todo agotado a ${ancho} px: sin píldora marcada, precio y «Agotado» en cada una, IVA, sin cantidad ni total, wa.me sin datos, axe y contraste`, async ({ page }) => {
      const base = process.env.E2E_AGOTADO_URL;
      test.skip(!base, "sin E2E_AGOTADO_URL");
      await page.setViewportSize({ width: ancho, height: 800 });
      // Un carrito con datos en el navegador, para comprobar que el enlace no los lleva.
      await page.goto(`${base}/`, { waitUntil: "networkidle" });
      await page.evaluate(() => localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: [{ cafeSlug: "cafe-casa-martinez", gramos: 500, molienda: "grano", cantidad: 1 }] })));
      await page.goto(`${base}/cafes/cafe-arreboles/`);
      await page.waitForLoadState("networkidle");
      const form = page.locator("main form").first();

      // Presentación como dato, sin controles.
      await expect(form.locator('input[name="molienda"]')).toHaveCount(0);
      await expect(form.getByTestId("presentaciones-agotado")).toHaveText(/Grano\s*Molido/);
      await expect(form.getByTestId("ayuda-molienda")).toBeVisible();

      // Tamaños: deshabilitados, ninguno marcado, cada uno con su precio y «Agotado» debajo.
      const pildoras = await form.locator('input[name="gramos"]').evaluateAll((els) =>
        els.map((e) => {
          const i = e as HTMLInputElement;
          const smalls = [...i.nextElementSibling!.querySelectorAll("small")];
          const r = smalls.map((s) => s.getBoundingClientRect().top);
          return { v: i.value, dis: i.disabled, chk: i.checked, textos: smalls.map((s) => s.textContent), debajo: r.length === 2 && r[1] > r[0], borde: getComputedStyle(i.nextElementSibling!).borderTopStyle, op: getComputedStyle(i.closest("label")!).opacity };
        }),
      );
      test.info().annotations.push({ type: "pildoras", description: JSON.stringify(pildoras) });
      expect(pildoras.map((p) => p.v)).toEqual(["250", "500"]);
      for (const p of pildoras) {
        expect(p).toMatchObject({ dis: true, chk: false, debajo: true, borde: "dashed", op: "1" });
        expect(p.textos[0]).toMatch(/^\$\d{1,3}(\.\d{3})+$/);
        expect(p.textos[1]).toBe("Agotado");
      }
      expect(pildoras.map((p) => p.textos[0])).toEqual(["$23.000", "$40.000"]);

      // Leyenda de IVA bajo las píldoras.
      const iva = form.getByTestId("leyenda-iva");
      await expect(iva).toHaveCount(1);
      await expect(iva).toBeVisible();
      await expect(iva).toContainText("IVA");
      const yIva = (await iva.boundingBox())!.y;
      const yPildoras = (await form.locator('input[name="gramos"] + span').last().boundingBox())!;
      expect(yIva).toBeGreaterThanOrEqual(yPildoras.y + yPildoras.height - 1);

      // Sin compra simulada.
      await expect(form.getByRole("group", { name: "Cantidad de bolsas" })).toHaveCount(0);
      await expect(form.getByRole("button", { name: /Una bolsa (más|menos)/ })).toHaveCount(0);
      await expect(form.getByText(/\d+ × \d+ g/)).toHaveCount(0);
      await expect(form.locator(".text-3xl")).toHaveCount(0);
      await expect(form.getByText(/Hasta \d+ bolsas/)).toHaveCount(0);
      await expect(form.getByTestId("plazo-ficha")).toHaveCount(0);
      await expect(form.getByRole("button", { name: "Agregar al pedido" })).toHaveCount(0);
      await expect(form.getByRole("button", { name: "Agotado" })).toBeDisabled();

      // Texto de LEG-186 y enlace wa.me solo con el número de la tienda.
      const aviso = form.getByTestId("aviso-agotado");
      expect((await aviso.textContent())!.replace(/\s+/g, " ").trim()).toBe("Este café está agotado por ahora. Escríbenos por WhatsApp y te avisamos cuando vuelva.");
      const wa = aviso.getByRole("link", { name: "Escríbenos por WhatsApp" });
      await expect(wa).toHaveAttribute("href", `https://wa.me/${WHATSAPP}`);
      await expect(wa).toHaveAttribute("target", "_blank");
      await expect(wa).toHaveAttribute("rel", /noopener/);
      const enlacesWa = await page.locator('a[href*="wa.me"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")));
      for (const h of enlacesWa) expect(h, "ningún wa.me de la ficha lleva texto ni datos").toMatch(/^https:\/\/wa\.me\/\d+\/?$/);
      expect(page.url()).not.toMatch(/[?&](nombre|celular|direccion|correo)=/);

      // Contraste del precio y de «Agotado» en claro y oscuro, y axe.
      for (const t of ["light", "dark"] as const) {
        await tema(page, t);
        for (const sel of ['main form input[name="gramos"] + span small:first-of-type', 'main form input[name="gramos"] + span small:last-of-type', 'main form [data-testid="leyenda-iva"]', 'main form [data-testid="aviso-agotado"]']) {
          for (let i = 0; i < (await page.locator(sel).count()); i++) {
            const c = await contrasteDe(page, sel, i);
            test.info().annotations.push({ type: `contraste-${t}`, description: `${sel} #${i} ${c.ratio.toFixed(2)}` });
            expect(c.ratio, `${sel} ${t}`).toBeGreaterThanOrEqual(4.5);
            expect(c.opacidad).toBe("1");
          }
        }
        expect(await axeSerio(page, t === "dark"), `${t} ${ancho}`).toEqual([]);
      }
      await tema(page, "light");
      if (ancho === 360) await form.screenshot({ path: "docs/qa/capturas/2026-11-18-agotado-total-arreboles-360.png" });

      // JSON-LD: precio con OutOfStock (cierto) y la tarjeta del catálogo conserva «desde $…» (coherencia de LEG-184).
      const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
      const producto = ld.map((t) => JSON.parse(t)).find((j) => j["@type"] === "Product");
      expect(JSON.stringify(producto.offers)).toContain("OutOfStock");
      expect(JSON.stringify(producto.offers)).not.toContain("InStock");
      await page.goto(`${base}/cafes/`);
      const tarjeta = page.locator("#catalogo li article", { hasText: "Café Arreboles" });
      await expect(tarjeta).toContainText("$23.000");
      await expect(tarjeta).toContainText("Agotado");
      await expect(tarjeta.getByRole("button", { name: /^Agregar/ })).toHaveCount(0);
    });

  test("agotado parcial (Casa Martínez sin 250 g): la primera disponible sale marcada, el bloque de compra no cambia", async ({ page }) => {
    const base = process.env.E2E_AGOTADO_URL;
    test.skip(!base, "sin E2E_AGOTADO_URL");
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(`${base}/cafes/cafe-casa-martinez/`);
    await page.waitForLoadState("networkidle");
    const form = page.locator("main form").first();
    const estado = await form.locator('input[name="gramos"]').evaluateAll((els) => els.map((e) => ({ v: (e as HTMLInputElement).value, dis: (e as HTMLInputElement).disabled, chk: (e as HTMLInputElement).checked, smalls: [...e.nextElementSibling!.querySelectorAll("small")].map((s) => s.textContent) })));
    expect(estado).toEqual([
      { v: "250", dis: true, chk: false, smalls: ["Agotado"] },
      { v: "500", dis: false, chk: true, smalls: ["$47.000"] },
    ]);
    await expect(form.locator('input[name="molienda"]')).toHaveCount(2);
    await expect(form.getByRole("group", { name: "Cantidad de bolsas" })).toBeVisible();
    await expect(form.getByText("1 × 500 g · grano")).toBeVisible();
    await expect(form.getByTestId("plazo-ficha")).toBeVisible();
    await expect(form.getByTestId("aviso-agotado")).toHaveCount(0);
    await form.getByRole("button", { name: "Agregar al pedido" }).click();
    const lineas = await page.evaluate(() => JSON.parse(localStorage.getItem("desantander.carrito.v2") ?? "{}").lineas);
    expect(lineas).toEqual([{ cafeSlug: "cafe-casa-martinez", gramos: 500, molienda: "grano", cantidad: 1 }]);
  });
});

// =====================================================================================================================
// QA-026 · comprobaciones que la prueba M1 no hace
// =====================================================================================================================
test.describe("QA-026 · detalles", () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });

  // García Rovira no tiene cafés: su provincia está inactiva («Próximamente») y no abre tarjeta. Se abre la de Guanentá y se
  // le pone el nombre más largo de las provincias para comprobar que «Cerrar» no se encoge y el titular parte renglón.
  for (const ancho of [360, 320])
    test(`«Cerrar» de la tarjeta de provincia mide 44 × 44 con el nombre «García Rovira» y el titular parte renglón sin desbordar (${ancho} px)`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 740 });
      await page.goto("/");
      await page.locator("#mapa").scrollIntoViewIfNeeded();
      await expect(page.locator('g[data-provincia="guanenta"]')).toBeVisible();
      const { x, y } = await puntoEnProvincia(page, "guanenta");
      await page.touchscreen.tap(x, y);
      const dialogo = page.getByRole("dialog", { name: /Provincia de Guanentá/ });
      await expect(dialogo).toBeVisible();
      await dialogo.locator("h3").evaluate((h) => {
        const nodo = [...h.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && /Guanentá/.test(n.textContent ?? ""));
        if (nodo) nodo.textContent = nodo.textContent!.replace("Guanentá", "García Rovira");
        else h.textContent = (h.textContent ?? "").replace("Guanentá", "García Rovira");
      });
      await expect(dialogo.locator("h3")).toContainText("García Rovira");
      const cerrar = dialogo.getByRole("button", { name: /Cerrar/ });
      const c = (await cerrar.boundingBox())!;
      expect(c.width).toBeGreaterThanOrEqual(43.5);
      expect(c.height).toBeGreaterThanOrEqual(43.5);
      const h3 = await dialogo.locator("h3").evaluate((h) => ({ sw: h.scrollWidth, cw: h.clientWidth, right: h.getBoundingClientRect().right }));
      expect(h3.sw).toBeLessThanOrEqual(h3.cw + 1);
      expect(h3.right).toBeLessThanOrEqual(c.x + 0.5);
      expect(c.x + c.width).toBeLessThanOrEqual(ancho);
      expect(await sinDesborde(page)).toBe(0);
    });

  test("el <summary> «¿Qué significa cada dato?» conserva el triángulo nativo (display list-item) y su área no pisa otro control", async ({ page }) => {
    await page.goto("/cafes/cafe-casa-martinez/");
    const s = page.locator("summary", { hasText: "¿Qué significa cada dato?" });
    await expect(s).toHaveCSS("display", "list-item");
    const m = await s.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const b = getComputedStyle(el, "::before");
      const top = r.top + parseFloat(b.top);
      const area = { L: r.left, R: r.right, T: top, B: top + parseFloat(b.height) };
      const otros = [...document.querySelectorAll("a[href], button, summary, input, select")].filter((o) => o !== el && !el.contains(o) && !o.contains(el)).map((o) => o.getBoundingClientRect()).filter((o) => o.width > 0 && o.height > 0);
      return { alto: area.B - area.T, choques: otros.filter((o) => o.left < area.R && o.right > area.L && o.top < area.B && o.bottom > area.T).length };
    });
    expect(m.alto).toBeGreaterThanOrEqual(44);
    expect(m.choques).toBe(0);
  });

  test("«Cómo calculamos el envío» en el cajón: área de 44 px que no pisa «Continuar con el envío» ni otro control", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }] })));
    await page.goto("/");
    await page.getByRole("button", { name: /^Pedido/ }).click();
    const dialogo = page.getByRole("dialog", { name: "Tu pedido" });
    await expect(dialogo).toBeVisible();
    const m = await dialogo.getByRole("link", { name: "Cómo calculamos el envío" }).evaluate((el) => {
      const r = el.getBoundingClientRect();
      const b = getComputedStyle(el, "::before");
      const top = r.top + parseFloat(b.top);
      const area = { L: r.left, R: r.right, T: top, B: top + parseFloat(b.height) };
      const otros = [...el.closest("[role=dialog]")!.querySelectorAll("a[href], button, summary, input, select")].filter((o) => o !== el).map((o) => ({ t: o.textContent?.trim().slice(0, 30), r: o.getBoundingClientRect() })).filter((o) => o.r.width > 0);
      return { alto: area.B - area.T, choques: otros.filter((o) => o.r.left < area.R && o.r.right > area.L && o.r.top < area.B && o.r.bottom > area.T).map((o) => o.t) };
    });
    expect(m.alto).toBeGreaterThanOrEqual(44);
    expect(m.choques).toEqual([]);
  });

  test("«Cómo consulto de qué comuna soy» (Bucaramanga) y «Ver el mensaje» (resumen preparado) miden 44 px", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }] })));
    await page.goto("/pedido/");
    await page.getByLabel("Nombre completo").fill("Ana Rueda");
    await page.getByLabel("Celular").fill("300 123 4567");
    await page.getByLabel("Departamento").selectOption("Santander");
    await page.getByLabel("Municipio").selectOption("Bucaramanga");
    const comuna = page.locator("summary", { hasText: "Cómo consulto de qué comuna soy" });
    test.skip((await comuna.count()) === 0, "sin campo Comuna (promoción no vigente)");
    const hc = (await comuna.boundingBox())!.height;
    expect(hc).toBeGreaterThanOrEqual(44);
    await expect(comuna).toHaveCSS("display", "list-item");
    // No se superpone con el select «Comuna».
    const sel = (await page.getByLabel(/^Comuna/).boundingBox())!;
    const cb = (await comuna.boundingBox())!;
    expect(cb.y).toBeGreaterThanOrEqual(sel.y + sel.height - 0.5);
    await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
    await page.getByRole("button", { name: /Ver el resumen/ }).click();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    for (const n of ["Leí y acepto", "Autorizo"]) await page.getByRole("checkbox", { name: new RegExp(n) }).check();
    await enviarPorWhatsapp(page);
    const ver = page.locator("summary", { hasText: "Ver el mensaje" });
    await expect(ver).toBeVisible();
    const m = await ver.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const b = getComputedStyle(el, "::before");
      return { alto: b.position === "absolute" ? parseFloat(b.height) : r.height, display: getComputedStyle(el).display };
    });
    expect(m.alto).toBeGreaterThanOrEqual(44);
    expect(m.display).toBe("list-item");
  });

  test("índice «En este documento» de /envios/: cada título ≥ 44 px y sin solaparse", async ({ page }) => {
    for (const ruta of ["/envios/", "/legal/terminos/"]) {
      await page.goto(ruta);
      const cajas = await page.locator("nav", { hasText: "En este documento" }).locator("a").evaluateAll((as) => as.map((a) => a.getBoundingClientRect()).map((r) => ({ t: r.top, b: r.bottom, h: r.height })));
      expect(cajas.length, ruta).toBeGreaterThan(3);
      for (const [i, c] of cajas.entries()) {
        expect(c.h, `${ruta} #${i}`).toBeGreaterThanOrEqual(44);
        if (i > 0) expect(c.t).toBeGreaterThanOrEqual(cajas[i - 1].b - 0.5);
      }
    }
  });
});

// =====================================================================================================================
// QA-018 · deslizadores diferidos, migas fuera de la ficha
// =====================================================================================================================
test.describe("QA-018 · lo que se difirió sigue funcionando", () => {
  test("desde lg, el deslizador de la barra lateral se carga al acercarse, sin salto, y filtra con el teclado", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "networkidle" });
    const aside = page.locator("#catalogo aside");
    await expect(aside).toBeVisible();
    const antes = await aside.evaluate((a) => ({ alto: a.getBoundingClientRect().height, sliders: a.querySelectorAll("[role=slider]").length }));
    await aside.scrollIntoViewIfNeeded();
    const pulgar = aside.getByRole("slider", { name: "Altitud, mínimo" });
    await expect(pulgar).toBeVisible();
    const despues = await aside.evaluate((a) => a.getBoundingClientRect().height);
    test.info().annotations.push({ type: "aside", description: JSON.stringify({ antes, despues }) });
    expect(antes.sliders, "no se cargó antes de acercarse").toBe(0);
    expect(Math.abs(despues - antes.alto), "el hueco mide lo mismo que el deslizador").toBeLessThanOrEqual(0.5);
    await pulgar.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/altitud=/);
  });

  test("a 360 px la hoja de filtros trae el deslizador al abrirse; la raíz mide 44 px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByRole("slider")).toHaveCount(0);
    await page.getByRole("button", { name: /^Filtros/ }).click();
    const hoja = page.getByRole("dialog", { name: "Filtros" });
    const pulgar = hoja.getByRole("slider", { name: "Altitud, mínimo" });
    await expect(pulgar).toBeVisible();
    const raiz = await pulgar.evaluate((t) => {
      let r: HTMLElement | null = t.parentElement;
      while (r && getComputedStyle(r).touchAction !== "none") r = r.parentElement;
      return r!.getBoundingClientRect().height;
    });
    expect(raiz).toBeGreaterThanOrEqual(44);
  });

  for (const ruta of ["/envios/", "/legal/terminos/", "/legal/privacidad/", "/legal/vendedor/", "/provincias/guanenta/", "/cafes/cafe-casa-martinez/"])
    test(`migas en ${ruta}: el primer enlace lleva a / o a /cafes/, el último elemento es la página actual y el área mide 44 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(ruta);
      const migas = page.getByRole("navigation", { name: "Ruta de navegación" });
      await expect(migas).toHaveCount(1);
      await expect(migas).toBeVisible();
      // /envios/ y legales empiezan en «Inicio»; la ficha y la provincia, en «Cafés».
      const inicio = migas.getByRole("link").first();
      const href = await inicio.getAttribute("href");
      expect(["/", "/cafes/"]).toContain(href);
      await expect(migas.locator("li").last().locator('[aria-current="page"]')).toHaveCount(1);
      const h = await inicio.evaluate((a) => parseFloat(getComputedStyle(a, "::before").height));
      expect(h).toBeGreaterThanOrEqual(44);
      await inicio.click();
      await expect(page).toHaveURL(new RegExp(`${href!.replace(/\//g, "\\/")}$`));
    });
});
