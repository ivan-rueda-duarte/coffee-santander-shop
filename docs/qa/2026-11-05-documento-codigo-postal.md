# Ronda QA — Documento opcional y código postal — 2026-11-05

Rama `feat/documento-codigo-postal`. Ronda inicial en HEAD `0c6b60a`; verificaciones en `a65664c`, `88219ba` y `499d17a`. Chromium contra `out/` servido con `serve` (puerto 4173 de `npm run e2e`; el `npm run dev` del 3000 no se tocó).

## Comandos ejecutados
| Comando | Resultado |
|---|---|
| `npm run lint` | pasa |
| `npm run typecheck` | pasa |
| `npm test` | pasa: 19 archivos, 327 pruebas |
| `npm run datos` | pasa (2 avisos conocidos: SCA sin verificar, nota "Afrutado") |
| `npm run build` | pasa (lo ejecuta el webServer de e2e) |
| `npm run e2e` (antes de mis pruebas) | 46 pasan, 0 fallan (incluye la prueba del desarrollador de documento/código postal) |
| `e2e/documento-postal.spec.ts` (nuevo) | 17 pasan |
| Palabras prohibidas en `out/` | 0 coincidencias |
| Secretos en `out/` | 0 coincidencias |
| `rg "Cédula" src` | solo opciones del selector («Cédula de ciudadanía/extranjería») y una prueba negativa; en `out/` solo el chunk JS con esas opciones |

Nota: `npm run e2e` regenera `docs/qa/capturas/*.png` (pruebas de envíos); restauré con `git checkout` las 8 que quedaron con diferencias espurias. Solo se añaden `documento-postal-errores-320.png` y `-360.png`.

## Ronda de verificación (HEAD a65664c)
| Comando | Resultado |
|---|---|
| `GITHUB_PAGES=true npm run build` + `out/` servido bajo `/coffee-santander-shop/` (puerto 4180) | `E2E_BASEPATH_URL=http://localhost:4180 npx playwright test e2e/basepath.spec.ts`: pasa. Los 4 enlaces (envíos, envíos-devoluciones, privacidad, términos) tienen `href` con prefijo, `target=_blank`, `rel` con noopener y noreferrer, y responden 200; ningún `<a href="/…">` sin prefijo en `main` |
| ESLint con `<a href="/x/">` en un .tsx temporal (borrado) | falla con `no-restricted-syntax` (mensaje QA-003) |
| `e2e/select-documento.spec.ts` (nuevo) | PPT a 320, 360 y 700 px: texto completo, sin desborde, axe 0 serias/críticas; teclado (flechas, Tab) OK; capturas `ppt-320.png`, `ppt-360.png`. Falla solo la prueba de QA-004 |
| `npm run lint` / `npm run typecheck` / `npm test` | pasan (npm test sin cambios: 327 pruebas) |
| `npm run build` normal (`out/` final sin `GITHUB_PAGES`) | pasa; `out/pedido/index.html` sin el prefijo |
| `npm run e2e` | 67 pasan, 1 omitida (basepath, requiere variable), 1 falla (QA-004, esperada) |

Capturas espurias restauradas con `git checkout`. El `npm run dev` del 3000 no se tocó.

## Ronda de verificación 2 (HEAD 88219ba: commits 034130b QA-004 y 88219ba D2)
| Comando | Resultado |
|---|---|
| `npm run lint` | pasa (también con los specs nuevos) |
| `npm run typecheck` / `npx tsc --noEmit` | pasan |
| `npm test` | pasa: 19 archivos, 327 pruebas (sin cambios en dominio) |
| `GITHUB_PAGES=true npm run build` + copia de `out/` servida bajo `/coffee-santander-shop/` (puerto 4180, luego cerrado) | `E2E_BASEPATH_URL=http://localhost:4180 npx playwright test e2e/basepath.spec.ts`: 1/1 pasa. Añadí al spec la casilla D2: nombre accesible exacto y `href="/coffee-santander-shop/legal/privacidad/"` y `/legal/terminos/` |
| `npm run build` normal (`out/` final sin `GITHUB_PAGES`) | pasa; `out/pedido/index.html` sin prefijo (0 coincidencias) |
| `npm run e2e` (build normal, 4173) | 74 pasan, 1 omitida (basepath sin variable), 4 fallan: 2 por un falso positivo de mi patrón de terceros en `autorizacion-datos.spec.ts` (`env[ií]a` casaba con «se envía por WhatsApp»; corregido) y 2 del defecto nuevo QA-005 |
| Repetición tras corregir el patrón (`autorizacion-datos`, `select-documento`, `pedido`, contra el mismo `out/`) | 20 pasan, 2 fallan (QA-005, esperadas) |
| Palabras prohibidas en `out/` | 0 coincidencias |
| Secretos en `out/` | 0 coincidencias |

Capturas espurias (8 de envíos) restauradas con `git checkout`. Nuevas, sin rastrear: `autorizacion-datos-320.png`, `autorizacion-datos-360.png`, `qa-005-departamento-320.png`, `qa-005-departamento-360.png` (además de las 4 de rondas anteriores). El `npm run dev` del 3000 no se tocó; `docs/legal/` y `docs/PENDIENTES.md` sin tocar.

### QA-004: verificación
- `e2e/select-documento.spec.ts` ahora prueba a 320 y 360 px: sin departamento el select deshabilitado muestra «Elige el departamento» (180 px necesarios; 224 px útiles a 320, 264 a 360) y, con Cundinamarca elegido, el municipio más largo del país («Villa de San Diego de Ubaté», 27 caracteres) cabe: 222 px frente a 224 a 320 px (margen de 2 px; cabe) y 264 a 360. Sin desborde horizontal, axe 0 serias/críticas con el nombre largo elegido. 4/4 pasan.
- Accesibilidad del cambio de texto: la opción vacía sigue siendo la seleccionada del `<select disabled>` con `label` «Municipio»; el select «Departamento» usa la misma frase «Elige el departamento» en su propia opción vacía, lo que es coherente. axe sin violaciones.
- **Cerrado.**

### D2: casilla de autorización de datos (microcopy §4.3 v0.4) y de términos (§5.1)
Prueba nueva `e2e/autorizacion-datos.spec.ts` (5 pruebas, pasan), a 320 y 360 px en `/pedido/` paso resumen:
- Nombre accesible de la casilla exactamente «Autorizo a De Santander SAS a tratar mis datos personales para gestionar este pedido: confirmarlo, coordinar la entrega con la transportadora o el mensajero y, si escribí mi documento, emitir la factura a mi nombre. Entiendo que el pedido se envía por WhatsApp (Meta), que puede tratar mis datos fuera de Colombia. Más en la política de tratamiento de datos.» (razón social leída de `data/config.csv`, sin `TODO`). Casilla de términos: «Acepto los términos y condiciones.».
- Ambas sin premarcar; dos `<input type="checkbox">` distintos dentro del `fieldset` «Autorizaciones»; marcar términos no marca autorización y viceversa.
- Enlaces «política de tratamiento de datos» → `/legal/privacidad/` y «términos y condiciones» → `/legal/terminos/`, `target="_blank"`, `rel` con noopener y noreferrer; bajo `basePath` llevan el prefijo (`e2e/basepath.spec.ts`).
- Error exacto «Debes autorizar el tratamiento de tus datos para continuar.» y «Debes aceptar los términos para continuar.»; el botón no avanza hasta marcar las dos; `aria-describedby` apunta a cada error (`e-aut`, `e-ter`).
- Terceros: en el texto de las casillas solo aparece «WhatsApp (Meta)»; ninguna transportadora, pasarela ni red social (patrón en el spec).
- axe 0 serias/críticas con el error visible, sin desborde horizontal; teclado: Espacio marca, Tab recorre casilla → enlace → casilla.
- Capturas: `docs/qa/capturas/autorizacion-datos-320.png` y `-360.png` (el encabezado repetido a mitad de la captura es el artefacto de `fullPage` con cabecera pegajosa, no un defecto).
- Observación: `e2e/pedido.spec.ts` (del desarrollador) ya comprobaba el nombre accesible en 1440 px; con esta prueba queda también en móvil.
- **Verificado.**

## Ronda de verificación 3 (HEAD 499d17a: commits c1e4f62 QA-005, fa5ac54 D5, 499d17a D6)
| Comando | Resultado |
|---|---|
| `npm run lint` | pasa (incluye los 3 specs nuevos/ampliados) |
| `npm run typecheck` | pasa |
| `npm test` | pasa: 19 archivos, 327 pruebas (sin cambios en dominio) |
| `npm run datos` | pasa (2 avisos conocidos: SCA sin verificar, nota «Afrutado») |
| `GITHUB_PAGES=true npm run build` + copia de `out/` servida bajo `/coffee-santander-shop/` (puerto 4180, luego cerrado) | `E2E_BASEPATH_URL=http://localhost:4180 npx playwright test e2e/basepath.spec.ts`: 3/3 pasan (QA-003/D2 + D5 bajo prefijo; `/envios/` con D6 y 0 recursos con 4xx/5xx; QA-005 con San Andrés a 320 px) |
| `npm run build` normal (`out/` final sin `GITHUB_PAGES`) | pasa; `out/pedido/index.html` con 0 apariciones del prefijo |
| `npx playwright test` (suite completa contra `out/` en 4173) | 100 pasan, 3 omitidas (basepath sin variable), 1 falla por una expectativa mía errónea (el nombre accesible de «Tipo de documento» incluye «(opcional)», correcto); corregida la prueba: `select-superpuesto` + `legal-resumen-envios` 22/22 |
| `rg -n "retracto" src` | 4 líneas: título del enlace del pie (`pie.tsx:11`), título del enlace legal en el resumen (`flujo-pedido.tsx:242`), el aviso D5 (`flujo-pedido.tsx:244`) y el título de la página legal (`legal/[slug]/page.tsx:27`) |
| `rg -i "retracto" out` | en todas las páginas solo «Envíos, devoluciones y retracto» (enlace del pie); en `/legal/envios-devoluciones/` además su título/migas/`<title>`; el texto del aviso solo en el chunk JS de `/pedido/`. Ninguna otra frase |
| `rg -i "Máximo:? ?[0-9]+ días hábiles\|destino no aparece" out` | 0 coincidencias |
| Palabras prohibidas en `out/` | 0 coincidencias |
| Secretos en `out/` | 0 coincidencias |

Capturas: regeneradas y conservadas `envios-pagina-{360,1440}.png` (línea de 30 días y pregunta de zona 5) y `resumen-{bogota,leticia}-{360,1440}.png` (aviso de retracto). Restauradas con `git checkout` las 4 `envio-{bogota,leticia}-*.png` según lo indicado; nota: su diferencia no es ruido (la versión rastreada es anterior a los campos de documento y código postal de esta rama: 2.634 → 2.898 px de alto a 360, y ahora también muestran el select nuevo); conviene regenerarlas en el commit que cierre la rama. Nuevas sin rastrear: `resumen-retracto-{320,360,1440}.png`; `qa-005-departamento-{320,360}.png` ahora muestran la corrección. El `npm run dev` del 3000 no se tocó; los servidores 4173 y 4180 que levanté quedaron cerrados; `docs/legal/`, `docs/PENDIENTES.md` y `src/` sin tocar.

### QA-005: verificación (`e2e/select-superpuesto.spec.ts`, 10 pruebas; `e2e/select-documento.spec.ts`, 10/10)
- San Andrés elegido a 320, 360, 768 y 1440 px: el `<span aria-hidden>` pinta «Archipiélago de San Andrés, Providencia y Santa Catalina» completo (tres líneas a 320/360, dos a 768/1440), `scrollWidth ≤ clientWidth`, sin desborde de página, y la caja del `<select>` cubre toda la altura del texto (clic en cualquier línea abre la lista). Municipio se habilita, «Providencia» se refleja. axe 0 serias/críticas en los cuatro. Captura `qa-005-departamento-320.png`.
- Deshabilitado: Municipio sin departamento pinta texto y flecha en `--ink-muted` (#5f554c) sobre `--surface-raised` (#fffcf6): 7,09:1 (axe no evalúa controles deshabilitados; lo medí en la prueba). Al elegir departamento vuelve a `--ink` (#24170f), igual que Departamento y Tipo de documento.
- Lector: los tres controles siguen siendo `<select>` con rol `combobox` y nombres «Tipo de documento (opcional)», «Departamento», «Municipio»; el span lleva `aria-hidden="true"`, el nombre del departamento aparece una sola vez en el árbol de accesibilidad (`ariaSnapshot`), sin duplicado.
- Teclado: foco en el select (no en el span), flechas cambian valor y span; escribir «Arc» salta a San Andrés; Esc no borra; Tab Departamento → Municipio (recién habilitado) y Tipo de documento → Número de documento.
- `forced-colors: active`: el span pasa a `display: none` y el texto nativo del select deja de ser transparente en los tres campos; sin colores forzados el select es `color: transparent`, `appearance: none`, opciones en tinta.
- Autocompletado: `autocomplete="address-level1"`/`"address-level2"`, `name` correctos, Tipo de documento `off`. Simulado como lo hace el navegador (`.value` + `input`/`change`): el span refleja el valor, Municipio se habilita; un valor que no existe en la lista deja el select vacío y el span con «Elige el departamento» (sin texto fantasma). El resumen muestra «Providencia, Archipiélago de San Andrés, Providencia y Santa Catalina».
- QA-002 (PPT ×4) y QA-004 (×4) siguen pasando en `select-documento.spec.ts`.
- **Cerrado** (verificado en HEAD 499d17a, commit c1e4f62).

### D5: aviso de exclusión del retracto (LEG-064, microcopy §5.3) — `e2e/legal-resumen-envios.spec.ts` (9 pruebas)
- `data-testid="aviso-retracto"` único, visible, con el texto exacto «El café es un alimento: no admite retracto. Si llega dañado o equivocado, te respondemos con la garantía.» a 320, 360 y 1440 px, con tarifa (Bucaramanga) y por cotizar (Leticia zona 5 y 11 × 500 g por peso). Está después del total y antes del grupo «Autorizaciones». axe 0 serias/críticas, sin desborde. Capturas `resumen-retracto-{320,360,1440}.png`.
- No está en la ficha, el cajón «Tu pedido», el carrito, el paso de envío ni la confirmación, ni en el mensaje de WhatsApp; en inicio y catálogo «retracto» solo como nombre del enlace del pie a `/legal/envios-devoluciones/`.
- Bajo `basePath` también (`basepath.spec.ts`).
- **Verificado.**

### D6: /envios/ (LEG-068, microcopy §5.8) — `e2e/legal-resumen-envios.spec.ts` (3 pruebas) + prueba D6 del desarrollador en `envios.spec.ts`
- `data-testid="plazo-legal"` único con «Si no publicamos un plazo máximo para tu zona, entregamos en máximo 30 días calendario, como manda la ley.», después de la lista de zonas y antes del h2 «Si no hay reparto a domicilio»; el h2 anterior es «Plazos orientativos».
- Pregunta «¿Tu destino es de zona 5 o pides más de 5 kg?» (una vez); «¿Tu destino no aparece» y «Máximo N días hábiles» ausentes en todo el `body`; los cinco plazos orientativos y «Son una referencia, no una fecha de entrega» siguen; botón «Escribir por WhatsApp» → `https://wa.me/573001129874`. A 320/360/1440: axe 0 serias/críticas, sin desborde (la tabla sigue en su región desplazable enfocable, QA-001). Captura `envios-pagina-360.png`.
- Bajo `basePath` también, sin recursos fallidos.
- **Verificado.**

## Veredicto final: APTO
QA-002, QA-003, QA-004 y QA-005 cerrados; D2, D5 y D6 verificados. Sin defectos abiertos en la rama. Observación menor (no defecto): las capturas `envio-*` rastreadas están desactualizadas respecto a la rama (ver nota de capturas).

## Resumen de la rama `feat/documento-codigo-postal` (HEAD 499d17a)
| ID | Severidad | Título | Commit de corrección | Estado |
|---|---|---|---|---|
| QA-001 | Alta | Tabla de `/envios/` desplazable sin foco de teclado a 360 px (reporte `2026-11-05-envios.md`, rama `feat/envios-zonas`) | cdc1f28 (antes de esta rama) | Cerrado: `role="region"`, `aria-label`, `tabIndex={0}`; su prueba criterio (`envios.spec.ts` › «accesibilidad y capturas a 360 px › /envios/») pasa en esta ronda |
| QA-002 | Baja | Selector «PPT» cortado a 320 px | a65664c | Cerrado (ronda 1) |
| QA-003 | Media | Enlaces `<a href="/…">` sin `basePath` | 37c438d | Cerrado (ronda 1; regla ESLint y `basepath.spec.ts`) |
| QA-004 | Baja | Select «Municipio» cortado a 320 px | 034130b | Cerrado (ronda 2) |
| QA-005 | Baja | Select «Departamento» cortado con San Andrés | c1e4f62 | Cerrado (ronda 3) |

Decisiones legales verificadas en la rama: D2 (casillas §4.3/§5.1, 88219ba), D5 (retracto §5.3, fa5ac54), D6 (plazo legal §5.8, 499d17a). Pruebas e2e totales: 104 (101 en la suite normal + 3 de basePath con variable).

## Defectos
| ID | Severidad | Área | Título | Responsable | Estado |
|---|---|---|---|---|---|
| QA-002 | Baja | Visual | El selector «Permiso por Protección Temporal (PPT)» se corta a 320 px | disenador-marca / desarrollador-fullstack | Cerrado (verificado, HEAD a65664c) |
| QA-003 | Media | Funcional | Enlaces `<a href="/...">` crudos ignoran el `basePath` de GitHub Pages | desarrollador-fullstack | Cerrado (verificado, HEAD a65664c) |
| QA-004 | Baja | Visual | El select «Municipio» corta «Primero elige el departamento» a 320 px | desarrollador-fullstack | Cerrado (verificado, HEAD 88219ba) |
| QA-005 | Baja | Visual | El select «Departamento» corta «Archipiélago de San Andrés, Providencia y Santa Catalina» en todos los viewports | desarrollador-fullstack | Cerrado (verificado, HEAD 499d17a) |

### QA-002 — Selector de tipo de documento truncado a 320 px
- Severidad: Baja
- Entorno: Chromium, 320 × 740 (y 360), commit 0c6b60a
- Pasos: 1. Carrito con un café → `/pedido/?paso=envio`. 2. Elegir «Permiso por Protección Temporal (PPT)».
- Esperado: texto legible completo o abreviado con sentido.
- Obtenido: el valor se ve «Permiso por Protección Temp▾» (corte sin elipsis). Sin desborde de página ni de columna; axe sin violaciones. Es solo estético: el nombre completo sigue en la lista desplegable.
- Evidencia: `docs/qa/capturas/documento-postal-errores-320.png`. La prueba `paso de envío a 320 px › con errores…` pasa (verifica caja dentro de la ventana); no automatizo el corte porque es visual.
- Sugerencia: reducir el relleno/tamaño del `select` en móvil o mostrar «PPT» como valor seleccionado.
- Estado: Cerrado (verificado en HEAD a65664c, ronda 1). Commit `a65664c`.
- Causa raíz: un `<select>` nativo no parte líneas; «Permiso por Protección Temporal (PPT)» mide ≈310 px a 16 px y el campo tiene ≈280 px a 320. Bajar la letra no bastaba (≈278 px a 14 px) y por debajo de 16 px iOS hace zoom al enfocar. Corrección: el texto visible lo pinta un `<span aria-hidden>` en la misma celda de la rejilla, que parte en dos líneas y da la altura; el `select` (sin apariencia nativa, flecha `IconoChevron`) conserva valor, foco y nombre accesible. Textos de la opción sin cambios (microcopy §4.1).

### QA-003 — Enlaces sin `basePath`
- Severidad: Media (solo se manifiesta en GitHub Pages; por inspección de código, no reproducido con `GITHUB_PAGES=true`)
- Evidencia: `src/ui/componentes/checkout/flujo-pedido.tsx` usa `<a href="/legal/privacidad/" target="_blank">` (casilla de autorización, nueva en esta rama), `href="/envios/"` y `href="/legal/envios-devoluciones/"` (línea 241). A diferencia de `Link`/`BotonEnlace`, un `<a>` crudo no antepone `/{repo}`, por lo que en producción darían 404. Pasa en local porque `basePath` es vacío.
- Esperado: enlaces que respetan `basePath` (CLAUDE.md: «funciona con basePath»).
- Prueba criterio de cierre: construir con `GITHUB_PAGES=true` y verificar que el `href` de esos enlaces empiece por `/{repo}/`. Aún no existe automatizada (requiere un build adicional).
- Estado: Cerrado (verificado en HEAD a65664c, ronda 1). Commit `37c438d`.
- Causa raíz: el resumen del pedido usaba `<a href="/…">` crudos (envíos, envíos-devoluciones, privacidad y también términos), que no anteponen el `basePath`; ahora son `Link` de `next/link`. Era el único archivo con el patrón en `src/`. Nueva regla ESLint (`no-restricted-syntax`, `src/**/*.tsx`) rechaza `<a href="/…">` internos (literal o plantilla). Verificado: `GITHUB_PAGES=true npm run build`, `out/` servido bajo `/coffee-santander-shop/`, paso resumen: los 5 enlaces internos salen con `/coffee-santander-shop/…` y responden 200.

### QA-004 — Select «Municipio» recortado a 320 px
- Severidad: Baja
- Entorno: Chromium, 320 × 740, HEAD a65664c
- Pasos: 1. Carrito con un café → `/pedido/?paso=envio` a 320 px. 2. Mirar «Municipio» sin elegir departamento.
- Esperado: texto completo («Primero elige el departamento»).
- Obtenido: «Primero elige el departament▾»; el texto necesita 247 px y quedan ≈224 px tras la flecha nativa. A 360 px cabe. No bloquea: tras elegir departamento el campo funciona.
- Evidencia: prueba `e2e/select-documento.spec.ts` «QA-004…» (falla) y captura de la verificación. Criterio de cierre: esa prueba pasa.
- Sugerencia: acortar el texto («Elige primero el departamento» no basta; p. ej. «Elige el departamento») o reutilizar el patrón del span de QA-002.
- Estado: **Cerrado** (verificado en HEAD 88219ba, ronda 2). Commit `034130b`.
- Causa raíz: «Primero elige el departamento» mide ≈247 px a 16 px y el `select` nativo deja ≈224 px útiles a 320 px. Se acortó la opción vacía del campo deshabilitado a «Elige el departamento» (≈180 px; «Elige antes el departamento» medía 229 px y tampoco cabía). Texto visible cambiado con el mismo sentido; «Elige el municipio» (con departamento elegido) no cambia. `e2e/select-documento.spec.ts`: 5/5.
- Verificación QA: 180 px necesarios frente a 224 (320 px) y 264 (360 px) útiles; el municipio más largo del país elegido («Villa de San Diego de Ubaté») también cabe (222 px frente a 224 a 320 px); axe limpio. Las 4 pruebas «QA-004: …» de `e2e/select-documento.spec.ts` pasan.

### QA-005 — Select «Departamento» recortado con el nombre de San Andrés
- Severidad: Baja (estético; afecta solo a un departamento de 33; el nombre completo se ve en la lista desplegable y en el bloque «Envío a» del resumen)
- Entorno: Chromium, 320 × 740, 360 × 740, 768 × 900 y 1440 × 900, rama `feat/documento-codigo-postal`, HEAD 88219ba
- Pasos para reproducir: 1. Carrito con un café → `/pedido/?paso=envio`. 2. En «Departamento» elegir «Archipiélago de San Andrés, Providencia y Santa Catalina».
- Resultado esperado: nombre legible completo o abreviado con sentido (como se hizo para el PPT en QA-002).
- Resultado obtenido: «Archipiélago de San Andrés, P▾» (corte sin elipsis). El texto necesita 452 px; el `select` nativo deja 224 px útiles a 320, 264 a 360 y 270 a 768/1440 (el campo tiene ancho máximo), así que se corta en todos los viewports. Sin desborde de página; axe sin violaciones.
- Evidencia: `docs/qa/capturas/qa-005-departamento-320.png` y `qa-005-departamento-360.png`; pruebas «QA-005: select Departamento a 320/360 px …» en `e2e/select-documento.spec.ts` (fallan); trazas en `test-results/select-documento-QA-005-*/trace.zip`. A 768 y 1440 medido con un script de Playwright (necesita 452, disponible 270).
- Sugerencia: reutilizar el patrón del `<span aria-hidden>` de QA-002 para el select de departamento (parte en dos líneas), o un nombre corto en la opción (p. ej. «San Andrés y Providencia») conservando el oficial en el resumen y el mensaje; lo decide el desarrollador con el diseñador.
- Responsable sugerido: desarrollador-fullstack (con `disenador-marca` si cambia el patrón del campo)
- Criterio de cierre: las dos pruebas «QA-005» pasan.
- Estado: **Cerrado** (verificado en HEAD 499d17a, ronda 3; detalle en «QA-005: verificación»). Commit `c1e4f62`.
- Causa raíz: la misma de QA-002: un `<select>` nativo no parte líneas y el nombre (≈452 px) no cabe en 224–270 px en ningún viewport. Corrección: el patrón del `<span aria-hidden>` se extrajo a un componente `SelectSuperpuesto` (`formulario-envio.tsx`) y se aplica de forma consistente a Tipo de documento, Departamento y Municipio; el nombre completo se conserva en la opción, en «Envío a» y en el mensaje de WhatsApp. Con el select deshabilitado (Municipio sin departamento) el texto y la flecha van en gris. `e2e/select-documento.spec.ts`: 10/10 (QA-002 ×4, QA-004 ×4, QA-005 ×2); suite completa 79 pasan, 1 omitida (basepath sin variable).

## Casos LEG-040..048 (verificados con e2e)
- Sin casillas premarcadas; autorización y términos independientes: OK.
- Pedido sin documento ni código postal pasa, sin errores; etiquetas «(opcional)»: OK.
- Tipo sin número: se ignora y pasa: OK.
- Número sin tipo → «Elige el tipo de documento.»: OK.
- CC: rechaza letras, 11 dígitos y 2 dígitos; «1.098.765.432» → `1098765432`: OK.
- CE/PPT/PAS: 3–20 alfanuméricos; rechazan `#`, `$`, Ñ y 2 caracteres; normaliza guiones/puntos/mayúsculas; sigla «Pasaporte» en mensaje: OK.
- Código postal: rechaza 5 dígitos, letras y prefijo ajeno (110111, 050001 en Santander); acepta 680001; Bogotá acepta 11xxxx y rechaza 68xxxx; el enlace al visor sigue visible junto al error: OK. Los campos limitan 20 y 6 caracteres (el exceso se recorta en silencio al pegar; observación menor de UX, no defecto).
- Visor: `https://visor.codigopostal.gov.co/472/visor/`, `target=_blank`, `rel="noopener noreferrer"`: OK.
- Mensaje de WhatsApp: líneas «Documento:» y «Código postal:» solo si se escribieron; ningún «Cédula:»: OK.
- `localStorage`/`sessionStorage`/URL sin documento ni código postal, tras volver y recargar: OK.
- axe (serio/crítico) en envío vacío, con errores, y resumen a 320 y 360 px: 0 violaciones. Sin desborde horizontal en envío, resumen y confirmación a 320/360: OK.
- Regresión flujo completo (carrito → envío → resumen → confirmación → wa.me, zonas, por cotizar, > 5 kg): las 46 pruebas previas pasan.

## Paridad v1
Sin cambios respecto a la ronda anterior. La v1 pedía «Cédula» libre; ahora es tipo + número opcionales (⚠️ distinta, por decisión LEG-040).

## Cobertura
Nueva en la rama: `e2e/documento-postal.spec.ts` (17 pruebas), `e2e/select-documento.spec.ts` (10: PPT ×4, QA-004 ×4, QA-005 ×2), `e2e/select-superpuesto.spec.ts` (10: QA-005 en 4 viewports, deshabilitado/contraste, lector, teclado, colores forzados ×2, autocompletado), `e2e/autorizacion-datos.spec.ts` (5), `e2e/legal-resumen-envios.spec.ts` (12: D5 ×9, D6 ×3), `e2e/basepath.spec.ts` (3, requiere `E2E_BASEPATH_URL`). Dominio: ya cubierto por las 327 pruebas Vitest. No medí cobertura de nuevo en esta ronda.

## Entrega para desarrollador-fullstack
Sin defectos abiertos. Sugerencia (no defecto): regenerar `docs/qa/capturas/envio-{bogota,leticia}-{360,1440}.png` al cerrar la rama, porque las rastreadas son anteriores a los campos de documento y código postal.
Reporte: `/home/ivan/Code/coffee-santander-shop/docs/qa/2026-11-05-documento-codigo-postal.md`
