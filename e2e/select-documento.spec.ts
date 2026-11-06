import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// QA-002: el tipo de documento (PPT) y el select «Municipio» no se cortan en pantallas angostas.

async function irAEnvio(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }] }));
  });
  await page.goto("/pedido/?paso=envio");
  await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
}

for (const ancho of [320, 360, 700]) {
  test(`PPT a ${ancho} px: texto completo visible, sin desborde, axe limpio`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: 740 });
    await irAEnvio(page);
    const sel = page.getByLabel("Tipo de documento");
    await sel.selectOption("PPT");
    await expect(sel).toHaveValue("PPT");
    const caja = await sel.evaluate((el) => {
      const celda = el.parentElement!;
      const visible = [...celda.querySelectorAll("[aria-hidden='true']")].find((n) => /Permiso por Protección Temporal/.test(n.textContent ?? ""));
      const r = (visible ?? el).getBoundingClientRect();
      return { texto: visible?.textContent ?? null, ancho: r.width, scrollW: visible ? (visible as HTMLElement).scrollWidth : 0, clientW: visible ? (visible as HTMLElement).clientWidth : 0, derecha: r.right, alto: r.height };
    });
    expect(caja.texto, "texto completo pintado").toContain("Permiso por Protección Temporal (PPT)");
    expect(caja.scrollW).toBeLessThanOrEqual(caja.clientW + 1);
    expect(caja.derecha).toBeLessThanOrEqual(ancho);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (ancho <= 360) await page.screenshot({ path: `docs/qa/capturas/ppt-${ancho}.png`, fullPage: false });
    const graves = (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => v.id)).toEqual([]);
  });
}

test("PPT a 320 px: teclado (Tab, flechas, Enter) cambia la selección", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await irAEnvio(page);
  const sel = page.getByLabel("Tipo de documento");
  await sel.focus();
  await expect(sel).toBeFocused();
  await page.keyboard.press("ArrowDown");
  const primero = await sel.inputValue();
  expect(primero).not.toBe("");
  await page.keyboard.press("ArrowDown");
  expect(await sel.inputValue()).not.toBe(primero);
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Número de documento")).toBeFocused();
});

/** Mide si la opción seleccionada de un `<select>` nativo cabe en su caja (o si hay un span propio que la pinta). */
async function medirSelect(sel: ReturnType<Page["getByLabel"]>) {
  return sel.evaluate((el) => {
    const s = el as HTMLSelectElement;
    const celda = s.parentElement!;
    const visible = [...celda.querySelectorAll("[aria-hidden='true']")].find((n) => (n.textContent ?? "").length > 3) as HTMLElement | undefined;
    const c = document.createElement("canvas").getContext("2d")!;
    const cs = getComputedStyle(s);
    c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const texto = s.selectedOptions[0]?.textContent ?? "";
    // El select nativo reserva ~30 px para la flecha: sin span propio, el texto se corta antes del borde.
    const disponible = s.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 30;
    return { conSpan: visible !== undefined, texto, necesita: Math.round(c.measureText(texto).width), disponible: Math.round(disponible), anchoSelect: s.clientWidth };
  });
}

for (const ancho of [320, 360]) {
  test(`QA-004: select Municipio a ${ancho} px sin departamento: «Elige el departamento» no se corta`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: 740 });
    await irAEnvio(page);
    const sel = page.getByLabel("Municipio");
    await expect(sel).toBeDisabled();
    const m = await medirSelect(sel);
    console.log(JSON.stringify(m));
    expect(m.texto).toBe("Elige el departamento");
    expect(m.conSpan || m.necesita <= m.disponible, `«${m.texto}» necesita ${m.necesita}px y hay ${m.disponible}px`).toBe(true);
  });

  test(`QA-004: select Municipio a ${ancho} px con el nombre más largo del país elegido no se corta`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: 740 });
    await irAEnvio(page);
    await page.getByLabel("Departamento").selectOption("Cundinamarca");
    const sel = page.getByLabel("Municipio");
    await expect(sel).toBeEnabled();
    expect(await medirSelect(sel).then((m) => m.texto)).toBe("Elige el municipio");
    // Nombre de municipio más largo de src/data/divipola.json (27 caracteres).
    await sel.selectOption("Villa de San Diego de Ubaté");
    const m = await medirSelect(sel);
    console.log(JSON.stringify(m));
    expect(m.conSpan || m.necesita <= m.disponible, `«${m.texto}» necesita ${m.necesita}px y hay ${m.disponible}px`).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const graves = (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => v.id)).toEqual([]);
  });

  test(`QA-005: select Departamento a ${ancho} px con el nombre más largo del país (San Andrés) no se corta`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: 740 });
    await irAEnvio(page);
    const sel = page.getByLabel("Departamento");
    // Nombre de departamento más largo de src/data/divipola.json (56 caracteres).
    await sel.selectOption({ label: "Archipiélago de San Andrés, Providencia y Santa Catalina" });
    const m = await medirSelect(sel);
    console.log(JSON.stringify(m));
    await sel.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.screenshot({ path: `docs/qa/capturas/qa-005-departamento-${ancho}.png`, fullPage: false });
    expect(m.conSpan || m.necesita <= m.disponible, `«${m.texto}» necesita ${m.necesita}px y hay ${m.disponible}px`).toBe(true);
  });
}
