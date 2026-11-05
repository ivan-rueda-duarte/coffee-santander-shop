import { z } from "zod";
import { ZONAS, type Zona } from "./tipos";

// Validación de las filas de data/tarifas_envio.csv y data/zonas_envio.csv, ya convertidas a número.
// Cada regla dice en español qué hay que corregir.

const zona = z.number().refine((n): n is Zona => (ZONAS as readonly number[]).includes(n), { error: "la zona debe ser un número entre 1 y 5." });

/** Un escalón es un entero positivo o null (= "por_cotizar"). */
const escalon = z.number().int().positive().nullable();

export const esquemaTarifa = z
  .object({
    zona,
    clave: z.string().min(1, { error: "la clave está vacía." }),
    nombre: z.string().min(1, { error: "el nombre está vacío." }),
    medio: z.string().min(1, { error: "el medio está vacío." }),
    hasta1: escalon,
    hasta2: escalon,
    hasta5: escalon,
  })
  .superRefine((t, ctx) => {
    const todos = [t.hasta1, t.hasta2, t.hasta5];
    const cotizar = todos.filter((v) => v === null).length;
    if (t.zona === 5) {
      if (cotizar !== 3) ctx.addIssue({ code: "custom", message: 'la zona 5 no tiene tarifa publicada: las tres columnas hasta_… deben decir "por_cotizar".' });
      return;
    }
    if (cotizar > 0) {
      ctx.addIssue({ code: "custom", message: `"por_cotizar" solo puede aparecer en la zona 5; la zona ${t.zona} necesita un valor en cada escalón.` });
      return;
    }
    if (!(t.hasta1! < t.hasta2! && t.hasta2! < t.hasta5!)) {
      ctx.addIssue({ code: "custom", message: "los escalones deben ir en aumento: hasta_1kg < hasta_2kg < hasta_5kg." });
    }
  });

export const esquemaReglaZona = z
  .object({
    nivel: z.enum(["departamento", "municipio"], { error: 'el nivel debe ser "departamento" o "municipio".' }),
    departamento: z.string().min(1, { error: "el departamento está vacío." }),
    municipio: z.string(),
    zona,
  })
  .superRefine((r, ctx) => {
    if (r.nivel === "municipio" && !r.municipio) ctx.addIssue({ code: "custom", message: 'una regla de nivel "municipio" necesita el municipio.' });
    if (r.nivel === "departamento" && r.municipio) ctx.addIssue({ code: "custom", message: 'una regla de nivel "departamento" no lleva municipio; déjalo vacío.' });
    if (r.nivel === "departamento" && r.zona === 1) ctx.addIssue({ code: "custom", message: "la zona 1 se asigna por municipio (cada municipio tiene su tarifa), no por departamento." });
  });
