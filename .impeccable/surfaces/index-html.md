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
Compradores para casa, regalos y negocios, mayormente en celular. Deben entender en segundos que es una tienda de café de origen organizada por provincias de Santander (café de otras marcas, con marca y fabricante en cada ficha), elegir un café (tamaño y molienda) y enviar el pedido por WhatsApp.

## Proof and content
Mapa real de Santander: límites municipales DANE MGN 2018; pertenencia municipio → provincia según el anexo de municipios de Santander de Wikipedia (Comunera, García Rovira, Guanentá, Metropolitana, Soto, Vélez, Yariguíes; Tona por verificar). Cinco cafés en los CSV de `data/`. Sin fotografías ni testimonios: no se inventan.

## Direction contract
THESIS: El origen se ve antes que el precio: el catálogo filtrable abre la tienda y el mapa de Santander, debajo, es el segundo camino para explorar por provincia. Rechaza la plantilla de tienda genérica (hero con cifras, fila de iconos, banda CTA).

OWN-WORLD: Marca De Santander v4.1 (docs/marca-v4.1.md). Fondo pergamino #f7f1e6 con tinta tostado #24170f; tema oscuro monte #0a3f25 en portada e historia. Titulares en Fraunces 700 con una palabra de remate en itálica; todo lo demás en Montserrat. CTA principal en verde bosque (oro con texto carbón sobre oscuro). Terracota solo para origen y notas de tueste. Mapa con las cinco familias de color por provincia, curvas de nivel de bajo contraste, grano de papel, franja de bandera a sangre. Sin emojis, sin sombras decorativas, sin bandera ni escudo completos.

STORY: El visitante entiende que es una tienda de café de origen por provincias de Santander, filtra el catálogo (o toca una provincia en el mapa), abre la ficha de un café, elige tamaño y molienda y envía el pedido por WhatsApp sabiendo que el envío y el pago se confirman allí.

FIRST VIEWPORT: Portada en monte con titular, una línea de bajada y CTA "Ver cafés". Inmediatamente debajo, el catálogo con barra de filtros (provincias como chips) y tarjetas de café con precio "desde" y "Agregar". Celular: portada corta, filtros en hoja inferior, barra "Tu pedido".

FORM: Catálogo filtrable con mapa interactivo sincronizado (la URL es la única fuente de verdad). Sustituye al atlas de dos páginas de la v1.

Signature interaction: elegir una provincia en el mapa o en los chips filtra el catálogo y encuadra el mapa; "Ver todo Santander" vuelve al departamento completo. Movimiento reducido: cambio instantáneo.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Provincia de Tona (Metropolitana o Soto).
- Descripciones de Metropolitana, Soto, Vélez y Yariguíes.
- Procesos "Lavado …": ¿distintos o el mismo?
