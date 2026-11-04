# Datos de la tienda (CSV)

Estos seis archivos son la fuente de verdad del comercio: qué cafés hay, cuánto cuestan y cómo se despacha. Se editan a mano (Excel, Google Sheets o un editor de texto) y se guardan como **CSV UTF-8**.

Después de editar:

1. Ejecuta `npm run datos`. Revisa todos los archivos y, si algo está mal, dice el archivo, la línea y la columna.
2. Reconstruye y despliega el sitio. Un cambio de precio o de disponibilidad no se ve hasta entonces.

Reglas generales

- La primera línea es la cabecera: no cambies los nombres de las columnas. Las columnas marcadas *(opcional)* se pueden borrar.
- Separador: coma, o punto y coma si tu Excel lo guarda así (se detecta solo).
- Listas dentro de una celda: separadas por `|`, por ejemplo `Caramelo|Cacao|Frutos rojos`.
- Sí/no: escribe `si` o `no`.
- Números sin puntos, comas ni `$`: `25000`, no `$25.000`.
- Los `slug` son identificadores: minúsculas, números y guiones, sin tildes (`san-gil`). Una vez publicado un slug, no lo cambies: las URLs y los carritos guardados lo usan.

## cafes.csv

| Columna | Qué es |
|---|---|
| `slug`, `nombre` | Identificador y nombre del café. |
| `municipio_slug` | Debe existir en `municipios.csv`. La provincia se deduce del municipio. |
| `productor_slug` *(opcional)* | Debe existir en `productores.csv`. |
| `altura_msnm` | Metros sobre el nivel del mar (0 a 4000). Puede ir vacía. |
| `variedades` | Lista: `Castillo|Caturra`. |
| `proceso` | `lavado`, `honey`, `natural` o `fermentacion_controlada`. |
| `proceso_detalle` *(opcional)* | Texto libre, por ejemplo `Lavado controlado`. No se muestra mientras no se decida si son procesos distintos. |
| `tueste` | `claro`, `medio_claro`, `medio`, `medio_oscuro` u `oscuro`. |
| `notas_cata` | Lista de notas. De ellas sale el perfil de taza. |
| `puntaje_sca` *(opcional)* | De 0 a 100. |
| `puntaje_verificado` *(opcional)* | `si` solo si el puntaje tiene soporte. Exige `puntaje_fuente` (quién lo cató) y `puntaje_fecha` (`2026-03-15`). Sin verificar, no se muestra el sello. |
| `registro_sanitario` *(opcional)* | Registro INVIMA; se muestra cuando existe. |
| `moliendas` | `grano`, `molido` o `grano|molido`. |
| `destacado`, `activo`, `orden` *(opcionales)* | `activo=no` retira el café del sitio sin borrar la fila. |

## presentaciones.csv

Una fila por café y tamaño: `cafe_slug`, `gramos`, `precio_cop`, `disponible` *(opcional, por defecto `si`)*. Un café no puede repetir el mismo tamaño. Para marcar un tamaño como agotado, pon `disponible` en `no`.

## provincias.csv y municipios.csv

Las siete provincias de Santander y sus 87 municipios. `descripcion` vacía = no se muestra. En `municipios.csv`, `divipola` es el código del DANE; los municipios con la provincia sin confirmar (hoy Tona) llevan `por_verificar` en `si` y la provincia vacía. El trazado del mapa se genera con `npm run mapa` y lee estos dos archivos.

## productores.csv

Vacío por ahora. Cuando haya al menos dos productores con datos aparecerá el filtro "Productor / finca". `tipo`: `finca`, `productor` o `marca_aliada`.

## config.csv

Pares `clave,valor`: `nombre_tienda`, `whatsapp` (con indicativo y solo dígitos: `573001129874`), `ciudad_despacho`, `nota_envio`, `formas_pago` (lista con `|`) y `max_cantidad`. Las claves `razon_social`, `nit`, `domicilio` y `correo_contacto` son datos legales del vendedor: mientras estén vacías no se muestran en el sitio.
