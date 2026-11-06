# Pendientes y datos que faltan

Cada ítem marca un `TODO(dato)`: no se muestra en la interfaz hasta que exista el dato real.

## Datos del vendedor (Ley 1480 de 2011)
- Datos del vendedor cargados en `data/config.csv` (2026-11-05): De Santander SAS, NIT 902121184, desantander.tienda@gmail.com. TODO(dato): domicilio (el pie y el resumen no muestran los datos hasta que estén los cuatro) y dígito de verificación del NIT, si se quiere mostrar.
- Textos legales redactados como borradores, todos en **v0.5** (2026-11-05, LEG-063 a LEG-068): `docs/legal/terminos-y-condiciones.md`, `politica-tratamiento-datos.md`, `envios-devoluciones-retracto.md`, `informacion-vendedor.md` y `microcopy-legal.md`. Aplican las decisiones del dueño P1 = B, P2 = C y P3 = a. TODO(dato): aprobación del abogado responsable; hasta entonces no se publican (LEG-056, bloquea el lanzamiento).
- Decidido (2026-11-05): **P2 = C**, el café no admite retracto (alimento, Ley 1480 art. 47 nums. 4 y 6; Concepto SIC 16-062808 de 2016); la garantía legal se mantiene. **P3 = a**, radicado manual `PQR-AAAA-NNN` por chat o correo, respuesta en 15 días hábiles. **P1 = B**, plazo estimado y máximo por zona.
- Preguntas pendientes del dueño: P4, P5 a) a c), P6, P7, P8, P10, P11 y P12, y el dato D-9 (máximos por zona): `docs/legal/checklist-lanzamiento.md` §5.2. Preguntas a terceros: §6.

## Catálogo
- TODO(dato): fuente y fecha de los puntajes SCA (hoy 86–91 sin verificar). Sin ellos no hay sello ni filtro.
- TODO(dato): nombre de finca o productor de cada café (campo vacío en los 5).
- Café Casa Martínez: notificación sanitaria NSA-003219-2017 (cargada 2026-11-05). TODO(dato): registro o notificación sanitaria de Café Arreboles, y su titular/fabricante.
- **Café Arreboles sigue activo sin registro sanitario conocido: riesgo aceptado por el dueño el 2026-11-05 (P9), contra la recomendación de legal.** LEG-024 queda Bloqueante y abierto (LEG-066); el lanzamiento es «No conforme» mientras tanto. Lo cierra el número sanitario con el fabricante tal como en la bolsa (verificado en la consulta pública del INVIMA, cargado en `registro_sanitario` y `fabricante`) o `activo = no`. Advertencia completa en `docs/legal/checklist-lanzamiento.md` §1.
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

## Documento y código postal (LEG-040 a LEG-048)
- TODO(dato): ¿el agregador (Envia.com o Mipaquete.com) exige el número de documento del destinatario para generar la guía, también en contraentrega? Pedir la respuesta por escrito. Sin ella, el documento no puede ser obligatorio (LEG-040).
- TODO(dato): ¿el agregador exige el código postal o lo calcula a partir de la ciudad? (LEG-046).
- TODO(dato): pedir al contador que confirme:
  - si De Santander SAS emite factura electrónica por estas ventas;
  - si la regla de «consumidor final» (222222222222) sigue vigente con la Res. DIAN 165 de 2023;
  - los códigos de tipo de documento del anexo técnico;
  - el plazo de conservación del número de documento.
- Documento: implementado como opcional con selector (`DOCUMENTO_OBLIGATORIO = false`, «decisión del dueño del 2026-11-05» según el código). Queda condicionado a que el contador confirme la factura a nombre del comprador; si no la confirma, se retira el campo (LEG-040).
- TODO(dato): decisión del cliente sobre el código postal: (a) opcional y manual con enlace al visor de 4-72; (b) esperar al agregador.
- TODO(dato): decisión del cliente sobre agregar NIT al selector (LEG-048).
- Si cambia la decisión del 2026-11-04 (cédula opcional), hay que actualizar `PRODUCT.md`. Lo hace el desarrollador.

## Envíos por zonas (docs/ENVIOS.md)
- TODO(dato): confirmar con el cliente la lista final de ciudades de zona 3 (`data/zonas_envio.csv`).
- TODO(dato): confirmar los plazos de entrega por zona con el agregador (Envia.com o Mipaquete.com). Hoy la página `/envios/` publica los de `docs/ENVIOS.md` §6 como orientación (constante `PLAZOS` en `src/app/envios/page.tsx`).
- TODO(dato): verificar la cobertura de la zona 5 en el agregador antes de prometer entrega; sin ruta privada, usar 4-72.
- TODO(dato): las tarifas se revisan cada enero (IPC de las transportadoras). La columna `vigencia_desde` se valida pero no se usa para decidir qué tarifa rige.
- TODO(dato): en la zona 5 el medio es «transportadora o 4-72»; definir cuál se usa para poder decirlo en la página de envíos.
- El texto legal de «Envíos, devoluciones, retracto y garantía» (`docs/legal/envios-devoluciones-retracto.md` v0.5) ya coincide con la política de zonas, la regla «por cotizar» y la advertencia de «reclamar en oficina». TODO(dato): cargarlo en Sanity cuando el abogado lo apruebe (D1).
- TODO(dato): los pedidos de más de 5 kg y los de zona 5 se cotizan a mano por WhatsApp; falta definir quién responde y en cuánto tiempo (no se promete plazo en el sitio).
- Decidido (2026-11-05, P1 = B): el sitio informa un plazo **estimado** y un plazo **máximo** por zona, en días hábiles, en el resumen y en `/envios/` (art. 50 lit. h de la Ley 1480, Ley 2439 de 2024). Textos en `docs/legal/microcopy-legal.md` §5.6 y §5.8; se leen de un CSV (`plazo_estimado`, `plazo_maximo_dias_habiles`).
- TODO(dato): **plazos máximos por zona confirmados con la transportadora o el agregador (D-9, LEG-063).** Propuesta de legal: zona 1, 3; zonas 2 y 3, 6; zona 4, 10; zona 5, 20 días hábiles. El dueño eligió la opción B pero no ha confirmado los números: no se cargan en el CSV ni se publican hasta entonces. Mientras la columna esté vacía, el resumen dice «…entregamos en máximo 30 días calendario».
- Decidido (2026-11-05, P3 = a): radicado manual de PQR con la forma `PQR-AAAA-NNN`, fecha y hora, por el mismo chat o correo; respuesta en máximo 15 días hábiles; registro en una hoja privada (plantilla y columnas en `microcopy-legal.md` §5.7). TODO(dato): nombre o cargo de quien responde (D-3; no se publica) y apertura de la hoja de registro antes de publicar los documentos.
- TODO(dato): proveedor definitivo de guías (Envia.com o Mipaquete.com); debe figurar como tercero, con país, en la política de datos.
- Decidido (2026-11-05, P2 = C): el café no admite retracto. Envíos §9, términos §9, vendedor y la línea del resumen (`microcopy-legal.md` §5.3) informan la exclusión antes de la compra. Las alternativas A y B se retiraron de los documentos (quedan en la v0.4 de envíos y la v0.1 de términos por si el abogado las reabre, L2). P5 d) queda sin objeto.
- TODO(dato): decisión del cliente sobre costos operativos: P5 a) a c).
- TODO(dato): decisión sobre la reversión del pago (art. 51) para Bre-B: P4 (numeral 10 del documento legal; se recomienda la opción A, un compromiso propio).
- TODO(dato): ¿el agregador cobra comisión de recaudo en contraentrega y quién la paga? P7 (LEG-052, Alta).
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
- Momento de formación del contrato: los términos v0.1 (§6) y la pantalla de confirmación siguen la alternativa (b): el mensaje es la solicitud y la compra queda en firme cuando el cliente acepta el total por el chat. `PRODUCT.md` es compatible si «pedido» se lee como «solicitud» (LEG-030). TODO(dato): confirmación del dueño junto con la aprobación de los términos.
- TODO(dato): frase opcional «Si no lo aceptas, no pagas nada» en el caso por cotizar.

## Marca propia y rotulado (LEG-021 a LEG-030)
- TODO(dato): fabricante o envasador de cada café (razón social y dirección tal como irán en el rótulo, Res. 5109 de 2005) y su registro, permiso o notificación sanitaria. Hoy `registro_sanitario` está vacío en los dos cafés (LEG-024, bloquea el lanzamiento).
- TODO(dato): modelo de comercialización (LEG-022): A, maquila con marca De Santander; B, reempaque con su marca; C, reventa con la marca del tostador. Si es C cambian la bajada, el pie, los metadatos y la Historia.
- TODO(dato): titular de los nombres «Casa Martínez» y «Arreboles» y autorización de uso (LEG-023).
- TODO(dato): soporte escrito de las fincas sobre recolección manual, secado al sol, altitud, variedad y proceso (LEG-025, LEG-017).
- Historia: el código ya dice «Su café va de la finca a tu taza: lo despachamos desde Bucaramanga a todo Colombia» (`secciones-inicio.tsx`). La frase «desde el productor hasta tu casa» se retiró; LEG-021 y LEG-031 quedan cerrados (revisión del 2026-11-05, LEG-049 a LEG-062).
- Café Arreboles: el dueño decidió mantenerlo activo sin registro sanitario conocido (P9, 2026-11-05), contra la recomendación de legal. Riesgo aceptado por el dueño; LEG-024 sigue Bloqueante y abierto (LEG-066). TODO(dato): número sanitario y fabricante de Arreboles (T1, T2), o `activo = no`.
- TODO(dato): confirmar con el tostador que la NSA-003219-2017 de Café Casa Martínez está vigente y quién es su titular (LEG-059).

## Documentos legales (LEG-049 a LEG-062)
- TODO(dato): dígito de verificación del NIT y forma exacta de la razón social («SAS» o «S.A.S.»), según el RUT y el certificado de Cámara de Comercio.
- TODO(dato): área o cargo que atiende consultas y reclamos de datos personales.
- TODO(dato): ¿la tienda usa la aplicación WhatsApp Business o la plataforma (API)? Cambia el análisis de transmisión internacional.
- TODO(dato): quién hace la entrega en zona 1 (domiciliario propio, DiDi Entrega, Uber…), para la política de datos.
- TODO(dato): plazos de conservación de chats, correos y registro de PQR (propuesta de legal: 12 meses desde la entrega) y de facturas (contador).
- TODO(dato): confirmar que los teléfonos y cuentas de la tienda tienen clave y verificación en dos pasos (política §11).
- TODO(dato): activos totales de la sociedad, para saber si debe inscribirse en el Registro Nacional de Bases de Datos (Decreto 090 de 2018).
- TODO(dato): manual interno de políticas y procedimientos de datos (Ley 1581, art. 17 lit. k). Lo entrega el abogado.
- TODO(dato): campos `version_terminos` y `version_politica_datos` en `data/config.csv` (LEG-060). Los crea el desarrollador al publicar.
- TODO(dato): ¿habrá mensajes promocionales por WhatsApp o correo? P12 (recomendado: no por ahora).
