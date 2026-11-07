"use client";

import { useState } from "react";
import { ETIQUETA_MOLIENDA, estaDisponible, MOLIENDAS, type Cafe, type Molienda } from "@/domain/catalogo/tipos";
import { formatearCOP } from "@/domain/comun/dinero";
import { leyendaIva } from "@/domain/pedido/iva";
import { useCarrito } from "../carrito/carrito-provider";
import { Boton } from "../marca/boton";
import { Pastilla } from "../marca/etiquetas";
import { IconoMas, IconoMenos } from "../marca/iconos";
import { useCatalogo } from "@/ui/hooks/use-catalogo";

function Pildora({ nombre, valor, marcado, alElegir, deshabilitado, children }: { nombre: string; valor: string; marcado: boolean; alElegir: () => void; deshabilitado?: boolean; children: React.ReactNode }) {
  return (
    <label className={deshabilitado ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
      <input type="radio" name={nombre} value={valor} checked={marcado} disabled={deshabilitado} onChange={alElegir} className="peer sr-only" />
      <span className="ds-tag ds-tag--outline min-h-11 flex-col items-start !gap-0 !rounded-lg !px-4 !py-2 text-sm font-semibold peer-checked:!border-monte-900 peer-checked:!bg-monte-900 peer-checked:!text-pergamino-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
        {children}
      </span>
    </label>
  );
}

/** Molienda + presentación + cantidad + «Agregar al pedido». El precio cambia con la selección. */
export function BloqueCompra({ cafe }: { cafe: Cafe }) {
  const { agregar } = useCarrito();
  const { catalogo } = useCatalogo();
  const max = catalogo.tienda.maxCantidad;
  const primera = cafe.presentaciones.find((p) => p.disponible) ?? cafe.presentaciones[0];
  const [molienda, setMolienda] = useState<Molienda>(cafe.moliendas.includes("grano") ? "grano" : cafe.moliendas[0]);
  const [gramos, setGramos] = useState(primera?.gramos ?? 0);
  const [cantidad, setCantidad] = useState(1);

  const disponible = estaDisponible(cafe);
  const elegida = cafe.presentaciones.find((p) => p.gramos === gramos);
  const total = elegida ? elegida.precioCop * cantidad : 0;

  return (
    <form
      className="rounded-lg border border-line bg-surface-raised p-5 md:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (elegida?.disponible) agregar(cafe, gramos, molienda, cantidad);
      }}
    >
      <fieldset>
        <legend className="overline mb-2 text-ink-muted">Molienda</legend>
        <div className="flex flex-wrap gap-2">
          {MOLIENDAS.filter((m) => cafe.moliendas.includes(m)).map((m) => (
            <Pildora key={m} nombre="molienda" valor={m} marcado={molienda === m} alElegir={() => setMolienda(m)}>
              {ETIQUETA_MOLIENDA[m]}
            </Pildora>
          ))}
        </div>
        {/* Microcopy §3 (LEG-083): el selector elige entre dos bolsas del fabricante; la tienda no muele. */}
        <p className="caption mt-2 text-ink-muted" data-testid="ayuda-molienda">Grano entero o molido, tal como lo empaca el fabricante. No molemos el café.</p>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="overline mb-2 text-ink-muted">Presentación</legend>
        <div className="flex flex-wrap gap-2">
          {cafe.presentaciones.map((p) => (
            <Pildora key={p.gramos} nombre="gramos" valor={String(p.gramos)} marcado={gramos === p.gramos} alElegir={() => setGramos(p.gramos)} deshabilitado={!p.disponible}>
              {p.gramos} g
              <small className="text-xs font-medium opacity-80">{p.disponible ? formatearCOP(p.precioCop) : "Agotado"}</small>
            </Pildora>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div role="group" aria-label="Cantidad de bolsas" className="inline-flex items-center rounded-pill border border-line-strong">
          <button type="button" aria-label="Una bolsa menos" disabled={cantidad <= 1} onClick={() => setCantidad((c) => Math.max(1, c - 1))} className="grid h-11 w-11 place-items-center rounded-pill hover:bg-surface-sunken disabled:opacity-40">
            <IconoMenos />
          </button>
          <span className="min-w-8 text-center font-bold tabular-nums" aria-live="polite">{cantidad}</span>
          <button type="button" aria-label="Una bolsa más" disabled={cantidad >= max} onClick={() => setCantidad((c) => Math.min(max, c + 1))} className="grid h-11 w-11 place-items-center rounded-pill hover:bg-surface-sunken disabled:opacity-40">
            <IconoMas />
          </button>
        </div>
        <p className="text-right">
          <span className="block text-3xl font-bold tabular-nums text-ink-title" aria-live="polite">{formatearCOP(total)}</span>
          <small className="caption text-ink-muted">
            {cantidad} × {gramos} g · {ETIQUETA_MOLIENDA[molienda].toLowerCase()}
          </small>
        </p>
      </div>
      {/* Microcopy §1.4: leyenda de IVA bajo el precio (la tarifa sale de data/config.csv). */}
      <p className="caption mt-2 text-right text-ink-muted" data-testid="leyenda-iva">{leyendaIva(catalogo.tienda.ivaTarifa)}</p>

      <div className="mt-5">
        {disponible && elegida?.disponible ? (
          <Boton type="submit" bloque tamano="lg">
            Agregar al pedido
          </Boton>
        ) : (
          <div className="flex items-center gap-3">
            <Boton type="button" bloque tamano="lg" disabled>
              Agotado
            </Boton>
            <Pastilla variante="agotado">Agotado</Pastilla>
          </div>
        )}
        <p className="caption mt-3 text-ink-muted">Hasta {max} bolsas por tamaño y molienda; para más, escríbenos por WhatsApp.</p>
      </div>
    </form>
  );
}
