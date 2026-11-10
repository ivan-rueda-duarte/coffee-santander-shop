// Variables de entorno que se leen solo en el build (Server Components y tools/). Nunca llegan al navegador.

/** Fecha de hoy en Colombia (ISO yyyy-mm-dd). Decide en el build si una promoción con fechas rige. */
export function hoyEnColombia(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(ahora);
}

/**
 * `ENVIO_GRATIS_PRUEBA=si`: build de prueba con el envío gratis encendido sin los documentos versión 2. El control
 * de publicación (LEG-106) pasa de error a aviso y /envios/ toma las condiciones del borrador de legal (nota E).
 * Prohibido en el despliegue: con GITHUB_PAGES=true lanza un error.
 */
export function modoPruebaEnvioGratis(entorno: Readonly<Record<string, string | undefined>> = process.env): boolean {
  const activo = entorno.ENVIO_GRATIS_PRUEBA === "si";
  if (activo && entorno.GITHUB_PAGES === "true") {
    throw new Error("ENVIO_GRATIS_PRUEBA=si no se puede usar en el despliegue (GITHUB_PAGES=true): publicaría condiciones del envío gratis que legal no ha publicado (LEG-106).");
  }
  return activo;
}
