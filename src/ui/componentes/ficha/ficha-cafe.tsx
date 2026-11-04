import Link from "next/link";
import type { FichaCafe } from "@/application/casos-uso/obtener-ficha-cafe";
import { ETIQUETA_PERFIL } from "@/domain/catalogo/perfiles";
import { ETIQUETA_PROCESO, ETIQUETA_TUESTE, grupoDeTueste, mostrarSelloSca } from "@/domain/catalogo/tipos";
import { formatearMiles } from "@/domain/comun/dinero";
import { nombresDeVariedades } from "@/domain/marca/variedad";
import { MapaMunicipio } from "../mapa/mapa-municipio";
import { TarjetaCafe } from "../catalogo/tarjeta-cafe";
import { Antetitulo, BarraAcento, SelloSCA } from "../marca/etiquetas";
import { BolsaIlustrada, Foto, Textura } from "../marca/superficies";
import { BloqueCompra } from "./bloque-compra";

const GLOSARIO = [
  { dato: "Altitud", texto: "Metros sobre el nivel del mar donde crece el café. A más altura el grano madura más lento." },
  { dato: "Variedad", texto: "El tipo de planta de café. Caturra, Castillo®, Typica o Bourbon dan sabores distintos, como pasa con las uvas del vino." },
  { dato: "Proceso", texto: "Cómo se separa el grano de la fruta. En el lavado se quita la pulpa con agua." },
  { dato: "Tueste", texto: "Un tueste claro deja más acidez y notas frutales; uno oscuro da más cuerpo y notas de chocolate." },
];

export function Migas({ items }: { items: { texto: string; href?: string }[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="caption text-ink-muted">
      <ol className="flex flex-wrap items-center gap-x-2">
        {items.map((i, n) => (
          <li key={i.texto} className="flex items-center gap-2">
            {i.href ? (
              <Link href={i.href} className="underline-offset-4 hover:underline">
                {i.texto}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">{i.texto}</span>
            )}
            {n < items.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PaginaFichaCafe({ ficha }: { ficha: FichaCafe }) {
  const { cafe, municipio, provincia, productor, relacionados, contenido } = ficha;
  const datos: [string, string][] = [
    ["Municipio", cafe.municipio],
    ["Provincia", provincia?.nombre ?? ""],
    ["Productor o finca", productor?.nombre ?? ""],
    ["Altitud del cultivo", cafe.alturaMsnm ? `${formatearMiles(cafe.alturaMsnm)} m s. n. m.` : ""],
    ["Variedad", nombresDeVariedades(cafe.variedades)],
    ["Proceso", ETIQUETA_PROCESO[cafe.proceso]],
    ["Tueste", ETIQUETA_TUESTE[cafe.tueste]],
    ["Registro sanitario", cafe.registroSanitario ?? ""],
  ];
  const foto = contenido?.fotos[0];

  return (
    <article className="bg-surface px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <Migas items={[{ texto: "Cafés", href: "/cafes/" }, ...(provincia ? [{ texto: provincia.nombreCorto, href: `/provincias/${provincia.slug}/` }] : []), { texto: cafe.nombre }]} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="space-y-8">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
              {foto ? (
                <Foto src={foto.url} alt={foto.alt} credito={foto.credito} ancho={900} alto={1200} className="absolute inset-0 h-full" />
              ) : (
                <BolsaIlustrada tueste={grupoDeTueste(cafe.tueste)} nombre={cafe.nombre} />
              )}
              {mostrarSelloSca(cafe) && <SelloSCA puntaje={cafe.puntajeSca!} tamano="lg" className="absolute right-4 top-4 z-10" />}
            </div>
            <div className="max-w-xs">
              <MapaMunicipio municipio={municipio} provincia={provincia} />
            </div>
          </div>

          <div>
            <Antetitulo>{[cafe.municipio, provincia?.nombre].filter(Boolean).join(" · ")}</Antetitulo>
            <h1 className="display-l mt-3 text-ink-title max-md:!text-[36px] max-md:!leading-[42px]">{cafe.nombre}</h1>
            {cafe.notasCata.length > 0 && <p className="quote mt-3 text-ink">{cafe.notasCata.join(", ")}</p>}
            <p className="mt-4 flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-accent">
              <BarraAcento color="terracota" />
              Tueste {ETIQUETA_TUESTE[cafe.tueste].toLowerCase()}
            </p>

            <div className="mt-8">
              <BloqueCompra cafe={cafe} />
            </div>

            {cafe.perfiles.length > 0 && (
              <section className="mt-12" aria-labelledby="perfil">
                <h2 id="perfil" className="h3 text-ink-title">Perfil de taza</h2>
                <ul className="ds-tags ds-tags--outline mt-3">
                  {cafe.perfiles.map((p) => (
                    <li key={p} className="ds-tag ds-tag--outline">{ETIQUETA_PERFIL[p]}</li>
                  ))}
                </ul>
              </section>
            )}

            {mostrarSelloSca(cafe) && (
              <section className="mt-12" aria-labelledby="sca">
                <h2 id="sca" className="h3 text-ink-title">Puntaje SCA</h2>
                <div className="mt-3 flex items-center gap-4">
                  <SelloSCA puntaje={cafe.puntajeSca!} />
                  <p className="body max-w-sm text-sm text-ink-muted">
                    Puntaje de taza de la Specialty Coffee Association: de 80 en adelante es café de especialidad.
                    {cafe.puntajeFuente && cafe.puntajeFecha && (
                      <>
                        {" "}Catado por {cafe.puntajeFuente}, {cafe.puntajeFecha}.
                      </>
                    )}
                  </p>
                </div>
              </section>
            )}

            <section className="mt-12" aria-labelledby="ficha-tecnica">
              <h2 id="ficha-tecnica" className="h3 text-ink-title">Ficha técnica</h2>
              <dl className="mt-3 divide-y divide-line border-y border-line">
                {datos.filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 py-3 text-sm">
                    <dt className="font-semibold text-ink-muted">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <details className="mt-4 rounded-lg bg-surface-sunken p-4">
                <summary className="cursor-pointer text-sm font-bold">¿Qué significa cada dato?</summary>
                <dl className="mt-3 space-y-3 text-sm">
                  {GLOSARIO.map((g) => (
                    <div key={g.dato}>
                      <dt className="font-bold">{g.dato}</dt>
                      <dd className="text-ink-muted">{g.texto}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </section>

            {contenido && contenido.historia.length > 0 && (
              <section className="mt-12" aria-labelledby="historia-cafe">
                <h2 id="historia-cafe" className="h3 text-ink-title">Historia</h2>
                <div className="body mt-3 max-w-prose space-y-3 text-ink-muted">
                  {contenido.historia.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {relacionados.length > 0 && (
          <Textura trama="claro" como="section" aria-labelledby="mas-cafes" className="mt-20 rounded-lg bg-surface-sunken p-6 md:p-10">
            <h2 id="mas-cafes" className="h2 text-ink-title">
              Más cafés de {provincia?.nombreCorto}
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relacionados.map((c) => (
                <li key={c.slug}>
                  <TarjetaCafe cafe={c} />
                </li>
              ))}
            </ul>
          </Textura>
        )}
      </div>
    </article>
  );
}
