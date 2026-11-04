import type { ReactElement, ReactNode } from "react";
import type { Provincia } from "@/domain/catalogo/tipos";
import type { DatosMapa } from "@/domain/mapa/tipos";

/** Prefijo para que dos mapas en la misma página no compartan el id del rayado. */
export const idRayado = (prefijo: string) => `${prefijo}-rayado`;

/**
 * Dibuja el departamento: un grupo por provincia con sus municipios rellenos del color de su familia,
 * rayado para los municipios con provincia por verificar (Tona), límites de provincia y contorno.
 * `envolver` permite al mapa interactivo hacer clicable cada grupo.
 */
export function DibujoDepartamento({
  datos,
  provincias,
  prefijo,
  colorDe,
  envolver,
  children,
}: {
  datos: DatosMapa;
  provincias: readonly Provincia[];
  prefijo: string;
  /** Sustituye el color de un municipio (mini mapa). */
  colorDe?: (municipioSlug: string, provinciaSlug: string | null, colorProvincia: string | null) => string | undefined;
  envolver?: (provincia: Provincia, hijos: ReactNode) => ReactElement;
  children?: ReactNode;
}) {
  const rayado = idRayado(prefijo);
  const color = new Map(provincias.map((p) => [p.slug, p.colorHex]));
  const porVerificar = datos.municipios.filter((m) => !m.provincia);
  const otras = datos.municipios.filter((m) => m.provincia && !color.has(m.provincia));

  return (
    <>
      <defs>
        <pattern id={rayado} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#96a3ad" strokeWidth="1.2" />
        </pattern>
      </defs>
      {provincias.map((p) => {
        const hijos = datos.municipios
          .filter((m) => m.provincia === p.slug)
          .map((m) => (
            <path key={m.slug} d={m.d} className="mpio" data-municipio={m.slug} fill={colorDe?.(m.slug, p.slug, p.colorHex) ?? p.colorHex}>
              <title>{`${m.nombre} · ${p.nombre}`}</title>
            </path>
          ));
        return envolver ? (
          envolver(p, hijos)
        ) : (
          <g key={p.slug} data-provincia={p.slug}>
            {hijos}
          </g>
        );
      })}
      <g data-provincia="otras">
        {otras.map((m) => (
          <path key={m.slug} d={m.d} className="mpio" fill="var(--surface-sunken)" />
        ))}
      </g>
      <g data-provincia="por-verificar">
        {porVerificar.map((m) => (
          <g key={m.slug}>
            <path d={m.d} className="mpio" fill="var(--surface-sunken)" />
            <path d={m.d} fill={`url(#${rayado})`}>
              <title>{`${m.nombre} · provincia por verificar`}</title>
            </path>
          </g>
        ))}
      </g>
      <path d={datos.limitesProvincia} className="limites" fill="none" />
      <path d={datos.contorno} className="contorno" fill="none" />
      {children}
    </>
  );
}
