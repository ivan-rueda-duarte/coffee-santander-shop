import { normalizar } from "../comun/slug";

// Reglas de tono de la marca v4.1 (docs/marca-v4.1.md) aplicadas a un texto.
// Las usan el Studio de Sanity (como advertencias al editar) y las pruebas.

interface Regla {
  /** Se aplica sobre el texto sin tildes y en minúscula. */
  patron: RegExp;
  aviso: string;
}

const REGLAS: Regla[] = [
  { patron: /\bgourmet\b/, aviso: 'Evita "gourmet": la marca nombra el origen y los datos, no adjetivos de lujo.' },
  { patron: /\bpremium\b/, aviso: 'Evita "premium": di qué lo hace distinto (altitud, proceso, variedad).' },
  { patron: /\bexotic[oa]s?\b/, aviso: 'Evita "exótico": el territorio se muestra con datos y paisaje, sin folclor.' },
  { patron: /\bmagic[oa]s?\b/, aviso: 'Evita "mágico": usa un dato concreto.' },
  { patron: /\bel mejor\b/, aviso: 'Evita "el mejor": toda afirmación comercial debe poder demostrarse.' },
  {
    patron: /\bcafe de santander\b/,
    aviso: '"Café de Santander" es una denominación de origen de la FNC: di "café santandereano" o nombra la provincia.',
  },
];

/** Avisos de marca de un texto. Lista vacía = nada que corregir. */
export function avisosDeMarca(texto: string): string[] {
  const limpio = normalizar(texto);
  const avisos = REGLAS.filter((r) => r.patron.test(limpio)).map((r) => r.aviso);

  // Castillo® es marca registrada: lleva ® la primera vez que aparece en el texto.
  const castillo = /castillo/i.exec(texto);
  if (castillo && texto[castillo.index + castillo[0].length] !== "®") {
    avisos.push('Escribe "Castillo®" con ® la primera vez que aparece (marca registrada de la FNC/Cenicafé).');
  }
  return avisos;
}

/** Bloque de texto enriquecido (Portable Text) reducido a lo que nos importa. */
export interface BloqueTexto {
  _type?: string;
  children?: { text?: string }[];
}

function esBloque(valor: unknown): valor is BloqueTexto {
  return typeof valor === "object" && valor !== null && (valor as BloqueTexto)._type === "block";
}

/** Un párrafo de texto por bloque, sin formato. Ignora imágenes y otros objetos. */
export function bloquesAParrafos(bloques: unknown): string[] {
  if (!Array.isArray(bloques)) return [];
  return bloques
    .filter(esBloque)
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join("").trim())
    .filter(Boolean);
}

export interface BloqueEstructurado {
  tipo: "parrafo" | "titulo" | "item";
  texto: string;
  /** Solo en `item`: lista numerada. */
  numerada?: boolean;
}

interface BloqueRico extends BloqueTexto {
  style?: string;
  listItem?: string;
}

/** Párrafos, subtítulos (h3) y elementos de lista, en orden. Para páginas largas como las legales. */
export function bloquesAEstructura(bloques: unknown): BloqueEstructurado[] {
  if (!Array.isArray(bloques)) return [];
  return bloques.filter(esBloque).flatMap((b): BloqueEstructurado[] => {
    const rico = b as BloqueRico;
    const texto = (b.children ?? []).map((c) => c.text ?? "").join("").trim();
    if (!texto) return [];
    if (rico.listItem) return [{ tipo: "item", texto, numerada: rico.listItem === "number" }];
    if (rico.style === "h3") return [{ tipo: "titulo", texto }];
    return [{ tipo: "parrafo", texto }];
  });
}

export function textoDeBloques(bloques: unknown): string {
  return bloquesAParrafos(bloques).join("\n\n");
}
