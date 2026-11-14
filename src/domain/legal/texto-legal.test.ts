import { describe, expect, it } from "vitest";
import { lineasTextoConsumidor, MARCADORES_PROHIBIDOS, parsearTextoLegal, problemasTextoLegal, sustituirValores, valoresTextoLegal } from "./texto-legal";

const DOC = `> BORRADOR — Versión 1.0 — 2026-11-06.

# Términos

Se publica con el rótulo «Versión 1 · vigente desde 2026-11-06». Más cosas.

---

## Texto para el consumidor

### 1. Qué regulan
Un párrafo.

Rigen junto con:
- Uno.
- Dos.

### 2. Pasos
1. Primero.
2. Segundo.

Cierre.

---

## Notas para el abogado

TODO(dato): esto no se publica. [VERIFICAR]
`;

const ESPERADO = { version: "1", vigenteDesde: "2026-11-06" };

describe("parsearTextoLegal", () => {
  it("toma solo la sección para el consumidor, con subtítulos, párrafos y listas en orden", () => {
    const t = parsearTextoLegal(DOC);
    expect(t.rotulo).toEqual(ESPERADO);
    expect(t.bloques).toEqual([
      { tipo: "titulo", texto: "1. Qué regulan" },
      { tipo: "parrafo", texto: "Un párrafo." },
      { tipo: "parrafo", texto: "Rigen junto con:" },
      { tipo: "item", texto: "Uno.", numerada: false },
      { tipo: "item", texto: "Dos.", numerada: false },
      { tipo: "titulo", texto: "2. Pasos" },
      { tipo: "item", texto: "Primero.", numerada: true },
      { tipo: "item", texto: "Segundo.", numerada: true },
      { tipo: "parrafo", texto: "Cierre." },
    ]);
    expect(JSON.stringify(t.bloques)).not.toMatch(/TODO|VERIFICAR|abogado/);
  });
  it("la sección termina en el siguiente «## » aunque no haya separador", () => {
    const lineas = lineasTextoConsumidor("## Texto para el consumidor\n### A\nx\n## Otra\ny");
    expect(lineas).toEqual(["### A", "x"]);
    expect(lineasTextoConsumidor("# Sin sección\nx")).toEqual([]);
  });
  it("sin rótulo devuelve null", () => {
    expect(parsearTextoLegal("## Texto para el consumidor\n### A\nx").rotulo).toBeNull();
  });
});

describe("problemasTextoLegal", () => {
  it("un documento limpio y con la versión de config.csv no tiene problemas", () => {
    expect(problemasTextoLegal(parsearTextoLegal(DOC), ESPERADO)).toEqual([]);
  });
  it("detecta cada marcador interno en el texto publicado", () => {
    for (const m of MARCADORES_PROHIBIDOS) {
      const t = parsearTextoLegal(DOC.replace("Un párrafo.", `Un párrafo ${m} interno.`));
      expect(problemasTextoLegal(t, ESPERADO).join("\n"), m).toContain(`contiene «${m}»`);
    }
  });
  it("falla si la versión o la fecha no coinciden con config.csv (LEG-088)", () => {
    const t = parsearTextoLegal(DOC);
    expect(problemasTextoLegal(t, { version: "2", vigenteDesde: "2026-11-06" })).toEqual(["declara la versión «1» y data/config.csv dice «2»."]);
    expect(problemasTextoLegal(t, { version: "1", vigenteDesde: "2026-12-01" })).toEqual(["declara la vigencia «2026-11-06» y data/config.csv dice «2026-12-01»."]);
  });
  it("falla sin sección, sin subtítulos o sin rótulo", () => {
    expect(problemasTextoLegal(parsearTextoLegal("# Nada"), ESPERADO)).toEqual([
      "no tiene la sección «## Texto para el consumidor» o está vacía.",
      "el texto para el consumidor no tiene subtítulos (###).",
      "no declara el rótulo «Versión N · vigente desde AAAA-MM-DD».",
    ]);
    expect(problemasTextoLegal(parsearTextoLegal("«Versión 1 · vigente desde 2026-11-06»\n## Texto para el consumidor\nsolo párrafo"), ESPERADO)).toEqual([
      "el texto para el consumidor no tiene subtítulos (###).",
    ]);
  });
});

describe("valores entre llaves (LEG-142)", () => {
  const legal = { versionTerminos: "1.0", fechaTerminos: "2026-11-17", versionPoliticaDatos: "1.0", fechaPoliticaDatos: "2026-11-17" };
  const conLlaves = DOC.replace("Un párrafo.", "Rige desde el {fecha_politica_datos} (versión {version_politica_datos}); términos {version_terminos} del {fecha_terminos}.");
  it("sustituye versión y fecha de config.csv, con la fecha en letras", () => {
    const t = parsearTextoLegal(conLlaves, valoresTextoLegal(legal));
    expect(t.bloques[1]).toEqual({ tipo: "parrafo", texto: "Rige desde el 17 de noviembre de 2026 (versión 1.0); términos 1.0 del 17 de noviembre de 2026." });
    expect(problemasTextoLegal(t, ESPERADO)).toEqual([]);
  });
  it("una llave sin sustituir (desconocida o sin valores) impide publicar", () => {
    expect(problemasTextoLegal(parsearTextoLegal(conLlaves), ESPERADO).join("\n")).toContain("contiene «{»");
    const otra = parsearTextoLegal(DOC.replace("Un párrafo.", "Dato {razon_social}."), valoresTextoLegal(legal));
    expect(problemasTextoLegal(otra, ESPERADO).join("\n")).toContain("contiene «{»");
    expect(sustituirValores("{x} y {version_terminos}", { version_terminos: "1.0" })).toBe("{x} y 1.0");
  });
  it("acepta la versión «1.0» en el rótulo", () => {
    expect(parsearTextoLegal("«Versión 1.0 · vigente desde 2026-11-17»").rotulo).toEqual({ version: "1.0", vigenteDesde: "2026-11-17" });
  });
});
