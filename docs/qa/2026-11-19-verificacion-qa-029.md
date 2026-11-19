# Ronda QA — Verificación de QA-029 (pesos y tamaños de control) — 2026-11-19

Rama `feat/ux-auditoria`, HEAD `5982339` (`fix(estilos): pesos y tamaños de control según marca (QA-029)`). Chromium (Playwright), Linux.
Criterios: `docs/diseno/2026-11-18-ux-auditoria-media.md` § QA-029, «Entrega para qa-pruebas (QA-029)».

Servidores (el `serve out` del dueño en el 3000 no se tocó; tampoco el 4173):

| Puerto | Build |
|---|---|
| 4311 | `out/` del repositorio en `5982339` |
| 4312 | `a52a81b` (antes de la corrección), copia con `git archive` en el scratchpad: referencia para comparar píxel a píxel |
| 4313 | `5982339` con `data/catalogo.csv` modificado (arreboles agotado `250\|500`, casa-martinez `250`) |
| 4314 | `5982339` con arreboles `250\|500` y casa-martinez `500` (convención de `qa-2026-11-18-ux-a2-m9.spec.ts`) |

Las copias con CSV modificado viven fuera del repositorio y no se commitean.

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm run lint` | pasa |
| `npm run typecheck` | pasa |
| `npm test` | pasa: 40 archivos, 603 pruebas |
| `npx vitest run --coverage --coverage.include='src/domain/**'` | `src/domain/`: 99,66 % sentencias, 96,72 % ramas, 99,84 % líneas |
| `npm run build` | pasa |
| `E2E_PUERTO=4311 E2E_AGOTADO_URL=http://localhost:4313 npx playwright test` (suite completa, con las pruebas nuevas) | **481 pasan, 1 falla, 26 omitidas.** La falla es de entorno: `qa-2026-11-18-ux-a2-m9` › «ficha agotada (copia con CSV temporal)» espera casa-martinez `500` agotado y la copia del 4313 tenía `250` |
| Ídem esa prueba con `E2E_AGOTADO_URL=http://localhost:4314` | pasa |
| `qa-2026-11-19-verificacion-qa-029.spec.ts` + `qa-2026-11-19-cierre-baja.spec.ts` (4311, `E2E_AGOTADO_URL` 4314) | 40 pasan |
| `qa-2026-11-19-verificacion-qa-029.spec.ts` contra `a52a81b` (4312) | 11 de 17 fallan (las demás son axe y las agotadas, que apuntan al 4313): las pruebas sí distinguen el antes del después |
| Prueba de cierre de QA-029 (`cierre-baja`, regex nueva) contra `a52a81b` (4312) | falla a 360 y 1.280 con la lista completa (pesos y `text-sm → 12px`) |
| `--repeat-each=3` de las pruebas de QA-029 sin copia agotada | 39 de 39 pasan. Sin intermitencias |
| Guardia «QA-018 · JS inicial de inicio» (360 × 740) | pasa: **153.221 B** (149,6 KiB). Margen: **379 B** (antes 385 B) |
| `grep -rliE "gourmet\|premium\|exótic\|mágic\|el mejor\|Café de Santander" out/ --include=*.html` | 0 archivos |
| `grep -rEil "service_role\|SANITY_API_TOKEN\|sk[A-Za-z0-9]{20,}" out/` | 0 archivos |
| `grep -rl "TODO(dato" out/` | 0 archivos |

Omitidas (26): las que piden `E2E_BASEPATH_URL`, `E2E_BASE_URL`/`E2E_MAIN_URL` y los builds de fechas del envío gratis. Esta corrección solo cambia cadenas de clases, así que el `basePath` no se volvió a construir.

**Veredicto: APTO.** Los criterios de diseño se cumplen. **QA-029 queda Cerrado.** No hay defectos nuevos. No queda ningún defecto abierto en esta rama.

## Defectos

| ID | Severidad | Área | Título | Responsable | Estado |
|---|---|---|---|---|---|
| QA-029 | Baja | Estilos / marca | Las clases de `marca.css` y `componentes.css` anulan las utilidades de peso y tamaño de Tailwind | desarrollador-fullstack | **Cerrado** |

Ningún defecto nuevo (el siguiente ID libre sigue siendo QA-030).

### QA-029 — verificación

| # | Criterio (diseño § QA-029) | Resultado | Prueba |
|---|---|---|---|
| 1 | Prueba de cierre con la regex que acepta `!` delante o detrás, a 360 y 1.280, en `/`, la ficha y `/envios/` | ✅ lista vacía | `cierre-baja` › «QA-029: a 360/1280 px toda utilidad font-(peso) se pinta con su peso y todo text-sm a 14 px…» |
| 2 | Todo elemento con `text-sm` o `text-sm!` se pinta a 14 px (agregado a la misma prueba) | ✅ | ídem. Contra `a52a81b` lista los chips y píldoras a 12 px |
| 3 | Chips del inicio (panel a 1.280; fila de provincias a 360), hoja de filtros (360) y filtros activos (360 y 1.280): rótulo 14/600, conteo 12/500 | ✅ | `verificacion-qa-029` › «chips y píldoras…» (3 pruebas) |
| 4 | Filtros activos sin `gap-1.5`: queda el `gap` de 4 px de `.ds-tag` | ✅ `column-gap: 4px` | ídem |
| 5 | Píldoras de la ficha (presentación y tamaño) 14/600; precio 12/500 | ✅ a 360 y 1.280 | «ficha a 360/1280…» |
| 6 | Perfiles de taza de la ficha sin cambio | ✅ 12/500 | ídem |
| 7 | Píldoras de una línea centradas en vertical (≤ 1 px) | ✅ «Grano» y «Molido»: 12 px arriba, 12 abajo, 44 px de alto | «centrado de las píldoras…» |
| 8 | Píldoras de dos líneas centradas en horizontal | ✅ los dos renglones con el mismo centro que la caja (0 px). En vertical, 9/8 px; alto 54 px (antes 50), como prevé diseño | ídem |
| 9 | Píldora agotada sin cambio: borde punteado, `ink-muted`; ahora 14/600 con «Agotado» 12/500 | ✅ a 360 y 1.280, en las dos copias | «píldoras agotadas…» y `qa-2026-11-18-ux-media` › «Ficha con tamaños agotados» (contraste ≥ 4,5:1, axe claro y oscuro) |
| 10 | A 1.280, con el puntero sobre un chip no marcado, el borde pasa a `ink`; sobre uno deshabilitado no cambia | ✅ `rgb(221, 208, 186)` → `rgb(36, 23, 15)`; el deshabilitado («Oscuro 0» con Guanentá elegida) se queda en `rgb(221, 208, 186)`. El filtro activo también pasa a `ink` | «borde al pasar el puntero» |
| 11 | `/envios/` a 360 y 768: `h3` y «Zona n» en 700, `<summary>` en 700, «Por cotizar» en 600, sin desplazamiento horizontal | ✅ | «/envios/ (tarjetas por zona)» |
| 12 | Tira de navegación a 360: enlaces en 600 y de 44 px; «Envíos» asoma bajo el fundido | ✅ «Envíos» empieza en x = 327 y termina en 398 (tira hasta 360): se ve «En» bajo el fundido. Al deslizar hasta el final sale entero del fundido (prueba de M3 de `ux-media`) | «tira de navegación a 360» |
| 13 | QA-025: chip de 36 px visible y 44 px táctil | ✅ 36 / 44 (medido con `elementFromPoint`), y pasan las 8 pruebas de M1/QA-025 de `ux-media` | «inicio a 360…» y suite completa |
| 14 | QA-023 (B3) | ✅ las 12 pruebas de QA-023 de `flujo-tres-pasos` y `verificacion-qa-022-024` pasan | suite completa |
| 15 | Guardia QA-018 | ✅ 153.221 B, igual a lo que midió el desarrollador; margen 379 B | `ux-media` › «QA-018 · JS inicial de inicio» |
| 16 | axe a 360 y 1.280, claro y oscuro, en `/`, la ficha y `/envios/` | ✅ 0 serias o críticas | «axe tras el cambio» (4 pruebas) |
| 17 | Respaldo de WhatsApp (A6): primera línea en 600 | ✅ 14/600 a 360 y 1.280 (antes 14/500) | «resumen con respaldo (A6)» |

Grupo B (B1 a B4): las utilidades ya no están en el marcado. La comparación píxel a píxel con `a52a81b` muestra que el cajón con líneas (B1 y B2) y la tarjeta de la provincia del mapa (B3) no cambian. B4 no se ve (no hay puntajes verificados).

## Capturas

**Comparación píxel a píxel `a52a81b` (4312) contra `5982339` (4311)**, mismo navegador y viewport, movimiento reducido:

| Toma | Resultado |
|---|---|
| `/historia/`, `/como-pedir/`, `/legal/terminos/`, `/legal/privacidad/`, `/legal/vendedor/`, `/provincias/guanenta/`, `/pedido/` vacío (1.280, página completa) | **iguales** |
| `#mapa` en `/` y en `/?provincia=guanenta` (1.280 y 360, con la tarjeta de provincia, B3) | **iguales** |
| `main` de `/historia/` y `/legal/terminos/` a 360; pie a 360 y 1.280 | **iguales** |
| `main` de `/pedido/` (paso Envío) con dos líneas, 360 y 1.280 | **iguales** |
| Cajón «Tu pedido» con dos líneas (B1, B2), 360 y 1.280 | **iguales** |
| `/envios/` 1.440, página completa | solo cambian las filas del `h3` (A1); el alto es el mismo (9.815 px) |
| Tarjetas de `/envios/` 360 y 768; bloque de compra de la ficha 360 y 1.280; tira 360; chips del inicio 360; filtros 1.280; filtros activos 1.280 | cambian, como se esperaba (ver abajo) |

**Capturas nuevas aprobadas** (revisadas una por una; el encabezado fijo se oculta para que no tape el elemento):

- `docs/qa/capturas/2026-11-19-qa-029-envios-tarjetas-360.png`, `…-768.png`: «Zona n» y «Qué cubre la zona n» en 700, «Por cotizar…» en 600.
- `docs/qa/capturas/2026-11-19-qa-029-envios-titulo-1440.png`: título del bloque en 700, tabla sin cambio.
- `docs/qa/capturas/2026-11-19-qa-029-ficha-compra-360.png`, `…-1280.png`: píldoras 14/600, precio 12/500, «Grano» y «Molido» centrados; el bloque crece 4 px.
- `docs/qa/capturas/2026-11-19-qa-029-inicio-tira-360.png`, `…-inicio-chips-360.png`, `…-inicio-filtros-1280.png`, `…-inicio-activos-1280.png`.
- `docs/qa/capturas/2026-11-19-qa-029-respaldo-360.png`, `…-1280.png`: primera línea del respaldo en 600 y visible (la captura del 2026-11-18 la deja tapada por el encabezado fijo).
- `docs/qa/capturas/2026-11-19-qa-029-agotado-cafe-arreboles-360.png`, `…-cafe-casa-martinez-360.png`.

**Capturas existentes regeneradas por la suite** y conservadas (el cambio es el de QA-029): `2026-11-18-a1-respaldo-{360,1280}-{light,dark}`, `2026-11-18-agotado-{cafe-arreboles,cafe-casa-martinez,total-arreboles}-360`, `2026-11-18-ficha-{360,1440}`, `2026-11-18-m3-tira-foco-envios-360`, `2026-11-18-m9-ficha-agotada-360`, `2026-11-19-ancla-tarifas-{cajon,resumen}-{360,1440}`, `envios-pagina-{360,1440}`, `envios-tabla-320` y `legal-privacidad-320` (solo la tira). `ficha-tecnica-360` y `2026-11-18-m9-tarjeta-agotada-360` se restauraron: su diferencia era ruido de suavizado o de la copia agotada, no de QA-029.

## Pruebas ajustadas y nuevas

1. `e2e/qa-2026-11-19-cierre-baja.spec.ts` › QA-029: la regex acepta `!` delante o detrás de la utilidad de peso, y la prueba exige además que todo `text-sm`/`text-sm!` se pinte a 14 px.
2. `e2e/qa-2026-11-19-verificacion-qa-029.spec.ts` (19 pruebas): chips y píldoras (5), centrado (2), borde al pasar el puntero (1), `/envios/` (2), tira (1), axe (4), píldoras agotadas con `E2E_AGOTADO_URL` (2) y respaldo (2).

## Observaciones

- **Riesgo QA-018:** quedan 379 B de margen. Cualquier cambio de clases en componentes cliente del inicio puede pasar el límite.
- **Pruebas con `E2E_AGOTADO_URL`:** `qa-2026-11-18-ux-media` espera casa-martinez `250` agotado y `qa-2026-11-18-ux-a2-m9` espera `500`. Con una sola copia, una de las dos falla siempre. No es un defecto del sitio; en la próxima ronda que toque esas pruebas conviene unificar la convención.
- **Deuda técnica** (diseño § QA-029, «Después»): mover los estilos de marca a `@layer components`. No es de esta rama.

## Paridad v1

Sin cambios respecto a `2026-11-19-cierre-baja.md`. Esta corrección no toca funciones de `docs/INVENTARIO-V1.md`.

## Cobertura

- `src/domain/`: 99,66 % sentencias, 96,72 % ramas, 99,84 % líneas (≥ 90 %).
- E2E: 508 pruebas en la suite completa (481 pasan, 1 de entorno descrita arriba, 26 omitidas por variables de entorno).
