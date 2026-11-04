import { parse } from "csv-parse/sync";

/** Una fila del CSV con su número de línea en el archivo (la cabecera es la línea 1). */
export interface FilaCsv {
  linea: number;
  valores: Record<string, string>;
}

export class ErrorDatos extends Error {
  constructor(public readonly errores: string[]) {
    super(`Hay ${errores.length} ${errores.length === 1 ? "problema" : "problemas"} en los datos de data/:\n${errores.map((e) => `  - ${e}`).join("\n")}`);
    this.name = "ErrorDatos";
  }
}

/** Excel en español guarda con ";" y no con ","; se detecta mirando la cabecera. */
function detectarSeparador(texto: string): "," | ";" {
  const cabecera = texto.replace(/^﻿/, "").split(/\r?\n/, 1)[0] ?? "";
  const comas = (cabecera.match(/,/g) ?? []).length;
  const puntosYComa = (cabecera.match(/;/g) ?? []).length;
  return puntosYComa > comas ? ";" : ",";
}

export interface OpcionesLectura {
  /** Columnas que deben existir. */
  requeridas: readonly string[];
  /** Columnas que pueden existir. Cualquier otra se reporta como error (suele ser un error de tipeo). */
  opcionales?: readonly string[];
}

/**
 * Lee un CSV. No lanza: devuelve las filas y los errores de formato (columnas faltantes o desconocidas,
 * comillas sin cerrar, filas con más o menos celdas que la cabecera).
 */
export function leerCsv(texto: string, archivo: string, opciones: OpcionesLectura): { filas: FilaCsv[]; errores: string[] } {
  const errores: string[] = [];
  let cabecera: string[] = [];
  const permitidas = new Set([...opciones.requeridas, ...(opciones.opcionales ?? [])]);

  let registros: { record: Record<string, string>; info: { lines: number } }[];
  try {
    registros = parse(texto, {
      bom: true,
      delimiter: detectarSeparador(texto),
      columns: (h: string[]) => (cabecera = h.map((c) => c.trim())),
      skip_empty_lines: true,
      trim: true,
      info: true,
    });
  } catch (e) {
    const detalle = e instanceof Error ? e.message : String(e);
    return { filas: [], errores: [`${archivo}: no se pudo leer (${detalle}).`] };
  }

  for (const columna of opciones.requeridas) {
    if (!cabecera.includes(columna)) errores.push(`${archivo}: falta la columna "${columna}" en la primera línea.`);
  }
  for (const columna of cabecera) {
    if (!permitidas.has(columna)) errores.push(`${archivo}: la columna "${columna}" no existe. Columnas válidas: ${[...permitidas].join(", ")}.`);
  }
  if (errores.length) return { filas: [], errores };

  const filas = registros.map(({ record, info }) => ({ linea: info.lines, valores: record }));
  return { filas, errores };
}
