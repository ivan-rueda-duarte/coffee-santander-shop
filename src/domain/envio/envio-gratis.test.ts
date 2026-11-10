import { describe, expect, it } from "vitest";
import { PROMOCION_PRUEBA as PROMO, REGLAS_CON_PROMOCION as REGLAS, REGLAS_ENVIO_PRUEBA } from "../pruebas/fixtures";
import { calcularEnvio, totalConEnvio } from "./envio";
import {
  anuncioEnvio,
  aplicaAlMunicipio,
  avisoTerminacion,
  ayudaCampoComuna,
  ayudaComunaElegida,
  COMUNAS_EN_TEXTOS,
  comunaCubierta,
  comunasAlfabeticas,
  DIAS_AVISO_TERMINACION,
  ENLACE_PLAZO_ZONA1,
  erroresTerminacion,
  estadoEnvioGratis,
  finEnvioGratis,
  lineaPromocionNoVigente,
  lineaVerificacionMensaje,
  notaVerificacionResumen,
  OPCION_OTRA_COMUNA,
  partirEnlace,
  promocionActiva,
  promocionVigente,
  TEXTOS_ENVIO_GRATIS,
  unirConO,
} from "./envio-gratis";
import { textoPlazoResumen } from "./plazos";
import type { EnvioGratis, ItemPesable, ResultadoEnvio } from "./tipos";

const kilos = (kg: number): ItemPesable[] => [{ gramos: 500, cantidad: kg * 2 }];
const BGA = { departamento: "Santander", municipio: "Bucaramanga" };
const enComuna = (comuna: string | null | undefined) => ({ ...BGA, comuna });
const gratis = (r: ResultadoEnvio): EnvioGratis => {
  if (r.tipo !== "gratis") throw new Error(`se esperaba envío gratis y salió ${r.tipo}`);
  return r;
};

describe("vigencia de la promoción", () => {
  it("rige desde envio_gratis_desde, inclusive", () => {
    expect(promocionVigente(PROMO, "2025-12-31")).toBe(false);
    expect(promocionVigente(PROMO, "2026-01-01")).toBe(true);
    expect(promocionVigente(PROMO, "2030-06-15")).toBe(true);
  });
  it("con envio_gratis_terminada no rige desde ese build, aunque envio_gratis_desde siga llena (P34 b)", () => {
    const terminada = { ...PROMO, terminada: "2026-11-09" };
    expect(promocionVigente(terminada, "2026-11-09")).toBe(false);
    expect(promocionVigente(terminada, "2026-12-31")).toBe(false);
    expect(promocionActiva(terminada, "2026-11-09")).toBeNull();
  });
  it("sin promoción no rige nada", () => {
    expect(promocionVigente(null, "2026-11-09")).toBe(false);
    expect(promocionActiva(null, "2026-11-09")).toBeNull();
    expect(promocionActiva(PROMO, "2025-01-01")).toBeNull();
    expect(promocionActiva(PROMO, "2026-11-09")).toBe(PROMO);
  });
});

describe("comunas", () => {
  it("el dato de prueba tiene las siete comunas de los textos legales", () => {
    expect(PROMO.comunas).toHaveLength(COMUNAS_EN_TEXTOS);
  });
  it("el selector las ordena alfabéticamente sin cambiar el dato", () => {
    expect(comunasAlfabeticas(PROMO)).toEqual(["Cabecera del Llano", "Centro", "Ciudadela Real de Minas", "La Concordia", "Mutis", "Oriental", "San Francisco"]);
    expect(PROMO.comunas[0]).toBe("San Francisco");
  });
  it("el campo solo aplica al municipio de la promoción, sin importar tildes ni mayúsculas", () => {
    expect(aplicaAlMunicipio(PROMO, "santander", "BUCARAMANGA")).toBe(true);
    for (const municipio of ["Floridablanca", "Piedecuesta", "Girón"]) expect(aplicaAlMunicipio(PROMO, "Santander", municipio)).toBe(false);
    expect(aplicaAlMunicipio(PROMO, "Bogotá, D.C.", "Bucaramanga")).toBe(false);
    expect(aplicaAlMunicipio(null, "Santander", "Bucaramanga")).toBe(false);
  });
  it("comunaCubierta devuelve el nombre del dato o null", () => {
    expect(comunaCubierta(enComuna("cabecera del llano"), PROMO)).toBe("Cabecera del Llano");
    expect(comunaCubierta(enComuna(OPCION_OTRA_COMUNA), PROMO)).toBeNull();
    expect(comunaCubierta(enComuna(""), PROMO)).toBeNull();
    expect(comunaCubierta(enComuna(undefined), PROMO)).toBeNull();
    expect(comunaCubierta(enComuna("Provenza"), PROMO)).toBeNull();
    expect(comunaCubierta({ departamento: "Santander", municipio: "Floridablanca", comuna: "Centro" }, PROMO)).toBeNull();
    expect(comunaCubierta(enComuna("Centro"), null)).toBeNull();
  });
  it("une con comas y «o»", () => {
    expect(unirConO([])).toBe("");
    expect(unirConO(["Mutis"])).toBe("Mutis");
    expect(unirConO(["A", "B"])).toBe("A o B");
    expect(unirConO(PROMO.comunas)).toBe("San Francisco, Oriental, Centro, Cabecera del Llano, La Concordia, Ciudadela Real de Minas o Mutis");
  });
});

describe("calcularEnvio con envío gratis (P27 = b: cualquier peso)", () => {
  const casos: [number, ResultadoEnvio["tipo"], number | null][] = [
    [1, "tarifa", 8800],
    [2, "tarifa", 11600],
    [5, "tarifa", 15400],
    [6, "por_cotizar", null],
    [10, "por_cotizar", null],
    [30, "por_cotizar", null],
  ];
  it.each(casos)("%i kg en una comuna de la lista: $0, con la regla normal como alternativa", (kg, tipoAlternativa, tarifa) => {
    const r = gratis(calcularEnvio(kilos(kg), enComuna("Mutis"), REGLAS));
    expect(r).toMatchObject({ zona: 1, clave: "bucaramanga", comuna: "Mutis", pesoFacturableG: kg * 1000 + 80 });
    expect(r.alternativa.tipo).toBe(tipoAlternativa);
    if (r.alternativa.tipo === "tarifa") expect(r.alternativa.valorCop).toBe(tarifa);
    else expect(r.alternativa.motivo).toBe("mas_de_5kg");
    // «Total», nunca «Total sin envío», y el total es el subtotal.
    expect(totalConEnvio(100000, r)).toEqual({ totalCop: 100000, sinEnvio: false });
    // Plazo propio de la promoción, no el de la zona 1 ni el de «más de 5 kg».
    expect(textoPlazoResumen(REGLAS.plazos, r)).toBe(TEXTOS_ENVIO_GRATIS.plazoResumen);
  });
  it("las siete comunas dan envío gratis", () => {
    for (const comuna of PROMO.comunas) expect(calcularEnvio(kilos(1), enComuna(comuna), REGLAS).tipo).toBe("gratis");
  });
  it("sin comuna o con «Otra comuna o no la sé» rige la regla normal (P28 = a)", () => {
    for (const comuna of [undefined, null, "", OPCION_OTRA_COMUNA]) {
      expect(calcularEnvio(kilos(1), enComuna(comuna), REGLAS)).toMatchObject({ tipo: "tarifa", valorCop: 8800 });
      expect(calcularEnvio(kilos(6), enComuna(comuna), REGLAS)).toMatchObject({ tipo: "por_cotizar", motivo: "mas_de_5kg" });
    }
  });
  it("otro municipio de zona 1 no tiene envío gratis aunque traiga una comuna", () => {
    expect(calcularEnvio(kilos(1), { departamento: "Santander", municipio: "Girón", comuna: "Centro" }, REGLAS)).toMatchObject({ tipo: "tarifa", valorCop: 10500 });
  });
  it("con la promoción apagada la comuna se ignora", () => {
    expect(calcularEnvio(kilos(1), enComuna("Centro"), REGLAS_ENVIO_PRUEBA)).toMatchObject({ tipo: "tarifa", valorCop: 8800 });
  });
});

describe("textos del envío gratis (microcopy §8)", () => {
  it("ayuda del campo, sin comuna y con comuna", () => {
    expect(ayudaCampoComuna(PROMO)).toBe(
      "Envío gratis si tu dirección está en San Francisco, Oriental, Centro, Cabecera del Llano, La Concordia, Ciudadela Real de Minas o Mutis. Si no eliges una de ellas, pagas la tarifa normal. Verificamos tu dirección por el chat antes de que aceptes el total.",
    );
    expect(ayudaComunaElegida("Centro")).toBe("Tu envío es gratis si tu dirección está en Centro. Lo verificamos por el chat antes de que aceptes el total.");
  });
  it("nota del resumen hasta 5 kg, con la tarifa y el total alternativos", () => {
    const r = gratis(calcularEnvio(kilos(2), enComuna("Centro"), REGLAS));
    expect(notaVerificacionResumen(r, 100000)).toBe(
      "Envío gratis en Centro, si verificamos por el chat que tu dirección está en esa comuna. Si no lo está, el envío es de $11.600 y el total queda en $111.600; tú decides si lo aceptas antes de pagar.",
    );
    expect(lineaVerificacionMensaje(r, 100000)).toBe("Si mi dirección no está en esa comuna, el envío es de $11.600 y el total queda en $111.600; espero su confirmación.");
  });
  it("nota del resumen con más de 5 kg", () => {
    const r = gratis(calcularEnvio(kilos(10), enComuna("Oriental"), REGLAS));
    expect(notaVerificacionResumen(r, 500000)).toBe(
      "Envío gratis en Oriental, si verificamos por el chat que tu dirección está en esa comuna. Si no lo está, el envío de más de 5 kg se cotiza: te informamos el valor por el chat y tú decides si lo aceptas antes de pagar.",
    );
    expect(lineaVerificacionMensaje(r, 500000)).toBe("Si mi dirección no está en esa comuna, quedo atento al valor del envío para confirmar mi pedido.");
  });
  it("plazos y anuncios exactos", () => {
    expect(TEXTOS_ENVIO_GRATIS.plazoResumen).toBe("Entrega estimada: mismo día o siguiente día hábil. Plazo máximo: 1 día hábil desde que validamos tu pedido y te damos el aprobado por el chat.");
    expect(TEXTOS_ENVIO_GRATIS.plazoMensaje).toBe("Plazo de entrega: máximo 1 día hábil desde que validen mi pedido y me den el aprobado por el chat.");
    expect(TEXTOS_ENVIO_GRATIS.anuncio).toBe("Envío gratis en siete comunas de Bucaramanga.");
  });
  it("ningún texto usa los anuncios prohibidos (LEG-107)", () => {
    const todos = [...Object.values(TEXTOS_ENVIO_GRATIS), ayudaCampoComuna(PROMO)].join("\n");
    for (const prohibido of ["Envío gratis en Bucaramanga", "Domicilio gratis", "Envío gratis a todo", "Entrega el mismo día", "¡"]) expect(todos).not.toContain(prohibido);
  });
  it("anuncio de la región viva: una frase con envío y total", () => {
    expect(anuncioEnvio(calcularEnvio(kilos(1), enComuna("Mutis"), REGLAS), 50000)).toBe("Envío gratis en Mutis, sujeto a verificar tu dirección: $0. Total: $50.000.");
    expect(anuncioEnvio(calcularEnvio(kilos(1), BGA, REGLAS), 50000)).toBe("Envío: $8.800. Total: $58.800.");
    expect(anuncioEnvio(calcularEnvio(kilos(6), BGA, REGLAS), 50000)).toBe("Envío por cotizar. Total sin envío: $50.000.");
  });
});

describe("textos de /envios/ con la promoción (microcopy §8.5 v1.4)", () => {
  it("dd de la zona 1 con el cómputo del plazo y «ver condiciones» enlazable (LEG-123)", () => {
    expect(TEXTOS_ENVIO_GRATIS.plazoZona1).toBe(
      " Con envío gratis en comunas de Bucaramanga, el máximo es 1 día hábil con cualquier peso, contado desde que validamos tu pedido y te damos el aprobado por el chat (ver condiciones).",
    );
    expect(partirEnlace(TEXTOS_ENVIO_GRATIS.plazoZona1, ENLACE_PLAZO_ZONA1)).toEqual([
      " Con envío gratis en comunas de Bucaramanga, el máximo es 1 día hábil con cualquier peso, contado desde que validamos tu pedido y te damos el aprobado por el chat (",
      "ver condiciones",
      ").",
    ]);
    expect(partirEnlace("sin enlace", ENLACE_PLAZO_ZONA1)).toBeNull();
  });
  it("párrafo inicial y caja final (LEG-121, LEG-122)", () => {
    expect(TEXTOS_ENVIO_GRATIS.parrafoEnvios).toBe(" En siete comunas de Bucaramanga el envío es gratis con cualquier peso, si verificamos por el chat que tu dirección está en una de ellas.");
    expect(TEXTOS_ENVIO_GRATIS.cajaCotizar).toBe(" Si tu dirección está en una de las siete comunas de Bucaramanga con envío gratis, no hace falta: el envío es gratis con cualquier peso.");
  });
});

describe("estado «terminada» (P34 b; microcopy §8.6.1; LEG-125 y LEG-127)", () => {
  const HOY = "2026-11-09";
  const terminadaEl = (fecha: string) => ({ ...PROMO, desde: "2026-10-01", terminada: fecha });
  it("terminada = hoy: no rige y el aviso se muestra", () => {
    expect(estadoEnvioGratis(terminadaEl(HOY), HOY)).toEqual({ tipo: "terminada", promo: terminadaEl(HOY), fin: { desde: "2026-10-01", terminada: HOY, avisoVisible: true } });
    expect(finEnvioGratis(terminadaEl(HOY), HOY)).toEqual({ desde: "2026-10-01", terminada: HOY, avisoVisible: true });
  });
  it(`terminada = hoy − ${DIAS_AVISO_TERMINACION}: último día con aviso`, () => {
    expect(finEnvioGratis(terminadaEl("2026-10-10"), HOY)?.avisoVisible).toBe(true);
  });
  it(`terminada = hoy − ${DIAS_AVISO_TERMINACION + 1}: sin aviso en portada ni cajón, pero sigue terminada (sección de /envios/)`, () => {
    expect(finEnvioGratis(terminadaEl("2026-10-09"), HOY)).toEqual({ desde: "2026-10-01", terminada: "2026-10-09", avisoVisible: false });
    expect(promocionActiva(terminadaEl("2026-10-09"), HOY)).toBeNull();
  });
  it("los demás estados", () => {
    expect(estadoEnvioGratis(null, HOY)).toEqual({ tipo: "apagada" });
    expect(estadoEnvioGratis({ ...PROMO, desde: "2026-11-10" }, HOY).tipo).toBe("programada");
    expect(estadoEnvioGratis(PROMO, HOY).tipo).toBe("vigente");
    expect(finEnvioGratis(PROMO, HOY)).toBeNull();
    expect(finEnvioGratis(null, HOY)).toBeNull();
  });
  it("aviso de terminación, letra por letra (§8.6.1), con la fecha en letras", () => {
    expect(avisoTerminacion({ terminada: "2026-11-09" })).toBe("El envío gratis en siete comunas de Bucaramanga terminó el 9 de noviembre de 2026. Si tu pedido por WhatsApp ya decía «envío gratis», lo respetamos con las mismas condiciones.");
    expect(TEXTOS_ENVIO_GRATIS.introCondicionesTerminada).toBe("Estas fueron sus condiciones:");
  });
  it("cálculo normal en estado terminada: la comuna se ignora, tarifa de zona 1 y por cotizar con más de 5 kg", () => {
    const reglas = { ...REGLAS, envioGratis: terminadaEl(HOY) };
    expect(aplicaAlMunicipio(reglas.envioGratis, "Santander", "Bucaramanga")).toBe(false);
    expect(comunaCubierta(enComuna("Centro"), reglas.envioGratis)).toBeNull();
    expect(calcularEnvio(kilos(1), enComuna("Centro"), reglas)).toEqual(calcularEnvio(kilos(1), BGA, REGLAS_ENVIO_PRUEBA));
    expect(calcularEnvio(kilos(1), enComuna("Centro"), reglas).tipo).toBe("tarifa");
    expect(calcularEnvio(kilos(6), enComuna("Centro"), reglas)).toEqual(calcularEnvio(kilos(6), BGA, REGLAS_ENVIO_PRUEBA));
    expect(calcularEnvio(kilos(6), enComuna("Centro"), reglas).tipo).toBe("por_cotizar");
  });
});

describe("errores de npm run datos que dependen del día del build (P34 b)", () => {
  it("terminada posterior al build: falla", () => {
    expect(erroresTerminacion({ ...PROMO, terminada: "2026-11-10" }, "2026-11-09")).toEqual([expect.stringContaining("envio_gratis_terminada (2026-11-10) es posterior a hoy (2026-11-09)")]);
  });
  it("terminada hoy o antes, sin terminada o sin promoción: no falla", () => {
    expect(erroresTerminacion({ ...PROMO, terminada: "2026-11-09" }, "2026-11-09")).toEqual([]);
    expect(erroresTerminacion({ ...PROMO, terminada: "2026-10-01" }, "2026-11-09")).toEqual([]);
    expect(erroresTerminacion(PROMO, "2026-11-09")).toEqual([]);
    expect(erroresTerminacion(null, "2026-11-09")).toEqual([]);
  });
});

describe("línea de npm run datos con la promoción fuera de vigencia (QA-010: programada frente a terminada)", () => {
  const promo = (desde: string, terminada: string | null) => ({ ...PROMO, desde, terminada });
  it("sin promoción o vigente: null", () => {
    expect(lineaPromocionNoVigente(null, "2026-11-09")).toBeNull();
    expect(lineaPromocionNoVigente(promo("2026-11-09", null), "2026-11-09")).toBeNull();
  });
  it("programada (inicio futuro): pide reconstruir el día de inicio", () => {
    expect(lineaPromocionNoVigente(promo("2026-11-12", null), "2026-11-09")).toBe(
      "Envío gratis por comunas: programada, no rige hoy (2026-11-09); empieza el 2026-11-12. No aparece en el sitio; hay que reconstruir y desplegar el 2026-11-12 para que aparezca.",
    );
  });
  it("terminada con aviso: dice que terminó, cuántos días de aviso quedan, y no habla de empezar", () => {
    const linea = lineaPromocionNoVigente(promo("2026-11-01", "2026-11-09"), "2026-11-09");
    expect(linea).toBe(
      "Envío gratis por comunas: terminada el 2026-11-09, no rige hoy (2026-11-09); sin campo «Comuna» ni $0. El sitio construido hoy muestra el aviso de terminación en portada, cajón y /envios/#envio-gratis (30 días más de los 30).",
    );
    expect(linea).not.toMatch(/empieza|programada/);
    expect(lineaPromocionNoVigente(promo("2026-10-01", "2026-10-10"), "2026-11-09")).toContain("(último día de los 30)");
    expect(lineaPromocionNoVigente(promo("2026-10-01", "2026-10-11"), "2026-11-09")).toContain("(1 día más de los 30)");
  });
  it("terminada hace más de 30 días: sin aviso en portada ni cajón", () => {
    expect(lineaPromocionNoVigente(promo("2026-10-01", "2026-10-09"), "2026-11-09")).toBe(
      "Envío gratis por comunas: terminada el 2026-10-09, no rige hoy (2026-11-09); sin campo «Comuna» ni $0. Pasaron los 30 días del aviso: no sale en portada ni cajón; la sección /envios/#envio-gratis sigue mientras el numeral esté publicado.",
    );
  });
});
