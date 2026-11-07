> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.4 — 2026-11-06.

# Checklist de lanzamiento legal

Reúne los hallazgos **abiertos** de severidad Bloqueante y Alta de LEG-001 a LEG-100, más los Media que condicionan la publicación. Fuente: `docs/legal/revisiones/` (LEG-001 a LEG-080) y `2026-11-06-paquete-v1.md` (LEG-081 a LEG-100). Se actualiza en cada revisión.

Cambios de la v0.4 (2026-11-06, tarde): el dueño entregó el **Paquete legal v1** (datos completos del vendedor, IVA del 5 % incluido, plazos máximos por zona, retracto de 5 días hábiles, reversión 4A, conservación 10 años, «ACEPTO» en el chat, encargados, versiones v1 del 2026-11-06, NSA por café) y cinco decisiones adicionales que priman: modelo C se mantiene; sin número de solicitud; Arreboles sigue activo sin NSA; comisión incluida en la tarifa y sin promociones por ahora; **publicar los cuatro documentos**. Los documentos pasaron a **v1.0**. Quedan cerradas en lo decisorio P1 (máximos), P2 (retracto, ahora concedido), P7 (sustituida), P11 (sustituida), P12 («no por ahora»), P13 a P15 (sin objeto). Se abren P19 a P23 y D-16 a D-20.

## 1. Estado de los bloqueos (2026-11-06, tarde)

1. **Identificación del vendedor.** **Cerrado en los datos** (paquete §2: NIT 902.121.184-8, domicilio, dirección y correo de notificación). Pendiente: cotejo con el certificado y el RUT (D-1, D-2) e implementación en pie, resumen y `/legal/vendedor/` (bloque A y D).
2. **Café Arreboles sin NSA** (LEG-024, LEG-066, LEG-089). **Abierto: riesgo aceptado por el dueño, confirmado hoy.** El paquete decía «sin NSA no se publica»; la decisión del dueño prima. Lo cierra la NSA con titular y fabricante (D-11) o `activo = no`. Mientras tanto el dictamen de lanzamiento es **No conforme**. La advertencia completa está en la v0.3 de este archivo (historial de Git) y sigue vigente: medidas sanitarias y sanciones (Res. 2674 de 2013; Ley 9 de 1979), responsabilidad solidaria como proveedor (Ley 1480, arts. 10, 19, 20 y 23).
3. **Documentos legales sin publicar** (LEG-047, LEG-056). **Se cierra con la publicación** de la v1 ordenada por el dueño (LEG-094). Abierto hasta que el desarrollador la haga efectiva (vía Sanity o respaldo en el repositorio, LEG-084) y QA la verifique. La aprobación del abogado queda como observación (L1).
4. **«Marca propia» en el sitio** (LEG-069, LEG-070, LEG-071). **Abierto.** El paquete no lo toca; el dueño confirmó el modelo C. Textos listos (microcopy §2 y §3).
5. **Textos del sitio contrarios a la v1** (LEG-081 retracto, LEG-082 IVA, LEG-090 mensaje, LEG-087 plazos). **Abierto** hasta la entrega de los bloques A a D.

### Camino más corto a «Conforme con observaciones»

| Paso | Quién | Qué | Cierra | Estado |
|---|---|---|---|---|
| 1 | Legal | Documentos v1.0 con el paquete y las decisiones del dueño; texto público limpio. | — | **Hecho** (2026-11-06). |
| 2 | Dueño | Cotejar domicilio, dirección, «SAS» y dígito con el certificado y el RUT (D-1, D-2). Responder P19 a P23. Confirmar Uber (P22) y la razón social del agregador (D-16). | Bloqueo 1; LEG-085, LEG-086 | Pendiente. |
| 3 | Contador | Concepto escrito: IVA del café tostado (art. 468-1 E.T.) y del envío (art. 447); factura a nombre del comprador (D-18). | LEG-082; LEG-040 | Pendiente. **Antes de publicar la leyenda del 5 %.** |
| 4 | Desarrollador | Bloque A (config, catálogo, plazos, `tienda.ts`), B (publicar las cuatro páginas; títulos), C (casillas, retracto, IVA, plazo, vendedor, mensaje), D (pie, ficha, `/envios/`, textos del modelo C). | Bloqueos 3, 4 y 5; LEG-081 a LEG-091 en el código | Pendiente. Detalle en `2026-11-06-paquete-v1.md`, «Entrega». |
| 5 | Tostador (por el dueño) | Marca, fabricante o envasador con la expresión del rótulo, NSA y titular de cada café; foto del rótulo (D-11). Para Arreboles: la NSA. | Bloqueo 2; LEG-070; LEG-089 | Pendiente. |
| 6 | Transportadora o agregador (por el dueño) | Confirmar que los máximos 1, 3, 3 y 6 días hábiles son alcanzables y que la tarifa cubre la comisión de recaudo (D-19); razón social y país (D-16); condiciones de datos de DiDi (D-17). | LEG-087, LEG-092, LEG-086 | Pendiente. |
| 7 | Abogado | Revisar la v1 publicada (L1); L2 (retracto con num. 4), L3 (Bre-B), L4 (encargados y contratos), L5 (manual interno), L6 (marcas y DO), L8 (normas VERIFICAR). Si corrige, se publica la versión 2. | LEG-094 (observación) | Pendiente. |
| 8 | QA y legal | QA verifica los puntos de `2026-11-06-paquete-v1.md`; legal emite la revisión de lanzamiento. | Dictamen | — |

Con los pasos 1 a 8, el dictamen pasa a **Conforme con observaciones**, **salvo que el bloqueo 2 siga abierto**: con Café Arreboles activo y sin NSA conocida, el lanzamiento se mantiene en **No conforme**.

### Qué se puede publicar ya
- Las cuatro páginas legales v1 (decisión del dueño), con la leyenda de IVA condicionada al contador (P20).
- Los textos del modelo C, la línea de retracto nueva, el mensaje nuevo, el vendedor completo y los plazos: son correcciones de texto y datos.
- **No todavía:** la leyenda «IVA del 5 %» sin el concepto del contador (usar la alternativa de P20 b); el pedido abierto al público con Arreboles activo sin NSA (riesgo aceptado por el dueño; legal mantiene su recomendación).

## 2. Tabla de requisitos

Grupos: **(a)** lo cierra legal con documentos; **(b)** lo decide el dueño; **(c)** lo exige un tercero; **(d)** lo implementa el desarrollador. Estados: **Cumple**, **No cumple**, **Falta dato**.

| # | Hallazgo | Severidad | Requisito | Norma | Dónde se cumple | Estado | Responsable | Grupo |
|---|---|---|---|---|---|---|---|---|
| 1 | LEG-021 a 030, LEG-085 | **Bloqueante** → Alta | Identificar al vendedor (razón social, NIT, dirección de notificación, correo, teléfono) | Ley 1480, art. 50 lit. a | Pie, resumen, `/legal/vendedor/`, términos §2 | **Datos completos (paquete)**; **No cumple** en el sitio hasta el bloque A/D; cotejo D-1, D-2 pendiente | Dueño / desarrollador | b → d |
| 2 | LEG-024, LEG-066, LEG-089 | **Bloqueante** | No vender alimentos sin notificación, permiso o registro sanitario; ficha con NSA, titular y fabricante | Res. 2674 de 2013; Res. 5109 de 2005, art. 5; Ley 9 de 1979 | `data/catalogo.csv` (`nsa`, `titular_nsa`, `fabricante`); ficha | **No cumple** (Arreboles `activo = si`, sin NSA; Casa Martínez sin titular ni fabricante). **Riesgo aceptado por el dueño (P9, reiterado 2026-11-06).** | Dueño | c → d |
| 3 | LEG-069 | **Bloqueante** | Retirar «marca propia»; presentar la tienda como comercializadora | Ley 1480, arts. 5 num. 13, 23, 29, 30 | Bajada, pie, metadatos, `/cafes/`, Historia | **No cumple** en el sitio; textos listos (microcopy §2) | Desarrollador | d |
| 4 | LEG-070, LEG-079 | Alta | Marca y fabricante en la ficha; JSON-LD con la marca real | Ley 1480, arts. 23 y 24; Res. 5109, art. 5 | Ficha; `cafes/[slug]/page.tsx` | **No cumple**; columnas y textos definidos (microcopy §3) | Desarrollador; tostador (D-11) | d → c |
| 5 | LEG-071 | Alta | Sin «Trabajamos con fincas…», «Recolección manual», «Secado al sol» | Ley 1480, arts. 23, 29, 30 | Historia | **No cumple**; texto listo | Desarrollador | d |
| 6 | LEG-047, LEG-056, LEG-084, LEG-094 | **Bloqueante** → cierra con la publicación | Términos y política publicados antes de aceptarlos; envíos y vendedor publicados | Ley 1480, arts. 37 y 50; Ley 1581, arts. 12 y 17 | `/legal/terminos/`, `/legal/privacidad/`, `/legal/envios-devoluciones/`, `/legal/vendedor/` | **No cumple** hasta publicar (vía Sanity o respaldo); textos v1.0 listos; publicación ordenada por el dueño | Desarrollador | a → d |
| 7 | LEG-081 | Alta | Informar el retracto (5 días hábiles, salvo empaque abierto) y su procedimiento antes de comprar | Ley 1480, arts. 47 y 50 | Resumen (`aviso-retracto`), `/envios/`, envíos §9, términos §9 | **No cumple**: el sitio dice «no admite retracto». Texto listo (microcopy §5.3) | Desarrollador | d |
| 8 | LEG-082 | Alta (condición previa) | Precio publicado = precio total con impuestos; leyenda de IVA veraz | Ley 1480, arts. 26 y 50; E.T. arts. 447 y 468-1 | Ficha, carrito, resumen, mensaje, pie, `/envios/` | **Falta dato**: concepto escrito del contador (D-18). Leyenda del 5 % decidida por el dueño (P20) | Contador / dueño | c → b → d |
| 9 | LEG-063, LEG-087 | Alta | Plazo estimado y máximo por zona informados antes de finalizar | Ley 1480, art. 50 lit. h (Ley 2439 de 2024) | Resumen, `/envios/`, envíos §6, `data/plazos_envio.csv` | **Decidido** (1, 3, 3 y 6 días hábiles; zona 5 al cotizar); **No cumple** en el sitio (`PLAZOS` fijo, sin máximos); confirmación con la transportadora recomendada (D-19) | Desarrollador; dueño | b → d → c |
| 10 | LEG-050 | Alta | Prueba de la aceptación y de la autorización | Ley 1581, art. 17 lit. b | Mensaje de WhatsApp (microcopy §5.2); «ACEPTO» en el chat (operación) | **No cumple** en el código; texto listo | Desarrollador; dueño (operación) | d → b |
| 11 | LEG-090 | Media | Mensaje coherente con la formación del contrato, completo y con versiones | Ley 1480, arts. 23 y 50; Ley 527, art. 14 | `mensaje-whatsapp.ts` | **No cumple**; plantilla lista (microcopy §5.5) | Desarrollador | d |
| 12 | LEG-065 | Alta (condición previa) | Canal de PQR con radicado, fecha, hora y seguimiento | Ley 1480, art. 50 lit. g | Envíos §12, términos §12, vendedor; hoja de registro | Texto listo; cumple al publicar y abrir la hoja (D10) | Dueño (operación) | a → b |
| 13 | LEG-075 | Informativa | Devolución para pagos por Bre-B (4A) | Ley 1480, art. 51 (L3) | Envíos §10, términos §11 | Cumple con la publicación | Abogado (L3 como ajuste) | a → c |
| 14 | LEG-092 | Cerrado | Comisión de recaudo incluida en la tarifa; sin recargos | Ley 1480, arts. 26, 29 y 50 | Envíos §3 y §5; términos §7; ayuda del formulario; `/envios/` | **Cumple** al publicar; **Falta dato** operativo: confirmar que la tarifa la cubre (D-19) | Dueño | b → c |
| 15 | LEG-093 | Cerrado por ahora | Sin promociones; la política lo dice | Ley 1581, art. 9; Ley 2300 de 2023 | Política §3; términos §13 | **Cumple** al publicar | — | a |
| 16 | LEG-040, LEG-044, LEG-095 | Media | Casillas separadas, sin marcar, con versión y fecha desde `config.csv`; documento opcional con finalidad acreditada | Ley 1581, arts. 4, 9, 12 | Resumen | **No cumple** (textos v0.4 implementados; faltan versión y fecha); textos listos (microcopy §4.3, §5.1); documento condicionado al contador (D-18) | Desarrollador; contador | d → c |
| 17 | Riesgo 4, LEG-086 | Media | Encargados y países informados; contratos o cláusulas de encargo | Ley 1581, arts. 12 y 26; Decreto 1074, art. 2.2.2.25.5.2 | Política §7 y nota B | **Cumple** en el texto (sin afirmar contratos). **Falta dato**: razón social del agregador (D-16), país de DiDi y uso de Uber (D-17, P22); L4 pendiente | Dueño; abogado | b → c |
| 18 | LEG-072 | Media | «De Santander» solo como nombre de la tienda; nunca «Café de Santander» | Decisión 486 CAN; DO «Café de Santander» | Todo el sitio; términos §14 | **Cumple** salvo «cafés de De Santander» y `brand` (bloque D) | Desarrollador | d |
| 19 | LEG-078 | Media (interno) | `PRODUCT.md`, `README.md` y demás coherentes con el modelo C y con las decisiones de hoy | — | Documentos del repositorio | **No cumple** | Quien tenga autorización | b → d |
| 20 | — | Media | Manual interno de políticas y procedimientos de datos | Ley 1581, art. 17 lit. k | Documento interno | **No cumple** (L5) | Abogado | c |
| 21 | — | Media | RNBD solo si se supera el umbral | Ley 1581, art. 25; Decreto 090 de 2018 | — | **Falta dato** (D-8); no se publica nada | Contador | c |
| 22 | LEG-100 | Baja | Plazo de conservación para chats sin pedido ni reclamo | Decreto 1377, art. 11 (VERIFICAR) | Política §6 (versión 2) | **Falta dato** (P23, D-6) | Dueño | b → a |
| 23 | LEG-088 | Baja | Versión y fecha coherentes en casillas, mensaje, páginas y `config.csv` | Ley 1581, art. 17 lit. b; Ley 527 | `config.csv`, Sanity, resumen, mensaje | Regla definida (microcopy §6); **No cumple** hasta el bloque A | Desarrollador | d |
| 24 | — | Informativa | Casillas sin marcar y separadas | Ley 1581, art. 9 | Resumen | **Cumple** | — | — |
| 25 | — | Informativa | Envío visible antes del pago; «por cotizar» aceptado antes de pagar | Ley 1480, art. 50 | Carrito, resumen, mensaje | **Cumple** | — | — |
| 26 | — | Informativa | Sin puntajes SCA ni sellos sin verificar | Ley 1480, arts. 23, 29 | Fichas | **Cumple** | — | — |
| 27 | LEG-043 | Informativa | Sin datos personales en analítica ni `localStorage` | Ley 1581, art. 4 lit. g | Sitio | **Cumple** | — | — |
| 28 | LEG-070, P16 | Media (recomendación) | Autorización escrita de los titulares de las marcas | Decisión 486, art. 157 | — | **Falta dato** (D-12) | Dueño; tostador | b → c |
| 29 | LEG-072, D-14 | Media | Marcas «De Santander», «Casa Martínez», «Arreboles» verificadas ante la SIC; sin ® | Decisión 486 | Sitio | **Falta dato** | Abogado (L6) | c |

## 3. Datos que debe entregar el dueño o un tercero

| # | Dato | Para qué | Estado |
|---|---|---|---|
| D-1 | Domicilio y dirección de notificación judicial | Vendedor | **Entregado (paquete)**: Bucaramanga, Santander; Calle 37 n.° 23-77, apartamento 702. Pendiente cotejar con el certificado y el RUT. |
| D-2 | Dígito de verificación y forma de la razón social | Identificación | **Entregado**: 902.121.184-8; «De Santander SAS». Pendiente cotejar. |
| D-3 | Área que atiende datos | Política §1 | **Entregado**: área comercial. |
| D-4 | Modalidad de WhatsApp | Política §7 | **Entregado**: aplicación WhatsApp Business. |
| D-5 | Mensajero de zona 1 | Política §7 | **Parcial**: DiDi (paquete); `zonas_envio.csv` también dice Uber Courier (P22). |
| D-6 | Conservación | Política §6 | **Parcial**: 10 años para pedidos, facturas, PQR y constancias; falta el plazo para chats sin pedido (P23). |
| D-7 | 2FA en cuentas de la tienda | Política §11 | Sin dato; la frase se retiró del texto público. |
| D-8 | Activos totales | RNBD | Pendiente. |
| D-9 | Plazos máximos por zona | Envíos §6 | **Entregado**: 1, 3, 3 y 6 días hábiles; zona 5 al cotizar (máx. 30 días calendario). Recomendado confirmar con la transportadora (D-19). |
| D-10 | Comisión de recaudo | — | **Sin objeto**: incluida en la tarifa (LEG-092). Pasa a D-19 como confirmación operativa. |
| D-11 | Marca, fabricante o envasador, NSA y titular de cada café; foto del rótulo | Ficha; bloqueo 2 | Pendiente. |
| D-12 | Autorización de los titulares de las marcas | Recomendado | Pendiente (P16). |
| D-13 | Soporte por marca de fincas y prácticas | Ficha (Sanity) | Pendiente. |
| D-14 | Registro de las marcas ante la SIC | — | Pendiente (L6). |
| D-15 | Plazo de la lista de promociones | — | **Sin objeto** (sin promociones). |
| **D-16** | Razón social del agregador de guías | Política §7 | Pendiente. El texto público dice «el agregador de guías con el que despachamos». |
| **D-17** | País de alojamiento y condiciones de datos de DiDi (y de Uber si se usa) | Política §7 | Pendiente. |
| **D-18** | Concepto escrito del contador: IVA del café y del envío; factura a nombre del comprador | Términos §4; envíos §3; leyendas | Pendiente. **Condición previa a publicar «IVA del 5 %».** |
| **D-19** | Confirmación de la transportadora: máximos alcanzables; tarifa cubre la comisión | Envíos §3 y §6 | Pendiente (recomendado). |
| **D-20** | Fecha real de publicación | `config.csv`, Sanity, documentos | Pendiente; si es posterior al 2026-11-06, se actualiza todo el mismo día. |

## 4. Preguntas para el dueño

### 4.1 Respondidas
P1 (B; máximos fijados en el paquete), P2 (reabierta por el paquete: **retracto de 5 días hábiles salvo empaque abierto**), P3 (a), P4 (A, texto 4A del paquete), P5 (sí), P6 (C, confirmado hoy), P7 (**sustituida**: comisión incluida en la tarifa), P8 (b), P9 (Arreboles activo, confirmado hoy), P10 (sí, con los datos completos), P11 (**sustituida**: «Envío mi solicitud de compra para que me confirmen el total con el envío», sin número), P12 (**no por ahora**). P13 a P15: sin objeto. P16 (autorización de marcas), P17 (filtro por marca) y P18 («Comercializa» en la ficha, recomendado y asumido en los textos) siguen abiertas.

### 4.2 Pendientes (una pregunta cerrada por ítem)
- **P16.** Autorización escrita de los titulares de las marcas: a) sí (**recomendada**); b) solo uso nominativo.
- **P17.** Filtro por marca cuando haya dos o más: sí / no.
- **P18.** «Comercializa: De Santander SAS» en la ficha: sí (**recomendado**, ya en los textos) / no.
- **P19.** Dirección de notificación en el pie: a) la registrada (hoy); b) registrar una comercial o apartado y publicarla cuando conste.
- **P20.** Leyenda de IVA antes del concepto del contador: a) «IVA del 5 % incluido» ya; b) «con todos los impuestos incluidos» hasta el concepto (**recomendada**).
- **P21.** Casilla de datos: a) texto del paquete tal cual (adoptado); b) más «Entiendo que el pedido se envía por WhatsApp (Meta)…» (**recomendada**).
- **P22.** ¿Se usa Uber Courier en zona 1? Si sí, se agrega a la política §7.
- **P23.** Plazo para chats sin pedido ni reclamo: a) 12 meses (**propuesta**); b) otro.

## 5. Preguntas para terceros

**Contador:** C1 (IVA del café tostado en grano y molido, art. 468-1; del envío, art. 447; por escrito, D-18); C2 (factura electrónica a nombre del comprador; regla de consumidor final); C3 (códigos de tipo de documento); C4 (conservación de facturas: el paquete fija 10 años por el art. 28 de la Ley 962 de 2005, confirmar); C5 (activos totales, D-8).

**Tostador:** T1 (marca, fabricante o envasador, expresión del rótulo, foto); T2 (NSA de Arreboles y su titular); T3 (vigencia y titular de la NSA-003219-2017); T4 (soporte de fincas y prácticas por marca); T5 (permiso de la familia Martínez si aplica); T6 (autorización de uso de marca, P16); T7 (registro de cada marca ante la SIC).

**Agregador / transportadora:** A1 (documento para la guía), A2 (código postal), A3 (comisión de recaudo: ya no se traslada, pero confirmar que la tarifa la cubre, D-19), A4 (máximos 1, 3, 3 y 6 alcanzables; cobertura de la zona 5, D-19), A5 (razón social, país y condiciones de datos, D-16).

**Abogado:** L1 (revisar la v1 publicada; si corrige, versión 2); L2 (retracto concedido con exclusión del empaque abierto por el num. 4 del art. 47); L3 (reversión y Bre-B; procedimiento 4A voluntario); L4 (encargados: Meta con la app, Gmail gratuito, GitHub, DiDi, agregador; contenido del art. 2.2.2.25.5.2 del Decreto 1074); L5 (manual interno); L6 (marcas y DO «Café de Santander»); L7 (sin objeto: la cláusula de «error evidente» se reemplazó por la del paquete); L8 (normas VERIFICAR, incluida la Sentencia C-192 de 2026 citada por el paquete).

## 6. Lo que implementa el desarrollador

El detalle, con los textos exactos, está en `revisiones/2026-11-06-paquete-v1.md`, sección «Entrega» (bloques A a D), y en `microcopy-legal.md` v1.0. Sustituye a los bloques 1 a 6 de `2026-11-06-decisiones-p4-p12.md` en lo que se superpone; los bloques 3 (comisión con dos estados) y 4 (casilla de promociones) **quedan sin efecto**.

| Bloque | Qué | Cuándo |
|---|---|---|
| **A** | `config.csv` (versiones, fechas, NIT con dígito, IVA, domicilio, dirección y correo de notificación, matrícula, representante, área de datos); `catalogo.csv` (`marca`, `fabricante`, `fabricante_expresion`, `nsa`, `titular_nsa`); `plazos_envio.csv`; `tienda.ts` | **Ya** |
| **B** | Publicar las cuatro páginas legales v1 (Sanity o respaldo); títulos «Envíos, devoluciones, retracto y garantía»; `dl` del vendedor | **Ya** (decisión del dueño) |
| **C** | Casillas con versión y fecha; línea de retracto nueva; nota del art. 50; leyenda de IVA (según P20); plazo bajo el envío; «Te vende…» completo; mensaje de WhatsApp (primera línea, subtotal con IVA, constancia final); ayuda de contraentrega | **Ya** |
| **D** | Pie (vendedor en cinco líneas; IVA; descriptor del modelo C); ficha (marca, fabricante, notificación sanitaria, «Comercializa», molienda, IVA, JSON-LD); `/envios/` (plazos desde CSV, IVA, comisión incluida, retracto, enlace); inicio y metadatos del modelo C | **Ya** |
| Operación (dueño) | Guion del chat con «ACEPTO» (microcopy §5.7); hoja de PQR; respaldo de los chats de WhatsApp Business; informar el total y esperar la aceptación antes de cobrar | Antes de abrir el pedido |
| Documentos internos | `PRODUCT.md` (modelo C; «la solicitud existe cuando el cliente envía el mensaje»; decisiones del 2026-11-06), `README.md`, `docs/PROMPT-V2.md`, `agents/legal-cumplimiento.md` («SAS») | Quien tenga autorización |
