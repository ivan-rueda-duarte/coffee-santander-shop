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

/** Una fila de data/plazos_envio.csv. `maximo` es null en la zona 5 («por cotizar»). */
export interface PlazoEnvio {
  zona: Zona;
  /** «1 a 3 días hábiles». */
  estimado: string;
  /** «3 días hábiles»; null = se informa al cotizar (nunca más de 30 días calendario). */
  maximo: string | null;
}

/**
 * Envío gratis en comunas de un municipio de zona 1 (data/comunas_envio_gratis.csv y las claves
 * envio_gratis_desde / envio_gratis_hasta de data/config.csv; microcopy-legal §8). Decisiones del dueño del
 * 2026-11-09: $0 con cualquier peso, sin pedido mínimo, sin fecha final.
 */
export interface PromocionEnvioGratis {
  departamento: string;
  municipio: string;
  /** Comunas cubiertas, en el orden en que las nombran los textos legales (§8.1). El selector las ordena alfabéticamente. */
  comunas: readonly string[];
  /** ISO yyyy-mm-dd: desde cuándo rige (D-21). */
  desde: string;
  /** ISO yyyy-mm-dd, inclusive; null = sin fecha final (P25 = a). */
  hasta: string | null;
}

export interface ReglasEnvio {
  tarifas: readonly TarifaEnvio[];
  zonas: readonly ReglaZona[];
  plazos: readonly PlazoEnvio[];
  /**
   * Promoción de envío gratis. null = apagada: sin `envio_gratis_desde`, o fuera de vigencia en el build
   * (`promocionActiva` la filtra antes de llegar a las páginas).
   */
  envioGratis: PromocionEnvioGratis | null;
}

/** Lo mínimo que hace falta de cada línea del pedido para pesarlo. */
export interface ItemPesable {
  gramos: number;
  cantidad: number;
}

export interface DestinoEnvio {
  departamento: string;
  municipio: string;
  /** Comuna elegida en el formulario (solo con el municipio de la promoción). Cualquier otro valor se ignora. */
  comuna?: string | null;
}

export interface ZonaResuelta {
  zona: Zona;
  /** Clave de la tarifa que corresponde. */
  clave: string;
}

export type MotivoPorCotizar = "zona_especial" | "mas_de_5kg";

/** Envío sin promoción: la regla de zonas y escalones de docs/ENVIOS.md. */
export type ResultadoEnvioNormal =
  | { tipo: "tarifa"; zona: Zona; clave: string; pesoFacturableG: number; escalonKg: EscalonKg; valorCop: number }
  | { tipo: "por_cotizar"; zona: Zona; pesoFacturableG: number; motivo: MotivoPorCotizar };

/**
 * Envío gratis por comuna: vale $0 con cualquier peso. `alternativa` es lo que costaría con la regla normal
 * (tarifa de zona 1, o por cotizar con más de 5 kg): se muestra y va en el mensaje porque la comuna la declara
 * el cliente y se verifica por el chat (microcopy §8.3 y §8.4; LEG-109).
 */
export interface EnvioGratis {
  tipo: "gratis";
  zona: Zona;
  clave: string;
  pesoFacturableG: number;
  comuna: string;
  alternativa: ResultadoEnvioNormal;
}

export type ResultadoEnvio = ResultadoEnvioNormal | EnvioGratis;
