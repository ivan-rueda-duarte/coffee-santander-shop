import { describe, expect, it } from "vitest";
import { hoyEnColombia, modoPruebaEnvioGratis } from "./entorno";

describe("entorno del build", () => {
  it("la fecha de hoy es la de Colombia (UTC−5)", () => {
    expect(hoyEnColombia(new Date("2026-11-10T03:00:00Z"))).toBe("2026-11-09");
    expect(hoyEnColombia(new Date("2026-11-10T06:00:00Z"))).toBe("2026-11-10");
  });
  it("el modo de prueba del envío gratis solo se activa con ENVIO_GRATIS_PRUEBA=si", () => {
    expect(modoPruebaEnvioGratis({})).toBe(false);
    expect(modoPruebaEnvioGratis({ ENVIO_GRATIS_PRUEBA: "1" })).toBe(false);
    expect(modoPruebaEnvioGratis({ ENVIO_GRATIS_PRUEBA: "si" })).toBe(true);
  });
  it("nunca en el despliegue a GitHub Pages (LEG-106)", () => {
    expect(() => modoPruebaEnvioGratis({ ENVIO_GRATIS_PRUEBA: "si", GITHUB_PAGES: "true" })).toThrow(/no se puede usar en el despliegue/);
  });
});
