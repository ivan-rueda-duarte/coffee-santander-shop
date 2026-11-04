"use client";

import { ETIQUETA_MOLIENDA, MOLIENDAS, type Molienda } from "@/domain/catalogo/tipos";
import { formatearCOP } from "@/domain/comun/dinero";
import { claveLinea } from "@/domain/pedido/carrito";
import type { LineaConPrecio } from "@/domain/pedido/totales";
import { etiquetaBolsas } from "@/domain/pedido/totales";
import { useCatalogo } from "@/ui/hooks/use-catalogo";
import { IconoCerrar, IconoMas, IconoMenos } from "../marca/iconos";
import { useCarrito } from "./carrito-provider";

const selector =
  "rounded-md border border-line-strong bg-surface-raised px-3 py-2 text-sm font-medium text-ink focus-visible:outline-2";

/** Una línea del pedido: café, tamaño, molienda, cantidad y precio. Se edita en el cajón y en el paso 1 de /pedido. */
export function LineaPedido({ linea, editable = true }: { linea: LineaConPrecio; editable?: boolean }) {
  const { buscarCafe } = useCatalogo();
  const { cambiarCantidad, actualizar, eliminar } = useCarrito();
  const cafe = buscarCafe(linea.cafeSlug);
  const clave = claveLinea(linea);
  const maximo = useCatalogo().catalogo.tienda.maxCantidad;
  if (!cafe) return null;
  const nombre = cafe.nombre;
  const molienda = (m: Molienda) => ETIQUETA_MOLIENDA[m];

  return (
    <li className="border-b border-line py-5 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold leading-tight text-ink-title">{nombre}</p>
          <p className="caption mt-1 text-ink-muted">
            {cafe.municipio} · {formatearCOP(linea.precioUnitarioCop)} c/u
          </p>
        </div>
        {editable && (
          <button
            type="button"
            onClick={() => eliminar(clave)}
            aria-label={`Quitar ${nombre}, ${linea.gramos} g, ${molienda(linea.molienda).toLowerCase()}, del pedido`}
            className="-mr-2 -mt-2 grid h-11 w-11 place-items-center rounded-pill text-ink-muted hover:bg-surface-sunken hover:text-ink"
          >
            <IconoCerrar />
          </button>
        )}
      </div>

      {editable ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            aria-label={`Tamaño de ${nombre}`}
            className={selector}
            value={linea.gramos}
            onChange={(e) => actualizar(clave, { gramos: Number(e.target.value) })}
          >
            {cafe.presentaciones.filter((p) => p.disponible || p.gramos === linea.gramos).map((p) => (
              <option key={p.gramos} value={p.gramos}>
                {p.gramos} g · {formatearCOP(p.precioCop)}
              </option>
            ))}
          </select>
          <select
            aria-label={`Molienda de ${nombre}`}
            className={selector}
            value={linea.molienda}
            onChange={(e) => actualizar(clave, { molienda: e.target.value as Molienda })}
          >
            {MOLIENDAS.filter((m) => cafe.moliendas.includes(m)).map((m) => (
              <option key={m} value={m}>
                {molienda(m)}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="caption mt-2 text-ink-muted">
          {linea.gramos} g · {molienda(linea.molienda)}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        {editable ? (
          <div role="group" aria-label={`Cantidad de ${nombre}`} className="inline-flex items-center rounded-pill border border-line-strong">
            <button
              type="button"
              onClick={() => cambiarCantidad(clave, -1)}
              aria-label={linea.cantidad === 1 ? `Quitar ${nombre}` : `Una bolsa menos de ${nombre}`}
              className="grid h-11 w-11 place-items-center rounded-pill hover:bg-surface-sunken"
            >
              <IconoMenos />
            </button>
            <span className="min-w-8 text-center text-sm font-bold tabular-nums" aria-live="polite">
              {linea.cantidad}
            </span>
            <button
              type="button"
              onClick={() => cambiarCantidad(clave, 1)}
              disabled={linea.cantidad >= maximo}
              aria-label={`Una bolsa más de ${nombre}`}
              className="grid h-11 w-11 place-items-center rounded-pill hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconoMas />
            </button>
          </div>
        ) : (
          <p className="text-sm font-medium tabular-nums">{etiquetaBolsas(linea.cantidad)}</p>
        )}
        <p className="text-right font-bold tabular-nums text-ink-title">
          {formatearCOP(linea.totalCop)}
          <small className="caption block font-medium text-ink-muted">
            {etiquetaBolsas(linea.cantidad)} de {linea.gramos} g
          </small>
        </p>
      </div>
    </li>
  );
}
