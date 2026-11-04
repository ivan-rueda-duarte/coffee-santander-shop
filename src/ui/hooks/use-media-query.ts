"use client";

import { useSyncExternalStore } from "react";

/** true si la consulta CSS se cumple. En el servidor y en la primera pintura vale `inicial`. */
export function useMediaQuery(consulta: string, inicial = false): boolean {
  return useSyncExternalStore(
    (alCambiar) => {
      const mq = window.matchMedia(consulta);
      mq.addEventListener("change", alCambiar);
      return () => mq.removeEventListener("change", alCambiar);
    },
    () => window.matchMedia(consulta).matches,
    () => inicial,
  );
}

export const useMovimientoReducido = () => useMediaQuery("(prefers-reduced-motion: reduce)");
