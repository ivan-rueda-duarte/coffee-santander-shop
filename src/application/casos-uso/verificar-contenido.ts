import type { Catalogo } from "@/domain/catalogo/catalogo";
import type { SlugsConContenido } from "../puertos";

/**
 * Cada documento editorial se enlaza con una fila de los CSV por su slug. Si el contenido apunta
 * a algo que no existe (un error de tipeo o un café retirado), devuelve un mensaje claro por slug.
 * Un café o una provincia SIN contenido no es un error: se muestra solo con sus datos.
 */
export function verificarContenido(catalogo: Catalogo, contenido: SlugsConContenido): string[] {
  const existentes = {
    cafeContenido: new Set(catalogo.cafes.map((c) => c.slug)),
    provinciaContenido: new Set(catalogo.provincias.map((p) => p.slug)),
    productorContenido: new Set(catalogo.productores.map((p) => p.slug)),
  };
  const archivos = { cafeContenido: "cafes.csv", provinciaContenido: "provincias.csv", productorContenido: "productores.csv" };
  const errores: string[] = [];
  const revisar = (tipo: keyof typeof existentes, slugs: string[]) => {
    for (const slug of slugs) {
      if (!existentes[tipo].has(slug)) {
        errores.push(`Sanity (${tipo}): el slug "${slug}" no existe en data/${archivos[tipo]}. Corrige el slug en el Studio o agrega la fila al CSV.`);
      }
    }
  };
  revisar("cafeContenido", contenido.cafes);
  revisar("provinciaContenido", contenido.provincias);
  revisar("productorContenido", contenido.productores);
  return errores;
}
