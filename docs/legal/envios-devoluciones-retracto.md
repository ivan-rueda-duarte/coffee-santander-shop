> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.2 — 2026-11-05.

# Envíos, devoluciones, retracto y garantía

Se publica en `/legal/envios-devoluciones/`. Las tarifas y las zonas **no se copian aquí**: viven en `data/tarifas_envio.csv` y `data/zonas_envio.csv` y se explican en `docs/ENVIOS.md`. La página pública de tarifas (`/envios/`) las lee de esos CSV, así este texto no queda desactualizado cuando cambien.

Convención: `[TODO(dato): …]` es un dato que debe dar el cliente. `[DECISIÓN n]` remite a las alternativas del final. `VERIFICAR` marca lo que no se pudo comprobar en fuente oficial. Los comentarios entre `<!-- -->` son para el abogado y no se publican.

---

## Texto para el consumidor

### 1. Quién vende
De Santander S.A.S., NIT [TODO(dato): NIT], domicilio [TODO(dato): domicilio], correo [TODO(dato): correo de contacto], WhatsApp +57 300 112 9874. Datos completos en «Información del vendedor».

### 2. Cobertura
Despachamos desde Bucaramanga a todo Colombia. Para calcular el envío agrupamos los destinos en cinco zonas:

- **Zona 1:** Bucaramanga, Floridablanca, Piedecuesta y Girón. Va por mensajero.
- **Zona 2:** el resto de Santander.
- **Zona 3:** capitales y ciudades principales (lista en la página de envíos).
- **Zona 4:** el resto del país con cobertura normal.
- **Zona 5:** destinos de trayecto especial (por ejemplo, Amazonas, Guainía, Vaupés, Vichada, Guaviare, Putumayo, buena parte del Pacífico y la Alta Guajira). La lista completa está en la página de envíos.

<!-- La lista de municipios por zona vive en zonas_envio.csv; la página /envios/ debe mostrarla. Si un destino no figura, se aplica la zona 4 (docs/ENVIOS.md §2). -->

### 3. Cuánto cuesta el envío
- El valor del envío depende de la **zona** y del **peso del pedido** (las bolsas más el empaque). Lo ves en tu carrito y en el resumen antes de enviar el pedido, y va sumado en el mensaje de WhatsApp. Las tarifas vigentes están en la página de envíos, con su fecha de vigencia.
- **Por cotizar.** No publicamos tarifa para la zona 5 ni para pedidos de más de 5 kg. En esos casos el carrito te lo dice: «Envío por cotizar · te confirmamos el valor por WhatsApp antes de que pagues». El total que ves entonces es **sin envío**. Te informamos el valor por el chat y **tú decides si lo aceptas antes de pagar**. No cobramos primero para ajustar después.
- El valor que ves en el carrito para las zonas 1 a 4 es el que pagas; no lo ajustamos después de que lo confirmas. <!-- Regla de ENVIOS.md §4. Confirmar con el cliente que la tienda asume cualquier diferencia entre la tarifa publicada y la guía real. [DECISIÓN 4] -->
- Los precios y el envío están en pesos colombianos. <!-- IVA (versión 0.2): según el dueño, el café no tiene IVA. Falta la confirmación del contador sobre el café en grano y el molido, el flete y el mensajero, y la facturación (LEG-029). No escribir «IVA incluido» ni «sin IVA». Si el contador confirma, se puede publicar como precio final; si concluye otra cosa, el precio y el envío publicados deben incluir el impuesto. [TODO(dato): confirmación del contador] -->

### 4. Plazos de entrega
Los plazos se cuentan desde que confirmamos tu pedido y el pago por WhatsApp, en días hábiles. Son orientativos y varían según la transportadora:

| Zona | Plazo orientativo |
|---|---|
| 1 | Mismo día o siguiente día hábil |
| 2 y 3 | 1 a 3 días hábiles |
| 4 | 2 a 6 días hábiles |
| 5 | 5 a 12 días hábiles; la entrega suele ser en la oficina de la transportadora |

<!-- Fuente: ENVIOS.md §6, aún sin confirmar con el agregador (TODO(dato) de ENVIOS.md §7). OBSERVACIÓN LEGAL: art. 50 lit. h) de la Ley 1480 (modificado por la Ley 2439 de 2024) exige entregar dentro del plazo aceptado por el consumidor, informado ANTES de finalizar la transacción; si no se fija plazo, se entiende que es máximo de 30 días calendario desde el día siguiente al pedido. «Orientativo» no basta: el plazo que se informe antes del pedido es el que obliga. Ver DECISIÓN 1. -->

**Plazo máximo.** [TODO(dato): plazo máximo de entrega que De Santander asume, p. ej., por zona.] Si no lo hemos entregado en ese plazo, o en 30 días calendario si no se acordó otro, puedes terminar el contrato y te devolvemos todo lo que pagaste, sin descuentos, en máximo 15 días calendario. <!-- Art. 50 lit. h), Ley 2439/2024 art. 4. Verificado en el Diario Oficial 52.975. -->

Si un producto no está disponible, te lo decimos de inmediato por WhatsApp y puedes elegir otra fecha de entrega, otro café o cancelar. <!-- Art. 50 lit. h). -->

### 5. Quién paga el envío
- **El envío de tu compra lo pagas tú**, por el valor que viste antes de confirmar.
- **Si el error es nuestro** (café equivocado, producto defectuoso o que no corresponde a lo ofrecido, daño en el transporte), el costo de recoger, devolver y reenviar corre por nuestra cuenta.
- **Si la dirección está incompleta o es incorrecta, o no hay quien reciba** y la transportadora debe volver a intentar, el nuevo intento se cobra al cliente. [DECISIÓN 4]
- **Si ejerces el retracto**, ver numeral 8.

### 6. Entrega y «reclamar en oficina»
- Revisa el paquete al recibirlo. Si llega abierto o dañado, avísanos por WhatsApp el mismo día, con una foto.
- En algunos municipios la transportadora no reparte a domicilio y la guía queda en «reclamar en oficina». Te avisamos antes de despachar y te decimos en qué oficina. No tiene costo adicional por ese motivo. [DECISIÓN 4] Debes reclamar el paquete dentro del plazo que fija la transportadora. Si no lo reclamas, el paquete puede devolverse y el nuevo envío se cobra aparte.
- Lleva tu cédula para reclamar el paquete.

### 7. Garantía legal
Si el café llega con un defecto de calidad o idoneidad, no corresponde a lo que ofrecimos o no es seguro, tienes derecho a la garantía legal.

- Escríbenos por WhatsApp o al correo [TODO(dato): correo] dentro de un tiempo razonable e indícanos el pedido, el café, el lote que figura en la bolsa y una foto.
- Podemos reponer el producto, devolverte el dinero o, si procede, repararlo. Escoges tú entre reponer o devolver el dinero cuando el defecto sea de calidad, según la Ley 1480. VERIFICAR el art. 11 y la regla de los perecederos.
- Los gastos de transporte que genere la garantía los asumimos nosotros. VERIFICAR (art. 11, Ley 1480).
- La garantía no cubre el deterioro por mal almacenamiento o por uso indebido del producto. <!-- Art. 16 Ley 1480 (exoneración del productor/proveedor): VERIFICAR. -->
- Atendemos la garantía nosotros, aunque el café lo tueste y empaque otra empresa. <!-- Versión 0.2. De Santander comercializa y no tuesta. Por el art. 10 de la Ley 1480, productor (tostador) y proveedor responden solidariamente por la garantía. No se puede remitir al consumidor al tostador. VERIFICAR con SUIN. -->

Responderemos tu reclamo en [TODO(dato): plazo de respuesta de PQR]. Además del chat, puedes presentar tu queja ante la Superintendencia de Industria y Comercio (www.sic.gov.co).

### 8. Derecho de retracto
Si compras a distancia, puedes **arrepentirte de la compra** y devolver el producto dentro de **5 días hábiles** contados desde que lo recibes, sin dar explicaciones.

Condiciones (art. 47, Ley 1480 de 2011):
- Avísanos por escrito (WhatsApp o correo) dentro de los 5 días hábiles.
- El producto debe devolverse **en el mismo estado en que se entregó**, sin uso, sellado y con su empaque original. [DECISIÓN 2]
- **Los costos de transporte de la devolución los asumes tú.** El art. 47 así lo dispone; VERIFICAR el texto exacto sobre quién asume también el flete de ida. [DECISIÓN 3]
- Te **devolvemos el dinero en máximo 15 días calendario**, contados desde que ejerces el derecho y nos entregas los datos y el producto, por el mismo medio de pago o por el que acordemos. Tendrás que darnos los datos necesarios para hacer la devolución (por ejemplo, el número de tu cuenta o llave Bre-B). <!-- Ley 2439 de 2024 art. 3, que modificó el inciso final del art. 47. El plazo anterior era 30 días calendario. -->

**Excepciones.** El derecho de retracto no aplica a ciertos bienes, entre ellos los perecederos y los que, por su naturaleza, no pueden devolverse o se deterioran con rapidez.

<!-- DECISIÓN 2 — Café tostado y retracto. La excepción de «bienes perecederos / que se deterioran con rapidez» del art. 47 admite dos lecturas. El café tostado en bolsa sellada, con vencimiento de varios meses, difícilmente es perecedero en sentido estricto; el café molido o la bolsa abierta sí pierden aroma con rapidez y no pueden revenderse. La SIC ha interpretado las excepciones de forma restrictiva (VERIFICAR el concepto aplicable). No está resuelto: elige el cliente. Redacciones alternativas para el numeral 8 (reemplazan la frase «Excepciones»):

ALTERNATIVA A (ofrecer retracto en todos los casos, la más segura jurídicamente):
«Aceptamos el retracto de cualquier café, en grano o molido, siempre que la bolsa esté sellada y sin abrir.»

ALTERNATIVA B (excluir el molido y las bolsas abiertas):
«El retracto no aplica al café molido ni a las bolsas abiertas, porque son productos que pierden sus propiedades con rapidez y no pueden volver a venderse. Sí aplica al café en grano en bolsa sellada.»
Riesgo: si la SIC considera que el café molido no es perecedero, la exclusión sería ineficaz y podría verse como cláusula abusiva (arts. 42–43 Ley 1480). Se debe informar antes de comprar, en la ficha del café y en el resumen.

ALTERNATIVA C (excluir todo el café por perecedero):
«El café es un alimento perecedero; por eso no aplica el derecho de retracto.»
Riesgo: el más alto; no recomendado sin concepto de la SIC. -->

**Cómo ejercerlo:**
1. Escríbenos por WhatsApp [o a TODO(dato): correo] diciendo que te retractas, con el número o la fecha de tu pedido.
2. Te indicamos cómo devolver el producto.
3. Devuelve el producto. Cuando lo recibamos, empezamos a contar el plazo de devolución del dinero.

### 9. Reversión del pago
Si pagaste con un medio electrónico y hubo fraude, no pediste la compra, no recibiste el producto o llegó distinto, defectuoso o no es lo que pediste, puedes pedir la reversión del pago a tu entidad financiera dentro de los 5 días hábiles siguientes a que te enteres. <!-- Art. 51 Ley 1480 y Decreto 587 de 2016. VERIFICAR: (a) texto vigente; (b) si una transferencia Bre-B calificaría como «pago por mecanismo electrónico» sujeto a reversión; (c) no aplica a contraentrega en efectivo. Esta sección solo se publica si el abogado confirma que aplica a Bre-B. -->

### 10. Atención de quejas y reclamos
Por WhatsApp +57 300 112 9874 y [TODO(dato): correo]. Radicamos tu reclamo con número, fecha y hora, y puedes pedir su estado. [TODO(dato): cómo se genera el radicado; ver LEG-001, observación sobre art. 50 lit. g.]

---

## Notas para el abogado

### A. Normas citadas y estado de verificación

| Norma | Qué se usa | Estado |
|---|---|---|
| Ley 2439 de 2024 (Diario Oficial 52.975, 19 dic 2024), arts. 3 y 4 | Devolución del dinero ≤ 15 días calendario (art. 47, inciso final y parágrafo 1); nuevos literales b), g) y h) del art. 50 (información, canal y radicado de PQR, plazo de entrega, 30 días por defecto) | Texto leído en el Diario Oficial. Vigente desde su publicación; los literales b), g) y h) del art. 50 rigen desde 4 meses después (abril de 2025). |
| Ley 1480 de 2011, art. 47 (retracto: 5 días hábiles, devolución del bien, excepciones) | Plazos y excepciones | Plazo de 5 días hábiles y existencia de excepciones por perecederos: confirmado por fuentes secundarias. VERIFICAR el texto consolidado exacto de las excepciones y de la regla sobre costos de transporte (Función Pública y SUIN no accesibles desde esta sesión). |
| Sentencia C-192 de 2026 (Corte Constitucional) | Según un resultado de búsqueda, declaró exequible la expresión «En los casos de comercio electrónico» del art. 47, entendiendo que el plazo de 15 días aplica a todas las modalidades de contratación del art. 47 | VERIFICAR: la página de la fuente no estuvo accesible; solo se vio un extracto de buscador. No cambia el texto de este borrador. |
| Ley 1480, art. 50 (comercio electrónico), literales sobre precio total, resumen del pedido, medios de pago | Precio total con impuestos y envío; resumen y aprobación antes de pagar | Obligación confirmada por fuentes secundarias (concepto SIC, doctrina). VERIFICAR la letra exacta del literal, que la Ley 2439 no modificó. |
| Ley 1480, art. 51 y Decreto 587 de 2016 | Reversión del pago | VERIFICAR: texto vigente y aplicación a Bre-B. |
| Ley 1480, arts. 7 y ss. (garantía), 11 (transporte en garantía), 16 (exoneración) | Garantía legal | VERIFICAR numeración y contenido; no se pudo acceder al texto oficial. |
| Ley 1480, arts. 42–43 | Cláusulas abusivas / ineficaces | VERIFICAR. |

### B. Decisiones del cliente

1. **Plazo de entrega comprometido.** (a) Informar solo los plazos orientativos (riesgo: el art. 50 lit. h) exige informar el plazo antes de finalizar y obliga a cumplirlo; sin plazo aplican 30 días calendario). (b) Fijar un plazo máximo por zona, algo mayor que el orientativo, y mostrar ambos. (c) Mostrar solo el máximo de 30 días. Se recomienda (b).
2. **Retracto del café tostado.** Alternativas A, B y C del comentario del numeral 8. Se recomienda A o B tras consulta; C no se recomienda.
3. **Flete en el retracto.** (a) El cliente asume el transporte de la devolución (lo que dice el art. 47) y la tienda devuelve el valor del producto, no el del envío de ida. (b) La tienda devuelve también el flete de ida como política comercial. Se recomienda (a) si el abogado confirma el texto.
4. **Cobertura de costos operativos.** (a) Reenvío por dirección incorrecta a cargo del cliente. (b) «Reclamar en oficina» sin costo adicional. (c) Diferencias entre la tarifa publicada y la guía real a cargo de la tienda. Se recomienda sí a las tres.
5. **Reversión del pago (art. 51)** para Bre-B: publicar o no el numeral 9 según concepto del abogado.

### C. Datos faltantes
Razón social, NIT, domicilio, correo de contacto, confirmación del contador sobre el IVA (el dueño declara que no aplica), plazo máximo de entrega, plazo de respuesta de PQR, forma de generar el radicado, lista final de ciudades de zona 3, confirmación de plazos con el agregador y cobertura real de zona 5.

### D. Coherencia con otros documentos
- Términos y condiciones: el contrato se perfecciona cuando el cliente acepta por WhatsApp el total (con envío) que confirmamos; para envío «por cotizar», la aceptación del valor es requisito previo al pago.
- Política de datos: la dirección y el celular se comparten con la transportadora o el agregador (Envia.com o Mipaquete.com, según ENVIOS.md §1) y con el mensajero: debe figurar como tercero y con país. [TODO(dato): proveedor definitivo]
