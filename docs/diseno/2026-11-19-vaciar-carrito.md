# Vaciar el pedido tras «Enviar por WhatsApp» (2026-11-19)

Pedido del dueño (2026-11-19): «Una vez se envíe el pedido por WhatsApp se limpie el carrito».
Base: A1 de `docs/diseno/2026-11-18-ux-auditoria-alta.md`; LEG-171 a LEG-175 y §4 bis de `docs/legal/revisiones/2026-11-18-flujo-pedido-un-clic.md`; microcopy v1.11 §9; `src/ui/componentes/checkout/flujo-pedido.tsx`, `src/ui/componentes/carrito/carrito-provider.tsx`.

**Sustituye** el punto 5 de «Comportamiento del clic» de A1 («El carrito no se vacía solo») y la fila «Vació el pedido después de abrir WhatsApp» de sus estados.

**Condición previa [CONSULTAR-LEGAL] (bloquea la publicación):** la microcopy §9.5, regla 4, dice «El carrito no se vacía solo: el sitio no sabe si el cliente mandó el mensaje». Este cambio la contradice. Legal tiene que reformularla (microcopy v1.12) antes del merge. Lo que diseño propone para esa regla: «El pedido se vacía en el navegador en el mismo clic válido, después de abrir `wa.me`. El sitio sigue sin saber si el cliente mandó el mensaje, así que el respaldo de §9.4 se queda con una copia del mensaje ya generado y el cliente puede recuperar el pedido».

## Objetivo del usuario

Mandé mi pedido por WhatsApp. Si vuelvo a la tienda, quiero el pedido en 0 para no mandarlo dos veces ni arrastrarlo al siguiente. Si WhatsApp no se abrió, igual necesito copiar el mensaje, y si me arrepiento antes de mandarlo, quiero recuperar el pedido sin armarlo otra vez.

## Decisiones

1. **Cuándo se vacía.** En el mismo manejador del primer clic válido de «Enviar por WhatsApp», **después** de `window.open(enlace)`. Nada se ejecuta antes de `window.open` (LEG-172 y §5.5 siguen igual). Con un clic no válido (faltan casillas, falla `prepararPedido`) no se vacía nada.
2. **Instantánea del envío.** Antes de vaciar se guarda en memoria, en el estado de `Contenido` y nunca en `localStorage`, `sessionStorage` ni la URL (LEG-149), lo que ya existe en `resultado`: `pedido` (texto, enlace, número DS, `indicacionesResumidas`) y `firma`. Se agregan las líneas compactas y las bolsas (para el bloque «En el mensaje») y `porCotizar` (para la bajada). El respaldo lee la instantánea y no el carrito.
3. **El vaciado no invalida la instantánea.** Hoy la regla de QA-022 descarta `resultado` cuando la firma cambia. Salvedad nueva: **un carrito vacío por el envío no cuenta como cambio**. La instantánea solo se descarta con: (a) un carrito que vuelve a tener cafés y no coincide con la firma (el cliente empezó otro pedido); (b) recargar la página o salir de `/pedido/`, porque `Contenido` se desmonta, igual que los datos de envío hoy.
4. **Vista nueva «Mensaje listo».** Con instantánea vigente y carrito vacío, `/pedido/` y `/pedido/?paso=resumen` muestran esta vista en lugar del estado «Tu pedido está vacío». La URL no cambia y no hay `?paso=enviado`, porque un marcador a ese estado no tendría nada que mostrar.
5. **Reintento.** La vista conserva «Enviar por WhatsApp», que reabre `instantanea.pedido.enlace`: mismo número DS y mismo texto (§4 bis, 1). No genera número nuevo ni vuelve a vaciar.
6. **«Recuperar el pedido» sí hace falta.** Sirve para cuando WhatsApp no se abrió y el cliente quiere cambiar algo, o para cuando decide no mandarlo todavía. Reutiliza `deshacer()` del proveedor, que ya guarda las líneas anteriores a «vaciar». Devuelve las líneas al carrito y a `localStorage`, y el cliente vuelve al paso en el que estaba, con los datos de envío y las casillas como los dejó. Como la firma vuelve a coincidir, la solicitud sigue vigente: el Resumen muestra el respaldo bajo el botón y un clic reabre el mismo número DS. Cualquier cambio posterior la descarta (regla de QA-022, sin cambio). El enlace solo aparece mientras `puedeDeshacer` sea verdadero, que deja de serlo al agregar un café, al sincronizar otra pestaña o al recargar.
7. **Sin aviso flotante.** El vaciado automático **no** muestra «Vaciaste el pedido.» con «Deshacer»: el cliente no lo pidió, y el aviso competiría con el `role="status"` del respaldo. La vista ya lo explica y trae «Recuperar el pedido». Hace falta un vaciado sin aviso en el proveedor; cómo se expone lo decide el desarrollador (ver la entrega).
8. **Cabecera y barra en 0 sin trabajo extra.** El contador de «Pedido» (`encabezado.tsx:67`) se oculta con `bolsas === 0`, y la `BarraPedido` (`cajon-carrito.tsx:31`) no se muestra con 0 bolsas ni en `/pedido`. Ambos leen el proveedor, así que se actualizan en el mismo render.
9. **Los datos de envío no se tocan.** `valores`, `datosEnvio` y las cuatro casillas siguen en memoria tal cual. No se escriben en el navegador (sin cambio) ni se borran con el vaciado.
10. **Se retira «Vaciar pedido» del respaldo**, porque el pedido ya está vacío. En el cajón se queda igual.

## Vista «Mensaje listo», 360 px

*Orden revisado el 2026-11-19 por QA-030 (ver «Ajuste QA-030» abajo): las dos acciones van antes del bloque «En el mensaje». Textos según microcopy v1.12 §9.6 (T3 final de LEG-189).*

```
TU PEDIDO                                        ← Antetitulo (ya existe en FlujoPedido)
                                                 ← sin indicador de pasos (WhatsApp no es un paso, LEG-175)
Envía el mensaje en WhatsApp                     ← h1 .h2 text-ink-title, tabIndex=-1, recibe el foco
Con ese mensaje nos pides el pedido. Te          ← body text-ink; variante según instantanea.porCotizar
respondemos con el total para que lo aceptes
y te damos los datos para pagar.
Vaciamos «Tu pedido» en este navegador para      ← caption text-ink-muted (T3, LEG-189), siempre bajo la bajada
que puedas armar uno nuevo. El mensaje de
WhatsApp lleva todos los cafés.
[  (wa)  Enviar por WhatsApp            ]        ← primario lg, max-sm:w-full; reabre el mismo enlace
┌ respaldo (igual que en A1) ───────────┐        ← bg-surface-sunken p-5 rounded-lg; siempre bajo el botón (§9.4)
│ ¿No se abrió WhatsApp? Copia el       │          role="status", textoRespaldo() sin cambio
│ mensaje y envíalo al +57 300 112 9874.│
│ [ ⧉ Copiar mensaje ]                  │          secundario, ancho completo
│ ▸ Ver el mensaje                      │          details/summary con instantanea.pedido.texto
│ Acortamos tus indicaciones…           │          solo si aplica
└───────────────────────────────────────┘
┌ EN EL MENSAJE ────────────────────────┐        ← mismo bloque compacto del paso Envío, sin «Editar»
│ Café Casa Martínez · 250 g · grano × 2│          caption text-ink
│ 3 bolsas                              │          caption text-ink-muted
└───────────────────────────────────────┘
        Recuperar el pedido                      ← Boton variante="enlace" tamano="sm", solo con puedeDeshacer
        Seguir viendo cafés                      ← BotonEnlace variante="enlace" tamano="sm", /cafes/
```

- Contenedor `section aria-labelledby="t-enviado" class="max-w-2xl"`, `data-testid="pedido-enviado"`.
- Separaciones: bajada `mt-2`, nota `mt-2`, botón `mt-6`, respaldo `mt-6` (propio del componente `Respaldo`), bloque `mt-6`, enlaces `mt-4 flex flex-col items-center gap-2`. Todo en tokens existentes; no hay componentes ni colores nuevos.
- Bloque «En el mensaje»: el mismo marcado de `data-testid="bloque-tu-pedido"` con `h2 overline text-ink-muted` «En el mensaje», alimentado por la instantánea. `data-testid="bloque-en-el-mensaje"`.
- Altura aproximada a 360 × 740 con T2a (4 líneas) y T3 (3 líneas): encabezado + antetítulo + `py` ≈ 147, h1 80, bajada 104, nota 52, botón 54, primera línea del respaldo 48, rellenos y separaciones ≈ 96. «Copiar mensaje» queda entre y ≈ 580 y y ≈ 626: entero en la primera pantalla, con ≈ 110 px de holgura. Esa posición ya no depende del número de líneas del bloque («y N más» incluido).

### Ajuste QA-030 (2026-11-19)

**Problema.** Con la nota T3 final (LEG-189, 3 líneas a 360 px) y la bajada T2a en 4 líneas, «Copiar mensaje» quedaba de y = 725 a y = 771 a 360 × 740: solo 15 de sus 46 px a la vista.

**Decisión.** Mover el bloque «En el mensaje» debajo del respaldo. No se cambia ningún texto, tamaño de letra ni separación.

**Por qué este ajuste y no otros.**
- Recortar separaciones (`mt-6` → `mt-4`, `py` del contenedor) daba ≈ 30 a 40 px, justo lo que faltaba. Volvía a fallar con tres líneas en el bloque o con «y N más», y el `py` del contenedor es de toda la página `/pedido/`.
- Bajar el h1 de la escala `h2` (32 px en celular) a menos de 32 px rompe la escala de titulares de la marca (64/48/40/32). Con «Envía el mensaje en WhatsApp» en dos líneas, el h1 tampoco cabe en una línea a ningún tamaño de la escala.
- Jerarquía: lo que el cliente necesita en esta vista es actuar (reabrir WhatsApp o copiar el mensaje). El bloque «En el mensaje» sirve para comprobar el mensaje, y debajo del respaldo queda junto a «Recuperar el pedido», que devuelve justo esas líneas. Ese vecindario tiene más sentido que el anterior.

**Lo que no cambia, por legal.** La nota T3 sigue bajo la bajada (§9.6, «Nota bajo la bajada») y el respaldo sigue debajo del botón (§9.4). La tabla de §9.6 no fija la posición del bloque de líneas. LEG-188 (3) pide que el bloque salga de la misma copia, no un lugar en la vista, y eso no cambia. Ningún texto se recorta ni se reescribe. Si legal entiende que el orden de la tabla de §9.6 es normativo, el ajuste se revierte y se vuelve a la opción de separaciones con el criterio de QA corregido.

**Teclado y lectores.** El bloque no tiene elementos con foco, así que el orden de Tab no cambia: h1 → «Enviar por WhatsApp» → «Copiar mensaje» → «Ver el mensaje» → «Recuperar el pedido» → «Seguir viendo cafés». El `role="status"` del respaldo se sigue anunciando una sola vez. El h2 «En el mensaje» sigue siendo el único h2 de la vista.

**Escritorio.** Se usa el mismo orden; la columna `max-w-2xl` no cambia.

## Escritorio (`md`+)

La misma columna `max-w-2xl`, alineada a la izquierda como el Resumen. El botón principal y «Copiar mensaje» tienen ancho natural. «Recuperar el pedido» y «Seguir viendo cafés» van en una fila bajo el respaldo (`md:flex-row md:justify-start md:gap-6`).

## Estados y casos

| Caso | Qué pasa |
|---|---|
| Clic válido en Resumen | `window.open` → instantánea → vaciado sin aviso → vista «Mensaje listo», con el foco en su h1. Cabecera y barra en 0 |
| Segundo clic en la vista | Reabre el mismo enlace y el mismo DS. No cambia nada más |
| «Copiar mensaje» / «Ver el mensaje» | Usan `instantanea.pedido.texto`, con los mismos avisos de hoy (`avisar(...)` y la selección de respaldo) |
| «Recuperar el pedido» | `deshacer()`: vuelve el carrito, el cliente regresa al paso en que estaba (normalmente Resumen) y el foco va al h1 «Revisa tu pedido». Respaldo visible y el mismo DS mientras nada cambie |
| Botón atrás del navegador desde Resumen | `/pedido/` sigue mostrando «Mensaje listo» porque la instantánea sigue en memoria. Otro atrás sale del flujo con el pedido en 0 |
| Recarga (F5) | La instantánea y los datos de envío se pierden (solo estaban en memoria). Con el pedido vacío: «Tu pedido está vacío» (sin cambio). No hay forma de recuperar el mensaje; es el costo de no guardar datos personales en el navegador (LEG-149) |
| «Seguir viendo cafés» u otro enlace | `Contenido` se desmonta y la instantánea se pierde. Hasta que agregue otro café, el cajón conserva «Deshacer» en su estado vacío (ya existe), que equivale a recuperar |
| Abrir el cajón desde la vista | Estado vacío del cajón con «Ver los cafés» y «Deshacer» (sin cambio). «Deshacer» recupera el pedido igual que el enlace de la vista |
| Agrega un café nuevo (esta u otra pestaña) | El carrito deja de estar vacío y no coincide con la firma: se descarta la instantánea y rige el flujo normal (Envío). `puedeDeshacer` pasa a falso |
| Vuelve a armar, en esta u otra pestaña, **exactamente** el contenido del mensaje (mismos cafés, tamaños, presentaciones y cantidades) | **Comportamiento deseado** (confirmado el 2026-11-19, observación 1 de QA en `docs/qa/2026-11-19-vaciar-pedido.md`). La firma vuelve a coincidir y la instantánea sigue vigente: la pestaña con «Mensaje listo» pasa al Resumen con los datos y las casillas como estaban, el respaldo visible y el **mismo DS** en el siguiente clic. Es lo mismo que «Recuperar el pedido» y cumple microcopy §9.4 («se descarta si el carrito vuelve a tener cafés **distintos**») y LEG-188 (5) (sin cambios, el mismo DS). El mensaje sería idéntico letra por letra, así que un DS nuevo haría ver como dos solicitudes lo que es una sola. Si de verdad quiere un segundo pedido igual, lo aclara en el chat, o cualquier cambio (una casilla, un dato, una cantidad) genera DS nuevo por QA-022. No hace falta aviso ni texto nuevo |
| Otra pestaña abierta | Recibe el carrito vacío por `localStorage`: cabecera en 0 y, si estaba en `/pedido/`, «Tu pedido está vacío» (no tiene instantánea). No ve el mensaje: los datos personales no viajan entre pestañas |
| WhatsApp bloqueado o sin app | El pedido igual se vacía (no se puede saber). El respaldo y «Recuperar el pedido» cubren el caso |

## Teclado, foco y anuncios

- Al pasar a «Mensaje listo», el foco va al h1 (`tabIndex={-1}`, `scroll-mt-24`), como en cualquier cambio de paso de A1. El botón que tenía el foco desaparece, así que el foco no puede quedarse en él (A1 decía «el foco se queda en el botón»; esa línea queda sustituida).
- El `role="status"` del respaldo se anuncia una vez, al montar la vista. No se anuncia nada más: ni aviso flotante ni región viva extra.
- Orden de tabulación: h1 → «Enviar por WhatsApp» → «Copiar mensaje» → «Ver el mensaje» → «Recuperar el pedido» → «Seguir viendo cafés».
- Sin animación nueva. Si el desarrollador agrega un fundido, que sea de 150 ms en `opacity` con `motion-reduce:transition-none`.

## Textos nuevos [CONSULTAR-LEGAL]

| # | Dónde | Texto propuesto | Nota |
|---|---|---|---|
| T1 | h1 de la vista | `Envía el mensaje en WhatsApp` | No dice «compra», «confirmado» ni «finalizado» (regla 3 de §5.9). Es cierto se haya abierto WhatsApp o no |
| T2a | Bajada, envío con tarifa | `Con ese mensaje nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.` | Son las dos últimas frases de §9.3 (aprobadas), sin «Al pulsar…» |
| T2b | Bajada, por cotizar | `Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.` | Frases de §9.3, variante por cotizar |
| T3 | Nota bajo la bajada | `Quitamos estos cafés de tu pedido en este navegador para que puedas empezar uno nuevo.` | Explica el vaciado sin hablar de «carrito» (el sitio dice «pedido») |
| T4 | Rótulo del bloque | `En el mensaje` | UI |
| T5 | Enlace | `Recuperar el pedido` | UI |
| T6 | Regla 4 de §9.5 | La redacción propuesta en «Condición previa» | Cambio de regla, no de interfaz |

Sin cambio: «Enviar por WhatsApp» (D1 §5), «Copiar mensaje», «Ver el mensaje», `textoRespaldo()`, «Acortamos tus indicaciones…», «Seguir viendo cafés».

Pregunta para legal: con el pedido vacío y el mensaje generado, ¿hace falta mostrar el número DS fuera del mensaje? Diseño propone que **no**: ya está en «Ver el mensaje» y en WhatsApp, y P39 lo deja solo en el mensaje.

## Para el desarrollador (`desarrollador-fullstack`)

1. Proveedor: un vaciado **sin aviso** que conserve `deshacer` (p. ej. una opción de `vaciar` o una acción aparte). Cambia la interfaz pública del contexto, así que lo decide y lo prueba el desarrollador.
2. `flujo-pedido.tsx`, `enviar()`: después de `window.open(r.pedido.enlace, …)`, guardar la instantánea (pedido, firma, líneas compactas, bolsas, `porCotizar`) y vaciar sin aviso. No mover nada antes de `window.open`.
3. Regla de invalidación: no descartar la instantánea si `lineas.length === 0` por el envío. Sí descartarla si vuelven líneas con otra firma. Mantener QA-022 en los demás casos.
4. Render: `listo && lineas.length === 0 && instantanea` → vista «Mensaje listo» en `/pedido/` y en `?paso=resumen`, antes del estado vacío. Sin indicador de pasos.
5. «Recuperar el pedido» → `deshacer()`. Si la firma coincide, el Resumen muestra el respaldo vigente. Foco al h1 del paso.
6. Retirar «Vaciar pedido» del respaldo del Resumen.
7. Textos T1 a T5 solo después del visto bueno de legal y con la microcopy v1.12 publicada. Hasta entonces, la rama no se fusiona.
8. Actualizar los comentarios que dicen «el carrito no se vacía solo» y la prueba que lo afirme.

## Para QA (`qa-pruebas`)

- 360 × 740 y 1280: clic válido → WhatsApp se abre (popup capturado), contador de la cabecera oculto, `BarraPedido` ausente al salir de `/pedido/`, `localStorage` sin líneas.
- El texto de «Copiar mensaje» y de «Ver el mensaje» en la vista es idéntico al `text` del enlace abierto, con el mismo DS. El segundo clic abre el mismo enlace.
- Clic sin casillas o con línea agotada: nada se vacía.
- No aparece el aviso flotante «Vaciaste el pedido.» tras el envío. `role="status"` del respaldo, una sola vez.
- Foco en el h1 «Envía el mensaje en WhatsApp». Orden de Tab como en la sección de foco.
- «Recuperar el pedido»: el carrito vuelve, contador > 0, Resumen con datos y casillas como estaban, el mismo DS y respaldo visible. Cambiar una casilla tras recuperar oculta el respaldo y el siguiente clic da un DS nuevo.
- Atrás desde Resumen → «Mensaje listo». Recarga → «Tu pedido está vacío». Otra pestaña → contador en 0 y sin mensaje.
- Agregar un café desde el cajón o desde otra pestaña descarta la vista y muestra el paso Envío.
- axe en la vista nueva (360 y escritorio). `prefers-reduced-motion` sin transiciones.
- QA-030: a 360 × 740, sin desplazar, «Copiar mensaje» entero en la primera pantalla (`toBeInViewport({ ratio: 1 })`), con T2a y con T2b, y con 1, 3 y más de 3 líneas en el bloque. Orden en el DOM: nota → «Enviar por WhatsApp» → respaldo → bloque «En el mensaje» → enlaces.
- Ningún dato de envío en `localStorage`, `sessionStorage` ni URL después del envío (LEG-149).
