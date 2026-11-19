"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { EntradaCapa } from "@/domain/mapa/capa";

export const ID_MAPA = "mapa-provincias";

/** Provincia pulsada antes de que llegara la interacción (clic, toque, Enter o espacio) y con qué: se repite al llegar. */
export interface Pulsada {
  slug: string;
  /** `pointerType` del clic ("mouse", "touch", "pen") o "teclado". */
  puntero: string;
}

type Interaccion = (typeof import("./interaccion-mapa"))["default"];

/** Pide la interacción en cuanto la URL trae provincias (al cargar o al elegirlas con los chips del catálogo). */
function VigiaUrl({ alPedir }: { alPedir: () => void }) {
  const conProvincias = useSearchParams().has("provincia");
  useEffect(() => {
    if (conProvincias) alPedir();
  }, [conProvincias, alPedir]);
  return null;
}

/**
 * Isla del mapa. El mapa y su capa de textos vienen hechos del build (`children`); la interacción
 * (≈ 12,6 KB gzip, con la tarjeta y su posicionamiento) se descarga cuando hace falta, nunca en la carga inicial
 * (QA-018, O-1):
 * - cuando el mapa se acerca a la pantalla (a 200 px) o cambia cuánto se ve de él al desplazarse;
 * - si ya estaba a la vista al cargar (escritorio), con el primer gesto del visitante en la página (mover el ratón,
 *   tocar, rueda, tecla) o al enfocar algo de la sección;
 * - si la URL trae provincias (el mapa tiene que encuadrarlas).
 * Si el visitante pulsa una provincia antes de que llegue, se anota el clic, el toque o la tecla y la interacción
 * los repite al montar.
 */
export function ActivadorMapa({ entrada, children }: { entrada: EntradaCapa; children: ReactNode }) {
  // Se importa a mano y no con lazy(): React retiene ~300 ms la salida de un <Suspense> que mostró su respaldo,
  // y el primer clic tardaría eso en encuadrar el mapa.
  const [InteraccionMapa, setInteraccion] = useState<Interaccion | null>(null);
  const pendiente = useRef<{ listo: boolean; pulsada?: Pulsada }>({ listo: false });
  const pedida = useRef(false);
  const activar = useCallback(() => {
    if (pedida.current) return;
    pedida.current = true;
    import("./interaccion-mapa").then(
      (m) => setInteraccion(() => m.default),
      // Sin red: el mapa sigue como vino del HTML y el siguiente gesto lo vuelve a intentar.
      () => (pedida.current = false),
    );
  }, []);
  /** La interacción lo llama al montar: desde ahí atiende ella los eventos. */
  const tomarPendiente = useCallback(() => {
    const p = pendiente.current.pulsada;
    pendiente.current = { listo: true };
    return p;
  }, []);

  useEffect(() => {
    const mapa = document.getElementById(ID_MAPA);
    const seccion = mapa?.closest("section") ?? mapa;
    if (!mapa || !seccion) return;
    let puntero = "mouse";
    const anotar = (e: Event) => {
      const g = e.target instanceof Element ? e.target.closest<SVGGElement>("g.prov--activa") : null;
      if (pendiente.current.listo || !g?.dataset.provincia) return;
      if (e instanceof KeyboardEvent && e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      pendiente.current.pulsada = { slug: g.dataset.provincia, puntero: e instanceof KeyboardEvent ? "teclado" : puntero };
      activar();
    };
    // Cerca: el mapa está a menos de 200 px de la pantalla. La primera respuesta del observador es el estado al cargar;
    // las siguientes llegan porque el visitante se desplazó (o cambió el tamaño de la ventana).
    let cerca = false;
    let primera = true;
    const obs = new IntersectionObserver(
      (entradas) => {
        cerca = entradas.some((e) => e.isIntersecting);
        if (!primera && cerca) activar();
        primera = false;
      },
      { rootMargin: "200px 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    obs.observe(mapa);
    const gesto = (e: Event) => {
      if (e instanceof PointerEvent && e.type === "pointerdown") puntero = e.pointerType;
      if (cerca) activar();
    };
    const gestos = ["pointermove", "pointerdown", "wheel", "touchstart", "keydown"] as const;
    for (const t of gestos) window.addEventListener(t, gesto, { passive: true, capture: true });
    seccion.addEventListener("focusin", activar);
    mapa.addEventListener("click", anotar);
    mapa.addEventListener("keydown", anotar);
    return () => {
      obs.disconnect();
      for (const t of gestos) window.removeEventListener(t, gesto, { capture: true });
      seccion.removeEventListener("focusin", activar);
      mapa.removeEventListener("click", anotar);
      mapa.removeEventListener("keydown", anotar);
    };
  }, [activar]);

  return (
    <>
      <Suspense fallback={null}>
        <VigiaUrl alPedir={activar} />
      </Suspense>
      {InteraccionMapa ? (
        <Suspense fallback={children}>
          <InteraccionMapa entrada={entrada} tomarPendiente={tomarPendiente} />
        </Suspense>
      ) : (
        children
      )}
    </>
  );
}
