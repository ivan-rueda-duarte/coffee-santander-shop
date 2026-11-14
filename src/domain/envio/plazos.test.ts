import { describe, expect, it } from "vitest";
import { REGLAS_ENVIO_PRUEBA } from "../pruebas/fixtures";
import { plazoDeZona, textoPlazoFicha, textoPlazoResumen } from "./plazos";
import type { ResultadoEnvio } from "./tipos";

const { plazos } = REGLAS_ENVIO_PRUEBA;
const tarifa = (zona: 1 | 2 | 3 | 4): ResultadoEnvio => ({ tipo: "tarifa", zona, clave: `zona${zona}`, pesoFacturableG: 580, escalonKg: 1, valorCop: 1 });
const DESDE = ", contado desde el día hábil siguiente a tu pago.";

describe("plazos en el resumen (D5 §6.3; LEG-143)", () => {
  it("con tarifa usa el estimado y el máximo de la zona: 3, 6, 6 y 10 días hábiles", () => {
    expect(textoPlazoResumen(plazos, tarifa(1))).toBe(`Entrega estimada: el mismo día o el siguiente día hábil. Plazo máximo: 3 días hábiles${DESDE}`);
    expect(textoPlazoResumen(plazos, tarifa(2))).toBe(`Entrega estimada: de 1 a 3 días hábiles. Plazo máximo: 6 días hábiles${DESDE}`);
    expect(textoPlazoResumen(plazos, tarifa(3))).toBe(`Entrega estimada: de 1 a 3 días hábiles. Plazo máximo: 6 días hábiles${DESDE}`);
    expect(textoPlazoResumen(plazos, tarifa(4))).toBe(`Entrega estimada: de 2 a 6 días hábiles. Plazo máximo: 10 días hábiles${DESDE}`);
  });
  it("por cotizar (zona 5 o más de 5 kg) usa la fila de la zona 5", () => {
    const esperado = `Entrega estimada: de 5 a 12 días hábiles. Plazo máximo: se informa al cotizar; máximo 30 días calendario${DESDE}`;
    expect(textoPlazoResumen(plazos, { tipo: "por_cotizar", zona: 5, pesoFacturableG: 580, motivo: "zona_especial" })).toBe(esperado);
    expect(textoPlazoResumen(plazos, { tipo: "por_cotizar", zona: 1, pesoFacturableG: 5580, motivo: "mas_de_5kg" })).toBe(esperado);
  });
  it("sin plazo para la zona no inventa nada", () => {
    expect(textoPlazoResumen([], tarifa(2))).toBeNull();
    expect(textoPlazoResumen([], { tipo: "por_cotizar", zona: 5, pesoFacturableG: 1, motivo: "zona_especial" })).toBeNull();
  });
});

describe("plazos en la ficha (D5 §6.2)", () => {
  it("escribe estimado y máximo de la zona", () => {
    expect(textoPlazoFicha(plazoDeZona(plazos, 2)!)).toBe("Entrega estimada: de 1 a 3 días hábiles. Plazo máximo: 6 días hábiles.");
    expect(plazoDeZona([], 1)).toBeUndefined();
  });
});
