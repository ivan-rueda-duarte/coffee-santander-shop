// Capa de textos del mapa (pines, nombres de provincia, marcas de la gratícula y escala gráfica).
// La misma función calcula la capa en el build (HTML estático, para cada ancho posible del contenedor) y en el
// navegador (con el ancho medido y el encuadre animado), así que las dos coinciden.

import { colocarPines, colocarRotulos, type Caja } from "./etiquetas";
import { escalaGrafica, formatearGrados, proyectar } from "./geometria";
import type { Cafe, Provincia } from "../catalogo/tipos";
import type { CajaMapa, DatosMapa, ProyeccionMapa } from "./tipos";

export interface CafeEnMapa {
  slug: string;
  nombre: string;
  municipio: string;
}

/** Municipio de origen de uno o más cafés, con su centro en coordenadas del mapa. */
export interface OrigenMapa {
  municipioSlug: string;
  c: [number, number];
  cafes: CafeEnMapa[];
}

export interface ProvinciaEnMapa {
  slug: string;
  nombreCorto: string;
  c: [number, number];
  /** Caja de la provincia, para encuadrarla. */
  bbox: CajaMapa;
  /** Sin cafés: rótulo con «Próximamente». */
  vacia: boolean;
}

export interface Graticula {
  lons: { valor: number; x: number }[];
  lats: { valor: number; y: number }[];
}

/** Lo que la capa necesita del mapa y del catálogo: números, sin trazos. */
export interface EntradaCapa {
  completo: CajaMapa;
  proyeccion: ProyeccionMapa;
  origenes: OrigenMapa[];
  provincias: ProvinciaEnMapa[];
  graticula: Graticula;
}

export interface PinCapa {
  slug: string;
  nombre: string;
  cafe: CafeEnMapa;
  visible: boolean;
  lado: "derecha" | "izquierda" | "compacto";
  /** Centro del punto, en fracción del encuadre (0 a 1). */
  fx: number;
  fy: number;
  ancho: number;
  alto: number;
  izquierda: number;
  arriba: number;
}

export interface RotuloCapa {
  slug: string;
  nombre: string;
  vacia: boolean;
  oculto: boolean;
  fx: number;
  fy: number;
  ancho: number;
  alto: number;
  /** Desplazamiento vertical elegido para no chocar (0, ±20 o ±40 px). */
  desplazamiento: number;
  /** Corrimiento horizontal (0, ±20 o ±40 px), si ningún sitio en vertical sirve. */
  desplazamientoX: number;
  izquierda: number;
  arriba: number;
}

export interface MarcaCapa {
  clave: string;
  texto: string;
  /** Fracción del encuadre en el eje de la marca y posición en píxeles. */
  f: number;
  px: number;
}

export interface Capa {
  pines: PinCapa[];
  rotulos: RotuloCapa[];
  marcasLat: MarcaCapa[];
  marcasLon: MarcaCapa[];
  escala: { km: number; anchoPx: number; fraccion: number } | null;
}

export const anchoPin = (nombre: string) => Math.round(nombre.length * 7.2 + 28);
export const anchoRotulo = (nombre: string) => Math.round(nombre.length * 9.6);
/** «Próximamente» bajo el nombre de una provincia sin cafés (Montserrat 600 de 10 px; medido: 84,2 px). */
export const ANCHO_PROXIMAMENTE = 85;

/** Caja de la escala gráfica (`.mapa-escala`: 12 px del borde izquierdo e inferior; barra de 5 px y cifras de 12 px). */
export const cajaEscala = (anchoPx: number, alto: number): Caja => ({ x0: 12, x1: 12 + anchoPx, y0: alto - 12 - 19, y1: alto - 12 });

/** Caja de una marca de la gratícula (`.mapa-marca`: Montserrat 500 de 10/12 px, ≈ 6 px por carácter). */
export const cajaMarca = (x: number, y: number, texto: string): Caja => ({ x0: x, x1: x + texto.length * 6, y0: y, y1: y + 12 });

const sinCafe = (nombre: string) => nombre.replace(/^Café\s+/i, "");

/** Nombre del pin: el café sin «Café», o el primero y «+n» si el municipio tiene varios. */
export function nombrePin(cafes: readonly CafeEnMapa[]): string {
  return cafes.length === 1 ? sinCafe(cafes[0].nombre) : `${sinCafe(cafes[0].nombre)} +${cafes.length - 1}`;
}

/**
 * Entrada de la capa a partir del mapa y del catálogo: un origen por municipio con cafés (en el orden del catálogo)
 * y un rótulo por provincia del mapa; `activas` son las provincias con cafés.
 */
export function armarEntradaCapa(datos: DatosMapa, cafes: readonly Cafe[], provincias: readonly Provincia[], activas: ReadonlySet<string>): EntradaCapa {
  const municipios = [...new Set(cafes.map((c) => c.municipioSlug))];
  const origenes = municipios.flatMap<OrigenMapa>((slug) => {
    const geo = datos.municipios.find((m) => m.slug === slug);
    const suyos = cafes.filter((c) => c.municipioSlug === slug).map((c) => ({ slug: c.slug, nombre: c.nombre, municipio: c.municipio }));
    return geo && suyos.length ? [{ municipioSlug: slug, c: geo.c, cafes: suyos }] : [];
  });
  return {
    completo: datos.viewBox,
    proyeccion: datos.proyeccion,
    origenes,
    provincias: Object.entries(datos.provincias).map(([slug, p]) => ({
      slug,
      nombreCorto: provincias.find((x) => x.slug === slug)?.nombreCorto ?? slug,
      c: p.c,
      bbox: p.bbox,
      vacia: !activas.has(slug),
    })),
    graticula: calcularGraticula(datos.proyeccion, datos.viewBox),
  };
}

/** Gratícula cada medio grado sobre el departamento completo. */
export function calcularGraticula(p: ProyeccionMapa, viewBox: CajaMapa): Graticula {
  const [, , vw, vh] = viewBox;
  const lonMin = p.lon0 - p.dx / (p.cos * p.k);
  const lonMax = p.lon0 + (vw - p.dx) / (p.cos * p.k);
  const latMax = p.lat0 + p.dy / p.k;
  const latMin = p.lat0 - (vh - p.dy) / p.k;
  const lons: Graticula["lons"] = [];
  const lats: Graticula["lats"] = [];
  for (let lon = Math.ceil(lonMin * 2) / 2; lon <= lonMax; lon += 0.5) lons.push({ valor: lon, x: proyectar(p, lon, 0)[0] });
  for (let lat = Math.ceil(latMin * 2) / 2; lat <= latMax; lat += 0.5) lats.push({ valor: lat, y: proyectar(p, 0, lat)[1] });
  return { lons, lats };
}

/**
 * Capa para un encuadre `vb` pintado en un contenedor de `ancho` × `alto` píxeles. `elegidas` atenúa los
 * nombres de las provincias que no están en el filtro. Con ancho o alto 0 (sin medir) la capa va vacía.
 */
export function calcularCapa(e: EntradaCapa, vb: CajaMapa, ancho: number, alto: number, elegidas: readonly string[] = []): Capa {
  if (!ancho || !alto) return { pines: [], rotulos: [], marcasLat: [], marcasLon: [], escala: null };
  const [vx, vy, vw, vh] = vb;
  const fx = (x: number) => (x - vx) / vw;
  const fy = (y: number) => (y - vy) / vh;

  const entradas = e.origenes
    .filter((o) => o.cafes.length > 0)
    .map((o) => {
      const nombre = nombrePin(o.cafes);
      return { o, nombre, x: fx(o.c[0]) * ancho, y: fy(o.c[1]) * alto, ancho: anchoPin(nombre), alto: 26, preferirIzquierda: o.c[0] > e.completo[2] * 0.72 };
    });
  const colocacion = colocarPines(entradas, ancho, alto);
  const pines = entradas.map<PinCapa>((p, i) => ({
    slug: p.o.municipioSlug,
    nombre: p.nombre,
    cafe: p.o.cafes[0],
    fx: fx(p.o.c[0]),
    fy: fy(p.o.c[1]),
    ancho: p.ancho,
    alto: p.alto,
    ...colocacion.pines[i],
  }));

  const rot = e.provincias.map((p) => ({
    p,
    cx: fx(p.c[0]) * ancho,
    cy: fy(p.c[1]) * alto,
    ancho: anchoRotulo(p.nombreCorto),
    anchoCaja: p.vacia ? ANCHO_PROXIMAMENTE : undefined,
    alto: p.vacia ? 26 : 14,
    atenuado: elegidas.length > 0 && !elegidas.includes(p.slug),
    vacia: p.vacia,
  }));
  const marcasLat = e.graticula.lats.flatMap((l) => {
    const y = fy(l.y) * alto;
    return y < alto * 0.04 || y > alto * 0.9 ? [] : [{ clave: `lat${l.valor}`, texto: `${formatearGrados(l.valor)}N`, f: fy(l.y), px: Math.round(y - 9) }];
  });
  const marcasLon = e.graticula.lons.flatMap((l) => {
    const x = fx(l.x) * ancho;
    return x < ancho * 0.06 || x > ancho * 0.86 ? [] : [{ clave: `lon${l.valor}`, texto: `${formatearGrados(l.valor)}O`, f: fx(l.x), px: Math.round(x + 4) }];
  });

  // La escala gráfica y las marcas de la gratícula también ocupan su sitio: un rótulo no se pone encima (QA-032).
  const g = escalaGrafica(e.proyeccion, vw, ancho);
  const ocupadas = [
    ...colocacion.ocupadas,
    cajaEscala(g.anchoPx, alto),
    ...marcasLat.map((m) => cajaMarca(6, m.px, m.texto)),
    ...marcasLon.map((m) => cajaMarca(m.px, 4, m.texto)),
  ];
  const colocados = colocarRotulos(rot, ocupadas, ancho, alto);
  const rotulos = rot.map<RotuloCapa>((r, i) => {
    const c = colocados[i];
    return {
      slug: r.p.slug,
      nombre: r.p.nombreCorto,
      vacia: r.p.vacia,
      fx: fx(r.p.c[0]),
      fy: fy(r.p.c[1]),
      ancho: r.ancho,
      alto: r.alto,
      desplazamiento: c.oculto ? 0 : Math.round((c.arriba - (r.cy - r.alto / 2)) / 20) * 20 || 0, // sin -0
      ...c,
    };
  });

  return { pines, rotulos, marcasLat, marcasLon, escala: { ...g, fraccion: g.km / (111.32 / e.proyeccion.k) / vw } };
}

/** Lo que cambia de forma discreta con el ancho: si dos anchos tienen la misma firma, la capa se ve igual a escala. */
export function firmaCapa(c: Capa): string {
  return JSON.stringify([
    c.pines.map((p) => [p.visible, p.lado]),
    c.rotulos.map((r) => [r.oculto, r.desplazamiento, r.desplazamientoX]),
    c.marcasLat.map((m) => m.clave),
    c.marcasLon.map((m) => m.clave),
    c.escala?.km ?? null,
  ]);
}

export interface TramoCapa {
  /** Anchos del contenedor (px) en que rige: desde ≤ ancho < hasta; null = sin límite. */
  desde: number | null;
  hasta: number | null;
  capa: Capa;
}

/**
 * Alto en píxeles enteros de un contenedor de `ancho` px con `aspect-ratio: proporcion`, como lo da `clientHeight`
 * en el navegador. El build y la isla deben medir igual: con decimales, un rótulo justo en el borde (`y1 < alto − 2`)
 * cabía en una capa y en la otra no (QA-034).
 */
export const altoContenedor = (ancho: number, proporcion: number): number => Math.round(ancho / proporcion);

/**
 * Capa del departamento completo para cada ancho entero entre `min` y `max`, agrupada en tramos con la misma firma.
 * El HTML estático pinta un tramo por intervalo de ancho; el navegador, al medir, calcula la misma capa.
 */
export function tramosCapa(e: EntradaCapa, proporcion: number, min: number, max: number): TramoCapa[] {
  const tramos: (TramoCapa & { firma: string })[] = [];
  for (let w = min; w <= max; w++) {
    const capa = calcularCapa(e, e.completo, w, altoContenedor(w, proporcion));
    const firma = firmaCapa(capa);
    const ultimo = tramos[tramos.length - 1];
    if (ultimo && ultimo.firma === firma) continue;
    if (ultimo) ultimo.hasta = w;
    tramos.push({ desde: w, hasta: null, capa, firma });
  }
  if (tramos.length) tramos[0].desde = null;
  return tramos.map(({ desde, hasta, capa }) => ({ desde, hasta, capa }));
}

/** Un elemento de la capa estática y los tramos en que se ve (null = en todos). */
export interface Variante<T> {
  valor: T;
  tramos: number[] | null;
}

export interface CapaEstatica {
  tramos: { desde: number | null; hasta: number | null }[];
  rotulos: Variante<RotuloCapa>[];
  marcasLat: Variante<MarcaCapa>[];
  marcasLon: Variante<MarcaCapa>[];
  pines: Variante<PinCapa>[];
  escala: Variante<NonNullable<Capa["escala"]>>[];
}

/**
 * Capa del departamento completo para el HTML estático: cada elemento con las variantes que toma según el ancho
 * del contenedor (lado del pin, desplazamiento del rótulo…) y los tramos de ancho en que rige cada una.
 */
export function capaEstatica(e: EntradaCapa, proporcion: number, min: number, max: number): CapaEstatica {
  const tramos = tramosCapa(e, proporcion, min, max);
  const todos = tramos.length;
  // Las variantes quedan en el orden de su elemento (el de la capa del navegador): así el orden de foco de los pines no cambia.
  const agrupar = <T>(sacar: (c: Capa) => { clave: string; valor: T; orden: number }[]): Variante<T>[] => {
    const porClave = new Map<string, { valor: T; orden: number; lista: number[] }>();
    tramos.forEach((t, i) =>
      sacar(t.capa).forEach(({ clave, valor, orden }) => {
        const v = porClave.get(clave) ?? { valor, orden, lista: [] };
        v.lista.push(i);
        porClave.set(clave, v);
      }),
    );
    return [...porClave.values()]
      .sort((a, b) => a.orden - b.orden)
      .map(({ valor, lista }) => ({ valor, tramos: lista.length === todos ? null : lista }));
  };
  return {
    tramos: tramos.map(({ desde, hasta }) => ({ desde, hasta })),
    rotulos: agrupar((c) => c.rotulos.flatMap((r, orden) => (r.oculto ? [] : [{ clave: `${r.slug}:${r.desplazamiento}:${r.desplazamientoX}`, valor: r, orden }]))),
    marcasLat: agrupar((c) => c.marcasLat.map((m) => ({ clave: m.clave, valor: m, orden: e.graticula.lats.findIndex((l) => `lat${l.valor}` === m.clave) }))),
    marcasLon: agrupar((c) => c.marcasLon.map((m) => ({ clave: m.clave, valor: m, orden: e.graticula.lons.findIndex((l) => `lon${l.valor}` === m.clave) }))),
    pines: agrupar((c) => c.pines.flatMap((p, orden) => (p.visible ? [{ clave: `${p.slug}:${p.lado}`, valor: p, orden }] : []))),
    escala: agrupar((c) => (c.escala ? [{ clave: String(c.escala.km), valor: c.escala, orden: 0 }] : [])),
  };
}
