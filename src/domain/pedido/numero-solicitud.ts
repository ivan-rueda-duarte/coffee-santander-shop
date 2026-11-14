// Número de la solicitud de compra del mensaje de WhatsApp (D5 §6.4, «N.° DS-{numero}»; P39 = a, LEG-150).
// Se genera en el navegador al preparar el pedido: sin servidor, no consecutivo y sin datos personales.
// No se guarda en el navegador, la URL ni la analítica: solo va en el mensaje que el cliente envía.

/** 32 símbolos sin 0/O ni 1/I para que se lean bien por chat. 256 / 32 = 8: cada byte da un símbolo sin sesgo. */
export const ALFABETO_SUFIJO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const LARGO_SUFIJO = 4;
const FORMATO = /^DS-\d{6}-\d{4}-[A-Z0-9]{4}$/;

function partesEnColombia(ahora: Date): Record<"year" | "month" | "day" | "hour" | "minute", string> {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(ahora);
  const valor = (t: string) => partes.find((p) => p.type === t)?.value ?? "00";
  return { year: valor("year"), month: valor("month"), day: valor("day"), hour: valor("hour"), minute: valor("minute") };
}

/**
 * «DS-AAMMDD-HHMM-XXXX»: fecha y hora de Colombia más cuatro símbolos al azar. `aleatorios` son al menos
 * cuatro bytes de `crypto.getRandomValues` (los pasa quien llama: el dominio no toca APIs del navegador).
 */
export function generarNumeroSolicitud(ahora: Date, aleatorios: Uint8Array): string {
  if (aleatorios.length < LARGO_SUFIJO) throw new RangeError(`Se necesitan ${LARGO_SUFIJO} bytes aleatorios`);
  const p = partesEnColombia(ahora);
  const sufijo = Array.from(aleatorios.slice(0, LARGO_SUFIJO), (b) => ALFABETO_SUFIJO[b % ALFABETO_SUFIJO.length]).join("");
  return `DS-${p.year}${p.month}${p.day}-${p.hour}${p.minute}-${sufijo}`;
}

export function esNumeroSolicitud(texto: string): boolean {
  return FORMATO.test(texto);
}
