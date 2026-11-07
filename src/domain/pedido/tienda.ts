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

/** Configuración de la tienda (data/config.csv). */
export interface ConfigTienda {
  nombre: string;
  /** Con indicativo de país y solo dígitos: 573001129874. */
  whatsapp: string;
  ciudadDespacho: string;
  notaEnvio: string;
  formasPago: string[];
  /** Máximo de bolsas por línea del carrito. */
  maxCantidad: number;
  /** Tarifa de IVA incluida en los precios (5). null = no se afirma una tarifa (solo «con todos los impuestos incluidos»). */
  ivaTarifa: number | null;
  legal: VersionesLegales;
  vendedor: DatosVendedor;
}

/**
 * Partes de la línea «Te vende …» del resumen (microcopy §5.4): razón social, NIT, domicilio, dirección de
 * notificación, correo de atención y WhatsApp, cada una solo si existe. Sin razón social no hay línea.
 */
export function partesVendedor(v: DatosVendedor, whatsappFormateado: string | null): string[] {
  if (!v.razonSocial) return [];
  return [
    v.razonSocial,
    v.nit ? `NIT ${v.nit}` : null,
    v.domicilio,
    v.direccionNotificacion,
    v.correoContacto,
    whatsappFormateado ? `WhatsApp ${whatsappFormateado}` : null,
  ].filter((p): p is string => Boolean(p));
}

/** «Te vende De Santander SAS · NIT … · …» o null si no hay razón social. */
export function lineaVendedor(v: DatosVendedor, whatsappFormateado: string | null): string | null {
  const partes = partesVendedor(v, whatsappFormateado);
  return partes.length ? `Te vende ${partes.join(" · ")}.` : null;
}
