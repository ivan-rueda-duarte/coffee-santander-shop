import { slugify } from "../comun/slug";
import {
  FILTROS_VACIOS,
  ORDENES,
  UMBRALES_SCA,
  type FiltrosCatalogo,
  type Orden,
  type Rango,
} from "./filtros";
import { GRUPOS_TUESTE, PERFILES, PROCESOS } from "./tipos";

export type EntradaUrl = URLSearchParams | Record<string, string | string[] | undefined>;

/** Valores que existen en el catálogo; lo demás se ignora. Si falta una lista, no se valida esa dimensión. */
export interface OpcionesValidas {
  provincias?: readonly string[];
  municipios?: readonly string[];
  productores?: readonly string[];
  variedades?: readonly string[];
}

function leer(entrada: EntradaUrl, clave: string): string | undefined {
  if (entrada instanceof URLSearchParams) return entrada.get(clave) ?? undefined;
  const v = entrada[clave];
  return Array.isArray(v) ? v[0] : v;
}

function lista(texto: string | undefined): string[] {
  if (!texto) return [];
  return [...new Set(texto.split(",").map((s) => s.trim()).filter(Boolean))];
}

function listaDe<T extends string>(texto: string | undefined, permitidos: readonly T[]): T[] {
  return lista(texto).filter((v): v is T => (permitidos as readonly string[]).includes(v));
}

function listaValidada(texto: string | undefined, validos?: readonly string[]): string[] {
  const valores = lista(texto);
  return validos ? valores.filter((v) => validos.includes(v)) : valores;
}

function rango(texto: string | undefined): Rango | null {
  const m = texto?.match(/^(\d{1,7})-(\d{1,7})$/);
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  return a <= b ? [a, b] : [b, a];
}

/**
 * Lee los filtros de la URL. Valores desconocidos se ignoran (como en la v1),
 * y el formato antiguo `?provincia=guanenta` es un caso particular de `provincia=a,b`.
 * Los parámetros viejos (`marca`) no se leen.
 */
export function parseFiltros(entrada: EntradaUrl, opciones: OpcionesValidas = {}): FiltrosCatalogo {
  const sca = Number(leer(entrada, "sca"));
  const orden = leer(entrada, "orden");
  return {
    provincias: listaValidada(leer(entrada, "provincia"), opciones.provincias),
    municipios: listaValidada(leer(entrada, "municipio"), opciones.municipios),
    productores: listaValidada(leer(entrada, "productor"), opciones.productores),
    procesos: listaDe(leer(entrada, "proceso"), PROCESOS),
    variedades: listaValidada(leer(entrada, "variedad")?.split(",").map(slugify).join(","), opciones.variedades),
    tuestes: listaDe(leer(entrada, "tueste"), GRUPOS_TUESTE),
    perfiles: listaDe(leer(entrada, "perfil"), PERFILES),
    altitud: rango(leer(entrada, "altitud")),
    scaMinimo: (UMBRALES_SCA as readonly number[]).includes(sca) ? sca : null,
    precio: rango(leer(entrada, "precio")),
    soloDisponibles: leer(entrada, "stock") === "1",
    orden: (ORDENES as readonly string[]).includes(orden ?? "") ? (orden as Orden) : FILTROS_VACIOS.orden,
  };
}

/**
 * Escribe los filtros como query string (sin "?"), con claves en orden fijo y comas legibles.
 * Lo que está en su valor por defecto no se escribe.
 */
export function serializarFiltros(f: FiltrosCatalogo): string {
  const partes: string[] = [];
  const poner = (clave: string, valor: string) => partes.push(`${clave}=${valor}`);
  const ponerLista = (clave: string, valores: readonly string[]) => {
    if (valores.length) poner(clave, valores.map(encodeURIComponent).join(","));
  };
  ponerLista("provincia", f.provincias);
  ponerLista("municipio", f.municipios);
  ponerLista("productor", f.productores);
  ponerLista("proceso", f.procesos);
  ponerLista("variedad", f.variedades);
  ponerLista("tueste", f.tuestes);
  ponerLista("perfil", f.perfiles);
  if (f.altitud) poner("altitud", `${f.altitud[0]}-${f.altitud[1]}`);
  if (f.scaMinimo !== null) poner("sca", String(f.scaMinimo));
  if (f.precio) poner("precio", `${f.precio[0]}-${f.precio[1]}`);
  if (f.soloDisponibles) poner("stock", "1");
  if (f.orden !== FILTROS_VACIOS.orden) poner("orden", f.orden);
  return partes.join("&");
}
