import { describe, expect, it } from "vitest";
import type { LineaCarrito } from "./carrito";
import { bajadaMensajeListo, firmaSolicitud, microayudaCasillas, resumenCompacto, revisarCopia, textoRespaldo, textoSiguientePaso, TEXTOS_MENSAJE_LISTO, type EstadoSolicitud } from "./flujo";

const A: LineaCarrito = { cafeSlug: "cafe-casa-martinez", gramos: 250, molienda: "grano", cantidad: 2 };
const B: LineaCarrito = { cafeSlug: "cafe-arreboles", gramos: 500, molienda: "molido", cantidad: 1 };

const base: EstadoSolicitud = {
  lineas: [A, B],
  envio: { nombre: "Ana Rueda", municipio: "Bucaramanga" },
  terminos: true,
  autorizacion: true,
  promoWhatsapp: false,
  promoCorreo: false,
};

describe("microayuda de las casillas (§5.9 v1.11; LEG-181, QA-023)", () => {
  const UNA_FRASE = "Para enviar tu pedido, acepta los términos y autoriza tus datos.";
  it("usa la variante de una sola frase de v1.11 con una o con las dos casillas sin marcar", () => {
    expect(microayudaCasillas(false, false)).toBe(UNA_FRASE);
    expect(microayudaCasillas(true, false)).toBe(UNA_FRASE);
    expect(microayudaCasillas(false, true)).toBe(UNA_FRASE);
  });
  it("no usa la variante retirada «marca las dos casillas» (LEG-181)", () => {
    for (const [t, a] of [[false, false], [true, false], [false, true]] as const) {
      expect(microayudaCasillas(t, a)).not.toMatch(/marca las dos casillas/);
    }
  });
  it("desaparece con las dos casillas marcadas", () => {
    expect(microayudaCasillas(true, true)).toBeNull();
  });
  it("no habla de comprar, confirmar, finalizar ni pagar (§5.9, regla 3)", () => {
    for (const [t, a] of [[false, false], [true, false], [false, true]] as const) {
      expect(microayudaCasillas(t, a)).not.toMatch(/compr|confirm|finaliz|pag/i);
    }
  });
});

describe("cómo sigue la compra (LEG-171)", () => {
  it("con tarifa", () => {
    expect(textoSiguientePaso(false)).toBe(
      "Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido escrito. Con ese mensaje nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.",
    );
  });
  it("por cotizar", () => {
    expect(textoSiguientePaso(true)).toBe(
      "Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido escrito. Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.",
    );
  });
});

describe("respaldo (LEG-173 (3))", () => {
  it("lleva el número que recibe", () => {
    expect(textoRespaldo("+57 300 112 9874")).toBe("¿No se abrió WhatsApp? Copia el mensaje y envíalo al +57 300 112 9874.");
  });
});

describe("firma de la solicitud (LEG-173 (2), §4 bis 1)", () => {
  const f = firmaSolicitud(base);
  it("es la misma sin cambios, aunque cambie el orden de líneas o llaves", () => {
    expect(firmaSolicitud({ ...base, lineas: [B, A], envio: { municipio: "Bucaramanga", nombre: "Ana Rueda" } })).toBe(f);
  });
  it("cambia con el carrito", () => {
    expect(firmaSolicitud({ ...base, lineas: [A] })).not.toBe(f);
    expect(firmaSolicitud({ ...base, lineas: [{ ...A, cantidad: 3 }, B] })).not.toBe(f);
    expect(firmaSolicitud({ ...base, lineas: [{ ...A, molienda: "molido" }, B] })).not.toBe(f);
  });
  it("cambia con un dato de envío", () => {
    expect(firmaSolicitud({ ...base, envio: { ...base.envio, nombre: "Ana R." } })).not.toBe(f);
  });
  it("cambia con cualquiera de las cuatro casillas", () => {
    expect(firmaSolicitud({ ...base, terminos: false })).not.toBe(f);
    expect(firmaSolicitud({ ...base, autorizacion: false })).not.toBe(f);
    expect(firmaSolicitud({ ...base, promoWhatsapp: true })).not.toBe(f);
    expect(firmaSolicitud({ ...base, promoCorreo: true })).not.toBe(f);
  });
});

describe("bloque compacto «Tu pedido» (A1)", () => {
  const nombre = (s: string) => ({ "cafe-casa-martinez": "Café Casa Martínez", "cafe-arreboles": "Café Arreboles" })[s] ?? s;
  it("una línea por café con gramos, presentación en minúscula y cantidad", () => {
    expect(resumenCompacto([A, B], nombre)).toEqual({ lineas: ["Café Casa Martínez · 250 g · grano × 2", "Café Arreboles · 500 g · molido × 1"], resto: 0 });
  });
  it("con más de tres líneas muestra tres y cuenta el resto", () => {
    const r = resumenCompacto([A, B, { ...A, gramos: 500 }, { ...B, gramos: 250 }, { ...A, molienda: "molido" }], nombre);
    expect(r.lineas).toHaveLength(3);
    expect(r.resto).toBe(2);
  });
});

describe("vista «Mensaje listo» (microcopy v1.12 §9.6; LEG-188 a LEG-191)", () => {
  it("textos letra por letra de §9.6 (T3 con la redacción de LEG-189)", () => {
    expect(TEXTOS_MENSAJE_LISTO).toEqual({
      titulo: "Envía el mensaje en WhatsApp",
      nota: "Vaciamos «Tu pedido» en este navegador para que puedas armar uno nuevo. El mensaje de WhatsApp lleva todos los cafés.",
      rotuloBloque: "En el mensaje",
      recuperar: "Recuperar el pedido",
      seguir: "Seguir viendo cafés",
    });
  });
  it("bajada con tarifa y por cotizar: las frases de §9.3 sin «Al pulsar…»", () => {
    expect(bajadaMensajeListo(false)).toBe("Con ese mensaje nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.");
    expect(bajadaMensajeListo(true)).toBe("Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.");
    expect(textoSiguientePaso(false)).toContain(bajadaMensajeListo(false));
    expect(textoSiguientePaso(true)).toContain(bajadaMensajeListo(true));
  });
  it("ningún texto dice enviado, recibido, confirmado, compra, finalizado ni «Número de pedido» (LEG-188 (4), LEG-191)", () => {
    for (const t of [...Object.values(TEXTOS_MENSAJE_LISTO), bajadaMensajeListo(false), bajadaMensajeListo(true)]) {
      expect(t).not.toMatch(/enviad|recibid|confirmad|compra|finaliz|número de pedido|DS-/i);
    }
  });
});

describe("regla de la copia del mensaje (§9.4 y §9.5 regla 4, v1.12; QA-022; LEG-188 (5))", () => {
  const f = firmaSolicitud(base);
  const vaciada = { firma: f, vaciadoPorEnvio: true };
  const recuperada = { firma: f, vaciadoPorEnvio: false };
  it("el vaciado por el propio envío no cuenta como cambio", () => {
    expect(revisarCopia(vaciada, firmaSolicitud({ ...base, lineas: [] }), false)).toBe("vigente");
  });
  it("al volver las mismas líneas (Recuperar el pedido o Deshacer) vale y deja de estar vacía por el envío", () => {
    expect(revisarCopia(vaciada, f, true)).toBe("recuperada");
  });
  it("otras líneas tras el vaciado (el cliente empezó otro pedido) la descartan", () => {
    expect(revisarCopia(vaciada, firmaSolicitud({ ...base, lineas: [A] }), true)).toBe("descartar");
  });
  it("ya recuperada, sin cambios sigue vigente (mismo DS)", () => {
    expect(revisarCopia(recuperada, f, true)).toBe("vigente");
  });
  it("ya recuperada, cualquier cambio de carrito, envío o casilla la descarta (QA-022)", () => {
    expect(revisarCopia(recuperada, firmaSolicitud({ ...base, terminos: false }), true)).toBe("descartar");
    expect(revisarCopia(recuperada, firmaSolicitud({ ...base, envio: { ...base.envio, nombre: "Ana R." } }), true)).toBe("descartar");
    expect(revisarCopia(recuperada, firmaSolicitud({ ...base, lineas: [B] }), true)).toBe("descartar");
  });
  it("ya recuperada, un vaciado que no es el envío (cajón) la descarta", () => {
    expect(revisarCopia(recuperada, firmaSolicitud({ ...base, lineas: [] }), false)).toBe("descartar");
  });
});
