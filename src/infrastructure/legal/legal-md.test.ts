import { describe, expect, it } from "vitest";
import { LEGAL_PRUEBA, PROMOCION_PRUEBA } from "@/domain/pruebas/fixtures";
import { ErrorDatos } from "../csv/lector";
import { RepositorioContenidoVacio } from "../sanity/contenido-sanity";
import { cargarLegalDesdeDocs, condicionesEnvioGratis, condicionesEnvioGratisTerminada, conLegalDesdeDocs, DOCUMENTOS_LEGALES, leerDocsLegalesDesdeDisco, numeralEnvioGratisPublicado, problemasDocsLegales, revisarEnvioGratisEnDocs } from "./legal-md";
import { cargarCatalogoDesdeDisco } from "../csv/repositorio-catalogo-csv";

// Estas pruebas leen los documentos reales de docs/legal/ y data/config.csv: si legal deja un marcador
// interno en el texto público, o cambia la versión sin cambiar config.csv, fallan aquí y en npm run datos.
const leer = leerDocsLegalesDesdeDisco();
const legal = cargarCatalogoDesdeDisco().catalogo.tienda.legal;

describe("documentos legales publicados desde docs/legal/", () => {
  it("los cuatro documentos son publicables y coinciden con data/config.csv", () => {
    expect(problemasDocsLegales(leer, legal)).toEqual([]);
  });
  for (const [seccion, d] of Object.entries(DOCUMENTOS_LEGALES)) {
    it(`/legal/${seccion}/ sale de ${d.archivo} con versión y fecha de config.csv, sin marcadores ni corchetes`, () => {
      const c = cargarLegalDesdeDocs(leer, legal, seccion)!;
      expect(c.seccion).toBe(seccion);
      expect(c.version).toBe(d.version === "terminos" ? legal.versionTerminos : legal.versionPoliticaDatos);
      expect(c.vigenteDesde).toBe(d.version === "terminos" ? legal.fechaTerminos : legal.fechaPoliticaDatos);
      expect(c.contenido.length).toBeGreaterThan(5);
      expect(c.contenido[0].tipo).toBe("titulo");
      const texto = c.contenido.map((b) => b.texto).join("\n");
      expect(texto).not.toMatch(/TODO\(|DECISIÓN|VERIFICAR|<!--|\[|\]|\{|\}|BORRADOR|Notas para el abogado/);
    });
  }
  it("la versión publicada es la 1.0 vigente desde el 2026-11-17 (paquete del abogado, §0)", () => {
    expect(legal).toEqual({ versionTerminos: "1.0", fechaTerminos: "2026-11-17", versionPoliticaDatos: "1.0", fechaPoliticaDatos: "2026-11-17" });
  });
  it("D2 §13 sustituye las llaves con config.csv (LEG-142)", () => {
    const texto = cargarLegalDesdeDocs(leer, legal, "privacidad")!.contenido.map((b) => b.texto).join("\n");
    expect(texto).toContain("Esta política rige desde el 17 de noviembre de 2026 (versión 1.0).");
  });
  it("D3 se publica en /envios/ y D4 sin datos duplicados (LEG-141, LEG-148)", () => {
    expect(DOCUMENTOS_LEGALES["envios-devoluciones"].ruta).toBe("/envios/");
    const d4 = cargarLegalDesdeDocs(leer, legal, "vendedor")!.contenido.map((b) => b.texto);
    expect(d4).toContain("Dirección de notificación judicial: Calle 37 n.° 23-77, apartamento 702, Bucaramanga, Santander");
    expect(d4.filter((t) => t.startsWith("NIT:"))).toHaveLength(1);
  });
  it("ningún documento publica contraentrega como medio de pago (D1 §7)", () => {
    for (const seccion of Object.keys(DOCUMENTOS_LEGALES)) {
      const texto = cargarLegalDesdeDocs(leer, legal, seccion)!.contenido.map((b) => b.texto).join("\n");
      expect(texto.replaceAll("No recibimos pagos contraentrega ni en efectivo", "")).not.toMatch(/contraentrega|efectivo/i);
    }
  });
  it("la sección de retracto publicada concede 5 días hábiles y no dice «no admite retracto»", () => {
    const texto = cargarLegalDesdeDocs(leer, legal, "envios-devoluciones")!.contenido.map((b) => b.texto).join("\n");
    expect(texto).toContain("puedes retractarte dentro de los cinco (5) días hábiles siguientes a la entrega");
    expect(texto).not.toMatch(/no admite retracto/i);
  });
  it("una sección desconocida devuelve null", () => {
    expect(cargarLegalDesdeDocs(leer, legal, "cookies")).toBeNull();
  });
});

describe("con documentos defectuosos", () => {
  const limpio = "«Versión 1 · vigente desde 2026-11-06»\n## Texto para el consumidor\n### A\nTexto.\n";
  it("falla con mensaje claro si falta un archivo o si la versión no coincide con config.csv", () => {
    const sinPolitica = (archivo: string) => {
      if (archivo === "politica-tratamiento-datos.md") throw new Error("no existe");
      return limpio;
    };
    const p = problemasDocsLegales(sinPolitica, { ...LEGAL_PRUEBA, versionTerminos: "2" });
    expect(p).toContain("docs/legal/politica-tratamiento-datos.md: no se encontró el documento de /legal/privacidad/.");
    expect(p.filter((x) => x.includes("declara la versión «1» y data/config.csv dice «2»."))).toHaveLength(3);
  });
  it("cargarLegalDesdeDocs lanza ErrorDatos si el texto trae un marcador interno", () => {
    const conTodo = () => limpio.replace("Texto.", "Texto TODO(dato): falta.");
    expect(() => cargarLegalDesdeDocs(conTodo, LEGAL_PRUEBA, "terminos")).toThrow(ErrorDatos);
    expect(() => cargarLegalDesdeDocs(conTodo, LEGAL_PRUEBA, "terminos")).toThrow(/contiene «TODO\(»/);
  });
});

describe("conLegalDesdeDocs (LEG-158)", () => {
  it("las páginas legales salen siempre de docs/legal/, aunque Sanity traiga otra versión", async () => {
    const respaldo = async (seccion: string) => (seccion === "terminos" ? { seccion, version: "1", vigenteDesde: "2026-11-06", contenido: [] } : null);
    const repo = conLegalDesdeDocs(new RepositorioContenidoVacio(), respaldo);
    expect((await repo.legal("terminos"))?.version).toBe("1");
    expect(await repo.legal("otra")).toBeNull();
    expect(await repo.cafe("x")).toBeNull();
    expect(await repo.slugs()).toEqual({ cafes: [], provincias: [], productores: [] });
    const vacio = new RepositorioContenidoVacio();
    const conSanity = conLegalDesdeDocs(
      {
        cafe: () => vacio.cafe(),
        provincia: () => vacio.provincia(),
        inicio: () => vacio.inicio(),
        historia: () => vacio.historia(),
        slugs: () => vacio.slugs(),
        legal: async (s: string) => ({ seccion: s, version: "9", vigenteDesde: "2027-01-01", contenido: [] }),
      },
      respaldo,
    );
    expect((await conSanity.legal("terminos"))?.version).toBe("1");
    expect(await conSanity.legal("otra")).toBeNull();
  });
});

// Envío gratis por comunas (LEG-106, LEG-167): con D1 y D3 1.0 publicados, la promoción puede encenderse desde 2026-11-17.
describe("envío gratis con los documentos de docs/legal/", () => {
  const publicado = cargarLegalDesdeDocs(leer, legal, "envios-devoluciones")!.contenido;
  const PROMO = { ...PROMOCION_PRUEBA, desde: "2026-11-17" };
  it("el texto público trae el numeral de condiciones", () => {
    expect(publicado.some((b) => b.texto.includes("Envío gratis en comunas de Bucaramanga"))).toBe(true);
    expect(numeralEnvioGratisPublicado(leer, legal)).toBe(true);
  });
  it("el control de publicación deja encender la promoción desde 2026-11-17", () => {
    expect(revisarEnvioGratisEnDocs(leer, PROMO, legal).errores).toEqual([]);
  });
  it("con otra fecha de inicio el control falla (el numeral escribe la fecha)", () => {
    const r = revisarEnvioGratisEnDocs(leer, PROMOCION_PRUEBA, legal);
    expect(r.errores[0]).toContain("no dice la fecha de inicio");
  });
  it("/envios/ toma el numeral publicado, con las comunas y sin marcadores", () => {
    const texto = condicionesEnvioGratis(publicado, leer, PROMO, false).map((b) => b.texto).join("\n");
    for (const comuna of PROMO.comunas) expect(texto).toContain(comuna);
    expect(texto).toContain("Peso: aplica con cualquier peso.");
    // LEG-167: el numeral se corta antes de «Normas citadas», que cierra el documento.
    expect(texto).not.toContain("Normas citadas");
    expect(texto).not.toMatch(/[{}[\]]|TODO\(|VERIFICAR|```/);
  });
  it("terminada: toma el numeral publicado", () => {
    const fin = { desde: PROMO.desde };
    expect(condicionesEnvioGratisTerminada(publicado, leer, fin, false)).toEqual(condicionesEnvioGratis(publicado, leer, PROMO, false));
  });
});
