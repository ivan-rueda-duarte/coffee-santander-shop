"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

interface Aviso {
  mensaje: string;
  accion?: { etiqueta: string; alPulsar: () => void };
}

interface Valor {
  avisar: (mensaje: string, accion?: Aviso["accion"]) => void;
  /** Quita el aviso visible (p. ej. al abrir el cajón, para que no tape sus botones). */
  descartar: () => void;
}

const Contexto = createContext<Valor>({ avisar: () => {}, descartar: () => {} });

type Pausa = "cursor" | "foco";

/**
 * Avisos breves (toast) con una acción opcional, p. ej. «Deshacer». Se anuncian a lectores de pantalla.
 * El tiempo se detiene mientras el cursor está encima o el foco dentro, y sigue al salir (WCAG 2.2.1, M10).
 */
export function AvisosProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);
  const restante = useRef(0);
  const inicio = useRef(0);
  const pausas = useRef(new Set<Pausa>());

  const programar = useCallback(() => {
    clearTimeout(temporizador.current);
    temporizador.current = undefined;
    if (pausas.current.size > 0) return;
    inicio.current = Date.now();
    temporizador.current = setTimeout(() => {
      temporizador.current = undefined;
      pausas.current.clear();
      setAviso(null);
    }, restante.current);
  }, []);

  const avisar = useCallback(
    (mensaje: string, accion?: Aviso["accion"]) => {
      setAviso({ mensaje, accion });
      restante.current = accion ? 6000 : 3200;
      programar();
    },
    [programar],
  );

  const descartar = useCallback(() => {
    clearTimeout(temporizador.current);
    temporizador.current = undefined;
    pausas.current.clear();
    setAviso(null);
  }, []);

  const pausar = useCallback((motivo: Pausa) => {
    if (temporizador.current !== undefined) {
      clearTimeout(temporizador.current);
      temporizador.current = undefined;
      restante.current = Math.max(0, restante.current - (Date.now() - inicio.current));
    }
    pausas.current.add(motivo);
  }, []);

  const reanudar = useCallback(
    (motivo: Pausa) => {
      if (!pausas.current.delete(motivo)) return;
      programar();
    },
    [programar],
  );

  useEffect(() => () => clearTimeout(temporizador.current), []);
  const valor = useMemo(() => ({ avisar, descartar }), [avisar, descartar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 max-md:bottom-24">
        {aviso && (
          <div
            data-aviso
            onMouseEnter={() => pausar("cursor")}
            onMouseLeave={() => reanudar("cursor")}
            onFocus={() => pausar("foco")}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) reanudar("foco");
            }}
            className="pointer-events-auto flex max-w-md items-center gap-4 rounded-pill bg-tostado-900 py-3 pl-5 pr-3 text-sm font-medium text-pergamino-50 shadow-md"
          >
            <span>{aviso.mensaje}</span>
            {aviso.accion && (
              <button
                type="button"
                className="ds-btn ds-btn--gold ds-btn--sm"
                onClick={() => {
                  aviso.accion?.alPulsar();
                  descartar();
                }}
              >
                {aviso.accion.etiqueta}
              </button>
            )}
          </div>
        )}
      </div>
    </Contexto.Provider>
  );
}

export const useAvisos = () => useContext(Contexto);
