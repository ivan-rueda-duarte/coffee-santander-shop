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
  "catalogo.csv": `slug,nombre,precio_250g,precio_500g,precio_1000g,agotados,fotos,foto_descripcion,municipio_slug,productor_slug,altura_msnm,variedades,proceso,proceso_detalle,tueste,notas_cata,puntaje_sca,puntaje_verificado,puntaje_fuente,puntaje_fecha,marca,fabricante,fabricante_expresion,nsa,titular_nsa,moliendas,destacado,activo,orden
cafe-socorro,Café Socorro,25000,50000,,,1.jpg|2.png,Bolsa sobre yute,socorro,finca-a,1800,Caturra|Castillo,lavado,Lavado tradicional,medio,Caramelo|Cacao,88,si,Laboratorio X,2026-03-15,Socorro,Tostadora S.A.S.,FABRICADO POR,NSA-000001-2026,Tostadora S.A.S.,grano|molido,si,si,2
cafe-san-gil,Café San Gil,25000,,,250,,,san-gil,,1650,Colombia,lavado,,medio_oscuro,Chocolate|Nuez,86.5,no,,,,,,,,grano,no,si,1
cafe-viejo,Café Viejo,25000,,,,,,socorro,,1700,Bourbon,lavado,,medio,Cereza,,no,,,,,,,,grano|molido,no,no,3
`,
  "plazos_envio.csv": `zona,plazo_estimado,plazo_maximo
1,Mismo día o siguiente día hábil,1 día hábil
2,1 a 3 días hábiles,3 días hábiles
3,1 a 3 días hábiles,3 días hábiles
4,2 a 6 días hábiles,6 días hábiles
5,5 a 12 días hábiles,por cotizar
`,
  "tarifas_envio.csv": `zona,clave,nombre,medio,hasta_1kg_cop,hasta_2kg_cop,hasta_5kg_cop,mas_5kg,vigencia_desde
1,bucaramanga,Bucaramanga,mensajero,8800,11600,15400,por_cotizar,2026-11-05
2,zona2,Resto de Santander,transportadora,12100,16200,22000,por_cotizar,2026-11-05
3,zona3,Capitales,transportadora,18000,23000,33000,por_cotizar,2026-11-05
4,zona4,Resto del país,transportadora,22000,28100,37400,por_cotizar,2026-11-05
5,zona5,Trayecto especial,transportadora_o_472,por_cotizar,por_cotizar,por_cotizar,por_cotizar,2026-11-05
`,
  "zonas_envio.csv": `nivel,departamento,municipio,zona,nota
departamento,Santander,,2,
municipio,Santander,Bucaramanga,1,
municipio,"Bogotá, D.C.","Bogotá, D.C.",3,
departamento,Amazonas,,5,
`,
  "config.csv": `clave,valor
nombre_tienda,De Santander
whatsapp,573001129874
ciudad_despacho,Bucaramanga
nota_envio,Enviamos a todo Colombia.
formas_pago,Efectivo contraentrega|Transferencia Bre-B
max_cantidad,20
version_terminos,1
fecha_terminos,2026-11-06
version_politica_datos,2
fecha_politica_datos,2026-12-01
nit,901.234.567-8
domicilio,"Bucaramanga, Santander"
`,
};
/** Las cuatro claves legales obligatorias, para pruebas que reescriben config.csv. */
const LEGAL = "version_terminos,1\nfecha_terminos,2026-11-06\nversion_politica_datos,1\nfecha_politica_datos,2026-11-06\n";

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
  it("lee las reglas de envío", () => {
    expect(catalogo.envios.tarifas.map((t) => t.clave)).toEqual(["bucaramanga", "zona2", "zona3", "zona4", "zona5"]);
    expect(catalogo.envios.tarifas[0].escalones).toEqual([8800, 11600, 15400]);
    expect(catalogo.envios.tarifas[4].escalones).toBeNull();
    expect(catalogo.envios.zonas).toHaveLength(4);
    expect(catalogo.envios.zonas[2]).toEqual({ nivel: "municipio", departamento: "Bogotá, D.C.", municipio: "Bogotá, D.C.", zona: 3 });
  });
  it("lee los plazos por zona (la zona 5 sin máximo)", () => {
    expect(catalogo.envios.plazos.map((p) => p.zona)).toEqual([1, 2, 3, 4, 5]);
    expect(catalogo.envios.plazos[0]).toEqual({ zona: 1, estimado: "Mismo día o siguiente día hábil", maximo: "1 día hábil" });
    expect(catalogo.envios.plazos[4]).toEqual({ zona: 5, estimado: "5 a 12 días hábiles", maximo: null });
  });
  it("lee la configuración, las versiones legales y los datos del vendedor (los que no hay quedan en null)", () => {
    expect(catalogo.tienda).toMatchObject({
      nombre: "De Santander",
      whatsapp: "573001129874",
      ciudadDespacho: "Bucaramanga",
      formasPago: ["Efectivo contraentrega", "Transferencia Bre-B"],
      maxCantidad: 20,
      ivaTarifa: null,
      legal: { versionTerminos: "1", fechaTerminos: "2026-11-06", versionPoliticaDatos: "2", fechaPoliticaDatos: "2026-12-01" },
      vendedor: { razonSocial: null, nit: "901.234.567-8", domicilio: "Bucaramanga, Santander", direccionNotificacion: null, correoContacto: null, matriculaMercantil: null, representanteLegal: null },
    });
  });
  it("lee la tarifa de IVA cuando existe", () => {
    const r = cargarCatalogo(con({ "config.csv": `${BASE["config.csv"]}iva_tarifa,5\n` }));
    expect(r.catalogo.tienda.ivaTarifa).toBe(5);
  });
  it("lee marca, fabricante con su expresión y la notificación sanitaria", () => {
    const c = catalogo.cafes.find((x) => x.slug === "cafe-socorro")!;
    expect(c).toMatchObject({ marca: "Socorro", fabricante: "Tostadora S.A.S.", fabricanteExpresion: "FABRICADO POR", nsa: "NSA-000001-2026", titularNsa: "Tostadora S.A.S." });
    expect(catalogo.cafes.find((x) => x.slug === "cafe-san-gil")).toMatchObject({ marca: null, fabricante: null, fabricanteExpresion: null, nsa: null, titularNsa: null });
  });
  it("avisa del puntaje sin verificar", () => {
    expect(advertencias.some((a) => a.includes("Café San Gil") && a.includes("sin verificar"))).toBe(true);
  });
  it("avisa (no falla) por un café activo sin notificación sanitaria; el inactivo no avisa", () => {
    const sinNsa = advertencias.filter((a) => a.includes("sin notificación sanitaria"));
    expect(sinNsa).toHaveLength(1);
    expect(sinNsa[0]).toContain("Café San Gil");
  });
  it("avisa de notas de cata sin perfil", () => {
    const r = cargarCatalogo(con({ "catalogo.csv": BASE["catalogo.csv"].replace("Caramelo|Cacao", "Caramelo|Humo") }));
    expect(r.advertencias.some((a) => a.includes('"Humo"'))).toBe(true);
  });
  it("avisa si un café está en un municipio por verificar", () => {
    const r = cargarCatalogo(con({ "catalogo.csv": BASE["catalogo.csv"].replace(",san-gil,,1650", ",tona,,1650") }));
    expect(r.advertencias.some((a) => a.includes("por verificar"))).toBe(true);
  });
});

describe("fotos del café", () => {
  it("arma las rutas dentro de public/fotos/cafes/<slug>/ y conserva el orden", () => {
    const c = cargarCatalogo(con({})).catalogo.cafes.find((x) => x.slug === "cafe-socorro")!;
    expect(c.fotos).toEqual(["/fotos/cafes/cafe-socorro/1.jpg", "/fotos/cafes/cafe-socorro/2.png"]);
    expect(c.fotoDescripcion).toBe("Bolsa sobre yute");
  });
  it("un café sin fotos queda con la lista vacía", () => {
    expect(cargarCatalogo(con({})).catalogo.cafes.find((x) => x.slug === "cafe-san-gil")!.fotos).toEqual([]);
  });
  it("avisa de la foto que no está en la carpeta", () => {
    const existe = (ruta: string) => ruta.endsWith("1.jpg");
    let mensaje = "";
    try {
      cargarCatalogo(con({}), existe);
    } catch (e) {
      mensaje = (e as ErrorDatos).errores.join("\n");
    }
    expect(mensaje).toContain('catalogo.csv, línea 2, columna "fotos": no se encontró la foto "2.png". Debe estar en public/fotos/cafes/cafe-socorro/2.png.');
  });
  it("rechaza nombres con carpetas o extensiones raras", () => {
    const e = errores({ "catalogo.csv": BASE["catalogo.csv"].replace("1.jpg|2.png", "../1.jpg|foto.gif") });
    expect(e.filter((m) => m.includes('columna "fotos"'))).toHaveLength(2);
  });
});

describe("formato del archivo", () => {
  it("acepta punto y coma (Excel en español) y BOM", () => {
    const pv = `﻿clave;valor\nnombre_tienda;De Santander\nwhatsapp;573001129874\nciudad_despacho;Bucaramanga\nnota_envio;Hola, mundo\nformas_pago;A|B\nmax_cantidad;5\n${LEGAL.replaceAll(",", ";")}`;
    const r = cargarCatalogo(con({ "config.csv": pv }));
    expect(r.catalogo.tienda).toMatchObject({ nombre: "De Santander", notaEnvio: "Hola, mundo", formasPago: ["A", "B"], maxCantidad: 5 });
  });
  it("ignora líneas en blanco y espacios alrededor", () => {
    const r = cargarCatalogo(con({ "catalogo.csv": "slug , nombre , precio_250g, municipio_slug, altura_msnm, variedades, proceso, tueste, notas_cata, moliendas\n\n cafe-san-gil , Café San Gil , 25000 , san-gil, 1650, Colombia, lavado, medio, Nuez, grano\n" }));
    expect(r.catalogo.cafes[0].presentaciones[0].precioCop).toBe(25000);
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
      if (n === "catalogo.csv") throw new Error("ENOENT");
      return BASE[n];
    };
    expect(() => cargarCatalogo(leer)).toThrow(/catalogo\.csv: no se encontró el archivo en data\//);
  });
  it("falta una columna y hay otra desconocida", () => {
    const e = errores({ "catalogo.csv": BASE["catalogo.csv"].replace("slug,nombre,precio_250g", "slug,nombres,precio_250") });
    expect(e).toContain('catalogo.csv: falta la columna "nombre" en la primera línea.');
    expect(e.some((m) => m.includes('la columna "precio_250" no existe'))).toBe(true);
  });
  it("precio con puntos, tueste y proceso inválidos: informa todo junto", () => {
    const cafes = BASE["catalogo.csv"].replace("medio_oscuro", "medio oscuro").replace(",lavado,Lavado tradicional,medio,", ",lavadoo,Lavado tradicional,medio,").replace("50000", "50.000");
    const e = errores({ "catalogo.csv": cafes });
    expect(e).toContain('catalogo.csv, línea 3, columna "tueste": "medio oscuro" no es válido. Opciones: claro, medio_claro, medio, medio_oscuro, oscuro.');
    expect(e.some((m) => m.startsWith('catalogo.csv, línea 2, columna "proceso": "lavadoo"'))).toBe(true);
    expect(e.some((m) => m.startsWith('catalogo.csv, línea 2, columna "precio_500g": "50.000" no es un número entero.') && m.includes("sin puntos"))).toBe(true);
  });
  it("referencias a filas que no existen", () => {
    const e = errores({
      "municipios.csv": BASE["municipios.csv"].replace("san-gil,San Gil,68679,guanenta", "san-gil,San Gil,68679,mares"),
      "catalogo.csv": BASE["catalogo.csv"].replace("finca-a", "finca-z").replace("cafe-viejo,Café Viejo,25000,,,,,,socorro", "cafe-viejo,Café Viejo,25000,,,,,,nadie"),
    });
    expect(e).toContain('municipios.csv, línea 3, columna "provincia_slug": "mares" no existe en provincias.csv.');
    expect(e.some((m) => m.includes('"finca-z" no existe'))).toBe(true);
    expect(e.some((m) => m.includes('"nadie" no existe en municipios.csv'))).toBe(true);
  });
  it("slugs repetidos y mal escritos", () => {
    const e = errores({
      "catalogo.csv": BASE["catalogo.csv"].replace("cafe-san-gil,Café San Gil", "cafe-socorro,Café San Gil").replace("cafe-viejo,", "Café Viejo,"),
    });
    expect(e.some((m) => m.includes('"cafe-socorro" ya aparece en la línea 2'))).toBe(true);
    expect(e.some((m) => m.includes('"Café Viejo" no es un identificador válido'))).toBe(true);
  });
  it("un café activo sin ningún precio", () => {
    const e = errores({ "catalogo.csv": BASE["catalogo.csv"].replace("cafe-san-gil,Café San Gil,25000,,,250", "cafe-san-gil,Café San Gil,,,,") });
    expect(e).toContain('catalogo.csv, línea 3, columna "precio_250g": el café está activo pero no tiene ningún precio; llena al menos una columna precio_….');
  });
  it("agotados con un tamaño que no tiene precio", () => {
    const e = errores({ "catalogo.csv": BASE["catalogo.csv"].replace("cafe-san-gil,Café San Gil,25000,,,250", "cafe-san-gil,Café San Gil,25000,,,500") });
    expect(e.some((m) => m.includes('columna "agotados": "500" no es un tamaño con precio'))).toBe(true);
  });
  it("puntaje verificado exige fuente y fecha", () => {
    const e = errores({ "catalogo.csv": BASE["catalogo.csv"].replace("Laboratorio X,2026-03-15", ",") });
    expect(e.some((m) => m.includes('"puntaje_fuente": es obligatoria'))).toBe(true);
    expect(e.some((m) => m.includes('"puntaje_fecha": es obligatoria'))).toBe(true);
  });
  it("fechas y números inválidos", () => {
    const e = errores({
      "catalogo.csv": BASE["catalogo.csv"].replace("2026-03-15", "2026-02-30").replace(",88,", ",ochenta,").replace(",1650,", ",5000,"),
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
      "catalogo.csv": BASE["catalogo.csv"].replace("grano|molido,si,si,2", "grano|espresso,si,si,2"),
    });
    expect(e.some((m) => m.includes('"color_hex": "rojo" no es un color'))).toBe(true);
    expect(e.some((m) => m.includes('"moliendas": "espresso" no es válido'))).toBe(true);
  });
  it("booleano inválido", () => {
    const e = errores({ "catalogo.csv": BASE["catalogo.csv"].replace("grano|molido,si,si,2", "grano|molido,si,quizas,2") });
    expect(e.some((m) => m.includes('"activo": "quizas" no es válido; escribe "si" o "no"'))).toBe(true);
  });
  it("productor con tipo o municipio inválido", () => {
    const e = errores({ "productores.csv": "slug,nombre,tipo,municipio_slug,activo\nfinca-a,Finca A,hacienda,nadie,si\n" });
    expect(e.some((m) => m.includes('"tipo": "hacienda" no es válido'))).toBe(true);
    expect(e.some((m) => m.includes('"municipio_slug": "nadie" no existe'))).toBe(true);
  });
  it("configuración incompleta o inválida", () => {
    const e = errores({
      "config.csv": `clave,valor\nnombre_tienda,De Santander\nwhatsapp,+57 300 112 9874\nwhatsapp,1\nciudad_despacho,Bucaramanga\nmax_cantidad,mucho\nextra,x\nformas_pago,\n${LEGAL}`,
    });
    expect(e.some((m) => m.includes('whatsapp "+57 300 112 9874" debe llevar solo dígitos'))).toBe(true);
    expect(e.some((m) => m.includes('"whatsapp" ya aparece en la línea 3'))).toBe(true);
    expect(e.some((m) => m.includes('"extra" no es una clave válida'))).toBe(true);
    expect(e.some((m) => m.includes('"max_cantidad"') || m.includes('"valor": "mucho"'))).toBe(true);
    expect(e).toContain('config.csv: falta un valor para la clave "nota_envio".');
    expect(e).toContain('config.csv: falta un valor para la clave "formas_pago".');
  });
  it("las versiones y fechas legales son obligatorias y la fecha debe ser válida (LEG-088)", () => {
    const sinLegal = errores({ "config.csv": BASE["config.csv"].replace(/version_terminos.*\n/, "").replace("fecha_politica_datos,2026-12-01", "fecha_politica_datos,6 de noviembre") });
    expect(sinLegal).toContain('config.csv: falta un valor para la clave "version_terminos".');
    expect(sinLegal.some((m) => m.includes('"6 de noviembre" no es una fecha válida'))).toBe(true);
    const iva = errores({ "config.csv": `${BASE["config.csv"]}iva_tarifa,cinco\n` });
    expect(iva.some((m) => m.includes('"cinco" no es un número entero'))).toBe(true);
  });
  it("fabricante exige la expresión del rótulo, y la expresión o el titular exigen su dato", () => {
    const e = errores({
      "catalogo.csv": BASE["catalogo.csv"]
        .replace("Socorro,Tostadora S.A.S.,FABRICADO POR,NSA-000001-2026,Tostadora S.A.S.", "Socorro,Tostadora S.A.S.,,NSA-000001-2026,Tostadora S.A.S.")
        .replace("86.5,no,,,,,,,,grano", "86.5,no,,,,,ENVASADO POR,,Alguien,grano"),
    });
    expect(e.some((m) => m.includes('línea 2, columna "fabricante_expresion": es obligatoria cuando hay fabricante'))).toBe(true);
    expect(e.some((m) => m.includes('línea 3, columna "fabricante": está vacía pero fabricante_expresion tiene valor'))).toBe(true);
    expect(e.some((m) => m.includes('línea 3, columna "nsa": está vacía pero titular_nsa tiene valor'))).toBe(true);
    const expresion = errores({ "catalogo.csv": BASE["catalogo.csv"].replace("FABRICADO POR", "Fabricado por") });
    expect(expresion.some((m) => m.includes('"fabricante_expresion": "Fabricado por" no es válido. Opciones: FABRICADO POR, ENVASADO POR'))).toBe(true);
  });
  it("la columna vieja registro_sanitario ya no existe", () => {
    const e = errores({ "catalogo.csv": BASE["catalogo.csv"].replace(",nsa,", ",registro_sanitario,") });
    expect(e.some((m) => m.includes('la columna "registro_sanitario" no existe'))).toBe(true);
  });
  it("plazos: exige las cinco zonas, máximo real en 1 a 4 y «por cotizar» en la 5", () => {
    const e = errores({ "plazos_envio.csv": "zona,plazo_estimado,plazo_maximo\n1,Mismo día,por cotizar\n5,5 a 12 días hábiles,30 días\n5,x,por cotizar\n" });
    expect(e.some((m) => m.includes('plazos_envio.csv, línea 2, columna "plazo_maximo": la zona 1 tiene tarifa publicada y necesita un plazo máximo'))).toBe(true);
    expect(e.some((m) => m.includes('línea 3, columna "plazo_maximo": en la zona 5 debe decir "por cotizar"'))).toBe(true);
    expect(e.some((m) => m.includes('columna "zona": "5" ya aparece en la línea 3'))).toBe(true);
    for (const z of [2, 3, 4]) expect(e).toContain(`plazos_envio.csv: falta la fila de la zona ${z}.`);
  });
  it("ErrorDatos resume cuántos problemas hay", () => {
    expect(() => cargarCatalogo(con({ "config.csv": "clave,valor\n" }))).toThrow(/Hay 10 problemas/);
  });
});

describe("datos reales de data/", () => {
  it("pasan la validación y tienen lo esperado", () => {
    const { catalogo } = cargarCatalogoDesdeDisco();
    expect(catalogo.cafes.length).toBeGreaterThan(0);
    expect(catalogo.provincias).toHaveLength(7);
    expect(catalogo.municipios).toHaveLength(87);
    expect(catalogo.municipios.filter((m) => m.porVerificar).map((m) => m.slug)).toEqual([]);
    expect(catalogo.municipios.every((m) => m.divipola)).toBe(true);
    expect(catalogo.cafes.every((c) => c.presentaciones.length === 2 && c.provinciaSlug)).toBe(true);
    expect(catalogo.tienda.whatsapp).toBe("573001129874");
  });
  it("las zonas de envío usan los nombres de divipola.json y hay tarifa para cada zona", () => {
    const { envios } = cargarCatalogoDesdeDisco().catalogo;
    expect(envios.tarifas.map((t) => t.zona)).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
    expect(envios.zonas.filter((r) => r.zona === 1).map((r) => r.municipio)).toEqual(["Bucaramanga", "Floridablanca", "Piedecuesta", "Girón"]);
  });
});
