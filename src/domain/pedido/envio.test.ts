import { describe, expect, it } from "vitest";
import { OPCION_OTRA_COMUNA } from "../envio/envio-gratis";
import { PROMOCION_PRUEBA } from "../pruebas/fixtures";
import { crearEsquemaEnvio, DOCUMENTO_OBLIGATORIO, errorCodigoPostal, errorDocumento, esquemaConsentimientos, formatearCelular, normalizarCelular, normalizarDocumento, validar } from "./envio";

const PAGOS = ["Efectivo contraentrega", "Transferencia Bre-B"] as const;
const CODIGOS = { Santander: "68", "Bogotá, D.C.": "11", Antioquia: "05" };
const esquema = crearEsquemaEnvio(PAGOS, CODIGOS);
const valido = {
  nombre: "  Ana Rueda ",
  celular: "+57 300-123-4567",
  tipoDocumento: "",
  numeroDocumento: "",
  correo: "",
  departamento: "Santander",
  municipio: "Bucaramanga",
  codigoPostal: "",
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
        correo: undefined,
        departamento: "Santander",
        municipio: "Bucaramanga",
        codigoPostal: undefined,
        direccion: "Calle 45 # 12-30",
        barrio: undefined,
        indicaciones: undefined,
        formaPago: "Transferencia Bre-B",
        tipoDocumento: undefined,
        numeroDocumento: undefined,
      },
    });
  });
  it("acepta documento, código postal, correo y campos opcionales válidos", () => {
    const r = validar(esquema, { ...valido, tipoDocumento: "CC", numeroDocumento: "1.098.765.432", codigoPostal: "680001", correo: "ana@correo.co", barrio: "Cabecera", indicaciones: "Portería" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.datos).toMatchObject({ tipoDocumento: "CC", numeroDocumento: "1098765432", codigoPostal: "680001", correo: "ana@correo.co", barrio: "Cabecera", indicaciones: "Portería" });
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
  it("rechaza documento y correo mal escritos", () => {
    const r = validar(esquema, { ...valido, tipoDocumento: "CC", numeroDocumento: "12", correo: "no-es-correo" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errores.numeroDocumento).toBe("Revisa el número: parece incompleto.");
      expect(r.errores.correo).toMatch(/correo/);
    }
  });
  it("valida documento y código postal aunque otros campos tengan error", () => {
    const r = validar(esquema, { ...valido, nombre: "", numeroDocumento: "123", codigoPostal: "110111" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errores).sort()).toEqual(["codigoPostal", "nombre", "tipoDocumento"]);
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

describe("documento de identidad", () => {
  const conDocumento = (tipoDocumento: string, numeroDocumento: string) => validar(esquema, { ...valido, tipoDocumento, numeroDocumento });
  const errorDe = (tipo: string, numero: string) => {
    const r = conDocumento(tipo, numero);
    return r.ok ? null : r.errores;
  };

  it("hoy es opcional", () => {
    expect(DOCUMENTO_OBLIGATORIO).toBe(false);
  });
  it("normaliza espacios, puntos, guiones y minúsculas", () => {
    expect(normalizarDocumento("1.098.765.432")).toBe("1098765432");
    expect(normalizarDocumento(" ab-12 34.c ")).toBe("AB1234C");
  });
  it("sin número se ignora el tipo y no hay error", () => {
    const r = conDocumento("CE", "");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.datos).toMatchObject({ tipoDocumento: undefined, numeroDocumento: undefined });
    expect(conDocumento("", "   ").ok).toBe(true);
  });
  it("con número exige el tipo", () => {
    expect(errorDe("", "1098765432")).toEqual({ tipoDocumento: "Elige el tipo de documento." });
    expect(errorDe("NIT", "900123456")).toEqual({ tipoDocumento: "Elige el tipo de documento." });
  });
  it("CC: «1.098.765.432» queda como 1098765432", () => {
    const r = conDocumento("CC", "1.098.765.432");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.datos).toMatchObject({ tipoDocumento: "CC", numeroDocumento: "1098765432" });
  });
  it("CC: acepta de 3 a 10 dígitos", () => {
    expect(conDocumento("CC", "123").ok).toBe(true);
    expect(conDocumento("CC", "91 234 567").ok).toBe(true);
  });
  it("CC: rechaza letras, más de 10 dígitos y menos de 3", () => {
    const soloNumeros = "La cédula de ciudadanía lleva solo números, hasta 10 dígitos.";
    expect(errorDe("CC", "10987A5432")).toEqual({ numeroDocumento: soloNumeros });
    expect(errorDe("CC", "12345678901")).toEqual({ numeroDocumento: soloNumeros });
    expect(errorDe("CC", "12")).toEqual({ numeroDocumento: "Revisa el número: parece incompleto." });
  });
  it.each(["CE", "PPT", "PAS"])("%s: acepta letras y números de 3 a 20 caracteres", (tipo) => {
    const r = conDocumento(tipo, "ab-123 456");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.datos).toMatchObject({ tipoDocumento: tipo, numeroDocumento: "AB123456" });
    expect(conDocumento(tipo, "A".repeat(20)).ok).toBe(true);
  });
  it.each(["CE", "PPT", "PAS"])("%s: rechaza símbolos y largos fuera de 3 a 20", (tipo) => {
    expect(errorDe(tipo, "AB#123")).toEqual({ numeroDocumento: "Usa solo letras y números, sin espacios ni símbolos." });
    expect(errorDe(tipo, "ÑA123")).toEqual({ numeroDocumento: "Usa solo letras y números, sin espacios ni símbolos." });
    expect(errorDe(tipo, "A1")).toEqual({ numeroDocumento: "Revisa el número: debe tener entre 3 y 20 caracteres." });
    expect(errorDe(tipo, "A".repeat(21))).toEqual({ numeroDocumento: "Revisa el número: debe tener entre 3 y 20 caracteres." });
  });
  it("errorDocumento por tipo", () => {
    expect(errorDocumento("CC", "1098765432")).toBeNull();
    expect(errorDocumento("PAS", "AB123456")).toBeNull();
  });
  it("en modo obligatorio exige tipo y número", () => {
    const obligatorio = crearEsquemaEnvio(PAGOS, CODIGOS, { documentoObligatorio: true });
    const r = validar(obligatorio, valido);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores).toEqual({ tipoDocumento: "Elige el tipo de documento.", numeroDocumento: "Escribe el número de documento." });
    const r2 = validar(obligatorio, { ...valido, tipoDocumento: "CC", numeroDocumento: "1098765432" });
    expect(r2.ok).toBe(true);
  });
});

describe("código postal", () => {
  const conCodigo = (codigoPostal: string, departamento = "Santander", municipio = "Bucaramanga") => validar(esquema, { ...valido, departamento, municipio, codigoPostal });

  it("es opcional", () => {
    expect(conCodigo("").ok).toBe(true);
  });
  it("Santander exige el prefijo 68", () => {
    const r = conCodigo("680001");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.datos.codigoPostal).toBe("680001");
    const mal = conCodigo("110111");
    expect(mal.ok).toBe(false);
    if (!mal.ok) expect(mal.errores).toEqual({ codigoPostal: "Este código no corresponde a Santander. Revísalo en el visor de 4-72." });
  });
  it("otros departamentos usan su código DIVIPOLA (Bogotá 11, Antioquia 05)", () => {
    expect(conCodigo("110111", "Bogotá, D.C.", "Bogotá, D.C.").ok).toBe(true);
    expect(conCodigo("050001", "Antioquia", "Medellín").ok).toBe(true);
    expect(conCodigo("680001", "Antioquia", "Medellín").ok).toBe(false);
  });
  it("rechaza lo que no tenga 6 números", () => {
    for (const c of ["68000", "6800012", "68000A"]) {
      const r = conCodigo(c);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errores).toEqual({ codigoPostal: "El código postal tiene 6 números." });
    }
  });
  it("quita espacios", () => {
    const r = conCodigo(" 680 001 ");
    expect(r.ok && r.datos.codigoPostal).toBe("680001");
  });
  it("sin código del departamento solo revisa el formato", () => {
    expect(errorCodigoPostal("990001", "Otro", undefined)).toBeNull();
    expect(errorCodigoPostal("99000", "Otro", undefined)).toBe("El código postal tiene 6 números.");
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

describe("comuna (envío gratis, microcopy §8.2)", () => {
  const conPromo = crearEsquemaEnvio(PAGOS, CODIGOS, { envioGratis: PROMOCION_PRUEBA });
  const comunaDe = (entrada: Record<string, unknown>, e = conPromo) => {
    const r = validar(e, { ...valido, ...entrada });
    if (!r.ok) throw new Error(JSON.stringify(r.errores));
    return r.datos.comuna;
  };
  it("conserva una comuna de la lista con Bucaramanga, con el nombre del dato", () => {
    expect(comunaDe({ departamento: "Santander", municipio: "Bucaramanga", comuna: "la concordia" })).toBe("La Concordia");
  });
  it("«Otra comuna o no la sé», vacío o un valor fuera de la lista quedan sin comuna y no son error", () => {
    for (const comuna of [OPCION_OTRA_COMUNA, "", "Provenza", undefined]) expect(comunaDe({ departamento: "Santander", municipio: "Bucaramanga", comuna })).toBeUndefined();
  });
  it("otro municipio o la promoción apagada descartan la comuna", () => {
    expect(comunaDe({ departamento: "Santander", municipio: "Floridablanca", comuna: "Centro" })).toBeUndefined();
    expect(comunaDe({ departamento: "Santander", municipio: "Bucaramanga", comuna: "Centro" }, esquema)).toBeUndefined();
  });
});
