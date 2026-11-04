import { describe, expect, it, vi } from "vitest";
import { CLAVE_CARRITO_V1, CLAVE_CARRITO_V2 } from "@/domain/pedido/persistencia";
import { CarritoLocal, type AlmacenTexto, type EscuchaStorage } from "./carrito-local";

function memoria(inicial: Record<string, string> = {}): AlmacenTexto & { datos: Record<string, string> } {
  const datos = { ...inicial };
  return {
    datos,
    getItem: (k) => datos[k] ?? null,
    setItem: (k, v) => void (datos[k] = v),
    removeItem: (k) => void delete datos[k],
  };
}

const linea = { cafeSlug: "cafe-oiba", gramos: 250, molienda: "grano" as const, cantidad: 2 };

describe("CarritoLocal", () => {
  it("empieza vacío", () => {
    expect(new CarritoLocal(memoria()).cargar()).toEqual({ version: 2, lineas: [] });
  });
  it("guarda y recupera con la clave v2", () => {
    const m = memoria();
    new CarritoLocal(m).guardar({ lineas: [linea], formaPago: "Transferencia Bre-B" });
    expect(Object.keys(m.datos)).toEqual([CLAVE_CARRITO_V2]);
    expect(new CarritoLocal(m).cargar()).toEqual({ version: 2, lineas: [linea], formaPago: "Transferencia Bre-B" });
  });
  it("migra el carrito de la v1 una sola vez y borra el viejo", () => {
    const v1 = JSON.stringify({ lines: [{ cafeId: 5, gramos: 250, molienda: "Grano entero", qty: 2 }], ciudad: "Cali", pago: "Efectivo contraentrega", sent: false });
    const m = memoria({ [CLAVE_CARRITO_V1]: v1 });
    const c = new CarritoLocal(m).cargar();
    expect(c.lineas).toEqual([linea]);
    expect(c.municipio).toBe("Cali");
    expect(m.datos[CLAVE_CARRITO_V1]).toBeUndefined();
    expect(JSON.parse(m.datos[CLAVE_CARRITO_V2]).lineas).toHaveLength(1);
  });
  it("el carrito v2 manda sobre el v1", () => {
    const m = memoria({ [CLAVE_CARRITO_V1]: '{"lines":[{"cafeId":1,"gramos":250,"molienda":"Molido","qty":1}]}' });
    new CarritoLocal(m).guardar({ lineas: [] });
    expect(new CarritoLocal(m).cargar().lineas).toEqual([]);
    expect(m.datos[CLAVE_CARRITO_V1]).toBeDefined();
  });
  it("respeta el máximo configurado", () => {
    const m = memoria();
    new CarritoLocal(m).guardar({ lineas: [{ ...linea, cantidad: 15 }] });
    expect(new CarritoLocal(m, null, 10).cargar().lineas[0].cantidad).toBe(10);
  });
  it("no falla si el almacenamiento lanza (modo privado)", () => {
    const roto: AlmacenTexto = {
      getItem: () => { throw new Error("denegado"); },
      setItem: () => { throw new Error("lleno"); },
      removeItem: () => { throw new Error("denegado"); },
    };
    const c = new CarritoLocal(roto);
    expect(c.cargar().lineas).toEqual([]);
    expect(() => c.guardar({ lineas: [linea] })).not.toThrow();
  });
  it("no falla si no se puede borrar el carrito v1", () => {
    const base = memoria({ [CLAVE_CARRITO_V1]: '{"lines":[{"cafeId":5,"gramos":250,"molienda":"Molido","qty":1}]}' });
    const sinBorrar: AlmacenTexto = { ...base, removeItem: () => { throw new Error("no"); } };
    expect(new CarritoLocal(sinBorrar).cargar().lineas).toHaveLength(1);
  });

  describe("suscribir", () => {
    function ventanaFalsa() {
      const escuchas = new Set<(e: { key: string | null }) => void>();
      const v: EscuchaStorage = {
        addEventListener: (_t, cb) => void escuchas.add(cb),
        removeEventListener: (_t, cb) => void escuchas.delete(cb),
      };
      return { v, emitir: (key: string | null) => escuchas.forEach((cb) => cb({ key })), escuchas };
    }
    it("avisa cuando cambia la clave v2 o se limpia todo, y no por otras claves", () => {
      const { v, emitir } = ventanaFalsa();
      const cb = vi.fn();
      new CarritoLocal(memoria(), v).suscribir(cb);
      emitir("otra");
      expect(cb).not.toHaveBeenCalled();
      emitir(CLAVE_CARRITO_V2);
      emitir(null);
      expect(cb).toHaveBeenCalledTimes(2);
    });
    it("deja de escuchar al cancelar", () => {
      const { v, escuchas } = ventanaFalsa();
      const cancelar = new CarritoLocal(memoria(), v).suscribir(() => {});
      expect(escuchas.size).toBe(1);
      cancelar();
      expect(escuchas.size).toBe(0);
    });
    it("sin ventana no hace nada", () => {
      const cancelar = new CarritoLocal(memoria()).suscribir(() => {});
      expect(() => cancelar()).not.toThrow();
    });
  });
});
