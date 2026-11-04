import { describe, expect, it } from "vitest";
import { ID_V1_A_SLUG } from "../pruebas/fixtures";
import { CLAVE_CARRITO_V1, CLAVE_CARRITO_V2, migrarCarritoV1, parsearCarrito, serializarCarrito } from "./persistencia";

describe("carrito v2", () => {
  it("usa claves distintas para v1 y v2", () => {
    expect(CLAVE_CARRITO_V1).toBe("desantander.carrito.v1");
    expect(CLAVE_CARRITO_V2).toBe("desantander.carrito.v2");
  });
  it("ida y vuelta", () => {
    const c = {
      lineas: [{ cafeSlug: "cafe-oiba", gramos: 500, molienda: "molido" as const, cantidad: 3 }],
      formaPago: "Transferencia Bre-B",
      municipio: "Cali",
    };
    expect(parsearCarrito(serializarCarrito(c))).toEqual({ version: 2, ...c });
  });
  it("nunca lanza: texto roto o vacío da un carrito vacío", () => {
    expect(parsearCarrito(null).lineas).toEqual([]);
    expect(parsearCarrito("{no es json").lineas).toEqual([]);
    expect(parsearCarrito("42").lineas).toEqual([]);
    expect(parsearCarrito('{"lineas": 5}').lineas).toEqual([]);
  });
  it("descarta solo las líneas dañadas y recorta al máximo", () => {
    const crudo = JSON.stringify({
      version: 2,
      lineas: [
        { cafeSlug: "a", gramos: 250, molienda: "grano", cantidad: 99 },
        { cafeSlug: "b", gramos: 250, molienda: "espresso", cantidad: 1 },
        { cafeSlug: "c", gramos: -1, molienda: "grano", cantidad: 1 },
        "basura",
      ],
      formaPago: 12,
    });
    const c = parsearCarrito(crudo);
    expect(c.lineas).toEqual([{ cafeSlug: "a", gramos: 250, molienda: "grano", cantidad: 20 }]);
    expect(c.formaPago).toBeUndefined();
  });
});

describe("migrarCarritoV1", () => {
  const v1 = JSON.stringify({
    lines: [
      { cafeId: 2, gramos: 500, molienda: "Grano entero", qty: 2 },
      { cafeId: 5, gramos: 250, molienda: "Molido", qty: 1 },
    ],
    ciudad: "Bogotá",
    pago: "Efectivo contraentrega",
    sent: true,
  });

  it("convierte ids a slugs y molienda a enum", () => {
    expect(migrarCarritoV1(v1, ID_V1_A_SLUG)).toEqual({
      version: 2,
      lineas: [
        { cafeSlug: "cafe-barichara", gramos: 500, molienda: "grano", cantidad: 2 },
        { cafeSlug: "cafe-oiba", gramos: 250, molienda: "molido", cantidad: 1 },
      ],
      formaPago: "Efectivo contraentrega",
      municipio: "Bogotá",
    });
  });
  it("descarta ids o moliendas desconocidos y recorta la cantidad", () => {
    const crudo = JSON.stringify({
      lines: [
        { cafeId: 99, gramos: 250, molienda: "Molido", qty: 1 },
        { cafeId: 1, gramos: 250, molienda: "Espresso", qty: 1 },
        { cafeId: 1, gramos: 250, molienda: "Molido", qty: 50 },
        { cafeId: 1, gramos: "250", molienda: "Molido", qty: 1 },
        { cafeId: 1, gramos: 0, molienda: "Molido", qty: 1 },
        null,
      ],
    });
    const m = migrarCarritoV1(crudo, ID_V1_A_SLUG);
    expect(m?.lineas).toEqual([{ cafeSlug: "cafe-altura-de-socorro", gramos: 250, molienda: "molido", cantidad: 20 }]);
    expect(m?.formaPago).toBeUndefined();
    expect(m?.municipio).toBeUndefined();
  });
  it("devuelve null si no hay nada que migrar", () => {
    expect(migrarCarritoV1(null, ID_V1_A_SLUG)).toBeNull();
    expect(migrarCarritoV1("roto", ID_V1_A_SLUG)).toBeNull();
    expect(migrarCarritoV1("[]", ID_V1_A_SLUG)).toBeNull();
    expect(migrarCarritoV1('{"lines": []}', ID_V1_A_SLUG)).toBeNull();
    expect(migrarCarritoV1('{"lines": [{"cafeId": 99, "gramos": 250, "molienda": "Molido", "qty": 1}]}', ID_V1_A_SLUG)).toBeNull();
    expect(migrarCarritoV1('{"x": 1}', ID_V1_A_SLUG)).toBeNull();
  });
});
