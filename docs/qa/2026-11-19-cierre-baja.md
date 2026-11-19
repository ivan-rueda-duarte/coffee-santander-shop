# Ronda QA — Cierre de la severidad baja (QA-028, QA-017, 79c7dc4, 361eef4, 6520ae3, bfc3f46, 66ee813) — 2026-11-19

Rama `feat/ux-auditoria`, HEAD `1a10a07`. Chromium (Playwright 1.64), Linux. Firefox y WebKit no están en el entorno.
Commits verificados: `f310098` (QA-028), `79c7dc4`, `361eef4`, `6520ae3`, `bfc3f46`, `66ee813` y `1a10a07` (QA-017).

Servidores: `out/` del repositorio en 4300. Build con `GITHUB_PAGES=true` en 4303 (copia en el scratchpad, servida bajo `/coffee-santander-shop/`). Build de `main` (`8162ccf`, árbol de trabajo temporal fuera del repositorio) en 4304. No se tocaron el 3000 ni el 4173.

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm run lint` | pasa |
| `npm run typecheck` | pasa |
| `npx vitest run --coverage --coverage.include='src/domain/**'` | pasa: 40 archivos, 603 pruebas. `src/domain/`: 99,66 % sentencias, 96,72 % ramas, 99,84 % líneas |
| `NEXT_PUBLIC_SITE_URL=https://ejemplo.test npm run build` | pasa |
| `GITHUB_PAGES=true NEXT_PUBLIC_SITE_URL=https://ejemplo.github.io/coffee-santander-shop npm run build` | pasa. Cada página precarga 3 fuentes con el prefijo `/coffee-santander-shop/` |
| `E2E_PUERTO=4300 E2E_BASEPATH_URL=http://localhost:4303 npx playwright test` (1.ª pasada, sin las pruebas nuevas) | 449 pasan, 1 falla, 20 omitidas. La falla es de la prueba, no del sitio (ver «Pruebas ajustadas», 1) |
| Ídem con `E2E_MAIN_URL=http://localhost:4304` y las pruebas nuevas (2.ª pasada) | 470 pasan, 1 falla, 18 omitidas. La falla es de la prueba (ver «Pruebas ajustadas», 3) |
| Tras ajustar las pruebas: los 6 archivos tocados o relacionados (`qa-2026-11-19-cierre-baja`, `qa-2026-11-18-cierre-media`, `qa-2026-11-18-ux-a2-m9`, `qa-2026-11-14-paquete-abogado`, `envios`, `basepath`) | 123 pasan, 0 fallan, 5 omitidas. QA-029 se agregó después y falla a propósito (2 pruebas) |
| `qa-2026-11-19-cierre-baja.spec.ts --repeat-each=2` | 36 de 38 pasan. Las 2 que fallaron eran de la prueba (ruta de la 404) y quedaron corregidas. Sin intermitencias |
| Guardia «QA-018 · JS inicial de inicio» (360 × 740) | pasa: **153.215 B** (149,6 KiB). Margen: 385 B |
| `grep -riE "gourmet\|premium\|exótic\|mágic\|el mejor\|Café de Santander" out/ --include=*.html` | 0 archivos |
| `grep -rEil "service_role\|SANITY_API_TOKEN\|sk[A-Za-z0-9]{20,}" out/` | 0 archivos |
| `grep -rl "TODO(dato" out/` | 0 archivos |

Pruebas omitidas (18): las que exigen `E2E_AGOTADO_URL` o `E2E_BASE_URL` (`ba6e063`), las de fechas del envío gratis «terminada» o «apagada» y las de la promoción simulada.

**Veredicto: APTO CON OBSERVACIONES.** Los siete puntos pasan. **QA-028 y QA-017 quedan Cerrados.** Se abre **QA-029 (Baja)**: las clases tipográficas de `marca.css` y `componentes.css` anulan las utilidades de peso y tamaño de Tailwind. No hay defectos Bloqueantes, Altos ni Medios abiertos.

## Veredicto por punto

| # | Punto | Veredicto | Evidencia |
|---|---|---|---|
| 1 | QA-028 · tabla de `/envios/` desde `lg` | ✅ **Cerrado** | «QA-028: a 1024 / 1280 / 1440 px cada precio y cada rótulo «Hasta n kg» caben en un renglón» pasa (24 celdas, 0 partidas). La región no tiene desplazamiento horizontal en ningún ancho (`scrollWidth` = `clientWidth` = 726 px). Columnas: Zona 83 px, Cubre 313, escalones 108/111/111. Capturas: `docs/qa/capturas/2026-11-19-qa-028-tabla-1024.png`, `…-1280-head.png` y `…-1280-main.png` |
| 1b | Prueba «a 1.280 px igual que en `main`» | ✅ actualizada | Ver «Pruebas ajustadas», 2 |
| 2 | `79c7dc4` · sin precarga de la itálica de Montserrat | ✅ | En 12 rutas, cada página precarga 3 fuentes: Fraunces normal, Fraunces itálica y Montserrat normal. La 404 no precarga ninguna (es así en Next; carga las fuentes por `@font-face`). `document.fonts` no declara ninguna cara itálica de Montserrat y `out/_next/static/media/` ya no la trae. **Ningún texto pide itálica fuera de Fraunces**, a 360 y 1.280 px: se recorrieron todos los nodos de texto de 13 rutas (con los `<details>` abiertos), del cajón con un café y del envío y el resumen del pedido. Entran ahí las páginas legales, el pie (`<address>` lleva `not-italic`) y las citas (`.quote` es Fraunces) |
| 3 | `361eef4` · «Ver los cafés» del cajón vacío | ✅ | A 360 y 1.280 px, con clic y con Enter: `href="/cafes/"`, llega a `/cafes/` y el diálogo desaparece. Las tarjetas quedan visibles y no queda ningún `[inert]` |
| 4 | `6520ae3` · «Cómo calculamos el envío» → `#tarifas-por-zona` | ✅ | Desde el cajón y desde el envío y el resumen del pedido, a 360 y 1.440 px, y cargando la URL directamente. El cajón se cierra. El título «Tarifas por zona y municipios de cada zona» queda en `top` 96 px, bajo el encabezado fijo (`bottom` 75 px) y entero en la ventana. Área de clic: 45 px de alto (15 px del texto más `::before` de ±15 px); se mantiene QA-026. Capturas `docs/qa/capturas/2026-11-19-ancla-tarifas-{cajon,resumen}-{360,1440}.png` |
| 4b | Selector de `e2e/envios.spec.ts:258` | ✅ correcto | Busca `a[href="/envios/#tarifas-por-zona"]` con el texto, en el paso de envío, que es donde el enlace aparece. El `.first()` podría esconder un duplicado: mi prueba exige exactamente 1 en `main`, tanto en el envío como en el resumen. La línea siguiente (`nota-precio-total` → `/envios/`) es otro enlace y no cambió |
| 5 | `bfc3f46` · un solo anuncio en la ficha | ✅ | En `<main>` hay una sola región viva (`data-testid="anuncio-compra"`, `sr-only`, `aria-live="polite"`), y ni el precio ni la cantidad visibles están dentro de otra. El texto sigue cada cambio: «1 bolsa de 250 g, grano: $30.000» → «2 bolsas de 250 g, grano: $60.000» → «2 bolsas de 500 g, grano: $94.000» → «…, molido: $94.000» → «1 bolsa de 500 g, molido: $47.000». Un `MutationObserver` ve un solo texto por acción, sin vaciados intermedios. Lo visible no cambia («1 × 500 g · molido») |
| 6 | `66ee813` · `aria-required` | ✅ | Con Santander/Bucaramanga elegidos, solo `nombre`, `celular`, `departamento`, `municipio` y `direccion` llevan `aria-required="true"`. Ningún campo lleva `required` y el formulario es `noValidate`. Todos los demás campos visibles (correo, tipo y número de documento, código postal, barrio, comuna, indicaciones) dicen «(opcional)» en su etiqueta, y ningún obligatorio lo dice. Con el formulario vacío sale la alerta propia «datos por corregir», el foco va a «Nombre completo» y el campo queda con `aria-invalid` y `aria-required` |
| 7 | QA-017 | ✅ **Cerrado** | Ver «QA-017» |
| — | axe a 360/1.280 px, claro y oscuro | ✅ | Las 16 combinaciones de `qa-2026-11-18-ux-media.spec.ts` y las 4 nuevas (ficha después de cambiar la cantidad, cajón vacío, `/envios/#tarifas-por-zona` y formulario con errores) pasan sin violaciones serias ni críticas. En oscuro se mide `<main>`, con el mismo criterio de las rondas anteriores: el sitio no tiene tema oscuro de página y el encabezado fija `data-theme="light"`. Si se fuerza `data-theme="dark"` en `<html>`, axe marca el logotipo del encabezado; es un efecto de la simulación, no un defecto |
| — | basePath | ✅ | `basepath.spec.ts` pasa contra 4303 |

## QA-017 — Cerrado

- La prueba de cierre (`qa-2026-11-14-paquete-abogado.spec.ts` › «QA-017…») pasa: ningún `aria-label` de `/`, `/cafes/`, `/provincias/guanenta/` ni `/provincias/soto/` dice «grano entero» ni «molienda».
- Prueba nueva: todos los «Agregar» siguen la forma `Agregar Café …, N g, al pedido`. Después del clic, el aviso dice la presentación que realmente se guardó en `localStorage` («Agregaste Café Casa Martínez: 250 g, grano.»).
- **¿Debe el nombre accesible llevar la presentación? No.** El nombre ya no afirma ninguna presentación, así que no puede contradecir la que se agrega (la segunda mitad de lo que pedía QA-017). La presentación se anuncia en el aviso inmediato (`role=status`), igual para quien ve y para quien usa lector de pantalla, y se cambia en el pedido. Agregarla al nombre obligaría a calcular `cafe.moliendas[0]` en el botón y alargaría el nombre sin ganar nada. No se abre defecto.
- **Observación O-2 (no es defecto):** PRODUCT.md (decisión del 2026-11-04) dice que «Agregar» de la tarjeta añade «primer tamaño disponible, grano entero». El código usa `cafe.moliendas[0]`, es decir, el orden de la columna `moliendas` del CSV. Hoy los dos cafés tienen `grano|molido` y `data/LEEME.md` documenta ese orden, así que el resultado es grano. Si alguien escribiera `molido|grano`, la tarjeta agregaría molido sin dejar de cumplir LEEME al pie de la letra. Para el desarrollador: preferir `grano` cuando exista, o que `npm run datos` normalice o rechace el orden.

## Pruebas ajustadas (solo pruebas; no ocultan defectos)

1. **`qa-2026-11-14-paquete-abogado.spec.ts:271`** («flujo desde la ficha… sin datos en URL»): la expresión `/…|300|…/` encontraba el «300» del puerto 4300 en `http://localhost:4300/…`. Daba un falso positivo con cualquier `E2E_PUERTO` que contenga «300». Ahora compara la URL sin el origen. La comprobación de datos personales en la ruta y la consulta no cambia.
2. **`qa-2026-11-18-cierre-media.spec.ts`**, «a 1.280 px la tabla se ve igual que en main»: debía dejar de pasar a propósito con `f310098`, y así fue. Ahora se llama «…es la de main con whitespace-nowrap en escalones y precios, y la caja conserva el ancho (QA-028)» y exige cuatro cosas: (a) `main` no trae el arreglo; (b) HEAD lo trae exactamente en 3 rótulos y 3 × 7 precios; (c) la única diferencia de marcado es esa clase (el `whitespace-nowrap` del rótulo «Zona n» ya existía en `main`); (d) la región mide lo mismo de ancho. La comparación píxel a píxel se retira, porque ahora tiene que ser distinta. La tabla pasa de 961 a 1.021 px de alto porque «Cubre» parte más renglones. Es lo esperado y se acepta.
3. **`qa-2026-11-18-ux-a2-m9.spec.ts`**, «1.280 px: escritorio igual que main 8162ccf»: no se había corrido desde que existe M1 (se omite sin `E2E_MAIN_URL`). Las cajas de la ficha coinciden con `main` (±1 px), pero la página mide 52 px más. El pie pasó de 465 a 517 px por `ec4b442` (M1, objetivos de 44 px), a propósito. La prueba ahora compara el alto de la página sin el pie.

## Defectos

| ID | Severidad | Área | Título | Responsable | Estado |
|---|---|---|---|---|---|
| QA-029 | Baja | Estilos / marca | Las clases de `marca.css` y `componentes.css` anulan las utilidades de peso y tamaño de Tailwind (`font-bold`, `font-semibold`, `text-sm`) | disenador-marca → desarrollador-fullstack | Abierto |
| QA-028 | Media | `/envios/` (D3) | Tabla de tarifas partida desde `lg` | desarrollador-fullstack | **Cerrado** |
| QA-017 | Baja | Accesibilidad | Nombre accesible de «Agregar» con «grano entero» | desarrollador-fullstack | **Cerrado** |

### QA-029 — Las clases de `marca.css` y `componentes.css` anulan las utilidades de peso y tamaño de Tailwind
- **Severidad:** Baja. No afecta datos, contraste ni función, pero la jerarquía tipográfica que pide el marcado no se cumple. En `/envios/`, el título del bloque de tarifas y los «Zona n» de las tarjetas (el rótulo de zona que se ve bajo `lg`, M8) salen en peso 400, como el texto corrido.
- **Entorno:** Chromium, 360 × 900 y 1.280 × 900, `feat/ux-auditoria` `1a10a07`. Parte ya estaba en `main` `8162ccf` (chips, píldoras de la ficha y el `h3` de `/envios/`); los enlaces de la navegación (M3), los `h4` y `summary` de las tarjetas (M8) y «Por cotizar» de la tarjeta son de esta rama.
- **Causa probable:** `src/app/globals.css` importa `marca.css` y `componentes.css` sin capa después de `@import "tailwindcss"`. Las reglas fuera de capa ganan a `@layer utilities`, así que `.body` (400), `.small` (500) y `.ds-tag` (500, 12 px) pisan `font-bold`, `font-semibold` y `text-sm`.
- **Pasos para reproducir:**
  1. Abrir `/envios/` a 360 px.
  2. Inspeccionar «Tarifas por zona y municipios de cada zona» (`h3.body.font-bold`) y «Zona 1» (`h4.body.font-bold`).
  3. Abrir `/` e inspeccionar «Mapa» en la navegación (`a.small.font-semibold`) y un chip de filtro (`button.ds-tag.text-sm.font-semibold`).
- **Esperado:** el peso y el tamaño que pide la utilidad (700, 600, 14 px), o que el marcado no pida lo que no se va a pintar. Qué peso es el correcto en chips y píldoras lo decide `disenador-marca`: hoy se ven en 500 y 12 px desde `main`.
- **Obtenido:** 39 elementos en `/`, la ficha y `/envios/` (por ancho), por ejemplo `font-bold → 400: <h3> «Tarifas por zona y municipios…»`, `font-bold → 400: <h4> «Zona 1»`, `font-bold → 500: <summary> «Qué cubre la zona 3»`, `font-semibold → 500: <a> «Mapa»` y `font-semibold → 500: <button> «Guanentá»`. Los chips con `text-sm` se pintan a 12 px.
- **Evidencia:** `e2e/qa-2026-11-19-cierre-baja.spec.ts` › «QA-029: a 360 px / a 1280 px toda utilidad font-(peso) se pinta con su peso en /, ficha y /envios/» falla con la lista completa. Traza: `test-results/qa-2026-11-19-cierre-baja--*-QA-029*/trace.zip`. Captura `docs/qa/capturas/2026-11-19-ancla-tarifas-cajon-360.png` (título y «Zona 1» sin negrita).
- **Prueba de cierre:** esa misma prueba, a 360 y 1.280 px. Si la decisión de diseño es que chips o píldoras sigan en 500, se quita la utilidad del marcado y la prueba pasa igual.
- **Responsable sugerido:** `disenador-marca` (pesos y tamaños correctos de chips, píldoras, navegación y rótulos de zona) → `desarrollador-fullstack` (capas de CSS o marcado).

## Observaciones

- **O-2:** ver «QA-017» (orden de `moliendas` y «Agregar» de la tarjeta).
- **O-3:** la 404 no precarga fuentes. Es el comportamiento de Next para `not-found`, no un defecto. La prueba lo documenta (0 precargas en `/404/`, 3 en el resto).
- **Riesgo QA-018:** quedan 385 B de margen.

## Paridad v1

Sin cambios respecto a la ronda `2026-11-18-cierre-media.md`. Esta ronda no toca funciones de `docs/INVENTARIO-V1.md`.

## Cobertura

- `src/domain/`: 99,66 % sentencias, 96,72 % ramas, 99,84 % líneas (≥ 90 %).
- E2E nuevas en `e2e/qa-2026-11-19-cierre-baja.spec.ts` (21 pruebas): fuentes (3), cajón vacío (2), ancla de tarifas (6), anuncio de la ficha (2), `aria-required` (1), QA-017 (1), axe (4) y QA-029 (2, fallan a propósito).
