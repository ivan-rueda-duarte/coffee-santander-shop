// Pesos colombianos sin decimales y con punto de miles: 25000 → "$25.000".
export function formatearCOP(valor: number): string {
  if (!Number.isFinite(valor)) throw new RangeError("El monto debe ser un número finito");
  const entero = Math.round(Math.abs(valor));
  const conPuntos = String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${valor < 0 ? "-" : ""}$${conPuntos}`;
}

// Miles con punto, sin símbolo: 1800 → "1.800" (altitudes, cantidades).
export function formatearMiles(valor: number): string {
  return formatearCOP(valor).replace("$", "");
}
