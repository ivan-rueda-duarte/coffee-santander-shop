"use client";

import type { ReactNode } from "react";
import type { VistaCatalogo } from "@/application/casos-uso/obtener-catalogo";
import { CarritoLocal } from "@/infrastructure/almacenamiento/carrito-local";
import { BarraPedido, CajonCarrito } from "@/ui/componentes/carrito/cajon-carrito";
import { CarritoProvider } from "@/ui/componentes/carrito/carrito-provider";
import { Encabezado } from "@/ui/componentes/layout/encabezado";
import { AvisosProvider } from "@/ui/componentes/layout/avisos";
import { CatalogoProvider } from "@/ui/hooks/use-catalogo";

// Aquí (capa app) se ensamblan las piezas: ui no conoce a infrastructure.
const crearAlmacen = (max: number) => new CarritoLocal(window.localStorage, window, max);

export function Proveedores({ catalogo, children }: { catalogo: VistaCatalogo; children: ReactNode }) {
  return (
    <CatalogoProvider catalogo={catalogo}>
      <AvisosProvider>
        <CarritoProvider crearAlmacen={crearAlmacen}>
          <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-monte-900 focus:px-4 focus:py-2 focus:text-pergamino-50">
            Ir al contenido
          </a>
          <Encabezado />
          {children}
          <CajonCarrito />
          <BarraPedido />
        </CarritoProvider>
      </AvisosProvider>
    </CatalogoProvider>
  );
}
