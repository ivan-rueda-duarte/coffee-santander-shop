// Quita tildes y diéresis: "Guanentá" → "Guanenta", "Güepsa" → "Guepsa".
export function quitarTildes(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Para comparar sin importar mayúsculas ni tildes.
export function normalizar(texto: string): string {
  return quitarTildes(texto).toLowerCase().trim().replace(/\s+/g, " ");
}

// "Guanentá" → "guanenta", "Café San Gil" → "cafe-san-gil".
export function slugify(texto: string): string {
  return quitarTildes(texto)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
