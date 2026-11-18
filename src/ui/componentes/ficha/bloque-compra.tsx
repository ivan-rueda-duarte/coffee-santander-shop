"use client";

import Link from "next/link";
import { useState } from "react";
import { ETIQUETA_MOLIENDA, estaDisponible, MOLIENDAS, type Cafe, type Molienda } from "@/domain/catalogo/tipos";
import { formatearCOP } from "@/domain/comun/dinero";
import { slugify } from "@/domain/comun/slug";
import { leyendaIva } from "@/domain/pedido/iva";
import { useCarrito } from "../carrito/carrito-provider";
import { Boton } from "../marca/boton";
import { IconoMas, IconoMenos } from "../marca/iconos";
import { useCatalogo } from "@/ui/hooks/use-catalogo";

function Pildora({ nombre, valor, marcado, alElegir, deshabilitado, children }: { nombre: string; valor: string; marcado: boolean; alElegir: () => void; deshabilitado?: boolean; children: React.ReactNode }) {
  return (
    // Agotado (diseño 2026-11-18, media): sin opacidad; borde punteado line-strong y texto ink-muted (≈ 7:1), para que
    // «Agotado» se lea y el estado no dependa del color (WCAG 1.4.1 y 1.4.3). Los «!» ganan a .ds-tag--outline, que no está en una capa.
    <label className={deshabilitado ? "cursor-not-allowed" : "cursor-pointer"}>
      <input type="radio" name={nombre} value={valor} checked={marcado} disabled={deshabilitado} onChange={alElegir} className="peer sr-only" />
      <span className="ds-tag ds-tag--outline min-h-11 flex-col items-start !gap-0 !rounded-lg !px-4 !py-2 text-sm font-semibold peer-checked:!border-monte-900 peer-checked:!bg-monte-900 peer-checked:!text-pergamino-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-disabled:!border-dashed peer-disabled:!border-line-strong peer-disabled:!bg-transparent peer-disabled:!text-ink-muted">
        {children}
      </span>
    </label>
  );
}

/** Ancla del numeral 6 de D3 («Plazos de entrega») en /envios/. */
const ENLACE_PLAZOS = `/envios/#${slugify("6. Plazos de entrega")}`;

/** Presentación (grano o molido) + tamaño + cantidad + «Agregar al pedido». El precio cambia con la selección. */
export function BloqueCompra({ cafe }: { cafe: Cafe }) {
  const { agregar } = useCarrito();
  const { catalogo } = useCatalogo();
  const max = catalogo.tienda.maxCantidad;
  const primera = cafe.presentaciones.find((p) => p.disponible) ?? cafe.presentaciones[0];
  const [molienda, setMolienda] = useState<Molienda>(cafe.moliendas.includes("grano") ? "grano" : cafe.moliendas[0]);
  const [gramos, setGramos] = useState(primera?.gramos ?? 0);
  const [cantidad, setCantidad] = useState(1);

  const disponible = estaDisponible(cafe);
  const moliendas = MOLIENDAS.filter((m) => cafe.moliendas.includes(m));
  // LEG-083 y LEG-155: el selector elige entre dos bolsas del fabricante; la tienda no muele (texto derivado de D1 §3, pendiente de diseño).
  const ayudaMolienda = <p className="caption mt-2 text-ink-muted" data-testid="ayuda-molienda">Grano o molido, tal como lo empaca el fabricante. No molemos el café.</p>;
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
      {disponible ? (
        <fieldset>
          {/* D5 §6.2 (LEG-155): «Presentación: Grano · Molido», solo las que existen para este café. */}
          <legend className="overline mb-2 text-ink-muted">Presentación</legend>
          <div className="flex flex-wrap gap-2">
            {moliendas.map((m) => (
              <Pildora key={m} nombre="molienda" valor={m} marcado={molienda === m} alElegir={() => setMolienda(m)}>
                {ETIQUETA_MOLIENDA[m]}
              </Pildora>
            ))}
          </div>
          {ayudaMolienda}
        </fieldset>
      ) : (
        // Todo agotado: no hay nada que elegir; las presentaciones quedan como dato (nivel 1), sin controles muertos.
        <div>
          <p className="overline mb-2 text-ink-muted">Presentación</p>
          <p className="ds-tags" data-testid="presentaciones-agotado">
            {moliendas.map((m) => (
              <span key={m} className="ds-tag">{ETIQUETA_MOLIENDA[m]}</span>
            ))}
          </p>
          {ayudaMolienda}
        </div>
      )}

      <fieldset className="mt-5">
        <legend className="overline mb-2 text-ink-muted">Tamaño</legend>
        <div className="flex flex-wrap gap-2">
          {cafe.presentaciones.map((p) => (
            <Pildora key={p.gramos} nombre="gramos" valor={String(p.gramos)} marcado={gramos === p.gramos && p.disponible} alElegir={() => setGramos(p.gramos)} deshabilitado={!p.disponible}>
              {p.gramos} g
              {/* Todo agotado (decisión del dueño, LEG-184 alternativa): la píldora conserva su precio, sin tachar, con «Agotado» debajo. */}
              {!disponible && <small className="text-xs font-medium">{formatearCOP(p.precioCop)}</small>}
              <small className={p.disponible ? "text-xs font-medium opacity-80" : "text-xs font-medium"}>{p.disponible ? formatearCOP(p.precioCop) : "Agotado"}</small>
            </Pildora>
          ))}
        </div>
        {/* D5 §6.2: con todo agotado, la leyenda de IVA va bajo los precios de las píldoras. */}
        {!disponible && <p className="caption mt-2 text-ink-muted" data-testid="leyenda-iva">{leyendaIva(catalogo.tienda.ivaTarifa)}</p>}
      </fieldset>

      {/* Todo agotado: sin cantidad ni total; describirían una compra que no se puede hacer. */}
      {disponible && (
        <>
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
          {/* D5 §6.2: leyenda de IVA bajo el precio (la tarifa sale de data/config.csv). */}
          <p className="caption mt-1 text-right text-ink-muted" data-testid="leyenda-iva">{leyendaIva(catalogo.tienda.ivaTarifa)}</p>
        </>
      )}

      <div className="mt-5">
        {disponible && elegida?.disponible ? (
          <Boton type="submit" bloque tamano="lg">
            Agregar al pedido
          </Boton>
        ) : (
          // M9: el botón deshabilitado ya dice «Agotado»; sin pastilla que repita la palabra.
          <Boton type="button" bloque tamano="lg" disabled>
            Agotado
          </Boton>
        )}
        {disponible ? (
          <>
            <p className="caption mt-3 text-ink-muted">Hasta {max} bolsas por tamaño y presentación; para más, escríbenos por WhatsApp.</p>
            {/* D5 §6.2: la ficha no conoce la zona, así que remite a los plazos de /envios/ (texto del enlace propuesto por legal, LEG-153). */}
            <p className="caption mt-1 text-ink-muted" data-testid="plazo-ficha">
              Entrega estimada y plazo máximo según tu zona:{" "}
              <Link href={ENLACE_PLAZOS} className="underline underline-offset-4">Ver plazos</Link>
            </p>
          </>
        ) : (
          // LEG-186: el dueño se compromete a avisar. Enlace sin texto precargado ni datos personales.
          <p className="small mt-3 text-ink" data-testid="aviso-agotado">
            Este café está agotado por ahora.{" "}
            <a className="font-semibold underline underline-offset-4" href={`https://wa.me/${catalogo.tienda.whatsapp}`} target="_blank" rel="noopener noreferrer">
              Escríbenos por WhatsApp
            </a>{" "}
            y te avisamos cuando vuelva.
          </p>
        )}
      </div>
    </form>
  );
}
