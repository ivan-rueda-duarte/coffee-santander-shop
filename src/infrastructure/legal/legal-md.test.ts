import { describe, expect, it } from "vitest";
import { LEGAL_PRUEBA } from "@/domain/pruebas/fixtures";
import { ErrorDatos } from "../csv/lector";
import { RepositorioContenidoVacio } from "../sanity/contenido-sanity";
import { cargarLegalDesdeDocs, conRespaldoLegal, DOCUMENTOS_LEGALES, leerDocsLegalesDesdeDisco, problemasDocsLegales } from "./legal-md";
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
      expect(texto).not.toMatch(/TODO\(|DECISIÓN|VERIFICAR|<!--|\[|\]|BORRADOR|Notas para el abogado/);
    });
  }
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

describe("conRespaldoLegal", () => {
  it("usa el respaldo solo cuando el repositorio interno no trae la página", async () => {
    const respaldo = async (seccion: string) => (seccion === "terminos" ? { seccion, version: "1", vigenteDesde: "2026-11-06", contenido: [] } : null);
    const repo = conRespaldoLegal(new RepositorioContenidoVacio(), respaldo);
    expect((await repo.legal("terminos"))?.version).toBe("1");
    expect(await repo.legal("otra")).toBeNull();
    expect(await repo.cafe("x")).toBeNull();
    expect(await repo.slugs()).toEqual({ cafes: [], provincias: [], productores: [] });
    const vacio = new RepositorioContenidoVacio();
    const conSanity = conRespaldoLegal(
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
    expect((await conSanity.legal("terminos"))?.version).toBe("9");
  });
});
