"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export interface OpcionChip {
  valor: string;
  etiqueta: string;
  /** Cafés que quedarían con esta opción (excluyendo su propia dimensión). */
  conteo: number;
  color?: string;
}

/** Grupo de opciones de selección múltiple. Las que tendrían 0 resultados se muestran deshabilitadas. */
export function GrupoChips({
  leyenda,
  opciones,
  seleccion,
  alAlternar,
  className,
}: {
  leyenda: string;
  opciones: readonly OpcionChip[];
  seleccion: readonly string[];
  alAlternar: (valor: string) => void;
  className?: string;
}) {
  return (
    <fieldset className={clsx("min-w-0", className)}>
      <legend className="overline mb-2 text-ink-muted">{leyenda}</legend>
      <div className="flex flex-wrap gap-2">
        {opciones.map((o) => {
          const activa = seleccion.includes(o.valor);
          return (
            <button
              key={o.valor}
              type="button"
              aria-pressed={activa}
              disabled={o.conteo === 0 && !activa}
              onClick={() => alAlternar(o.valor)}
              className={clsx(
                "ds-tag ds-tag--outline min-h-9 cursor-pointer text-sm font-semibold transition-colors",
                activa ? "!border-monte-900 !bg-monte-900 !text-pergamino-50" : "hover:border-ink",
                "disabled:cursor-not-allowed disabled:opacity-45",
              )}
            >
              {o.color && <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border border-black/20" style={{ background: o.color }} />}
              {o.etiqueta}
              <span className={clsx("text-xs font-medium tabular-nums", activa ? "text-pergamino-50/80" : "text-ink-muted")}>{o.conteo}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Opción única (SCA mínimo). */
export function GrupoOpcionUnica({
  leyenda,
  nombre,
  opciones,
  valor,
  alElegir,
}: {
  leyenda: string;
  nombre: string;
  opciones: readonly { valor: string; etiqueta: string }[];
  valor: string;
  alElegir: (valor: string) => void;
}) {
  return (
    <fieldset>
      <legend className="overline mb-2 text-ink-muted">{leyenda}</legend>
      <div className="flex flex-wrap gap-2">
        {opciones.map((o) => (
          <label key={o.valor} className="cursor-pointer">
            <input type="radio" name={nombre} value={o.valor} checked={valor === o.valor} onChange={() => alElegir(o.valor)} className="peer sr-only" />
            <span className="ds-tag ds-tag--outline min-h-9 text-sm font-semibold peer-checked:!border-monte-900 peer-checked:!bg-monte-900 peer-checked:!text-pergamino-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
              {o.etiqueta}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Interruptor «Solo en stock». */
export function Interruptor({ etiqueta, activo, alCambiar, ayuda }: { etiqueta: string; activo: boolean; alCambiar: (v: boolean) => void; ayuda?: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold">
      <span>
        {etiqueta}
        {ayuda && <span className="block text-xs font-medium text-ink-muted">{ayuda}</span>}
      </span>
      <input type="checkbox" role="switch" checked={activo} onChange={(e) => alCambiar(e.target.checked)} className="peer sr-only" />
      <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-pill bg-line-strong transition-colors peer-checked:bg-monte-900 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-pergamino-0 after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}
