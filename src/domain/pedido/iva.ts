// Leyendas de IVA (docs/legal/microcopy-legal.md §1.4). La tarifa sale de data/config.csv (`iva_tarifa`);
// si no hay tarifa publicada se usa la alternativa prudente de LEG-082: «con todos los impuestos incluidos».

/** Ficha (bajo el precio), carrito y resumen (bajo el subtotal). */
export function leyendaIva(ivaTarifa: number | null): string {
  return ivaTarifa === null
    ? "Precios en pesos colombianos con todos los impuestos incluidos."
    : `Precios con IVA del ${ivaTarifa} % incluido (art. 468-1 del Estatuto Tributario).`;
}

/** Sufijo de la línea «Subtotal de productos» del mensaje de WhatsApp. */
export function notaIvaSubtotal(ivaTarifa: number | null): string {
  return ivaTarifa === null ? "" : ` (IVA del ${ivaTarifa} % incluido)`;
}

/** Última línea del pie, después de «© {anio} {razón social}.». */
export function leyendaIvaPie(ivaTarifa: number | null): string {
  return ivaTarifa === null ? "Precios en pesos colombianos con todos los impuestos incluidos." : `Precios en pesos colombianos, con IVA del ${ivaTarifa} % incluido.`;
}

/** /envios/, bajo la tabla de tarifas. */
export function leyendaIvaTarifas(ivaTarifa: number | null): string {
  const impuestos = ivaTarifa === null ? "con todos los impuestos incluidos" : `con IVA del ${ivaTarifa} % incluido`;
  return `Tarifas en pesos colombianos, ${impuestos}. Más de 5 kg, en cualquier zona, se cotiza aparte. Nunca cobramos primero y ajustamos después.`;
}
