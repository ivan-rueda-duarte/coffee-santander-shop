"use client";

import * as Slider from "@radix-ui/react-slider";
import { useId, useState } from "react";
import type { Rango } from "@/domain/catalogo/filtros";

/** Rango doble (Radix Slider). Mientras se arrastra solo cambia lo que se ve; la URL se actualiza al soltar. */
export default function FiltroRango({
  leyenda,
  limites,
  paso,
  valor,
  formato,
  alConfirmar,
}: {
  leyenda: string;
  limites: Rango;
  paso: number;
  valor: Rango | null;
  formato: (n: number) => string;
  alConfirmar: (nuevo: Rango | null) => void;
}) {
  const id = useId();
  const efectivo: Rango = valor ?? limites;
  const [local, setLocal] = useState<Rango>(efectivo);
  // Si el valor cambia desde fuera (otro control, enlace, «Limpiar»), el deslizador lo sigue.
  const [previo, setPrevio] = useState<Rango>(efectivo);
  if (previo[0] !== efectivo[0] || previo[1] !== efectivo[1]) {
    setPrevio(efectivo);
    setLocal(efectivo);
  }

  return (
    <fieldset>
      <legend id={id} className="overline mb-2 text-ink-muted">{leyenda}</legend>
      <Slider.Root
        className="relative flex h-6 w-full touch-none select-none items-center"
        min={limites[0]}
        max={limites[1]}
        step={paso}
        minStepsBetweenThumbs={0}
        value={[...local]}
        onValueChange={(v) => setLocal([v[0], v[1]])}
        onValueCommit={(v) => alConfirmar(v[0] <= limites[0] && v[1] >= limites[1] ? null : [v[0], v[1]])}
        aria-labelledby={id}
      >
        <Slider.Track className="relative h-1 grow rounded-pill bg-line">
          <Slider.Range className="absolute h-full rounded-pill bg-monte-900" />
        </Slider.Track>
        {["mínimo", "máximo"].map((lado) => (
          <Slider.Thumb key={lado} aria-label={`${leyenda}, ${lado}`} className="block h-5 w-5 rounded-full border-2 border-monte-900 bg-pergamino-0 focus-visible:outline-2" />
        ))}
      </Slider.Root>
      <p className="mt-1 flex justify-between text-sm font-medium tabular-nums">
        <span>{formato(local[0])}</span>
        <span>{formato(local[1])}</span>
      </p>
    </fieldset>
  );
}
