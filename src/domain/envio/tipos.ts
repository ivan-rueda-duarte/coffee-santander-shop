/** Zonas de envío (docs/ENVIOS.md §2). La 5 es el trayecto especial: sin tarifa publicada. */
export type Zona = 1 | 2 | 3 | 4 | 5;
export const ZONAS: readonly Zona[] = [1, 2, 3, 4, 5];

/** Zona de un destino que no aparece en data/zonas_envio.csv: cobertura normal. */
export const ZONA_POR_DEFECTO: Zona = 4;

/** Zona a partir de la cual no hay tarifa publicada. */
export const ZONA_ESPECIAL: Zona = 5;

/** Peso del empaque que se suma al pedido, en gramos (docs/ENVIOS.md §3). */
export const EMPAQUE_G = 80;

/** Límites de los escalones, en kilos y en gramos: coinciden con las columnas hasta_1kg, hasta_2kg y hasta_5kg del CSV. */
export const ESCALONES_KG = [1, 2, 5] as const;
export type EscalonKg = (typeof ESCALONES_KG)[number];

/**
 * Límite de un escalón en gramos de peso facturable. Incluye el empaque, para que una carga nominal de
 * 1, 2 o 5 kg quepa en su escalón: 1.080 / 2.080 / 5.080 g.
 */
export const limiteEscalonG = (kg: EscalonKg): number => kg * 1000 + EMPAQUE_G;

/** Más de este peso facturable (5.080 g) el envío va por cotizar. */
export const LIMITE_MAXIMO_G = limiteEscalonG(5);

/** Precios de los tres escalones, en pesos. */
export type Escalones = readonly [number, number, number];

/** Una fila de data/tarifas_envio.csv. `escalones` es null cuando la zona es "por cotizar" (zona 5). */
export interface TarifaEnvio {
  zona: Zona;
  /** En zona 1 es el slug del municipio ("giron"); en las demás, "zona2" … "zona5". */
  clave: string;
  nombre: string;
  medio: string;
  escalones: Escalones | null;
}

/** Una fila de data/zonas_envio.csv. */
export interface ReglaZona {
  nivel: "departamento" | "municipio";
  departamento: string;
  /** Solo en las reglas de nivel municipio. */
  municipio: string | null;
  zona: Zona;
}

export interface ReglasEnvio {
  tarifas: readonly TarifaEnvio[];
  zonas: readonly ReglaZona[];
}

/** Lo mínimo que hace falta de cada línea del pedido para pesarlo. */
export interface ItemPesable {
  gramos: number;
  cantidad: number;
}

export interface DestinoEnvio {
  departamento: string;
  municipio: string;
}

export interface ZonaResuelta {
  zona: Zona;
  /** Clave de la tarifa que corresponde. */
  clave: string;
}

export type MotivoPorCotizar = "zona_especial" | "mas_de_5kg";

export type ResultadoEnvio =
  | { tipo: "tarifa"; zona: Zona; clave: string; pesoFacturableG: number; escalonKg: EscalonKg; valorCop: number }
  | { tipo: "por_cotizar"; zona: Zona; pesoFacturableG: number; motivo: MotivoPorCotizar };
