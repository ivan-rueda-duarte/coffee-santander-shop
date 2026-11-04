import clsx from "clsx";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { asset } from "@/ui/asset";

/** Franja de bandera: bloque grana al 20 % y cinco líneas. A sangre, pegada al borde inferior. */
export function Franja({ variante = "normal", className }: { variante?: "normal" | "fina" | "regla"; className?: string }) {
  return (
    <div aria-hidden="true" className={clsx("ds-franja", variante === "fina" && "ds-franja--fina", variante === "regla" && "ds-franja--rule", className)}>
      <span className="ds-franja__rojo" />
      <span className="ds-franja__lineas">
        <span /><span /><span /><span /><span />
      </span>
    </div>
  );
}

/** Contenedor con curvas de nivel (una trama por pieza) y, si se pide, grano de papel. */
export type TramaTopo = "claro" | "oscuro" | "tierra" | "arcilla";
export function Textura({
  trama,
  grano = true,
  como: Tag = "div",
  className,
  style,
  children,
  ...resto
}: {
  trama?: TramaTopo;
  grano?: boolean;
  como?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
  "aria-labelledby"?: string;
  "data-theme"?: "light" | "dark";
}) {
  return (
    <Tag
      className={clsx(trama && "ds-topo", trama === "oscuro" && "ds-topo--oscuro", trama === "tierra" && "ds-topo--tierra", trama === "arcilla" && "ds-topo--arcilla", grano && "ds-grano", className)}
      style={style}
      {...resto}
    >
      {children}
    </Tag>
  );
}

/** Foto de origen o de producto con el velo cálido terracota de la marca. */
export function Foto({
  src,
  alt,
  ancho,
  alto,
  credito,
  redondeada = true,
  scrim,
  prioridad,
  className,
}: {
  src: string;
  alt: string;
  ancho: number;
  alto: number;
  credito?: string;
  redondeada?: boolean;
  scrim?: boolean;
  prioridad?: boolean;
  className?: string;
}) {
  const ruta = src.startsWith("/") ? asset(src) : src;
  return (
    <figure className={clsx("ds-photo", redondeada && "ds-photo--round", scrim && "ds-photo--scrim", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- exportación estática: sin optimizador de imágenes */}
      <img src={ruta} alt={alt} width={ancho} height={alto} loading={prioridad ? "eager" : "lazy"} decoding="async" />
      {credito && <figcaption className="ds-photo__caption">{credito}</figcaption>}
    </figure>
  );
}

/** Hoja de cafeto en hoja-400, cortada por el borde del contenedor (ilustración plana). */
export function Hoja({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 200 200" className={clsx("ds-leaf", className)} style={style}>
      <path d="M10 190C10 90 80 20 190 10 190 110 120 180 10 190Z" />
      <line x1="10" y1="190" x2="150" y2="50" />
    </svg>
  );
}

/** Bolsa ilustrada para cafés sin fotografía (se compone sobre arenisca con curvas de nivel de tierra). */
export function BolsaIlustrada({ tueste, nombre }: { tueste: "claro" | "medio" | "oscuro"; nombre: string }) {
  const color = { claro: "var(--hoja-600)", medio: "var(--tostado-600)", oscuro: "var(--tostado-900)" }[tueste];
  return (
    <div className="ds-topo ds-topo--tierra ds-grano absolute inset-0 bg-arenisca-200" role="img" aria-label={`Bolsa de ${nombre}`}>
      <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false" style={{ zIndex: 1 }}>
        <path d="M70 90 82 70h136l12 20 14 262c0 8-6 14-14 14H70c-8 0-14-6-14-14L70 90Z" fill={color} />
        <path d="M82 70h136l12 20H70l12-20Z" fill="var(--carbon-900)" opacity=".28" />
        <rect x="92" y="170" width="116" height="106" rx="14" fill="var(--pergamino-50)" />
        <g fill="var(--grana-600)"><circle cx="128" cy="222" r="9" /><circle cx="150" cy="212" r="9" /><circle cx="172" cy="224" r="9" /></g>
        <circle cx="150" cy="236" r="9" fill="var(--grana-400)" />
        <path d="M118 188c14-14 44-14 64 0-20 14-50 14-64 0Z" fill="var(--hoja-400)" />
        <rect x="104" y="120" width="92" height="6" rx="3" fill="var(--oro-500)" />
        <rect x="116" y="134" width="68" height="4" rx="2" fill="var(--pergamino-50)" opacity=".7" />
      </svg>
    </div>
  );
}
