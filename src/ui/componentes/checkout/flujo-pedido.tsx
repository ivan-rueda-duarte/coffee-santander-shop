"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { prepararPedido, type PedidoListo } from "@/application/casos-uso/preparar-pedido";
import { avisoPrivacidad, casillaDatos, casillaPromocionesCorreo, casillaPromocionesWhatsapp, casillaTerminos } from "@/domain/legal/consentimientos";
import { bajadaMensajeListo, firmaSolicitud, microayudaCasillas, resumenCompacto, revisarCopia, textoRespaldo, textoSiguientePaso, TEXTOS_MENSAJE_LISTO, type CopiaSolicitud } from "@/domain/pedido/flujo";
import { generarNumeroSolicitud, LARGO_SUFIJO } from "@/domain/pedido/numero-solicitud";
import { crearEsquemaEnvio, esquemaConsentimientos, SIGLA_DOCUMENTO, validar, type DatosEnvio } from "@/domain/pedido/envio";
import { calcularEnvio } from "@/domain/envio/envio";
import { anuncioEnvio } from "@/domain/envio/envio-gratis";
import { formatearWhatsapp } from "@/domain/pedido/mensaje-whatsapp";
import { lineaVendedor, TEXTOS_PAGO } from "@/domain/pedido/tienda";
import { etiquetaBolsas } from "@/domain/pedido/totales";
import { useCatalogo } from "@/ui/hooks/use-catalogo";
import { useAvisos } from "../layout/avisos";
import { useCarrito } from "../carrito/carrito-provider";
import { LineaPedido } from "../carrito/linea-pedido";
import { TotalesPedido } from "../carrito/totales-pedido";
import { Boton, BotonEnlace } from "../marca/boton";
import { Antetitulo } from "../marca/etiquetas";
import { IconoAlerta, IconoCheck, IconoCopiar, IconoFlecha, IconoFlechaAtras, IconoWhatsapp } from "../marca/iconos";
import { CODIGOS_DEPARTAMENTO, ENVIO_VACIO, FormularioEnvio, type ValoresEnvio } from "./formulario-envio";

// Diseño 2026-11-18, A1: el paso Carrito se retira (la edición vive en el cajón) y no hay paso Confirmación (LEG-175).
// /pedido/ es el paso Envío; ?paso=resumen, el Resumen. Cualquier otro ?paso= se reemplaza por /pedido/.
type Paso = "envio" | "resumen";

const PASOS_INDICADOR = [
  { id: "pedido", titulo: "Pedido" },
  { id: "envio", titulo: "Envío" },
  { id: "resumen", titulo: "Resumen" },
] as const;

/**
 * Indicador «Pedido · Envío · Resumen» (A1). «Pedido» es el cajón, que ya pasó: abre el cajón. «Envío», visto desde
 * el Resumen, vuelve a /pedido/. Por debajo de 360 px solo se lee el rótulo del paso actual.
 */
function IndicadorPasos({ paso, alEditarPedido }: { paso: Paso; alEditarPedido: () => void }) {
  const actual = paso === "envio" ? 1 : 2;
  return (
    <ol aria-label="Pasos del pedido" className="small mb-8 flex flex-nowrap items-center gap-x-4 whitespace-nowrap sm:gap-x-6 md:mb-10">
      {PASOS_INDICADOR.map((p, i) => {
        const hecho = i < actual;
        const esActual = i === actual;
        const circulo = esActual ? (
          <span className="inline-grid h-6 w-6 shrink-0 place-items-center rounded-full bg-monte-900 text-xs font-extrabold tabular-nums text-pergamino-50">{i + 1}</span>
        ) : hecho ? (
          <span className="inline-grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] border-monte-900 text-monte-900">
            <IconoCheck width={14} height={14} />
          </span>
        ) : (
          <span className="inline-grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] border-line-strong text-xs tabular-nums text-ink-muted">{i + 1}</span>
        );
        const rotulo = (
          <span className={esActual ? "font-extrabold text-ink-title" : hecho ? "font-semibold text-ink max-[359px]:sr-only" : "font-medium text-ink-muted max-[359px]:sr-only"}>
            {p.titulo}
            {hecho && <span aria-hidden="true" className="sr-only">, hecho</span>}
          </span>
        );
        const contenido = <>{circulo}{rotulo}</>;
        // QA-024: nombre accesible «Pedido, hecho» sin el espacio que Chromium mete antes del span sr-only absoluto.
        // El span «, hecho» queda oculto al árbol (el nombre sale del aria-label) y conserva el texto del elemento de la lista.
        const nombreHecho = `${p.titulo}, hecho`;
        const clase = "inline-flex items-center gap-2 py-2.5";
        return (
          <li key={p.id} aria-current={esActual ? "step" : undefined} className="flex items-center gap-x-4 sm:gap-x-6">
            {i > 0 && <span aria-hidden="true" className="hidden h-px w-8 bg-line-strong sm:block" />}
            {hecho && p.id === "pedido" ? (
              <button type="button" aria-label={nombreHecho} onClick={alEditarPedido} className={`${clase} rounded-md underline-offset-4 hover:underline`}>{contenido}</button>
            ) : hecho && p.id === "envio" ? (
              <Link href="/pedido/" aria-label={nombreHecho} className={`${clase} rounded-md underline-offset-4 hover:underline`}>{contenido}</Link>
            ) : (
              <span className={clase}>{contenido}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Región viva del paso Envío (diseño 2026-11-09 §2): una sola frase con el envío y el total. Empieza vacía al
 * montar el paso (no se anuncia nada al entrar ni al recargar) y solo cambia cuando cambian el envío o el total.
 */
function AnuncioEnvio({ frase }: { frase: string }) {
  const [anterior, setAnterior] = useState(frase);
  const [anuncio, setAnuncio] = useState("");
  if (frase !== anterior) {
    setAnterior(frase);
    setAnuncio(frase);
  }
  return (
    <p role="status" aria-live="polite" aria-atomic="true" className="sr-only" data-testid="anuncio-envio">
      {anuncio}
    </p>
  );
}

/**
 * Copia del mensaje generado en el último clic válido (LEG-173; §4 bis; microcopy v1.12 §9.4 y §9.6; LEG-188 (2)).
 * Vive solo en el estado de React de `Contenido`: nunca en localStorage, sessionStorage, history.state, la URL, la
 * analítica ni otra pestaña. Se pierde al recargar o al salir de /pedido/.
 */
interface Copia extends CopiaSolicitud {
  pedido: PedidoListo;
  /** Bloque «En el mensaje»: las mismas líneas compactas del paso Envío, de la misma copia que el texto. */
  compacto: { lineas: string[]; resto: number };
  bolsas: number;
  porCotizar: boolean;
}

/** Respaldo de §9.4 (LEG-173): «Copiar mensaje» y «Ver el mensaje» con el mismo texto y número DS del enlace abierto. */
function Respaldo({ pedido, whatsapp, alCopiar, detalles }: { pedido: PedidoListo; whatsapp: string; alCopiar: () => void; detalles: RefObject<HTMLDetailsElement | null> }) {
  return (
    <div className="mt-6 rounded-lg bg-surface-sunken p-5" data-testid="respaldo-whatsapp">
      <p role="status" className="small font-semibold! text-ink">{textoRespaldo(whatsapp)}</p>
      <Boton variante="secundario" className="mt-3 max-sm:w-full" onClick={alCopiar}>
        <IconoCopiar className="ds-btn__icon" /> Copiar mensaje
      </Boton>
      <details ref={detalles} className="mt-4">
        <summary className="relative cursor-pointer text-sm font-bold before:absolute before:content-[''] before:inset-x-0 before:-inset-y-3">Ver el mensaje</summary>
        <pre id="mensaje-pedido" className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface-raised p-4 text-sm">{pedido.texto}</pre>
      </details>
      {pedido.indicacionesResumidas && <p className="caption mt-3 text-ink-muted">Acortamos tus indicaciones para que el mensaje quepa; las puedes ampliar por el chat.</p>}
    </div>
  );
}

function Contenido() {
  const router = useRouter();
  const params = useSearchParams();
  const { catalogo } = useCatalogo();
  const { lineas, totales, listo, vaciarSinAviso, deshacer, puedeDeshacer, abrirCajon } = useCarrito();
  const { buscarCafe } = useCatalogo();
  const { avisar } = useAvisos();
  const tienda = catalogo.tienda;
  // Versión y fecha de los documentos aceptados: siempre de data/config.csv, nunca fijas en el código (LEG-088).
  const { legal } = tienda;
  const vendedor = lineaVendedor(tienda.vendedor);
  // Textos de las casillas y del aviso de privacidad (D2; LEG-145): «De Santander SAS» es razon_social en data/config.csv.
  const razonSocial = tienda.vendedor.razonSocial ?? tienda.nombre;
  const aviso = avisoPrivacidad(tienda.vendedor, formatearWhatsapp(tienda.whatsapp));

  const pedido = params.get("paso");
  const paso: Paso = pedido === "resumen" ? "resumen" : "envio";

  const [valores, setValores] = useState<ValoresEnvio>(ENVIO_VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [envioValido, setEnvioValido] = useState(false);
  // Datos ya normalizados (documento sin puntos, etc.) para el resumen. Solo en memoria.
  const [datosEnvio, setDatosEnvio] = useState<DatosEnvio | null>(null);
  // Las cuatro casillas sin marcar; ninguna se guarda en el navegador ni en la URL (LEG-145).
  const [autorizacion, setAutorizacion] = useState(false);
  const [terminos, setTerminos] = useState(false);
  const [promoWhatsapp, setPromoWhatsapp] = useState(false);
  const [promoCorreo, setPromoCorreo] = useState(false);
  const [erroresResumen, setErroresResumen] = useState<{ errores: Record<string, string>; lineas: string[] } | null>(null);
  // Copia del mensaje del último clic válido, con la firma de lo que llevaba (LEG-173; §4 bis; LEG-188). Solo en memoria.
  const [copia, setCopia] = useState<Copia | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const cajaLineas = useRef<HTMLDivElement>(null);
  const detallesMensaje = useRef<HTMLDetailsElement>(null);

  const irA = (p: Paso) => router.push(p === "envio" ? "/pedido/" : "/pedido/?paso=resumen");

  // ?paso=envio (compatibilidad), ?paso=carrito, ?paso=confirmacion u otro valor: se reemplazan por /pedido/ (A1, LEG-175).
  useEffect(() => {
    if (pedido !== null && pedido !== "resumen") router.replace("/pedido/");
  }, [pedido, router]);

  // El Resumen depende de datos que se pierden al recargar: sin ellos vuelve a Envío.
  const sinPedido = listo && lineas.length === 0;
  useEffect(() => {
    if (!listo || sinPedido) return;
    if (paso === "resumen" && !envioValido) router.replace("/pedido/");
  }, [listo, sinPedido, paso, envioValido, router]);

  const envioGratis = catalogo.envios.envioGratis;
  const esquema = useMemo(() => crearEsquemaEnvio(CODIGOS_DEPARTAMENTO, { envioGratis }), [envioGratis]);

  const continuarEnvio = () => {
    const r = validar(esquema, valores);
    if (!r.ok) {
      setErrores(r.errores);
      setEnvioValido(false);
      const primero = Object.keys(r.errores)[0];
      requestAnimationFrame(() => document.getElementById(primero)?.focus());
      return;
    }
    setErrores({});
    setEnvioValido(true);
    setDatosEnvio(r.datos);
    // Casilla 4: solo existe con correo; si lo borró, se desmarca (LEG-145). Nada del formulario se guarda (LEG-149).
    if (!r.datos.correo) setPromoCorreo(false);
    irA("resumen");
  };

  // Microcopy §5.9 (LEG-101, LEG-102; QA-006; LEG-172 (4); v1.11, LEG-181): el botón sigue enfocable con aria-disabled y una microayuda nombra las casillas que faltan.
  const faltanCasillas = !autorizacion || !terminos;
  const microayuda = microayudaCasillas(terminos, autorizacion);
  // Errores bajo cada casilla: solo tras pulsar el botón y mientras esa casilla siga sin marcar (al marcarla, desaparece).
  const errorAutorizacion = !autorizacion ? erroresResumen?.errores.autorizacionDatos : undefined;
  const errorTerminos = !terminos ? erroresResumen?.errores.aceptaTerminos : undefined;

  // Todo lo que entra en el mensaje. Si cambia el carrito (también desde otra pestaña), un dato de envío o una casilla,
  // la solicitud preparada deja de valer: el respaldo se oculta y el siguiente clic genera número y texto nuevos (LEG-173 (2)).
  const firma = firmaSolicitud({ lineas, envio: { ...valores }, terminos, autorizacion, promoWhatsapp, promoCorreo });
  // QA-022: al primer cambio se descarta la copia (no basta con ocultarla). Si se deshace el cambio, el respaldo no
  // reaparece y el siguiente clic genera número y texto nuevos (microcopy §9.4). Salvedad de la v1.12 (LEG-188): el
  // vaciado del propio envío no cuenta como cambio, y recuperar las mismas líneas la deja vigente. Ajuste durante el render.
  const estadoCopia = copia ? revisarCopia(copia, firma, lineas.length > 0) : null;
  if (copia && estadoCopia === "descartar") {
    setCopia(null);
    // Otro pedido sobre uno vacío por el envío (cajón u otra pestaña): rige el flujo normal desde Envío, sin llevar al
    // Resumen con las casillas ya marcadas.
    if (copia.vaciadoPorEnvio) setEnvioValido(false);
  } else if (copia && estadoCopia === "recuperada") {
    setCopia({ ...copia, vaciadoPorEnvio: false });
  }
  const vigente = copia && estadoCopia !== "descartar" ? copia.pedido : null;
  // Vista «Mensaje listo» (§9.6): con la copia del envío y el pedido vacío, en /pedido/ y en ?paso=resumen.
  const mensajeListo = listo && lineas.length === 0 && copia !== null && estadoCopia === "vigente" && copia.vaciadoPorEnvio ? copia : null;

  // Al cambiar de paso (o entrar y salir de «Mensaje listo»), el foco va al título para lectores de pantalla y teclado.
  const vista = mensajeListo ? "mensaje-listo" : paso;
  useEffect(() => {
    titulo.current?.focus({ preventScroll: false });
  }, [vista]);

  /**
   * «Enviar por WhatsApp» (LEG-172, bloqueante): sin las casillas 1 y 2 no hay número DS, texto ni enlace. Con las dos,
   * se arma el mensaje y se abre wa.me en este mismo manejador, de forma síncrona: nada asíncrono antes de window.open
   * (microcopy §5.5). Después de window.open, y nunca antes, se guarda la copia en memoria y se vacía el pedido sin
   * aviso (microcopy v1.12 §9.5 regla 4; LEG-188 (1) y (2)). Un clic sin cambios, en el Resumen tras recuperar el
   * pedido o en «Mensaje listo», reabre el mismo enlace con el mismo número (§4 bis 1).
   */
  const enviar = () => {
    if (copia && vigente) {
      window.open(vigente.enlace, "_blank", "noopener,noreferrer");
      if (!copia.vaciadoPorEnvio) {
        setCopia({ ...copia, vaciadoPorEnvio: true });
        vaciarSinAviso();
      }
      return;
    }
    const consentimientos = validar(esquemaConsentimientos, { autorizacionDatos: autorizacion, aceptaTerminos: terminos });
    if (!consentimientos.ok) {
      // Las casillas no se marcan solas: errores bajo cada una y foco a la primera sin marcar (§5.9, regla 1).
      setErroresResumen({ errores: consentimientos.errores, lineas: [] });
      requestAnimationFrame(() => document.getElementById(!terminos ? "c-ter" : "c-aut")?.focus());
      return;
    }
    // P39 = a (LEG-150): número DS generado aquí, en el navegador, al pulsar; solo viaja en el mensaje.
    const numeroSolicitud = generarNumeroSolicitud(new Date(), crypto.getRandomValues(new Uint8Array(LARGO_SUFIJO)));
    const promociones = { whatsapp: promoWhatsapp, correo: promoCorreo && Boolean(datosEnvio?.correo) };
    const r = prepararPedido(catalogo, { lineas, envio: valores, autorizacionDatos: autorizacion, aceptaTerminos: terminos, promociones, numeroSolicitud }, CODIGOS_DEPARTAMENTO);
    if (!r.ok) {
      // No se abre nada: caja de error con foco (M9, fila 5).
      setErroresResumen({ errores: r.errores, lineas: r.lineas });
      requestAnimationFrame(() => cajaLineas.current?.focus());
      return;
    }
    window.open(r.pedido.enlace, "_blank", "noopener,noreferrer");
    // Con noopener, window.open devuelve null: el sitio no sabe si WhatsApp se abrió ni si el cliente mandó el mensaje.
    // Por eso la copia queda en memoria (respaldo y «Recuperar el pedido») y el pedido se vacía sin aviso (LEG-188).
    setErroresResumen(null);
    setCopia({
      pedido: r.pedido,
      firma,
      compacto: resumenCompacto(lineas, (slug) => buscarCafe(slug)?.nombre ?? slug),
      bolsas: r.pedido.totales.bolsas,
      porCotizar: r.pedido.envio.tipo === "por_cotizar",
      vaciadoPorEnvio: true,
    });
    vaciarSinAviso();
  };

  const copiar = async () => {
    if (!vigente) return;
    try {
      await navigator.clipboard.writeText(vigente.texto);
      avisar("Mensaje copiado. Pégalo en WhatsApp.");
    } catch {
      if (detallesMensaje.current) detallesMensaje.current.open = true;
      const pre = document.getElementById("mensaje-pedido");
      if (pre) {
        const rango = document.createRange();
        rango.selectNodeContents(pre);
        const seleccion = window.getSelection();
        seleccion?.removeAllRanges();
        seleccion?.addRange(rango);
      }
      avisar("Selecciona el texto y cópialo con Ctrl+C, o manteniéndolo pulsado.");
    }
  };

  if (!listo) return <p className="body py-16 text-center text-ink-muted">Cargando tu pedido…</p>;

  if (mensajeListo) {
    // Diseño 2026-11-19 y microcopy v1.12 §9.6: sin indicador de pasos (WhatsApp no es un paso, LEG-175), sin aviso
    // flotante y sin el número DS fuera del mensaje (LEG-191). Todo sale de la misma copia (LEG-188 (3)).
    return (
      <section aria-labelledby="t-enviado" className="max-w-2xl" data-testid="pedido-enviado">
        <h1 id="t-enviado" ref={titulo} tabIndex={-1} className="h2 text-ink-title scroll-mt-24 outline-none">{TEXTOS_MENSAJE_LISTO.titulo}</h1>
        <p className="body mt-2 text-ink" data-testid="bajada-mensaje-listo">{bajadaMensajeListo(mensajeListo.porCotizar)}</p>
        <p className="caption mt-2 text-ink-muted" data-testid="nota-vaciado">{TEXTOS_MENSAJE_LISTO.nota}</p>
        <section aria-labelledby="t-en-el-mensaje" className="mt-6 rounded-lg border border-line bg-surface-raised p-4" data-testid="bloque-en-el-mensaje">
          <h2 id="t-en-el-mensaje" className="overline text-ink-muted">{TEXTOS_MENSAJE_LISTO.rotuloBloque}</h2>
          <ul className="mt-2 space-y-1">
            {mensajeListo.compacto.lineas.map((t) => <li key={t} className="caption text-ink">{t}</li>)}
          </ul>
          {mensajeListo.compacto.resto > 0 && <p className="caption mt-1 text-ink-muted">y {mensajeListo.compacto.resto} más</p>}
          <p className="caption mt-2 text-ink-muted">{etiquetaBolsas(mensajeListo.bolsas)}</p>
        </section>
        <Boton tamano="lg" className="mt-6 max-sm:w-full max-sm:!whitespace-normal" onClick={enviar}>
          <IconoWhatsapp className="ds-btn__icon" /> Enviar por WhatsApp
        </Boton>
        <Respaldo pedido={mensajeListo.pedido} whatsapp={formatearWhatsapp(tienda.whatsapp)} alCopiar={copiar} detalles={detallesMensaje} />
        <div className="mt-4 flex flex-col items-center gap-2 md:flex-row md:justify-start md:gap-6">
          {/* Recuperar = deshacer del proveedor: vuelven las mismas líneas y la copia sigue vigente (mismo DS). */}
          {puedeDeshacer && <Boton variante="enlace" tamano="sm" onClick={deshacer}>{TEXTOS_MENSAJE_LISTO.recuperar}</Boton>}
          <BotonEnlace href="/cafes/" variante="enlace" tamano="sm">{TEXTOS_MENSAJE_LISTO.seguir}</BotonEnlace>
        </div>
      </section>
    );
  }

  if (sinPedido) {
    return (
      <div className="py-16 text-center">
        <h1 ref={titulo} tabIndex={-1} className="h2 text-ink-title scroll-mt-24 outline-none">Tu pedido está vacío</h1>
        <p className="body mt-2 text-ink-muted">Agrega un café para armar tu pedido.</p>
        <BotonEnlace href="/cafes/" className="mt-6">Ver los cafés</BotonEnlace>
      </div>
    );
  }

  // La comuna solo cuenta si es de la lista y el municipio es el de la promoción (lo decide calcularEnvio).
  const destino = valores.departamento && valores.municipio ? { departamento: valores.departamento, municipio: valores.municipio, comuna: valores.comuna } : null;
  const envioCalculado = destino !== null && totales.lineas.length > 0 ? calcularEnvio(totales.lineas, destino, catalogo.envios) : null;
  const envioPorCotizar = paso === "resumen" && envioCalculado?.tipo === "por_cotizar";
  const compacto = resumenCompacto(totales.lineas, (slug) => buscarCafe(slug)?.nombre ?? slug);
  const resumenTotales = (
    <div className="rounded-lg bg-surface-raised p-5">
      <TotalesPedido totales={totales} destino={destino} />
      {envioPorCotizar && (
        <p className="caption mt-3 text-ink-muted" data-testid="aviso-por-cotizar">
          Este valor no incluye el envío. Te lo informamos por WhatsApp y tú decides si lo aceptas antes de pagar.
        </p>
      )}
    </div>
  );

  return (
    <>
      <IndicadorPasos paso={paso} alEditarPedido={abrirCajon} />

      {paso === "envio" && (
        <section aria-labelledby="t-envio" className="max-w-2xl">
          <h1 id="t-envio" ref={titulo} tabIndex={-1} className="h2 text-ink-title scroll-mt-24 outline-none">¿A dónde enviamos?</h1>
          <p className="body mt-2 text-ink-muted">Despachamos desde {tienda.ciudadDespacho} a todo Colombia.</p>
          {/* A1: bloque compacto «Tu pedido»; se edita en el cajón. */}
          <section aria-labelledby="t-mi-pedido" className="mt-6 rounded-lg border border-line bg-surface-raised p-4" data-testid="bloque-tu-pedido">
            <div className="flex items-center justify-between gap-4">
              <h2 id="t-mi-pedido" className="overline text-ink-muted">Tu pedido</h2>
              <Boton variante="enlace" tamano="sm" aria-label="Editar el pedido" onClick={abrirCajon}>Editar</Boton>
            </div>
            <ul className="mt-2 space-y-1">
              {compacto.lineas.map((t) => <li key={t} className="caption text-ink">{t}</li>)}
            </ul>
            {compacto.resto > 0 && <p className="caption mt-1 text-ink-muted">y {compacto.resto} más</p>}
            <p className="caption mt-2 text-ink-muted">{etiquetaBolsas(totales.bolsas)}</p>
          </section>
          {Object.keys(errores).length > 0 && (
            // M9: caja con borde e ícono grana; el texto va en tinta.
            <p role="alert" className="ds-alerta mt-4 font-semibold">
              <IconoAlerta className="ds-alerta__icon" />
              <span>Revisa los campos marcados: {Object.keys(errores).length === 1 ? "hay 1 dato por corregir." : `hay ${Object.keys(errores).length} datos por corregir.`}</span>
            </p>
          )}
          <form
            className="mt-6"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              continuarEnvio();
            }}
          >
            <FormularioEnvio valores={valores} errores={errores} envioGratis={envioGratis} alCambiar={(c) => { setValores((v) => ({ ...v, ...c })); setEnvioValido(false); }} />
            {/* Aviso de privacidad al pie del formulario (D2, texto exacto; LEG-145). */}
            {aviso && (
              <p className="small mt-6 text-ink-muted" data-testid="aviso-privacidad">
                {aviso[0]}
                <Link className="underline underline-offset-4" href={aviso[1]} target="_blank" rel="noopener noreferrer">{aviso[1]}</Link>
                {aviso[2]}
              </p>
            )}
            {/* Sin aria-live en la caja: releería todo el bloque en cada cambio. Anuncia una sola frase (diseño §2). */}
            <div className="mt-8 rounded-lg bg-surface-raised p-5">
              <TotalesPedido totales={totales} destino={destino} />
            </div>
            <AnuncioEnvio frase={envioCalculado ? anuncioEnvio(envioCalculado, totales.subtotalCop) : ""} />
            {/* LEG-174: el botón nombra a dónde lleva; ninguno dice «finalizar». */}
            <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <Boton type="submit" tamano="lg" className="max-sm:w-full">
                Ver el resumen <IconoFlecha className="ds-btn__icon" />
              </Boton>
              <BotonEnlace href="/cafes/" variante="enlace" tamano="sm" className="self-center md:self-auto">Seguir viendo cafés</BotonEnlace>
            </div>
          </form>
        </section>
      )}

      {paso === "resumen" && envioValido && (
        <section aria-labelledby="t-resumen" className="max-w-2xl">
          <h1 id="t-resumen" ref={titulo} tabIndex={-1} className="h2 text-ink-title scroll-mt-24 outline-none">Revisa tu pedido</h1>
          <ul className="mt-4">
            {totales.lineas.map((l) => (
              <LineaPedido key={`${l.cafeSlug}|${l.gramos}|${l.molienda}`} linea={l} editable={false} />
            ))}
          </ul>
          <div className="mt-4">{resumenTotales}</div>
          {/* Microcopy §1.3, sin «La forma de pago se confirma…» (LEG-144). D3 está en /envios/ (LEG-141). */}
          <p className="caption mt-3 text-ink-muted" data-testid="nota-precio-total">
            Los precios incluyen todos los impuestos y el envío se muestra por separado (art. 50 de la Ley 1480 de 2011). Más en{" "}
            <Link className="underline underline-offset-4" href="/envios/" target="_blank" rel="noopener noreferrer">envíos, devoluciones, retracto y garantía</Link>.
          </p>
          {/* D5 §6.3, «Resumen, retracto», texto exacto. */}
          <p className="small mt-3 text-ink" data-testid="aviso-retracto">Puedes retractarte dentro de los 5 días hábiles siguientes a la entrega, salvo si el empaque está abierto o el sello roto. El transporte de la devolución corre por tu cuenta. Te devolvemos el dinero en máximo 15 días calendario, por el medio que prefieras.</p>

          <div className="mt-6 rounded-lg border border-line p-5 text-sm">
            <div className="flex items-start justify-between gap-4">
              <h2 className="h3 text-ink-title">Envío a</h2>
              <Boton variante="enlace" tamano="sm" onClick={() => irA("envio")}>Editar</Boton>
            </div>
            <p className="mt-2 font-semibold">{valores.nombre}</p>
            {datosEnvio?.tipoDocumento && datosEnvio.numeroDocumento && (
              <p className="text-ink-muted">Documento: {SIGLA_DOCUMENTO[datosEnvio.tipoDocumento]} {datosEnvio.numeroDocumento}</p>
            )}
            <p className="text-ink-muted">{valores.direccion}{valores.barrio ? ` · ${valores.barrio}` : ""}</p>
            <p className="text-ink-muted">{valores.municipio}, {valores.departamento}</p>
            {/* Diseño §4: solo con una comuna de la lista (con «Otra comuna o no la sé» queda vacía). */}
            {datosEnvio?.comuna && <p className="text-ink-muted" data-testid="resumen-comuna">Comuna: {datosEnvio.comuna}</p>}
            {datosEnvio?.codigoPostal && <p className="text-ink-muted">Código postal: {datosEnvio.codigoPostal}</p>}
            <p className="text-ink-muted" data-testid="resumen-pago">{TEXTOS_PAGO.mensaje}</p>
          </div>

          {/* Cuatro casillas sin marcar (LEG-145). B3 (QA-023, LEG-178, pendiente de validación del abogado antes de publicar):
              las de promociones (3 y 4, opcionales, nunca bloquean) van encima de las obligatorias (1 y 2), separadas por un
              filete y con la leyenda visible. Textos, numeración, lógica y mensaje sin cambio. */}
          <fieldset className="mt-6 space-y-3 border-b border-line pb-4" data-testid="casillas-promociones">
            <legend className="overline text-ink-muted" data-testid="leyenda-promociones">Promociones (opcional)</legend>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input id="c-promo-wa" type="checkbox" checked={promoWhatsapp} onChange={(e) => setPromoWhatsapp(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-monte-900" />
              <span>{casillaPromocionesWhatsapp(razonSocial)}</span>
            </label>
            {datosEnvio?.correo && tienda.vendedor.correoContacto && (
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input id="c-promo-correo" type="checkbox" checked={promoCorreo} onChange={(e) => setPromoCorreo(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-monte-900" />
                <span>{casillaPromocionesCorreo(razonSocial, tienda.vendedor.correoContacto)}</span>
              </label>
            )}
          </fieldset>

          {/* Casillas 1 y 2, obligatorias, pegadas a la acción que habilitan (B3, LEG-178). scroll-mt-24: al recibir el foco
              tras un clic con casillas faltantes no quedan bajo el encabezado fijo (QA-023, punto 6). */}
          <fieldset className="mt-4 space-y-3" data-testid="casillas-obligatorias">
            <legend className="sr-only">Autorizaciones obligatorias</legend>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input id="c-ter" type="checkbox" checked={terminos} onChange={(e) => setTerminos(e.target.checked)} className="ds-casilla mt-1 h-5 scroll-mt-24 w-5 shrink-0 accent-monte-900" aria-invalid={errorTerminos ? true : undefined} aria-describedby={errorTerminos ? "e-ter" : undefined} />
              <span>
                {casillaTerminos(legal)[0]}
                <Link className="font-semibold underline underline-offset-4" href="/legal/terminos/" target="_blank" rel="noopener noreferrer">{casillaTerminos(legal)[1]}</Link>
                {casillaTerminos(legal)[2]}
              </span>
            </label>
            {errorTerminos && (
              <p id="e-ter" role="alert" className="ds-error pl-8">
                <IconoAlerta className="ds-error__icon" />
                <span>{errorTerminos}</span>
              </p>
            )}
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input id="c-aut" type="checkbox" checked={autorizacion} onChange={(e) => setAutorizacion(e.target.checked)} className="ds-casilla mt-1 h-5 scroll-mt-24 w-5 shrink-0 accent-monte-900" aria-invalid={errorAutorizacion ? true : undefined} aria-describedby={errorAutorizacion ? "e-aut" : undefined} />
              <span>
                {casillaDatos(legal, razonSocial)[0]}
                <Link className="font-semibold underline underline-offset-4" href="/legal/privacidad/" target="_blank" rel="noopener noreferrer">{casillaDatos(legal, razonSocial)[1]}</Link>
                {casillaDatos(legal, razonSocial)[2]}
              </span>
            </label>
            {errorAutorizacion && (
              <p id="e-aut" role="alert" className="ds-error pl-8">
                <IconoAlerta className="ds-error__icon" />
                <span>{errorAutorizacion}</span>
              </p>
            )}
          </fieldset>
          {/* Vendedor (D5 §6.3): «Te vende De Santander SAS · NIT … · Información del vendedor». */}
          {vendedor && (
            <p className="caption mt-3 text-ink-muted" data-testid="linea-vendedor">
              {vendedor} ·{" "}
              <Link className="underline underline-offset-4" href="/legal/vendedor/" target="_blank" rel="noopener noreferrer">Información del vendedor</Link>
            </p>
          )}

          {erroresResumen && (erroresResumen.errores.lineas || erroresResumen.lineas.length > 0) && (
            // M9 (fila 5): caja con borde e ícono grana; título y lista en tinta; recibe el foco y ofrece editar el pedido.
            <div ref={cajaLineas} role="alert" tabIndex={-1} className="ds-alerta mt-4" data-testid="error-lineas">
              <IconoAlerta className="ds-alerta__icon" />
              <div>
                <p className="font-semibold">{erroresResumen.errores.lineas}</p>
                <ul className="mt-1 list-disc pl-5 text-ink">{erroresResumen.lineas.map((l) => <li key={l}>{l}</li>)}</ul>
                <Boton variante="enlace" tamano="sm" className="mt-2" onClick={abrirCajon}>Editar el pedido</Boton>
              </div>
            </div>
          )}

          {/* LEG-171: cómo sigue la compra, justo encima del botón; la variante se conoce antes del clic. */}
          <p className="small mt-4 text-ink" data-testid="texto-siguiente-paso">{textoSiguientePaso(envioPorCotizar)}</p>
          {/* Microcopy §5.9: microayuda visible encima del botón, sin aria-live (basta aria-describedby). */}
          {microayuda && (
            <p id="ayuda-preparar" className="caption mt-2 text-ink-muted" data-testid="ayuda-preparar">{microayuda}</p>
          )}
          <div className="mt-3 flex flex-col gap-3 sm:flex-row-reverse sm:justify-end">
            {/* Sin `disabled` (no recibiría foco): aria-disabled mientras falte una casilla. enviar() vuelve a comprobarlas. */}
            <Boton
              tamano="lg"
              className="max-sm:w-full max-sm:!whitespace-normal"
              onClick={enviar}
              aria-disabled={faltanCasillas ? true : undefined}
              aria-describedby={microayuda ? "ayuda-preparar" : undefined}
            >
              <IconoWhatsapp className="ds-btn__icon" /> Enviar por WhatsApp
            </Boton>
            <Boton variante="secundario" className="max-sm:w-full" onClick={() => irA("envio")}>
              <IconoFlechaAtras className="ds-btn__icon" /> Volver al envío
            </Boton>
          </div>

          {/* LEG-173: respaldo tras un clic válido (aquí, tras «Recuperar el pedido»), con el mismo texto y número DS del
              enlace abierto. Sin «Vaciar pedido» desde la v1.12 (LEG-190): el pedido se vacía con el envío. */}
          {vigente && <Respaldo pedido={vigente} whatsapp={formatearWhatsapp(tienda.whatsapp)} alCopiar={copiar} detalles={detallesMensaje} />}
        </section>
      )}
    </>
  );
}

export function FlujoPedido() {
  return (
    <section className="bg-surface px-5 py-10 md:px-8 md:py-16">
      <div className="mx-auto max-w-4xl">
        <Antetitulo>Tu pedido</Antetitulo>
        <div className="mt-4">
          <Suspense fallback={<p className="body py-16 text-center text-ink-muted">Cargando tu pedido…</p>}>
            <Contenido />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
