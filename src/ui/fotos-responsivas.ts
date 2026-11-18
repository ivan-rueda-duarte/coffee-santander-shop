// Variantes responsivas de las fotos de public/fotos/ y public/assets/fotografia/ (las genera tools/fotos-responsivas.ts antes del build).
// La exportación estática no tiene optimizador de imágenes: el script deja, por cada foto, versiones de
// 400/800/1200 px de ancho en AVIF y WebP (sin ampliar las pequeñas) y un JPEG de respaldo, y escribe
// src/data/fotos-responsivas.json (lo carga ./manifiesto-fotos). Aquí solo se calculan rutas y srcset:
// TypeScript puro, sin React ni el JSON, para que el script lo use aunque el manifiesto aún no exista.

/** Carpeta (dentro de public/, no versionada) donde el script deja todas las variantes. */
export const CARPETA_VARIANTES = "/fotos-optimizadas";
/**
 * Carpetas de fotos originales dentro de public/ y dónde quedan sus variantes (siempre bajo CARPETA_VARIANTES):
 * las fotos de café y provincia, y las fotos de marca de la portada (Historia). Las variantes conservan el nombre
 * del archivo ("cafetal-montana.jpg" → "cafetal-montana-1200.jpg").
 */
export const CARPETAS_FOTOS = [
  { originales: "/fotos", variantes: CARPETA_VARIANTES },
  { originales: "/assets/fotografia", variantes: `${CARPETA_VARIANTES}/assets/fotografia` },
] as const;
/** Anchos objetivo en px. Una foto más angosta no se amplía: se usa su ancho real. */
export const ANCHOS_VARIANTES = [400, 800, 1200] as const;
/** Formatos modernos, en orden de preferencia para <source>. */
export const FORMATOS_VARIANTES = [
  { extension: "avif", tipo: "image/avif" },
  { extension: "webp", tipo: "image/webp" },
] as const;
export const EXTENSION_RESPALDO = "jpg";

export type ExtensionVariante = (typeof FORMATOS_VARIANTES)[number]["extension"] | typeof EXTENSION_RESPALDO;

/** Una foto original y los anchos que se generaron para ella (ascendentes; el último es el del JPEG de respaldo). */
export interface EntradaFoto {
  ancho: number;
  alto: number;
  anchos: number[];
}
/** Clave: ruta pública de la foto original ("/fotos/cafes/cafe-arreboles/1.jpg"). */
export type ManifiestoFotos = Record<string, EntradaFoto>;

/** Anchos que se generan para una foto de `anchoOriginal` px: los objetivos menores y, si es más angosta que el mayor, su ancho real. */
export function anchosParaGenerar(anchoOriginal: number): number[] {
  if (!Number.isInteger(anchoOriginal) || anchoOriginal <= 0) throw new Error(`Ancho de foto no válido: ${anchoOriginal}`);
  const tope = Math.min(anchoOriginal, ANCHOS_VARIANTES[ANCHOS_VARIANTES.length - 1]);
  return [...ANCHOS_VARIANTES.filter((a) => a < tope), tope];
}

/**
 * "/fotos/cafes/x/1.jpg" + 800 + "webp" → "/fotos-optimizadas/cafes/x/1-800.webp";
 * "/assets/fotografia/cafetal-montana.jpg" + 1200 + "jpg" → "/fotos-optimizadas/assets/fotografia/cafetal-montana-1200.jpg".
 */
export function rutaVariante(original: string, ancho: number, extension: ExtensionVariante): string {
  const carpeta = CARPETAS_FOTOS.find((c) => original.startsWith(`${c.originales}/`));
  if (!carpeta) throw new Error(`La foto "${original}" no está en ${CARPETAS_FOTOS.map((c) => `public${c.originales}/`).join(" ni en ")}.`);
  const sinExtension = original.slice(carpeta.originales.length).replace(/\.[^./]+$/, "");
  return `${carpeta.variantes}${sinExtension}-${ancho}.${extension}`;
}

export interface FuentesFoto {
  /** Un <source> por formato moderno. */
  fuentes: { tipo: string; srcSet: string }[];
  /** JPEG de respaldo para el <img>. */
  src: string;
}

/**
 * Fuentes de <picture> para una foto local. `prefijo` aplica el basePath (helper `asset`).
 * Devuelve null si la foto no tiene variantes (URL externa, como las de Sanity, o foto sin generar).
 */
export function fuentesFoto(original: string, manifiesto: ManifiestoFotos, prefijo: (ruta: string) => string = (r) => r): FuentesFoto | null {
  const entrada = Object.hasOwn(manifiesto, original) ? manifiesto[original] : undefined;
  if (!entrada || entrada.anchos.length === 0) return null;
  const fuentes = FORMATOS_VARIANTES.map(({ extension, tipo }) => ({
    tipo,
    srcSet: entrada.anchos.map((a) => `${prefijo(rutaVariante(original, a, extension))} ${a}w`).join(", "),
  }));
  return { fuentes, src: prefijo(rutaVariante(original, entrada.anchos[entrada.anchos.length - 1], EXTENSION_RESPALDO)) };
}

/** Ruta del JPEG de respaldo (para Open Graph y JSON-LD); si no hay variantes, la original. */
export function rutaRespaldo(original: string, manifiesto: ManifiestoFotos): string {
  return fuentesFoto(original, manifiesto)?.src ?? original;
}
