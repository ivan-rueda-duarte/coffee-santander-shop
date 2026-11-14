> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 1.0 — 2026-11-14.

# Política de tratamiento de datos personales

Se publica en `/legal/privacidad/` con el rótulo «Versión 1.0 · vigente desde 2026-11-17». La casilla 2 (datos) del resumen del pedido enlaza aquí. Después del texto público van el **aviso de privacidad** (pie del formulario) y los **textos de las casillas**, que no forman parte de la página.

**Fuente.** Sección 4 (D2) de «De Santander SAS — Textos legales v1.0 para publicación» (`docs/legal/paquete-abogado/`, 14/11/2026), que el dueño presenta como cerrada con su abogado. Sustituye las versiones 1 y 2 de este archivo, que quedan sin efecto. La sección «Texto para el consumidor» reproduce D2 letra por letra, con el formato Markdown (`###`, `- `), **salvo dos añadidos de legal** por la instrucción del dueño de mantener el envío gratis en comunas de Bucaramanga (2026-11-14): §3, viñeta nueva «Comuna (opcional…)» después de «Barrio, código postal e indicaciones»; §7, frase final de la viñeta de la zona 1 («Si elegiste tu comuna, también la recibe.»). La comuna es un dato que el formulario recoge: sin mencionarla, D2 no describiría todos los datos tratados (Ley 1581 de 2012, arts. 4 lit. e y 12). No cambia ninguna finalidad, por lo que no exige otra autorización. Son texto propio, **no del abogado**, y deben validarse con él antes del 17/11 (LEG-167). La comuna no se guarda en el navegador, de modo que §2 no cambia. **Corrección de legal en §7 (2026-11-14, LEG-169; validar con el abogado):** la viñeta del abogado «El proveedor tecnológico de facturación electrónica: emitir tu factura. Colombia.» se reemplazó por la de la DIAN, porque el dueño factura en el servicio gratuito de la DIAN y no tiene proveedor tecnológico; tal como estaba, la viñeta describía un tercero que no existe. Las propuestas sobre DiDi y Uber (LEG-168), la casilla y el aviso de privacidad **no** se aplicaron: van como propuesta en la sección 2 bis de la revisión. Legal no registra aquí la aprobación formal del abogado.

**Valores entre llaves.** El numeral 13 trae `{fecha_politica_datos}` y `{version_politica_datos}`, como los escribió el abogado («los pone el código desde los archivos CSV», sección 0 del paquete). El parser actual (`src/domain/legal/texto-legal.ts`) **no** los reemplaza ni los rechaza: si se construye el sitio sin el cambio del desarrollador, saldrían las llaves literales. Requisito Bloqueante LEG-142: reemplazarlos con `data/config.csv` (la fecha en letras, «17 de noviembre de 2026»; la versión, «1.0») y hacer fallar `npm run datos` si queda una llave en el texto publicado. Si no se implementa antes del 17/11, legal escribe los valores literales en el numeral 13 (ajuste mínimo, avisado al abogado).

**Versión.** `version_politica_datos,1.0` y `fecha_politica_datos,2026-11-17` en `data/config.csv`; la casilla de datos, la línea de constancia del mensaje y la página leen esos valores. Revisión: `revisiones/2026-11-14-paquete-abogado-v1.md` (LEG-140 a LEG-166).

---

## Texto para el consumidor

### 1. Quién trata tus datos
El responsable del tratamiento es De Santander SAS, NIT 902.121.184-8, con domicilio en Bucaramanga, Santander, y dirección en la calle 37 n.° 23-77, apartamento 702, de Bucaramanga. Correo: desantander.tienda@gmail.com. WhatsApp y teléfono: +57 300 112 9874. Las consultas y los reclamos sobre datos personales los atiende el área comercial, en desantander.tienda@gmail.com y en el mismo WhatsApp. Los fabricantes de los cafés que vendemos no reciben tus datos.

### 2. Qué hace y qué no hace este sitio con tus datos
- El sitio web no almacena tus datos personales. No tiene base de datos ni servidor propio. Lo que escribes en el formulario se usa en tu navegador para armar el mensaje del pedido.
- Tus datos nos llegan solo si tú mandas el mensaje por WhatsApp. De Santander los conserva en la aplicación WhatsApp Business y en su correo electrónico.
- En tu navegador (almacenamiento local) se guarda solo el carrito: los cafés, tamaños, presentaciones y cantidades. Tu nombre, celular, documento, dirección y correo no se guardan allí. Puedes borrarlo vaciando el carrito o los datos del sitio en tu navegador.
- El sitio no usa herramientas de analítica ni de publicidad, ni cookies de seguimiento. Si algún día las usa, esta política se actualizará antes.
- El servicio que aloja el sitio (GitHub Pages) registra tu dirección IP por seguridad (numeral 7).

### 3. Qué datos tratamos y para qué
Cuando mandas el mensaje del pedido por WhatsApp recibimos los datos que escribiste y los usamos solo para lo que se indica:
- Nombre completo (obligatorio): saber a quién vendemos y a quién entregamos, y ponerlo en la guía de envío.
- Celular (obligatorio): confirmar el pedido y el pago por WhatsApp y coordinar la entrega. La transportadora o el mensajero lo usan para contactarte al entregar.
- Departamento, municipio y dirección (obligatorios): calcular el envío, generar la guía y entregar el pedido.
- Barrio, código postal e indicaciones (opcionales): ayudar a ubicar tu dirección.
- Comuna (opcional, solo si el envío es a Bucaramanga): saber si tu pedido tiene envío gratis y verificar que tu dirección esté en esa comuna. Solo te preguntamos por las comunas donde el envío es gratis. Si no la eliges, tu pedido sigue igual y se aplica la regla normal de envío de la zona 1.
- Correo (opcional): enviarte información de tu pedido y la factura electrónica.
- Tipo y número de documento (opcionales): emitir la factura electrónica a tu nombre. Si no lo escribes, la factura se emite igual, sin tu nombre, y tu pedido no cambia.
- Comprobante de transferencia o de Bre-B: verificar tu pago. No pedimos ni recibimos datos de tarjetas ni claves.
- Datos de la cuenta o llave Bre-B a la que pidas una devolución: devolverte el dinero por retracto, por garantía, por incumplimiento del plazo o por un problema con tu pago.
- Los mensajes que nos mandas por el chat o por correo: atender el pedido, la entrega, el retracto, la garantía y tus quejas, reclamos y solicitudes.
- Tus quejas, reclamos y solicitudes (radicado, fecha y hora, canal, nombre, contacto, pedido, lo que pides y nuestra respuesta): darte el radicado, responderte en plazo y llevar el registro que exige la ley.

También usamos tus datos para cumplir obligaciones legales contables, tributarias y de protección al consumidor, y para responder a las autoridades que los pidan conforme a la ley.

Novedades y promociones (solo si tú lo autorizas):
- Si marcas la casilla de promociones por WhatsApp, por correo o por los dos, usamos tu celular o tu correo para enviarte novedades y promociones de la tienda.
- Es opcional: las casillas vienen sin marcar y tu pedido es igual las marques o no.
- Te escribimos solo por el canal que autorizaste, de lunes a viernes de 7:00 a. m. a 7:00 p. m. y los sábados de 8:00 a. m. a 3:00 p. m., nunca en domingos ni festivos, y no más de un mensaje al día.
- Puedes cancelar cuando quieras, sin costo, escribiendo «BAJA» por el mismo canal o pidiéndolo de cualquier forma. Te confirmamos la baja y no te volvemos a escribir por ese canal.
- Anotamos tu número o correo, la fecha, el canal y la versión de esta política en una lista privada de contactos autorizados. No usamos esa lista para nada más ni la compartimos.

### 4. Datos que no necesitas darnos
- Los campos marcados como «opcional» no son obligatorios.
- No pedimos datos sensibles, como los de salud, origen étnico, creencias, orientación sexual o datos biométricos. Te pedimos no escribirlos en las indicaciones ni en el chat.
- Si eres menor de edad, pide a un adulto responsable que haga el pedido.

### 5. Cómo nos das la autorización
- En el resumen del pedido marcas la casilla de autorización de datos. Viene sin marcar y es distinta de la de los términos y condiciones.
- El mensaje que envías por WhatsApp incluye una línea que dice que autorizaste el tratamiento según esta política, con su versión.
- Antes de procesar tu pedido te pedimos en el chat que confirmes respondiendo ACEPTO. Conservamos esa conversación como constancia de tu autorización.
- La autorización para promociones se da en casillas aparte, una por canal, también sin marcar. Si marcas alguna, el mensaje lo dice; si no, no te enviamos promociones.

### 6. Cuánto tiempo guardamos tus datos
- Conservamos los datos de tus pedidos, facturas, pagos, devoluciones, quejas, reclamos y solicitudes, junto con la constancia de tu autorización, durante diez (10) años contados desde la fecha del pedido o de la última actuación. Ese es el término en que la ley nos obliga a conservar los papeles y soportes del negocio (artículo 28 de la Ley 962 de 2005).
- La lista de contactos autorizados para promociones se conserva hasta que canceles o, si no cancelas, hasta veinticuatro (24) meses después de tu última compra. Al cancelar te borramos de la lista de inmediato y solo conservamos la constancia de la baja.
- Vencidos esos plazos, suprimimos los datos.

### 7. Con quién compartimos tus datos y en qué países
Para atender tu pedido usamos servicios de otras empresas:
- WhatsApp LLC (Meta Platforms), aplicación WhatsApp Business: recibir tu pedido y comunicarnos contigo. Trata los datos en Estados Unidos y también como responsable, conforme a las condiciones que aceptaste al usar WhatsApp.
- Google LLC: correo electrónico y documentos de la tienda. Estados Unidos.
- GitHub, Inc. (GitHub Pages): alojamiento del sitio; registra datos técnicos de tu visita, como la dirección IP. Estados Unidos. No recibe los datos del formulario.
- La transportadora con la que despachemos tu pedido: generar la guía y entregarte el pedido (nombre, celular, dirección, municipio, barrio, código postal e indicaciones). Opera en Colombia. Te informamos cuál es junto con el número de guía.
- En Bucaramanga, Floridablanca, Piedecuesta y Girón, la plataforma de domicilios o el mensajero que haga la entrega, con los mismos datos. Te informamos cuál es antes del despacho. Si elegiste tu comuna, también la recibe.
- La Dirección de Impuestos y Aduanas Nacionales (DIAN): emitimos tu factura electrónica en su servicio gratuito de facturación, y la DIAN la recibe y la valida, como lo exige la ley. Colombia.
- Las autoridades, cuando la ley lo exija.

No vendemos ni alquilamos tus datos.

Datos fuera de Colombia. Estados Unidos figura en la lista de países con nivel adecuado de protección de la Superintendencia de Industria y Comercio (Circular Externa 005 de 2017). Si algún servicio de entrega trata tus datos en un país que no esté en esa lista, la casilla de autorización incluye tu consentimiento expreso para hacerlo, solo para atender tu pedido (artículo 26 de la Ley 1581 de 2012). Con las empresas que tratan datos por cuenta nuestra acordamos las condiciones de transmisión que exige el artículo 2.2.2.25.5.2 del Decreto 1074 de 2015.

### 8. Tus derechos
Como titular de tus datos puedes:
- conocer, actualizar y corregir tus datos;
- pedir prueba de la autorización que nos diste;
- saber, si lo pides, para qué hemos usado tus datos;
- retirar la autorización o pedir que borremos tus datos, salvo cuando la ley o un contrato vigente nos obliguen a conservarlos (por ejemplo, la factura);
- dejar de recibir promociones en cualquier momento, escribiendo «BAJA», sin que eso afecte tus pedidos;
- consultar gratis tus datos;
- presentar una queja ante la Superintendencia de Industria y Comercio, después de hacer tu consulta o reclamo ante nosotros.

### 9. Cómo hacer una consulta
- Escríbenos por WhatsApp al +57 300 112 9874 o al correo desantander.tienda@gmail.com. Dinos tu nombre, cómo te contactamos y qué quieres saber.
- Te respondemos en máximo diez (10) días hábiles desde que recibimos la consulta. Si no podemos en ese plazo, te decimos por qué y cuándo responderemos, que no será más de cinco (5) días hábiles después.

### 10. Cómo hacer un reclamo
Si quieres corregir, actualizar o borrar tus datos, retirar la autorización o crees que no cumplimos la ley:
- Escríbenos por WhatsApp o al correo. Incluye tu nombre y documento de identidad, qué pides y por qué, cómo te contactamos y los documentos que quieras aportar.
- Por el mismo canal te damos un número de radicado, con la fecha y la hora.
- Si falta información, te la pedimos dentro de los cinco (5) días siguientes. Si pasan dos (2) meses sin que la envíes, entendemos que desististe.
- Cuando el reclamo esté completo, lo marcamos como «reclamo en trámite» en máximo dos (2) días hábiles.
- Te respondemos en máximo quince (15) días hábiles desde el día siguiente a recibirlo. Si no podemos en ese plazo, te decimos por qué y cuándo responderemos, que no será más de ocho (8) días hábiles después.

### 11. Cómo cuidamos tus datos
- El sitio no guarda tus datos y no tiene analítica.
- Solo las personas que atienden pedidos en De Santander ven el chat y los correos.
- Los teléfonos y las cuentas de la tienda tienen clave y verificación en dos pasos.
- A la transportadora y al mensajero solo les damos los datos que necesitan para entregar.
- El enlace de WhatsApp lleva el texto del pedido y por eso queda en el historial de tu navegador. Si usas un equipo compartido, borra el historial después de enviar el pedido.

### 12. Cambios en esta política
Cuando cambiemos esta política publicaremos la nueva versión con su fecha. Si el cambio afecta las finalidades o los terceros con quienes compartimos tus datos, te lo avisaremos y, cuando la ley lo exija, te pediremos una nueva autorización.

### 13. Vigencia
Esta política rige desde el {fecha_politica_datos} (versión {version_politica_datos}). Las bases de datos estarán vigentes mientras se mantenga la finalidad del tratamiento y por los plazos del numeral 6.

Normas aplicables: Ley 1581 de 2012; Decreto 1074 de 2015 (Decreto 1377 de 2013 compilado); Ley 2300 de 2023; Ley 962 de 2005, art. 28.

---

## Aviso de privacidad

Va en el pie del formulario de datos de envío (D2 del paquete, «Aviso de privacidad (pie del formulario)»). Texto exacto; «/legal/privacidad/» se muestra como enlace a esa página:

> De Santander SAS (NIT 902.121.184-8, desantander.tienda@gmail.com, WhatsApp +57 300 112 9874) trata los datos de tu pedido para confirmarlo, cobrarlo, entregarlo, facturarlo y atender tu retracto, tus garantías y tus reclamos; y, solo si marcas las casillas aparte, para enviarte promociones por el canal que elijas. Los datos viajan en el mensaje que mandas por WhatsApp (Meta) y se comparten con la transportadora o el mensajero. Algunos servicios los tratan fuera de Colombia. Puedes conocer, corregir o borrar tus datos y retirar tu autorización. Lee la política en /legal/privacidad/.

## Textos de las casillas

Todas vienen sin marcar. Cada una enlaza a su documento y lee versión y fecha de `data/config.csv` (la fecha en letras: «17 de noviembre de 2026»). El símbolo «☐» representa la casilla; no se escribe.

**Casilla 1, términos (obligatoria; texto de D5 §6.3).**

> ☐ Leí y acepto los Términos y condiciones versión {version_terminos} del {fecha_terminos}.

**Casilla 2, datos (obligatoria).**

> ☐ Autorizo a De Santander SAS a tratar mis datos personales para gestionar mi pedido: confirmarlo, cobrarlo, coordinar la entrega con la transportadora o el mensajero y emitir la factura. Entiendo que el pedido se envía por WhatsApp (Meta) y que algunos servicios pueden tratar mis datos fuera de Colombia. Leí la Política de tratamiento de datos versión {version_politica_datos} del {fecha_politica_datos}.

**Casilla 3, promociones por WhatsApp (opcional; nunca bloquea el botón).**

> ☐ Quiero recibir novedades y promociones de De Santander SAS por WhatsApp, de lunes a viernes de 7:00 a. m. a 7:00 p. m. y sábados de 8:00 a. m. a 3:00 p. m. Puedo cancelarlo cuando quiera escribiendo «BAJA» al mismo chat. Es opcional y no afecta mi pedido.

**Casilla 4, promociones por correo (opcional; solo aparece si el cliente escribió su correo; nunca bloquea el botón).**

> ☐ Quiero recibir novedades y promociones de De Santander SAS por correo electrónico. Puedo cancelarlo cuando quiera con el enlace de cada correo o escribiendo a desantander.tienda@gmail.com. Es opcional y no afecta mi pedido.

**Errores (D5 §6.3).** Casilla 1: `Debes aceptar los términos para continuar.` Casilla 2: `Debes autorizar el tratamiento de tus datos para continuar.` Las casillas 3 y 4 no tienen error.

**Líneas del mensaje de WhatsApp (D5 §6.4).** Constancia, siempre: `Acepto los Términos v{version_terminos} y autorizo el tratamiento de mis datos según la Política v{version_politica_datos} del {fecha_politica_datos}.` Promociones, solo si marcó alguna casilla: `Autorizo recibir promociones por {WhatsApp|correo|WhatsApp y correo}.` La línea de aceptación complementa la constancia ACEPTO del chat, pero no la reemplaza.

---

## Notas para el abogado

Estas notas no se publican. Análisis completo en `revisiones/2026-11-14-paquete-abogado-v1.md`.

- **Hechos que D2 afirma y que el dueño debe confirmar antes del 17/11 (numeral 8.3 del paquete).** §11, verificación en dos pasos (confirmación 1; D-7); §7, condiciones de transmisión acordadas con transportadoras, plataforma de domicilios y facturación (confirmación 2: **confirmada por el dueño el 2026-11-14**; conservar la evidencia); §1, dirección y correo frente al certificado (confirmación 3; D-1); §6, plazo de 24 meses de la lista de promociones (confirmación 4). Mientras no consten, D2 publica afirmaciones no acreditadas (Ley 1581 de 2012, art. 4 lit. a y art. 12) (LEG-156).
- **§2, almacenamiento local.** Hoy el código guarda en el navegador la forma de pago y el municipio (`src/domain/pedido/persistencia.ts`). D2 dice que solo se guarda el carrito: hay que cambiar el código antes de publicar (LEG-149).
- **§7, encargados (actualizado el 2026-11-14 con datos del dueño; LEG-168 a LEG-170).** Zona 1: DiDi o Uber según el caso; D2 los describe en forma genérica y la transferencia fuera de la lista de la SIC se apoya en la casilla de datos (art. 26 lit. a). Se recomienda nombrarlos (propuesta C4 a C6). Facturación: servicio gratuito de la DIAN (corrección C3 aplicada). Condiciones de transmisión aceptadas con transportadoras, plataformas y facturación: confirmado por el dueño (8.3, confirmación 2). Sigue abierto si se usa un agregador de guías: si sí, es un encargado que D2 no informa (LEG-157). Sanity no figura: es correcto mientras el proyecto de Sanity no exista o no sirva contenido al visitante (LEG-158).
- **§3, promociones.** Los horarios coinciden con el art. 3 de la Ley 2300 de 2023, que el art. 5 extiende a los contactos comerciales y publicitarios (fuentes secundarias; VERIFICAR la letra oficial). «No más de un mensaje al día» es un compromiso propio; VERIFICAR si la ley fija además un límite semanal aplicable a la publicidad (LEG-160).
- **Casilla 4.** Promete «el enlace de cada correo». Si los correos salen de Gmail sin enlace de baja, la promesa sería falsa: el dueño debe incluir ese enlace en cada correo (LEG-160).
