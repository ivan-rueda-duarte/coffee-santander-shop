// Genera los CSV de data/ a partir de legacy/js/data.js y legacy/js/mapa.js.
// Se usó una vez para sembrar los datos; después los CSV se editan a mano.
// Uso: npx tsx tools/seed-desde-v1.ts [--forzar]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { slugify } from "../src/domain/comun/slug";

const RAIZ = join(import.meta.dirname, "..");
const DESTINO = join(RAIZ, "data");

function evaluar<T>(archivo: string, expresion: string): T {
  const fuente = readFileSync(join(RAIZ, "legacy/js", archivo), "utf8");
  return vm.runInNewContext(`${fuente}\n;(${expresion})`, { console: { warn() {} } }) as T;
}

interface ProvinciaV1 { nombre: string; slug: string; color: string; descripcion: string }
interface CafeV1 {
  nombre: string; municipio: string; finca: string; altura_msnm: number; variedad: string; proceso: string;
  perfil_taza: string[]; disponible: boolean; presentaciones: { gramos: number; precio_cop: number }[];
  tueste: string; puntaje_cata: number;
}
interface Tienda { nombre: string; whatsapp: string; ciudad_despacho: string; envio: string; pagos: string[] }

const { PROVINCIAS, CAFES, TIENDA, MAX_CANTIDAD } = evaluar<{
  PROVINCIAS: Record<string, ProvinciaV1>; CAFES: CafeV1[]; TIENDA: Tienda; MAX_CANTIDAD: number;
}>("data.js", "{ PROVINCIAS, CAFES, TIENDA, MAX_CANTIDAD }");
const { municipios: MUNICIPIOS } = evaluar<{ municipios: { nombre: string; provincia: string | null }[] }>("mapa.js", "MAPA_SANTANDER");

function celda(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function csv(columnas: string[], filas: unknown[][]): string {
  return [columnas, ...filas].map((f) => f.map(celda).join(",")).join("\n") + "\n";
}

const TUESTES: Record<string, string> = {
  Claro: "claro", "Medio claro": "medio_claro", Medio: "medio", "Medio oscuro": "medio_oscuro", Oscuro: "oscuro",
};

const slugDeProvincia = (nombre: string) => PROVINCIAS[nombre]?.slug ?? "";

const archivos: Record<string, string> = {};

archivos["provincias.csv"] = csv(
  ["slug", "nombre", "nombre_corto", "color_hex", "descripcion", "orden"],
  Object.entries(PROVINCIAS).map(([corto, p], i) => [
    p.slug, p.nombre, corto, p.color, /por completar/i.test(p.descripcion) ? "" : p.descripcion, i + 1,
  ]),
);

archivos["municipios.csv"] = csv(
  ["slug", "nombre", "divipola", "provincia_slug", "por_verificar"],
  MUNICIPIOS.map((m) => [slugify(m.nombre), m.nombre, "", m.provincia ? slugDeProvincia(m.provincia) : "", m.provincia ? "no" : "si"]),
);

archivos["productores.csv"] = csv(["slug", "nombre", "tipo", "municipio_slug", "activo"], []);

archivos["cafes.csv"] = csv(
  [
    "slug", "nombre", "municipio_slug", "productor_slug", "altura_msnm", "variedades", "proceso", "proceso_detalle",
    "tueste", "notas_cata", "puntaje_sca", "puntaje_verificado", "puntaje_fuente", "puntaje_fecha",
    "registro_sanitario", "moliendas", "destacado", "activo", "orden",
  ],
  CAFES.map((c, i) => [
    slugify(c.nombre), c.nombre, slugify(c.municipio), c.finca ? slugify(c.finca) : "", c.altura_msnm, c.variedad,
    "lavado", c.proceso === "Lavado" ? "" : c.proceso, TUESTES[c.tueste], c.perfil_taza.join("|"),
    c.puntaje_cata, "no", "", "", "", "grano|molido", "no", "si", i + 1,
  ]),
);

archivos["presentaciones.csv"] = csv(
  ["cafe_slug", "gramos", "precio_cop", "disponible"],
  CAFES.flatMap((c) => c.presentaciones.map((p) => [slugify(c.nombre), p.gramos, p.precio_cop, c.disponible ? "si" : "no"])),
);

archivos["config.csv"] = csv(
  ["clave", "valor"],
  [
    ["nombre_tienda", TIENDA.nombre],
    ["whatsapp", TIENDA.whatsapp],
    ["ciudad_despacho", TIENDA.ciudad_despacho],
    ["nota_envio", TIENDA.envio],
    ["formas_pago", TIENDA.pagos.join("|")],
    ["max_cantidad", MAX_CANTIDAD],
    ["razon_social", ""],
    ["nit", ""],
    ["domicilio", ""],
    ["correo_contacto", ""],
  ],
);

mkdirSync(DESTINO, { recursive: true });
const forzar = process.argv.includes("--forzar");
for (const [nombre, contenido] of Object.entries(archivos)) {
  const ruta = join(DESTINO, nombre);
  if (existsSync(ruta) && !forzar) {
    console.error(`Ya existe data/${nombre}. Los CSV se editan a mano; usa --forzar para sobrescribirlos.`);
    process.exit(1);
  }
}
for (const [nombre, contenido] of Object.entries(archivos)) writeFileSync(join(DESTINO, nombre), contenido, "utf8");
console.log(`Escribí ${Object.keys(archivos).length} archivos en data/`);
