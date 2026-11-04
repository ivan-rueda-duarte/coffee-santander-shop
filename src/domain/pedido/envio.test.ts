import { describe, expect, it } from "vitest";
import { crearEsquemaEnvio, esquemaConsentimientos, formatearCelular, normalizarCelular, validar } from "./envio";

const PAGOS = ["Efectivo contraentrega", "Transferencia Bre-B"] as const;
const esquema = crearEsquemaEnvio(PAGOS);
const valido = {
  nombre: "  Ana Rueda ",
  celular: "+57 300-123-4567",
  cedula: "",
  correo: "",
  departamento: "Santander",
  municipio: "Bucaramanga",
  direccion: "Calle 45 # 12-30",
  barrio: "",
  indicaciones: "",
  formaPago: "Transferencia Bre-B",
};

describe("celular", () => {
  it("normaliza formatos comunes", () => {
    expect(normalizarCelular("300 123 4567")).toBe("3001234567");
    expect(normalizarCelular("+57 (300) 1234567")).toBe("3001234567");
    expect(normalizarCelular("573001234567")).toBe("3001234567");
  });
  it("lo muestra con espacios", () => {
    expect(formatearCelular("3001234567")).toBe("300 123 4567");
    expect(formatearCelular("123")).toBe("123");
  });
});

describe("esquema de envío", () => {
  it("acepta un pedido completo, recorta espacios y deja vacíos como undefined", () => {
    const r = validar(esquema, valido);
    expect(r).toEqual({
      ok: true,
      datos: {
        nombre: "Ana Rueda",
        celular: "3001234567",
        cedula: undefined,
        correo: undefined,
        departamento: "Santander",
        municipio: "Bucaramanga",
        direccion: "Calle 45 # 12-30",
        barrio: undefined,
        indicaciones: undefined,
        formaPago: "Transferencia Bre-B",
      },
    });
  });
  it("acepta cédula, correo y campos opcionales válidos", () => {
    const r = validar(esquema, { ...valido, cedula: "1.098.765.432".slice(0, 9), correo: "ana@correo.co", barrio: "Cabecera", indicaciones: "Portería" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.datos).toMatchObject({ cedula: "1098765", correo: "ana@correo.co", barrio: "Cabecera", indicaciones: "Portería" });
  });
  it("informa un mensaje por campo faltante", () => {
    const r = validar(esquema, { ...valido, nombre: "", direccion: "x", celular: "12345", formaPago: "Cheque" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errores).sort()).toEqual(["celular", "direccion", "formaPago", "nombre"]);
      expect(r.errores.celular).toMatch(/celular colombiano/);
      expect(r.errores.formaPago).toBe("Elige una forma de pago.");
    }
  });
  it("rechaza cédula y correo mal escritos", () => {
    const r = validar(esquema, { ...valido, cedula: "12", correo: "no-es-correo" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errores.cedula).toMatch(/cédula/);
      expect(r.errores.correo).toMatch(/correo/);
    }
  });
  it("limita las indicaciones", () => {
    const r = validar(esquema, { ...valido, indicaciones: "x".repeat(301) });
    expect(r.ok).toBe(false);
  });
  it("campos ausentes dan error", () => {
    const r = validar(esquema, {});
    expect(r.ok).toBe(false);
  });
  it("un error sin ruta cae en 'formulario'", () => {
    const r = validar(esquema, null);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errores)).toEqual(["formulario"]);
  });
});

describe("consentimientos", () => {
  it("exigen ambas casillas marcadas", () => {
    expect(validar(esquemaConsentimientos, { autorizacionDatos: true, aceptaTerminos: true }).ok).toBe(true);
    const r = validar(esquemaConsentimientos, { autorizacionDatos: false, aceptaTerminos: false });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errores).sort()).toEqual(["aceptaTerminos", "autorizacionDatos"]);
  });
});
