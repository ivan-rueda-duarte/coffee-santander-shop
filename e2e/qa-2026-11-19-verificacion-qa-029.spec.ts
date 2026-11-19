import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { enviarPorWhatsapp } from "./ayudas";

// Ronda QA 2026-11-19: verificación de QA-029 (5982339, «fix(estilos): pesos y tamaños de control según marca»).
// Criterios: docs/diseno/2026-11-18-ux-auditoria-media.md § QA-029, «Entrega para qa-pruebas (QA-029)».
// Reporte: docs/qa/2026-11-19-verificacion-qa-029.md. La prueba de cierre general (pesos y text-sm en toda la página) está
// en e2e/qa-2026-11-19-cierre-baja.spec.ts › «QA-029: …».
// Variable opcional: E2E_AGOTADO_URL (build de una copia con data/catalogo.csv modificado: arreboles agotado 250|500,
// casa-martinez 250). Nunca se commitea.

const SERIAS = ["serious", "critical"];

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

/** Tamaño y peso del elemento y de cada <span>/<small> hijo directo (conteo, precio, «Agotado»). */
async function tipo(l: Locator) {
  return l.evaluateAll((els) =>
    els.map((e) => {
      const cs = getComputedStyle(e);
      const hijos = [...e.children].filter((h) => h.tagName === "SPAN" || h.tagName === "SMALL").filter((h) => (h.textContent ?? "").trim() !== "");
      return {
        texto: (e.textContent ?? "").trim(),
        rotulo: `${cs.fontSize}/${cs.fontWeight}`,
        dato: hijos.map((h) => `${getComputedStyle(h).fontSize}/${getComputedStyle(h).fontWeight}`),
      };
    }),
  );
}

function esperarRotuloYDato(medidas: { texto: string; rotulo: string; dato: string[] }[], conDato: boolean) {
  expect(medidas.length).toBeGreaterThan(0);
  for (const m of medidas) {
    expect(m.rotulo, m.texto).toBe("14px/600");
    if (conDato) expect(m.dato.length, `${m.texto}: tiene dato`).toBeGreaterThan(0);
    for (const d of m.dato) expect(d, `${m.texto}: dato`).toBe("12px/500");
  }
}

test.describe("QA-029 · chips y píldoras en 14/600, dato en 12/500", () => {
  test("inicio a 1.280: chips del panel de filtros", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const chips = page.locator("aside[aria-label=Filtros] button.ds-tag");
    test.info().annotations.push({ type: "chips-1280", description: JSON.stringify(await tipo(chips)) });
    esperarRotuloYDato(await tipo(chips), true);
  });

  test("inicio a 360: chips sobre el catálogo y en la hoja de filtros; filtros activos", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const visibles = page.locator("#catalogo button.ds-tag[aria-pressed]:visible");
    esperarRotuloYDato(await tipo(visibles), true);
    // QA-025: alto visible de 36 px (min-h-9; contenido 20 + 8 + 2) y área táctil ≥ 44 px (::before de ±5 px), medida por impacto con elementFromPoint.
    const alturas = await visibles.evaluateAll((els) =>
      els.map((e) => {
        e.scrollIntoView({ block: "center" });
        const r = e.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const cx = (y: number) => e.contains(document.elementFromPoint(x, y));
        let arriba = 0;
        while (arriba < 12 && cx(r.top - arriba - 1)) arriba++;
        let abajo = 0;
        while (abajo < 12 && cx(r.bottom + abajo)) abajo++;
        return { texto: (e.textContent ?? "").trim(), alto: r.height, tactil: r.height + arriba + abajo };
      }),
    );
    test.info().annotations.push({ type: "qa-025-360", description: JSON.stringify(alturas) });
    for (const h of alturas) {
      expect(h.alto, h.texto).toBe(36);
      expect(h.tactil, h.texto).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole("button", { name: "Guanentá 1" }).click();
    await expect(page.locator("#resultados-catalogo")).toHaveText("1 café en Guanentá");
    const activos = page.getByRole("group", { name: "Filtros activos" }).locator("button.ds-tag");
    await expect(activos).toHaveCount(1);
    const a = await tipo(activos);
    test.info().annotations.push({ type: "activos-360", description: JSON.stringify(a) });
    esperarRotuloYDato(a, false);
    // Se quitó gap-1.5: queda el gap de 4 px de .ds-tag entre el texto y la ×.
    expect(await activos.first().evaluate((e) => getComputedStyle(e).columnGap)).toBe("4px");
    await page.getByRole("button", { name: /^Filtros/ }).click();
    const hoja = page.getByRole("dialog", { name: "Filtros" });
    await expect(hoja).toBeVisible();
    const enHoja = await tipo(hoja.locator("button.ds-tag[aria-pressed]"));
    test.info().annotations.push({ type: "hoja-360", description: JSON.stringify(enHoja) });
    esperarRotuloYDato(enHoja, true);
  });

  test("filtros activos a 1.280 y URL compartida", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/cafes/?provincia=guanenta");
    await page.waitForLoadState("networkidle");
    const activos = page.getByRole("group", { name: "Filtros activos" }).locator("button.ds-tag");
    await expect(activos).toHaveCount(1);
    esperarRotuloYDato(await tipo(activos), false);
  });

  for (const ancho of [360, 1280])
    test(`ficha a ${ancho}: píldoras 14/600 con precio 12/500; perfiles de taza sin cambio (12/500)`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 900 });
      await page.goto("/cafes/cafe-casa-martinez/");
      await page.waitForLoadState("networkidle");
      const form = page.locator("main article form").first();
      const molienda = await tipo(form.locator('input[name="molienda"] + span'));
      const tamano = await tipo(form.locator('input[name="gramos"] + span'));
      test.info().annotations.push({ type: `pildoras-${ancho}`, description: JSON.stringify({ molienda, tamano }) });
      expect(molienda.map((m) => m.texto)).toEqual(["Grano", "Molido"]);
      esperarRotuloYDato(molienda, false);
      esperarRotuloYDato(tamano, true);
      const perfiles = await page.locator("main li.ds-tag--outline").evaluateAll((els) => els.map((e) => `${(e.textContent ?? "").trim()} ${getComputedStyle(e).fontSize}/${getComputedStyle(e).fontWeight}`));
      test.info().annotations.push({ type: `perfiles-${ancho}`, description: JSON.stringify(perfiles) });
      expect(perfiles.length).toBeGreaterThan(0);
      for (const p of perfiles) expect(p).toMatch(/ 12px\/500$/);
    });
});

test.describe("QA-029 · centrado de las píldoras de la ficha", () => {
  for (const ancho of [360, 1280])
    test(`a ${ancho}: «Grano» y «Molido» centrados en vertical (≤ 1 px); tamaños de dos líneas centrados en horizontal`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 900 });
      await page.goto("/cafes/cafe-casa-martinez/");
      await page.waitForLoadState("networkidle");
      const form = page.locator("main article form").first();
      const medir = (sel: string) =>
        form.locator(sel).evaluateAll((spans) =>
          spans.map((s) => {
            const caja = s.getBoundingClientRect();
            const cs = getComputedStyle(s);
            const bt = parseFloat(cs.borderTopWidth);
            const bb = parseFloat(cs.borderBottomWidth);
            const rango = document.createRange();
            rango.selectNodeContents(s);
            const t = rango.getBoundingClientRect();
            // Una caja por renglón (React parte «250 g» en dos nodos de texto): se agrupan los rectángulos por su línea.
            const renglones = new Map<number, { izq: number; der: number }>();
            for (const b of rango.getClientRects()) {
              if (b.width === 0) continue;
              const k = Math.round(b.top + b.height / 2);
              const clave = [...renglones.keys()].find((x) => Math.abs(x - k) <= 3) ?? k;
              const r = renglones.get(clave);
              renglones.set(clave, r ? { izq: Math.min(r.izq, b.left), der: Math.max(r.der, b.right) } : { izq: b.left, der: b.right });
            }
            const lineas = [...renglones.values()].map((r) => ({ centro: (r.izq + r.der) / 2 }));
            return {
              texto: (s.textContent ?? "").trim(),
              alto: caja.height,
              arriba: t.top - caja.top - bt,
              abajo: caja.bottom - bb - t.bottom,
              centroCaja: caja.left + caja.width / 2,
              centros: lineas.map((l) => l.centro),
            };
          }),
        );
      const una = await medir('input[name="molienda"] + span');
      const dos = await medir('input[name="gramos"] + span');
      test.info().annotations.push({ type: `centrado-${ancho}`, description: JSON.stringify({ una, dos }) });
      for (const p of una) {
        expect(p.alto, p.texto).toBeGreaterThanOrEqual(44);
        expect(Math.abs(p.arriba - p.abajo), `${p.texto}: arriba ${p.arriba} / abajo ${p.abajo}`).toBeLessThanOrEqual(1);
      }
      for (const p of dos) {
        expect(p.centros.length, p.texto).toBeGreaterThanOrEqual(2);
        for (const c of p.centros) expect(Math.abs(c - p.centroCaja), `${p.texto}: centro horizontal`).toBeLessThanOrEqual(1);
        expect(Math.abs(p.arriba - p.abajo), `${p.texto}: vertical`).toBeLessThanOrEqual(1);
      }
    });
});

test.describe("QA-029 · borde al pasar el puntero (1.280)", () => {
  test("chip no marcado: el borde pasa a ink; chip deshabilitado: no cambia; filtro activo: pasa a ink", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    // Con Guanentá elegida, las opciones del otro café quedan en 0 y se deshabilitan (facetas, O/Y).
    await page.goto("/?provincia=guanenta");
    await page.waitForLoadState("networkidle");
    const ink = await page.evaluate(() => {
      const d = document.createElement("div");
      d.style.color = "var(--ink)";
      document.querySelector("aside[aria-label=Filtros]")!.appendChild(d);
      const c = getComputedStyle(d).color;
      d.remove();
      return c;
    });
    const borde = (l: Locator) => l.evaluate((e) => getComputedStyle(e).borderTopColor);
    const panel = page.locator("aside[aria-label=Filtros]");
    const libre = panel.locator("button.ds-tag[aria-pressed=false]:enabled").first();
    const antes = await borde(libre);
    expect(antes).not.toBe(ink);
    await libre.hover();
    await expect.poll(() => borde(libre)).toBe(ink);

    const deshabilitado = panel.locator("button.ds-tag:disabled").first();
    await expect(deshabilitado).toHaveCount(1);
    const d0 = await borde(deshabilitado);
    await deshabilitado.hover({ force: true });
    await page.waitForTimeout(400);
    expect(await borde(deshabilitado)).toBe(d0);
    test.info().annotations.push({ type: "bordes", description: JSON.stringify({ ink, antes, deshabilitado: d0 }) });

    await page.goto("/cafes/?provincia=guanenta");
    await page.waitForLoadState("networkidle");
    const activo = page.getByRole("group", { name: "Filtros activos" }).locator("button.ds-tag").first();
    expect(await borde(activo)).not.toBe(ink);
    await activo.hover();
    await expect.poll(() => borde(activo)).toBe(ink);
  });
});

test.describe("QA-029 · /envios/ (tarjetas por zona)", () => {
  for (const ancho of [360, 768])
    test(`a ${ancho}: título y «Zona n» en 700, <summary> en 700, «Por cotizar» en 600, sin desplazamiento horizontal`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 900 });
      await page.goto("/envios/");
      await page.waitForLoadState("networkidle");
      const peso = (l: Locator) => l.evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => `${(e.textContent ?? "").trim().slice(0, 60)} ${getComputedStyle(e).fontWeight}`));
      expect(await peso(page.locator("h3#tarifas-por-zona"))).toEqual(["Tarifas por zona y municipios de cada zona 700"]);
      // Una tarjeta por fila de tarifas (la zona 1 tiene varias claves): todas en 700 y las cinco zonas presentes.
      const zonas = await peso(page.getByTestId("tarjetas-envios").locator("h4"));
      expect([...new Set(zonas)]).toEqual([1, 2, 3, 4, 5].map((n) => `Zona ${n} 700`));
      const resumenes = await peso(page.locator("summary", { hasText: /^Qué cubre la zona/ }));
      expect(resumenes.length).toBeGreaterThan(0);
      for (const r of resumenes) expect(r).toMatch(/ 700$/);
      const cotizar = await peso(page.locator("p", { hasText: /^Por cotizar por WhatsApp antes de que pagues$/ }));
      expect(cotizar.length).toBeGreaterThan(0);
      for (const c of cotizar) expect(c).toMatch(/ 600$/);
      test.info().annotations.push({ type: `envios-${ancho}`, description: JSON.stringify({ zonas, resumenes, cotizar }) });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
});

test.describe("QA-029 · tira de navegación a 360", () => {
  test("enlaces en 600 y de 44 px de alto; «Envíos» asoma bajo el fundido sin deslizar", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const m = await page.getByTestId("tira-navegacion").locator("ul").evaluate((ul) => {
      const u = ul.getBoundingClientRect();
      const enlaces = [...ul.querySelectorAll("a")].map((a) => {
        const r = a.getBoundingClientRect();
        return { texto: a.textContent, peso: getComputedStyle(a).fontWeight, alto: r.height, izquierda: r.left, derecha: r.right };
      });
      return { enlaces, derechaTira: u.right };
    });
    test.info().annotations.push({ type: "tira", description: JSON.stringify(m) });
    for (const e of m.enlaces) {
      expect(e.peso, e.texto!).toBe("600");
      expect(e.alto, e.texto!).toBeGreaterThanOrEqual(44);
    }
    const envios = m.enlaces.at(-1)!;
    expect(envios.texto).toBe("Envíos");
    // Asoma: empieza dentro de la tira visible y termina fuera (o bajo los 24 px del fundido), lo que indica que hay más.
    expect(envios.izquierda, "«Envíos» empieza dentro de la tira").toBeLessThan(m.derechaTira - 8);
    expect(envios.derecha, "«Envíos» queda cortado o bajo el fundido").toBeGreaterThan(m.derechaTira - 24);
  });
});

test.describe("QA-029 · axe tras el cambio", () => {
  for (const ancho of [360, 1280])
    for (const t of ["light", "dark"] as const)
      test(`axe sin serias ni críticas a ${ancho} en ${t}: /, ficha y /envios/`, async ({ page }) => {
        await page.setViewportSize({ width: ancho, height: 900 });
        for (const ruta of ["/", "/cafes/cafe-casa-martinez/", "/envios/"]) {
          await page.goto(ruta);
          await page.waitForLoadState("networkidle");
          await tema(page, t);
          expect(await axeSerio(page, t === "dark"), `${ruta} ${t} ${ancho}`).toEqual([]);
        }
      });
});

test.describe("QA-029 · píldoras agotadas (copia con CSV temporal)", () => {
  for (const ancho of [360, 1280])
    test(`a ${ancho}: punteadas, ink-muted, 14/600 con «Agotado» 12/500`, async ({ page }) => {
      const base = process.env.E2E_AGOTADO_URL;
      test.skip(!base, "sin E2E_AGOTADO_URL");
      await page.setViewportSize({ width: ancho, height: 900 });
      for (const slug of ["cafe-arreboles", "cafe-casa-martinez"]) {
        await page.goto(`${base}/cafes/${slug}/`);
        await page.waitForLoadState("networkidle");
        const form = page.locator("main article form").first();
        const ag = form.locator('input[name="gramos"]:disabled + span');
        const m = await ag.evaluateAll((spans) =>
          spans.map((s) => {
            const cs = getComputedStyle(s);
            const ult = [...s.querySelectorAll("small")].at(-1)!;
            const probe = document.createElement("i");
            probe.style.color = "var(--ink-muted)";
            s.appendChild(probe);
            const muted = getComputedStyle(probe).color;
            probe.remove();
            return { borde: cs.borderTopStyle, color: cs.color, muted, rotulo: `${cs.fontSize}/${cs.fontWeight}`, agotado: `${ult.textContent} ${getComputedStyle(ult).fontSize}/${getComputedStyle(ult).fontWeight}` };
          }),
        );
        test.info().annotations.push({ type: `${slug}-${ancho}`, description: JSON.stringify(m) });
        expect(m.length, slug).toBeGreaterThan(0);
        for (const p of m) {
          expect(p.borde).toBe("dashed");
          expect(p.color).toBe(p.muted);
          expect(p.rotulo).toBe("14px/600");
          expect(p.agotado).toBe("Agotado 12px/500");
        }
        if (ancho === 360) await form.screenshot({ path: `docs/qa/capturas/2026-11-19-qa-029-agotado-${slug}-360.png` });
      }
    });
});

test.describe("QA-029 · resumen con respaldo (A6)", () => {
  for (const ancho of [360, 1280])
    test(`a ${ancho}: la primera línea del respaldo se pinta en 600 (small, 14 px)`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: ancho === 360 ? 740 : 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }] })));
      await page.goto("/pedido/");
      await page.getByLabel("Nombre completo").fill("Ana Rueda");
      await page.getByLabel("Celular").fill("300 123 4567");
      await page.getByLabel("Departamento").selectOption("Santander");
      await page.getByLabel("Municipio").selectOption("Bucaramanga");
      await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
      await page.getByRole("button", { name: /Ver el resumen/ }).click();
      await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
      await page.locator("#c-ter").check();
      await page.locator("#c-aut").check();
      await enviarPorWhatsapp(page);
      const respaldo = page.getByTestId("respaldo-whatsapp");
      const linea = respaldo.locator("p[role=status]");
      await expect(linea).toContainText("¿No se abrió WhatsApp?");
      expect(await linea.evaluate((e) => `${getComputedStyle(e).fontSize}/${getComputedStyle(e).fontWeight}`)).toBe("14px/600");
      // Captura sin el encabezado fijo encima (la del 2026-11-18 lo deja tapando la primera línea).
      await page.addStyleTag({ content: "header{visibility:hidden !important}" });
      await respaldo.scrollIntoViewIfNeeded();
      await respaldo.screenshot({ path: `docs/qa/capturas/2026-11-19-qa-029-respaldo-${ancho}.png` });
    });
});
