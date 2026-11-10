import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { calcularEnvio, totalConEnvio } from "@/domain/envio/envio";
import { anuncioEnvio, OPCION_OTRA_COMUNA, promocionActiva, TEXTOS_ENVIO_GRATIS } from "@/domain/envio/envio-gratis";
import { textoPlazoResumen } from "@/domain/envio/plazos";
import type { ItemPesable, ReglasEnvio } from "@/domain/envio/tipos";
import { crearEsquemaEnvio, validar, type DatosEnvio } from "@/domain/pedido/envio";
import { construirMensaje, LIMITE_MENSAJE, type LineaMensaje, type PedidoMensaje } from "@/domain/pedido/mensaje-whatsapp";
import { cargarCatalogo } from "./cargar-catalogo";
import type { LeerArchivo } from "./tabla";

// QA (ronda 2026-11-09, envío gratis por comunas): la regla con los CSV REALES de data/, no con fixtures.
// La promoción se enciende solo en memoria (config.csv reescrito al leer); el archivo del disco no se toca.

const CARPETA = join(process.cwd(), "data");
const leerCon = (desde: string | null): LeerArchivo => (nombre) => {
  const texto = readFileSync(join(CARPETA, nombre), "utf8");
  if (nombre !== "config.csv" || desde === null) return texto;
  return texto.replace(/^envio_gratis_desde,.*$/m, `envio_gratis_desde,${desde}`);
};

const encendida = cargarCatalogo(leerCon("2026-11-06"), () => true).catalogo;
const apagada = cargarCatalogo(leerCon(null), () => true).catalogo;
const REGLAS: ReglasEnvio = { ...encendida.envios, envioGratis: promocionActiva(encendida.envios.envioGratis, "2026-11-09") };
const COMUNAS = readFileSync(join(CARPETA, "comunas_envio_gratis.csv"), "utf8")
  .trim()
  .split("\n")
  .slice(1)
  .map((l) => l.split(",")[2]);

/** `kg` kilos de café en bolsas de 500 g (peso facturable = kg·1000 + 80 g). */
const kilos = (kg: number): ItemPesable[] => [{ gramos: 500, cantidad: kg * 2 }];
const BGA = { departamento: "Santander", municipio: "Bucaramanga" };
const TARIFA_BGA = { 1: 8800, 2: 11600, 5: 15400 } as const;

describe("datos reales: la promoción se lee de data/", () => {
  it("apagada en el repositorio (envio_gratis_desde vacía)", () => {
    expect(apagada.envios.envioGratis).toBeNull();
  });
  it("encendida en memoria: siete comunas de Bucaramanga, sin fecha final", () => {
    expect(REGLAS.envioGratis).toMatchObject({ departamento: "Santander", municipio: "Bucaramanga", desde: "2026-11-06", terminada: null });
    expect(REGLAS.envioGratis?.comunas).toEqual(COMUNAS);
    expect(COMUNAS).toHaveLength(7);
  });
});

describe("datos reales: siete comunas × 1, 2, 5, 6, 10 y 30 kg", () => {
  const pesos = [1, 2, 5, 6, 10, 30] as const;
  for (const comuna of COMUNAS) {
    it.each(pesos)(`${comuna}, %i kg → $0, «Total», plazo de 1 día hábil y alternativa de zona 1`, (kg) => {
      const r = calcularEnvio(kilos(kg), { ...BGA, comuna }, REGLAS);
      if (r.tipo !== "gratis") throw new Error(`se esperaba gratis y salió ${r.tipo}`);
      expect(r).toMatchObject({ zona: 1, comuna, pesoFacturableG: kg * 1000 + 80 });
      const subtotal = 25000 * kg * 2;
      expect(totalConEnvio(subtotal, r)).toEqual({ totalCop: subtotal, sinEnvio: false });
      const plazo = textoPlazoResumen(REGLAS.plazos, r);
      expect(plazo).toBe(TEXTOS_ENVIO_GRATIS.plazoResumen);
      expect(plazo).not.toContain("5 a 12");
      if (kg <= 5) expect(r.alternativa).toMatchObject({ tipo: "tarifa", valorCop: TARIFA_BGA[kg as 1 | 2 | 5] });
      else expect(r.alternativa).toMatchObject({ tipo: "por_cotizar", motivo: "mas_de_5kg" });
      expect(anuncioEnvio(r, subtotal)).toBe(`Envío gratis en ${comuna}, sujeto a verificar tu dirección: $0. Total: ${new Intl.NumberFormat("es-CO").format(subtotal).replace(/^/, "$")}.`);
    });
  }
});

describe("datos reales: sin comuna cubierta rige la regla normal", () => {
  it.each([undefined, "", OPCION_OTRA_COMUNA, "Norte", "Cabecera"])("comuna %s: tarifa con 1 kg y por cotizar con 6 kg", (comuna) => {
    expect(calcularEnvio(kilos(1), { ...BGA, comuna }, REGLAS)).toMatchObject({ tipo: "tarifa", valorCop: 8800 });
    const seis = calcularEnvio(kilos(6), { ...BGA, comuna }, REGLAS);
    expect(seis).toMatchObject({ tipo: "por_cotizar", motivo: "mas_de_5kg" });
    expect(totalConEnvio(300000, seis).sinEnvio).toBe(true);
  });
  it.each(["Floridablanca", "Piedecuesta", "Girón"])("%s con una comuna de la lista no tiene envío gratis", (municipio) => {
    expect(calcularEnvio(kilos(1), { departamento: "Santander", municipio, comuna: "Centro" }, REGLAS).tipo).toBe("tarifa");
  });
  it("con la promoción apagada, la comuna se ignora", () => {
    expect(calcularEnvio(kilos(1), { ...BGA, comuna: "Centro" }, apagada.envios)).toMatchObject({ tipo: "tarifa", valorCop: 8800 });
  });
});

describe("datos reales: mensaje de WhatsApp (microcopy §8.4)", () => {
  const esquema = crearEsquemaEnvio(encendida.tienda.formasPago, { Santander: "68" }, { envioGratis: REGLAS.envioGratis });
  const lleno = {
    nombre: "N".repeat(80),
    celular: "300 123 4567",
    correo: `${"c".repeat(100)}@correo.co`,
    tipoDocumento: "PAS",
    numeroDocumento: "A".repeat(20),
    departamento: "Santander",
    municipio: "Bucaramanga",
    codigoPostal: "680001",
    direccion: "D".repeat(120),
    barrio: "B".repeat(60),
    comuna: "Ciudadela Real de Minas",
    indicaciones: "I".repeat(300),
    formaPago: encendida.tienda.formasPago[0],
  };
  const datos = (v: Record<string, string>): DatosEnvio => {
    const r = validar(esquema, v);
    if (!r.ok) throw new Error(JSON.stringify(r.errores));
    return r.datos;
  };
  const pedido = (envio: DatosEnvio, lineas: LineaMensaje[]): PedidoMensaje => {
    const subtotalCop = lineas.reduce((s, l) => s + l.totalCop, 0);
    return {
      nombreTienda: encendida.tienda.nombre,
      lineas,
      subtotalCop,
      costoEnvio: calcularEnvio(lineas, envio, REGLAS),
      envio,
      ivaTarifa: encendida.tienda.ivaTarifa,
      legal: encendida.tienda.legal,
    };
  };
  const linea = (nombreCafe: string, gramos: number, cantidad: number, molienda: "grano" | "molido" = "grano"): LineaMensaje => ({
    nombreCafe,
    provincia: "Guanentá",
    molienda,
    gramos,
    cantidad,
    totalCop: (gramos === 500 ? 50000 : 25000) * cantidad,
  });

  it("todas las líneas nuevas, en su lugar, y ≤ 2.000 caracteres con todos los campos llenos", () => {
    const { texto } = construirMensaje(pedido(datos(lleno), [linea("Café Casa Martínez", 500, 2), linea("Café Arreboles", 250, 1, "molido")]));
    expect(texto.length).toBeLessThanOrEqual(LIMITE_MENSAJE);
    expect(texto).toContain("Envío (Bucaramanga · zona 1 · Ciudadela Real de Minas): $0 (envío gratis, sujeto a verificar la dirección)\nTotal: $125.000\nPlazo de entrega: máximo 1 día hábil desde que validen mi pedido y me den el aprobado por el chat.");
    expect(texto).toMatch(/\nDirección: D+ · Barrio: B+\nComuna: Ciudadela Real de Minas\n/);
    expect(texto).toContain("\n\nSi mi dirección no está en esa comuna, el envío es de $11.600 y el total queda en $136.600; espero su confirmación.\n\nAcepto los Términos");
    expect(texto).not.toContain("Total sin envío");
  });

  it("con más de 5 kg: la línea de verificación «quedo atento» y nunca «Total sin envío»", () => {
    const { texto } = construirMensaje(pedido(datos(lleno), [linea("Café Casa Martínez", 500, 20)]));
    expect(texto.length).toBeLessThanOrEqual(LIMITE_MENSAJE);
    expect(texto).toContain("Total: $1.000.000\nPlazo de entrega: máximo 1 día hábil");
    expect(texto).toContain("\n\nSi mi dirección no está en esa comuna, quedo atento al valor del envío para confirmar mi pedido.\n\nAcepto");
    expect(texto).not.toMatch(/Total sin envío|POR COTIZAR/);
  });

  it("carrito máximo del catálogo real (cada café × 2 tamaños × 2 moliendas × 20 bolsas), todos los campos y comuna: ≤ 2.000 caracteres", () => {
    const nombres = encendida.cafes.map((c) => c.nombre);
    expect(nombres.length).toBeGreaterThan(0);
    const lineas = nombres.flatMap((n) => [linea(n, 250, 20), linea(n, 250, 20, "molido"), linea(n, 500, 20), linea(n, 500, 20, "molido")]);
    const { texto, indicacionesResumidas } = construirMensaje(pedido(datos(lleno), lineas));
    expect(texto).toContain("Comuna: Ciudadela Real de Minas");
    expect(texto).toContain("Si mi dirección no está en esa comuna, quedo atento");
    expect(texto.length).toBeLessThanOrEqual(LIMITE_MENSAJE);
    expect(typeof indicacionesResumidas).toBe("boolean");
  });

  it("sin comuna (o «Otra comuna o no la sé») no aparece ninguna línea nueva", () => {
    for (const comuna of ["", OPCION_OTRA_COMUNA]) {
      const d = datos({ ...lleno, comuna });
      expect(d.comuna).toBeUndefined();
      const { texto } = construirMensaje(pedido(d, [linea("Café Casa Martínez", 500, 2)]));
      expect(texto).not.toMatch(/Comuna:|envío gratis|Plazo de entrega: máximo 1 día|Si mi dirección no está/);
      expect(texto).toContain("Envío (Bucaramanga · zona 1): $8.800");
    }
  });

  it("la comuna fuera de la lista se descarta al validar (no se registra)", () => {
    expect(datos({ ...lleno, comuna: "Norte" }).comuna).toBeUndefined();
    expect(datos({ ...lleno, municipio: "Girón", comuna: "Centro" }).comuna).toBeUndefined();
  });
});
