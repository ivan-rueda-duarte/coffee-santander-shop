# Ronda QA — Fotos responsivas (auditoría UX A3) — 2026-11-18

Rama `feat/ux-auditoria`, commit `1c1812e` «perf(fotos): variantes responsivas WebP y prioridad de la foto principal». Chromium (Playwright 1.64), Linux. Base de comparación: `8162ccf` construido aparte en un worktree.

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm run lint` | pasa (0 errores) |
| `npm run typecheck` | pasa |
| `npm test` (antes de agregar la prueba de QA-020) | pasa: 33 archivos, 551 pruebas |
| `npx vitest run tools/fotos-responsivas.test.ts` | **falla** (QA-020, esperado) |
| `NEXT_PUBLIC_SITE_URL=https://ejemplo.test npm run build` | pasa; postbuild: «4 foto(s) original(es) quitada(s) (5.5 MB)» |
| `GITHUB_PAGES=true NEXT_PUBLIC_SITE_URL=https://ejemplo.github.io/coffee-santander-shop npm run build` | pasa |
| `npx playwright test` (suite completa, build por defecto) | 241 pasan, 21 omitidas (basePath y fechas), 4 fallan: las 2 de QA-019 (esperado) y 2 de la prueba nueva por carrera con la hidratación de `/cafes/` (defecto de la prueba, corregido; luego 60/60 con `--repeat-each 5`) |
| `npx playwright test e2e/qa-2026-11-18-fotos-responsivas.spec.ts` (final) | 19 pasan, 2 fallan (QA-019), 6 omitidas (basePath) |
| `E2E_BASEPATH_URL=http://localhost:4180 npx playwright test e2e/qa-2026-11-18-fotos-responsivas.spec.ts e2e/basepath.spec.ts -g basePath` | 10 pasan |
| axe (WCAG 2.1 A/AA) en ficha y catálogo con `<picture>` + suite `accesibilidad.spec.ts` | sin violaciones serias ni críticas |

Veredicto: **APTO CON OBSERVACIONES** (dos defectos, Media y Baja; ninguno Bloqueante ni Alta).

## Métricas medidas

Medición propia con Playwright + CDP (sin Lighthouse en el repositorio): perfil «Slow 4G» de Lighthouse (150 ms RTT, 1,6 Mb/s, CPU 4×), móvil 412 × 823 a DPR 1,75, caché deshabilitada, LCP y CLS con `PerformanceObserver`.

| Página · condición | Antes (`8162ccf`) | Después (`1c1812e`) |
|---|---|---|
| Ficha Casa Martínez · LCP móvil con throttling (3 corridas) | 24.060 / 24.000 / 23.880 ms (`1.jpg`) | **1.400 / 1.388 / 1.504 ms** (`1-800.avif`) — meta 2,5 s: cumple |
| Ficha · bytes de imagen | 4.435 KB | 70 KB (foto principal 33 KB + miniatura 12 KB + SVG) |
| Ficha · foto principal | `loading=lazy`, sin `fetchpriority` | `loading=eager`, `fetchpriority=high` |
| Catálogo `/cafes/` · bytes de imagen 390 × 844 DPR 3 | 4.503 KB | 151 KB |
| Catálogo · bytes de imagen 1440 × 900 | 4.503 KB | 49 KB |
| Inicio · LCP móvil con throttling (4 corridas) | 2.060 / 1.760 / 2.060 / 1.768 ms | 1.760 / 1.760 / 1.592 / 1.760 ms (el LCP es la sección con topo SVG, no una foto) |
| CLS ficha, catálogo, inicio (360 y 1440, con desplazamiento hasta las fotos diferidas) | 0 | 0 (< 0,01 en la prueba) |
| JS inicial de inicio (gzip -9) | 193.376 B (QA-018) | 193.909 B (+533 B: el manifiesto entra al bundle del cliente) |

Variante elegida (`currentSrc`), ancho CSS medido de la caja:

| Viewport | Foto principal ficha | Miniatura | Tarjeta catálogo |
|---|---|---|---|
| 390 × 844 DPR 3 | 350 px → `1-1200.avif` (esperado 1200) | 109 px → `2-400.avif` | 348 px → `1-1200.avif` |
| 1440 × 900 DPR 1 | 518 px → `1-800.avif` (esperado 800) | 165 px → `2-400.avif` | 262 px → `1-400.avif` |
| 360 × 740 / 768 × 1024 DPR 1 | — | — | variante = menor candidato ≥ ancho × DPR (prueba pasa) |

En todos los casos se elige el menor candidato que cubre ancho CSS × DPR: el `sizes` no subestima ni sobredimensiona más de un escalón. A 1440 el `sizes` de la tarjeta (360 px) sobreestima la caja real (262 px), sin efecto con los escalones actuales.

## Verificación por punto

1. **Prioridad y variante de la ficha**: ✅. `loading="eager"` y `fetchpriority="high"` en la principal, `lazy` en miniaturas; 390 DPR 3 → 1200 AVIF, 1440 DPR 1 → 800 AVIF. Ninguna `<img>` de `main` apunta a `/fotos/cafes/`.
2. **CLS y LCP**: ✅. CLS 0 en tarjeta, ficha y miniaturas (las cajas ya tenían `aspect-ratio`); LCP móvil de la ficha ≈ 1,4–1,5 s contra 24 s antes.
3. **Capturas**: ✅ sin cambios visuales. Comparación píxel a píxel contra `8162ccf` en ficha, miniaturas y tarjeta a 360 y 1440: misma geometría; la diferencia se limita al área de la foto (media < 1,5/255 por canal, compresión y remuestreo); el velo cálido (`::after`) se conserva con `picture{display:contents}`. Capturas nuevas: `docs/qa/capturas/2026-11-18-ficha-{360,1440}.png`, `docs/qa/capturas/2026-11-18-tarjeta-{360,1440}.png`.
4. **og:image y basePath**: ✅. Con `NEXT_PUBLIC_SITE_URL`: `og:image` y `Product.image` = `https://ejemplo.test/fotos-optimizadas/cafes/cafe-casa-martinez/1-1200.jpg`. Con `GITHUB_PAGES=true`: `https://ejemplo.github.io/coffee-santander-shop/fotos-optimizadas/…/1-1200.jpg`, que responde 200 `image/jpeg`; `srcSet` y `src` llevan `/coffee-santander-shop/`; inicio, catálogo, dos fichas y provincia cargan todas las fotos sin ninguna respuesta ≥ 400. `basepath.spec.ts` pasa (3/3).
5. **out/ sin originales**: ✅ en `out/fotos/` solo quedan los `.gitkeep`; están las 28 variantes. El postbuild falla y no borra si un `<img src>` o un `srcset` con basePath enlaza un original. ⚠️ No lo detecta en JSON-LD ni en `style="…url(…)"` → **QA-019**.
6. **lint, typecheck, test, e2e, axe**: ✅ (salvo las pruebas de cierre nuevas de QA-019 y QA-020, que fallan a propósito).

## Defectos

| ID | Severidad | Área | Título | Responsable | Estado |
|---|---|---|---|---|---|
| QA-020 | Media | Build / dependencias | `sharp` no está declarado: el build depende de una dependencia opcional y transitiva de `next` | desarrollador-fullstack | Abierto |
| QA-019 | Baja | Build / fotos | La comprobación del postbuild no revisa JSON-LD ni estilos en línea antes de borrar originales | desarrollador-fullstack | Abierto |
| QA-017 | Baja | Accesibilidad | «Agregar» dice «en grano entero» | desarrollador-fullstack | Abierto (sin cambios en esta ronda) |
| QA-018 | Media | Rendimiento | JS inicial de inicio > 150 KB gzip | desarrollador-fullstack | Abierto; ahora 193.909 B (+533 B por el manifiesto) |

### QA-020 — `sharp` no está declarado como dependencia
- Severidad: Media (si falta, `prebuild` y `predev` terminan con código 1: no hay build ni despliegue).
- Entorno: `package.json` y `package-lock.json` en `1c1812e`.
- Pasos para reproducir: 1. `npm ls sharp` → `de-santander └─┬ next@16.4.5 └── sharp@0.35.5`. 2. En `package-lock.json`, `node_modules/sharp` tiene `"optional": true`. 3. `tools/fotos-responsivas.ts` hace `import("sharp")`, y `npm run fotos` corre en `prebuild` y `predev`.
- Resultado esperado: el script declara su dependencia (`devDependencies.sharp`, con la versión que ya resuelve el lock), de modo que `npm ci` la instale siempre, aunque `next` deje de traerla o se instale con `--omit=optional`.
- Resultado obtenido: solo llega por `next`. Además, el mensaje de error del script («Ejecuta `npm ci`») no lo arreglaría en esos casos.
- Evidencia: `tools/fotos-responsivas.test.ts` falla: `expected undefined to be defined`.
- Prueba de cierre: `npx vitest run tools/fotos-responsivas.test.ts`.
- Responsable sugerido: desarrollador-fullstack.

### QA-019 — El postbuild no revisa JSON-LD ni estilos en línea antes de borrar los originales
- Severidad: Baja (hoy ninguna página enlaza originales; la red de seguridad tiene huecos).
- Entorno: `tools/fotos-responsivas.ts`, `limpiarOut()`, en `1c1812e`; build por defecto.
- Pasos para reproducir: 1. Copiar `out/` y `src/data/fotos-responsivas.json` a una carpeta temporal y reponer `out/fotos/cafes/cafe-arreboles/1.jpg`. 2. Insertar en `out/cafes/cafe-arreboles/index.html` `<script type="application/ld+json">{"@type":"Product","image":"https://ejemplo.test/fotos/cafes/cafe-arreboles/1.jpg"}</script>` (o `<div style="background-image:url(/fotos/cafes/cafe-arreboles/1.jpg)">`). 3. Ejecutar `tsx tools/fotos-responsivas.ts --limpiar-out` desde esa carpeta.
- Resultado esperado: sale con código ≠ 0, nombra la página y no borra el original. Es justo el caso que el commit cambió (`imagenPrincipal` del JSON-LD y de `og:image`): si una regresión volviera a la ruta original, el JSON-LD quedaría apuntando a un 404 sin que el build lo detecte.
- Resultado obtenido: «✓ out/: 4 foto(s) original(es) quitada(s)», código 0, original borrado. La expresión solo mira `(?:src|srcset|href|content)="…<ruta>[\s",]`: no cubre texto de `<script>`, `style=`, CSS, ni rutas seguidas de `?` o `#`.
- Evidencia: `e2e/qa-2026-11-18-fotos-responsivas.spec.ts`, pruebas «QA-019: postbuild falla si el JSON-LD de una ficha apunta a un original» y «QA-019: postbuild falla si un style en línea usa un original como fondo» (fallan: `Expected: not 0`). Trazas en `test-results/qa-2026-11-18-fotos-respon-*-original-chromium/trace.zip`.
- Sugerencia (no vinculante): buscar la ruta del original como texto en todo el HTML y el CSS de `out/`, excluyendo los payloads de datos del catálogo (`"fotos":[…]` en el RSC, que hoy contienen las rutas originales como datos y no las cargan), o limitar a URL absolutas y atributos más el contenido de `application/ld+json`.
- Prueba de cierre: esas dos pruebas.
- Responsable sugerido: desarrollador-fullstack.

## Observaciones (no son defectos)
- `serve` (local) no envía `Content-Type` para `.avif`; Chromium lo decodifica igual y GitHub Pages sí envía `image/avif`. La prueba de tipos MIME cubre WebP y JPEG.
- Las rutas originales (`/fotos/cafes/…/1.jpg`) siguen en el payload RSC (`.txt` y `self.__next_f`) como datos del catálogo y como claves del manifiesto en el JS del cliente; nada las carga. Es lo que explica el aumento de +533 B gzip del JS inicial.
- La foto de inicio `public/assets/fotografia/cafetal-montana.jpg` (248 KB) y `chicamocha-canon.jpg` (600 KB) no pasan por las variantes (solo se procesa `public/fotos/`). Fuera del alcance de A3; en el LCP móvil de inicio no influyen hoy.
- Regeneración incremental por `mtime`: si cambian `CALIDAD` o el formato, las variantes existentes no se rehacen hasta borrarlas. En CI no aplica (carpeta limpia).
- CLS de inicio con throttling: 0,034–0,049 en los dos builds (antes y después), por debajo de 0,1; sin relación con las fotos.
- En `/cafes/` la prueba necesitaba esperar `networkidle` antes de medir la tarjeta (bajo carga, el explorador vuelve a montar la tarjeta al hidratar). No hay peticiones de imagen duplicadas.

## Capturas de `docs/qa/capturas/`
Las 9 capturas modificadas (`documento-postal-errores-320/360`, `envios-pagina-360/1440`, `envios-tabla-320`, `pie-vendedor-320/360`, `ppt-360`, `tarjeta-marca-larga-320`) se **regeneran y se commitean**. Las regeneró la suite e2e y esta ronda las volvió a generar. Reflejan el sitio construido después del 17/11, con la promoción de envío gratis vigente (`envio_gratis_desde,2026-11-17`): `/envios/` y el formulario son más altos que en las capturas del 14/11. El pie y `ppt-360` no cambian a la vista (antialiasado de la textura). Así la evidencia corresponde al estado que se publica.

## Pruebas agregadas en esta ronda
- `e2e/qa-2026-11-18-fotos-responsivas.spec.ts` (21 pruebas + 6 bajo basePath): prioridad de la foto principal, variante elegida a 390 DPR 3 y 1440 DPR 1, `sizes` de la tarjeta a 360/390@3/768/1440, CLS en inicio/catálogo/ficha a 360 y 1440, capturas, axe, `out/` sin originales y con variantes, tipos MIME, postbuild con referencias inyectadas (2 pasan, 2 de QA-019), basePath (5 rutas + og:image).
- `tools/fotos-responsivas.test.ts` (QA-020).

## Paridad v1
Sin cambios funcionales. La v1 servía fotos sin variantes; la v2 ahora sirve AVIF/WebP responsivos (⚠️ distinta, mejora).

## Cobertura
Sin cambios en `src/domain/` (el commit no lo toca). `src/ui/fotos-responsivas.ts` tiene pruebas unitarias del desarrollador (`src/ui/fotos-responsivas.test.ts`, `src/ui/componentes/marca/foto.test.tsx`), que pasan.
