import type { BloqueEstructurado } from "../marca/reglas-texto";

// Texto público de los documentos legales (docs/legal/*.md, sección «## Texto para el consumidor»).
// El sitio lo publica letra por letra (LEG-084): aquí solo se reconoce la estructura (subtítulos, párrafos
// y listas) y se comprueba que no se cuele nada interno (marcadores, comentarios, corchetes).

export const ENCABEZADO_TEXTO_CONSUMIDOR = "## Texto para el consumidor";

/** Rótulo que lleva cada documento: «Versión 1 · vigente desde 2026-11-06». */
export interface RotuloLegal {
  version: string;
  /** ISO yyyy-mm-dd. */
  vigenteDesde: string;
}

export interface TextoLegal {
  /** null si el documento no declara el rótulo. */
  rotulo: RotuloLegal | null;
  bloques: BloqueEstructurado[];
}

const ROTULO = /«Versión (\S+) · vigente desde (\d{4}-\d{2}-\d{2})»/;

/** Marcadores que nunca pueden llegar al sitio: trabajo interno de legal, comentarios y corchetes. */
export const MARCADORES_PROHIBIDOS = ["TODO(", "DECISIÓN", "VERIFICAR", "<!--", "[", "]"] as const;

/** Líneas de la sección «## Texto para el consumidor», hasta el siguiente «## » o «---». Vacío si no existe. */
export function lineasTextoConsumidor(md: string): string[] {
  const lineas = md.split(/\r?\n/);
  const inicio = lineas.findIndex((l) => l.trim() === ENCABEZADO_TEXTO_CONSUMIDOR);
  if (inicio === -1) return [];
  const salida: string[] = [];
  for (const linea of lineas.slice(inicio + 1)) {
    const t = linea.trim();
    if (t.startsWith("## ") || t === "---") break;
    salida.push(t);
  }
  return salida;
}

/** Una línea de Markdown sencillo → bloque. Solo subtítulos (###), listas (- / 1.) y párrafos. */
export function bloqueDeLinea(linea: string): BloqueEstructurado | null {
  if (!linea) return null;
  if (linea.startsWith("### ")) return { tipo: "titulo", texto: linea.slice(4).trim() };
  if (linea.startsWith("- ")) return { tipo: "item", texto: linea.slice(2).trim(), numerada: false };
  const numerada = /^\d+\.\s+(.*)$/.exec(linea);
  if (numerada) return { tipo: "item", texto: numerada[1].trim(), numerada: true };
  return { tipo: "parrafo", texto: linea };
}

/** Estructura publicable de un documento legal en Markdown. */
export function parsearTextoLegal(md: string): TextoLegal {
  const r = ROTULO.exec(md);
  return {
    rotulo: r ? { version: r[1], vigenteDesde: r[2] } : null,
    bloques: lineasTextoConsumidor(md).map(bloqueDeLinea).filter((b): b is BloqueEstructurado => b !== null),
  };
}

/**
 * Problemas que impiden publicar el texto: sin sección, sin rótulo, marcadores internos, o versión y fecha
 * distintas de las de data/config.csv (LEG-088). Lista vacía = publicable.
 */
export function problemasTextoLegal(texto: TextoLegal, esperado: RotuloLegal): string[] {
  const problemas: string[] = [];
  if (texto.bloques.length === 0) problemas.push(`no tiene la sección «${ENCABEZADO_TEXTO_CONSUMIDOR}» o está vacía.`);
  if (!texto.bloques.some((b) => b.tipo === "titulo")) problemas.push("el texto para el consumidor no tiene subtítulos (###).");
  for (const b of texto.bloques) {
    const marcador = MARCADORES_PROHIBIDOS.find((m) => b.texto.includes(m));
    if (marcador) problemas.push(`el texto publicado contiene «${marcador}»: "${b.texto.slice(0, 60)}…".`);
  }
  if (!texto.rotulo) problemas.push("no declara el rótulo «Versión N · vigente desde AAAA-MM-DD».");
  else {
    if (texto.rotulo.version !== esperado.version) problemas.push(`declara la versión «${texto.rotulo.version}» y data/config.csv dice «${esperado.version}».`);
    if (texto.rotulo.vigenteDesde !== esperado.vigenteDesde) problemas.push(`declara la vigencia «${texto.rotulo.vigenteDesde}» y data/config.csv dice «${esperado.vigenteDesde}».`);
  }
  return problemas;
}
