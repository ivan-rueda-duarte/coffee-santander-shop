// Leyendas de IVA (docs/legal/microcopy-legal.md §1.4). La tarifa sale de data/config.csv (`iva_tarifa`);
// si no hay tarifa publicada se usa la alternativa prudente de LEG-082: «con todos los impuestos incluidos».

/** Ficha y tarjeta (bajo el precio), carrito y resumen (bajo el subtotal). Texto exacto de D5 §6.2. */
export function leyendaIva(ivaTarifa: number | null): string {
  return ivaTarifa === null ? "Precios en pesos colombianos con todos los impuestos incluidos." : `Precio con IVA del ${ivaTarifa} % incluido.`;
}

/** Sufijo de la línea «Subtotal de productos» del mensaje de WhatsApp. */
export function notaIvaSubtotal(ivaTarifa: number | null): string {
  return ivaTarifa === null ? "" : ` (IVA del ${ivaTarifa} % incluido)`;
}

/** Última línea del pie, después de «© {anio} {razón social}.». */
export function leyendaIvaPie(ivaTarifa: number | null): string {
  return ivaTarifa === null ? "Precios en pesos colombianos con todos los impuestos incluidos." : `Precios en pesos colombianos, con IVA del ${ivaTarifa} % incluido.`;
}

/**
 * /envios/, bajo la tabla de tarifas. `salvedad` es la frase que el envío gratis por comunas agrega después de
 * «se cotiza aparte.» (microcopy §8.5), solo con la promoción vigente.
 */
export function leyendaIvaTarifas(ivaTarifa: number | null, salvedad = ""): string {
  const impuestos = ivaTarifa === null ? "con todos los impuestos incluidos" : `con IVA del ${ivaTarifa} % incluido`;
  return `Tarifas en pesos colombianos, ${impuestos}. Más de 5 kg, en cualquier zona, se cotiza aparte.${salvedad} Nunca cobramos primero y ajustamos después.`;
}
