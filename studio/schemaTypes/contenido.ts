import { defineArrayMember, defineField, defineType } from "sanity";
import { slugDeCsv } from "./validaciones";

// Contenido editorial de cada café, provincia y productor.
// Lo comercial (precios, altitud, puntaje, disponibilidad) NO se escribe aquí: vive en los CSV de data/.
// El campo `slug` enlaza con la fila del CSV; si no coincide, el build del sitio falla con un mensaje claro.

const campoSlug = (archivo: string) =>
  defineField({
    name: "slug",
    title: "Identificador (slug)",
    type: "string",
    description: `Debe ser idéntico al slug de la fila correspondiente en data/${archivo}.`,
    validation: slugDeCsv,
  });

export const cafeContenido = defineType({
  name: "cafeContenido",
  title: "Café (contenido)",
  type: "document",
  fields: [
    campoSlug("cafes.csv"),
    defineField({
      name: "historia",
      title: "Historia del café",
      type: "textoEnriquecido",
      description: "Solo lo que se pueda demostrar. Nombra la finca, la familia o el proceso cuando exista el dato.",
    }),
    defineField({ name: "galeria", title: "Fotos", type: "array", of: [defineArrayMember({ type: "foto" })], description: "Fotos reales de origen o de producto en contexto, nunca mockups." }),
  ],
  preview: { select: { title: "slug", media: "galeria.0" } },
});

export const provinciaContenido = defineType({
  name: "provinciaContenido",
  title: "Provincia (contenido)",
  type: "document",
  fields: [
    campoSlug("provincias.csv"),
    defineField({ name: "historia", title: "Historia de la provincia", type: "textoEnriquecido" }),
    defineField({ name: "cifras", title: "Cifras", type: "array", of: [defineArrayMember({ type: "cifra" })], description: "Máximo cuatro. Cada una con su fuente y fecha.", validation: (r) => r.max(4) }),
    defineField({ name: "foto", title: "Foto principal", type: "foto" }),
  ],
  preview: { select: { title: "slug", media: "foto" } },
});

export const productorContenido = defineType({
  name: "productorContenido",
  title: "Productor o finca (contenido)",
  type: "document",
  fields: [
    campoSlug("productores.csv"),
    defineField({ name: "historia", title: "Historia", type: "textoEnriquecido", description: "Escribe solo con permiso de la familia productora." }),
    defineField({ name: "galeria", title: "Fotos", type: "array", of: [defineArrayMember({ type: "foto" })], description: "Con autorización escrita de uso de imagen (Ley 1581 de 2012)." }),
  ],
  preview: { select: { title: "slug", media: "galeria.0" } },
});

export const tiposContenido = [cafeContenido, provinciaContenido, productorContenido];
