"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { formatearCOP } from "@/domain/comun/dinero";
import { etiquetaBolsas } from "@/domain/pedido/totales";
import { Boton } from "../marca/boton";
import { useCarrito } from "./carrito-provider";

// El cajón usa el diálogo de Radix (~13 KB): se descarga la primera vez que se abre.
const CajonContenido = dynamic(() => import("./cajon-contenido"), { ssr: false });

export function CajonCarrito() {
  const { cajonAbierto } = useCarrito();
  const [pedido, setPedido] = useState(false);
  if (cajonAbierto && !pedido) setPedido(true);
  return pedido ? <CajonContenido /> : null;
}

/**
 * Barra inferior en celular: «Tu pedido · N bolsas · $…». No aparece en /pedido ni con el cajón abierto.
 * M2: se monta después del pie con un espaciador en el flujo del mismo alto (borde 1 + pt-3 12 + botón «Ver pedido» 46 + pb-3 12 = 71 px, medido;
 * más la zona segura inferior), para que la barra no tape la línea del vendedor, el © ni la franja al llegar al final.
 * Si cambia el alto de la barra, se cambia el espaciador en el mismo commit.
 * env(safe-area-inset-bottom) vale 0 mientras el viewport no declare viewport-fit=cover (ver src/app/layout.tsx).
 */
export function BarraPedido() {
  const { totales, cajonAbierto, abrirCajon } = useCarrito();
  const ruta = usePathname();
  if (totales.bolsas === 0 || cajonAbierto || ruta.startsWith("/pedido")) return null;
  return (
    <>
      <div aria-hidden="true" data-testid="espaciador-barra-pedido" className="h-[calc(71px+env(safe-area-inset-bottom))] bg-surface-raised md:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface-raised px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-md md:hidden" data-theme="light">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <p className="text-sm">
            <span className="block text-ink-muted">Tu pedido · {etiquetaBolsas(totales.bolsas)}</span>
            <strong className="text-base tabular-nums text-ink-title">{formatearCOP(totales.subtotalCop)}</strong>
          </p>
          <Boton onClick={abrirCajon}>Ver pedido</Boton>
        </div>
      </div>
    </>
  );
}
