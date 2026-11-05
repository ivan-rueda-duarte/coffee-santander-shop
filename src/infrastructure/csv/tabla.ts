import type { Errores } from "./campos";
import { leerCsv, type FilaCsv } from "./lector";

/** Devuelve el contenido de un archivo de data/ por su nombre ("catalogo.csv"). */
export type LeerArchivo = (nombre: string) => string;

/** Lee un CSV de data/ y suma sus errores de formato a `errores`. Si el archivo no existe, lo dice. */
export function tabla(leer: LeerArchivo, archivo: string, requeridas: string[], opcionales: string[], errores: Errores): FilaCsv[] {
  let texto: string;
  try {
    texto = leer(archivo);
  } catch {
    errores.agregar(`${archivo}: no se encontró el archivo en data/.`);
    return [];
  }
  const { filas, errores: erroresLectura } = leerCsv(texto, archivo, { requeridas, opcionales });
  erroresLectura.forEach((e) => errores.agregar(e));
  return filas;
}
