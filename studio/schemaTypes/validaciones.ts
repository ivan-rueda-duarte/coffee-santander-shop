import type { Rule } from "sanity";
// Las mismas reglas de marca que usan las pruebas del sitio (una sola fuente).
import { avisosDeMarca, textoDeBloques } from "../../src/domain/marca/reglas-texto";

const AVISO_SLUG = "Usa minúsculas, números y guiones, sin tildes (por ejemplo san-gil).";

// Cada tipo de campo tiene su propia clase de Rule (StringRule, ArrayRule…) con los mismos
// métodos base; estos ayudantes sirven para cualquiera y devuelven la misma clase que reciben.

/** El slug enlaza este contenido con la fila de data/*.csv. Debe ser idéntico. */
export const slugDeCsv = <R>(rule: R): R =>
  (rule as unknown as Rule).required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).error(AVISO_SLUG) as unknown as R;

/** Advertencia (no bloquea la publicación) si un texto rompe el tono de la marca. */
export const advertenciaDeMarca = <R>(rule: R): R =>
  (rule as unknown as Rule)
    .custom((valor) => {
      const texto = typeof valor === "string" ? valor : textoDeBloques(valor);
      const avisos = avisosDeMarca(texto);
      return avisos.length ? avisos.join(" ") : true;
    })
    .warning() as unknown as R;
