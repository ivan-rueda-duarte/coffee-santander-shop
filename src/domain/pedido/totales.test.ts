import { describe, expect, it } from "vitest";
import { calcularTotales, etiquetaBolsas } from "./totales";

const precios: Record<string, number> = { "a|250": 25000, "a|500": 50000 };
const buscar = (slug: string, gramos: number) => precios[`${slug}|${gramos}`];

describe("calcularTotales", () => {
  it("suma bolsas y subtotal", () => {
    const t = calcularTotales(
      [
        { cafeSlug: "a", gramos: 250, molienda: "grano", cantidad: 2 },
        { cafeSlug: "a", gramos: 500, molienda: "molido", cantidad: 1 },
      ],
      buscar,
    );
    expect(t.bolsas).toBe(3);
    expect(t.subtotalCop).toBe(100000);
    expect(t.lineas.map((l) => [l.precioUnitarioCop, l.totalCop])).toEqual([
      [25000, 50000],
      [50000, 50000],
    ]);
  });
  it("separa las líneas sin precio y no las suma", () => {
    const t = calcularTotales(
      [
        { cafeSlug: "a", gramos: 250, molienda: "grano", cantidad: 1 },
        { cafeSlug: "retirado", gramos: 250, molienda: "grano", cantidad: 4 },
      ],
      buscar,
    );
    expect(t.bolsas).toBe(1);
    expect(t.subtotalCop).toBe(25000);
    expect(t.sinPrecio).toHaveLength(1);
  });
  it("un carrito vacío da cero", () => {
    expect(calcularTotales([], buscar)).toEqual({ bolsas: 0, subtotalCop: 0, lineas: [], sinPrecio: [] });
  });
  it("etiqueta de bolsas", () => {
    expect(etiquetaBolsas(1)).toBe("1 bolsa");
    expect(etiquetaBolsas(3)).toBe("3 bolsas");
  });
});
