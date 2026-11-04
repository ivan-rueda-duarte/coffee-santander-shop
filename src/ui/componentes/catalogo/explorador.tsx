"use client";

import dynamic from "next/dynamic";
import { Fragment, useState } from "react";
import { agruparPorProvincia, textoContador, type Orden } from "@/domain/catalogo/filtros";
import { precioDesde } from "@/domain/catalogo/tipos";
import { formatearCOP } from "@/domain/comun/dinero";
import { useCatalogo } from "@/ui/hooks/use-catalogo";
import { useFiltrosCatalogo } from "@/ui/hooks/use-filtros-catalogo";
import { Boton } from "../marca/boton";
import { IconoCerrar, IconoFiltro } from "../marca/iconos";
import { GrupoChips } from "./controles-filtro";
import { etiquetaActivo, PanelFiltros, useOpciones } from "./panel-filtros";
import { TarjetaCafe } from "./tarjeta-cafe";

// La hoja de filtros (diálogo de Radix) solo se descarga cuando alguien la abre.
const HojaFiltros = dynamic(() => import("./hoja-filtros"), { ssr: false });

const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: "catalogo", etiqueta: "Orden del catálogo" },
  { valor: "sca", etiqueta: "Puntaje SCA" },
  { valor: "precio-asc", etiqueta: "Precio: menor a mayor" },
  { valor: "precio-desc", etiqueta: "Precio: mayor a menor" },
  { valor: "altitud", etiqueta: "Altitud" },
];

/** Enfoca el contador de resultados (lo usa el mapa al llevar al catálogo). */
export const ID_CONTADOR = "resultados-catalogo";

/** Filtros + resultados. Lee la URL (useSearchParams), así que va dentro de <Suspense> (ver SeccionCatalogo). */
export function ExploradorFiltrable() {
  const f = useFiltrosCatalogo();
  const { catalogo } = useCatalogo();
  const op = useOpciones(f);
  const [hojaAbierta, setHojaAbierta] = useState(false);
  const [hojaPedida, setHojaPedida] = useState(false);
  const { filtros, resultados, activos } = f;

  const nombresElegidas = filtros.provincias.map((s) => catalogo.provincias.find((p) => p.slug === s)?.nombreCorto ?? s);
  const agrupado = filtros.orden === "catalogo";
  const grupos = agrupado ? agruparPorProvincia(resultados, catalogo.provincias) : [{ provincia: null, cafes: resultados }];
  const mostrarProvincias = catalogo.filtrosVisibles.includes("provincias");
  const otrosFiltros = catalogo.filtrosVisibles.some((d) => d !== "provincias");

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_1fr]">
      {/* Escritorio: filtros fijos a la izquierda */}
      <aside aria-label="Filtros" className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          <PanelFiltros f={f} incluirProvincias />
        </div>
      </aside>

      <div>
        {/* Celular: provincias a mano y el resto en una hoja */}
        <div className="mb-6 space-y-4 lg:hidden">
          {mostrarProvincias && <GrupoChips leyenda="Provincia" opciones={op.provincias} seleccion={filtros.provincias} alAlternar={f.alternarProvincia} />}
          {otrosFiltros && (
            <>
              <Boton
                variante="secundario"
                tamano="sm"
                aria-haspopup="dialog"
                onClick={() => {
                  setHojaPedida(true);
                  setHojaAbierta(true);
                }}
              >
                <IconoFiltro className="ds-btn__icon" />
                Filtros{activos.length ? ` (${activos.length})` : ""}
              </Boton>
              {hojaPedida && <HojaFiltros f={f} abierta={hojaAbierta} alCambiar={setHojaAbierta} />}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <p id={ID_CONTADOR} tabIndex={-1} aria-live="polite" className="h3 text-ink-title outline-none">
            {textoContador(resultados.length, nombresElegidas)}
          </p>
          <label className="flex items-center gap-2 text-sm font-semibold">
            Ordenar
            <select
              value={filtros.orden}
              onChange={(e) => f.cambiarOrden(e.target.value as Orden)}
              className="rounded-md border border-line-strong bg-surface-raised px-3 py-2 text-sm font-medium"
            >
              {ORDENES.filter((o) => o.valor !== "sca" || catalogo.filtrosVisibles.includes("sca")).map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>

        {activos.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Filtros activos" role="group">
            {activos.map((a) => {
              const texto = etiquetaActivo(a, f, op);
              return (
                <button
                  key={`${a.dimension}:${a.valor ?? ""}`}
                  type="button"
                  onClick={() => f.quitar(a)}
                  aria-label={`Quitar filtro ${texto}`}
                  className="ds-tag ds-tag--outline min-h-9 cursor-pointer gap-1.5 text-sm font-semibold hover:border-ink"
                >
                  {texto}
                  <IconoCerrar width={14} height={14} />
                </button>
              );
            })}
            <Boton variante="enlace" tamano="sm" onClick={f.limpiar}>
              Limpiar filtros
            </Boton>
          </div>
        )}

        {resultados.length === 0 ? (
          <div className="mt-10 rounded-lg bg-surface-sunken p-8 text-center">
            <p className="h3 text-ink-title">No hay cafés con esos filtros</p>
            <p className="body mt-2 text-ink-muted">Quita alguno para ver más opciones.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {activos.length > 0 && (
                <Boton variante="secundario" onClick={() => f.quitar(activos[activos.length - 1])}>
                  Quitar el último filtro
                </Boton>
              )}
              <Boton onClick={f.limpiar}>Limpiar filtros</Boton>
            </div>
          </div>
        ) : (
          grupos.map(({ provincia, cafes }) => (
            <Fragment key={provincia?.slug ?? "todos"}>
              {agrupado && (
                <div className="mb-4 mt-10 first:mt-8">
                  <h3 className="h3 flex items-center gap-3 text-ink-title">
                    <span aria-hidden="true" className="h-3 w-3 rounded-full border border-black/20" style={{ background: provincia?.colorHex ?? "var(--line)" }} />
                    {provincia?.nombre ?? "Otros municipios"}
                  </h3>
                  <p className="caption mt-1 text-ink-muted">
                    {textoContador(cafes.length, [])} · desde {formatearCOP(Math.min(...cafes.map((c) => precioDesde(c) ?? Infinity)))}
                  </p>
                  {provincia?.descripcion && <p className="body mt-2 max-w-2xl text-ink-muted">{provincia.descripcion}</p>}
                </div>
              )}
              <ul className={agrupado ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"}>
                {cafes.map((c) => (
                  <li key={c.slug}>
                    <TarjetaCafe cafe={c} />
                  </li>
                ))}
              </ul>
            </Fragment>
          ))
        )}
      </div>
    </div>
  );
}
