import type { MetadataRoute } from "next";
import { provinciasConCafes } from "@/domain/catalogo/catalogo";
import { cargarCatalogo, URL_SITIO } from "./_datos/catalogo";

export const dynamic = "force-static";

const LEGALES = ["terminos", "privacidad", "envios-devoluciones", "vendedor"];

/** Un sitemap exige URLs absolutas: sin NEXT_PUBLIC_SITE_URL queda vacío. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!URL_SITIO) return [];
  const catalogo = await cargarCatalogo();
  const rutas = ["/", "/cafes/", "/envios/", ...catalogo.cafes.map((c) => `/cafes/${c.slug}/`), ...provinciasConCafes(catalogo).map((p) => `/provincias/${p.slug}/`), ...LEGALES.map((s) => `/legal/${s}/`)];
  return rutas.map((r) => ({ url: `${URL_SITIO}${r}` }));
}
