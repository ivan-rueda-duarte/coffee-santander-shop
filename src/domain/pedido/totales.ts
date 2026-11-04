import type { LineaCarrito } from "./carrito";

export interface LineaConPrecio extends LineaCarrito {
  precioUnitarioCop: number;
  totalCop: number;
}

export interface Totales {
  bolsas: number;
  subtotalCop: number;
  lineas: LineaConPrecio[];
  /** Líneas cuyo precio no se encontró (café o presentación retirados). No suman al subtotal. */
  sinPrecio: LineaCarrito[];
}

/** Devuelve el precio de una presentación, o undefined si ya no existe. */
export type BuscarPrecio = (cafeSlug: string, gramos: number) => number | undefined;

export function calcularTotales(lineas: readonly LineaCarrito[], buscarPrecio: BuscarPrecio): Totales {
  const conPrecio: LineaConPrecio[] = [];
  const sinPrecio: LineaCarrito[] = [];
  for (const l of lineas) {
    const precio = buscarPrecio(l.cafeSlug, l.gramos);
    if (precio === undefined) sinPrecio.push(l);
    else conPrecio.push({ ...l, precioUnitarioCop: precio, totalCop: precio * l.cantidad });
  }
  return {
    bolsas: conPrecio.reduce((suma, l) => suma + l.cantidad, 0),
    subtotalCop: conPrecio.reduce((suma, l) => suma + l.totalCop, 0),
    lineas: conPrecio,
    sinPrecio,
  };
}

export function etiquetaBolsas(n: number): string {
  return `${n} ${n === 1 ? "bolsa" : "bolsas"}`;
}
