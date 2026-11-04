import { z } from "zod";

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

export function crearEsquemaEnvio(formasPago: readonly string[]) {
  return z.object({
    nombre: textoRequerido("tu nombre", 2, 80),
    celular: z
      .string({ error: "Escribe tu celular." })
      .transform(normalizarCelular)
      .refine((v) => /^3\d{9}$/.test(v), { error: "Escribe un celular colombiano de 10 dígitos, por ejemplo 300 123 4567." }),
    cedula: textoOpcional(15, (v) => (/^\d{6,10}$/.test(v.replace(/[.\s]/g, "")) ? null : "La cédula debe tener entre 6 y 10 dígitos.")).transform(
      (v) => v?.replace(/[.\s]/g, ""),
    ),
    correo: textoOpcional(120, (v) => (z.email().safeParse(v).success ? null : "Escribe un correo válido.")),
    departamento: textoRequerido("el departamento", 2, 60, "Elige"),
    municipio: textoRequerido("el municipio", 2, 60, "Elige"),
    direccion: textoRequerido("la dirección", 5, 120),
    barrio: textoOpcional(60),
    indicaciones: textoOpcional(MAX_INDICACIONES),
    formaPago: z
      .string({ error: "Elige una forma de pago." })
      .refine((v) => formasPago.includes(v), { error: "Elige una forma de pago." }),
  });
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
