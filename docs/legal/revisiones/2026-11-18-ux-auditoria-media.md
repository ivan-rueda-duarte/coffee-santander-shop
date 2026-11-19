> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.2 — 2026-11-19.

# Revisión LEG-183 a LEG-187: auditoría UX de severidad media (M4, M8 y ficha agotada)

**Pedido.** Dictamen sobre las tres preguntas [CONSULTAR-LEGAL] de `docs/diseno/2026-11-18-ux-auditoria-media.md` (secciones M8, «Ficha con tamaños agotados» y M4) y sobre dos textos nuevos de interfaz (ficha agotada y mapa).

**Fuentes (solo lectura).** Esa especificación (:212-258, :300-358, :382-427, :452-458); `envios-devoluciones-retracto.md` (D3) §2; `microcopy-legal.md` v1.11, §1.4 (leyenda de IVA «bajo el precio», hoy D5 §6.2); `terminos-y-condiciones.md` (garantía: «Todos nuestros cafés tienen garantía legal»); `politica-tratamiento-datos.md` (D2) §3; `revisiones/2026-11-05-ajuste-textos-dueno.md` (texto de portada sin café); código: `src/ui/componentes/catalogo/tarjeta-cafe.tsx` (:54-58, «desde $…» también con el café agotado), `src/app/cafes/[slug]/page.tsx` (:55-60, JSON-LD `offers` con precio y `OutOfStock`), `src/ui/componentes/catalogo/seccion-catalogo.tsx:17`, `src/data/mapa-santander.json` (`fuente`: DANE, MGN 2018; Ordenanza 009 de 2019).

## 1. Marco

**Lo que exige la norma.** Información clara, veraz, suficiente, oportuna y verificable sobre los productos ofrecidos (Ley 1480 de 2011, art. 23). Precio de venta al público en pesos, con todos los impuestos, de los productos que se ofrezcan (art. 26). Las condiciones anunciadas en la publicidad obligan y la publicidad no puede inducir a error (arts. 29 y 30). En comercio electrónico, información cierta sobre el producto, su precio y el envío antes de contratar (art. 50). Tratamiento de datos solo para finalidades informadas (Ley 1581 de 2012, arts. 4 y 12) y contacto comercial en los canales y horarios de la Ley 2300 de 2023. Numeración y literales: VERIFICAR (no se consultaron fuentes oficiales en esta revisión; se citan como en LEG-145, LEG-171 y LEG-178).

**Ninguna norma** regula si una lista se muestra abierta o plegada, ni obliga a mostrar el precio de un producto que no se ofrece.

## 2. Hallazgos

| # | Severidad | Ubicación | Texto o práctica | Riesgo y norma | Corrección propuesta |
|---|---|---|---|---|---|
| LEG-183 | Baja | `/envios/` en celular (M8), tarjetas de las zonas 3, 4 y 5 | «Cubre» dentro de un `<details>` cerrado «Qué cubre la zona {n}». D3 §2: «La lista de municipios de cada zona está en esta página». | Un desplegable nativo en la misma página cumple «está en esta página»: el texto está en el HTML, se abre con un toque, sin salir y sin JavaScript. El precio que paga cada cliente no depende de leer la lista: el resumen calcula el envío con su municipio y muestra la zona antes de enviar (arts. 23 y 50). La descripción de cada zona sigue visible en el texto de D3 §2. Riesgo menor: Safari no abre el `<details>` con la búsqueda de la página. | **Aceptado con condiciones:** (1) `<summary>` visible con el texto exacto `Qué cubre la zona {n}`; (2) contenido letra por letra de `cubre(t)`, mismo orden y mismo lugar de la tarjeta; (3) el medio de entrega, la nota de la promoción y los precios (o «Por cotizar…») quedan fuera del desplegable, siempre visibles; (4) desde `lg`, la tabla de hoy sin cambio; (5) las zonas 1 y 2, abiertas. No cambia el texto de D3: no requiere validación del abogado; se le informa. Si el dueño prefiere la lista abierta, también es conforme. |
| LEG-184 | Baja | Ficha totalmente agotada (`bloque-compra.tsx`) | Se omiten el precio y la leyenda de IVA. | El art. 26 obliga a publicar el precio de lo que se **ofrece**; un café sin ningún tamaño disponible no se ofrece, y sin precio no hay leyenda que poner «bajo el precio» (D5 §6.2). Omitirlos **no es ilegal**. Pero crea incoherencia: la tarjeta del catálogo sigue mostrando «desde $…» de ese café, el filtro y el orden por precio lo usan y el JSON-LD publica su precio con `OutOfStock`. El cliente ve un precio en la tarjeta y ninguno en la ficha (art. 23, información clara). | **Recomendación de legal: la alternativa de diseño.** Cada píldora agotada muestra su precio (sin tachar) con «Agotado» debajo, y la leyenda de IVA se queda; cantidad, total, nota de máximo y plazo se ocultan. Coincide con la tarjeta y el JSON-LD, y D5 §6.2 no se toca. Si el dueño prefiere omitir el precio, es conforme **solo si** la tarjeta de ese café también deja de mostrar «desde $…» (p. ej., solo la pastilla «Agotado») y se informa al abogado; el JSON-LD puede conservar el precio con `OutOfStock`, que es cierto. **Decisión del dueño.** |
| LEG-185 | Informativa | Antetítulo del catálogo, `seccion-catalogo.tsx:17` | «Nuestros cafés». | «Nuestros» se lee como «los que vendemos», no como «de nuestra marca». El propio paquete del abogado usa la misma expresión en D1 y D3 («Todos nuestros cafés tienen garantía legal»). Cada tarjeta muestra el nombre de la marca del fabricante y la ficha dice «Comercializa: De Santander SAS». No induce a error sobre quién fabrica (arts. 29 y 30). | **Conforme tal como está. «Los cafés» también es conforme.** Es una decisión de marca, no legal. Si se cambia, D1 y D3 no cambian. Lo que sigue prohibido es «marca propia», «nuestro tueste» o similares (LEG-069 a LEG-071). |
| LEG-186 | Baja | Ficha agotada, texto nuevo [UI] | `Este café está agotado por ahora. Escríbenos por WhatsApp y te avisamos cuando vuelva.` | Es una promesa al consumidor: obliga (art. 29). El aviso responde a una solicitud del cliente. Cabe en la finalidad «atender … tus solicitudes» de D2 §3. No es una promoción, siempre que sea un solo aviso sobre ese café. | **Conforme con condiciones:** (1) el dueño se compromete a avisar a quien escriba; si no puede hacerlo, el texto pasa a `Este café está agotado por ahora. Si quieres saber cuándo vuelve, escríbenos por WhatsApp.`; (2) un solo aviso, sobre ese café, por el mismo chat; (3) quien escribe no entra en la lista de promociones sin marcar la casilla 3 (D2 §3); (4) recomendado: aviso en los horarios de la Ley 2300; (5) el enlace `wa.me/{whatsapp}` no lleva datos personales; si lleva texto precargado, solo el nombre del café. |
| LEG-187 | Informativa | Mapa, `seccion-mapa.tsx:42` (M4) | `Elige una provincia para ver sus cafés y filtrar el catálogo. Los puntos marcan el municipio de cada café.` | Describe lo que pasa y usa «provincia». La fuente de la división (riesgo 7: Ordenanza 009 de 2019 y DANE, MGN 2018) sigue en la nota de la misma columna. El municipio de cada punto sale de `data/` y debe coincidir con el que declara el fabricante. | **Conforme.** Condición: la nota de fuente no se mueve fuera de la sección del mapa ni se oculta en celular (diseño la deja «sin cambio»). |

## 3. Dictamen

1. **M8, desplegable: aceptado con condiciones** (LEG-183). No requiere al abogado; se le informa.
2. **Ficha agotada sin precio: conforme, pero no recomendado** (LEG-184). Legal recomienda la alternativa con el precio por tamaño y la leyenda de IVA. Si se omite el precio, también se quita «desde $…» de la tarjeta. Decide el dueño.
3. **«Nuestros cafés»: conforme** (LEG-185). «Los cafés» también lo es. Decide marca.
4. **Textos nuevos:** ficha agotada conforme con condiciones (LEG-186); mapa conforme (LEG-187).

**Dictamen del cambio: Conforme con observaciones.** No hay bloqueantes nuevos. Sigue abierto, sin relación con este cambio, el de Café Arreboles sin NSA (LEG-024/066/089/146, riesgo aceptado por el dueño).

**Nota del 2026-11-19.** A esta fecha **no consta** que se haya informado al abogado de LEG-183 (desplegable «Qué cubre la zona {n}» en `/envios/`). La aprobación que comunicó el dueño el 2026-11-19 se refiere solo al orden de las casillas (LEG-178). LEG-183 queda **pendiente de informar al abogado**. No es requisito para publicar: no cambia el texto de D3 y no necesita su validación.

## Entrega para desarrollador-fullstack

1. **M8** (`src/app/envios/page.tsx`): tarjetas según la especificación, con `<summary>` `Qué cubre la zona {n}` solo en las zonas 3, 4 y 5. `cubre(t)`, medio, nota de la promoción y precios sin cambio, y estos tres últimos fuera del `<details>`.
2. **Ficha agotada** (`bloque-compra.tsx`), si el dueño elige la recomendación: cada píldora agotada muestra `formatearCOP(p.precioCop)` y «Agotado» debajo, y la leyenda de IVA de D5 §6.2 se queda bajo las píldoras. Si elige omitir el precio, `tarjeta-cafe.tsx` no muestra «desde $…» cuando `!estaDisponible(cafe)`.
3. Texto de la ficha agotada: el de LEG-186, o su variante si el dueño no puede comprometerse a avisar.

## Puntos para que QA verifique

- A 360 px: «Qué cubre la zona 3/4/5» cerrado; al abrirlo, el texto es idéntico al de la celda «Cubre» de la tabla de `lg`. Precios y medio visibles sin abrir. Se abre con Enter y Espacio.
- Ficha totalmente agotada: según la opción elegida, precio por tamaño y leyenda de IVA, o ni precio en la ficha ni «desde $…» en la tarjeta. Nunca cantidad ni total.
- El enlace `wa.me` de la ficha agotada no lleva datos personales.
- La nota de fuente del mapa sigue visible junto al texto nuevo, en celular y en escritorio.

## Normas marcadas VERIFICAR

Ley 1480 de 2011, arts. 23, 26, 29, 30 y 50; Ley 1581 de 2012, arts. 4 y 12; Ley 2300 de 2023. No se consultaron fuentes oficiales en esta revisión.
