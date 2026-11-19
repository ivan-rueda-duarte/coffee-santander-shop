# Ronda QA — Vaciar el pedido al enviarlo por WhatsApp — 2026-11-19

Rama `feat/carrito-y-mapa`, HEAD `4c6e7e3`. Commits verificados: `b6f091f` (vaciado sin aviso), `c89ce30` (textos y regla de la copia), `2b8bcc2` (vista «Mensaje listo»), `259a80d` (pruebas del desarrollador). Chromium (Playwright), Linux.
Criterios: `docs/diseno/2026-11-19-vaciar-carrito.md` («Para QA»); `docs/legal/revisiones/2026-11-19-vaciar-pedido.md` (LEG-188 a LEG-191, seis condiciones de LEG-188); `docs/legal/microcopy-legal.md` v1.12 §9.4 a §9.6.

Servidores (el `serve out` del dueño en el 3000 no se tocó; tampoco el 4173 ni el worktree `feat/mapa-servidor`):

| Puerto | Build |
|---|---|
| 4470 | `out/` del repositorio en `4c6e7e3` |
| 40251 | Copia de `4c6e7e3` (`git archive`, fuera del repositorio) con `GITHUB_PAGES=true`, servida bajo `/coffee-santander-shop/`. El 4471 ya lo ocupaba otro proceso y `serve` eligió este puerto |

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm run lint` | pasa |
| `npm run typecheck` | pasa (también con el spec nuevo) |
| `npx vitest run --coverage` | pasa: 40 archivos, 612 pruebas. `src/domain/`: 99,66 % sentencias, 96,76 % ramas, 99,84 % líneas |
| `npm run build` | pasa (4 avisos de datos conocidos: SCA sin verificar, Arreboles y Casa Martínez sin rotulado completo, «Afrutado» sin perfil) |
| `E2E_PUERTO=4470 npx playwright test` (suite completa, con el spec nuevo salvo la prueba de QA-030) | **506 pasan, 0 fallan, 34 omitidas** (5,3 min) |
| `e2e/qa-2026-11-19-vaciar-pedido.spec.ts` (spec nuevo, 21 pruebas) | 19 pasan, **1 falla a propósito (QA-030)**, 1 omitida sin `E2E_BASEPATH_URL` |
| Ídem con `E2E_BASEPATH_URL=http://localhost:40251`, más `basepath.spec.ts` y «A1 bajo basePath» | 5 de 5 pasan |
| `--repeat-each=3` de `qa-2026-11-19-vaciar-pedido` + `vaciar-pedido-al-enviar` | 90 pasan, 3 omitidas (basePath). Sin intermitencias |
| `grep -rliE "gourmet\|premium\|exótic\|mágic\|el mejor\|Café de Santander" out/ --include=*.html` | 0 archivos |
| `grep -rEil "service_role\|SANITY_API_TOKEN\|sk[A-Za-z0-9]{20,}" out/` | 0 archivos |
| `grep -rl "TODO(dato" out/` | 0 archivos |

Omitidas (34): las que piden `E2E_BASEPATH_URL` (se corrieron aparte), `E2E_AGOTADO_URL`, `E2E_BASE_URL`/`E2E_MAIN_URL` y los builds de fechas del envío gratis. Ninguna toca el vaciado; la copia con CSV de agotados no se reconstruyó porque el caso «línea agotada al pulsar» se fuerza en el navegador (ver punto 3).

**Veredicto: APTO CON OBSERVACIONES.** Las seis condiciones de LEG-188, LEG-189 a LEG-191 y los puntos «Para QA» del diseño se cumplen y están probados. Se abre **QA-030 (Baja)**: a 360 × 740, «Copiar mensaje» no queda entero en la primera pantalla, como pide el diseño. No hay defectos Bloqueantes, Altos ni Medios abiertos.

## Verificación punto por punto

| # | Punto | Resultado | Prueba |
|---|---|---|---|
| 1 | Clic válido a 360 × 740 y 1.280 × 900: `wa.me` se abre dentro del gesto (`navigator.userActivation.isActive` en el `window.open` espiado) y **antes** del vaciado (en ese instante `localStorage` todavía tenía 2 líneas) | ✅ | `qa-2026-11-19-vaciar-pedido` › «clic válido a … › wa.me se abre en el gesto…» |
| 2 | Contador de la cabecera oculto (`#boton-pedido` = «Pedido», sin cifras); `localStorage` = `{"version":2,"lineas":[]}`; al salir con «Seguir viendo cafés» no hay `BarraPedido` ni su espaciador | ✅ | ídem |
| 3 | «Copiar mensaje», «Ver el mensaje» y el reintento son idénticos al `text` del enlace, con el mismo DS; el reintento también se abre en el gesto y no vuelve a vaciar; cada línea del bloque «En el mensaje» corresponde a una línea `•` del texto (café, gramos, presentación, cantidad) y «3 bolsas» | ✅ | «…salen de la misma copia (LEG-188 (3))» |
| 4 | Clic sin casilla 1 o sin casilla 2: ninguna pestaña, sin vaciado ni vista | ✅ | «sin casilla 2… y sin casilla 1…» |
| 5 | Clic con línea agotada (forzada): Casa Martínez 250 g agotado en el HTML de `/pedido/` y la línea inyectada en el reductor del carrito (la interfaz la filtra al leer y al sincronizar). Resultado: caja «error-lineas» con «Café Casa Martínez en 250 g está agotado.» y foco; ninguna pestaña; 2 líneas en `localStorage`; sin vista | ✅ | «línea agotada al pulsar (forzada)…» |
| 6 | Sin aviso «Vaciaste el pedido.» ni ningún `[data-aviso]` en 1,5 s; en la página solo hay un `role="status"` con texto, el del respaldo, y un `MutationObserver` cuenta una sola inserción | ✅ | prueba del punto 1 |
| 7 | Foco al h1 «Envía el mensaje en WhatsApp», también cuando se envía con Enter. Tab: h1 → Enviar por WhatsApp → Copiar mensaje → Ver el mensaje → Recuperar el pedido → Seguir viendo cafés; Shift+Tab vuelve; Espacio en «Recuperar» lleva al Resumen con el foco en su h1 | ✅ (360 y 1.280) | «foco al h1 y Tab…» |
| 8 | «Recuperar el pedido»: vuelve el carrito, el contador vuelve a 3, Resumen con datos y casillas como estaban, respaldo visible y el mismo DS; al cambiar una casilla el respaldo se va y el siguiente clic da DS nuevo | ✅ | `vaciar-pedido-al-enviar` (desarrollador), revisada y aceptada |
| 9 | Recuperar desde «Mensaje listo» en `/pedido/` (tras atrás): Envío con los datos; «Ver el resumen» → casillas marcadas, respaldo y el mismo DS | ✅ | «atrás → «Mensaje listo» en /pedido/…» |
| 10 | Tras recuperar, «Vaciar pedido» del cajón sí muestra el aviso y descarta la copia: «Deshacer» vuelve al Resumen sin respaldo y el siguiente clic da DS nuevo | ✅ | «tras recuperar, «Vaciar pedido» del cajón…» |
| 11 | Atrás desde el Resumen → «Mensaje listo»; recarga → «Tu pedido está vacío»; salir a `/cafes/` y volver con atrás → «Tu pedido está vacío» (la copia se pierde al salir de `/pedido/`) | ✅ | desarrollador + prueba del punto 1 |
| 12 | Otra pestaña: contador en 0, «Tu pedido está vacío», sin el mensaje ni el nombre. Abrir otra pestaña no quita «Recuperar el pedido» en la primera; recuperar allí devuelve solo las líneas a la otra (formulario vacío). Agregar un café en la otra pestaña lleva la primera a Envío sin «Recuperar» | ✅ | desarrollador + «abrir otra pestaña después del envío…» |
| 13 | «Deshacer» del cajón vacío recupera igual que el enlace (mismo DS) | ✅ | desarrollador |
| 14 | Variante por cotizar T2b: Leticia (zona 5) y más de 5 kg en Bucaramanga sin comuna (11 × 500 g = 5.580 g); el bloque dice «11 bolsas» | ✅ | «T2b con…» (dos pruebas) |
| 15 | T1, T2a, T2b, T3, T4, botón y respaldo **letra por letra**, leídos en tiempo de prueba de la tabla de microcopy v1.12 §9.6 (no copiados del código); T5 y «Seguir viendo cafés» exactos | ✅ | «T1, T2a, T3, T4…» |
| 16 | DS fuera del mensaje: ni en el texto de la página (sin el `<pre>`), ni en `document.title`, `aria-label`, `title` o `alt`. La vista no dice enviado, recibido, confirmado, compra, finalizado ni «Número de pedido» (LEG-188 (4), LEG-191) | ✅ | ídem |
| 17 | Nombre, celular (con y sin espacios), dirección, indicaciones, municipio, DS, constancia y promociones: ausentes de `localStorage`, `sessionStorage`, `history.state`, ruta, cookies y peticiones de red, tras el envío, con «Ver el mensaje» abierto, tras atrás, adelante, recuperar y recargar. Tras recargar, formulario vacío y casillas sin restaurar (LEG-188 (2) y (6)) | ✅ | «ni el mensaje ni los datos de envío salen de la memoria…» |
| 18 | axe sin violaciones serias ni críticas a 360 y 1.280, claro y oscuro, con «Ver el mensaje» cerrado y abierto | ✅ | «axe en «Mensaje listo»…» + desarrollador |
| 19 | `prefers-reduced-motion`: ningún elemento de la vista con transición o animación de más de 1 ms; `document.getAnimations()` sin animaciones en curso | ✅ | «prefers-reduced-motion…» |
| 20 | `basePath`: URL `/coffee-santander-shop/pedido/?paso=resumen`, «Seguir viendo cafés» con el prefijo, recuperar y reenviar con el mismo DS | ✅ | ««Mensaje listo» bajo basePath» |
| 21 | «Copiar mensaje» en la primera pantalla a 360 × 740 (diseño, «altura aproximada») | ❌ QA-030 | «QA-030: a 360 × 740…» |

## Pruebas del desarrollador ajustadas en `259a80d`: revisión

| Archivo | Cambio | Decisión |
|---|---|---|
| `autorizacion-datos.spec.ts` | `recuperarPedido` antes de volver al envío y borrar el correo | **Aceptado**: sin recuperar, el Resumen ya no existe tras el envío; lo que se prueba (casilla 4 y descarte del respaldo) no cambia |
| `flujo-tres-pasos.spec.ts` | recupera antes de cambiar casillas o dirección; el bloque de «otra pestaña» ahora mira el respaldo de «Mensaje listo»; agrega la búsqueda de textos prohibidos en la vista | **Aceptado**: la cadena de pruebas QA-022 se conserva entera |
| `legal-resumen-envios.spec.ts` | la vista no repite retracto ni garantía; tras recuperar, el aviso aparece una vez | **Aceptado** |
| `pedido.spec.ts` | el foco va al h1 de «Mensaje listo» en lugar del botón; recupera antes de «Volver al envío» | **Aceptado**: el diseño sustituye «el foco se queda en el botón» de A1 |
| `qa-2026-11-14-paquete-abogado.spec.ts` | `localStorage` con `lineas: []` tras el envío y, al recuperar, solo la línea | **Aceptado**: refuerza la prueba (solo la clave del carrito, antes y después) |
| `qa-2026-11-18-flujo-tres-pasos.spec.ts` | foco al h1 y Tab h1 → Enviar → Copiar; recupera antes de cambiar casillas o destino; respaldo sin «Vaciar pedido» | **Aceptado**: LEG-190 retira «Vaciar pedido» del respaldo |
| `qa-2026-11-18-verificacion-qa-022-024.spec.ts` | recupera tras el segundo clic y entre los tres envíos de QA-023 | **Aceptado**: QA-022 sigue probando que deshacer un cambio da DS nuevo |
| `ayudas.ts` | helper `recuperarPedido` | **Aceptado** |
| `vaciar-pedido-al-enviar.spec.ts` (nuevo) | — | **Aceptado con una observación**: su comprobación de «Copiar mensaje en la primera pantalla» usa `toBeInViewport()` sin `ratio`, que pasa con un solo píxel visible. Por eso no detectó QA-030. La prueba de cierre está en el spec de QA |

Ninguno de los ajustes debilita la prueba: en todos los casos se agrega un paso (recuperar) que el cambio de producto hace necesario, y las aserciones originales se mantienen.

## Capturas regeneradas y aprobadas

- `docs/qa/capturas/2026-11-18-a1-respaldo-{360,1280}-{light,dark}.png`: ahora muestran el respaldo dentro de «Mensaje listo», con «Copiar mensaje», «Ver el mensaje» abierto y **sin «Vaciar pedido»** (LEG-190). La de 360 en claro sigue con el encabezado fijo tapando la primera línea, como ya se anotó en la ronda de QA-029; para esa línea vale `2026-11-19-qa-029-respaldo-360.png`. **Aprobadas.**
- `docs/qa/capturas/2026-11-19-qa-029-respaldo-{360,1280}.png`: primera línea en 14 px/600, botón «Copiar mensaje» y «Ver el mensaje»; sin «Vaciar pedido». **Aprobadas.**
- Nuevas: `2026-11-19-mensaje-listo-{360,1280}.png` (página completa, claro), `2026-11-19-mensaje-listo-{360,1280}-dark.png` (vista en oscuro con el mensaje abierto: botón oro con texto carbón, como manda la marca en el tema oscuro), `2026-11-19-qa-030-primera-pantalla-360.png`.

## Defectos

| ID | Severidad | Área | Título | Responsable | Estado |
|---|---|---|---|---|---|
| QA-030 | Baja | Checkout / diseño | A 360 × 740, «Copiar mensaje» no queda entero en la primera pantalla de «Mensaje listo» | disenador-marca → desarrollador-fullstack | Abierto |

### QA-030 — A 360 × 740, «Copiar mensaje» no queda entero en la primera pantalla de «Mensaje listo»

- **Severidad:** Baja (el respaldo está a 15 px de desplazamiento y su primera línea sí se ve; afecta la promesa del diseño para quien no logra abrir WhatsApp desde el celular).
- **Entorno:** Chromium (Playwright), 360 × 740, rama `feat/carrito-y-mapa`, commit `4c6e7e3`, `out/` servido en el 4470.
- **Pasos para reproducir:** 1. Carrito con dos líneas (Casa Martínez 250 g grano × 2, Arreboles 500 g molido × 1). 2. `/pedido/`, datos de envío con Bucaramanga, «Ver el resumen». 3. Marcar las casillas 1 y 2 y pulsar «Enviar por WhatsApp». 4. Sin desplazar, mirar la primera pantalla.
- **Resultado esperado:** `docs/diseno/2026-11-19-vaciar-carrito.md`, «Vista Mensaje listo, 360 px»: altura aproximada ≈ 610 px, «"Copiar mensaje" queda en la primera pantalla».
- **Resultado obtenido:** `scrollY = 0`, h1 en y = 147, «Copiar mensaje» de y = 725 a y = 771: solo 15 de sus 46 px quedan dentro de los 740 px. La bajada T2a ocupa 4 líneas y la nota T3 (más larga que la de la especificación, por LEG-189) 3; el encabezado, el antetítulo y el `py-10` del contenedor suman ≈ 147 px antes del h1.
- **Evidencia:** `e2e/qa-2026-11-19-vaciar-pedido.spec.ts` › «QA-030: a 360 × 740, «Copiar mensaje» entero en la primera pantalla de «Mensaje listo»» falla con «Copiar mensaje va de y=725 a y=771 con 740 px de alto». Traza: `test-results/qa-2026-11-19-vaciar-pedid-cc18a-pantalla-de-«Mensaje-listo»-chromium/trace.zip`. Captura: `docs/qa/capturas/2026-11-19-qa-030-primera-pantalla-360.png`.
- **Responsable sugerido:** `disenador-marca` decide cómo recuperar ≈ 31 px o más (separaciones, `py` del contenedor en celular, o aceptar que el respaldo empiece en la primera pantalla y corregir el criterio de la especificación); `desarrollador-fullstack` lo aplica. Si diseño cambia el criterio, la prueba de cierre se ajusta en QA con esa especificación.
- **Estado:** Abierto.

## Observaciones (sin defecto)

1. **Mismo café agregado desde otra pestaña.** Con «Mensaje listo» abierto, si en otra pestaña se agrega exactamente el mismo contenido que llevaba el mensaje (probado con una línea, Casa Martínez 250 g grano × 1), la firma coincide y la primera pestaña pasa al Resumen con las casillas marcadas, el respaldo visible y el **mismo DS** en el siguiente clic. Cumple la microcopy v1.12 §9.4 («se descarta si el carrito vuelve a tener cafés **distintos** de los del mensaje») y LEG-188 (5) (sin cambios, mismo DS). La tabla de estados del diseño dice «Agrega un café nuevo… no coincide con la firma: se descarta», que no contempla este caso. Se pide a `disenador-marca` que confirme si es el comportamiento deseado; no se abre defecto porque el texto legal lo admite y el mensaje sería idéntico.
2. **Dos capturas ajenas a esta ronda.** Al terminar la suite completa, `docs/qa/capturas/ficha-tecnica-360.png` y `ppt-360.png` aparecían modificadas sin que ninguna prueba del repositorio las genere. Las devolví a la versión del último commit para no mezclarlas en este commit. Si las había regenerado otro agente en este mismo árbol, hay que volver a generarlas.

## Paridad v1

| Inventario | Función | Estado |
|---|---|---|
| 22 | Vaciar pedido con deshacer | ✅ igual en el cajón (aviso «Vaciaste el pedido.» con «Deshacer»). El vaciado automático del envío no muestra aviso y se recupera con «Recuperar el pedido» o con «Deshacer» en el cajón vacío |
| 29 | Panel «Tu pedido está listo en WhatsApp»: mensaje, Copiar, Abrir otra vez, Editar, Vaciar, número | ⚠️ distinta: «Mensaje listo» con mensaje («Ver el mensaje»), «Copiar mensaje», reintento con «Enviar por WhatsApp» (mismo enlace) y «Recuperar el pedido» (equivale a Editar). No hay «Vaciar» porque el pedido ya se vació (LEG-190), y el número DS solo va dentro del mensaje (LEG-191). En la v1 el carrito no se vaciaba solo; en la v2 sí, por pedido del dueño del 2026-11-19 |

## Cobertura

- Unitarias: 612 pruebas. `src/domain/pedido/flujo.ts` (textos de §9.6, `bajadaMensajeListo`, `revisarCopia`) al 100 %.
- E2E nuevas en `e2e/qa-2026-11-19-vaciar-pedido.spec.ts` (21): clic válido a 360 y 1.280 (4), QA-030 (1, falla a propósito), clic no válido (2), textos y DS (3), foco y teclado (2), recuperar y navegación (4), datos personales (1), axe claro y oscuro (2), movimiento reducido (1) y basePath (1, con `E2E_BASEPATH_URL`).
- Lo que no se automatizó: lectores de pantalla reales (el anuncio único se comprobó con el árbol y con un `MutationObserver`) y Safari/Firefox (el proyecto solo define Chromium).

## Entrega para desarrollador-fullstack

Reporte: `docs/qa/2026-11-19-vaciar-pedido.md`.

1. **QA-030 (Baja, Abierto)**: a 360 × 740, «Copiar mensaje» queda de y = 725 a y = 771. Primero `disenador-marca` decide el ajuste (o cambia el criterio de la especificación). Prueba que debe pasar: `e2e/qa-2026-11-19-vaciar-pedido.spec.ts` › «QA-030: a 360 × 740, «Copiar mensaje» entero en la primera pantalla de «Mensaje listo»». Conviene también cambiar `toBeInViewport()` por `toBeInViewport({ ratio: 1 })` en `e2e/vaciar-pedido-al-enviar.spec.ts` (`:262`).

No hay otros defectos abiertos. Con QA-030 en Baja, la rama puede fusionarse si el dueño lo acepta; legal pide informar al abogado antes de publicar (LEG-188 a LEG-191, recomendado, no bloqueante).
