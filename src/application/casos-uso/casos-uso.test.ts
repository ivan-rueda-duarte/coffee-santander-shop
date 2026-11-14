import { describe, expect, it } from "vitest";
import type { Catalogo } from "@/domain/catalogo/catalogo";
import { buscarCafe, crearBuscadorDePrecios, provinciasConCafes, provinciasProximas } from "@/domain/catalogo/catalogo";
import { crearCafe, CAFES_PRUEBA, LEGAL_PRUEBA, MALAGA, OIBA, PROVINCIAS_PRUEBA, REGLAS_CON_PROMOCION, REGLAS_ENVIO_PRUEBA, SAN_GIL, SOCORRO, VENDEDOR_PRUEBA } from "@/domain/pruebas/fixtures";
import type { CatalogoRepositorio, ContenidoRepositorio } from "../puertos";
import { obtenerCatalogo } from "./obtener-catalogo";
import { obtenerFichaCafe } from "./obtener-ficha-cafe";
import { prepararPedido, type EntradaPedido } from "./preparar-pedido";

const catalogo: Catalogo = {
  provincias: [...PROVINCIAS_PRUEBA, { slug: "soto", nombre: "Soto", nombreCorto: "Soto", colorHex: "#bdd9b6", descripcion: null, orden: 4 }],
  municipios: [
    { slug: "socorro", nombre: "Socorro", divipola: "68755", provinciaSlug: "comunera", porVerificar: false },
    { slug: "oiba", nombre: "Oiba", divipola: "68500", provinciaSlug: "comunera", porVerificar: false },
    { slug: "san-gil", nombre: "San Gil", divipola: "68679", provinciaSlug: "guanenta", porVerificar: false },
    { slug: "malaga", nombre: "Málaga", divipola: "68432", provinciaSlug: "garcia-rovira", porVerificar: false },
  ],
  productores: [],
  cafes: CAFES_PRUEBA,
  tienda: {
    nombre: "De Santander",
    whatsapp: "573001129874",
    ciudadDespacho: "Bucaramanga",
    mediosPago: ["transferencia", "bre-b"],
    maxCantidad: 20,
    ivaTarifa: 5,
    legal: LEGAL_PRUEBA,
    vendedor: VENDEDOR_PRUEBA,
  },
  envios: REGLAS_ENVIO_PRUEBA,
};
const repo: CatalogoRepositorio = { obtener: async () => catalogo };
const sinContenido: ContenidoRepositorio = { cafe: async () => null, provincia: async () => null, inicio: async () => null, historia: async () => null, legal: async () => null, slugs: async () => ({ cafes: [], provincias: [], productores: [] }) };

describe("helpers del catálogo", () => {
  it("busca café y precio vigente", () => {
    expect(buscarCafe(catalogo, "cafe-oiba")).toBe(OIBA);
    expect(buscarCafe(catalogo, "x")).toBeUndefined();
    const precio = crearBuscadorDePrecios(catalogo);
    expect(precio("cafe-oiba", 500)).toBe(50000);
    expect(precio("cafe-oiba", 1000)).toBeUndefined();
    expect(precio("x", 250)).toBeUndefined();
  });
  it("no da precio a una presentación agotada", () => {
    const agotado = crearCafe({ slug: "ago", nombre: "Ago", presentaciones: [{ gramos: 250, precioCop: 1, disponible: false }] });
    expect(crearBuscadorDePrecios({ cafes: [agotado] })("ago", 250)).toBeUndefined();
  });
  it("separa provincias con cafés de las próximas", () => {
    expect(provinciasConCafes(catalogo).map((p) => p.slug)).toEqual(["comunera", "garcia-rovira", "guanenta"]);
    expect(provinciasProximas(catalogo).map((p) => p.slug)).toEqual(["soto"]);
  });
});

describe("obtenerCatalogo", () => {
  it("agrega provincias activas, próximas y filtros visibles", async () => {
    const v = await obtenerCatalogo(repo);
    expect(v.provinciasActivas).toHaveLength(3);
    expect(v.provinciasProximas.map((p) => p.slug)).toEqual(["soto"]);
    expect(v.filtrosVisibles).toContain("provincias");
    expect(v.filtrosVisibles).not.toContain("precio");
    expect(v.limites.altitud).toEqual([1650, 1850]);
    expect(v.cafes).toHaveLength(5);
  });
});

describe("obtenerFichaCafe", () => {
  it("arma la ficha con provincia, municipio y cafés de la misma provincia", async () => {
    const f = await obtenerFichaCafe(repo, sinContenido, SOCORRO.slug);
    expect(f?.municipio.nombre).toBe("Socorro");
    expect(f?.provincia?.slug).toBe("comunera");
    expect(f?.relacionados.map((c) => c.slug)).toEqual([OIBA.slug]);
    expect(f?.productor).toBeNull();
    expect(f?.contenido).toBeNull();
  });
  it("incluye el contenido editorial si existe", async () => {
    const contenido = { ...sinContenido, cafe: async (slug: string) => ({ slug, historia: ["Texto"], fotos: [] }) };
    const f = await obtenerFichaCafe(repo, contenido, SAN_GIL.slug);
    expect(f?.contenido?.historia).toEqual(["Texto"]);
  });
  it("devuelve null si el café no existe o su municipio falta", async () => {
    expect(await obtenerFichaCafe(repo, sinContenido, "nada")).toBeNull();
    const huerfano = { obtener: async () => ({ ...catalogo, municipios: [] }) };
    expect(await obtenerFichaCafe(huerfano, sinContenido, SOCORRO.slug)).toBeNull();
  });
  it("un café sin provincia no tiene relacionados", async () => {
    const suelto = crearCafe({ slug: "suelto", nombre: "Suelto", municipioSlug: "socorro", provinciaSlug: null, provincia: null });
    const r = { obtener: async () => ({ ...catalogo, cafes: [...CAFES_PRUEBA, suelto] }) };
    expect((await obtenerFichaCafe(r, sinContenido, "suelto"))?.relacionados).toEqual([]);
  });
});

const CODIGOS = { Santander: "68", "Bogotá, D.C.": "11", Amazonas: "91" };
const preparar = (c: typeof catalogo, e: EntradaPedido) => prepararPedido(c, e, CODIGOS);

const envioValido = {
  nombre: "Ana Rueda",
  celular: "300 123 4567",
  departamento: "Santander",
  municipio: "Bucaramanga",
  direccion: "Calle 45 # 12-30",
};
const entrada = (cambios: Partial<EntradaPedido> = {}): EntradaPedido => ({
  lineas: [
    { cafeSlug: MALAGA.slug, gramos: 500, molienda: "grano", cantidad: 2 },
    { cafeSlug: OIBA.slug, gramos: 250, molienda: "molido", cantidad: 1 },
  ],
  envio: envioValido,
  autorizacionDatos: true,
  aceptaTerminos: true,
  promociones: { whatsapp: false, correo: false },
  numeroSolicitud: "DS-261117-1432-K7QM",
  ...cambios,
});

describe("prepararPedido", () => {
  it("valida el código postal con el código del departamento y lo lleva al mensaje", () => {
    const mal = preparar(catalogo, entrada({ envio: { ...envioValido, codigoPostal: "110111" } }));
    expect(mal.ok).toBe(false);
    if (!mal.ok) expect(mal.errores.codigoPostal).toBe("Este código no corresponde a Santander. Revísalo en el visor de 4-72.");
    const bien = preparar(catalogo, entrada({ envio: { ...envioValido, codigoPostal: "680001", tipoDocumento: "CC", numeroDocumento: "1.098.765.432" } }));
    expect(bien.ok).toBe(true);
    if (bien.ok) {
      expect(bien.pedido.texto).toContain("Documento: CC 1098765432");
      expect(bien.pedido.texto).toContain("Código postal: 680001");
    }
  });
  it("arma el mensaje con precios del catálogo y el enlace de WhatsApp", () => {
    const r = preparar(catalogo, entrada());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.pedido.totales.subtotalCop).toBe(125000);
    expect(r.pedido.totales.bolsas).toBe(3);
    expect(r.pedido.texto).toContain("• Café Málaga (García Rovira) — Grano — 500 g × 2 = $100.000");
    expect(r.pedido.texto).toContain("• Café Oiba (Comunera) — Molido — 250 g × 1 = $25.000");
    expect(r.pedido.texto).toContain("Subtotal de productos: $125.000 (IVA del 5 % incluido)\nEnvío: zona 1, $11.600 (IVA incluido)\nTotal: $136.600");
    expect(r.pedido.texto.startsWith("¡Hola, De Santander! Envío mi solicitud de compra N.° DS-261117-1432-K7QM para que me confirmen el total con el envío.")).toBe(true);
    expect(r.pedido.texto.endsWith("Acepto los Términos v1 y autorizo el tratamiento de mis datos según la Política v1 del 6 de noviembre de 2026.")).toBe(true);
    expect(r.pedido.envio).toMatchObject({ tipo: "tarifa", zona: 1, pesoFacturableG: 1330, valorCop: 11600 });
    expect(r.pedido.totalCop).toBe(136600);
    expect(r.pedido.enlace.startsWith("https://wa.me/573001129874?text=")).toBe(true);
    expect(decodeURIComponent(r.pedido.enlace.split("?text=")[1])).toBe(r.pedido.texto);
    expect(r.pedido.indicacionesResumidas).toBe(false);
  });
  it("calcula el envío con el departamento y el municipio del formulario", () => {
    const bogota = { ...envioValido, departamento: "Bogotá, D.C.", municipio: "Bogotá, D.C." };
    const dos250 = [{ cafeSlug: OIBA.slug, gramos: 250, molienda: "grano" as const, cantidad: 2 }];
    const r = preparar(catalogo, entrada({ lineas: dos250, envio: bogota }));
    expect(r.ok && r.pedido.texto).toContain("Subtotal de productos: $50.000 (IVA del 5 % incluido)\nEnvío: zona 3, $18.000 (IVA incluido)\nTotal: $68.000");
    expect(r.ok && r.pedido.totalCop).toBe(68000);
  });
  it("en zona especial el envío va por cotizar y el total no lo incluye", () => {
    const leticia = { ...envioValido, departamento: "Amazonas", municipio: "Leticia" };
    const r = preparar(catalogo, entrada({ envio: leticia }));
    expect(r.ok && r.pedido.texto).toContain("Subtotal de productos: $125.000 (IVA del 5 % incluido)\nEnvío: POR COTIZAR (zona 5 o más de 5 kg)\nTotal sin envío: $125.000");
    // D5 §6.4: «Quedo atento…» va al final, después de la constancia.
    expect(r.ok && r.pedido.texto).toMatch(/Acepto los Términos v1 .*\nQuedo atento al valor del envío para confirmar mi pedido\.$/);
    expect(r.ok && r.pedido.envio).toMatchObject({ tipo: "por_cotizar", motivo: "zona_especial" });
    expect(r.ok && r.pedido.totalCop).toBe(125000);
  });
  it("de más de 5 kg va por cotizar aunque la zona tenga tarifa", () => {
    const r = preparar(catalogo, entrada({ lineas: [{ cafeSlug: SOCORRO.slug, gramos: 500, molienda: "grano", cantidad: 11 }] }));
    expect(r.ok && r.pedido.texto).toContain("Envío: POR COTIZAR (zona 5 o más de 5 kg)");
  });
  it("con envío gratis y una comuna de la lista: $0, «Comuna:» y la tarifa alternativa", () => {
    const conPromo = { ...catalogo, envios: REGLAS_CON_PROMOCION };
    const r = preparar(conPromo, entrada({ envio: { ...envioValido, comuna: "Centro" } }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.pedido.envio).toMatchObject({ tipo: "gratis", comuna: "Centro", alternativa: { tipo: "tarifa", valorCop: 11600 } });
    expect(r.pedido.totalCop).toBe(125000);
    expect(r.pedido.texto).toContain("Envío: zona 1 · Centro, $0 (envío gratis, sujeto a verificar la dirección)\nTotal: $125.000");
    expect(r.pedido.texto).toContain("Comuna: Centro");
    expect(r.pedido.texto).toContain("el envío es de $11.600 y el total queda en $136.600; espero su confirmación.");
  });
  it("con «Otra comuna o no la sé» o con la promoción apagada rige la tarifa normal y no hay «Comuna:»", () => {
    for (const [cat, comuna] of [[{ ...catalogo, envios: REGLAS_CON_PROMOCION }, "otra"], [catalogo, "Centro"]] as const) {
      const r = preparar(cat, entrada({ envio: { ...envioValido, comuna } }));
      expect(r.ok && r.pedido.envio).toMatchObject({ tipo: "tarifa", valorCop: 11600 });
      expect(r.ok && r.pedido.texto).not.toContain("Comuna:");
    }
  });
  it("con la promoción terminada (P34 b, §8.6.1) el cálculo y el mensaje son los normales, aunque llegue una comuna", () => {
    const terminada = { ...catalogo, envios: { ...REGLAS_CON_PROMOCION, envioGratis: { ...REGLAS_CON_PROMOCION.envioGratis!, terminada: "2026-11-09" } } };
    const normal = preparar(catalogo, entrada());
    for (const comuna of ["Centro", undefined]) {
      const r = preparar(terminada, entrada({ envio: { ...envioValido, comuna } }));
      expect(r.ok && r.pedido.envio).toMatchObject({ tipo: "tarifa", valorCop: 11600 });
      expect(r.ok && r.pedido.texto).toBe(normal.ok && normal.pedido.texto);
      expect(r.ok && r.pedido.texto).not.toMatch(/gratis|Comuna:/i);
    }
  });
  it("rechaza un pedido vacío", () => {
    const r = preparar(catalogo, entrada({ lineas: [] }));
    expect(r).toMatchObject({ ok: false, errores: { lineas: "Tu pedido está vacío." } });
  });
  it("explica cada línea con problema", () => {
    const agotado = { ...catalogo, cafes: [...CAFES_PRUEBA, crearCafe({ slug: "ago", nombre: "Café Ago", presentaciones: [{ gramos: 250, precioCop: 1, disponible: false }] }), crearCafe({ slug: "solo-grano", nombre: "Café Solo Grano", moliendas: ["grano"] })] };
    const r = preparar(
      agotado,
      entrada({
        lineas: [
          { cafeSlug: "retirado", gramos: 250, molienda: "grano", cantidad: 1 },
          { cafeSlug: OIBA.slug, gramos: 1000, molienda: "grano", cantidad: 1 },
          { cafeSlug: "ago", gramos: 250, molienda: "grano", cantidad: 1 },
          { cafeSlug: "solo-grano", gramos: 250, molienda: "molido", cantidad: 1 },
          { cafeSlug: OIBA.slug, gramos: 250, molienda: "grano", cantidad: 21 },
        ],
      }),
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.lineas).toEqual([
      "retirado ya no está en el catálogo.",
      "Café Oiba ya no se vende en 1000 g.",
      "Café Ago en 250 g está agotado.",
      "Café Solo Grano no se ofrece en molido.",
      "Café Oiba: el máximo es 20 bolsas por tamaño. Para más, escríbenos por WhatsApp.",
    ]);
    expect(r.errores.lineas).toMatch(/Revisa tu pedido/);
  });
  it("valida el envío y los consentimientos juntos", () => {
    const r = preparar(catalogo, entrada({ envio: { ...envioValido, nombre: "", celular: "1" }, autorizacionDatos: false, aceptaTerminos: false }));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.errores).sort()).toEqual(["aceptaTerminos", "autorizacionDatos", "celular", "nombre"]);
  });
  it("sin campo de forma de pago: el mensaje dice «Pago: transferencia o Bre-B» y nunca contraentrega (LEG-144)", () => {
    const r = preparar(catalogo, entrada({ envio: { ...envioValido, formaPago: "Efectivo contraentrega" } }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.pedido.texto).toContain("\nPago: transferencia o Bre-B\n");
    expect(r.pedido.texto).not.toMatch(/contraentrega|efectivo|Forma de pago/i);
  });
  it("lleva el número DS generado en el navegador y la línea de promociones solo con las casillas marcadas (LEG-145, LEG-150)", () => {
    const sin = preparar(catalogo, entrada());
    expect(sin.ok && sin.pedido.texto.startsWith("¡Hola, De Santander! Envío mi solicitud de compra N.° DS-261117-1432-K7QM para que me confirmen el total con el envío.")).toBe(true);
    expect(sin.ok && sin.pedido.texto).not.toContain("promociones");
    const correoSinCorreo = preparar(catalogo, entrada({ promociones: { whatsapp: false, correo: true } }));
    expect(correoSinCorreo.ok && correoSinCorreo.pedido.texto).not.toContain("promociones");
    const ambas = preparar(catalogo, entrada({ envio: { ...envioValido, correo: "ana@correo.co" }, promociones: { whatsapp: true, correo: true } }));
    expect(ambas.ok && ambas.pedido.texto).toContain("Autorizo recibir promociones por WhatsApp y correo.");
  });
  it("las casillas de promociones no bloquean: sin ellas el pedido sale igual", () => {
    expect(preparar(catalogo, entrada({ promociones: { whatsapp: false, correo: false } })).ok).toBe(true);
    expect(preparar(catalogo, entrada({ aceptaTerminos: false, promociones: { whatsapp: true, correo: true } })).ok).toBe(false);
  });
  it("avisa cuando las indicaciones se resumen", () => {
    const largo = { ...envioValido, indicaciones: "y".repeat(300) };
    const muchas = Array.from({ length: 12 }, (_, i) => ({ cafeSlug: i % 2 ? SOCORRO.slug : SAN_GIL.slug, gramos: i % 3 ? 250 : 500, molienda: i % 4 < 2 ? ("grano" as const) : ("molido" as const), cantidad: 1 + i }));
    const r = preparar(catalogo, entrada({ lineas: muchas, envio: largo }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.pedido.texto.length).toBeLessThanOrEqual(2000);
  });
});
