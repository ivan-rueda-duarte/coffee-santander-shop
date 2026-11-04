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

/** Avisos breves (toast) con una acción opcional, p. ej. «Deshacer». Se anuncian a lectores de pantalla. */
export function AvisosProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  const avisar = useCallback((mensaje: string, accion?: Aviso["accion"]) => {
    clearTimeout(temporizador.current);
    setAviso({ mensaje, accion });
    temporizador.current = setTimeout(() => setAviso(null), accion ? 6000 : 3200);
  }, []);

  const descartar = useCallback(() => {
    clearTimeout(temporizador.current);
    setAviso(null);
  }, []);

  useEffect(() => () => clearTimeout(temporizador.current), []);
  const valor = useMemo(() => ({ avisar, descartar }), [avisar, descartar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 max-md:bottom-24">
        {aviso && (
          <div data-aviso className="pointer-events-auto flex max-w-md items-center gap-4 rounded-pill bg-tostado-900 py-3 pl-5 pr-3 text-sm font-medium text-pergamino-50 shadow-md">
            <span>{aviso.mensaje}</span>
            {aviso.accion && (
              <button
                type="button"
                className="ds-btn ds-btn--gold ds-btn--sm"
                onClick={() => {
                  aviso.accion?.alPulsar();
                  setAviso(null);
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
