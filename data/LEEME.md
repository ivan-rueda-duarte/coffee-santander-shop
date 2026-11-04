# Datos de la tienda (CSV)

Estos archivos son la fuente de verdad del comercio: qué cafés hay, cuánto cuestan y cómo se despacha. Se editan a mano (Excel, Google Sheets o un editor de texto) y se guardan como **CSV UTF-8**.

Después de editar (en GitHub, basta con hacer commit y push: el despliegue reconstruye solo):

1. Ejecuta `npm run datos`. Revisa todos los archivos y, si algo está mal, dice el archivo, la línea y la columna.
2. Reconstruye y despliega el sitio. Un cambio de precio o de disponibilidad no se ve hasta entonces.

Reglas generales

- La primera línea es la cabecera: no cambies los nombres de las columnas. Las columnas marcadas *(opcional)* se pueden borrar.
- Separador: coma, o punto y coma si tu Excel lo guarda así (se detecta solo).
- Listas dentro de una celda: separadas por `|`, por ejemplo `Caramelo|Cacao|Frutos rojos`.
- Sí/no: escribe `si` o `no`.
- Números sin puntos, comas ni `$`: `25000`, no `$25.000`.
- Los `slug` son identificadores: minúsculas, números y guiones, sin tildes (`san-gil`). Una vez publicado un slug, no lo cambies: las URLs y los carritos guardados lo usan.

## catalogo.csv (el archivo del día a día)

**Una fila por café.** Aquí se cambian precios, agotados, fotos, textos de cata y se agregan o retiran cafés. Es el único archivo que normalmente necesitas tocar.

| Columna | Qué es |
|---|---|
| `slug` | Identificador del café (`cafe-oiba`). Define también la carpeta de sus fotos. |
| `nombre` | Nombre que se ve en el sitio. |
| `precio_250g`, `precio_500g`, `precio_1000g` | Precio en pesos de cada tamaño, solo dígitos (`25000`). **Vacío = ese tamaño no se vende.** Hace falta al menos un precio. |
| `agotados` *(opcional)* | Tamaños sin existencias, en lista: `500` o `250\|500`. El café sigue visible y ese tamaño aparece agotado. |
| `fotos` *(opcional)* | Nombres de los archivos de foto, en lista y en el orden en que se muestran: `1.jpg\|2.jpg\|3.jpg`. La primera es la principal. Ver "Fotos" más abajo. |
| `foto_descripcion` *(opcional)* | Frase corta que describe las fotos (para lectores de pantalla). Si falta se usa el nombre del café. |
| `municipio_slug` | Debe existir en `municipios.csv`. La provincia se deduce del municipio. |
| `productor_slug` *(opcional)* | Debe existir en `productores.csv`. |
| `altura_msnm` | Metros sobre el nivel del mar (0 a 4000). Puede ir vacía. |
| `variedades` | Lista: `Castillo\|Caturra`. |
| `proceso` | `lavado`, `honey`, `natural` o `fermentacion_controlada`. |
| `proceso_detalle` *(opcional)* | Texto libre, por ejemplo `Lavado controlado`. No se muestra mientras no se decida si son procesos distintos. |
| `tueste` | `claro`, `medio_claro`, `medio`, `medio_oscuro` u `oscuro`. |
| `notas_cata` | Lista de notas. De ellas sale el perfil de taza. |
| `puntaje_sca` *(opcional)* | De 0 a 100. |
| `puntaje_verificado` *(opcional)* | `si` solo si el puntaje tiene soporte. Exige `puntaje_fuente` (quién lo cató) y `puntaje_fecha` (`2026-03-15`). Sin verificar, no se muestra el sello. |
| `registro_sanitario` *(opcional)* | Registro INVIMA; se muestra cuando existe. |
| `moliendas` | `grano`, `molido` o `grano\|molido`. |
| `destacado`, `activo`, `orden` *(opcionales)* | `activo=no` retira el café del sitio sin borrar la fila. |

Los tamaños admitidos son 250, 500 y 1000 g. Otro tamaño exige agregar una columna en el código (`TAMANOS_GRAMOS` en `src/domain/catalogo/tipos.ts`).

### Fotos de los productos

1. Crea (si no existe) la carpeta **`public/fotos/cafes/<slug-del-cafe>/`**. Ya están creadas para los cinco cafés actuales, por ejemplo `public/fotos/cafes/cafe-oiba/`.
2. Copia ahí las fotos (`.jpg`, `.png`, `.webp` o `.avif`). Nombres sin espacios ni tildes: `1.jpg`, `bolsa-frente.jpg`. Conviene vertical 3:4 y menos de 400 KB cada una.
3. En `catalogo.csv`, en la columna `fotos` de ese café, escribe los nombres separados por `|`: `1.jpg|2.jpg|3.jpg`. **Puedes poner todas las fotos que quieras:** la primera es la principal (tarjeta del catálogo y cabecera de la ficha) y las demás se muestran debajo.
4. Ejecuta `npm run datos`: si un nombre no coincide con un archivo, dice cuál falta y dónde debe estar.

Para cambiar una foto, reemplaza el archivo (mismo nombre) o cambia el nombre en el CSV. Un café sin `fotos` muestra la ilustración de la marca. Si el CSV no tiene fotos pero Sanity sí, se usan las de Sanity.

## provincias.csv y municipios.csv

Las siete provincias de Santander y sus 87 municipios. `descripcion` vacía = no se muestra. En `municipios.csv`, `divipola` es el código del DANE; los municipios con la provincia sin confirmar (hoy Tona) llevan `por_verificar` en `si` y la provincia vacía. El trazado del mapa se genera con `npm run mapa` y lee estos dos archivos.

## productores.csv

Vacío por ahora. Cuando haya al menos dos productores con datos aparecerá el filtro "Productor / finca". `tipo`: `finca`, `productor` o `marca_aliada`.

## config.csv

Pares `clave,valor`: `nombre_tienda`, `whatsapp` (con indicativo y solo dígitos: `573001129874`), `ciudad_despacho`, `nota_envio`, `formas_pago` (lista con `|`) y `max_cantidad`. Las claves `razon_social`, `nit`, `domicilio` y `correo_contacto` son datos legales del vendedor: mientras estén vacías no se muestran en el sitio.
