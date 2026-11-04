import { describe, expect, it, vi } from "vitest";
import { verificarContenido } from "@/application/casos-uso/verificar-contenido";
import { cargarCatalogoDesdeDisco } from "../csv/repositorio-catalogo-csv";
import {
  CONSULTA_CAFE,
  CONSULTA_HISTORIA,
  CONSULTA_INICIO,
  CONSULTA_LEGAL,
  CONSULTA_PROVINCIA,
  CONSULTA_SLUGS,
  crearClienteSanity,
  crearRepositorioContenido,
  RepositorioContenidoSanity,
  RepositorioContenidoVacio,
  type ClienteGroq,
} from "./contenido-sanity";

function clienteFalso(respuestas: Record<string, unknown>) {
  const fetch = vi.fn(async (consulta: string) => respuestas[consulta] ?? null);
  return { cliente: { fetch } as unknown as ClienteGroq, fetch };
}
const bloque = (texto: string) => ({ _type: "block", children: [{ text: texto }] });
const foto = { url: "https://cdn.sanity.io/images/p/d/a.jpg", alt: "Cafetal con niebla", credito: "Ana Pérez, Socorro, 2026" };

describe("RepositorioContenidoSanity", () => {
  it("convierte la historia en párrafos y valida las fotos", async () => {
    const { cliente, fetch } = clienteFalso({
      [CONSULTA_CAFE]: { slug: "cafe-oiba", historia: [bloque("Primero"), bloque("Segundo")], galeria: [foto] },
    });
    const c = await new RepositorioContenidoSanity(cliente).cafe("cafe-oiba");
    expect(c).toEqual({ slug: "cafe-oiba", historia: ["Primero", "Segundo"], fotos: [foto] });
    expect(fetch).toHaveBeenCalledWith(CONSULTA_CAFE, { slug: "cafe-oiba" });
  });
  it("omite y avisa de las fotos sin texto alternativo o crédito", async () => {
    const avisar = vi.fn();
    const { cliente } = clienteFalso({
      [CONSULTA_CAFE]: { slug: "x", galeria: [foto, { ...foto, alt: "" }, { ...foto, credito: null }, { alt: "a", credito: "b" }] },
    });
    const c = await new RepositorioContenidoSanity(cliente, avisar).cafe("x");
    expect(c?.fotos).toEqual([foto]);
    expect(avisar).toHaveBeenCalledTimes(3);
    expect(avisar.mock.calls[0][0]).toMatch(/café x: una foto se omitió/);
  });
  it("devuelve null si no hay documento", async () => {
    const { cliente } = clienteFalso({});
    const repo = new RepositorioContenidoSanity(cliente);
    expect(await repo.cafe("nada")).toBeNull();
    expect(await repo.provincia("nada")).toBeNull();
  });
  it("sin historia ni galería entrega listas vacías", async () => {
    const { cliente } = clienteFalso({ [CONSULTA_CAFE]: { slug: "x" } });
    expect(await new RepositorioContenidoSanity(cliente).cafe("x")).toEqual({ slug: "x", historia: [], fotos: [] });
  });
  it("lee la provincia con cifras y foto", async () => {
    const cifra = { valor: "≈ 40 %", contexto: "del área", fuente: "FNC", fecha: "2025-12-01" };
    const { cliente } = clienteFalso({ [CONSULTA_PROVINCIA]: { slug: "guanenta", historia: [bloque("Cañones")], cifras: [cifra], foto } });
    expect(await new RepositorioContenidoSanity(cliente).provincia("guanenta")).toEqual({ slug: "guanenta", historia: ["Cañones"], cifras: [cifra], foto });
  });
  it("omite las cifras sin fuente o fecha (regla de marca)", async () => {
    const avisar = vi.fn();
    const buena = { valor: "10", contexto: "c", fuente: "FNC", fecha: "2025-01-01" };
    const { cliente } = clienteFalso({
      [CONSULTA_PROVINCIA]: { slug: "g", cifras: [buena, { ...buena, fuente: "" }, { ...buena, fecha: "ayer" }, { ...buena, fecha: null }], foto: null },
    });
    const p = await new RepositorioContenidoSanity(cliente, avisar).provincia("g");
    expect(p?.cifras).toEqual([buena]);
    expect(p?.foto).toBeNull();
    expect(avisar).toHaveBeenCalledTimes(4);
  });
  it("lista los slugs con contenido y tolera listas ausentes", async () => {
    const { cliente } = clienteFalso({ [CONSULTA_SLUGS]: { cafes: ["a", "b"], provincias: null } });
    expect(await new RepositorioContenidoSanity(cliente).slugs()).toEqual({ cafes: ["a", "b"], provincias: [], productores: [] });
  });
  it("avisa por consola por defecto", async () => {
    const aviso = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { cliente } = clienteFalso({ [CONSULTA_CAFE]: { slug: "x", galeria: [{ url: "no-url" }] } });
    await new RepositorioContenidoSanity(cliente).cafe("x");
    expect(aviso.mock.calls[0][0]).toMatch(/^\[Sanity\]/);
    aviso.mockRestore();
  });
});

describe("páginas editoriales", () => {
  it("lee la página de inicio y descarta pasos incompletos", async () => {
    const { cliente } = clienteFalso({
      [CONSULTA_INICIO]: { titular: "Del cañón", remate: "a tu taza", bajada: null, textoBoton: "Ver cafés", comoPedir: [{ titulo: "Elige", texto: "Tu café" }, { titulo: "", texto: "x" }, { titulo: "Sin texto" }] },
    });
    expect(await new RepositorioContenidoSanity(cliente).inicio()).toEqual({
      titular: "Del cañón",
      remate: "a tu taza",
      bajada: null,
      textoBoton: "Ver cafés",
      comoPedir: [{ titulo: "Elige", texto: "Tu café" }],
    });
  });
  it("lee la historia con foto, proceso y cita", async () => {
    const { cliente } = clienteFalso({
      [CONSULTA_HISTORIA]: {
        titular: "Santander",
        remate: "en cada taza",
        texto: [bloque("Uno")],
        foto,
        proceso: [{ titulo: "Cosecha", texto: "Manual" }],
        cita: { texto: "Aquí se cultiva", autor: "Doña Ana", lugar: null },
      },
    });
    const h = await new RepositorioContenidoSanity(cliente).historia();
    expect(h).toMatchObject({ titular: "Santander", texto: ["Uno"], foto, proceso: [{ titulo: "Cosecha", texto: "Manual" }], cita: { texto: "Aquí se cultiva", autor: "Doña Ana", lugar: null } });
  });
  it("sin cita real no hay cita", async () => {
    const { cliente } = clienteFalso({ [CONSULTA_HISTORIA]: { titular: "x", cita: { texto: "", autor: "a" } } });
    expect((await new RepositorioContenidoSanity(cliente).historia())?.cita).toBeNull();
  });
  it("devuelve null si no hay documento de inicio o historia", async () => {
    const repo = new RepositorioContenidoSanity(clienteFalso({}).cliente);
    expect(await repo.inicio()).toBeNull();
    expect(await repo.historia()).toBeNull();
    expect(await repo.legal("terminos")).toBeNull();
  });
  it("lee una página legal con su estructura", async () => {
    const { cliente, fetch } = clienteFalso({
      [CONSULTA_LEGAL]: { seccion: "terminos", version: "2026-11-01", vigenteDesde: "2026-11-01", contenido: [{ _type: "block", style: "h3", children: [{ text: "Uso" }] }, bloque("Texto")] },
    });
    expect(await new RepositorioContenidoSanity(cliente).legal("terminos")).toEqual({
      seccion: "terminos",
      version: "2026-11-01",
      vigenteDesde: "2026-11-01",
      contenido: [{ tipo: "titulo", texto: "Uso" }, { tipo: "parrafo", texto: "Texto" }],
    });
    expect(fetch).toHaveBeenCalledWith(CONSULTA_LEGAL, { seccion: "terminos" });
  });
  it("omite una página legal sin versión o fecha", async () => {
    const avisar = vi.fn();
    const { cliente } = clienteFalso({ [CONSULTA_LEGAL]: { seccion: "terminos", version: "1", vigenteDesde: null, contenido: [] } });
    expect(await new RepositorioContenidoSanity(cliente, avisar).legal("terminos")).toBeNull();
    expect(avisar).toHaveBeenCalledOnce();
  });
});

describe("configuración de Sanity", () => {
  it("sin proyecto no hay cliente y el repositorio es el vacío (el build no falla)", async () => {
    expect(crearClienteSanity({})).toBeNull();
    expect(crearClienteSanity({ NEXT_PUBLIC_SANITY_PROJECT_ID: "   " })).toBeNull();
    const repo = crearRepositorioContenido({});
    expect(repo).toBeInstanceOf(RepositorioContenidoVacio);
    expect(await repo.cafe("x")).toBeNull();
    expect(await repo.provincia("x")).toBeNull();
    expect(await repo.inicio()).toBeNull();
    expect(await repo.historia()).toBeNull();
    expect(await repo.legal("terminos")).toBeNull();
    expect(await repo.slugs()).toEqual({ cafes: [], provincias: [], productores: [] });
  });
  it("con proyecto crea el cliente de lectura (sin llamar a la red)", () => {
    const env = { NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123", NEXT_PUBLIC_SANITY_DATASET: "pruebas", SANITY_READ_TOKEN: "tok" };
    expect(crearClienteSanity(env)).not.toBeNull();
    expect(crearClienteSanity({ NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123" })).not.toBeNull();
    expect(crearRepositorioContenido(env)).toBeInstanceOf(RepositorioContenidoSanity);
  });
});

describe("verificarContenido", () => {
  const { catalogo } = cargarCatalogoDesdeDisco();
  it("sin contenido o con slugs válidos no hay errores", () => {
    expect(verificarContenido(catalogo, { cafes: [], provincias: [], productores: [] })).toEqual([]);
    expect(verificarContenido(catalogo, { cafes: ["cafe-oiba"], provincias: ["guanenta"], productores: [] })).toEqual([]);
  });
  it("nombra cada slug que no existe y en qué CSV debería estar", () => {
    const e = verificarContenido(catalogo, { cafes: ["cafe-oyba"], provincias: ["mares"], productores: ["finca-x"] });
    expect(e).toEqual([
      'Sanity (cafeContenido): el slug "cafe-oyba" no existe en data/catalogo.csv. Corrige el slug en el Studio o agrega la fila al CSV.',
      'Sanity (provinciaContenido): el slug "mares" no existe en data/provincias.csv. Corrige el slug en el Studio o agrega la fila al CSV.',
      'Sanity (productorContenido): el slug "finca-x" no existe en data/productores.csv. Corrige el slug en el Studio o agrega la fila al CSV.',
    ]);
  });
});
