import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Foto } from "./superficies";

vi.mock("@/ui/manifiesto-fotos", () => ({
  MANIFIESTO_FOTOS: {
    "/fotos/cafes/cafe-x/1.jpg": { ancho: 2256, alto: 4000, anchos: [400, 800, 1200] },
    "/assets/fotografia/cafetal-montana.jpg": { ancho: 2000, alto: 1125, anchos: [400, 800, 1200] },
  },
}));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Foto", () => {
  it("con variantes: <picture> con AVIF y WebP, sizes del layout, JPEG de respaldo y medidas de la caja", () => {
    const html = renderToStaticMarkup(<Foto src="/fotos/cafes/cafe-x/1.jpg" alt="Bolsa" ancho={600} alto={800} tamanos="(min-width: 1024px) 360px, 100vw" />);
    expect(html).toContain("<picture>");
    expect(html).toContain('<source type="image/avif" srcSet="/fotos-optimizadas/cafes/cafe-x/1-400.avif 400w, /fotos-optimizadas/cafes/cafe-x/1-800.avif 800w, /fotos-optimizadas/cafes/cafe-x/1-1200.avif 1200w" sizes="(min-width: 1024px) 360px, 100vw"/>');
    expect(html).toContain('type="image/webp"');
    expect(html).toMatch(/<img src="\/fotos-optimizadas\/cafes\/cafe-x\/1-1200\.jpg" alt="Bolsa" width="600" height="800"/);
    expect(html).not.toContain('"/fotos/cafes/cafe-x/1.jpg"');
  });

  it("sin prioridad carga diferida; con prioridad, inmediata y fetchpriority alta", () => {
    const diferida = renderToStaticMarkup(<Foto src="/fotos/cafes/cafe-x/1.jpg" alt="" ancho={1} alto={1} />);
    expect(diferida).toContain('loading="lazy"');
    expect(diferida).not.toContain("fetchPriority");
    const principal = renderToStaticMarkup(<Foto src="/fotos/cafes/cafe-x/1.jpg" alt="" ancho={1} alto={1} prioridad />);
    expect(principal).toContain('loading="eager"');
    expect(principal).toContain('fetchPriority="high"');
    expect(principal).not.toContain('loading="lazy"');
  });

  it("respeta el basePath de GitHub Pages en srcset y src", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/coffee-santander-shop");
    const html = renderToStaticMarkup(<Foto src="/fotos/cafes/cafe-x/1.jpg" alt="" ancho={1} alto={1} />);
    expect(html).toContain('srcSet="/coffee-santander-shop/fotos-optimizadas/cafes/cafe-x/1-400.avif 400w');
    expect(html).toContain('src="/coffee-santander-shop/fotos-optimizadas/cafes/cafe-x/1-1200.jpg"');
  });

  it("sin variantes (Sanity o foto local fuera del manifiesto) usa un <img> simple", () => {
    const externa = renderToStaticMarkup(<Foto src="https://cdn.sanity.io/images/x.jpg" alt="" ancho={1} alto={1} />);
    expect(externa).not.toContain("<picture>");
    expect(externa).toContain('src="https://cdn.sanity.io/images/x.jpg"');
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/repo");
    const local = renderToStaticMarkup(<Foto src="/assets/otra/foto.jpg" alt="" ancho={1} alto={1} />);
    expect(local).not.toContain("<picture>");
    expect(local).toContain('src="/repo/assets/otra/foto.jpg"');
  });

  it("las fotos de public/assets/fotografia/ también salen en <picture> con variantes que conservan el nombre", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/repo");
    const html = renderToStaticMarkup(<Foto src="/assets/fotografia/cafetal-montana.jpg" alt="Montañas" ancho={2000} alto={1125} />);
    expect(html).toContain("<picture>");
    expect(html).toContain('srcSet="/repo/fotos-optimizadas/assets/fotografia/cafetal-montana-400.avif 400w');
    expect(html).toContain('src="/repo/fotos-optimizadas/assets/fotografia/cafetal-montana-1200.jpg"');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain('"/repo/assets/fotografia/cafetal-montana.jpg"');
  });
});
