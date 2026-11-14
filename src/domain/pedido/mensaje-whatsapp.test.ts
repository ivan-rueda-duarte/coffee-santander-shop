import { describe, expect, it } from "vitest";
import { construirEnlace, construirMensaje, formatearWhatsapp, lineaConstancia, lineaPromociones, LIMITE_MENSAJE, type PedidoMensaje } from "./mensaje-whatsapp";
import type { DatosEnvio } from "./envio";
import type { ResultadoEnvio } from "../envio/tipos";
import { calcularEnvio } from "../envio/envio";
import { REGLAS_CON_PROMOCION } from "../pruebas/fixtures";

// Plantilla de D5 §6.4 del paquete del abogado v1.0 (LEG-150), con las líneas del envío gratis (dictamen 2026-11-14, 2 bis).

const envio: DatosEnvio = {
  nombre: "Ana Rueda",
  celular: "3001234567",
  tipoDocumento: undefined,
  numeroDocumento: undefined,
  correo: undefined,
  departamento: "Santander",
  municipio: "Bucaramanga",
  codigoPostal: undefined,
  direccion: "Calle 45 # 12-30",
  barrio: "Cabecera",
  comuna: undefined,
  indicaciones: "Dejar en portería",
};

const pedido: PedidoMensaje = {
  nombreTienda: "De Santander",
  numeroSolicitud: "DS-261117-1432-K7QM",
  lineas: [
    { nombreCafe: "Café Barichara", provincia: "Guanentá", molienda: "grano", gramos: 500, cantidad: 2, totalCop: 100000 },
    { nombreCafe: "Café Oiba", provincia: "Comunera", molienda: "molido", gramos: 250, cantidad: 1, totalCop: 25000 },
  ],
  subtotalCop: 125000,
  costoEnvio: { tipo: "tarifa", zona: 1, clave: "bucaramanga", pesoFacturableG: 1330, escalonKg: 2, valorCop: 11600 },
  envio,
  ivaTarifa: 5,
  legal: { versionTerminos: "1.0", versionPoliticaDatos: "1.0", fechaPoliticaDatos: "2026-11-17" },
  promociones: { whatsapp: false, correo: false },
};
const CONSTANCIA = "Acepto los Términos v1.0 y autorizo el tratamiento de mis datos según la Política v1.0 del 17 de noviembre de 2026.";
const porCotizar = (motivo: "zona_especial" | "mas_de_5kg"): ResultadoEnvio => ({ tipo: "por_cotizar", zona: 5, pesoFacturableG: 1330, motivo });

const ENCABEZADO = `¡Hola, De Santander! Envío mi solicitud de compra N.° DS-261117-1432-K7QM para que me confirmen el total con el envío.

• Café Barichara (Guanentá) — Grano — 500 g × 2 = $100.000
• Café Oiba (Comunera) — Molido — 250 g × 1 = $25.000
`;

describe("construirMensaje (D5 §6.4)", () => {
  it("sigue la plantilla con tarifa", () => {
    const { texto, indicacionesResumidas } = construirMensaje(pedido);
    expect(indicacionesResumidas).toBe(false);
    expect(texto).toBe(`${ENCABEZADO}
Subtotal de productos: $125.000 (IVA del 5 % incluido)
Envío: zona 1, $11.600 (IVA incluido)
Total: $136.600

Envío a:
Nombre: Ana Rueda
Celular: 300 123 4567
Departamento y municipio: Santander, Bucaramanga
Dirección: Calle 45 # 12-30 · Barrio: Cabecera
Indicaciones: Dejar en portería
Pago: transferencia o Bre-B

${CONSTANCIA}`);
  });
  it("por cotizar no suma envío, rotula el total y cierra con «Quedo atento…» después de la constancia", () => {
    const { texto } = construirMensaje({ ...pedido, costoEnvio: porCotizar("zona_especial"), envio: { ...envio, departamento: "Amazonas", municipio: "Leticia" } });
    expect(texto).toBe(`${ENCABEZADO}
Subtotal de productos: $125.000 (IVA del 5 % incluido)
Envío: POR COTIZAR (zona 5 o más de 5 kg)
Total sin envío: $125.000

Envío a:
Nombre: Ana Rueda
Celular: 300 123 4567
Departamento y municipio: Amazonas, Leticia
Dirección: Calle 45 # 12-30 · Barrio: Cabecera
Indicaciones: Dejar en portería
Pago: transferencia o Bre-B

${CONSTANCIA}
Quedo atento al valor del envío para confirmar mi pedido.`);
  });
  it("por cotizar por peso usa la misma línea", () => {
    const { texto } = construirMensaje({ ...pedido, costoEnvio: porCotizar("mas_de_5kg") });
    expect(texto).toContain("Envío: POR COTIZAR (zona 5 o más de 5 kg)\nTotal sin envío: $125.000");
    expect(construirMensaje(pedido).texto).not.toContain("Quedo atento");
  });
  it("omite los datos opcionales que no hay", () => {
    const { texto } = construirMensaje({ ...pedido, envio: { ...envio, barrio: undefined, indicaciones: undefined } });
    expect(texto).not.toContain("Barrio");
    expect(texto).not.toContain("Indicaciones");
    expect(texto).toContain("Dirección: Calle 45 # 12-30\nPago:");
  });
  it("incluye correo, documento y código postal si se dieron, en el orden de la plantilla", () => {
    const { texto } = construirMensaje({ ...pedido, envio: { ...envio, tipoDocumento: "CC", numeroDocumento: "1098765432", correo: "ana@correo.co", codigoPostal: "680001" } });
    expect(texto).toContain("Correo: ana@correo.co\nDocumento: CC 1098765432\nDepartamento y municipio: Santander, Bucaramanga\nDirección: Calle 45 # 12-30 · Barrio: Cabecera\nCódigo postal: 680001\nIndicaciones:");
    expect(texto).not.toContain("Cédula");
  });
  it.each([
    ["CE", "Documento: CE E12345"],
    ["PPT", "Documento: PPT E12345"],
    ["PAS", "Documento: Pasaporte E12345"],
  ] as const)("usa la sigla del tipo %s", (tipoDocumento, linea) => {
    const { texto } = construirMensaje({ ...pedido, envio: { ...envio, tipoDocumento, numeroDocumento: "E12345" } });
    expect(texto).toContain(linea);
  });
  it("omite documento y código postal si no se escribieron", () => {
    const { texto } = construirMensaje(pedido);
    expect(texto).not.toContain("Documento:");
    expect(texto).not.toContain("Código postal:");
  });
  it("nunca menciona contraentrega, efectivo ni «Forma de pago» (LEG-144)", () => {
    for (const c of [pedido.costoEnvio, porCotizar("zona_especial")]) {
      expect(construirMensaje({ ...pedido, costoEnvio: c }).texto).not.toMatch(/contraentrega|efectivo|Forma de pago|Grano entero|molienda/i);
    }
  });
  it("la constancia de versiones sale de la configuración (LEG-142)", () => {
    expect(lineaConstancia(pedido.legal)).toBe(CONSTANCIA);
    const otra = construirMensaje({ ...pedido, legal: { versionTerminos: "1.1", versionPoliticaDatos: "1.2", fechaPoliticaDatos: "2027-02-01" } }).texto;
    expect(otra.endsWith("Acepto los Términos v1.1 y autorizo el tratamiento de mis datos según la Política v1.2 del 1 de febrero de 2027.")).toBe(true);
  });
  it("línea de promociones solo si marcó alguna casilla; la de correo solo con correo (LEG-145)", () => {
    expect(lineaPromociones({ whatsapp: false, correo: false }, true)).toBeNull();
    expect(lineaPromociones({ whatsapp: true, correo: false }, false)).toBe("Autorizo recibir promociones por WhatsApp.");
    expect(lineaPromociones({ whatsapp: false, correo: true }, true)).toBe("Autorizo recibir promociones por correo.");
    expect(lineaPromociones({ whatsapp: false, correo: true }, false)).toBeNull();
    expect(lineaPromociones({ whatsapp: true, correo: true }, true)).toBe("Autorizo recibir promociones por WhatsApp y correo.");
    const conCorreo = { ...envio, correo: "ana@correo.co" };
    const texto = construirMensaje({ ...pedido, envio: conCorreo, costoEnvio: porCotizar("zona_especial"), promociones: { whatsapp: true, correo: true } }).texto;
    expect(texto.endsWith(`${CONSTANCIA}\nAutorizo recibir promociones por WhatsApp y correo.\nQuedo atento al valor del envío para confirmar mi pedido.`)).toBe(true);
    expect(construirMensaje(pedido).texto).not.toContain("promociones");
  });
  it("sin tarifa de IVA no afirma ninguna (LEG-082)", () => {
    const { texto } = construirMensaje({ ...pedido, ivaTarifa: null });
    expect(texto).toContain("Subtotal de productos: $125.000\nEnvío: zona 1, $11.600\nTotal");
    expect(texto).not.toMatch(/IVA/);
  });
  it("lleva el número DS en la primera línea y no dice «finalizar» (P39 = a, LEG-150)", () => {
    const { texto } = construirMensaje(pedido);
    expect(texto.split("\n")[0]).toBe("¡Hola, De Santander! Envío mi solicitud de compra N.° DS-261117-1432-K7QM para que me confirmen el total con el envío.");
    expect(texto).not.toMatch(/finalizar/i);
  });
  it("omite la provincia si el café no la tiene", () => {
    const { texto } = construirMensaje({ ...pedido, lineas: [{ ...pedido.lineas[0], provincia: null }] });
    expect(texto).toContain("• Café Barichara — Grano — 500 g");
  });
  it("con cuatro cafés, documento, correo, código postal, promociones e indicaciones largas cabe en 2.000 caracteres", () => {
    const lleno = { ...envio, nombre: "N".repeat(80), correo: `${"c".repeat(100)}@correo.co`, tipoDocumento: "PAS" as const, numeroDocumento: "A".repeat(20), codigoPostal: "680001", direccion: "D".repeat(120), barrio: "B".repeat(60), indicaciones: "I".repeat(300) };
    const lineas = Array.from({ length: 4 }, (_, i) => ({ ...pedido.lineas[i % 2], nombreCafe: `Café de nombre largo número ${i}` }));
    const r = construirMensaje({ ...pedido, lineas, envio: lleno, costoEnvio: porCotizar("mas_de_5kg"), promociones: { whatsapp: true, correo: true } });
    expect(r.texto.length).toBeLessThan(LIMITE_MENSAJE);
    expect(r.indicacionesResumidas).toBe(false);
    expect(r.texto).toContain("Documento: Pasaporte AAAAAAAAAAAAAAAAAAAA");
    expect(r.texto).toContain("Autorizo recibir promociones por WhatsApp y correo.");
  });
  it("resume las indicaciones largas si no cabe en 2.000 caracteres", () => {
    const largo = { ...envio, indicaciones: "z".repeat(400) };
    const lineas = Array.from({ length: 8 }, (_, i) => ({ ...pedido.lineas[0], nombreCafe: `Café ${"muy largo ".repeat(10)}${i}` }));
    const conIndicaciones = construirMensaje({ ...pedido, lineas, envio: largo }, 2000);
    expect(conIndicaciones.texto.length).toBeLessThanOrEqual(LIMITE_MENSAJE);
    expect(conIndicaciones.indicacionesResumidas).toBe(true);
    expect(conIndicaciones.texto).toContain("…");
  });
  it("quita las indicaciones si ni resumidas caben", () => {
    const largo = { ...envio, indicaciones: "z".repeat(400) };
    const sinResumen = construirMensaje({ ...pedido, envio: largo }, 520);
    expect(sinResumen.texto).not.toContain("Indicaciones");
    expect(sinResumen.indicacionesResumidas).toBe(true);
  });
  it("no avisa si el límite se pasa por otra causa y no había indicaciones", () => {
    const r = construirMensaje({ ...pedido, envio: { ...envio, indicaciones: undefined } }, 10);
    expect(r.indicacionesResumidas).toBe(false);
  });
});

describe("construirEnlace", () => {
  it("codifica el texto", () => {
    expect(construirEnlace("573001129874", "Hola & ¿qué tal?\nOk")).toBe("https://wa.me/573001129874?text=Hola%20%26%20%C2%BFqu%C3%A9%20tal%3F%0AOk");
  });
  it("rechaza números con símbolos", () => {
    expect(() => construirEnlace("+57 300 112 9874", "x")).toThrow(RangeError);
    expect(() => construirEnlace("123", "x")).toThrow(RangeError);
  });
});

describe("formatearWhatsapp", () => {
  it("da formato a números colombianos", () => {
    expect(formatearWhatsapp("573001129874")).toBe("+57 300 112 9874");
    expect(formatearWhatsapp("14155550123")).toBe("+14155550123");
  });
});

describe("construirMensaje con envío gratis por comuna (dictamen 2026-11-14, 2 bis)", () => {
  const enMutis = { ...envio, comuna: "Mutis" };
  const gratis = (kg: number) => calcularEnvio([{ gramos: 500, cantidad: kg * 2 }], enMutis, REGLAS_CON_PROMOCION);

  it("hasta 5 kg: $0, plazo de la promoción, comuna y tarifa alternativa antes de la constancia", () => {
    const { texto } = construirMensaje({ ...pedido, costoEnvio: gratis(2), envio: enMutis });
    expect(texto).toBe(`${ENCABEZADO}
Subtotal de productos: $125.000 (IVA del 5 % incluido)
Envío: zona 1 · Mutis, $0 (envío gratis, sujeto a verificar la dirección)
Total: $125.000
Plazo de entrega: máximo 1 día hábil desde que validen mi pago y me den el aprobado por el chat.

Envío a:
Nombre: Ana Rueda
Celular: 300 123 4567
Departamento y municipio: Santander, Bucaramanga
Dirección: Calle 45 # 12-30 · Barrio: Cabecera
Comuna: Mutis
Indicaciones: Dejar en portería
Pago: transferencia o Bre-B

Si mi dirección no está en esa comuna, el envío es de $11.600 y el total queda en $136.600; espero su confirmación.
${CONSTANCIA}`);
  });
  it.each([6, 10, 30])("con %i kg: $0 y «Total», nunca por cotizar", (kg) => {
    const { texto } = construirMensaje({ ...pedido, costoEnvio: gratis(kg), envio: enMutis });
    expect(texto).toContain("Envío: zona 1 · Mutis, $0 (envío gratis, sujeto a verificar la dirección)\nTotal: $125.000\nPlazo de entrega: máximo 1 día hábil desde que validen mi pago y me den el aprobado por el chat.");
    expect(texto).not.toMatch(/POR COTIZAR|Total sin envío|5 a 12/);
    expect(texto).toContain(`Pago: transferencia o Bre-B\n\nSi mi dirección no está en esa comuna, quedo atento al valor del envío para confirmar mi pedido.\n${CONSTANCIA}`);
  });
  it("sin envío gratis no lleva «Comuna:» aunque el dato venga", () => {
    expect(construirMensaje({ ...pedido, envio: enMutis }).texto).not.toContain("Comuna:");
  });
  it("con todos los campos llenos y la comuna más larga cabe en 2.000 caracteres", () => {
    const lleno = { ...envio, comuna: "Ciudadela Real de Minas", nombre: "N".repeat(80), correo: `${"c".repeat(100)}@correo.co`, tipoDocumento: "PAS" as const, numeroDocumento: "A".repeat(20), codigoPostal: "680001", direccion: "D".repeat(120), barrio: "B".repeat(60), indicaciones: "I".repeat(300) };
    const costoEnvio = calcularEnvio([{ gramos: 500, cantidad: 4 }], lleno, REGLAS_CON_PROMOCION);
    const r = construirMensaje({ ...pedido, costoEnvio, envio: lleno, promociones: { whatsapp: true, correo: true } });
    expect(r.texto.length).toBeLessThan(LIMITE_MENSAJE);
    expect(r.indicacionesResumidas).toBe(false);
    expect(r.texto).toContain("Comuna: Ciudadela Real de Minas");
  });
});
