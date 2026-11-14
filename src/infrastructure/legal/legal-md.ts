import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ContenidoLegal, ContenidoRepositorio } from "@/application/puertos";
import { numeralEnvioGratis, numeralEnvioGratisBorrador, revisarPublicacionEnvioGratis, type RevisionPublicacion } from "@/domain/legal/envio-gratis";
import { parsearTextoLegal, problemasTextoLegal, valoresTextoLegal, type RotuloLegal } from "@/domain/legal/texto-legal";
import type { FinEnvioGratis, PromocionEnvioGratis } from "@/domain/envio/tipos";
import type { BloqueEstructurado } from "@/domain/marca/reglas-texto";
import type { VersionesLegales } from "@/domain/pedido/tienda";
import { ErrorDatos } from "../csv/lector";

/**
 * Páginas legales (LEG-084, LEG-158): el texto público sale SOLO de los documentos de docs/legal/ (sección
 * «Texto para el consumidor»), letra por letra, con los valores entre llaves de data/config.csv (LEG-142).
 * La versión y la fecha que declara cada documento deben coincidir con data/config.csv; si no, el build falla.
 * Sanity no publica páginas legales: aunque traiga una, no gana sobre la versión de docs/legal/.
 */

export const CARPETA_LEGAL = "docs/legal";

export interface DocumentoLegal {
  archivo: string;
  version: "terminos" | "politica";
  /** Título de la página (h1), el del paquete del abogado v1.0. */
  titulo: string;
  /** Ruta pública. D3 se publica en /envios/ (LEG-141); /legal/envios-devoluciones/ solo remite allí. */
  ruta: string;
}

/** Sección → archivo, versión de config.csv que le corresponde, título y ruta pública. */
export const DOCUMENTOS_LEGALES: Record<string, DocumentoLegal> = {
  terminos: { archivo: "terminos-y-condiciones.md", version: "terminos", titulo: "Términos y condiciones de compra", ruta: "/legal/terminos/" },
  privacidad: { archivo: "politica-tratamiento-datos.md", version: "politica", titulo: "Política de tratamiento de datos personales", ruta: "/legal/privacidad/" },
  // Complementan los términos (términos §1): llevan su misma versión y fecha.
  "envios-devoluciones": { archivo: "envios-devoluciones-retracto.md", version: "terminos", titulo: "Envíos, devoluciones, retracto y garantía", ruta: "/envios/" },
  vendedor: { archivo: "informacion-vendedor.md", version: "terminos", titulo: "Información del vendedor", ruta: "/legal/vendedor/" },
};

export type LeerDocumento = (archivo: string) => string;

export function leerDocsLegalesDesdeDisco(carpeta: string = join(process.cwd(), CARPETA_LEGAL)): LeerDocumento {
  return (archivo) => readFileSync(join(carpeta, archivo), "utf8");
}

function rotuloEsperado(legal: VersionesLegales, cual: "terminos" | "politica"): RotuloLegal {
  return cual === "terminos"
    ? { version: legal.versionTerminos, vigenteDesde: legal.fechaTerminos }
    : { version: legal.versionPoliticaDatos, vigenteDesde: legal.fechaPoliticaDatos };
}

/** Problemas de todos los documentos (para `npm run datos`). Lista vacía = publicables. */
export function problemasDocsLegales(leer: LeerDocumento, legal: VersionesLegales): string[] {
  return Object.entries(DOCUMENTOS_LEGALES).flatMap(([, d]) => {
    let md: string;
    try {
      md = leer(d.archivo);
    } catch {
      return [`${CARPETA_LEGAL}/${d.archivo}: no se encontró el documento de ${d.ruta}.`];
    }
    return problemasTextoLegal(parsearTextoLegal(md, valoresTextoLegal(legal)), rotuloEsperado(legal, d.version)).map((p) => `${CARPETA_LEGAL}/${d.archivo}: ${p}`);
  });
}

/** Página legal desde docs/legal/. Lanza ErrorDatos si el texto no es publicable; null si la sección no existe. */
export function cargarLegalDesdeDocs(leer: LeerDocumento, legal: VersionesLegales, seccion: string): ContenidoLegal | null {
  const d = DOCUMENTOS_LEGALES[seccion];
  if (!d) return null;
  const esperado = rotuloEsperado(legal, d.version);
  const texto = parsearTextoLegal(leer(d.archivo), valoresTextoLegal(legal));
  const problemas = problemasTextoLegal(texto, esperado);
  if (problemas.length) throw new ErrorDatos(problemas.map((p) => `${CARPETA_LEGAL}/${d.archivo}: ${p}`));
  return { seccion, version: esperado.version, vigenteDesde: esperado.vigenteDesde, contenido: texto.bloques };
}

/**
 * Repositorio de contenido cuyas páginas legales salen siempre de docs/legal/ (LEG-158): una página legal de
 * Sanity nunca gana sobre el texto 1.0 del repositorio. El resto del contenido editorial sigue viniendo de `interno`.
 */
export function conLegalDesdeDocs(interno: ContenidoRepositorio, docs: (seccion: string) => Promise<ContenidoLegal | null>): ContenidoRepositorio {
  return {
    cafe: (slug) => interno.cafe(slug),
    provincia: (slug) => interno.provincia(slug),
    inicio: () => interno.inicio(),
    historia: () => interno.historia(),
    slugs: () => interno.slugs(),
    legal: (seccion) => docs(seccion),
  };
}

/** Texto público (bloques) de una sección de docs/legal/, con los valores de config.csv. Vacío si el documento no existe. */
function bloquesPublicados(leer: LeerDocumento, seccion: keyof typeof DOCUMENTOS_LEGALES, legal: VersionesLegales): BloqueEstructurado[] {
  try {
    return parsearTextoLegal(leer(DOCUMENTOS_LEGALES[seccion].archivo), valoresTextoLegal(legal)).bloques;
  } catch {
    return [];
  }
}

/** Control de publicación del envío gratis (LEG-106) con los documentos de docs/legal/. */
export function revisarEnvioGratisEnDocs(leer: LeerDocumento, promo: PromocionEnvioGratis, legal: VersionesLegales): RevisionPublicacion {
  return revisarPublicacionEnvioGratis(promo, legal, {
    envios: bloquesPublicados(leer, "envios-devoluciones", legal),
    terminos: bloquesPublicados(leer, "terminos", legal),
    politica: bloquesPublicados(leer, "privacidad", legal),
  });
}

/**
 * Condiciones de la promoción terminada (microcopy §8.6.1): el numeral publicado, letra por letra; en un build de
 * prueba, el del borrador. null si ya no está publicado: legal lo retira en una versión nueva y la sección se quita.
 */
export function condicionesEnvioGratisTerminada(publicado: readonly BloqueEstructurado[], leer: LeerDocumento, fin: Pick<FinEnvioGratis, "desde">, borrador: boolean): BloqueEstructurado[] | null {
  return numeralEnvioGratis(publicado) ?? (borrador ? numeralEnvioGratisBorrador(leer(DOCUMENTOS_LEGALES["envios-devoluciones"].archivo), fin.desde) : null);
}

/** ¿«Envíos, devoluciones, retracto y garantía» publicado (en docs/legal/) tiene el numeral del envío gratis? */
export function numeralEnvioGratisPublicado(leer: LeerDocumento, legal: VersionesLegales): boolean {
  return numeralEnvioGratis(bloquesPublicados(leer, "envios-devoluciones", legal)) !== null;
}

/**
 * Condiciones del envío gratis para /envios/ (microcopy §8.5). Salen del texto publicado de «Envíos, devoluciones,
 * retracto y garantía» (`publicado`, el mismo que sirve /envios/). Sin el numeral, lanza
 * ErrorDatos: la promoción no se publica sin sus condiciones (LEG-106, art. 33 de la Ley 1480). Solo en un build
 * de prueba (`borrador = true`) se usa el borrador de la nota E.
 */
export function condicionesEnvioGratis(publicado: readonly BloqueEstructurado[], leer: LeerDocumento, promo: PromocionEnvioGratis, borrador: boolean): BloqueEstructurado[] {
  const numeral = numeralEnvioGratis(publicado);
  if (numeral) return numeral;
  const archivo = DOCUMENTOS_LEGALES["envios-devoluciones"].archivo;
  if (borrador) {
    const deBorrador = numeralEnvioGratisBorrador(leer(archivo), promo.desde);
    if (deBorrador) return deBorrador;
  }
  throw new ErrorDatos([`${CARPETA_LEGAL}/${archivo}: el texto publicado no tiene el numeral «Envío gratis en comunas de Bucaramanga» y config.csv enciende el envío gratis (envio_gratis_desde). Legal publica el numeral 13 ese mismo día (LEG-106, LEG-167).`]);
}
