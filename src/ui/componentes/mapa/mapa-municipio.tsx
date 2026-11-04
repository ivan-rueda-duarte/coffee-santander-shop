import type { Municipio, Provincia } from "@/domain/catalogo/tipos";
import { formatearGrados } from "@/domain/mapa/geometria";
import type { DatosMapa } from "@/domain/mapa/tipos";
import datosCrudos from "@/data/mapa-santander.json";
import { DibujoDepartamento } from "./dibujo-departamento";

const datos = datosCrudos as unknown as DatosMapa;

/** Mini mapa de la ficha: el departamento con la provincia del café y su municipio marcados. */
export function MapaMunicipio({ municipio, provincia }: { municipio: Municipio; provincia: Provincia | null }) {
  const geo = datos.municipios.find((m) => m.slug === municipio.slug);
  const coordenadas = geo ? `${formatearGrados(geo.lonlat[1])} N · ${formatearGrados(geo.lonlat[0])} O` : null;
  // Solo se colorea la provincia del café; el resto queda en gris suave para ubicarla.
  const soloProvincia = provincia ? [provincia] : [];

  return (
    <figure className="m-0">
      <svg
        viewBox={datos.viewBox.join(" ")}
        role="img"
        aria-label={`Mapa de Santander con ${municipio.nombre}${provincia ? `, ${provincia.nombre}` : ""} señalado`}
        className="mapa-mini w-full"
      >
        <DibujoDepartamento
          datos={datos}
          provincias={soloProvincia}
          prefijo="mini"
          colorDe={(slug, _prov, colorProvincia) => (slug === municipio.slug ? `color-mix(in oklab, ${colorProvincia} 55%, var(--tostado-900))` : undefined)}
        >
          {geo && <circle cx={geo.c[0]} cy={geo.c[1]} r="14" className="mapa-punto" />}
        </DibujoDepartamento>
      </svg>
      <figcaption className="caption mt-2 text-ink-muted">
        <strong className="block text-sm text-ink">{municipio.nombre}</strong>
        {provincia?.nombre}
        {coordenadas && (
          <>
            <br />
            {coordenadas}
          </>
        )}
      </figcaption>
    </figure>
  );
}
