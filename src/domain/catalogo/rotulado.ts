import type { Cafe } from "./tipos";

// Rotulado sanitario de la ficha (docs/legal/microcopy-legal.md §3; Res. 5109 de 2005, art. 5).

/** Rótulo de la fila: la NSA es una notificación, no un registro. */
export const ROTULO_NOTIFICACION_SANITARIA = "Notificación sanitaria INVIMA";

/**
 * Detalle de la fila: «N.° {nsa} · Titular: {titular} · Fabricante: {fabricante}», omitiendo las partes
 * sin dato. Sin `nsa` no hay fila (nunca «pendiente» ni marcadores).
 */
export function detalleNotificacionSanitaria(cafe: Pick<Cafe, "nsa" | "titularNsa" | "fabricante">): string | null {
  if (!cafe.nsa) return null;
  return [`N.° ${cafe.nsa}`, cafe.titularNsa ? `Titular: ${cafe.titularNsa}` : null, cafe.fabricante ? `Fabricante: ${cafe.fabricante}` : null].filter(Boolean).join(" · ");
}

/** Fila completa, tal como se lee: «Notificación sanitaria INVIMA N.° {nsa} · Titular: … · Fabricante: …». */
export function lineaNotificacionSanitaria(cafe: Pick<Cafe, "nsa" | "titularNsa" | "fabricante">): string | null {
  const detalle = detalleNotificacionSanitaria(cafe);
  return detalle === null ? null : `${ROTULO_NOTIFICACION_SANITARIA} ${detalle}`;
}

/** Fila «FABRICADO POR» o «ENVASADO POR» con la expresión del rótulo; solo con fabricante y expresión. */
export function filaFabricante(cafe: Pick<Cafe, "fabricante" | "fabricanteExpresion">): [string, string] | null {
  return cafe.fabricante && cafe.fabricanteExpresion ? [cafe.fabricanteExpresion, cafe.fabricante] : null;
}
