import { formatearCOP } from "../comun/dinero";
import { normalizar } from "../comun/slug";
import type { EnvioGratis, PromocionEnvioGratis, ResultadoEnvio } from "./tipos";

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

/** Días que avisa `npm run datos` antes de que venza `envio_gratis_hasta` (LEG-125). */
export const DIAS_AVISO_FIN_PROMOCION = 7;

/** Días de calendario de `desde` a `hasta` (ISO yyyy-mm-dd); negativo si `hasta` es anterior. */
function diasEntre(desde: string, hasta: string): number {
  const utc = (f: string) => {
    const [a, m, d] = f.split("-").map(Number);
    return Date.UTC(a, m - 1, d);
  };
  return Math.round((utc(hasta) - utc(desde)) / 86_400_000);
}

/**
 * Aviso (no error) de `npm run datos` sobre el fin de la promoción (LEG-125, LEG-127): la vigencia se evalúa al
 * construir, así que el sitio sigue mostrando el envío gratis hasta que se reconstruye y despliega. Avisa si
 * `envio_gratis_hasta` ya pasó o vence en los próximos `DIAS_AVISO_FIN_PROMOCION` días; null si no hay fecha final.
 */
export function avisoFinPromocion(p: PromocionEnvioGratis | null, hoy: string): string | null {
  if (!p?.hasta) return null;
  const dias = diasEntre(hoy, p.hasta);
  const falta = "El estado «terminada» (microcopy §8.6.1, LEG-127) aún no está construido: antes de esa fecha hay que implementarlo y publicar el aviso de terminación con la misma visibilidad.";
  if (dias < 0) {
    return `envio_gratis_hasta (${p.hasta}) ya pasó: si el sitio desplegado se construyó antes, sigue mostrando el envío gratis hasta que se reconstruya y despliegue. ${falta}`;
  }
  if (dias > DIAS_AVISO_FIN_PROMOCION) return null;
  const cuando = dias === 0 ? "vence hoy" : `vence en ${dias} ${dias === 1 ? "día" : "días"}`;
  return `envio_gratis_hasta (${p.hasta}) ${cuando}: hay que reconstruir y desplegar el ${diaSiguiente(p.hasta)} para que el sitio deje de mostrar el envío gratis. ${falta}`;
}

/** Día siguiente a `fecha` (ISO yyyy-mm-dd). */
function diaSiguiente(fecha: string): string {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + 1)).toISOString().slice(0, 10);
}

/** La promoción rige si existe, ya empezó y no ha vencido (`hasta` es inclusive). `hoy` en ISO yyyy-mm-dd. */
export function promocionVigente(p: PromocionEnvioGratis | null, hoy: string): boolean {
  return p !== null && p.desde <= hoy && (p.hasta === null || hoy <= p.hasta);
}

/**
 * Línea de `npm run datos` cuando la promoción existe pero no rige `hoy` (QA-010): distingue
 * «programada» (`desde` en el futuro) de «vencida» (`hasta` ya pasó). null si rige o no existe.
 */
export function lineaPromocionNoVigente(p: PromocionEnvioGratis | null, hoy: string): string | null {
  if (!p || promocionVigente(p, hoy)) return null;
  const vigencia = `vigencia ${p.desde} a ${p.hasta ?? "sin fecha final"}`;
  if (hoy < p.desde) {
    return `Envío gratis por comunas: programada, no rige hoy (${hoy}); ${vigencia}. No aparece en el sitio; hay que reconstruir y desplegar el ${p.desde} para que aparezca.`;
  }
  return `Envío gratis por comunas: vencida, no rige hoy (${hoy}); ${vigencia}. No aparece en el sitio construido hoy.`;
}

/** La promoción si rige `hoy`; null si no (apagada, programada o vencida). */
export function promocionActiva(p: PromocionEnvioGratis | null, hoy: string): PromocionEnvioGratis | null {
  return promocionVigente(p, hoy) ? p : null;
}

/** Comunas en orden alfabético, para el selector (diseño §1). */
export function comunasAlfabeticas(p: PromocionEnvioGratis): string[] {
  return [...p.comunas].sort((a, b) => a.localeCompare(b, "es"));
}

/** ¿El campo «Comuna» aplica a este destino? Solo con el municipio de la promoción (sin importar tildes ni mayúsculas). */
export function aplicaAlMunicipio(p: PromocionEnvioGratis | null, departamento: string, municipio: string): p is PromocionEnvioGratis {
  return p !== null && normalizar(p.departamento) === normalizar(departamento) && normalizar(p.municipio) === normalizar(municipio);
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
