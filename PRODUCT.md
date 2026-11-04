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

De Santander es la tienda en línea de una marca propia de café de especialidad de Santander, Colombia. La marca compra lotes a fincas de familias productoras santandereanas, los tuesta y los vende con su nombre. La tienda muestra el origen de cada café (provincia, municipio, altura, variedad, proceso, tueste, perfil de taza y puntaje SCA) y convierte el carrito en un pedido por WhatsApp.

Éxito: que el visitante elija un café, arme su carrito y envíe el pedido por WhatsApp con toda la información que la tienda necesita para cerrar la venta (cafés, tamaño, molienda, ciudad y forma de pago).

## Positioning

Cada café se presenta por su provincia de Santander, y la provincia explica el perfil de taza. Es una marca propia con origen trazable a provincia y municipio santandereanos, no un catálogo genérico de café colombiano.

## Operating Context

- **Compra:** el visitante navega el catálogo, filtra por provincia, abre la ficha de un café, elige tamaño y molienda, y agrega al carrito. Al pulsar "Finalizar compra por WhatsApp" se abre WhatsApp con el pedido ya escrito; **el pedido existe solo cuando el cliente envía ese mensaje**.
- **Cierre de venta:** se hace por chat de WhatsApp con la tienda (+57 300 112 9874). Ahí se confirman el costo y el tiempo del envío y la forma de pago.
- **Despacho:** desde Bucaramanga a todo Colombia. El costo del envío se confirma por WhatsApp según la ciudad.
- **Pagos:** efectivo contraentrega y transferencia Bre-B. No hay pago en línea.

## Capabilities and Constraints

- **Presentaciones:** cada café define sus propios tamaños y precios en `js/data.js` (`presentaciones`). Hoy los cinco cafés tienen 250 g a $25.000 y 500 g a $50.000.
- **Molienda:** grano entero o molido, mismo precio.
- **Puntaje:** puntaje de taza en la escala SCA (Specialty Coffee Association); 80 o más es café de especialidad.
- **Provincias de Santander:** Comunera, García Rovira, Guanentá, Metropolitana, Soto, Vélez y Yariguíes, con los nombres del anexo de municipios de Santander (Wikipedia); el usuario eligió estos nombres en lugar de "Mares" y "Soto Norte". La provincia de cada café se deriva de su municipio con la tabla `MUNICIPIO_PROVINCIA` (86 municipios). Tona queda por verificar porque la fuente la ubica entre Metropolitana y Soto. Los límites del mapa vienen del Marco Geoestadístico Nacional 2018 del DANE.
- **Terminología:** usar "provincia" (no "región" ni "origen") para las provincias de Santander, y "puntaje SCA" para el puntaje. Como es marca propia, los nombres de los cafés ("Café Barichara", "Café Oiba"…) son líneas de producto de De Santander, no marcas de terceros; por eso la tienda no tiene filtro por marca.
- **Carrito:** se guarda en el navegador; máximo 20 bolsas por café y presentación; sin cuentas de usuario.
- **Técnica:** sitio estático en HTML, CSS y JavaScript sin framework ni paso de compilación; los datos viven en `js/data.js`. Precios en pesos colombianos con formato $25.000. Textos en español.
- **Pendiente de decidir:**
  - Si los procesos "Lavado tradicional", "Lavado controlado", "Lavado premium" y "Lavado especial" son procesos distintos o el mismo lavado.
  - Nombres de finca de cada café (campo `finca` vacío).
  - Descripciones de las provincias Metropolitana, Soto, Vélez y Yariguíes.
  - Provincia de Tona (Metropolitana o Soto).

## Brand Commitments

- Nombre: **De Santander**. Descriptor en uso: "Café de origen".
- Afirmaciones confirmadas por la marca: trabaja con fincas de familias productoras santandereanas con tradición cafetera; recolección manual en el punto de maduración; secado al sol; tueste por lotes según el perfil de cada café.

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
