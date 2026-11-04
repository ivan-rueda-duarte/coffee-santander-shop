---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: index.html (tienda De Santander)

## Scope
Página única de la tienda. Modo: **Persuade**. Rediseño completo con mundo visual nuevo; se conservan producto, datos, carrito, flujo WhatsApp, persistencia, filtros por URL y textos aclarados.

## Audience and job
Compradores para casa, regalos y negocios, mayormente en celular. Deben entender en segundos que es café de marca propia organizado por provincias de Santander, elegir un café (tamaño y molienda) y enviar el pedido por WhatsApp.

## Proof and content
Mapa real de Santander: límites municipales DANE MGN 2018; pertenencia municipio → provincia según el anexo de municipios de Santander de Wikipedia (Comunera, García Rovira, Guanentá, Metropolitana, Soto, Vélez, Yariguíes; Tona por verificar). Cinco cafés en `js/data.js`. Sin fotografías ni testimonios: no se inventan.

## Direction contract
THESIS: El atlas abierto: el mapa real de Santander es a la vez portada y filtro, y el catálogo es el índice de lotes en la página opuesta. Rechaza la plantilla de tienda: hero con cifras, fila de tarjetas con iconos, grilla de producto y banda CTA.

OWN-WORLD: Hoja de atlas institucional. Fondo blanco frío, tinta azul casi negra, rellenos pastel de mapa político (una tinta por provincia), límites municipales en filete fino, gratícula con grados en el margen, escala gráfica y norte. Topónimos en versalitas espaciadas; títulos en serif de atlas de época (Young Serif); texto y cifras en sans institucional con números tabulares (Public Sans). Pines bermellón como único acento caliente; botón primario bermellón. Sin vidrio, degradados, emoji ni sombras decorativas.

STORY: El visitante ve Santander dividido en provincias, nota dónde nace cada café, toca una provincia y el mapa se acerca mientras el índice muestra sus lotes; agrega un café sin salir de la primera pantalla, elige tamaño y molienda en la ficha y envía el pedido por WhatsApp sabiendo que el envío y el pago se confirman allí.

FIRST VIEWPORT: Escritorio: pliego de dos páginas sobre un mismo lomo. Página izquierda (~58 %): cartela con el titular de marca y una línea de resumen dinámica, mapa de Santander a sangre con gratícula, pines con nombre de cada café y anotación "Mejor puntaje SCA". Página derecha (~42 %): índice de provincias con sus lotes; cada lote con precio "desde" y botón "Agregar" visible; selector de orden arriba. Celular: cartela, mapa a ancho completo, leyenda de provincias y comienzo del índice; barra inferior "Tu pedido" cuando hay carrito.

FORM: Atlas (mapa + índice en pliego), dirección A "Atlas de provincias" de la crítica, fijada por el usuario; posición 1 de las dos propuestas. seed: none (dirección fijada por el usuario, sin sorteo).

Signature interaction: elegir provincia (en el mapa o en la leyenda) acerca el mapa a esa provincia con una transición de encuadre suave y filtra el índice; "Todas" vuelve al departamento completo. Movimiento reducido: cambio instantáneo.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Provincia de Tona (Metropolitana o Soto).
- Descripciones de Metropolitana, Soto, Vélez y Yariguíes.
- Procesos "Lavado …": ¿distintos o el mismo?
