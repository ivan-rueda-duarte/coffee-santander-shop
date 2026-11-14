/** Datos legales del vendedor (Ley 1480, art. 50 lit. a). Cada dato se muestra solo si existe. */
export interface DatosVendedor {
  razonSocial: string | null;
  nit: string | null;
  domicilio: string | null;
  /** Dirección de notificación judicial. */
  direccionNotificacion: string | null;
  /** Correo de atención. */
  correoContacto: string | null;
  /** Correo de notificación judicial (suele ser el mismo de atención). */
  correoNotificacion: string | null;
  /** Solo se publican en /legal/vendedor/ y en los documentos (LEG-085). */
  matriculaMercantil: string | null;
  representanteLegal: string | null;
  /** Área que atiende consultas y reclamos de datos personales. */
  areaDatos: string | null;
}

/** Versión y fecha de vigencia de los documentos legales (data/config.csv). Nada fijo en el código (LEG-088). */
export interface VersionesLegales {
  versionTerminos: string;
  /** ISO yyyy-mm-dd. */
  fechaTerminos: string;
  versionPoliticaDatos: string;
  fechaPoliticaDatos: string;
}

/** Medios de pago que admiten los textos legales 1.0 (D1 §7): transferencia bancaria o Bre-B, antes del despacho. */
export const MEDIOS_PAGO = ["transferencia", "bre-b"] as const;
export type MedioPago = (typeof MEDIOS_PAGO)[number];

/** Textos fijos de pago (D5 §6.3 y §6.4; LEG-144, LEG-165). */
export const TEXTOS_PAGO = {
  formulario: "Pagas por transferencia bancaria o por Bre-B después de aceptar el total por WhatsApp. En esta página no se paga.",
  mensaje: "Pago: transferencia o Bre-B",
  pie: "Transferencia bancaria o Bre-B",
} as const;

/** Configuración de la tienda (data/config.csv). */
export interface ConfigTienda {
  nombre: string;
  /** Con indicativo de país y solo dígitos: 573001129874. */
  whatsapp: string;
  ciudadDespacho: string;
  /** Medios de pago (`medios_pago`), solo de uso interno: los textos de pago son fijos (D5 §6.3). */
  mediosPago: MedioPago[];
  /** Máximo de bolsas por línea del carrito. */
  maxCantidad: number;
  /** Tarifa de IVA incluida en los precios (5). null = no se afirma una tarifa (solo «con todos los impuestos incluidos»). */
  ivaTarifa: number | null;
  legal: VersionesLegales;
  vendedor: DatosVendedor;
}

/**
 * Partes de la línea «Te vende …» del resumen (D5 §6.3): razón social y NIT, cada una solo si existe.
 * Sin razón social no hay línea. El enlace «Información del vendedor» lo pone la interfaz.
 */
export function partesVendedor(v: DatosVendedor): string[] {
  if (!v.razonSocial) return [];
  return [v.razonSocial, v.nit ? `NIT ${v.nit}` : null].filter((p): p is string => Boolean(p));
}

/** «Te vende De Santander SAS · NIT 902.121.184-8» o null si no hay razón social. */
export function lineaVendedor(v: DatosVendedor): string | null {
  const partes = partesVendedor(v);
  return partes.length ? `Te vende ${partes.join(" · ")}` : null;
}
