import { describe, expect, it } from "vitest";
import { REGLAS_ENVIO_PRUEBA } from "../pruebas/fixtures";
import { plazoDeZona, textoPlazoPagina, textoPlazoResumen } from "./plazos";
import type { ResultadoEnvio } from "./tipos";

const { plazos } = REGLAS_ENVIO_PRUEBA;
const tarifa = (zona: 1 | 2 | 3 | 4): ResultadoEnvio => ({ tipo: "tarifa", zona, clave: `zona${zona}`, pesoFacturableG: 580, escalonKg: 1, valorCop: 1 });

describe("plazos en el resumen (microcopy §5.6)", () => {
  it("con tarifa usa el estimado y el máximo de la zona", () => {
    expect(textoPlazoResumen(plazos, tarifa(1))).toBe("Entrega estimada: Mismo día o siguiente día hábil. Plazo máximo: 1 día hábil.");
    expect(textoPlazoResumen(plazos, tarifa(3))).toBe("Entrega estimada: 1 a 3 días hábiles. Plazo máximo: 3 días hábiles.");
    expect(textoPlazoResumen(plazos, tarifa(4))).toBe("Entrega estimada: 2 a 6 días hábiles. Plazo máximo: 6 días hábiles.");
  });
  it("por cotizar (zona 5 o más de 5 kg) usa el estimado de la zona 5 y el máximo al cotizar", () => {
    const esperado = "Entrega estimada: 5 a 12 días hábiles, en la oficina de la transportadora. Plazo máximo: se informa al cotizar; nunca más de 30 días calendario.";
    expect(textoPlazoResumen(plazos, { tipo: "por_cotizar", zona: 5, pesoFacturableG: 580, motivo: "zona_especial" })).toBe(esperado);
    expect(textoPlazoResumen(plazos, { tipo: "por_cotizar", zona: 1, pesoFacturableG: 5580, motivo: "mas_de_5kg" })).toBe(esperado);
  });
  it("sin plazo para la zona no inventa nada", () => {
    expect(textoPlazoResumen([], tarifa(2))).toBeNull();
    expect(textoPlazoResumen([], { tipo: "por_cotizar", zona: 5, pesoFacturableG: 1, motivo: "zona_especial" })).toBeNull();
    expect(textoPlazoResumen([{ zona: 2, estimado: "x", maximo: null }], tarifa(2))).toBeNull();
  });
});

describe("plazos en /envios/ (microcopy §5.8)", () => {
  it("escribe estimado y máximo, y en la zona 5 el máximo al cotizar", () => {
    expect(textoPlazoPagina(plazoDeZona(plazos, 2)!)).toBe("Estimado: 1 a 3 días hábiles. Máximo: 3 días hábiles.");
    expect(textoPlazoPagina(plazoDeZona(plazos, 5)!)).toBe("Estimado: 5 a 12 días hábiles, en la oficina de la transportadora. Máximo: se informa al cotizar; nunca más de 30 días calendario.");
    expect(plazoDeZona([], 1)).toBeUndefined();
  });
});
