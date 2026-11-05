# Revisión LEG-013 a LEG-020 — Textos de inicio, Historia y confirmación (2026-11-05)

> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.2 — 2026-11-05.

> **Estado en la versión 0.2 (2026-11-05)**, con las decisiones del dueño. El detalle está en `2026-11-05-marca-propia-iva.md` (LEG-021 a LEG-030).
> - LEG-013: **cerrado**. El descriptor es «café de origen» (LEG-026).
> - LEG-014: **cerrado**. La bajada dice «de provincias de Santander» (LEG-027).
> - LEG-015: **cerrado** para la frase original, que se retiró. La nueva frase («desde el productor hasta tu casa») se rechaza en LEG-021.
> - LEG-016: **sustituido**. La marca no tuesta y «lo tostamos por lotes» se retiró. El T2 final de abajo queda **sin efecto**, porque afirmaba el tueste. Rige el T2 de LEG-021. La identificación del fabricante pasa a LEG-022 y LEG-024.
> - LEG-017: abierto (soporte del proveedor).
> - LEG-018 y LEG-019: T5 y T6 implementados con el texto final.
> - LEG-020: T4 y T7 aprobados.
> - El dato faltante «confirmación de que la marca tuesta» queda resuelto: no tuesta.

Anexo a `2026-11-05-envios.md` (LEG-001 a LEG-012). Alcance: siete textos propuestos (T1 a T7) para inicio, Historia, pantalla de confirmación y botón. Fuentes de respaldo: `PRODUCT.md` (Product Purpose, Brand Commitments, Evidence on Hand y Decisiones), `docs/legal/envios-devoluciones-retracto.md` (sección D), `microcopy-legal.md` 1.2 y LEG-001 puntos 3, 4, 5 y 8.

Normas usadas: Ley 1480 de 2011, art. 23 (información veraz y suficiente), arts. 29 a 33 (publicidad engañosa; VERIFICAR numeración exacta del art. 29) y art. 50 (comercio electrónico; modificado por la Ley 2439 de 2024); Ley 527 de 1999, art. 14 (oferta y aceptación por mensaje de datos); Código de Comercio, arts. 845 y 864 (oferta y perfeccionamiento; VERIFICAR). No se verificaron en fuente oficial en esta sesión.

## Dictamen por texto

| Texto | Resultado |
|---|---|
| T1 bajada de inicio | Aprobado con cambio |
| T2 Historia, párrafo 1 | Aprobado con cambio (la frase «lo llevamos de la finca a tu casa» se rechaza) |
| T3 Historia, párrafo 2 | Aprobado (condicionado a que los datos existan) |
| T4 título de confirmación | Aprobado |
| T5 confirmación con tarifa | Aprobado con cambio |
| T6 confirmación por cotizar | Aprobado con cambio |
| T7 botón | Aprobado |

## Hallazgos

| # | Severidad | Ubicación | Texto o práctica | Riesgo y norma | Corrección propuesta |
|---|---|---|---|---|---|
| LEG-013 | Media (decisión del cliente) | T1 y T2; ya publicado en `layout.tsx` (metadatos), `pie.tsx`, `secciones-inicio.tsx` (líneas 29, 37 y 103) | «café de especialidad» | El propio `PRODUCT.md` define especialidad como puntaje SCA de 80 o más, y decide no mostrar puntajes porque ninguno está verificado. Hoy el sitio no puede demostrar la calificación que afirma. Arts. 23 y 29 a 33 (afirmación no demostrable). El descriptor en uso en `PRODUCT.md` es «Café de origen». | Usar «café de origen» o «café santandereano de origen» mientras no haya, para cada café, puntaje SCA ≥ 80 verificado con fuente y fecha. Alternativa: que la marca entregue una prueba documentada de que cada lote cumple el estándar; entonces se conserva «especialidad». No usar «Café de Santander» (denominación de origen). |
| LEG-014 | Baja | T1 | «de las provincias de Santander» | Con el artículo definido suena a que hay cafés de todas las provincias. Hoy hay cinco cafés y no cubren las siete. Art. 23. | «de provincias de Santander» o, mejor, sin mención de cantidad. |
| LEG-015 | Alta (no publicar) | T2 | «lo llevamos de la finca a tu casa» | No es demostrable con lo confirmado por la marca. (1) El café no viaja de la finca a la casa: se compra, se tuesta y se despacha desde Bucaramanga. (2) «Lo llevamos» atribuye a la tienda un transporte que hace una transportadora o un agregador. (3) «A tu casa» no siempre es cierto: hay «reclamar en oficina» y envío por cotizar. (4) Insinúa venta directa sin intermediarios. Arts. 23 y 30 (información veraz; publicidad engañosa). | Sustituir por lo que sí consta: tostado por lotes y despacho desde Bucaramanga (`PRODUCT.md`, Operating Context). Ver texto final de T2. |
| LEG-016 | Informativa | T2 | «Compramos a fincas» y «lo tostamos por lotes» | Cubiertos: Product Purpose («compra lotes a fincas de familias productoras santandereanas, los tuesta y los vende con su nombre») y Brand Commitments («tueste por lotes según el perfil de cada café»; «fincas de familias productoras santandereanas con tradición cafetera»). Diferencia de matiz: la lista de compromisos dice «trabaja con», y es el Product Purpose el que dice «compra». Falta el objeto de «compramos» y el antecedente de «lo». | Redacción con objeto explícito (texto final de T2). Pedir al cliente que confirme que el tueste lo hace la marca y no un tercero, porque «tostamos» lo afirma. |
| LEG-017 | Baja | T3 | «En cada café verás la provincia, el municipio, la altitud, la variedad y el proceso» | Es una promesa de contenido: es verdadera solo si los cinco cafés tienen los cinco campos. `PRODUCT.md` dice que estos datos no se han verificado uno por uno y que hay dudas sobre el proceso («Lavado tradicional/controlado/premium/especial»). Una altitud sin soporte del productor es afirmación no demostrable. | Aprobado. Condición: que no se publique un café con un campo vacío y que el cliente obtenga el soporte del productor de altitud, variedad y proceso (TODO(dato) en `PENDIENTES.md`). |
| LEG-018 | Media | T5 | «el pedido se hace cuando lo envías» + «Después te respondemos para confirmar el envío y la forma de pago» | Incoherente en dos frentes. (a) Con los términos en borrador (sección D del documento de envíos: el contrato se perfecciona cuando el cliente acepta por WhatsApp el total que confirmamos). (b) Con T6, que dice «queda en firme cuando aceptas». Si el pedido «se hace» al enviar, el contrato nace ahí (Ley 527 art. 14; C. Co. arts. 845 y 864) y lo que sigue sería ejecución, no confirmación; entonces no se podría condicionar el pago ni el envío a una respuesta posterior. Art. 50. | Aplicar el mismo momento de formación en ambos casos (decisión 1). Texto final de T5 abajo. |
| LEG-019 | Baja | T6 | Apertura «Pulsa «Enviar por WhatsApp». Con este mensaje nos pides el pedido…» | Correcto en fondo. Falta decir que hay que enviar el mensaje dentro de WhatsApp: el botón abre la aplicación, no envía nada. Art. 23. Además, «queda en firme cuando aceptas ese valor» solo cumple el art. 50 si el cliente puede desistir sin costo (LEG-001 punto 8). | Agregar «y manda el mensaje». Frase opcional final, sujeta a confirmación del cliente: «Si no lo aceptas, no pagas nada.» |
| LEG-020 | Informativa | T4 y T7; `flujo-pedido.tsx` (líneas ~286 y ~292), `PRODUCT.md` («Finalizar compra por WhatsApp») | «Abrir WhatsApp» → «Enviar por WhatsApp» | T4 y T7 son exactos: no dicen que el pedido está confirmado ni que se compró. «Enviar por WhatsApp» puede leerse como que la página envía el mensaje, pero T5 y T6 lo corrigen con «y manda el mensaje». | Conservar. Actualizar pruebas e2e que busquen «Abrir WhatsApp», el nombre accesible del botón y la expresión «Finalizar compra por WhatsApp» de `PRODUCT.md`. |

## Decisiones que requiere el cliente

1. **Momento de formación del contrato.** (a) El contrato nace cuando el cliente envía el mensaje (como dice hoy `PRODUCT.md`). Exige cambiar los términos en borrador, mostrar antes el plazo de entrega y la disponibilidad (LEG-001 punto 4) y no condicionar nada a una respuesta posterior; no sirve para «por cotizar». (b) El mensaje es la solicitud y el contrato se perfecciona cuando se confirma y el cliente acepta el total (coherente con los términos y con T6). **Se recomienda (b)** para los dos casos, por stock, pago y envío por cotizar. Los textos finales siguen (b).
2. **«Especialidad» o «origen»** (LEG-013). Se recomienda «origen» hasta tener puntajes verificados o prueba documental.
3. **Frase «Si no lo aceptas, no pagas nada»** (LEG-019): la marca debe confirmar que cumple esa promesa.

## Datos faltantes

- Soporte del productor para altitud, variedad y proceso de los cinco cafés.
- Confirmación de que la marca tuesta directamente (si lo hace un tercero, «tostamos» debe ajustarse).
- Siguen abiertos de LEG-001: IVA (bloqueante para el lanzamiento), plazo de entrega y canal de PQR con radicado.

## Entrega para desarrollador-fullstack

1. T1 en `secciones-inicio.tsx` (bajada genérica) y en `pie.tsx`: texto final de T1. Si el cliente aprueba «origen», cambiar también `layout.tsx` (metadatos), el antetítulo de `secciones-inicio.tsx` («Café de especialidad · Santander») y la línea 29 (variante con conteo).
2. Historia: T2 y T3 con el texto final de abajo (la línea 103 de `secciones-inicio.tsx` ya usa la frase confirmada «Trabajamos con fincas…»; mantenerla o reemplazarla por T2, no duplicar).
3. Pantalla de confirmación (`flujo-pedido.tsx`): T4, T5 y T6 según el caso; T7 en el botón.
4. Actualizar pruebas e2e y `PRODUCT.md` según LEG-020 y LEG-018 (lo edita quien tenga autorización).

## Puntos para que QA verifique

- Ningún texto del sitio contiene «de la finca a tu casa», «gourmet» ni «premium».
- Con tarifa y con «por cotizar» aparece el texto de confirmación que corresponde, exacto.
- El botón dice «Enviar por WhatsApp» y no existe «Abrir WhatsApp» en pruebas ni en etiquetas ARIA.
- Ningún café publicado tiene vacíos la altitud, la variedad o el proceso (T3).

## Normas marcadas VERIFICAR

Ley 1480, numeración exacta del art. 29 y literales del art. 50; Ley 527, art. 14; Código de Comercio, arts. 845 y 864.

## Textos finales recomendados

**T1.** Café santandereano de origen, de marca propia. Elige tu provincia y pide por WhatsApp.
(Si el cliente documenta la calidad de especialidad: «Café de especialidad de marca propia, de provincias de Santander. Elige tu provincia y pide por WhatsApp.»)

**T2.** ~~De Santander es una marca propia de café de origen. Compramos el café a fincas de familias santandereanas con tradición cafetera, lo tostamos por lotes según el perfil de cada café y lo despachamos desde Bucaramanga a todo Colombia.~~ Sin efecto en la versión 0.2: la marca no tuesta. Ver el T2 de LEG-021.

**T3.** En cada café verás la provincia, el municipio, la altitud, la variedad y el proceso. (Sin cambio; ver condición en LEG-017.)

**T4.** Tu pedido está listo para enviar por WhatsApp (sin cambio).

**T5 (con tarifa).** Pulsa «Enviar por WhatsApp» y manda el mensaje. Con él nos pides el pedido. Después te respondemos para confirmarlo y acordar el pago.

**T6 (por cotizar).** Pulsa «Enviar por WhatsApp» y manda el mensaje. Con este mensaje nos pides el pedido. Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor. [Opcional, decisión 3: Si no lo aceptas, no pagas nada.]

**T7.** Enviar por WhatsApp (sin cambio).

## Dictamen

**Conforme con observaciones** si se aplican los textos finales. Sin el cambio de LEG-015, la propuesta de T2 sería **No conforme** (frase no demostrable). Siguen vigentes los bloqueos de LEG-001 (IVA) para el lanzamiento. (Versión 0.2: el IVA pasa a condición previa, pendiente del contador. El lanzamiento sigue No conforme por LEG-024 y por la falta de identificación del vendedor.)
