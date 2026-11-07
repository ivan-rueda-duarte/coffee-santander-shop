"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatearCOP } from "@/domain/comun/dinero";
import { calcularEnvio, nombreDestino, totalConEnvio } from "@/domain/envio/envio";
import { textoPlazoResumen } from "@/domain/envio/plazos";
import type { DestinoEnvio } from "@/domain/envio/tipos";
import { leyendaIva } from "@/domain/pedido/iva";
import { etiquetaBolsas, type Totales } from "@/domain/pedido/totales";
import { useCatalogo } from "@/ui/hooks/use-catalogo";

/**
 * Subtotal, envío y total del pedido. Con destino (departamento y municipio) calcula el envío por zona y
 * muestra el plazo de entrega de esa zona (microcopy §5.6); sin destino dice que se calcula al elegir la ciudad.
 * Bajo el subtotal va la leyenda de IVA (§1.4). Se recalcula solo cuando cambia el carrito o el destino.
 * Los `data-testid` son estables: linea-subtotal, leyenda-iva, linea-envio, linea-plazo, linea-total.
 */
export function TotalesPedido({
  totales,
  destino,
  ciudadDespacho,
  className = "",
}: {
  totales: Totales;
  destino: DestinoEnvio | null;
  /** Se muestra junto al aviso cuando todavía no hay destino (cajón del carrito). */
  ciudadDespacho?: string;
  className?: string;
}) {
  const { catalogo } = useCatalogo();
  const envio = useMemo(() => (destino && totales.lineas.length ? calcularEnvio(totales.lineas, destino, catalogo.envios) : null), [destino, totales.lineas, catalogo.envios]);
  const total = envio ? totalConEnvio(totales.subtotalCop, envio) : null;
  const plazo = envio ? textoPlazoResumen(catalogo.envios.plazos, envio) : null;

  return (
    <div className={className}>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4" data-testid="linea-subtotal">
          <dt>
            Subtotal <span className="text-ink-muted">· {etiquetaBolsas(totales.bolsas)}</span>
            <span className="caption block text-ink-muted" data-testid="leyenda-iva">{leyendaIva(catalogo.tienda.ivaTarifa)}</span>
          </dt>
          <dd className="font-bold tabular-nums text-ink-title">{formatearCOP(totales.subtotalCop)}</dd>
        </div>

        {envio === null && (
          <div className="flex justify-between gap-4 text-ink-muted" data-testid="linea-envio">
            <dt>Envío</dt>
            <dd className="text-right">Se calcula al elegir tu ciudad{ciudadDespacho ? ` · desde ${ciudadDespacho}` : ""}</dd>
          </div>
        )}

        {envio?.tipo === "tarifa" && destino && (
          <div className="flex justify-between gap-4" data-testid="linea-envio">
            <dt>
              Envío a {nombreDestino(destino.municipio)} <span className="text-ink-muted">· zona {envio.zona}</span>
              {plazo && <span className="caption block text-ink-muted" data-testid="linea-plazo">{plazo}</span>}
            </dt>
            <dd className="font-bold tabular-nums text-ink-title">{formatearCOP(envio.valorCop)}</dd>
          </div>
        )}

        {envio?.tipo === "por_cotizar" && (
          <div className="flex justify-between gap-4" data-testid="linea-envio">
            <dt>
              Envío
              {plazo && <span className="caption block max-w-[14rem] text-ink-muted" data-testid="linea-plazo">{plazo}</span>}
            </dt>
            <dd className="max-w-[16rem] text-right font-semibold text-ink-title">Por cotizar · te confirmamos el valor por WhatsApp antes de que pagues</dd>
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
        <Link href="/envios/" className="underline underline-offset-4">
          Cómo calculamos el envío
        </Link>
      </p>
    </div>
  );
}
