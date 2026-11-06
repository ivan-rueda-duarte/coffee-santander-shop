# Revisión LEG-063 a LEG-068: aplicación de las decisiones del dueño (P1 B, P2 C, P3 a, P9) y coherencia de los documentos (2026-11-05)

> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.1 — 2026-11-05.

Sigue a `2026-11-05-actualizacion-documentos.md` (LEG-049 a LEG-062).

**Pedidos.**
1. Pasar los documentos afectados a v0.5 con las decisiones P1 = B, P2 = C y P3 = a, retirando las alternativas descartadas.
2. Registrar la decisión P9 (Café Arreboles sigue activo) como riesgo aceptado por el dueño, con LEG-024 Bloqueante y abierto.
3. Revisar que la política, los términos, el resumen y el microcopy sean coherentes con «no hay retracto» y con el radicado manual.
4. Entregar texto y ubicación de lo que el sitio debe mostrar, la lista corta de pendientes del dueño y el bloque para el desarrollador.

**Decisiones recibidas del dueño (2026-11-05).**

| Pregunta | Decisión | Observación de legal |
|---|---|---|
| P1 | **B**: plazo estimado y máximo por zona. | Los máximos 3, 6, 10 y 20 días hábiles son la propuesta de legal. El dueño no los ha dado por confirmados: debe cotejarlos con la transportadora o el agregador (A4). No se publican números hasta entonces. |
| P2 | **C**: el café no admite retracto (alimento); garantía legal intacta. | Coincide con la recomendación (LEG-051). Pendiente L2: que el abogado confirme con el Concepto SIC 16-062808 de 2016 y la doctrina posterior. |
| P3 | **a**: radicado manual `PQR-AAAA-NNN` por chat o correo; 15 días hábiles. | Coincide con la recomendación. Falta quién responde (D-3) y abrir la hoja de registro. |
| P9 | **Mantener Café Arreboles activo** sin registro sanitario conocido. | Contra la recomendación de legal (desactivar). Se registra como riesgo aceptado por el dueño; LEG-024 sigue Bloqueante y abierto (LEG-066). |
| P4 a P8, P10 a P12 | Sin respuesta. | Siguen en `checklist-lanzamiento.md` §5.2 con una pregunta cerrada cada una. |

**Alcance revisado.** Solo documentos (`docs/legal/**`, `docs/PENDIENTES.md`). Del código se leyó, sin tocarlo: `src/ui/componentes/checkout/flujo-pedido.tsx` (nota bajo los totales, línea 242; sin línea de retracto ni plazo), `src/app/envios/page.tsx` (constante `PLAZOS`, título «Plazos orientativos», `metadata.description`), `src/ui/componentes/layout/pie.tsx` y `src/app/legal/[slug]/page.tsx` (título «Envíos, devoluciones y retracto»), `studio/schemaTypes/paginas.ts` (mismo título), `data/catalogo.csv` (Arreboles: `registro_sanitario` vacío, `activo = si`). `rg -i "retracto|radicado|Entrega estimada"` en `src/` solo devuelve los títulos del enlace: ningún texto del sitio promete retracto ni plazo.

## Normas y estado de verificación (esta sesión)

| Norma | Qué se usa | Estado |
|---|---|---|
| Ley 1480, art. 47 (excepciones nums. 4 y 6) | Sin retracto para alimentos | Texto leído en la transcripción del Concepto SIC 16-062808 de 2016 (sesión anterior). Secretaría del Senado (ECONNREFUSED), SUIN y Función Pública (certificado) no respondieron el 2026-11-05. VERIFICAR. |
| Ley 1480, art. 50 lit. c) | Deber de informar en el medio electrónico «el derecho de retracto que le asiste al consumidor y el procedimiento para ejercerlo»; precio total | Citado de memoria y de fuentes secundarias; no se pudo leer el texto oficial. VERIFICAR la letra. |
| Ley 1480, art. 50 lits. g) y h) (Ley 2439 de 2024, art. 4) | PQR con radicado, fecha, hora y seguimiento; plazo de entrega informado, sin él 30 días calendario | Leídos en el Diario Oficial 52.975 en sesión anterior. |
| Ley 1480, art. 29 | Lo anunciado obliga (plazo máximo publicado) | VERIFICAR la letra. |
| Ley 1480, arts. 6, 10, 19, 20, 23 | Seguridad del producto, solidaridad proveedor-productor, información | VERIFICAR la letra (advertencia de LEG-066). |
| Res. 2674 de 2013, arts. 37 y ss.; Ley 9 de 1979, arts. 576 y ss. | Obligatoriedad del registro, permiso o notificación sanitaria; medidas y sanciones sanitarias | VERIFICAR artículo y modalidad aplicable al café tostado (riesgo); no se concluye nada sanitario definitivo: consulta a asesor sanitario o INVIMA. |
| Ley 1581, arts. 14 y 15 | Plazos de consultas y reclamos de datos (mismo radicado, distinto plazo) | Verificados en sesión anterior. |
| Concepto SIC 16-062808 de 2016 | Alimentos sin retracto | Copia de Actualícese. VERIFICAR en sic.gov.co; no vinculante (CPACA, art. 28). |

## Hallazgos

| # | Severidad | Ubicación | Texto o práctica | Riesgo y norma | Corrección propuesta |
|---|---|---|---|---|---|
| LEG-063 | **Alta** (dato) | Envíos §6; términos §8; microcopy §5.6 y §5.8; resumen y `/envios/` (sin plazo hoy) | P1 = B decidida, pero los máximos por zona (3, 6, 10 y 20 días hábiles) son propuesta de legal y no están confirmados con la transportadora | Un máximo publicado obliga (art. 29; art. 50 lit. h). Publicar un número que la transportadora no garantiza convierte cada demora en un incumplimiento con devolución en 15 días. Sin número publicado, rige 30 días calendario. | Documentos con una sola redacción (B) y los máximos como `TODO(dato)`. Dato **D-9** al dueño. Mientras la columna `plazo_maximo_dias_habiles` esté vacía, el resumen muestra «Entrega estimada: {estimado}. Si no publicamos un plazo máximo para tu zona, entregamos en máximo 30 días calendario.» (microcopy §5.6, tercer caso) y `/envios/` conserva «Plazos orientativos» más la línea de 30 días (§5.8). |
| LEG-064 | **Alta** hasta implementar D5 (decisión cerrada) | Resumen (`flujo-pedido.tsx`, nota de la línea 242); envíos §9; términos §9; vendedor | P2 = C: el café no admite retracto. El sitio no lo dice en ningún lugar antes de la compra; solo los borradores | El art. 50 lit. c) exige informar el retracto y su procedimiento en el medio electrónico (VERIFICAR la letra); cuando no procede, se informa la exclusión y su razón antes de contratar (art. 23). Si el consumidor se entera después, puede alegar información insuficiente y pedir el retracto como si existiera. | Una sola línea en la nota del resumen, antes de las casillas: `El café es un alimento: no admite retracto. Si llega dañado o equivocado, te respondemos con la garantía.` (microcopy §5.3). Envíos §9, términos §9 y vendedor ya lo dicen; se publican con D1. Se recomienda, además, una frase en «Cómo pedir» (Sanity). Las alternativas A y B se retiraron de los documentos. |
| LEG-065 | Media (operación) | Envíos §12; términos §12; política §3 y §10; vendedor; microcopy §5.7 | P3 = a: radicado manual `PQR-AAAA-NNN`, 15 días hábiles. No hay todavía hoja de registro ni persona asignada | Art. 50 lit. g): constancia de radicado con fecha y hora y seguimiento. Un radicado «a mano» cumple si se entrega siempre, el mismo día, con la hora del mensaje recibido, y si el consecutivo no se repite. El registro es una base de datos personal (Ley 1581, art. 4 lit. b). | Plantilla de respuesta y columnas de la hoja en microcopy §5.7; política §3 describe el registro y §6 le fija plazo (D-6). Dueño: abrir la hoja (D10) y nombrar quién responde (D-3). Un solo consecutivo para PQR de consumo y para consultas y reclamos de datos, con los plazos de cada ley. |
| LEG-066 | **Bloqueante** (riesgo aceptado por el dueño) | `data/catalogo.csv`: `cafe-arreboles`, `registro_sanitario` vacío, `activo = si`; ficha sin fabricante | P9: el dueño decide mantener Café Arreboles en venta sin registro, permiso ni notificación sanitaria conocidos, contra la recomendación de legal (LEG-024) | Vender un alimento sin registro sanitario expone a la tienda a medidas sanitarias de seguridad y sanciones (Res. 2674 de 2013; Ley 9 de 1979, VERIFICAR artículos), a responsabilidad ante la SIC por seguridad e información del producto (Ley 1480, arts. 6, 19, 20, 23, VERIFICAR) y a la solidaridad con el fabricante (art. 10). Un consumidor puede denunciarlo con una foto de la bolsa. Si la bolsa trae un número que la tienda no conoce, el riesgo baja pero la ficha sigue sin identificar al fabricante (Res. 5109 de 2005, art. 5). | Se respeta la decisión y se deja constancia: **LEG-024 sigue Bloqueante y abierto**; el dictamen de lanzamiento se mantiene **No conforme** mientras tanto, aunque todo lo demás se cierre. Lo cierra (a) el número sanitario con el fabricante tal como en la bolsa, verificado en la consulta pública del INVIMA, cargado en `registro_sanitario` y `fabricante` y visible en la ficha; o (b) `activo = no`. Mínimo recomendado mientras tanto: pedir hoy al tostador la foto del rótulo (T1, T2), no destacar ese café en portada y que el dueño confirme por escrito que conoce esta advertencia. Legal no concluye nada sanitario definitivo: la modalidad (registro, permiso o notificación) la define un asesor sanitario o el INVIMA. |
| LEG-067 | Baja (**corregido en los documentos**) | Política §3 y §6 («el retracto cuando aplique», «garantías, retractos y reclamos»); vendedor («retractarte cuando aplique»); envíos §7 («Si ejerces el retracto, cuando aplique») | Menciones al retracto que sobrevivían de las versiones con alternativas | Con P2 = C serían contradictorias con §9 y podrían leerse como que el retracto existe en algún caso (art. 23). | Retiradas en las v0.5. La política ya no cita el retracto; envíos §7 remite a la garantía; vendedor dice que el café no admite retracto y que la garantía se mantiene. |
| LEG-068 | Baja | `src/app/envios/page.tsx` (título «Plazos orientativos», línea 95; `metadata.description`, línea 14; `PLAZOS`); `pie.tsx`, `legal/[slug]/page.tsx`, `paginas.ts` («Envíos, devoluciones y retracto») | Con P1 = B, «orientativos» dejará de ser exacto cuando haya máximos; el título del enlace legal con «retracto» es aceptable porque la página informa la exclusión | Art. 23 (información cierta y actualizada). | Textos de microcopy §5.8 cuando se confirmen los máximos (D6); mientras tanto, conservar «Plazos orientativos» y agregar la línea de 30 días. Título del enlace: se mantiene la recomendación «Envíos, devoluciones, retracto y garantía» (entrega de LEG-049 a 062, punto 1); no se cambia a «sin retracto» porque la palabra ayuda al consumidor a encontrar la información. |

### Estado de hallazgos anteriores

| Hallazgo | Estado al 2026-11-05 (esta revisión) |
|---|---|
| LEG-001 punto 4 (plazo de entrega) | Decidido (P1 = B). Abierto como dato (D-9) e implementación (D4, D6). Pasa a LEG-063. |
| LEG-001 punto 11 (PQR) | Decidido (P3 = a). Abierto hasta la publicación y la hoja de registro. Pasa a LEG-065. |
| LEG-024 (registro sanitario y fabricante) | **Bloqueante, abierto. Riesgo aceptado por el dueño (P9).** Ver LEG-066. |
| LEG-051 (retracto) | Decidido (P2 = C). Texto único en los documentos. Abierto hasta D5 y la publicación. Pasa a LEG-064. |
| LEG-056 (documentos sin publicar) | Abierto. Borradores v0.5 listos para el abogado (L1). |
| LEG-050, LEG-052, LEG-029 | Sin cambio: abiertos. |
| LEG-058 | Abierto (D6). |
| LEG-062 (chats y registro de PQR como bases de datos) | Cubierto en la política v0.5 §3 y §6. Abierto solo por el plazo (D-6). |

## Coherencia comprobada con «no hay retracto» y con el radicado manual

| Texto | Dice (v0.5) | Coherente |
|---|---|---|
| Envíos §9 | «El café es un alimento. Por eso, según la ley, no aplica el derecho de retracto… Esto no afecta tu garantía…» | Sí |
| Términos §9 | Igual, en corto; remite a la garantía (§10) y al desistimiento antes de la firmeza (§6) | Sí |
| Términos §5 paso 3 | «…te recordamos que el café no admite retracto (numeral 9)» | Sí (anuncia la línea del resumen) |
| Vendedor, «Cómo te atendemos» | «El café es un alimento y no admite retracto; la garantía legal se mantiene.» | Sí |
| Política §3 y §6 | Sin retracto; «garantía y reclamos» | Sí |
| Resumen (D5, pendiente) | microcopy §5.3 | Sí, cuando se implemente |
| Mensaje de WhatsApp | No menciona el retracto | Correcto: no hace falta; la información previa va en el resumen y en las páginas. Si el abogado prefiere prueba en el mensaje, puede agregarse «Sé que el café no admite retracto.» a la línea de LEG-050 (no se recomienda: alarga el mensaje y la línea de aceptación de términos ya lo cubre). |
| Envíos §12, términos §12, vendedor, política §10 | Radicado `PQR-2026-001`, fecha y hora, por el mismo canal; 15 días hábiles (consumo) y plazos de la Ley 1581 (datos) | Sí |
| Términos §6 y pantalla de confirmación | «Tu compra queda en firme cuando tú aceptas en el chat esa confirmación» | Sí: el desistimiento antes de la firmeza no es retracto y sigue siendo gratuito |

## Dictamen

- **Documentos v0.5** (envíos, términos, política, vendedor, microcopy) y checklist v0.2: **Conforme con observaciones** como borradores para el abogado. Observaciones: TODO(dato) de datos (domicilio, dígito de verificación, máximos por zona, comisión, agregador, mensajero, plazos de conservación, área de datos) y decisiones P4 a P8 y P10 a P12.
- **Lanzamiento: No conforme.** Bloqueos abiertos: domicilio del vendedor; **LEG-024 / LEG-066** (Café Arreboles activo sin registro conocido, riesgo aceptado por el dueño; fabricante sin mostrar); LEG-056 (documentos sin aprobar ni publicar). Altas abiertas: LEG-063 (máximos sin confirmar), LEG-064 (línea de retracto sin implementar), LEG-050, LEG-052, LEG-029.
- Aunque se cierren todos los demás puntos, **con LEG-066 abierto el dictamen de lanzamiento no pasa de No conforme.**

## Qué debe mostrar el sitio por estas decisiones (texto exacto y ubicación)

| # | Dónde | Texto exacto | Cuándo |
|---|---|---|---|
| 1 | Resumen, bajo la línea de envío (`caption`), zonas 1 a 4 | `Entrega estimada: {plazo_estimado}. Máximo {plazo_maximo_dias_habiles} días hábiles desde que confirmamos tu pedido.` | Cuando el máximo de la zona esté en el CSV (D-9) |
| 2 | Resumen, mismo lugar, zona 5 | `Entrega estimada: {plazo_estimado}, en la oficina de la transportadora. Máximo {plazo_maximo_dias_habiles} días hábiles desde que confirmamos tu pedido y el envío.` | Ídem |
| 3 | Resumen, mismo lugar, mientras el máximo esté vacío | `Entrega estimada: {plazo_estimado}. Si no publicamos un plazo máximo para tu zona, entregamos en máximo 30 días calendario.` | Ya |
| 4 | Resumen, nota bajo los totales, antes de las casillas (junto a «La forma de pago se confirma por WhatsApp…») | `El café es un alimento: no admite retracto. Si llega dañado o equivocado, te respondemos con la garantía.` | Ya |
| 5 | `/envios/`, título de la sección de plazos | `Plazos de entrega` | Con D-9 (antes, conservar «Plazos orientativos») |
| 6 | `/envios/`, frase bajo el título | `El estimado es lo que suele tardar. El máximo es el plazo que nos comprometemos a cumplir. Los dos se cuentan en días hábiles desde que confirmamos tu pedido por el chat y, si pagas por transferencia, desde que recibimos el pago. Si no entregamos en el máximo, puedes cancelar y te devolvemos todo en 15 días calendario.` | Con D-9 |
| 7 | `/envios/`, cada zona | `Estimado: {plazo_estimado}. Máximo: {plazo_maximo_dias_habiles} días hábiles.` | Con D-9 |
| 8 | `/envios/`, línea final de la sección, mientras no haya máximos | `Si no publicamos un plazo máximo para tu zona, entregamos en máximo 30 días calendario, como manda la ley.` | Ya |
| 9 | `/envios/`, `metadata.description` | `…tarifas por peso y plazos de entrega desde Bucaramanga.` | Con D-9 |
| 10 | `/legal/envios-devoluciones/` §9 y §12, `/legal/terminos/` §9 y §12, `/legal/vendedor/` | Textos v0.5 de los documentos | Con D1, tras la aprobación del abogado |
| 11 | Chat o correo de la tienda (no es código) | `Recibimos tu solicitud. Radicado PQR-2026-001, recibido el 05/11/2026 a las 10:32. Te respondemos a más tardar el {fecha}. Con ese número puedes preguntarnos cómo va.` | Desde la publicación de los documentos |
| 12 | «Cómo pedir» (Sanity), recomendado | `El café es un alimento y no admite retracto; sí tiene garantía legal.` | Cuando exista el proyecto de Sanity |

## Lo que sigue pendiente del dueño (una pregunta cerrada por ítem)

1. **D-9.** ¿Confirmas con la transportadora los plazos máximos de 3, 6, 10 y 20 días hábiles para las zonas 1, 2-3, 4 y 5? «Sí, esos» o «no, estos: …».
2. **D-1 / D-2.** ¿Cuál es la dirección de notificación judicial y el dígito de verificación del NIT, tal como figuran en Cámara de Comercio y RUT?
3. **P4.** Bre-B con fraude o pedido no recibido: ¿publicamos el compromiso propio (A) o nada hasta que decida el abogado (B)?
4. **P5.** ¿Sí o no a cada uno? a) reintento por dirección errada lo paga el cliente; b) «reclamar en oficina» sin costo; c) la diferencia de la guía la asume la tienda.
5. **P6.** ¿El café llega a la bolsa por maquila con tu marca (A), lo empacas tú (B) o revendes la bolsa del tostador (C)? ¿Quién tuesta cada café?
6. **P7.** ¿El agregador cobra comisión de recaudo en contraentrega? a) sí y la asume la tienda; b) sí y se suma al envío; c) no.
7. **P8.** «Casa Martínez» y «Arreboles»: ¿son líneas tuyas con autorización de la finca (a) o marcas de un tercero (b)?
8. **P10.** ¿Mostramos ya razón social, NIT, correo y WhatsApp aunque falte el domicilio? Sí o no.
9. **P11.** ¿Cambiamos la primera línea del mensaje a «Quiero hacer este pedido:»? Sí o no.
10. **P12.** ¿Habrá promociones por WhatsApp o correo? a) no por ahora; b) sí.
11. **D-3.** ¿Quién (nombre o cargo) responde las PQR y las consultas de datos?
12. **T1, T2 (al tostador, por el dueño).** ¿Cuál es el número sanitario y el fabricante o envasador de Café Arreboles tal como figura en la bolsa? Mientras no llegue, ¿confirmas por escrito que conoces la advertencia de LEG-066?

## Entrega para desarrollador-fullstack (ajustada)

Sustituye los puntos 4, 5, 6 y 7 de la entrega de `2026-11-05-actualizacion-documentos.md`. El resto (1, 2, 3, 8, 9) no cambia.

4. **Plazo de entrega** (D4; LEG-063).
   - Columnas `plazo_estimado` (texto) y `plazo_maximo_dias_habiles` (entero o **vacío**) por zona, en `data/tarifas_envio.csv` o en un CSV nuevo `data/plazos_envio.csv` (`zona,plazo_estimado,plazo_maximo_dias_habiles`). Estimados: zona 1 `Mismo día o siguiente día hábil`; zonas 2 y 3 `1 a 3 días hábiles`; zona 4 `2 a 6 días hábiles`; zona 5 `5 a 12 días hábiles`. **Máximos: dejar vacíos** hasta D-9; no cargar 3, 6, 10 y 20.
   - Resumen (`flujo-pedido.tsx`), bajo la línea de envío, en `caption`: los tres textos de microcopy §5.6 según la zona y si el máximo existe. El texto se arma en `src/domain/pedido/` (función pura con pruebas), no en el componente.
   - `npm run datos`: validar que `plazo_maximo_dias_habiles` sea entero positivo o vacío.
5. **Retracto en el resumen** (D5; LEG-064). En la nota de la línea 242 de `flujo-pedido.tsx`, antes de las casillas, agregar como primera frase o como párrafo `caption` propio: `El café es un alimento: no admite retracto. Si llega dañado o equivocado, te respondemos con la garantía.` No va en la ficha ni en el carrito. Texto definitivo: no esperar más decisiones.
6. **`/envios/`** (D6; LEG-068, LEG-058).
   - Ya: agregar al final de la sección de plazos `Si no publicamos un plazo máximo para tu zona, entregamos en máximo 30 días calendario, como manda la ley.`; cambiar «¿Tu destino no aparece o pides más de 5 kg?» por `¿Tu destino es de zona 5 o pides más de 5 kg?`.
   - Leer los plazos del CSV del punto 4 en lugar de la constante `PLAZOS`. Mientras los máximos estén vacíos, conservar el título «Plazos orientativos» y la frase actual. Cuando existan: título `Plazos de entrega`, frase y formato por zona de microcopy §5.8, y `metadata.description` con «plazos de entrega».
7. **Catálogo** (D7; LEG-024, LEG-066). Columna `fabricante` (y `fabricante_expresion`: `FABRICADO POR` o `ENVASADO POR`), mostrada según microcopy §3 solo si existe. **Café Arreboles no se desactiva**: el dueño decidió mantenerlo activo. Se recomienda que `npm run datos` **avise** (no falle) cuando un café activo no tenga `registro_sanitario`, con el texto `AVISO legal: {slug} está activo sin registro sanitario (LEG-024, riesgo aceptado por el dueño el 2026-11-05)`. Si el dueño cambia de opinión, `activo = no`.
10. **Títulos del enlace legal** (recomendación de LEG-049 a 062, punto 1, sin cambio): «Envíos, devoluciones, retracto y garantía» en `pie.tsx`, `legal/[slug]/page.tsx`, `paginas.ts` y el enlace del resumen.

**Para `disenador-marca`.** La línea de retracto y la de plazo van en `caption` gris, como la nota actual del resumen; la de plazo bajo la línea de envío, la de retracto antes de las casillas. En `/envios/`, el formato «Estimado: … Máximo: …» por zona reemplaza el texto único del `dd`. Nada más cambia.

**Para el dueño (no es código).** Abrir la hoja de registro de PQR con las columnas de microcopy §5.7 y guardar la plantilla de respuesta en el teléfono de la tienda.

## Puntos para que QA verifique

- El resumen muestra, bajo la línea de envío, `Entrega estimada: {estimado}. Si no publicamos un plazo máximo para tu zona, entregamos en máximo 30 días calendario.` para las cinco zonas mientras `plazo_maximo_dias_habiles` esté vacío; y el texto con «Máximo {n} días hábiles…» cuando se cargue un valor (probar con un CSV de prueba).
- El resumen muestra, antes de las casillas, `El café es un alimento: no admite retracto. Si llega dañado o equivocado, te respondemos con la garantía.` en todas las zonas, con tarifa y por cotizar.
- `rg -n "retracto" src out` solo devuelve la línea del resumen y los títulos de enlace; ninguna página ofrece retracto.
- `/envios/` muestra la línea de 30 días calendario y ya no dice «¿Tu destino no aparece…?».
- `/legal/envios-devoluciones/`, `/legal/terminos/` y `/legal/vendedor/` (cuando se publiquen) dicen que el café no admite retracto, el plazo por zona y el radicado `PQR-AAAA-NNN` con 15 días hábiles; ninguna contiene `TODO`, `DECISIÓN`, `VERIFICAR`, `[` ni `<!--`.
- `/legal/privacidad/` no menciona el retracto.
- `npm run datos` avisa por Café Arreboles activo sin registro y no falla por ello; la ficha de Arreboles no muestra «Registro sanitario:» ni fabricante mientras los campos estén vacíos.
- Café Arreboles no aparece como destacado en la portada (recomendación de LEG-066) si el dueño la acepta.

## Normas marcadas VERIFICAR

- Ley 1480, arts. 6, 10, 19, 20, 23, 29, 47 (cotejo con SUIN), 50 lits. a) y c), 58 num. 5.
- Concepto SIC 16-062808 de 2016 en sic.gov.co, y doctrina posterior (L2).
- Res. 2674 de 2013 (artículo que impone el registro, permiso o notificación; modalidad para café tostado) y Ley 9 de 1979, arts. 576 y ss. (medidas y sanciones).
- Res. 5109 de 2005, art. 5 (identificación del fabricante o envasador).
- Las demás marcadas en `2026-11-05-actualizacion-documentos.md` siguen vigentes.
