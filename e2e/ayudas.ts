import type { Page } from "@playwright/test";

/** Un punto (en píxeles de la ventana) sobre un municipio de la provincia que no esté tapado por un pin o una etiqueta. */
export async function puntoEnProvincia(page: Page, slug: string): Promise<{ x: number; y: number }> {
  await page.locator("#mapa svg").first().evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(150);
  const punto = await page.evaluate((s) => {
    const caminos = [...document.querySelectorAll(`g[data-provincia="${s}"] path[data-municipio]`)];
    for (const el of caminos) {
      const r = el.getBoundingClientRect();
      for (let i = 1; i < 8; i++) {
        for (let j = 1; j < 8; j++) {
          const x = r.x + (r.width * i) / 8;
          const y = r.y + (r.height * j) / 8;
          if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue;
          if (document.elementFromPoint(x, y) === el) return { x, y };
        }
      }
    }
    return null;
  }, slug);
  if (!punto) throw new Error(`No hay un punto libre en la provincia ${slug}`);
  return punto;
}

export async function clicEnProvincia(page: Page, slug: string) {
  const { x, y } = await puntoEnProvincia(page, slug);
  await page.mouse.click(x, y);
}

export async function pasarPorProvincia(page: Page, slug: string) {
  const { x, y } = await puntoEnProvincia(page, slug);
  await page.mouse.move(x, y);
}
