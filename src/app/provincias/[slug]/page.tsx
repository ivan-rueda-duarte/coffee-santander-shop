import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { provinciasConCafes } from "@/domain/catalogo/catalogo";
import { PaginaProvincia } from "@/ui/componentes/ficha/pagina-provincia";
import { canonica, cargarCatalogo, repositorioContenido } from "../../_datos/catalogo";

export const dynamicParams = false;

// Solo las provincias con cafés tienen página; las demás aparecen como «Próximamente» en el mapa.
export async function generateStaticParams() {
  return provinciasConCafes(await cargarCatalogo()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/provincias/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = (await cargarCatalogo()).provincias.find((x) => x.slug === slug);
  if (!p) return {};
  const descripcion = p.descripcion ?? `Cafés de ${p.nombre}, Santander, con su origen a la vista.`;
  return { title: p.nombre, description: descripcion, alternates: { canonical: canonica(`/provincias/${p.slug}/`) }, openGraph: { title: p.nombre, description: descripcion } };
}

export default async function Pagina({ params }: PageProps<"/provincias/[slug]">) {
  const { slug } = await params;
  const catalogo = await cargarCatalogo();
  const provincia = catalogo.provincias.find((p) => p.slug === slug);
  if (!provincia) notFound();
  const cafes = catalogo.cafes.filter((c) => c.provinciaSlug === slug);
  if (cafes.length === 0) notFound();
  const contenido = await repositorioContenido.provincia(slug);
  return <PaginaProvincia provincia={provincia} cafes={cafes} municipios={catalogo.municipios} contenido={contenido} />;
}
