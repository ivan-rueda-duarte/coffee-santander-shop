"use client";

import Link from "next/link";
import { useMemo, type ReactNode, type SelectHTMLAttributes } from "react";
import { ANCLA_ENVIO_GRATIS, aplicaAlMunicipio, ayudaCampoComuna, ayudaComunaElegida, comunaCubierta, comunasAlfabeticas, OPCION_OTRA_COMUNA, TEXTOS_ENVIO_GRATIS } from "@/domain/envio/envio-gratis";
import type { PromocionEnvioGratis } from "@/domain/envio/tipos";
import { DOCUMENTO_OBLIGATORIO, MAX_DOCUMENTO, MAX_INDICACIONES, TIPOS_DOCUMENTO, type FinalidadDocumento, type TipoDocumento } from "@/domain/pedido/envio";
import divipolaCrudo from "@/data/divipola.json";
import { IconoChevron } from "../marca/iconos";

interface Departamento {
  codigo: string;
  nombre: string;
  municipios: { codigo: string; nombre: string }[];
}
export const DEPARTAMENTOS = (divipolaCrudo as { departamentos: Departamento[] }).departamentos;

/** Nombre del departamento → código DIVIPOLA («Santander» → «68»), para validar el código postal. */
export const CODIGOS_DEPARTAMENTO: Readonly<Record<string, string>> = Object.fromEntries(DEPARTAMENTOS.map((d) => [d.nombre, d.codigo]));

/** Textos exactos de docs/legal/microcopy-legal.md §4.1 y §4.2. */
const ETIQUETA_TIPO_DOCUMENTO: Record<TipoDocumento, string> = {
  CC: "Cédula de ciudadanía",
  CE: "Cédula de extranjería",
  PPT: "Permiso por Protección Temporal (PPT)",
  PAS: "Pasaporte",
};
const AYUDA_DOCUMENTO: Record<"opcional" | FinalidadDocumento, string> = {
  opcional: "Escríbelo solo si quieres la factura electrónica a tu nombre. Si lo dejas vacío, tu pedido sigue igual.",
  guia: "Lo pide la transportadora para generar la guía de tu envío.",
  factura: "Lo necesitamos para la factura electrónica de tu compra.",
};
const VISOR_CODIGO_POSTAL = "https://visor.codigopostal.gov.co/472/visor/";
/** Ayuda de «Efectivo contraentrega» (microcopy §1.7, LEG-092): la comisión de recaudo va dentro de la tarifa. */
const AYUDA_CONTRAENTREGA = "Pagas al recibir. La tarifa de envío ya incluye la comisión de recaudo; no hay recargos.";
const esContraentrega = (formaPago: string) => /contraentrega/i.test(formaPago);

/** Lo que escribe la persona, sin validar (todo texto). */
export interface ValoresEnvio {
  nombre: string;
  celular: string;
  tipoDocumento: string;
  numeroDocumento: string;
  correo: string;
  departamento: string;
  municipio: string;
  codigoPostal: string;
  direccion: string;
  barrio: string;
  /** "" (sin elegir), OPCION_OTRA_COMUNA o una comuna de la promoción. Solo en memoria: ni navegador, ni URL, ni analítica. */
  comuna: string;
  indicaciones: string;
  formaPago: string;
}

export const ENVIO_VACIO: ValoresEnvio = {
  nombre: "",
  celular: "",
  tipoDocumento: "",
  numeroDocumento: "",
  correo: "",
  departamento: "",
  municipio: "",
  codigoPostal: "",
  direccion: "",
  barrio: "",
  comuna: "",
  indicaciones: "",
  formaPago: "",
};

const entrada = "mt-1 w-full rounded-md border border-line-strong bg-surface-raised px-3 py-3 text-base text-ink placeholder:text-ink-muted/70 aria-[invalid=true]:border-danger";

/** `entrada` sin margen ni color de texto: el texto visible lo pinta un <span> encima (QA-002). */
const entradaSuperpuesta = `${entrada.replace("mt-1 ", "").replace(" text-ink ", " ").replace(" px-3 ", " pl-4 ")} col-start-1 row-start-1 appearance-none pr-10 text-transparent forced-colors:text-[CanvasText] [&>option]:text-ink`;

/**
 * QA-002 / QA-005: un <select> nativo no parte líneas y corta las opciones largas («Permiso por Protección
 * Temporal (PPT)», «Archipiélago de San Andrés, Providencia y Santa Catalina»). El texto visible lo pinta un
 * <span> (aria-hidden) en la misma celda de la rejilla, que sí parte líneas y da la altura; el select conserva
 * el valor, el foco y la lectura para lectores de pantalla. Como la flecha nativa toma el color del texto
 * (transparente), el select va sin apariencia nativa y la flecha es un IconoChevron. Con colores forzados el
 * span se oculta y se ve el texto nativo del select. Los textos de las opciones no cambian.
 */
function SelectSuperpuesto({ textoVisible, disabled, children, ...rest }: Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & { textoVisible: string }) {
  const tinta = disabled ? "text-ink-muted" : "text-ink";
  return (
    <div className="mt-1 grid">
      <select {...rest} disabled={disabled} className={entradaSuperpuesta}>
        {children}
      </select>
      <span aria-hidden="true" className={`pointer-events-none col-start-1 row-start-1 self-center border border-transparent py-3 pl-4 pr-10 text-base forced-colors:hidden ${tinta}`}>
        {textoVisible}
      </span>
      <IconoChevron width={16} height={16} className={`pointer-events-none col-start-1 row-start-1 mr-3 self-center justify-self-end ${tinta}`} />
    </div>
  );
}

/** `ayudaFija`: la ayuda sigue visible junto al error (cuando trae un enlace que sirve para corregirlo). */
function Campo({ id, etiqueta, error, ayuda, ayudaFija, opcional, children }: { id: string; etiqueta: string; error?: string; ayuda?: ReactNode; ayudaFija?: boolean; opcional?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold">
        {etiqueta}
        {opcional && <span className="font-medium text-ink-muted"> (opcional)</span>}
      </label>
      {children}
      {ayuda && (!error || ayudaFija) && <p id={`${id}-ayuda`} className="caption mt-1 text-ink-muted">{ayuda}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormularioEnvio({
  valores,
  errores,
  formasPago,
  envioGratis,
  alCambiar,
}: {
  valores: ValoresEnvio;
  errores: Record<string, string>;
  formasPago: readonly string[];
  /** Promoción de envío gratis vigente (data/), o null: sin ella el campo «Comuna» no existe. */
  envioGratis: PromocionEnvioGratis | null;
  alCambiar: (cambios: Partial<ValoresEnvio>) => void;
}) {
  const documentoObligatorio = DOCUMENTO_OBLIGATORIO !== false;
  // Campo «Comuna» (diseño 2026-11-09 §1; microcopy §8.2): solo con el municipio de la promoción.
  const conComuna = aplicaAlMunicipio(envioGratis, valores.departamento, valores.municipio);
  const comunaElegida = conComuna ? comunaCubierta(valores, envioGratis) : null;
  const municipios = useMemo(() => DEPARTAMENTOS.find((d) => d.nombre === valores.departamento)?.municipios ?? [], [valores.departamento]);
  /** Atributos comunes del campo, sin clase: los usa `SelectSuperpuesto`, que pone la suya. */
  const propsSelect = (campo: keyof ValoresEnvio, ayuda?: boolean) => ({
    id: campo,
    name: campo,
    value: valores[campo],
    "aria-invalid": errores[campo] ? (true as const) : undefined,
    "aria-describedby": errores[campo] ? `${campo}-error` : ayuda ? `${campo}-ayuda` : undefined,
    onChange: (e: { target: { value: string } }) => alCambiar({ [campo]: e.target.value }),
  });
  const props = (campo: keyof ValoresEnvio, ayuda?: boolean) => ({ ...propsSelect(campo, ayuda), className: entrada });

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Campo id="nombre" etiqueta="Nombre completo" error={errores.nombre}>
          <input {...props("nombre")} type="text" autoComplete="name" />
        </Campo>
      </div>
      <Campo id="celular" etiqueta="Celular" error={errores.celular} ayuda="Para coordinar la entrega. Ejemplo: 300 123 4567.">
        <input {...props("celular", true)} type="tel" inputMode="tel" autoComplete="tel-national" />
      </Campo>
      <Campo id="correo" etiqueta="Correo" opcional error={errores.correo}>
        <input {...props("correo")} type="email" autoComplete="email" />
      </Campo>
      <Campo id="tipoDocumento" etiqueta="Tipo de documento" opcional={!documentoObligatorio} error={errores.tipoDocumento}>
        <SelectSuperpuesto
          {...propsSelect("tipoDocumento")}
          autoComplete="off"
          textoVisible={TIPOS_DOCUMENTO.includes(valores.tipoDocumento as TipoDocumento) ? ETIQUETA_TIPO_DOCUMENTO[valores.tipoDocumento as TipoDocumento] : "Elige el tipo"}
        >
          <option value="">Elige el tipo</option>
          {TIPOS_DOCUMENTO.map((t) => (
            <option key={t} value={t}>
              {ETIQUETA_TIPO_DOCUMENTO[t]}
            </option>
          ))}
        </SelectSuperpuesto>
      </Campo>
      <Campo id="numeroDocumento" etiqueta="Número de documento" opcional={!documentoObligatorio} error={errores.numeroDocumento} ayuda={AYUDA_DOCUMENTO[DOCUMENTO_OBLIGATORIO || "opcional"]}>
        <input {...props("numeroDocumento", true)} type="text" inputMode={valores.tipoDocumento === "CC" ? "numeric" : "text"} autoComplete="off" maxLength={MAX_DOCUMENTO} autoCapitalize="characters" spellCheck={false} />
      </Campo>
      <Campo id="departamento" etiqueta="Departamento" error={errores.departamento}>
        {/* QA-005: «Archipiélago de San Andrés, Providencia y Santa Catalina» (≈452 px) no cabe en ningún viewport. */}
        <SelectSuperpuesto
          {...propsSelect("departamento")}
          autoComplete="address-level1"
          onChange={(e) => alCambiar({ departamento: e.target.value, municipio: "", comuna: "" })}
          textoVisible={valores.departamento || "Elige el departamento"}
        >
          <option value="">Elige el departamento</option>
          {DEPARTAMENTOS.map((d) => (
            <option key={d.codigo} value={d.nombre}>
              {d.nombre}
            </option>
          ))}
        </SelectSuperpuesto>
      </Campo>
      <Campo id="municipio" etiqueta="Municipio" error={errores.municipio}>
        {/* QA-004: «Primero elige el departamento» (≈247 px) no cabía en el select a 320 px (≈224 px útiles). */}
        <SelectSuperpuesto
          {...propsSelect("municipio")}
          onChange={(e) => alCambiar({ municipio: e.target.value, comuna: "" })}
          autoComplete="address-level2"
          disabled={municipios.length === 0}
          textoVisible={valores.municipio || (municipios.length ? "Elige el municipio" : "Elige el departamento")}
        >
          <option value="">{municipios.length ? "Elige el municipio" : "Elige el departamento"}</option>
          {municipios.map((m) => (
            <option key={m.codigo} value={m.nombre}>
              {m.nombre}
            </option>
          ))}
        </SelectSuperpuesto>
      </Campo>
      {conComuna && (
        // Aparece solo con opacidad (150 ms, ease-out) y sin transición con prefers-reduced-motion. Sin error: es opcional.
        <div className="motion-safe:transition-opacity motion-safe:duration-150 motion-safe:ease-out motion-safe:starting:opacity-0" data-testid="campo-comuna">
          <Campo
            id="comuna"
            etiqueta={TEXTOS_ENVIO_GRATIS.etiquetaCampo}
            opcional
            ayudaFija
            ayuda={
              <>
                {comunaElegida ? ayudaComunaElegida(comunaElegida) : ayudaCampoComuna(envioGratis)}{" "}
                <Link className="underline underline-offset-4" href={`/envios/#${ANCLA_ENVIO_GRATIS}`} target="_blank" rel="noopener noreferrer">
                  {TEXTOS_ENVIO_GRATIS.enlaceCondiciones}
                </Link>
              </>
            }
          >
            <SelectSuperpuesto
              {...propsSelect("comuna", true)}
              aria-invalid={undefined}
              autoComplete="off"
              textoVisible={comunaElegida ?? (valores.comuna === OPCION_OTRA_COMUNA ? TEXTOS_ENVIO_GRATIS.otraComuna : TEXTOS_ENVIO_GRATIS.primeraOpcion)}
            >
              <option value="">{TEXTOS_ENVIO_GRATIS.primeraOpcion}</option>
              {comunasAlfabeticas(envioGratis).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={OPCION_OTRA_COMUNA}>{TEXTOS_ENVIO_GRATIS.otraComuna}</option>
            </SelectSuperpuesto>
          </Campo>
        </div>
      )}
      <Campo
        id="codigoPostal"
        etiqueta="Código postal"
        opcional
        error={errores.codigoPostal}
        ayudaFija
        ayuda={
          <>
            Ayuda a la transportadora a ubicar tu dirección. Si no lo sabes, búscalo en el{" "}
            <a className="underline underline-offset-4" href={VISOR_CODIGO_POSTAL} target="_blank" rel="noopener noreferrer">
              visor de 4-72
            </a>
            .
          </>
        }
      >
        <input {...props("codigoPostal", true)} aria-describedby={errores.codigoPostal ? "codigoPostal-error codigoPostal-ayuda" : "codigoPostal-ayuda"} type="text" inputMode="numeric" autoComplete="postal-code" maxLength={6} />
      </Campo>
      {/* Con «Comuna», la fila es Comuna | Código postal y no hace falta el relleno. */}
      {!conComuna && <div className="hidden sm:block" />}
      <div className="sm:col-span-2">
        <Campo id="direccion" etiqueta="Dirección" error={errores.direccion} ayuda="Calle o carrera, número, apartamento o casa.">
          <input {...props("direccion", true)} type="text" autoComplete="street-address" />
        </Campo>
      </div>
      <Campo id="barrio" etiqueta="Barrio" opcional error={errores.barrio}>
        <input {...props("barrio")} type="text" />
      </Campo>
      <div className="hidden sm:block" />
      <div className="sm:col-span-2">
        <Campo id="indicaciones" etiqueta="Indicaciones para la entrega" opcional error={errores.indicaciones} ayuda={`${valores.indicaciones.length} de ${MAX_INDICACIONES} caracteres`}>
          <textarea {...props("indicaciones", true)} rows={3} maxLength={MAX_INDICACIONES + 50} />
        </Campo>
      </div>

      <fieldset className="sm:col-span-2" aria-describedby={errores.formaPago ? "formaPago-error" : esContraentrega(valores.formaPago) ? "formaPago-ayuda" : undefined}>
        <legend className="text-sm font-bold">Forma de pago</legend>
        <p className="caption text-ink-muted">Confirmamos el pago por WhatsApp. En esta página no se paga.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {formasPago.map((p) => (
            <label key={p} className="cursor-pointer">
              <input type="radio" name="formaPago" value={p} checked={valores.formaPago === p} onChange={() => alCambiar({ formaPago: p })} className="peer sr-only" id={p === formasPago[0] ? "formaPago" : undefined} />
              <span className="ds-tag ds-tag--outline min-h-11 text-sm font-semibold peer-checked:!border-monte-900 peer-checked:!bg-monte-900 peer-checked:!text-pergamino-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">{p}</span>
            </label>
          ))}
        </div>
        {esContraentrega(valores.formaPago) && (
          <p id="formaPago-ayuda" className="caption mt-2 text-ink-muted" data-testid="ayuda-contraentrega">{AYUDA_CONTRAENTREGA}</p>
        )}
        {errores.formaPago && <p id="formaPago-error" className="mt-1 text-sm font-semibold text-danger">{errores.formaPago}</p>}
      </fieldset>
    </div>
  );
}
