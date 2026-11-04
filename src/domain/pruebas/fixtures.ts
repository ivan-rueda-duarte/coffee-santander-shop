import { perfilesDeNotas } from "../catalogo/perfiles";
import type { Cafe, Provincia } from "../catalogo/tipos";

// Datos de prueba: los cinco cafés de la v1. Solo para tests.

export const PROVINCIAS_PRUEBA: Provincia[] = [
  { slug: "comunera", nombre: "Comunera", nombreCorto: "Comunera", colorHex: "#efc2a6", descripcion: null, orden: 1 },
  { slug: "garcia-rovira", nombre: "García Rovira", nombreCorto: "García Rovira", colorHex: "#d3d6cd", descripcion: null, orden: 2 },
  { slug: "guanenta", nombre: "Guanentá", nombreCorto: "Guanentá", colorHex: "#f0d68a", descripcion: null, orden: 3 },
];

export function crearCafe(c: Partial<Cafe> & Pick<Cafe, "slug" | "nombre">): Cafe {
  const notas = c.notasCata ?? [];
  return {
    municipioSlug: "socorro",
    municipio: "Socorro",
    provinciaSlug: "comunera",
    provincia: "Comunera",
    productorSlug: null,
    productor: null,
    alturaMsnm: 1700,
    variedades: ["Caturra"],
    proceso: "lavado",
    procesoDetalle: null,
    tueste: "medio",
    notasCata: notas,
    perfiles: perfilesDeNotas(notas),
    puntajeSca: null,
    puntajeVerificado: false,
    puntajeFuente: null,
    puntajeFecha: null,
    registroSanitario: null,
    moliendas: ["grano", "molido"],
    presentaciones: [
      { gramos: 250, precioCop: 25000, disponible: true },
      { gramos: 500, precioCop: 50000, disponible: true },
    ],
    fotos: [],
    fotoDescripcion: null,
    destacado: false,
    orden: 0,
    ...c,
  };
}

export const SOCORRO = crearCafe({
  slug: "cafe-altura-de-socorro",
  nombre: "Café Altura de Socorro",
  alturaMsnm: 1800,
  procesoDetalle: "Lavado tradicional",
  notasCata: ["Caramelo", "Cacao", "Frutos rojos"],
  puntajeSca: 88,
  orden: 1,
});
export const BARICHARA = crearCafe({
  slug: "cafe-barichara",
  nombre: "Café Barichara",
  municipioSlug: "barichara",
  municipio: "Barichara",
  provinciaSlug: "guanenta",
  provincia: "Guanentá",
  alturaMsnm: 1700,
  variedades: ["Castillo"],
  tueste: "medio_claro",
  notasCata: ["Naranja", "Miel", "Jazmín"],
  puntajeSca: 90,
  orden: 2,
});
export const SAN_GIL = crearCafe({
  slug: "cafe-san-gil",
  nombre: "Café San Gil",
  municipioSlug: "san-gil",
  municipio: "San Gil",
  provinciaSlug: "guanenta",
  provincia: "Guanentá",
  alturaMsnm: 1650,
  variedades: ["Colombia"],
  tueste: "medio_oscuro",
  notasCata: ["Chocolate", "Nuez", "Especias"],
  puntajeSca: 86,
  orden: 3,
});
export const MALAGA = crearCafe({
  slug: "cafe-malaga",
  nombre: "Café Málaga",
  municipioSlug: "malaga",
  municipio: "Málaga",
  provinciaSlug: "garcia-rovira",
  provincia: "García Rovira",
  alturaMsnm: 1850,
  variedades: ["Typica"],
  tueste: "claro",
  notasCata: ["Floral", "Manzana", "Miel"],
  puntajeSca: 91,
  orden: 4,
});
export const OIBA = crearCafe({
  slug: "cafe-oiba",
  nombre: "Café Oiba",
  municipioSlug: "oiba",
  municipio: "Oiba",
  alturaMsnm: 1750,
  variedades: ["Bourbon"],
  notasCata: ["Cereza", "Canela", "Cacao"],
  puntajeSca: 89,
  orden: 5,
});

export const CAFES_PRUEBA: Cafe[] = [SOCORRO, BARICHARA, SAN_GIL, MALAGA, OIBA];

/** Los mismos cafés con los puntajes verificados. */
export const CAFES_VERIFICADOS: Cafe[] = CAFES_PRUEBA.map((c) => ({ ...c, puntajeVerificado: true }));

export const ID_V1_A_SLUG: Record<number, string> = {
  1: SOCORRO.slug,
  2: BARICHARA.slug,
  3: SAN_GIL.slug,
  4: MALAGA.slug,
  5: OIBA.slug,
};
