"use client";

import Link from "next/link";
import { useCarrito } from "../carrito/carrito-provider";
import { IconoBolsa } from "../marca/iconos";

export function Marca({ pie }: { pie?: boolean }) {
  return (
    <Link href="/" className="ds-wordmark">
      <span className="ds-wordmark__name" style={pie ? { fontSize: 26 } : undefined}>De Santander</span>
      <span className="ds-wordmark__tag">Café de origen</span>
    </Link>
  );
}

const ENLACES = [
  { href: "/#catalogo", texto: "Cafés" },
  { href: "/#mapa", texto: "Mapa" },
  { href: "/#pedir", texto: "Cómo pedir" },
  { href: "/#historia", texto: "Historia" },
];

export function Encabezado() {
  const { totales, abrirCajon } = useCarrito();
  const bolsas = totales.bolsas;
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-sm" data-theme="light">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <Marca />
        <nav aria-label="Principal" className="hidden items-center gap-7 text-sm font-semibold text-ink md:flex">
          {ENLACES.map((e) => (
            <Link key={e.href} href={e.href} className="underline-offset-8 hover:underline">
              {e.texto}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          id="boton-pedido"
          onClick={abrirCajon}
          className="ds-btn ds-btn--secondary ds-btn--sm"
        >
          <IconoBolsa className="ds-btn__icon" />
          <span>Pedido</span>
          {bolsas > 0 && (
            <span className="grid min-w-5 place-items-center rounded-pill bg-monte-900 px-1.5 text-xs font-bold text-pergamino-50 tabular-nums">
              {bolsas}
              <span className="sr-only"> {bolsas === 1 ? "bolsa" : "bolsas"}</span>
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
