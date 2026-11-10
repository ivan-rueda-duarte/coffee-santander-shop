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
| `slug` | Identificador del café (`cafe-arreboles`). Define también la carpeta de sus fotos. |
| `nombre` | Nombre que se ve en el sitio. |
| `marca` *(opcional)* | Marca con la que el fabricante vende el café, tal como está en la bolsa. De Santander es la tienda, no la marca. Se muestra en la ficha («Marca») y en los datos para buscadores solo cuando existe. |
| `fabricante` *(opcional)* | Razón social del fabricante o envasador, tal como en el rótulo de la bolsa. |
| `fabricante_expresion` | `FABRICADO POR` o `ENVASADO POR`, la expresión que usa el rótulo. **Obligatoria si hay `fabricante`** (y no puede ir sola). |
| `nsa` *(opcional)* | Notificación sanitaria del INVIMA (`NSA-003219-2017`). Reemplaza a la antigua columna `registro_sanitario`. La ficha muestra «Notificación sanitaria INVIMA N.° …» solo cuando existe. Un café **activo sin `nsa`** se publica igual, pero `npm run datos` avisa (decisión del dueño, riesgo aceptado; legal recomienda `activo=no`). |
| `titular_nsa` *(opcional)* | Titular de la notificación sanitaria, tal como en el INVIMA. Exige `nsa`. |
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
| `moliendas` | `grano`, `molido` o `grano\|molido`. El café viene así de fábrica: la tienda no muele. |
| `destacado`, `activo`, `orden` *(opcionales)* | `activo=no` retira el café del sitio sin borrar la fila. |

Los tamaños admitidos son 250, 500 y 1000 g. Otro tamaño exige agregar una columna en el código (`TAMANOS_GRAMOS` en `src/domain/catalogo/tipos.ts`).

### Fotos de los productos

1. Crea (si no existe) la carpeta **`public/fotos/cafes/<slug-del-cafe>/`**. Ya están creadas para los dos cafés actuales, por ejemplo `public/fotos/cafes/cafe-arreboles/`.
2. Copia ahí las fotos (`.jpg`, `.png`, `.webp` o `.avif`). Nombres sin espacios ni tildes: `1.jpg`, `bolsa-frente.jpg`. Conviene vertical 3:4 y menos de 400 KB cada una.
3. En `catalogo.csv`, en la columna `fotos` de ese café, escribe los nombres separados por `|`: `1.jpg|2.jpg|3.jpg`. **Puedes poner todas las fotos que quieras:** la primera es la principal (tarjeta del catálogo y cabecera de la ficha) y las demás se muestran debajo.
4. Ejecuta `npm run datos`: si un nombre no coincide con un archivo, dice cuál falta y dónde debe estar.

Para cambiar una foto, reemplaza el archivo (mismo nombre) o cambia el nombre en el CSV. Un café sin `fotos` muestra la ilustración de la marca. Si el CSV no tiene fotos pero Sanity sí, se usan las de Sanity.

## provincias.csv y municipios.csv

Las siete provincias de Santander y sus 87 municipios. `descripcion` vacía = no se muestra. En `municipios.csv`, `divipola` es el código del DANE; la provincia de cada municipio sale de la Ordenanza 009 de 2019 de la Asamblea de Santander. Cimitarra, Onzaga y Piedecuesta no están en la ordenanza y se asignaron por indicación del dueño (Vélez, Guanentá y Metropolitana). Un municipio con la provincia sin confirmar lleva `por_verificar` en `si` y la provincia vacía (hoy ninguno). El trazado del mapa se genera con `npm run mapa` y lee estos dos archivos.

## productores.csv

Vacío por ahora. Cuando haya al menos dos productores con datos aparecerá el filtro "Productor / finca". `tipo`: `finca`, `productor` o `marca_aliada`.

## config.csv

Pares `clave,valor`. Si el valor lleva comas, va entre comillas (`domicilio,"Bucaramanga, Santander"`).

| Clave | Qué es |
|---|---|
| `nombre_tienda`, `whatsapp`, `ciudad_despacho`, `nota_envio`, `formas_pago`, `max_cantidad` | Obligatorias. `whatsapp` con indicativo y solo dígitos (`573001129874`); `nota_envio` es el texto corto del pie; `formas_pago` es una lista con `\|`. |
| `version_terminos`, `fecha_terminos`, `version_politica_datos`, `fecha_politica_datos` | **Obligatorias.** Versión («1») y fecha (`2026-11-06`) de los Términos y condiciones y de la Política de tratamiento de datos. Las leen las casillas del resumen, la última línea del mensaje de WhatsApp y el rótulo «Versión … · vigente desde …» de las páginas legales; nada va fijo en el código. Si cambia la fecha real de publicación o se publica una versión nueva, se cambian aquí **y** en los documentos de `docs/legal/` el mismo día (`npm run datos` falla si no coinciden). |
| `iva_tarifa` *(opcional)* | Tarifa de IVA incluida en los precios (`5`). Con valor, el sitio dice «Precios con IVA del 5 % incluido (art. 468-1 del Estatuto Tributario)»; vacía, dice solo «con todos los impuestos incluidos». Solo se publica con el concepto escrito del contador. |
| `razon_social`, `nit`, `domicilio`, `direccion_notificacion`, `correo_contacto`, `correo_notificacion` | Datos del vendedor (Ley 1480, art. 50). Se muestran en el pie, en el resumen del pedido y en `/legal/vendedor/`; cada dato se pinta solo si existe. `nit` con dígito de verificación (`902.121.184-8`). |
| `matricula_mercantil`, `representante_legal`, `area_datos` | Solo se muestran en `/legal/vendedor/` (el representante es un dato personal; no va en el pie). `area_datos` es el área que atiende consultas de datos personales. |
| `envio_gratis_desde`, `envio_gratis_terminada` *(opcionales)* | Envío gratis en siete comunas de Bucaramanga (ver `comunas_envio_gratis.csv`). **Hoy van vacías: la promoción está apagada.** Ver las instrucciones de esa sección antes de llenarlas. |

## tarifas_envio.csv, zonas_envio.csv y plazos_envio.csv (envíos por zona)

El costo del envío lo calcula el sitio con estas dos tablas; la política completa está en `docs/ENVIOS.md`. Pasos para cambiar una tarifa: edita el número en `tarifas_envio.csv`, ejecuta `npm run datos` y reconstruye el sitio. Conviene revisarlas cada enero.

**`tarifas_envio.csv`**: una fila por tarifa.

| Columna | Qué es |
|---|---|
| `zona` | 1 a 5. |
| `clave` | En zona 1, el `slug` del municipio (`bucaramanga`, `giron`). En las demás, `zona2`, `zona3`, `zona4` y `zona5`. |
| `nombre`, `medio` | Cómo se llama la tarifa y quién entrega (texto libre). |
| `hasta_1kg_cop`, `hasta_2kg_cop`, `hasta_5kg_cop` | Precio en pesos hasta 1, 2 y 5 kg, solo dígitos. Deben ir en aumento. En la zona 5 los tres dicen `por_cotizar`, y en ninguna otra zona puede aparecer `por_cotizar`. |
| `mas_5kg` | Siempre `por_cotizar`. |
| `vigencia_desde` | Fecha desde la que rige (`2026-11-05`). |

Debe existir siempre la tarifa de la zona 4 (`zona4`): es la que se aplica a todo destino que no aparece en `zonas_envio.csv`.

**`zonas_envio.csv`**: una fila por regla. Si un destino coincide con una regla de municipio, gana esa; si no, la del departamento; si no, la zona 4.

| Columna | Qué es |
|---|---|
| `nivel` | `departamento` o `municipio`. |
| `departamento`, `municipio` | Con los nombres del DANE de `src/data/divipola.json` (el formulario guarda esos nombres): `Bogotá, D.C.`, `Cartagena de Indias`, `San José de Cúcuta`, `San Andrés de Tumaco`, `Archipiélago de San Andrés, Providencia y Santa Catalina`. Las que llevan coma van entre comillas. Se compara sin importar tildes ni mayúsculas, pero el nombre tiene que existir: `npm run datos` falla si no. `municipio` va vacío en las reglas de departamento. |
| `zona` | 1 a 5. La zona 1 solo se asigna por municipio, y cada municipio de zona 1 necesita su tarifa en `tarifas_envio.csv`. |
| `nota` *(opcional)* | Comentario para quien edita. |

El peso que se factura es el de las bolsas más 80 g de empaque (constante `EMPAQUE_G` en `src/domain/envio/tipos.ts`), y el límite de cada escalón también suma esos 80 g (1.080, 2.080 y 5.080 g).

## plazos_envio.csv (plazos de entrega por zona)

Una fila por zona (las cinco son obligatorias). Lo que se escribe aquí se publica en el resumen del pedido y en `/envios/` y **obliga ante el cliente** (Ley 1480, art. 50): si no se cumple el máximo, el cliente puede cancelar y hay que devolverle todo en 15 días calendario. Confirma los plazos con la transportadora antes de cambiarlos.

| Columna | Qué es |
|---|---|
| `zona` | 1 a 5. |
| `plazo_estimado` | Lo que suele tardar, en días hábiles, tal como se lee: `1 a 3 días hábiles`, `Mismo día o siguiente día hábil`. |
| `plazo_maximo` | El plazo que la tienda se compromete a cumplir: `3 días hábiles`. En la zona 5 debe decir `por cotizar` (el sitio añade «nunca más de 30 días calendario»); en las zonas 1 a 4 tiene que ser un plazo real. |

Los plazos se cuentan desde que el cliente acepta el total en el chat y, si paga por Bre-B, desde que se recibe el pago (texto legal en `docs/legal/envios-devoluciones-retracto.md`).

## comunas_envio_gratis.csv (envío gratis por comunas)

Una fila por comuna con envío gratis: `departamento`, `municipio`, `comuna` (el nombre que ve el cliente) y `orden` (el orden en que la nombran los textos legales; el selector las ordena alfabéticamente). Hoy son las siete comunas que decidió el dueño el 2026-11-09. `npm run datos` exige **siete comunas de Bucaramanga**, sin repetir, porque los textos legales dicen «siete comunas de Bucaramanga»: agregar, quitar o renombrar una comuna exige primero textos nuevos de legal y una versión nueva de los documentos.

La promoción se enciende y se apaga en `config.csv`:

- `envio_gratis_desde` (fecha `2026-12-01`): desde qué día rige. **Vacía = apagada:** no aparece nada en ningún lado del sitio. **No la llenes antes de que legal publique** los Términos, «Envíos, devoluciones, retracto y garantía» y la Política de tratamiento de datos versión 2 (LEG-106). Ese mismo día se cambian también `version_terminos`, `fecha_terminos`, `version_politica_datos` y `fecha_politica_datos`. Si la promoción está vigente y los documentos no traen el numeral «Envío gratis en comunas de Bucaramanga» (con cada comuna y la fecha de inicio en letras) y las salvedades, `npm run datos` falla y el sitio no se construye.
- `envio_gratis_terminada` (opcional, fecha `2026-12-15`): **para terminar la promoción.** La promoción termina de inmediato cuando el dueño lo decide (P34 b): ese mismo día escribe aquí la fecha **de hoy**, deja `envio_gratis_desde` como estaba (el aviso la usa) y reconstruye y despliega el sitio. Desde ese despliegue desaparecen el campo «Comuna» y el $0, y durante 30 días calendario la portada y el cajón del carrito muestran el aviso «El envío gratis en siete comunas de Bucaramanga terminó el …»; `/envios/#envio-gratis` muestra el aviso y las condiciones que rigieron mientras el numeral siga publicado. Pasados los 30 días, al reconstruir, el aviso deja de salir en portada y cajón. `npm run datos` falla si la fecha es posterior a hoy, si es anterior a `envio_gratis_desde` o si `envio_gratis_desde` está vacía.
- `envio_gratis_hasta`: **ya no se usa** (no hay fecha final anunciada). Si se llena, `npm run datos` falla y remite a `envio_gratis_terminada`.
- Las fechas se comparan con el día del build en Colombia: si la promoción empieza o termina en una fecha futura, hay que reconstruir y desplegar ese día.

Para ver la promoción en un entorno de prueba (nunca en el despliegue): pon una fecha pasada en `envio_gratis_desde` y construye con `ENVIO_GRATIS_PRUEBA=si npm run build`. En ese modo el control de documentos solo avisa y `/envios/` toma las condiciones del borrador de legal. Con `GITHUB_PAGES=true` ese modo falla a propósito. Después, deja otra vez la clave vacía.
