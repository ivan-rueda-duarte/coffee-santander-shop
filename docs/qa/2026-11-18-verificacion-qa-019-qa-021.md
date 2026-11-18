# Ronda QA — Verificación de QA-019 y QA-021 — 2026-11-18

Rama `feat/ux-auditoria`, HEAD `2b98981` (correcciones `3246fb5` para QA-019 y `2b98981` para QA-021). Chromium (Playwright 1.64), Linux. Puerto 4173 libre antes de cada corrida (el `webServer` reconstruye `out/` en cada una).

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm run lint` | pasa (0 errores) |
| `npm run typecheck` | pasa |
| `npx vitest run` | 570 pasan, 1 falla: `tools/fotos-responsivas.test.ts` (QA-020, abierto a propósito; fuera del veredicto). 35 archivos. |
| `NEXT_PUBLIC_SITE_URL=https://ejemplo.test npm run build` | pasa; postbuild «✓ out/: 4 foto(s) original(es) quitada(s) (5.5 MB)». Sin falsos positivos. |
| `GITHUB_PAGES=true NEXT_PUBLIC_SITE_URL=https://ejemplo.github.io/coffee-santander-shop npm run build` | pasa; mismo mensaje del postbuild. Sin falsos positivos. |
| `npx playwright test e2e/qa-2026-11-18-fotos-responsivas.spec.ts e2e/qa-2026-11-18-ux-a2-m9.spec.ts` | 45 pasan, 9 omitidas (basePath sin servidor, comparaciones contra otros commits, ficha agotada con CSV temporal) |
| `E2E_BASEPATH_URL=http://localhost:4180 npx playwright test` (suite completa; build `GITHUB_PAGES=true` copiado bajo `/coffee-santander-shop/` y servido en 4180) | **281 pasan, 0 fallan**, 14 omitidas (11 de fechas de envío gratis «terminada»/«apagada», 2 comparaciones A2 contra otros commits, 1 ficha agotada sin `E2E_AGOTADO_URL`) |
| `npx playwright install webkit` | descarga el navegador, pero el sistema no tiene `libavif16` ni `libmanette-0.2-0` (requieren `sudo`): WebKit no arranca. **No verificado en WebKit.** |

Veredicto: **APTO** para QA-019 y QA-021 (los dos cerrados). Siguen abiertos QA-020 (Media), QA-018 (Media) y QA-017 (Baja), sin cambios en esta ronda; ninguno Bloqueante ni Alta.

## QA-019 — Cerrado

Pruebas de cierre «QA-019: postbuild falla si el JSON-LD de una ficha apunta a un original» y «QA-019: postbuild falla si un style en línea usa un original como fondo»: pasan.

Pruebas nuevas en `e2e/qa-2026-11-18-fotos-responsivas.spec.ts` (todas pasan):
- Original en `url()` dentro de la hoja real del build. Next 16 deja el CSS en `out/_next/static/chunks/*.css`, no en `_next/static/css/`, y la prueba busca cualquier `.css` bajo `_next/static`. Falla con `out/_next/static/chunks/….css enlaza /fotos/cafes/cafe-arreboles/1.jpg` y no borra el original.
- CSS con basePath y `?v=3`: falla y no borra.
- `<img src="…/1.jpg?v=2">`: falla y no borra.
- `<a href="https://ejemplo.test/…/1.jpg#foto">`: falla y no borra.
- Control negativo: el `out/` real sin nada inyectado pasa y borra el original.

Falsos positivos: en el HTML generado, las rutas originales solo aparecen en las listas `\"fotos\":[…]` y en la llave de React de las miniaturas (`[\"$\",\"li\",\"/fotos/…\",…]`). Las dos se excluyen y los dos builds pasan.

Límite conocido (observación, no defecto): el `.js` y el `.txt` del payload RSC no se revisan porque traen las rutas como datos (las llaves del manifiesto). Si un componente cliente cargara un original desde JS, el postbuild no lo detectaría. Hoy las pruebas de `<picture>` de la ficha y del catálogo confirman que ninguna `<img>` usa `/fotos/cafes/`.

## QA-021 — Cerrado

- La prueba de cierre «foco en una casilla con error: se distingue de la casilla con error sin foco» pasa.
- Agregué «QA-021 (verificación), tema light/dark» con los valores exactos de la especificación, resueltos desde `--focus` y `--danger`. Las dos pasan:

| Tema | `#c-ter` (error + foco) | `#c-aut` (error, sin foco) |
|---|---|---|
| Claro | outline 2px solid rgb(162,79,39) (`--focus`), offset **4px**; box-shadow rgb(184,22,44) 0 0 0 2px | outline 2px solid rgb(184,22,44) (`--danger`), offset **0px**; box-shadow igual |
| Oscuro | outline `--focus` (#e9b320), offset 4px; anillo `--danger` | outline `--danger` (#ffb3b9), offset 0 |

- axe en el resumen con errores de casillas: sin violaciones serias ni críticas a 360 y 1.280, en claro y oscuro. Contraste del texto en tinta ≥ 4,5:1; ícono y borde ≥ 3:1.
- Capturas regeneradas:
  - `docs/qa/capturas/2026-11-18-m9-foco-casilla-ter.png` y la nueva `2026-11-18-m9-foco-casilla-ter-dark.png`: recorte con 12 px de margen. La captura anterior era solo del elemento y no mostraba el contorno a 4 px.
  - `docs/qa/capturas/2026-11-18-m9-foco-casillas-360.png`: también con margen, porque el contorno sobresale del fieldset. Se ven las dos marcas: doble anillo en «términos» y anillo grana pegado en «autorización».
- WebKit no se pudo correr por las dependencias del sistema. La regla incluye `outline` grana con offset 0 justo para los motores que no pintan `box-shadow` en la casilla nativa, pero en Safari queda **sin verificar**.

## Defectos

No hay defectos nuevos. Estado:

| ID | Severidad | Título | Estado |
|---|---|---|---|
| QA-019 | Baja | El postbuild no revisa JSON-LD ni estilos antes de borrar originales | Cerrado |
| QA-021 | Media | Casilla con error y foco igual a la casilla con error sin foco | Cerrado |
| QA-020 | Media | `sharp` no declarado | Abierto (espera decisión del usuario) |
| QA-018 | Media | JS inicial de inicio > 150 KB gzip | Abierto |
| QA-017 | Baja | «Agregar» dice «en grano entero» | Abierto |

## Archivos de prueba
- La prueba de QA-020 ya vivía sola en `tools/fotos-responsivas.test.ts`. Ese archivo queda sin commitear hasta que se corrija.
- `e2e/qa-2026-11-18-fotos-responsivas.spec.ts` no contiene la prueba de QA-020, así que se commitea.

## Paridad v1
Sin cambios funcionales.

## Cobertura
Sin cambios en `src/domain/`. Hay 7 pruebas e2e nuevas: 5 de QA-019 y 2 de QA-021. Además, `tools/referencias-originales.test.ts` (del desarrollador) pasa.
