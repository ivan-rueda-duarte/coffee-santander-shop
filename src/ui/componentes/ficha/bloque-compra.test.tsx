import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { crearCafe } from "@/domain/pruebas/fixtures";
import { BloqueCompra } from "./bloque-compra";

vi.mock("../carrito/carrito-provider", () => ({ useCarrito: () => ({ agregar: () => undefined }) }));
vi.mock("@/ui/hooks/use-catalogo", () => ({ useCatalogo: () => ({ catalogo: { tienda: { maxCantidad: 20, ivaTarifa: 5 } } }) }));

/** Las píldoras de tamaño (radio name="gramos"), en orden: valor, marcada, deshabilitada y clases de su <label> y <span>. */
function pildorasTamano(html: string) {
  const re = /<label class="([^"]*)"><input ([^>]*name="gramos"[^>]*)\/><span class="([^"]*)">/g;
  return [...html.matchAll(re)].map((m) => ({
    gramos: Number(/value="(\d+)"/.exec(m[2])?.[1]),
    marcada: /checked=""/.test(m[2]),
    deshabilitada: /disabled=""/.test(m[2]),
    label: m[1],
    span: m[3],
  }));
}

describe("BloqueCompra: píldoras de tamaño agotadas (diseño 2026-11-18, media)", () => {
  it("agotado parcial: la primera disponible sale marcada; la agotada, deshabilitada, sin opacidad y con borde punteado", () => {
    const cafe = crearCafe({
      slug: "cafe-x",
      nombre: "Café X",
      presentaciones: [
        { gramos: 250, precioCop: 25000, disponible: false },
        { gramos: 500, precioCop: 50000, disponible: true },
      ],
    });
    const [p250, p500] = pildorasTamano(renderToStaticMarkup(<BloqueCompra cafe={cafe} />));
    expect(p250).toMatchObject({ gramos: 250, marcada: false, deshabilitada: true });
    expect(p500).toMatchObject({ gramos: 500, marcada: true, deshabilitada: false });
    expect(p250.label).toBe("cursor-not-allowed");
    expect(p250.span).toContain("peer-disabled:!border-dashed");
    expect(p250.span).toContain("peer-disabled:!border-line-strong");
    expect(p250.span).toContain("peer-disabled:!text-ink-muted");
  });

  it("todo agotado: ninguna píldora sale marcada y «Agotado» no lleva opacidad", () => {
    const cafe = crearCafe({
      slug: "cafe-y",
      nombre: "Café Y",
      presentaciones: [
        { gramos: 250, precioCop: 25000, disponible: false },
        { gramos: 500, precioCop: 50000, disponible: false },
      ],
    });
    const html = renderToStaticMarkup(<BloqueCompra cafe={cafe} />);
    const pildoras = pildorasTamano(html);
    expect(pildoras).toHaveLength(2);
    expect(pildoras.every((p) => p.deshabilitada && !p.marcada)).toBe(true);
    expect(pildoras.every((p) => !p.label.includes("opacity"))).toBe(true);
    expect(html).toContain('<small class="text-xs font-medium">Agotado</small>');
    expect(html).not.toMatch(/opacity-80">Agotado/);
  });
});
