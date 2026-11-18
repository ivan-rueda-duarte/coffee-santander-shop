# Ronda QA — Auditoría UX, severidad media (M1, M2, M3, M5, M6, M7, M10, QA-018, leyenda, píldoras agotadas) — 2026-11-18

Rama `feat/ux-auditoria`, HEAD `bbd2923`. Chromium (Playwright 1.64), Linux. Firefox y WebKit no están disponibles en el entorno.
Especificación: `docs/diseno/2026-11-18-ux-auditoria-media.md` («Entrega para qa-pruebas»). Commits verificados: `c738edf` (M5), `f7ce7cb` (M6), `abe255a` (M10), `9925886` (M7), `5bbf1f8` (QA-018), `ec4b442` (M1), `1e579b9` (M2), `19fe7bc` (M3), `8072c37` (leyenda de promociones) y `bbd2923` (píldoras agotadas). M4 y M8 los trabaja otro desarrollador y no se verifican en esta ronda.

Servidores: `out/` del repositorio en 4190 (`E2E_PUERTO=4190`); el `serve` del dueño en 3000 no se tocó. Base de comparación: `d379cb0` (antes de los commits de esta ronda), construida aparte en el scratchpad y servida en 4191. Copia con CSV de agotados en 4192 y build con basePath en 4193 (los dos fuera del repositorio).

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm run lint` | pasa (0 errores), también con la prueba nueva |
| `npm run typecheck` | pasa |
| `npx vitest run --coverage --coverage.include='src/domain/**'` | pasa: 39 archivos, 599 pruebas. `src/domain/`: 99,66 % sentencias, 96,72 % ramas, 99,84 % líneas |
| `NEXT_PUBLIC_SITE_URL=https://ejemplo.test npm run build` | pasa (4 avisos conocidos de `npm run datos`) |
| `GITHUB_PAGES=true NEXT_PUBLIC_SITE_URL=https://ejemplo.github.io/coffee-santander-shop npm run build` (copia de HEAD en el scratchpad) | pasa |
| `E2E_PUERTO=4190 npx playwright test` (suite completa) | **384 pasan, 11 fallan, 28 omitidas**. Las 11 que fallan son pruebas de esta ronda que demuestran QA-025, QA-026, QA-027 y QA-018. Ninguna prueba anterior falla |
| `E2E_BASEPATH_URL=http://localhost:4193 npx playwright test -g basePath` | 15 pasan, 0 fallan. La tira de M3 lleva el prefijo (`/coffee-santander-shop/#mapa`…) |
| `E2E_AGOTADO_URL=http://localhost:4192 npx playwright test e2e/qa-2026-11-18-ux-media.spec.ts -g agotad` | 2 pasan (360 y 1.280) |
| `grep -riE "gourmet\|premium\|exótic\|mágic\|el mejor\|Café de Santander" out/ --include=*.html` | 0 coincidencias |
| `grep -rEil "service_role\|SANITY_API_TOKEN\|sk[A-Za-z0-9]{20,}" out/` | 0 archivos |

Omitidas (28): basePath sin `E2E_BASEPATH_URL` (se corrieron aparte), fechas del envío gratis «terminada» o «apagada», comparaciones A2 contra otros commits y ficha agotada sin `E2E_AGOTADO_URL` (se corrió aparte). Nota: con mi copia de agotados (Casa Martínez agotado en 250 g), la prueba anterior `qa-2026-11-18-ux-a2-m9.spec.ts` «ficha agotada» falla en su última parte porque espera el **500 g** agotado. Es un supuesto de datos de esa prueba, no un defecto.

**Veredicto: APTO CON OBSERVACIONES.** No hay defectos Bloqueantes ni Altos. M2, M5, M6, M7, M10, la leyenda de promociones y las píldoras agotadas quedan verificados. M1 y M3 cumplen la tabla y los criterios de la especificación, salvo tres defectos Bajos nuevos (QA-025, QA-026 y QA-027). QA-018 sigue **Abierto (Media)** con un criterio de medida nuevo. Sigue abierto QA-017 (Baja) de rondas anteriores.

## Veredicto por hallazgo

| Hallazgo | Commit | Veredicto | Evidencia principal |
|---|---|---|---|
| M5 · `aria-labelledby` a ids existentes | `c738edf` | ✅ Cumple | 8 páginas sin referencias rotas en `aria-labelledby` ni `aria-describedby`. Portada, Mapa, Catálogo, Cómo pedir e Historia son `region` con el nombre de su titular, con JS y sin JS |
| M6 · un `h1` en `/cafes/` | `f7ce7cb` | ✅ Cumple | Un solo `h1` en las 8 páginas. `/cafes/`: `h1#titulo-catalogo`. Inicio: `h2#titulo-catalogo`. Mismo estilo calculado (familia, tamaño, interlineado, peso, color, margen) a 360 y a 1.280 px |
| M10 · aviso con acción pausable | `abe255a` | ✅ Cumple | Ver «M10» |
| M7 · el catálogo no salta al hidratar | `9925886` | ✅ Cumple | Ver «M7» |
| QA-018 · JS inicial | `5bbf1f8` | ❌ **Abierto, reformulado** | 166.076 B (162,2 KiB) descargados; ver «QA-018» |
| «Agregar» de las tarjetas tras `5bbf1f8` | `5bbf1f8` | ✅ Igual que antes | Ver «QA-018» |
| M1 · 44 px | `ec4b442` | ⚠️ Cumple la tabla salvo los chips | QA-025 (chips a 42 px) y QA-026 (controles que no estaban en la tabla) |
| M2 · espaciador de la barra | `1e579b9` | ✅ Cumple | Ver «M2» |
| M3 · tira de navegación | `19fe7bc` | ⚠️ Cumple salvo el foco en «Envíos» | QA-027 |
| Leyenda «Promociones (opcional)» | `8072c37` | ✅ Cumple | Mismo estilo calculado que la leyenda «Tamaño» de la ficha (mayúsculas, 800, 12 px, tracking, ink-muted). Contraste ≥ 4,5:1 en claro y oscuro, a 360 y 1.280 px. Las pruebas de QA-023 (B3) siguen pasando |
| Píldoras agotadas | `bbd2923` | ✅ Cumple (alcance del commit) | Ver «Píldoras agotadas» |
| axe a 360 y 1.280 px, claro y oscuro | — | ✅ | 16 combinaciones sin violaciones serias ni críticas: inicio con bolsas, `/cafes/`, ficha, provincia, `/envios/`, `/pedido/`, resumen y aviso pausado. Además, la ficha agotada en claro y oscuro |

## Medidas

### M1 (360 × 740, DPR 1)

Script en la prueba `M1 · objetivos táctiles`. Para cada control visible mide su caja más los `::before`/`::after` absolutos (área ampliada o enlace extendido). Los `<input>` ocultos se miden por su `<label>`. Se excluyen los enlaces en línea dentro de una frase, las provincias del mapa (la especificación las da por buenas), «Ir al contenido» y la tabla de `/envios/`, que rehace M8.

Escenarios: inicio con bolsas, inicio con el cajón, la hoja de filtros y la tarjeta de provincia abiertos, ficha, `/envios/`, `/pedido/` (envío) y resumen.

| Control | Medida | Criterio |
|---|---|---|
| `.ds-btn--sm` («Pedido», «Agregar», «Filtros», «Ver pedido», «Deshacer»…) | 44 px | ✅ |
| Selects «Ordenar» y de la línea del cajón | 44 px de alto, 16 px de letra en celular | ✅ (WebKit no está disponible: el zoom de iOS se verifica de forma indirecta por el tamaño de letra) |
| Migas | ≥ 44 × 44 con `::before` | ✅ |
| Pie: «Información legal» y WhatsApp | 44 px | ✅ |
| Pines del mapa | 26 visibles + 2 × 9 = 44. Los dos pines (Pinchote y Tona) no se solapan | ✅ |
| Tarjeta de café: enlace del nombre | 29 px visibles. El `::after` extendido cubre la tarjeta entera | ✅ |
| **Chips de filtro** | **42 px** (prueba de impacto con `elementFromPoint`) | ❌ QA-025 |
| Controles que no están en la tabla de la especificación | 15 a 42,5 px | ❌ QA-026 |
| Encabezado a 360 y 320 px, con 12 bolsas | 75 px → **U de QA-023 = 665**. Las pruebas M1/M2 de QA-023 (B3) se repitieron con la suite y pasan | ✅ |
| «Pedido» a 280 px (3 bolsas) | Ícono y número; borde derecho en 260 px; 44 px de alto; sin desborde en `/`, provincia, `/pedido/` y términos. Nombre accesible `Pedido 3 bolsas`, igual que en la base (la especificación lo escribe «Pedido, N bolsas»; el árbol no pone coma y el nombre empieza por el texto visible, como pide WCAG 2.5.3) | ✅ |
| Desborde a 320 px | 0 px en 9 rutas con 12 bolsas | ✅ |

**Observación de 280 px (el dev la anotó): la ficha desborda 2 px.** Es igual en la base `d379cb0`, así que no es regresión. La causa no es el bloque de compra. El `h1` del titular (`right` = 281,7 px) fija el ancho mínimo de la columna de la cuadrícula en 261,7 px, y la foto, el bloque de compra y el mapa toman ese ancho. Está por debajo del mínimo de 320 px (WCAG 1.4.10), así que no se reporta como defecto. Otro dato: a 280 px con 12 bolsas el encabezado mide 97 px (la marca pasa a dos líneas). En la base medía 97 px ya desde 320 px. Ahora mide 75 px desde 320 px.

### M2 (360 × 740)

| Punto | Resultado |
|---|---|
| Barra y espaciador | Los dos miden 71 px (diferencia ≤ 1 px) en `/`, `/cafes/`, ficha, provincia, `/envios/`, `/legal/terminos/` y `/legal/vendedor/` |
| Desplazada hasta el final | La línea del vendedor, el © con la leyenda de IVA y la franja terminan encima de la barra en las 7 rutas (captura `docs/qa/capturas/2026-11-18-m2-final-360.png`) |
| Sin bolsas, con el cajón abierto o en `/pedido/` | Sin espaciador. Vuelve al cerrar el cajón |
| Desde `md` (768 px) | Espaciador y barra ocultos. La franja es el borde de la página |

### M3

| Punto | Resultado |
|---|---|
| Una sola navegación «Principal» en el árbol | ✅ a 360, 767, 768 y 1.280 px, con los cinco destinos en orden |
| Tira no fija; se desliza | ✅ Desplazada hasta el final, «Envíos» sale entero del fundido de 24 px |
| `aria-current="page"` | ✅ solo «Envíos» en `/envios/`, en las dos navegaciones; nunca en los «#» |
| «Ir al contenido» salta la tira | ✅ |
| Sin tira en `/pedido/` | ✅ |
| Encabezado fijo sin cambio de alto | ✅ 75 px |
| Tab recorre los cinco enlaces y cada uno se ve | ❌ **«Envíos» queda cortado** (QA-027) |

### M7: caja sin JS (respaldo de Suspense) contra caja hidratada

Contador, todas las tarjetas, sección del catálogo y sección siguiente, en `/` y `/cafes/`:

| Ancho | HEAD `bbd2923` | Base `d379cb0` (1.ª tarjeta) |
|---|---|---|
| 360 | 0 px en todo | dy = 328, alto de sección 2.060 → 2.410 |
| 768 | 0 px en todo | dy = 230 |
| 1.024 | 0 px en todo | dx = 312, dy = 90 |
| 1.440 | 0 px en todo | dx = 312, dy = 90, alto de la tarjeta −109 |

Coincide con la medida del desarrollador y la amplía a 768 y 1.024 px. Con un filtro en la URL (`/?provincia=guanenta`), el HTML estático muestra todos los cafés y el catálogo cambia al hidratar. Es inevitable en un sitio estático y no es defecto.

### M10

Avisos con acción en el sitio: «Agregaste…» con «Ver pedido» (desde las tarjetas, fuera de diálogos) y «… quitado del pedido» / «Vaciaste el pedido» con «Deshacer» (desde el cajón). `/pedido/` no tiene «Quitar»: sus líneas no son editables.

| Caso | Resultado |
|---|---|
| Sin cursor ni foco | Visible a los 4,5 s; se cierra antes de 8 s (6 s) |
| Cursor encima 9 s, entrando a los 3 s | No se cierra. Al salir sigue 1,2 s después y se cierra con el tiempo restante (< 4,5 s), no con 6 s nuevos |
| Foco en «Ver pedido» 8 s | No se cierra. Con Shift+Tab fuera se reanuda y se cierra |
| Cursor y foco a la vez; sale solo el cursor | Sigue pausado (8 s) |
| Con el cajón abierto: cursor sobre «Deshacer» 8 s y clic | Sigue visible. El clic devuelve la línea sin cerrar el cajón |
| axe con el aviso pausado, 360 y 1.280 px, claro y oscuro | Sin violaciones serias ni críticas |

### Píldoras agotadas (copia con `agotados`: Arreboles `250|500`, Casa Martínez `250`)

| Punto | Resultado |
|---|---|
| Todo agotado (Arreboles) | Ninguna píldora marcada. Las dos punteadas y deshabilitadas |
| Agotado parcial con el primer tamaño agotado (Casa Martínez) | Marcada la primera disponible (500 g), no la primera de la lista |
| Opacidad | 1 en `<label>`, `<span>` y `<small>`. Borde `dashed` |
| Contraste de «Agotado» | 7,09:1 en claro (`#5f554c` sobre `#fffcf6`) y 6,55:1 en oscuro, a 360 y 1.280 px |
| axe | Sin violaciones serias ni críticas, en claro y oscuro |
| Precio, cantidad e IVA con todo agotado | Siguen visibles (`$23.000`, «1 × 250 g · grano»). Esperado por ahora: espera [CONSULTAR-LEGAL] 2. Captura `docs/qa/capturas/2026-11-18-agotado-cafe-arreboles-360.png` |

### QA-018: criterio de medida y resultado

**Criterio que fija QA a partir de esta ronda.** «JS inicial de inicio» es el JavaScript que un navegador actual **descarga** al cargar `/` hasta `networkidle`, sin interacción:

- incluye los trozos dinámicos que se piden solos al cargar;
- excluye los `<script noModule>`: Chromium no los pide, y la prueba lo comprueba;
- se mide como suma de gzip -9 por archivo;
- el presupuesto es **150 KiB = 153.600 B**, la misma convención que se usó al abrir QA-018 (193.376 B ≈ 189 KB).

Medido a 360 y 1.440 px, que dan el mismo resultado:

| Medida | Base `d379cb0` | HEAD `bbd2923` |
|---|---|---|
| Etiquetas `<script src>` de `out/index.html`, con noModule | 193.877 B | 192.555 B |
| Etiquetas `<script src>`, sin noModule | 154.504 B (150,9 KiB) | 153.182 B (**149,6 KiB**) |
| **Descargado por Chromium hasta `networkidle`** (criterio) | 165.029 B (161,2 KiB) | **166.076 B (162,2 KiB)** |
| El polyfill noModule (`0cz1d0mv5g_q7.js`, 39.373 B) se descarga | no | no |

Con el criterio de las etiquetas sin noModule, el commit pasaría por 418 B. Pero ese criterio deja fuera dos trozos que el navegador pide al cargar sin ninguna interacción:

- `2ywl8g31igo30.js`, 10.525 B: el `Slider` de Radix de `filtro-rango.tsx`. El panel de filtros del `<aside hidden lg:block>` se renderiza en todos los anchos, y también se descarga a 360 px.
- `44ldnilu48tl7.js`, 2.369 B: `BotonAgregar`, la nueva isla cliente de la tarjeta. Es nuevo en `5bbf1f8`.

En descarga real, `5bbf1f8` no reduce el JS de inicio: pasa de 165.029 a 166.076 B (+1.047 B), porque el código se movió a un trozo aparte. En `/cafes/` sí baja algo: de 173.568–176.130 a 172.607 B. **QA-018 sigue Abierto (Media)**: faltan 12.476 B. El trozo del deslizador (10,5 KB) es el candidato más claro. La prueba de cierre ya está automatizada.

**«Agregar» de las tarjetas funciona igual.** El `aria-label` es idéntico al de la base («Agregar Café Arreboles, 250 g, al pedido»). En `/`, `/cafes/` y `/provincias/soto/`, «Agregar» agrega 250 g en grano, muestra «Agregaste Café Arreboles: 250 g, grano.», el contador del encabezado sube a 1 y a 2, y la segunda pulsación se fusiona en una línea con `cantidad: 2`. No navega a la ficha. Sin JavaScript, el HTML trae las dos tarjetas con nombre, enlace, precio y botón.

## Defectos

| ID | Severidad | Área | Título | Responsable | Estado |
|---|---|---|---|---|---|
| QA-018 | Media | Rendimiento | JS inicial de inicio por encima del presupuesto (reformulado: 166.076 B descargados > 153.600 B) | desarrollador-fullstack | **Abierto** |
| QA-025 | Baja | Accesibilidad / M1 | Los chips de filtro tienen 42 px de área táctil, no 44 | desarrollador-fullstack | Abierto |
| QA-026 | Baja | Accesibilidad / M1 | Controles fuera de la tabla de M1 por debajo de 44 px a 360 | disenador-marca → desarrollador-fullstack | Abierto |
| QA-027 | Baja | Accesibilidad / M3 | Al enfocar «Envíos» con Tab, la tira no se desplaza y el enlace queda cortado | desarrollador-fullstack | Abierto |
| QA-017 | Baja | (ronda 2026-11-14) | sin cambios en esta ronda | desarrollador-fullstack | Abierto |

### QA-018 — JS inicial de inicio por encima del presupuesto (reformulado)
- Severidad: Media (criterio de terminado de rendimiento; no bloquea por sí solo).
- Entorno: Chromium, 360 × 740 y 1.440 × 900, `feat/ux-auditoria` `bbd2923`, `out/` servido con `npx serve`.
- Pasos: 1. `npm run build`. 2. Abrir `/` y esperar `networkidle`. 3. Sumar el gzip -9 de cada script descargado.
- Esperado: ≤ 153.600 B (150 KiB), sin contar los `noModule`.
- Obtenido: 166.076 B (162,2 KiB). Trozos: 71.572 y 45.546 (framework), 10.674, **10.525 (Slider de Radix)**, 8.654, 7.259, 3.909, 3.611, **2.369 (BotonAgregar)** y 1.957.
- Evidencia y prueba de cierre: `e2e/qa-2026-11-18-ux-media.spec.ts` › «QA-018 · JS inicial de inicio» (falla con «JS inicial 166076 B = 162.2 KiB»).
- Responsable sugerido: desarrollador-fullstack. Sugerencias: cargar `FiltroRango` (o el panel lateral) solo cuando se ve, desde `lg` o al abrir la hoja; revisar si la isla `BotonAgregar` puede ir en el trozo compartido.

### QA-025 — Los chips de filtro tienen 42 px de área táctil, no 44
- Severidad: Baja (cumple el mínimo AA de 24 px; incumple el criterio de 44 px de M1).
- Entorno: Chromium, 360 × 740, `bbd2923`. `controles-filtro.tsx` y `explorador.tsx:107` (filtros activos).
- Pasos: 1. Abrir `/` a 360 px. 2. Con `elementFromPoint`, recorrer en vertical el centro del chip «Guanentá 1».
- Esperado: 36 visibles + 4 + 4 = 44 px (M1 n.º 2).
- Obtenido: 42 px. El `::before` con `-inset-y-1` se coloca respecto al **borde interior** (padding box) del chip, y `.ds-tag--outline` tiene 1 px de borde: −4 + 1 = 3 px por lado. Pasa lo mismo en la hoja de filtros («Tona», «Pinchote», «Medio», «Oscuro», «Caramelo», «Chocolate»).
- Evidencia y prueba de cierre: `e2e/qa-2026-11-18-ux-media.spec.ts` › «QA-025: el área ampliada de un chip…» (recibe 42) y los escenarios M1 «inicio con bolsas», «hoja de filtros» y «tarjeta de provincia».
- Responsable sugerido: desarrollador-fullstack (p. ej. `before:-inset-y-[5px]`). Los pines y las migas no tienen borde y sí miden 44.

### QA-026 — Controles fuera de la tabla de M1 por debajo de 44 px a 360
- Severidad: Baja (ninguno baja de 24 px salvo los dos primeros, que están aislados y caben en la excepción de espaciado de WCAG 2.5.8; incumplen el criterio de M1, «ningún control con área menor de 44 × 44»).
- Entorno: Chromium, 360 × 740, `bbd2923`.
- Pasos: correr los escenarios «M1 · objetivos táctiles» de la prueba.
- Esperado: ≥ 44 × 44, salvo los enlaces en línea dentro de una frase.
- Obtenido:

| Control | Dónde | Medida |
|---|---|---|
| «Cómo calculamos el envío» (`totales-pedido.tsx:124`, enlace solo en su párrafo) | cajón, `/pedido/` (envío) y resumen | 159 × 15 |
| «¿Qué significa cada dato?» (`<summary>`, `ficha-cafe.tsx:136`) | ficha | 288 × 20 |
| Pulgares de «Altitud» y «Precio desde» (`filtro-rango.tsx:51`; la raíz mide 24 px) | hoja de filtros | 20 × 20 |
| Índice «En este documento» (`documento-legal.tsx:83`, `inline-block py-1`) | `/envios/` y páginas legales | 30 de alto |
| «Cerrar» de la tarjeta de provincia (`h-11 w-11`, encogido por flex: falta `shrink-0`) | hoja de provincia | 42,5 × 44 |

- Evidencia y prueba de cierre: los escenarios M1 de `e2e/qa-2026-11-18-ux-media.spec.ts` («inicio con el cajón abierto», «hoja de filtros», «tarjeta de provincia», «ficha», «/envios/», «/pedido/ (envío)», «/pedido/ (resumen)»).
- Responsable sugerido: disenador-marca decide la forma (a o b de M1) de cada control; desarrollador-fullstack la aplica. El índice legal y el `<summary>` tocan páginas de documentos legales: es solo presentación, el texto no cambia.

### QA-027 — Al enfocar «Envíos» con Tab, la tira no se desplaza y el enlace queda cortado
- Severidad: Baja (el enlace se ve en parte, así que no incumple WCAG 2.4.11; incumple el criterio de M3 «cada uno se ve al enfocarlo y el contorno de foco no queda recortado»).
- Entorno: Chromium, 360 × 740, `bbd2923`, `encabezado.tsx` (tira `md:hidden`).
- Pasos: 1. Abrir `/` a 360 px. 2. Enfocar «Pedido» y pulsar Tab cinco veces.
- Esperado: al enfocar «Envíos», la tira se desplaza hasta que el enlace y su contorno quedan enteros fuera del fundido.
- Obtenido: `scrollLeft` sigue en 0 (el máximo es 58). «Envíos» ocupa de 323 a 394 px en una tira de 360. Se ven 37 de sus 71 px, bajo el fundido de 24 px. El lado derecho del contorno queda fuera de la pantalla. Chromium no desplaza al enfocar un elemento que ya se ve en parte. Los otros cuatro enlaces se ven enteros.
- Evidencia: captura `docs/qa/capturas/2026-11-18-m3-tira-foco-envios-360.png`. Prueba de cierre: `e2e/qa-2026-11-18-ux-media.spec.ts` › «QA-027: a 360 px Tab recorre los cinco enlaces…».
- Responsable sugerido: desarrollador-fullstack (p. ej. `onFocus` con `scrollIntoView({ inline: "nearest", block: "nearest" })` y `scroll-padding-inline` de 24 px en la lista, para que el enlace salga del fundido).

## Paridad v1

Sin cambios de paridad funcional en esta ronda. La navegación a Mapa, Cafés, Cómo pedir e Historia en celular vuelve a existir con la tira (la v1 tenía menú en celular). «Envíos» es nuevo.

## Cobertura

- Nueva: `e2e/qa-2026-11-18-ux-media.spec.ts`, con 63 pruebas:
  - M1: 8 escenarios de área táctil, impacto de chips, pines, selects, encabezado, 280 px y 320 px;
  - M2: 2;
  - M3: 5;
  - M5: 2;
  - M6: 2;
  - M7: 8;
  - M10: 5;
  - QA-018 y «Agregar»: 5;
  - leyenda: 2;
  - agotados: 2, con `E2E_AGOTADO_URL`;
  - axe: 16.
- Capturas nuevas: `docs/qa/capturas/2026-11-18-m2-final-360.png`, `2026-11-18-m3-tira-foco-envios-360.png`, `2026-11-18-agotado-cafe-{arreboles,casa-martinez}-360.png`.
- `src/domain/` no cambió en estos commits; la cobertura sigue en 99,84 % de líneas.
- Sin verificar: WebKit (zoom de iOS al enfocar un select) y Firefox, que no están en el entorno; Lighthouse.
