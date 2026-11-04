import { describe, expect, it } from "vitest";
import { colocarPines, colocarRotulos, type PinEntrada } from "./etiquetas";
import { calcularEncuadre, escalaGrafica, formatearGrados, interpolarCaja, proyectar, unirCajas } from "./geometria";
import type { CajaMapa, ProyeccionMapa } from "./tipos";

const proyeccion: ProyeccionMapa = { lon0: -73.5, lat0: 6.9, cos: 0.99, k: 500, dx: 524, dy: 623 };
const completo: CajaMapa = [0, 0, 1000, 1200];

describe("geometría del mapa", () => {
  it("proyecta el centro a (dx, dy)", () => {
    expect(proyectar(proyeccion, -73.5, 6.9)).toEqual([524, 623]);
  });
  it("hacia el norte y el este", () => {
    const [x, y] = proyectar(proyeccion, -73.0, 7.4);
    expect(x).toBeGreaterThan(524);
    expect(y).toBeLessThan(623);
  });
  it("formatea grados y minutos", () => {
    expect(formatearGrados(6.637)).toBe("6°38′");
    expect(formatearGrados(-73.2)).toBe("73°12′");
    expect(formatearGrados(6.9999)).toBe("7°00′");
  });
  it("une cajas", () => {
    expect(unirCajas([])).toBeNull();
    expect(unirCajas([[0, 0, 10, 10], [20, 5, 10, 10]])).toEqual([0, 0, 30, 15]);
  });
  it("sin provincias elegidas encuadra todo (una copia)", () => {
    const e = calcularEncuadre(completo, []);
    expect(e).toEqual(completo);
    expect(e).not.toBe(completo);
  });
  it("una provincia: centrada, con margen y la proporción del mapa", () => {
    const [x, y, w, h] = calcularEncuadre(completo, [[400, 500, 200, 300]]);
    expect(w / h).toBeCloseTo(1000 / 1200, 5);
    expect(x + w / 2).toBeCloseTo(500, 5);
    expect(y + h / 2).toBeCloseTo(650, 5);
    expect(h).toBeGreaterThanOrEqual(300 * 1.35 - 0.001);
  });
  it("no se acerca a menos del 40 % del ancho", () => {
    const [, , w] = calcularEncuadre(completo, [[500, 500, 10, 10]]);
    expect(w).toBeCloseTo(400, 5);
  });
  it("una caja ancha ajusta el alto", () => {
    const [, , w, h] = calcularEncuadre(completo, [[0, 500, 900, 100]]);
    expect(w).toBeCloseTo(900 * 1.35, 5);
    expect(h).toBeCloseTo(w * 1.2, 5);
  });
  it("interpola de forma suave y acotada", () => {
    const a: CajaMapa = [0, 0, 100, 100];
    const b: CajaMapa = [100, 100, 50, 50];
    expect(interpolarCaja(a, b, 0)).toEqual(a);
    expect(interpolarCaja(a, b, 1)).toEqual(b);
    expect(interpolarCaja(a, b, 2)).toEqual(b);
    expect(interpolarCaja(a, b, -1)).toEqual(a);
    expect(interpolarCaja(a, b, 0.5)[0]).toBeGreaterThan(50);
  });
  it("escala gráfica: elige un paso redondo", () => {
    const e = escalaGrafica(proyeccion, 1000, 500);
    expect([5, 10, 20, 25, 50, 100]).toContain(e.km);
    expect(e.anchoPx).toBeGreaterThan(0);
    expect(escalaGrafica(proyeccion, 1000, 100000).km).toBe(5);
    expect(escalaGrafica(proyeccion, 1000, 10).km).toBe(100);
  });
});

const pin = (x: number, y: number, extra: Partial<PinEntrada> = {}): PinEntrada => ({ x, y, ancho: 60, alto: 16, preferirIzquierda: false, ...extra });

describe("colocarPines", () => {
  it("el nombre va a la derecha si cabe", () => {
    const { pines } = colocarPines([pin(100, 100)], 400, 300);
    expect(pines[0]).toMatchObject({ visible: true, lado: "derecha", izquierda: 87, arriba: 92 });
  });
  it("prefiere la izquierda cuando se pide", () => {
    const { pines } = colocarPines([pin(300, 100, { preferirIzquierda: true })], 400, 300);
    expect(pines[0].lado).toBe("izquierda");
  });
  it("cambia de lado si no cabe en el preferido", () => {
    expect(colocarPines([pin(380, 100)], 400, 300).pines[0].lado).toBe("izquierda");
    expect(colocarPines([pin(20, 100, { preferirIzquierda: true })], 400, 300).pines[0].lado).toBe("derecha");
  });
  it("queda solo el punto si no hay sitio", () => {
    const { pines } = colocarPines([pin(30, 100, { ancho: 500 })], 400, 300);
    expect(pines[0].lado).toBe("compacto");
  });
  it("dos pines cercanos no se pisan los nombres", () => {
    const { pines } = colocarPines([pin(100, 100), pin(110, 102)], 400, 300);
    expect(pines.every((p) => p.visible)).toBe(true);
    expect(pines.filter((p) => p.lado === "derecha").length).toBeLessThan(2);
  });
  it("oculta los que quedan fuera del marco", () => {
    const { pines, ocupadas } = colocarPines([pin(-50, 10), pin(100, 500)], 400, 300);
    expect(pines.every((p) => !p.visible)).toBe(true);
    expect(ocupadas).toEqual([]);
  });
});

describe("colocarRotulos", () => {
  it("centra el nombre de la provincia", () => {
    const [r] = colocarRotulos([{ cx: 200, cy: 150, ancho: 80, alto: 14, atenuado: false }], [], 400, 300);
    expect(r).toEqual({ oculto: false, izquierda: 160, arriba: 143 });
  });
  it("lo baja o sube si choca", () => {
    const ocupadas = [{ x0: 100, x1: 300, y0: 140, y1: 160 }];
    const [r] = colocarRotulos([{ cx: 200, cy: 150, ancho: 80, alto: 14, atenuado: false }], ocupadas, 400, 300);
    expect(r.oculto).toBe(false);
    expect(r.arriba).not.toBe(143);
  });
  it("se oculta si no cabe, está fuera o está atenuado", () => {
    const todo = [{ x0: 0, x1: 400, y0: 0, y1: 300 }];
    expect(colocarRotulos([{ cx: 200, cy: 150, ancho: 80, alto: 14, atenuado: false }], todo, 400, 300)[0].oculto).toBe(true);
    expect(colocarRotulos([{ cx: -5, cy: 150, ancho: 80, alto: 14, atenuado: false }], [], 400, 300)[0].oculto).toBe(true);
    expect(colocarRotulos([{ cx: 200, cy: 150, ancho: 80, alto: 14, atenuado: true }], [], 400, 300)[0].oculto).toBe(true);
  });
  it("no se sale del marco por los lados", () => {
    const [r] = colocarRotulos([{ cx: 5, cy: 150, ancho: 80, alto: 14, atenuado: false }], [], 400, 300);
    expect(r.izquierda).toBe(4);
  });
  it("registra su sitio para los siguientes", () => {
    const ocupadas: { x0: number; x1: number; y0: number; y1: number }[] = [];
    colocarRotulos([{ cx: 200, cy: 150, ancho: 80, alto: 14, atenuado: false }], ocupadas, 400, 300);
    expect(ocupadas).toHaveLength(1);
  });
});
