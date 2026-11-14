interface CafeHistoria {
  marca?: string | null;
  fabricante?: string | null;
  municipio?: string | null;
  provincia?: string | null;
  alturaMsnm?: number | null;
  variedades?: readonly string[];
  proceso?: string | null;
}

function unir(items: string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}` : items.join("");
}

/**
 * Historia de respaldo de la portada (modelo C).
 * - Texto del paquete del abogado v1.0 (D5 §6.1; LEG-154), letra por letra, SOLO si todos los cafés activos traen
 *   marca y fabricante y, además, provincia, municipio, altitud, variedad y proceso: el párrafo 2 los promete todos.
 * - Si falta alguno (hoy, D-11), la variante B de LEG-139, que solo nombra los datos de origen que traen todos.
 */
export function historiaRespaldo(cafes: readonly CafeHistoria[], ciudadDespacho: string): string[] {
  const todos = (f: (c: CafeHistoria) => unknown) => cafes.length > 0 && cafes.every((c) => Boolean(f(c)));
  const conRotulo = todos((c) => c.marca) && todos((c) => c.fabricante);
  const datos = [
    todos((c) => c.provincia) && "la provincia",
    todos((c) => c.municipio) && "el municipio",
    todos((c) => c.alturaMsnm) && "la altitud",
    todos((c) => c.variedades?.length) && "la variedad",
    todos((c) => c.proceso) && "el proceso",
  ].filter((d): d is string => Boolean(d));
  if (conRotulo && datos.length === 5) {
    return [
      `De Santander es una tienda de café de origen santandereano. Vendemos café de marcas de Santander, tostado y empacado por quien figura en cada bolsa y en cada ficha, y lo despachamos desde ${ciudadDespacho} a todo Colombia.`,
      "En cada café verás la marca, quién lo fabrica, la provincia, el municipio, la altitud, la variedad y el proceso.",
    ];
  }
  const p1 = "De Santander es una tienda de café de origen santandereano. Reunimos cafés de marcas de nuestra tierra, cada uno tal como lo empaca su fabricante.";
  const inicio = `Desde ${ciudadDespacho} los enviamos a todo Colombia.`;
  return [p1, datos.length ? `${inicio} En cada café te contamos de dónde viene: ${unir(datos)}.` : inicio];
}
