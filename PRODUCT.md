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

De Santander es una tienda en línea de café de origen de Santander, Colombia, operada por De Santander SAS. Comercializa café de otras marcas de Santander: no lo cultiva, no lo tuesta, no lo muele ni lo empaca; la marca y el fabricante o envasador de cada café figuran en la bolsa y en su ficha (modelo C, decidido por el dueño el 2026-11-06). La tienda muestra el origen de cada café (provincia, municipio, altura, variedad, proceso, tueste, perfil de taza y puntaje SCA) y convierte el carrito en una solicitud de compra por WhatsApp.

Éxito: que el visitante elija un café, arme su carrito y envíe el pedido por WhatsApp con toda la información que la tienda necesita para cerrar la venta (cafés, tamaño, molienda, ciudad y forma de pago).

## Positioning

Cada café se presenta por su provincia de Santander, y la provincia explica el perfil de taza. Es una tienda de café santandereano con origen trazable a provincia y municipio, no un catálogo genérico de café colombiano. «De Santander» es el nombre de la tienda, nunca la marca del café.

## Operating Context

- **Compra:** el visitante navega el catálogo, filtra por provincia, abre la ficha de un café, elige tamaño y molienda, y agrega al carrito. Al pulsar "Finalizar compra por WhatsApp" se abre WhatsApp con el pedido ya escrito; **el pedido existe solo cuando el cliente envía ese mensaje**.
- **Cierre de venta:** se hace por chat de WhatsApp con la tienda (+57 300 112 9874). Ahí se confirman el envío (cuando es por cotizar) y la forma de pago.
- **Despacho:** desde Bucaramanga a todo Colombia. El costo del envío se calcula en el sitio por zona y peso (`docs/ENVIOS.md`, tarifas en `data/tarifas_envio.csv`); solo es «por cotizar» en la zona 5 y en pedidos de más de 5 kg, y en ese caso se confirma por WhatsApp antes de que el cliente pague. Salvedad: con la promoción de envío gratis encendida, en siete comunas de Bucaramanga el envío es $0 con cualquier peso (decisión del 2026-11-09).
- **Pagos:** efectivo contraentrega y transferencia Bre-B. No hay pago en línea.

## Capabilities and Constraints

- **Presentaciones:** cada café define sus propios tamaños y precios en los CSV de `data/` (en la v1 vivían en `js/data.js`). Hoy los cinco cafés tienen 250 g a $25.000 y 500 g a $50.000.
- **Molienda:** grano entero o molido, mismo precio.
- **Puntaje:** puntaje de taza en la escala SCA (Specialty Coffee Association); 80 o más es café de especialidad.
- **Provincias de Santander:** Comunera, García Rovira, Guanentá, Metropolitana, Soto Norte (slug `soto`), Vélez y Yariguíes, según la Ordenanza 009 de 2019 de la Asamblea de Santander. La provincia de cada café se deriva de su municipio con la tabla `MUNICIPIO_PROVINCIA` (87 municipios, con código DIVIPOLA en `data/municipios.csv`). Tona, Zapatoca, Rionegro y Simacota aparecen en dos provincias en la ordenanza: se dejaron en Soto Norte, Metropolitana, Metropolitana y Comunera. Cimitarra (Vélez), Onzaga (Guanentá) y Piedecuesta (Metropolitana) no están en la ordenanza y se asignaron por indicación del usuario. Los límites del mapa vienen del Marco Geoestadístico Nacional 2018 del DANE.
- **Terminología:** usar "provincia" (no "región" ni "origen") para las provincias de Santander, y "puntaje SCA" para el puntaje. Los nombres de los cafés ("Café Casa Martínez", "Café Arreboles"…) son los de las marcas de sus fabricantes, tal como figuran en la bolsa (columna `marca` de `data/catalogo.csv`); la tienda no tiene filtro por marca mientras no haya al menos dos marcas con datos (pregunta P17 a legal).
- **Carrito:** se guarda en el navegador; máximo 20 bolsas por café y presentación; sin cuentas de usuario.
- **Técnica:** sitio estático exportado con Next.js (GitHub Pages), sin servidor ni base de datos. Los datos de comercio viven en archivos CSV editados a mano y los textos editoriales en Sanity. Precios en pesos colombianos con formato $25.000. Textos en español. La v1 sin framework se conserva en `legacy/`.
- **Pendiente de decidir:**
  - Si los procesos "Lavado tradicional", "Lavado controlado", "Lavado premium" y "Lavado especial" son procesos distintos o el mismo lavado.
  - Nombres de finca de cada café (campo `finca` vacío).
  - Descripciones de las provincias Metropolitana, Soto Norte, Vélez y Yariguíes.

## Brand Commitments

- Nombre: **De Santander** (tienda; razón social De Santander SAS). Descriptor en uso: "Café de origen".
- Afirmaciones publicables sobre la tienda: vende café de marcas de Santander, tostado y empacado por quien figura en cada bolsa y en cada ficha; despacha desde Bucaramanga a todo Colombia. «Fincas de familias productoras», «recolección manual», «secado al sol» y «tueste por lotes» quedan fuera: son afirmaciones sobre el proceso de terceros sin soporte escrito (2026-11-06).

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
- **2026-11-04: textos de la v1 sin respaldo no se reutilizan.** La historia de la tienda usa solo afirmaciones demostrables (*actualizada el 2026-11-06:* el texto del modelo C de `docs/legal/microcopy-legal.md` §2; sin pasos «Del cafetal a la taza» mientras no haya soporte escrito de cada fabricante). Las historias de cada café vienen de Sanity cuando existan.
- **2026-11-05: el envío se calcula por zonas.** El sitio calcula el envío con la tabla zona × escalón de peso (hasta 1, 2 y 5 kg; peso = bolsas + 80 g de empaque, y el límite de cada escalón también suma esos 80 g: 1.080 / 2.080 / 5.080 g) y lo suma al total del pedido y al mensaje de WhatsApp, sin API de transportadora ni base de datos. Es «por cotizar» solo en la zona 5 (trayecto especial) y en pedidos de más de 5 kg: el total se rotula «sin envío» y el valor se confirma por WhatsApp antes de pagar. Los destinos que no aparecen en `data/zonas_envio.csv` son zona 4. *Salvedad del 2026-11-09:* con el envío gratis por comunas encendido, en las siete comunas de Bucaramanga no hay «por cotizar» con ningún peso (ver la decisión de esa fecha). El cajón del carrito no conoce el destino y dice «se calcula al elegir tu ciudad». El «pedido mínimo sugerido» es informativo. La página `/envios/` muestra las tarifas generadas desde el CSV. *Actualizada el 2026-11-06:* los plazos ya no son solo orientativos (ver la decisión de plazos de esa fecha).
- **2026-11-06: modelo C, la tienda vende café de otras marcas.** De Santander SAS comercializa; no cultiva, tuesta, muele ni empaca. Cada café publica su `marca`, su fabricante o envasador con la expresión del rótulo (`fabricante`, `fabricante_expresion`: «FABRICADO POR» o «ENVASADO POR»), la notificación sanitaria INVIMA con su titular (`nsa`, `titular_nsa`; sustituyen a `registro_sanitario`) y «Comercializa: De Santander SAS», cada fila solo si el dato existe. El JSON-LD declara `brand` solo con la marca real. Se retiran «marca propia», «fincas de familias», «recolección manual», «secado al sol» y el bloque «Del cafetal a la taza» sin pasos (LEG-069 a LEG-071).
- **2026-11-06: Café Arreboles sigue activo sin notificación sanitaria.** Decisión del dueño contra la recomendación de legal (LEG-024/066/089, Bloqueante abierto, riesgo aceptado): `npm run datos` avisa y no falla; la ficha omite la fila sanitaria. Lo cierra la NSA con titular y fabricante o `activo = no`.
- **2026-11-06: paquete legal v1 publicado desde el repositorio.** Términos y condiciones, Política de tratamiento de datos, «Envíos, devoluciones, retracto y garantía» e Información del vendedor se publican en `/legal/…/` con «Versión 1 · vigente desde 2026-11-06», tomados letra por letra de la sección «Texto para el consumidor» de `docs/legal/*.md` cuando Sanity no trae la página (`src/infrastructure/legal`). La versión y la fecha viven en `data/config.csv` (`version_terminos`, `fecha_terminos`, `version_politica_datos`, `fecha_politica_datos`) y alimentan las casillas, la constancia del mensaje y el rótulo de las páginas; `npm run datos` falla si un documento declara otra versión o contiene marcadores internos. Si la fecha real de publicación es posterior, se cambian `config.csv` y los documentos el mismo día.
- **2026-11-06: retracto de 5 días hábiles.** El café admite retracto dentro de los 5 días hábiles siguientes a la entrega, salvo empaque abierto o sello roto; el transporte de la devolución lo paga el cliente y el dinero se devuelve en máximo 15 días calendario. Reemplaza la exclusión general («no admite retracto») de la v0.6. El aviso va en el resumen y en `/envios/` (microcopy §5.3).
- **2026-11-06: plazos de entrega estimado y máximo por zona.** `data/plazos_envio.csv`: zona 1, mismo día o siguiente día hábil (máximo 1 día hábil); zonas 2 y 3, 1 a 3 (máximo 3); zona 4, 2 a 6 (máximo 6); zona 5 y más de 5 kg, 5 a 12 días hábiles en la oficina de la transportadora, máximo al cotizar y nunca más de 30 días calendario. Se cuentan desde la aceptación del total en el chat y, con Bre-B, desde el pago. Se muestran bajo la línea de envío del resumen y en `/envios/` («Plazos de entrega»); un máximo publicado obliga. *Salvedad del 2026-11-09:* el envío gratis por comunas tiene su propio plazo (máximo 1 día hábil con cualquier peso), que no sale de `plazos_envio.csv` ni de la fila de más de 5 kg.
- **2026-11-06: IVA del 5 % incluido (P20 = a, por cuenta del dueño).** `iva_tarifa,5` en `config.csv`; leyenda «Precios con IVA del 5 % incluido (art. 468-1 del Estatuto Tributario)» en ficha, carrito y resumen, «(IVA del 5 % incluido)» en el subtotal del mensaje, y en el pie y `/envios/`. Sin `iva_tarifa`, el sitio dice «con todos los impuestos incluidos». Condición previa pendiente: concepto escrito del contador (TODO(dato) D-18).
- **2026-11-06: mensaje de WhatsApp sin número de solicitud.** Primera línea «¡Hola, De Santander! Envío mi solicitud de compra para que me confirmen el total con el envío.»; subtotal rotulado «Subtotal de productos»; última línea «Acepto los Términos y condiciones versión 1 y autorizo el tratamiento de mis datos según la Política de tratamiento de datos versión 1 del 6 de noviembre de 2026.» (versiones desde `config.csv`). El pedido queda en firme cuando el cliente acepta el total en el chat («ACEPTO»).
- **2026-11-06: casillas cortas y botón deshabilitado.** Casilla de datos «Autorizo a De Santander a tratar mis datos personales para gestionar mi pedido, conforme a la Política de Tratamiento de Datos versión 1 del 6 de noviembre de 2026, que leí.» (P21 = a, sin la frase de Meta) y casilla «Leí y acepto los Términos y condiciones versión 1 del 6 de noviembre de 2026.», ambas sin marcar; «Preparar pedido para WhatsApp» queda deshabilitado hasta marcar las dos. Sin casilla de promociones por ahora.
- **2026-11-06: comisión de contraentrega incluida en la tarifa.** No hay línea de comisión ni «POR CONFIRMAR»; la ayuda del formulario y `/envios/` dicen que la tarifa de la zona ya incluye la comisión de recaudo (LEG-092). El dueño debe verificar que las tarifas del CSV la cubren.
- **2026-11-06: vendedor visible (P19 = a).** Pie y resumen muestran razón social, NIT con dígito de verificación, domicilio, dirección de notificación judicial, correo y WhatsApp, cada dato solo si existe en `config.csv`; representante legal y matrícula mercantil solo en `/legal/vendedor/` y en los documentos (LEG-085).
- **2026-11-09: envío gratis en siete comunas de Bucaramanga (apagado hasta publicar los documentos versión 2).** Comunas: San Francisco, Oriental, Centro, Cabecera del Llano, La Concordia, Ciudadela Real de Minas (la comuna 7, La Ciudadela, completa) y Mutis, en `data/comunas_envio_gratis.csv`. El cliente elige la comuna en el campo opcional «Comuna», que solo aparece con municipio Bucaramanga, se vacía al cambiar de municipio y no se guarda en el navegador, la URL ni la analítica. Con una comuna de la lista, el envío vale $0 **con cualquier peso** (sin tope de 5 kg ni «por cotizar»), sin pedido mínimo y sin fecha final (P25 a P28 del dueño); el resumen y el mensaje muestran también la tarifa de zona 1 (o «se cotiza» con más de 5 kg) y el total que regirían si el dueño, al verificar la dirección por el chat, ve que no está en esa comuna. Sin comuna o con «Otra comuna o no la sé», rige la regla normal. Plazo propio: máximo 1 día hábil desde que se valida el pedido y se da el aprobado por el chat. Textos de `docs/legal/microcopy-legal.md` §8 (v1.3); nada en JSON-LD ni metadatos (LEG-116). Se enciende con `envio_gratis_desde` en `config.csv` (D-21), el mismo día en que legal publica los Términos, «Envíos, devoluciones, retracto y garantía» y la Política versión 2 (LEG-106): `npm run datos` y el build fallan si la promoción está vigente sin el numeral de condiciones y las salvedades publicadas. Hace salvedad a las decisiones del 2026-11-05 (envío por zonas, «por cotizar» con más de 5 kg) y del 2026-11-06 (plazos por zona). Pendientes: D-19, D-21, D-22, D-23 y P33.
