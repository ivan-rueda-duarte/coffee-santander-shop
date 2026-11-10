import { fechaEnLetras } from "../comun/fecha";
import { TEXTOS_ENVIO_GRATIS } from "../envio/envio-gratis";
import type { PromocionEnvioGratis } from "../envio/tipos";
import type { BloqueEstructurado } from "../marca/reglas-texto";
import type { VersionesLegales } from "../pedido/tienda";
import { bloqueDeLinea } from "./texto-legal";

// Condiciones del envío gratis publicadas en /envios/ (microcopy §8.5): el numeral «Envío gratis en comunas de
// Bucaramanga» de «Envíos, devoluciones, retracto y garantía» versión 2, letra por letra. Y el control que impide
// encender la promoción antes de publicar los documentos versión 2 (LEG-106).

/** Marcador del borrador (nota E de envíos) que legal reemplaza por la fecha real el día de la publicación. */
export const MARCA_FECHA_INICIO = "{fecha de inicio en letras}";

/** Frase de la salvedad que los Términos §6 y Envíos §3 versión 2 deben publicar (notas E, LEG-106). */
export const SALVEDAD_V2 = "La única salvedad es el envío gratis en comunas de Bucaramanga";

const esTituloDelNumeral = (texto: string) => texto.replace(/^\d+\.\s+/, "") === TEXTOS_ENVIO_GRATIS.tituloSeccion;

/** Bloques del numeral (sin su título) hasta el siguiente título; null si el texto no lo tiene. */
export function numeralEnvioGratis(bloques: readonly BloqueEstructurado[]): BloqueEstructurado[] | null {
  const inicio = bloques.findIndex((b) => b.tipo === "titulo" && esTituloDelNumeral(b.texto));
  if (inicio === -1) return null;
  const fin = bloques.findIndex((b, i) => i > inicio && b.tipo === "titulo");
  return bloques.slice(inicio + 1, fin === -1 ? undefined : fin);
}

/**
 * Solo para builds de prueba: el numeral tal como está en el borrador (bloque de código de la nota E del
 * documento), con la fecha de inicio de config.csv en lugar del marcador. Nunca se publica en producción.
 */
export function numeralEnvioGratisBorrador(md: string, desde: string): BloqueEstructurado[] | null {
  const lineas = md.split(/\r?\n/).map((l) => l.trim());
  const inicio = lineas.findIndex((l) => l.startsWith("### ") && esTituloDelNumeral(l.slice(4)));
  if (inicio === -1) return null;
  const salida: BloqueEstructurado[] = [];
  for (const linea of lineas.slice(inicio + 1)) {
    if (linea.startsWith("```") || linea.startsWith("#")) break;
    const b = bloqueDeLinea(linea.replaceAll(MARCA_FECHA_INICIO, fechaEnLetras(desde)));
    if (b) salida.push(b);
  }
  return salida;
}

export interface TextosPublicados {
  /** Texto público de «Envíos, devoluciones, retracto y garantía». */
  envios: readonly BloqueEstructurado[];
  terminos: readonly BloqueEstructurado[];
  politica: readonly BloqueEstructurado[];
}

export interface RevisionPublicacion {
  /** Impiden encender la promoción. */
  errores: string[];
  /** No impiden, pero conviene saberlos. */
  avisos: string[];
}

const unir = (bloques: readonly BloqueEstructurado[]) => bloques.map((b) => b.texto).join("\n");

/**
 * ¿Se puede encender la promoción con los documentos publicados? Legal (LEG-106): no sin los Términos y «Envíos,
 * devoluciones, retracto y garantía» versión 2, con la salvedad de la comuna y el numeral de condiciones, el
 * mismo día. Comprueba que el numeral nombre cada comuna del dato y la fecha de inicio, y que los términos con
 * la salvedad rijan desde esa fecha o antes. La política versión 2 (P31 = a) es una recomendación: solo avisa.
 */
export function revisarPublicacionEnvioGratis(promo: PromocionEnvioGratis, legal: VersionesLegales, textos: TextosPublicados): RevisionPublicacion {
  const errores: string[] = [];
  const avisos: string[] = [];
  const numeral = numeralEnvioGratis(textos.envios);
  const fecha = fechaEnLetras(promo.desde);

  if (!numeral) {
    errores.push(`«Envíos, devoluciones, retracto y garantía» no publica el numeral «${TEXTOS_ENVIO_GRATIS.tituloSeccion}» (nota E, versión 2). El envío gratis no se enciende sin los documentos versión 2 (LEG-106).`);
  } else {
    const texto = unir(numeral);
    const faltan = promo.comunas.filter((c) => !texto.includes(c));
    if (faltan.length) errores.push(`el numeral «${TEXTOS_ENVIO_GRATIS.tituloSeccion}» no nombra ${faltan.join(", ")}, que están en data/comunas_envio_gratis.csv.`);
    if (!texto.includes(fecha)) errores.push(`el numeral «${TEXTOS_ENVIO_GRATIS.tituloSeccion}» no dice la fecha de inicio de config.csv («${fecha}», envio_gratis_desde).`);
    if (texto.includes("{")) errores.push(`el numeral «${TEXTOS_ENVIO_GRATIS.tituloSeccion}» todavía tiene un marcador entre llaves (por ejemplo ${MARCA_FECHA_INICIO}).`);
  }
  if (!unir(textos.envios).includes(SALVEDAD_V2)) errores.push(`«Envíos, devoluciones, retracto y garantía» no publica la salvedad de §3 («${SALVEDAD_V2}…», nota E).`);
  if (!unir(textos.terminos).includes(SALVEDAD_V2)) errores.push(`los «Términos y condiciones» no publican la salvedad de §6 («${SALVEDAD_V2}…», nota E, LEG-106).`);
  if (legal.fechaTerminos > promo.desde) errores.push(`los términos rigen desde ${legal.fechaTerminos} (fecha_terminos) y el envío gratis desde ${promo.desde} (envio_gratis_desde): la promoción no puede empezar antes que los documentos que la regulan.`);
  if (!/\bcomuna\b/i.test(unir(textos.politica))) avisos.push("la Política de tratamiento de datos publicada no menciona la comuna (P31 = a recomienda publicar la versión 2 el mismo día; LEG-114).");

  return { errores, avisos };
}
