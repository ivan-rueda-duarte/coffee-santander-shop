import { describe, expect, it } from "vitest";
import { quitarDatosRsc, referenciasAOriginales } from "./referencias-originales";

const ORIGINAL = "/fotos/cafes/cafe-arreboles/1.jpg";
const OTRO = "/fotos/cafes/cafe-arreboles/2.jpg";
const originales = [ORIGINAL, OTRO];
const refs = (texto: string) => referenciasAOriginales(texto, originales);

describe("referenciasAOriginales (QA-019)", () => {
  it.each([
    ["img src", `<img src="${ORIGINAL}" alt="">`],
    ["srcset con basePath", `<img srcset="/coffee-santander-shop${ORIGINAL} 2000w, x 400w">`],
    ["meta content con dominio", `<meta property="og:image" content="https://ejemplo.test${ORIGINAL}"/>`],
    ["JSON-LD", `<script type="application/ld+json">{"@type":"Product","image":"https://ejemplo.test${ORIGINAL}"}</script>`],
    ["JSON-LD en lista", `<script type="application/ld+json">{"image":["https://ejemplo.test${ORIGINAL}"]}</script>`],
    ["style en línea", `<div style="background-image:url(${ORIGINAL})"></div>`],
    ["style con comillas simples", `<div style="background:url('${ORIGINAL}')"></div>`],
    ["bloque <style>", `<style>.x{background:url("${ORIGINAL}")}</style>`],
    ["CSS con url()", `.hero{background-image:url(${ORIGINAL})}`],
    ["ruta con ?", `<img src="${ORIGINAL}?v=2">`],
    ["ruta con #", `<a href="${ORIGINAL}#foto">`],
    ["atributo con comillas simples", `<img src='${ORIGINAL}'>`],
    ["prop src en el payload RSC", `self.__next_f.push([1,"[\\"$\\",\\"img\\",null,{\\"src\\":\\"${ORIGINAL}\\"}]"])`],
  ])("detecta %s", (_, texto) => {
    expect(refs(texto)).toEqual([ORIGINAL]);
  });

  it("ignora las listas \"fotos\":[…] del payload RSC, escapadas o no", () => {
    expect(refs(`self.__next_f.push([1,"{\\"fotos\\":[\\"${ORIGINAL}\\",\\"${OTRO}\\"],\\"x\\":1}"])`)).toEqual([]);
    expect(refs(`{"fotos":["${ORIGINAL}","${OTRO}"]}`)).toEqual([]);
  });

  it("ignora las llaves de React del payload RSC", () => {
    expect(refs(`[\\"$\\",\\"li\\",\\"${OTRO}\\",{\\"className\\":\\"relative\\"}]`)).toEqual([]);
  });

  it("sigue detectando un original cargado aunque el mismo texto tenga la lista de datos", () => {
    const texto = `{\\"fotos\\":[\\"${ORIGINAL}\\"]}<img src="${ORIGINAL}">`;
    expect(refs(texto)).toEqual([ORIGINAL]);
  });

  it("no confunde las variantes ni archivos con nombre más largo", () => {
    expect(refs(`<img src="/fotos-optimizadas/cafes/cafe-arreboles/1-1200.avif">`)).toEqual([]);
    expect(refs(`<a href="/fotos/cafes/cafe-arreboles/1.jpg.bak">`)).toEqual([]);
    expect(refs(`<a href="/fotos/cafes/cafe-arreboles/11.jpg">`)).toEqual([]);
  });

  it("devuelve cada original enlazado una vez", () => {
    expect(refs(`<img src="${ORIGINAL}"><img src="${ORIGINAL}"><img src="${OTRO}">`)).toEqual([ORIGINAL, OTRO]);
  });
});

describe("quitarDatosRsc", () => {
  it("deja intacto el resto del texto", () => {
    expect(quitarDatosRsc(`<p>Hola</p>{"fotos":["a"],"b":1}`)).toBe(`<p>Hola</p>{,"b":1}`);
    expect(quitarDatosRsc(`["$","li","k",{}]`)).toBe(`["$","li","",{}]`);
  });
});
