import { perfilesDeNotas } from "../catalogo/perfiles";
import type { Cafe, Provincia } from "../catalogo/tipos";
import type { PromocionEnvioGratis, ReglasEnvio } from "../envio/tipos";

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
    marca: null,
    fabricante: null,
    fabricanteExpresion: null,
    nsa: null,
    titularNsa: null,
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

/** Reglas de envío de prueba: copian las tarifas de docs/ENVIOS.md §5 con unas pocas zonas. */
export const REGLAS_ENVIO_PRUEBA: ReglasEnvio = {
  tarifas: [
    { zona: 1, clave: "bucaramanga", nombre: "Bucaramanga", medio: "mensajero", escalones: [8800, 11600, 15400] },
    { zona: 1, clave: "giron", nombre: "Girón", medio: "mensajero", escalones: [10500, 14300, 18700] },
    { zona: 2, clave: "zona2", nombre: "Resto de Santander", medio: "transportadora", escalones: [12100, 16200, 22000] },
    { zona: 3, clave: "zona3", nombre: "Capitales y ciudades principales", medio: "transportadora", escalones: [18000, 23000, 33000] },
    { zona: 4, clave: "zona4", nombre: "Resto del país", medio: "transportadora", escalones: [22000, 28100, 37400] },
    { zona: 5, clave: "zona5", nombre: "Trayecto especial", medio: "transportadora_o_472", escalones: null },
  ],
  zonas: [
    { nivel: "departamento", departamento: "Santander", municipio: null, zona: 2 },
    { nivel: "municipio", departamento: "Santander", municipio: "Bucaramanga", zona: 1 },
    { nivel: "municipio", departamento: "Santander", municipio: "Girón", zona: 1 },
    { nivel: "municipio", departamento: "Bogotá, D.C.", municipio: "Bogotá, D.C.", zona: 3 },
    { nivel: "municipio", departamento: "Antioquia", municipio: "Medellín", zona: 3 },
    { nivel: "municipio", departamento: "Caquetá", municipio: "Florencia", zona: 4 },
    { nivel: "departamento", departamento: "Caquetá", municipio: null, zona: 5 },
    { nivel: "municipio", departamento: "Arauca", municipio: "Arauca", zona: 4 },
    { nivel: "departamento", departamento: "Arauca", municipio: null, zona: 5 },
    { nivel: "municipio", departamento: "Chocó", municipio: "Quibdó", zona: 4 },
    { nivel: "departamento", departamento: "Chocó", municipio: null, zona: 5 },
    { nivel: "departamento", departamento: "Amazonas", municipio: null, zona: 5 },
    { nivel: "municipio", departamento: "Antioquia", municipio: "Rionegro", zona: 3 },
    { nivel: "municipio", departamento: "Santander", municipio: "Rionegro", zona: 2 },
  ],
  plazos: [
    { zona: 1, estimado: "Mismo día o siguiente día hábil", maximo: "1 día hábil" },
    { zona: 2, estimado: "1 a 3 días hábiles", maximo: "3 días hábiles" },
    { zona: 3, estimado: "1 a 3 días hábiles", maximo: "3 días hábiles" },
    { zona: 4, estimado: "2 a 6 días hábiles", maximo: "6 días hábiles" },
    { zona: 5, estimado: "5 a 12 días hábiles", maximo: null },
  ],
  envioGratis: null,
};

/**
 * Promoción de envío gratis de prueba (fixture): las siete comunas de la decisión del dueño, en el orden de los
 * textos legales, con una fecha de inicio ficticia. La fecha real (D-21) no existe todavía.
 */
export const PROMOCION_PRUEBA: PromocionEnvioGratis = {
  departamento: "Santander",
  municipio: "Bucaramanga",
  comunas: ["San Francisco", "Oriental", "Centro", "Cabecera del Llano", "La Concordia", "Ciudadela Real de Minas", "Mutis"],
  desde: "2026-01-01",
  hasta: null,
};

/** Reglas de prueba con la promoción encendida. */
export const REGLAS_CON_PROMOCION: ReglasEnvio = { ...REGLAS_ENVIO_PRUEBA, envioGratis: PROMOCION_PRUEBA };

/** Datos de prueba del vendedor y de las versiones legales (mismos valores que data/config.csv). */
export const VENDEDOR_PRUEBA = {
  razonSocial: "De Santander SAS",
  nit: "902.121.184-8",
  domicilio: "Bucaramanga, Santander",
  direccionNotificacion: "Calle 37 n.° 23-77, apartamento 702, Bucaramanga, Santander",
  correoContacto: "desantander.tienda@gmail.com",
  correoNotificacion: "desantander.tienda@gmail.com",
  matriculaMercantil: "740574",
  representanteLegal: "Ivan Fernando Rueda Duarte",
  areaDatos: "Área comercial",
};
export const LEGAL_PRUEBA = { versionTerminos: "1", fechaTerminos: "2026-11-06", versionPoliticaDatos: "1", fechaPoliticaDatos: "2026-11-06" };
