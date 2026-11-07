"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { prepararPedido, type PedidoListo } from "@/application/casos-uso/preparar-pedido";
import { fechaEnLetras } from "@/domain/comun/fecha";
import { normalizar } from "@/domain/comun/slug";
import { crearEsquemaEnvio, SIGLA_DOCUMENTO, validar, type DatosEnvio } from "@/domain/pedido/envio";
import { calcularEnvio } from "@/domain/envio/envio";
import { formatearWhatsapp } from "@/domain/pedido/mensaje-whatsapp";
import { lineaVendedor } from "@/domain/pedido/tienda";
import { useCatalogo } from "@/ui/hooks/use-catalogo";
import { useAvisos } from "../layout/avisos";
import { useCarrito } from "../carrito/carrito-provider";
import { LineaPedido } from "../carrito/linea-pedido";
import { TotalesPedido } from "../carrito/totales-pedido";
import { Boton, BotonEnlace } from "../marca/boton";
import { Antetitulo } from "../marca/etiquetas";
import { IconoCopiar, IconoFlecha, IconoFlechaAtras, IconoWhatsapp } from "../marca/iconos";
import { CODIGOS_DEPARTAMENTO, DEPARTAMENTOS, ENVIO_VACIO, FormularioEnvio, type ValoresEnvio } from "./formulario-envio";

const PASOS = [
  { id: "carrito", titulo: "Carrito" },
  { id: "envio", titulo: "Envío" },
  { id: "resumen", titulo: "Resumen" },
  { id: "confirmacion", titulo: "Confirmación" },
] as const;
type Paso = (typeof PASOS)[number]["id"];

const esPaso = (v: string | null): v is Paso => PASOS.some((p) => p.id === v);

/** Si la persona venía de la v1 con una ciudad escrita a mano, se propone si coincide con un solo municipio. */
function adivinarMunicipio(ciudad: string | undefined): Pick<ValoresEnvio, "departamento" | "municipio"> | null {
  if (!ciudad) return null;
  const buscada = normalizar(ciudad);
  const coincidencias = DEPARTAMENTOS.flatMap((d) => d.municipios.filter((m) => normalizar(m.nombre) === buscada).map((m) => ({ departamento: d.nombre, municipio: m.nombre })));
  return coincidencias.length === 1 ? coincidencias[0] : null;
}

function Contenido() {
  const router = useRouter();
  const params = useSearchParams();
  const { catalogo } = useCatalogo();
  const { lineas, totales, listo, preferencias, guardarPreferencias, vaciar } = useCarrito();
  const { avisar } = useAvisos();
  const tienda = catalogo.tienda;
  // Versión y fecha de los documentos aceptados: siempre de data/config.csv, nunca fijas en el código (LEG-088).
  const { legal } = tienda;
  const vendedor = lineaVendedor(tienda.vendedor, formatearWhatsapp(tienda.whatsapp));

  const pedido = params.get("paso");
  const paso: Paso = esPaso(pedido) ? pedido : "carrito";

  const [valores, setValores] = useState<ValoresEnvio>(ENVIO_VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [envioValido, setEnvioValido] = useState(false);
  // Datos ya normalizados (documento sin puntos, etc.) para el resumen. Solo en memoria.
  const [datosEnvio, setDatosEnvio] = useState<DatosEnvio | null>(null);
  const [autorizacion, setAutorizacion] = useState(false);
  const [terminos, setTerminos] = useState(false);
  const [erroresResumen, setErroresResumen] = useState<{ errores: Record<string, string>; lineas: string[] } | null>(null);
  const [resultado, setResultado] = useState<PedidoListo | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  // Propone forma de pago y municipio guardados (de este navegador o de la v1) una sola vez.
  const [precargado, setPrecargado] = useState(false);
  if (listo && !precargado) {
    setPrecargado(true);
    const lugar = adivinarMunicipio(preferencias.municipio);
    const formaPago = preferencias.formaPago && tienda.formasPago.includes(preferencias.formaPago) ? preferencias.formaPago : "";
    if (lugar || formaPago) setValores((v) => ({ ...v, ...lugar, formaPago }));
  }

  const irA = (p: Paso) => router.push(p === "carrito" ? "/pedido/" : `/pedido/?paso=${p}`);

  // Los pasos que dependen de datos que se pierden al recargar vuelven al anterior.
  const sinPedido = listo && lineas.length === 0;
  useEffect(() => {
    if (!listo || sinPedido) return;
    if (paso === "resumen" && !envioValido) router.replace("/pedido/?paso=envio");
    if (paso === "confirmacion" && !resultado) router.replace(envioValido ? "/pedido/?paso=resumen" : "/pedido/?paso=envio");
  }, [listo, sinPedido, paso, envioValido, resultado, router]);

  // Al cambiar de paso, el foco va al título para lectores de pantalla y teclado.
  useEffect(() => {
    titulo.current?.focus({ preventScroll: false });
  }, [paso]);

  const esquema = useMemo(() => crearEsquemaEnvio(tienda.formasPago, CODIGOS_DEPARTAMENTO), [tienda.formasPago]);

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
    guardarPreferencias({ formaPago: r.datos.formaPago, municipio: r.datos.municipio });
    irA("resumen");
  };

  const finalizar = () => {
    const r = prepararPedido(catalogo, { lineas, envio: valores, autorizacionDatos: autorizacion, aceptaTerminos: terminos }, CODIGOS_DEPARTAMENTO);
    if (!r.ok) {
      setErroresResumen({ errores: r.errores, lineas: r.lineas });
      return;
    }
    setErroresResumen(null);
    setResultado(r.pedido);
    irA("confirmacion");
  };

  const copiar = async () => {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(resultado.texto);
      avisar("Mensaje copiado. Pégalo en WhatsApp.");
    } catch {
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

  const indice = PASOS.findIndex((p) => p.id === paso);
  const encabezado = (
    <ol className="mb-10 flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Pasos del pedido">
      {PASOS.map((p, i) => (
        <li key={p.id} aria-current={i === indice ? "step" : undefined} className={i === indice ? "font-extrabold text-ink-title" : i < indice ? "font-semibold text-ink" : "font-medium text-ink-muted"}>
          <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full border border-current text-xs tabular-nums">{i + 1}</span>
          {p.titulo}
        </li>
      ))}
    </ol>
  );

  if (!listo) return <p className="body py-16 text-center text-ink-muted">Cargando tu pedido…</p>;

  if (sinPedido && paso !== "confirmacion") {
    return (
      <div className="py-16 text-center">
        <h1 ref={titulo} tabIndex={-1} className="h2 text-ink-title scroll-mt-24 outline-none">Tu pedido está vacío</h1>
        <p className="body mt-2 text-ink-muted">Agrega un café para armar tu pedido.</p>
        <BotonEnlace href="/cafes/" className="mt-6">Ver los cafés</BotonEnlace>
      </div>
    );
  }

  const destino = valores.departamento && valores.municipio ? { departamento: valores.departamento, municipio: valores.municipio } : null;
  const envioPorCotizar = paso === "resumen" && destino !== null && totales.lineas.length > 0 && calcularEnvio(totales.lineas, destino, catalogo.envios).tipo === "por_cotizar";
  const resumenTotales = (
    <div className="rounded-lg bg-surface-raised p-5">
      <TotalesPedido totales={totales} destino={paso === "carrito" ? null : destino} />
      {envioPorCotizar && (
        <p className="caption mt-3 text-ink-muted" data-testid="aviso-por-cotizar">
          Este valor no incluye el envío. Te lo informamos por WhatsApp y tú decides si lo aceptas antes de pagar.
        </p>
      )}
    </div>
  );

  return (
    <>
      {encabezado}

      {paso === "carrito" && (
        <section aria-labelledby="t-carrito">
          <h1 id="t-carrito" ref={titulo} tabIndex={-1} className="h2 text-ink-title scroll-mt-24 outline-none">Tu pedido</h1>
          <ul className="mt-4 max-w-2xl">
            {totales.lineas.map((l) => (
              <LineaPedido key={`${l.cafeSlug}|${l.gramos}|${l.molienda}`} linea={l} />
            ))}
          </ul>
          <div className="mt-6 max-w-2xl">{resumenTotales}</div>
          <div className="mt-6 flex flex-wrap gap-3">
            <BotonEnlace href="/cafes/" variante="secundario">Seguir viendo cafés</BotonEnlace>
            <Boton tamano="lg" onClick={() => irA("envio")}>
              Continuar con el envío <IconoFlecha className="ds-btn__icon" />
            </Boton>
          </div>
        </section>
      )}

      {paso === "envio" && (
        <section aria-labelledby="t-envio" className="max-w-2xl">
          <h1 id="t-envio" ref={titulo} tabIndex={-1} className="h2 text-ink-title scroll-mt-24 outline-none">¿A dónde enviamos?</h1>
          <p className="body mt-2 text-ink-muted">Despachamos desde {tienda.ciudadDespacho} a todo Colombia.</p>
          {Object.keys(errores).length > 0 && (
            <p role="alert" className="mt-4 rounded-md border border-danger px-4 py-3 text-sm font-semibold text-danger">
              Revisa los campos marcados: {Object.keys(errores).length === 1 ? "hay 1 dato por corregir." : `hay ${Object.keys(errores).length} datos por corregir.`}
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
            <FormularioEnvio valores={valores} errores={errores} formasPago={tienda.formasPago} alCambiar={(c) => { setValores((v) => ({ ...v, ...c })); setEnvioValido(false); }} />
            <div className="mt-8 rounded-lg bg-surface-raised p-5" aria-live="polite">
              <TotalesPedido totales={totales} destino={destino} />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Boton variante="secundario" onClick={() => irA("carrito")}>
                <IconoFlechaAtras className="ds-btn__icon" /> Volver al carrito
              </Boton>
              <Boton type="submit" tamano="lg">
                Revisar el pedido <IconoFlecha className="ds-btn__icon" />
              </Boton>
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
          {/* Textos exactos de docs/legal/microcopy-legal.md §1.3 y §5.3 (paquete legal v1). El retracto solo se informa aquí. */}
          <p className="caption mt-3 text-ink-muted" data-testid="nota-precio-total">
            Los precios incluyen todos los impuestos y el envío se muestra por separado (art. 50 de la Ley 1480 de 2011). La forma de pago se confirma por WhatsApp antes de que pagues. Más en{" "}
            <Link className="underline underline-offset-4" href="/envios/" target="_blank" rel="noopener noreferrer">envíos: zonas, tarifas y plazos</Link> y en{" "}
            <Link className="underline underline-offset-4" href="/legal/envios-devoluciones/" target="_blank" rel="noopener noreferrer">envíos, devoluciones, retracto y garantía</Link>.
          </p>
          <p className="small mt-3 text-ink" data-testid="aviso-retracto">Puedes retractarte dentro de los 5 días hábiles siguientes a la entrega, salvo si el empaque está abierto. El transporte de la devolución corre por tu cuenta. Te devolvemos el dinero en máximo 15 días calendario, por el medio de pago que prefieras.</p>

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
            {datosEnvio?.codigoPostal && <p className="text-ink-muted">Código postal: {datosEnvio.codigoPostal}</p>}
            <p className="text-ink-muted">Pago: {valores.formaPago}</p>
          </div>

          <fieldset className="mt-6 space-y-3">
            <legend className="sr-only">Autorizaciones</legend>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={autorizacion} onChange={(e) => setAutorizacion(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-monte-900" aria-describedby={erroresResumen?.errores.autorizacionDatos ? "e-aut" : undefined} />
              <span>
                {/* Texto exacto de docs/legal/microcopy-legal.md §4.3 (paquete legal v1, P21 = a). «De Santander» es nombre_tienda en data/config.csv. */}
                Autorizo a {tienda.nombre} a tratar mis datos personales para gestionar mi pedido, conforme a la{" "}
                <Link className="font-semibold underline underline-offset-4" href="/legal/privacidad/" target="_blank" rel="noopener noreferrer">
                  Política de Tratamiento de Datos versión {legal.versionPoliticaDatos} del {fechaEnLetras(legal.fechaPoliticaDatos)}
                </Link>
                , que leí.
              </span>
            </label>
            {erroresResumen?.errores.autorizacionDatos && <p id="e-aut" className="text-sm font-semibold text-danger">{erroresResumen.errores.autorizacionDatos}</p>}
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={terminos} onChange={(e) => setTerminos(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-monte-900" aria-describedby={erroresResumen?.errores.aceptaTerminos ? "e-ter" : undefined} />
              <span>
                {/* Texto exacto de microcopy §5.1. */}
                Leí y acepto los{" "}
                <Link className="font-semibold underline underline-offset-4" href="/legal/terminos/" target="_blank" rel="noopener noreferrer">
                  Términos y condiciones versión {legal.versionTerminos} del {fechaEnLetras(legal.fechaTerminos)}
                </Link>
                .
              </span>
            </label>
            {erroresResumen?.errores.aceptaTerminos && <p id="e-ter" className="text-sm font-semibold text-danger">{erroresResumen.errores.aceptaTerminos}</p>}
          </fieldset>

          {/* Vendedor (Ley 1480, art. 50 lit. a; microcopy §5.4): solo los datos que existen en data/config.csv. */}
          {vendedor && (
            <p className="caption mt-4 text-ink-muted" data-testid="linea-vendedor">
              {vendedor}{" "}
              <Link className="underline underline-offset-4" href="/legal/vendedor/" target="_blank" rel="noopener noreferrer">Información del vendedor</Link>
            </p>
          )}

          {erroresResumen && (erroresResumen.errores.lineas || erroresResumen.lineas.length > 0) && (
            <div role="alert" className="mt-4 rounded-md border border-danger px-4 py-3 text-sm text-danger">
              <p className="font-semibold">{erroresResumen.errores.lineas}</p>
              <ul className="mt-1 list-disc pl-5">{erroresResumen.lineas.map((l) => <li key={l}>{l}</li>)}</ul>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Boton variante="secundario" onClick={() => irA("envio")}>
              <IconoFlechaAtras className="ds-btn__icon" /> Volver
            </Boton>
            {/* Microcopy §4.3: deshabilitado mientras falte una de las dos casillas. prepararPedido vuelve a comprobarlas. */}
            <Boton tamano="lg" className="max-sm:w-full max-sm:!whitespace-normal" onClick={finalizar} disabled={!autorizacion || !terminos}>Preparar pedido para WhatsApp</Boton>
          </div>
        </section>
      )}

      {paso === "confirmacion" && resultado && (
        <section aria-labelledby="t-confirmacion" className="max-w-2xl">
          <h1 id="t-confirmacion" ref={titulo} tabIndex={-1} className="h2 text-ink-title scroll-mt-24 outline-none">Tu pedido está listo para enviar por WhatsApp</h1>
          {resultado.envio.tipo === "por_cotizar" ? (
            <p className="body mt-3" data-testid="texto-confirmacion">
              Pulsa «Enviar por WhatsApp» y manda el mensaje en el chat. Con ese mensaje nos pides el pedido. Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.
            </p>
          ) : (
            <p className="body mt-3" data-testid="texto-confirmacion">
              Pulsa «Enviar por WhatsApp» y manda el mensaje en el chat. Con ese mensaje nos pides el pedido. Te respondemos para confirmarlo y acordar la forma de pago.
            </p>
          )}
          {resultado.indicacionesResumidas && <p className="caption mt-2 text-ink-muted">Acortamos tus indicaciones para que el mensaje quepa; las puedes ampliar por el chat.</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <BotonEnlace href={resultado.enlace} tamano="lg" target="_blank" rel="noopener noreferrer">
              <IconoWhatsapp className="ds-btn__icon" /> Enviar por WhatsApp
            </BotonEnlace>
            <Boton variante="secundario" tamano="lg" className="max-sm:w-full" onClick={copiar}>
              <IconoCopiar className="ds-btn__icon" /> Copiar mensaje
            </Boton>
          </div>
          <p className="caption mt-3 text-ink-muted">Si WhatsApp no se abre, copia el mensaje y envíalo al {formatearWhatsapp(tienda.whatsapp)}.</p>
          <pre id="mensaje-pedido" className="mt-6 overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface-sunken p-5 text-sm">{resultado.texto}</pre>
          <div className="mt-6 flex flex-wrap gap-3">
            <Boton variante="secundario" onClick={() => irA("carrito")}>Editar pedido</Boton>
            <Boton
              variante="enlace"
              onClick={() => {
                vaciar();
                setResultado(null);
                router.replace("/pedido/");
              }}
            >
              Vaciar pedido
            </Boton>
          </div>
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
