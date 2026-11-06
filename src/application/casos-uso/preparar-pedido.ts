import type { Catalogo } from "@/domain/catalogo/catalogo";
import { buscarCafe, crearBuscadorDePrecios } from "@/domain/catalogo/catalogo";
import { ETIQUETA_MOLIENDA } from "@/domain/catalogo/tipos";
import { calcularEnvio, totalConEnvio } from "@/domain/envio/envio";
import type { ResultadoEnvio } from "@/domain/envio/tipos";
import type { LineaCarrito } from "@/domain/pedido/carrito";
import { crearEsquemaEnvio, esquemaConsentimientos, validar } from "@/domain/pedido/envio";
import { construirEnlace, construirMensaje } from "@/domain/pedido/mensaje-whatsapp";
import { calcularTotales, type Totales } from "@/domain/pedido/totales";

export interface EntradaPedido {
  lineas: readonly LineaCarrito[];
  /** Lo que escribió la persona, sin validar. */
  envio: unknown;
  autorizacionDatos: boolean;
  aceptaTerminos: boolean;
}

export interface PedidoListo {
  texto: string;
  /** Enlace wa.me con el mensaje ya escrito. */
  enlace: string;
  /** true si hubo que acortar las indicaciones para no pasar de 2.000 caracteres. */
  indicacionesResumidas: boolean;
  totales: Totales;
  /** Costo de envío calculado con el departamento y el municipio del formulario. */
  envio: ResultadoEnvio;
  /** Subtotal más envío; si el envío va por cotizar, es el total sin envío. */
  totalCop: number;
}

export type ResultadoPedido =
  | { ok: true; pedido: PedidoListo }
  /** `errores` va por campo del formulario; las líneas con problema se describen en `lineas`. */
  | { ok: false; errores: Record<string, string>; lineas: string[] };

/**
 * Convierte el carrito y el formulario en el mensaje de WhatsApp.
 * Los precios salen siempre del catálogo, nunca del navegador; las líneas de cafés retirados,
 * agotados, con una molienda que no se ofrece o con más del máximo se rechazan con un mensaje.
 * `codigosDepartamento` (nombre → código DIVIPOLA) sirve para validar el código postal.
 */
export function prepararPedido(catalogo: Catalogo, entrada: EntradaPedido, codigosDepartamento: Readonly<Record<string, string>>): ResultadoPedido {
  const { tienda } = catalogo;
  const errores: Record<string, string> = {};
  const problemasLineas: string[] = [];

  if (entrada.lineas.length === 0) errores.lineas = "Tu pedido está vacío.";

  for (const l of entrada.lineas) {
    const cafe = buscarCafe(catalogo, l.cafeSlug);
    const nombre = cafe?.nombre ?? l.cafeSlug;
    const presentacion = cafe?.presentaciones.find((p) => p.gramos === l.gramos);
    if (!cafe) problemasLineas.push(`${nombre} ya no está en el catálogo.`);
    else if (!presentacion) problemasLineas.push(`${nombre} ya no se vende en ${l.gramos} g.`);
    else if (!presentacion.disponible) problemasLineas.push(`${nombre} en ${l.gramos} g está agotado.`);
    else if (!cafe.moliendas.includes(l.molienda)) problemasLineas.push(`${nombre} no se ofrece en ${ETIQUETA_MOLIENDA[l.molienda].toLowerCase()}.`);
    else if (l.cantidad > tienda.maxCantidad) problemasLineas.push(`${nombre}: el máximo es ${tienda.maxCantidad} bolsas por tamaño. Para más, escríbenos por WhatsApp.`);
  }
  if (problemasLineas.length) errores.lineas = "Revisa tu pedido: hay cafés que cambiaron.";

  const envio = validar(crearEsquemaEnvio(tienda.formasPago, codigosDepartamento), entrada.envio);
  if (!envio.ok) Object.assign(errores, envio.errores);

  const consentimientos = validar(esquemaConsentimientos, {
    autorizacionDatos: entrada.autorizacionDatos,
    aceptaTerminos: entrada.aceptaTerminos,
  });
  if (!consentimientos.ok) Object.assign(errores, consentimientos.errores);

  if (Object.keys(errores).length || !envio.ok) return { ok: false, errores, lineas: problemasLineas };

  const totales = calcularTotales(entrada.lineas, crearBuscadorDePrecios(catalogo));
  const costoEnvio = calcularEnvio(totales.lineas, envio.datos, catalogo.envios);
  const { texto, indicacionesResumidas } = construirMensaje({
    nombreTienda: tienda.nombre,
    lineas: totales.lineas.map((l) => {
      const cafe = buscarCafe(catalogo, l.cafeSlug)!;
      return { nombreCafe: cafe.nombre, provincia: cafe.provincia, molienda: l.molienda, gramos: l.gramos, cantidad: l.cantidad, totalCop: l.totalCop };
    }),
    subtotalCop: totales.subtotalCop,
    costoEnvio,
    envio: envio.datos,
  });
  return { ok: true, pedido: { texto, enlace: construirEnlace(tienda.whatsapp, texto), indicacionesResumidas, totales, envio: costoEnvio, totalCop: totalConEnvio(totales.subtotalCop, costoEnvio).totalCop } };
}
