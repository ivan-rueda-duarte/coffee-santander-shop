import { describe, expect, it } from "vitest";
import { esquemaReglaZona, esquemaTarifa } from "./esquema";

const tarifa = { zona: 3, clave: "zona3", nombre: "Capitales", medio: "transportadora", hasta1: 18000, hasta2: 23000, hasta5: 33000 };
const mensajes = (r: { success: boolean; error?: { issues: { message: string }[] } }) => (r.success ? [] : r.error!.issues.map((i) => i.message));

describe("esquemaTarifa", () => {
  it("acepta una tarifa con escalones en aumento", () => {
    expect(esquemaTarifa.safeParse(tarifa).success).toBe(true);
  });
  it("acepta la zona 5 por cotizar", () => {
    expect(esquemaTarifa.safeParse({ ...tarifa, zona: 5, hasta1: null, hasta2: null, hasta5: null }).success).toBe(true);
  });
  it("rechaza zona fuera de rango", () => {
    expect(mensajes(esquemaTarifa.safeParse({ ...tarifa, zona: 6 }))[0]).toContain("entre 1 y 5");
  });
  it("rechaza por_cotizar fuera de la zona 5", () => {
    expect(mensajes(esquemaTarifa.safeParse({ ...tarifa, hasta2: null }))[0]).toContain("solo puede aparecer en la zona 5");
  });
  it("rechaza escalones que no aumentan", () => {
    expect(mensajes(esquemaTarifa.safeParse({ ...tarifa, hasta2: 18000 }))[0]).toContain("en aumento");
  });
  it("rechaza una zona 5 con valores", () => {
    expect(mensajes(esquemaTarifa.safeParse({ ...tarifa, zona: 5 }))[0]).toContain("zona 5");
  });
});

describe("esquemaReglaZona", () => {
  const regla = { nivel: "municipio", departamento: "Santander", municipio: "Girón", zona: 1 };
  it("acepta una regla de municipio y una de departamento", () => {
    expect(esquemaReglaZona.safeParse(regla).success).toBe(true);
    expect(esquemaReglaZona.safeParse({ nivel: "departamento", departamento: "Santander", municipio: "", zona: 2 }).success).toBe(true);
  });
  it("rechaza lo incoherente", () => {
    expect(mensajes(esquemaReglaZona.safeParse({ ...regla, municipio: "" }))[0]).toContain("necesita el municipio");
    expect(mensajes(esquemaReglaZona.safeParse({ ...regla, nivel: "departamento", zona: 2 }))[0]).toContain("no lleva municipio");
    expect(mensajes(esquemaReglaZona.safeParse({ nivel: "departamento", departamento: "X", municipio: "", zona: 1 }))[0]).toContain("zona 1");
    expect(mensajes(esquemaReglaZona.safeParse({ ...regla, nivel: "pais" }))[0]).toContain("nivel");
  });
});
