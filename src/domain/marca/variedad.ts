/** Castillo® es marca registrada de la FNC/Cenicafé: lleva ® donde se nombra la variedad. */
export function nombreDeVariedad(variedad: string): string {
  return /^castillo$/i.test(variedad.trim()) ? "Castillo®" : variedad;
}

export function nombresDeVariedades(variedades: readonly string[]): string {
  return variedades.map(nombreDeVariedad).join(", ");
}
