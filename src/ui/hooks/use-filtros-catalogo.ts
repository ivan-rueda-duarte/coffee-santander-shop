"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  alternarProvincia as alternarProvinciaDominio,
  alternarValor,
  calcularFacetas,
  filtrarYOrdenar,
  filtrosActivos,
  limpiarFiltros,
  quitarFiltro,
  type DimensionLista,
  type FiltroActivo,
  type FiltrosCatalogo,
  type Orden,
  type Rango,
} from "@/domain/catalogo/filtros";
import { slugify } from "@/domain/comun/slug";
import { parseFiltros, serializarFiltros } from "@/domain/catalogo/url";
import { useCatalogo } from "./use-catalogo";

/**
 * Filtros del catálogo. La URL es la ÚNICA fuente de verdad: el mapa, los chips y las listas leen y
 * escriben aquí, así que siempre están sincronizados y el enlace se puede compartir.
 * Debe usarse dentro de <Suspense> (useSearchParams).
 */
export function useFiltrosCatalogo() {
  const { catalogo } = useCatalogo();
  const params = useSearchParams();
  const { cafes } = catalogo;

  const opciones = useMemo(
    () => ({
      provincias: catalogo.provinciasActivas.map((p) => p.slug),
      municipios: catalogo.municipios.map((m) => m.slug),
      productores: catalogo.productores.map((p) => p.slug),
      variedades: [...new Set(cafes.flatMap((c) => c.variedades.map(slugify)))],
    }),
    [catalogo, cafes],
  );

  const filtros = useMemo(() => parseFiltros(params, opciones), [params, opciones]);
  const resultados = useMemo(() => filtrarYOrdenar(cafes, filtros), [cafes, filtros]);
  const facetas = useMemo(() => calcularFacetas(cafes, filtros), [cafes, filtros]);
  const activos = useMemo(() => filtrosActivos(filtros), [filtros]);

  // replaceState se integra con useSearchParams de Next: no recarga ni hace scroll.
  const cambiar = useCallback((nuevo: FiltrosCatalogo) => {
    const qs = serializarFiltros(nuevo);
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
  }, []);

  return {
    filtros,
    resultados,
    facetas,
    activos,
    total: cafes.length,
    alternar: (dim: DimensionLista, valor: string) => cambiar(alternarValor(filtros, dim, valor)),
    alternarProvincia: (slug: string) => cambiar(alternarProvinciaDominio(filtros, slug, cafes)),
    quitarProvincias: () => cambiar({ ...filtros, provincias: [], municipios: [] }),
    cambiarAltitud: (altitud: Rango | null) => cambiar({ ...filtros, altitud }),
    cambiarPrecio: (precio: Rango | null) => cambiar({ ...filtros, precio }),
    cambiarSca: (scaMinimo: number | null) => cambiar({ ...filtros, scaMinimo }),
    cambiarStock: (soloDisponibles: boolean) => cambiar({ ...filtros, soloDisponibles }),
    cambiarOrden: (orden: Orden) => cambiar({ ...filtros, orden }),
    quitar: (a: FiltroActivo) => cambiar(quitarFiltro(filtros, a, cafes)),
    limpiar: () => cambiar(limpiarFiltros(filtros)),
  };
}

export type EstadoFiltros = ReturnType<typeof useFiltrosCatalogo>;
