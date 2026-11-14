import { cache } from "react";
import { obtenerCatalogo, type VistaCatalogo } from "@/application/casos-uso/obtener-catalogo";
import { crearRepositorioContenido } from "@/infrastructure/sanity/contenido-sanity";
import { RepositorioCatalogoCsv } from "@/infrastructure/csv/repositorio-catalogo-csv";
import { finEnvioGratis, promocionActiva } from "@/domain/envio/envio-gratis";
import { fechaDelBuild } from "@/infrastructure/entorno";
import { cargarLegalDesdeDocs, conLegalDesdeDocs, leerDocsLegalesDesdeDisco } from "@/infrastructure/legal/legal-md";

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
  const hoy = fechaDelBuild();
  const envioGratis = promocionActiva(vista.envios.envioGratis, hoy);
  const fin = finEnvioGratis(vista.envios.envioGratis, hoy);
  return { ...vista, municipios: vista.municipios.filter((m) => conCafe.has(m.slug)), envios: { ...vista.envios, envioGratis, finEnvioGratis: fin } };
});

/**
 * Lo que viaja al navegador (CatalogoProvider). Representante legal, matrícula, área de datos y dirección de notificación solo se publican
 * en /legal/vendedor/ (Server Component): no van en la carga de cada página (minimización, LEG-085).
 */
export const cargarCatalogoNavegador = cache(async (): Promise<VistaCatalogo> => {
  const vista = await cargarCatalogo();
  // P38 = b (2026-11-14): la dirección de notificación judicial solo se publica en /legal/vendedor/.
  return { ...vista, tienda: { ...vista.tienda, vendedor: { ...vista.tienda.vendedor, representanteLegal: null, matriculaMercantil: null, areaDatos: null, direccionNotificacion: null } } };
});

/**
 * Contenido editorial: Sanity si está configurado. Las páginas legales salen SOLO de docs/legal/ (LEG-084, LEG-158),
 * con la versión, la fecha y los valores entre llaves de data/config.csv: Sanity nunca las reemplaza.
 */
export const repositorioContenido = conLegalDesdeDocs(crearRepositorioContenido(), async (seccion) =>
  cargarLegalDesdeDocs(leerDocsLegalesDesdeDisco(), (await cargarCatalogo()).tienda.legal, seccion),
);

export const URL_SITIO = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

/** Enlace canónico: solo con URL pública configurada (los canónicos relativos no valen para buscadores). */
export const canonica = (ruta: string): string | undefined => (URL_SITIO ? ruta : undefined);
