import { describe, expect, it } from "vitest";
import { Errores } from "./campos";
import { cargarEnvios, type DatosDivipola } from "./cargar-envios";
import type { LeerArchivo } from "./tabla";

const DIVIPOLA: DatosDivipola = {
  departamentos: [
    { nombre: "Santander", municipios: [{ nombre: "Bucaramanga" }, { nombre: "Girón" }] },
    { nombre: "Bogotá, D.C.", municipios: [{ nombre: "Bogotá, D.C." }] },
    { nombre: "Amazonas", municipios: [{ nombre: "Leticia" }] },
  ],
};

const CABECERA_TARIFAS = "zona,clave,nombre,medio,hasta_1kg_cop,hasta_2kg_cop,hasta_5kg_cop,mas_5kg,vigencia_desde\n";
const TARIFAS = `${CABECERA_TARIFAS}1,bucaramanga,Bucaramanga,mensajero,8800,11600,15400,por_cotizar,2026-11-05
2,zona2,Resto de Santander,transportadora,12100,16200,22000,por_cotizar,2026-11-05
3,zona3,Capitales,transportadora,18000,23000,33000,por_cotizar,2026-11-05
4,zona4,Resto,transportadora,22000,28100,37400,por_cotizar,2026-11-05
5,zona5,Especial,transportadora_o_472,por_cotizar,por_cotizar,por_cotizar,por_cotizar,2026-11-05
`;
const ZONAS = `nivel,departamento,municipio,zona,nota
departamento,Santander,,2,
municipio,Santander,Bucaramanga,1,
municipio,"Bogotá, D.C.","Bogotá, D.C.",3,
departamento,Amazonas,,5,
`;

function errores(tarifas: string, zonas: string): string[] {
  const leer: LeerArchivo = (n) => {
    if (n === "tarifas_envio.csv") return tarifas;
    if (n === "zonas_envio.csv") return zonas;
    throw new Error("no existe");
  };
  const e = new Errores();
  cargarEnvios(leer, e, DIVIPOLA);
  return e.lista;
}

describe("cargarEnvios", () => {
  it("acepta datos correctos", () => {
    expect(errores(TARIFAS, ZONAS)).toEqual([]);
  });
  it("compara con divipola sin tildes ni mayúsculas", () => {
    expect(errores(TARIFAS, ZONAS.replace("Bucaramanga,1", "BUCARAMANGA,1").replace("Amazonas", "amazonas"))).toEqual([]);
  });
  it("rechaza un departamento que no existe en divipola.json", () => {
    const e = errores(TARIFAS, ZONAS.replace("departamento,Amazonas", "departamento,San Andrés y Providencia"));
    expect(e).toHaveLength(1);
    expect(e[0]).toContain('zonas_envio.csv, línea 5, columna "departamento": "San Andrés y Providencia" no existe en src/data/divipola.json');
  });
  it("rechaza un municipio que no existe en su departamento", () => {
    const e = errores(TARIFAS, ZONAS.replace("Bogotá, D.C.\",\"Bogotá, D.C.\"", 'Amazonas",Bogotá'));
    expect(e.some((m) => m.includes('columna "municipio": "Bogotá" no existe en Amazonas'))).toBe(true);
  });
  it("exige la tarifa de la zona 4", () => {
    const e = errores(TARIFAS.replace(/4,zona4.*\n/, ""), ZONAS);
    expect(e.some((m) => m.includes("falta la tarifa de la zona 4"))).toBe(true);
  });
  it("solo permite por_cotizar en la zona 5", () => {
    const e = errores(TARIFAS.replace("22000,28100,37400", "22000,por_cotizar,37400"), ZONAS);
    expect(e.some((m) => m.includes('"por_cotizar" solo puede aparecer en la zona 5'))).toBe(true);
  });
  it("la zona 5 debe ser por cotizar en sus tres escalones", () => {
    const e = errores(TARIFAS.replace("por_cotizar,por_cotizar,por_cotizar,por_cotizar", "100,por_cotizar,por_cotizar,por_cotizar"), ZONAS);
    expect(e.some((m) => m.includes("la zona 5 no tiene tarifa publicada"))).toBe(true);
  });
  it("exige escalones en aumento", () => {
    const e = errores(TARIFAS.replace("12100,16200,22000", "12100,12100,22000"), ZONAS);
    expect(e.some((m) => m.includes("deben ir en aumento"))).toBe(true);
  });
  it("mas_5kg siempre es por_cotizar", () => {
    const e = errores(TARIFAS.replace("8800,11600,15400,por_cotizar", "8800,11600,15400,20000"), ZONAS);
    expect(e.some((m) => m.includes('columna "mas_5kg"'))).toBe(true);
  });
  it("rechaza zonas fuera de 1 a 5, claves repetidas y claves que no corresponden a la zona", () => {
    expect(errores(TARIFAS, ZONAS.replace("Bucaramanga,1", "Bucaramanga,7")).some((m) => m.includes('columna "zona"'))).toBe(true);
    expect(errores(`${TARIFAS}2,zona2,Otra,transportadora,1,2,3,por_cotizar,2026-11-05\n`, ZONAS).some((m) => m.includes('"zona2" ya aparece'))).toBe(true);
    expect(errores(TARIFAS.replace("3,zona3", "3,zonaX"), ZONAS.replace(",3,", ",4,")).some((m) => m.includes('su clave debe ser "zona3"'))).toBe(true);
  });
  it("exige tarifa para cada zona y para cada municipio de zona 1", () => {
    expect(errores(TARIFAS.replace(/3,zona3.*\n/, ""), ZONAS).some((m) => m.includes("falta la tarifa de la zona 3"))).toBe(true);
    expect(errores(TARIFAS.replace(/1,bucaramanga.*\n/, ""), ZONAS).some((m) => m.includes('necesita una tarifa con clave "bucaramanga"'))).toBe(true);
    expect(errores(TARIFAS.replace("1,bucaramanga", "2,bucaramanga"), ZONAS).some((m) => m.includes('la tarifa "bucaramanga" debe ser de la zona 1'))).toBe(true);
  });
  it("valida el nivel y la forma de cada regla", () => {
    expect(errores(TARIFAS, ZONAS.replace("departamento,Santander,,2", "region,Santander,,2")).some((m) => m.includes('el nivel debe ser'))).toBe(true);
    expect(errores(TARIFAS, `${ZONAS}municipio,Santander,,2,\n`).some((m) => m.includes('necesita el municipio'))).toBe(true);
    expect(errores(TARIFAS, `${ZONAS}departamento,Amazonas,Leticia,5,\n`).some((m) => m.includes("no lleva municipio"))).toBe(true);
    expect(errores(TARIFAS, `${ZONAS}departamento,Amazonas,,1,\n`).some((m) => m.includes("la zona 1 se asigna por municipio"))).toBe(true);
  });
  it("rechaza reglas repetidas", () => {
    expect(errores(TARIFAS, `${ZONAS}departamento,SANTANDER,,3,\n`).some((m) => m.includes("ya aparece en la línea 2"))).toBe(true);
  });
  it("avisa si falta un archivo", () => {
    const e = new Errores();
    cargarEnvios(() => { throw new Error("no existe"); }, e, DIVIPOLA);
    expect(e.lista).toContain("tarifas_envio.csv: no se encontró el archivo en data/.");
    expect(e.lista).toContain("zonas_envio.csv: no se encontró el archivo en data/.");
  });
});
