import { describe, expect, it } from "vitest";
import { VENDEDOR_PRUEBA } from "../pruebas/fixtures";
import { leyendaIva, leyendaIvaPie, leyendaIvaTarifas, notaIvaSubtotal } from "./iva";
import { lineaVendedor, partesVendedor } from "./tienda";

describe("vendedor en el resumen (microcopy §5.4)", () => {
  it("arma la línea «Te vende …» con cada dato que existe", () => {
    expect(lineaVendedor(VENDEDOR_PRUEBA, "+57 300 112 9874")).toBe(
      "Te vende De Santander SAS · NIT 902.121.184-8 · Bucaramanga, Santander · Calle 37 n.° 23-77, apartamento 702, Bucaramanga, Santander · desantander.tienda@gmail.com · WhatsApp +57 300 112 9874.",
    );
  });
  it("omite los datos que faltan y no incluye representante ni matrícula (LEG-085)", () => {
    const partes = partesVendedor({ ...VENDEDOR_PRUEBA, nit: null, domicilio: null, direccionNotificacion: null }, null);
    expect(partes).toEqual(["De Santander SAS", "desantander.tienda@gmail.com"]);
    expect(partes.join(" ")).not.toMatch(/740574|Rueda/);
  });
  it("sin razón social no hay línea", () => {
    expect(lineaVendedor({ ...VENDEDOR_PRUEBA, razonSocial: null }, "+57 300 112 9874")).toBeNull();
    expect(partesVendedor({ ...VENDEDOR_PRUEBA, razonSocial: null }, null)).toEqual([]);
  });
});

describe("leyendas de IVA (microcopy §1.4)", () => {
  it("con tarifa publica el porcentaje y el artículo", () => {
    expect(leyendaIva(5)).toBe("Precios con IVA del 5 % incluido (art. 468-1 del Estatuto Tributario).");
    expect(notaIvaSubtotal(5)).toBe(" (IVA del 5 % incluido)");
    expect(leyendaIvaPie(5)).toBe("Precios en pesos colombianos, con IVA del 5 % incluido.");
    expect(leyendaIvaTarifas(5)).toBe("Tarifas en pesos colombianos, con IVA del 5 % incluido. Más de 5 kg, en cualquier zona, se cotiza aparte. Nunca cobramos primero y ajustamos después.");
  });
  it("sin tarifa usa la alternativa prudente (LEG-082) y nunca dice «sin IVA»", () => {
    const textos = [leyendaIva(null), notaIvaSubtotal(null), leyendaIvaPie(null), leyendaIvaTarifas(null)];
    expect(textos[0]).toBe("Precios en pesos colombianos con todos los impuestos incluidos.");
    expect(textos[1]).toBe("");
    expect(textos[2]).toBe("Precios en pesos colombianos con todos los impuestos incluidos.");
    expect(textos[3]).toContain("con todos los impuestos incluidos");
    for (const t of textos) expect(t).not.toMatch(/sin IVA/i);
  });
});
