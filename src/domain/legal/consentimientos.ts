import { fechaEnLetras } from "../comun/fecha";
import type { DatosVendedor, VersionesLegales } from "../pedido/tienda";

// Casillas del resumen y aviso de privacidad del formulario (paquete del abogado v1.0: D2 «Textos de las casillas»
// y «Aviso de privacidad», D5 §6.3; LEG-145). Letra por letra; versión, fecha y datos del vendedor de data/config.csv.
// Las cuatro casillas van sin marcar; 1 y 2 son obligatorias; 3 y 4 son opcionales y nunca bloquean.

/** Texto partido alrededor del enlace a su documento: [antes, texto del enlace, después]. */
export type TextoConEnlace = readonly [string, string, string];

/** Casilla 1 (términos): «Leí y acepto los Términos y condiciones versión {v} del {fecha}.» Enlaza a /legal/terminos/. */
export function casillaTerminos(legal: VersionesLegales): TextoConEnlace {
  return ["Leí y acepto los ", `Términos y condiciones versión ${legal.versionTerminos} del ${fechaEnLetras(legal.fechaTerminos)}`, "."];
}

/** Casilla 2 (datos). Enlaza a /legal/privacidad/. */
export function casillaDatos(legal: VersionesLegales, razonSocial: string): TextoConEnlace {
  return [
    `Autorizo a ${razonSocial} a tratar mis datos personales para gestionar mi pedido: confirmarlo, cobrarlo, coordinar la entrega con la transportadora o el mensajero y emitir la factura. Entiendo que el pedido se envía por WhatsApp (Meta) y que algunos servicios pueden tratar mis datos fuera de Colombia. Leí la `,
    `Política de tratamiento de datos versión ${legal.versionPoliticaDatos} del ${fechaEnLetras(legal.fechaPoliticaDatos)}`,
    ".",
  ];
}

/** Casilla 3 (promociones por WhatsApp, opcional). */
export function casillaPromocionesWhatsapp(razonSocial: string): string {
  return `Quiero recibir novedades y promociones de ${razonSocial} por WhatsApp, de lunes a viernes de 7:00 a. m. a 7:00 p. m. y sábados de 8:00 a. m. a 3:00 p. m. Puedo cancelarlo cuando quiera escribiendo «BAJA» al mismo chat. Es opcional y no afecta mi pedido.`;
}

/** Casilla 4 (promociones por correo, opcional): solo se muestra si el cliente escribió un correo válido. */
export function casillaPromocionesCorreo(razonSocial: string, correoTienda: string): string {
  return `Quiero recibir novedades y promociones de ${razonSocial} por correo electrónico. Puedo cancelarlo cuando quiera con el enlace de cada correo o escribiendo a ${correoTienda}. Es opcional y no afecta mi pedido.`;
}

/** Ruta que el aviso de privacidad escribe y enlaza. */
export const RUTA_POLITICA = "/legal/privacidad/";

/**
 * Aviso de privacidad al pie del formulario de envío (D2). Termina en «Lee la política en /legal/privacidad/.»:
 * la interfaz enlaza la ruta. null si falta un dato del vendedor que el aviso nombra (no se publica incompleto).
 */
export function avisoPrivacidad(v: Pick<DatosVendedor, "razonSocial" | "nit" | "correoContacto">, whatsappFormateado: string): TextoConEnlace | null {
  if (!v.razonSocial || !v.nit || !v.correoContacto) return null;
  return [
    `${v.razonSocial} (NIT ${v.nit}, ${v.correoContacto}, WhatsApp ${whatsappFormateado}) trata los datos de tu pedido para confirmarlo, cobrarlo, entregarlo, facturarlo y atender tu retracto, tus garantías y tus reclamos; y, solo si marcas las casillas aparte, para enviarte promociones por el canal que elijas. Los datos viajan en el mensaje que mandas por WhatsApp (Meta) y se comparten con la transportadora o el mensajero. Algunos servicios los tratan fuera de Colombia. Puedes conocer, corregir o borrar tus datos y retirar tu autorización. Lee la política en `,
    RUTA_POLITICA,
    ".",
  ];
}
