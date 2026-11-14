import { describe, expect, it } from "vitest";
import { historiaRespaldo } from "./historia-respaldo";

const completo = { provincia: "Guanentá", municipio: "Socorro", alturaMsnm: 1500, variedades: ["Castillo"], proceso: "Lavado" };

describe("historiaRespaldo (LEG-139)", () => {
  it("variante B sin marca y fabricante", () => {
    const [p1, p2] = historiaRespaldo([completo, completo], "Bucaramanga");
    expect(p1).toContain("cada uno tal como lo empaca su fabricante");
    expect(p2).toBe("Desde Bucaramanga los enviamos a todo Colombia. En cada café te contamos de dónde viene: la provincia, el municipio, la altitud, la variedad y el proceso.");
  });
  it("texto del paquete del abogado (D5 §6.1) si todos traen marca, fabricante y datos de origen (LEG-154)", () => {
    const c = { ...completo, marca: "M", fabricante: "F" };
    expect(historiaRespaldo([c, c], "Bucaramanga")).toEqual([
      "De Santander es una tienda de café de origen santandereano. Vendemos café de marcas de Santander, tostado y empacado por quien figura en cada bolsa y en cada ficha, y lo despachamos desde Bucaramanga a todo Colombia.",
      "En cada café verás la marca, quién lo fabrica, la provincia, el municipio, la altitud, la variedad y el proceso.",
    ]);
  });
  it("con marca y fabricante pero sin un dato de origen en algún café, sigue la variante B", () => {
    const c = { ...completo, marca: "M", fabricante: "F" };
    const [p1, p2] = historiaRespaldo([c, { ...c, alturaMsnm: null }], "Bucaramanga");
    expect(p1).toContain("cada uno tal como lo empaca su fabricante");
    expect(p2).not.toContain("la marca");
  });
  it("si un café no trae fabricante (D-11), variante B", () => {
    const [p1] = historiaRespaldo([{ ...completo, marca: "M", fabricante: "F" }, { ...completo, marca: "M" }], "Bucaramanga");
    expect(p1).toContain("cada uno tal como lo empaca su fabricante");
  });
  it("omite el dato que no traen todos los cafés", () => {
    const [, p2] = historiaRespaldo([completo, { ...completo, alturaMsnm: null }], "Bucaramanga");
    expect(p2).not.toContain("la altitud");
    expect(p2).toContain("la provincia, el municipio, la variedad y el proceso");
  });
});
