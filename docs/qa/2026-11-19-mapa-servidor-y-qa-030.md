# Ronda QA — Mapa dibujado en el servidor y cierre de QA-030 (ronda final antes de publicar) — 2026-11-19

Rama `feat/carrito-y-mapa`, HEAD `7693b25`. Commits verificados: `d3fac81` (QA-030), `1a7b097` (capa de textos del mapa en el dominio) y `7693b25` (mapa dibujado en el servidor con la interacción como isla; O-1 de `docs/qa/2026-11-18-cierre-media.md`, aprobada por el dueño). Chromium (Playwright), Linux.
Criterios: «Ajuste QA-030» y «Para QA» de `docs/diseno/2026-11-19-vaciar-carrito.md`; encargo de la sesión principal para el mapa.

Servidores (el `serve out` del dueño en el 3000 no se tocó; tampoco el 4173):

| Puerto | Build |
|---|---|
| 4490 | `out/` del repositorio en `7693b25` |
| 4491 | `main` (`a32e00d`), copia con `git archive` fuera del repositorio |
| 4492 | Copia de `7693b25` con `GITHUB_PAGES=true NEXT_PUBLIC_SITE_URL=https://ivan-rueda-duarte.github.io/coffee-santander-shop`, servida bajo `/coffee-santander-shop/` |

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm run lint` | pasa (también con los specs nuevos y ajustados) |
| `npm run typecheck` | pasa |
| `npx vitest run --coverage` | pasa: 41 archivos, 624 pruebas. Cobertura: 99,69 % sentencias, 96,46 % ramas, 99,86 % líneas |
| `npm run build` | pasa (4 avisos de datos conocidos) |
| Suite e2e antes de tocar nada (`E2E_PUERTO=4490`) | 505 pasan, **2 fallan** (las dos pruebas que contradecían el cambio aprobado, ver «Pruebas ajustadas»), 35 omitidas |
| Suite e2e completa al cierre (`E2E_PUERTO=4490 E2E_BASEPATH_URL=http://localhost:4492`) | **561 pasan, 3 fallan a propósito (QA-031, QA-032 a 320 y a 360), 29 omitidas** (3,4 min) |
| `e2e/qa-2026-11-19-mapa-servidor.spec.ts` con `E2E_MAIN_URL=http://localhost:4491` y `E2E_BASEPATH_URL` | 44 pruebas: 41 pasan, 3 fallan a propósito (QA-031 y QA-032) |
| `--repeat-each=3` de mapa servidor, vaciado (QA y desarrollador), `catalogo-y-mapa`, `movil` y `cierre-media`, sin QA-031/032 | 384 pasan, 9 omitidas. Sin intermitencias. Las 3 fallas son la prueba de QA-028 de `cierre-media` (`:390`), atada a un main anterior a `f310098`; con `E2E_MAIN_URL` = `a32e00d` ya no aplica (ver O-4) |
| QA-031 contra main (`E2E_ESCAPE_URL=http://localhost:4491/`, `--repeat-each=5`) | main **pasa 5 de 5**; HEAD **falla 5 de 5** |
| Lighthouse 13.6 móvil (copia local de npx, Chromium de Playwright), 3 corridas por build | HEAD: Rendimiento 92/92/92, Accesibilidad 100, Buenas prácticas 100, SEO 100; LCP 3,3–3,4 s, FCP 0,9 s, TBT 40–50 ms, CLS 0, 459 KiB. main: 93/94/92, 100, 100, 100; FCP 0,8 s, 437 KiB |
| `grep -rliE "gourmet\|premium\|exótic\|mágic\|el mejor\|Café de Santander" out/ --include=*.html` (y en el build de basePath) | 0 archivos |
| `grep -rEil "service_role\|SANITY_API_TOKEN\|sk[A-Za-z0-9]{20,}" out/` (y en el build de basePath) | 0 archivos |
| `grep -rl "TODO(dato" out/` | 0 archivos |

Omitidas (29): las que piden `E2E_MAIN_URL` (comparaciones con main; las del mapa se corrieron aparte), `E2E_BASE_URL`, `E2E_AGOTADO_URL` y los builds de fechas del envío gratis.

**Veredicto: APTO CON OBSERVACIONES.** QA-030 queda **Cerrado**. El mapa dibujado en el servidor cumple: sin JS se ve completo y los pines navegan; con JS la interacción llega sin desplazar nada, el clic, la tecla o el toque hechos antes de que llegue se repiten una sola vez, y las posiciones de rótulos y pines coinciden con main en los siete anchos. QA-018 cabe en el presupuesto también a 1.440 px. Se abren **QA-031 (Media)**, una regresión de esta rama (a menos de 768 px con ratón, la hoja de la provincia se abre y se cierra sola tras Escape), y **QA-032 (Baja)**, que ya estaba en main (rótulos de Comunera y Vélez pisados a 320 y 360 px). No hay defectos Bloqueantes ni Altos. Se puede publicar, pero **conviene corregir QA-031 antes**: es de esta rama y es acotado.

## 1. QA-030: verificación y cierre

| # | Criterio («Ajuste QA-030» y «Para QA») | Resultado | Prueba |
|---|---|---|---|
| 1 | 360 × 740, sin desplazar (`scrollY = 0`), «Copiar mensaje» entero (`toBeInViewport({ ratio: 1 })`) con T2a: 1, 3 y 5 líneas («y 2 más») | ✅ de y = 577 a y = 623 en los tres casos (117 px de margen) | `qa-2026-11-19-vaciar-pedido` › «QA-030 verificación (d3fac81)…» (6 pruebas) |
| 2 | Lo mismo con T2b (Leticia, por cotizar): 1, 3 y 5 líneas | ✅ de y = 551 a y = 597 | ídem |
| 3 | Orden en el DOM: nota → «Enviar por WhatsApp» → respaldo → bloque «En el mensaje» → enlaces; el bloque no queda dentro del respaldo | ✅ en las 6 variantes | ídem |
| 4 | Tab sin cambios: h1 → Enviar → Copiar → Ver el mensaje → Recuperar → Seguir viendo cafés | ✅ en las 6 variantes y en las pruebas previas a 360 y 1.280 | ídem + «foco al h1 y Tab…» |
| 5 | axe sin violaciones serias ni críticas | ✅ en las 6 variantes y en claro y oscuro (pruebas previas) | ídem |
| 6 | `role="status"` una sola vez: un `MutationObserver` cuenta 1 inserción y la página tiene un solo `role=status` con texto, el del respaldo; «En el mensaje» sigue siendo el único h2 | ✅ | ídem |
| 7 | Prueba de cierre original (bajada T2a, 2 líneas) | ✅ pasa | «QA-030: a 360 × 740, «Copiar mensaje» entero…» |
| 8 | `e2e/vaciar-pedido-al-enviar.spec.ts:262` con `toBeInViewport({ ratio: 1 })` | ✅ cambiado y pasa | «axe y orden de tabulación en «Mensaje listo» a 360 px» |

Capturas regeneradas y **aprobadas**: `2026-11-19-mensaje-listo-{360,1280}.png`, `2026-11-19-mensaje-listo-{360,1280}-dark.png`, `2026-11-19-qa-030-primera-pantalla-360.png` (ahora con «Copiar mensaje» entero y el bloque debajo del respaldo). Nuevas: `2026-11-19-qa-030-verificacion-t2{a,b}-5-lineas-360.png`. La suite también regeneró, con el orden nuevo, `2026-11-18-a1-respaldo-*` y `2026-11-19-qa-029-respaldo-*`: revisadas y aprobadas.

**QA-030: Cerrado** (estado actualizado también en `docs/qa/2026-11-19-vaciar-pedido.md`).

## 2. Mapa dibujado en el servidor (1a7b097, 7693b25)

Spec nuevo: `e2e/qa-2026-11-19-mapa-servidor.spec.ts`. El trozo de la interacción se reconoce por su texto («Ver todo Santander»), no por su nombre con hash. Para actuar antes de que llegue, la prueba lo retrasa 1,5 s con `page.route`.

| # | Punto | Resultado | Prueba |
|---|---|---|---|
| 1 | Sin JS a 320, 360 y 1.440: SVG con las 7 provincias y ≥ 87 municipios; Guanentá y Soto Norte con `role=button`, las 5 vacías sin rol; los 7 rótulos en el HTML; las vacías visibles llevan «Próximamente»; 2 pines enlazados a `/cafes/<slug>/` con su `aria-label`; sin desborde horizontal; ningún rótulo fuera de la caja | ✅ (los rótulos que chocan con un pin se ocultan en su tramo de ancho, igual que en main; ver punto 9) | «mapa sin JavaScript…» |
| 2 | Sin JS, un pin navega a su ficha | ✅ | «un pin del HTML navega…» |
| 3 | axe sobre el marcado del build (capa fija, con JS y sin ningún gesto, la interacción sin pedir) a 360 y 1.440 | ✅ sin violaciones serias ni críticas. Con JS desactivado, axe no puede ejecutarse en la página | «axe sin violaciones serias en el mapa del HTML…» |
| 4 | El trozo no se pide al cargar: a 360 hasta que el mapa se acerca; a 1.440 (mapa a la vista) hasta el primer gesto | ✅ | `cierre-media` (ajustada) + «escritorio: el trozo… llega con el primer gesto» |
| 5 | Tarjeta con ratón y con teclado (foco), Escape la cierra y el foco se queda en la provincia, a 1.280 y 360 | ✅ (con el puntero fuera de donde cae la hoja; ver QA-031) | «tarjeta con ratón y con teclado…» |
| 6 | Toque a 360: abre la hoja y no filtra | ✅ | «360 con toque…» + `movil.spec` |
| 7 | **Antes** de que llegue la interacción: clic de ratón (1.280 y 360), Enter y Espacio (1.280) filtran **una sola vez** (la URL sigue con la provincia 0,8 s después); Espacio no desplaza la página; toque a 360 abre la hoja y no filtra | ✅ | «…antes de que llegue la interacción…» (5 pruebas) |
| 8 | Chips del catálogo a 360 y 1.440: piden la interacción, reencuadran (viewBox distinto del completo) y marcan la provincia; «Ver todo Santander» vuelve al viewBox completo y desaparece | ✅ | «los chips reencuadran el mapa…» |
| 9 | Movimiento reducido: un solo cambio de `viewBox` (sin cuadros intermedios) y ninguna animación en curso | ✅ | «movimiento reducido…» |
| 10 | `/?provincia=soto` al cargar, a 360 y 1.440: la interacción llega sin gesto, Soto Norte `aria-pressed=true`, encuadre más estrecho que el departamento, «1 café en Soto Norte» | ✅ | «/?provincia=soto al cargar…» |
| 11 | CLS al recorrer el inicio a 360 y 1.440 < 0,01 | ✅ | `cierre-media` › «CLS a … al cargar y recorrer» |
| 12 | Paso de la capa fija a la medida a 360 y 1.440: 0 desplazamiento de diseño; todas las piezas (rótulos, pines, nombres, marcas, escala) en el mismo sitio (± 1,5 px); caja del mapa y alto de la sección iguales con y sin JS (± 1 px) | ✅ CLS 0 | «cambio de capa fija → medida…» + `cierre-media` «el hueco del mapa mide lo mismo» (360, 768, 1.440) |
| 13 | Área táctil de los pines ≥ 44 px y sin solape, sin JS y con la interacción, a 360 y 1.440 | ✅ | «área táctil de los pines…» (4) |
| 14 | Orden de foco: «Ir a los cafés» → Guanentá → Soto Norte → pin Casa Martínez → pin Arreboles, igual sin JS, con JS y en main | ✅ | «orden de foco del mapa» |
| 15 | Posiciones contra main (`a32e00d`) a 320, 360, 390, 768, 1.024, 1.280 y 1.440: caja del mapa ± 1 px; cada rótulo, pin (punto y nombre, con su lado), marca de la gratícula y escala ± 1,5 px, **sin JS y con la interacción** | ✅ en los siete anchos | «posiciones frente a main…» (7) |
| 16 | basePath: sin JS, los pines llevan `/coffee-santander-shop/cafes/…/` y responden 200; con JS, la interacción llega de `/coffee-santander-shop/_next/static/chunks/`, el clic previo filtra, «Ver todo Santander» y `/?provincia=soto` funcionan; ninguna respuesta 4xx. `robots.txt` y `sitemap.xml` con `NEXT_PUBLIC_SITE_URL` | ✅ | «mapa bajo basePath» + `basepath.spec` y demás pruebas con `E2E_BASEPATH_URL` |
| 17 | Lighthouse móvil ≥ 90 / 95 / 95 | ✅ 92 / 100 / 100 (main: 92–94). Ver O-2 | Lighthouse (comandos) |

Capturas: `docs/qa/capturas/2026-11-19-mapa-head-{320,360,390,768,1024,1280,1440}.png` (con la interacción), `2026-11-19-mapa-main-{…}.png` (main) y `2026-11-19-mapa-sin-js-{320,360,1440}.png`. Las de HEAD y main son iguales a la vista en los siete anchos. **Aprobadas**, salvo el solape de QA-032, que ya estaba en main.

### Peso: QA-018 y presupuesto del HTML de /

| Medida (gzip -9) | main `a32e00d` | HEAD `7693b25` |
|---|---|---|
| JS inicial a 360 × 740 (guardia QA-018) | 153.214 B | **153.219 B** (margen 381 B) |
| JS inicial a 1.440 × 900, sin gesto | 176.692 B | **153.219 B** (margen 381 B) |
| HTML de / | ≈ 12,9 KB | **32.485 B** |
| Trozo de la interacción (llega con el gesto o al acercarse) | mapa completo 21.224 B | **12.584 B** |

- La guardia «QA-018 · JS inicial de inicio» (`qa-2026-11-18-ux-media.spec.ts`) ahora mide **360 y 1.440**. Las dos pasan. Así se resuelve la observación O-1: el escritorio ya cabe en el presupuesto.
- **Presupuesto del HTML de /: sí, lo fijo** en **40 KiB gzip -9** (40.960 B; hoy 32.485 B, margen ≈ 8,3 KB), con otro tope de **16 KiB** para el trozo de la interacción. Motivo: el mapa ahora viaja en el HTML para todos, también en celular, donde antes llegaba solo al desplazarse. Un GeoJSON sin simplificar, o más municipios dibujados, inflaría la primera descarga sin que ninguna guardia de JS lo notara. Prueba: `qa-2026-11-19-mapa-servidor` › «HTML de / ≤ 40 KiB gzip -9; trozo de la interacción ≤ 16 KiB gzip -9».

## Pruebas ajustadas (contradecían el cambio aprobado)

| Prueba | Antes | Ahora |
|---|---|---|
| `qa-2026-11-18-cierre-media.spec.ts:248` (ahora `:250`) | Esperaba `#mapa svg` = 0 antes de desplazar | Comprueba que el dibujo y la capa fija están en el HTML, que **el trozo de la interacción no se pide** al cargar a 360 y que se pide **una vez** al acercarse el mapa, y que la capa medida reemplaza a la fija |
| `qa-2026-11-18-ux-media.spec.ts:741` | `getByRole("link", { name: "Café Arreboles" })` sin `exact` encontraba también el pin («Ver la ficha de Café Arreboles, Tona») | `exact: true`. Lo que se prueba (la tarjeta del HTML enlaza a su ficha) no cambia |
| `qa-2026-11-18-ux-media.spec.ts` › «QA-018 · JS inicial de inicio» | Solo 360 × 740 | 360 × 740 y 1.440 × 900 |
| `vaciar-pedido-al-enviar.spec.ts:262` | `toBeInViewport()` | `toBeInViewport({ ratio: 1 })` |

## 3. El vaciado del pedido con el mapa nuevo

`qa-2026-11-19-vaciar-pedido.spec.ts` (27 pruebas, con la de basePath) y `vaciar-pedido-al-enviar.spec.ts` (11) pasan contra `7693b25` y con `--repeat-each=3`. Lo mismo `autorizacion-datos`, `flujo-tres-pasos`, `pedido`, `qa-2026-11-14-paquete-abogado`, `qa-2026-11-18-flujo-tres-pasos` y `qa-2026-11-18-verificacion-qa-022-024` en la suite completa. ✅

## Defectos

| ID | Severidad | Área | Título | Responsable | Estado |
|---|---|---|---|---|---|
| QA-030 | Baja | Checkout / diseño | A 360 × 740, «Copiar mensaje» no queda entero en la primera pantalla de «Mensaje listo» | desarrollador-fullstack | **Cerrado** (`d3fac81`) |
| QA-031 | Media | Mapa / accesibilidad | Con ratón a menos de 768 px, la hoja de la provincia se reabre y se cierra sola cada ≈ 200 ms tras Escape | desarrollador-fullstack | **Reabierto** (2026-11-19, ver `2026-11-19-verificacion-qa-031-032.md`) |
| QA-032 | Baja | Mapa / marca | A 320 y 360 px, los rótulos de Comunera y Vélez (y sus «Próximamente») se pisan | desarrollador-fullstack (con disenador-marca) | **Cerrado** (`5d2b5a6`, verificado el 2026-11-19) |

### QA-031 — Con ratón a menos de 768 px, la hoja de la provincia se reabre y se cierra sola cada ≈ 200 ms tras Escape

- **Severidad:** Media. Es una regresión de `7693b25`: main no lo hace (5 de 5). Solo ocurre con puntero de ratón en anchos menores de 768 px, como una ventana de escritorio angosta o una tableta con ratón. Pero el bucle no termina mientras el puntero no se mueva: un diálogo aparece y desaparece unas 5 veces por segundo sobre media pantalla, y un lector de pantalla lo anuncia cada vez. Además, Escape es el mecanismo de cierre del teclado.
- **Entorno:** Chromium (Playwright), 360 × 740, puntero de ratón, rama `feat/carrito-y-mapa`, commit `7693b25`, `out/` en el 4490.
- **Pasos para reproducir:** 1. Abrir `/` a 360 × 740 con ratón y desplazarse hasta el mapa. 2. Dejar el puntero sobre Guanentá, en un punto **por debajo de y ≈ 378** (donde aparecerá la hoja). 3. Se abre la hoja «Provincia de Guanentá» bajo el puntero. 4. Pulsar Escape sin mover el ratón.
- **Resultado esperado:** la hoja se cierra y no vuelve a abrirse hasta un nuevo gesto (así ocurre en main `a32e00d`).
- **Resultado obtenido:** la hoja se cierra y se vuelve a abrir enseguida. Desde ahí entra en un bucle: `pointerenter` en la provincia abre la hoja, la hoja tapa el puntero, llega `pointerleave` y `cerrarPronto` la cierra a los 180 ms; vuelve a llegar `pointerenter`, y así sigue. Registro: `pointerenter 914 | dlg=1 916 | pointerleave 932 | dlg=0 1113 | pointerenter 1115 | dlg=1 1117 | pointerleave 1132 | dlg=0 1312 | …`. En main, tras Escape llega el mismo `pointerenter` nativo, pero la hoja no se abre: main usaba `onPointerEnter` de React en el `<g>`, y `7693b25` pone `addEventListener("pointerenter")` nativo sobre el SVG del servidor (`interaccion-mapa.tsx`). Antes de Escape no hay bucle, porque el `alEntrar` de la hoja cancela el temporizador. Con el botón «Cerrar» no se reprodujo.
- **Evidencia:** `e2e/qa-2026-11-19-mapa-servidor.spec.ts` › «QA-031: a 360 px con ratón, Escape cierra la hoja aunque el puntero quede donde estaba la hoja (sin reabrir)» falla en HEAD: 12 muestras de diálogos abiertos cada 100 ms tras Escape, `[1,1,…]` o la hoja nunca llega a ocultarse. Con `E2E_ESCAPE_URL=http://localhost:4491/` (main), la misma prueba pasa. Traza: `test-results/qa-2026-11-19-mapa-servido-f9ae3-estaba-la-hoja-sin-reabrir--chromium/trace.zip`. Captura: `docs/qa/capturas/2026-11-19-qa-031-hoja-escape-360.png`.
- **Responsable sugerido:** desarrollador-fullstack. Por ejemplo: no reabrir por `pointerenter` la provincia que se acaba de cerrar con Escape hasta que llegue un `pointermove` real, o ignorar `pointerenter`/`pointerleave` mientras la hoja (`comoHoja`) está abierta o se acaba de cerrar.
- **Estado:** **Reabierto** el 2026-11-19 (`docs/qa/2026-11-19-verificacion-qa-031-032.md`): tras Escape ya no se reabre, pero con la hoja bajo el puntero quieto se quita y se vuelve a poner cada ≈ 200 ms sin pulsar nada, y «Cerrar» no se alcanza con el ratón. Antes: Corregido — pendiente verificación. Commit `4429277`. Causa raíz: tras Escape, el `pointerenter` nativo que el navegador manda a la provincia bajo el puntero quieto (por el cambio de diseño, sin movimiento) reabría la hoja; ahora la isla anota dónde estaba el puntero al cerrar e ignora `pointerenter` mientras no se mueva de ahí.

### QA-032 — A 320 y 360 px, los rótulos de Comunera y Vélez (y sus «Próximamente») se pisan

- **Severidad:** Baja. Ya estaba en main `a32e00d` con las mismas medidas, así que no es regresión. Afecta el ancho de celular más común (360). Los rótulos son `aria-hidden`; la información de cada provincia también está en los chips y en `/provincias/`.
- **Entorno:** Chromium (Playwright), 320 × 900 y 360 × 900, sin JS y con la interacción, commit `7693b25` (igual en `a32e00d`).
- **Pasos para reproducir:** 1. Abrir `/` a 360 px. 2. Ir al mapa. 3. Mirar la esquina inferior izquierda.
- **Resultado esperado:** ninguna línea de texto del mapa pisa a otra (es el criterio de `colocarRotulos`, que ya oculta los rótulos que chocan con un pin).
- **Resultado obtenido:** a 360 px, «Próximamente» de Comunera × «Próximamente» de Vélez (19 × 12 px): se lee «Próximamentéximamente». A 320 px: «COMUNERA» × «VÉLEZ» (8 × 12 px), «COMUNERA» × «Próximamente» de Vélez (28 × 2 px) y los dos «Próximamente» (29 × 11 px). Desde 390 px no hay solapes.
- **Evidencia:** `e2e/qa-2026-11-19-mapa-servidor.spec.ts` › «QA-032: rótulos del mapa sin solaparse › a 320 px…» y «… a 360 px…» fallan con esa lista. Las de 390 a 1.440 pasan. Capturas: `docs/qa/capturas/2026-11-19-qa-032-rotulos-{320,360}.png`; misma imagen en main: `2026-11-19-mapa-main-360.png`.
- **Responsable sugerido:** desarrollador-fullstack (`src/domain/mapa/etiquetas.ts`: que `colocarRotulos` resuelva también los choques rótulo-rótulo, moviendo uno u ocultando el «Próximamente» del que choca). Si la solución cambia qué se muestra, que lo decida disenador-marca.
- **Estado:** **Cerrado** el 2026-11-19 (`docs/qa/2026-11-19-verificacion-qa-031-032.md`). Commit `5d2b5a6`. Causa raíz: `colocarRotulos` reservaba solo el ancho estimado del nombre, y «Próximamente» (≈ 85 px) es más ancho que «VÉLEZ»: el cálculo no veía el choque. Ahora cada rótulo reserva su caja pintada; la escala gráfica y las marcas de la gratícula también ocupan sitio, y si ningún sitio en vertical sirve el rótulo se corre ±20/±40 px a un lado antes de ocultarse. Cambia a la vista (contenedor = ancho de ventana − 40 px): a 320 px Vélez se corre 40 px a la izquierda y aparece Guanentá (antes oculto); a 360 px Vélez sube 40 px; a 390 px Vélez baja 20 px; entre 442 y 482 px de ventana Guanentá baja 40 px (rozaba «COMUNERA»). Desde 483 px, igual que antes. Para revisión de disenador-marca.

## Observaciones (sin defecto)

1. **O-1. Nombre del pin al borde a 360 px.** El rótulo «Casa Martínez» rebasa unos 4 px el borde derecho de la caja del mapa (`overflow: hidden`), así que se corta un poco del relleno de su píldora; el texto se lee entero. Igual en main. Se puede atender junto con QA-032.
2. **O-2. Lighthouse móvil con poco margen.** Rendimiento 92 en HEAD frente a 92–94 en main. El HTML de / sube 19,6 KB gzip, FCP pasa de 0,8 a 0,9 s y el peso total de 437 a 459 KiB. Cumple el ≥ 90, pero cualquier peso nuevo en el inicio puede bajarlo de ahí. El presupuesto del HTML (40 KiB) queda como guardia.
3. **O-3. La tarjeta de Soto Norte sigue en el orden de foco tras salir de los pines** («Ver cafés de Soto Norte» aparece después del último pin). Igual en main. No se abre defecto.
4. **O-4. La prueba de QA-028 de `cierre-media` (`:390`) depende del main de entonces.** Exige que la única diferencia con main sea el `whitespace-nowrap` de `f310098`. Con `E2E_MAIN_URL` = `a32e00d`, que ya incluye `f310098`, falla sin que haya defecto. Hay que correrla con un build anterior a `f310098` o retirarla cuando se fusione la rama.
5. **O-5. Capturas que regenera la suite.** `ficha-tecnica-360.png` y `ppt-{320,360}.png` las regeneran `verificacion-paquete-legal-v1.spec.ts:409` y `select-documento.spec.ts:33`; esto corrige la observación 2 de `2026-11-19-vaciar-pedido.md`. Salieron con diferencias de píxeles y sin cambios visibles: se devolvieron a la versión del commit para no mezclarlas en esta ronda.

## Paridad v1

| Inventario | Función | Estado |
|---|---|---|
| Mapa de provincias | Mapa con provincias elegibles, pines y nombres | ✅ igual que en main y ahora visible sin JS. ⚠️ QA-031 (Escape con ratón en celular) es nuevo |
| 29 | Panel «Tu pedido está listo en WhatsApp» | ⚠️ sin cambios frente a la ronda anterior; con QA-030 cerrado, «Copiar mensaje» queda en la primera pantalla a 360 |

## Cobertura

- Unitarias: 624 pruebas (12 más que en la ronda anterior, de `src/domain/mapa/capa.test.ts`). Cobertura del dominio: 99,69 % sentencias, 96,46 % ramas, 99,86 % líneas.
- E2E nuevas: `e2e/qa-2026-11-19-mapa-servidor.spec.ts` (44): sin JS (4) y axe (2); interacción con JS (14, de ellas 5 antes de que llegue la interacción); QA-031 (1, falla a propósito); estabilidad: CLS, caja y área táctil (6); orden de foco (1); posiciones frente a main (7, con `E2E_MAIN_URL`); QA-032 (7, dos fallan a propósito); peso (1); basePath (1, con `E2E_BASEPATH_URL`). En `qa-2026-11-19-vaciar-pedido.spec.ts`, 6 pruebas de verificación de QA-030. La guardia QA-018 pasa de 1 a 2 anchos.
- Lo que no se automatizó: lectores de pantalla reales; Safari y Firefox (el proyecto solo define Chromium); Lighthouse se ejecutó a mano y no está en la suite.

## Entrega para desarrollador-fullstack

Reporte: `docs/qa/2026-11-19-mapa-servidor-y-qa-030.md`.

1. **QA-031 (Media, Abierto). Conviene corregirlo antes de publicar: es una regresión de esta rama.** Con ratón a 360 px, si la hoja de la provincia aparece bajo el puntero, Escape la cierra y entra en un bucle de abrir y cerrar cada ≈ 200 ms. La causa está en los `pointerenter`/`pointerleave` nativos de `interaccion-mapa.tsx`; main usaba `onPointerEnter` de React y no lo hacía. Prueba que debe pasar: `e2e/qa-2026-11-19-mapa-servidor.spec.ts` › «QA-031: a 360 px con ratón, Escape cierra la hoja aunque el puntero quede donde estaba la hoja (sin reabrir)». También debe seguir pasando «a 360 px: tarjeta con ratón y con teclado; Escape la cierra».
2. **QA-032 (Baja, Abierto, preexistente).** Los rótulos Comunera y Vélez se pisan a 320 y 360 px (`colocarRotulos` no resuelve los choques entre rótulos). Pruebas que deben pasar: `e2e/qa-2026-11-19-mapa-servidor.spec.ts` › «QA-032: rótulos del mapa sin solaparse» (siete anchos). Si se mueve un rótulo, «posiciones frente a main» dejará de coincidir en ese ancho a propósito; QA ajustará esa comparación con la corrección.

QA-030 queda **Cerrado**. No hay defectos Bloqueantes ni Altos abiertos.
