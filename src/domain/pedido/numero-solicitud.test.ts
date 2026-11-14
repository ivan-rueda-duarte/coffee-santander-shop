import { describe, expect, it } from "vitest";
import { ALFABETO_SUFIJO, esNumeroSolicitud, generarNumeroSolicitud, LARGO_SUFIJO } from "./numero-solicitud";

// 17 de noviembre de 2026, 14:32 en Bogotá (UTC−5) = 19:32 UTC.
const AHORA = new Date("2026-11-17T19:32:10Z");

describe("número de solicitud DS (P39 = a, LEG-150)", () => {
  it("usa fecha y hora de Colombia y cuatro símbolos al azar", () => {
    expect(generarNumeroSolicitud(AHORA, new Uint8Array([0, 1, 30, 31]))).toBe("DS-261117-1432-AB89");
    expect(ALFABETO_SUFIJO).toHaveLength(32);
    expect(ALFABETO_SUFIJO).not.toMatch(/[0O1I]/);
  });
  it("la fecha es la de Colombia aunque en UTC ya sea otro día", () => {
    expect(generarNumeroSolicitud(new Date("2026-11-18T02:05:00Z"), new Uint8Array(4))).toBe("DS-261117-2105-AAAA");
  });
  it("cada byte da un símbolo sin sesgo (módulo 32) y el formato es válido", () => {
    const n = generarNumeroSolicitud(AHORA, new Uint8Array([32, 64, 255, 128]));
    expect(n).toBe("DS-261117-1432-AA9A");
    expect(esNumeroSolicitud(n)).toBe(true);
    expect(esNumeroSolicitud("DS-1")).toBe(false);
  });
  it("con bytes de crypto.getRandomValues dos números del mismo minuto casi nunca coinciden", () => {
    const vistos = new Set(Array.from({ length: 200 }, () => generarNumeroSolicitud(AHORA, crypto.getRandomValues(new Uint8Array(LARGO_SUFIJO)))));
    expect(vistos.size).toBeGreaterThan(190);
    for (const v of vistos) expect(esNumeroSolicitud(v)).toBe(true);
  });
  it("no contiene datos personales: solo depende de la hora y del azar", () => {
    expect(generarNumeroSolicitud(AHORA, new Uint8Array([5, 6, 7, 8]))).toMatch(/^DS-261117-1432-[A-Z2-9]{4}$/);
  });
  it("exige al menos cuatro bytes", () => {
    expect(() => generarNumeroSolicitud(AHORA, new Uint8Array(3))).toThrow(RangeError);
  });
});
