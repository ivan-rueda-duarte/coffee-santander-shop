import { describe, expect, it } from "vitest";
import manifiestoReal from "@/data/fotos-responsivas.json";
import { anchosParaGenerar, fuentesFoto, rutaRespaldo, rutaVariante, type ManifiestoFotos } from "./fotos-responsivas";

const MANIFIESTO: ManifiestoFotos = {
  "/fotos/cafes/cafe-x/1.jpg": { ancho: 2256, alto: 4000, anchos: [400, 800, 1200] },
  "/fotos/cafes/cafe-x/chica.png": { ancho: 600, alto: 800, anchos: [400, 600] },
};

describe("anchosParaGenerar", () => {
  it("genera 400/800/1200 para fotos grandes, sin repetir el mayor", () => {
    expect(anchosParaGenerar(2256)).toEqual([400, 800, 1200]);
    expect(anchosParaGenerar(1200)).toEqual([400, 800, 1200]);
  });
  it("no amplía: una foto más angosta usa su ancho real como mayor", () => {
    expect(anchosParaGenerar(1000)).toEqual([400, 800, 1000]);
    expect(anchosParaGenerar(600)).toEqual([400, 600]);
    expect(anchosParaGenerar(400)).toEqual([400]);
    expect(anchosParaGenerar(250)).toEqual([250]);
  });
  it("rechaza anchos no válidos", () => {
    expect(() => anchosParaGenerar(0)).toThrow();
    expect(() => anchosParaGenerar(12.5)).toThrow();
  });
});

describe("rutaVariante", () => {
  it("refleja la carpeta de public/fotos/ en public/fotos-optimizadas/ con ancho y extensión", () => {
    expect(rutaVariante("/fotos/cafes/cafe-x/1.jpg", 800, "webp")).toBe("/fotos-optimizadas/cafes/cafe-x/1-800.webp");
    expect(rutaVariante("/fotos/cafes/cafe-x/foto.v2.JPEG", 400, "avif")).toBe("/fotos-optimizadas/cafes/cafe-x/foto.v2-400.avif");
  });
  it("solo acepta fotos de public/fotos/", () => {
    expect(() => rutaVariante("/assets/fotografia/cafetal.jpg", 400, "webp")).toThrow(/public\/fotos/);
  });
});

describe("fuentesFoto", () => {
  it("arma un <source> AVIF y uno WebP con descriptores de ancho y un JPEG de respaldo del ancho mayor", () => {
    expect(fuentesFoto("/fotos/cafes/cafe-x/1.jpg", MANIFIESTO)).toEqual({
      fuentes: [
        { tipo: "image/avif", srcSet: "/fotos-optimizadas/cafes/cafe-x/1-400.avif 400w, /fotos-optimizadas/cafes/cafe-x/1-800.avif 800w, /fotos-optimizadas/cafes/cafe-x/1-1200.avif 1200w" },
        { tipo: "image/webp", srcSet: "/fotos-optimizadas/cafes/cafe-x/1-400.webp 400w, /fotos-optimizadas/cafes/cafe-x/1-800.webp 800w, /fotos-optimizadas/cafes/cafe-x/1-1200.webp 1200w" },
      ],
      src: "/fotos-optimizadas/cafes/cafe-x/1-1200.jpg",
    });
  });
  it("aplica el prefijo (basePath de GitHub Pages) a cada ruta", () => {
    const r = fuentesFoto("/fotos/cafes/cafe-x/chica.png", MANIFIESTO, (ruta) => `/repo${ruta}`);
    expect(r?.src).toBe("/repo/fotos-optimizadas/cafes/cafe-x/chica-600.jpg");
    expect(r?.fuentes[1].srcSet).toBe("/repo/fotos-optimizadas/cafes/cafe-x/chica-400.webp 400w, /repo/fotos-optimizadas/cafes/cafe-x/chica-600.webp 600w");
  });
  it("devuelve null sin variantes (URL de Sanity, foto sin generar o claves del prototipo)", () => {
    expect(fuentesFoto("https://cdn.sanity.io/images/x.jpg", MANIFIESTO)).toBeNull();
    expect(fuentesFoto("/fotos/cafes/cafe-x/nueva.jpg", MANIFIESTO)).toBeNull();
    expect(fuentesFoto("constructor", MANIFIESTO)).toBeNull();
    expect(fuentesFoto("/fotos/vacia.jpg", { "/fotos/vacia.jpg": { ancho: 1, alto: 1, anchos: [] } })).toBeNull();
  });
});

describe("rutaRespaldo", () => {
  it("usa el JPEG redimensionado y, si no hay variantes, la ruta original", () => {
    expect(rutaRespaldo("/fotos/cafes/cafe-x/1.jpg", MANIFIESTO)).toBe("/fotos-optimizadas/cafes/cafe-x/1-1200.jpg");
    expect(rutaRespaldo("/fotos/cafes/cafe-x/nueva.jpg", MANIFIESTO)).toBe("/fotos/cafes/cafe-x/nueva.jpg");
  });
});

describe("manifiesto versionado (src/data/fotos-responsivas.json)", () => {
  it("cada entrada es coherente con anchosParaGenerar y está en public/fotos/", () => {
    for (const [ruta, entrada] of Object.entries(manifiestoReal as ManifiestoFotos)) {
      expect(ruta.startsWith("/fotos/")).toBe(true);
      expect(entrada.anchos).toEqual(anchosParaGenerar(entrada.ancho));
      expect(entrada.alto).toBeGreaterThan(0);
    }
  });
});
