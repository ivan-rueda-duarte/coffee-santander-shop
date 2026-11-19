import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { crearCafe } from "@/domain/pruebas/fixtures";
import { BloqueCompra } from "./bloque-compra";

vi.mock("../carrito/carrito-provider", () => ({ useCarrito: () => ({ agregar: () => undefined }) }));
vi.mock("@/ui/hooks/use-catalogo", () => ({ useCatalogo: () => ({ catalogo: { tienda: { maxCantidad: 20, ivaTarifa: 5, whatsapp: "573001129874" } } }) }));

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

  it("todo agotado (LEG-184 alternativa y LEG-186): precio por tamaño, IVA, presentaciones como texto, sin cantidad ni total y aviso con wa.me", () => {
    const cafe = crearCafe({
      slug: "cafe-z",
      nombre: "Café Z",
      moliendas: ["grano", "molido"],
      presentaciones: [
        { gramos: 250, precioCop: 25000, disponible: false },
        { gramos: 500, precioCop: 50000, disponible: false },
      ],
    });
    const html = renderToStaticMarkup(<BloqueCompra cafe={cafe} />);
    // Precio sin tachar y «Agotado» debajo, en cada píldora.
    expect(html).toMatch(/250 g<small class="text-xs font-medium">\$\s?25\.000<\/small><small class="text-xs font-medium">Agotado<\/small>/);
    expect(html).toMatch(/500 g<small class="text-xs font-medium">\$\s?50\.000<\/small><small class="text-xs font-medium">Agotado<\/small>/);
    expect(html).not.toContain("line-through");
    expect(html).toContain('data-testid="leyenda-iva"');
    // Presentaciones como dato, sin radios de molienda.
    expect(html).not.toContain('name="molienda"');
    expect(html).toMatch(/data-testid="presentaciones-agotado"><span class="ds-tag">Grano<\/span><span class="ds-tag">Molido<\/span>/);
    expect(html).toContain('data-testid="ayuda-molienda"');
    // Sin compra simulada.
    expect(html).not.toContain("Cantidad de bolsas");
    expect(html).not.toContain("1 × 250 g");
    expect(html).not.toContain("Hasta 20 bolsas");
    expect(html).not.toContain('data-testid="plazo-ficha"');
    // Botón «Agotado» deshabilitado y aviso con enlace wa.me sin texto precargado.
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Agotado<\/button>/);
    expect(html).toContain("Este café está agotado por ahora.");
    expect(html).toContain('href="https://wa.me/573001129874"');
    expect(html).toMatch(/>Escríbenos por WhatsApp<\/a> y te avisamos cuando vuelva\./);
  });

  it("agotado parcial: conserva cantidad, total, nota de máximo y plazo; sin aviso de agotado ni precio extra en la píldora agotada", () => {
    const cafe = crearCafe({
      slug: "cafe-w",
      nombre: "Café W",
      presentaciones: [
        { gramos: 250, precioCop: 25000, disponible: false },
        { gramos: 500, precioCop: 50000, disponible: true },
      ],
    });
    const html = renderToStaticMarkup(<BloqueCompra cafe={cafe} />);
    expect(html).toContain("Cantidad de bolsas");
    expect(html).toContain("Hasta 20 bolsas");
    expect(html).toContain('data-testid="plazo-ficha"');
    expect(html).toContain('name="molienda"');
    expect(html).not.toContain('data-testid="aviso-agotado"');
    expect(html).toContain('250 g<small class="text-xs font-medium">Agotado</small>');
  });

  it("un solo aria-live: la región oculta dice cantidad, tamaño, presentación y total; cantidad y precio visibles no la llevan", () => {
    const cafe = crearCafe({ slug: "cafe-v", nombre: "Café V", presentaciones: [{ gramos: 250, precioCop: 25000, disponible: true }] });
    const html = renderToStaticMarkup(<BloqueCompra cafe={cafe} />);
    expect(html.match(/aria-live=/g)).toHaveLength(1);
    expect(html).toMatch(/<p class="sr-only" aria-live="polite" data-testid="anuncio-compra">1 bolsa de 250 g, grano: \$\s?25\.000<\/p>/);
  });
});
