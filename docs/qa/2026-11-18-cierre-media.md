# Ronda QA — Cierre de la severidad media (M4, M8, ficha agotada; QA-018, QA-025, QA-026, QA-027) — 2026-11-18

Rama `feat/ux-auditoria`, HEAD `839c162`. Chromium (Playwright 1.64), Linux. Firefox y WebKit no están en el entorno.
Especificación: `docs/diseno/2026-11-18-ux-auditoria-media.md`. Dictamen: `docs/legal/revisiones/2026-11-18-ux-auditoria-media.md` (LEG-183 a LEG-187).
Commits verificados: `2643d92`, `1117886` (M4), `1a0eb04` (M8), `1ec9f29` (ficha agotada), `fc8b8f8` (pruebas del desarrollador), `50bb2ca` (QA-025), `25af37b` (QA-026), `a131ef3` (QA-027) y `ff08d1d` (QA-018).

Servidores: `out/` del repositorio en 4200. Copia con CSV de agotados en 4202 (Arreboles `250|500`, Casa Martínez `250`; fuera del repositorio). Build con `GITHUB_PAGES=true` en 4203. Build de `main` (`8162ccf`) en 4204. El `serve` del dueño en 3000 no se tocó.

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm run lint` | pasa |
| `npm run typecheck` | pasa |
| `npx vitest run --coverage --coverage.include='src/domain/**'` | pasa: 39 archivos, 601 pruebas. `src/domain/`: 99,66 % sentencias, 96,72 % ramas, 99,84 % líneas |
| `NEXT_PUBLIC_SITE_URL=https://ejemplo.test npm run build` | pasa |
| `GITHUB_PAGES=true NEXT_PUBLIC_SITE_URL=https://ejemplo.github.io/coffee-santander-shop npm run build` (copia de HEAD) | pasa |
| `E2E_PUERTO=4200 npx playwright test` (suite completa, con la prueba nueva) | **435 pasan, 3 fallan, 32 omitidas**. Las 3 que fallan son la prueba de QA-028 (defecto nuevo, anterior a esta rama) |
| `E2E_BASEPATH_URL=http://localhost:4203 npx playwright test -g basePath` | 15 pasan |
| `E2E_AGOTADO_URL=http://localhost:4202 npx playwright test -g agotad` | 6 pasan, 1 falla: la prueba anterior `qa-2026-11-18-ux-a2-m9.spec.ts` «ficha agotada», solo en su última parte. Espera el **500 g** agotado y la copia tiene el 250 g. Es un supuesto de datos de esa prueba, igual que en la ronda anterior. No es un defecto |
| `E2E_MAIN_URL=http://localhost:4204 … -g "igual que en main"` | pasa |
| `grep -riE "gourmet\|premium\|exótic\|mágic\|el mejor\|Café de Santander" out/ --include=*.html` | 0 archivos |
| `grep -rEil "service_role\|SANITY_API_TOKEN\|sk[A-Za-z0-9]{20,}" out/` | 0 archivos |

Pruebas omitidas (32): las de basePath, agotados y `main` (se corrieron aparte), las de fechas del envío gratis «terminada» o «apagada» y las comparaciones A2.

**Veredicto: APTO CON OBSERVACIONES.** M4, M8 y la ficha totalmente agotada cumplen la especificación y el dictamen. QA-018, QA-025, QA-026 y QA-027 quedan **Cerrados**. No hay defectos Bloqueantes ni Altos. Se abre **QA-028 (Media)**: la tabla de `/envios/` desde `lg` parte cada precio en tres renglones. Ya pasaba en `main`. Sigue abierto QA-017 (Baja).

## Veredicto por punto

| Punto | Veredicto | Evidencia |
|---|---|---|
| M4 · orden Portada → Mapa → Catálogo → Cómo pedir → Historia | ✅ | A 360, 768 y 1.280 px, también sin JS. La navegación (tira y escritorio) sigue el mismo orden. «Ver cafés» de la portada sigue yendo a `#catalogo` |
| M4 · titulares | ✅ | «Santander, *provincia a provincia*» y «Elige por *provincia*», con el remate en itálica 400. El antetítulo «Nuestros cafés» se mantiene (LEG-185) |
| M4 · texto del mapa | ✅ | `textContent` igual, letra por letra, a «Elige una provincia para ver sus cafés y filtrar el catálogo. Los puntos marcan el municipio de cada café.» (19 palabras) |
| M4 · «Ir a los cafés» | ✅ | `href="#catalogo"`, entre la bajada y la fuente. Al pulsarlo, el titular del catálogo queda bajo el encabezado fijo |
| M4 · nota de fuente (LEG-187) | ✅ | Visible a 360, 768 y 1.280 px, en la columna del texto, con DANE y la Ordenanza 009 de 2019. Contraste ≥ 4,5:1 |
| M4 · filete de Cómo pedir | ✅ | `border-top` de 1 px sólido. Catálogo y Cómo pedir tienen el mismo fondo; el mapa, otro |
| M4 · tacto / ratón / Enter | ✅ | Con el dedo (360 px), tocar Guanentá abre la tarjeta sin filtrar, y «Ver cafés de Guanentá» filtra. Con el ratón o con Enter (1.280 px) filtra al instante (`?provincia=guanenta`) |
| M4 · CLS del inicio | ✅ | **0** a 360 × 740 y a 1.440 × 900, al cargar y al recorrer la página hasta que el mapa entra. El hueco mide lo mismo que el mapa cargado (360: 380,6 px; 768: 761,2; 1.440: 692,8) |
| M8 · sin desplazamiento horizontal | ✅ | 0 px a 320, 360, 768 y 1.023 px, también con todos los desplegables abiertos |
| M8 · tarjetas en orden; «Cubre» letra por letra | ✅ | 8 tarjetas = 8 filas, misma clave y mismo orden. `textContent` de «Cubre» idéntico al primer nodo de la celda. Medio, nota de la promoción y precios idénticos a los de la fila |
| M8 · zonas 1 y 2 abiertas; 3 a 5 en desplegable | ✅ | Sin `<details>` en las zonas 1 y 2. En las 3, 4 y 5: «Qué cubre la zona {n}», cerrado al cargar, con solo «Cubre» dentro. Se abre y se cierra con Enter y con Espacio. El `summary` mide 44 px |
| M8 · precios, medio y promoción fuera del desplegable (LEG-183) | ✅ | Visibles sin abrir nada |
| M8 · tabla a 1.280 px igual que en `main` | ✅ con observación | Mismo `outerHTML` y misma caja, y la captura coincide (±1 nivel de suavizado). Pero la tabla de `main` ya parte los precios: **QA-028** |
| Ficha totalmente agotada (LEG-184 alternativa, LEG-186) | ✅ | Ver «Ficha agotada» |
| QA-025 | ✅ **Cerrado** | Ver «Verificación de defectos» |
| QA-026 | ✅ **Cerrado** | Ídem |
| QA-027 | ✅ **Cerrado** | Ídem |
| QA-018 | ✅ **Cerrado con el criterio de celular** | Ver «QA-018» |
| M7 (0 px al hidratar) | ✅ | Las 8 pruebas M7 (`/` y `/cafes/` a 360, 768, 1.024 y 1.440) pasan |
| «Agregar» de las tarjetas | ✅ | Las 4 pruebas pasan en `/`, `/cafes/` y `/provincias/soto/`. Agrega 250 g en grano, avisa y fusiona |
| Mapa diferido a 360 px | ✅ | No se descarga al cargar. Se carga al desplazarse hasta él y desde `/#mapa` sin desplazar a mano (la sección queda arriba) |
| Deslizador de la barra lateral desde `lg` | ✅ | A 1.280 px no se carga al inicio (0 deslizadores). Se carga al acercarse, sin salto (la barra mide 1.732,7 px antes y después), y ArrowRight filtra (`altitud=` en la URL). En la hoja (360 px) se carga al abrirla, con raíz de 44 px |
| Migas | ✅ | En `/envios/`, términos, privacidad y vendedor empiezan en «Inicio» (`/`). En la provincia y la ficha empiezan en «Cafés» (`/cafes/`). Todas tienen `aria-current` en la página actual y un área de 44 px, y el enlace navega |
| QA-023 (B3) | ✅ | Las pruebas de `qa-2026-11-18-verificacion-qa-022-024.spec.ts` pasan en la suite completa |
| axe a 360 y 1.280 px, claro y oscuro | ✅ | 16 combinaciones de `qa-2026-11-18-ux-media.spec.ts` sin violaciones serias ni críticas. La ficha agotada también, en claro y oscuro |

## Ficha agotada (copia 4202)

| Punto | Resultado |
|---|---|
| Ninguna píldora marcada | ✅ 250 y 500 deshabilitadas y sin marcar, con borde punteado y opacidad 1 |
| Precio y «Agotado» en cada píldora | ✅ `$23.000` / `$40.000`, con «Agotado» debajo |
| Leyenda de IVA | ✅ «Precio con IVA del 5 % incluido.», bajo las píldoras |
| Sin cantidad ni total | ✅ Sin grupo «Cantidad de bolsas», sin «1 × … g», sin total, sin «Hasta 20 bolsas…», sin plazo y sin «Agregar al pedido». Botón «Agotado» deshabilitado |
| Presentación como dato | ✅ «Grano · Molido» sin radios, y la ayuda de molienda sigue |
| Texto de LEG-186 | ✅ «Este café está agotado por ahora. Escríbenos por WhatsApp y te avisamos cuando vuelva.» |
| `wa.me` sin datos personales | ✅ `href` exacto `https://wa.me/573001129874`, `target=_blank` y `rel=noopener`, también con un carrito en el navegador. Ningún `wa.me` de la página lleva texto |
| Contraste | ✅ ≥ 4,5:1 para el precio, «Agotado», la leyenda y el aviso, en claro y oscuro, a 360 y 1.280 px |
| axe | ✅ sin violaciones serias ni críticas, en claro y oscuro |
| Coherencia (LEG-184) | ✅ El JSON-LD lleva `OutOfStock` y no `InStock`. La tarjeta del catálogo conserva «$23.000 desde» y la pastilla «Agotado», sin botón «Agregar» |
| Agotado parcial (Casa Martínez sin 250 g) | ✅ Marcado el 500 g. La píldora agotada solo dice «Agotado». Cantidad, total, plazo y «Agregar al pedido» siguen, y agregar guarda 500 g |

Captura: `docs/qa/capturas/2026-11-18-agotado-total-arreboles-360.png`. Observación visual (no defecto): el texto de las píldoras se ve centrado, aunque el `span` tiene `items-start`. Es igual con agotado parcial. Se deja a criterio de `disenador-marca`.

## Revisión de las pruebas del desarrollador

- `e2e/verificacion-paquete-legal-v1.spec.ts:346`: el cambio es correcto. Por debajo de `lg` la tabla no se muestra (`display:none`), así que el rótulo «Zona n» que ve el cliente es el `h4` de la tarjeta. Se sigue exigiendo un renglón y sin desborde; `nowrap` solo se exige a la tabla. No oculta defectos. Nota: esa prueba solo mide la columna Zona, por eso no detectó QA-028.
- `e2e/ux-media-m4-m8.spec.ts`: es válida, con dos limitaciones. (1) Compara «Cubre» con `toHaveText`, que normaliza los espacios: no es letra por letra (mi prueba compara `textContent` exacto). (2) Solo mide 360, 768 y 1.280 px; no mide 320 ni 1.023, ni los desplegables abiertos. Las dos quedan cubiertas en `qa-2026-11-18-cierre-media.spec.ts`. El comentario «la ficha totalmente agotada se prueba en … bloque-compra.test.tsx» queda superado: ahora hay prueba e2e con el CSV temporal.

## Verificación de defectos

### QA-025 — Cerrado
- `50bb2ca`: el chip ahora mide 44 px en la prueba de impacto (`elementFromPoint`). Pasan los escenarios M1 «inicio con bolsas», «hoja de filtros» y «tarjeta de provincia».

### QA-026 — Cerrado
- **Decisión sobre la nota (a) del desarrollador:** la prueba se ajusta, no se abre defecto. La especificación de QA-026 (n.º 3 y «Entrega para qa-pruebas»: «en los deslizadores se mide la **raíz** (44 de alto), no el pulgar») fija que el área táctil es la raíz del Slider de Radix, que recibe el toque y mueve el pulgar más cercano. La función `medirTactil` de `qa-2026-11-18-ux-media.spec.ts` ahora mide, en cada `role=slider`, el ancestro con `touch-action: none` (la raíz). Raíz medida: 44 px.
- Los 8 escenarios M1 pasan.
- Comprobado aparte:
  - el `<summary>` de la ficha conserva `display: list-item` (triángulo nativo), y su área de 44 px no pisa otro control;
  - «Cómo calculamos el envío» en el cajón: área de 45 px, sin choques con «Continuar con el envío»;
  - «Cómo consulto de qué comuna soy»: 46 px, `list-item`, debajo del select;
  - «Ver el mensaje»: 44 px, `list-item`;
  - índice de `/envios/` y términos: cada título ≥ 44 px y sin solaparse;
  - «Cerrar» de la tarjeta de provincia: 44 × 44 a 360 y 320 px, con el titular partido en renglones sin desborde.
- Nota: García Rovira no tiene cafés y su provincia está inactiva («Próximamente»), así que no abre tarjeta. La prueba abre la de Guanentá y le pone el nombre «García Rovira».
- Firefox no está en el entorno: el triángulo se verificó solo en Chromium.

### QA-027 — Cerrado
- `a131ef3`: la prueba «Tab recorre los cinco enlaces…» pasa. «Envíos» y su contorno quedan dentro de la tira. Captura `docs/qa/capturas/2026-11-18-m3-tira-foco-envios-360.png`.

### QA-018 — Cerrado con el criterio de celular
**Medida** (gzip -9 de lo que Chromium descarga hasta `networkidle`, sin noModule; 3 repeticiones por ancho, siempre el mismo resultado):

| Viewport | JS inicial | ¿Mapa en la carga? |
|---|---|---|
| 360 × 740, 375 × 667, 390 × 844, **412 × 823 (perfil de Lighthouse móvil)**, 412 × 915 | **153.214 B** (≤ 153.600; margen 386 B) | no |
| 768 × 1024, 1024 × 768, 1280 × 800 | 174.438 B | sí (21.224 B) |
| 1440 × 900 | 176.692 B | sí, más el trozo del deslizador lateral (2.254 B) |

**Decisión sobre la nota (c):** el criterio de QA-018 se fija en el **perfil de celular** (anchos por debajo de `md`, incluido el de Lighthouse móvil, 412 × 823). La razón: el presupuesto «JS inicial de inicio ≤ 150 KB gzip» es parte de la sección de rendimiento cuyo instrumento es Lighthouse móvil, y PRODUCT.md pone el celular primero. En escritorio el mapa está en la primera pantalla desde M4, por decisión del dueño: es contenido visible, no JS ocioso. Bajarlo exigiría renderizar el mapa en el servidor, un cambio de arquitectura que decide el dueño. Con ese criterio, QA-018 queda **Cerrado**.

Queda la **observación O-1** (no es defecto): en escritorio el JS inicial es de 174–177 KB. La prueba de cierre sigue midiendo 360 px.

Riesgo: el margen es de 386 B. Cualquier código nuevo en el inicio puede reabrir QA-018. La prueba (`qa-2026-11-18-ux-media.spec.ts` › «QA-018 · JS inicial de inicio») queda en la suite como guardia.

## Defectos

| ID | Severidad | Área | Título | Responsable | Estado |
|---|---|---|---|---|---|
| QA-028 | Media | `/envios/` (D3) | Desde `lg`, la tabla de tarifas parte cada precio en tres renglones y «Hasta n kg» en cuatro | desarrollador-fullstack | Corregido — pendiente verificación (`whitespace-nowrap` en los `<th>` de escalón y los `<td>` de precio de `src/app/envios/page.tsx`; causa: `[overflow-wrap:anywhere]` heredado de `documento-legal.tsx:88`) |
| QA-018 | Media | Rendimiento | JS inicial de inicio | desarrollador-fullstack | Cerrado (criterio de celular; O-1 para el dueño) |
| QA-025 | Baja | Accesibilidad / M1 | Chips de 42 px | desarrollador-fullstack | Cerrado |
| QA-026 | Baja | Accesibilidad / M1 | Controles fuera de la tabla de M1 | disenador-marca → desarrollador-fullstack | Cerrado |
| QA-027 | Baja | Accesibilidad / M3 | «Envíos» cortado al enfocarlo | desarrollador-fullstack | Cerrado |
| QA-017 | Baja | (ronda 2026-11-14) | sin cambios | desarrollador-fullstack | Abierto |

### QA-028 — Desde `lg`, la tabla de tarifas parte cada precio en tres renglones y «Hasta n kg» en cuatro
- **Severidad:** Media. Todos los precios están, pero la tabla de D3, que es la que publica las tarifas, se lee «$8. / 80 / 0» en escritorio: la información de precio no es clara (art. 23 Ley 1480; lo valora legal si hace falta). No es regresión: `main` (`8162ccf`) es igual. M8 la dejó como la única vista desde 1.024 px.
- **Entorno:** Chromium, 1.024 × 800, 1.280 × 900, 1.440 × 900 y 1.920 × 900. `feat/ux-auditoria` `839c162` y `main` `8162ccf`.
- **Pasos para reproducir:**
  1. Abrir `/envios/` a 1.280 px.
  2. Ir a «Tarifas por zona y municipios de cada zona».
- **Esperado:** cada precio («$8.800») y cada rótulo («Hasta 1 kg») en un renglón.
- **Obtenido:** las columnas de precio miden 56–57 px y la de «Cubre» 474 px. Los 24 precios ocupan 3 renglones y los 3 rótulos, 4. Es igual a cualquier ancho desde `lg`: la tabla mide siempre 726 px (`max-w-3xl`).
- **Causa probable:** la tabla está dentro de la columna del documento legal, que tiene `[overflow-wrap:anywhere]` (`documento-legal.tsx:88`, QA-007). Las celdas lo heredan (computado: `overflow-wrap: anywhere`). En una tabla de diseño automático, el ancho mínimo de cada celda baja así a un carácter, y la columna «Cubre» se lleva el espacio.
- **Corrección sugerida:**
  - opción 1: `whitespace-nowrap` en los `<th>` de escalón y en los `<td>` de precio;
  - opción 2: `[overflow-wrap:normal]` en la `<table>` (sin tocar la regla de QA-007 en el resto del documento).
  - La celda «Por cotizar…» (`colSpan=3`) puede seguir partiendo renglones.
- **Evidencia:**
  - `docs/qa/capturas/2026-11-18-m8-tabla-1280-head.png` y `…-main.png` (HEAD y `main`, iguales);
  - prueba de cierre: `e2e/qa-2026-11-18-cierre-media.spec.ts` › «QA-028: a {1024, 1280, 1440} px cada precio y cada rótulo «Hasta n kg» de la tabla caben en un renglón» (falla con 27 celdas cortadas);
  - traza: `test-results/qa-2026-11-18-cierre-media-*-a-tabla-caben-en-un-renglón-chromium/trace.zip`.
- **Responsable sugerido:** desarrollador-fullstack. Es solo presentación, no cambia el texto de D3. Al corregir, la prueba «a 1.280 px la tabla se ve igual que en main» dejará de pasar a propósito: se actualiza o se retira en la verificación.

### Observación sin ID (no es defecto): toque cerca de un pin desde una provincia inactiva
A 360 px, al tocar García Rovira (inactiva) a unos 8 px por encima de la etiqueta «Pinchote» del pin, Chromium ajusta el toque al enlace más cercano (el área de 44 px del pin). La página navega a la ficha de Café Casa Martínez. Es el comportamiento esperado del área ampliada y del ajuste de toque del navegador, y en `main` es igual. Se anota por si diseño quiere revisar dónde cae la etiqueta del pin sobre las provincias vecinas.

## Paridad v1
Sin cambios funcionales de paridad. El mapa ahora va antes del catálogo (en la v1 iba después del catálogo: ⚠️ distinta, por decisión del dueño, M4). La tabla de tarifas en tarjetas es nueva (no existía en la v1).

## Cobertura
- Prueba nueva: `e2e/qa-2026-11-18-cierre-media.spec.ts`, con 42 pruebas:
  - M4: 14 (orden y textos a 3 anchos, sin JS, tacto, ratón, Enter, CLS a 2 anchos, hueco a 3 anchos, mapa diferido y `/#mapa`);
  - M8: 11 (4 anchos, teclado, 1.024, comparación con `main`, QA-028 ×3 y nota de la promoción);
  - ficha agotada: 3;
  - QA-026: 6;
  - QA-018: 8 (deslizador lateral, hoja y migas en 6 rutas).
- Pruebas actualizadas en `e2e/qa-2026-11-18-ux-media.spec.ts`: titulares de M4 en M5 y M6 (nota b del desarrollador), deslizadores medidos por la raíz (nota a) y píldora agotada con precio (último `<small>`).
- Variables nuevas: `E2E_MAIN_URL` (build de `main`). `E2E_AGOTADO_URL` se mantiene.
- `src/domain/` sin cambios; cobertura de líneas 99,84 %.
- Sin verificar:
  - WebKit (zoom de iOS al enfocar un select; Safari no abre `<details>` con la búsqueda, LEG-183) y Firefox (triángulo del `<summary>`), que no están en el entorno;
  - Lighthouse (no se ejecutó en esta ronda: el JS se midió por descarga real con el viewport de Lighthouse móvil).
