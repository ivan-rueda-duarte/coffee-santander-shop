import { cache } from "react";
import { obtenerCatalogo, type VistaCatalogo } from "@/application/casos-uso/obtener-catalogo";
import { crearRepositorioContenido } from "@/infrastructure/sanity/contenido-sanity";
import { RepositorioCatalogoCsv } from "@/infrastructure/csv/repositorio-catalogo-csv";

// Se ejecuta en el build (Server Components). Los repositorios se eligen aquí, en la capa app.
export const repositorioCatalogo = new RepositorioCatalogoCsv();
export const repositorioContenido = crearRepositorioContenido();

/** Catálogo completo del build. Es lo que reciben los componentes del navegador. */
export const cargarCatalogo = cache(async (): Promise<VistaCatalogo> => {
  const vista = await obtenerCatalogo(repositorioCatalogo);
  // Al navegador solo viaja lo que usa: los municipios que tienen café.
  const conCafe = new Set(vista.cafes.map((c) => c.municipioSlug));
  return { ...vista, municipios: vista.municipios.filter((m) => conCafe.has(m.slug)) };
});

export const URL_SITIO = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

/** Enlace canónico: solo con URL pública configurada (los canónicos relativos no valen para buscadores). */
export const canonica = (ruta: string): string | undefined => (URL_SITIO ? ruta : undefined);
