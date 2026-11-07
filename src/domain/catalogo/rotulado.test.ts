import { describe, expect, it } from "vitest";
import { detalleNotificacionSanitaria, filaFabricante, lineaNotificacionSanitaria, ROTULO_NOTIFICACION_SANITARIA } from "./rotulado";

describe("rotulado sanitario de la ficha (microcopy §3)", () => {
  it("la fila se parte en rótulo (dt) y detalle (dd) sin repetir texto", () => {
    expect(ROTULO_NOTIFICACION_SANITARIA).toBe("Notificación sanitaria INVIMA");
    expect(detalleNotificacionSanitaria({ nsa: "NSA-003219-2017", titularNsa: null, fabricante: null })).toBe("N.° NSA-003219-2017");
    expect(detalleNotificacionSanitaria({ nsa: null, titularNsa: "T", fabricante: "F" })).toBeNull();
  });
  it("con todos los datos", () => {
    expect(lineaNotificacionSanitaria({ nsa: "NSA-003219-2017", titularNsa: "Tostadora S.A.S.", fabricante: "Tostadora S.A.S." })).toBe(
      "Notificación sanitaria INVIMA N.° NSA-003219-2017 · Titular: Tostadora S.A.S. · Fabricante: Tostadora S.A.S.",
    );
  });
  it("omite las partes sin dato, sin marcadores", () => {
    expect(lineaNotificacionSanitaria({ nsa: "NSA-003219-2017", titularNsa: null, fabricante: null })).toBe("Notificación sanitaria INVIMA N.° NSA-003219-2017");
    expect(lineaNotificacionSanitaria({ nsa: "NSA-1", titularNsa: null, fabricante: "F" })).toBe("Notificación sanitaria INVIMA N.° NSA-1 · Fabricante: F");
  });
  it("sin nsa no hay fila, aunque haya titular o fabricante", () => {
    expect(lineaNotificacionSanitaria({ nsa: null, titularNsa: "T", fabricante: "F" })).toBeNull();
  });
  it("la fila del fabricante lleva la expresión del rótulo y solo existe con ambos datos", () => {
    expect(filaFabricante({ fabricante: "Tostadora S.A.S.", fabricanteExpresion: "ENVASADO POR" })).toEqual(["ENVASADO POR", "Tostadora S.A.S."]);
    expect(filaFabricante({ fabricante: "Tostadora S.A.S.", fabricanteExpresion: null })).toBeNull();
    expect(filaFabricante({ fabricante: null, fabricanteExpresion: "FABRICADO POR" })).toBeNull();
  });
});
