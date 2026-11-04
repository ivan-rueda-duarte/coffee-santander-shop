import { createClient } from "@sanity/client";
import groq from "groq";
import { z } from "zod";
import type {
  ContenidoCafe,
  ContenidoHistoria,
  ContenidoInicio,
  ContenidoLegal,
  ContenidoProvincia,
  ContenidoRepositorio,
  Foto,
  PasoContenido,
  SlugsConContenido,
} from "@/application/puertos";
import { bloquesAEstructura, bloquesAParrafos } from "@/domain/marca/reglas-texto";

/** Lo único que necesitamos de un cliente de Sanity; permite probar sin red. */
export interface ClienteGroq {
  fetch<T>(consulta: string, parametros?: Record<string, unknown>): Promise<T>;
}

export const API_VERSION = "2026-01-01";

export const CONSULTA_CAFE = groq`*[_type == "cafeContenido" && slug == $slug][0]{
  slug,
  historia,
  "galeria": galeria[defined(asset)]{ alt, credito, "url": asset->url }
}`;

export const CONSULTA_PROVINCIA = groq`*[_type == "provinciaContenido" && slug == $slug][0]{
  slug,
  historia,
  "cifras": cifras[]{ valor, contexto, fuente, fecha },
  "foto": foto{ alt, credito, "url": asset->url }
}`;

export const CONSULTA_INICIO = groq`*[_type == "paginaInicio"][0]{ titular, remate, bajada, textoBoton, comoPedir[]{ titulo, texto } }`;

export const CONSULTA_HISTORIA = groq`*[_type == "paginaHistoria"][0]{
  titular, remate, texto,
  "foto": foto{ alt, credito, "url": asset->url },
  proceso[]{ titulo, texto },
  cita{ texto, autor, lugar }
}`;

export const CONSULTA_LEGAL = groq`*[_type == "paginaLegal" && seccion == $seccion][0]{ seccion, version, vigenteDesde, contenido }`;

export const CONSULTA_SLUGS = groq`{
  "cafes": *[_type == "cafeContenido" && defined(slug)].slug,
  "provincias": *[_type == "provinciaContenido" && defined(slug)].slug,
  "productores": *[_type == "productorContenido" && defined(slug)].slug
}`;

const textoNoVacio = z.string().trim().min(1);

// Una foto sin texto alternativo o sin crédito no se publica: es una regla de marca, no un detalle.
const esquemaFoto = z.object({ url: z.url(), alt: textoNoVacio, credito: textoNoVacio });
const esquemaCifra = z.object({ valor: textoNoVacio, contexto: textoNoVacio, fuente: textoNoVacio, fecha: z.iso.date() });

function fotosValidas(entrada: unknown, avisar: (m: string) => void): Foto[] {
  if (!Array.isArray(entrada)) return [];
  return entrada.flatMap((f) => {
    const r = esquemaFoto.safeParse(f);
    if (!r.success) {
      avisar("una foto se omitió porque le falta texto alternativo, crédito o imagen.");
      return [];
    }
    return [r.data];
  });
}

const texto = z.string().trim().min(1).nullish().transform((v) => v ?? null);

function pasosValidos(entrada: unknown): PasoContenido[] {
  if (!Array.isArray(entrada)) return [];
  return entrada.flatMap((p) => {
    const r = z.object({ titulo: textoNoVacio, texto: textoNoVacio }).safeParse(p);
    return r.success ? [r.data] : [];
  });
}

const esquemaInicio = z.object({ titular: texto, remate: texto, bajada: texto, textoBoton: texto, comoPedir: z.unknown().optional() });
const esquemaHistoria = z.object({ titular: texto, remate: texto, texto: z.unknown().optional(), foto: z.unknown().optional(), proceso: z.unknown().optional(), cita: z.unknown().optional() });
const esquemaLegal = z.object({ seccion: textoNoVacio, version: textoNoVacio, vigenteDesde: z.iso.date(), contenido: z.unknown().optional() });
const esquemaCita = z.object({ texto: textoNoVacio, autor: texto, lugar: texto });

const esquemaCafe = z.object({ slug: z.string(), historia: z.unknown().optional(), galeria: z.unknown().optional() });
const esquemaProvincia = z.object({ slug: z.string(), historia: z.unknown().optional(), cifras: z.unknown().optional(), foto: z.unknown().optional() });
const esquemaSlugs = z.object({
  cafes: z.array(z.string()).nullish().transform((v) => v ?? []),
  provincias: z.array(z.string()).nullish().transform((v) => v ?? []),
  productores: z.array(z.string()).nullish().transform((v) => v ?? []),
});

/** Contenido editorial desde Sanity. Si algo no cumple la forma esperada, se omite y se avisa en la consola del build. */
export class RepositorioContenidoSanity implements ContenidoRepositorio {
  constructor(
    private readonly cliente: ClienteGroq,
    private readonly avisar: (mensaje: string) => void = (m) => console.warn(`[Sanity] ${m}`),
  ) {}

  async cafe(slug: string): Promise<ContenidoCafe | null> {
    const crudo = await this.cliente.fetch<unknown>(CONSULTA_CAFE, { slug });
    if (!crudo) return null;
    const dato = esquemaCafe.parse(crudo);
    return {
      slug: dato.slug,
      historia: bloquesAParrafos(dato.historia),
      fotos: fotosValidas(dato.galeria, (m) => this.avisar(`café ${slug}: ${m}`)),
    };
  }

  async provincia(slug: string): Promise<ContenidoProvincia | null> {
    const crudo = await this.cliente.fetch<unknown>(CONSULTA_PROVINCIA, { slug });
    if (!crudo) return null;
    const dato = esquemaProvincia.parse(crudo);
    const cifras = (Array.isArray(dato.cifras) ? dato.cifras : []).flatMap((c) => {
      const r = esquemaCifra.safeParse(c);
      if (!r.success) {
        this.avisar(`provincia ${slug}: una cifra se omitió porque le falta valor, contexto, fuente o fecha.`);
        return [];
      }
      return [r.data];
    });
    return {
      slug: dato.slug,
      historia: bloquesAParrafos(dato.historia),
      cifras,
      foto: fotosValidas([dato.foto], (m) => this.avisar(`provincia ${slug}: ${m}`))[0] ?? null,
    };
  }

  async inicio(): Promise<ContenidoInicio | null> {
    const crudo = await this.cliente.fetch<unknown>(CONSULTA_INICIO);
    if (!crudo) return null;
    const d = esquemaInicio.parse(crudo);
    return { titular: d.titular, remate: d.remate, bajada: d.bajada, textoBoton: d.textoBoton, comoPedir: pasosValidos(d.comoPedir) };
  }

  async historia(): Promise<ContenidoHistoria | null> {
    const crudo = await this.cliente.fetch<unknown>(CONSULTA_HISTORIA);
    if (!crudo) return null;
    const d = esquemaHistoria.parse(crudo);
    const cita = esquemaCita.safeParse(d.cita);
    return {
      titular: d.titular,
      remate: d.remate,
      texto: bloquesAParrafos(d.texto),
      foto: fotosValidas([d.foto], (m) => this.avisar(`historia: ${m}`))[0] ?? null,
      proceso: pasosValidos(d.proceso),
      cita: cita.success ? cita.data : null,
    };
  }

  async legal(seccion: string): Promise<ContenidoLegal | null> {
    const crudo = await this.cliente.fetch<unknown>(CONSULTA_LEGAL, { seccion });
    if (!crudo) return null;
    const r = esquemaLegal.safeParse(crudo);
    if (!r.success) {
      this.avisar(`página legal ${seccion}: se omitió porque le falta versión o fecha de vigencia.`);
      return null;
    }
    return { seccion: r.data.seccion, version: r.data.version, vigenteDesde: r.data.vigenteDesde, contenido: bloquesAEstructura(r.data.contenido) };
  }

  async slugs(): Promise<SlugsConContenido> {
    return esquemaSlugs.parse(await this.cliente.fetch<unknown>(CONSULTA_SLUGS));
  }
}

/** Respaldo sin Sanity: el sitio funciona solo con los datos técnicos de los CSV. */
export class RepositorioContenidoVacio implements ContenidoRepositorio {
  async cafe() {
    return null;
  }
  async provincia() {
    return null;
  }
  async inicio() {
    return null;
  }
  async historia() {
    return null;
  }
  async legal() {
    return null;
  }
  async slugs(): Promise<SlugsConContenido> {
    return { cafes: [], provincias: [], productores: [] };
  }
}

/** Variables de entorno (process.env). Se usan NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET y SANITY_READ_TOKEN. */
export type EntornoSanity = Readonly<Record<string, string | undefined>>;

/** Cliente de lectura, o null si el proyecto de Sanity no está configurado. */
export function crearClienteSanity(env: EntornoSanity = process.env): ClienteGroq | null {
  const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  if (!projectId) return null;
  const token = env.SANITY_READ_TOKEN?.trim() || undefined;
  return createClient({
    projectId,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production",
    apiVersion: API_VERSION,
    // El build lee contenido publicado: sin CDN para no servir datos viejos tras un cambio.
    useCdn: false,
    perspective: "published",
    token,
  });
}

/** Sanity si está configurado; si no, el respaldo vacío (el build no falla). */
export function crearRepositorioContenido(env: EntornoSanity = process.env): ContenidoRepositorio {
  const cliente = crearClienteSanity(env);
  return cliente ? new RepositorioContenidoSanity(cliente) : new RepositorioContenidoVacio();
}
