# Revisión LEG-031 a LEG-039: ajuste de textos pedido por el dueño (2026-11-05)

> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.1 — 2026-11-05.

Anexo a `2026-11-05-textos-inicio-confirmacion.md` (LEG-013 a LEG-020) y `2026-11-05-marca-propia-iva.md` (LEG-021 a LEG-030).

**Pedidos del dueño:** (1) bajada de portada sin conteo de cafés ni de provincias; (2) Historia que diga que llevamos el café «de la finca a tu casa»; (3) mejorar la pantalla de confirmación, con tarifa y por cotizar; (4) botón «Enviar por WhatsApp» en todo el código y las pruebas.

**Alcance (árbol de trabajo del 2026-11-05):** `src/ui/componentes/layout/secciones-inicio.tsx`, `src/ui/componentes/checkout/flujo-pedido.tsx`, `src/ui/componentes/layout/pie.tsx`, `src/app/layout.tsx`, `studio/schemaTypes/paginas.ts`, `src/domain/marca/reglas-texto.ts`, `e2e/`, `data/config.csv`, `PRODUCT.md`, `docs/ENVIOS.md`. No hay contenido de ejemplo de Sanity en el repositorio (solo esquemas). `out/` no contiene los textos revisados (no hay build reciente).

**Normas.** Las mismas de LEG-021 a LEG-030, con su estado de verificación: Ley 1480 de 2011, arts. 23, 29, 30 y 50; art. 5 num. 13 (publicidad engañosa); Ley 527 de 1999, art. 14; Código de Comercio, arts. 845 y 864. No se hizo nueva verificación en fuente oficial en esta sesión: siguen marcadas VERIFICAR contra SUIN-Juriscol.

## Hallazgos

| # | Severidad | Ubicación | Texto o práctica | Riesgo y norma | Corrección propuesta |
|---|---|---|---|---|---|
| LEG-031 | Alta (no publicar; ya está en el código) | `secciones-inicio.tsx`, línea 101 (`HISTORIA_RESPALDO`, párrafo 1) | «…y llevamos su café desde el productor hasta tu casa.» | Es el texto que LEG-021 rechazó y su corrección no se aplicó. Mismos motivos: «hasta tu casa» no es cierto en zona 5 ni donde la guía cierra en «reclamar en oficina» (`docs/ENVIOS.md` §2 y §6); «desde el productor» omite al tostador y supone una relación directa con la finca que no consta (LEG-022). Arts. 23, 29 y 30 y art. 5 num. 13 de la Ley 1480. | Reemplazar por el texto recomendado del punto 2 (abajo). |
| LEG-032 | Informativa (pedido 1, **cerrado**) | `secciones-inicio.tsx` líneas 23 a 28; `pie.tsx` línea 23; `layout.tsx` línea 27; esquema de Sanity | Bajada, pie y metadatos | Ningún texto público cuenta cafés ni provincias. La variable `n` solo decide entre la bajada normal y la de catálogo vacío; no se imprime. Los «2 cafés» de `e2e/catalogo-y-mapa.spec.ts` y `filtros.ts` son el contador del catálogo, que se calcula solo: no es texto de marketing y no requiere cambio. «De provincias de Santander», sin artículo, no promete cafés de todas las provincias (LEG-014). | Sin cambio. La bajada de Sanity, si se carga, debe seguir la misma regla. |
| LEG-033 | Baja | `studio/schemaTypes/paginas.ts`, línea 11 (ayuda del antetítulo) y línea 42 (ayuda de «Del cafetal a la taza») | «Ejemplo: Café de especialidad · Santander» y «Cada paso debe corresponder a lo que realmente hace la marca» | El ejemplo invita a usar el descriptor que LEG-013 y LEG-026 retiraron. La segunda ayuda es inexacta: la marca no cultiva ni seca; esos pasos los hacen las fincas (LEG-025). Arts. 23 y 29. | Cambiar las ayudas por el texto de la entrega 5. |
| LEG-034 | Baja (recomendación, no exigencia) | `src/domain/marca/reglas-texto.ts` | Las reglas de tono no avisan de las frases ya rechazadas | Buena práctica de control preventivo. Sin el aviso, un editor de Sanity puede volver a escribir una frase rechazada. | Agregar avisos (entrega 6). |
| LEG-035 | Media (pedido 2) | Historia, párrafo 1 | Idea «de la finca a tu casa» | Se puede transmitir el recorrido sin prometer entrega a domicilio ni transporte propio. «De la finca a tu taza» describe de dónde sale el café y dónde termina; es cierto en todos los destinos, también cuando se recoge en oficina. Sigue el mismo criterio con que LEG-025 aprobó «Del cafetal a la taza». La frase literal «de la finca a tu casa» exige los datos y decisiones de la sección «Qué falta para la frase literal». | Texto recomendado o alternativa (punto 2). |
| LEG-036 | Informativa (pedido 3) | `flujo-pedido.tsx`, líneas 279 a 288 | Título y párrafos de confirmación | Los textos actuales son conformes (LEG-018 a LEG-020 y LEG-028). La mejora aclara que el mensaje se manda dentro del chat, cambia «Con él» por «Con ese mensaje» y nombra la forma de pago, que el cliente ya eligió en el formulario. Se mantiene la alternativa (b): el mensaje es la solicitud y el pedido queda en firme con la confirmación por el chat. | Textos del punto 3. |
| LEG-037 | Baja (decisión del cliente) | `flujo-pedido.tsx`, línea 272; `e2e/envios.spec.ts` líneas 54, 158 y 195; `e2e/pedido.spec.ts` líneas 59 y 64 | Botón «Finalizar compra», antes de la pantalla de confirmación | Pulsarlo no envía nada ni cierra la compra: solo prepara el mensaje. «Finalizar compra» sugiere que el contrato se forma con ese clic. Eso no coincide con la confirmación ni con los términos en borrador (alternativa (b)). No es una infracción por sí sola, pero resta claridad (art. 23 de la Ley 1480; art. 50 sobre la información previa a la aceptación). | Recomendado: `Preparar pedido para WhatsApp`. Lo decide el cliente con `disenador-marca`. Si cambia, hay que actualizar las cinco pruebas e2e. |
| LEG-038 | Baja | `secciones-inicio.tsx`, línea 28 (bajada con catálogo vacío) | «Estamos preparando la próxima cosecha. Escríbenos por WhatsApp y te avisamos cuando haya café.» | La marca no cultiva, y la frase anuncia una cosecha sin fecha ni soporte (arts. 23 y 29). El aviso posterior lo pide el consumidor. Por eso se recomienda responder solo a esa solicitud y no añadirlo a listas promocionales sin autorización (Ley 1581 de 2012; Ley 2300 de 2023: VERIFICAR alcance). | `Por ahora no tenemos café disponible. Escríbenos por WhatsApp y te avisamos cuando haya.` |
| LEG-039 | Informativa (pedido 4, **cerrado** para `src/` y `e2e/`) | `src/`, `e2e/`, `studio/` | «Abrir WhatsApp» | No aparece en `src/`, `e2e/` ni `studio/`, tampoco en `aria-label`. El botón (línea 292) y las pruebas (`envios.spec.ts` líneas 56 y 161; `pedido.spec.ts` línea 68) usan «Enviar por WhatsApp». El enlace no tiene `aria-label` propio, así que su nombre accesible es el texto visible. Quedan menciones en documentos internos: `docs/INVENTARIO-V1.md` línea 164 y `docs/PROMPT-V2.md` líneas 36 y 316, este último ya desactualizado. | Actualizar `docs/INVENTARIO-V1.md` línea 164 (entrega 7). |

## Pedido 2: «de la finca a tu casa»

**Qué exige la norma.** Lo que se anuncia obliga al anunciante (art. 29 de la Ley 1480). La información debe ser veraz y suficiente (art. 23). Una afirmación que no corresponde a la realidad, o que es insuficiente y puede inducir a error, es publicidad engañosa (art. 5 num. 13 y art. 30).

**Qué se puede afirmar con lo confirmado.**
- La marca trabaja con fincas de familias productoras santandereanas (`PRODUCT.md`, Brand Commitments).
- Despacha desde Bucaramanga a todo Colombia (`data/config.csv`, `ciudad_despacho`).
- El valor del envío se ve antes de pagar. En zona 5 y en pedidos de más de 5 kg se cotiza por WhatsApp (`docs/ENVIOS.md` §4).

**Qué falta para la frase literal «llevamos el café de la finca a tu casa».**
1. **Entrega a domicilio.** Hace falta entrega en la dirección del cliente en todos los destinos publicados. Hoy no se cumple: en zona 5 la entrega es en oficina, y en algunos municipios la guía queda en «reclamar en oficina». Hay dos salidas: excluir esos destinos de la venta, o incluir la salvedad en la misma frase (alternativa B).
2. **Origen en la finca.** Hay que confirmar el modelo A de LEG-022: la marca compra el café a la finca, directamente o por un intermediario identificado, y conoce la finca de cada lote, con soporte escrito. Si compra el café ya tostado a un tostador que no identifica la finca, «de la finca» no es demostrable.
3. **«Llevamos».** Es aceptable aunque el transporte lo haga un mensajero, una transportadora o un agregador, siempre que De Santander contrate el envío y responda por la entrega frente al cliente. Así lo prevé `envios-devoluciones-retracto.md`. Es una condición que el cliente debe confirmar.

## Decisiones que requiere el cliente

1. **Historia (pedido 2).**
   - (a) Texto recomendado, «de la finca a tu taza». Se publica ya.
   - (b) Alternativa B, «de la finca a tu casa» con salvedad. Solo se publica si se cumplen las condiciones 2 y 3 de la sección anterior.
   - La frase literal sin salvedad solo es posible si además se excluyen de la venta los destinos sin entrega a domicilio.
2. **Botón «Finalizar compra» (LEG-037).**
   - (a) Cambiarlo por `Preparar pedido para WhatsApp` (recomendado).
   - (b) Mantenerlo. Es conforme, pero menos claro.
3. Siguen abiertas:
   - LEG-022: modelo de comercialización. Condiciona «marca propia».
   - LEG-019: frase «Si no lo aceptas, no pagas nada».
   - LEG-013 a LEG-020, decisión 1: momento de formación del contrato. Se recomienda (b), y los textos de esta revisión la siguen.

## Datos faltantes

Se registran en `docs/PENDIENTES.md`, como en LEG-021 a LEG-030. Este agente no lo edita en esta tarea.
- `TODO(dato)`: modelo de compra. ¿La marca compra a la finca o al tostador? ¿Conoce la finca de cada lote? Es necesario para la alternativa B.
- `TODO(dato)`: confirmación de que De Santander contrata el envío y responde por la entrega en todos los destinos.
- `TODO(dato)`: destinos sin entrega a domicilio. Hoy se sabe de la zona 5 y de algunos municipios con «reclamar en oficina» (`docs/ENVIOS.md` §7: confirmar con el agregador).

## Entrega para desarrollador-fullstack

1. **Historia, párrafo 1** (`src/ui/componentes/layout/secciones-inicio.tsx`, línea 101). Reemplazar el texto completo por:
   `De Santander es una marca propia de café de origen. Trabajamos con fincas de familias productoras santandereanas con tradición cafetera. Su café va de la finca a tu taza: lo despachamos desde Bucaramanga a todo Colombia.`
   - Se recomienda que «Bucaramanga» salga de `tienda.ciudadDespacho`. Para eso, `HISTORIA_RESPALDO` tiene que pasar a ser una función, y `Historia` tiene que recibir la ciudad como prop. Si eso complica la fase, se deja el texto fijo y se registra.
   - Si Sanity ya tiene un texto de Historia, debe coincidir con este.
   - Solo si el cliente elige la alternativa B y se cumplen sus condiciones, el texto es: `De Santander es una marca propia de café de origen. Trabajamos con fincas de familias productoras santandereanas con tradición cafetera. Llevamos su café de la finca a tu casa, con despacho desde Bucaramanga a todo Colombia. En algunos destinos se entrega en la oficina de la transportadora.`
2. **Confirmación con tarifa** (`flujo-pedido.tsx`, línea 286):
   `Pulsa «Enviar por WhatsApp» y manda el mensaje en el chat. Con ese mensaje nos pides el pedido. Te respondemos para confirmarlo y acordar la forma de pago.`
3. **Confirmación por cotizar** (`flujo-pedido.tsx`, línea 282):
   `Pulsa «Enviar por WhatsApp» y manda el mensaje en el chat. Con ese mensaje nos pides el pedido. Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.`
   - No se agrega «Si no lo aceptas, no pagas nada.» mientras el cliente no confirme LEG-019.
   - El título (línea 279) y el botón (línea 292) no cambian.
4. **Bajada con catálogo vacío** (`secciones-inicio.tsx`, línea 28):
   `Por ahora no tenemos café disponible. Escríbenos por WhatsApp y te avisamos cuando haya.`
5. **Ayudas de Sanity** (`studio/schemaTypes/paginas.ts`):
   - Línea 11, la ayuda del antetítulo: `En mayúsculas lo pone el diseño. Ejemplo: Café de origen · Santander`.
   - Línea 42: `Cada paso debe ser cierto para todos los cafés que se venden y tener soporte escrito de la finca o del proveedor.`
6. **Reglas de tono** (`src/domain/marca/reglas-texto.ts`, arreglo `REGLAS`; es una recomendación). Agregar avisos para:
   - `/\bcafe de especialidad\b/`, con el aviso `Usa "café de origen": no hay puntajes SCA verificados (LEG-013).`
   - `/de la finca a tu casa|desde el productor hasta tu casa/`, con el aviso `Frase rechazada por legal (LEG-021, LEG-031): usa "de la finca a tu taza".`
   - `/\btostamos\b|tueste por lotes/`, con el aviso `La marca no tuesta (LEG-016).`
   - `/iva incluido|sin iva|exento de iva|excluido de iva/`, con el aviso `No uses rótulos de IVA sin concepto del contador (LEG-029).`
   - Agregar las pruebas correspondientes.
7. **Documentación interna.** En `docs/INVENTARIO-V1.md`, línea 164, cambiar «Abrir WhatsApp» por «Enviar por WhatsApp».
8. **Solo si el cliente elige la decisión 2 (a).**
   - `flujo-pedido.tsx`, línea 272: `Preparar pedido para WhatsApp`.
   - En `e2e/envios.spec.ts` (líneas 54, 158 y 195) y `e2e/pedido.spec.ts` (líneas 59 y 64), cambiar `{ name: "Finalizar compra" }` por `{ name: "Preparar pedido para WhatsApp" }`.
   - Pasa antes por `disenador-marca`.

Al aplicar las entregas 1 a 3, se actualiza `docs/legal/microcopy-legal.md` §2.

## Puntos para que QA verifique

- `secciones-inicio.tsx` y `out/` no contienen «productor hasta tu casa» ni «de la finca a tu casa». Este último solo se permite si el cliente elige la alternativa B, y en ese caso debe ir con la salvedad de oficina.
- El párrafo 1 de la Historia coincide exactamente con la entrega 1.
- La confirmación con tarifa y la de por cotizar coinciden exactamente con las entregas 2 y 3.
- `rg -i "abrir whatsapp" src e2e studio out` no devuelve nada.
- El nombre accesible del enlace es «Enviar por WhatsApp».
- La bajada, el pie y los metadatos no contienen cifras de cafés ni de provincias.
- Con el catálogo vacío se ve el texto de la entrega 4.

## Normas marcadas VERIFICAR

- Ley 1480 de 2011, arts. 5 num. 13, 23, 29, 30 y 50: cotejo con SUIN-Juriscol.
- Ley 527 de 1999, art. 14.
- Código de Comercio, arts. 845 y 864.
- Ley 2300 de 2023: alcance frente a un aviso que el propio consumidor solicita (LEG-038).

## Dictamen

**Textos de esta revisión: Conforme con observaciones**, siempre que se aplique la entrega 1. Sin ese cambio, la Historia que hoy está en el código es **No conforme** (LEG-031). «Marca propia» sigue condicionado a LEG-022.

**Lanzamiento: No conforme**, sin cambios respecto de LEG-021 a LEG-030. Los bloqueos son LEG-024 (registro sanitario e identificación del fabricante) y la falta de identificación del vendedor.
