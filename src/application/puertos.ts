import type { Catalogo } from "@/domain/catalogo/catalogo";
import type { BloqueEstructurado } from "@/domain/marca/reglas-texto";
import type { CarritoGuardado } from "@/domain/pedido/persistencia";

/** De dónde sale el comercio: precios, disponibilidad, provincias, cafés. Hoy son los CSV de data/. */
export interface CatalogoRepositorio {
  obtener(): Promise<Catalogo>;
}

/** Fotos de un café o una provincia. */
export interface Foto {
  url: string;
  alt: string;
  credito: string;
}

export interface ContenidoCafe {
  slug: string;
  /** Texto editorial en párrafos. */
  historia: string[];
  fotos: Foto[];
}

export interface Cifra {
  valor: string;
  contexto: string;
  fuente: string;
  fecha: string;
}

export interface ContenidoProvincia {
  slug: string;
  historia: string[];
  cifras: Cifra[];
  foto: Foto | null;
}

export interface PasoContenido {
  titulo: string;
  texto: string;
}

export interface ContenidoInicio {
  titular: string | null;
  remate: string | null;
  bajada: string | null;
  textoBoton: string | null;
  comoPedir: PasoContenido[];
}

export interface ContenidoHistoria {
  titular: string | null;
  remate: string | null;
  texto: string[];
  foto: Foto | null;
  proceso: PasoContenido[];
  /** Solo si existe una cita real. */
  cita: { texto: string; autor: string | null; lugar: string | null } | null;
}

export interface ContenidoLegal {
  seccion: string;
  version: string;
  vigenteDesde: string;
  contenido: BloqueEstructurado[];
}

/** De dónde sale lo editorial: historias, fotos, textos de página. Hoy es Sanity (con respaldo vacío). */
export interface ContenidoRepositorio {
  cafe(slug: string): Promise<ContenidoCafe | null>;
  provincia(slug: string): Promise<ContenidoProvincia | null>;
  inicio(): Promise<ContenidoInicio | null>;
  historia(): Promise<ContenidoHistoria | null>;
  legal(seccion: string): Promise<ContenidoLegal | null>;
  /** Slugs que tienen contenido, para comprobar que enlazan con los CSV. */
  slugs(): Promise<SlugsConContenido>;
}

export interface SlugsConContenido {
  cafes: string[];
  provincias: string[];
  productores: string[];
}

/** Dónde se guarda el carrito en el navegador. */
export interface CarritoAlmacen {
  cargar(): CarritoGuardado;
  guardar(carrito: Omit<CarritoGuardado, "version">): void;
  /** Avisa cuando el carrito cambia en otra pestaña. Devuelve la función para dejar de escuchar. */
  suscribir(alCambiar: () => void): () => void;
}
