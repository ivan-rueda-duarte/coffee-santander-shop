import { describe, expect, it } from "vitest";
import { formatearCOP, formatearMiles } from "./dinero";
import { normalizar, quitarTildes, slugify } from "./slug";

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
