import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CatalogoRepositorio } from "@/application/puertos";
import { cargarCatalogo, type LeerArchivo, type ResultadoCarga } from "./cargar-catalogo";

/** Carpeta de los CSV, relativa a la raíz del proyecto. */
export const CARPETA_DATOS = "data";

export function leerDesdeDisco(carpeta: string = join(process.cwd(), CARPETA_DATOS)): LeerArchivo {
  return (nombre) => readFileSync(join(carpeta, nombre), "utf8");
}

export function cargarCatalogoDesdeDisco(carpeta?: string): ResultadoCarga {
  return cargarCatalogo(leerDesdeDisco(carpeta));
}

/**
 * Catálogo desde los CSV. Solo para el build (Server Components) y las herramientas:
 * usa el sistema de archivos, así que no puede ir en código de navegador.
 */
export class RepositorioCatalogoCsv implements CatalogoRepositorio {
  constructor(private readonly carpeta?: string) {}

  async obtener() {
    return cargarCatalogoDesdeDisco(this.carpeta).catalogo;
  }
}
