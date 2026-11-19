import { describe, expect, it } from "vitest";
import type { Cafe, Provincia } from "../catalogo/tipos";
import {
  anchoPin,
  anchoRotulo,
  armarEntradaCapa,
  calcularCapa,
  calcularGraticula,
  capaEstatica,
  firmaCapa,
  nombrePin,
  tramosCapa,
  type EntradaCapa,
} from "./capa";
import type { DatosMapa, ProyeccionMapa } from "./tipos";

const proyeccion: ProyeccionMapa = { lon0: -73.5, lat0: 6.9, cos: 0.99, k: 500, dx: 524, dy: 623 };

const datos: DatosMapa = {
  fuente: "prueba",
  viewBox: [0, 0, 1000, 1200],
  proyeccion,
  municipios: [
    { slug: "socorro", nombre: "Socorro", divipola: "1", provincia: "comunera", d: "M0 0", c: [300, 600], lonlat: [-73.2, 6.4] },
    { slug: "malaga", nombre: "Málaga", divipola: "2", provincia: "garcia-rovira", d: "M0 0", c: [900, 300], lonlat: [-72.7, 6.7] },
    { slug: "tona", nombre: "Tona", divipola: "3", provincia: null, d: "M0 0", c: [700, 400], lonlat: [-73, 7.2] },
  ],
  contorno: "",
  limitesProvincia: "",
  provincias: {
    comunera: { c: [320, 640], bbox: [200, 500, 200, 250] },
    "garcia-rovira": { c: [880, 320], bbox: [800, 200, 180, 220] },
    soto: { c: [600, 300], bbox: [500, 200, 200, 200] },
  },
};

const cafe = (slug: string, nombre: string, municipioSlug: string, municipio: string): Cafe =>
  ({ slug, nombre, municipioSlug, municipio, provinciaSlug: null }) as unknown as Cafe;
const provincia = (slug: string, nombreCorto: string): Provincia => ({ slug, nombre: nombreCorto, nombreCorto, colorHex: "#000", descripcion: null, orden: 1 });

const cafes = [
  cafe("cafe-a", "Café Arreboles", "socorro", "Socorro"),
  cafe("cafe-b", "Café Casa Martínez", "malaga", "Málaga"),
  cafe("cafe-c", "Café Otro", "socorro", "Socorro"),
  cafe("cafe-d", "Café Sin Mapa", "sin-geo", "Ninguno"),
];
const provincias = [provincia("comunera", "Comunera"), provincia("garcia-rovira", "García Rovira")];
const entrada: EntradaCapa = armarEntradaCapa(datos, cafes, provincias, new Set(["comunera", "garcia-rovira"]));

describe("entrada de la capa", () => {
  it("un origen por municipio con cafés y geometría, en el orden del catálogo", () => {
    expect(entrada.origenes.map((o) => [o.municipioSlug, o.cafes.map((c) => c.slug)])).toEqual([
      ["socorro", ["cafe-a", "cafe-c"]],
      ["malaga", ["cafe-b"]],
    ]);
  });
  it("un rótulo por provincia del mapa; sin nombre en el catálogo usa el slug; sin cafés va vacía", () => {
    expect(entrada.provincias.map((p) => [p.slug, p.nombreCorto, p.vacia])).toEqual([
      ["comunera", "Comunera", false],
      ["garcia-rovira", "García Rovira", false],
      ["soto", "soto", true],
    ]);
    expect(entrada.provincias[0].bbox).toEqual([200, 500, 200, 250]);
  });
  it("la gratícula va cada medio grado dentro del departamento", () => {
    const g = calcularGraticula(proyeccion, datos.viewBox);
    expect(g.lons.length).toBeGreaterThan(0);
    expect(g.lats.length).toBeGreaterThan(0);
    for (const l of g.lons) expect(l.valor * 2).toBe(Math.round(l.valor * 2));
    for (const l of g.lats) expect(l.y).toBeGreaterThanOrEqual(0);
  });
});

describe("calcularCapa", () => {
  it("sin medir, la capa va vacía", () => {
    expect(calcularCapa(entrada, datos.viewBox, 0, 0)).toEqual({ pines: [], rotulos: [], marcasLat: [], marcasLon: [], escala: null });
  });
  it("nombres de pin: sin «Café» y con +n si hay varios", () => {
    expect(nombrePin([{ slug: "a", nombre: "Café Arreboles", municipio: "" }])).toBe("Arreboles");
    expect(nombrePin([{ slug: "a", nombre: "Café Arreboles", municipio: "" }, { slug: "b", nombre: "X", municipio: "" }])).toBe("Arreboles +1");
    expect(anchoPin("Arreboles")).toBe(Math.round(9 * 7.2 + 28));
    expect(anchoRotulo("Soto")).toBe(Math.round(4 * 9.6));
  });
  it("pinta pines, rótulos, marcas y escala en píxeles y fracciones del encuadre", () => {
    const c = calcularCapa(entrada, datos.viewBox, 500, 600);
    expect(c.pines.map((p) => p.nombre)).toEqual(["Arreboles +1", "Casa Martínez"]);
    expect(c.pines[0]).toMatchObject({ fx: 0.3, fy: 0.5, cafe: { slug: "cafe-a" }, visible: true });
    // Málaga está en el borde derecho: su nombre prefiere la izquierda.
    expect(c.pines[1].lado).toBe("izquierda");
    expect(c.rotulos.find((r) => r.slug === "soto")).toMatchObject({ vacia: true, alto: 26 });
    for (const m of c.marcasLat) expect(m.texto).toMatch(/N$/);
    for (const m of c.marcasLon) expect(m.texto).toMatch(/O$/);
    expect(c.escala?.km).toBeGreaterThan(0);
    expect(c.escala!.fraccion * 500).toBeCloseTo(c.escala!.anchoPx, 0);
  });
  it("con provincias elegidas atenúa los rótulos de las demás", () => {
    const c = calcularCapa(entrada, datos.viewBox, 500, 600, ["comunera"]);
    expect(c.rotulos.filter((r) => !r.oculto).map((r) => r.slug)).toEqual(["comunera"]);
  });
  it("el rótulo que choca baja o sube 20 o 40 px y lo dice en `desplazamiento`", () => {
    const juntos: EntradaCapa = { ...entrada, origenes: [], provincias: [entrada.provincias[0], { ...entrada.provincias[0], slug: "otra" }] };
    const [a, b] = calcularCapa(juntos, datos.viewBox, 500, 600).rotulos;
    expect(a.desplazamiento).toBe(0);
    expect([20, -20, 40, -40]).toContain(b.desplazamiento);
    expect(b.arriba - a.arriba).toBe(b.desplazamiento);
  });
  it("con zoom, lo que queda fuera no se ve", () => {
    const c = calcularCapa(entrada, [700, 100, 300, 360], 500, 600);
    expect(c.pines[0].visible).toBe(false);
    expect(c.rotulos.find((r) => r.slug === "comunera")?.oculto).toBe(true);
  });
});

describe("capa estática por tramos de ancho", () => {
  it("agrupa anchos con la misma firma; el primero y el último quedan abiertos", () => {
    const tramos = tramosCapa(entrada, 1000 / 1200, 120, 640);
    expect(tramos.length).toBeGreaterThanOrEqual(1);
    expect(tramos[0].desde).toBeNull();
    expect(tramos[tramos.length - 1].hasta).toBeNull();
    for (let i = 1; i < tramos.length; i++) {
      expect(tramos[i].desde).toBe(tramos[i - 1].hasta);
      expect(firmaCapa(tramos[i].capa)).not.toBe(firmaCapa(tramos[i - 1].capa));
    }
  });
  it("cada ancho ve exactamente una variante de cada elemento visible, igual a la capa medida", () => {
    const proporcion = 1000 / 1200;
    const est = capaEstatica(entrada, proporcion, 120, 640);
    const tramoDe = (w: number) => est.tramos.findIndex((t) => (t.desde === null || w >= t.desde) && (t.hasta === null || w < t.hasta));
    const ve = <T>(vs: { valor: T; tramos: number[] | null }[], i: number) => vs.filter((v) => v.tramos === null || v.tramos.includes(i)).map((v) => v.valor);
    for (const w of [120, 200, 280, 320, 390, 482, 582, 640]) {
      const i = tramoDe(w);
      const medida = calcularCapa(entrada, datos.viewBox, w, w / proporcion);
      const pines = ve(est.pines, i);
      expect(pines.map((p) => [p.slug, p.lado])).toEqual(medida.pines.filter((p) => p.visible).map((p) => [p.slug, p.lado]));
      expect(ve(est.rotulos, i).map((r) => [r.slug, r.desplazamiento])).toEqual(medida.rotulos.filter((r) => !r.oculto).map((r) => [r.slug, r.desplazamiento]));
      expect(ve(est.marcasLat, i).map((m) => m.clave)).toEqual(medida.marcasLat.map((m) => m.clave));
      expect(ve(est.marcasLon, i).map((m) => m.clave)).toEqual(medida.marcasLon.map((m) => m.clave));
      expect(ve(est.escala, i).map((e) => e.km)).toEqual([medida.escala?.km]);
    }
  });
  it("un solo tramo: todo con tramos = null", () => {
    const est = capaEstatica({ ...entrada, origenes: [], provincias: [], graticula: { lons: [], lats: [] } }, 1000 / 1200, 600, 640);
    expect(est.tramos).toHaveLength(1);
    expect(est.escala.every((e) => e.tramos === null)).toBe(true);
  });
});
