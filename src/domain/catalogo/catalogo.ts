import type { BuscarPrecio } from "../pedido/totales";
import type { ConfigTienda } from "../pedido/tienda";
import type { Cafe, Municipio, Productor, Provincia } from "./tipos";

/** Todo lo que el sitio sabe de comercio: lo que hay en los CSV de data/. */
export interface Catalogo {
  provincias: Provincia[];
  municipios: Municipio[];
  productores: Productor[];
  /** Solo cafés activos. */
  cafes: Cafe[];
  tienda: ConfigTienda;
}

export function buscarCafe(catalogo: Pick<Catalogo, "cafes">, slug: string): Cafe | undefined {
  return catalogo.cafes.find((c) => c.slug === slug);
}

/** Precio vigente de una presentación disponible; undefined si el café o el tamaño ya no se venden. */
export function crearBuscadorDePrecios(catalogo: Pick<Catalogo, "cafes">): BuscarPrecio {
  return (cafeSlug, gramos) =>
    buscarCafe(catalogo, cafeSlug)?.presentaciones.find((p) => p.gramos === gramos && p.disponible)?.precioCop;
}

/** Provincias que tienen al menos un café, en su orden. Las demás se muestran como "Próximamente". */
export function provinciasConCafes(catalogo: Pick<Catalogo, "provincias" | "cafes">): Provincia[] {
  const conCafe = new Set(catalogo.cafes.map((c) => c.provinciaSlug));
  return catalogo.provincias.filter((p) => conCafe.has(p.slug)).sort((a, b) => a.orden - b.orden);
}

export function provinciasProximas(catalogo: Pick<Catalogo, "provincias" | "cafes">): Provincia[] {
  const con = new Set(provinciasConCafes(catalogo).map((p) => p.slug));
  return catalogo.provincias.filter((p) => !con.has(p.slug)).sort((a, b) => a.orden - b.orden);
}
