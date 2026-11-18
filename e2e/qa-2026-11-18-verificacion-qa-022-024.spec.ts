import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { constanciaMensaje, enviarPorWhatsapp } from "./ayudas";

// Ronda QA 2026-11-18: verificación de QA-022 (dd5a13a), QA-023 (44f50d6) y QA-024 (290ee55).
// Fuentes: docs/qa/2026-11-18-verificacion-a1-fotos-qa-020.md; docs/diseno/2026-11-18-ux-auditoria-alta.md, sección
// «QA-023» (criterios 1 a 8); docs/legal/revisiones/2026-11-18-qa-023-casillas-360.md (LEG-178 a LEG-182);
// docs/legal/microcopy-legal.md v1.11 (§5.9, §9.4). Complementa e2e/qa-2026-11-18-flujo-tres-pasos.spec.ts.

const UNA_BOLSA = [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }];
const UNA_FRASE = "Para enviar tu pedido, acepta los términos y autoriza tus datos.";
const SERIAS = ["serious", "critical"];

async function alResumen(page: Page, correo?: string) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate((l) => localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: l })), UNA_BOLSA);
  await page.goto("/pedido/");
  await page.getByLabel("Nombre completo").fill("Ana Rueda");
  await page.getByLabel("Celular").fill("300 123 4567");
  await page.getByLabel("Departamento").selectOption("Santander");
  await page.getByLabel("Municipio").selectOption("Bucaramanga");
  await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
  if (correo) await page.getByLabel(/Correo/).fill(correo);
  await page.getByRole("button", { name: /Ver el resumen/ }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
}

const terminos = (page: Page) => page.locator("#c-ter");
const datos = (page: Page) => page.locator("#c-aut");
const boton = (page: Page) => page.getByRole("button", { name: "Enviar por WhatsApp" });
const textoDe = (href: string) => decodeURIComponent(href.split("?text=")[1]);
const numeroDe = (href: string) => /DS-\d{6}-\d{4}-[A-Z2-9]{4}/.exec(textoDe(href))?.[0];
const sinNumero = (href: string) => textoDe(href).replace(/DS-\d{6}-\d{4}-[A-Z2-9]{4}/, "DS-#");

async function tema(page: Page, t: "light" | "dark") {
  await page.evaluate((v) => {
    document.documentElement.setAttribute("data-theme", v);
    document.querySelector("main")?.setAttribute("data-theme", v);
  }, t);
  await page.waitForTimeout(400);
}

/** Contraste WCAG entre el color del texto y el primer fondo opaco de sus ancestros. */
async function contraste(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const texto = rgb(getComputedStyle(el).color);
    let n: Element | null = el;
    let fondo = [255, 255, 255];
    while (n) {
      const c = rgb(getComputedStyle(n).backgroundColor);
      if (c.length >= 3 && (c.length === 3 || c[3] > 0.95)) { fondo = c.slice(0, 3); break; }
      n = n.parentElement;
    }
    const [a, b] = [lum(texto), lum(fondo)].sort((x, y) => y - x);
    return { ratio: (a + 0.05) / (b + 0.05), texto: getComputedStyle(el).color, fondo: `rgb(${fondo.join(", ")})` };
  });
}

// ---------------------------------------------------------------------------------------------------------------
// QA-022: regla del dev (microcopy §9.4, v1.10/1.11): tras un cambio, aunque se deshaga, el siguiente clic genera
// número DS y texto nuevos; sin ningún cambio entre dos clics, el mismo número (§4 bis 1).
// ---------------------------------------------------------------------------------------------------------------
test.describe("QA-022: respaldo y número DS tras deshacer un cambio", () => {
  for (const variante of ["casilla opcional", "casilla 1", "dirección"] as const) {
    test(`deshacer un cambio (${variante}): el respaldo no reaparece y el clic siguiente da un DS nuevo`, async ({ page }) => {
      await alResumen(page);
      await terminos(page).check();
      await datos(page).check();
      const primero = await enviarPorWhatsapp(page);
      // Segundo clic sin cambios: mismo enlace y mismo número (§4 bis 1).
      const repetido = await enviarPorWhatsapp(page);
      expect(repetido).toBe(primero);
      await expect(page.getByTestId("respaldo-whatsapp")).toBeVisible();

      if (variante === "casilla opcional") {
        await page.locator("#c-promo-wa").check();
        await expect(page.getByTestId("respaldo-whatsapp")).toHaveCount(0);
        await page.locator("#c-promo-wa").uncheck();
      } else if (variante === "casilla 1") {
        await terminos(page).uncheck();
        await expect(page.getByTestId("respaldo-whatsapp")).toHaveCount(0);
        await terminos(page).check();
      } else {
        // Ir a Envío, cambiar la dirección y volver a dejarla igual.
        await page.getByRole("button", { name: "Volver al envío" }).click();
        await page.getByLabel("Dirección").fill("Calle 46 # 12-30");
        await page.getByLabel("Dirección").fill("Calle 45 # 12-30");
        await page.getByRole("button", { name: /Ver el resumen/ }).click();
        await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
        if (!(await terminos(page).isChecked())) await terminos(page).check();
        if (!(await datos(page).isChecked())) await datos(page).check();
      }
      await page.waitForTimeout(250);
      await expect(page.getByTestId("respaldo-whatsapp"), "el respaldo reapareció sin un nuevo clic").toHaveCount(0);

      const nuevo = await enviarPorWhatsapp(page);
      expect(numeroDe(nuevo), "tras deshacer un cambio, el clic siguiente debe generar un número DS nuevo").not.toBe(numeroDe(primero));
      // El texto es el mismo salvo el número (el estado volvió a ser el mismo).
      expect(sinNumero(nuevo)).toBe(sinNumero(primero));
      // Y el respaldo copia el enlace nuevo, no el viejo.
      await page.getByTestId("respaldo-whatsapp").locator("summary").click();
      await expect(page.getByTestId("respaldo-whatsapp").locator("pre")).toContainText(numeroDe(nuevo)!);
      // Un tercer clic sin cambios repite el número nuevo.
      expect(numeroDe(await enviarPorWhatsapp(page))).toBe(numeroDe(nuevo));
    });
  }
});

// ---------------------------------------------------------------------------------------------------------------
// QA-024: nombre accesible exacto del paso hecho, también por debajo de 360 px.
// ---------------------------------------------------------------------------------------------------------------
test.describe("QA-024: nombre accesible del paso hecho", () => {
  for (const ancho of [1280, 360, 359, 320, 280]) {
    test(`a ${ancho} px: «Pedido, hecho» y «Envío, hecho» exactos en Resumen; «Pedido, hecho» en Envío`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 740 });
      await alResumen(page);
      const pasos = page.getByRole("list", { name: "Pasos del pedido" });
      await expect(pasos.getByRole("button", { name: "Pedido, hecho", exact: true })).toBeVisible();
      await expect(pasos.getByRole("link", { name: "Envío, hecho", exact: true })).toBeVisible();
      const arbol = await pasos.ariaSnapshot();
      test.info().annotations.push({ type: `aria-${ancho}`, description: arbol });
      expect(arbol).not.toContain(" , hecho");
      expect(arbol).not.toMatch(/hecho, hecho/);
      // El paso actual no lleva «hecho» y conserva aria-current.
      await expect(pasos.locator("li[aria-current='step']")).toContainText("Resumen");
      await expect(pasos.locator("li[aria-current='step']")).not.toContainText("hecho");
      // Rótulo visible: a ≥ 360 px el nombre accesible empieza por el texto visible (WCAG 2.5.3).
      // (innerText incluye el texto sr-only; se mide el ancho del rótulo: a < 360 px queda sr-only, ≤ 1 px.)
      const rotulo = await pasos.getByRole("button", { name: "Pedido, hecho" }).evaluate((b) => {
        const s = b.querySelector(":scope > span:last-child") as HTMLElement;
        return { ancho: s.getBoundingClientRect().width, texto: (s.firstChild?.textContent ?? "").trim() };
      });
      expect(rotulo.texto).toBe("Pedido");
      // `max-[359px]:sr-only` de Tailwind v4 es `width < 359px`: a 359 px el rótulo aún se ve (y cabe en una línea).
      if (ancho >= 359) expect(rotulo.ancho).toBeGreaterThan(20);
      else expect(rotulo.ancho).toBeLessThanOrEqual(1);
      expect((await pasos.boundingBox())!.height, "indicador en una línea").toBeLessThan(50);
      const indicador = await pasos.evaluate((ol) => ol.getBoundingClientRect().right <= document.documentElement.clientWidth + 0.5);
      expect(indicador, "el indicador no se sale de la pantalla").toBe(true);
      // Sin desbordamiento horizontal de la página desde 320 px (WCAG 1.4.10). A 280 px el botón «Pedido» del
      // encabezado se sale 7 px: queda anotado, fuera del mínimo de 320 px.
      const pagina = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      test.info().annotations.push({ type: `desborde-${ancho}`, description: `${pagina} px` });
      if (ancho >= 320) expect(pagina).toBeLessThanOrEqual(0);
      // El botón sigue abriendo el cajón y el enlace sigue llevando a Envío.
      await pasos.getByRole("button", { name: "Pedido, hecho" }).click();
      await expect(page.getByRole("dialog", { name: "Tu pedido" })).toBeVisible();
      await page.keyboard.press("Escape");
      await pasos.getByRole("link", { name: "Envío, hecho" }).click();
      await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
      await expect(page.getByRole("list", { name: "Pasos del pedido" }).getByRole("button", { name: "Pedido, hecho", exact: true })).toBeVisible();
      await expect(page.getByRole("list", { name: "Pasos del pedido" }).getByRole("link")).toHaveCount(0);
    });
  }
});

// ---------------------------------------------------------------------------------------------------------------
// QA-023: criterios 1 a 8 de diseño (B3 aceptado por legal con condiciones, LEG-178; microayuda v1.11, LEG-181).
// ---------------------------------------------------------------------------------------------------------------
test.describe("QA-023: Resumen a 360 × 740 (B3)", () => {
  test("criterio 1: microayuda v1.11 exacta, con una o con las dos casillas sin marcar; nunca «marca las dos casillas»", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await alResumen(page);
    await page.evaluate(() => document.fonts.ready);
    const ayuda = page.getByTestId("ayuda-preparar");
    await expect(ayuda).toHaveText(UNA_FRASE);
    const alto = (await ayuda.boundingBox())!.height;
    test.info().annotations.push({ type: "microayuda-alto-360", description: `${alto} px` });
    // LEG-181: ≈ 2 líneas de caption a 360 px (el criterio de una línea ya no aplica).
    expect(alto).toBeLessThanOrEqual(40);
    await expect(boton(page)).toHaveAttribute("aria-describedby", "ayuda-preparar");
    for (const [t, d] of [[true, false], [false, true]] as const) {
      await terminos(page).setChecked(t);
      await datos(page).setChecked(d);
      await expect(ayuda).toHaveText(UNA_FRASE);
    }
    await terminos(page).check();
    await datos(page).check();
    await expect(ayuda).toHaveCount(0);
    expect(await page.locator("body").innerText()).not.toMatch(/marca las dos casillas/);
  });

  test("criterio 5 y salvaguarda (d): foco a la primera obligatoria sin marcar, visible bajo el encabezado aunque estuviera tapada", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await alResumen(page);
    const bajoEncabezado = async (sel: string) => {
      const enc = await page.locator("header").first().evaluate((h) => h.getBoundingClientRect().bottom);
      const tope = await page.locator(sel).evaluate((e) => e.closest("label")!.getBoundingClientRect().top);
      return { enc, tope };
    };
    // Caso A: la casilla 1 queda justo detrás del encabezado fijo (sticky) antes de pulsar.
    const yLabel = await terminos(page).evaluate((e) => e.closest("label")!.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y - 20), yLabel);
    await boton(page).focus();
    await page.keyboard.press("Enter");
    await expect(terminos(page)).toBeFocused();
    await page.waitForTimeout(300);
    let m = await bajoEncabezado("#c-ter");
    test.info().annotations.push({ type: "foco-c-ter-tapada", description: JSON.stringify(m) });
    expect(m.tope, "la casilla 1 enfocada queda bajo el encabezado").toBeGreaterThanOrEqual(m.enc);
    await expect(page.locator("#e-ter")).toBeVisible();
    // Caso B: solo falta la 2 y está fuera de pantalla por arriba.
    await terminos(page).check();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await boton(page).click({ force: true });
    await expect(datos(page)).toBeFocused();
    await page.waitForTimeout(300);
    m = await bajoEncabezado("#c-aut");
    test.info().annotations.push({ type: "foco-c-aut-arriba", description: JSON.stringify(m) });
    expect(m.tope).toBeGreaterThanOrEqual(m.enc);
    await expect(page.locator("#e-aut")).toBeVisible();
  });

  test("criterios 4 y 8: orden del DOM promociones → filete → obligatorias → vendedor → LEG-171 → microayuda → botón; 3 y 4 nunca bloquean ni muestran error", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await alResumen(page, "ana@example.com");
    const orden = await page.locator("main").evaluate((m) => {
      const ids = ["casillas-promociones", "casillas-obligatorias", "linea-vendedor", "texto-siguiente-paso", "ayuda-preparar"];
      const els = ids.map((id) => m.querySelector(`[data-testid='${id}']`)!);
      const b = [...m.querySelectorAll("button")].find((e) => e.textContent?.includes("Enviar por WhatsApp"))!;
      return [...els, b].every((e, i, a) => i === 0 || (a[i - 1].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0);
    });
    expect(orden).toBe(true);
    const promo = page.getByTestId("casillas-promociones");
    await expect(promo.locator("#c-promo-wa")).toHaveCount(1);
    await expect(promo.locator("#c-promo-correo")).toHaveCount(1);
    // Grupo con nombre accesible visible.
    await expect(page.getByRole("group", { name: "Promociones (opcional)" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Autorizaciones obligatorias" })).toBeAttached();
    // 3 y 4 sin marcar; marcadas no habilitan; al pulsar sin 1 y 2 no muestran error.
    for (const id of ["#c-promo-wa", "#c-promo-correo"]) await expect(page.locator(id)).not.toBeChecked();
    await page.locator("#c-promo-wa").check();
    await page.locator("#c-promo-correo").check();
    await expect(boton(page)).toHaveAttribute("aria-disabled", "true");
    await boton(page).click({ force: true });
    for (const id of ["#c-promo-wa", "#c-promo-correo"]) await expect(page.locator(id)).not.toHaveAttribute("aria-invalid", /.*/);
    expect(await promo.locator("[role='alert'], .ds-alerta, [id^='e-']").count()).toBe(0);
    // Con 1 y 2, las promociones desmarcadas no bloquean.
    await page.locator("#c-promo-wa").uncheck();
    await page.locator("#c-promo-correo").uncheck();
    await terminos(page).check();
    await datos(page).check();
    await expect(boton(page)).not.toHaveAttribute("aria-disabled", /.*/);
  });

  test("LEG-178 (4): el mensaje y su constancia no cambian con promociones marcadas o sin marcar, salvo la línea de promociones", async ({ page }) => {
    await alResumen(page, "ana@example.com");
    await terminos(page).check();
    await datos(page).check();
    const sinPromo = textoDe(await enviarPorWhatsapp(page)).split("\n");
    await page.locator("#c-promo-wa").check();
    const soloWa = textoDe(await enviarPorWhatsapp(page)).split("\n");
    await page.locator("#c-promo-correo").check();
    const ambas = textoDe(await enviarPorWhatsapp(page)).split("\n");
    const norm = (l: string[]) => l.map((x) => x.replace(/DS-\d{6}-\d{4}-[A-Z2-9]{4}/, "DS-#"));
    // Constancia v1.0 en los tres, idéntica y en la misma posición relativa (antes de la línea de promociones).
    for (const m of [sinPromo, soloWa, ambas]) expect(m.filter((l) => l === constanciaMensaje())).toHaveLength(1);
    expect(sinPromo.some((l) => /promociones/i.test(l))).toBe(false);
    expect(soloWa.filter((l) => /promociones/i.test(l))).toEqual(["Autorizo recibir promociones por WhatsApp."]);
    expect(ambas.filter((l) => /promociones/i.test(l))).toEqual(["Autorizo recibir promociones por WhatsApp y correo."]);
    expect(norm(soloWa).filter((l) => !/promociones/i.test(l))).toEqual(norm(sinPromo));
    expect(norm(ambas).filter((l) => !/promociones/i.test(l))).toEqual(norm(sinPromo));
    expect(soloWa.indexOf("Autorizo recibir promociones por WhatsApp.")).toBe(soloWa.indexOf(constanciaMensaje()) + 1);
    test.info().annotations.push({ type: "mensaje-ambas", description: ambas.join(" ⏎ ") });
  });

  for (const ancho of [360, 1280]) {
    for (const t of ["light", "dark"] as const) {
      test(`criterio 6 y LEG-178 (1): axe y contraste de la leyenda «Promociones (opcional)» a ${ancho} px, tema ${t}`, async ({ page }) => {
        await page.setViewportSize({ width: ancho, height: ancho === 360 ? 740 : 900 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await alResumen(page, "ana@example.com");
        await tema(page, t);
        const leyenda = page.getByTestId("leyenda-promociones");
        await expect(leyenda).toBeVisible();
        await expect(leyenda).toHaveText("Promociones (opcional)");
        const c = await contraste(page, "[data-testid='leyenda-promociones']");
        test.info().annotations.push({ type: `contraste-leyenda-${ancho}-${t}`, description: JSON.stringify(c) });
        expect(c.ratio).toBeGreaterThanOrEqual(4.5);
        const b = t === "dark" ? new AxeBuilder({ page }).include("main") : new AxeBuilder({ page });
        const r = await b.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        expect(r.violations.filter((v) => SERIAS.includes(v.impact ?? "")).map((v) => v.id)).toEqual([]);
        // Con errores visibles de las casillas 1 y 2.
        await boton(page).click({ force: true });
        await expect(page.locator("#e-ter")).toBeVisible();
        const r2 = await b.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        expect(r2.violations.filter((v) => SERIAS.includes(v.impact ?? "")).map((v) => v.id)).toEqual([]);
        await page.getByTestId("casillas-promociones").evaluate((e) => e.scrollIntoView({ block: "start" }));
        await page.evaluate(() => window.scrollBy(0, -90));
        await page.screenshot({ path: `docs/qa/capturas/2026-11-18-qa-023-casillas-${ancho}-${t}.png` });
      });
    }
  }
});
