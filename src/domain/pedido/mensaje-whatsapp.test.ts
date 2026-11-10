import { describe, expect, it } from "vitest";
import { construirEnlace, construirMensaje, formatearWhatsapp, lineaConstancia, LIMITE_MENSAJE, type PedidoMensaje } from "./mensaje-whatsapp";
import type { DatosEnvio } from "./envio";
import type { ResultadoEnvio } from "../envio/tipos";
import { calcularEnvio } from "../envio/envio";
import { REGLAS_CON_PROMOCION } from "../pruebas/fixtures";

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
  formaPago: "Transferencia Bre-B",
};

const pedido: PedidoMensaje = {
  nombreTienda: "De Santander",
  lineas: [
    { nombreCafe: "Café Barichara", provincia: "Guanentá", molienda: "grano", gramos: 500, cantidad: 2, totalCop: 100000 },
    { nombreCafe: "Café Oiba", provincia: "Comunera", molienda: "molido", gramos: 250, cantidad: 1, totalCop: 25000 },
  ],
  subtotalCop: 125000,
  costoEnvio: { tipo: "tarifa", zona: 1, clave: "bucaramanga", pesoFacturableG: 1330, escalonKg: 2, valorCop: 11600 },
  envio,
  ivaTarifa: 5,
  legal: { versionTerminos: "1", versionPoliticaDatos: "1", fechaPoliticaDatos: "2026-11-06" },
};
const CONSTANCIA = "Acepto los Términos y condiciones versión 1 y autorizo el tratamiento de mis datos según la Política de tratamiento de datos versión 1 del 6 de noviembre de 2026.";
const porCotizar = (motivo: "zona_especial" | "mas_de_5kg"): ResultadoEnvio => ({ tipo: "por_cotizar", zona: 5, pesoFacturableG: 1330, motivo });

describe("construirMensaje", () => {
  it("sigue la plantilla del pedido", () => {
    const { texto, indicacionesResumidas } = construirMensaje(pedido);
    expect(indicacionesResumidas).toBe(false);
    expect(texto).toMatchInlineSnapshot(`
      "¡Hola, De Santander! Envío mi solicitud de compra para que me confirmen el total con el envío.

      • Café Barichara (Guanentá) — Grano entero — 500 g × 2 = $100.000
      • Café Oiba (Comunera) — Molido — 250 g × 1 = $25.000

      Subtotal de productos: $125.000 (IVA del 5 % incluido)
      Envío (Bucaramanga · zona 1): $11.600
      Total: $136.600

      Envío a:
      Nombre: Ana Rueda
      Celular: 300 123 4567
      Ciudad: Bucaramanga, Santander
      Dirección: Calle 45 # 12-30 · Barrio: Cabecera
      Indicaciones: Dejar en portería
      Forma de pago: Transferencia Bre-B

      Acepto los Términos y condiciones versión 1 y autorizo el tratamiento de mis datos según la Política de tratamiento de datos versión 1 del 6 de noviembre de 2026."
    `);
  });
  it("con tarifa suma el envío al total (Bogotá, D.C. se muestra como Bogotá)", () => {
    const { texto } = construirMensaje({
      ...pedido,
      subtotalCop: 96000,
      costoEnvio: { tipo: "tarifa", zona: 3, clave: "zona3", pesoFacturableG: 580, escalonKg: 1, valorCop: 18000 },
      envio: { ...envio, departamento: "Bogotá, D.C.", municipio: "Bogotá, D.C." },
    });
    expect(texto).toMatchInlineSnapshot(`
      "¡Hola, De Santander! Envío mi solicitud de compra para que me confirmen el total con el envío.

      • Café Barichara (Guanentá) — Grano entero — 500 g × 2 = $100.000
      • Café Oiba (Comunera) — Molido — 250 g × 1 = $25.000

      Subtotal de productos: $96.000 (IVA del 5 % incluido)
      Envío (Bogotá · zona 3): $18.000
      Total: $114.000

      Envío a:
      Nombre: Ana Rueda
      Celular: 300 123 4567
      Ciudad: Bogotá, D.C., Bogotá, D.C.
      Dirección: Calle 45 # 12-30 · Barrio: Cabecera
      Indicaciones: Dejar en portería
      Forma de pago: Transferencia Bre-B

      Acepto los Términos y condiciones versión 1 y autorizo el tratamiento de mis datos según la Política de tratamiento de datos versión 1 del 6 de noviembre de 2026."
    `);
  });
  it("por cotizar (zona especial) no suma envío y rotula el total", () => {
    const { texto } = construirMensaje({ ...pedido, subtotalCop: 96000, costoEnvio: porCotizar("zona_especial"), envio: { ...envio, departamento: "Amazonas", municipio: "Leticia" } });
    expect(texto).toMatchInlineSnapshot(`
      "¡Hola, De Santander! Envío mi solicitud de compra para que me confirmen el total con el envío.

      • Café Barichara (Guanentá) — Grano entero — 500 g × 2 = $100.000
      • Café Oiba (Comunera) — Molido — 250 g × 1 = $25.000

      Subtotal de productos: $96.000 (IVA del 5 % incluido)
      Envío: POR COTIZAR (zona especial)
      Total sin envío: $96.000

      Envío a:
      Nombre: Ana Rueda
      Celular: 300 123 4567
      Ciudad: Leticia, Amazonas
      Dirección: Calle 45 # 12-30 · Barrio: Cabecera
      Indicaciones: Dejar en portería
      Forma de pago: Transferencia Bre-B

      Quedo atento al valor del envío para confirmar mi pedido.

      Acepto los Términos y condiciones versión 1 y autorizo el tratamiento de mis datos según la Política de tratamiento de datos versión 1 del 6 de noviembre de 2026."
    `);
  });
  it("por cotizar por peso dice más de 5 kg", () => {
    const { texto } = construirMensaje({ ...pedido, costoEnvio: porCotizar("mas_de_5kg") });
    expect(texto).toContain("Envío: POR COTIZAR (más de 5 kg)\nTotal sin envío: $125.000");
    expect(texto).toContain(`\n\nQuedo atento al valor del envío para confirmar mi pedido.\n\n${CONSTANCIA}`);
    expect(construirMensaje(pedido).texto).not.toContain("Quedo atento");
  });
  it("omite los datos opcionales que no hay", () => {
    const { texto } = construirMensaje({ ...pedido, envio: { ...envio, barrio: undefined, indicaciones: undefined } });
    expect(texto).not.toContain("Barrio");
    expect(texto).not.toContain("Indicaciones");
    expect(texto).toContain("Dirección: Calle 45 # 12-30\n");
  });
  it("incluye documento, correo y código postal si se dieron, en su orden", () => {
    const { texto } = construirMensaje({ ...pedido, envio: { ...envio, tipoDocumento: "CC", numeroDocumento: "1098765432", correo: "ana@correo.co", codigoPostal: "680001" } });
    expect(texto).toContain("Correo: ana@correo.co\nDocumento: CC 1098765432\nCiudad: Bucaramanga, Santander\nCódigo postal: 680001\nDirección:");
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
  it("con los datos de envío al máximo cabe en 2.000 caracteres", () => {
    const lleno = { ...envio, nombre: "N".repeat(80), correo: `${"c".repeat(100)}@correo.co`, tipoDocumento: "PAS" as const, numeroDocumento: "A".repeat(20), codigoPostal: "680001", direccion: "D".repeat(120), barrio: "B".repeat(60), indicaciones: "I".repeat(300) };
    const r = construirMensaje({ ...pedido, envio: lleno });
    expect(r.texto.length).toBeLessThan(LIMITE_MENSAJE);
    expect(r.texto).toContain("Documento: Pasaporte AAAAAAAAAAAAAAAAAAAA");
  });
  it("la constancia de versiones cierra siempre el mensaje y sale de la configuración (LEG-050, LEG-088)", () => {
    expect(construirMensaje(pedido).texto.endsWith(`\n\n${CONSTANCIA}`)).toBe(true);
    const otra = construirMensaje({ ...pedido, legal: { versionTerminos: "2", versionPoliticaDatos: "3", fechaPoliticaDatos: "2027-02-01" } }).texto;
    expect(otra.endsWith("Acepto los Términos y condiciones versión 2 y autorizo el tratamiento de mis datos según la Política de tratamiento de datos versión 3 del 1 de febrero de 2027.")).toBe(true);
    expect(lineaConstancia(pedido.legal)).toBe(CONSTANCIA);
  });
  it("sin tarifa de IVA el subtotal no afirma ninguna (LEG-082)", () => {
    const { texto } = construirMensaje({ ...pedido, ivaTarifa: null });
    expect(texto).toContain("Subtotal de productos: $125.000\nEnvío");
    expect(texto).not.toMatch(/IVA/);
  });
  it("no lleva número de solicitud ni «finalizar» (decisión del dueño, LEG-090)", () => {
    const { texto } = construirMensaje(pedido);
    expect(texto).not.toMatch(/DS-|finalizar/i);
  });
  it("omite la provincia si el café no la tiene", () => {
    const { texto } = construirMensaje({ ...pedido, lineas: [{ ...pedido.lineas[0], provincia: null }] });
    expect(texto).toContain("• Café Barichara — Grano entero");
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
    const sinResumen = construirMensaje({ ...pedido, envio: largo }, 480);
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
    expect(construirEnlace("573001129874", "Hola & ¿qué tal?\nOk")).toBe(
      "https://wa.me/573001129874?text=Hola%20%26%20%C2%BFqu%C3%A9%20tal%3F%0AOk",
    );
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

describe("construirMensaje con envío gratis por comuna (microcopy §8.4)", () => {
  const enMutis = { ...envio, comuna: "Mutis" };
  const gratis = (kg: number) => calcularEnvio([{ gramos: 500, cantidad: kg * 2 }], enMutis, REGLAS_CON_PROMOCION);

  it("hasta 5 kg: $0, plazo de la promoción, comuna y tarifa alternativa antes de la constancia", () => {
    const { texto } = construirMensaje({ ...pedido, costoEnvio: gratis(2), envio: enMutis });
    expect(texto).toMatchInlineSnapshot(`
      "¡Hola, De Santander! Envío mi solicitud de compra para que me confirmen el total con el envío.

      • Café Barichara (Guanentá) — Grano entero — 500 g × 2 = $100.000
      • Café Oiba (Comunera) — Molido — 250 g × 1 = $25.000

      Subtotal de productos: $125.000 (IVA del 5 % incluido)
      Envío (Bucaramanga · zona 1 · Mutis): $0 (envío gratis, sujeto a verificar la dirección)
      Total: $125.000
      Plazo de entrega: máximo 1 día hábil desde que validen mi pedido y me den el aprobado por el chat.

      Envío a:
      Nombre: Ana Rueda
      Celular: 300 123 4567
      Ciudad: Bucaramanga, Santander
      Dirección: Calle 45 # 12-30 · Barrio: Cabecera
      Comuna: Mutis
      Indicaciones: Dejar en portería
      Forma de pago: Transferencia Bre-B

      Si mi dirección no está en esa comuna, el envío es de $11.600 y el total queda en $136.600; espero su confirmación.

      Acepto los Términos y condiciones versión 1 y autorizo el tratamiento de mis datos según la Política de tratamiento de datos versión 1 del 6 de noviembre de 2026."
    `);
  });
  it.each([6, 10, 30])("con %i kg: $0 y «Total», nunca por cotizar, con la línea de más de 5 kg", (kg) => {
    const { texto } = construirMensaje({ ...pedido, costoEnvio: gratis(kg), envio: enMutis });
    expect(texto).toContain("Envío (Bucaramanga · zona 1 · Mutis): $0 (envío gratis, sujeto a verificar la dirección)\nTotal: $125.000\nPlazo de entrega: máximo 1 día hábil desde que validen mi pedido y me den el aprobado por el chat.");
    expect(texto).not.toMatch(/POR COTIZAR|Total sin envío|5 a 12/);
    expect(texto).toContain(`Forma de pago: Transferencia Bre-B\n\nSi mi dirección no está en esa comuna, quedo atento al valor del envío para confirmar mi pedido.\n\n${CONSTANCIA}`);
  });
  it("sin envío gratis no lleva «Comuna:» aunque el dato venga", () => {
    const { texto } = construirMensaje({ ...pedido, envio: enMutis });
    expect(texto).not.toContain("Comuna:");
  });
  it("con todos los campos llenos y la comuna más larga cabe en 2.000 caracteres", () => {
    const lleno = { ...envio, comuna: "Ciudadela Real de Minas", nombre: "N".repeat(80), correo: `${"c".repeat(100)}@correo.co`, tipoDocumento: "PAS" as const, numeroDocumento: "A".repeat(20), codigoPostal: "680001", direccion: "D".repeat(120), barrio: "B".repeat(60), indicaciones: "I".repeat(300) };
    const costoEnvio = calcularEnvio([{ gramos: 500, cantidad: 4 }], lleno, REGLAS_CON_PROMOCION);
    const r = construirMensaje({ ...pedido, costoEnvio, envio: lleno });
    expect(r.texto.length).toBeLessThan(LIMITE_MENSAJE);
    expect(r.indicacionesResumidas).toBe(false);
    expect(r.texto).toContain("Comuna: Ciudadela Real de Minas");
  });
});
