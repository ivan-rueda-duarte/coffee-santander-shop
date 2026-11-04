import { describe, expect, it } from "vitest";
import { cargarCatalogo, type LeerArchivo } from "./cargar-catalogo";
import { cargarCatalogoDesdeDisco } from "./repositorio-catalogo-csv";
import { ErrorDatos, leerCsv } from "./lector";

const BASE: Record<string, string> = {
  "provincias.csv": `slug,nombre,nombre_corto,color_hex,descripcion,orden
comunera,Provincia Comunera,Comunera,#efc2a6,"Cuna de los Comuneros, con Socorro",1
guanenta,Provincia de Guanentá,Guanentá,#f0d68a,,2
`,
  "municipios.csv": `slug,nombre,divipola,provincia_slug,por_verificar
socorro,Socorro,68755,comunera,no
san-gil,San Gil,68679,guanenta,no
tona,Tona,68820,,si
`,
  "productores.csv": `slug,nombre,tipo,municipio_slug,activo
finca-a,Finca A,finca,socorro,si
finca-b,Finca B,finca,socorro,no
`,
  "cafes.csv": `slug,nombre,municipio_slug,productor_slug,altura_msnm,variedades,proceso,proceso_detalle,tueste,notas_cata,puntaje_sca,puntaje_verificado,puntaje_fuente,puntaje_fecha,registro_sanitario,moliendas,destacado,activo,orden
cafe-socorro,Café Socorro,socorro,finca-a,1800,Caturra|Castillo,lavado,Lavado tradicional,medio,Caramelo|Cacao,88,si,Laboratorio X,2026-03-15,,grano|molido,si,si,2
cafe-san-gil,Café San Gil,san-gil,,1650,Colombia,lavado,,medio_oscuro,Chocolate|Nuez,86.5,no,,,,grano,no,si,1
cafe-viejo,Café Viejo,socorro,,1700,Bourbon,lavado,,medio,Cereza,,no,,,,grano|molido,no,no,3
`,
  "presentaciones.csv": `cafe_slug,gramos,precio_cop,disponible
cafe-socorro,500,50000,si
cafe-socorro,250,25000,si
cafe-san-gil,250,25000,no
`,
  "config.csv": `clave,valor
nombre_tienda,De Santander
whatsapp,573001129874
ciudad_despacho,Bucaramanga
nota_envio,Enviamos a todo Colombia.
formas_pago,Efectivo contraentrega|Transferencia Bre-B
max_cantidad,20
nit,901.234.567-8
`,
};

const con = (cambios: Record<string, string>): LeerArchivo => {
  const archivos = { ...BASE, ...cambios };
  return (nombre) => {
    if (!(nombre in archivos)) throw new Error("no existe");
    return archivos[nombre];
  };
};
const errores = (cambios: Record<string, string>): string[] => {
  try {
    cargarCatalogo(con(cambios));
  } catch (e) {
    if (e instanceof ErrorDatos) return e.errores;
    throw e;
  }
  throw new Error("Se esperaba un ErrorDatos");
};

describe("cargarCatalogo con datos válidos", () => {
  const { catalogo, advertencias } = cargarCatalogo(con({}));

  it("lee provincias con descripción entre comillas y vacía", () => {
    expect(catalogo.provincias.map((p) => [p.slug, p.descripcion])).toEqual([
      ["comunera", "Cuna de los Comuneros, con Socorro"],
      ["guanenta", null],
    ]);
  });
  it("lee municipios, incluido el que está por verificar", () => {
    const tona = catalogo.municipios.find((m) => m.slug === "tona");
    expect(tona).toMatchObject({ provinciaSlug: null, porVerificar: true, divipola: "68820" });
  });
  it("solo incluye productores y cafés activos, ordenados", () => {
    expect(catalogo.productores.map((p) => p.slug)).toEqual(["finca-a"]);
    expect(catalogo.cafes.map((c) => c.slug)).toEqual(["cafe-san-gil", "cafe-socorro"]);
  });
  it("completa municipio, provincia y productor del café", () => {
    const c = catalogo.cafes.find((x) => x.slug === "cafe-socorro")!;
    expect(c).toMatchObject({ municipio: "Socorro", provinciaSlug: "comunera", provincia: "Comunera", productor: "Finca A", destacado: true });
    expect(c.variedades).toEqual(["Caturra", "Castillo"]);
    expect(c.perfiles).toEqual(["caramelo", "chocolate"]);
    expect(c.puntajeVerificado).toBe(true);
    expect(c.puntajeFecha).toBe("2026-03-15");
  });
  it("ordena las presentaciones por tamaño y lee disponibilidad", () => {
    const [socorro, sanGil] = [catalogo.cafes[1], catalogo.cafes[0]];
    expect(socorro.presentaciones.map((p) => p.gramos)).toEqual([250, 500]);
    expect(sanGil.presentaciones).toEqual([{ gramos: 250, precioCop: 25000, disponible: false }]);
  });
  it("acepta puntaje con punto decimal", () => {
    expect(catalogo.cafes[0].puntajeSca).toBe(86.5);
  });
  it("lee la configuración y los datos del vendedor", () => {
    expect(catalogo.tienda).toMatchObject({
      nombre: "De Santander",
      whatsapp: "573001129874",
      ciudadDespacho: "Bucaramanga",
      formasPago: ["Efectivo contraentrega", "Transferencia Bre-B"],
      maxCantidad: 20,
      vendedor: { razonSocial: null, nit: "901.234.567-8", domicilio: null, correoContacto: null },
    });
  });
  it("avisa del puntaje sin verificar", () => {
    expect(advertencias.some((a) => a.includes("Café San Gil") && a.includes("sin verificar"))).toBe(true);
  });
  it("avisa de notas de cata sin perfil", () => {
    const r = cargarCatalogo(con({ "cafes.csv": BASE["cafes.csv"].replace("Caramelo|Cacao", "Caramelo|Humo") }));
    expect(r.advertencias.some((a) => a.includes('"Humo"'))).toBe(true);
  });
  it("avisa si un café está en un municipio por verificar", () => {
    const r = cargarCatalogo(con({ "cafes.csv": BASE["cafes.csv"].replace("cafe-san-gil,Café San Gil,san-gil", "cafe-san-gil,Café San Gil,tona") }));
    expect(r.advertencias.some((a) => a.includes("por verificar"))).toBe(true);
  });
});

describe("formato del archivo", () => {
  it("acepta punto y coma (Excel en español) y BOM", () => {
    const pv = "﻿clave;valor\nnombre_tienda;De Santander\nwhatsapp;573001129874\nciudad_despacho;Bucaramanga\nnota_envio;Hola, mundo\nformas_pago;A|B\nmax_cantidad;5\n";
    const r = cargarCatalogo(con({ "config.csv": pv }));
    expect(r.catalogo.tienda).toMatchObject({ nombre: "De Santander", notaEnvio: "Hola, mundo", formasPago: ["A", "B"], maxCantidad: 5 });
  });
  it("ignora líneas en blanco y espacios alrededor", () => {
    const r = cargarCatalogo(con({ "presentaciones.csv": "cafe_slug , gramos , precio_cop\n\n cafe-socorro , 250 , 25000 \n cafe-san-gil,250,25000\n" }));
    expect(r.catalogo.cafes[1].presentaciones[0].precioCop).toBe(25000);
  });
  it("las columnas opcionales se pueden omitir", () => {
    const r = cargarCatalogo(con({ "productores.csv": "slug,nombre,tipo\nfinca-a,Finca A,finca\n" }));
    expect(r.catalogo.productores).toHaveLength(1);
  });
  it("leerCsv reporta comillas sin cerrar", () => {
    const r = leerCsv('a,b\n"x,y\n', "t.csv", { requeridas: ["a", "b"] });
    expect(r.errores[0]).toMatch(/t\.csv: no se pudo leer/);
  });
});

describe("errores con archivo, línea y columna", () => {
  it("falta un archivo", () => {
    const leer: LeerArchivo = (n) => {
      if (n === "cafes.csv") throw new Error("ENOENT");
      return BASE[n];
    };
    expect(() => cargarCatalogo(leer)).toThrow(/cafes\.csv: no se encontró el archivo en data\//);
  });
  it("falta una columna y hay otra desconocida", () => {
    const e = errores({ "presentaciones.csv": "cafe_slug,gramos,precio\ncafe-socorro,250,25000\n" });
    expect(e).toContain('presentaciones.csv: falta la columna "precio_cop" en la primera línea.');
    expect(e.some((m) => m.includes('la columna "precio" no existe'))).toBe(true);
  });
  it("precio con puntos, tueste y proceso inválidos: informa todo junto", () => {
    const cafes = BASE["cafes.csv"].replace("medio_oscuro", "medio oscuro").replace(",lavado,Lavado tradicional,medio,", ",lavadoo,Lavado tradicional,medio,");
    const pres = BASE["presentaciones.csv"].replace("50000", "50.000");
    const e = errores({ "cafes.csv": cafes, "presentaciones.csv": pres });
    expect(e).toContain('cafes.csv, línea 3, columna "tueste": "medio oscuro" no es válido. Opciones: claro, medio_claro, medio, medio_oscuro, oscuro.');
    expect(e.some((m) => m.startsWith('cafes.csv, línea 2, columna "proceso": "lavadoo"'))).toBe(true);
    expect(e.some((m) => m.startsWith('presentaciones.csv, línea 2, columna "precio_cop": "50.000" no es un número entero.') && m.includes("sin puntos"))).toBe(true);
  });
  it("referencias a filas que no existen", () => {
    const e = errores({
      "municipios.csv": BASE["municipios.csv"].replace("san-gil,San Gil,68679,guanenta", "san-gil,San Gil,68679,mares"),
      "cafes.csv": BASE["cafes.csv"].replace("finca-a", "finca-z").replace("cafe-viejo,Café Viejo,socorro", "cafe-viejo,Café Viejo,nadie"),
      "presentaciones.csv": BASE["presentaciones.csv"] + "cafe-fantasma,250,1000,si\n",
    });
    expect(e).toContain('municipios.csv, línea 3, columna "provincia_slug": "mares" no existe en provincias.csv.');
    expect(e.some((m) => m.includes('"finca-z" no existe'))).toBe(true);
    expect(e.some((m) => m.includes('"nadie" no existe en municipios.csv'))).toBe(true);
    expect(e).toContain('presentaciones.csv, línea 5, columna "cafe_slug": "cafe-fantasma" no existe en cafes.csv.');
  });
  it("slugs repetidos y mal escritos", () => {
    const e = errores({
      "cafes.csv": BASE["cafes.csv"].replace("cafe-san-gil,Café San Gil", "cafe-socorro,Café San Gil").replace("cafe-viejo,", "Café Viejo,"),
    });
    expect(e.some((m) => m.includes('"cafe-socorro" ya aparece en la línea 2'))).toBe(true);
    expect(e.some((m) => m.includes('"Café Viejo" no es un identificador válido'))).toBe(true);
  });
  it("un café activo sin presentaciones", () => {
    const e = errores({ "presentaciones.csv": "cafe_slug,gramos,precio_cop,disponible\ncafe-socorro,250,25000,si\n" });
    expect(e).toContain('cafes.csv, línea 3: "Café San Gil" está activo pero no tiene presentaciones en presentaciones.csv.');
  });
  it("presentación repetida", () => {
    const e = errores({ "presentaciones.csv": BASE["presentaciones.csv"] + "cafe-socorro,250,30000,si\n" });
    expect(e.some((m) => m.includes("ya tiene una presentación de 250 g en la línea 3"))).toBe(true);
  });
  it("puntaje verificado exige fuente y fecha", () => {
    const e = errores({ "cafes.csv": BASE["cafes.csv"].replace("Laboratorio X,2026-03-15", ",") });
    expect(e.some((m) => m.includes('"puntaje_fuente": es obligatoria'))).toBe(true);
    expect(e.some((m) => m.includes('"puntaje_fecha": es obligatoria'))).toBe(true);
  });
  it("fechas y números inválidos", () => {
    const e = errores({
      "cafes.csv": BASE["cafes.csv"].replace("2026-03-15", "2026-02-30").replace(",88,", ",ochenta,").replace(",1650,", ",5000,"),
    });
    expect(e.some((m) => m.includes('"puntaje_fecha": "2026-02-30" no es una fecha válida'))).toBe(true);
    expect(e.some((m) => m.includes('"puntaje_sca": "ochenta" no es un número'))).toBe(true);
    expect(e.some((m) => m.includes('"altura_msnm": 5000 está fuera del rango'))).toBe(true);
  });
  it("municipio sin provincia y sin marca de por verificar, o con las dos", () => {
    const e = errores({
      "municipios.csv": "slug,nombre,divipola,provincia_slug,por_verificar\nsocorro,Socorro,68755,,no\nsan-gil,San Gil,68679,guanenta,si\ntona,Tona,99999,,si\n",
    });
    expect(e.some((m) => m.includes('"provincia_slug": está vacía; escribe la provincia'))).toBe(true);
    expect(e.some((m) => m.includes('"por_verificar": es "si" pero el municipio ya tiene provincia'))).toBe(true);
    expect(e.some((m) => m.includes('"divipola": "99999"'))).toBe(true);
  });
  it("color y lista inválidos", () => {
    const e = errores({
      "provincias.csv": BASE["provincias.csv"].replace("#efc2a6", "rojo"),
      "cafes.csv": BASE["cafes.csv"].replace("grano|molido,si,si,2", "grano|espresso,si,si,2"),
    });
    expect(e.some((m) => m.includes('"color_hex": "rojo" no es un color'))).toBe(true);
    expect(e.some((m) => m.includes('"moliendas": "espresso" no es válido'))).toBe(true);
  });
  it("booleano inválido", () => {
    const e = errores({ "cafes.csv": BASE["cafes.csv"].replace("grano|molido,si,si,2", "grano|molido,si,quizas,2") });
    expect(e.some((m) => m.includes('"activo": "quizas" no es válido; escribe "si" o "no"'))).toBe(true);
  });
  it("productor con tipo o municipio inválido", () => {
    const e = errores({ "productores.csv": "slug,nombre,tipo,municipio_slug,activo\nfinca-a,Finca A,hacienda,nadie,si\n" });
    expect(e.some((m) => m.includes('"tipo": "hacienda" no es válido'))).toBe(true);
    expect(e.some((m) => m.includes('"municipio_slug": "nadie" no existe'))).toBe(true);
  });
  it("configuración incompleta o inválida", () => {
    const e = errores({
      "config.csv": "clave,valor\nnombre_tienda,De Santander\nwhatsapp,+57 300 112 9874\nwhatsapp,1\nciudad_despacho,Bucaramanga\nmax_cantidad,mucho\nextra,x\nformas_pago,\n",
    });
    expect(e.some((m) => m.includes('whatsapp "+57 300 112 9874" debe llevar solo dígitos'))).toBe(true);
    expect(e.some((m) => m.includes('"whatsapp" ya aparece en la línea 3'))).toBe(true);
    expect(e.some((m) => m.includes('"extra" no es una clave válida'))).toBe(true);
    expect(e.some((m) => m.includes('"max_cantidad"') || m.includes('"valor": "mucho"'))).toBe(true);
    expect(e).toContain('config.csv: falta un valor para la clave "nota_envio".');
    expect(e).toContain('config.csv: falta un valor para la clave "formas_pago".');
  });
  it("ErrorDatos resume cuántos problemas hay", () => {
    expect(() => cargarCatalogo(con({ "config.csv": "clave,valor\n" }))).toThrow(/Hay 6 problemas/);
  });
});

describe("datos reales de data/", () => {
  it("pasan la validación y tienen lo esperado de la v1", () => {
    const { catalogo } = cargarCatalogoDesdeDisco();
    expect(catalogo.cafes).toHaveLength(5);
    expect(catalogo.provincias).toHaveLength(7);
    expect(catalogo.municipios).toHaveLength(87);
    expect(catalogo.municipios.filter((m) => m.porVerificar).map((m) => m.slug)).toEqual(["tona"]);
    expect(catalogo.municipios.every((m) => m.divipola)).toBe(true);
    expect(catalogo.cafes.every((c) => c.presentaciones.length === 2 && c.provinciaSlug)).toBe(true);
    expect(catalogo.cafes.every((c) => !c.puntajeVerificado)).toBe(true);
    expect(catalogo.tienda.whatsapp).toBe("573001129874");
  });
});
