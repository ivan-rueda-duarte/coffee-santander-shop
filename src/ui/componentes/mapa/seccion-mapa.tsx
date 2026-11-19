import type { VistaCatalogo } from "@/application/casos-uso/obtener-catalogo";
import { BotonEnlace } from "../marca/boton";
import { Antetitulo } from "../marca/etiquetas";
import { Textura } from "../marca/superficies";
import { MapaProvincias } from "./mapa-provincias";

/**
 * Sección del mapa (Server Component). El mapa se dibuja en el build y va completo en el HTML, con su caja fija
 * (ancho máximo y proporción del viewBox): no hay hueco que se llene al cargar, así que no mueve la página (M4).
 */
export function SeccionMapa({ catalogo, fuente }: { catalogo: VistaCatalogo; fuente: string }) {
  return (
    <Textura trama="claro" como="section" id="mapa" aria-labelledby="titulo-mapa" className="scroll-mt-20 bg-surface-sunken px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Antetitulo>Santander por provincias</Antetitulo>
          <h2 id="titulo-mapa" className="display-l mt-3 text-ink-title max-md:!text-[36px] max-md:!leading-[42px]">
            Santander, <em className="font-normal">provincia a provincia</em>
          </h2>
          <p className="body-l mt-4 max-w-md text-ink-muted">
            Elige una provincia para ver sus cafés y filtrar el catálogo. Los puntos marcan el municipio de cada café.
          </p>
          <BotonEnlace variante="enlace" tamano="sm" href="#catalogo" className="mt-4">
            Ir a los cafés
          </BotonEnlace>
          <p className="caption mt-6 max-w-md text-ink-muted">{fuente}</p>
        </div>
        <div>
          <MapaProvincias catalogo={catalogo} />
        </div>
      </div>
    </Textura>
  );
}
