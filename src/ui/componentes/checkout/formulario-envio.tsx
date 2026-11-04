"use client";

import { useMemo, type ReactNode } from "react";
import { MAX_INDICACIONES } from "@/domain/pedido/envio";
import divipolaCrudo from "@/data/divipola.json";

interface Departamento {
  codigo: string;
  nombre: string;
  municipios: { codigo: string; nombre: string }[];
}
export const DEPARTAMENTOS = (divipolaCrudo as { departamentos: Departamento[] }).departamentos;

/** Lo que escribe la persona, sin validar (todo texto). */
export interface ValoresEnvio {
  nombre: string;
  celular: string;
  cedula: string;
  correo: string;
  departamento: string;
  municipio: string;
  direccion: string;
  barrio: string;
  indicaciones: string;
  formaPago: string;
}

export const ENVIO_VACIO: ValoresEnvio = { nombre: "", celular: "", cedula: "", correo: "", departamento: "", municipio: "", direccion: "", barrio: "", indicaciones: "", formaPago: "" };

const entrada = "mt-1 w-full rounded-md border border-line-strong bg-surface-raised px-3 py-3 text-base text-ink placeholder:text-ink-muted/70 aria-[invalid=true]:border-danger";

function Campo({ id, etiqueta, error, ayuda, opcional, children }: { id: string; etiqueta: string; error?: string; ayuda?: string; opcional?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold">
        {etiqueta}
        {opcional && <span className="font-medium text-ink-muted"> (opcional)</span>}
      </label>
      {children}
      {ayuda && !error && <p id={`${id}-ayuda`} className="caption mt-1 text-ink-muted">{ayuda}</p>}
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
  alCambiar,
}: {
  valores: ValoresEnvio;
  errores: Record<string, string>;
  formasPago: readonly string[];
  alCambiar: (cambios: Partial<ValoresEnvio>) => void;
}) {
  const municipios = useMemo(() => DEPARTAMENTOS.find((d) => d.nombre === valores.departamento)?.municipios ?? [], [valores.departamento]);
  const props = (campo: keyof ValoresEnvio, ayuda?: boolean) => ({
    id: campo,
    name: campo,
    value: valores[campo],
    "aria-invalid": errores[campo] ? (true as const) : undefined,
    "aria-describedby": errores[campo] ? `${campo}-error` : ayuda ? `${campo}-ayuda` : undefined,
    onChange: (e: { target: { value: string } }) => alCambiar({ [campo]: e.target.value }),
    className: entrada,
  });

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
      <Campo id="cedula" etiqueta="Cédula" opcional error={errores.cedula} ayuda="Solo si la necesitas para factura o la transportadora.">
        <input {...props("cedula", true)} type="text" inputMode="numeric" autoComplete="off" />
      </Campo>
      <div className="hidden sm:block" />
      <Campo id="departamento" etiqueta="Departamento" error={errores.departamento}>
        <select {...props("departamento")} autoComplete="address-level1" onChange={(e) => alCambiar({ departamento: e.target.value, municipio: "" })}>
          <option value="">Elige el departamento</option>
          {DEPARTAMENTOS.map((d) => (
            <option key={d.codigo} value={d.nombre}>
              {d.nombre}
            </option>
          ))}
        </select>
      </Campo>
      <Campo id="municipio" etiqueta="Municipio" error={errores.municipio}>
        <select {...props("municipio")} autoComplete="address-level2" disabled={municipios.length === 0}>
          <option value="">{municipios.length ? "Elige el municipio" : "Primero elige el departamento"}</option>
          {municipios.map((m) => (
            <option key={m.codigo} value={m.nombre}>
              {m.nombre}
            </option>
          ))}
        </select>
      </Campo>
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

      <fieldset className="sm:col-span-2" aria-describedby={errores.formaPago ? "formaPago-error" : undefined}>
        <legend className="text-sm font-bold">Forma de pago</legend>
        <p className="caption text-ink-muted">Se confirma por WhatsApp junto con el costo del envío; no se paga en esta página.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {formasPago.map((p) => (
            <label key={p} className="cursor-pointer">
              <input type="radio" name="formaPago" value={p} checked={valores.formaPago === p} onChange={() => alCambiar({ formaPago: p })} className="peer sr-only" id={p === formasPago[0] ? "formaPago" : undefined} />
              <span className="ds-tag ds-tag--outline min-h-11 text-sm font-semibold peer-checked:!border-monte-900 peer-checked:!bg-monte-900 peer-checked:!text-pergamino-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">{p}</span>
            </label>
          ))}
        </div>
        {errores.formaPago && <p id="formaPago-error" className="mt-1 text-sm font-semibold text-danger">{errores.formaPago}</p>}
      </fieldset>
    </div>
  );
}
