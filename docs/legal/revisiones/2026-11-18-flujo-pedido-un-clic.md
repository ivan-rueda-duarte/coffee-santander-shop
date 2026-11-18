> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.2 — 2026-11-18.

**Cambios de la v0.2 (2026-11-18):** §6 nueva, con la aprobación del abogado responsable comunicada por el dueño (LEG-171 y retiro del panel de D5 §6.3), el estado de cada hallazgo y la confirmación de que D1 a D4 no cambian. Se emite la microcopy v1.10 (LEG-176).

# Revisión LEG-171 a LEG-177: flujo de pedido simplificado (cajón → Envío → Resumen con «Enviar por WhatsApp» que abre wa.me) y leyenda de IVA en la tarjeta del catálogo

**Pedido.** El dueño aprobó simplificar el flujo de pedido (rama `feat/ux-auditoria`). Se pide dictamen antes de implementar: (1) conformidad con D1 §5 y el resto del paquete del abogado v1.0 (D5 §6.3 y §6.4), frente al flujo actual; (2) si la información previa a la aceptación sigue completa antes del clic; (3) si la tarjeta del catálogo necesita leyenda de IVA.

**Fuentes (solo lectura).** `src/ui/componentes/checkout/flujo-pedido.tsx`, `src/ui/componentes/carrito/cajon-contenido.tsx`, `docs/legal/terminos-y-condiciones.md` (D1 1.0), `docs/legal/microcopy-legal.md` (v1.9), revisión LEG-140 a LEG-170 (en particular LEG-150, LEG-153 y LEG-159), `PRODUCT.md`, `docs/qa/2026-11-12-cambios-pago-botones-vendedor.md`. El .docx del paquete no se volvió a leer: los textos de D5 §6.3 se toman de LEG-153, que los transcribió.

**Flujo actual.** Ficha → cajón «Revisar el pedido» → `/pedido/` paso Carrito «Continuar con el envío» → Envío «Finalizar el pedido» → Resumen (casillas, retracto, IVA, totales, vendedor) con un botón «Enviar por WhatsApp» que **no** abre WhatsApp, sino el panel de Confirmación → Confirmación con otro «Enviar por WhatsApp» (enlace `wa.me`), «Copiar mensaje» y el texto del mensaje.

**Flujo propuesto.** Cajón → Envío → Resumen (mismas cuatro casillas, aviso de privacidad, retracto, IVA, totales y vendedor). «Enviar por WhatsApp» valida y abre `wa.me` en el mismo clic; debajo, respaldo «¿No se abrió? Copiar mensaje». El paso Carrito queda solo para quien entra directo a `/pedido/`. Se retira el panel de Confirmación.

## 1. Pregunta 1: D1 §5, D5 §6.3 y §6.4

**D1 §5 dice:** «En el resumen revisas los cafés, el subtotal, el envío, el plazo de entrega de tu zona y el total, y lees cómo funciona el retracto. Luego aceptas estos términos y autorizas el tratamiento de tus datos, en dos casillas separadas. […] Pulsas «Enviar por WhatsApp». Se abre WhatsApp con el pedido escrito. El pedido nos llega solo cuando tú mandas ese mensaje.»

- **Flujo actual:** el botón del resumen se llama «Enviar por WhatsApp» pero no abre WhatsApp. El texto publicado describe un flujo distinto del real (Ley 1480 de 2011, art. 23: información clara, veraz y suficiente). Es el hallazgo LEG-159, que sigue abierto.
- **Flujo propuesto:** coincide paso por paso con D1 §5. **Cumple mejor que el actual** y cierra LEG-159 (era su alternativa b).
- **D1 §6 (formación del contrato):** no cambia. El mensaje sigue siendo solicitud; la compra queda en firme con «ACEPTO» en el chat. Abrir WhatsApp no envía nada: el cliente sigue viendo el mensaje y decide si lo manda. Es coherente con D1 §5 («Hasta entonces no hay pedido») y con la Ley 527 de 1999 (el mensaje de datos lo emite el cliente; VERIFICAR arts. 14 y 15 sobre oferta, aceptación y acuse).
- **D5 §6.4 (mensaje) y constancia:** no cambian. La plantilla, el número DS generado en el navegador al pulsar (P39 = a), «Pago: transferencia o Bre-B», la constancia «Acepto los Términos v1.0 … Política v1.0 del 17 de noviembre de 2026.» y la línea de promociones son las mismas. Lo que cambia es **cuándo** se arma el texto: en el mismo clic que abre WhatsApp. Condiciones en LEG-172 y LEG-173.
- **D5 §6.3 (panel de Confirmación):** el paquete trae el título «Tu pedido está listo para enviar por WhatsApp» y dos textos (con tarifa y por cotizar). Si se retira el panel, esos textos se dejan de usar. Legal lo considera admisible, porque D1 §5 no describe ningún panel. Pero **se aparta del texto de D5**: lo debe validar el abogado (LEG-171). Además, la información de esos textos (cómo sigue la compra) debe pasar al resumen, junto al botón (LEG-171).

## 2. Pregunta 2: información antes del clic

Ley 1480 de 2011, arts. 23, 26, 37, 46, 47 y 50 (VERIFICAR la letra de cada literal del art. 50, modificado en sus literales b, g y h por la Ley 2439 de 2024). Decreto 1074 de 2015, sección de ventas a distancia (antes Decreto 1499 de 2014; VERIFICAR la numeración).

| Información | Norma | Dónde queda en el flujo propuesto | Estado |
|---|---|---|---|
| Identidad del vendedor, NIT y enlace a sus datos completos | Art. 50 lit. a | Resumen, línea «Te vende De Santander SAS · NIT … · Información del vendedor»; pie | Completa |
| Producto, presentación, cantidad y precio de cada línea | Arts. 23, 50 lit. b | Resumen (líneas no editables) | Completa |
| Precio total con impuestos y envío por separado | Arts. 26 y 50 | Resumen: subtotal con leyenda de IVA, envío, total; nota `nota-precio-total` | Completa |
| Envío por cotizar | Art. 50 | Nota «Este valor no incluye el envío…» bajo el total | Completa |
| Plazo estimado y máximo | Art. 50 lit. h (Ley 2439) | Resumen, bajo la línea de envío | Completa |
| Medios de pago | Art. 50 | Resumen, «Pago: transferencia o Bre-B» | Completa |
| Retracto, plazo y procedimiento | Arts. 47 y 50 | Resumen, `aviso-retracto` | Completa |
| Condiciones generales accesibles | Arts. 37 y 50 | Casilla 1 con enlace a `/legal/terminos/`; enlace a `/envios/` | Completa |
| Resumen del pedido que el cliente puede verificar y corregir antes de concluir | Art. 50 (literal del resumen; VERIFICAR la letra) | Resumen con «Editar» del envío y «Volver»; el mensaje se ve completo en WhatsApp antes de mandarlo | Completa (ver LEG-173 sobre ver el texto) |
| Aviso de privacidad antes de recoger los datos | Ley 1581 de 2012, art. 12; Decreto 1377 de 2013, art. 14, compilado en el Decreto 1074 de 2015 (VERIFICAR) | Pie del formulario de Envío | Completa, **solo si el aviso se queda en Envío** (no moverlo al resumen) |
| Autorización de datos y aceptación de términos, separadas y sin marcar | Ley 1581, art. 9; Ley 1480, art. 50 | Casillas 1 y 2 del resumen | Completa |
| Cómo sigue la compra (ACEPTO, total, datos de pago) | Art. 23; D1 §6 | Hoy en el panel de Confirmación, **que se retira** | **Falta**: LEG-171 |

Con el cajón → Envío, quien compra no pasa por el paso Carrito. No falta información por eso: lo que mostraba el Carrito (líneas, subtotal, leyenda de IVA, «se calcula al elegir tu ciudad») ya está en el cajón y se repite en el resumen.

## 3. Pregunta 3: leyenda de IVA en la tarjeta

**Lo que exige la norma.** Ley 1480, art. 26: el precio se informa en pesos colombianos e incluye todos los impuestos (VERIFICAR la letra). La norma exige que **el número** de la tarjeta sea el precio final con IVA. No exige una leyenda en cada lugar donde aparece el precio. Si el valor de la tarjeta es el mismo de la ficha y del carrito, **cumple**.

**Lo que se recomienda.** LEG-153 pidió la misma leyenda «en ficha, tarjeta, carrito y resumen». Para no cargar cada tarjeta, basta **una línea** en cada listado con tarjetas (`/cafes/`, provincias, destacados de portada), cerca de la cuadrícula: `Precios con IVA del 5 % incluido (art. 468-1 del Estatuto Tributario).`. Es el mismo texto de la ficha, y queda sujeto al concepto del contador (D-18). No es bloqueante.

## 4. Hallazgos

| # | Severidad | Ubicación | Texto o práctica | Riesgo y norma | Corrección propuesta |
|---|---|---|---|---|---|
| LEG-171 | Alta (condición del cambio; **validación del abogado**) | `flujo-pedido.tsx`, panel de Confirmación (:382-419), resumen | Al retirar el panel, se dejan de mostrar los textos de D5 §6.3 que dicen cómo sigue la compra: «Te respondemos con el total para que lo aceptes y te damos los datos para pagar» y, por cotizar, «Tu pedido queda en firme cuando aceptas ese valor». | El consumidor debe saber, antes de mandar el mensaje, que no ha comprado todavía y qué pasa después (Ley 1480, art. 23; D1 §5 y §6). Retirar un texto de D5 se aparta del paquete. | Poner esos textos en el resumen, justo encima del botón, sin «Pulsa…» (el botón está al lado). **Con tarifa:** `Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido escrito. Con ese mensaje nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.` **Por cotizar:** `Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido escrito. Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.` Son textos de D5 §6.3 con el arranque adaptado: **el abogado debe validar** la adaptación y el retiro del panel. Si no lo valida antes de implementar, se conserva el panel y el botón del resumen se renombra (LEG-159, alternativa a). |
| LEG-172 | **Bloqueante** si no se cumple | `flujo-pedido.tsx`, `finalizar` (:131-150) | Validar y abrir `wa.me` en el mismo clic. | Si el enlace o el texto se arman sin las casillas 1 y 2, el mensaje lleva la constancia «Acepto los Términos… autorizo…» sin que el cliente lo haya marcado: aceptación y autorización sin prueba válida (Ley 1581, art. 9; Ley 1480, art. 50; Ley 527, art. 14, VERIFICAR). | (1) Con una casilla obligatoria sin marcar: no se genera número, texto ni enlace; errores y foco como en microcopy §5.9. (2) Con las dos: se genera el número DS y el texto, y se abre `wa.me` **en el mismo manejador, sin `await` ni espera** (microcopy §5.5: «no con `window.open` tras una espera»). (3) Las casillas 3 y 4 nunca bloquean. (4) La microayuda de §5.9 se mantiene (cambia «Para preparar tu pedido» por `Para enviar tu pedido`; no dice «compra», «confirmar», «finalizar» ni «pagar»). |
| LEG-173 | Alta | Respaldo «¿No se abrió? Copiar mensaje» | El respaldo copia el mensaje sin pasar por WhatsApp. | Mismo riesgo de LEG-172 si copia antes de validar. Si copia un texto distinto del enlace (otro número DS u otros datos), el cliente manda una solicitud que no coincide con lo que vio (Ley 1480, arts. 23 y 50). Sin el número de destino, el texto copiado no sirve. | (1) Se muestra **solo después** de un clic válido en «Enviar por WhatsApp». (2) Copia exactamente el mismo texto y el mismo número DS del enlace abierto. Si después cambian las líneas, los datos de envío o las casillas, se oculta hasta un nuevo clic válido. (3) Texto: `¿No se abrió WhatsApp? Copia el mensaje y envíalo al +57 300 112 9874.` (número de `config.csv` con `formatearWhatsapp`) + botón `Copiar mensaje`. (4) **Se recomienda** que el texto del mensaje se pueda ver junto al respaldo (desplegable «Ver el mensaje»), como en el panel actual. |
| LEG-174 | Media | `flujo-pedido.tsx` :267 («Finalizar el pedido»); `cajon-contenido.tsx` :86 («Revisar el pedido») | En el paso Envío, «Finalizar el pedido» lleva al resumen. El pedido no termina ahí y faltan las casillas. Con el cambio, «Revisar el pedido» del cajón abriría el formulario de envío, no un resumen. QA ya lo marcó el 2026-11-12. | Un botón que dice «finalizar» puede hacer creer que el pedido ya se hizo (Ley 1480, art. 23; microcopy §5.9, regla 3). | Envío: `Ver el resumen` o `Continuar al resumen`. Cajón: `Continuar con el envío`. Decide `disenador-marca`; no son textos del paquete. |
| LEG-175 | Media | Indicador «Pasos del pedido» (:24-29, :171-180) | Con el panel retirado, el paso 4 «Confirmación» deja de existir. | Un paso que no existe confunde (art. 23). | Pasos: `Carrito` (solo si se entra directo a `/pedido/`), `Envío`, `Resumen`. Retirar `?paso=confirmacion` y su redirección. |
| LEG-176 | Baja | Microcopy §2 (filas «Confirmación…»), §5.5 («Reglas»), §5.9 | La microcopy describe el panel y el botón «Preparar pedido para WhatsApp». | Documento interno desactualizado (LEG-166). | Legal emite la microcopy v1.10 cuando el abogado valide LEG-171: retira las filas de Confirmación, añade los textos de LEG-171 y LEG-173 y ajusta §5.9. El texto público de D1, D2, D3 y D4 **no cambia**, y la constancia del mensaje tampoco. |
| LEG-177 | Baja (recomendación; condicionada a D-18) | Tarjeta del catálogo (`/cafes/`, provincias, portada) | El precio de la tarjeta no lleva leyenda de IVA; sí la llevan la ficha, el cajón, el resumen y el pie. | Cumple el art. 26 si el número incluye el IVA. LEG-153 recomendaba la leyenda también en la tarjeta. | Una línea por listado, cerca de la cuadrícula: `Precios con IVA del 5 % incluido (art. 468-1 del Estatuto Tributario).` No hace falta repetirla en cada tarjeta. |

## 5. Dictamen

- **Pregunta 1: aprobado con condiciones.** El flujo propuesto cumple D1 §5 mejor que el actual y cierra LEG-159. Condiciones: LEG-171 (textos de cómo sigue la compra en el resumen; el abogado valida que se retire el panel de D5 §6.3), LEG-172 y LEG-173. D1, D2, D3, D4, la plantilla D5 §6.4 y la constancia no cambian.
- **Pregunta 2: aprobado con condiciones.** Toda la información previa está en el resumen antes del clic, salvo cómo sigue la compra (LEG-171). El aviso de privacidad se queda en el formulario de Envío.
- **Pregunta 3: aprobado.** Basta así en lo legal. Se recomienda una línea de IVA por listado (LEG-177).

**Dictamen del cambio: Conforme con observaciones**, siempre que se implemente con LEG-171 a LEG-173. Si se implementa sin LEG-172, el dictamen es **No conforme**.

## 6. Aprobación del abogado y estado (v0.2, 2026-11-18)

**Aprobación.** El dueño informó el 2026-11-18 que **el abogado responsable aprobó** (a) los textos de LEG-171 en sus dos variantes (con tarifa y por cotizar), encima de «Enviar por WhatsApp», y (b) el retiro del panel de D5 §6.3 (pantalla de Confirmación: título «Tu pedido está listo para enviar por WhatsApp» y sus dos textos). Se registra como **aprobación comunicada por el dueño en esa fecha**. En el repositorio no hay documento del abogado. **Pendiente:** constancia escrita del abogado (correo o nota firmada con fecha y textos aprobados), que se recomienda guardar con el paquete (`docs/legal/paquete-abogado/`). Legal no marca como aprobado ningún otro documento por esta comunicación.

Con esa aprobación la salvaguarda de LEG-171 (alternativa a de LEG-159) ya no aplica: A1 se puede implementar como dice `docs/diseno/2026-11-18-ux-auditoria-alta.md`.

| # | Estado al 2026-11-18 |
|---|---|
| LEG-159 | Se cierra cuando QA verifique A1 (el botón del resumen abre `wa.me`, como dice D1 §5). |
| LEG-171 | Textos **aprobados** (aprobación comunicada por el dueño; falta constancia escrita). Pendiente de implementación y verificación de QA. |
| LEG-172 | Abierto hasta verificación de QA. **Bloqueante** si no se cumple. |
| LEG-173 | Abierto hasta verificación de QA. |
| LEG-174 | Resuelto en diseño: cajón «Continuar con el envío», Envío «Ver el resumen», Resumen «Volver al envío». Legal conforme. |
| LEG-175 | Resuelto en diseño con una variante: indicador **«Pedido · Envío · Resumen»** (paso 1 «Pedido» = el cajón, siempre presente y marcado como hecho) en lugar de «Carrito» solo para quien entra directo; el paso Carrito se retira y lo reemplaza el bloque «Tu pedido» con «Editar» en Envío. **Legal conforme:** no se anuncia ningún paso que no exista, y el resumen conserva líneas, totales e IVA antes del clic (§2). |
| LEG-176 | **Emitida:** microcopy v1.10 (§9). |
| LEG-177 | Recomendación abierta, no bloqueante. |

**Documentos D1 a D4.** Revisados de nuevo `terminos-y-condiciones.md`, `politica-tratamiento-datos.md`, `envios-devoluciones-retracto.md` e `informacion-vendedor.md`: ninguno menciona el panel de Confirmación, «Preparar pedido», «Finalizar» ni el paso Carrito. D1 §5 ya describe el flujo nuevo. Las menciones a «tu carrito y el resumen» (D1 §4, D3 §3) siguen siendo ciertas: el cajón es el carrito y el resumen sigue existiendo. **No requieren cambio** ni nueva versión; `config.csv` sigue en 1.0 / 2026-11-17.

## 4 bis. Precisiones pedidas por diseño (A1 de `docs/diseno/2026-11-18-ux-auditoria-alta.md`)

1. **Segundo clic en «Enviar por WhatsApp» sin cambios.** Mientras no cambien el carrito, los datos de envío ni ninguna de las cuatro casillas, se abre **el mismo enlace, con el mismo número DS y el mismo texto**, y el respaldo de LEG-173 copia ese mismo texto. Se genera un número nuevo solo cuando cambia alguno de esos elementos. Fundamento: el número identifica una sola solicitud. Dos números para el mismo contenido harían creer que hay dos pedidos y debilitarían la prueba de cuál versión aceptó el cliente (Ley 1480, art. 50; Ley 527 de 1999, art. 14, VERIFICAR). Es una **recomendación** de legal; la norma no fija la regla.
2. **Orden de la microayuda.** Rige el **orden del código** (`flujo-pedido.tsx`:121): primero los términos y condiciones, después la autorización de tus datos. Es el orden de las casillas de D5 §6.3 (casilla 1, términos; casilla 2, datos; LEG-145). La microcopy §5.9 v1.1 es anterior al paquete, cuando la casilla de datos iba primero: en ese punto ya no rige (aviso de la v1.9). Lo corrige la microcopy v1.10 (LEG-176).
3. **«Para enviar tu pedido» en lugar de «Para preparar tu pedido».** **Aceptable**: lo propone LEG-172 y describe lo que hace el botón. Cumple la regla 3 de §5.9, porque no dice «compra», «confirmar», «finalizar» ni «pagar». Textos: `Para enviar tu pedido, marca las dos casillas: los términos y condiciones y la autorización de tus datos.` / `Para enviar tu pedido, falta que autorices el tratamiento de tus datos.` / `Para enviar tu pedido, falta que aceptes los términos y condiciones.` Entran en la microcopy v1.10.

## Entrega para desarrollador-fullstack

1. Resumen: «Enviar por WhatsApp» valida las casillas 1 y 2, genera el número DS y el texto (`prepararPedido`) y abre `resultado.enlace` en el mismo manejador, sin `await` (LEG-172).
2. Encima del botón, el texto de LEG-171 según el tipo de envío (`data-testid="texto-siguiente-paso"`).
3. Respaldo de LEG-173, solo tras un clic válido. Copia el mismo texto y número. Se invalida si cambia el carrito, el envío o las casillas. Desplegable «Ver el mensaje» recomendado.
4. Retirar el paso «Confirmación» del indicador y de la URL (LEG-175). El aviso de privacidad queda en Envío.
5. Botones: textos de LEG-174, tras su revisión por `disenador-marca`.
6. Opcional: línea de IVA por listado (LEG-177).

## Para disenador-marca

Ubicar el texto de LEG-171 y el respaldo de LEG-173 en el resumen a 360 × 740, sin separar el botón de las casillas. Nombres de los botones de LEG-174.

## Puntos para que QA verifique

- Sin las casillas 1 y 2: el clic no abre `wa.me`, no aparece el respaldo y no se copia nada. El foco va a la primera casilla sin marcar.
- Con las dos marcadas: un clic abre `wa.me`, y su `text` incluye la constancia v1.0 y el número DS. El texto copiado es idéntico al del enlace.
- Cambiar una casilla o un dato después del clic oculta el respaldo.
- Un segundo clic sin cambios abre el mismo enlace con el mismo número DS. Con un cambio, el número es nuevo (§4 bis).
- La microayuda dice «Para enviar tu pedido…», con los términos antes de los datos.
- Con envío por cotizar, se muestra el texto de LEG-171 en su variante y la nota bajo el total.
- No queda ningún «Finalizar» ni paso «Confirmación».
- Sigue el aviso de privacidad en Envío.

## Normas marcadas VERIFICAR

Ley 1480 de 2011, arts. 26 y 50 (letra de cada literal; modificación de la Ley 2439 de 2024); Ley 527 de 1999, arts. 14 y 15; Decreto 1377 de 2013, art. 14 (compilado en el Decreto 1074 de 2015); numeración de ventas a distancia en el Decreto 1074 de 2015. Las fuentes oficiales (Secretaría del Senado, Función Pública) no respondieron el 2026-11-18.
