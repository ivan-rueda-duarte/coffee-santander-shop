import type { FilaCsv } from "./lector";

/** Acumula los errores de todos los archivos para mostrarlos juntos. */
export class Errores {
  readonly lista: string[] = [];
  agregar(mensaje: string) {
    this.lista.push(mensaje);
  }
}

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SI = new Set(["si", "sí", "true", "1", "x"]);
const NO = new Set(["no", "false", "0", ""]);

/**
 * Lee las celdas de una fila con conversión y mensaje de error por celda:
 * `cafes.csv, línea 3, columna "tueste": …`.
 */
export class LectorFila {
  constructor(
    private readonly archivo: string,
    private readonly fila: FilaCsv,
    private readonly errores: Errores,
  ) {}

  get linea() {
    return this.fila.linea;
  }

  error(columna: string, mensaje: string) {
    this.errores.agregar(`${this.archivo}, línea ${this.fila.linea}, columna "${columna}": ${mensaje}`);
  }

  private crudo(columna: string): string {
    return this.fila.valores[columna] ?? "";
  }

  /** Texto; "" si está vacío (con `requerido`, vacío es un error). */
  texto(columna: string, requerido = false): string {
    const v = this.crudo(columna);
    if (requerido && v === "") this.error(columna, "está vacía y es obligatoria.");
    return v;
  }

  /** Texto opcional: null si está vacío. */
  textoOpcional(columna: string): string | null {
    return this.crudo(columna) || null;
  }

  slug(columna: string, requerido = true): string {
    const v = this.crudo(columna);
    if (v === "") {
      if (requerido) this.error(columna, "está vacía y es obligatoria.");
      return "";
    }
    if (!SLUG.test(v)) this.error(columna, `"${v}" no es un identificador válido; usa minúsculas, números y guiones, sin tildes ni espacios (por ejemplo "san-gil").`);
    return v;
  }

  entero(columna: string, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, requerido = true } = {}): number | null {
    const v = this.crudo(columna);
    if (v === "") {
      if (requerido) this.error(columna, "está vacía y es obligatoria.");
      return null;
    }
    if (!/^-?\d+$/.test(v)) {
      const pista = /[.,$\s]/.test(v) ? " Escribe solo dígitos, sin puntos, comas, espacios ni el signo $ (por ejemplo 25000)." : "";
      this.error(columna, `"${v}" no es un número entero.${pista}`);
      return null;
    }
    const n = Number(v);
    if (n < min || n > max) {
      this.error(columna, `${n} está fuera del rango permitido (${min} a ${max}).`);
      return null;
    }
    return n;
  }

  /** Decimal con punto o coma: "88.5" y "88,5". */
  decimal(columna: string, { min = 0, max = 100 } = {}): number | null {
    const v = this.crudo(columna);
    if (v === "") return null;
    if (!/^\d+(?:[.,]\d+)?$/.test(v)) {
      this.error(columna, `"${v}" no es un número.`);
      return null;
    }
    const n = Number(v.replace(",", "."));
    if (n < min || n > max) {
      this.error(columna, `${n} está fuera del rango permitido (${min} a ${max}).`);
      return null;
    }
    return n;
  }

  /** si/no (también sí, true/false, 1/0). Vacío vale `porDefecto`. */
  booleano(columna: string, porDefecto = false): boolean {
    const v = this.crudo(columna).toLowerCase();
    if (SI.has(v)) return true;
    if (NO.has(v)) return v === "" ? porDefecto : false;
    this.error(columna, `"${this.crudo(columna)}" no es válido; escribe "si" o "no".`);
    return porDefecto;
  }

  /** Lista separada por "|": "Caramelo|Cacao|Frutos rojos". */
  lista(columna: string, requerido = false): string[] {
    const items = this.crudo(columna).split("|").map((s) => s.trim()).filter(Boolean);
    if (requerido && items.length === 0) this.error(columna, "está vacía y es obligatoria.");
    return items;
  }

  opcion<T extends string>(columna: string, validas: readonly T[], requerido = true): T | null {
    const v = this.crudo(columna);
    if (v === "") {
      if (requerido) this.error(columna, `está vacía y es obligatoria. Opciones: ${validas.join(", ")}.`);
      return null;
    }
    if (!(validas as readonly string[]).includes(v)) {
      this.error(columna, `"${v}" no es válido. Opciones: ${validas.join(", ")}.`);
      return null;
    }
    return v as T;
  }

  opciones<T extends string>(columna: string, validas: readonly T[], requerido = true): T[] {
    const items = this.lista(columna, requerido);
    const invalidos = items.filter((i) => !(validas as readonly string[]).includes(i));
    if (invalidos.length) this.error(columna, `${invalidos.map((i) => `"${i}"`).join(", ")} no ${invalidos.length === 1 ? "es válido" : "son válidos"}. Opciones: ${validas.join(", ")}.`);
    return items.filter((i): i is T => (validas as readonly string[]).includes(i));
  }

  hex(columna: string): string {
    const v = this.crudo(columna);
    if (!/^#[0-9a-fA-F]{6}$/.test(v)) this.error(columna, `"${v}" no es un color; escribe # y seis caracteres (por ejemplo #efc2a6).`);
    return v;
  }

  /** Fecha ISO yyyy-mm-dd, o null si está vacía. */
  fecha(columna: string): string | null {
    const v = this.crudo(columna);
    if (v === "") return null;
    const valida = /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v);
    if (!valida) {
      this.error(columna, `"${v}" no es una fecha válida; usa año-mes-día (por ejemplo 2026-03-15).`);
      return null;
    }
    return v;
  }
}

/** Marca como error los slugs repetidos dentro de un archivo. */
export function verificarUnicos(archivo: string, columna: string, items: { valor: string; linea: number }[], errores: Errores) {
  const vistos = new Map<string, number>();
  for (const { valor, linea } of items) {
    if (!valor) continue;
    const previa = vistos.get(valor);
    if (previa !== undefined) errores.agregar(`${archivo}, línea ${linea}, columna "${columna}": "${valor}" ya aparece en la línea ${previa}.`);
    else vistos.set(valor, linea);
  }
}
