import { defineArrayMember, defineField, defineType } from "sanity";
import { advertenciaDeMarca } from "./validaciones";

/** Foto de origen o de producto. El texto alternativo y el crédito son obligatorios. */
export const foto = defineType({
  name: "foto",
  title: "Foto",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Texto alternativo",
      type: "string",
      description: "Describe lo que se ve, para quien no puede ver la imagen. Ejemplo: «Cafetal entre montañas con niebla de la mañana».",
      validation: (r) => r.required().min(10),
    }),
    defineField({
      name: "credito",
      title: "Crédito",
      type: "string",
      description: "Quién tomó la foto, dónde y cuándo. Ejemplo: «Ana Pérez, finca La Esperanza, Socorro, marzo de 2026».",
      validation: (r) => r.required(),
    }),
  ],
});

/** Cifra con contexto. Toda cifra lleva fuente y fecha (regla de marca). */
export const cifra = defineType({
  name: "cifra",
  title: "Cifra",
  type: "object",
  fields: [
    defineField({ name: "valor", title: "Valor", type: "string", description: "Ejemplo: «≈ 40 %». Usa ≈ si es aproximada.", validation: (r) => r.required() }),
    defineField({ name: "contexto", title: "Línea de contexto", type: "string", validation: (r) => r.required() }),
    defineField({ name: "fuente", title: "Fuente", type: "string", description: "Cenicafé, Comité de Cafeteros de Santander, FNC, Cámara de Comercio…", validation: (r) => r.required() }),
    defineField({ name: "fecha", title: "Fecha de la fuente", type: "date", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "valor", subtitle: "contexto" } },
});

/** Paso numerado (cómo pedir, del cafetal a la taza). */
export const paso = defineType({
  name: "paso",
  title: "Paso",
  type: "object",
  fields: [
    defineField({ name: "titulo", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "texto", title: "Texto", type: "text", rows: 3, validation: (r) => [r.required().max(240), advertenciaDeMarca(r)] }),
  ],
  preview: { select: { title: "titulo", subtitle: "texto" } },
});

/** Texto enriquecido sencillo: párrafos, un subtítulo, negrita, itálica, enlaces y listas. */
export const textoEnriquecido = defineType({
  name: "textoEnriquecido",
  title: "Texto",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Párrafo", value: "normal" },
        { title: "Subtítulo", value: "h3" },
      ],
      lists: [
        { title: "Viñetas", value: "bullet" },
        { title: "Numerada", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Negrita", value: "strong" },
          { title: "Itálica", value: "em" },
        ],
        annotations: [
          {
            name: "enlace",
            type: "object",
            title: "Enlace",
            fields: [defineField({ name: "href", type: "url", title: "Dirección", validation: (r) => r.uri({ scheme: ["http", "https", "mailto", "tel"], allowRelative: true }) })],
          },
        ],
      },
    }),
  ],
  validation: advertenciaDeMarca,
});

export const tiposComunes = [foto, cifra, paso, textoEnriquecido];
