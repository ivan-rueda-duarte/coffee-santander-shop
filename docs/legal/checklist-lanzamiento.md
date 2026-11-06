> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.2 — 2026-11-05.

# Checklist de lanzamiento legal

Reúne todos los hallazgos **abiertos** de severidad Bloqueante y Alta de LEG-001 a LEG-068, más los Media que condicionan la publicación. Fuente: `docs/legal/revisiones/` (LEG-001 a LEG-048), `2026-11-05-actualizacion-documentos.md` (LEG-049 a LEG-062) y `2026-11-05-decisiones-dueno.md` (LEG-063 a LEG-068). Se actualiza en cada revisión.

Cambios de la v0.2 (2026-11-05): el dueño respondió **P1 = B**, **P2 = C**, **P3 = a** y **P9 = mantener Café Arreboles activo** (contra la recomendación de legal). Los documentos pasaron a v0.5 con las tres primeras decisiones. P4 a P8 y P10 a P12 siguen abiertas.

## 1. «Revisar el No conforme de legal, ¿qué hacer con eso?»

**Qué significa.** «No conforme» no quiere decir que el sitio esté mal hecho. Quiere decir que, **hoy, no se puede vender** con él sin un riesgo legal serio. Estado de los cuatro bloqueos al 2026-11-05:
1. **Falta el domicilio del vendedor.** La ley exige publicar la dirección de notificación judicial (Ley 1480, art. 50 lit. a). **Abierto.**
2. **Café Arreboles se ofrece sin registro, permiso ni notificación sanitaria conocidos,** y ninguno de los dos cafés dice quién lo fabrica o envasa (LEG-024). El dueño decidió mantenerlo activo (P9). **Abierto: riesgo aceptado por el dueño**, ver el recuadro siguiente.
3. **Las casillas del pedido enlazan a documentos que no están publicados:** términos y política de datos (LEG-047, LEG-056). **Abierto**: los borradores v0.5 están listos para el abogado.
4. **Faltan decisiones que cambian lo que se le promete al cliente.** **Cerrado en lo esencial**: plazo por zona (P1 = B), sin retracto (P2 = C) y radicado manual (P3 = a). Queda un dato: los **plazos máximos por zona** deben confirmarse con la transportadora antes de publicarlos (LEG-063).

**Café Arreboles: qué implica la decisión P9 (riesgo aceptado por el dueño).** Legal recomendó desactivarlo hasta tener el número; el dueño decidió dejarlo activo. Se registra como **LEG-024 Bloqueante, abierto**, con esta advertencia para que la decisión sea informada:
- **Qué exige la norma.** Todo alimento que se comercialice en Colombia debe contar con registro, permiso o notificación sanitaria del INVIMA según su riesgo (Res. 2674 de 2013, arts. 37 y ss., VERIFICAR el artículo; Ley 9 de 1979), y su rótulo debe mostrar ese número y quién lo fabrica o envasa (Res. 5109 de 2005, art. 5). La ficha web no debe contradecir la bolsa (Ley 1480, art. 23).
- **Qué puede pasar si se vende sin él.** (i) El INVIMA o la secretaría de salud pueden aplicar medidas sanitarias de seguridad (decomiso, suspensión de la venta) y sanciones (amonestación, multa, cierre), tanto al fabricante como a quien comercializa (Ley 9 de 1979, arts. 576 y ss., VERIFICAR). (ii) Ante la SIC, De Santander responde como proveedor por la seguridad e información del producto (Ley 1480, arts. 6, 19, 20 y 23, VERIFICAR la letra) y es solidariamente responsable con el fabricante (art. 10). (iii) Un consumidor puede denunciarlo con una foto de la bolsa. (iv) Si la bolsa sí trae un número y la tienda no lo conoce, el riesgo es menor pero sigue existiendo: la ficha no puede mostrar un dato que no tiene, y hoy no identifica al fabricante.
- **Qué lo cierra.** Cualquiera de estas dos cosas: (a) el número de registro, permiso o notificación sanitaria de Café Arreboles, con el nombre del fabricante o envasador tal como figura en la bolsa, verificado en la consulta pública del INVIMA, cargado en `data/catalogo.csv` (`registro_sanitario`, `fabricante`) y visible en la ficha; o (b) `activo = no` hasta tenerlo.
- **Mientras tanto, lo mínimo que se recomienda (no sustituye el cierre):** pedir hoy al tostador una foto del rótulo de Arreboles (T1 y T2); no destacar ese café en la portada; y que el dueño confirme por escrito que conoce esta advertencia. El dictamen de lanzamiento sigue **No conforme** mientras el bloqueo esté abierto.

**Qué hacer.** Son pocas acciones y casi todas son datos o decisiones, no código:
- el dueño entrega el domicilio, confirma los **plazos máximos** con la transportadora y responde las **preguntas pendientes de la sección 5**;
- en paralelo, se piden tres respuestas por escrito: al **contador**, al **tostador** y al **agregador** (sección 6);
- el **abogado** aprueba los borradores v0.5;
- el **desarrollador** los publica y aplica los cambios de la sección 7, y **QA** lo verifica.

### Camino más corto a «Conforme con observaciones»

| Paso | Quién | Qué | Cierra | Estado |
|---|---|---|---|---|
| 1 | Dueño | Entregar el domicilio y el dígito de verificación del NIT. Responder P7 (comisión) y P10 a P12. Confirmar con la transportadora los plazos máximos por zona (propuesta: 3, 6, 10 y 20 días hábiles). | Bloqueo 1; dato de LEG-063 | P1, P2 y P3 respondidas. Resto pendiente. |
| 2 | Tostador (por el dueño) | Razón social y dirección del fabricante o envasador de los dos cafés, tal como en la bolsa; número sanitario de Arreboles; confirmación de que la NSA-003219-2017 está vigente y es de Casa Martínez. | Bloqueo 2 | Pendiente. |
| 3 | Desarrollador | Agregar la columna `fabricante` y mostrarla en la ficha. (Desactivar Arreboles ya no es una tarea: el dueño decidió mantenerlo; si cambia de opinión, `activo = no`.) | Parte del bloqueo 2 | Pendiente. |
| 4 | Legal | Pasar los documentos a v0.5 con las respuestas. | — | **Hecho** para P1, P2 y P3. Quedan TODO(dato) de datos, no de decisiones (ver §4). |
| 5 | Abogado | Aprobar los cuatro documentos (pasan a v1.0). | Bloqueo 3 (texto) | Pendiente. |
| 6 | Desarrollador | Publicar los cuatro documentos (sección 7, D1). Cambiar la casilla de datos (D2), poner el plazo en el resumen (D4) y la línea de retracto (D5). | Bloqueo 3 (publicación) | Pendiente. D5 ya tiene texto definitivo; D4 depende de los máximos confirmados. |
| 7 | Contador | Confirmar por escrito que el precio publicado es el precio total (IVA del café y del flete). | Condición previa LEG-029 | Pendiente. |
| 8 | QA y legal | QA verifica y legal emite la revisión de lanzamiento. | Dictamen | — |

Con los pasos 1 a 8, el dictamen pasa a **Conforme con observaciones**, **salvo que el bloqueo 2 siga abierto**: con Café Arreboles activo y sin registro conocido, el dictamen de lanzamiento se mantiene en **No conforme** aunque todo lo demás esté cerrado. Las observaciones que quedarían abiertas, y que no impiden vender, son: modelo de comercialización (LEG-022), autorización de los nombres (LEG-023), soporte de las fincas (LEG-025), manual interno de datos, Registro Nacional de Bases de Datos, registro de la marca, reversión del pago con Bre-B y la confirmación del agregador.

### Qué se puede publicar ya, sin riesgo
- **Páginas que no venden:** la Historia (ya dice «de la finca a tu taza», LEG-031 cerrado), las provincias y la página de envíos (`/envios/`), con la corrección del título «Plazos orientativos» de D6.
- **Información del vendedor con los datos que ya existen** (razón social, NIT, correo y WhatsApp), si se aplica D3. Es información verdadera y no crea riesgo. El domicilio se agrega cuando llegue.
- **Los cambios de texto** de las casillas (D2) y de la primera línea del mensaje (D8). Solo mejoran lo que ya está.
- **No se puede publicar todavía:** el carrito y el pedido por WhatsApp abiertos al público, ni ninguno de los cuatro documentos legales antes de que el abogado los apruebe. Café Arreboles: legal mantiene que no debería venderse sin registro conocido; el dueño asumió el riesgo (P9).
- **Alternativa si se quiere salir antes** (decisión del dueño con el desarrollador): un «modo vitrina» sin carrito. El catálogo se muestra solo con Café Casa Martínez y un botón «Pregúntanos por WhatsApp» sin pedido armado. Así no se usan las casillas. Igual hace falta el domicilio, y la venta por el chat sigue sujeta a la Ley 1480. Reduce el riesgo, pero no lo elimina.

## 2. Tabla de requisitos

Grupos: **(a)** lo cierra legal con documentos; **(b)** lo decide el dueño; **(c)** lo exige un tercero (contador, agregador, fincas, tostador, abogado); **(d)** lo implementa el desarrollador. Varios requisitos pasan por más de un grupo: se indica el orden.

Estados: **Cumple**, **No cumple**, **Falta dato**. «Borrador listo» significa que el texto existe pero no está aprobado ni publicado.

| # | Hallazgo | Severidad | Requisito | Norma | Dónde se cumple en el sitio | Estado | Responsable | Quién desbloquea | Grupo |
|---|---|---|---|---|---|---|---|---|---|
| 1 | LEG-024, LEG-021 a 030 | **Bloqueante** | Identificar al vendedor: razón social, NIT, domicilio, correo y teléfono | Ley 1480, art. 50 lit. a (VERIFICAR la letra) | Pie, `/legal/vendedor/`, términos §2 | **Falta dato** (domicilio; DV del NIT) | Dueño | Dueño | b → a → d |
| 2 | LEG-024, LEG-066 | **Bloqueante** | No vender alimentos sin registro, permiso o notificación sanitaria | Res. 2674 de 2013 (VERIFICAR modalidad y artículo); Ley 9 de 1979 | `data/catalogo.csv`, `registro_sanitario`; ficha | **No cumple** (Café Arreboles, `activo = si`, sin número). **Riesgo aceptado por el dueño el 2026-11-05 (P9), contra la recomendación de legal.** Ver §1. | Dueño | Tostador (T1, T2): número y fabricante; o `activo = no` | c → d |
| 3 | LEG-059 | Alta | Registro de Casa Martínez vigente y del producto que se vende | Res. 2674 de 2013 (VERIFICAR vigencia de la NSA y titular) | Ficha | **Falta dato** (NSA-003219-2017 cargada; sin confirmar vigencia ni titular) | Dueño | Tostador / asesor sanitario | c |
| 4 | LEG-024 | Alta | La ficha no contradice el rótulo: «FABRICADO POR» o «ENVASADO POR» | Res. 5109 de 2005, art. 5 num. 5.4.1; Ley 1480, art. 23 | Ficha (columna `fabricante`, no existe) | **No cumple** | Desarrollador | Tostador (dato) | c → d |
| 5 | LEG-047, LEG-049 | **Bloqueante** | Política de tratamiento de datos publicada antes de pedir la autorización | Ley 1581, arts. 12 y 17; Decreto 1377, art. 13 (VERIFICAR) | `/legal/privacidad/` (hoy «en preparación») | **No cumple** (borrador v0.1 listo) | Legal / abogado / desarrollador | Abogado (aprobación) y dueño (TODO de la política) | a → c → d |
| 6 | LEG-056 | **Bloqueante** | Términos publicados antes de que se acepten | Ley 1480, art. 37 (condiciones generales: conocidas antes de contratar; VERIFICAR); art. 50 | `/legal/terminos/` (hoy «en preparación») | **No cumple** (borrador v0.1 listo) | Legal / abogado / desarrollador | Abogado | a → c → d |
| 7 | LEG-001 punto 7, LEG-056 | Alta | Envíos, retracto y garantía publicados antes de la compra | Ley 1480, arts. 23, 47 y 50 | `/legal/envios-devoluciones/` | **No cumple** (borrador v0.5 listo; decisiones 1, 2 y 3 aplicadas) | Legal / abogado / desarrollador | Dueño (P4, P5, P7 y máximos por zona) y abogado | b → a → c → d |
| 8 | LEG-001 punto 4, LEG-063 | Alta | Plazo de entrega informado antes de finalizar | Ley 1480, art. 50 lit. h (Ley 2439 de 2024, verificado) | Resumen; `/envios/`; envíos §6 | **Falta dato** (P1 = B decidida; los máximos 3, 6, 10 y 20 días hábiles son propuesta de legal, sin confirmar con la transportadora). Texto listo en microcopy §5.6 y §5.8. | Dueño | Dueño con la transportadora o el agregador (A4); después el desarrollador (D4, D6) | b → c → d |
| 9 | Riesgo 1, LEG-051, LEG-064 | Alta | Informar la exclusión del retracto antes de comprar | Ley 1480, arts. 47 y 50 lit. c (VERIFICAR la letra); Concepto SIC 16-062808 de 2016 | Envíos §9; términos §9; vendedor; resumen (microcopy §5.3) | **Decidido (P2 = C), texto listo; no cumple en el sitio** hasta D5 y la publicación | Desarrollador | Abogado (L2 confirma la C); desarrollador (D5) | a → c → d |
| 10 | LEG-001 punto 11, LEG-065 | Alta (condición previa) | Canal de PQR con radicado, fecha, hora y seguimiento | Ley 1480, art. 50 lit. g (Ley 2439 de 2024) | Envíos §12; términos §12; vendedor; plantilla microcopy §5.7 | **Decidido (P3 = a), texto listo**; cumple cuando se publiquen los documentos y la tienda tenga la hoja de registro | Dueño (operación) | Abogado (aprobación); dueño (hoja y persona que responde, D-3) | a → c |
| 11 | LEG-029 | Alta (condición previa) | Precio publicado = precio total con impuestos | Ley 1480, art. 50 lit. c | Fichas, carrito, resumen, mensaje, `/envios/` | **Falta dato** (declaración del dueño sin confirmar) | Dueño | Contador | c |
| 12 | LEG-052 | Alta | El costo de la contraentrega (comisión de recaudo) se conoce antes del pedido | Ley 1480, art. 50 lit. c | Tarifa de envío; resumen | **Falta dato** | Dueño | Agregador → dueño (P7) | c → b → d |
| 13 | LEG-050 | Alta | Prueba de la autorización de datos y de la aceptación de los términos | Ley 1581, art. 17 lit. b; Decreto 1377, art. 8 (VERIFICAR) | Mensaje de WhatsApp (microcopy §5.2) | **No cumple** | Desarrollador | Desarrollador (después de la aprobación) | d |
| 14 | LEG-044, LEG-054 | Media | Casilla de autorización con responsable, finalidades y tratamiento fuera de Colombia, sin marcar y separada | Ley 1581, arts. 9, 12 y 26 | Resumen (`flujo-pedido.tsx`) | **Cumple** (texto v0.3); ajuste v0.4 recomendado | Desarrollador | — | d |
| 15 | LEG-040 | Alta (resuelta con condición) | Documento opcional, con finalidad acreditada | Ley 1581, art. 4 lits. b y c | Formulario (`DOCUMENTO_OBLIGATORIO = false`) | **Cumple**, con la condición de que el contador confirme la factura a nombre del comprador. Si no la confirma, se retira el campo. | Dueño | Contador | c → d |
| 16 | LEG-022 | Alta | «Marca propia» veraz según el modelo de comercialización | Ley 1480, arts. 23, 30; art. 5 num. 13 | Bajada, pie, Historia, metadatos, términos §2 | **Falta dato** | Dueño | Dueño (P6) | b |
| 17 | LEG-023 | Alta | Derecho a usar los nombres «Casa Martínez» y «Arreboles» | Ley 1480, arts. 23, 30; Decisión 486 de la CAN (VERIFICAR) | Catálogo | **Falta dato** | Dueño | Fincas o tostador (autorización escrita) | b → c |
| 18 | Riesgo 4 | Media | Terceros y países en la política; contrato de transmisión si aplica | Ley 1581, art. 26; Decreto 1377, art. 25 (VERIFICAR) | Política §7 | **Falta dato** (agregador, modalidad de WhatsApp, mensajero) | Legal | Dueño y agregador; abogado califica | a → c |
| 19 | Riesgo 2 | Media | Reversión del pago informada si aplica | Ley 1480, art. 51; Decreto 587 de 2016 | Envíos §10 | **Falta dato** | Dueño | Dueño (P4) y abogado | b → c |
| 20 | — | Media | Manual interno de políticas y procedimientos de datos | Ley 1581, art. 17 lit. k (verificado) | Documento interno | **No cumple** | Abogado | Abogado | c |
| 21 | — | Media | Registro Nacional de Bases de Datos, solo si se supera el umbral | Ley 1581, art. 25; Decreto 090 de 2018 (VERIFICAR) | — | **Falta dato** (activos) | Dueño | Contador | c |
| 22 | LEG-055 | Media | Datos del vendedor visibles | Ley 1480, art. 50 lit. a | Pie y `/legal/vendedor/` ocultan todo mientras falte el domicilio | **No cumple** | Desarrollador | Desarrollador (D3) | d |
| 23 | LEG-025 | Media | Soporte de recolección manual, secado al sol, altitud, variedad y proceso | Ley 1480, arts. 23 y 29 | Historia, fichas | **Falta dato** | Dueño | Fincas o tostador | c |
| 24 | Riesgo conocido | Media | Marca «De Santander» registrada antes de usar ® | Decisión 486 de la CAN | Sitio (no se usa ®) | **Falta dato** | Dueño | Abogado (consulta SIC) | c |
| 25 | — | Informativa | Casillas sin marcar y separadas | Ley 1581, art. 9; Ley 1480, art. 50 | Resumen | **Cumple** | — | — | — |
| 26 | — | Informativa | Envío visible antes del pago (zonas 1 a 4); «por cotizar» aceptado antes de pagar | Ley 1480, art. 50 | Carrito, resumen, mensaje | **Cumple** | — | — | — |
| 27 | — | Informativa | Sin puntajes SCA ni sellos sin verificar | Ley 1480, arts. 23, 29 | Fichas | **Cumple** | — | — | — |
| 28 | LEG-031 | Informativa | Historia sin «hasta tu casa» | Ley 1480, arts. 23, 29, 30 | `secciones-inicio.tsx` («de la finca a tu taza») | **Cumple** | — | — | — |
| 29 | LEG-043 | Informativa | Sin datos personales en analítica ni en localStorage | Ley 1581, art. 4 lit. g | Sin analítica; localStorage solo con carrito, forma de pago y municipio | **Cumple** (el mensaje en la URL `wa.me` es inherente al flujo y la política lo informa) | — | — | — |

## 3. Por grupo

**(a) Lo cierra legal con documentos.** Hecho: términos, política (con aviso y casilla), envíos, información del vendedor y microcopy, todos en **v0.5** con P1 = B, P2 = C y P3 = a aplicadas y sin alternativas. Quedan TODO(dato) que son datos, no decisiones: domicilio, dígito de verificación, máximos por zona confirmados, comisión de contraentrega, agregador y mensajero, plazos de conservación, área que atiende datos.

**(b) Lo decide el dueño.** Respondidas: P1, P2, P3 y P9. Pendientes: P4 a P8 y P10 a P12 (sección 5) y los datos D-1 a D-8, más D-9 (máximos por zona).

**(c) Lo exige un tercero.** Contador (C1 a C5), tostador y fincas (T1 a T5), agregador (A1 a A5) y abogado (L1 a L7) (sección 6).

**(d) Lo implementa el desarrollador.** D1 a D9 (sección 7 y la entrega de LEG-049 a LEG-062).

## 4. Datos que debe entregar el dueño

| # | Dato | Para qué |
|---|---|---|
| D-1 | Domicilio y dirección de notificación judicial, tal como en el certificado de Cámara de Comercio | Bloqueo 1 |
| D-2 | Dígito de verificación del NIT (del RUT) y forma exacta de la razón social («SAS» o «S.A.S.») | Identificación |
| D-3 | Área o cargo que atiende consultas y reclamos de datos | Política §1 |
| D-4 | ¿La tienda usa la aplicación WhatsApp Business o la plataforma (API)? | Política §7 y nota B |
| D-5 | ¿Quién hace la entrega en zona 1? (domiciliario propio, DiDi, Uber…) | Política §7 |
| D-6 | Plazos de conservación de chats y registro de PQR. Propuesta de legal: 12 meses desde la entrega para chats y el plazo que fije el contador para la factura. | Política §6 |
| D-7 | ¿Los teléfonos y cuentas de la tienda tienen clave y verificación en dos pasos? | Política §11 (si no, se quita la frase) |
| D-8 | Activos totales de la sociedad (aproximado), para saber si debe inscribirse en el RNBD | Ítem 21 |
| D-9 | Plazos máximos por zona confirmados con la transportadora o el agregador (propuesta de legal: zona 1, 3; zonas 2 y 3, 6; zona 4, 10; zona 5, 20 días hábiles). Respuesta esperada: «confirmo esos números» o «estos otros: …» | Ítem 8 (LEG-063); envíos §6; microcopy §5.6 y §5.8 |

## 5. Preguntas para el dueño

Cada pregunta se responde con una letra. La opción recomendada va marcada. El texto de cada opción ya está redactado en el documento que se indica.

### 5.1 Respondidas el 2026-11-05 (aplicadas en los documentos v0.5)

| Pregunta | Respuesta del dueño | Qué quedó | Qué falta |
|---|---|---|---|
| **P1. Plazo de entrega** | **B**: estimado y máximo por zona. | Envíos §6, términos §8, microcopy §5.6 y §5.8 con una sola redacción. La opción A se retiró. | **D-9**: confirmar los máximos (3, 6, 10 y 20 días hábiles) con la transportadora. Legal los propuso; el dueño aún no los ha dado por confirmados. No se publican números hasta entonces. |
| **P2. Retracto** | **C**: el café no admite retracto (alimento); garantía legal intacta. | Envíos §9, términos §9, vendedor y microcopy §5.3 con una sola redacción. Las alternativas A y B se retiraron. P5 d) ya no aplica. | Que el abogado confirme la C (L2) y que el desarrollador ponga la línea del resumen (D5). |
| **P3. PQR** | **a**: radicado manual `PQR-AAAA-NNN` por chat o correo; 15 días hábiles. | Envíos §12, términos §12, vendedor, política §3 y §10, plantilla en microcopy §5.7. Las opciones b y c se retiraron. | Nombre o cargo de quien responde (D-3; no se publica) y abrir la hoja de registro. |
| **P9. Café Arreboles** | **Mantenerlo activo** sin registro conocido. Contra la recomendación de legal (a: desactivar). | Registrado como riesgo aceptado por el dueño. LEG-024 sigue **Bloqueante, abierto**; LEG-066 documenta la decisión y la advertencia (§1). | T1 y T2 al tostador (número y fabricante). Hasta entonces el lanzamiento es **No conforme**. |

### 5.2 Pendientes (una pregunta cerrada por ítem)

**P4. Pagos por Bre-B con fraude o pedidos no recibidos.** ¿Publicamos el compromiso propio (A) o no publicamos nada hasta que el abogado decida (B)?
- **A (recomendada).** Compromiso propio: avisas en 5 días hábiles, revisamos y, si procede, devolvemos el dinero en 15 días calendario.
- **B.** No se publica nada hasta que el abogado decida si la reversión legal aplica a Bre-B.
- Texto: envíos §10.

**P5. Costos operativos.** ¿Sí o no a cada uno?
- a) El nuevo intento de entrega por una dirección incorrecta o porque nadie recibe lo paga el cliente. **Recomendado: sí.**
- b) «Reclamar en oficina» no tiene costo adicional. **Recomendado: sí.**
- c) Si la guía real cuesta más que la tarifa publicada, la diferencia la asume la tienda. **Recomendado: sí**, y la ley no permite cobrarla después.
- d) Eliminada: solo aplicaba si P2 era A o B.

**P6. ¿Cómo llega el café a la bolsa De Santander?** ¿A, B o C, y quién tuesta cada café?
- **A.** Un tostador lo tuesta y empaca con la marca De Santander (maquila). Es el modelo recomendado si es el caso real.
- **B.** Compras café tostado a granel y lo empacas tú con tu marca.
- **C.** Revendes bolsas con la marca del tostador. Si es C, cambian la bajada, el pie, la Historia y los metadatos (textos en LEG-021 a 030).

**P7. ¿El agregador cobra comisión por recaudar el efectivo contraentrega?** ¿a, b o c? (Pregúntalo al agregador si no lo sabes.)
- **a (recomendada).** Sí cobra, y la tienda la asume dentro de la tarifa publicada. No hay que cambiar nada en el sitio.
- **b.** Sí cobra, y se suma al envío. El sitio tendría que mostrarla antes del pedido: requiere desarrollo.
- **c.** No cobra.

**P8. Nombres «Casa Martínez» y «Arreboles».** ¿a o b?
- **a.** Son líneas de De Santander y tienes, o vas a pedir, autorización escrita de la familia o finca.
- **b.** Son marcas del tostador o de un tercero. Entonces P6 sería C para esos cafés.

**P10. ¿Se muestran ya los datos del vendedor que existen** (razón social, NIT, correo y WhatsApp) aunque falte el domicilio? Sí o no. **Recomendado: sí.**

**P11. ¿Se cambia la primera línea del mensaje** a «Quiero hacer este pedido:» (en lugar de «Quiero finalizar mi pedido»)? Sí o no. **Recomendado: sí.**

**P12. ¿Planeas enviar promociones por WhatsApp o correo?** ¿a o b?
- **a (recomendada para el lanzamiento).** No, por ahora. No se agrega casilla.
- **b.** Sí. Legal redacta una casilla aparte, sin marcar, con los horarios de la Ley 2300 de 2023.

**D-9 (dato, no decisión). ¿Confirmas con la transportadora los plazos máximos de 3, 6, 10 y 20 días hábiles para las zonas 1, 2-3, 4 y 5?** «Sí, esos» o «no, estos: …».

## 6. Preguntas para terceros

**Contador**
- C1. ¿El café tostado en grano y el molido tienen IVA? ¿Y el cobro del envío y del mensajero? Por escrito.
- C2. ¿De Santander SAS emite factura electrónica por estas ventas? ¿A nombre del comprador o a «consumidor final»? ¿Sigue vigente la regla del 222222222222 con la Res. DIAN 165 de 2023?
- C3. Códigos de tipo de documento del anexo técnico, y si se agrega el NIT al selector (LEG-048).
- C4. Plazo de conservación de facturas y soportes, con el número de documento.
- C5. Activos totales de la sociedad, para el Registro Nacional de Bases de Datos.

**Tostador y fincas**
- T1. Razón social y dirección del fabricante o envasador de cada café, como figuran en la bolsa («FABRICADO POR» o «ENVASADO POR»).
- T2. Registro, permiso o notificación sanitaria de Café Arreboles, y su titular.
- T3. ¿La NSA-003219-2017 está vigente, es de Café Casa Martínez y quién es su titular?
- T4. Soporte escrito de altitud, variedad, proceso, recolección manual y secado al sol de cada café.
- T5. Autorización escrita para usar los nombres «Casa Martínez» y «Arreboles», si son de una familia o finca.

**Agregador (Envia.com o Mipaquete.com)**
- A1. ¿Exige el número de documento del destinatario para la guía, también en contraentrega?
- A2. ¿Exige el código postal o lo calcula?
- A3. ¿Cobra comisión de recaudo en contraentrega? ¿Cuánto?
- A4. Plazos máximos por zona y cobertura de la zona 5.
- A5. Razón social, país y condiciones de tratamiento de datos (para la política y el contrato de encargo).

**Abogado**
- L1. Aprobar los cuatro documentos y el microcopy v0.4.
- L2. Confirmar la alternativa C de retracto con el Concepto SIC 16-062808 de 2016, y si hay doctrina posterior.
- L3. Decidir sobre la reversión del pago con Bre-B (art. 51).
- L4. Calificar a Meta, el agregador y GitHub como encargados o terceros, y decidir si hace falta contrato de transmisión.
- L5. Entregar el manual interno de datos (Ley 1581, art. 17 lit. k).
- L6. Verificar el registro de la marca «De Santander» ante la SIC.
- L7. Revisar la cláusula de «error evidente» de precio (términos §4): conservarla o quitarla.

## 7. Lo que implementa el desarrollador

El detalle, con los textos exactos y la ubicación, está en la entrega de `revisiones/2026-11-05-actualizacion-documentos.md`, ajustada por `revisiones/2026-11-05-decisiones-dueno.md` (D4, D5, D6, D7 y D10).

| # | Qué | Cuándo |
|---|---|---|
| D1 | Publicar los cuatro documentos en `/legal/<slug>/`: Sanity o un respaldo en el código, con la marca «aprobado» | Después de la aprobación del abogado |
| D2 | Casilla de autorización, texto v0.4 | Ya |
| D3 | Mostrar los datos del vendedor que existen, en el pie, en `/legal/vendedor/` y en el resumen | Ya, si P10 = sí |
| D4 | Plazo de entrega en el resumen, leído de un CSV (microcopy §5.6). Columna `plazo_maximo_dias_habiles` vacía hasta D-9; con vacío se muestra la redacción de 30 días calendario | Ya se puede implementar; los máximos se cargan después de D-9 |
| D5 | Línea de retracto en el resumen (microcopy §5.3, texto definitivo) | Ya (P2 = C decidida) |
| D6 | `/envios/`: título, frase y plazos por zona según microcopy §5.8; corregir «¿Tu destino no aparece?» | Línea de 30 días ya; título y máximos después de D-9 |
| D7 | Columna `fabricante` en la ficha. (Café Arreboles sigue activo por decisión del dueño, P9; si cambia de opinión, `activo = no`.) | Ya |
| D10 | Hoja de registro de PQR (no es código: la abre el dueño con las columnas de microcopy §5.7) | Antes de publicar los documentos |
| D8 | Primera línea del mensaje de WhatsApp | Ya, si P11 = sí |
| D9 | Línea de prueba con versiones en el mensaje; `version_terminos` y `version_politica_datos` en `data/config.csv` | Con la publicación de D1 |
