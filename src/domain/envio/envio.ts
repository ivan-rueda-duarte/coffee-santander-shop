import { normalizar, slugify } from "../comun/slug";
import {
  EMPAQUE_G,
  ESCALONES_KG,
  LIMITE_MAXIMO_G,
  ZONA_ESPECIAL,
  ZONA_POR_DEFECTO,
  ZONAS,
  type DestinoEnvio,
  type ItemPesable,
  type ReglasEnvio,
  type ResultadoEnvio,
  type Zona,
  type ZonaResuelta,
} from "./tipos";

/** Gramos de las bolsas más el empaque. Un pedido sin bolsas pesa 0 (no hay nada que enviar). */
export function calcularPesoFacturable(items: readonly ItemPesable[], empaqueG: number = EMPAQUE_G): number {
  const bolsas = items.reduce((suma, i) => suma + i.gramos * i.cantidad, 0);
  return bolsas === 0 ? 0 : bolsas + empaqueG;
}

/**
 * Zona de un destino. Precedencia: regla de municipio, regla de departamento, zona 4.
 * Compara sin tildes ni mayúsculas ("Giron" = "Girón").
 */
export function resolverZona(departamento: string, municipio: string, reglas: Pick<ReglasEnvio, "zonas">): ZonaResuelta {
  const dep = normalizar(departamento);
  const mun = normalizar(municipio);

  const porMunicipio = reglas.zonas.find((r) => r.nivel === "municipio" && normalizar(r.departamento) === dep && r.municipio !== null && normalizar(r.municipio) === mun);
  if (porMunicipio) return { zona: porMunicipio.zona, clave: porMunicipio.zona === 1 ? slugify(porMunicipio.municipio ?? "") : `zona${porMunicipio.zona}` };

  const porDepartamento = reglas.zonas.find((r) => r.nivel === "departamento" && normalizar(r.departamento) === dep);
  const zona = porDepartamento?.zona ?? ZONA_POR_DEFECTO;
  return { zona, clave: `zona${zona}` };
}

/**
 * Costo de envío de un pedido (docs/ENVIOS.md §3 y §4).
 * Más de 5 kg o zona 5: "por cotizar". Si no, el primer escalón (1, 2 o 5 kg) cuyo límite sea ≥ al peso.
 */
export function calcularEnvio(items: readonly ItemPesable[], destino: DestinoEnvio, reglas: ReglasEnvio): ResultadoEnvio {
  const pesoFacturableG = calcularPesoFacturable(items);
  const { zona, clave } = resolverZona(destino.departamento, destino.municipio, reglas);

  if (pesoFacturableG > LIMITE_MAXIMO_G) return { tipo: "por_cotizar", zona, pesoFacturableG, motivo: "mas_de_5kg" };
  if (zona === ZONA_ESPECIAL) return { tipo: "por_cotizar", zona, pesoFacturableG, motivo: "zona_especial" };

  const tarifa = reglas.tarifas.find((t) => t.clave === clave);
  if (!tarifa?.escalones) throw new RangeError(`No hay tarifa de envío para la clave "${clave}" (zona ${zona}). Revisa data/tarifas_envio.csv.`);

  const indice = ESCALONES_KG.findIndex((kg) => pesoFacturableG <= kg * 1000);
  return { tipo: "tarifa", zona, clave, pesoFacturableG, escalonKg: ESCALONES_KG[indice], valorCop: tarifa.escalones[indice] };
}

/** Total del pedido: con envío si hay tarifa; sin envío si va por cotizar. */
export function totalConEnvio(subtotalCop: number, envio: ResultadoEnvio): { totalCop: number; sinEnvio: boolean } {
  return envio.tipo === "tarifa" ? { totalCop: subtotalCop + envio.valorCop, sinEnvio: false } : { totalCop: subtotalCop, sinEnvio: true };
}

/** "Bogotá, D.C." → "Bogotá": el nombre con que se muestra el destino. */
export function nombreDestino(municipio: string): string {
  return municipio.split(",")[0].trim();
}

export const TEXTO_POR_COTIZAR = {
  zona_especial: "zona especial",
  mas_de_5kg: "más de 5 kg",
} as const;

export interface CoberturaZona {
  zona: Zona;
  /** Departamentos completos que caen en esta zona. */
  departamentos: string[];
  /** Municipios con regla propia en esta zona. */
  municipios: string[];
  /** Zona 5: municipios de zona 4 dentro de un departamento de zona 5 (Florencia, Quibdó, Arauca). */
  excepciones: string[];
}

/** Resume data/zonas_envio.csv por zona, para la página de envíos. Respeta el orden del archivo. */
export function coberturaPorZona(reglas: Pick<ReglasEnvio, "zonas">): CoberturaZona[] {
  const deZona5 = new Set(reglas.zonas.filter((r) => r.nivel === "departamento" && r.zona === ZONA_ESPECIAL).map((r) => normalizar(r.departamento)));
  return ZONAS.map((zona) => ({
    zona,
    departamentos: reglas.zonas.filter((r) => r.nivel === "departamento" && r.zona === zona).map((r) => r.departamento),
    municipios: reglas.zonas.filter((r) => r.nivel === "municipio" && r.zona === zona).map((r) => nombreDestino(r.municipio ?? "")),
    excepciones:
      zona === ZONA_ESPECIAL
        ? reglas.zonas.filter((r) => r.nivel === "municipio" && r.zona === ZONA_POR_DEFECTO && deZona5.has(normalizar(r.departamento))).map((r) => nombreDestino(r.municipio ?? ""))
        : [],
  }));
}
