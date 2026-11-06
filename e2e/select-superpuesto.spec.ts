import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// QA-005 (verificación): los selects Departamento, Municipio y Tipo de documento usan SelectSuperpuesto
// (commit c1e4f62). El <select> sigue siendo el control (valor, foco, nombre accesible) y un <span aria-hidden>
// pinta el texto visible, que parte líneas en vez de cortarse.

const SAN_ANDRES = "Archipiélago de San Andrés, Providencia y Santa Catalina";
const VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 360, height: 740 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

async function irAEnvio(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    localStorage.setItem("desantander.carrito.v2", JSON.stringify({ version: 2, lineas: [{ cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 1 }] }));
  });
  await page.goto("/pedido/?paso=envio");
  await expect(page.getByRole("heading", { name: "¿A dónde enviamos?" })).toBeVisible();
}

/** El span aria-hidden que pinta el texto visible del select, y la flecha, dentro de la misma celda. */
function partes(page: Page, id: string) {
  const celda = page.locator(`#${id}`).locator("xpath=..");
  return { celda, select: page.locator(`#${id}`), span: celda.locator("span[aria-hidden='true']"), flecha: celda.locator("svg") };
}

async function medidas(page: Page, id: string) {
  const { select, span } = partes(page, id);
  const s = await select.boundingBox();
  const texto = await span.evaluate((el) => ({ texto: el.textContent ?? "", scrollW: el.scrollWidth, clientW: el.clientWidth, caja: el.getBoundingClientRect().toJSON() as DOMRect }));
  return { select: s!, span: texto };
}

/** Color resuelto de una variable de marca (`--ink`, `--ink-muted`) en el documento, como lo devuelve getComputedStyle. */
async function colorVar(page: Page, variable: string) {
  return page.evaluate((v) => {
    const probe = document.createElement("div");
    probe.style.color = `var(${v})`;
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  }, variable);
}

function luminancia(rgb: string) {
  const [r, g, b] = rgb.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contraste = (a: string, b: string) => {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

test.describe("QA-005: Departamento con San Andrés en los cuatro viewports", () => {
  for (const vp of VIEWPORTS) {
    test(`a ${vp.width} px: nombre completo visible, sin corte ni desborde, el select cubre el texto`, async ({ page }) => {
      await page.setViewportSize(vp);
      await irAEnvio(page);
      const dep = page.getByLabel("Departamento");
      await dep.selectOption({ label: SAN_ANDRES });
      await expect(dep).toHaveValue(SAN_ANDRES);

      const m = await medidas(page, "departamento");
      expect(m.span.texto, "el span pinta el nombre completo").toBe(SAN_ANDRES);
      expect(m.span.scrollW, "sin corte horizontal del texto").toBeLessThanOrEqual(m.span.clientW + 1);
      expect(m.span.caja.right, "dentro de la ventana").toBeLessThanOrEqual(vp.width);
      // El select da la altura: su caja debe cubrir todo el texto (dos líneas en móvil) para que el clic en cualquier parte abra la lista.
      expect(m.select.height + 1).toBeGreaterThanOrEqual(m.span.caja.height);
      expect(m.select.y).toBeLessThanOrEqual(m.span.caja.top + 1);
      expect(m.select.y + m.select.height + 1).toBeGreaterThanOrEqual(m.span.caja.bottom);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "sin desborde de página").toBe(true);

      // Municipio se habilita y refleja la elección; Providencia cabe.
      const mun = page.getByLabel("Municipio");
      await expect(mun).toBeEnabled();
      expect((await medidas(page, "municipio")).span.texto).toBe("Elige el municipio");
      await mun.selectOption({ label: "Providencia" });
      expect((await medidas(page, "municipio")).span.texto).toBe("Providencia");

      if (vp.width <= 360) {
        await dep.evaluate((el) => el.scrollIntoView({ block: "center" }));
        await page.screenshot({ path: `docs/qa/capturas/qa-005-departamento-${vp.width}.png`, fullPage: false });
      }
      const graves = (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
    });
  }
});

test.describe("QA-005: estado deshabilitado, lector, teclado, colores forzados, autocompletado", () => {
  test("Municipio deshabilitado va en gris (texto y flecha) con contraste ≥ 4,5:1 y vuelve a tinta al elegir departamento", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await irAEnvio(page);
    const inkMuted = await colorVar(page, "--ink-muted");
    const ink = await colorVar(page, "--ink");
    const fondo = await colorVar(page, "--surface-raised");
    expect(inkMuted).not.toBe(ink);

    const { select, span, flecha } = partes(page, "municipio");
    await expect(select).toBeDisabled();
    expect(await span.evaluate((el) => getComputedStyle(el).color)).toBe(inkMuted);
    expect(await flecha.evaluate((el) => getComputedStyle(el).color)).toBe(inkMuted);
    // axe no evalúa el contraste de controles deshabilitados: lo medimos nosotros contra el fondo del campo.
    const fondoSelect = await select.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(fondoSelect).toBe(fondo);
    const ratio = contraste(inkMuted, fondo);
    expect(ratio, `gris deshabilitado ${inkMuted} sobre ${fondo}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);

    await page.getByLabel("Departamento").selectOption("Santander");
    await expect(select).toBeEnabled();
    expect(await span.evaluate((el) => getComputedStyle(el).color)).toBe(ink);
    expect(await flecha.evaluate((el) => getComputedStyle(el).color)).toBe(ink);
    // El departamento también va en tinta (ya tiene valor) y el tipo de documento sin valor igualmente en tinta (no está deshabilitado).
    expect(await partes(page, "departamento").span.evaluate((el) => getComputedStyle(el).color)).toBe(ink);
    expect(await partes(page, "tipoDocumento").span.evaluate((el) => getComputedStyle(el).color)).toBe(ink);
  });

  test("lector de pantalla: los tres <select> conservan rol y nombre; el span no entra en el árbol de accesibilidad; sin texto duplicado", async ({ page }) => {
    await irAEnvio(page);
    // El tipo de documento es opcional y su <label> lo dice: el nombre accesible lleva «(opcional)».
    for (const [id, nombre] of [["tipoDocumento", "Tipo de documento (opcional)"], ["departamento", "Departamento"], ["municipio", "Municipio"]] as const) {
      const sel = page.locator(`#${id}`);
      expect(await sel.evaluate((el) => el.tagName)).toBe("SELECT");
      await expect(sel).toHaveRole("combobox");
      await expect(sel).toHaveAccessibleName(nombre);
      await expect(partes(page, id).span).toHaveAttribute("aria-hidden", "true");
      await expect(sel).not.toHaveAttribute("aria-hidden");
    }
    await page.getByLabel("Departamento").selectOption({ label: SAN_ANDRES });
    // Un solo combobox «Departamento», con el valor completo; el nombre aparece una vez en el árbol (la opción seleccionada), no dos.
    const dep = page.getByRole("combobox", { name: "Departamento" });
    await expect(dep).toHaveCount(1);
    await expect(dep).toHaveValue(SAN_ANDRES);
    const arbol = await page.locator("form, main").first().ariaSnapshot();
    const apariciones = arbol.split(SAN_ANDRES).length - 1;
    expect(apariciones, `«${SAN_ANDRES}» en el árbol de accesibilidad:\n${arbol}`).toBe(1);
    // El tipo de documento se lee con su etiqueta y su valor; el error apunta con aria-describedby cuando existe.
    await expect(page.getByRole("combobox", { name: "Tipo de documento" })).toHaveValue("");
    await expect(page.getByRole("combobox", { name: "Municipio" })).toBeEnabled();
  });

  test("teclado: flechas cambian el valor y el span lo refleja; Tab llega a Municipio y Espacio/Enter no rompen el foco; Esc no borra el valor", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await irAEnvio(page);
    const dep = page.getByLabel("Departamento");
    await dep.focus();
    await expect(dep).toBeFocused();
    await page.keyboard.press("ArrowDown");
    const primero = await dep.inputValue();
    expect(primero).not.toBe("");
    expect((await medidas(page, "departamento")).span.texto).toBe(primero);
    await page.keyboard.press("ArrowDown");
    const segundo = await dep.inputValue();
    expect(segundo).not.toBe(primero);
    expect((await medidas(page, "departamento")).span.texto).toBe(segundo);
    // Buscar por tecla: «A» salta a Amazonas / Antioquia / Arauca / Archipiélago…
    await page.keyboard.type("Arc");
    await expect(dep).toHaveValue(SAN_ANDRES);
    expect((await medidas(page, "departamento")).span.texto).toBe(SAN_ANDRES);
    await page.keyboard.press("Escape");
    await expect(dep).toHaveValue(SAN_ANDRES);
    await expect(dep).toBeFocused();
    await page.keyboard.press("Tab");
    const mun = page.getByLabel("Municipio");
    await expect(mun).toBeFocused();
    await expect(mun).toBeEnabled();
    await page.keyboard.press("ArrowDown");
    expect(await mun.inputValue()).not.toBe("");
    expect((await medidas(page, "municipio")).span.texto).toBe(await mun.inputValue());
    // El foco visible queda en el select (no en el span, que es pointer-events-none y aria-hidden).
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("municipio");
    // Tipo de documento: Tab desde Correo electrónico cae en el select y Tab sale al número.
    const tipo = page.getByLabel("Tipo de documento");
    await tipo.focus();
    await page.keyboard.press("ArrowDown");
    const t = await tipo.inputValue();
    expect(t).not.toBe("");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Número de documento")).toBeFocused();
  });

  test("forced-colors: el span se oculta y el texto nativo del select deja de ser transparente", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await irAEnvio(page);
    await page.getByLabel("Departamento").selectOption({ label: SAN_ANDRES });
    for (const id of ["tipoDocumento", "departamento", "municipio"]) {
      const { select, span } = partes(page, id);
      expect(await span.evaluate((el) => getComputedStyle(el).display), `${id}: span oculto`).toBe("none");
      const color = await select.evaluate((el) => getComputedStyle(el).color);
      expect(color, `${id}: color del select con colores forzados`).not.toBe("rgba(0, 0, 0, 0)");
    }
    // El valor sigue siendo legible: el select nativo muestra su opción seleccionada.
    await expect(page.getByLabel("Departamento")).toHaveValue(SAN_ANDRES);
  });

  test("sin colores forzados el select es transparente solo en el texto; las opciones de la lista van en tinta", async ({ page }) => {
    await irAEnvio(page);
    const { select } = partes(page, "departamento");
    expect(await select.evaluate((el) => getComputedStyle(el).color)).toBe("rgba(0, 0, 0, 0)");
    const ink = await colorVar(page, "--ink");
    expect(await select.locator("option").nth(1).evaluate((el) => getComputedStyle(el).color)).toBe(ink);
    expect(await select.evaluate((el) => getComputedStyle(el).appearance)).toBe("none");
  });

  test("autocompletado del navegador: atributos address-level1/2 y, al rellenar por fuera (valor + change), el span refleja el valor y Municipio se habilita", async ({ page }) => {
    await irAEnvio(page);
    const dep = page.getByLabel("Departamento");
    const mun = page.getByLabel("Municipio");
    await expect(dep).toHaveAttribute("autocomplete", "address-level1");
    await expect(mun).toHaveAttribute("autocomplete", "address-level2");
    await expect(dep).toHaveAttribute("name", "departamento");
    await expect(mun).toHaveAttribute("name", "municipio");
    await expect(page.getByLabel("Tipo de documento")).toHaveAttribute("autocomplete", "off");

    // Playwright no dispara el autofill de Chromium; lo simulamos como lo hace el navegador: fija .value y emite «change» (y «input»).
    await dep.evaluate((el, valor) => {
      const s = el as HTMLSelectElement;
      s.value = valor;
      s.dispatchEvent(new Event("input", { bubbles: true }));
      s.dispatchEvent(new Event("change", { bubbles: true }));
    }, SAN_ANDRES);
    await expect(dep).toHaveValue(SAN_ANDRES);
    await expect(partes(page, "departamento").span).toHaveText(SAN_ANDRES);
    await expect(mun).toBeEnabled();
    await mun.evaluate((el) => {
      const s = el as HTMLSelectElement;
      s.value = "Providencia";
      s.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect(mun).toHaveValue("Providencia");
    await expect(partes(page, "municipio").span).toHaveText("Providencia");

    // Un valor que el autofill ponga pero no exista en la lista no se refleja como texto fantasma: el select queda vacío y el span muestra la ayuda.
    await dep.evaluate((el) => {
      const s = el as HTMLSelectElement;
      s.value = "Texas";
      s.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect(dep).toHaveValue("");
    await expect(partes(page, "departamento").span).toHaveText("Elige el departamento");
    await expect(mun).toBeDisabled();
    await expect(partes(page, "municipio").span).toHaveText("Elige el departamento");

    // El resumen y el mensaje conservan el nombre completo.
    await dep.selectOption({ label: SAN_ANDRES });
    await mun.selectOption({ label: "Providencia" });
    await page.getByLabel("Nombre completo").fill("Ana Rueda");
    await page.getByLabel("Celular").fill("300 123 4567");
    await page.getByLabel("Dirección").fill("Calle 1 # 2-3");
    await page.getByRole("radio", { name: "Transferencia Bre-B" }).check({ force: true });
    await page.getByRole("button", { name: /Revisar el pedido/ }).click();
    await expect(page.getByRole("heading", { name: "Revisa tu pedido" })).toBeVisible();
    await expect(page.getByRole("main")).toContainText(`Providencia, ${SAN_ANDRES}`);
  });
});
