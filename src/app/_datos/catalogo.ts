import { cache } from "react";
import { obtenerCatalogo, type VistaCatalogo } from "@/application/casos-uso/obtener-catalogo";
import { crearRepositorioContenido } from "@/infrastructure/sanity/contenido-sanity";
import { RepositorioCatalogoCsv } from "@/infrastructure/csv/repositorio-catalogo-csv";
import { finEnvioGratis, promocionActiva } from "@/domain/envio/envio-gratis";
import type { BloqueEstructurado } from "@/domain/marca/reglas-texto";
import { hoyEnColombia, modoPruebaEnvioGratis } from "@/infrastructure/entorno";
import { cargarLegalDesdeDocs, condicionesEnvioGratis, condicionesEnvioGratisTerminada, conRespaldoLegal, leerDocsLegalesDesdeDisco } from "@/infrastructure/legal/legal-md";

// Se ejecuta en el build (Server Components). Los repositorios se eligen aquí, en la capa app.
export const repositorioCatalogo = new RepositorioCatalogoCsv();

/** Catálogo completo del build. Es lo que reciben los componentes del navegador. */
export const cargarCatalogo = cache(async (): Promise<VistaCatalogo> => {
  const vista = await obtenerCatalogo(repositorioCatalogo);
  // Al navegador solo viaja lo que usa: los municipios que tienen café.
  const conCafe = new Set(vista.cafes.map((c) => c.municipioSlug));
  // Envío gratis por comunas: solo si rige el día del build (envio_gratis_desde ≤ hoy, sin envio_gratis_terminada).
  // Apagada, programada o terminada, la promoción no llega a ninguna página ni a out/ (ni los nombres de las comunas).
  // Terminada (P34 b, §8.6.1), solo llegan sus fechas para el aviso de terminación.
  const hoy = hoyEnColombia();
  const envioGratis = promocionActiva(vista.envios.envioGratis, hoy);
  const fin = finEnvioGratis(vista.envios.envioGratis, hoy);
  return { ...vista, municipios: vista.municipios.filter((m) => conCafe.has(m.slug)), envios: { ...vista.envios, envioGratis, finEnvioGratis: fin } };
});

/**
 * Lo que viaja al navegador (CatalogoProvider). Representante legal, matrícula y área de datos solo se publican
 * en /legal/vendedor/ (Server Component): no van en la carga de cada página (minimización, LEG-085).
 */
export const cargarCatalogoNavegador = cache(async (): Promise<VistaCatalogo> => {
  const vista = await cargarCatalogo();
  return { ...vista, tienda: { ...vista.tienda, vendedor: { ...vista.tienda.vendedor, representanteLegal: null, matriculaMercantil: null, areaDatos: null } } };
});

/**
 * Contenido editorial: Sanity si está configurado. Las páginas legales tienen respaldo en docs/legal/ (LEG-084):
 * se publican desde el repositorio, con la versión y la fecha de data/config.csv, cuando Sanity no las trae.
 */
export const repositorioContenido = conRespaldoLegal(crearRepositorioContenido(), async (seccion) =>
  cargarLegalDesdeDocs(leerDocsLegalesDesdeDisco(), (await cargarCatalogo()).tienda.legal, seccion),
);

/**
 * Condiciones del envío gratis para /envios/#envio-gratis: el numeral publicado de «Envíos, devoluciones, retracto
 * y garantía» (el mismo texto de /legal/envios-devoluciones/). null con la promoción apagada o programada, y
 * terminada si el numeral ya no está publicado. Falla el build si la
 * promoción está encendida y el numeral no está publicado (LEG-106), salvo en un build de prueba (ENVIO_GRATIS_PRUEBA).
 */
export const cargarCondicionesEnvioGratis = cache(async (): Promise<BloqueEstructurado[] | null> => {
  const { envioGratis: promo, finEnvioGratis: fin } = (await cargarCatalogo()).envios;
  if (!promo && !fin) return null;
  const publicado = (await repositorioContenido.legal("envios-devoluciones"))?.contenido ?? [];
  // Terminada (§8.6.1): «Estas fueron sus condiciones:» y el numeral publicado; sin numeral, no hay sección (no falla).
  if (!promo) return condicionesEnvioGratisTerminada(publicado, leerDocsLegalesDesdeDisco(), fin!, modoPruebaEnvioGratis());
  return condicionesEnvioGratis(publicado, leerDocsLegalesDesdeDisco(), promo, modoPruebaEnvioGratis());
});

export const URL_SITIO = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

/** Enlace canónico: solo con URL pública configurada (los canónicos relativos no valen para buscadores). */
export const canonica = (ruta: string): string | undefined => (URL_SITIO ? ruta : undefined);
