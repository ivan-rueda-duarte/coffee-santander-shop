export interface DatosVendedor {
  razonSocial: string | null;
  nit: string | null;
  domicilio: string | null;
  correoContacto: string | null;
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
  /** Datos legales (Ley 1480). Mientras falten, no se muestran. */
  vendedor: DatosVendedor;
}

/** ¿Están todos los datos legales del vendedor? Si no, la interfaz no los muestra. */
export function vendedorCompleto(v: DatosVendedor): boolean {
  return Boolean(v.razonSocial && v.nit && v.domicilio && v.correoContacto);
}
