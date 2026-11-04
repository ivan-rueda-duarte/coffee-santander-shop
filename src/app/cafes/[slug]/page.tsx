import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obtenerFichaCafe } from "@/application/casos-uso/obtener-ficha-cafe";
import { PaginaFichaCafe } from "@/ui/componentes/ficha/ficha-cafe";
import { canonica, cargarCatalogo, repositorioCatalogo, repositorioContenido, URL_SITIO } from "../../_datos/catalogo";

// GitHub Pages es estático: solo existen las páginas de los cafés que están en data/catalogo.csv.
export const dynamicParams = false;

/** URL absoluta de la foto principal: la del CSV (public/) o, si no hay, la de Sanity. */
function imagenPrincipal(ficha: NonNullable<Awaited<ReturnType<typeof obtenerFichaCafe>>>): string | undefined {
  const propia = ficha.cafe.fotos[0];
  if (propia) return URL_SITIO ? `${URL_SITIO}${propia}` : undefined;
  return ficha.contenido?.fotos[0]?.url;
}

export async function generateStaticParams() {
  return (await cargarCatalogo()).cafes.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cafes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const ficha = await obtenerFichaCafe(repositorioCatalogo, repositorioContenido, slug);
  if (!ficha) return {};
  const { cafe } = ficha;
  const descripcion = `${cafe.nombre}: café de ${cafe.municipio}${ficha.provincia ? `, ${ficha.provincia.nombre}` : ""}${cafe.alturaMsnm ? `, a ${cafe.alturaMsnm} m` : ""}. ${cafe.notasCata.length ? `Notas de ${cafe.notasCata.join(", ").toLowerCase()}.` : ""}`.trim();
  return {
    title: cafe.nombre,
    description: descripcion,
    alternates: { canonical: canonica(`/cafes/${cafe.slug}/`) },
    openGraph: { title: cafe.nombre, description: descripcion, type: "website", images: imagenPrincipal(ficha) ? [imagenPrincipal(ficha)!] : undefined },
  };
}

export default async function PaginaCafe({ params }: PageProps<"/cafes/[slug]">) {
  const { slug } = await params;
  const ficha = await obtenerFichaCafe(repositorioCatalogo, repositorioContenido, slug);
  if (!ficha) notFound();
  const { cafe } = ficha;

  // Product con ofertas en COP. No hay reseñas, así que no se declara aggregateRating.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cafe.nombre,
    description: cafe.notasCata.length ? `Café de ${cafe.municipio}. Notas de ${cafe.notasCata.join(", ")}.` : `Café de ${cafe.municipio}.`,
    brand: { "@type": "Brand", name: "De Santander" },
    url: URL_SITIO ? `${URL_SITIO}/cafes/${cafe.slug}/` : undefined,
    image: imagenPrincipal(ficha),
    offers: cafe.presentaciones.map((p) => ({
      "@type": "Offer",
      name: `${p.gramos} g`,
      price: p.precioCop,
      priceCurrency: "COP",
      availability: p.disponible ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };

  return (
    <>
      <PaginaFichaCafe ficha={ficha} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
