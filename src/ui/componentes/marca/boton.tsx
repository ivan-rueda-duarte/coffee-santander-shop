import clsx from "clsx";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Variantes del botón (docs/marca-v4.1.md): el CTA principal es siempre verde bosque (`primario`);
 * `origen` es un enlace con borde terracota, nunca relleno; `oro` solo sobre fondos oscuros;
 * `sobreFoto` es el único permitido sobre fotografía.
 */
export type VarianteBoton = "primario" | "origen" | "oro" | "secundario" | "enlace" | "sobreFoto";
export type TamanoBoton = "sm" | "md" | "lg";

const CLASE_VARIANTE: Record<VarianteBoton, string> = {
  primario: "ds-btn--primary",
  origen: "ds-btn--accent",
  oro: "ds-btn--gold",
  secundario: "ds-btn--secondary",
  enlace: "ds-btn--ghost",
  sobreFoto: "ds-btn--on-photo",
};

function clases(variante: VarianteBoton, tamano: TamanoBoton, bloque?: boolean, className?: string) {
  return clsx("ds-btn", CLASE_VARIANTE[variante], tamano === "sm" && "ds-btn--sm", tamano === "lg" && "ds-btn--lg", bloque && "w-full", className);
}

interface ComunProps {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  bloque?: boolean;
  children: ReactNode;
}

export function Boton({ variante = "primario", tamano = "md", bloque, className, type = "button", children, ...resto }: ComunProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={clases(variante, tamano, bloque, className)} {...resto}>
      {children}
    </button>
  );
}

/** Enlace con aspecto de botón. Interno (`/…`) usa Link de Next; externo o ancla, <a>. */
export function BotonEnlace({
  variante = "primario",
  tamano = "md",
  bloque,
  className,
  href,
  children,
  ...resto
}: ComunProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const cls = clases(variante, tamano, bloque, className);
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls} {...resto}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} {...resto}>
      {children}
    </a>
  );
}
