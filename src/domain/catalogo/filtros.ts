import { slugify } from "../comun/slug";
import {
  estaDisponible,
  grupoDeTueste,
  precioDesde,
  type Cafe,
  type GrupoTueste,
  type Perfil,
  type Proceso,
  type Provincia,
} from "./tipos";

export type Rango = readonly [number, number];

export const UMBRALES_SCA = [80, 84, 86] as const;
export const ORDENES = ["catalogo", "sca", "precio-asc", "precio-desc", "altitud"] as const;
export type Orden = (typeof ORDENES)[number];

/**
 * Dentro de una dimensión los valores se combinan con O; entre dimensiones, con Y.
 * Provincias, municipios, productores y variedades se guardan como slug.
 */
export interface FiltrosCatalogo {
  provincias: string[];
  municipios: string[];
  productores: string[];
  procesos: Proceso[];
  variedades: string[];
  tuestes: GrupoTueste[];
  perfiles: Perfil[];
  altitud: Rango | null;
  scaMinimo: number | null;
  precio: Rango | null;
  soloDisponibles: boolean;
  orden: Orden;
}

export const FILTROS_VACIOS: FiltrosCatalogo = Object.freeze({
  provincias: [],
  municipios: [],
  productores: [],
  procesos: [],
  variedades: [],
  tuestes: [],
  perfiles: [],
  altitud: null,
  scaMinimo: null,
  precio: null,
  soloDisponibles: false,
  orden: "catalogo",
}) as FiltrosCatalogo;

export type DimensionLista = "provincias" | "municipios" | "productores" | "procesos" | "variedades" | "tuestes" | "perfiles";
export type Dimension = DimensionLista | "altitud" | "sca" | "precio" | "disponibles";

export const DIMENSIONES_LISTA: readonly DimensionLista[] = [
  "provincias",
  "municipios",
  "productores",
  "procesos",
  "variedades",
  "tuestes",
  "perfiles",
];

const enRango = (valor: number | null, rango: Rango): boolean => valor !== null && valor >= rango[0] && valor <= rango[1];

/** ¿El café cumple todos los filtros, salvo la dimensión `excluir`? */
export function coincide(cafe: Cafe, f: FiltrosCatalogo, excluir?: Dimension): boolean {
  const pasa = (dim: Dimension): boolean => dim === excluir;
  const algunoEn = (lista: readonly string[], valores: readonly (string | null)[]) =>
    lista.length === 0 || valores.some((v) => v !== null && lista.includes(v));

  return (
    (pasa("provincias") || algunoEn(f.provincias, [cafe.provinciaSlug])) &&
    (pasa("municipios") || algunoEn(f.municipios, [cafe.municipioSlug])) &&
    (pasa("productores") || algunoEn(f.productores, [cafe.productorSlug])) &&
    (pasa("procesos") || algunoEn(f.procesos, [cafe.proceso])) &&
    (pasa("variedades") || algunoEn(f.variedades, cafe.variedades.map(slugify))) &&
    (pasa("tuestes") || algunoEn(f.tuestes, [grupoDeTueste(cafe.tueste)])) &&
    (pasa("perfiles") || algunoEn(f.perfiles, cafe.perfiles)) &&
    (pasa("altitud") || f.altitud === null || enRango(cafe.alturaMsnm, f.altitud)) &&
    (pasa("sca") ||
      f.scaMinimo === null ||
      (cafe.puntajeVerificado && cafe.puntajeSca !== null && cafe.puntajeSca >= f.scaMinimo)) &&
    (pasa("precio") || f.precio === null || enRango(precioDesde(cafe), f.precio)) &&
    (pasa("disponibles") || !f.soloDisponibles || estaDisponible(cafe))
  );
}

export function aplicarFiltros(cafes: readonly Cafe[], f: FiltrosCatalogo): Cafe[] {
  return cafes.filter((c) => coincide(c, f));
}

// ---------- Orden ----------

const ultimoSiNulo = (a: number | null, b: number | null, desc: boolean): number => {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return desc ? b - a : a - b;
};

/** Devuelve una copia ordenada. Los datos que faltan van al final. El orden es estable. */
export function ordenar(cafes: readonly Cafe[], orden: Orden): Cafe[] {
  const base = (a: Cafe, b: Cafe) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es");
  const sca = (c: Cafe) => (c.puntajeVerificado ? c.puntajeSca : null);
  const comparadores: Record<Orden, (a: Cafe, b: Cafe) => number> = {
    catalogo: base,
    sca: (a, b) => ultimoSiNulo(sca(a), sca(b), true) || base(a, b),
    "precio-asc": (a, b) => ultimoSiNulo(precioDesde(a), precioDesde(b), false) || base(a, b),
    "precio-desc": (a, b) => ultimoSiNulo(precioDesde(a), precioDesde(b), true) || base(a, b),
    altitud: (a, b) => ultimoSiNulo(a.alturaMsnm, b.alturaMsnm, true) || base(a, b),
  };
  return [...cafes].sort(comparadores[orden]);
}

export function filtrarYOrdenar(cafes: readonly Cafe[], f: FiltrosCatalogo): Cafe[] {
  return ordenar(aplicarFiltros(cafes, f), f.orden);
}

export interface GrupoProvincia {
  provincia: Provincia | null;
  cafes: Cafe[];
}

/** Catálogo agrupado por provincia en el orden de `provincias`; los cafés sin provincia van al final. */
export function agruparPorProvincia(cafes: readonly Cafe[], provincias: readonly Provincia[]): GrupoProvincia[] {
  const grupos: GrupoProvincia[] = [...provincias]
    .sort((a, b) => a.orden - b.orden)
    .map((provincia) => ({ provincia, cafes: cafes.filter((c) => c.provinciaSlug === provincia.slug) }))
    .filter((g) => g.cafes.length > 0);
  const conocidas = new Set(provincias.map((p) => p.slug));
  const sueltos = cafes.filter((c) => c.provinciaSlug === null || !conocidas.has(c.provinciaSlug));
  if (sueltos.length) grupos.push({ provincia: null, cafes: sueltos });
  return grupos;
}

// ---------- Facetas ----------

export type Facetas = Record<DimensionLista, Record<string, number>>;

function valoresDe(cafe: Cafe, dim: DimensionLista): string[] {
  switch (dim) {
    case "provincias": return cafe.provinciaSlug ? [cafe.provinciaSlug] : [];
    case "municipios": return [cafe.municipioSlug];
    case "productores": return cafe.productorSlug ? [cafe.productorSlug] : [];
    case "procesos": return [cafe.proceso];
    case "variedades": return [...new Set(cafe.variedades.map(slugify))];
    case "tuestes": return [grupoDeTueste(cafe.tueste)];
    case "perfiles": return cafe.perfiles;
  }
}

/**
 * Conteo por opción de cada dimensión, aplicando todos los filtros menos el de la propia dimensión.
 * Toda opción que exista en el catálogo aparece, con 0 si ya no hay cafés (se muestra deshabilitada).
 */
export function calcularFacetas(cafes: readonly Cafe[], f: FiltrosCatalogo): Facetas {
  const facetas = {} as Facetas;
  for (const dim of DIMENSIONES_LISTA) {
    const conteo: Record<string, number> = {};
    for (const c of cafes) for (const v of valoresDe(c, dim)) conteo[v] ??= 0;
    for (const c of cafes) {
      if (!coincide(c, f, dim)) continue;
      for (const v of valoresDe(c, dim)) conteo[v] += 1;
    }
    facetas[dim] = conteo;
  }
  return facetas;
}

// ---------- Qué controles mostrar ----------

export interface LimitesCatalogo {
  altitud: Rango | null;
  precio: Rango | null;
}

export function limitesCatalogo(cafes: readonly Cafe[]): LimitesCatalogo {
  const rango = (nums: number[]): Rango | null => (nums.length ? [Math.min(...nums), Math.max(...nums)] : null);
  return {
    altitud: rango(cafes.flatMap((c) => (c.alturaMsnm === null ? [] : [c.alturaMsnm]))),
    precio: rango(cafes.flatMap((c) => precioDesde(c) ?? [])),
  };
}

/**
 * Una faceta con menos de dos valores distintos no filtra nada y se oculta.
 * Productor exige dos productores con datos; SCA exige algún puntaje verificado ≥ 80.
 */
export function dimensionesVisibles(cafes: readonly Cafe[]): Set<Dimension> {
  const visibles = new Set<Dimension>();
  for (const dim of DIMENSIONES_LISTA) {
    const distintos = new Set(cafes.flatMap((c) => valoresDe(c, dim)));
    if (distintos.size >= 2) visibles.add(dim);
  }
  const { altitud, precio } = limitesCatalogo(cafes);
  if (altitud && altitud[0] < altitud[1]) visibles.add("altitud");
  if (precio && precio[0] < precio[1]) visibles.add("precio");
  if (cafes.some((c) => c.puntajeVerificado && (c.puntajeSca ?? 0) >= UMBRALES_SCA[0])) visibles.add("sca");
  if (cafes.some((c) => !estaDisponible(c)) && cafes.some(estaDisponible)) visibles.add("disponibles");
  return visibles;
}

// ---------- Cambios sobre los filtros ----------

const conAlternado = <T>(lista: readonly T[], valor: T): T[] =>
  lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];

export function alternarValor(f: FiltrosCatalogo, dim: DimensionLista, valor: string): FiltrosCatalogo {
  const lista = f[dim] as string[];
  return { ...f, [dim]: conAlternado(lista, valor) };
}

/** Al quitar una provincia se descartan los municipios que ya no pertenecen a ninguna elegida. */
export function reconciliarMunicipios(f: FiltrosCatalogo, cafes: readonly Cafe[]): FiltrosCatalogo {
  if (f.provincias.length === 0 || f.municipios.length === 0) return f;
  const permitidos = new Set(
    cafes.filter((c) => c.provinciaSlug && f.provincias.includes(c.provinciaSlug)).map((c) => c.municipioSlug),
  );
  return { ...f, municipios: f.municipios.filter((m) => permitidos.has(m)) };
}

export function alternarProvincia(f: FiltrosCatalogo, slug: string, cafes: readonly Cafe[]): FiltrosCatalogo {
  return reconciliarMunicipios(alternarValor(f, "provincias", slug), cafes);
}

export interface FiltroActivo {
  dimension: Dimension;
  /** Presente en las dimensiones de lista. */
  valor?: string;
}

/** Cada filtro puesto, para mostrarlo como chip que se puede quitar. */
export function filtrosActivos(f: FiltrosCatalogo): FiltroActivo[] {
  const activos: FiltroActivo[] = [];
  for (const dim of DIMENSIONES_LISTA) for (const valor of f[dim] as string[]) activos.push({ dimension: dim, valor });
  if (f.altitud) activos.push({ dimension: "altitud" });
  if (f.scaMinimo !== null) activos.push({ dimension: "sca" });
  if (f.precio) activos.push({ dimension: "precio" });
  if (f.soloDisponibles) activos.push({ dimension: "disponibles" });
  return activos;
}

export function quitarFiltro(f: FiltrosCatalogo, activo: FiltroActivo, cafes: readonly Cafe[]): FiltrosCatalogo {
  const { dimension, valor } = activo;
  if ((DIMENSIONES_LISTA as readonly string[]).includes(dimension)) {
    const sinValor = { ...f, [dimension]: (f[dimension as DimensionLista] as string[]).filter((v) => v !== valor) };
    return dimension === "provincias" ? reconciliarMunicipios(sinValor, cafes) : sinValor;
  }
  if (dimension === "altitud") return { ...f, altitud: null };
  if (dimension === "sca") return { ...f, scaMinimo: null };
  if (dimension === "precio") return { ...f, precio: null };
  return { ...f, soloDisponibles: false };
}

/** Quita todos los filtros y conserva el orden elegido. */
export function limpiarFiltros(f: FiltrosCatalogo): FiltrosCatalogo {
  return { ...FILTROS_VACIOS, orden: f.orden };
}

// ---------- Textos ----------

export function etiquetaCafes(n: number): string {
  return `${n} ${n === 1 ? "café" : "cafés"}`;
}

/** "4 cafés", "4 cafés en Guanentá", "5 cafés en Guanentá y Comunera", "5 cafés en 3 provincias". */
export function textoContador(n: number, nombresProvinciasElegidas: readonly string[]): string {
  const total = etiquetaCafes(n);
  const k = nombresProvinciasElegidas.length;
  if (k === 0) return total;
  if (k === 1) return `${total} en ${nombresProvinciasElegidas[0]}`;
  if (k === 2) return `${total} en ${nombresProvinciasElegidas[0]} y ${nombresProvinciasElegidas[1]}`;
  return `${total} en ${k} provincias`;
}
