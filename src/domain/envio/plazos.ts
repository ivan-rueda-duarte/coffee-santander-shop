import { TEXTOS_ENVIO_GRATIS } from "./envio-gratis";
import { ZONA_ESPECIAL, type PlazoEnvio, type ResultadoEnvio, type Zona } from "./tipos";

// Plazos de entrega por zona (data/plazos_envio.csv; paquete del abogado v1.0, D3 §6 y D5 §6.2–6.3; LEG-143).
// Un plazo máximo publicado obliga (Ley 1480, arts. 29 y 50 lit. h): los textos no se inventan en el código.

export function plazoDeZona(plazos: readonly PlazoEnvio[], zona: Zona): PlazoEnvio | undefined {
  return plazos.find((p) => p.zona === zona);
}

/** Ficha, según la zona elegida (D5 §6.2): «Entrega estimada: {plazo_estimado}. Plazo máximo: {plazo_maximo}.». */
export function textoPlazoFicha(p: PlazoEnvio): string {
  return `Entrega estimada: ${p.estimado}. Plazo máximo: ${p.maximo}.`;
}

/**
 * Línea bajo el envío en el resumen y en el paso de envío (D5 §6.3): «Entrega estimada: {plazo_estimado}. Plazo
 * máximo: {plazo_maximo}, contado desde el día hábil siguiente a tu pago.». Con tarifa usa la zona del destino;
 * por cotizar (zona 5 o más de 5 kg) usa la fila de la zona 5. Con envío gratis, el plazo propio de la promoción
 * con cualquier peso (D3 numeral 13), que no depende de data/plazos_envio.csv.
 */
export function textoPlazoResumen(plazos: readonly PlazoEnvio[], envio: ResultadoEnvio): string | null {
  if (envio.tipo === "gratis") return TEXTOS_ENVIO_GRATIS.plazoResumen;
  const p = plazoDeZona(plazos, envio.tipo === "tarifa" ? envio.zona : ZONA_ESPECIAL);
  return p ? `Entrega estimada: ${p.estimado}. Plazo máximo: ${p.maximo}, contado desde el día hábil siguiente a tu pago.` : null;
}
