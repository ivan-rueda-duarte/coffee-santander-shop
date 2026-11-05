import { describe, expect, it } from "vitest";
import { construirEnlace, construirMensaje, formatearWhatsapp, LIMITE_MENSAJE, type PedidoMensaje } from "./mensaje-whatsapp";
import type { DatosEnvio } from "./envio";
import type { ResultadoEnvio } from "../envio/tipos";

const envio: DatosEnvio = {
  nombre: "Ana Rueda",
  celular: "3001234567",
  cedula: undefined,
  correo: undefined,
  departamento: "Santander",
  municipio: "Bucaramanga",
  direccion: "Calle 45 # 12-30",
  barrio: "Cabecera",
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
};
const porCotizar = (motivo: "zona_especial" | "mas_de_5kg"): ResultadoEnvio => ({ tipo: "por_cotizar", zona: 5, pesoFacturableG: 1330, motivo });

describe("construirMensaje", () => {
  it("sigue la plantilla del pedido", () => {
    const { texto, indicacionesResumidas } = construirMensaje(pedido);
    expect(indicacionesResumidas).toBe(false);
    expect(texto).toMatchInlineSnapshot(`
      "¡Hola, De Santander! Quiero finalizar mi pedido

      • Café Barichara (Guanentá) — Grano entero — 500 g × 2 = $100.000
      • Café Oiba (Comunera) — Molido — 250 g × 1 = $25.000

      Subtotal: $125.000
      Envío (Bucaramanga · zona 1): $11.600
      Total: $136.600

      Envío a:
      Nombre: Ana Rueda
      Celular: 300 123 4567
      Ciudad: Bucaramanga, Santander
      Dirección: Calle 45 # 12-30 · Barrio: Cabecera
      Indicaciones: Dejar en portería
      Forma de pago: Transferencia Bre-B"
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
      "¡Hola, De Santander! Quiero finalizar mi pedido

      • Café Barichara (Guanentá) — Grano entero — 500 g × 2 = $100.000
      • Café Oiba (Comunera) — Molido — 250 g × 1 = $25.000

      Subtotal: $96.000
      Envío (Bogotá · zona 3): $18.000
      Total: $114.000

      Envío a:
      Nombre: Ana Rueda
      Celular: 300 123 4567
      Ciudad: Bogotá, D.C., Bogotá, D.C.
      Dirección: Calle 45 # 12-30 · Barrio: Cabecera
      Indicaciones: Dejar en portería
      Forma de pago: Transferencia Bre-B"
    `);
  });
  it("por cotizar (zona especial) no suma envío y rotula el total", () => {
    const { texto } = construirMensaje({ ...pedido, subtotalCop: 96000, costoEnvio: porCotizar("zona_especial"), envio: { ...envio, departamento: "Amazonas", municipio: "Leticia" } });
    expect(texto).toMatchInlineSnapshot(`
      "¡Hola, De Santander! Quiero finalizar mi pedido

      • Café Barichara (Guanentá) — Grano entero — 500 g × 2 = $100.000
      • Café Oiba (Comunera) — Molido — 250 g × 1 = $25.000

      Subtotal: $96.000
      Envío: POR COTIZAR (zona especial)
      Total sin envío: $96.000

      Envío a:
      Nombre: Ana Rueda
      Celular: 300 123 4567
      Ciudad: Leticia, Amazonas
      Dirección: Calle 45 # 12-30 · Barrio: Cabecera
      Indicaciones: Dejar en portería
      Forma de pago: Transferencia Bre-B

      Quedo atento al valor del envío para confirmar mi pedido."
    `);
  });
  it("por cotizar por peso dice más de 5 kg", () => {
    const { texto } = construirMensaje({ ...pedido, costoEnvio: porCotizar("mas_de_5kg") });
    expect(texto).toContain("Envío: POR COTIZAR (más de 5 kg)\nTotal sin envío: $125.000");
    expect(texto.endsWith("\n\nQuedo atento al valor del envío para confirmar mi pedido.")).toBe(true);
    expect(construirMensaje(pedido).texto).not.toContain("Quedo atento");
  });
  it("omite los datos opcionales que no hay", () => {
    const { texto } = construirMensaje({ ...pedido, envio: { ...envio, barrio: undefined, indicaciones: undefined } });
    expect(texto).not.toContain("Barrio");
    expect(texto).not.toContain("Indicaciones");
    expect(texto).toContain("Dirección: Calle 45 # 12-30\n");
  });
  it("incluye cédula y correo si se dieron", () => {
    const { texto } = construirMensaje({ ...pedido, envio: { ...envio, cedula: "1098765432", correo: "ana@correo.co" } });
    expect(texto).toContain("Cédula: 1098765432");
    expect(texto).toContain("Correo: ana@correo.co");
  });
  it("omite la provincia si el café no la tiene", () => {
    const { texto } = construirMensaje({ ...pedido, lineas: [{ ...pedido.lineas[0], provincia: null }] });
    expect(texto).toContain("• Café Barichara — Grano entero");
  });
  it("resume las indicaciones largas si no cabe en 2.000 caracteres", () => {
    const largo = { ...envio, indicaciones: "z".repeat(400) };
    const lineas = Array.from({ length: 9 }, (_, i) => ({ ...pedido.lineas[0], nombreCafe: `Café ${"muy largo ".repeat(10)}${i}` }));
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
