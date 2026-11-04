import { describe, expect, it } from "vitest";
import { FILTROS_VACIOS, type FiltrosCatalogo } from "./filtros";
import { parseFiltros, serializarFiltros } from "./url";

const parse = (q: string, opciones = {}) => parseFiltros(new URLSearchParams(q), opciones);

describe("parseFiltros", () => {
  it("sin parámetros devuelve los filtros vacíos", () => {
    expect(parse("")).toEqual(FILTROS_VACIOS);
  });
  it("acepta el formato de la v1 (?provincia=guanenta)", () => {
    expect(parse("provincia=guanenta").provincias).toEqual(["guanenta"]);
  });
  it("acepta varias provincias y quita repetidas", () => {
    expect(parse("provincia=guanenta,comunera,guanenta").provincias).toEqual(["guanenta", "comunera"]);
  });
  it("ignora valores desconocidos cuando conoce las opciones", () => {
    const opciones = { provincias: ["guanenta", "comunera"] };
    expect(parse("provincia=guanenta,mares", opciones).provincias).toEqual(["guanenta"]);
    expect(parse("provincia=mares", opciones).provincias).toEqual([]);
  });
  it("ignora enums inválidos", () => {
    const f = parse("proceso=natural,x&tueste=oscuro,morado&perfil=floral,humo");
    expect(f.procesos).toEqual(["natural"]);
    expect(f.tuestes).toEqual(["oscuro"]);
    expect(f.perfiles).toEqual(["floral"]);
  });
  it("normaliza la variedad a slug", () => {
    expect(parse("variedad=Castillo®,Caturra").variedades).toEqual(["castillo", "caturra"]);
    expect(parse("variedad=castillo,geisha", { variedades: ["castillo"] }).variedades).toEqual(["castillo"]);
  });
  it("lee rangos y corrige el orden de los extremos", () => {
    expect(parse("altitud=1500-1800").altitud).toEqual([1500, 1800]);
    expect(parse("precio=50000-20000").precio).toEqual([20000, 50000]);
    expect(parse("altitud=abc").altitud).toBeNull();
    expect(parse("altitud=1500").altitud).toBeNull();
  });
  it("solo acepta los umbrales SCA conocidos", () => {
    expect(parse("sca=84").scaMinimo).toBe(84);
    expect(parse("sca=83").scaMinimo).toBeNull();
    expect(parse("sca=x").scaMinimo).toBeNull();
  });
  it("lee stock y orden", () => {
    expect(parse("stock=1").soloDisponibles).toBe(true);
    expect(parse("stock=0").soloDisponibles).toBe(false);
    expect(parse("orden=precio-desc").orden).toBe("precio-desc");
    expect(parse("orden=raro").orden).toBe("catalogo");
  });
  it("ignora los parámetros de la v1 que ya no existen (?marca=)", () => {
    expect(parse("marca=Café+Oiba")).toEqual(FILTROS_VACIOS);
  });
  it("lee el objeto searchParams de Next (texto o lista)", () => {
    const f = parseFiltros({ provincia: ["guanenta", "otra"], tueste: "claro", nada: undefined });
    expect(f.provincias).toEqual(["guanenta"]);
    expect(f.tuestes).toEqual(["claro"]);
  });
});

describe("serializarFiltros", () => {
  it("vacío no escribe nada", () => {
    expect(serializarFiltros(FILTROS_VACIOS)).toBe("");
  });
  it("escribe claves en orden fijo y comas legibles", () => {
    const f: FiltrosCatalogo = {
      ...FILTROS_VACIOS,
      orden: "altitud",
      soloDisponibles: true,
      precio: [20000, 50000],
      scaMinimo: 86,
      altitud: [1500, 1800],
      perfiles: ["floral"],
      tuestes: ["claro", "medio"],
      variedades: ["castillo"],
      procesos: ["lavado"],
      productores: ["finca-a"],
      municipios: ["barichara"],
      provincias: ["guanenta", "comunera"],
    };
    expect(serializarFiltros(f)).toBe(
      "provincia=guanenta,comunera&municipio=barichara&productor=finca-a&proceso=lavado&variedad=castillo&tueste=claro,medio&perfil=floral&altitud=1500-1800&sca=86&precio=20000-50000&stock=1&orden=altitud",
    );
  });
  it("codifica caracteres raros dentro de cada valor", () => {
    expect(serializarFiltros({ ...FILTROS_VACIOS, municipios: ["a&b", "c d"] })).toBe("municipio=a%26b,c%20d");
  });
  it("ida y vuelta: parse(serializar(f)) == f", () => {
    const f: FiltrosCatalogo = {
      ...FILTROS_VACIOS,
      provincias: ["guanenta"],
      tuestes: ["oscuro"],
      altitud: [1600, 1700],
      scaMinimo: 80,
      orden: "precio-asc",
    };
    expect(parse(serializarFiltros(f))).toEqual(f);
  });
});
