"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatearCOP } from "@/domain/comun/dinero";
import { calcularEnvio, nombreDestino, totalConEnvio } from "@/domain/envio/envio";
import { ANCLA_ENVIO_GRATIS, avisoTerminacion, notaVerificacionResumen, TEXTOS_ENVIO_GRATIS } from "@/domain/envio/envio-gratis";
import { textoPlazoResumen } from "@/domain/envio/plazos";
import type { DestinoEnvio } from "@/domain/envio/tipos";
import { leyendaIva } from "@/domain/pedido/iva";
import { etiquetaBolsas, type Totales } from "@/domain/pedido/totales";
import { useCatalogo } from "@/ui/hooks/use-catalogo";

/**
 * Subtotal, envío y total del pedido. Con destino (departamento y municipio) calcula el envío por zona y
 * muestra el plazo de entrega de esa zona (microcopy §5.6); sin destino dice que se calcula al elegir la ciudad.
 * Bajo el subtotal va la leyenda de IVA (§1.4). Se recalcula solo cuando cambia el carrito o el destino.
 * Con envío gratis por comuna (diseño 2026-11-09 §2 y §3; microcopy §8.3 y §8.6): «$0» con la etiqueta en contorno,
 * la nota con la tarifa y el total alternativos y el plazo propio de la promoción; en el cajón, una línea que
 * menciona la promoción. Los `data-testid` son estables: linea-subtotal, leyenda-iva, linea-envio, linea-plazo,
 * linea-total, etiqueta-envio-gratis, referencia-tarifa, anuncio-envio-gratis.
 */
export function TotalesPedido({
  totales,
  destino,
  ciudadDespacho,
  className = "",
  alNavegar,
}: {
  totales: Totales;
  destino: DestinoEnvio | null;
  /** Se muestra junto al aviso cuando todavía no hay destino (cajón del carrito). */
  ciudadDespacho?: string;
  className?: string;
  /** Al pulsar un enlace (el cajón se cierra). */
  alNavegar?: () => void;
}) {
  const { catalogo } = useCatalogo();
  const envio = useMemo(() => (destino && totales.lineas.length ? calcularEnvio(totales.lineas, destino, catalogo.envios) : null), [destino, totales.lineas, catalogo.envios]);
  const total = envio ? totalConEnvio(totales.subtotalCop, envio) : null;
  const plazo = envio ? textoPlazoResumen(catalogo.envios.plazos, envio) : null;

  return (
    <div className={className}>
      <dl className="space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-4" data-testid="linea-subtotal">
          <dt>
            Subtotal <span className="text-ink-muted">· {etiquetaBolsas(totales.bolsas)}</span>
            <span className="caption block text-ink-muted" data-testid="leyenda-iva">{leyendaIva(catalogo.tienda.ivaTarifa)}</span>
          </dt>
          <dd className="font-bold tabular-nums text-ink-title">{formatearCOP(totales.subtotalCop)}</dd>
        </div>

        {envio === null && (
          <div className="flex justify-between gap-4 text-ink-muted" data-testid="linea-envio">
            <dt>Envío</dt>
            <dd className="text-right">
              Se calcula al elegir tu ciudad{ciudadDespacho ? ` · desde ${ciudadDespacho}` : ""}
              {/* Cajón (§3): con la promoción vigente, el anuncio; la condición va en la misma frase (LEG-107).
                  Terminada (§8.6.1), el aviso de terminación en el mismo lugar y estilo durante 30 días. */}
              {ciudadDespacho && (catalogo.envios.envioGratis || catalogo.envios.finEnvioGratis?.avisoVisible) && (
                <span className="caption mt-1 block" data-testid="anuncio-envio-gratis">
                  {catalogo.envios.envioGratis ? TEXTOS_ENVIO_GRATIS.anuncio : avisoTerminacion(catalogo.envios.finEnvioGratis!)}{" "}
                  <Link href={`/envios/#${ANCLA_ENVIO_GRATIS}`} className="underline underline-offset-4" onClick={alNavegar}>
                    {TEXTOS_ENVIO_GRATIS.enlaceAnuncio}
                  </Link>
                </span>
              )}
            </dd>
          </div>
        )}

        {envio?.tipo === "tarifa" && destino && (
          <div className="flex items-baseline justify-between gap-4" data-testid="linea-envio">
            <dt>
              Envío a {nombreDestino(destino.municipio)} <span className="text-ink-muted">· zona {envio.zona}</span>
              {plazo && <span className="caption block text-ink-muted" data-testid="linea-plazo">{plazo}</span>}
            </dt>
            <dd className="font-bold tabular-nums text-ink-title">{formatearCOP(envio.valorCop)}</dd>
          </div>
        )}

        {envio?.tipo === "gratis" && destino && (
          // Rejilla: rótulo | «Envío gratis» $0 en la primera fila; la nota y el plazo a todo el ancho debajo (a 360 px no caben en una columna).
          // pt-1: la etiqueta (26 px) sobresale de la línea de 20 px del rótulo; sin él roza la leyenda de IVA de arriba.
          <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 pt-1" data-testid="linea-envio">
            <dt>
              Envío a {nombreDestino(destino.municipio)} <span className="text-ink-muted">· zona {envio.zona} · {envio.comuna}</span>
            </dt>
            {/* «$0, no precio tachado» (diseño §2); la etiqueta va junto al valor (microcopy §8.3), en contorno y sin hover.
                items-baseline (no items-center ni self-start): «Envío gratis» y «$0» comparten la línea base de «Envío a …». */}
            <dd className="flex flex-wrap items-baseline justify-end gap-x-2 gap-y-1">
              <span className="ds-tag ds-tag--outline !border-monte-900 !font-bold !text-ink-title" data-testid="etiqueta-envio-gratis">{TEXTOS_ENVIO_GRATIS.etiqueta}</span>
              <span className="whitespace-nowrap font-bold tabular-nums text-ink-title">{formatearCOP(0)}</span>
            </dd>
            <dd className="col-span-2 mt-1">
              <span className="caption block text-ink-muted" data-testid="referencia-tarifa">{notaVerificacionResumen(envio, totales.subtotalCop)}</span>
              {plazo && <span className="caption mt-1 block text-ink-muted" data-testid="linea-plazo">{plazo}</span>}
            </dd>
          </div>
        )}

        {envio?.tipo === "por_cotizar" && (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4" data-testid="linea-envio">
            <dt>
              Envío
              {plazo && <span className="caption block text-ink-muted sm:max-w-[14rem]" data-testid="linea-plazo">{plazo}</span>}
            </dt>
            <dd className="font-semibold text-ink-title sm:max-w-[16rem] sm:text-right">Por cotizar · te confirmamos el valor por WhatsApp antes de que pagues</dd>
          </div>
        )}

        {total && (
          <div className="flex justify-between gap-4 border-t border-line pt-2 text-base" data-testid="linea-total">
            <dt className="font-bold">{total.sinEnvio ? "Total sin envío" : "Total"}</dt>
            <dd className="font-extrabold tabular-nums text-ink-title">{formatearCOP(total.totalCop)}</dd>
          </div>
        )}
      </dl>
      <p className="caption mt-2 text-ink-muted">
        <Link href="/envios/" className="underline underline-offset-4" onClick={alNavegar}>
          Cómo calculamos el envío
        </Link>
      </p>
    </div>
  );
}
