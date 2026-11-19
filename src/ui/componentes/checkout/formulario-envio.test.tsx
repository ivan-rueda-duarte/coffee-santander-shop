import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ENVIO_VACIO, FormularioEnvio } from "./formulario-envio";

/** Ids de los campos con aria-required="true", en el orden del formulario. */
function requeridos(html: string) {
  return [...html.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((t) => t.includes('aria-required="true"'))
    .map((t) => /id="([^"]+)"/.exec(t)?.[1]);
}

describe("FormularioEnvio: campos obligatorios", () => {
  it("aria-required solo en los obligatorios y sin `required` (la validación es propia)", () => {
    const html = renderToStaticMarkup(<FormularioEnvio valores={ENVIO_VACIO} errores={{}} envioGratis={null} alCambiar={() => undefined} />);
    expect(requeridos(html)).toEqual(["nombre", "celular", "departamento", "municipio", "direccion"]);
    expect(html).not.toMatch(/\srequired=""/);
  });
});
