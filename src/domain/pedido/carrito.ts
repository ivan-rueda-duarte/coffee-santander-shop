import type { Molienda } from "../catalogo/tipos";

export interface LineaCarrito {
  cafeSlug: string;
  gramos: number;
  molienda: Molienda;
  cantidad: number;
}

export type AvisoCarrito = { tipo: "maximo"; clave: string };

export interface EstadoCarrito {
  lineas: LineaCarrito[];
  /** Máximo de bolsas por línea (café + presentación + molienda). */
  max: number;
  /** Líneas anteriores a un "quitar" o "vaciar", para poder deshacerlo. */
  deshacer: LineaCarrito[] | null;
  /** Se llena cuando la última acción chocó con el máximo; lo borra la acción siguiente. */
  aviso: AvisoCarrito | null;
}

export type AccionCarrito =
  | { tipo: "agregar"; linea: Omit<LineaCarrito, "cantidad">; cantidad?: number }
  | { tipo: "cambiarCantidad"; clave: string; delta: number }
  | { tipo: "actualizar"; clave: string; cambios: Partial<Pick<LineaCarrito, "gramos" | "molienda">> }
  | { tipo: "eliminar"; clave: string }
  | { tipo: "vaciar" }
  | { tipo: "deshacer" }
  | { tipo: "reemplazar"; lineas: LineaCarrito[] };

export const MAX_POR_LINEA = 20;

export function crearCarrito(lineas: LineaCarrito[] = [], max: number = MAX_POR_LINEA): EstadoCarrito {
  return { lineas: depurarLineas(lineas, () => true, max), max, deshacer: null, aviso: null };
}

/** Identifica una línea: dos líneas con la misma clave son la misma. */
export function claveLinea(l: Pick<LineaCarrito, "cafeSlug" | "gramos" | "molienda">): string {
  return `${l.cafeSlug}|${l.gramos}|${l.molienda}`;
}

/**
 * Deja solo las líneas válidas: cantidad entera ≥ 1 (recortada al máximo), que `esValida`
 * acepte (café existente y disponible, etc.), y fusiona las que tengan la misma clave.
 */
export function depurarLineas(
  lineas: readonly LineaCarrito[],
  esValida: (l: LineaCarrito) => boolean,
  max: number = MAX_POR_LINEA,
): LineaCarrito[] {
  const resultado: LineaCarrito[] = [];
  for (const l of lineas) {
    if (!Number.isInteger(l.cantidad) || l.cantidad < 1 || !esValida(l)) continue;
    const existente = resultado.find((r) => claveLinea(r) === claveLinea(l));
    if (existente) existente.cantidad = Math.min(existente.cantidad + l.cantidad, max);
    else resultado.push({ ...l, cantidad: Math.min(l.cantidad, max) });
  }
  return resultado;
}

const sinAviso = (e: EstadoCarrito, cambios: Partial<EstadoCarrito>): EstadoCarrito => ({
  ...e,
  deshacer: null,
  aviso: null,
  ...cambios,
});

export function reducirCarrito(estado: EstadoCarrito, accion: AccionCarrito): EstadoCarrito {
  const { lineas, max } = estado;

  switch (accion.tipo) {
    case "agregar": {
      const cantidad = Math.max(1, Math.floor(accion.cantidad ?? 1));
      const clave = claveLinea(accion.linea);
      const existente = lineas.find((l) => claveLinea(l) === clave);
      const actual = existente?.cantidad ?? 0;
      if (actual >= max) return sinAviso(estado, { aviso: { tipo: "maximo", clave } });
      const nueva = Math.min(actual + cantidad, max);
      const aviso: AvisoCarrito | null = actual + cantidad > max ? { tipo: "maximo", clave } : null;
      const nuevas = existente
        ? lineas.map((l) => (l === existente ? { ...l, cantidad: nueva } : l))
        : [...lineas, { ...accion.linea, cantidad: nueva }];
      return sinAviso(estado, { lineas: nuevas, aviso });
    }

    case "cambiarCantidad": {
      const linea = lineas.find((l) => claveLinea(l) === accion.clave);
      if (!linea) return estado;
      if (linea.cantidad + accion.delta <= 0) return reducirCarrito(estado, { tipo: "eliminar", clave: accion.clave });
      const cantidad = Math.min(linea.cantidad + accion.delta, max);
      return sinAviso(estado, { lineas: lineas.map((l) => (l === linea ? { ...l, cantidad } : l)) });
    }

    case "actualizar": {
      const linea = lineas.find((l) => claveLinea(l) === accion.clave);
      if (!linea) return estado;
      const cambiada = { ...linea, ...accion.cambios };
      const igual = lineas.find((l) => l !== linea && claveLinea(l) === claveLinea(cambiada));
      if (igual) {
        // La línea cambiada se vuelve idéntica a otra: se fusionan.
        const cantidad = Math.min(igual.cantidad + linea.cantidad, max);
        return sinAviso(estado, { lineas: lineas.filter((l) => l !== linea).map((l) => (l === igual ? { ...l, cantidad } : l)) });
      }
      return sinAviso(estado, { lineas: lineas.map((l) => (l === linea ? cambiada : l)) });
    }

    case "eliminar": {
      if (!lineas.some((l) => claveLinea(l) === accion.clave)) return estado;
      return sinAviso(estado, { lineas: lineas.filter((l) => claveLinea(l) !== accion.clave), deshacer: lineas });
    }

    case "vaciar":
      return lineas.length === 0 ? estado : sinAviso(estado, { lineas: [], deshacer: lineas });

    case "deshacer":
      return estado.deshacer ? sinAviso(estado, { lineas: estado.deshacer }) : estado;

    case "reemplazar":
      return sinAviso(estado, { lineas: depurarLineas(accion.lineas, () => true, max) });
  }
}
