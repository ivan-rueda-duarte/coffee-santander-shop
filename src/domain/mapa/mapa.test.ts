import { describe, expect, it } from "vitest";
import { colocarPines, colocarRotulos, RESERVA_PUNTO, type PinEntrada } from "./etiquetas";
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
  it("el punto reserva ± 11 px: ningún rótulo queda a menos de 2 px de él (revisión visual de QA-032)", () => {
    expect(RESERVA_PUNTO).toBe(11);
    const { pines, ocupadas } = colocarPines([pin(200, 150)], 400, 300);
    expect(ocupadas[0]).toEqual({ x0: 189, x1: 211, y0: 139, y1: 161 });
    // El nombre del pin no se mueve: sigue empezando en x + 14.
    expect(pines[0]).toMatchObject({ lado: "derecha", izquierda: 187 });
    expect(ocupadas[1].x0).toBe(214);
    // El punto pintado ocupa ± 9 px (16 px, borde y sombra de 1 px). Un rótulo que llega por la izquierda se queda
    // a 2 px o más de él, por cualquier lado y a cualquier altura.
    const punto = { x0: 191, x1: 209, y0: 141, y1: 159 };
    for (let cy = 100; cy <= 200; cy++) {
      const [r] = colocarRotulos([{ cx: 160, cy, ancho: 80, alto: 14, atenuado: false }], [ocupadas[0]], 400, 300);
      if (r.oculto) continue;
      const caja = { x0: r.izquierda, x1: r.izquierda + 80, y0: r.arriba, y1: r.arriba + 14 };
      const sep = Math.max(punto.x0 - caja.x1, caja.x0 - punto.x1, punto.y0 - caja.y1, caja.y0 - punto.y1);
      expect(sep).toBeGreaterThanOrEqual(2);
    }
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
    expect(r).toEqual({ oculto: false, izquierda: 160, arriba: 143, desplazamientoX: 0 });
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
  // QA-032: «VÉLEZ» y «COMUNERA» no chocaban por el nombre, pero sí por sus «Próximamente», más anchos que «VÉLEZ».
  it("dos rótulos no se pisan por la segunda línea, más ancha que el nombre (QA-032)", () => {
    const velez = { cx: 100, cy: 150, ancho: 48, anchoCaja: 85, alto: 26, atenuado: false };
    const comunera = { cx: 175, cy: 150, ancho: 77, anchoCaja: 85, alto: 26, atenuado: false };
    // Sin la segunda línea las cajas de los nombres (76–124 y 136,5–213,5) no chocan y quedan a la misma altura.
    const sinCaja = colocarRotulos([{ ...comunera, anchoCaja: undefined }, { ...velez, anchoCaja: undefined }], [], 400, 300);
    expect(sinCaja.map((r) => r.arriba)).toEqual([137, 137]);
    const [c, v] = colocarRotulos([comunera, velez], [], 400, 300);
    expect(c).toEqual({ oculto: false, izquierda: 137, arriba: 137, desplazamientoX: 0 });
    expect(v.oculto).toBe(false);
    expect(v.izquierda).toBe(76);
    expect(v.arriba).toBe(177); // ±20 aún cruza (26 px de alto): baja 40
    // Las cajas pintadas (con «Próximamente») ya no se cruzan.
    const cruza = v.izquierda + 85 > c.izquierda && c.izquierda + 85 > v.izquierda && v.arriba + 26 > c.arriba && c.arriba + 26 > v.arriba;
    expect(cruza).toBe(false);
  });
  it("si ningún sitio en vertical sirve, se corre a un lado antes de ocultarse (QA-032)", () => {
    // Una franja ocupada de arriba abajo a la derecha del centro; el rótulo cabe 20 px más a la izquierda.
    const ocupadas = [{ x0: 235, x1: 260, y0: 0, y1: 300 }];
    const [r] = colocarRotulos([{ cx: 200, cy: 150, ancho: 80, alto: 14, atenuado: false }], ocupadas, 400, 300);
    expect(r).toEqual({ oculto: false, izquierda: 140, arriba: 143, desplazamientoX: -20 });
    // Si tampoco cabe a los lados, se oculta.
    const todo = [{ x0: 0, x1: 400, y0: 0, y1: 300 }];
    expect(colocarRotulos([{ cx: 200, cy: 150, ancho: 80, alto: 14, atenuado: false }], todo, 400, 300)[0]).toEqual({ oculto: true, izquierda: 0, arriba: 0, desplazamientoX: 0 });
  });
  it("las provincias con cafés buscan sitio antes que las vacías; la salida conserva el orden (revisión visual de QA-032)", () => {
    // Las dos quieren el mismo sitio y solo cabe una: la vacía va primero en la entrada, pero gana la que tiene cafés.
    const ocupadas = [
      { x0: 0, x1: 400, y0: 0, y1: 140 },
      { x0: 0, x1: 400, y0: 160, y1: 300 },
    ];
    const vacia = { cx: 200, cy: 150, ancho: 80, alto: 14, atenuado: false, vacia: true };
    const conCafes = { cx: 210, cy: 150, ancho: 80, alto: 14, atenuado: false, vacia: false };
    const [v, c] = colocarRotulos([vacia, conCafes], [...ocupadas], 400, 300);
    expect(v.oculto).toBe(true);
    expect(c).toEqual({ oculto: false, izquierda: 170, arriba: 143, desplazamientoX: 0 });
    // Sin `vacia`, cuenta como provincia con cafés y manda el orden de la entrada.
    const [a, b] = colocarRotulos([{ ...vacia, vacia: undefined }, conCafes], [...ocupadas], 400, 300);
    expect([a.oculto, b.oculto]).toEqual([false, true]);
  });
  it("dentro de cada grupo se respeta el orden de la entrada", () => {
    const ocupadas = [
      { x0: 0, x1: 400, y0: 0, y1: 140 },
      { x0: 0, x1: 400, y0: 160, y1: 300 },
    ];
    const r = (cx: number, vacia: boolean) => ({ cx, cy: 150, ancho: 80, alto: 14, atenuado: false, vacia });
    const salida = colocarRotulos([r(200, true), r(190, false), r(210, true), r(205, false)], [...ocupadas], 400, 300);
    expect(salida.map((x) => x.oculto)).toEqual([true, false, true, true]);
  });
  it("con `anchoCaja` menor que el nombre o sin ella, la posición no cambia", () => {
    const base = { cx: 200, cy: 150, ancho: 80, alto: 14, atenuado: false };
    const ocupadas = [{ x0: 270, x1: 300, y0: 140, y1: 160 }];
    expect(colocarRotulos([{ ...base, anchoCaja: 40 }], [...ocupadas], 400, 300)).toEqual(colocarRotulos([base], [...ocupadas], 400, 300));
    expect(colocarRotulos([base], [...ocupadas], 400, 300)[0].arriba).toBe(143);
    // La misma caja ocupada, alcanzada solo por una segunda línea de 120 px, sí lo mueve.
    expect(colocarRotulos([{ ...base, anchoCaja: 120 }], [...ocupadas], 400, 300)[0].arriba).not.toBe(143);
  });
});
