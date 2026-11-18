// Genera las variantes responsivas de las fotos de public/fotos/ (la exportación estática no optimiza imágenes).
//
//   npm run fotos                    → public/fotos-optimizadas/ (no versionada) + src/data/fotos-responsivas.json
//   tsx tools/fotos-responsivas.ts --limpiar-out
//                                    → después del build: quita de out/ los originales que ya tienen variantes
//                                      (el sitio no los usa) y falla si alguna página aún los enlaza.
//
// Por cada foto: 400/800/1200 px de ancho en AVIF y WebP, sin ampliar (una foto más angosta usa su ancho real),
// y un JPEG de respaldo del ancho mayor. Solo regenera lo que falte o sea más viejo que el original.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import {
  anchosParaGenerar,
  CARPETA_ORIGINALES,
  CARPETA_VARIANTES,
  EXTENSION_RESPALDO,
  FORMATOS_VARIANTES,
  rutaVariante,
  type ExtensionVariante,
  type ManifiestoFotos,
} from "../src/ui/fotos-responsivas";

// Como los demás scripts, corre desde la raíz del repositorio (npm run …).
const RAIZ = process.cwd();
const PUBLIC = join(RAIZ, "public");
const OUT = join(RAIZ, "out");
const MANIFIESTO = join(RAIZ, "src", "data", "fotos-responsivas.json");
const EXTENSIONES_ORIGEN = /\.(jpe?g|png|webp|avif)$/i;

// Calidades elegidas a ojo sobre las fotos actuales; AVIF con esfuerzo 2 para no alargar el build (≈1 s por foto).
const CALIDAD = { avif: { quality: 50, effort: 2 }, webp: { quality: 76 }, jpg: { quality: 78, mozjpeg: true } } as const;

type Sharp = typeof import("sharp").default;

async function cargarSharp(): Promise<Sharp> {
  try {
    return (await import("sharp")).default;
  } catch {
    console.error("✗ No se encontró «sharp», necesario para generar las fotos responsivas. Ejecuta `npm ci`.");
    process.exit(1);
  }
}

/** Rutas públicas ("/fotos/cafes/x/1.jpg") de todas las fotos originales. */
function listarOriginales(carpeta = join(PUBLIC, CARPETA_ORIGINALES.slice(1))): string[] {
  if (!existsSync(carpeta)) return [];
  const rutas: string[] = [];
  for (const nombre of readdirSync(carpeta).sort()) {
    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) rutas.push(...listarOriginales(ruta));
    else if (EXTENSIONES_ORIGEN.test(nombre)) rutas.push(`/${relative(PUBLIC, ruta).split(sep).join("/")}`);
  }
  return rutas;
}

function listarArchivos(carpeta: string): string[] {
  if (!existsSync(carpeta)) return [];
  return readdirSync(carpeta, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => join(d.parentPath, d.name));
}

const enPublic = (rutaPublica: string) => join(PUBLIC, ...rutaPublica.split("/").filter(Boolean));

async function generar(): Promise<void> {
  const sharp = await cargarSharp();
  const inicio = Date.now();
  const manifiesto: ManifiestoFotos = {};
  const esperados = new Set<string>();
  let generados = 0;

  for (const original of listarOriginales()) {
    const archivo = enPublic(original);
    const meta = await sharp(archivo).metadata();
    if (!meta.width || !meta.height) throw new Error(`No se pudo leer el tamaño de public${original}.`);
    // Orientación EXIF 5–8: la foto se ve girada 90°, así que ancho y alto se intercambian.
    const girada = (meta.orientation ?? 1) >= 5;
    const ancho = girada ? meta.height : meta.width;
    const alto = girada ? meta.width : meta.height;
    const anchos = anchosParaGenerar(ancho);
    manifiesto[original] = { ancho, alto, anchos };

    const mtimeOriginal = statSync(archivo).mtimeMs;
    const tareas: { ancho: number; extension: ExtensionVariante }[] = [
      ...anchos.flatMap((a) => FORMATOS_VARIANTES.map(({ extension }) => ({ ancho: a, extension }))),
      { ancho: anchos[anchos.length - 1], extension: EXTENSION_RESPALDO },
    ];
    for (const { ancho: a, extension } of tareas) {
      const destino = enPublic(rutaVariante(original, a, extension));
      esperados.add(destino);
      if (existsSync(destino) && statSync(destino).mtimeMs >= mtimeOriginal) continue;
      mkdirSync(dirname(destino), { recursive: true });
      const base = sharp(archivo).rotate().resize({ width: a, withoutEnlargement: true });
      const salida = extension === "avif" ? base.avif(CALIDAD.avif) : extension === "webp" ? base.webp(CALIDAD.webp) : base.jpeg(CALIDAD.jpg);
      await salida.toFile(destino);
      generados++;
    }
  }

  // Variantes huérfanas (foto borrada o renombrada): fuera, para que no lleguen a out/.
  let huerfanas = 0;
  for (const archivo of listarArchivos(join(PUBLIC, CARPETA_VARIANTES.slice(1)))) {
    if (!esperados.has(archivo)) {
      rmSync(archivo);
      huerfanas++;
    }
  }

  // Una foto por línea: el diff del manifiesto se lee fácil cuando cambia una foto.
  const lineas = Object.entries(manifiesto).map(([ruta, entrada]) => `  ${JSON.stringify(ruta)}: ${JSON.stringify(entrada)}`);
  const json = lineas.length ? `{\n${lineas.join(",\n")}\n}\n` : "{}\n";
  const anterior = existsSync(MANIFIESTO) ? readFileSync(MANIFIESTO, "utf8") : "";
  if (json !== anterior) writeFileSync(MANIFIESTO, json);

  const fotos = Object.keys(manifiesto).length;
  console.log(
    `✓ Fotos responsivas: ${fotos} foto(s), ${generados} variante(s) nuevas, ${esperados.size - generados} al día` +
      (huerfanas ? `, ${huerfanas} huérfana(s) borrada(s)` : "") +
      ` (${((Date.now() - inicio) / 1000).toFixed(1)} s).`,
  );
}

/** Quita de out/ los originales con variantes. Antes comprueba que ningún HTML los cargue (src, srcset, href, content). */
function limpiarOut(): void {
  if (!existsSync(OUT)) {
    console.error("✗ No existe out/: ejecuta `npm run build` primero.");
    process.exit(1);
  }
  const manifiesto = JSON.parse(readFileSync(MANIFIESTO, "utf8")) as ManifiestoFotos;
  const originales = Object.keys(manifiesto);
  const html = listarArchivos(OUT).filter((a) => a.endsWith(".html"));
  const errores: string[] = [];
  for (const pagina of html) {
    const texto = readFileSync(pagina, "utf8");
    for (const original of originales) {
      const escapada = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const atributo = new RegExp(`(?:src|srcset|href|content)="[^"]*${escapada}[\\s",]`, "i");
      if (atributo.test(texto)) errores.push(`out/${relative(OUT, pagina)} enlaza ${original}`);
    }
  }
  for (const original of originales) {
    for (const extension of [...FORMATOS_VARIANTES.map((f) => f.extension), EXTENSION_RESPALDO] as ExtensionVariante[]) {
      const ultimo = manifiesto[original].anchos.at(-1)!;
      const variante = join(OUT, ...rutaVariante(original, ultimo, extension).split("/").filter(Boolean));
      if (!existsSync(variante)) errores.push(`falta ${relative(RAIZ, variante)} en out/`);
    }
  }
  if (errores.length) {
    console.error(`✗ No se quitan los originales de out/:\n  - ${errores.join("\n  - ")}`);
    process.exit(1);
  }
  let bytes = 0;
  for (const original of originales) {
    const archivo = join(OUT, ...original.split("/").filter(Boolean));
    if (!existsSync(archivo)) continue;
    bytes += statSync(archivo).size;
    rmSync(archivo);
  }
  console.log(`✓ out/: ${originales.length} foto(s) original(es) quitada(s) (${(bytes / 1024 / 1024).toFixed(1)} MB); el sitio usa las variantes de ${CARPETA_VARIANTES}/.`);
}

if (process.argv.includes("--limpiar-out")) limpiarOut();
else
  generar().catch((e: unknown) => {
    console.error(`✗ Fotos responsivas: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  });
