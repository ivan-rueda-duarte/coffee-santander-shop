# Pendientes y datos que faltan

Cada ítem marca un `TODO(dato)`: no se muestra en la interfaz hasta que exista el dato real.

## Datos del vendedor (Ley 1480 de 2011)
- TODO(dato): razón social, NIT, domicilio y contacto del vendedor (footer y resumen del pedido).
- TODO(dato): textos legales (términos, privacidad, envíos y devoluciones, retracto). Los redacta el cliente.
- TODO(dato): política de datos (Ley 1581 de 2012). Debe mencionar que el mensaje pasa por WhatsApp (Meta).

## Catálogo
- TODO(dato): fuente y fecha de los puntajes SCA (hoy 86–91 sin verificar). Sin ellos no hay sello ni filtro.
- TODO(dato): nombre de finca o productor de cada café (campo vacío en los 5).
- TODO(dato): registro sanitario INVIMA de cada café.
- TODO(dato): decidir si "Lavado tradicional / controlado / premium / especial" son procesos distintos. Mientras tanto se muestra "Lavado".
- TODO(dato): grado de molienda (¿"Molido" único o espresso / filtrado / prensa francesa?).
- TODO(dato): tabla de nota de cata → perfil de taza (Miel y Canela son ambiguas).
- TODO(dato): confirmar los textos de historia de los 5 cafés; los de la v1 incluyen afirmaciones sin respaldo.

## Territorio
- TODO(dato): provincia de Tona (¿Metropolitana o Soto?).
- TODO(dato): descripciones de Metropolitana, Soto, Vélez y Yariguíes.

## Contenido
- TODO(dato): fotografías de producto y de fincas, con lugar, fecha y crédito.
- TODO(dato): confirmar los textos de "Historia" de la v1 (primeras regiones cafeteras, proceso de beneficio).

## Envío
- TODO(dato): campos obligatorios de envío, ahora que el pedido sale por WhatsApp (v1 pedía ciudad y pago, ambos opcionales).

## Cumplimiento y publicación
- TODO(dato): confirmar si los precios incluyen IVA. El resumen del pedido dice «precio total» solo del producto y que el envío se confirma por WhatsApp; la Ley 1480 pide mostrar el precio total con impuestos.
- TODO(dato): URL pública del sitio (`NEXT_PUBLIC_SITE_URL` / variable `URL_SITIO`) para el sitemap, los enlaces canónicos y Open Graph.
- TODO(dato): usuario de Instagram real de la marca (campo en «Ajustes del sitio» de Sanity); mientras no exista no se muestra.
- TODO(dato): proyecto de Sanity (crearlo con `sanity login` / `sanity init`) y el webhook de despliegue (docs/DEPLOY.md).
- TODO(dato): fotografías de producto en contexto (yute, madera, piedra). Hasta entonces las tarjetas usan una bolsa ilustrada.
