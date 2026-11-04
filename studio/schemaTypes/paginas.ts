import { defineArrayMember, defineField, defineType } from "sanity";
import { advertenciaDeMarca } from "./validaciones";

// Páginas con un solo documento (singletons) y páginas legales.

export const paginaInicio = defineType({
  name: "paginaInicio",
  title: "Página de inicio",
  type: "document",
  fields: [
    defineField({ name: "antetitulo", title: "Antetítulo", type: "string", description: "En mayúsculas lo pone el diseño. Ejemplo: Café de especialidad · Santander", validation: advertenciaDeMarca }),
    defineField({ name: "titular", title: "Titular (antes del remate)", type: "string", description: "Ejemplo: «Del cañón»", validation: (r) => [r.required().max(60), advertenciaDeMarca(r)] }),
    defineField({ name: "remate", title: "Remate en itálica", type: "string", description: "Una sola palabra o frase corta. Ejemplo: «a tu taza»", validation: (r) => r.max(40) }),
    defineField({ name: "bajada", title: "Bajada", type: "text", rows: 2, description: "Máximo 25 palabras.", validation: (r) => [r.max(200), advertenciaDeMarca(r)] }),
    defineField({ name: "textoBoton", title: "Texto del botón", type: "string", description: "Máximo 4 palabras. Ejemplo: «Ver cafés»", validation: (r) => r.max(30) }),
    defineField({ name: "foto", title: "Foto de la portada", type: "foto" }),
    defineField({
      name: "comoPedir",
      title: "Cómo pedir (tres pasos)",
      type: "array",
      of: [defineArrayMember({ type: "paso" })],
      validation: (r) => r.max(3),
    }),
  ],
  preview: { prepare: () => ({ title: "Página de inicio" }) },
});

export const paginaHistoria = defineType({
  name: "paginaHistoria",
  title: "Historia",
  type: "document",
  fields: [
    defineField({ name: "titular", title: "Titular (antes del remate)", type: "string", validation: (r) => [r.required(), advertenciaDeMarca(r)] }),
    defineField({ name: "remate", title: "Remate en itálica", type: "string" }),
    defineField({ name: "texto", title: "Texto", type: "textoEnriquecido", description: "Solo afirmaciones demostrables (Ley 1480 de 2011)." }),
    defineField({ name: "foto", title: "Foto", type: "foto" }),
    defineField({
      name: "proceso",
      title: "Del cafetal a la taza",
      type: "array",
      of: [defineArrayMember({ type: "paso" })],
      description: "Cada paso debe corresponder a lo que realmente hace la marca.",
    }),
    defineField({
      name: "cita",
      title: "Cita de caficultor",
      type: "object",
      description: "Solo si existe una cita real y con permiso de la persona. Si no, déjala vacía.",
      fields: [
        defineField({ name: "texto", title: "Cita", type: "text", rows: 3 }),
        defineField({ name: "autor", title: "Quién la dijo", type: "string" }),
        defineField({ name: "lugar", title: "Vereda o municipio", type: "string" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Historia" }) },
});

export const SECCIONES_LEGALES = [
  { title: "Términos y condiciones", value: "terminos" },
  { title: "Política de tratamiento de datos", value: "privacidad" },
  { title: "Envíos, devoluciones y retracto", value: "envios-devoluciones" },
  { title: "Información del vendedor", value: "vendedor" },
] as const;

export const paginaLegal = defineType({
  name: "paginaLegal",
  title: "Página legal",
  type: "document",
  fields: [
    defineField({
      name: "seccion",
      title: "Cuál es",
      type: "string",
      options: { list: [...SECCIONES_LEGALES], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "version", title: "Versión", type: "string", description: "Ejemplo: 2026-11-01. Cámbiala cada vez que cambie el texto.", validation: (r) => r.required() }),
    defineField({ name: "vigenteDesde", title: "Vigente desde", type: "date", validation: (r) => r.required() }),
    defineField({ name: "contenido", title: "Texto", type: "textoEnriquecido", description: "Lo redacta el cliente o su abogado; aquí solo se pega." }),
  ],
  preview: { select: { title: "seccion", subtitle: "version" } },
});

export const ajustesSitio = defineType({
  name: "ajustesSitio",
  title: "Ajustes del sitio",
  type: "document",
  fields: [
    defineField({ name: "descripcion", title: "Descripción para buscadores", type: "text", rows: 3, validation: (r) => [r.max(160), advertenciaDeMarca(r)] }),
    defineField({ name: "imagenCompartir", title: "Imagen al compartir en redes", type: "foto", description: "1200 × 630 px." }),
    defineField({ name: "instagram", title: "Usuario de Instagram", type: "string", description: "Real y verificado, sin @. Si no existe, déjalo vacío." }),
  ],
  preview: { prepare: () => ({ title: "Ajustes del sitio" }) },
});

export const tiposPaginas = [paginaInicio, paginaHistoria, paginaLegal, ajustesSitio];
