import { describe, expect, it } from "vitest";
import { REGLAS_ENVIO_PRUEBA as REGLAS } from "../pruebas/fixtures";
import { calcularEnvio, coberturaPorZona, calcularPesoFacturable, nombreDestino, resolverZona, totalConEnvio } from "./envio";
import { EMPAQUE_G, type ItemPesable } from "./tipos";

const bolsas = (gramos: number, cantidad = 1): ItemPesable => ({ gramos, cantidad });
const BUCARAMANGA = { departamento: "Santander", municipio: "Bucaramanga" };
const BOGOTA = { departamento: "Bogotá, D.C.", municipio: "Bogotá, D.C." };

describe("calcularPesoFacturable", () => {
  it("suma las bolsas por su cantidad y el empaque", () => {
    expect(calcularPesoFacturable([bolsas(500, 2), bolsas(250, 1)])).toBe(1250 + EMPAQUE_G);
  });
  it("EMPAQUE_G vale 80 g", () => {
    expect(EMPAQUE_G).toBe(80);
  });
  it("admite otro empaque", () => {
    expect(calcularPesoFacturable([bolsas(250)], 0)).toBe(250);
  });
  it("sin bolsas no hay nada que pesar", () => {
    expect(calcularPesoFacturable([])).toBe(0);
  });
});

describe("resolverZona", () => {
  it("zona 1: la clave es el municipio", () => {
    expect(resolverZona("Santander", "Bucaramanga", REGLAS)).toEqual({ zona: 1, clave: "bucaramanga" });
    expect(resolverZona("Santander", "Girón", REGLAS)).toEqual({ zona: 1, clave: "giron" });
  });
  it("el municipio gana al departamento", () => {
    expect(resolverZona("Santander", "Socorro", REGLAS)).toEqual({ zona: 2, clave: "zona2" });
    expect(resolverZona("Santander", "Bucaramanga", REGLAS).zona).toBe(1);
  });
  it("ignora tildes, mayúsculas y espacios: Giron = Girón", () => {
    expect(resolverZona("santander", "Giron", REGLAS)).toEqual({ zona: 1, clave: "giron" });
    expect(resolverZona("BOGOTA, D.C.", " bogota,  d.c. ", REGLAS).zona).toBe(3);
  });
  it("Florencia es zona 4 y el resto de Caquetá zona 5", () => {
    expect(resolverZona("Caquetá", "Florencia", REGLAS)).toEqual({ zona: 4, clave: "zona4" });
    expect(resolverZona("Caquetá", "Puerto Rico", REGLAS)).toEqual({ zona: 5, clave: "zona5" });
  });
  it("las capitales Quibdó y Arauca son zona 4; el resto de su departamento, 5", () => {
    expect(resolverZona("Chocó", "Quibdó", REGLAS).zona).toBe(4);
    expect(resolverZona("Chocó", "Nuquí", REGLAS).zona).toBe(5);
    expect(resolverZona("Arauca", "Arauca", REGLAS).zona).toBe(4);
    expect(resolverZona("Arauca", "Tame", REGLAS).zona).toBe(5);
  });
  it("el municipio se busca dentro de su departamento (Rionegro)", () => {
    expect(resolverZona("Antioquia", "Rionegro", REGLAS).zona).toBe(3);
    expect(resolverZona("Santander", "Rionegro", REGLAS).zona).toBe(2);
  });
  it("un municipio desconocido en un departamento sin regla cae en la zona 4", () => {
    expect(resolverZona("Tolima", "Chaparral", REGLAS)).toEqual({ zona: 4, clave: "zona4" });
    expect(resolverZona("", "", REGLAS).zona).toBe(4);
  });
  it("un municipio desconocido en un departamento con regla usa la del departamento", () => {
    expect(resolverZona("Amazonas", "Leticia", REGLAS).zona).toBe(5);
  });
});

describe("calcularEnvio", () => {
  it("1.000 g exactos caen en el primer escalón", () => {
    // 920 g de bolsas + 80 g de empaque
    const r = calcularEnvio([bolsas(920)], BUCARAMANGA, REGLAS);
    expect(r).toEqual({ tipo: "tarifa", zona: 1, clave: "bucaramanga", pesoFacturableG: 1000, escalonKg: 1, valorCop: 8800 });
  });
  it("1.001 g pasan al segundo escalón", () => {
    const r = calcularEnvio([bolsas(921)], BUCARAMANGA, REGLAS);
    expect(r).toMatchObject({ tipo: "tarifa", pesoFacturableG: 1001, escalonKg: 2, valorCop: 11600 });
  });
  it("2.000 g exactos siguen en el segundo escalón", () => {
    expect(calcularEnvio([bolsas(1920)], BUCARAMANGA, REGLAS)).toMatchObject({ pesoFacturableG: 2000, escalonKg: 2, valorCop: 11600 });
  });
  it("5.000 g exactos están en el tercer escalón", () => {
    expect(calcularEnvio([bolsas(4920)], BUCARAMANGA, REGLAS)).toMatchObject({ tipo: "tarifa", pesoFacturableG: 5000, escalonKg: 5, valorCop: 15400 });
  });
  it("5.001 g van por cotizar en cualquier zona", () => {
    expect(calcularEnvio([bolsas(4921)], BUCARAMANGA, REGLAS)).toEqual({ tipo: "por_cotizar", zona: 1, pesoFacturableG: 5001, motivo: "mas_de_5kg" });
    expect(calcularEnvio([bolsas(4921)], BOGOTA, REGLAS)).toMatchObject({ tipo: "por_cotizar", zona: 3, motivo: "mas_de_5kg" });
  });
  it("más de 5 kg en zona 5 se explica por el peso", () => {
    expect(calcularEnvio([bolsas(1000, 6)], { departamento: "Amazonas", municipio: "Leticia" }, REGLAS)).toMatchObject({ motivo: "mas_de_5kg", zona: 5 });
  });
  it("una bolsa suelta paga como 1 kg; 2 × 250 g también", () => {
    expect(calcularEnvio([bolsas(500)], BOGOTA, REGLAS)).toMatchObject({ escalonKg: 1, valorCop: 18000 });
    expect(calcularEnvio([bolsas(250, 2)], BOGOTA, REGLAS)).toMatchObject({ escalonKg: 1, valorCop: 18000 });
  });
  it("2 × 500 g superan 1 kg con el empaque y pagan el segundo escalón", () => {
    expect(calcularEnvio([bolsas(500, 2)], BOGOTA, REGLAS)).toMatchObject({ pesoFacturableG: 1080, escalonKg: 2, valorCop: 23000 });
  });
  it("zona 1 por municipio usa la tarifa de cada uno", () => {
    expect(calcularEnvio([bolsas(250)], { departamento: "Santander", municipio: "Giron" }, REGLAS)).toMatchObject({ zona: 1, clave: "giron", valorCop: 10500 });
  });
  it("resto de Santander es zona 2", () => {
    expect(calcularEnvio([bolsas(250)], { departamento: "Santander", municipio: "Socorro" }, REGLAS)).toMatchObject({ zona: 2, valorCop: 12100 });
  });
  it("Florencia paga zona 4; el resto de Caquetá va por cotizar (zona especial)", () => {
    expect(calcularEnvio([bolsas(250)], { departamento: "Caquetá", municipio: "Florencia" }, REGLAS)).toMatchObject({ tipo: "tarifa", zona: 4, valorCop: 22000 });
    expect(calcularEnvio([bolsas(250)], { departamento: "Caquetá", municipio: "Belén de los Andaquíes" }, REGLAS)).toEqual({ tipo: "por_cotizar", zona: 5, pesoFacturableG: 330, motivo: "zona_especial" });
  });
  it("Quibdó paga zona 4", () => {
    expect(calcularEnvio([bolsas(250)], { departamento: "Chocó", municipio: "Quibdó" }, REGLAS)).toMatchObject({ zona: 4 });
  });
  it("un municipio desconocido paga zona 4", () => {
    expect(calcularEnvio([bolsas(250)], { departamento: "Tolima", municipio: "Chaparral" }, REGLAS)).toMatchObject({ tipo: "tarifa", zona: 4, clave: "zona4", valorCop: 22000 });
  });
  it("falla con un mensaje claro si falta la tarifa", () => {
    expect(() => calcularEnvio([bolsas(250)], BOGOTA, { ...REGLAS, tarifas: REGLAS.tarifas.filter((t) => t.clave !== "zona3") })).toThrow(/zona3/);
  });
});

describe("totalConEnvio", () => {
  it("suma el envío cuando hay tarifa", () => {
    const envio = calcularEnvio([bolsas(500, 2)], BOGOTA, REGLAS);
    expect(totalConEnvio(96000, envio)).toEqual({ totalCop: 96000 + 23000, sinEnvio: false });
  });
  it("no lo suma cuando va por cotizar", () => {
    const envio = calcularEnvio([bolsas(250)], { departamento: "Amazonas", municipio: "Leticia" }, REGLAS);
    expect(totalConEnvio(96000, envio)).toEqual({ totalCop: 96000, sinEnvio: true });
  });
});

describe("nombreDestino", () => {
  it("quita lo que va después de la coma", () => {
    expect(nombreDestino("Bogotá, D.C.")).toBe("Bogotá");
    expect(nombreDestino("Girón")).toBe("Girón");
  });
});

describe("coberturaPorZona", () => {
  const cobertura = coberturaPorZona(REGLAS);
  it("agrupa por zona sin perder ninguna", () => {
    expect(cobertura.map((c) => c.zona)).toEqual([1, 2, 3, 4, 5]);
  });
  it("lista municipios y departamentos de cada zona", () => {
    expect(cobertura[0].municipios).toEqual(["Bucaramanga", "Girón"]);
    expect(cobertura[1].departamentos).toEqual(["Santander"]);
    expect(cobertura[2].municipios).toContain("Bogotá");
    expect(cobertura[4].departamentos).toEqual(["Caquetá", "Arauca", "Chocó", "Amazonas"]);
  });
  it("la zona 5 informa sus excepciones de zona 4", () => {
    expect(cobertura[4].excepciones).toEqual(["Florencia", "Arauca", "Quibdó"]);
    expect(cobertura[2].excepciones).toEqual([]);
  });
});
