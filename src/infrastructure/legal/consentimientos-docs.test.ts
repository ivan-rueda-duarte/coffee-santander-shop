import { describe, expect, it } from "vitest";
import { avisoPrivacidad, casillaDatos, casillaPromocionesCorreo, casillaPromocionesWhatsapp, casillaTerminos } from "@/domain/legal/consentimientos";
import { sustituirValores, valoresTextoLegal } from "@/domain/legal/texto-legal";
import { formatearWhatsapp } from "@/domain/pedido/mensaje-whatsapp";
import { cargarCatalogoDesdeDisco } from "../csv/repositorio-catalogo-csv";
import { leerDocsLegalesDesdeDisco } from "./legal-md";

// Las casillas y el aviso de privacidad del sitio deben ser, letra por letra, los de docs/legal/politica-tratamiento-datos.md
// («Textos de las casillas» y «Aviso de privacidad»), con los valores de data/config.csv (LEG-145).
const md = leerDocsLegalesDesdeDisco()("politica-tratamiento-datos.md");
const { tienda } = cargarCatalogoDesdeDisco().catalogo;
const valores = valoresTextoLegal(tienda.legal);
/** Citas «> » del documento, sin el símbolo de la casilla y con las llaves sustituidas. */
const citas = md
  .split(/\r?\n/)
  .filter((l) => l.startsWith("> ") && !l.startsWith("> BORRADOR"))
  .map((l) => sustituirValores(l.slice(2).replace(/^☐\s*/, ""), valores));
const unir = (t: readonly [string, string, string]) => t.join("");
const razon = tienda.vendedor.razonSocial!;

describe("casillas y aviso de privacidad = documento de legal (D2, D5 §6.3)", () => {
  it("casilla 1, términos, con versión 1.0 del 17 de noviembre de 2026", () => {
    const t = unir(casillaTerminos(tienda.legal));
    expect(citas).toContain(t);
    expect(t).toBe("Leí y acepto los Términos y condiciones versión 1.0 del 17 de noviembre de 2026.");
  });
  it("casilla 2, datos", () => {
    expect(citas).toContain(unir(casillaDatos(tienda.legal, razon)));
  });
  it("casillas 3 y 4, promociones", () => {
    expect(citas).toContain(casillaPromocionesWhatsapp(razon));
    expect(citas).toContain(casillaPromocionesCorreo(razon, tienda.vendedor.correoContacto!));
  });
  it("aviso de privacidad, con la ruta de la política", () => {
    const aviso = avisoPrivacidad(tienda.vendedor, formatearWhatsapp(tienda.whatsapp));
    expect(aviso).not.toBeNull();
    expect(citas).toContain(unir(aviso!));
    expect(aviso![1]).toBe("/legal/privacidad/");
  });
  it("sin un dato del vendedor, no hay aviso incompleto", () => {
    expect(avisoPrivacidad({ ...tienda.vendedor, nit: null }, "+57 300 112 9874")).toBeNull();
  });
});
