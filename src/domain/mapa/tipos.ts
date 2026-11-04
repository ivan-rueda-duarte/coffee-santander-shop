/** Forma de src/data/mapa-santander.json (lo genera tools/build_mapa.py; no se edita a mano). */
export interface MunicipioMapa {
  slug: string;
  nombre: string;
  divipola: string;
  /** Slug de la provincia; null si está por verificar (Tona). */
  provincia: string | null;
  /** Trazo SVG. */
  d: string;
  /** Centro en coordenadas del mapa. */
  c: [number, number];
  lonlat: [number, number];
}

export interface ProyeccionMapa {
  lon0: number;
  lat0: number;
  cos: number;
  k: number;
  dx: number;
  dy: number;
}

export type CajaMapa = [number, number, number, number];

export interface DatosMapa {
  fuente: string;
  viewBox: CajaMapa;
  proyeccion: ProyeccionMapa;
  municipios: MunicipioMapa[];
  contorno: string;
  limitesProvincia: string;
  provincias: Record<string, { c: [number, number]; bbox: CajaMapa }>;
}
