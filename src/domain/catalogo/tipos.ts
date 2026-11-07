export const PROCESOS = ["lavado", "honey", "natural", "fermentacion_controlada"] as const;
export type Proceso = (typeof PROCESOS)[number];

export const TUESTES = ["claro", "medio_claro", "medio", "medio_oscuro", "oscuro"] as const;
export type Tueste = (typeof TUESTES)[number];

// El filtro agrupa los cinco niveles en tres.
export const GRUPOS_TUESTE = ["claro", "medio", "oscuro"] as const;
export type GrupoTueste = (typeof GRUPOS_TUESTE)[number];

export const MOLIENDAS = ["grano", "molido"] as const;
export type Molienda = (typeof MOLIENDAS)[number];

/** Expresión del rótulo que acompaña al fabricante o envasador (Res. 5109 de 2005). */
export const EXPRESIONES_FABRICANTE = ["FABRICADO POR", "ENVASADO POR"] as const;
export type ExpresionFabricante = (typeof EXPRESIONES_FABRICANTE)[number];

export const PERFILES = ["chocolate", "frutal", "floral", "caramelo", "citrico", "especiado", "panela", "nueces"] as const;
export type Perfil = (typeof PERFILES)[number];

export interface Provincia {
  slug: string;
  nombre: string;
  nombreCorto: string;
  colorHex: string;
  /** null = por completar: no se muestra. */
  descripcion: string | null;
  orden: number;
}

export interface Municipio {
  slug: string;
  nombre: string;
  /** Código DIVIPOLA del DANE, si se conoce. */
  divipola: string | null;
  /** null mientras la provincia esté por verificar (Tona). */
  provinciaSlug: string | null;
  porVerificar: boolean;
}

export interface Productor {
  slug: string;
  nombre: string;
  tipo: "finca" | "productor" | "marca_aliada";
  municipioSlug: string | null;
}

/** Tamaños de bolsa que el catálogo admite (una columna precio_<gramos>g por tamaño). */
export const TAMANOS_GRAMOS = [250, 500, 1000] as const;

export interface Presentacion {
  gramos: number;
  precioCop: number;
  disponible: boolean;
}

export interface Cafe {
  slug: string;
  nombre: string;
  municipioSlug: string;
  municipio: string;
  provinciaSlug: string | null;
  provincia: string | null;
  productorSlug: string | null;
  productor: string | null;
  alturaMsnm: number | null;
  variedades: string[];
  proceso: Proceso;
  /** Texto original ("Lavado tradicional") hasta que se decida si son procesos distintos. */
  procesoDetalle: string | null;
  tueste: Tueste;
  notasCata: string[];
  perfiles: Perfil[];
  puntajeSca: number | null;
  /** El sello y el filtro SCA solo usan puntajes verificados. */
  puntajeVerificado: boolean;
  /** Quién cató y cuándo (fecha ISO). Obligatorios para verificar un puntaje. */
  puntajeFuente: string | null;
  puntajeFecha: string | null;
  /** Marca con la que el fabricante vende el café (tal como en la bolsa). La tienda no es la marca (modelo C). */
  marca: string | null;
  /** Razón social del fabricante o envasador, tal como en el rótulo. */
  fabricante: string | null;
  fabricanteExpresion: ExpresionFabricante | null;
  /** Notificación sanitaria INVIMA (NSA-…); se muestra solo cuando existe. */
  nsa: string | null;
  titularNsa: string | null;
  moliendas: Molienda[];
  presentaciones: Presentacion[];
  /** Rutas de las fotos del café en public/ (la primera es la principal). Vacío = ilustración de la marca. */
  fotos: string[];
  /** Descripción de las fotos para lectores de pantalla; si falta se usa el nombre del café. */
  fotoDescripcion: string | null;
  destacado: boolean;
  orden: number;
}

/** Etiquetas visibles. */
export const ETIQUETA_MOLIENDA: Record<Molienda, string> = { grano: "Grano entero", molido: "Molido" };
export const ETIQUETA_TUESTE: Record<Tueste, string> = {
  claro: "Claro",
  medio_claro: "Medio claro",
  medio: "Medio",
  medio_oscuro: "Medio oscuro",
  oscuro: "Oscuro",
};
export const ETIQUETA_TUESTE_GRUPO: Record<GrupoTueste, string> = { claro: "Claro", medio: "Medio", oscuro: "Oscuro" };
export const ETIQUETA_PROCESO: Record<Proceso, string> = {
  lavado: "Lavado",
  honey: "Honey",
  natural: "Natural",
  fermentacion_controlada: "Fermentación controlada",
};

export function grupoDeTueste(t: Tueste): GrupoTueste {
  if (t === "claro" || t === "medio_claro") return "claro";
  if (t === "medio") return "medio";
  return "oscuro";
}

/** Precio "desde": la presentación más barata. null si no hay presentaciones. */
export function precioDesde(cafe: Pick<Cafe, "presentaciones">): number | null {
  const precios = cafe.presentaciones.map((p) => p.precioCop);
  return precios.length ? Math.min(...precios) : null;
}

/** Un café se puede comprar si al menos una presentación está disponible. */
export function estaDisponible(cafe: Pick<Cafe, "presentaciones">): boolean {
  return cafe.presentaciones.some((p) => p.disponible);
}

/** El sello SCA solo se muestra con puntaje real verificado y ≥ 80. */
export function mostrarSelloSca(cafe: Pick<Cafe, "puntajeSca" | "puntajeVerificado">): boolean {
  return cafe.puntajeVerificado && cafe.puntajeSca !== null && cafe.puntajeSca >= 80;
}
