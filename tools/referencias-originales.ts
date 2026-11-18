// Detección de referencias a las fotos originales (public/fotos/…) en el HTML y el CSS de out/ (QA-019).
// Lo usa `tools/fotos-responsivas.ts --limpiar-out` antes de borrar los originales: si algo los enlaza, el build falla.
//
// Se busca la ruta como texto en todo el archivo, no solo en ciertos atributos: así entran el JSON-LD
// (`<script type="application/ld+json">`), los `style="…url(…)"`, los bloques `<style>`, el CSS con `url(…)`
// y las rutas con basePath, dominio, `?` o `#`. Lo único que se excluye son los datos del payload RSC que
// contienen las rutas sin cargarlas: las listas `"fotos":[…]` del catálogo y las llaves de React
// (`["$","li","/fotos/…",{…}]`), que no son URL sino identificadores de elementos.

/** Listas `"fotos":[…]` del payload RSC, con o sin comillas escapadas (`\"fotos\":[\"…\"]`). */
const LISTA_FOTOS = /\\*"fotos\\*"\s*:\s*\[[^\]]*\]/g;

/** Llave de un elemento React en el payload RSC: `["$","li","<llave>",` → se vacía la llave. */
const LLAVE_REACT = /(\[\\*"\$\\*",\\*"[^"\\]+\\*",\\*")[^"\\]*(\\*")/g;

/** Quita del texto los datos del payload RSC que nombran fotos sin cargarlas. */
export function quitarDatosRsc(texto: string): string {
  return texto.replace(LISTA_FOTOS, "").replace(LLAVE_REACT, "$1$2");
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Originales (rutas públicas, "/fotos/cafes/x/1.jpg") a los que se refiere el texto de un HTML o un CSS.
 * La ruta puede llevar delante un basePath o un dominio y detrás `?`, `#`, comillas, `)` o espacio;
 * no cuenta si sigue un carácter de nombre de archivo (`1.jpg.bak`, `1.jpgx`).
 */
export function referenciasAOriginales(texto: string, originales: readonly string[]): string[] {
  const limpio = quitarDatosRsc(texto);
  return originales.filter((original) => new RegExp(`${escapar(original)}(?![\\w.-])`, "i").test(limpio));
}
