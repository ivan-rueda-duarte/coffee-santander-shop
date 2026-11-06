> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.5 — 2026-11-05.

# Envíos, devoluciones, retracto y garantía

Se publica en `/legal/envios-devoluciones/`. Las tarifas y las zonas **no se copian aquí**: viven en `data/tarifas_envio.csv` y `data/zonas_envio.csv`, se explican en `docs/ENVIOS.md` y la página `/envios/` las muestra leídas de esos CSV. Así este texto no queda desactualizado cuando cambien.

Convención: `[TODO(dato): …]` es un dato del cliente; no se publica como marcador. `[DECISIÓN n]` remite a la sección «Preguntas para el dueño» de `checklist-lanzamiento.md`. `VERIFICAR` marca lo que no se pudo cotejar en fuente oficial. Los comentarios `<!-- -->` son para el abogado y no se publican. La página legal solo muestra subtítulos, párrafos y listas: la tabla de plazos se publica como lista.

Cambios de la v0.5 (decisiones del dueño del 2026-11-05, revisión LEG-063 a LEG-068): se aplican **P1 = B** (plazo estimado y plazo máximo por zona; los máximos siguen como propuesta de legal hasta que el dueño los confirme con la transportadora), **P2 = C** (el café no admite retracto; la garantía legal queda intacta) y **P3 = a** (radicado manual `PQR-AAAA-NNN` por el chat o el correo, respuesta en máximo 15 días hábiles). Se retiran las alternativas descartadas (1 A, retracto A y B, PQR b y c). Siguen abiertas las decisiones 4, 5 y 7.

---

## Texto para el consumidor

### 1. Quién vende
De Santander SAS, NIT 902121184[-TODO(dato): dígito de verificación], domicilio [TODO(dato): dirección de notificación judicial y municipio], correo desantander.tienda@gmail.com, WhatsApp +57 300 112 9874. Los datos completos están en «Información del vendedor».

### 2. A dónde enviamos
Despachamos desde Bucaramanga a todo Colombia. Para calcular el envío agrupamos los destinos en cinco zonas:
- **Zona 1:** Bucaramanga, Floridablanca, Piedecuesta y Girón. La entrega la hace un mensajero.
- **Zona 2:** el resto de Santander.
- **Zona 3:** capitales y ciudades principales.
- **Zona 4:** el resto del país.
- **Zona 5:** destinos de trayecto especial, como Amazonas, Guainía, Vaupés, Vichada, Guaviare, Putumayo, parte del Pacífico, San Andrés y la Alta Guajira.

La lista de cada zona está en la página de envíos (/envios/).

### 3. Cuánto cuesta el envío
- El envío depende de la **zona** y del **peso del pedido**: las bolsas más el empaque. Lo ves en tu carrito y en el resumen antes de enviar el pedido, y va sumado en el mensaje de WhatsApp. Las tarifas están en la página de envíos.
- **El valor que ves para las zonas 1 a 4 es el que pagas.** No lo cambiamos después. [DECISIÓN 5 c)]
- **Por cotizar.** No publicamos tarifa para la zona 5 ni para pedidos de más de 5 kg. En esos casos el resumen dice «Envío por cotizar» y el total es **sin envío**. Te informamos el valor por el chat y **tú decides si lo aceptas antes de pagar**. Si no lo aceptas, no hay compra y no pagas nada.
- Precios y envío en pesos colombianos.

<!-- IVA: según el dueño, el café no tiene IVA. Falta la confirmación escrita del contador sobre el café en grano y molido, el flete y el mensajero, y la facturación (LEG-029). No escribir «IVA incluido» ni «sin IVA». -->

### 4. Datos que necesitamos para el envío
- **Obligatorios:** nombre completo, celular, departamento, municipio, dirección y forma de pago.
- **Opcionales:** correo, barrio, código postal, indicaciones para la entrega y documento de identidad.
- El **código postal** ayuda a la transportadora a ubicar tu dirección. Si no lo sabes, puedes buscarlo en el visor oficial de 4-72 (visor.codigopostal.gov.co). No lo llenamos por ti porque un mismo municipio tiene varios códigos.
- El **documento** solo se usa para la factura electrónica a tu nombre, si la quieres. Puedes usar cédula de ciudadanía, cédula de extranjería, Permiso por Protección Temporal (PPT) o pasaporte.
- Revisa tus datos en el resumen antes de enviar el pedido. Si la dirección está incompleta, la entrega puede demorarse.

<!-- LEG-040 a LEG-048. Documento opcional: decisión vigente en el código (DOCUMENTO_OBLIGATORIO = false). Si el agregador o el contador acreditan por escrito una necesidad general, el documento pasa a obligatorio y este numeral cambia: «Lo pide la transportadora para generar la guía» o «Lo necesitamos para la factura electrónica». -->

### 5. Pago y despacho
- **Transferencia Bre-B:** después de confirmar el pedido te damos los datos para transferir por el chat. Despachamos cuando recibimos el pago.
- **Efectivo contraentrega:** pagas al recibir el pedido, a quien lo entrega. Ten el dinero listo, de preferencia el valor exacto. [TODO(dato): comisión de recaudo del agregador; DECISIÓN 7. Si existe y no está incluida en la tarifa, se informa aquí y en el resumen antes de enviar el pedido.]
- Solo te damos los datos de pago por el chat del WhatsApp +57 300 112 9874. Nunca te pedimos claves ni códigos.

### 6. Plazos de entrega
Para cada zona te decimos dos plazos: el **estimado**, que es lo que suele tardar, y el **máximo**, que es el plazo que nos comprometemos a cumplir. Los dos se cuentan en días hábiles desde que confirmamos tu pedido por el chat y, si pagas por transferencia, desde que recibimos el pago. Los ves también en el resumen de tu pedido, antes de enviarlo, y en la página de envíos (/envios/).

- Zona 1: estimado, mismo día o siguiente día hábil; máximo [TODO(dato): confirmar con la transportadora; propuesta de legal: 3] días hábiles.
- Zonas 2 y 3: estimado, 1 a 3 días hábiles; máximo [TODO(dato): confirmar con la transportadora; propuesta de legal: 6] días hábiles.
- Zona 4: estimado, 2 a 6 días hábiles; máximo [TODO(dato): confirmar con la transportadora; propuesta de legal: 10] días hábiles.
- Zona 5: estimado, 5 a 12 días hábiles, con entrega en la oficina de la transportadora; máximo [TODO(dato): confirmar con la transportadora; propuesta de legal: 20] días hábiles.

Si no te entregamos en el plazo máximo, puedes terminar el contrato y te devolvemos todo lo que pagaste, sin descuentos, en máximo 15 días calendario. Si un café no está disponible, te lo decimos de inmediato por WhatsApp y puedes elegir otra fecha, otro café o cancelar sin costo.

<!-- DECISIÓN 1 = B (dueño, 2026-11-05). Art. 50 lit. h) Ley 1480, modificado por la Ley 2439 de 2024, art. 4 (leído en el Diario Oficial 52.975): plazo aceptado por el consumidor, informado antes de finalizar la transacción; sin plazo, máximo 30 días calendario desde el día siguiente al pedido. Los cuatro máximos (3, 6, 10 y 20) son la propuesta de legal (estimado superior × 1,5 aprox.); el dueño los acepta en principio pero debe confirmarlos con la transportadora o el agregador (pregunta A4) antes de publicarlos. Hasta entonces, el numeral no se publica con números y el resumen no muestra «Máximo … días hábiles» (LEG-063). Un máximo publicado obliga (art. 29: lo anunciado obliga); si la transportadora no lo garantiza, conviene subirlo antes de publicar y no después. -->

### 7. Quién paga el envío
- **El envío de tu compra lo pagas tú**, por el valor que viste antes de confirmar.
- **Si el error es nuestro** (café equivocado, producto defectuoso o que no corresponde a lo ofrecido, daño en el transporte), el costo de recoger, devolver y reenviar corre por nuestra cuenta.
- **Si la dirección está incompleta o es incorrecta, o no hay quien reciba,** y la transportadora debe volver a intentar o devolver el paquete, el nuevo envío se cobra a ti, por la tarifa publicada. [DECISIÓN 5 a)]
- **Si el café llega con un problema cubierto por la garantía,** el transporte de la devolución y del reenvío lo pagamos nosotros (numeral 11).

### 8. Entrega y «reclamar en oficina»
- Revisa el paquete al recibirlo. Si llega abierto o dañado, avísanos por WhatsApp ese mismo día, con una foto. Si puedes, déjalo anotado a quien entrega.
- En algunos municipios la transportadora no reparte a domicilio y la guía queda en «reclamar en oficina». Te avisamos antes de despachar y te decimos en qué oficina. Esto no tiene costo adicional. [DECISIÓN 5 b)]
- Reclama el paquete dentro del plazo que fija la transportadora. Si no lo reclamas y se devuelve, el nuevo envío se cobra aparte.
- Lleva tu documento de identidad para reclamarlo.

### 9. Derecho de retracto
El café es un alimento. Por eso, según la ley, no aplica el derecho de retracto de las compras a distancia: una vez tu compra queda en firme, no puedes devolver el café solo por cambiar de opinión.

Esto no afecta tu garantía. Si el café llega dañado, vencido o equivocado, o no es lo que pediste, te respondemos según el numeral 11, sin costo para ti.

Te lo decimos también en el resumen de tu pedido, antes de que lo envíes, y en los términos y condiciones.

<!-- DECISIÓN 2 = C (dueño, 2026-11-05; LEG-064). Fundamento: art. 47 Ley 1480, según la transcripción del Concepto SIC 16-062808 del 18 de abril de 2016 (copia de Actualícese; VERIFICAR contra SUIN y sic.gov.co): se exceptúan del retracto, entre otros, los «bienes que, por su naturaleza, no puedan ser devueltos o puedan deteriorarse o caducar con rapidez» (num. 4) y los «bienes perecederos» (num. 6). En ese concepto, la Oficina Asesora Jurídica de la SIC interpreta la excepción de forma restrictiva, pero concluye que «sobre los bienes o productos tales como los alimentos, no procede el derecho de retracto», también en las ventas a distancia, y que la fecha de vencimiento no cambia la conclusión. El concepto no es vinculante (CPACA, art. 28) y es de 2016: VERIFICAR si hay doctrina posterior de la SIC o decisiones jurisdiccionales en sentido contrario (pregunta L2 al abogado).

Riesgo residual: que una autoridad considere que el café tostado en bolsa sellada, con meses de vida útil, no es «perecedero». El argumento de la SIC no depende de la vida útil, sino de que es un alimento; además, un café devuelto plantea un problema de inocuidad para revenderlo. Las alternativas A (retracto para toda bolsa sellada) y B (solo grano) quedaron descartadas por el dueño; su texto está en la v0.4 de este documento, por si el abogado quisiera reabrirlas.

Deber de información: el art. 50 lit. c) de la Ley 1480 obliga a informar en el medio electrónico «el derecho de retracto que le asiste al consumidor y el procedimiento para ejercerlo» (VERIFICAR la letra; fuente oficial no accesible en esta sesión). Cuando el retracto no procede, el deber se cumple informando su exclusión y la razón, antes de la compra: en este numeral, en los términos §9 y en una línea del resumen antes de las casillas (microcopy §5.3). No se publica en la ficha porque no es un dato del producto sino de la modalidad de venta; se recomienda, no se exige, una mención en «Cómo pedir». -->

### 10. Reversión del pago
[DECISIÓN 4. Se publica una de estas opciones.]

**Opción 4 A (recomendada): compromiso propio, sin afirmar el alcance legal.**
> Si pagaste por transferencia Bre-B y hubo un fraude, no pediste la compra, no recibiste el producto o llegó distinto o defectuoso, avísanos dentro de los 5 días hábiles siguientes a que te enteres. Revisamos tu caso y, si procede, te devolvemos el dinero en máximo 15 días calendario. También puedes acudir a tu banco.

**Opción 4 B: no publicar este numeral** hasta que el abogado confirme si la reversión del art. 51 aplica a Bre-B.

En efectivo contraentrega no hay reversión del pago, porque no hay un medio de pago electrónico. Si el producto llega defectuoso o equivocado, aplica la garantía (numeral 11).

<!-- Art. 51 Ley 1480 y Decreto 587 de 2016 (compilado en el Decreto 1074 de 2015): la reversión procede en ventas por comercio electrónico pagadas con tarjeta de crédito, débito o «cualquier otro instrumento de pago electrónico», y se tramita con el emisor del instrumento. Bre-B es una transferencia inmediata que inicia el propio cliente desde su banco, después de cerrar la venta por el chat. No consta que los participantes del sistema Bre-B tengan un procedimiento de reversión. VERIFICAR: (a) texto vigente del art. 51 y del Decreto 587; (b) si Bre-B es un «instrumento de pago electrónico» a estos efectos; (c) el proyecto de decreto del MinComercio sobre reversión (2025-2026), que no está vigente. La opción 4 A no afirma un derecho legal que puede no existir y da al cliente un remedio equivalente a cargo de la tienda. -->

### 11. Garantía legal
Todos nuestros cafés tienen garantía legal: deben llegar en buen estado, ser seguros y corresponder a lo que ofrecimos.
- **Dura hasta la fecha de vencimiento** que figura en la bolsa. <!-- Art. 8 Ley 1480: para los perecederos, la garantía va hasta la fecha de vencimiento. VERIFICAR. -->
- **Cómo pedirla:** escríbenos por WhatsApp o al correo desantander.tienda@gmail.com. Indica la fecha del pedido, el café, el lote que figura en la bolsa, el problema y una foto.
- **Qué hacemos:** según el caso, te reponemos el café o te devolvemos el dinero. <!-- Art. 11 Ley 1480: VERIFICAR el orden de reparación, cambio y devolución; en alimentos la reparación no aplica. -->
- **Los costos de transporte** de la garantía los asumimos nosotros. <!-- Art. 11 Ley 1480, VERIFICAR. -->
- **No cubre** el deterioro por mal almacenamiento después de la entrega, como humedad, calor o una bolsa abierta mucho tiempo. <!-- Art. 16 Ley 1480 (causales de exoneración), VERIFICAR. -->
- **La atendemos nosotros,** aunque el café lo tueste y empaque otra empresa. No te enviamos al fabricante. <!-- Art. 10 Ley 1480: productor y proveedor responden solidariamente. -->

### 12. Quejas, reclamos y solicitudes
- Escríbenos por WhatsApp al +57 300 112 9874 o al correo desantander.tienda@gmail.com. Di tu nombre, la fecha del pedido y qué necesitas.
- Por el mismo canal te confirmamos que la recibimos y te damos tu **número de radicado**, con la fecha y la hora. Tiene esta forma: PQR-2026-001.
- Con ese número puedes preguntar en cualquier momento cómo va tu solicitud.
- Te respondemos en máximo **15 días hábiles** desde el día siguiente a la fecha del radicado.
- Si no estás de acuerdo con la respuesta, puedes acudir a la Superintendencia de Industria y Comercio (www.sic.gov.co).

<!-- DECISIÓN 3 = a (dueño, 2026-11-05; LEG-065). Art. 50 lit. g) Ley 1480 (Ley 2439 de 2024): mecanismo de PQR con constancia de radicado, fecha y hora, y seguimiento. El radicado se asigna a mano: la tienda lleva un consecutivo anual en un registro privado (hoja de cálculo), con número, fecha y hora de recepción, canal, nombre del cliente, pedido, resumen de la solicitud, fecha límite y fecha de respuesta. Plantilla de la respuesta de recepción y del registro en microcopy §5.7. El plazo de 15 días hábiles es una política de la tienda; la Ley 1480 condiciona la demanda ante la SIC a una reclamación directa previa (art. 58 num. 5, VERIFICAR la letra y el plazo de 15 días hábiles que suele citarse). Quién responde (nombre o cargo): [TODO(dato): no se publica; se anota en el registro interno y en la política de datos §1 (D-3)]. Las consultas y reclamos sobre datos personales (política §9 y §10) usan el mismo consecutivo, pero con sus plazos legales (10 + 5 y 15 + 8 días hábiles). -->

---

## Notas para el abogado

### A. Normas citadas y estado de verificación

| Norma | Qué se usa | Estado |
|---|---|---|
| Ley 2439 de 2024 (Diario Oficial 52.975, 19 dic 2024), arts. 3 y 4 | Devolución del dinero en 15 días calendario (art. 47); literales b), g) y h) del art. 50 | Leído en el Diario Oficial. Los lits. b), g) y h) rigen desde abril de 2025. |
| Ley 1480 de 2011, art. 47 | Retracto: 5 días hábiles; excepciones nums. 4 y 6; costos de la devolución a cargo del consumidor | Texto leído en la transcripción del Concepto SIC 16-062808 de 2016. VERIFICAR contra SUIN. |
| Concepto SIC 16-062808-00001-0000, 18 abr 2016 | «Sobre los bienes o productos tales como los alimentos, no procede el derecho de retracto» | Leído en la copia publicada por Actualícese (cdn.actualicese.com). VERIFICAR en sic.gov.co y si hay doctrina posterior. No vinculante. |
| Sentencia C-192 de 2026 | Según un buscador, el plazo de 15 días aplica a todas las modalidades del art. 47 | VERIFICAR; no cambia el texto. |
| Ley 1480, art. 50 lit. c) | Precio total con impuestos; envío por separado; informar el derecho de retracto y su procedimiento (o su exclusión) | VERIFICAR la letra consolidada. Secretaría del Senado, SUIN y Función Pública no respondieron en esta sesión. |
| Ley 1480, art. 51; Decreto 587 de 2016 | Reversión del pago | VERIFICAR el texto vigente y su aplicación a Bre-B. |
| Ley 1480, arts. 7, 8, 10, 11, 16 | Garantía, término, solidaridad, alcance, exoneración | VERIFICAR (art. 10 leído en la transcripción de Colombia Compra Eficiente). |
| Ley 1480, art. 58 num. 5 | Reclamación directa previa | VERIFICAR. |

### B. Decisiones del cliente
Están formuladas como preguntas cerradas en `checklist-lanzamiento.md`, sección «Preguntas para el dueño».

| Decisión | Estado al 2026-11-05 | Efecto en este documento |
|---|---|---|
| 1 (plazo de entrega) | **B**, decidida. Los máximos (3, 6, 10 y 20 días hábiles) son propuesta de legal, pendientes de confirmar con la transportadora. | Numeral 6 con una sola redacción; números como TODO(dato) hasta la confirmación. |
| 2 (retracto) | **C**, decidida. | Numeral 9 con una sola redacción. Las alternativas A y B se retiraron (texto en la v0.4). |
| 3 (PQR) | **a**, decidida: radicado manual `PQR-AAAA-NNN`, 15 días hábiles. | Numeral 12. Quién responde: TODO(dato), no se publica. |
| 4 (reversión Bre-B) | Abierta. | Numeral 10 conserva las opciones 4 A y 4 B. |
| 5 a), b), c) (costos operativos) | Abierta. | Numerales 3, 7 y 8 marcados [DECISIÓN 5]. 5 d) ya no aplica (sin retracto). |
| 7 (comisión de contraentrega) | Abierta. | Numeral 5, TODO(dato). |

### C. Coherencia con otros documentos y con el sitio
- Términos y condiciones §6: el contrato se perfecciona cuando el cliente acepta por el chat el total confirmado; en «por cotizar», la aceptación del envío es previa al pago. Términos §8 (plazo), §9 (sin retracto) y §12 (PQR) repiten en corto lo que dicen aquí los numerales 6, 9 y 12.
- Política de datos §3 y §6: ya no mencionan el retracto; el registro de PQR figura como base de datos de la tienda, con el radicado como dato.
- Resumen del pedido: línea de retracto (microcopy §5.3) y plazo por zona (microcopy §5.6), antes de las casillas. Hoy no existen en el código (D4 y D5).
- `/envios/` (`src/app/envios/page.tsx`): hoy publica «Plazos orientativos… no una fecha de entrega». Con la decisión 1 B debe mostrar estimado y máximo por zona leídos de un CSV, con el título y la frase de microcopy §5.8, cuando los máximos estén confirmados (LEG-063).
