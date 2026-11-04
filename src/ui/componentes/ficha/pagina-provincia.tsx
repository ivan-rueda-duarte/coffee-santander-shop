import Link from "next/link";
import type { ContenidoProvincia } from "@/application/puertos";
import { etiquetaCafes } from "@/domain/catalogo/filtros";
import type { Cafe, Municipio, Provincia } from "@/domain/catalogo/tipos";
import { TarjetaCafe } from "../catalogo/tarjeta-cafe";
import { BotonEnlace } from "../marca/boton";
import { Antetitulo, Pastilla } from "../marca/etiquetas";
import { Foto, Textura } from "../marca/superficies";
import { Migas } from "./ficha-cafe";

// Familia de color de cada provincia (verde, arcilla, oro, neutro, tierra). Una provincia nueva usa «verde».
const FAMILIA: Record<string, string> = {
  comunera: "ds-region--arcilla",
  "garcia-rovira": "ds-region--neutro",
  guanenta: "ds-region--oro",
  metropolitana: "ds-region--tierra",
  soto: "ds-region--verde",
  velez: "ds-region--verde",
  yariguies: "ds-region--neutro",
};

export function PaginaProvincia({ provincia, cafes, municipios, contenido }: { provincia: Provincia; cafes: readonly Cafe[]; municipios: readonly Municipio[]; contenido: ContenidoProvincia | null }) {
  const conCafe = new Set(cafes.map((c) => c.municipioSlug));
  const nombresMunicipios = municipios.filter((m) => conCafe.has(m.slug)).map((m) => m.nombre);
  return (
    <article className="bg-surface px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <Migas items={[{ texto: "Cafés", href: "/cafes/" }, { texto: provincia.nombre }]} />

        <Textura trama="claro" className={`ds-region ${FAMILIA[provincia.slug] ?? "ds-region--verde"} mt-8 !p-8 md:!p-12`}>
          <div className="ds-region__head">
            <div>
              <Antetitulo>Provincia</Antetitulo>
              <h1 className="ds-region__title !text-[40px] !leading-[46px] md:!text-[48px] md:!leading-[52px]">{provincia.nombre}</h1>
            </div>
            <Pastilla variante="region">{etiquetaCafes(cafes.length)}</Pastilla>
          </div>
          {provincia.descripcion && <p className="body-l max-w-2xl">{provincia.descripcion}</p>}
          {nombresMunicipios.length > 0 && <p className="ds-region__towns">Municipios con café: {nombresMunicipios.join(", ")}.</p>}
        </Textura>

        {contenido && (contenido.historia.length > 0 || contenido.foto) && (
          <section className="mt-14 grid items-start gap-10 lg:grid-cols-2" aria-labelledby="historia-provincia">
            <div>
              <h2 id="historia-provincia" className="h2 text-ink-title">Su historia</h2>
              <div className="body-l mt-4 max-w-prose space-y-4 text-ink-muted">
                {contenido.historia.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
            {contenido.foto && <Foto src={contenido.foto.url} alt={contenido.foto.alt} credito={contenido.foto.credito} ancho={1200} alto={800} className="aspect-[3/2]" />}
          </section>
        )}

        {contenido && contenido.cifras.length > 0 && (
          <section className="mt-14" aria-labelledby="cifras">
            <h2 id="cifras" className="sr-only">Cifras</h2>
            <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {contenido.cifras.map((c) => (
                <div key={c.valor + c.contexto} className="ds-stat">
                  <dt className="ds-stat__label order-2 text-ink-muted">{c.contexto}</dt>
                  <dd className="ds-stat__num order-1 text-ink-title">{c.valor}</dd>
                </div>
              ))}
            </dl>
            <p className="caption mt-6 text-ink-muted">
              Fuentes: {contenido.cifras.map((c) => `${c.fuente} (${c.fecha})`).join("; ")}.
            </p>
          </section>
        )}

        <section className="mt-16" aria-labelledby="cafes-provincia">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="cafes-provincia" className="h2 text-ink-title">
              Cafés de {provincia.nombreCorto}
            </h2>
            <BotonEnlace href={`/?provincia=${provincia.slug}#catalogo`} variante="origen" tamano="sm">
              Ver en el catálogo con filtros
            </BotonEnlace>
          </div>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cafes.map((c) => (
              <li key={c.slug}>
                <TarjetaCafe cafe={c} />
              </li>
            ))}
          </ul>
          <p className="caption mt-8 text-ink-muted">
            <Link href="/#mapa" className="underline underline-offset-4">Volver al mapa de provincias</Link>
          </p>
        </section>
      </div>
    </article>
  );
}
