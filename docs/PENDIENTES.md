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
- TODO(dato): descripciones de Metropolitana, Soto Norte, Vélez y Yariguíes.

## Contenido
- TODO(dato): fotografías de producto y de fincas, con lugar, fecha y crédito.
- TODO(dato): confirmar los textos de "Historia" de la v1 (primeras regiones cafeteras, proceso de beneficio).

## Envío
- TODO(dato): campos obligatorios de envío, ahora que el pedido sale por WhatsApp (v1 pedía ciudad y pago, ambos opcionales).

## Envíos por zonas (docs/ENVIOS.md)
- TODO(dato): confirmar con el cliente la lista final de ciudades de zona 3 (`data/zonas_envio.csv`).
- TODO(dato): confirmar los plazos de entrega por zona con el agregador (Envia.com o Mipaquete.com). Hoy la página `/envios/` publica los de `docs/ENVIOS.md` §6 como orientación (constante `PLAZOS` en `src/app/envios/page.tsx`).
- TODO(dato): verificar la cobertura de la zona 5 en el agregador antes de prometer entrega; sin ruta privada, usar 4-72.
- Decidido (2026-11-05): se mantiene `docs/ENVIOS.md` §3. 2 bolsas de 500 g pesan 1.080 g con el empaque y pagan el escalón de 2 kg (Bogotá: $23.000).
- TODO(dato): las tarifas se revisan cada enero (IPC de las transportadoras). La columna `vigencia_desde` se valida pero no se usa para decidir qué tarifa rige.
- TODO(dato): en la zona 5 el medio es «transportadora o 4-72»; definir cuál se usa para poder decirlo en la página de envíos.
- TODO(dato): el texto legal de «Envíos, devoluciones y retracto» (Sanity, `docs/legal/`) debe coincidir con la política de zonas, la regla «por cotizar» y la advertencia de «reclamar en oficina».
- TODO(dato): los pedidos de más de 5 kg y los de zona 5 se cotizan a mano por WhatsApp; falta definir quién responde y en cuánto tiempo (no se promete plazo en el sitio).
- TODO(dato): plazo máximo de entrega por zona. El art. 50 lit. h) de la Ley 1480 (Ley 2439 de 2024) exige informar el plazo antes de finalizar la compra; sin plazo aplican 30 días calendario. Hasta que el cliente lo defina no se muestra «Entrega estimada» en el carrito ni en el resumen (LEG-001, punto 7; texto propuesto: `Entrega estimada: {plazo de la zona}. Te lo confirmamos por WhatsApp.`, con el plazo leído de un CSV).
- TODO(dato): plazo de respuesta de PQR (`docs/legal/envios-devoluciones-retracto.md`).
- TODO(dato): cómo se genera el radicado de PQR, con número, fecha y hora (art. 50 lit. g de la Ley 1480).
- TODO(dato): proveedor definitivo de guías (Envia.com o Mipaquete.com); debe figurar como tercero, con país, en la política de datos.
- TODO(dato): decisión del cliente sobre el retracto del café tostado (alternativas A, B o C del numeral 8 del documento legal; se recomienda A o B).
- TODO(dato): decisión del cliente sobre el flete en el retracto: (a) lo asume el cliente o (b) lo devuelve la tienda.
- TODO(dato): decisión del cliente sobre costos operativos: reenvío por dirección incorrecta, «reclamar en oficina» y diferencias entre tarifa publicada y guía real.
- TODO(dato): decisión sobre la reversión del pago (art. 51) para Bre-B: publicar o no el numeral 9 del documento legal.
- TODO(dato): rótulo «IVA incluido» junto al total y a los precios (LEG-001, punto 9). Espera la respuesta del contador sobre el IVA.

## Cumplimiento y publicación
- TODO(dato): confirmar si los precios incluyen IVA. El resumen del pedido muestra el subtotal de los cafés y el envío por zona (o «por cotizar»); la Ley 1480 pide mostrar el precio total con impuestos.
- TODO(dato): URL pública del sitio (`NEXT_PUBLIC_SITE_URL` / variable `URL_SITIO`) para el sitemap, los enlaces canónicos y Open Graph.
- TODO(dato): usuario de Instagram real de la marca (campo en «Ajustes del sitio» de Sanity); mientras no exista no se muestra.
- TODO(dato): proyecto de Sanity (crearlo con `sanity login` / `sanity init`) y el webhook de despliegue (docs/DEPLOY.md).
- TODO(dato): fotografías de producto en contexto (yute, madera, piedra). Hasta entonces las tarjetas usan una bolsa ilustrada.
