> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 1.0 — 2026-11-14.

# Envíos, devoluciones, retracto y garantía

Se publica en **`/envios/`** (no en `/legal/envios-devoluciones/`, como en las versiones anteriores) con el rótulo «Versión 1.0 · vigente desde 2026-11-17», que es la versión y la fecha de los términos (`version_terminos`, `fecha_terminos`). En esa página van, además, las tarifas por zona y peso y la lista de municipios de cada zona, que el código lee de `data/tarifas_envio.csv` y `data/zonas_envio.csv` (el numeral 2 dice «La lista de municipios de cada zona está en esta página»). Encabezado que pide el paquete: «Envíos, devoluciones, retracto y garantía · Versión {version_terminos}, vigente desde el {fecha_terminos}» (lo construye el código; LEG-141 y LEG-142).

**Fuente.** Sección 5 (D3) de «De Santander SAS — Textos legales v1.0 para publicación» (`docs/legal/paquete-abogado/`, 14/11/2026), que el dueño presenta como cerrada con su abogado. Sustituye las versiones 1 y 2 de este archivo. La sección «Texto para el consumidor» reproduce D3 letra por letra, con el formato Markdown (`###`, `- `), **salvo los añadidos de legal para el envío gratis en comunas de Bucaramanga**, que el dueño ordenó mantener el 2026-11-14 (el paquete del abogado no lo regulaba): frases finales en §2 (zona 1), §3 (tercera y cuarta viñetas), §6 (zona 1 y fila de la zona 5) y §7 (primera viñeta); **numeral 13 nuevo** «Envío gratis en comunas de Bucaramanga» (adaptado del numeral 13 de la versión 2 del 2026-11-12); arts. 33 y 34 en «Normas citadas». Son texto propio, **no del abogado**, y deben validarse con él antes del 17/11 (LEG-167). Legal no registra aquí la aprobación formal del abogado.

**Control de `npm run datos` (LEG-106).** El numeral 13 nombra las siete comunas de `data/comunas_envio_gratis.csv`, dice «rige desde el 17 de noviembre de 2026» sin llaves, y la salvedad «La única salvedad es el envío gratis en comunas de Bucaramanga» está en D3 §3 y en D1 §6. Por eso `envio_gratis_desde` debe ser **`2026-11-17`** (igual a `fecha_terminos`), con `envio_gratis_terminada` vacía, en el mismo build que publica la versión 1.0.

**Versión.** Hasta que el desarrollador cambie `version_terminos,1.0` y `fecha_terminos,2026-11-17`, `npm run datos` falla por versión distinta. Revisión: `revisiones/2026-11-14-paquete-abogado-v1.md` (LEG-140 a LEG-166).

---

## Texto para el consumidor

### 1. Quién vende
De Santander SAS, NIT 902.121.184-8, domicilio en Bucaramanga, Santander, dirección de notificación judicial en la calle 37 n.° 23-77, apartamento 702, de Bucaramanga, correo desantander.tienda@gmail.com, WhatsApp +57 300 112 9874. Los datos completos están en «Información del vendedor».

### 2. A dónde enviamos
Despachamos desde Bucaramanga a todo Colombia. Para calcular el envío agrupamos los destinos en cinco zonas:
- Zona 1: Bucaramanga, Floridablanca, Piedecuesta y Girón. Entrega una plataforma de domicilios o un mensajero, según disponibilidad. En siete comunas de Bucaramanga el envío es gratis (numeral 13).
- Zona 2: el resto de Santander.
- Zona 3: capitales y ciudades principales.
- Zona 4: el resto del país.
- Zona 5: destinos de trayecto especial, como Amazonas, Guainía, Vaupés, Vichada, Guaviare, Putumayo, parte del Pacífico, San Andrés y la Alta Guajira.

La lista de municipios de cada zona está en esta página.

### 3. Cuánto cuesta el envío
- El envío depende de la zona y del peso del pedido (las bolsas más el empaque). Lo ves en tu carrito y en el resumen antes de enviar el pedido, y va sumado en el mensaje de WhatsApp.
- La tarifa de envío incluye el IVA del 5 % (artículo 447 del Estatuto Tributario).
- El valor que ves para las zonas 1 a 4 es el que pagas. No lo cambiamos después; si la guía nos cuesta más, la diferencia la asumimos nosotros. La única salvedad es el envío gratis en comunas de Bucaramanga: si al verificar tu dirección vemos que no está en la comuna que elegiste, te informamos el envío con la tarifa normal de la zona 1 antes de que aceptes el total (numeral 13).
- Por cotizar: no publicamos tarifa para la zona 5 ni para pedidos de más de 5 kg. En esos casos el resumen dice «Envío por cotizar» y el total no incluye el envío. Te informamos el valor por el chat y tú decides si lo aceptas antes de pagar. Si no lo aceptas, no hay compra y no pagas nada. En las siete comunas de Bucaramanga con envío gratis no se cotiza: el envío es gratis con cualquier peso (numeral 13).
- Precios y envío en pesos colombianos.

### 4. Datos que necesitamos para el envío
- Obligatorios: nombre completo, celular, departamento, municipio y dirección.
- Opcionales: correo, barrio, código postal, indicaciones para la entrega y documento de identidad.
- El código postal ayuda a ubicar tu dirección. Si no lo sabes, búscalo en el visor oficial de 4-72 (visor.codigopostal.gov.co).
- El documento solo se usa para emitir la factura electrónica a tu nombre. Puedes usar cédula de ciudadanía, cédula de extranjería, Permiso por Protección Temporal (PPT) o pasaporte.
- Revisa tus datos en el resumen antes de enviar el pedido. Si la dirección está incompleta, la entrega puede demorarse.

### 5. Pago y despacho
- Pagas por transferencia bancaria o por Bre-B, después de aceptar el total en el chat. Te damos los datos para transferir solo por el chat del WhatsApp +57 300 112 9874.
- Despachamos cuando recibimos el pago. No recibimos pagos contraentrega ni en efectivo.
- Nunca te pedimos claves ni códigos.

### 6. Plazos de entrega
Para cada zona te informamos dos plazos: el estimado, que es lo que suele tardar, y el máximo, que es el plazo que nos comprometemos a cumplir. Se cuentan desde el día hábil siguiente a aquel en que recibimos tu pago.
- Zona 1: estimado, el mismo día o el siguiente día hábil; máximo, tres (3) días hábiles. Con envío gratis en comunas de Bucaramanga, el plazo máximo es de un (1) día hábil, con cualquier peso, y se cuenta como dice el numeral 13.
- Zona 2: estimado, de 1 a 3 días hábiles; máximo, seis (6) días hábiles.
- Zona 3: estimado, de 1 a 3 días hábiles; máximo, seis (6) días hábiles.
- Zona 4: estimado, de 2 a 6 días hábiles; máximo, diez (10) días hábiles.
- Zona 5 y pedidos de más de 5 kg: estimado, de 5 a 12 días hábiles, con entrega en la oficina de la transportadora cuando no haya reparto a domicilio; el máximo se informa al cotizar y no supera treinta (30) días calendario. Esto no aplica a las siete comunas de Bucaramanga con envío gratis (numeral 13).

Si no te entregamos dentro del plazo máximo, puedes dar por terminado el contrato y te devolvemos todo lo que pagaste, sin descuentos, dentro de los quince (15) días calendario siguientes. Si un café no está disponible, te lo decimos de inmediato por WhatsApp y puedes elegir otro café, esperar o desistir sin costo.

### 7. Quién paga el envío
- El envío de tu compra lo pagas tú, por el valor que aceptaste. Si tu pedido tiene envío gratis en comunas de Bucaramanga, no pagas el envío (numeral 13).
- Si el error es nuestro (café equivocado, producto defectuoso o que no corresponde a lo ofrecido, daño en el transporte), el costo de recoger, devolver y reenviar corre por nuestra cuenta.
- Si la dirección está incompleta o es incorrecta, o no hay quien reciba, y la transportadora debe volver a intentar o devolver el paquete, el nuevo envío se te cobra por la tarifa publicada. Te lo decimos antes de volver a despachar.
- Si ejerces el retracto, el transporte de la devolución corre por tu cuenta (numeral 9).

### 8. Entrega y «reclamar en oficina»
- Revisa el paquete al recibirlo. Si llega abierto o dañado, te recomendamos avisarnos por WhatsApp el mismo día, con fotos del empaque. Esta recomendación no limita tu garantía.
- En algunos municipios la transportadora no reparte a domicilio y la guía queda en «reclamar en oficina». Te avisamos antes de despachar y te decimos en qué oficina, sin costo adicional.
- Reclama el paquete dentro del plazo que fija la transportadora y lleva tu documento de identidad. Si no lo reclamas y se devuelve, el nuevo envío se cobra aparte.
- Junto con el número de guía te informamos el nombre de la transportadora para que puedas hacer seguimiento.

### 9. Derecho de retracto
Como compraste a distancia, puedes retractarte dentro de los cinco (5) días hábiles siguientes a la entrega del pedido (artículo 47 de la Ley 1480 de 2011). Así se hace:
- Avísanos por WhatsApp o al correo de atención dentro de ese plazo. Te damos un número de radicado.
- Devuélvenos el producto en las mismas condiciones en que lo recibiste, con el empaque original sellado. Te indicamos a dónde enviarlo.
- Los costos de transporte y los demás que cause la devolución corren por tu cuenta.
- Dinos el medio por el que prefieres la devolución del dinero (cuenta o llave Bre-B).
- Te devolvemos lo pagado, sin descuentos ni retenciones, dentro de los quince (15) días calendario siguientes a tu aviso, siempre que nos devuelvas el producto en las condiciones indicadas, y por el medio que prefieras (artículo 47 de la Ley 1480 de 2011, modificado por el artículo 3 de la Ley 2439 de 2024, y artículo 5 de la Ley 2439 de 2024).

No hay retracto si el empaque fue abierto o su sello está roto, porque el café abierto, por su naturaleza, no puede devolverse (numeral 4 del artículo 47 de la Ley 1480 de 2011). El retracto no afecta tu garantía.

### 10. Si algo sale mal con tu pago
Si pagaste por transferencia o por Bre-B y fuiste víctima de fraude, la operación no fue solicitada, el producto no llegó, no corresponde a lo pedido o está defectuoso, puedes pedirnos la devolución del pago:
- Avísanos por WhatsApp o al correo dentro de los cinco (5) días hábiles siguientes a la fecha en que conociste el hecho. Dinos la fecha del pedido, qué pasó y, si lo tienes, el comprobante.
- Revisamos tu caso y, si procede, te devolvemos lo pagado dentro de los quince (15) días calendario siguientes, a la cuenta o llave que nos indiques.
- También puedes solicitar la devolución o la reversión a tu entidad financiera, según sus procedimientos.

### 11. Garantía legal
Todos nuestros cafés tienen garantía legal: deben llegar en buen estado, ser seguros y corresponder a lo que ofrecimos.
- Dura hasta la fecha de vencimiento que figura en la bolsa.
- Cómo pedirla: escríbenos por WhatsApp o al correo desantander.tienda@gmail.com con la fecha del pedido, el café, el lote que figura en la bolsa, el problema y una foto.
- Qué hacemos: según el caso, te reponemos el café o te devolvemos el dinero.
- Los costos de transporte de la garantía los asumimos nosotros.
- No cubre el deterioro por mal almacenamiento después de la entrega, como humedad, calor o una bolsa abierta por mucho tiempo.
- La atendemos nosotros, aunque el café sea de otra marca y lo fabrique otra empresa. No te enviamos al fabricante.

### 12. Quejas, reclamos y solicitudes
- Escríbenos por WhatsApp al +57 300 112 9874 o al correo desantander.tienda@gmail.com. Dinos tu nombre, la fecha del pedido y qué necesitas.
- Por el mismo canal te confirmamos que la recibimos y te damos tu número de radicado, con la fecha y la hora. Tiene esta forma: PQR-2026-001.
- Con ese número puedes preguntar en cualquier momento cómo va tu solicitud.
- Te respondemos en máximo quince (15) días hábiles desde el día siguiente a la fecha del radicado.
- Si no estás de acuerdo con la respuesta, puedes acudir a la Superintendencia de Industria y Comercio (www.sic.gov.co).

### 13. Envío gratis en comunas de Bucaramanga
El envío es gratis para los pedidos que entregamos en una dirección de estas comunas de Bucaramanga: San Francisco, Oriental, Centro, Cabecera del Llano, La Concordia, Ciudadela Real de Minas y Mutis. Estas son las condiciones:
- Dónde aplica: solo en esas siete comunas, completas, según la división en comunas de la Alcaldía de Bucaramanga. No aplica en las demás comunas ni en la zona rural de Bucaramanga, ni en Floridablanca, Piedecuesta o Girón.
- Cómo lo pides: en los datos de envío, con Bucaramanga como municipio, elige tu comuna en el campo «Comuna (opcional)». Si está en la lista, el resumen y el mensaje de WhatsApp muestran el envío en $0.
- Si no eliges tu comuna: se aplica la regla normal de la zona 1, es decir, la tarifa que ves en el resumen o, si tu pedido pesa más de 5 kg, el envío por cotizar (numeral 3).
- Quién lo verifica: antes de que aceptes el total, De Santander revisa por el chat que tu dirección esté en la comuna que elegiste. Podemos pedirte el barrio o un punto de referencia.
- Si tu dirección no está en una de esas comunas: te lo decimos por el chat antes de que aceptes el total y te informamos el envío con la tarifa normal de la zona 1, que también ves en el resumen; si tu pedido pesa más de 5 kg, te informamos el valor cotizado. Puedes aceptarlo o desistir sin costo. Si hay duda sobre la comuna de tu dirección, aplicamos el envío gratis.
- Peso: aplica con cualquier peso. En estas comunas, los pedidos de más de 5 kg también tienen envío gratis y no se cotizan.
- Pedido mínimo: no hay.
- Quién paga el envío: lo asumimos nosotros. No le pagas nada por el envío a la plataforma de domicilios ni al mensajero.
- Precio de los cafés: es el mismo en todo el país e incluye todos los impuestos. El envío gratis no cambia el precio de los cafés.
- Plazo de entrega: máximo un (1) día hábil, con cualquier peso; lo normal es el mismo día o el siguiente día hábil. Se cuenta desde que validamos tu pago por transferencia bancaria o por Bre-B y te damos por el chat el aprobado de tu pedido. Validamos los pagos en nuestro horario de atención: de lunes a viernes, de 7:00 a. m. a 5:00 p. m., hora de Colombia, sin contar festivos. Si tu pago llega dentro de ese horario, lo validamos ese mismo día. Si llega después de las 5:00 p. m., antes de las 7:00 a. m., un sábado, un domingo o un festivo, lo validamos el siguiente día de atención, antes de las 5:00 p. m. Para estos pedidos, este plazo se aplica en lugar del de la zona 1 del numeral 6.
- Si no te entregamos en ese plazo: puedes dar por terminado el contrato y te devolvemos todo lo que pagaste, como dice el numeral 6.
- Si te retractas: te devolvemos todo lo que pagaste, sin descontar el envío gratis. Como en todo retracto, el transporte de la devolución corre por tu cuenta (numeral 9).
- Garantía: si el café llega con un problema cubierto por la garantía, el transporte de la devolución y del reenvío lo pagamos nosotros (numeral 11).
- Nuevo intento de entrega: si hay que volver a llevar el pedido porque la dirección estaba incompleta o no había quien recibiera, el nuevo intento se cobra por la tarifa normal de la zona 1 o, si el pedido pesa más de 5 kg, por el valor que te cotizamos, y te lo decimos antes de volver a despachar (numeral 7).
- Vigencia: rige desde el 17 de noviembre de 2026. No tiene fecha de terminación: sigue vigente hasta que publiquemos en este sitio que terminó, en los mismos lugares en que la anunciamos. Si termina, respetamos el envío gratis de todo pedido cuyo mensaje de WhatsApp ya lo indicaba, aunque lo entreguemos después.

Normas citadas: Ley 1480 de 2011, arts. 7, 8, 10, 11, 16, 33, 34, 47 (num. 4) y 50; Ley 2439 de 2024, arts. 3, 4 y 5; Estatuto Tributario, art. 447.

---

## Notas para el abogado

Estas notas no se publican. Análisis completo en `revisiones/2026-11-14-paquete-abogado-v1.md`.

- **Envío gratis por comunas (LEG-140 y LEG-167; validar con el abogado).** El paquete no lo regulaba y §3 («El valor que ves para las zonas 1 a 4 es el que pagas. No lo cambiamos después») y D1 §6 impedían su regla (cobrar la tarifa de zona 1 si la dirección no está en la comuna). El dueño ordenó mantenerlo: se añadieron las salvedades al final de las frases del abogado, sin cambiarlas, y el numeral 13. Adaptaciones frente al numeral 13 de la versión 2: pago «por transferencia bancaria o por Bre-B»; «la plataforma de domicilios ni el mensajero» (D3 §2); remisión a los numerales 3, 6, 7, 9 y 11 de la versión 1.0; nueva viñeta «Si no te entregamos en ese plazo» con la consecuencia de D3 §6; frase «Para estos pedidos, este plazo se aplica en lugar del de la zona 1 del numeral 6» (el máximo de la promoción, 1 día hábil desde la validación, es siempre más favorable que 3 días hábiles desde el día hábil siguiente al pago); vigencia desde el 17 de noviembre de 2026. Siguen pendientes D-19 (el mensajero cumple 1 día hábil con cualquier peso), D-22 (fuente oficial de la división en comunas que cita el numeral), D-23 (facturación del envío gratis) y la confirmación de los festivos.
- **«Normas citadas» dentro del numeral 13.** El control y la sección de `/envios/` toman el numeral 13 «hasta el siguiente título»; como «Normas citadas» es un párrafo final sin título, quedaría dentro del numeral. Con D3 publicado completo en `/envios/` (LEG-141), el desarrollador debe cortar el numeral antes del párrafo que empieza por «Normas citadas» o no repetir el numeral en otra sección (LEG-167).
- **Plazos (LEG-143).** Fuera del envío gratis, los máximos suben a 3, 6, 6 y 10 días hábiles y se cuentan desde el día hábil siguiente al pago. `data/plazos_envio.csv` y los textos del resumen y de `/envios/` deben cambiar. El margen frente al estimado resuelve la observación de LEG-087; falta la confirmación de la transportadora y del mensajero (D-19).
- **§2, zona 1.** «Plataforma de domicilios o mensajero, según disponibilidad»: coherente con D2 §7. `data/zonas_envio.csv` menciona DiDi y Uber Courier; D2 no los nombra porque los describe en forma genérica (LEG-157).
- **§10.** Compromiso voluntario de devolución para transferencia y Bre-B; el paquete reconoce (8.4) que la reversión del art. 51 de la Ley 1480 no opera de forma automática en Bre-B. Obliga por el art. 29.
