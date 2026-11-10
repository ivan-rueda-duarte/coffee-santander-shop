import { describe, expect, it } from "vitest";
import { LEGAL_PRUEBA, PROMOCION_PRUEBA as PROMO } from "../pruebas/fixtures";
import type { BloqueEstructurado } from "../marca/reglas-texto";
import { MARCA_FECHA_INICIO, numeralEnvioGratis, numeralEnvioGratisBorrador, revisarPublicacionEnvioGratis, SALVEDAD_V2 } from "./envio-gratis";

const titulo = (texto: string): BloqueEstructurado => ({ tipo: "titulo", texto });
const parrafo = (texto: string): BloqueEstructurado => ({ tipo: "parrafo", texto });
const item = (texto: string): BloqueEstructurado => ({ tipo: "item", texto, numerada: false });

const NUMERAL = [
  titulo("13. Envío gratis en comunas de Bucaramanga"),
  parrafo(`El envío es gratis en estas comunas de Bucaramanga: ${PROMO.comunas.join(", ")}.`),
  item("Pedido mínimo: no hay."),
  item("Vigencia: rige desde el 1 de enero de 2026."),
];
const ENVIOS_V2 = [titulo("3. Valor del envío"), item(`${SALVEDAD_V2}: …`), ...NUMERAL, titulo("14. Normas que aplican"), parrafo("Ley 1480 de 2011.")];
const TERMINOS_V2 = [titulo("6. Cómo compras"), item(`No podemos cambiar… ${SALVEDAD_V2}: si al verificar…`)];
const POLITICA_V2 = [titulo("3. Para qué"), item("Comuna (opcional, solo si el envío es a Bucaramanga): …")];
const LEGAL_V2 = { ...LEGAL_PRUEBA, versionTerminos: "2", fechaTerminos: "2026-01-01" };

describe("numeral de condiciones del envío gratis", () => {
  it("se extrae del texto publicado sin su título y hasta el siguiente numeral", () => {
    expect(numeralEnvioGratis(ENVIOS_V2)).toEqual(NUMERAL.slice(1));
    expect(numeralEnvioGratis(NUMERAL)).toEqual(NUMERAL.slice(1));
    expect(numeralEnvioGratis([titulo("3. Valor del envío"), parrafo("x")])).toBeNull();
  });
  it("el borrador de la nota E sirve solo con la fecha de inicio en lugar del marcador", () => {
    const md = ["### E. Versión 2", "```", "### 13. Envío gratis en comunas de Bucaramanga", "El envío es gratis.", "- Vigencia: rige desde el " + MARCA_FECHA_INICIO + ".", "```", "6. Otra cosa"].join("\n");
    expect(numeralEnvioGratisBorrador(md, "2026-01-01")).toEqual([parrafo("El envío es gratis."), item("Vigencia: rige desde el 1 de enero de 2026.")]);
    expect(numeralEnvioGratisBorrador("# Nada", "2026-01-01")).toBeNull();
  });
});

describe("control de publicación (LEG-106)", () => {
  it("con los documentos versión 2 completos no hay errores", () => {
    expect(revisarPublicacionEnvioGratis(PROMO, LEGAL_V2, { envios: ENVIOS_V2, terminos: TERMINOS_V2, politica: POLITICA_V2 })).toEqual({ errores: [], avisos: [] });
  });
  it("con los documentos versión 1 (sin numeral ni salvedades) no se enciende", () => {
    const r = revisarPublicacionEnvioGratis(PROMO, LEGAL_PRUEBA, { envios: [titulo("3. Valor del envío")], terminos: [titulo("6. Cómo compras")], politica: [titulo("3. Para qué")] });
    expect(r.errores).toHaveLength(4);
    expect(r.errores[0]).toContain("no publica el numeral «Envío gratis en comunas de Bucaramanga»");
    expect(r.errores.join("\n")).toContain("los «Términos y condiciones» no publican la salvedad");
    expect(r.errores.join("\n")).toContain("no puede empezar antes que los documentos");
    expect(r.avisos).toHaveLength(1);
  });
  it("exige que el numeral nombre cada comuna del dato y la fecha de inicio, sin marcadores", () => {
    const sinMutis = ENVIOS_V2.map((b) => ({ ...b, texto: b.texto.replace("Mutis", "") }));
    expect(revisarPublicacionEnvioGratis(PROMO, LEGAL_V2, { envios: sinMutis, terminos: TERMINOS_V2, politica: POLITICA_V2 }).errores).toEqual([expect.stringContaining("no nombra Mutis")]);
    const otraFecha = revisarPublicacionEnvioGratis({ ...PROMO, desde: "2026-02-01" }, LEGAL_V2, { envios: ENVIOS_V2, terminos: TERMINOS_V2, politica: POLITICA_V2 });
    expect(otraFecha.errores).toEqual([expect.stringContaining("«1 de febrero de 2026»")]);
    const conMarcador = [titulo("3. Valor del envío"), item(`${SALVEDAD_V2}: …`), ...NUMERAL, item(`Desde ${MARCA_FECHA_INICIO}.`)];
    expect(revisarPublicacionEnvioGratis(PROMO, LEGAL_V2, { envios: conMarcador, terminos: TERMINOS_V2, politica: POLITICA_V2 }).errores).toEqual([expect.stringContaining("marcador entre llaves")]);
  });
  it("rechaza cualquier marcador entre llaves, como {horario de atención} (LEG-106, LEG-118, D-24)", () => {
    const conHorario = [...ENVIOS_V2.slice(0, -2), item("Plazo de entrega: … dentro de nuestro horario de atención ({horario de atención}) …"), ...ENVIOS_V2.slice(-2)];
    expect(revisarPublicacionEnvioGratis(PROMO, LEGAL_V2, { envios: conHorario, terminos: TERMINOS_V2, politica: POLITICA_V2 }).errores).toEqual([expect.stringContaining("marcador entre llaves")]);
  });
});
