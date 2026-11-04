import { normalizar } from "../comun/slug";
import type { Perfil } from "./tipos";

// Nota de cata → familia de perfil de taza. Claves sin tildes y en minúscula.
// TODO(dato): "miel" y "canela" son provisionales (ver docs/PENDIENTES.md).
const EQUIVALENCIAS: Record<string, Perfil> = {
  caramelo: "caramelo",
  miel: "caramelo",
  panela: "panela",
  cacao: "chocolate",
  chocolate: "chocolate",
  "frutos rojos": "frutal",
  cereza: "frutal",
  manzana: "frutal",
  naranja: "citrico",
  limon: "citrico",
  mandarina: "citrico",
  jazmin: "floral",
  floral: "floral",
  nuez: "nueces",
  nueces: "nueces",
  almendra: "nueces",
  especias: "especiado",
  canela: "especiado",
};

export const ETIQUETA_PERFIL: Record<Perfil, string> = {
  chocolate: "Chocolate",
  frutal: "Frutal",
  floral: "Floral",
  caramelo: "Caramelo",
  citrico: "Cítrico",
  especiado: "Especiado",
  panela: "Panela",
  nueces: "Nueces",
};

export function perfilDeNota(nota: string): Perfil | null {
  return EQUIVALENCIAS[normalizar(nota)] ?? null;
}

/** Familias de perfil de una lista de notas, sin repetir y en orden de aparición. */
export function perfilesDeNotas(notas: readonly string[]): Perfil[] {
  const vistos = new Set<Perfil>();
  for (const nota of notas) {
    const p = perfilDeNota(nota);
    if (p) vistos.add(p);
  }
  return [...vistos];
}
