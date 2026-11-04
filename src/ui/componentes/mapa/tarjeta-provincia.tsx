"use client";

import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react";
import { useEffect, type KeyboardEvent as EventoTeclado } from "react";
import { etiquetaCafes } from "@/domain/catalogo/filtros";
import type { Cafe, Provincia } from "@/domain/catalogo/tipos";
import { Boton } from "../marca/boton";
import { IconoCerrar } from "../marca/iconos";

export interface PropsTarjeta {
  provincia: Provincia;
  cafes: readonly Cafe[];
  elegida: boolean;
  /** Elemento SVG de la provincia: la tarjeta flota junto a él. */
  ancla: Element | null;
  /** En celular la tarjeta es una hoja inferior, no un tooltip. */
  comoHoja: boolean;
  alCerrar: () => void;
  alVerCafes: () => void;
  alAlternar: () => void;
  alEntrar: () => void;
  alSalir: () => void;
}

/** Tarjeta de provincia: nombre, descripción (si hay), cuántos cafés y el botón para verlos. */
export function TarjetaProvincia({ provincia, cafes, elegida, ancla, comoHoja, alCerrar, alVerCafes, alAlternar, alEntrar, alSalir }: PropsTarjeta) {
  const { refs, floatingStyles } = useFloating({
    placement: "top",
    strategy: "fixed",
    middleware: [offset(10), flip({ padding: 12 }), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (ancla && !comoHoja) refs.setPositionReference({ getBoundingClientRect: () => ancla.getBoundingClientRect() });
  }, [ancla, comoHoja, refs]);

  const alTeclear = (e: EventoTeclado) => {
    if (e.key === "Escape") alCerrar();
  };
  const primeros = cafes.slice(0, 2).map((c) => c.nombre);

  return (
    <div
      ref={comoHoja ? undefined : refs.setFloating}
      role="dialog"
      aria-label={`Provincia ${provincia.nombre}`}
      data-theme="light"
      onKeyDown={alTeclear}
      onPointerEnter={alEntrar}
      onPointerLeave={alSalir}
      style={comoHoja ? undefined : floatingStyles}
      className={
        comoHoja
          ? "fixed inset-x-0 bottom-0 z-50 rounded-t-lg border border-line bg-surface-raised p-5 pb-8 text-ink shadow-md"
          : "z-50 w-72 rounded-lg border border-line bg-surface-raised p-4 text-ink shadow-md"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="h3 flex items-center gap-2 text-ink-title">
          <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full border border-black/20" style={{ background: provincia.colorHex }} />
          {provincia.nombre}
        </h3>
        {comoHoja && (
          <button type="button" onClick={alCerrar} aria-label="Cerrar" className="-mr-2 -mt-2 grid h-11 w-11 place-items-center rounded-pill hover:bg-surface-sunken">
            <IconoCerrar />
          </button>
        )}
      </div>
      {provincia.descripcion && <p className="body mt-2 line-clamp-3 text-sm text-ink-muted">{provincia.descripcion}</p>}
      <p className="mt-3 text-sm font-bold text-ink-title">{etiquetaCafes(cafes.length)}</p>
      {primeros.length > 0 && <p className="caption text-ink-muted">{primeros.join(" · ")}{cafes.length > 2 ? " y más" : ""}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <Boton tamano="sm" onClick={alVerCafes}>
          Ver cafés de {provincia.nombreCorto}
        </Boton>
        {comoHoja && (
          <Boton tamano="sm" variante="secundario" onClick={alAlternar}>
            {elegida ? "Quitar del filtro" : "Agregar al filtro"}
          </Boton>
        )}
      </div>
    </div>
  );
}
