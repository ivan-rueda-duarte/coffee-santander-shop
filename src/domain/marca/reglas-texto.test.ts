import { describe, expect, it } from "vitest";
import { avisosDeMarca, bloquesAEstructura, bloquesAParrafos, textoDeBloques } from "./reglas-texto";

describe("avisosDeMarca", () => {
  it("un texto limpio no tiene avisos", () => {
    expect(avisosDeMarca("Cultivado a 1.800 m en Socorro, lavado y secado al sol.")).toEqual([]);
    expect(avisosDeMarca("")).toEqual([]);
  });
  it.each([
    ["Un café GOURMET", /gourmet/],
    ["Una taza premium", /premium/],
    ["Sabores exóticos", /exótico/],
    ["Una experiencia mágica", /mágico/],
    ["Es el mejor café del mundo", /el mejor/],
    ["Compra Café de Santander hoy", /Café de Santander/],
    ["café de santander", /Café de Santander/],
  ])("avisa en %j", (texto, esperado) => {
    const avisos = avisosDeMarca(texto);
    expect(avisos).toHaveLength(1);
    expect(avisos[0]).toMatch(esperado);
  });
  it("no confunde palabras parecidas", () => {
    expect(avisosDeMarca("premiumx magicamente exoticismo")).toEqual([]);
    expect(avisosDeMarca("El mejoramiento del cultivo")).toEqual([]);
  });
  it("también detecta sin tildes ni mayúsculas", () => {
    expect(avisosDeMarca("EXOTICO")).toHaveLength(1);
  });
  it("exige ® en Castillo", () => {
    expect(avisosDeMarca("Variedad Castillo de la zona")).toHaveLength(1);
    expect(avisosDeMarca("Variedad Castillo® de la zona")).toEqual([]);
  });
  it("solo revisa la primera vez que aparece Castillo", () => {
    expect(avisosDeMarca("Castillo® y luego castillo")).toEqual([]);
  });
  it("acumula varios avisos", () => {
    expect(avisosDeMarca("Un Castillo premium y mágico")).toHaveLength(3);
  });
});

describe("bloques de texto", () => {
  const bloques = [
    { _type: "block", children: [{ text: "Primer " }, { text: "párrafo" }] },
    { _type: "image", asset: {} },
    { _type: "block", children: [{ text: "  " }] },
    { _type: "block", children: [{}, { text: "Segundo" }] },
    { _type: "block" },
    "basura",
    null,
  ];
  it("convierte cada bloque en un párrafo y descarta lo vacío", () => {
    expect(bloquesAParrafos(bloques)).toEqual(["Primer párrafo", "Segundo"]);
  });
  it("junta los párrafos con línea en blanco", () => {
    expect(textoDeBloques(bloques)).toBe("Primer párrafo\n\nSegundo");
  });
  it("tolera valores que no son listas", () => {
    expect(bloquesAParrafos(undefined)).toEqual([]);
    expect(bloquesAParrafos("texto")).toEqual([]);
    expect(textoDeBloques(null)).toBe("");
  });
});

describe("bloquesAEstructura", () => {
  it("distingue párrafos, subtítulos y listas", () => {
    const b = (texto: string, extra: object = {}) => ({ _type: "block", children: [{ text: texto }], ...extra });
    expect(bloquesAEstructura([b("Título", { style: "h3" }), b("Texto"), b("Uno", { listItem: "bullet" }), b("Dos", { listItem: "number" }), b(" "), { _type: "image" }])).toEqual([
      { tipo: "titulo", texto: "Título" },
      { tipo: "parrafo", texto: "Texto" },
      { tipo: "item", texto: "Uno", numerada: false },
      { tipo: "item", texto: "Dos", numerada: true },
    ]);
    expect(bloquesAEstructura(undefined)).toEqual([]);
  });
});
