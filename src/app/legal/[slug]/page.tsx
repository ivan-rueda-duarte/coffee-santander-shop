import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { slugify } from "@/domain/comun/slug";
import { formatearWhatsapp } from "@/domain/pedido/mensaje-whatsapp";
import { BotonEnlace } from "@/ui/componentes/marca/boton";
import { Migas } from "@/ui/componentes/ficha/ficha-cafe";
import { canonica, cargarCatalogo, repositorioContenido } from "../../_datos/catalogo";

export const dynamicParams = false;

type Bloque = { tipo: "titulo"; texto: string; id: string } | { tipo: "parrafo"; texto: string } | { tipo: "lista"; numerada: boolean; items: string[] };

/** Con más de cinco títulos el documento lleva índice de anclas (diseño, páginas legales). */
const MINIMO_TITULOS_INDICE = 6;

/** Junta los elementos de lista seguidos en una sola lista y da a cada título un id único para las anclas. */
function agruparLista(bloques: readonly { tipo: "parrafo" | "titulo" | "item"; texto: string; numerada?: boolean }[]): Bloque[] {
  const salida: Bloque[] = [];
  const usados = new Set<string>();
  for (const b of bloques) {
    const ultimo = salida[salida.length - 1];
    if (b.tipo === "titulo") {
      const base = slugify(b.texto) || "seccion";
      let id = base;
      for (let n = 2; usados.has(id); n++) id = `${base}-${n}`;
      usados.add(id);
      salida.push({ tipo: "titulo", texto: b.texto, id });
    } else if (b.tipo === "parrafo") salida.push({ tipo: "parrafo", texto: b.texto });
    else if (ultimo?.tipo === "lista" && ultimo.numerada === Boolean(b.numerada)) ultimo.items.push(b.texto);
    else salida.push({ tipo: "lista", numerada: Boolean(b.numerada), items: [b.texto] });
  }
  return salida;
}

const SECCIONES: Record<string, string> = {
  terminos: "Términos y condiciones",
  privacidad: "Política de tratamiento de datos",
  "envios-devoluciones": "Envíos, devoluciones, retracto y garantía",
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
  // Filas de /legal/vendedor/ (microcopy §5.4): cada una solo si el dato existe.
  const filasVendedor: [string, string | null][] = [
    ["Razón social", v.razonSocial],
    ["NIT", v.nit],
    ["Matrícula mercantil", v.matriculaMercantil],
    ["Representante legal", v.representanteLegal],
    ["Domicilio", v.domicilio],
    ["Dirección de notificación judicial", v.direccionNotificacion],
    ["Correo", v.correoContacto],
    ["WhatsApp", formatearWhatsapp(catalogo.tienda.whatsapp)],
  ];
  const bloques = contenido ? agruparLista(contenido.contenido) : null;
  const indice = (bloques ?? []).filter((b): b is Extract<Bloque, { tipo: "titulo" }> => b.tipo === "titulo");

  return (
    <article className="bg-surface px-5 py-10 md:px-8 md:py-16">
      <div className="mx-auto max-w-3xl">
        <Migas items={[{ texto: "Inicio", href: "/" }, { texto: titulo }]} />
        <h1 className="display-l mt-6 text-balance text-ink-title max-md:!text-[36px] max-md:!leading-[42px]">{titulo}</h1>

        {contenido && bloques ? (
          <>
            <p className="caption mt-2 text-ink-muted">Versión {contenido.version} · vigente desde {contenido.vigenteDesde}</p>
            {indice.length >= MINIMO_TITULOS_INDICE && (
              <nav aria-labelledby="indice-legal" className="mt-8 max-w-[68ch] rounded-lg bg-surface-raised p-5 [overflow-wrap:anywhere]" data-testid="indice-legal">
                <h2 id="indice-legal" className="small font-bold text-ink-title">En este documento</h2>
                <ol className="small mt-2 space-y-1">
                  {indice.map((t) => (
                    <li key={t.id}>
                      <a className="inline-block py-1 underline underline-offset-4" href={`#${t.id}`}>{t.texto}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            {/* Columna de lectura de 68 caracteres; overflow-wrap para que el correo y las direcciones no desborden a 320 px (QA-007). */}
            <div className="body-l mt-8 max-w-[68ch] space-y-4 [overflow-wrap:anywhere]">
              {bloques.map((b, i) =>
                b.tipo === "titulo" ? (
                  <h2 key={i} id={b.id} className="h3 !mt-10 scroll-mt-24 text-ink-title">{b.texto}</h2>
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

        {slug === "vendedor" && v.razonSocial && (
          <dl className="mt-8 divide-y divide-line border-y border-line text-sm" data-testid="datos-vendedor">
            {filasVendedor.filter((f): f is [string, string] => Boolean(f[1])).map(([k, val]) => (
              <div key={k} className="grid gap-1 py-3 sm:grid-cols-[14rem_1fr] sm:gap-4">
                <dt className="font-semibold text-ink-muted">{k}</dt>
                <dd className="font-semibold [overflow-wrap:anywhere]">{val}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
