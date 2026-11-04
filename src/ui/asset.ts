// Ruta de un archivo de `public/` respetando el basePath de GitHub Pages.
// Uso: asset("/assets/fotografia/cafetal-montana.jpg")
export function asset(ruta: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
}
