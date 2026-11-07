import { readFileSync } from "node:fs";
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

/** Valor de una clave de data/config.csv (sin comillas), tal como lo lee el sitio. */
export function leerConfig(clave: string): string {
  const fila = readFileSync("data/config.csv", "utf8").split("\n").find((l) => l.startsWith(`${clave},`));
  const valor = fila?.slice(clave.length + 1).trim() ?? "";
  return valor.startsWith('"') && valor.endsWith('"') ? valor.slice(1, -1) : valor;
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** "2026-11-06" → "6 de noviembre de 2026" (igual que src/domain/comun/fecha.ts). */
export function fechaEnLetras(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

/** Textos exactos de las casillas (microcopy §4.3 y §5.1) con versión y fecha de data/config.csv. */
export function textosCasillas() {
  const politica = `Política de Tratamiento de Datos versión ${leerConfig("version_politica_datos")} del ${fechaEnLetras(leerConfig("fecha_politica_datos"))}`;
  const terminos = `Términos y condiciones versión ${leerConfig("version_terminos")} del ${fechaEnLetras(leerConfig("fecha_terminos"))}`;
  return {
    enlacePolitica: politica,
    enlaceTerminos: terminos,
    autorizacion: `Autorizo a ${leerConfig("nombre_tienda")} a tratar mis datos personales para gestionar mi pedido, conforme a la ${politica}, que leí.`,
    terminos: `Leí y acepto los ${terminos}.`,
  };
}

/** Microcopy §5.3 (paquete legal v1): aviso de retracto del resumen y de /envios/. */
export const AVISO_RETRACTO =
  "Puedes retractarte dentro de los 5 días hábiles siguientes a la entrega, salvo si el empaque está abierto. El transporte de la devolución corre por tu cuenta. Te devolvemos el dinero en máximo 15 días calendario, por el medio de pago que prefieras.";
