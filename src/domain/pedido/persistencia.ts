import { MOLIENDAS, type Molienda } from "../catalogo/tipos";
import { depurarLineas, MAX_POR_LINEA, type LineaCarrito } from "./carrito";

export const CLAVE_CARRITO_V1 = "desantander.carrito.v1";
export const CLAVE_CARRITO_V2 = "desantander.carrito.v2";

/** Lo que se guarda en el navegador. No incluye datos personales: solo líneas y preferencias de entrega. */
export interface CarritoGuardado {
  version: 2;
  lineas: LineaCarrito[];
  formaPago?: string;
  municipio?: string;
}

// Validación a mano (sin zod): este módulo va en el JS de todas las páginas y zod pesa ~30 KB.
function esLinea(l: unknown): l is LineaCarrito {
  if (typeof l !== "object" || l === null) return false;
  const { cafeSlug, gramos, molienda, cantidad } = l as Record<string, unknown>;
  return (
    typeof cafeSlug === "string" &&
    cafeSlug.length > 0 &&
    typeof gramos === "number" &&
    Number.isInteger(gramos) &&
    gramos > 0 &&
    typeof molienda === "string" &&
    (MOLIENDAS as readonly string[]).includes(molienda) &&
    typeof cantidad === "number" &&
    Number.isInteger(cantidad) &&
    cantidad > 0
  );
}

/** Texto de a lo más `max` caracteres, o undefined. */
const texto = (valor: unknown, max: number): string | undefined => (typeof valor === "string" && valor.length <= max ? valor : undefined);

function leerJson(crudo: string | null): unknown {
  if (!crudo) return null;
  try {
    return JSON.parse(crudo);
  } catch {
    return null;
  }
}

export function serializarCarrito(c: Omit<CarritoGuardado, "version">): string {
  const guardado: CarritoGuardado = { version: 2, ...c };
  return JSON.stringify(guardado);
}

/** Lee el carrito v2. Nunca lanza: lo que no se entiende se descarta línea por línea. */
export function parsearCarrito(crudo: string | null, max: number = MAX_POR_LINEA): CarritoGuardado {
  const vacio: CarritoGuardado = { version: 2, lineas: [] };
  const dato = leerJson(crudo);
  if (typeof dato !== "object" || dato === null) return vacio;
  const o = dato as Record<string, unknown>;
  const lineas = Array.isArray(o.lineas) ? o.lineas.filter(esLinea) : [];
  return {
    version: 2,
    lineas: depurarLineas(lineas, () => true, max),
    formaPago: texto(o.formaPago, 80),
    municipio: texto(o.municipio, 60),
  };
}

// ---------- Migración desde la v1 ----------

const MOLIENDA_V1: Record<string, Molienda> = { "Grano entero": "grano", Molido: "molido" };

/**
 * Convierte el carrito de la v1 (`desantander.carrito.v1`) al formato v2.
 * La v1 identificaba el café con un número; `idASlug` lo traduce. Las líneas cuyo id o molienda
 * no se reconocen se descartan. Devuelve null si no hay nada que migrar.
 */
export function migrarCarritoV1(
  crudo: string | null,
  idASlug: Readonly<Record<number, string>>,
  max: number = MAX_POR_LINEA,
): CarritoGuardado | null {
  const dato = leerJson(crudo);
  if (typeof dato !== "object" || dato === null) return null;
  const o = dato as Record<string, unknown>;
  if (!Array.isArray(o.lines)) return null;

  const lineas: LineaCarrito[] = [];
  for (const l of o.lines) {
    if (typeof l !== "object" || l === null) continue;
    const { cafeId, gramos, molienda, qty } = l as Record<string, unknown>;
    const slug = typeof cafeId === "number" ? idASlug[cafeId] : undefined;
    const moli = typeof molienda === "string" ? MOLIENDA_V1[molienda] : undefined;
    if (!slug || !moli || typeof gramos !== "number" || typeof qty !== "number") continue;
    lineas.push({ cafeSlug: slug, gramos, molienda: moli, cantidad: qty });
  }
  const depuradas = depurarLineas(lineas, (l) => Number.isInteger(l.gramos) && l.gramos > 0, max);
  if (depuradas.length === 0) return null;

  return {
    version: 2,
    lineas: depuradas,
    formaPago: texto(o.pago, 80) || undefined,
    municipio: texto(o.ciudad, 60) || undefined,
  };
}
