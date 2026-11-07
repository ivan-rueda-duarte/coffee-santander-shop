import { describe, expect, it } from "vitest";
import { formatearCOP, formatearMiles } from "./dinero";
import { fechaEnLetras } from "./fecha";
import { normalizar, quitarTildes, slugify } from "./slug";

describe("fechaEnLetras", () => {
  it("escribe la fecha ISO en letras, sin cero inicial en el día", () => {
    expect(fechaEnLetras("2026-11-06")).toBe("6 de noviembre de 2026");
    expect(fechaEnLetras("2027-01-15")).toBe("15 de enero de 2027");
    expect(fechaEnLetras("2026-12-31")).toBe("31 de diciembre de 2026");
  });
  it("rechaza lo que no es año-mes-día", () => {
    for (const mala of ["06/11/2026", "2026-13-01", "2026-00-10", "2026-11-32", "hoy"]) expect(() => fechaEnLetras(mala)).toThrow(RangeError);
  });
});

describe("formatearCOP", () => {
  it("usa punto de miles y sin decimales", () => {
    expect(formatearCOP(25000)).toBe("$25.000");
    expect(formatearCOP(1250000)).toBe("$1.250.000");
    expect(formatearCOP(950)).toBe("$950");
    expect(formatearCOP(0)).toBe("$0");
  });
  it("redondea y admite negativos", () => {
    expect(formatearCOP(24999.6)).toBe("$25.000");
    expect(formatearCOP(-1500)).toBe("-$1.500");
  });
  it("rechaza lo que no es un número", () => {
    expect(() => formatearCOP(Number.NaN)).toThrow(RangeError);
    expect(() => formatearCOP(Infinity)).toThrow(RangeError);
  });
  it("formatearMiles no lleva símbolo", () => {
    expect(formatearMiles(1800)).toBe("1.800");
  });
});

describe("texto", () => {
  it("quita tildes", () => {
    expect(quitarTildes("Güepsa Guanentá Peñón")).toBe("Guepsa Guanenta Penon");
  });
  it("normaliza para comparar", () => {
    expect(normalizar("  Frutos   ROJOS ")).toBe("frutos rojos");
    expect(normalizar("Jazmín")).toBe("jazmin");
  });
  it("crea slugs", () => {
    expect(slugify("Guanentá")).toBe("guanenta");
    expect(slugify("Café San Gil")).toBe("cafe-san-gil");
    expect(slugify("Castillo®")).toBe("castillo");
    expect(slugify("  --El Carmen de Chucurí-- ")).toBe("el-carmen-de-chucuri");
  });
});
