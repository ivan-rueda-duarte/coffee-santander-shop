import { Suspense } from "react";
import { agruparPorProvincia, textoContador } from "@/domain/catalogo/filtros";
import type { Cafe, Provincia } from "@/domain/catalogo/tipos";
import { Antetitulo } from "../marca/etiquetas";
import { ExploradorFiltrable } from "./explorador";
import { TarjetaCafe } from "./tarjeta-cafe";

/**
 * Sección del catálogo. El HTML estático trae TODOS los cafés agrupados por provincia (sin filtros);
 * al cargar el JavaScript, el explorador lee la URL y los filtra. Así el catálogo se ve (y se indexa) sin esperar.
 */
export function SeccionCatalogo({ cafes, provincias }: { cafes: readonly Cafe[]; provincias: readonly Provincia[] }) {
  const grupos = agruparPorProvincia(cafes, provincias);
  return (
    <section id="catalogo" aria-labelledby="titulo-catalogo" className="scroll-mt-20 bg-surface px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <Antetitulo>Nuestros cafés</Antetitulo>
        <h2 id="titulo-catalogo" className="display-l mt-3 text-ink-title max-md:!text-[36px] max-md:!leading-[42px]">
          Elige por <em className="font-normal">origen</em>
        </h2>
        <p className="body-l mt-3 max-w-2xl text-ink-muted">Cada café dice de qué provincia y municipio viene y qué vas a encontrar en la taza.</p>
        <div className="mt-10">
          <Suspense
            fallback={
              <div>
                <p id="resultados-catalogo" className="h3 text-ink-title">{textoContador(cafes.length, [])}</p>
                {grupos.map(({ provincia, cafes: delGrupo }) => (
                  <div key={provincia?.slug ?? "otros"}>
                    <h3 className="h3 mb-4 mt-10 text-ink-title">{provincia?.nombre ?? "Otros municipios"}</h3>
                    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {delGrupo.map((c) => (
                        <li key={c.slug}>
                          <TarjetaCafe cafe={c} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            }
          >
            <ExploradorFiltrable />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
