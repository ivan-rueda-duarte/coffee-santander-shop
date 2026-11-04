"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { Antetitulo } from "../marca/etiquetas";
import { Textura } from "../marca/superficies";

// El mapa pesa más que el resto de la página: se descarga cuando su sección está por entrar en pantalla.
const MapaProvincias = dynamic(() => import("./mapa-provincias"), {
  ssr: false,
  loading: () => <p className="body py-24 text-center text-ink-muted">Cargando el mapa…</p>,
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
            Explora por <em className="font-normal">provincia</em>
          </h2>
          <p className="body-l mt-4 max-w-md text-ink-muted">
            Toca una provincia para filtrar el catálogo; vuelve a tocarla para quitarla. Los puntos marcan el municipio de cada café.
          </p>
          <p className="caption mt-6 max-w-md text-ink-muted">{fuente} Tona, por verificar.</p>
        </div>
        <div>
          {cerca ? (
            <Suspense fallback={null}>
              <MapaProvincias />
            </Suspense>
          ) : (
            <div className="mx-auto aspect-[1048/1246] w-full max-w-[640px] rounded-lg bg-surface" aria-hidden="true" />
          )}
        </div>
      </div>
    </Textura>
  );
}
