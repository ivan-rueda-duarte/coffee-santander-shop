"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { BotonEnlace } from "../marca/boton";
import { Antetitulo } from "../marca/etiquetas";
import { Textura } from "../marca/superficies";

/**
 * Hueco del mapa mientras no está: misma caja que el mapa (ancho máximo y proporción del viewBox de
 * mapa-santander.json, escrita aquí para no meter el JSON en el JS inicial). Con el mapa justo bajo la portada (M4),
 * un hueco de otro alto movería la página al cargar (CLS).
 */
function HuecoMapa({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mx-auto grid aspect-[1048/1246.5] w-full max-w-[640px] place-items-center rounded-lg bg-surface" aria-hidden={children ? undefined : true}>
      {children}
    </div>
  );
}

// El mapa pesa más que el resto de la página: se descarga cuando su sección está por entrar en pantalla.
const MapaProvincias = dynamic(() => import("./mapa-provincias"), {
  ssr: false,
  loading: () => (
    <HuecoMapa>
      <p className="body text-ink-muted">Cargando el mapa…</p>
    </HuecoMapa>
  ),
});

export function SeccionMapa({ fuente }: { fuente: string }) {
  const ref = useRef<HTMLElement>(null);
  const [cerca, setCerca] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || cerca) return;
    if (!("IntersectionObserver" in window)) {
      const cuadro = requestAnimationFrame(() => setCerca(true));
      return () => cancelAnimationFrame(cuadro);
    }
    const obs = new IntersectionObserver(
      (entradas) => entradas.some((e) => e.isIntersecting) && setCerca(true),
      { rootMargin: "500px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [cerca]);

  return (
    <Textura trama="claro" como="section" id="mapa" aria-labelledby="titulo-mapa" className="scroll-mt-20 bg-surface-sunken px-5 py-16 md:px-8 md:py-20">
      <div ref={ref as React.RefObject<HTMLDivElement>} className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Antetitulo>Santander por provincias</Antetitulo>
          <h2 id="titulo-mapa" className="display-l mt-3 text-ink-title max-md:!text-[36px] max-md:!leading-[42px]">
            Santander, <em className="font-normal">provincia a provincia</em>
          </h2>
          <p className="body-l mt-4 max-w-md text-ink-muted">
            Elige una provincia para ver sus cafés y filtrar el catálogo. Los puntos marcan el municipio de cada café.
          </p>
          <BotonEnlace variante="enlace" tamano="sm" href="#catalogo" className="mt-4">
            Ir a los cafés
          </BotonEnlace>
          <p className="caption mt-6 max-w-md text-ink-muted">{fuente}</p>
        </div>
        <div>
          {cerca ? (
            <Suspense fallback={<HuecoMapa />}>
              <MapaProvincias />
            </Suspense>
          ) : (
            <HuecoMapa />
          )}
        </div>
      </div>
    </Textura>
  );
}
