import { TEXTOS_ENVIO_GRATIS } from "./envio-gratis";
import { ZONA_ESPECIAL, type PlazoEnvio, type ResultadoEnvio, type Zona } from "./tipos";

// Plazos de entrega por zona (data/plazos_envio.csv; docs/legal/microcopy-legal.md §5.6 y §5.8).
// Un plazo máximo publicado obliga (Ley 1480, arts. 29 y 50 lit. h): los textos no se inventan en el código.

const EN_OFICINA = "en la oficina de la transportadora";
const MAXIMO_AL_COTIZAR = "se informa al cotizar; nunca más de 30 días calendario";

export function plazoDeZona(plazos: readonly PlazoEnvio[], zona: Zona): PlazoEnvio | undefined {
  return plazos.find((p) => p.zona === zona);
}

/**
 * Línea bajo el envío en el resumen y en el paso de envío (§5.6). Con tarifa usa la zona del destino;
 * por cotizar (zona 5 o más de 5 kg) usa el estimado de la zona 5 y el máximo «al cotizar». Con envío gratis,
 * el plazo propio de la promoción con cualquier peso (§8.3), que no depende de data/plazos_envio.csv.
 */
export function textoPlazoResumen(plazos: readonly PlazoEnvio[], envio: ResultadoEnvio): string | null {
  if (envio.tipo === "gratis") return TEXTOS_ENVIO_GRATIS.plazoResumen;
  if (envio.tipo === "tarifa") {
    const p = plazoDeZona(plazos, envio.zona);
    return p && p.maximo !== null ? `Entrega estimada: ${p.estimado}. Plazo máximo: ${p.maximo}.` : null;
  }
  const p = plazoDeZona(plazos, ZONA_ESPECIAL);
  return p ? `Entrega estimada: ${p.estimado}, ${EN_OFICINA}. Plazo máximo: ${MAXIMO_AL_COTIZAR}.` : null;
}

/** Texto de cada zona en /envios/ (§5.8). */
export function textoPlazoPagina(p: PlazoEnvio): string {
  return p.maximo === null ? `Estimado: ${p.estimado}, ${EN_OFICINA}. Máximo: ${MAXIMO_AL_COTIZAR}.` : `Estimado: ${p.estimado}. Máximo: ${p.maximo}.`;
}
