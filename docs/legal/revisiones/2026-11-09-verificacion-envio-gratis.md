# Revisión LEG-120 a LEG-128: Verificación del envío gratis por comunas implementado (2026-11-09)

> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.3 — 2026-11-09.

**Versión 0.3 (2026-11-09).** D-24 cerrado con un dato del dueño, comunicado por el coordinador: horario de atención de lunes a viernes, de 7:00 a. m. a 5:00 p. m., hora de Colombia. El dato queda en el numeral 13 (nota E de envíos). Se agregan las precisiones de LEG-130 y la recomendación de publicar el horario en «Información del vendedor» versión 2. La entrega de la v0.2 no cambia, salvo por el punto 7 (abajo).

Sigue a `2026-11-09-envio-gratis-comunas.md` (LEG-106 a LEG-119, v0.2).

**Versión 0.2 (2026-11-09, respuestas del dueño comunicadas por el coordinador).**
- **P33:** el dueño valida a mano los pagos Bre-B.
- **P33 bis, aceptada:** la validación se hace el mismo día hábil si el pago llega dentro del horario de atención, y el día hábil siguiente si llega fuera de él. Falta el horario (D-24).
- **P34 = b, aceptada:** la promoción termina de inmediato cuando el dueño da la orden, sin fecha final previa.
- **P35:** el dueño mismo reconstruye y despliega el sitio.
- Se cierran P33, P33 bis, P34 y P35.
- Se actualizan LEG-118, LEG-125 y LEG-127, y se agrega LEG-129.
- La entrega de la v0.1 ya fue implementada (`ead557d`, según `docs/PENDIENTES.md`); QA la verifica. La entrega final de la v0.2 está al final de este documento.

**Qué se revisó.** Rama `feat/envio-gratis-comunas`, commits `5c11cee`, `e775b0d` y `b5882ae`, con la promoción apagada (`envio_gratis_desde` vacía en `data/config.csv`). Lectura del código, no de `out/`: con la promoción apagada, `out/` no contiene ninguno de estos textos. Archivos: `src/domain/envio/envio-gratis.ts`, `src/domain/legal/envio-gratis.ts`, `src/domain/pedido/mensaje-whatsapp.ts`, `src/domain/pedido/envio.ts`, `src/domain/pedido/iva.ts`, `src/domain/envio/plazos.ts`, `src/ui/componentes/checkout/formulario-envio.tsx`, `src/ui/componentes/checkout/flujo-pedido.tsx` (región `role="status"`), `src/ui/componentes/carrito/totales-pedido.tsx`, `src/ui/componentes/layout/secciones-inicio.tsx`, `src/app/envios/page.tsx`, `data/comunas_envio_gratis.csv`. Se compararon con `microcopy-legal.md` v1.3 §8 y con la nota E de envíos (numeral 13).

**Límite.** Legal no ejecuta el sitio ni las pruebas (no tiene Bash). Lo que depende de la ejecución (orden visual, foco, lectura con lector de pantalla, 2.000 caracteres) lo verifica `qa-pruebas`.

## Verificación letra por letra (microcopy v1.3 §8)

| Texto | Dónde está en el código | Resultado |
|---|---|---|
| `Comuna (opcional)` | `TEXTOS_ENVIO_GRATIS.etiquetaCampo` + `(opcional)` del componente `Campo` | Igual |
| `Elige tu comuna`, las siete comunas en orden alfabético, `Otra comuna o no la sé` | `formulario-envio.tsx`, `comunasAlfabeticas` | Igual. Lista cerrada; `otra` se descarta al validar (`envio.ts`, `comunaCubierta`) |
| Ayuda sin comuna y con comuna, + ` Condiciones` | `ayudaCampoComuna`, `ayudaComunaElegida` | Igual. Las comunas salen del CSV en el orden del dueño (`orden` 1 a 7) |
| Rótulo `Envío a Bucaramanga · zona 1 · {comuna}`, `Envío gratis` junto a `$0` | `totales-pedido.tsx` | Igual |
| Nota con tarifa y total alternativos (hasta 5 kg y más de 5 kg) | `notaVerificacionResumen` | Igual |
| Plazo del resumen | `TEXTOS_ENVIO_GRATIS.plazoResumen`, vía `textoPlazoResumen` | Igual. No usa `plazos_envio.csv` |
| `Total` (no `Total sin envío`) | `totalConEnvio`: `sinEnvio: false` | Igual |
| Mensaje: línea de envío, línea de plazo bajo `Total:`, `Comuna:` después de `Dirección:`, penúltima línea (dos casos) | `mensaje-whatsapp.ts`, `lineaVerificacionMensaje` | Igual |
| `/envios/`: nota de la fila Bucaramanga, salvedad bajo la tabla, `dd` de zonas 1 y 5, título y numeral 13 publicado, «Más en…» | `envios/page.tsx`, `leyendaIvaTarifas` | Igual a la v1.3. Dos textos de la v1.3 quedan cortos: LEG-121 a LEG-123 |
| Anuncio `Envío gratis en siete comunas de Bucaramanga.` + `Ver condiciones` | `secciones-inicio.tsx` (bajo «Cómo pedir») y cajón (`totales-pedido.tsx`) | Igual. Misma frase, mismo tamaño de letra que la condición |

**Anuncios prohibidos (LEG-107, LEG-116).** No aparecen en `src/` `Envío gratis en Bucaramanga`, `Domicilio gratis`, `Envío gratis a todo`, `Entrega el mismo día` ni `todo Bucaramanga` (una prueba de `envio-gratis.test.ts` los vigila). No hay `shippingRate` ni `OfferShippingDetails` en JSON-LD. `metadata.description` de `/envios/` no menciona el envío gratis. La etiqueta `Envío gratis` sola solo aparece junto al `$0` de la línea, con la nota de condición en el mismo bloque, como pide §8.3.

**Datos (LEG-114).** La comuna no se guarda en `localStorage` (el almacén solo guarda el carrito), no va en la URL (la navegación solo usa `?paso=`) ni en analítica. Una comuna fuera de la lista no se registra. **Pendiente de QA:** confirmarlo en ejecución.

**Control de publicación (LEG-106).** `revisarPublicacionEnvioGratis` impide encender la promoción si los documentos publicados no tienen el numeral, las siete comunas, la fecha de inicio y la salvedad en términos y envíos, o si los términos rigen después de `envio_gratis_desde`. La política versión 2 solo genera un aviso (P31 a es recomendación). El modo `ENVIO_GRATIS_PRUEBA` falla con `GITHUB_PAGES=true`. Además, `npm run datos` exige siete comunas de Bucaramanga en zona 1, porque los textos dicen «siete comunas de Bucaramanga». **Conforme.**

## Hallazgos

| # | Severidad | Ubicación | Texto o práctica | Riesgo y norma | Corrección propuesta |
|---|---|---|---|---|---|
| LEG-120 | Media | `envio-gratis.ts`, `anuncioEnvio` (región `role="status"` del paso Envío) | `Envío gratis en {comuna}: $0. Total: {total}.` | Es lo único que oye quien usa lector de pantalla al elegir la comuna. Sin la condición, anuncia un envío gratis sin condición (Ley 1480, arts. 23 y 29; LEG-107). La nota visible no se anuncia, por diseño. | `Envío gratis en {comuna}, sujeto a verificar tu dirección: $0. Total: {$ total}.` (microcopy v1.4 §8.3). Usa la misma fórmula que el mensaje de WhatsApp. |
| LEG-121 | Media | `/envios/`, párrafo inicial | `Pagas el valor que te mostramos; solo se cotiza aparte en zonas especiales y en pedidos de más de 5 kg.` | Con la promoción, un pedido de más de 5 kg en las siete comunas no se cotiza. La página diría dos cosas distintas, y en la duda se aplica la más favorable (arts. 29 y 34). | Con la promoción vigente, el párrafo de microcopy v1.4 §8.5 (agrega una frase con la condición y «Ver condiciones»). Sin la promoción, queda como está. |
| LEG-122 | Baja | `/envios/`, caja final «¿Tu destino es de zona 5 o pides más de 5 kg?» | `Escríbenos al {WhatsApp} y te cotizamos.` | Invita a cotizar un envío que en las siete comunas es gratis. No obliga a pagar nada, pero confunde (art. 23). | Con la promoción vigente, el segundo párrafo de microcopy v1.4 §8.5. |
| LEG-123 | Media | `/envios/`, «Plazos de entrega»: párrafo general y `dd` de la zona 1 (texto de la v1.3, de legal) | El párrafo cuenta los plazos «desde que aceptas el total… y, si pagas por transferencia Bre-B, desde que recibimos el pago». El `dd` de la zona 1 dice el máximo del envío gratis, pero no cómo se cuenta. | Dos fórmulas para el mismo plazo en la misma página: con Bre-B, «validamos tu pago» puede ser posterior a «recibimos el pago» (LEG-118). Prevalece la más favorable (art. 34). Es una omisión de la microcopy v1.3, no un defecto del desarrollador. | `dd` de la zona 1: ` Con envío gratis en comunas de Bucaramanga, el máximo es 1 día hábil con cualquier peso, contado desde que validamos tu pedido y te damos el aprobado por el chat (ver condiciones).` El párrafo general no cambia. Depende de P33. |
| LEG-124 | Informativa | Pie (`nota_envio` de `config.csv`) y paso 3 de «Cómo pedir» | Textos de microcopy §1.5 y §2. | **Siguen siendo exactos con la promoción** (ver §8.5 bis). Riesgo si se modificaran: un texto fijo del CSV no se apaga al terminar la promoción (art. 33 inc. 3). | Sin cambio. No poner la promoción en `nota_envio`. Si se quiere en el pie, el anuncio de §8.6, generado por el código. |
| LEG-125 | **Alta** | Vigencia en un sitio estático (`src/app/_datos/catalogo.ts`, `promocionActiva(…, hoyEnColombia())`) | La vigencia se evalúa **al construir el sitio**, no cuando el cliente lo visita. Si `envio_gratis_hasta` vence y no se reconstruye ni despliega, el sitio sigue mostrando el campo, el $0 y los anuncios. | Lo publicado obliga mientras se muestre. Sin fecha final, la promoción rige hasta que se revoque con la misma visibilidad (arts. 29 y 33 inc. 3). Lo mismo al inicio: con `envio_gratis_desde` en el futuro, la promoción no aparece hasta el siguiente despliegue. No es un defecto de la regla, sino del momento en que se evalúa. Hoy no tiene efecto (P25 a, sin fecha final). | (i) Operación: reconstruir y desplegar el primer día después de `envio_gratis_hasta`, y el mismo día de `envio_gratis_desde`. Cada despliegue necesita confirmación del dueño (`CLAUDE.md`). (ii) Texto: el aviso de terminación respeta todo pedido cuyo mensaje diga «envío gratis» (microcopy v1.4 §8.6.1). (iii) Recomendado: un aviso de `npm run datos` o del build si `envio_gratis_hasta` cae en los próximos 7 días o ya pasó sin estado «terminada». |
| LEG-126 | Informativa | Desviaciones resueltas por el desarrollador y el diseño | Ver la tabla de abajo. | — | Se confirman todas. Microcopy §8.2 se ajusta a la posición del campo. |
| LEG-127 | Media | Fin de la promoción: no hay estado «terminada» ni textos completos | §8.6 v1.3 tenía un aviso («antes de esa fecha») que no coincidía con el numeral 13 («antes del aviso»). El código, al vencer, oculta todo, también el anuncio. No hay aviso en los mismos lugares. | Art. 33 inc. 3: revocar con los mismos medios e intensidad. Si el anuncio desaparece sin aviso, no hay revocación con igual visibilidad, y el cliente que vio el anuncio en otro lado (redes) puede exigirlo. | Textos de microcopy v1.4 §8.6.1: aviso previo con fecha final (A, recomendado) o fin inmediato (B), estado «terminada» con el aviso en los mismos lugares durante al menos 30 días calendario, viñeta de vigencia nueva para el numeral 13 (nota E de envíos) y aviso para redes. **No se implementa ahora:** basta con dejarlo previsto. Es obligatorio antes de poner fecha en `envio_gratis_hasta`. P34. |
| LEG-129 (v0.2) | Media | Plazos generales con Bre-B (envíos §6, términos §8, `/envios/`) frente a la validación manual (P33) | Para todas las zonas, los plazos generales corren «desde que recibimos tu pago». El dueño valida a mano y, fuera del horario, al día hábil siguiente. | El texto general es más estricto con la tienda que la práctica: el plazo empieza a correr con la recepción, no con la validación. Lo publicado obliga (arts. 29 y 50 lit. h). En la zona 1 (máximo 1 día hábil), un pago que llega fuera del horario y se valida al día siguiente puede dejar sin margen el despacho. No es ilegal: es favorable al cliente. | **No se cambia el texto** (cambiarlo exigiría una versión nueva y sería menos favorable). Se informa al dueño: con pagos Bre-B fuera del horario, el plazo de las zonas ya corre desde la recepción. Si quiere alinearlo con la validación manual, legal redacta la versión siguiente de términos y envíos, con el mismo tope de P33 bis. |
| LEG-130 (v0.3) | Media | Horario de atención en el tope de validación Bre-B (numeral 13) | Dato del dueño: «lunes a viernes, de 7 a. m. a 5 p. m., COT». Bre-B acredita a cualquier hora y cualquier día. | Tres ambigüedades se resolverían a favor del cliente (art. 34): (i) festivos de lunes a viernes; (ii) si el sábado es «día hábil» (Ley 1480 no lo define; Ley 4 de 1913, art. 62, solo excluye feriados y vacancia: VERIFICAR); (iii) hasta qué hora del día siguiente se valida. Hay otro riesgo: que el horario se lea como un límite para avisos de retracto o reclamos (arts. 43 y 47: VERIFICAR). | Numeral 13: «sin contar festivos»; «el siguiente día de atención, antes de las 5:00 p. m.»; casos fuera de horario enumerados. «Día hábil» no se redefine para todo el documento. «Información del vendedor» versión 2: horario y frase «el horario no cambia tus plazos» (recomendado). **Para el dueño:** si atiende festivos, se quita «sin contar festivos». |
| LEG-128 | Informativa | Textos publicados del envío gratis | Ver «Verificación letra por letra». | — | **Conforme**, salvo LEG-120 a LEG-123. |

### Desviaciones confirmadas (LEG-126)

| Desviación | Dictamen | Fundamento |
|---|---|---|
| Campo «Comuna» después de «Municipio» (diseño), no después de «Barrio» (§8.2) | **Se confirma.** Microcopy §8.2 v1.4 se corrige. | El campo depende del municipio y aparece donde se elige. El cliente ve la condición del envío gratis antes de escribir la dirección, lo que es más claro (art. 23). El numeral 13 no fija la posición: nombra el campo por su etiqueta. Al cambiar el departamento o el municipio, el campo se vacía (`formulario-envio.tsx`), como pide §8.2. |
| Etiqueta `Envío gratis` junto al `$0` | **Se confirma.** Es lo que dice §8.3. | Píldora en contorno verde bosque, sin oro ni grana como texto sobre claro (marca). No va sola: la nota de condición está en el mismo bloque, a todo el ancho. |
| `referencia-tarifa` como nota completa de §8.3 | **Se confirma.** | Es un `data-testid` interno. El texto es la nota completa, letra por letra, con la tarifa y el total alternativos (LEG-109). |
| Opción de escape `Otra comuna o no la sé` | **Se confirma.** Es la de §8.2. | Equivale a no elegir. No se registra la comuna fuera de la lista (principio de finalidad, Ley 1581, art. 4 lit. b; recolección limitada a lo pertinente y adecuado, Decreto 1377 de 2013, art. 4, compilado en el Decreto 1074 de 2015: VERIFICAR la numeración). La ayuda vuelve al texto general, que explica la tarifa normal. |
| Enlace `Ver condiciones` en el cajón | **Se confirma.** Es el de §8.6. | Va en la misma frase que la condición («en siete comunas de Bucaramanga») y solo con la promoción vigente. |
| Lista visual de las siete comunas en `/envios/`, en orden alfabético, después del primer párrafo del numeral | **Se acepta.** | Repite el dato del numeral; no lo cambia ni lo reemplaza. El numeral sigue completo y letra por letra. |

## Estado de hallazgos anteriores

- LEG-106: el control de publicación está implementado y es correcto. **Sigue abierto** hasta que se publiquen los documentos versión 2 (es una condición de publicación, no del código).
- LEG-107, LEG-109, LEG-114, LEG-116, LEG-119: **implementados conforme** en el código. Se cierran cuando QA los verifique en ejecución.
- LEG-118: implementado con la fórmula del aprobado. Sigue **abierto** por P33.
- LEG-110, LEG-113: observaciones, sin cambio. LEG-024/066: **Bloqueante, abierto, riesgo aceptado por el dueño**.

## Dictamen

- **Implementación del envío gratis (promoción apagada): Conforme con observaciones.** Los textos son los de legal, letra por letra. No hay anuncios prohibidos ni datos de más. Quedan cuatro correcciones de texto (LEG-120 a LEG-123), de las cuales dos son de la propia microcopy.
- **Encender la promoción: No conforme** mientras no estén (i) publicados el mismo día los Términos, «Envíos, devoluciones, retracto y garantía» e «Información del vendedor» versión 2, y la Política versión 2 si se mantiene P31 a (LEG-106); (ii) respondida P33 (LEG-118); (iii) confirmado D-19 (1 día hábil con cualquier peso); (iv) implementadas LEG-120 a LEG-123; (v) acordado quién reconstruye y despliega en las fechas de inicio y fin (LEG-125). Con todo eso, la funcionalidad pasa a **Conforme con observaciones**.
- **Lanzamiento: No conforme**, sin cambio (LEG-024/066 y los bloqueos de `2026-11-06-paquete-v1.md`).

## Decisiones que requiere el cliente

1. **P33 (abierta, LEG-118).** Con Bre-B, ¿cuándo se valida el pago y se da el aprobado? a) El mismo día hábil en que se recibe (**recomendada**; es el texto base del numeral 13). b) Otro límite que fije el dueño (dato). No se publica sin límite.
2. **P34 (nueva, LEG-127).** Si algún día termina la promoción: a) con aviso previo y fecha final publicada antes (**recomendada**; da tiempo al cliente y cumple el art. 33 con holgura); b) de inmediato, con el aviso el mismo día. En los dos casos se respetan los pedidos cuyo mensaje diga «envío gratis». No hace falta responder antes de encenderla; sí antes de poner fecha en `envio_gratis_hasta`.
3. **P35 (nueva, LEG-125).** ¿Quién reconstruye y despliega el sitio el día de inicio y el día siguiente al fin, y cómo se confirma? (Dato operativo; cada despliegue necesita confirmación).

## Datos faltantes

Sin datos nuevos. Siguen D-19 (ampliado), D-21, D-22 y D-23.

## Entrega para desarrollador-fullstack

Solo textos. La lógica no cambia.

1. **`src/domain/envio/envio-gratis.ts`, `anuncioEnvio`, caso `gratis`** (LEG-120):
   `Envío gratis en ${envio.comuna}, sujeto a verificar tu dirección: $0. Total: ${formatearCOP(subtotalCop)}.`
   Quitar del comentario «La del envío gratis está pendiente de revisión de legal».
2. **`src/app/envios/page.tsx`, párrafo inicial, solo con `promo`** (LEG-121):
   `El envío se calcula por zona y por peso, y lo ves en tu pedido en cuanto eliges la ciudad. Pagas el valor que te mostramos; solo se cotiza aparte en zonas especiales y en pedidos de más de 5 kg. En siete comunas de Bucaramanga el envío es gratis con cualquier peso, si verificamos por el chat que tu dirección está en una de ellas.` + ` ` + enlace `Ver condiciones` a `#envio-gratis`. Sin `promo`, el texto de hoy.
3. **`src/app/envios/page.tsx`, caja final, segundo párrafo, solo con `promo`** (LEG-122):
   `Escríbenos al {formatearWhatsapp(whatsapp)} y te cotizamos. Si tu dirección está en una de las siete comunas de Bucaramanga con envío gratis, no hace falta: el envío es gratis con cualquier peso.` El título y el botón no cambian.
4. **`TEXTOS_ENVIO_GRATIS.plazoZona1`** (LEG-123):
   ` Con envío gratis en comunas de Bucaramanga, el máximo es 1 día hábil con cualquier peso, contado desde que validamos tu pedido y te damos el aprobado por el chat (ver condiciones).` «ver condiciones» con enlace a `#envio-gratis` (si el `dd` no admite enlace, el texto sin el paréntesis es aceptable).
5. **Sin cambio:** `nota_envio` de `config.csv` y el paso 3 de «Cómo pedir» (LEG-124). No agregar la promoción a `nota_envio`.
6. **Previsto, no ahora** (LEG-125 y LEG-127): estado «terminada» y textos de microcopy §8.6.1. Recomendado: aviso de `npm run datos` si `envio_gratis_hasta` ya pasó o vence en 7 días.
7. Actualizar las pruebas que fijan `anuncioEnvio` y `plazoZona1`.

**Para `disenador-marca`:** el enlace «Ver condiciones» del párrafo inicial de `/envios/` y del `dd` de la zona 1 usa el mismo estilo de enlace de la página. Sin cambios visuales.

## Puntos para que QA verifique

- Con un build de prueba (`ENVIO_GRATIS_PRUEBA=si`, nunca en el despliegue): la región `role="status"` dice exactamente el texto de LEG-120 al elegir cada comuna, y el de siempre con «Otra comuna o no la sé».
- `/envios/` con la promoción: párrafo inicial, caja final y `dd` de la zona 1 con los textos de LEG-121 a LEG-123. Sin la promoción: los textos de hoy, sin «gratis» en `out/`.
- El campo «Comuna» aparece después de «Municipio», solo con Bucaramanga, y se vacía al cambiar el departamento o el municipio.
- La comuna no aparece en `localStorage`, `sessionStorage`, la URL ni las peticiones de red.
- El mensaje con comuna y todos los campos llenos no pasa de 2.000 caracteres.
- `rg -n "Envío gratis en Bucaramanga|Domicilio gratis|envío gratis a todo|Entrega el mismo día" src out` sin resultados.

## Estado v0.2 (2026-11-09)

| # | Estado |
|---|---|
| LEG-118 | **Resuelto** (v0.3). El numeral 13 (nota E de envíos) cuenta el plazo, con Bre-B, desde la validación manual. La validación es el mismo día si el pago llega en horario de atención (lunes a viernes, 7:00 a. m. a 5:00 p. m., hora de Colombia, sin contar festivos) y el siguiente día de atención antes de las 5:00 p. m. si no (P33 bis; D-24; LEG-130). El inicio del plazo ya no queda a voluntad de la tienda (Ley 1480, arts. 42 y 43: VERIFICAR). Ya no hay marcador en el borrador. |
| LEG-125 | **Baja de Alta a Media.** P35: el dueño reconstruye y despliega. Riesgo residual: entre la orden de apagar y el despliegue, el sitio sigue mostrando la promoción. Lo cubre el criterio «si tu pedido ya decía envío gratis» (numeral 13 y aviso). Se cierra cuando esté construido el estado «terminada» (entrega v0.2, punto 1) y QA lo verifique. |
| LEG-127 | **Textos cerrados** para P34 b (microcopy v1.5 §8.6.1): clave `envio_gratis_terminada`, estado «terminada», aviso en los mismos lugares durante al menos 30 días y aviso en redes. La viñeta «Vigencia» del numeral 13 ya prevé la terminación y no cambia el día del fin. **Falta el código** (entrega v0.2). |
| LEG-129 | Nuevo. Informativo para el dueño; sin cambio de texto. |
| LEG-120 a LEG-123 | Implementados por el desarrollador (`ead557d`); pendientes de verificación de QA. |

**Dictamen v0.2.**
- **Implementación:** Conforme con observaciones.
- **Encender la promoción: No conforme** mientras falte alguna de estas condiciones:
  - los documentos versión 2 publicados el mismo día (LEG-106);
  - D-19 (mensajero: 1 día hábil con cualquier peso);
  - D-21 (fecha de inicio);
  - el estado «terminada» construido y verificado (LEG-125 y LEG-127).
- Con todo eso: **Conforme con observaciones**.
- **Lanzamiento:** No conforme, sin cambio (LEG-024/066).

**Decisiones del cliente.** No queda ninguna abierta sobre el envío gratis: P33, P33 bis, P34 y P35 están cerradas. Solo faltan datos: D-19, D-21, D-22 y D-23 (D-24 cerrado en la v0.3). Queda una confirmación menor para el dueño, que no bloquea: si atiende los festivos (LEG-130).

## Entrega para desarrollador-fullstack (v0.2, final)

Sustituye el punto 6 de la entrega v0.1. Los puntos 1 a 5 de la v0.1 ya están implementados (`ead557d`).

1. **Terminación inmediata (P34 b; microcopy v1.5 §8.6.1).**
   - Clave nueva y opcional en `data/config.csv`: `envio_gratis_terminada` (fecha ISO). Es el día en que el dueño apaga la promoción y despliega.
   - Con esa clave, la promoción **no rige** desde ese build, aunque `envio_gratis_desde` siga llena. Se recomienda dejar `envio_gratis_desde` llena: la usa el aviso.
   - `npm run datos` **falla** en tres casos:
     - si `envio_gratis_terminada` es posterior a la fecha del build (no hay aviso previo en P34 b);
     - si es anterior a `envio_gratis_desde`;
     - si está llena y `envio_gratis_desde` está vacía.
2. **Retirar `envio_gratis_hasta`** del uso:
   - Si el dueño la llena, `npm run datos` falla con un mensaje que remita a `envio_gratis_terminada` (P34 b).
   - El aviso de «vence en 7 días» (QA-010) queda sin objeto y se retira.
   - Actualizar `data/LEEME.md` y `docs/ENVIOS.md`: solo la redacción de la clave; los documentos de producto los edita quien tenga autorización.
3. **Estado «terminada»**, mientras `hoy ≤ envio_gratis_terminada + 30 días` (se evalúa en el build):
   - Sin campo «Comuna», sin $0 y sin los textos de §8.5 con la promoción: vuelven los de hoy. Es decir, el cálculo y el mensaje son los normales.
   - **Portada** (bajo «Cómo pedir») **y cajón**, en el lugar del anuncio y con el mismo tamaño de letra: `El envío gratis en siete comunas de Bucaramanga terminó el {fechaEnLetras(envio_gratis_terminada)}. Si tu pedido por WhatsApp ya decía «envío gratis», lo respetamos con las mismas condiciones.` + ` ` + enlace `Ver condiciones` a `/envios/#envio-gratis`.
   - **`/envios/`, sección `id="envio-gratis"`**: título `Envío gratis en comunas de Bucaramanga`; primer párrafo, el mismo texto del aviso; luego `Estas fueron sus condiciones:` y el numeral 13 publicado, letra por letra. Sin la lista visual de comunas y sin la nota de la fila Bucaramanga.
   - Pasados los 30 días: sin aviso en portada ni cajón. La sección de `/envios/` se mantiene mientras el numeral 13 siga publicado.
4. **Control de publicación.** Sin cambios de código: `revisarPublicacionEnvioGratis` ya rechaza cualquier llave. Desde la v0.3 el numeral solo conserva `{fecha de inicio en letras}`.
5. **Pruebas.**
   - Estado «terminada» con `terminada` = hoy, hoy − 30 y hoy − 31.
   - Fallos de `npm run datos` de los puntos 1 y 2.
   - El mensaje y el cálculo sin envío gratis en estado «terminada».
6. **Sin cambios** en los textos del resumen, el mensaje ni el campo. El tope de P33 bis vive solo en el numeral 13 (documento).
7. **Horario de atención (v0.3, D-24): no se crea clave en `config.csv` por ahora.**
   - Solo aparece en dos documentos que se publican letra por letra: el numeral 13 de envíos y, recomendado, «Información del vendedor» versión 2. No hay ningún texto de interfaz que lo use.
   - Una clave aparte crearía una segunda fuente del mismo dato sin consumidor.
   - Si más adelante se muestra en el pie o en el resumen, se crea `horario_atencion` y `npm run datos` exige que el texto de la clave aparezca letra por letra en el numeral 13 y en «Información del vendedor» (mismo patrón que la versión y la fecha).
   - **Opcional, recomendado:** una prueba que confirme que, el día de la publicación, el numeral 13 publicado contiene «de lunes a viernes, de 7:00 a. m. a 5:00 p. m., hora de Colombia».

**Para `disenador-marca`:** el aviso de terminación ocupa el lugar y el estilo del anuncio (§8.6), sin caja nueva ni color de alerta.

**Para `qa-pruebas`:**
- Los puntos 1 a 5 de esta entrega.
- Confirmar que con `envio_gratis_terminada` la palabra «gratis» solo aparece en el aviso y en la sección de `/envios/`.
- Verificar LEG-120 a LEG-123 (`ead557d`).

## Normas marcadas VERIFICAR

- Ley 1480 de 2011, arts. 42 y 43 (plazo cuyo inicio depende del proveedor; LEG-118) y 47 (aviso de retracto fuera del horario; LEG-130).
- Ley 4 de 1913, art. 62 (cómputo de días; si el sábado es día hábil; LEG-130).
- Ley 1480 de 2011, arts. 23, 29, 33 (inc. 2 y 3) y 34 (leídos en compilación no oficial; letra oficial en SUIN-Juriscol pendiente).
- Ley 1581 de 2012, art. 4 lit. b, y Decreto 1377 de 2013, art. 4 (recolección limitada), con su numeración en el Decreto 1074 de 2015.
