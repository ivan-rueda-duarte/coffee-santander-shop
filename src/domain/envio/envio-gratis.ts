import { formatearCOP } from "../comun/dinero";
import { fechaEnLetras } from "../comun/fecha";
import { normalizar } from "../comun/slug";
import type { EnvioGratis, FinEnvioGratis, PromocionEnvioGratis, ResultadoEnvio } from "./tipos";

// Envío gratis en siete comunas de Bucaramanga (decisiones del dueño del 2026-11-09; LEG-106 a LEG-119).
// Los textos son los de docs/legal/microcopy-legal.md §8 (v1.4), letra por letra. Los nombres de las comunas
// salen siempre del dato (data/comunas_envio_gratis.csv), nunca del código. «siete» y «Bucaramanga» están
// escritos en los textos legales: `npm run datos` exige siete comunas de Bucaramanga para que sigan siendo ciertos.

/** Número de comunas que nombran los textos legales («siete comunas de Bucaramanga»). */
export const COMUNAS_EN_TEXTOS = 7;
/** Municipio que nombran los textos legales. */
export const MUNICIPIO_EN_TEXTOS = "Bucaramanga";

/** Valor de la opción «Otra comuna o no la sé»: equivale a no elegir comuna (no se registra ninguna comuna fuera de la lista). */
export const OPCION_OTRA_COMUNA = "otra";

export const TEXTOS_ENVIO_GRATIS = {
  /** §8.2 */
  etiquetaCampo: "Comuna",
  primeraOpcion: "Elige tu comuna",
  otraComuna: "Otra comuna o no la sé",
  enlaceCondiciones: "Condiciones",
  /** §8.3: junto al valor «$0». */
  etiqueta: "Envío gratis",
  /** §8.3: plazo propio de la promoción, con cualquier peso (no sale de data/plazos_envio.csv). */
  plazoResumen: "Entrega estimada: mismo día o siguiente día hábil. Plazo máximo: 1 día hábil desde que validamos tu pedido y te damos el aprobado por el chat.",
  /** §8.4: bajo «Total:» en el mensaje. */
  plazoMensaje: "Plazo de entrega: máximo 1 día hábil desde que validen mi pedido y me den el aprobado por el chat.",
  /** §8.6: portada y cajón, seguido del enlace «Ver condiciones». */
  anuncio: "Envío gratis en siete comunas de Bucaramanga.",
  enlaceAnuncio: "Ver condiciones",
  /** §8.6.1: en /envios/, tras el aviso de terminación y antes del numeral. */
  introCondicionesTerminada: "Estas fueron sus condiciones:",
  /** §8.5 */
  tituloSeccion: "Envío gratis en comunas de Bucaramanga",
  notaTabla: "Gratis en siete comunas, con cualquier peso (ver condiciones).",
  salvedadTarifas: " Salvo en las siete comunas de Bucaramanga con envío gratis.",
  /** §8.5 v1.4 (LEG-123): «ver condiciones» va enlazado a #envio-gratis (ver `ENLACE_PLAZO_ZONA1`). */
  plazoZona1: " Con envío gratis en comunas de Bucaramanga, el máximo es 1 día hábil con cualquier peso, contado desde que validamos tu pedido y te damos el aprobado por el chat (ver condiciones).",
  /** §8.5 v1.4 (LEG-121): se agrega al párrafo inicial de /envios/, seguido del enlace « Ver condiciones» (`enlaceAnuncio`). */
  parrafoEnvios: " En siete comunas de Bucaramanga el envío es gratis con cualquier peso, si verificamos por el chat que tu dirección está en una de ellas.",
  /** §8.5 v1.4 (LEG-122): se agrega a «Escríbenos al {WhatsApp} y te cotizamos.» en la caja final de /envios/. */
  cajaCotizar: " Si tu dirección está en una de las siete comunas de Bucaramanga con envío gratis, no hace falta: el envío es gratis con cualquier peso.",
  plazoZona5: " No aplica a las siete comunas de Bucaramanga con envío gratis.",
} as const;

/** Ancla de las condiciones en /envios/. */
export const ANCLA_ENVIO_GRATIS = "envio-gratis";

/** Parte de `plazoZona1` que va enlazada a #envio-gratis. */
export const ENLACE_PLAZO_ZONA1 = "ver condiciones";

/** Parte un texto en [antes, enlace, después] alrededor de la primera aparición de `enlace` (null si no aparece). */
export function partirEnlace(texto: string, enlace: string): [string, string, string] | null {
  const i = texto.indexOf(enlace);
  return i < 0 ? null : [texto.slice(0, i), enlace, texto.slice(i + enlace.length)];
}

/** Días calendario que el aviso de terminación sigue en portada y cajón desde `envio_gratis_terminada` (§8.6.1, LEG-127). */
export const DIAS_AVISO_TERMINACION = 30;

/** Días de calendario de `desde` a `hasta` (ISO yyyy-mm-dd); negativo si `hasta` es anterior. */
function diasEntre(desde: string, hasta: string): number {
  const utc = (f: string) => {
    const [a, m, d] = f.split("-").map(Number);
    return Date.UTC(a, m - 1, d);
  };
  return Math.round((utc(hasta) - utc(desde)) / 86_400_000);
}

/**
 * Estado de la promoción el día del build (`hoy`, ISO yyyy-mm-dd):
 * - apagada: sin `envio_gratis_desde`;
 * - programada: `desde` en el futuro;
 * - vigente: ya empezó y no tiene `envio_gratis_terminada`;
 * - terminada: con `envio_gratis_terminada` (P34 b), rija o no; `avisoVisible` mientras hoy ≤ terminada + 30 días.
 */
export type EstadoEnvioGratis =
  | { tipo: "apagada" }
  | { tipo: "programada"; promo: PromocionEnvioGratis }
  | { tipo: "vigente"; promo: PromocionEnvioGratis }
  | { tipo: "terminada"; promo: PromocionEnvioGratis; fin: FinEnvioGratis };

export function estadoEnvioGratis(p: PromocionEnvioGratis | null, hoy: string): EstadoEnvioGratis {
  if (!p) return { tipo: "apagada" };
  if (p.terminada !== null) {
    return { tipo: "terminada", promo: p, fin: { desde: p.desde, terminada: p.terminada, avisoVisible: diasEntre(p.terminada, hoy) <= DIAS_AVISO_TERMINACION } };
  }
  return hoy < p.desde ? { tipo: "programada", promo: p } : { tipo: "vigente", promo: p };
}

/** La promoción rige si existe, ya empezó y no terminó. `hoy` en ISO yyyy-mm-dd. */
export function promocionVigente(p: PromocionEnvioGratis | null, hoy: string): boolean {
  return estadoEnvioGratis(p, hoy).tipo === "vigente";
}

/** La promoción si rige `hoy`; null si no (apagada, programada o terminada). */
export function promocionActiva(p: PromocionEnvioGratis | null, hoy: string): PromocionEnvioGratis | null {
  return promocionVigente(p, hoy) ? p : null;
}

/** El estado «terminada» que llega a las páginas; null en cualquier otro estado. */
export function finEnvioGratis(p: PromocionEnvioGratis | null, hoy: string): FinEnvioGratis | null {
  const e = estadoEnvioGratis(p, hoy);
  return e.tipo === "terminada" ? e.fin : null;
}

/**
 * Errores de `npm run datos` que dependen del día del build (P34 b, §8.6.1): `envio_gratis_terminada` no puede ser
 * posterior al build, porque no hay aviso previo con fecha. Los que no dependen del día (anterior a `desde`, sin
 * `desde`, `envio_gratis_hasta` llena) los da el lector de config.csv.
 */
export function erroresTerminacion(p: PromocionEnvioGratis | null, hoy: string): string[] {
  if (!p?.terminada || p.terminada <= hoy) return [];
  return [
    `config.csv: envio_gratis_terminada (${p.terminada}) es posterior a hoy (${hoy}). La promoción termina de inmediato (P34 b, microcopy §8.6.1): pon la fecha del día en que la apagas y despliegas, no una fecha futura.`,
  ];
}

/**
 * QA-012: mientras el aviso de terminación esté visible (portada y cajón), enlaza a /envios/#envio-gratis.
 * Si el numeral no está publicado esa ancla no existe: el build debe fallar. Fuera de esa ventana solo se avisa.
 */
export function errorNumeralTerminacion(p: PromocionEnvioGratis | null, hoy: string, numeralPublicado: boolean): string[] {
  const e = estadoEnvioGratis(p, hoy);
  if (e.tipo !== "terminada" || !e.fin.avisoVisible || numeralPublicado) return [];
  return [
    `Envío gratis (envio_gratis_terminada ${e.fin.terminada}): el aviso de terminación sigue visible en portada y cajón hasta 30 días después y enlaza a /envios/#${ANCLA_ENVIO_GRATIS}, pero «Envíos, devoluciones, retracto y garantía» no publica el numeral del envío gratis, así que ese enlace quedaría roto. Publica el numeral (legal-cumplimiento) o vacía envio_gratis_terminada y envio_gratis_desde en data/config.csv.`,
  ];
}

/**
 * Línea de `npm run datos` cuando la promoción existe pero no rige `hoy` (QA-010): distingue «programada»
 * (`desde` en el futuro) de «terminada» (`envio_gratis_terminada`). null si rige o no existe.
 */
export function lineaPromocionNoVigente(p: PromocionEnvioGratis | null, hoy: string): string | null {
  const e = estadoEnvioGratis(p, hoy);
  if (e.tipo === "programada") {
    return `Envío gratis por comunas: programada, no rige hoy (${hoy}); empieza el ${e.promo.desde}. No aparece en el sitio; hay que reconstruir y desplegar el ${e.promo.desde} para que aparezca.`;
  }
  if (e.tipo !== "terminada") return null;
  const base = `Envío gratis por comunas: terminada el ${e.fin.terminada}, no rige hoy (${hoy}); sin campo «Comuna» ni $0.`;
  if (e.fin.avisoVisible) {
    const quedan = DIAS_AVISO_TERMINACION - diasEntre(e.fin.terminada, hoy);
    return `${base} El sitio construido hoy muestra el aviso de terminación en portada, cajón y /envios/#${ANCLA_ENVIO_GRATIS} (${quedan === 0 ? "último día" : `${quedan} ${quedan === 1 ? "día más" : "días más"}`} de los ${DIAS_AVISO_TERMINACION}).`;
  }
  return `${base} Pasaron los ${DIAS_AVISO_TERMINACION} días del aviso: no sale en portada ni cajón; la sección /envios/#${ANCLA_ENVIO_GRATIS} sigue mientras el numeral esté publicado.`;
}

/**
 * Aviso de terminación (microcopy §8.6.1), en portada y cajón (seguido del enlace « Ver condiciones») y como
 * primer párrafo de la sección de /envios/.
 */
export function avisoTerminacion(fin: Pick<FinEnvioGratis, "terminada">): string {
  return `El envío gratis en siete comunas de Bucaramanga terminó el ${fechaEnLetras(fin.terminada)}. Si tu pedido por WhatsApp ya decía «envío gratis», lo respetamos con las mismas condiciones.`;
}

/** Comunas en orden alfabético, para el selector (diseño §1). */
export function comunasAlfabeticas(p: PromocionEnvioGratis): string[] {
  return [...p.comunas].sort((a, b) => a.localeCompare(b, "es"));
}

/** ¿El campo «Comuna» aplica a este destino? Solo con el municipio de la promoción (sin importar tildes ni mayúsculas). */
export function aplicaAlMunicipio(p: PromocionEnvioGratis | null, departamento: string, municipio: string): p is PromocionEnvioGratis {
  // Terminada (§8.6.1), no aplica aunque llegue aquí: sin campo, sin $0 y cálculo normal.
  return p !== null && p.terminada === null && normalizar(p.departamento) === normalizar(departamento) && normalizar(p.municipio) === normalizar(municipio);
}

/**
 * Comuna cubierta del destino, con el nombre del dato, o null: sin promoción, otro municipio, sin comuna,
 * «Otra comuna o no la sé» o un valor que no está en la lista.
 */
export function comunaCubierta(destino: { departamento: string; municipio: string; comuna?: string | null }, p: PromocionEnvioGratis | null): string | null {
  if (!destino.comuna || !aplicaAlMunicipio(p, destino.departamento, destino.municipio)) return null;
  const buscada = normalizar(destino.comuna);
  return p.comunas.find((c) => normalizar(c) === buscada) ?? null;
}

/** «a, b o c»: así nombran las comunas las ayudas (§8.2). */
export function unirConO(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} o ${items[items.length - 1]}`;
}

/** Ayuda del campo «Comuna» sin comuna de la lista (vacío u «Otra comuna o no la sé»), §8.2. Sigue el enlace « Condiciones». */
export function ayudaCampoComuna(p: PromocionEnvioGratis): string {
  return `Envío gratis si tu dirección está en ${unirConO(p.comunas)}. Si no eliges una de ellas, pagas la tarifa normal. Verificamos tu dirección por el chat antes de que aceptes el total.`;
}

/** Ayuda al elegir una comuna de la lista (reemplaza a la anterior), §8.2. Sigue el enlace « Condiciones». */
export function ayudaComunaElegida(comuna: string): string {
  return `Tu envío es gratis si tu dirección está en ${comuna}. Lo verificamos por el chat antes de que aceptes el total.`;
}

/**
 * Nota bajo la línea de envío del resumen (§8.3), con la tarifa y el total alternativos (LEG-109).
 * `subtotalCop` es el de los productos: con envío gratis, el total es el subtotal.
 */
export function notaVerificacionResumen(envio: EnvioGratis, subtotalCop: number): string {
  const inicio = `Envío gratis en ${envio.comuna}, si verificamos por el chat que tu dirección está en esa comuna.`;
  const a = envio.alternativa;
  if (a.tipo === "tarifa") {
    return `${inicio} Si no lo está, el envío es de ${formatearCOP(a.valorCop)} y el total queda en ${formatearCOP(subtotalCop + a.valorCop)}; tú decides si lo aceptas antes de pagar.`;
  }
  // La promoción solo cubre un municipio de zona 1 (lo exige `npm run datos`): la alternativa por cotizar es la de más de 5 kg.
  return `${inicio} Si no lo está, el envío de más de 5 kg se cotiza: te informamos el valor por el chat y tú decides si lo aceptas antes de pagar.`;
}

/** Penúltima línea del mensaje de WhatsApp (§8.4), en el lugar de «Quedo atento al valor del envío…». */
export function lineaVerificacionMensaje(envio: EnvioGratis, subtotalCop: number): string {
  const a = envio.alternativa;
  if (a.tipo === "tarifa") {
    return `Si mi dirección no está en esa comuna, el envío es de ${formatearCOP(a.valorCop)} y el total queda en ${formatearCOP(subtotalCop + a.valorCop)}; espero su confirmación.`;
  }
  return "Si mi dirección no está en esa comuna, quedo atento al valor del envío para confirmar mi pedido.";
}

/**
 * Frase de la región `role="status"` del paso Envío (diseño §2): una sola frase con el envío y el total,
 * que solo se anuncia cuando cambia. La del envío gratis es la de microcopy §8.3 v1.4 (LEG-120).
 */
export function anuncioEnvio(envio: ResultadoEnvio, subtotalCop: number): string {
  if (envio.tipo === "gratis") return `Envío gratis en ${envio.comuna}, sujeto a verificar tu dirección: $0. Total: ${formatearCOP(subtotalCop)}.`;
  if (envio.tipo === "por_cotizar") return `Envío por cotizar. Total sin envío: ${formatearCOP(subtotalCop)}.`;
  return `Envío: ${formatearCOP(envio.valorCop)}. Total: ${formatearCOP(subtotalCop + envio.valorCop)}.`;
}
