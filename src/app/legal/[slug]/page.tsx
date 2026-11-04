import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { vendedorCompleto } from "@/domain/pedido/tienda";
import { BotonEnlace } from "@/ui/componentes/marca/boton";
import { Migas } from "@/ui/componentes/ficha/ficha-cafe";
import { canonica, cargarCatalogo, repositorioContenido } from "../../_datos/catalogo";

export const dynamicParams = false;

type Bloque = { tipo: "titulo" | "parrafo"; texto: string } | { tipo: "lista"; numerada: boolean; items: string[] };

/** Junta los elementos de lista seguidos en una sola lista. */
function agruparLista(bloques: readonly { tipo: "parrafo" | "titulo" | "item"; texto: string; numerada?: boolean }[]): Bloque[] {
  const salida: Bloque[] = [];
  for (const b of bloques) {
    const ultimo = salida[salida.length - 1];
    if (b.tipo !== "item") salida.push({ tipo: b.tipo, texto: b.texto });
    else if (ultimo?.tipo === "lista" && ultimo.numerada === Boolean(b.numerada)) ultimo.items.push(b.texto);
    else salida.push({ tipo: "lista", numerada: Boolean(b.numerada), items: [b.texto] });
  }
  return salida;
}

const SECCIONES: Record<string, string> = {
  terminos: "Términos y condiciones",
  privacidad: "Política de tratamiento de datos",
  "envios-devoluciones": "Envíos, devoluciones y retracto",
  vendedor: "Información del vendedor",
};

export function generateStaticParams() {
  return Object.keys(SECCIONES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: SECCIONES[slug], alternates: { canonical: canonica(`/legal/${slug}/`) } };
}

export default async function PaginaLegal({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const titulo = SECCIONES[slug];
  if (!titulo) notFound();
  const [contenido, catalogo] = await Promise.all([repositorioContenido.legal(slug), cargarCatalogo()]);
  const v = catalogo.tienda.vendedor;

  return (
    <article className="bg-surface px-5 py-10 md:px-8 md:py-16">
      <div className="mx-auto max-w-3xl">
        <Migas items={[{ texto: "Inicio", href: "/" }, { texto: titulo }]} />
        <h1 className="display-l mt-6 text-ink-title max-md:!text-[36px] max-md:!leading-[42px]">{titulo}</h1>

        {contenido ? (
          <>
            <p className="caption mt-2 text-ink-muted">Versión {contenido.version} · vigente desde {contenido.vigenteDesde}</p>
            <div className="body-l mt-8 space-y-4">
              {agruparLista(contenido.contenido).map((b, i) =>
                b.tipo === "titulo" ? (
                  <h2 key={i} className="h3 !mt-10 text-ink-title">{b.texto}</h2>
                ) : b.tipo === "lista" ? (
                  b.numerada ? (
                    <ol key={i} className="ml-5 list-decimal space-y-1">{b.items.map((x) => <li key={x}>{x}</li>)}</ol>
                  ) : (
                    <ul key={i} className="ml-5 list-disc space-y-1">{b.items.map((x) => <li key={x}>{x}</li>)}</ul>
                  )
                ) : (
                  <p key={i}>{b.texto}</p>
                ),
              )}
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-lg bg-surface-sunken p-6">
            <p className="body-l">Este documento está en preparación y se publicará pronto.</p>
            <p className="body mt-2 text-ink-muted">Mientras tanto, si tienes dudas sobre tu pedido, tus datos o los envíos, escríbenos por WhatsApp.</p>
            <BotonEnlace href={`https://wa.me/${catalogo.tienda.whatsapp}`} className="mt-4" target="_blank" rel="noopener noreferrer">
              Escribir por WhatsApp
            </BotonEnlace>
          </div>
        )}

        {slug === "vendedor" && vendedorCompleto(v) && (
          <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
            {[["Razón social", v.razonSocial], ["NIT", v.nit], ["Domicilio", v.domicilio], ["Contacto", v.correoContacto]].map(([k, val]) => (
              <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                <dt className="font-semibold text-ink-muted">{k}</dt>
                <dd className="font-semibold">{val}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
