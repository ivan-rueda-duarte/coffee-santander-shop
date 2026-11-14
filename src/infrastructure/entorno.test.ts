import { describe, expect, it } from "vitest";
import { fechaDelBuild, hoyEnColombia, modoPruebaEnvioGratis } from "./entorno";

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

describe("fecha del build (FECHA_BUILD_PRUEBA, LEG-167)", () => {
  const ahora = new Date("2026-11-14T15:00:00Z");
  it("sin modo de prueba es hoy en Colombia, aunque venga FECHA_BUILD_PRUEBA", () => {
    expect(fechaDelBuild({}, ahora)).toBe("2026-11-14");
    expect(fechaDelBuild({ FECHA_BUILD_PRUEBA: "2026-11-17" }, ahora)).toBe("2026-11-14");
  });
  it("en un build de prueba simula el día pedido", () => {
    expect(fechaDelBuild({ ENVIO_GRATIS_PRUEBA: "si", FECHA_BUILD_PRUEBA: "2026-11-17" }, ahora)).toBe("2026-11-17");
    expect(() => fechaDelBuild({ ENVIO_GRATIS_PRUEBA: "si", FECHA_BUILD_PRUEBA: "17/11" }, ahora)).toThrow(/no es una fecha/);
  });
  it("nunca en el despliegue", () => {
    expect(() => fechaDelBuild({ ENVIO_GRATIS_PRUEBA: "si", FECHA_BUILD_PRUEBA: "2026-11-17", GITHUB_PAGES: "true" }, ahora)).toThrow(/no se puede usar en el despliegue/);
  });
});
