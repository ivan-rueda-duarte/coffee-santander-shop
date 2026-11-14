import { describe, expect, it } from "vitest";
import { VENDEDOR_PRUEBA } from "../pruebas/fixtures";
import { leyendaIva, leyendaIvaPie, leyendaIvaTarifas, notaIvaSubtotal } from "./iva";
import { lineaVendedor, partesVendedor } from "./tienda";

describe("vendedor en el resumen (D5 §6.3)", () => {
  it("arma la línea «Te vende De Santander SAS · NIT …» sin domicilio, correo ni WhatsApp", () => {
    expect(lineaVendedor(VENDEDOR_PRUEBA)).toBe("Te vende De Santander SAS · NIT 902.121.184-8");
  });
  it("omite el NIT si falta y no incluye representante ni matrícula (LEG-085)", () => {
    const partes = partesVendedor({ ...VENDEDOR_PRUEBA, nit: null });
    expect(partes).toEqual(["De Santander SAS"]);
    expect(partes.join(" ")).not.toMatch(/740574|Rueda/);
  });
  it("sin razón social no hay línea", () => {
    expect(lineaVendedor({ ...VENDEDOR_PRUEBA, razonSocial: null })).toBeNull();
    expect(partesVendedor({ ...VENDEDOR_PRUEBA, razonSocial: null })).toEqual([]);
  });
});

describe("leyendas de IVA (D5 §6.2; microcopy §1.4)", () => {
  it("con tarifa publica el porcentaje y el artículo", () => {
    expect(leyendaIva(5)).toBe("Precio con IVA del 5 % incluido.");
    expect(notaIvaSubtotal(5)).toBe(" (IVA del 5 % incluido)");
    expect(leyendaIvaPie(5)).toBe("Precios en pesos colombianos, con IVA del 5 % incluido.");
    expect(leyendaIvaTarifas(5)).toBe("Tarifas en pesos colombianos, con IVA del 5 % incluido. Más de 5 kg, en cualquier zona, se cotiza aparte. Nunca cobramos primero y ajustamos después.");
    // Con el envío gratis por comunas vigente (microcopy §8.5).
    expect(leyendaIvaTarifas(5, " Salvo en las siete comunas de Bucaramanga con envío gratis.")).toBe(
      "Tarifas en pesos colombianos, con IVA del 5 % incluido. Más de 5 kg, en cualquier zona, se cotiza aparte. Salvo en las siete comunas de Bucaramanga con envío gratis. Nunca cobramos primero y ajustamos después.",
    );
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
