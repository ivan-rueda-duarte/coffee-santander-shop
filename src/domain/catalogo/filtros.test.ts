import { describe, expect, it } from "vitest";
import {
  BARICHARA,
  CAFES_PRUEBA,
  CAFES_VERIFICADOS,
  crearCafe,
  MALAGA,
  OIBA,
  PROVINCIAS_PRUEBA,
  SAN_GIL,
  SOCORRO,
} from "../pruebas/fixtures";
import {
  agruparPorProvincia,
  alternarProvincia,
  alternarValor,
  aplicarFiltros,
  calcularFacetas,
  coincide,
  dimensionesVisibles,
  etiquetaCafes,
  FILTROS_VACIOS,
  filtrarYOrdenar,
  filtrosActivos,
  limitesCatalogo,
  limpiarFiltros,
  ordenar,
  quitarFiltro,
  reconciliarMunicipios,
  textoContador,
  type FiltrosCatalogo,
} from "./filtros";

const con = (cambios: Partial<FiltrosCatalogo>): FiltrosCatalogo => ({ ...FILTROS_VACIOS, ...cambios });
const slugs = (cafes: { slug: string }[]) => cafes.map((c) => c.slug);

describe("aplicarFiltros", () => {
  it("sin filtros devuelve todo", () => {
    expect(aplicarFiltros(CAFES_PRUEBA, FILTROS_VACIOS)).toHaveLength(5);
  });
  it("provincias se combinan con O", () => {
    const r = aplicarFiltros(CAFES_PRUEBA, con({ provincias: ["guanenta", "garcia-rovira"] }));
    expect(slugs(r)).toEqual([BARICHARA.slug, SAN_GIL.slug, MALAGA.slug]);
  });
  it("dimensiones distintas se combinan con Y", () => {
    const r = aplicarFiltros(CAFES_PRUEBA, con({ provincias: ["guanenta"], tuestes: ["oscuro"] }));
    expect(slugs(r)).toEqual([SAN_GIL.slug]);
  });
  it("municipio, productor, proceso, variedad y perfil", () => {
    expect(slugs(aplicarFiltros(CAFES_PRUEBA, con({ municipios: ["oiba"] })))).toEqual([OIBA.slug]);
    expect(aplicarFiltros(CAFES_PRUEBA, con({ procesos: ["natural"] }))).toEqual([]);
    expect(slugs(aplicarFiltros(CAFES_PRUEBA, con({ variedades: ["castillo", "typica"] })))).toEqual([BARICHARA.slug, MALAGA.slug]);
    expect(slugs(aplicarFiltros(CAFES_PRUEBA, con({ perfiles: ["floral"] })))).toEqual([BARICHARA.slug, MALAGA.slug]);
    const conProductor = [{ ...SOCORRO, productorSlug: "finca-a" }, OIBA];
    expect(slugs(aplicarFiltros(conProductor, con({ productores: ["finca-a"] })))).toEqual([SOCORRO.slug]);
  });
  it("tueste usa los tres grupos", () => {
    expect(slugs(aplicarFiltros(CAFES_PRUEBA, con({ tuestes: ["claro"] })))).toEqual([BARICHARA.slug, MALAGA.slug]);
  });
  it("altitud incluye los extremos y excluye cafés sin altitud", () => {
    expect(slugs(aplicarFiltros(CAFES_PRUEBA, con({ altitud: [1750, 1800] })))).toEqual([SOCORRO.slug, OIBA.slug]);
    const sinAltura = crearCafe({ slug: "a", nombre: "A", alturaMsnm: null });
    expect(aplicarFiltros([sinAltura], con({ altitud: [0, 4000] }))).toEqual([]);
  });
  it("precio usa el precio desde", () => {
    const caro = crearCafe({ slug: "caro", nombre: "Caro", presentaciones: [{ gramos: 500, precioCop: 60000, disponible: true }] });
    expect(slugs(aplicarFiltros([SOCORRO, caro], con({ precio: [50000, 70000] })))).toEqual(["caro"]);
  });
  it("SCA solo cuenta puntajes verificados", () => {
    expect(aplicarFiltros(CAFES_PRUEBA, con({ scaMinimo: 80 }))).toEqual([]);
    expect(slugs(aplicarFiltros(CAFES_VERIFICADOS, con({ scaMinimo: 90 })))).toEqual([BARICHARA.slug, MALAGA.slug]);
  });
  it("solo disponibles", () => {
    const agotado = crearCafe({ slug: "ago", nombre: "Ago", presentaciones: [{ gramos: 250, precioCop: 1, disponible: false }] });
    expect(slugs(aplicarFiltros([SOCORRO, agotado], con({ soloDisponibles: true })))).toEqual([SOCORRO.slug]);
  });
  it("coincide puede ignorar una dimensión", () => {
    const f = con({ provincias: ["guanenta"], tuestes: ["oscuro"] });
    expect(coincide(BARICHARA, f)).toBe(false);
    expect(coincide(BARICHARA, f, "tuestes")).toBe(true);
  });
});

describe("ordenar", () => {
  it("catálogo: por orden y luego por nombre", () => {
    const desordenados = [OIBA, SOCORRO, MALAGA];
    expect(slugs(ordenar(desordenados, "catalogo"))).toEqual([SOCORRO.slug, MALAGA.slug, OIBA.slug]);
    const empate = [crearCafe({ slug: "b", nombre: "Zeta" }), crearCafe({ slug: "a", nombre: "Álamo" })];
    expect(slugs(ordenar(empate, "catalogo"))).toEqual(["a", "b"]);
  });
  it("no modifica la lista original", () => {
    const copia = [...CAFES_PRUEBA];
    ordenar(CAFES_PRUEBA, "altitud");
    expect(CAFES_PRUEBA).toEqual(copia);
  });
  it("altitud de mayor a menor, sin dato al final", () => {
    const sin = crearCafe({ slug: "sin", nombre: "Sin", alturaMsnm: null });
    expect(slugs(ordenar([sin, ...CAFES_PRUEBA], "altitud"))).toEqual([MALAGA.slug, SOCORRO.slug, OIBA.slug, BARICHARA.slug, SAN_GIL.slug, "sin"]);
  });
  it("precio ascendente y descendente", () => {
    const caro = crearCafe({ slug: "caro", nombre: "Caro", presentaciones: [{ gramos: 500, precioCop: 60000, disponible: true }] });
    const sin = crearCafe({ slug: "sin", nombre: "Sin", presentaciones: [] });
    expect(slugs(ordenar([caro, sin, SOCORRO], "precio-asc"))).toEqual([SOCORRO.slug, "caro", "sin"]);
    expect(slugs(ordenar([SOCORRO, sin, caro], "precio-desc"))).toEqual(["caro", SOCORRO.slug, "sin"]);
  });
  it("SCA usa solo puntajes verificados; los demás van al final", () => {
    const mezcla = [OIBA, { ...MALAGA, puntajeVerificado: true }, { ...BARICHARA, puntajeVerificado: true }];
    expect(slugs(ordenar(mezcla, "sca"))).toEqual([MALAGA.slug, BARICHARA.slug, OIBA.slug]);
  });
  it("filtrarYOrdenar aplica el orden de los filtros", () => {
    const r = filtrarYOrdenar(CAFES_PRUEBA, con({ provincias: ["guanenta"], orden: "altitud" }));
    expect(slugs(r)).toEqual([BARICHARA.slug, SAN_GIL.slug]);
  });
});

describe("agruparPorProvincia", () => {
  it("sigue el orden de las provincias y deja los sueltos al final", () => {
    const suelto = crearCafe({ slug: "suelto", nombre: "Suelto", provinciaSlug: null, provincia: null });
    const grupos = agruparPorProvincia([MALAGA, suelto, SAN_GIL, SOCORRO], PROVINCIAS_PRUEBA);
    expect(grupos.map((g) => g.provincia?.slug ?? null)).toEqual(["comunera", "garcia-rovira", "guanenta", null]);
    expect(slugs(grupos[3].cafes)).toEqual(["suelto"]);
  });
  it("omite provincias sin cafés", () => {
    expect(agruparPorProvincia([OIBA], PROVINCIAS_PRUEBA)).toHaveLength(1);
  });
});

describe("calcularFacetas", () => {
  it("excluye la propia dimensión al contar", () => {
    const f = con({ provincias: ["guanenta"], tuestes: ["claro"] });
    const facetas = calcularFacetas(CAFES_PRUEBA, f);
    // Provincias: se aplican los demás filtros (tueste claro) pero no el de provincia.
    expect(facetas.provincias).toEqual({ comunera: 0, guanenta: 1, "garcia-rovira": 1 });
    // Tuestes: se aplica provincia = Guanentá pero no tueste.
    expect(facetas.tuestes).toEqual({ medio: 0, claro: 1, oscuro: 1 });
  });
  it("incluye con 0 las opciones que ya no tienen cafés", () => {
    const facetas = calcularFacetas(CAFES_PRUEBA, con({ municipios: ["oiba"], provincias: ["comunera"] }));
    expect(facetas.provincias.guanenta).toBe(0);
    expect(facetas.municipios).toMatchObject({ socorro: 1, oiba: 1, barichara: 0 });
  });
  it("cuenta cada variedad y cada perfil de un café", () => {
    const multi = crearCafe({ slug: "m", nombre: "M", variedades: ["Castillo®", "Caturra"], notasCata: ["Cacao", "Nuez"] });
    const facetas = calcularFacetas([multi], FILTROS_VACIOS);
    expect(facetas.variedades).toEqual({ castillo: 1, caturra: 1 });
    expect(facetas.perfiles).toEqual({ chocolate: 1, nueces: 1 });
  });
  it("ignora cafés sin provincia o productor", () => {
    const suelto = crearCafe({ slug: "s", nombre: "S", provinciaSlug: null, provincia: null });
    const facetas = calcularFacetas([suelto], FILTROS_VACIOS);
    expect(facetas.provincias).toEqual({});
    expect(facetas.productores).toEqual({});
  });
});

describe("limites y controles visibles", () => {
  it("límites de altitud y precio", () => {
    expect(limitesCatalogo(CAFES_PRUEBA)).toEqual({ altitud: [1650, 1850], precio: [25000, 25000] });
    expect(limitesCatalogo([])).toEqual({ altitud: null, precio: null });
  });
  it("con los datos de hoy oculta Precio, Proceso, Productor y SCA", () => {
    const v = dimensionesVisibles(CAFES_PRUEBA);
    expect(v.has("provincias")).toBe(true);
    expect(v.has("variedades")).toBe(true);
    expect(v.has("altitud")).toBe(true);
    expect(v.has("procesos")).toBe(false);
    expect(v.has("precio")).toBe(false);
    expect(v.has("productores")).toBe(false);
    expect(v.has("sca")).toBe(false);
    expect(v.has("disponibles")).toBe(false);
  });
  it("muestra SCA con puntajes verificados y Stock si hay agotados", () => {
    const agotado = crearCafe({ slug: "ago", nombre: "Ago", presentaciones: [{ gramos: 250, precioCop: 1, disponible: false }] });
    const v = dimensionesVisibles([...CAFES_VERIFICADOS, agotado]);
    expect(v.has("sca")).toBe(true);
    expect(v.has("disponibles")).toBe(true);
  });
  it("muestra Productor con dos productores y Precio con precios distintos", () => {
    const a = crearCafe({ slug: "a", nombre: "A", productorSlug: "p1" });
    const b = crearCafe({ slug: "b", nombre: "B", productorSlug: "p2", presentaciones: [{ gramos: 250, precioCop: 30000, disponible: true }] });
    const v = dimensionesVisibles([a, b]);
    expect(v.has("productores")).toBe(true);
    expect(v.has("precio")).toBe(true);
  });
});

describe("cambios sobre los filtros", () => {
  it("alternarValor agrega y quita", () => {
    const a = alternarValor(FILTROS_VACIOS, "tuestes", "claro");
    expect(a.tuestes).toEqual(["claro"]);
    expect(alternarValor(a, "tuestes", "claro").tuestes).toEqual([]);
    expect(FILTROS_VACIOS.tuestes).toEqual([]);
  });
  it("al quitar una provincia se descartan sus municipios", () => {
    const f = con({ provincias: ["comunera", "guanenta"], municipios: ["socorro", "barichara"] });
    const sinGuanenta = alternarProvincia(f, "guanenta", CAFES_PRUEBA);
    expect(sinGuanenta.provincias).toEqual(["comunera"]);
    expect(sinGuanenta.municipios).toEqual(["socorro"]);
  });
  it("sin provincias elegidas conserva los municipios", () => {
    const f = con({ municipios: ["socorro"] });
    expect(reconciliarMunicipios(f, CAFES_PRUEBA)).toBe(f);
    expect(reconciliarMunicipios(con({ provincias: ["comunera"] }), CAFES_PRUEBA).municipios).toEqual([]);
  });
  it("lista los filtros activos y permite quitar cada uno", () => {
    const f = con({
      provincias: ["guanenta"],
      municipios: ["barichara"],
      altitud: [1600, 1800],
      scaMinimo: 84,
      precio: [20000, 30000],
      soloDisponibles: true,
    });
    const activos = filtrosActivos(f);
    expect(activos).toEqual([
      { dimension: "provincias", valor: "guanenta" },
      { dimension: "municipios", valor: "barichara" },
      { dimension: "altitud" },
      { dimension: "sca" },
      { dimension: "precio" },
      { dimension: "disponibles" },
    ]);
    const vacio = activos.reduce((acc, a) => quitarFiltro(acc, a, CAFES_PRUEBA), f);
    expect(vacio).toEqual(FILTROS_VACIOS);
  });
  it("quitar una provincia con chip también reconcilia municipios", () => {
    const f = con({ provincias: ["guanenta"], municipios: ["barichara"] });
    expect(quitarFiltro(f, { dimension: "provincias", valor: "guanenta" }, CAFES_PRUEBA).municipios).toEqual(["barichara"]);
    const g = con({ provincias: ["comunera", "guanenta"], municipios: ["barichara"] });
    expect(quitarFiltro(g, { dimension: "provincias", valor: "guanenta" }, CAFES_PRUEBA).municipios).toEqual([]);
  });
  it("limpiar conserva el orden", () => {
    expect(limpiarFiltros(con({ provincias: ["guanenta"], orden: "altitud" }))).toEqual({ ...FILTROS_VACIOS, orden: "altitud" });
  });
});

describe("textos del contador", () => {
  it("singular y plural", () => {
    expect(etiquetaCafes(1)).toBe("1 café");
    expect(etiquetaCafes(0)).toBe("0 cafés");
  });
  it("menciona las provincias elegidas", () => {
    expect(textoContador(4, [])).toBe("4 cafés");
    expect(textoContador(4, ["Guanentá"])).toBe("4 cafés en Guanentá");
    expect(textoContador(5, ["Guanentá", "Comunera"])).toBe("5 cafés en Guanentá y Comunera");
    expect(textoContador(5, ["A", "B", "C"])).toBe("5 cafés en 3 provincias");
  });
});
