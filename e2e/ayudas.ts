import { readFileSync } from "node:fs";
import { expect, type Page } from "@playwright/test";

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

/** Hoy en Colombia (ISO yyyy-mm-dd), igual que src/infrastructure/entorno.ts: el build decide la vigencia con esta fecha. */
export function hoyEnColombia(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/**
 * Estado del envío gratis por comunas en el build que sirve out/, leído de data/config.csv (microcopy §8.6.1):
 * - apagada: sin `envio_gratis_desde`; programada: `desde` en el futuro;
 * - vigente: empezó y sin `envio_gratis_terminada`. Antes del 2026-11-17 solo se prueba con
 *   `ENVIO_GRATIS_PRUEBA=si FECHA_BUILD_PRUEBA=2026-11-17` (build de prueba, nunca se despliega);
 * - terminada: con `envio_gratis_terminada`; `avisoVisible` si hoy ≤ terminada + 30 días.
 */
export function estadoEnvioGratisE2E(): { tipo: "apagada" | "programada" | "vigente" | "terminada"; desde: string; terminada: string; avisoVisible: boolean; prueba: boolean } {
  const desde = leerConfig("envio_gratis_desde");
  const terminada = leerConfig("envio_gratis_terminada");
  const prueba = process.env.ENVIO_GRATIS_PRUEBA === "si";
  // Igual que fechaDelBuild (src/infrastructure/entorno.ts): en un build de prueba, FECHA_BUILD_PRUEBA simula el día.
  const hoy = prueba && process.env.FECHA_BUILD_PRUEBA ? process.env.FECHA_BUILD_PRUEBA : hoyEnColombia();
  const dias = (a: string, b: string) => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000;
  const tipo = !desde ? "apagada" : terminada ? "terminada" : hoy < desde ? "programada" : "vigente";
  return { tipo, desde, terminada, avisoVisible: tipo === "terminada" && dias(terminada, hoy) <= 30, prueba };
}

/** Textos exactos de las cuatro casillas (D2 «Textos de las casillas», D5 §6.3) con versión y fecha de data/config.csv. */
export function textosCasillas() {
  const razon = leerConfig("razon_social");
  const politica = `Política de tratamiento de datos versión ${leerConfig("version_politica_datos")} del ${fechaEnLetras(leerConfig("fecha_politica_datos"))}`;
  const terminos = `Términos y condiciones versión ${leerConfig("version_terminos")} del ${fechaEnLetras(leerConfig("fecha_terminos"))}`;
  return {
    enlacePolitica: politica,
    enlaceTerminos: terminos,
    autorizacion: `Autorizo a ${razon} a tratar mis datos personales para gestionar mi pedido: confirmarlo, cobrarlo, coordinar la entrega con la transportadora o el mensajero y emitir la factura. Entiendo que el pedido se envía por WhatsApp (Meta) y que algunos servicios pueden tratar mis datos fuera de Colombia. Leí la ${politica}.`,
    terminos: `Leí y acepto los ${terminos}.`,
    promoWhatsapp: `Quiero recibir novedades y promociones de ${razon} por WhatsApp, de lunes a viernes de 7:00 a. m. a 7:00 p. m. y sábados de 8:00 a. m. a 3:00 p. m. Puedo cancelarlo cuando quiera escribiendo «BAJA» al mismo chat. Es opcional y no afecta mi pedido.`,
    promoCorreo: `Quiero recibir novedades y promociones de ${razon} por correo electrónico. Puedo cancelarlo cuando quiera con el enlace de cada correo o escribiendo a ${leerConfig("correo_contacto")}. Es opcional y no afecta mi pedido.`,
  };
}

/** D5 §6.4: constancia del mensaje de WhatsApp con versiones y fecha de data/config.csv. */
export function constanciaMensaje(): string {
  return `Acepto los Términos v${leerConfig("version_terminos")} y autorizo el tratamiento de mis datos según la Política v${leerConfig("version_politica_datos")} del ${fechaEnLetras(leerConfig("fecha_politica_datos"))}.`;
}

/** D5 §6.3: aviso de retracto del resumen. */
export const AVISO_RETRACTO =
  "Puedes retractarte dentro de los 5 días hábiles siguientes a la entrega, salvo si el empaque está abierto o el sello roto. El transporte de la devolución corre por tu cuenta. Te devolvemos el dinero en máximo 15 días calendario, por el medio que prefieras.";

/** D5 §6.3: texto fijo de pago en el formulario (ya no hay campo de forma de pago, LEG-144). */
export const TEXTO_PAGO_FORMULARIO = "Pagas por transferencia bancaria o por Bre-B después de aceptar el total por WhatsApp. En esta página no se paga.";

/**
 * A1 (LEG-172): «Enviar por WhatsApp» del resumen abre wa.me con window.open en el mismo clic. Pulsa el botón, espera
 * la pestaña nueva (sin red: wa.me se responde en local) y devuelve su URL. Falla si no se abre ninguna pestaña.
 */
export async function enviarPorWhatsapp(page: Page): Promise<string> {
  await page.context().route(/^https:\/\/(api\.)?wa\.me\//, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<title>WhatsApp</title>" }));
  const [popup] = await Promise.all([page.waitForEvent("popup"), page.getByRole("button", { name: "Enviar por WhatsApp" }).click()]);
  await popup.waitForURL(/wa\.me\//);
  const url = popup.url();
  await popup.close();
  return url;
}

/**
 * Microcopy v1.12 §9.5 regla 4 y §9.6 (LEG-188): tras un clic válido el pedido se vacía y /pedido/ muestra «Mensaje
 * listo». «Recuperar el pedido» devuelve las mismas líneas y el paso en que estaba (normalmente el Resumen), con la
 * copia del mensaje vigente (mismo DS) mientras nada cambie. Para las pruebas que siguen trabajando en el Resumen.
 */
export async function recuperarPedido(page: Page): Promise<void> {
  await page.getByTestId("pedido-enviado").getByRole("button", { name: "Recuperar el pedido" }).click();
  await expect(page.getByTestId("pedido-enviado")).toHaveCount(0);
}

/** Cuenta las pestañas que abre la página mientras corre `accion` (para probar que sin casillas no se abre nada). */
export async function pestanasAbiertas(page: Page, accion: () => Promise<void>): Promise<number> {
  let n = 0;
  const contar = () => void n++;
  page.on("popup", contar);
  await accion();
  await page.waitForTimeout(300);
  page.off("popup", contar);
  return n;
}
