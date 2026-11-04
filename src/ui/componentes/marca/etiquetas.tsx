import clsx from "clsx";
import type { ReactNode } from "react";

/** Nivel 1: dato técnico (municipio, altitud, proceso…). Silencioso, separado por punto medio. */
export function DatosTecnicos({ items, className }: { items: readonly (string | null | undefined | false)[]; className?: string }) {
  const visibles = items.filter((i): i is string => Boolean(i));
  if (visibles.length === 0) return null;
  return (
    <ul className={clsx("ds-tags", className)}>
      {visibles.map((i) => (
        <li key={i} className="ds-tag">
          {i}
        </li>
      ))}
    </ul>
  );
}

/** Nivel 2: clasificación con color de significado. Máximo dos por tarjeta. */
export type VariantePastilla = "region" | "cifra" | "segmento" | "tueste" | "limitada" | "agotado";
const CLASE_PASTILLA: Record<VariantePastilla, string> = {
  region: "ds-badge--region",
  cifra: "ds-badge--gold",
  segmento: "ds-badge--dark",
  tueste: "ds-badge--earth",
  limitada: "ds-badge--accent",
  agotado: "ds-badge--soldout",
};

export function Pastilla({ variante = "region", mayusculas, className, children }: { variante?: VariantePastilla; mayusculas?: boolean; className?: string; children: ReactNode }) {
  return <span className={clsx("ds-badge", CLASE_PASTILLA[variante], mayusculas && "ds-badge--overline", className)}>{children}</span>;
}

/** Nivel 3: sello circular del puntaje SCA. Solo con puntaje real verificado y ≥ 80 (lo decide quien lo usa). */
export function SelloSCA({ puntaje, tamano = "md", className }: { puntaje: number; tamano?: "sm" | "md" | "lg"; className?: string }) {
  const texto = Number.isInteger(puntaje) ? String(puntaje) : puntaje.toFixed(1).replace(".", ",");
  return (
    <span role="img" aria-label={`Puntaje SCA ${texto} de 100`} className={clsx("ds-seal", tamano === "sm" && "ds-seal--sm", tamano === "lg" && "ds-seal--lg", className)}>
      <span className="ds-seal__num" aria-hidden="true">{texto}</span>
      <span className="ds-seal__unit" aria-hidden="true">PTS<br />SCA</span>
    </span>
  );
}

/** Antetítulo: 12 px, 800, mayúsculas, tracking 0,2 em. Terracota sobre pergamino, oro sobre monte. */
export function Antetitulo({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx("overline text-eyebrow", className)}>{children}</p>;
}

/** Barra corta de acento (una por bloque). */
export function BarraAcento({ color = "verde", className }: { color?: "verde" | "terracota" | "oro" | "arenisca"; className?: string }) {
  return <span aria-hidden="true" className={clsx("ds-bar", color === "terracota" && "ds-bar--terracota", color === "oro" && "ds-bar--oro", color === "arenisca" && "ds-bar--arenisca", className)} />;
}
