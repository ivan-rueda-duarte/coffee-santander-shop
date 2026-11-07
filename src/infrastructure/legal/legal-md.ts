import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ContenidoLegal, ContenidoRepositorio } from "@/application/puertos";
import { parsearTextoLegal, problemasTextoLegal, type RotuloLegal } from "@/domain/legal/texto-legal";
import type { VersionesLegales } from "@/domain/pedido/tienda";
import { ErrorDatos } from "../csv/lector";

/**
 * Respaldo de las páginas legales sin Sanity (LEG-084): el texto público sale de los documentos de
 * docs/legal/ (sección «Texto para el consumidor»), letra por letra. La versión y la fecha que declara
 * cada documento deben coincidir con data/config.csv; si no, el build falla.
 */

export const CARPETA_LEGAL = "docs/legal";

/** Sección publicada → archivo y qué versión de config.csv le corresponde. */
export const DOCUMENTOS_LEGALES: Record<string, { archivo: string; version: "terminos" | "politica" }> = {
  terminos: { archivo: "terminos-y-condiciones.md", version: "terminos" },
  privacidad: { archivo: "politica-tratamiento-datos.md", version: "politica" },
  // Complementan los términos (términos §1): llevan su misma versión y fecha.
  "envios-devoluciones": { archivo: "envios-devoluciones-retracto.md", version: "terminos" },
  vendedor: { archivo: "informacion-vendedor.md", version: "terminos" },
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
  return Object.entries(DOCUMENTOS_LEGALES).flatMap(([seccion, d]) => {
    let md: string;
    try {
      md = leer(d.archivo);
    } catch {
      return [`${CARPETA_LEGAL}/${d.archivo}: no se encontró el documento de /legal/${seccion}/.`];
    }
    return problemasTextoLegal(parsearTextoLegal(md), rotuloEsperado(legal, d.version)).map((p) => `${CARPETA_LEGAL}/${d.archivo}: ${p}`);
  });
}

/** Página legal desde docs/legal/. Lanza ErrorDatos si el texto no es publicable; null si la sección no existe. */
export function cargarLegalDesdeDocs(leer: LeerDocumento, legal: VersionesLegales, seccion: string): ContenidoLegal | null {
  const d = DOCUMENTOS_LEGALES[seccion];
  if (!d) return null;
  const esperado = rotuloEsperado(legal, d.version);
  const texto = parsearTextoLegal(leer(d.archivo));
  const problemas = problemasTextoLegal(texto, esperado);
  if (problemas.length) throw new ErrorDatos(problemas.map((p) => `${CARPETA_LEGAL}/${d.archivo}: ${p}`));
  return { seccion, version: esperado.version, vigenteDesde: esperado.vigenteDesde, contenido: texto.bloques };
}

/** Repositorio de contenido que, si `legal()` no trae nada (Sanity sin la página o sin configurar), usa el respaldo. */
export function conRespaldoLegal(interno: ContenidoRepositorio, respaldo: (seccion: string) => Promise<ContenidoLegal | null>): ContenidoRepositorio {
  return {
    cafe: (slug) => interno.cafe(slug),
    provincia: (slug) => interno.provincia(slug),
    inicio: () => interno.inicio(),
    historia: () => interno.historia(),
    slugs: () => interno.slugs(),
    legal: async (seccion) => (await interno.legal(seccion)) ?? respaldo(seccion),
  };
}
