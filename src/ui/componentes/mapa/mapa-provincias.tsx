import type { VistaCatalogo } from "@/application/casos-uso/obtener-catalogo";
import { etiquetaCafes } from "@/domain/catalogo/filtros";
import { armarEntradaCapa, capaEstatica } from "@/domain/mapa/capa";
import type { DatosMapa } from "@/domain/mapa/tipos";
import datosCrudos from "@/data/mapa-santander.json";
import { ActivadorMapa, ID_MAPA } from "./activador-mapa";
import { CapaFija } from "./capa-mapa";
import { DibujoDepartamento } from "./dibujo-departamento";

const datos = datosCrudos as unknown as DatosMapa;
const PROPORCION = datos.viewBox[2] / datos.viewBox[3];
/** Anchos posibles del contenedor del mapa (máximo 640 px; el mínimo, con holgura bajo el celular más angosto). */
const ANCHO_MIN = 240;
const ANCHO_MAX = 640;

/**
 * Mapa de provincias. Se dibuja aquí, en el build: provincias, municipios, contornos, gratícula, nombres y pines van
 * en el HTML y la geometría nunca viaja en el JavaScript (QA-018, O-1). La interacción (selección, encuadre, tarjeta)
 * la pone `ActivadorMapa`, que la descarga cuando el visitante va a usar el mapa o la URL trae provincias.
 * Sin estado propio de selección: el estado es la URL.
 */
export function MapaProvincias({ catalogo }: { catalogo: VistaCatalogo }) {
  const activas = new Set(catalogo.provinciasActivas.map((p) => p.slug));
  const porProvincia = new Map<string, number>();
  for (const c of catalogo.cafes) if (c.provinciaSlug) porProvincia.set(c.provinciaSlug, (porProvincia.get(c.provinciaSlug) ?? 0) + 1);
  const origenes = new Set(catalogo.cafes.map((c) => c.municipioSlug));
  const entrada = armarEntradaCapa(datos, catalogo.cafes, catalogo.provincias, activas);
  const [, , vw, vh] = datos.viewBox;

  return (
    <div>
      <div
        id={ID_MAPA}
        data-mapa-interactivo
        className="relative mx-auto w-full max-w-[640px] overflow-hidden rounded-lg bg-surface-sunken"
        style={{ aspectRatio: PROPORCION }}
      >
        <svg viewBox={datos.viewBox.map((n) => n.toFixed(2)).join(" ")} className="absolute inset-0 h-full w-full" role="group" aria-label="Mapa de Santander por provincias">
          <g className="graticula" aria-hidden="true">
            {entrada.graticula.lons.map(({ valor, x }) => <line key={valor} x1={x} x2={x} y1={0} y2={vh} className="graticula" />)}
            {entrada.graticula.lats.map(({ valor, y }) => <line key={valor} x1={0} x2={vw} y1={y} y2={y} className="graticula" />)}
          </g>
          <DibujoDepartamento
            datos={datos}
            provincias={catalogo.provincias}
            prefijo="mapa"
            envolver={(p, hijos) =>
              activas.has(p.slug) ? (
                <g
                  key={p.slug}
                  className="prov prov--activa"
                  data-provincia={p.slug}
                  role="button"
                  tabIndex={0}
                  aria-pressed={false}
                  aria-label={`Provincia de ${p.nombreCorto}, ${etiquetaCafes(porProvincia.get(p.slug) ?? 0)}`}
                >
                  {hijos}
                </g>
              ) : (
                <g key={p.slug} className="prov prov--vacia" data-provincia={p.slug}>
                  {hijos}
                </g>
              )
            }
          />
          {[...origenes].map((slug) => {
            const geo = datos.municipios.find((m) => m.slug === slug);
            return geo ? <path key={slug} d={geo.d} className="mpio--origen" fill="none" pointerEvents="none" /> : null;
          })}
        </svg>
        <ActivadorMapa entrada={entrada}>
          <CapaFija capa={capaEstatica(entrada, PROPORCION, ANCHO_MIN, ANCHO_MAX)} />
        </ActivadorMapa>
      </div>
    </div>
  );
}
