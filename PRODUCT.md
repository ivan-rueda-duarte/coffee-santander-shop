# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Personas para su casa:** consumidores en Colombia que compran café de especialidad para tomar en casa. Buena parte compra desde el celular.
- **Regalos:** personas que compran café para regalar, ya sea un detalle personal o un regalo de empresa.
- **Negocios:** cafeterías, restaurantes u oficinas que compran por volumen. En la tienda pueden pedir hasta 20 bolsas por café y presentación; los pedidos mayores se coordinan por WhatsApp.

El trabajo común a todos: elegir un café sabiendo de dónde viene y cómo sabe, decidir tamaño y molienda, y hacer el pedido sin fricción.

## Product Purpose

De Santander es la tienda en línea de una marca propia de café de origen de Santander, Colombia. La marca comercializa café de fincas de familias productoras santandereanas con su nombre; no lo tuesta (indicado por el dueño el 2026-11-05). La tienda muestra el origen de cada café (provincia, municipio, altura, variedad, proceso, tueste, perfil de taza y puntaje SCA) y convierte el carrito en un pedido por WhatsApp.

Éxito: que el visitante elija un café, arme su carrito y envíe el pedido por WhatsApp con toda la información que la tienda necesita para cerrar la venta (cafés, tamaño, molienda, ciudad y forma de pago).

## Positioning

Cada café se presenta por su provincia de Santander, y la provincia explica el perfil de taza. Es una marca propia con origen trazable a provincia y municipio santandereanos, no un catálogo genérico de café colombiano.

## Operating Context

- **Compra:** el visitante navega el catálogo, filtra por provincia, abre la ficha de un café, elige tamaño y molienda, y agrega al carrito. Al pulsar "Finalizar compra por WhatsApp" se abre WhatsApp con el pedido ya escrito; **el pedido existe solo cuando el cliente envía ese mensaje**.
- **Cierre de venta:** se hace por chat de WhatsApp con la tienda (+57 300 112 9874). Ahí se confirman el envío (cuando es por cotizar) y la forma de pago.
- **Despacho:** desde Bucaramanga a todo Colombia. El costo del envío se calcula en el sitio por zona y peso (`docs/ENVIOS.md`, tarifas en `data/tarifas_envio.csv`); solo es «por cotizar» en la zona 5 y en pedidos de más de 5 kg, y en ese caso se confirma por WhatsApp antes de que el cliente pague.
- **Pagos:** efectivo contraentrega y transferencia Bre-B. No hay pago en línea.

## Capabilities and Constraints

- **Presentaciones:** cada café define sus propios tamaños y precios en los CSV de `data/` (en la v1 vivían en `js/data.js`). Hoy los cinco cafés tienen 250 g a $25.000 y 500 g a $50.000.
- **Molienda:** grano entero o molido, mismo precio.
- **Puntaje:** puntaje de taza en la escala SCA (Specialty Coffee Association); 80 o más es café de especialidad.
- **Provincias de Santander:** Comunera, García Rovira, Guanentá, Metropolitana, Soto Norte (slug `soto`), Vélez y Yariguíes, según la Ordenanza 009 de 2019 de la Asamblea de Santander. La provincia de cada café se deriva de su municipio con la tabla `MUNICIPIO_PROVINCIA` (87 municipios, con código DIVIPOLA en `data/municipios.csv`). Tona, Zapatoca, Rionegro y Simacota aparecen en dos provincias en la ordenanza: se dejaron en Soto Norte, Metropolitana, Metropolitana y Comunera. Cimitarra (Vélez), Onzaga (Guanentá) y Piedecuesta (Metropolitana) no están en la ordenanza y se asignaron por indicación del usuario. Los límites del mapa vienen del Marco Geoestadístico Nacional 2018 del DANE.
- **Terminología:** usar "provincia" (no "región" ni "origen") para las provincias de Santander, y "puntaje SCA" para el puntaje. Como es marca propia, los nombres de los cafés ("Café Barichara", "Café Oiba"…) son líneas de producto de De Santander, no marcas de terceros; por eso la tienda no tiene filtro por marca.
- **Carrito:** se guarda en el navegador; máximo 20 bolsas por café y presentación; sin cuentas de usuario.
- **Técnica:** sitio estático exportado con Next.js (GitHub Pages), sin servidor ni base de datos. Los datos de comercio viven en archivos CSV editados a mano y los textos editoriales en Sanity. Precios en pesos colombianos con formato $25.000. Textos en español. La v1 sin framework se conserva en `legacy/`.
- **Pendiente de decidir:**
  - Si los procesos "Lavado tradicional", "Lavado controlado", "Lavado premium" y "Lavado especial" son procesos distintos o el mismo lavado.
  - Nombres de finca de cada café (campo `finca` vacío).
  - Descripciones de las provincias Metropolitana, Soto Norte, Vélez y Yariguíes.

## Brand Commitments

- Nombre: **De Santander**. Descriptor en uso: "Café de origen".
- Afirmaciones confirmadas por la marca: trabaja con fincas de familias productoras santandereanas con tradición cafetera; recolección manual en el punto de maduración; secado al sol. «Tueste por lotes» queda fuera: la marca no tuesta (2026-11-05).

## Evidence on Hand

- Catálogo de cinco cafés en `js/data.js` (Socorro, Barichara, San Gil, Málaga y Oiba) con municipio, altura, variedad, proceso, tueste, perfil de taza, puntaje SCA, descripción e historia. Estos datos vienen del proyecto original y no se han verificado uno por uno en esta sesión.
- Descripciones de las provincias Comunera, García Rovira y Guanentá en `js/data.js`.
- **No existen todavía:** fotografías de producto o de fincas, logotipo en archivo, nombres de fincas, testimonios, reseñas, cifras de clientes, premios ni prensa. No se deben inventar.

## Product Principles

1. **El origen se ve antes que el precio.** Cada café dice de qué provincia y municipio viene y qué se va a encontrar en la taza.
2. **La página hace el trabajo del chat.** Tamaño, molienda, precio, ciudad y forma de pago quedan resueltos antes de abrir WhatsApp, para que la conversación solo confirme envío y pago.
3. **Honestidad sobre lo que falta.** Lo que no está confirmado (costo de envío, datos pendientes) se dice como pendiente; no se rellena con texto de marketing ni datos inventados.
4. **Celular primero.** Comprar con una mano desde el teléfono tiene que ser tan fácil como en escritorio.
5. **La provincia es el hilo conductor.** El catálogo, la navegación y el lenguaje se organizan alrededor de las provincias de Santander.

## Decisiones (v2)

- **2026-11-04: datos de comercio en CSV, sin base de datos.** Provincias, municipios, cafés, presentaciones, precios, disponibilidad y configuración de la tienda se mantienen en CSV dentro del repositorio, editados a mano. Un cambio de precio o de disponibilidad requiere reconstruir el sitio. Sustituye a la propuesta con Supabase.
- **2026-11-04: el pedido sigue naciendo en WhatsApp.** Sin base de datos no se registran pedidos antes de enviar: se mantiene el principio de que el pedido existe cuando el cliente envía el mensaje. La v2 no asigna número de pedido.
- **2026-11-04: los puntajes SCA no se muestran mientras no estén verificados.** El sello, el filtro y el orden por SCA solo usan cafés con `puntaje_verificado = si`, con fuente y fecha. Hoy ninguno lo está, así que la v2 no muestra puntajes (la v1 sí los mostraba).
- **2026-11-04: la ficha de café es una página propia** (`/cafes/<slug>/`), no un modal. El botón «Agregar» de la tarjeta sigue añadiendo un café sin salir del catálogo (primer tamaño disponible, grano entero).
- **2026-11-04: filtros que se ocultan solos.** Un filtro con menos de dos valores distintos (hoy Precio, Proceso, Productor y SCA) no se muestra.
- **2026-11-04: datos de envío completos antes de WhatsApp.** Nombre, celular, departamento, municipio, dirección y forma de pago son obligatorios; correo, barrio e indicaciones son opcionales. Se aceptan los términos y la autorización de datos (casillas sin marcar) antes de finalizar. *Actualizada el 2026-11-05 (LEG-040 a LEG-048):* la cédula se reemplaza por **tipo y número de documento, opcionales** (CC, CE, PPT o pasaporte; solo para la factura a nombre del comprador; constante `DOCUMENTO_OBLIGATORIO` en `src/domain/pedido/envio.ts`, que solo se activa con soporte escrito del agregador o del contador), y se agrega el **código postal, opcional y manual** (sin autocompletar: ningún municipio de Santander tiene un código único), con enlace al visor de 4-72. Ninguno de los dos se guarda en el navegador.
- **2026-11-04: textos de la v1 sin respaldo no se reutilizan.** La historia de la marca usa solo las afirmaciones confirmadas (fincas de familias santandereanas, recolección manual, secado al sol). Las historias de cada café vienen de Sanity cuando existan.
- **2026-11-05: el envío se calcula por zonas.** El sitio calcula el envío con la tabla zona × escalón de peso (hasta 1, 2 y 5 kg; peso = bolsas + 80 g de empaque, y el límite de cada escalón también suma esos 80 g: 1.080 / 2.080 / 5.080 g) y lo suma al total del pedido y al mensaje de WhatsApp, sin API de transportadora ni base de datos. Es «por cotizar» solo en la zona 5 (trayecto especial) y en pedidos de más de 5 kg: el total se rotula «sin envío» y el valor se confirma por WhatsApp antes de pagar. Los destinos que no aparecen en `data/zonas_envio.csv` son zona 4. El cajón del carrito no conoce el destino y dice «se calcula al elegir tu ciudad». Los plazos se publican solo como orientación, sin fechas prometidas. El «pedido mínimo sugerido» es informativo. La página `/envios/` muestra las tarifas generadas desde el CSV.
