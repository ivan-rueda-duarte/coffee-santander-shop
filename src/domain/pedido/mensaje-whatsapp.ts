import { formatearCOP } from "../comun/dinero";
import { fechaEnLetras } from "../comun/fecha";
import { totalConEnvio } from "../envio/envio";
import { lineaVerificacionMensaje, TEXTOS_ENVIO_GRATIS } from "../envio/envio-gratis";
import type { ResultadoEnvio } from "../envio/tipos";
import { ETIQUETA_MOLIENDA, type Molienda } from "../catalogo/tipos";
import { formatearCelular, SIGLA_DOCUMENTO, type DatosEnvio } from "./envio";
import { notaIvaSubtotal } from "./iva";
import { TEXTOS_PAGO, type VersionesLegales } from "./tienda";

export const LIMITE_MENSAJE = 2000;
const LARGO_INDICACIONES_RESUMIDAS = 120;

export interface LineaMensaje {
  nombreCafe: string;
  provincia: string | null;
  molienda: Molienda;
  gramos: number;
  cantidad: number;
  totalCop: number;
}

/** Casillas opcionales de promociones (D2, «Textos de las casillas»; LEG-145). La de correo solo vale si hay correo. */
export interface PromocionesAutorizadas {
  whatsapp: boolean;
  correo: boolean;
}

export interface PedidoMensaje {
  nombreTienda: string;
  /** Identificador de la solicitud generado en el navegador («DS-261117-1432-K7QM»; P39 = a, LEG-150). */
  numeroSolicitud: string;
  lineas: readonly LineaMensaje[];
  subtotalCop: number;
  /** Costo de envío calculado para el destino del formulario. */
  costoEnvio: ResultadoEnvio;
  envio: DatosEnvio;
  /** Tarifa de IVA incluida en los precios (data/config.csv); null = no se afirma tarifa. */
  ivaTarifa: number | null;
  /** Versiones y fechas de los documentos aceptados (data/config.csv), para la constancia (D5 §6.4). */
  legal: Pick<VersionesLegales, "versionTerminos" | "versionPoliticaDatos" | "fechaPoliticaDatos">;
  promociones: PromocionesAutorizadas;
}

export interface MensajeConstruido {
  texto: string;
  /** true si hubo que acortar o quitar las indicaciones para no pasar de 2.000 caracteres. */
  indicacionesResumidas: boolean;
}

function lineaDeProducto(l: LineaMensaje): string {
  const origen = l.provincia ? ` (${l.provincia})` : "";
  return `• ${l.nombreCafe}${origen} — ${ETIQUETA_MOLIENDA[l.molienda]} — ${l.gramos} g × ${l.cantidad} = ${formatearCOP(l.totalCop)}`;
}

/** Líneas de subtotal, envío y total (D5 §6.4 y, con envío gratis, dictamen 2026-11-14 sección 2 bis). */
function lineasDeTotales(p: PedidoMensaje): string[] {
  const c = p.costoEnvio;
  const { totalCop } = totalConEnvio(p.subtotalCop, c);
  const subtotal = `Subtotal de productos: ${formatearCOP(p.subtotalCop)}${notaIvaSubtotal(p.ivaTarifa)}`;
  const iva = p.ivaTarifa === null ? "" : " (IVA incluido)";
  if (c.tipo === "por_cotizar") {
    return [subtotal, "Envío: POR COTIZAR (zona 5 o más de 5 kg)", `Total sin envío: ${formatearCOP(totalCop)}`];
  }
  if (c.tipo === "gratis") {
    return [subtotal, `Envío: zona ${c.zona} · ${c.comuna}, $0 (envío gratis, sujeto a verificar la dirección)`, `Total: ${formatearCOP(totalCop)}`, TEXTOS_ENVIO_GRATIS.plazoMensaje];
  }
  return [subtotal, `Envío: zona ${c.zona}, ${formatearCOP(c.valorCop)}${iva}`, `Total: ${formatearCOP(totalCop)}`];
}

/** Constancia de aceptación y autorización (D5 §6.4): versiones y fecha de data/config.csv. */
export function lineaConstancia(legal: PedidoMensaje["legal"]): string {
  return `Acepto los Términos v${legal.versionTerminos} y autorizo el tratamiento de mis datos según la Política v${legal.versionPoliticaDatos} del ${fechaEnLetras(legal.fechaPoliticaDatos)}.`;
}

/** «Autorizo recibir promociones por …» solo si marcó alguna casilla; la de correo solo cuenta con correo (D5 §6.4). */
export function lineaPromociones(promociones: PromocionesAutorizadas, hayCorreo: boolean): string | null {
  const canales = [promociones.whatsapp && "WhatsApp", promociones.correo && hayCorreo && "correo"].filter((c): c is string => Boolean(c));
  return canales.length ? `Autorizo recibir promociones por ${canales.join(" y ")}.` : null;
}

/** Plantilla de D5 §6.4, con las líneas del envío gratis de la sección 2 bis del dictamen del 2026-11-14. */
function cuerpo(p: PedidoMensaje, indicaciones: string | undefined): string {
  const e = p.envio;
  const c = p.costoEnvio;
  const direccion = e.barrio ? `${e.direccion} · Barrio: ${e.barrio}` : e.direccion;
  // «Comuna:» solo si eligió una comuna de la lista y el envío es gratis.
  const comuna = c.tipo === "gratis" ? c.comuna : null;
  const verificacion = c.tipo === "gratis" ? lineaVerificacionMensaje(c, p.subtotalCop) : null;
  const promociones = lineaPromociones(p.promociones, Boolean(e.correo));
  return [
    `¡Hola, ${p.nombreTienda}! Envío mi solicitud de compra N.° ${p.numeroSolicitud} para que me confirmen el total con el envío.`,
    "",
    ...p.lineas.map(lineaDeProducto),
    "",
    ...lineasDeTotales(p),
    "",
    "Envío a:",
    `Nombre: ${e.nombre}`,
    `Celular: ${formatearCelular(e.celular)}`,
    ...(e.correo ? [`Correo: ${e.correo}`] : []),
    ...(e.tipoDocumento && e.numeroDocumento ? [`Documento: ${SIGLA_DOCUMENTO[e.tipoDocumento]} ${e.numeroDocumento}`] : []),
    `Departamento y municipio: ${e.departamento}, ${e.municipio}`,
    `Dirección: ${direccion}`,
    ...(comuna ? [`Comuna: ${comuna}`] : []),
    ...(e.codigoPostal ? [`Código postal: ${e.codigoPostal}`] : []),
    ...(indicaciones ? [`Indicaciones: ${indicaciones}`] : []),
    TEXTOS_PAGO.mensaje,
    "",
    ...(verificacion ? [verificacion] : []),
    lineaConstancia(p.legal),
    ...(promociones ? [promociones] : []),
    ...(c.tipo === "por_cotizar" ? ["Quedo atento al valor del envío para confirmar mi pedido."] : []),
  ].join("\n");
}

/**
 * Texto del pedido para WhatsApp. Si pasa de 2.000 caracteres, primero resume las indicaciones
 * y, si aún no cabe, las quita (el aviso lo muestra la interfaz).
 */
export function construirMensaje(p: PedidoMensaje, limite: number = LIMITE_MENSAJE): MensajeConstruido {
  const completo = cuerpo(p, p.envio.indicaciones);
  if (completo.length <= limite) return { texto: completo, indicacionesResumidas: false };

  const indicaciones = p.envio.indicaciones;
  if (indicaciones && indicaciones.length > LARGO_INDICACIONES_RESUMIDAS) {
    const resumido = cuerpo(p, `${indicaciones.slice(0, LARGO_INDICACIONES_RESUMIDAS - 1).trimEnd()}…`);
    if (resumido.length <= limite) return { texto: resumido, indicacionesResumidas: true };
  }
  return { texto: cuerpo(p, undefined), indicacionesResumidas: Boolean(indicaciones) };
}

/** Enlace de WhatsApp. `numero` lleva indicativo de país y solo dígitos (573001129874). */
export function construirEnlace(numero: string, texto: string): string {
  if (!/^\d{10,15}$/.test(numero)) throw new RangeError("El número de WhatsApp debe tener solo dígitos, con indicativo de país");
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/** "573001129874" → "+57 300 112 9874" (si no es un número colombiano, "+<dígitos>"). */
export function formatearWhatsapp(digitos: string): string {
  const m = digitos.match(/^(57)(\d{3})(\d{3})(\d{4})$/);
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${digitos}`;
}
