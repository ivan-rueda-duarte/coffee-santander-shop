import { buscarCafe } from "@/domain/catalogo/catalogo";
import type { Cafe, Municipio, Productor, Provincia } from "@/domain/catalogo/tipos";
import type { CatalogoRepositorio, ContenidoCafe, ContenidoRepositorio } from "../puertos";

export interface FichaCafe {
  cafe: Cafe;
  municipio: Municipio;
  provincia: Provincia | null;
  productor: Productor | null;
  /** Otros cafés de la misma provincia. */
  relacionados: Cafe[];
  /** null si Sanity no tiene contenido para este café: la ficha se muestra solo con datos técnicos. */
  contenido: ContenidoCafe | null;
}

export async function obtenerFichaCafe(
  catalogoRepo: CatalogoRepositorio,
  contenidoRepo: ContenidoRepositorio,
  slug: string,
): Promise<FichaCafe | null> {
  const catalogo = await catalogoRepo.obtener();
  const cafe = buscarCafe(catalogo, slug);
  if (!cafe) return null;
  const municipio = catalogo.municipios.find((m) => m.slug === cafe.municipioSlug);
  if (!municipio) return null;
  return {
    cafe,
    municipio,
    provincia: catalogo.provincias.find((p) => p.slug === cafe.provinciaSlug) ?? null,
    productor: catalogo.productores.find((p) => p.slug === cafe.productorSlug) ?? null,
    relacionados: cafe.provinciaSlug ? catalogo.cafes.filter((c) => c.slug !== slug && c.provinciaSlug === cafe.provinciaSlug) : [],
    contenido: await contenidoRepo.cafe(slug),
  };
}
