import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fechaEnLetras } from "@/domain/comun/fecha";
import { DOCUMENTOS_LEGALES } from "@/infrastructure/legal/legal-md";
import { DocumentoLegal } from "@/ui/componentes/layout/documento-legal";
import { Migas } from "@/ui/componentes/ficha/ficha-cafe";
import { canonica, repositorioContenido } from "../../_datos/catalogo";

export const dynamicParams = false;

/**
 * D3 se publica en /envios/ (paquete del abogado v1.0; LEG-141). /legal/envios-devoluciones/ queda como página
 * de remisión, sin índice en buscadores, para que los enlaces viejos sigan funcionando.
 */
const REMISION = "envios-devoluciones";

export function generateStaticParams() {
  return Object.keys(DOCUMENTOS_LEGALES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = DOCUMENTOS_LEGALES[slug];
  if (slug === REMISION) return { title: d.titulo, robots: { index: false, follow: true }, alternates: { canonical: canonica(d.ruta) } };
  return { title: d?.titulo, alternates: { canonical: canonica(`/legal/${slug}/`) } };
}

export default async function PaginaLegal({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const documento = DOCUMENTOS_LEGALES[slug];
  if (!documento) notFound();

  if (slug === REMISION) {
    return (
      <article className="bg-surface px-5 py-10 md:px-8 md:py-16">
        <div className="mx-auto max-w-3xl">
          <Migas items={[{ texto: "Inicio", href: "/" }, { texto: documento.titulo }]} />
          <h1 className="display-l mt-6 text-balance text-ink-title max-md:!text-[36px] max-md:!leading-[42px]">{documento.titulo}</h1>
          <p className="body-l mt-8" data-testid="remision-envios">
            Este documento está en{" "}
            <Link href={documento.ruta} className="font-semibold underline underline-offset-4">
              Envíos
            </Link>{" "}
            ({documento.ruta}).
          </p>
        </div>
      </article>
    );
  }

  // Solo desde docs/legal/ (LEG-158): si el documento no es publicable, el build falla aquí.
  const contenido = await repositorioContenido.legal(slug);
  if (!contenido) notFound();

  return (
    <article className="bg-surface px-5 py-10 md:px-8 md:py-16">
      <div className="mx-auto max-w-3xl">
        <Migas items={[{ texto: "Inicio", href: "/" }, { texto: documento.titulo }]} />
        <h1 className="display-l mt-6 text-balance text-ink-title max-md:!text-[36px] max-md:!leading-[42px]">{documento.titulo}</h1>
        {/* LEG-142: «Versión 1.0 · vigente desde el 17 de noviembre de 2026», de data/config.csv. */}
        <p className="caption mt-2 text-ink-muted" data-testid="rotulo-legal">
          Versión {contenido.version} · vigente desde el {fechaEnLetras(contenido.vigenteDesde)}
        </p>
        {/* LEG-148: /legal/vendedor/ es el D4 del abogado; sus datos ya van en la lista del texto (sin `dl` duplicado). */}
        <DocumentoLegal bloques={contenido.contenido} enlazarVendedor={slug === "terminos" || slug === "privacidad"} />
      </div>
    </article>
  );
}
