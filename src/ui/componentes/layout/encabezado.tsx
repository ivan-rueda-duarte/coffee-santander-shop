"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FocusEvent } from "react";
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

/** M3: mismos destinos en celular (tira) y escritorio, en el orden de las secciones del inicio. */
const ENLACES = [
  { href: "/#mapa", texto: "Mapa" },
  { href: "/#catalogo", texto: "Cafés" },
  { href: "/#pedir", texto: "Cómo pedir" },
  { href: "/#historia", texto: "Historia" },
  { href: "/envios/", texto: "Envíos" },
];

/**
 * QA-027: Chromium no desplaza un contenedor al enfocar un elemento que ya se ve en parte, y «Envíos» quedaba bajo el
 * fundido. Al enfocar un enlace de la tira se desplaza solo lo necesario; scroll-px-6 lo saca del fundido de 24 px.
 * Sin «smooth»: el desplazamiento es instantáneo y respeta prefers-reduced-motion.
 */
function traerALaVista(e: FocusEvent<HTMLUListElement>) {
  if (e.target instanceof HTMLAnchorElement) e.target.scrollIntoView({ inline: "nearest", block: "nearest" });
}

const sinBarraFinal = (ruta: string) => (ruta.length > 1 ? ruta.replace(/\/+$/, "") : ruta);

/** «page» solo para enlaces a otra página (los de «#» del inicio nunca llevan aria-current). */
function actual(href: string, ruta: string): "page" | undefined {
  return !href.includes("#") && sinBarraFinal(href) === sinBarraFinal(ruta) ? "page" : undefined;
}

export function Encabezado() {
  const { totales, abrirCajon } = useCarrito();
  const bolsas = totales.bolsas;
  const ruta = usePathname();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-sm" data-theme="light">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:gap-4 md:px-8">
          <Marca />
          <nav aria-label="Principal" className="hidden items-center gap-7 text-sm font-semibold text-ink md:flex">
            {ENLACES.map((e) => (
              <Link key={e.href} href={e.href} aria-current={actual(e.href, ruta)} className="underline-offset-8 hover:underline aria-[current=page]:underline aria-[current=page]:decoration-2">
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
            <span className="max-[359px]:sr-only">Pedido</span>
            {bolsas > 0 && (
              <span className="grid min-w-5 place-items-center rounded-pill bg-monte-900 px-1.5 text-xs font-bold text-pergamino-50 tabular-nums">
                {bolsas}
                <span className="sr-only"> {bolsas === 1 ? "bolsa" : "bolsas"}</span>
              </span>
            )}
          </button>
        </div>
      </header>
      {/* M3: tira de navegación en celular. Hermana del encabezado fijo (no es fija: se va con el desplazamiento y no cambia
          el alto del encabezado). Nunca coincide en pantalla con la navegación de escritorio. No aparece en /pedido/.
          El contorno de foco va hacia dentro (con «!», porque :focus-visible de globals.css no está en una capa) para que
          overflow-x-auto no lo recorte. */}
      {!ruta.startsWith("/pedido") && (
        <nav aria-label="Principal" className="border-b border-line bg-surface md:hidden" data-theme="light" data-testid="tira-navegacion">
          <ul
            onFocus={traerALaVista}
            className="flex scroll-px-6 overflow-x-auto overscroll-x-contain px-2 pr-6 [scrollbar-width:none] [mask-image:linear-gradient(to_right,#000_calc(100%-24px),transparent)] [&::-webkit-scrollbar]:hidden">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  aria-current={actual(e.href, ruta)}
                  className="small inline-flex min-h-11 items-center whitespace-nowrap px-3 font-semibold text-ink underline-offset-8 hover:underline focus-visible:-outline-offset-2! aria-[current=page]:underline aria-[current=page]:decoration-2"
                >
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
