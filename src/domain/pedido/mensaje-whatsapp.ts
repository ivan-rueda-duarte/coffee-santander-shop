import { formatearCOP } from "../comun/dinero";
import { fechaEnLetras } from "../comun/fecha";
import { nombreDestino, TEXTO_POR_COTIZAR, totalConEnvio } from "../envio/envio";
import { lineaVerificacionMensaje, TEXTOS_ENVIO_GRATIS } from "../envio/envio-gratis";
import type { ResultadoEnvio } from "../envio/tipos";
import { ETIQUETA_MOLIENDA, type Molienda } from "../catalogo/tipos";
import { formatearCelular, SIGLA_DOCUMENTO, type DatosEnvio } from "./envio";
import { notaIvaSubtotal } from "./iva";
import type { VersionesLegales } from "./tienda";

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

export interface PedidoMensaje {
  nombreTienda: string;
  lineas: readonly LineaMensaje[];
  subtotalCop: number;
  /** Costo de envío calculado para el destino del formulario. */
  costoEnvio: ResultadoEnvio;
  envio: DatosEnvio;
  /** Tarifa de IVA incluida en los precios (data/config.csv); null = no se afirma tarifa. */
  ivaTarifa: number | null;
  /** Versiones y fechas de los documentos aceptados (data/config.csv), para la constancia final (microcopy §5.2). */
  legal: Pick<VersionesLegales, "versionTerminos" | "versionPoliticaDatos" | "fechaPoliticaDatos">;
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

/** Líneas de subtotal, envío y total (microcopy §1.1, §1.2, §1.4 y, con envío gratis, §8.4). */
function lineasDeTotales(p: PedidoMensaje): string[] {
  const c = p.costoEnvio;
  const { totalCop } = totalConEnvio(p.subtotalCop, c);
  const subtotal = `Subtotal de productos: ${formatearCOP(p.subtotalCop)}${notaIvaSubtotal(p.ivaTarifa)}`;
  if (c.tipo === "por_cotizar") {
    return [subtotal, `Envío: POR COTIZAR (${TEXTO_POR_COTIZAR[c.motivo]})`, `Total sin envío: ${formatearCOP(totalCop)}`];
  }
  if (c.tipo === "gratis") {
    return [
      subtotal,
      `Envío (${nombreDestino(p.envio.municipio)} · zona ${c.zona} · ${c.comuna}): $0 (envío gratis, sujeto a verificar la dirección)`,
      `Total: ${formatearCOP(totalCop)}`,
      TEXTOS_ENVIO_GRATIS.plazoMensaje,
    ];
  }
  return [subtotal, `Envío (${nombreDestino(p.envio.municipio)} · zona ${c.zona}): ${formatearCOP(c.valorCop)}`, `Total: ${formatearCOP(totalCop)}`];
}

/** Constancia de aceptación y autorización (microcopy §5.2): va siempre al final del mensaje. */
export function lineaConstancia(legal: PedidoMensaje["legal"]): string {
  return `Acepto los Términos y condiciones versión ${legal.versionTerminos} y autorizo el tratamiento de mis datos según la Política de tratamiento de datos versión ${legal.versionPoliticaDatos} del ${fechaEnLetras(legal.fechaPoliticaDatos)}.`;
}

/** Línea antes de la constancia: por cotizar (§1.2) o verificación de la comuna (§8.4). */
function lineaAntesDeConstancia(p: PedidoMensaje): string | null {
  const c = p.costoEnvio;
  if (c.tipo === "por_cotizar") return "Quedo atento al valor del envío para confirmar mi pedido.";
  if (c.tipo === "gratis") return lineaVerificacionMensaje(c, p.subtotalCop);
  return null;
}

/** Plantilla completa de microcopy §5.5 (sin número de solicitud: el sitio no numera pedidos), con los cambios de §8.4. */
function cuerpo(p: PedidoMensaje, indicaciones: string | undefined): string {
  const e = p.envio;
  const direccion = e.barrio ? `${e.direccion} · Barrio: ${e.barrio}` : e.direccion;
  // «Comuna:» solo si eligió una comuna de la lista y el envío es gratis (§8.4).
  const comuna = p.costoEnvio.tipo === "gratis" ? p.costoEnvio.comuna : null;
  const antesDeConstancia = lineaAntesDeConstancia(p);
  return [
    `¡Hola, ${p.nombreTienda}! Envío mi solicitud de compra para que me confirmen el total con el envío.`,
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
    `Ciudad: ${e.municipio}, ${e.departamento}`,
    ...(e.codigoPostal ? [`Código postal: ${e.codigoPostal}`] : []),
    `Dirección: ${direccion}`,
    ...(comuna ? [`Comuna: ${comuna}`] : []),
    ...(indicaciones ? [`Indicaciones: ${indicaciones}`] : []),
    `Forma de pago: ${e.formaPago}`,
    ...(antesDeConstancia ? ["", antesDeConstancia] : []),
    "",
    lineaConstancia(p.legal),
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
