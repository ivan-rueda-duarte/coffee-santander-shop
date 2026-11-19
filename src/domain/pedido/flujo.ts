import { ETIQUETA_MOLIENDA } from "../catalogo/tipos";
import type { LineaCarrito } from "./carrito";

// Textos y reglas del flujo del pedido en tres pasos (diseño 2026-11-18, A1; dictamen LEG-171 a LEG-175).
// Los textos van letra por letra desde docs/legal/revisiones/2026-11-18-flujo-pedido-un-clic.md.

/**
 * Microayuda de §5.9 encima de «Enviar por WhatsApp»: variante de una sola frase de la microcopy v1.11 (LEG-181), la
 * misma si falta una casilla obligatoria o las dos; nombra las dos casillas que exige el botón para que no se confundan
 * con las de promociones (QA-023). null si las dos casillas obligatorias están marcadas.
 */
export function microayudaCasillas(terminos: boolean, autorizacion: boolean): string | null {
  if (terminos && autorizacion) return null;
  return "Para enviar tu pedido, acepta los términos y autoriza tus datos.";
}

/** LEG-171: cómo sigue la compra, encima del botón del resumen. La variante depende de si el envío va por cotizar. */
export function textoSiguientePaso(porCotizar: boolean): string {
  return porCotizar
    ? "Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido escrito. Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor."
    : "Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido escrito. Con ese mensaje nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.";
}

/** LEG-173 (3): primera línea del respaldo, con el número de data/config.csv ya formateado (`formatearWhatsapp`). */
export function textoRespaldo(whatsappFormateado: string): string {
  return `¿No se abrió WhatsApp? Copia el mensaje y envíalo al ${whatsappFormateado}.`;
}

export interface EstadoSolicitud {
  lineas: readonly LineaCarrito[];
  /** Lo que escribió la persona en el formulario de envío, tal cual. */
  envio: Readonly<Record<string, string>>;
  terminos: boolean;
  autorizacion: boolean;
  promoWhatsapp: boolean;
  promoCorreo: boolean;
}

/**
 * Huella de todo lo que entra en el mensaje (LEG-173 (2); §4 bis 1). Mientras no cambie, un segundo clic reabre el
 * mismo enlace con el mismo número DS; si cambia el carrito, un dato de envío o cualquiera de las cuatro casillas,
 * la solicitud preparada deja de valer. No depende del orden de las líneas ni de las llaves del formulario.
 */
export function firmaSolicitud(e: EstadoSolicitud): string {
  const lineas = e.lineas.map((l) => `${l.cafeSlug}|${l.gramos}|${l.molienda}|${l.cantidad}`).sort();
  const envio = Object.keys(e.envio)
    .sort()
    .map((k) => [k, e.envio[k]]);
  return JSON.stringify([lineas, envio, e.terminos, e.autorizacion, e.promoWhatsapp, e.promoCorreo]);
}

/** Bloque compacto «Tu pedido» del paso Envío (A1): hasta `maximo` líneas y cuántas quedan fuera («y {n} más»). */
export function resumenCompacto(lineas: readonly LineaCarrito[], nombreDe: (slug: string) => string, maximo = 3): { lineas: string[]; resto: number } {
  const textos = lineas.map((l) => `${nombreDe(l.cafeSlug)} · ${l.gramos} g · ${ETIQUETA_MOLIENDA[l.molienda].toLowerCase()} × ${l.cantidad}`);
  return { lineas: textos.slice(0, maximo), resto: Math.max(0, textos.length - maximo) };
}

// Vista «Mensaje listo» (diseño 2026-11-19; microcopy v1.12 §9.6; LEG-188 a LEG-191). Textos letra por letra de §9.6.
// No dice «enviado», «recibido», «confirmado», «compra» ni «finalizado», y no muestra el número DS (LEG-191).
export const TEXTOS_MENSAJE_LISTO = {
  titulo: "Envía el mensaje en WhatsApp",
  nota: "Vaciamos «Tu pedido» en este navegador para que puedas armar uno nuevo. El mensaje de WhatsApp lleva todos los cafés.",
  rotuloBloque: "En el mensaje",
  recuperar: "Recuperar el pedido",
  seguir: "Seguir viendo cafés",
} as const;

/** Bajada de la vista «Mensaje listo» (§9.6): las frases de §9.3 sin «Al pulsar…», según si el envío va por cotizar. */
export function bajadaMensajeListo(porCotizar: boolean): string {
  return porCotizar
    ? "Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor."
    : "Con ese mensaje nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.";
}

/** Lo que importa de la copia del mensaje para decidir si sigue valiendo (la copia completa vive solo en memoria). */
export interface CopiaSolicitud {
  /** `firmaSolicitud` del clic válido que generó el mensaje. */
  firma: string;
  /** true desde que el propio envío vació el pedido hasta que el pedido se recupera. */
  vaciadoPorEnvio: boolean;
}

/**
 * Regla de la copia del mensaje tras un cambio (microcopy v1.12 §9.4 y §9.5 regla 4; QA-022; LEG-188 (5)):
 * - «vigente»: sigue valiendo tal cual (pedido vacío por el propio envío, o mismo contenido que el mensaje);
 * - «recuperada»: el pedido vacío por el envío volvió con las mismas líneas (Recuperar el pedido / Deshacer): vale, y
 *   ya no está vacía por el envío;
 * - «descartar»: cualquier otro cambio (otras líneas, un dato de envío, una casilla, o un vaciado que no fue el envío).
 */
export function revisarCopia(copia: CopiaSolicitud, firmaActual: string, hayLineas: boolean): "vigente" | "recuperada" | "descartar" {
  if (!hayLineas) return copia.vaciadoPorEnvio ? "vigente" : "descartar";
  if (copia.firma !== firmaActual) return "descartar";
  return copia.vaciadoPorEnvio ? "recuperada" : "vigente";
}
