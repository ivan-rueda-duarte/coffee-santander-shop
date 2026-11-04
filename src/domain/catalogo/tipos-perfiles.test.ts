import { describe, expect, it } from "vitest";
import { BARICHARA, crearCafe, SOCORRO } from "../pruebas/fixtures";
import { perfilDeNota, perfilesDeNotas } from "./perfiles";
import { estaDisponible, grupoDeTueste, mostrarSelloSca, precioDesde } from "./tipos";

describe("perfiles de taza", () => {
  it("traduce notas sin importar tildes ni mayúsculas", () => {
    expect(perfilDeNota("Jazmín")).toBe("floral");
    expect(perfilDeNota("FRUTOS ROJOS")).toBe("frutal");
    expect(perfilDeNota("Nuez")).toBe("nueces");
    expect(perfilDeNota("Naranja")).toBe("citrico");
  });
  it("ignora notas desconocidas", () => {
    expect(perfilDeNota("humo")).toBeNull();
  });
  it("junta las familias sin repetir", () => {
    expect(perfilesDeNotas(["Caramelo", "Cacao", "Frutos rojos"])).toEqual(["caramelo", "chocolate", "frutal"]);
    expect(perfilesDeNotas(["Cereza", "Manzana", "humo"])).toEqual(["frutal"]);
  });
});

describe("datos derivados del café", () => {
  it("agrupa los cinco tuestes en tres", () => {
    expect(grupoDeTueste("claro")).toBe("claro");
    expect(grupoDeTueste("medio_claro")).toBe("claro");
    expect(grupoDeTueste("medio")).toBe("medio");
    expect(grupoDeTueste("medio_oscuro")).toBe("oscuro");
    expect(grupoDeTueste("oscuro")).toBe("oscuro");
  });
  it("precio desde es la presentación más barata", () => {
    expect(precioDesde(SOCORRO)).toBe(25000);
    expect(precioDesde({ presentaciones: [] })).toBeNull();
  });
  it("disponible si alguna presentación lo está", () => {
    expect(estaDisponible(SOCORRO)).toBe(true);
    expect(estaDisponible({ presentaciones: [{ gramos: 250, precioCop: 1, disponible: false }] })).toBe(false);
  });
  it("el sello SCA exige puntaje verificado y ≥ 80", () => {
    expect(mostrarSelloSca(BARICHARA)).toBe(false);
    expect(mostrarSelloSca({ puntajeSca: 90, puntajeVerificado: true })).toBe(true);
    expect(mostrarSelloSca({ puntajeSca: 79, puntajeVerificado: true })).toBe(false);
    expect(mostrarSelloSca(crearCafe({ slug: "x", nombre: "X", puntajeVerificado: true }))).toBe(false);
  });
});
