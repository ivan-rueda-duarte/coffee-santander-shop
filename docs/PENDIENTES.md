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
- Según el dueño (2026-11-05), el café no tiene IVA. TODO(dato): confirmación del contador (y tratamiento del flete). Mientras tanto no se muestra «IVA incluido»; si se confirma, basta el rótulo «Total».

## Cumplimiento y publicación
- Según el dueño (2026-11-05), el café no tiene IVA; pendiente la confirmación del contador. El resumen muestra el subtotal de los cafés y el envío por zona (o «por cotizar»).
- TODO(dato): URL pública del sitio (`NEXT_PUBLIC_SITE_URL` / variable `URL_SITIO`) para el sitemap, los enlaces canónicos y Open Graph.
- TODO(dato): usuario de Instagram real de la marca (campo en «Ajustes del sitio» de Sanity); mientras no exista no se muestra.
- TODO(dato): proyecto de Sanity (crearlo con `sanity login` / `sanity init`) y el webhook de despliegue (docs/DEPLOY.md).
- TODO(dato): fotografías de producto en contexto (yute, madera, piedra). Hasta entonces las tarjetas usan una bolsa ilustrada.

## Textos del inicio y la confirmación (LEG-013 a LEG-020)
- Decidido (2026-11-05): el descriptor del sitio es «café de origen», no «café de especialidad» (inicio, pie, metadatos, Historia). Quedan las menciones de la escala SCA en la ficha y las de `PRODUCT.md`/`CLAUDE.md` como descripción interna.
- TODO(dato): soporte del productor para altitud, variedad y proceso de cada café; el texto «En cada café verás…» solo es cierto si los cinco campos existen.
- Decidido (2026-11-05): la marca comercializa el café y no lo tuesta. Se retiró «tueste por lotes» del sitio y de `PRODUCT.md`. TODO(dato): quién tuesta cada café (proveedor) y si existe algún dato de tueste que la marca pueda afirmar.
- TODO(dato): decidir el momento de formación del contrato (al enviar el mensaje, o al aceptar el total). Los textos de confirmación ya siguen la segunda opción; `PRODUCT.md` («el pedido existe cuando el cliente envía el mensaje») aún dice lo contrario.
- TODO(dato): frase opcional «Si no lo aceptas, no pagas nada» en el caso por cotizar.

## Marca propia y rotulado (LEG-021 a LEG-030)
- TODO(dato): fabricante o envasador de cada café (razón social y dirección tal como irán en el rótulo, Res. 5109 de 2005) y su registro, permiso o notificación sanitaria. Hoy `registro_sanitario` está vacío en los dos cafés (LEG-024, bloquea el lanzamiento).
- TODO(dato): modelo de comercialización (LEG-022): A, maquila con marca De Santander; B, reempaque con su marca; C, reventa con la marca del tostador. Si es C cambian la bajada, el pie, los metadatos y la Historia.
- TODO(dato): titular de los nombres «Casa Martínez» y «Arreboles» y autorización de uso (LEG-023).
- TODO(dato): soporte escrito de las fincas sobre recolección manual, secado al sol, altitud, variedad y proceso (LEG-025, LEG-017).
- Decisión del dueño (2026-11-05): la Historia dice «llevamos su café desde el productor hasta tu casa». Legal la marcó como no demostrable (LEG-021, Alta) y propone «despachamos su café desde Bucaramanga a todo Colombia». Se mantiene la frase del dueño; riesgo asumido por él.
