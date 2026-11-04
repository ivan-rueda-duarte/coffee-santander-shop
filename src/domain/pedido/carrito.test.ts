import { describe, expect, it } from "vitest";
import {
  claveLinea,
  crearCarrito,
  depurarLineas,
  reducirCarrito,
  type AccionCarrito,
  type EstadoCarrito,
  type LineaCarrito,
} from "./carrito";

const L = (cafeSlug: string, gramos: number, molienda: "grano" | "molido", cantidad = 1): LineaCarrito => ({
  cafeSlug,
  gramos,
  molienda,
  cantidad,
});
const correr = (estado: EstadoCarrito, ...acciones: AccionCarrito[]) => acciones.reduce(reducirCarrito, estado);
const agregar = (cafeSlug: string, gramos = 250, molienda: "grano" | "molido" = "grano", cantidad?: number): AccionCarrito => ({
  tipo: "agregar",
  linea: { cafeSlug, gramos, molienda },
  cantidad,
});

describe("agregar", () => {
  it("crea la línea con cantidad 1", () => {
    const e = correr(crearCarrito(), agregar("a"));
    expect(e.lineas).toEqual([L("a", 250, "grano")]);
  });
  it("suma si la línea ya existe", () => {
    const e = correr(crearCarrito(), agregar("a"), agregar("a"));
    expect(e.lineas).toEqual([L("a", 250, "grano", 2)]);
  });
  it("tamaño o molienda distintos son líneas distintas", () => {
    const e = correr(crearCarrito(), agregar("a"), agregar("a", 500), agregar("a", 250, "molido"));
    expect(e.lineas).toHaveLength(3);
  });
  it("acepta una cantidad (ficha)", () => {
    expect(correr(crearCarrito(), agregar("a", 250, "grano", 3)).lineas[0].cantidad).toBe(3);
    expect(correr(crearCarrito(), agregar("a", 250, "grano", 0)).lineas[0].cantidad).toBe(1);
  });
  it("no pasa del máximo y avisa", () => {
    const e = correr(crearCarrito([L("a", 250, "grano", 20)]), agregar("a"));
    expect(e.lineas[0].cantidad).toBe(20);
    expect(e.aviso).toEqual({ tipo: "maximo", clave: "a|250|grano" });
  });
  it("recorta al máximo y avisa cuando una cantidad grande se pasa", () => {
    const e = correr(crearCarrito([L("a", 250, "grano", 18)]), agregar("a", 250, "grano", 5));
    expect(e.lineas[0].cantidad).toBe(20);
    expect(e.aviso).not.toBeNull();
  });
  it("la siguiente acción borra el aviso", () => {
    const e = correr(crearCarrito([L("a", 250, "grano", 20)]), agregar("a"), agregar("b"));
    expect(e.aviso).toBeNull();
  });
  it("respeta un máximo distinto", () => {
    const e = correr(crearCarrito([], 2), agregar("a"), agregar("a"), agregar("a"));
    expect(e.lineas[0].cantidad).toBe(2);
  });
});

describe("cambiarCantidad", () => {
  const base = crearCarrito([L("a", 250, "grano", 2)]);
  it("suma y resta", () => {
    expect(correr(base, { tipo: "cambiarCantidad", clave: "a|250|grano", delta: 1 }).lineas[0].cantidad).toBe(3);
    expect(correr(base, { tipo: "cambiarCantidad", clave: "a|250|grano", delta: -1 }).lineas[0].cantidad).toBe(1);
  });
  it("no pasa del máximo", () => {
    expect(correr(base, { tipo: "cambiarCantidad", clave: "a|250|grano", delta: 99 }).lineas[0].cantidad).toBe(20);
  });
  it("llegar a 0 elimina la línea y se puede deshacer", () => {
    const e = correr(base, { tipo: "cambiarCantidad", clave: "a|250|grano", delta: -2 });
    expect(e.lineas).toEqual([]);
    expect(correr(e, { tipo: "deshacer" }).lineas).toEqual(base.lineas);
  });
  it("ignora una línea que no existe", () => {
    expect(correr(base, { tipo: "cambiarCantidad", clave: "x|1|grano", delta: 1 })).toBe(base);
  });
});

describe("actualizar", () => {
  it("cambia el tamaño o la molienda", () => {
    const e = correr(crearCarrito([L("a", 250, "grano", 2)]), { tipo: "actualizar", clave: "a|250|grano", cambios: { gramos: 500 } });
    expect(e.lineas).toEqual([L("a", 500, "grano", 2)]);
  });
  it("fusiona con una línea idéntica", () => {
    const base = crearCarrito([L("a", 250, "grano", 2), L("a", 500, "grano", 3), L("b", 250, "grano")]);
    const e = correr(base, { tipo: "actualizar", clave: "a|250|grano", cambios: { gramos: 500 } });
    expect(e.lineas).toEqual([L("a", 500, "grano", 5), L("b", 250, "grano")]);
  });
  it("la fusión respeta el máximo", () => {
    const base = crearCarrito([L("a", 250, "grano", 15), L("a", 500, "grano", 15)]);
    const e = correr(base, { tipo: "actualizar", clave: "a|250|grano", cambios: { gramos: 500 } });
    expect(e.lineas).toEqual([L("a", 500, "grano", 20)]);
  });
  it("ignora una línea que no existe", () => {
    const base = crearCarrito();
    expect(correr(base, { tipo: "actualizar", clave: "x|1|grano", cambios: { gramos: 500 } })).toBe(base);
  });
});

describe("eliminar, vaciar y deshacer", () => {
  const base = crearCarrito([L("a", 250, "grano"), L("b", 250, "molido", 2), L("c", 500, "grano")]);
  it("eliminar recuerda el estado anterior en su posición", () => {
    const e = correr(base, { tipo: "eliminar", clave: "b|250|molido" });
    expect(e.lineas.map((l) => l.cafeSlug)).toEqual(["a", "c"]);
    expect(correr(e, { tipo: "deshacer" }).lineas).toEqual(base.lineas);
  });
  it("vaciar se puede deshacer", () => {
    const e = correr(base, { tipo: "vaciar" });
    expect(e.lineas).toEqual([]);
    expect(correr(e, { tipo: "deshacer" }).lineas).toEqual(base.lineas);
  });
  it("vaciar un carrito vacío no hace nada", () => {
    const vacio = crearCarrito();
    expect(correr(vacio, { tipo: "vaciar" })).toBe(vacio);
  });
  it("eliminar una línea inexistente no hace nada", () => {
    expect(correr(base, { tipo: "eliminar", clave: "x|1|grano" })).toBe(base);
  });
  it("otra acción invalida el deshacer", () => {
    const e = correr(base, { tipo: "eliminar", clave: "a|250|grano" }, agregar("z"));
    expect(e.deshacer).toBeNull();
    expect(correr(e, { tipo: "deshacer" })).toBe(e);
  });
  it("deshacer sin nada que deshacer no cambia el estado", () => {
    expect(correr(base, { tipo: "deshacer" })).toBe(base);
  });
});

describe("reemplazar y depurar", () => {
  it("reemplazar depura las líneas nuevas", () => {
    const e = correr(crearCarrito(), { tipo: "reemplazar", lineas: [L("a", 250, "grano", 99), L("b", 250, "grano", 0)] });
    expect(e.lineas).toEqual([L("a", 250, "grano", 20)]);
  });
  it("depurarLineas quita inválidas, recorta y fusiona repetidas", () => {
    const lineas = [L("a", 250, "grano", 3), L("a", 250, "grano", 4), L("b", 250, "grano", 1.5), L("c", 250, "grano", -1), L("d", 250, "grano", 2)];
    expect(depurarLineas(lineas, (l) => l.cafeSlug !== "d")).toEqual([L("a", 250, "grano", 7)]);
  });
  it("claveLinea identifica café, tamaño y molienda", () => {
    expect(claveLinea(L("a", 250, "molido"))).toBe("a|250|molido");
  });
});
