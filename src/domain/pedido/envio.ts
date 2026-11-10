import { z } from "zod";
import { comunaCubierta } from "../envio/envio-gratis";
import type { PromocionEnvioGratis } from "../envio/tipos";

// Formulario de envío. Los campos opcionales aceptan "" (un input vacío) y quedan como undefined.

export const MAX_INDICACIONES = 300;

/** Celular colombiano: acepta "300 123 4567", "+57 300-123-4567", "(300) 1234567"… y devuelve 10 dígitos. */
export function normalizarCelular(texto: string): string {
  const digitos = texto.replace(/\D/g, "");
  return digitos.length === 12 && digitos.startsWith("57") ? digitos.slice(2) : digitos;
}

/** "3001234567" → "300 123 4567". */
export function formatearCelular(celular: string): string {
  const m = celular.match(/^(\d{3})(\d{3})(\d{4})$/);
  return m ? `${m[1]} ${m[2]} ${m[3]}` : celular;
}

const textoRequerido = (campo: string, min: number, max: number, verbo = "Escribe") =>
  z
    .string({ error: `${verbo} ${campo}.` })
    .trim()
    .min(min, { error: `${verbo} ${campo}.` })
    .max(max, { error: `Máximo ${max} caracteres.` });

const textoOpcional = (max: number, extra?: (v: string) => string | null) =>
  z
    .string()
    .trim()
    .max(max, { error: `Máximo ${max} caracteres.` })
    .optional()
    .superRefine((v, ctx) => {
      const error = v ? extra?.(v) : null;
      if (error) ctx.addIssue({ code: "custom", message: error });
    })
    .transform((v) => (v ? v : undefined));

// Documento de identidad (LEG-040 a LEG-042; textos en docs/legal/microcopy-legal.md §4.2).

export const TIPOS_DOCUMENTO = ["CC", "CE", "PPT", "PAS"] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

/** Sigla que va en el resumen y en el mensaje de WhatsApp (§4.4). */
export const SIGLA_DOCUMENTO: Record<TipoDocumento, string> = { CC: "CC", CE: "CE", PPT: "PPT", PAS: "Pasaporte" };

/** Finalidad acreditada por escrito que permitiría volver obligatorio el documento (LEG-040). */
export type FinalidadDocumento = "guia" | "factura";

/**
 * Modo del número de documento. `false` = opcional (decisión del dueño del 2026-11-05).
 * Para volverlo obligatorio, se cambia por la finalidad acreditada por escrito ("guia" o "factura"):
 * con eso cambian la validación, la ayuda del campo y la casilla de autorización.
 */
export const DOCUMENTO_OBLIGATORIO: false | FinalidadDocumento = false;

export const MAX_DOCUMENTO = 20;

/**
 * Quita espacios, puntos y guiones y pasa a mayúsculas: «1.098.765.432» → «1098765432».
 * No recorta: el campo limita la entrada a 20 caracteres y la validación rechaza lo que pase de ahí.
 */
export function normalizarDocumento(texto: string): string {
  return texto.replace(/[\s.-]/g, "").toUpperCase();
}

/** Error del número según el tipo, o null si es válido. El número ya viene normalizado. */
export function errorDocumento(tipo: TipoDocumento, numero: string): string | null {
  if (tipo === "CC") {
    if (!/^\d+$/.test(numero) || numero.length > 10) return "La cédula de ciudadanía lleva solo números, hasta 10 dígitos.";
    if (numero.length < 3) return "Revisa el número: parece incompleto.";
    return null;
  }
  if (!/^[A-Z0-9]+$/.test(numero)) return "Usa solo letras y números, sin espacios ni símbolos.";
  if (numero.length < 3 || numero.length > MAX_DOCUMENTO) return "Revisa el número: debe tener entre 3 y 20 caracteres.";
  return null;
}

const esTipoDocumento = (v: string): v is TipoDocumento => (TIPOS_DOCUMENTO as readonly string[]).includes(v);

// Código postal (LEG-046; §4.5): manual, 6 dígitos y los 2 primeros = código DIVIPOLA del departamento.

/** Error del código postal, o null si es válido. Sin código del departamento solo se revisa el formato. */
export function errorCodigoPostal(codigo: string, departamento: string, codigoDepartamento: string | undefined): string | null {
  if (!/^\d{6}$/.test(codigo)) return "El código postal tiene 6 números.";
  if (codigoDepartamento && !codigo.startsWith(codigoDepartamento)) return `Este código no corresponde a ${departamento}. Revísalo en el visor de 4-72.`;
  return null;
}

export interface OpcionesEsquemaEnvio {
  /** Por omisión, `DOCUMENTO_OBLIGATORIO`. */
  documentoObligatorio?: boolean;
  /**
   * Promoción de envío gratis vigente (o null). La comuna solo se conserva si es una de su lista y el destino es
   * su municipio; «Otra comuna o no la sé» y cualquier otro valor quedan vacíos (minimización, microcopy §8.2).
   */
  envioGratis?: PromocionEnvioGratis | null;
}

/**
 * @param codigosDepartamento nombre del departamento → código DIVIPOLA de 2 dígitos («Santander» → «68»).
 *   Lo pasa quien llama para que el dominio no dependa de la tabla DIVIPOLA.
 */
export function crearEsquemaEnvio(formasPago: readonly string[], codigosDepartamento: Readonly<Record<string, string>>, opciones: OpcionesEsquemaEnvio = {}) {
  const documentoObligatorio = opciones.documentoObligatorio ?? DOCUMENTO_OBLIGATORIO !== false;
  return z
    .object({
      nombre: textoRequerido("tu nombre", 2, 80),
      celular: z
        .string({ error: "Escribe tu celular." })
        .transform(normalizarCelular)
        .refine((v) => /^3\d{9}$/.test(v), { error: "Escribe un celular colombiano de 10 dígitos, por ejemplo 300 123 4567." }),
      tipoDocumento: textoOpcional(10),
      numeroDocumento: z
        .string()
        .optional()
        .transform((v) => (v ? normalizarDocumento(v) : undefined) || undefined),
      correo: textoOpcional(120, (v) => (z.email().safeParse(v).success ? null : "Escribe un correo válido.")),
      departamento: textoRequerido("el departamento", 2, 60, "Elige"),
      municipio: textoRequerido("el municipio", 2, 60, "Elige"),
      codigoPostal: z
        .string()
        .optional()
        .transform((v) => v?.replace(/\s/g, "") || undefined),
      direccion: textoRequerido("la dirección", 5, 120),
      barrio: textoOpcional(60),
      comuna: z.string().optional(),
      indicaciones: textoOpcional(MAX_INDICACIONES),
      formaPago: z
        .string({ error: "Elige una forma de pago." })
        .refine((v) => formasPago.includes(v), { error: "Elige una forma de pago." }),
    })
    .superRefine((v, ctx) => {
      const tipo = v.tipoDocumento;
      if (v.numeroDocumento || documentoObligatorio) {
        if (!tipo || !esTipoDocumento(tipo)) ctx.addIssue({ code: "custom", path: ["tipoDocumento"], message: "Elige el tipo de documento." });
        if (!v.numeroDocumento) ctx.addIssue({ code: "custom", path: ["numeroDocumento"], message: "Escribe el número de documento." });
        else if (tipo && esTipoDocumento(tipo)) {
          const error = errorDocumento(tipo, v.numeroDocumento);
          if (error) ctx.addIssue({ code: "custom", path: ["numeroDocumento"], message: error });
        }
      }
      if (v.codigoPostal) {
        const error = errorCodigoPostal(v.codigoPostal, v.departamento, codigosDepartamento[v.departamento]);
        if (error) ctx.addIssue({ code: "custom", path: ["codigoPostal"], message: error });
      }
    })
    .transform(({ tipoDocumento, numeroDocumento, comuna, ...resto }) => ({
      ...resto,
      comuna: comunaCubierta({ departamento: resto.departamento, municipio: resto.municipio, comuna }, opciones.envioGratis ?? null) ?? undefined,
      // Sin número, el tipo se ignora (modo opcional).
      tipoDocumento: numeroDocumento && tipoDocumento && esTipoDocumento(tipoDocumento) ? tipoDocumento : undefined,
      numeroDocumento,
    }));
}

export type DatosEnvio = z.output<ReturnType<typeof crearEsquemaEnvio>>;

export const esquemaConsentimientos = z.object({
  autorizacionDatos: z.literal(true, { error: "Debes autorizar el tratamiento de tus datos para continuar." }),
  aceptaTerminos: z.literal(true, { error: "Debes aceptar los términos para continuar." }),
});

export type ResultadoValidacion<T> = { ok: true; datos: T } | { ok: false; errores: Record<string, string> };

/** Valida un formulario y devuelve un mensaje por campo (el primero de cada uno). */
export function validar<T>(esquema: z.ZodType<T>, entrada: unknown): ResultadoValidacion<T> {
  const r = esquema.safeParse(entrada);
  if (r.success) return { ok: true, datos: r.data };
  const errores: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const campo = String(issue.path[0] ?? "formulario");
    errores[campo] ??= issue.message;
  }
  return { ok: false, errores };
}
