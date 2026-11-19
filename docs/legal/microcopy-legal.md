> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 1.12 — 2026-11-19.

# Microcopy legal

**Aviso de la v1.12 (2026-11-19, LEG-188 a LEG-191).** El pedido se vacía en el navegador tras un clic válido en «Enviar por WhatsApp», después de abrir `wa.me`. §9.5, regla 4, reescrita; §9.1 y §9.4 ajustadas; §9.6 nueva (vista «Mensaje listo»). D1 a D4, la plantilla D5 §6.4 y la constancia **no cambian**. No requiere validación del abogado; se le informa antes de publicar.

**Aviso de la v1.11 (2026-11-18, LEG-178 a LEG-182).** §5.9: nueva variante de una frase. Orden de las casillas en el resumen: se admite promociones (3 y 4) encima de las obligatorias (1 y 2), con leyenda visible `Promociones (opcional)`, sujeto a validación del abogado (LEG-178).

**Aviso de la v1.10 (2026-11-18, LEG-171 a LEG-176).** Flujo del pedido en tres pasos (Pedido · Envío · Resumen): «Enviar por WhatsApp» del resumen valida y abre `wa.me` en el mismo clic, y se retira el panel de Confirmación de D5 §6.3. El dueño comunicó el 2026-11-18 que el abogado responsable aprobó los textos de LEG-171 y el retiro del panel (constancia escrita pendiente). Los textos del flujo están en la **§9**, que manda sobre §2 (filas «Confirmación…», retiradas), §5.5 (regla de apertura del enlace) y §5.9 (reescrita). D1, D2, D3, D4, la plantilla D5 §6.4 y la constancia del mensaje **no cambian**.

**Aviso de la v1.9 (2026-11-14, LEG-140 a LEG-167).** Desde la publicación del 17/11/2026 mandan los textos de la sección 6 (D5) de «De Santander SAS — Textos legales v1.0 para publicación» (`docs/legal/paquete-abogado/`) y las casillas y el aviso de privacidad de D2 (copiados en `politica-tratamiento-datos.md`, secciones «Aviso de privacidad» y «Textos de las casillas»). Donde este documento diga otra cosa, **queda sin efecto**; en particular: §1 (leyendas de IVA y envío), §2 (portada, pie, metadatos, `/cafes/` e Historia: rige D5 §6.1), §3 (ficha: D5 §6.2), §4.3 y §5.1 (casillas: ahora cuatro), §5.2 y §5.5 (mensaje: D5 §6.4), §5.3 (retracto del resumen: D5 §6.3), §5.4 (vendedor: D4), §5.6 y §5.8 (plazos: D3 §6 y D5 §6.3), §5.7 (respuestas del chat: D5 §6.5), §6 (configuración: paquete §7.1 y §7.2, con los ajustes de LEG-151 y LEG-152) y §8 (envío gratis: el dueño lo mantiene; condiciones en el numeral 13 de D3 versión 1.0, vigente desde el 17 de noviembre de 2026, y textos del sitio ajustados en la sección 2 bis de LEG-167, que mandan sobre §8 donde difieran). Siguen vigentes, mientras no contradigan el paquete: §4 (documento y código postal), §5.9 (microayuda del botón) y las reglas de §7 que coinciden con D5 §6.6. Este archivo se reescribirá cuando el abogado valide LEG-167 y el dueño decida LEG-150.

Textos exactos del sitio que tienen fundamento legal. El desarrollador los copia sin cambios; `{}` son variables que pone el código y salen de `data/config.csv` o de los CSV de datos. Cada texto distingue **exige la norma** y **se recomienda**.

Secciones: **§1** precio, IVA y envío; **§2** inicio, Historia y confirmación (modelo C); **§3** ficha del café (marca, fabricante, notificación sanitaria, molienda, precio); **§4** documento, código postal y casilla de datos; **§5** casilla de términos, mensaje de WhatsApp, retracto, vendedor, plazos, PQR y `/envios/`; **§6** configuración y CSV; **§7** textos que se retiran; **§8** envío gratis en comunas de Bucaramanga; **§9** flujo del pedido en tres pasos (v1.10; vista «Mensaje listo» en §9.6, v1.12).

Cambios de la v1.8 (2026-11-12, QA-013; LEG-139): §2, párrafos 1 y 2 de la Historia reescritos sobre el texto pedido por el dueño, con dos variantes según que todos los cafés activos traigan marca y fabricante (LEG-070) y regla de la lista de datos; §7 retira el texto del dueño. El texto público de los documentos versión 2 no cambia.

Cambios de la v1.7 (2026-11-12, documentos versión 2 y eliminación del pago contraentrega; LEG-133 a LEG-138): §1.7 retirada (no hay contraentrega ni comisión de recaudo); §2 «Cómo pedir» paso 3 con el ejemplo «Pagas con transferencia Bre-B.»; §5.4 con el estado del vendedor sin dirección de notificación en pie y resumen (decisión del dueño) y la fila de `/legal/vendedor/` sin marcador (LEG-134); §5.6 y §5.8, plazos contados desde la recepción del pago por Bre-B (LEG-136); §5.7 respuesta «ACEPTO» con la versión de `config.csv`; §6 con versión 2 y fecha 2026-11-12; §8.1 sin el caso contraentrega; §8 estado: documentos versión 2 listos.

Cambios de la v1.6 (2026-11-11, QA-011 y QA-012; LEG-131 y LEG-132): §8.6.1, en `/envios/` con la promoción terminada se retira `Estas fueron sus condiciones:` y se agrega una nota de vigencia terminada antes del numeral 13, que se sigue mostrando sin cambios en un bloque citado; si el numeral no está publicado mientras el aviso es visible, `npm run datos` falla.

Cambios de la v1.5 (2026-11-09, respuestas del dueño P33, P33 bis, P34 b y P35; LEG-118, LEG-125, LEG-127 y LEG-129): §8.1 con el tope de la validación Bre-B y el horario de atención (D-24, cerrado; LEG-130); §8.6.1 reescrita para la terminación inmediata: clave `envio_gratis_terminada`, estado «terminada», aviso sin fecha previa. Se retiran el aviso previo y `envio_gratis_hasta`.

Cambios de la v1.4 (2026-11-09, verificación de lo implementado; LEG-120 a LEG-128): §8.2, el campo «Comuna» va después de «Municipio» (decisión de diseño, aceptada); §8.3, frase de la región `role="status"`; §8.5, variantes con la promoción del párrafo inicial de `/envios/`, de la caja «¿Tu destino es de zona 5 o pides más de 5 kg?» y del `dd` de la zona 1 (con el cómputo del plazo); §8.5 bis, `nota_envio` del pie y paso 3 de «Cómo pedir» sin cambio; §8.6, aviso previo con fecha final, aviso de terminación y estado «terminada».

Cambios de la v1.3 (2026-11-09, decisiones del dueño; LEG-118 y LEG-119): §8 con envío gratis para cualquier peso (P27 b), casos de más de 5 kg en el resumen, el mensaje y `/envios/`, y plazo de 1 día hábil contado desde la validación de la transacción y el aprobado del pedido.

Cambios de la v1.2 (2026-11-09, LEG-106 a LEG-117): nueva §8 (envío gratis en siete comunas de Bucaramanga: regla, campo «Comuna», resumen, mensaje de WhatsApp, `/envios/`, anuncios permitidos y prohibidos). No se implementa sin publicar el mismo día los Términos versión 2 y «Envíos, devoluciones, retracto y garantía» versión 2 (LEG-106). Las §1 a §7 no cambian.

Cambios de la v1.0 (Paquete legal v1 y decisiones del dueño del 2026-11-06; revisión LEG-081 a LEG-100): leyenda de IVA del 5 % (§1.4); «Notificación sanitaria INVIMA» con titular y fabricante (§3); ayuda de molienda de fábrica (§3); casillas con versión y fecha (§4.3, §5.1); plantilla completa del mensaje sin número de solicitud (§5.5); línea de retracto de 5 días hábiles (§5.3); vendedor completo en pie y resumen (§5.4); plazos estimado y máximo por zona (§5.6, §5.8); comisión incluida en la tarifa (§1.7). Se retiran la casilla de promociones (v0.6 §4.7), la comisión de recaudo con dos estados (v0.6 §6) y la línea «no admite retracto».

Cambios de la v1.1 (2026-11-06, LEG-101 a LEG-105; QA-006, QA-008 y revisión de marca): nueva §5.9 (botón «Preparar pedido para WhatsApp» mientras falta una casilla: microayuda por caso, `aria-disabled` y errores al pulsar); §4.3 y §5.1 remiten a §5.9 y ya no exigen `disabled`; §2 «Cómo pedir», paso 3, con la regla de las formas de pago («Bre-B» y «o»); §2 nueva fila de la foto de respaldo de la Historia (texto alternativo neutro y sin crédito mientras no conste el origen); §2 nota sobre la itálica de remate en los títulos de las páginas legales. El texto público de los cuatro documentos (versión 1) no cambia.

## 1. Precio, IVA y envío

### 1.1 Envío con tarifa (zonas 1 a 4, hasta 5 kg)

| Dónde | Texto exacto |
|---|---|
| Carrito y resumen, rótulo de la línea | `Envío a {destino}` con la nota `· zona {n}` en gris |
| Carrito y resumen, valor | `{$ valor}` (formato COP, p. ej. `$18.000`) |
| Total | `Total` |
| WhatsApp, línea de envío | `Envío ({destino} · zona {n}): {$ valor}` |
| WhatsApp, total | `Total: {$ total}` |

Exige la norma informar antes de contratar el precio total con impuestos y el costo de envío por separado, y presentar un resumen que el consumidor apruebe (Ley 1480, arts. 26 y 50).

### 1.2 Envío por cotizar (zona 5 o más de 5 kg)

| Dónde | Texto exacto |
|---|---|
| Carrito y resumen, línea de envío | `Envío` / `Por cotizar · te confirmamos el valor por WhatsApp antes de que pagues` |
| Carrito y resumen, rótulo del total | `Total sin envío` |
| Resumen, bajo el total | `Este valor no incluye el envío. Te lo informamos por WhatsApp y tú decides si lo aceptas antes de pagar.` |
| WhatsApp, línea de envío (zona 5) | `Envío: POR COTIZAR (zona especial)` |
| WhatsApp, línea de envío (más de 5 kg) | `Envío: POR COTIZAR (más de 5 kg)` |
| WhatsApp, total | `Total sin envío: {$ total}` |
| WhatsApp, línea final | `Quedo atento al valor del envío para confirmar mi pedido.` |

Cumple el art. 50 porque el contrato no se perfecciona hasta que el cliente acepta el total con envío (términos §6).

### 1.3 Leyenda del precio total (resumen)

| Dónde | Texto exacto |
|---|---|
| Resumen, nota bajo los totales (primera línea de la nota actual) | `Los precios incluyen todos los impuestos y el envío se muestra por separado (art. 50 de la Ley 1480 de 2011). La forma de pago se confirma por WhatsApp antes de que pagues. Más en envíos: zonas, tarifas y plazos y en envíos, devoluciones, retracto y garantía.` (los dos nombres de página son enlaces a `/envios/` y `/legal/envios-devoluciones/`) |

Se cita el art. 50 sin literal (paquete D5 §1.5). Se recomienda.

### 1.4 IVA (decisión del dueño, Paquete legal v1)

| Dónde | Texto exacto |
|---|---|
| Ficha, bajo el precio; carrito y resumen, bajo el subtotal (`caption`) | `Precios con IVA del 5 % incluido (art. 468-1 del Estatuto Tributario).` |
| WhatsApp, línea de subtotal | `Subtotal de productos: {$ subtotal} (IVA del 5 % incluido)` |
| `/envios/`, bajo la tabla de tarifas | `Tarifas en pesos colombianos, con IVA del 5 % incluido. Más de 5 kg, en cualquier zona, se cotiza aparte. Nunca cobramos primero y ajustamos después.` |
| Pie, última línea | `© {anio} De Santander SAS. Precios en pesos colombianos, con IVA del 5 % incluido.` |

Exige la norma que el precio publicado incluya todos los impuestos (Ley 1480, arts. 26 y 50). La tarifa del 5 % es una afirmación tributaria del dueño (E.T., arts. 468-1 y 447) que **requiere la confirmación escrita del contador antes de publicar** (LEG-082). Si el contador concluye otra cosa, se cambia la leyenda antes de lanzar; mientras no haya concepto, la alternativa prudente es publicar solo `Precios en pesos colombianos con todos los impuestos incluidos.`

### 1.5 Nota de envío del pie (`nota_envio` en `data/config.csv`)

`Enviamos a todo Colombia desde Bucaramanga. Ves el valor del envío en tu carrito; en algunos destinos y en pedidos de más de 5 kg te lo confirmamos por WhatsApp antes de que pagues.` (sin cambio)

### 1.6 Primera línea del mensaje de WhatsApp

`¡Hola, De Santander! Envío mi solicitud de compra para que me confirmen el total con el envío.`

Decisión del dueño (2026-11-06): sin número de solicitud («N.° DS-…» del paquete), porque el sitio no asigna números (`PRODUCT.md`). «Solicitud de compra» coincide con los términos §6 (el mensaje es la solicitud; el contrato nace al aceptar el total). `{nombre_tienda}` sale de `data/config.csv`. Reemplaza «Quiero finalizar mi pedido» (código actual) y «Quiero hacer este pedido:» (v0.6).

### 1.7 Comisión de recaudo del pago contraentrega (retirada en la v1.7)

**Retirada el 2026-11-12.** El dueño eliminó el pago contraentrega: `formas_pago` solo tiene `Transferencia Bre-B`. No se muestra ninguna ayuda ni frase de comisión de recaudo (ni en el formulario ni en `/envios/`), ni línea de comisión, ni «Total sin comisión de recaudo», ni «POR CONFIRMAR». Si el dueño vuelve a ofrecer contraentrega, legal redacta una versión nueva de los documentos antes (LEG-135).

## 2. Inicio, Historia y confirmación (modelo C; Historia reescrita en la v1.8)

| Dónde | Texto exacto |
|---|---|
| Portada, bajada (`secciones-inicio.tsx`) | `Café de origen de provincias de Santander. Elige tu provincia y pide por WhatsApp.` |
| Portada, antetítulo | `Café de origen · Santander` (no juntar «Café» y «de Santander») |
| Pie (`pie.tsx`) | `Café de origen de provincias de Santander, Colombia.` |
| Metadatos y Open Graph (`layout.tsx`, `DESCRIPCION`) | `De Santander: tienda de café de origen de provincias de Santander, Colombia. Elige por provincia, arma tu pedido y envíalo por WhatsApp.` |
| `/cafes/`, `description` | `Todos los cafés de la tienda De Santander, con filtros por provincia, municipio, proceso, variedad, tueste, perfil de taza y altitud.` |
| Historia, párrafo 1, **variante A** (todos los cafés activos traen `marca` y `fabricante`) | `De Santander es una tienda de café de origen santandereano. Reunimos cafés de marcas de nuestra tierra, tostados y empacados por quien figura en cada bolsa y en cada ficha.` |
| Historia, párrafo 1, **variante B** (algún café activo sin `marca` o sin `fabricante`; **es la que rige hoy**) | `De Santander es una tienda de café de origen santandereano. Reunimos cafés de marcas de nuestra tierra, cada uno tal como lo empaca su fabricante.` |
| Historia, párrafo 2, **variante A** | `Desde {ciudad_despacho} los enviamos a todo Colombia. En cada café te contamos quién lo hace y de dónde viene: la marca, quién lo fabrica, la provincia, el municipio, la altitud, la variedad y el proceso.` |
| Historia, párrafo 2, **variante B** | `Desde {ciudad_despacho} los enviamos a todo Colombia. En cada café te contamos de dónde viene: la provincia, el municipio, la altitud, la variedad y el proceso.` |
| Historia, regla de la lista del párrafo 2 (v1.8, LEG-139) | Cada dato de la lista (provincia, municipio, altitud, variedad, proceso) se nombra **solo si todos los cafés activos lo traen**, en ese orden, unidos con comas y «y» antes del último. Si ninguno cumple, el párrafo 2 termina en `… a todo Colombia.` La variante A exige `marca` **y** `fabricante` en todos los cafés activos (LEG-070); basta un café sin uno de ellos para usar la variante B en los **dos** párrafos. Con Sanity, el texto editorial que lo reemplace se revisa con los mismos criterios antes de publicar. |
| Historia, proceso | *(sin pasos; el bloque «Del cafetal a la taza» no se muestra)* |
| «Cómo pedir», paso 1 | `Cada café viene en bolsa de {tamaños}, en grano entero o molido, tal como lo empaca su fabricante. El precio de cada bolsa está en su tarjeta y en su ficha.` |
| «Cómo pedir», paso 2 | `Completas tus datos de envío y se abre WhatsApp con tu solicitud de compra ya escrita. Con ese mensaje nos pides el pedido; queda en firme cuando aceptas el total en el chat.` |
| «Cómo pedir», paso 3 | `Despachamos desde {ciudad_despacho} a todo Colombia. Ves el envío en tu carrito; si hay que cotizarlo, te lo confirmamos antes de que pagues. Pagas con {formas de pago}.` Con la configuración actual (v1.7), exacto: `… Pagas con transferencia Bre-B.` Regla de `{formas de pago}` (v1.1, LEG-103): cada forma tal como está en `formas_pago` de `data/config.csv`, con **solo la primera letra** en minúscula (nunca `toLowerCase` del texto completo: «Bre-B» es nombre propio); se unen con «o», no con «y» («a o b»; con tres o más, «a, b o c»), porque el cliente paga con una de ellas |
| Historia, foto de respaldo (`secciones-inicio.tsx`, cuando Sanity no trae foto) | Texto alternativo: `Montañas verdes con cultivos en ladera, un camino de tierra y nubes bajas.` Crédito: **ninguno** (`credito: ""`, sin `figcaption`). Mientras el dueño no confirme autor, lugar y permiso de uso (LEG-104, P24), no se dice «Santander», «cafetal», «finca», «niebla de la mañana» ni «De Santander» como crédito. Cuando lo confirme: `Foto: {autor} · {municipio}, Santander · {año}` (solo con los tres datos) |
| Confirmación (título y textos con tarifa y por cotizar) | **Retirados en la v1.10** con el panel de Confirmación (D5 §6.3; LEG-171, aprobación del abogado comunicada por el dueño el 2026-11-18). Su contenido pasa al resumen: §9.3. |

Exige la norma información veraz sobre el origen empresarial (Ley 1480, arts. 23, 24, 29 y 30). Modelo C decidido el 2026-11-06 (LEG-069 a LEG-072); el paquete v1 no lo cambia.

**Foto de respaldo (LEG-104).** Exige la norma que la imagen no induzca a error sobre el origen del producto (Ley 1480, arts. 23 y 30) y respetar la paternidad y la licencia de la obra fotográfica (Ley 23 de 1982 y Decisión 351 de 1993 de la CAN: VERIFICAR artículos). En el repositorio no consta autor, lugar, fecha ni licencia de `cafetal-montana.jpg`: solo la nota interna «Fotografías propias de la marca» de `page_style/assets/Fotografia/README.md`, sin soporte. Un crédito «De Santander» atribuye una autoría no demostrada; el texto alternativo actual afirma un lugar («de Santander») y un cultivo («cafetal») que no se pueden comprobar en la imagen. Se recomienda, además, quitar la foto si el dueño no puede confirmar el permiso de uso (términos §14 dice que las fotos son de la sociedad o de quien la autorizó).

**Títulos de las páginas legales con itálica de marca (LEG-105).** Se permite, solo como tipografía: el texto del título debe ser letra por letra el nombre del documento que usan las casillas, el pie y los enlaces (p. ej. «Términos *y condiciones*»), sin añadir ni quitar palabras.

## 3. Ficha del café

| Dónde | Texto exacto | Cuándo se muestra |
|---|---|---|
| Ficha técnica, primera fila | `Marca: {marca}` | Solo con el dato `marca` |
| Ficha técnica | `{FABRICADO POR o ENVASADO POR}: {fabricante}` (la expresión del rótulo) | Solo con `fabricante` y `fabricante_expresion` |
| Ficha técnica (reemplaza «Registro sanitario») | `Notificación sanitaria INVIMA N.° {nsa} · Titular: {titular_nsa} · Fabricante: {fabricante}` | Solo con `nsa`. Si `titular_nsa` o `fabricante` están vacíos, la parte correspondiente se omite (p. ej. `Notificación sanitaria INVIMA N.° NSA-003219-2017`). Nunca «pendiente» ni marcadores |
| Ficha técnica, última fila (recomendado, P18) | `Comercializa: {razon_social}` | Siempre que exista la razón social |
| Ficha técnica, fila «Productor o finca» | `{productor}` | Solo con una finca o productor real; nunca el tostador ni la marca |
| Selector de molienda, ayuda | `Grano entero o molido, tal como lo empaca el fabricante. No molemos el café.` | Siempre |
| Precio, leyenda | `Precios con IVA del 5 % incluido (art. 468-1 del Estatuto Tributario).` | Siempre (ver §1.4) |
| Entrega (recomendado) | `Entrega en 1 a 6 días hábiles según tu zona; el plazo exacto lo ves al elegir tu ciudad. Más en envíos (/envios/).` | La ficha no conoce el destino: no se muestra el plazo de una zona (LEG-097) |
| Tarjeta del catálogo (recomendado), primer dato técnico | `Marca` / `{marca}` | Solo con el dato |
| JSON-LD (`Product`) | `brand: { "@type": "Brand", "name": "{marca}" }`; opcional `manufacturer` | `brand` solo con `marca`; se retira `name: "De Santander"` |

Fundamento. **Exige la norma** que la ficha no contradiga el rótulo y que identifique al fabricante o envasador y la notificación, permiso o registro sanitario (Res. 5109 de 2005, art. 5 nums. 5.4.1 y 5.8; Ley 1480, arts. 23 y 24). El rótulo pasa de «Registro sanitario» a «Notificación sanitaria INVIMA» porque la NSA-003219-2017 es una notificación (categoría de riesgo bajo; subcategoría 3.4.2 del anexo de la Res. 719 de 2015: VERIFICAR). **Decisión del dueño:** Café Arreboles sigue activo sin NSA (P9, riesgo aceptado; LEG-024/066 Bloqueante abierto): la regla del paquete «sin NSA no se publica» **no se implementa como bloqueo**; `npm run datos` solo avisa. **Molienda:** el café viene molido de fábrica; el selector elige entre dos bolsas distintas del fabricante, no es molienda a pedido (LEG-083).

## 4. Documento, código postal y casilla de datos

### 4.1 Selector de tipo de documento

| Dónde | Texto exacto |
|---|---|
| Etiqueta | `Tipo de documento (opcional)` |
| Primera opción | `Elige el tipo` |
| Opciones | `Cédula de ciudadanía` · `Cédula de extranjería` · `Permiso por Protección Temporal (PPT)` · `Pasaporte` |
| Error | `Elige el tipo de documento.` |

### 4.2 Número de documento

| Dónde | Texto exacto |
|---|---|
| Etiqueta | `Número de documento (opcional)` |
| Ayuda | `Escríbelo solo si quieres la factura electrónica a tu nombre. Si lo dejas vacío, tu pedido sigue igual.` |
| Error, CC con letras o más de 10 dígitos | `La cédula de ciudadanía lleva solo números, hasta 10 dígitos.` |
| Error, CC con menos de 3 dígitos | `Revisa el número: parece incompleto.` |
| Error, CE, PPT o pasaporte con símbolos | `Usa solo letras y números, sin espacios ni símbolos.` |
| Error, CE, PPT o pasaporte fuera de 3 a 20 caracteres | `Revisa el número: debe tener entre 3 y 20 caracteres.` |

La ayuda solo es cierta si el contador confirma la factura a nombre del comprador; si no, se quita el campo (LEG-040). Exige la norma (Ley 1581, art. 4 lits. b y c).

### 4.3 Casilla de autorización de datos (texto del paquete v1)

`Autorizo a De Santander a tratar mis datos personales para gestionar mi pedido, conforme a la ` + enlace `Política de Tratamiento de Datos versión {version_politica_datos} del {fecha_politica_datos en letras}` (a `/legal/privacidad/`) + `, que leí.`

Ejemplo renderizado: «Autorizo a De Santander a tratar mis datos personales para gestionar mi pedido, conforme a la Política de Tratamiento de Datos versión 1 del 6 de noviembre de 2026, que leí.»

Reglas: sin marcar por defecto; separada de la de términos; versión y fecha leídas de `data/config.csv` (nunca fijas en el código); error `Debes autorizar el tratamiento de tus datos para continuar.`; mientras falte una de las dos casillas, el botón «Preparar pedido para WhatsApp» no avanza, se muestra la microayuda y, al pulsarlo, el error (§5.9, v1.1; sustituye «deshabilitado»). Exige la norma (Ley 1581, arts. 9 y 12). **Se recomienda**, no se exige, añadir al final `Entiendo que el pedido se envía por WhatsApp (Meta), que puede tratar mis datos fuera de Colombia.` (LEG-095).

### 4.4 Resumen y mensaje de WhatsApp (documento y código postal)

| Dónde | Texto exacto | Cuándo |
|---|---|---|
| Resumen, bloque «Envío a» | `Documento: {sigla} {número}` | Solo si lo escribió |
| Resumen, bloque «Envío a» | `Código postal: {código}` | Solo si lo escribió |
| WhatsApp | `Documento: {sigla} {número}` / `Código postal: {código}` | Solo si lo escribió |

### 4.5 Código postal

| Dónde | Texto exacto |
|---|---|
| Etiqueta | `Código postal (opcional)` |
| Ayuda | `Ayuda a la transportadora a ubicar tu dirección. Si no lo sabes, búscalo en el ` + enlace `visor de 4-72` (`https://visor.codigopostal.gov.co/472/visor/`, pestaña nueva) + `.` |
| Error, formato | `El código postal tiene 6 números.` |
| Error, departamento | `Este código no corresponde a {departamento}. Revísalo en el visor de 4-72.` |

### 4.6 Casilla de promociones

**Retirada** (decisión del dueño del 2026-11-06: «no por ahora»). No se implementa ninguna casilla ni línea de promociones. La política §3 dice que no se envían promociones sin autorización aparte. Si se reabre, se publica primero una nueva versión de la política.

## 5. Casilla de términos, mensaje, retracto, vendedor, plazos y PQR

### 5.1 Casilla de términos (texto del paquete v1)

| Dónde | Texto exacto |
|---|---|
| Resumen, segunda casilla, sin marcar | `Leí y acepto los ` + enlace `Términos y condiciones versión {version_terminos} del {fecha_terminos en letras}` (a `/legal/terminos/`) + `.` |
| Error | `Debes aceptar los términos para continuar.` |

Ejemplo: «Leí y acepto los Términos y condiciones versión 1 del 6 de noviembre de 2026.» Exige la norma que las dos casillas estén separadas y sin marcar (Ley 1581, art. 9; Ley 1480, art. 50). Comportamiento del botón mientras falte esta casilla: §5.9.

### 5.2 Constancia en el mensaje de WhatsApp

| Dónde | Texto exacto |
|---|---|
| WhatsApp, última línea (después de `Forma de pago:`; si hay línea de «por cotizar», esta va antes de la constancia) | `Acepto los Términos y condiciones versión {version_terminos} y autorizo el tratamiento de mis datos según la Política de tratamiento de datos versión {version_politica_datos} del {fecha_politica_datos en letras}.` |

Exige la norma conservar prueba de la autorización (Ley 1581, art. 17 lit. b). Complementa el «ACEPTO» del chat (política §5), no lo reemplaza, porque el cliente puede editar el mensaje.

### 5.3 Retracto en el resumen y en `/envios/` (texto del paquete v1; reemplaza «no admite retracto»)

| Dónde | Texto exacto |
|---|---|
| Resumen, `data-testid="aviso-retracto"`, en la nota bajo los totales, antes de las casillas | `Puedes retractarte dentro de los 5 días hábiles siguientes a la entrega, salvo si el empaque está abierto. El transporte de la devolución corre por tu cuenta. Te devolvemos el dinero en máximo 15 días calendario, por el medio de pago que prefieras.` |
| `/envios/`, párrafo propio después de los plazos, con el título `Retracto` | El mismo texto, seguido de ` Más en envíos, devoluciones, retracto y garantía.` (enlace a `/legal/envios-devoluciones/`) |

Exige la norma informar el retracto y su procedimiento antes de la compra (Ley 1480, arts. 47 y 50). La línea actual «El café es un alimento: no admite retracto…» **se retira** (LEG-081).

### 5.4 Vendedor en el pie y en el resumen (texto del paquete D4)

| Dónde | Texto exacto |
|---|---|
| Resumen, bajo las casillas | `Te vende {razon_social} · NIT {nit} · {domicilio} · {correo_contacto} · WhatsApp {whatsapp}. ` + enlace `Información del vendedor` (a `/legal/vendedor/`) (v1.7: sin dirección de notificación, decisión del dueño) |
| Pie, bloque `address` | Línea 1 `{razon_social} · NIT {nit}`; línea 2 `Domicilio: {domicilio}`; línea 3 `Correo de atención y de notificación judicial: {correo_contacto}` (enlace `mailto:`); línea 4 `WhatsApp {whatsapp formateado}` (v1.7: se retira «Notificaciones judiciales», decisión del dueño) |
| `/legal/vendedor/`, `dl` | Filas `Razón social`, `NIT`, `Matrícula mercantil`, `Representante legal`, `Domicilio`, `Dirección de notificación judicial`, `Correo`, `WhatsApp`. La fila de la dirección muestra `{direccion_notificacion}` de `config.csv` y **nunca un marcador**; sin dato, la fila no se pinta (LEG-134) |

Exige la norma identificar al vendedor con dirección de notificación judicial (Ley 1480, art. 50 lit. a; VERIFICAR la letra). Con la decisión del dueño del 2026-11-12, la dirección solo se publica en `/legal/vendedor/`, enlazada desde el pie y el resumen; debe existir allí (LEG-134). Cada línea se pinta solo si el dato existe. Representante y matrícula solo en `/legal/vendedor/` (se recomienda; LEG-085).

### 5.5 Plantilla completa del mensaje de WhatsApp

```
¡Hola, {nombre_tienda}! Envío mi solicitud de compra para que me confirmen el total con el envío.

• {Café} ({provincia}) — {Grano entero | Molido} — {250 | 500} g × {cantidad} = {$ valor}
(una línea por producto)

Subtotal de productos: {$ subtotal} (IVA del 5 % incluido)
Envío ({destino} · zona {n}): {$ tarifa}          ← o: Envío: POR COTIZAR (zona especial | más de 5 kg)
Total: {$ total}                                   ← o: Total sin envío: {$ total}

Envío a:
Nombre: {nombre}
Celular: {celular}
Correo: {correo}                                   ← solo si lo escribió
Documento: {sigla} {número}                        ← solo si lo escribió
Ciudad: {municipio}, {departamento}
Código postal: {código}                            ← solo si lo escribió
Dirección: {dirección} · Barrio: {barrio}          ← «· Barrio:» solo si lo escribió
Indicaciones: {indicaciones}                       ← solo si las escribió
Forma de pago: {forma de pago}

Quedo atento al valor del envío para confirmar mi pedido.   ← solo si es por cotizar

Acepto los Términos y condiciones versión {version_terminos} y autorizo el tratamiento de mis datos según la Política de tratamiento de datos versión {version_politica_datos} del {fecha_politica_datos en letras}.
```

Reglas: límite de 2.000 caracteres (si se pasa, se recortan las indicaciones y se avisa, como hoy); el enlace `wa.me` se abre con un clic del cliente, no con `window.open` tras una espera (v1.10: se admite `window.open` **síncrono** dentro del mismo manejador del clic, sin `await`, `setTimeout` ni `requestAnimationFrame` antes; §9.5); las versiones y fechas salen de `data/config.csv`. Diferencias con la plantilla del paquete (LEG-090): sin «N.° DS-[número]» (decisión del dueño), se conservan `Total`, `Correo`, `Documento`, `Código postal`, el departamento en `Ciudad` y la línea de «por cotizar», que el paquete omitía y que exige el resumen del art. 50 o ya recoge el formulario.

### 5.6 Plazo de entrega en el resumen y en el paso de envío

| Caso | Dónde | Texto exacto |
|---|---|---|
| Zonas 1 a 4 | Bajo la línea de envío, `caption` | `Entrega estimada: {plazo_estimado}. Plazo máximo: {plazo_maximo}.` |
| Zona 5 o más de 5 kg | Mismo lugar | `Entrega estimada: {plazo_estimado}, en la oficina de la transportadora. Plazo máximo: se informa al cotizar; nunca más de 30 días calendario.` |

Ejemplo zona 3: «Entrega estimada: 1 a 3 días hábiles. Plazo máximo: 3 días hábiles.» Los valores salen de `data/plazos_envio.csv` (§6). Exige la norma (Ley 1480, art. 50 lit. h, Ley 2439 de 2024). Los plazos se cuentan desde la recepción del pago por Bre-B, única forma de pago desde la v1.7 (envíos §6, versión 2).

### 5.7 Radicado de quejas, reclamos y solicitudes (plantilla operativa, sin cambios)

| Uso | Texto exacto |
|---|---|
| Respuesta de recepción | `Recibimos tu solicitud. Radicado {PQR-AAAA-NNN}, recibido el {DD/MM/AAAA} a las {HH:MM}. Te respondemos a más tardar el {fecha: 15 días hábiles desde el día siguiente}. Con ese número puedes preguntarnos cómo va.` |
| Consulta de estado | `Tu radicado {PQR-AAAA-NNN} está {en revisión / respondido el DD/MM/AAAA}. Fecha límite de respuesta: {fecha}.` |
| Cierre | `Radicado {PQR-AAAA-NNN}: {respuesta}. Si no estás de acuerdo, puedes acudir a la Superintendencia de Industria y Comercio (www.sic.gov.co).` |
| Formato | `PQR-` + año + `-` + consecutivo de tres dígitos desde `001` cada año. Un solo consecutivo para PQR de consumo y de datos personales (plazos distintos: 15 días hábiles; 10 + 5; 15 + 8). |
| Registro privado (hoja de cálculo de Google) | `radicado · fecha y hora · canal · nombre · celular o correo · fecha del pedido · tipo · resumen · fecha límite · fecha de respuesta · quién respondió · resultado` |

Respuesta al «ACEPTO» (operación, no código): antes de procesar, la tienda escribe `Tu total con envío es {$ total}. Responde ACEPTO para confirmar el pedido, los Términos y condiciones versión {version_terminos} y la autorización de datos.` (desde la publicación de la versión 2: «versión 2») y espera la respuesta antes de cobrar o despachar.

### 5.8 Página `/envios/`

| Dónde | Texto exacto |
|---|---|
| Título de la sección de plazos | `Plazos de entrega` |
| Frase bajo el título (v1.7, LEG-136) | `El estimado es lo que suele tardar. El máximo es el plazo que nos comprometemos a cumplir. Los dos se cuentan en días hábiles desde que recibimos tu pago por transferencia Bre-B. Si no entregamos en el máximo, puedes cancelar y te devolvemos todo en 15 días calendario.` (antes: «desde que aceptas el total en el chat y, si pagas por transferencia Bre-B, desde que recibimos el pago»; con solo Bre-B el resultado es el mismo, pero conviene que coincida con envíos §6) |
| Cada zona (`dd`) | `Estimado: {plazo_estimado}. Máximo: {plazo_maximo}.` (zona 5: `Estimado: {plazo_estimado}, en la oficina de la transportadora. Máximo: se informa al cotizar; nunca más de 30 días calendario.`) |
| Línea legal (`plazo-legal`), se conserva | `Si no publicamos un plazo máximo para tu zona, entregamos en máximo 30 días calendario, como manda la ley.` |
| Bajo la tabla de tarifas | Leyenda de IVA (§1.4). Sin frase de comisión (§1.7 retirada en la v1.7) |
| Sección nueva `Retracto` | Texto de §5.3 |
| `metadata.description` | `Cómo calculamos el envío de tu pedido: zonas, tarifas por peso con IVA incluido y plazos de entrega desde Bucaramanga.` |
| Enlace final | `Lee la política completa de envíos, devoluciones, retracto y garantía.` (a `/legal/envios-devoluciones/`) |

### 5.9 Botón «Enviar por WhatsApp» del resumen mientras falta una casilla (v1.1; reescrita en la v1.10: LEG-101, LEG-102, LEG-172; QA-006)

**Vía recomendada: botón activo para el foco con `aria-disabled="true"` + microayuda visible + errores al pulsar.** No se usa el atributo `disabled`. Desde la v1.10 el botón es «Enviar por WhatsApp» del resumen (ya no existe «Preparar pedido para WhatsApp») y el orden es el de las casillas del paquete: **primero los términos (casilla 1), después los datos (casilla 2)** (LEG-145).

| Dónde | Caso | Texto exacto |
|---|---|---|
| Microayuda, texto visible entre el texto de §9.3 y el botón, `caption`, enlazada al botón con `aria-describedby` | Faltan las dos casillas | `Para enviar tu pedido, marca las dos casillas: los términos y condiciones y la autorización de tus datos.` |
| Mismo lugar | Faltan solo los términos | `Para enviar tu pedido, falta que aceptes los términos y condiciones.` |
| Mismo lugar | Falta solo la autorización de datos | `Para enviar tu pedido, falta que autorices el tratamiento de tus datos.` |
| Mismo lugar | Las dos marcadas | *(la microayuda desaparece y el botón deja de tener `aria-disabled`)* |
| Variante de una sola frase (si diseño prefiere no cambiar el texto según el caso; v1.11, LEG-181) | Falta una o las dos | `Para enviar tu pedido, acepta los términos y autoriza tus datos.` (Se retira «Para enviar tu pedido, marca las dos casillas.»: no dice cuáles, y las casillas de promociones quedan junto a ella.) |
| Error bajo la casilla de datos, al pulsar el botón si no está marcada (`aria-invalid="true"` y `aria-describedby` en la casilla) | — | `Debes autorizar el tratamiento de tus datos para continuar.` (sin cambio) |
| Error bajo la casilla de términos, al pulsar el botón si no está marcada (igual) | — | `Debes aceptar los términos para continuar.` (sin cambio) |

Reglas:
1. Al pulsar el botón con `aria-disabled="true"`: no se genera número DS, texto ni enlace `wa.me`, no aparece el respaldo de §9.4, no se marca ninguna casilla por el cliente, se muestran los errores de las casillas que falten y el foco va a la primera casilla sin marcar. Al marcarla, su error desaparece.
2. La microayuda no se anuncia con `aria-live` en cada cambio (sería ruidosa); basta `aria-describedby`. Los errores sí se anuncian al aparecer (`role="alert"` o el patrón de errores que ya usa el formulario).
3. Ningún texto de este bloque dice «compra», «confirmar», «finalizar» ni «pagar»: el botón solo abre WhatsApp con el mensaje escrito; el pedido existe al enviarlo por WhatsApp y queda en firme al aceptar el total en el chat (términos §6).

Fundamento. **Exige la norma** que la autorización de datos y la aceptación de los términos sean expresas, separadas y sin premarcar (Ley 1581, arts. 9 y 12; Ley 1480, art. 50; Ley 527, art. 14: VERIFICAR artículo), y que la información al consumidor sea clara y comprensible (Ley 1480, art. 23). Las dos vías (`disabled` con microayuda, o `aria-disabled` con microayuda y errores) cumplen esas normas si el botón no avanza sin las dos casillas. **Se recomienda** `aria-disabled` porque: (a) un botón `disabled` no recibe foco y quien navega con teclado o lector de pantalla no lo encuentra o no sabe por qué no responde; (b) conserva los errores junto a cada casilla, que indican exactamente cuál falta (WCAG 2.2, criterios 3.3.1, 3.3.2 y 4.1.2, como buena práctica: no es norma colombiana obligatoria para particulares; VERIFICAR la aplicabilidad de la NTC 5854); (c) resuelve la contradicción de la v1.0, que pedía a la vez «error sin cambio» y «botón deshabilitado».

## 6. Configuración y CSV (requisitos de datos)

`data/config.csv` (claves nuevas o actualizadas):

```
version_terminos,2
fecha_terminos,2026-11-12
version_politica_datos,2
fecha_politica_datos,2026-11-12
razon_social,De Santander SAS
nit,902.121.184-8
iva_tarifa,5
domicilio,Bucaramanga, Santander
direccion_notificacion,{nueva dirección inscrita en Cámara de Comercio, D-25}
correo_notificacion,desantander.tienda@gmail.com
matricula_mercantil,740574
representante_legal,Ivan Fernando Rueda Duarte
area_datos,Área comercial
```

Las casillas, la constancia del mensaje, las leyendas de IVA y las páginas legales leen versión, fecha y tarifa de ahí; nada fijo en el código. Si la fecha real de publicación es posterior al 2026-11-06, se actualizan `fecha_terminos`, `fecha_politica_datos`, el «vigente desde» de las páginas y la fecha en los documentos (LEG-088). La fecha en letras («6 de noviembre de 2026») se formatea en el código a partir de la fecha ISO.

`data/catalogo.csv` (columnas nuevas): `marca`, `fabricante`, `fabricante_expresion` (`FABRICADO POR` | `ENVASADO POR`), `nsa` (renombra o sustituye `registro_sanitario`), `titular_nsa`. Validación en `npm run datos`: si `fabricante` tiene valor, `fabricante_expresion` es obligatoria; café activo sin `nsa` genera **aviso**, no error (decisión del dueño, P9).

`data/plazos_envio.csv` (nuevo, una fila por zona): `zona,plazo_estimado,plazo_maximo` con los valores: `1,Mismo día o siguiente día hábil,1 día hábil` · `2,1 a 3 días hábiles,3 días hábiles` · `3,1 a 3 días hábiles,3 días hábiles` · `4,2 a 6 días hábiles,6 días hábiles` · `5,5 a 12 días hábiles,por cotizar`. La constante `PLAZOS` de `src/app/envios/page.tsx` se elimina.

Páginas legales: el contenido público de cada documento (`terminos-y-condiciones.md`, `politica-tratamiento-datos.md`, `envios-devoluciones-retracto.md`, `informacion-vendedor.md`, sección «Texto para el consumidor») se publica en `/legal/terminos/`, `/legal/privacidad/`, `/legal/envios-devoluciones/` y `/legal/vendedor/` con «Versión 1 · vigente desde 2026-11-06». Vía: Sanity (`paginaLegal`, `version = "1"`, `vigenteDesde = 2026-11-06`) si el proyecto existe, o un respaldo en el repositorio que `repositorioContenido.legal()` sirva cuando Sanity no esté configurado (LEG-084). El título de `envios-devoluciones` en `SECCIONES`, el pie y el resumen pasa a `Envíos, devoluciones, retracto y garantía`.

## 7. Textos que se retiran del sitio y de los documentos

- `El café es un alimento: no admite retracto. Si llega dañado o equivocado, te respondemos con la garantía.` (resumen; reemplazado por §5.3).
- `¡Hola, De Santander! Quiero finalizar mi pedido` y `Quiero hacer este pedido:` (reemplazados por §1.6).
- `Acepto los términos y condiciones.` (reemplazado por §5.1).
- `Autorizo a {razon_social} a tratar mis datos personales para gestionar este pedido: confirmarlo, coordinar la entrega…` (v0.4; reemplazado por §4.3).
- `Registro sanitario` como rótulo (reemplazado por `Notificación sanitaria INVIMA`).
- `Plazos orientativos` y `Son una referencia, no una fecha de entrega…` (reemplazados por §5.8).
- `Envíos, devoluciones y retracto` (título; pasa a `Envíos, devoluciones, retracto y garantía`).
- `Café de origen de marca propia…`, `De Santander es una marca propia…`, `Trabajamos con fincas…`, `Recolección manual…`, `Secado al sol`, `cafés de De Santander`, `brand: De Santander` (modelo C, pendientes desde LEG-069).
- `Precios en pesos colombianos.` a solas en el pie y en `/envios/` (se completa con la leyenda de IVA).
- Toda mención a `Total sin comisión de recaudo`, `Comisión por pago contraentrega`, `POR CONFIRMAR` y a la casilla de promociones (v0.6 §4.7 y §6): no se implementan.
- `El café no tiene IVA`, `sin IVA` (solo existían en documentos internos; no se publican).
- `N.° DS-[número]` (plantilla del paquete; el sitio no numera).
- `Cafetal entre montañas de Santander con niebla de la mañana` (texto alternativo de la foto de respaldo de la Historia) y el crédito `De Santander` de esa foto (v1.1, LEG-104; reemplazados por §2).
- `transferencia bre-b` y la unión de las formas de pago con «y» en «Cómo pedir» (v1.1, LEG-103).
- Atributo `disabled` en «Preparar pedido para WhatsApp» sin explicación (v1.1, LEG-101; reemplazado por §5.9).
- Flujo del pedido (v1.10, LEG-171 a LEG-175): `Preparar pedido para WhatsApp`, `Revisar el pedido` (cajón), `Finalizar el pedido` (Envío), `← Volver al carrito`, `← Volver` (resumen), el paso `Confirmación` del indicador y `?paso=confirmacion`, el título `Tu pedido está listo para enviar por WhatsApp`, los textos `Pulsa «Enviar por WhatsApp» y manda el mensaje…` (con tarifa y por cotizar), el segundo botón «Enviar por WhatsApp» del panel, `Si WhatsApp no se abre, copia el mensaje y envíalo al …` y el arranque `Para preparar tu pedido` de la microayuda. Tampoco se usa `Abrir WhatsApp` en botones, nombres accesibles ni pruebas.
- Historia de portada (v1.8, LEG-139, QA-013): `De Santander es mucho más una tienda: es un puente directo entre los mejores caficultores de nuestra tierra y tu taza. Reunimos una selección exclusiva de cafés de origen santandereano, tostados y empacados directamente por sus productores —tal como lo ves en cada bolsa y ficha técnica—.` y `Desde {ciudad_despacho} enviamos este sabor de origen a todo Colombia. En cada café te contamos su historia: la provincia, el municipio, la altitud, la variedad y el proceso que lo hicieron único.` (reemplazados por §2). Tampoco se usan sueltas: `más que una tienda`, `puente directo`, `los mejores`, `selección exclusiva`, `directamente por sus productores`, `lo hicieron único`.

## 8. Envío gratis en comunas de Bucaramanga (v1.2; LEG-106 a LEG-117)

**Estado (v1.7, 2026-11-12).** Los cuatro documentos versión 2 están redactados con fecha 2026-11-12 (LEG-133); su publicación depende de la aprobación del abogado responsable. La promoción se enciende con `envio_gratis_desde,2026-11-12` en el **mismo** build que publica la versión 2. **Regla original:** no se publican hasta que estén publicados, el mismo día, los Términos versión 2, «Envíos, devoluciones, retracto y garantía» versión 2, «Información del vendedor» con el rótulo de la versión 2 y la Política versión 2 (LEG-106). **Decisiones del dueño (2026-11-09):** P25 = a (sin fecha final), P26 = a (sin pedido mínimo), **P27 = b (cualquier peso)**, P28 = a (sin comuna elegida, tarifa normal), plazo de 1 día hábil contado desde la validación de la transacción y el aprobado del pedido. P29 a, P30 a, P31 a y P32 a se aplican como recomendación de legal; el dueño todavía puede cambiarlas. **v1.5:** P33 y P33 bis cerradas (validación manual del pago Bre-B, el mismo día si llega en horario de atención y el siguiente día de atención si no). D-24 cerrado: lunes a viernes, de 7:00 a. m. a 5:00 p. m., hora de Colombia, sin contar festivos. P34 = b (terminación inmediata por orden del dueño). P35: el dueño reconstruye y despliega. En los textos no se usan números de comuna.

### 8.1 Regla que suponen los textos

- Aplica con municipio **Bucaramanga** y una de estas comunas: San Francisco, Oriental, Centro, Cabecera del Llano, La Concordia, Ciudadela Real de Minas y Mutis. «Ciudadela Real de Minas» es la comuna La Ciudadela completa (LEG-115). El orden de la lista en los textos es este; en el selector, el alfabético (§8.2).
- Envío **$0 con cualquier peso** (P27 b). En las siete comunas, el pedido de más de 5 kg **no** es «por cotizar» y no usa la fila «Zona 5 y más de 5 kg» de los plazos (LEG-119).
- Sin pedido mínimo (P26 a).
- Sin comuna elegida, o con «Otra comuna o no la sé»: la regla de hoy para Bucaramanga, es decir, la tarifa de zona 1 hasta 5 kg y «por cotizar» con más de 5 kg (P28 a).
- Plazo del envío gratis, con cualquier peso: **máximo 1 día hábil**, con un estimado de mismo día o siguiente día hábil. Se cuenta desde que la tienda valida el pago por Bre-B (única forma de pago desde la v1.7) y da por el chat el aprobado del pedido. El dueño la hace a mano en el horario de atención: de lunes a viernes, de 7:00 a. m. a 5:00 p. m., hora de Colombia, sin contar festivos (D-24). Si el pago llega dentro de ese horario, la validación es ese mismo día; si llega fuera de él, el siguiente día de atención, antes de las 5:00 p. m. (LEG-118, LEG-130; P33 bis; texto completo en el numeral 13, nota E de envíos). Ningún texto del sitio fuera del numeral 13 repite el horario, salvo «Información del vendedor» versión 2 (recomendado). El plazo no se toma de una fila de `data/plazos_envio.csv`: es un valor propio de la promoción, para que un cambio en la zona 1 no lo cambie sin revisión.
- Vigencia: desde `envio_gratis_desde` (D-21), sin fecha final (P25 a). Sin ese dato, nada de esta sección aparece en el sitio. Termina cuando el dueño da la orden y despliega el sitio con `envio_gratis_terminada` (P34 b, §8.6.1). `envio_gratis_hasta` (fecha final anunciada con anticipación) no se usa.

### 8.2 Campo «Comuna» (formulario de envío)

| Dónde | Texto exacto |
|---|---|
| Etiqueta | `Comuna (opcional)` |
| Cuándo se muestra | Solo con municipio Bucaramanga, justo después de `Municipio` (v1.4: decisión de diseño aceptada por legal, LEG-126; antes decía «después de `Barrio`»). Si el cliente cambia el departamento o el municipio, el campo se vacía y se oculta |
| Control | Lista desplegable; no texto libre |
| Primera opción (vacía, por defecto) | `Elige tu comuna` |
| Opciones | `Cabecera del Llano` · `Centro` · `Ciudadela Real de Minas` · `La Concordia` · `Mutis` · `Oriental` · `San Francisco` · `Otra comuna o no la sé` |
| Ayuda (siempre visible) | `Envío gratis si tu dirección está en San Francisco, Oriental, Centro, Cabecera del Llano, La Concordia, Ciudadela Real de Minas o Mutis. Si no eliges una de ellas, pagas la tarifa normal. Verificamos tu dirección por el chat antes de que aceptes el total.` + enlace ` Condiciones` (a `/envios/#envio-gratis`) |
| Ayuda al elegir una comuna de la lista (reemplaza a la anterior) | `Tu envío es gratis si tu dirección está en {comuna}. Lo verificamos por el chat antes de que aceptes el total.` + enlace ` Condiciones` |
| Variante si el dueño elige P28 b (reemplaza la segunda frase de la ayuda) | `Si no sabes tu comuna, no pasa nada: al revisar tu dirección por el chat te aplicamos el envío gratis si está en una de ellas.` |
| Error | *(ninguno: el campo es opcional y de lista cerrada)* |

`Otra comuna o no la sé` envía el campo vacío: no se pide ni se registra una comuna fuera de la lista (minimización, Ley 1581, art. 4). La comuna **no** se guarda en `localStorage`, no va en la URL ni en analítica (política §2).

### 8.3 Resumen del pedido

| Dónde | Caso | Texto exacto |
|---|---|---|
| Línea de envío, rótulo | Comuna de la lista, cualquier peso | `Envío a Bucaramanga` con la nota `· zona 1 · {comuna}` en gris |
| Línea de envío, valor | Mismo caso | `$0` y, junto al valor, `Envío gratis` |
| Bajo la línea de envío, `caption` | Comuna de la lista, hasta 5 kg | `Envío gratis en {comuna}, si verificamos por el chat que tu dirección está en esa comuna. Si no lo está, el envío es de {$ tarifa de zona 1} y el total queda en {$ total + tarifa}; tú decides si lo aceptas antes de pagar.` |
| Bajo la línea de envío, `caption` | Comuna de la lista, más de 5 kg | `Envío gratis en {comuna}, si verificamos por el chat que tu dirección está en esa comuna. Si no lo está, el envío de más de 5 kg se cotiza: te informamos el valor por el chat y tú decides si lo aceptas antes de pagar.` |
| Plazo, `caption` (reemplaza a §5.6 en este caso) | Comuna de la lista, cualquier peso | `Entrega estimada: mismo día o siguiente día hábil. Plazo máximo: 1 día hábil desde que validamos tu pedido y te damos el aprobado por el chat.` |
| Total | Mismo caso | `Total` (sin cambio; el envío suma $0). Con más de 5 kg **no** se usa `Total sin envío` ni la nota de §1.2 |
| Región `role="status"` del paso Envío (solo lectores de pantalla; v1.4, LEG-120) | Comuna de la lista, cualquier peso | `Envío gratis en {comuna}, sujeto a verificar tu dirección: $0. Total: {$ total}.` |
| Todos los demás casos | — | Sin cambio (§1.1, §1.2, §5.6) |

La nota con la tarifa y el total alternativos (`data-testid="referencia-tarifa"`) es la nota completa de esta tabla, letra por letra; no es una nota aparte. La etiqueta `Envío gratis` va junto al `$0` y no se usa sola fuera de esta línea (§8.6).

Exige la norma informar antes de la compra el precio total, el costo del envío y el plazo (Ley 1480, art. 50 lits. c y h). Como la comuna es autodeclarada, también se informa el precio que se cobraría si no se confirma, para que el cliente conozca los dos totales antes de enviar el mensaje (arts. 33 y 50). La región `role="status"` debe llevar la condición, porque es lo único que oye quien usa lector de pantalla al elegir la comuna: sin ella, el anuncio diría «envío gratis» sin condición (arts. 23 y 29; LEG-107).

### 8.4 Mensaje de WhatsApp (cambios sobre la plantilla de §5.5)

| Dónde | Caso | Texto exacto |
|---|---|---|
| Línea de envío | Comuna de la lista, cualquier peso | `Envío (Bucaramanga · zona 1 · {comuna}): $0 (envío gratis, sujeto a verificar la dirección)` |
| Bajo `Total:` | Mismo caso | `Plazo de entrega: máximo 1 día hábil desde que validen mi pedido y me den el aprobado por el chat.` |
| Bloque «Envío a», después de `Dirección:` | Siempre que el cliente eligió una comuna de la lista | `Comuna: {comuna}` |
| Penúltima línea (lugar de «Quedo atento al valor del envío…»), antes de la constancia | Comuna de la lista, hasta 5 kg | `Si mi dirección no está en esa comuna, el envío es de {$ tarifa de zona 1} y el total queda en {$ total + tarifa}; espero su confirmación.` |
| Mismo lugar | Comuna de la lista, más de 5 kg | `Si mi dirección no está en esa comuna, quedo atento al valor del envío para confirmar mi pedido.` |
| Resto | — | Sin cambio (§5.5). La constancia final toma la versión 2 de `config.csv` |

### 8.5 Página `/envios/`

| Dónde | Texto exacto |
|---|---|
| Tabla de tarifas, nota en la fila «Bucaramanga» | `Gratis en siete comunas, con cualquier peso (ver condiciones).` (enlace a `#envio-gratis`) |
| Nota bajo la tabla (la que dice «Más de 5 kg, en cualquier zona, se cotiza aparte», §1.4) | Se agrega: ` Salvo en las siete comunas de Bucaramanga con envío gratis.` |
| Párrafo inicial (bajo el título), con la promoción vigente (v1.4, LEG-121; reemplaza al de hoy solo mientras rige) | `El envío se calcula por zona y por peso, y lo ves en tu pedido en cuanto eliges la ciudad. Pagas el valor que te mostramos; solo se cotiza aparte en zonas especiales y en pedidos de más de 5 kg. En siete comunas de Bucaramanga el envío es gratis con cualquier peso, si verificamos por el chat que tu dirección está en una de ellas.` + enlace ` Ver condiciones` (a `#envio-gratis`) |
| Plazos de entrega, `dd` de la zona 1 (v1.4, LEG-123; reemplaza al de la v1.3) | Se agrega: ` Con envío gratis en comunas de Bucaramanga, el máximo es 1 día hábil con cualquier peso, contado desde que validamos tu pedido y te damos el aprobado por el chat (ver condiciones).` («ver condiciones» con enlace a `#envio-gratis`) |
| Plazos de entrega, `dd` de la zona 5 y más de 5 kg | Se agrega: ` No aplica a las siete comunas de Bucaramanga con envío gratis.` |
| Caja final «¿Tu destino es de zona 5 o pides más de 5 kg?», con la promoción vigente (v1.4, LEG-122) | Título sin cambio. Segundo párrafo: `Escríbenos al {WhatsApp} y te cotizamos. Si tu dirección está en una de las siete comunas de Bucaramanga con envío gratis, no hace falta: el envío es gratis con cualquier peso.` |
| Sección nueva, `id="envio-gratis"`, título | `Envío gratis en comunas de Bucaramanga` |
| Contenido | El texto del **numeral 13** de «Envíos, devoluciones, retracto y garantía» versión 2 (nota E de ese documento), completo y letra por letra, como lista. Al final: ` Más en envíos, devoluciones, retracto y garantía.` (enlace a `/legal/envios-devoluciones/`). v1.4: se acepta la lista visual de las siete comunas en orden alfabético después del primer párrafo (diseño), porque repite el dato y no cambia el numeral (LEG-126) |
| `metadata.description` | Sin cambio (LEG-116) |

Sin la promoción vigente, el párrafo inicial, la caja final y los `dd` vuelven a los textos de hoy (§5.8). El párrafo general de «Plazos de entrega» («Los dos se cuentan en días hábiles desde que aceptas el total…») no cambia: rige para las zonas y la salvedad del envío gratis va en el `dd` de la zona 1, que remite a las condiciones.

Exige la norma que las condiciones de tiempo, modo y lugar estén en la publicidad de la promoción (Ley 1480, art. 33 inc. 2): por eso van completas en `/envios/` y no solo en la página legal. Dos fórmulas distintas para contar el mismo plazo en la misma página se interpretarían a favor del cliente (art. 34): por eso el `dd` de la zona 1 dice cómo se cuenta el plazo del envío gratis (LEG-123).

### 8.5 bis Textos que no cambian con la promoción (v1.4, LEG-124)

| Dónde | Decisión |
|---|---|
| Pie, `nota_envio` de `data/config.csv` (§1.5) | **Sin cambio.** Sigue siendo exacta con la promoción: el valor del envío se ve en el pedido y, en los destinos por cotizar y en los pedidos de más de 5 kg, se confirma por WhatsApp antes de pagar (en las siete comunas también se confirma, al verificar la dirección). **No** se agrega la promoción a `nota_envio`: es un texto fijo del CSV que no se apaga con `envio_gratis_hasta` y seguiría anunciando el envío gratis después de terminado (art. 33 inc. 3). Si el dueño quiere mencionarla en el pie, se usa el anuncio de §8.6, generado por el código y condicionado a la vigencia. |
| «Cómo pedir», paso 3 (§2) | **Sin cambio.** `… Ves el envío en tu carrito; si hay que cotizarlo, te lo confirmamos antes de que pagues…` no afirma nada sobre los 5 kg ni sobre Bucaramanga, y la línea de §8.6 que va debajo de los tres pasos informa la promoción con su condición. |

### 8.6 Anuncios de la promoción

| Dónde | Texto exacto |
|---|---|
| Portada, pie o cajón del carrito (opcional) | `Envío gratis en siete comunas de Bucaramanga.` + enlace ` Ver condiciones` (a `/envios/#envio-gratis`). En el cajón va solo mientras no hay destino, bajo «Se calcula al elegir tu ciudad» (v1.4: implementado así, conforme) |
| Redes o WhatsApp (si el dueño la difunde) | `Envío gratis en San Francisco, Oriental, Centro, Cabecera del Llano, La Concordia, Ciudadela Real de Minas y Mutis (Bucaramanga), con cualquier peso y sin pedido mínimo. Condiciones en {URL}/envios/.` |
| Si termina la promoción | *(reemplazado por §8.6.1, terminación inmediata)* |

#### 8.6.1 Fin de la promoción: terminación inmediata (v1.5, P34 = b; LEG-125 y LEG-127)

**Regla (P34 b, aceptada por el dueño).** No hay fecha final previa. La promoción termina cuando el dueño da la orden de apagarla. Ese mismo día él pone en `data/config.csv` `envio_gratis_terminada` con la fecha del día (ISO) y reconstruye y despliega el sitio (P35). Desde ese despliegue la promoción no rige y el sitio muestra el estado «terminada». `envio_gratis_hasta` y el aviso previo con fecha (A de la v1.4) **no se usan**.

**Documentos.** La viñeta «Vigencia» del numeral 13 ya prevé la terminación («hasta que publiquemos en este sitio que terminó, en los mismos lugares en que la anunciamos»). Por eso **no** cambia el día del fin y no hace falta subir la versión de términos, envíos ni vendedor ese día. Legal retira el numeral más adelante, en una versión nueva.

**Estado «terminada».** El código deja de mostrar el campo «Comuna», el $0, la nota de la fila Bucaramanga, la salvedad bajo la tabla, los `dd` de las zonas 1 y 5, el párrafo inicial y la caja de §8.5 con la promoción (vuelven los textos de §5.8). Muestra el aviso en **los mismos lugares** donde estaba el anuncio, durante al menos 30 días calendario contados desde `envio_gratis_terminada`. Los 30 días son una recomendación de legal; la norma exige la misma visibilidad, pero no fija una duración (Ley 1480, art. 33 inc. 3).

| Dónde | Texto exacto |
|---|---|
| Portada (bajo «Cómo pedir») y cajón del carrito, donde estuvo el anuncio | `El envío gratis en siete comunas de Bucaramanga terminó el {envio_gratis_terminada en letras}. Si tu pedido por WhatsApp ya decía «envío gratis», lo respetamos con las mismas condiciones.` + enlace ` Ver condiciones` (a `/envios/#envio-gratis`) |
| `/envios/`, sección `id="envio-gratis"`, título | `Envío gratis en comunas de Bucaramanga` |
| `/envios/`, primer párrafo de la sección | El mismo texto del aviso, **sin** el enlace «Ver condiciones» (las condiciones están debajo) |
| `/envios/`, segundo párrafo (nota de vigencia terminada; v1.6, LEG-131) | `Rigió desde el {envio_gratis_desde en letras} y ya no rige para pedidos nuevos. Abajo está el numeral 13 de «Envíos, devoluciones, retracto y garantía», tal como sigue publicado: donde dice que la promoción sigue vigente, entiende que terminó el {envio_gratis_terminada en letras}. Sus condiciones se siguen aplicando, completas, a los pedidos cuyo mensaje de WhatsApp ya decía «envío gratis», también en su entrega, su retracto y su garantía.` |
| `/envios/`, después de la nota | El numeral 13 publicado, **letra por letra y sin cambios**, con su título `13. Envío gratis en comunas de Bucaramanga`, dentro de un bloque citado que lo distinga del texto de la página (cita o caja con borde; lo define `disenador-marca`, sin color de alerta). Sin la lista visual de comunas y sin la nota de la fila Bucaramanga. **Se retira** `Estas fueron sus condiciones:` |
| Redes o WhatsApp (si se difundió por ahí), el mismo día | `Terminó el envío gratis en siete comunas de Bucaramanga el {fecha en letras}. Si tu pedido ya decía «envío gratis», lo respetamos con las mismas condiciones.` |

**Por qué una nota y no una versión en pasado del numeral (v1.6, LEG-131; QA-011).** El numeral 13 es parte del documento publicado en `/legal/envios-devoluciones/` y rige los pedidos que lo tuvieron. Si `/envios/` mostrara una versión en pasado, el sitio publicaría dos textos distintos de la misma condición, y la duda se resolvería a favor del cliente (Ley 1480, art. 34). Quitar solo la introducción duplicada no basta: la viñeta «Vigencia» seguiría diciendo «sigue vigente». La nota no cambia el numeral; dice que la terminación prevista en su viñeta «Vigencia» ya ocurrió (esta sección es la publicación «en este sitio» que esa viñeta exige) y conserva el compromiso con los pedidos que decían «envío gratis» (arts. 29 y 33 inc. 3). **Exige la norma:** que el aviso no contradiga las condiciones publicadas y que estas sigan visibles mientras rijan para algún pedido. **Se recomienda:** el bloque citado y la frase «donde dice que la promoción sigue vigente…».

Pasados los 30 días, el aviso puede retirarse en un despliegue posterior; la sección de `/envios/` (con la nota) se retira cuando legal publique la versión sin el numeral 13.

**Numeral retirado con el aviso aún visible (v1.6, LEG-132; QA-012): error en `npm run datos`, no aviso sin enlace.** El aviso promete respetar los pedidos «con las mismas condiciones»; si esas condiciones no están publicadas, el aviso remite a algo que el cliente no puede leer (arts. 23 y 33). Por eso, mientras el aviso de terminación esté visible (`hoy ≤ envio_gratis_terminada + 30 días`), el numeral 13 publicado es obligatorio y `npm run datos` sale con exit 1 si falta. Un aviso sin enlace no se acepta. Legal se obliga a no publicar una versión sin el numeral 13 antes de que termine ese plazo (nota E de envíos). Pasados los 30 días, sin numeral no hay aviso ni sección, y no hay error. Mensaje exacto del error:

`envio_gratis_terminada ({fecha}) muestra el aviso de terminación hasta el {fecha + 30 días}, pero el numeral 13 «Envío gratis en comunas de Bucaramanga» no está en el texto publicado de «Envíos, devoluciones, retracto y garantía»: el enlace «Ver condiciones» quedaría sin destino. Publica el numeral (legal) o, si la fecha está mal, corrige o vacía envio_gratis_terminada.`

**Por qué «si tu pedido ya decía envío gratis».** El sitio es estático: la promoción se apaga cuando el dueño despliega, no en el momento en que da la orden. Lo que el sitio mostró obliga (arts. 29 y 33). Por eso se respeta todo pedido cuyo mensaje de WhatsApp diga `$0 (envío gratis, sujeto a verificar la dirección)`, aunque llegue después de la orden. Con este criterio, el aviso, el numeral 13 y la práctica dicen lo mismo, y es verificable en el chat.

**Prohibidos:** `Envío gratis` solo; `Envío gratis en Bucaramanga`; `Domicilio gratis`; `Envío gratis a todo Bucaramanga`; `Entrega el mismo día` (el compromiso es 1 día hábil); cualquier anuncio en el que la condición vaya en letra más pequeña o en una nota aparte; `shippingRate: 0` u `OfferShippingDetails` en JSON-LD (LEG-107, LEG-116).

### 8.7 Fundamento

**Exige la norma:** condiciones de la promoción completas en la publicidad y vigencia (Ley 1480, arts. 5 num. 10 y 33; VERIFICAR la letra oficial); información veraz y no engañosa (arts. 23, 29 y 30); precio total, envío y plazo antes de comprar (art. 50); interpretación favorable en la duda (art. 34); no contradecir lo ya publicado en los términos (LEG-106). **Se recomienda:** mostrar la tarifa y el total alternativos (LEG-109), aplicar el envío gratis en la duda (P29 a) y al cliente cubierto que no eligió comuna (P28 b), y la lista cerrada del campo.

## 9. Flujo del pedido en tres pasos (v1.10; LEG-171 a LEG-176)

Revisión: `docs/legal/revisiones/2026-11-18-flujo-pedido-un-clic.md` (v0.2). Especificación de diseño: `docs/diseno/2026-11-18-ux-auditoria-alta.md`, A1. Flujo: cajón → `/pedido/` (Envío) → `/pedido/?paso=resumen` (Resumen, con «Enviar por WhatsApp» que valida y abre `wa.me` en el mismo clic). No hay pantalla Carrito ni panel de Confirmación. Las casillas, el aviso de privacidad (se queda en Envío), el retracto, el IVA, la nota de precio total, la línea del vendedor y la plantilla del mensaje (D5 §6.4, con número DS y constancia 1.0) **no cambian**.

**Estado:** textos de §9.3 aprobados por el abogado responsable según comunicación del dueño del 2026-11-18 (constancia escrita pendiente). El resto de §9 son textos de interfaz que legal revisó: conforme.

### 9.1 Botones

| Dónde | Texto exacto | Tipo |
|---|---|---|
| Cajón «Tu pedido», pie (`href="/pedido/"`) | `Continuar con el envío →` | UI, conforme (LEG-174) |
| Paso Envío, envío del formulario | `Ver el resumen →` | UI, conforme (LEG-174). Nunca «Finalizar» |
| Paso Envío, bloque «Tu pedido» | `Editar` (nombre accesible `Editar el pedido`; abre el cajón) | UI |
| Paso Envío, enlace bajo el botón | `Seguir viendo cafés` | UI |
| Resumen, botón principal (valida y abre `wa.me`) | `Enviar por WhatsApp` | **Legal: D1 §5** («Pulsas «Enviar por WhatsApp». Se abre WhatsApp con el pedido escrito»). Sin cambio |
| Resumen, secundario | `← Volver al envío` | UI, conforme |
| Resumen y vista «Mensaje listo», respaldo (§9.4) | `Copiar mensaje` · `Ver el mensaje` (`summary`) | Legal (LEG-173). `Vaciar pedido` se retira del respaldo en la v1.12 (el pedido ya está vacío); en el cajón se queda |

Ningún botón, nombre accesible ni prueba dice `Abrir WhatsApp`. El reintento es el mismo botón «Enviar por WhatsApp».

### 9.2 Indicador de pasos

`Pedido` · `Envío` · `Resumen` (`aria-label="Pasos del pedido"`). Sin `Confirmación` (LEG-175) y sin `Carrito`. «Pedido» es el cajón y aparece siempre como hecho al llegar a `/pedido/`. WhatsApp no es un paso. Fundamento: no anunciar un paso que no existe (Ley 1480, art. 23).

### 9.3 Cómo sigue la compra, encima del botón (LEG-171; D5 §6.3 adaptado)

`data-testid="texto-siguiente-paso"`, justo encima de la microayuda y del botón. La variante sale de si el envío es por cotizar.

| Caso | Texto exacto |
|---|---|
| Envío con tarifa (incluido el envío gratis por comunas) | `Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido escrito. Con ese mensaje nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.` |
| Envío por cotizar (zona 5 o más de 5 kg) | `Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido escrito. Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.` |

**Exige la norma** que el consumidor sepa, antes de mandar el mensaje, que todavía no ha comprado y qué sigue (Ley 1480, art. 23; D1 §5 y §6). Sustituye al panel de Confirmación de D5 §6.3, retirado con la aprobación del abogado.

### 9.4 Respaldo tras un clic válido (LEG-173)

Solo aparece después de un clic válido en «Enviar por WhatsApp», **debajo** del botón (nunca entre las casillas y el botón).

| Dónde | Texto exacto |
|---|---|
| Primera línea (`role="status"`) | `¿No se abrió WhatsApp? Copia el mensaje y envíalo al {whatsapp}.` (`{whatsapp}` = `formatearWhatsapp` del número de `config.csv`; hoy `+57 300 112 9874`) |
| Botón | `Copiar mensaje` |
| Desplegable (se recomienda) | `Ver el mensaje`, con el texto completo del mensaje |

Reglas: copia **el mismo texto y el mismo número DS** del enlace abierto; si cambia el carrito, un dato de envío o cualquiera de las cuatro casillas, se oculta y el siguiente clic genera número y texto nuevos. Sin cambios, un segundo clic abre el mismo enlace con el mismo número (recomendación de legal, §4 bis de la revisión). *Salvedad de la v1.12 (LEG-188):* el vaciado del carrito por el propio envío no cuenta como cambio; el respaldo sigue en la vista «Mensaje listo» (§9.6) con la copia en memoria. Se descarta si el carrito vuelve a tener cafés distintos de los del mensaje, al recargar o al salir de `/pedido/`.

### 9.5 Reglas del clic (LEG-172, **bloqueante**)

1. Sin la casilla 1 o la 2: no se genera número DS, texto ni enlace; errores bajo cada casilla (D5 §6.3, sin cambio) y foco a la primera sin marcar; microayuda de §5.9.
2. Con las dos: número DS, texto y `window.open` del enlace `wa.me` **en el mismo manejador, de forma síncrona**, sin `await`, `setTimeout` ni `requestAnimationFrame` antes.
3. Las casillas 3 y 4 nunca bloquean.
4. *(v1.12, LEG-188.)* Tras un clic válido, el pedido se vacía en el navegador en el mismo manejador, **después** de `window.open` del enlace `wa.me` y nunca antes. Un clic no válido no vacía nada. El sitio sigue sin saber si el cliente mandó el mensaje. Por eso conserva **solo en memoria** una copia del mensaje ya generado (nunca en `localStorage`, `sessionStorage`, `history.state`, la URL, la analítica ni otra pestaña), muestra la vista «Mensaje listo» (§9.6) con el respaldo de §9.4 y permite recuperar el pedido. La vista no dice que el pedido se envió, se recibió ni se confirmó.

### 9.6 Vista «Mensaje listo» (v1.12; LEG-188 a LEG-191)

Se muestra en `/pedido/` tras un clic válido, con la copia del mensaje en memoria y el carrito vacío. Especificación: `docs/diseno/2026-11-19-vaciar-carrito.md`.

| Dónde | Texto exacto | Tipo |
|---|---|---|
| h1 | `Envía el mensaje en WhatsApp` | Legal (art. 23): no dice «enviado», «confirmado» ni «compra» |
| Bajada, envío con tarifa (incluido el envío gratis por comunas) | `Con ese mensaje nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.` | Texto de §9.3 aprobado por el abogado, sin «Al pulsar…» |
| Bajada, por cotizar (zona 5 o más de 5 kg) | `Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.` | Ídem |
| Nota bajo la bajada | `Vaciamos «Tu pedido» en este navegador para que puedas armar uno nuevo. El mensaje de WhatsApp lleva todos los cafés.` | Legal (LEG-189): que no se lea como cancelación ni como cambio del mensaje |
| Rótulo del bloque de líneas | `En el mensaje` | UI; las líneas salen de la misma copia que el texto |
| Botón principal | `Enviar por WhatsApp` | D1 §5; reabre el mismo enlace y el mismo DS |
| Respaldo | El de §9.4, sin cambio | LEG-173 |
| Enlace | `Recuperar el pedido` | UI; al recuperar rige §4 bis (mismo DS sin cambios; nuevo con cualquier cambio) |
| Enlace | `Seguir viendo cafés` | UI |

El número DS **no** se muestra fuera del mensaje (LEG-191): queda en «Ver el mensaje», en lo copiado y en WhatsApp. Si algún día se muestra, solo como `Número de tu solicitud: {DS}`, nunca «Número de pedido».

**Exige la norma:** que el cliente sepa que aún no ha comprado y qué sigue (Ley 1480, art. 23; D1 §5 y §6); que los datos personales no se guarden donde D2 §2 dice que no se guardan (Ley 1581, art. 4; LEG-149). **Se recomienda:** el reintento con el mismo DS y «Recuperar el pedido».
