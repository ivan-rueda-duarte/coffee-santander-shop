import { Suspense } from "react";
import type { Cafe } from "@/domain/catalogo/tipos";
import { Antetitulo } from "../marca/etiquetas";
import { ExploradorFiltrable, ExploradorSinFiltros, type TarjetasPorSlug } from "./explorador";
import { TarjetaCafe } from "./tarjeta-cafe";

/**
 * Sección del catálogo. El HTML estático trae el explorador sin filtros (TODOS los cafés agrupados por provincia,
 * con la barra de filtros); al cargar el JavaScript, el explorador lee la URL y los filtra con la misma estructura,
 * así que el catálogo se ve (y se indexa) sin esperar y no salta al hidratar (M7).
 * Las tarjetas se renderizan aquí, en el servidor, y el explorador las recibe ya hechas (QA-018).
 */
export function SeccionCatalogo({
  cafes,
  nivelTitulo: Titulo = "h2",
}: {
  cafes: readonly Cafe[];
  /** h1 cuando el catálogo es la página (/cafes/); h2 dentro del inicio (M6). Mismo estilo en los dos. */
  nivelTitulo?: "h1" | "h2";
}) {
  const tarjetas: TarjetasPorSlug = Object.fromEntries(cafes.map((c) => [c.slug, <TarjetaCafe key={c.slug} cafe={c} />]));
  return (
    <section id="catalogo" aria-labelledby="titulo-catalogo" className="scroll-mt-20 bg-surface px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <Antetitulo>Nuestros cafés</Antetitulo>
        <Titulo id="titulo-catalogo" className="display-l mt-3 text-ink-title max-md:!text-[36px] max-md:!leading-[42px]">
          Elige por <em className="font-normal">origen</em>
        </Titulo>
        <p className="body-l mt-3 max-w-2xl text-ink-muted">Cada café dice de qué provincia y municipio viene y qué vas a encontrar en la taza.</p>
        <div className="mt-10">
          <Suspense fallback={<ExploradorSinFiltros tarjetas={tarjetas} />}>
            <ExploradorFiltrable tarjetas={tarjetas} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
