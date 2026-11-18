import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { VistaCatalogo } from "@/application/casos-uso/obtener-catalogo";
import { CAFES_PRUEBA } from "@/domain/pruebas/fixtures";
import { ComoPedir, Historia, Portada, Titular } from "./secciones-inicio";

// Solo los campos que leen las tres secciones del inicio.
const catalogo = {
  cafes: CAFES_PRUEBA,
  tienda: { ciudadDespacho: "Bucaramanga", maxCantidad: 20, whatsapp: "573001129874" },
  envios: { envioGratis: null, finEnvioGratis: null },
} as unknown as VistaCatalogo;

/** Cada aria-labelledby del HTML apunta a un id que existe en el mismo HTML. */
function referenciasRotas(html: string): string[] {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  return [...html.matchAll(/aria-labelledby="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((id) => !ids.has(id));
}

describe("secciones del inicio (M5)", () => {
  it("Titular lleva el id que recibe", () => {
    expect(renderToStaticMarkup(<Titular id="t" antes="Cómo" remate="pedir" />)).toBe('<h2 id="t">Cómo <em class="font-normal">pedir</em></h2>');
  });

  it.each([
    ["Portada", <Portada key="p" catalogo={catalogo} contenido={null} />, "titulo-portada"],
    ["ComoPedir", <ComoPedir key="c" catalogo={catalogo} contenido={null} />, "titulo-pedir"],
    ["Historia", <Historia key="h" catalogo={catalogo} contenido={null} />, "titulo-historia"],
  ])("%s: aria-labelledby apunta a su titular", (_nombre, elemento, id) => {
    const html = renderToStaticMarkup(elemento);
    expect(html).toContain(`aria-labelledby="${id}"`);
    expect(html).toMatch(new RegExp(`<h[12] id="${id}"`));
    expect(referenciasRotas(html)).toEqual([]);
  });
});
