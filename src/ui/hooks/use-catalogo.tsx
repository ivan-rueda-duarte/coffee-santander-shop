"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { VistaCatalogo } from "@/application/casos-uso/obtener-catalogo";
import { buscarCafe, crearBuscadorDePrecios } from "@/domain/catalogo/catalogo";
import type { Cafe } from "@/domain/catalogo/tipos";
import type { BuscarPrecio } from "@/domain/pedido/totales";

interface Valor {
  catalogo: VistaCatalogo;
  buscarCafe: (slug: string) => Cafe | undefined;
  buscarPrecio: BuscarPrecio;
}

const Contexto = createContext<Valor | null>(null);

/** Entrega el catálogo (leído de los CSV durante el build) a los componentes del navegador. */
export function CatalogoProvider({ catalogo, children }: { catalogo: VistaCatalogo; children: ReactNode }) {
  const valor = useMemo<Valor>(
    () => ({ catalogo, buscarCafe: (slug) => buscarCafe(catalogo, slug), buscarPrecio: crearBuscadorDePrecios(catalogo) }),
    [catalogo],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCatalogo(): Valor {
  const v = useContext(Contexto);
  if (!v) throw new Error("useCatalogo debe usarse dentro de <CatalogoProvider>");
  return v;
}
