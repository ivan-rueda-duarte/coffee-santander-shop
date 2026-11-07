# Ronda QA — Paquete legal v1 — 2026-11-06

## Ronda de verificación (2026-11-06, noche) — HEAD `e030eb7`

Rama `feat/paquete-legal-v1`, HEAD `e030eb7`. Incluye el estilo del diseñador (`37ae67c`), que la ronda anterior no había verificado (O-1), y las correcciones `efbb699` (QA-006), `81bdbff` (QA-007), `bb1b5f4` (QA-008 y LEG-104) y `6e807f1` (diseño #12 y #13 de `/envios/`). Árbol de `src/` limpio durante toda la ronda. Chromium (Playwright 1.64). Al empezar no había nada escuchando en el puerto 3000 y no toqué ese puerto. Usé mis propios `serve` en 4173 (normal) y 4180 (basePath) y los detuve al terminar.

### Comandos ejecutados
| Comando | Resultado |
|---|---|
| `npm run lint` | pasa (exit 0) |
| `npm run typecheck` | pasa |
| `npm test -- --coverage` | pasa: 24 archivos, 370 pruebas. `src/domain`: 99,71 % sentencias, 96,41 % ramas, 99,55 % funciones, 100 % líneas |
| `npm run datos` | pasa: 2 cafés, 7 provincias, 87 municipios, 8 tarifas, 61 reglas, 5 plazos; 3 avisos sin cambios (SCA sin verificar, «Afrutado» sin perfil, Arreboles sin NSA con riesgo aceptado); 4 documentos legales publicables |
| `npm run build` (Turbopack) | pasa, 17 páginas |
| `e2e/verificacion-paquete-legal-v1.spec.ts` (nuevo, 30 pruebas) | 30/30 pasan. Con `--repeat-each=3`, 90/90: nada intermitente |
| `npm run e2e` (suite completa, sin basePath) | 160 pasan, 4 omitidas (basePath) |
| `GITHUB_PAGES=true npm run build` **con Turbopack, en el propio repositorio**. Copié `out/` a `scratchpad/bp/coffee-santander-shop/`, lo serví en 4180 y después reconstruí `out/` con el build normal (verificado: 0 apariciones de `coffee-santander-shop` en `out/index.html`) | pasa. **O-2 resuelta**: esta vez Turbopack sí construyó con basePath, sin necesidad de webpack |
| `E2E_BASEPATH_URL=http://localhost:4180 npx playwright test` (completo) | **164/164 pasan**, 0 omitidas, 0 recursos con 4xx/5xx bajo `/coffee-santander-shop/` |
| `grep -riE "gourmet\|premium\|exótic\|mágic\|el mejor\|Café de Santander" out/ --include=*.html` | 0 |
| Secretos (`service_role\|SANITY_API_TOKEN\|sk…{20,}`) en `out/` | 0 |
| `grep -E "Rueda Duarte\|740574" out/index.html` | 0 |
| `grep -rl "niebla de la mañana\|Cafetal entre montañas" out src` | 0 |
| «bre-b» en minúscula en el texto visible, `alt`, `aria-label`, `title` y `meta` de las 15 páginas de `out/` (recorridas con Playwright) | 0. En el HTML crudo solo aparece dentro de los `id` de ancla `#10-si-pagaste-por-bre-b-…` y `#11-si-pagaste-por-bre-b-…`, que son slugs y no se ven |

### Veredicto: APTO CON OBSERVACIONES
QA-006, QA-007 y QA-008 quedan **cerrados**. LEG-104 y los puntos #12 y #13 de `/envios/` están verificados. El cambio de estilo `37ae67c` no trae regresiones funcionales, de accesibilidad ni de reflujo. Hay un defecto nuevo de severidad Baja (QA-009, visual) y ningún Bloqueante ni Alto abierto. Las observaciones de legal (O-5, O-6, O-7 y el dictamen «No conforme» por LEG-024/066, LEG-082 y D-1/D-2) siguen igual: son decisiones del dueño, no defectos de QA.

### Verificación por punto
- **QA-006 → Cerrado.** El botón no lleva `disabled`, tiene `aria-disabled="true"` y su descripción accesible es la microayuda (`#ayuda-preparar`, visible encima del botón y sin `aria-live`). Los tres textos coinciden letra por letra con §5.9 (dos casillas, solo datos, solo términos). Con las dos casillas marcadas desaparecen la microayuda, `aria-disabled` y `aria-describedby`. **Teclado real**: Tab desde la casilla de términos llega al botón. Con 0 casillas, Espacio no avanza: aparecen los dos errores exactos con `role="alert"`, `aria-invalid="true"` y `aria-describedby` en cada casilla, y el foco pasa a «Autorizo…». Con 1 casilla (Enter, o clic real de ratón en el centro del botón) solo aparece el error de la casilla que falta, con `aria-invalid` solo en ella y el foco en ella. Al marcarla, su error desaparece. En ningún caso aparece un enlace `wa.me/…?text=`, la URL cambia ni se marca una casilla sola. **Contraste**: botón con `aria-disabled` en #5f554c sobre #efe4d1, 5,77:1. Microayuda en #5f554c sobre pergamino, ≥ 6,46:1. Errores ≥ 4,5:1. Axe sin violaciones serias ni críticas a 320, 360 y 1440 px, también con los errores visibles. Captura: `docs/qa/capturas/boton-aria-disabled-360.png`. Nota de prueba: Playwright trata `aria-disabled` como deshabilitado y `click()` espera sin fin. Por eso las pruebas pulsan con teclado, con `page.mouse.click` o con `force: true`. No es un defecto del sitio.
- **QA-007 → Cerrado.** Las cuatro páginas legales no desbordan a 320 ni a 360 px (`scrollWidth` igual a la ventana y ningún elemento de `main` pasa del borde derecho). Columna de lectura a 1440 px: el `.body-l` mide lo mismo que 68 «0» en su fuente (≤ 68ch y > 90 % de 68ch). Índice «En este documento» en términos, privacidad y envíos (14 a 18 títulos): los enlaces coinciden 1:1 con los h2, los ids son únicos y en `[a-z0-9-]`, y `/legal/vendedor/` (2 títulos) no lleva índice. Probé el salto con Enter, desde un título del medio y desde el último, a 360 y 1440 px: la URL toma el `#id`, el h2 queda por debajo del encabezado fijo (75 px, con `scroll-mt-24` de 96 px) y a menos de 80 px de él, y el siguiente Tab sigue desde el título, sin volver al índice. Axe limpio a 320, 360 y 1440 px. Capturas: `legal-privacidad-320.png` y `legal-terminos-1440.png`. Ver QA-009 (peso del título del índice).
- **QA-008 → Cerrado.** «Cómo pedir», paso 3, exacto: «Despachamos desde Bucaramanga a todo Colombia. Ves el envío en tu carrito; si hay que cotizarlo, te lo confirmamos antes de que pagues. Pagas con efectivo contraentrega o transferencia Bre-B.». No hay «bre-b» en minúscula en ningún texto visible de `out/`.
- **LEG-104 → Verificado.** La foto `cafetal-montana.jpg` lleva el alt exacto «Montañas verdes con cultivos en ladera, un camino de tierra y nubes bajas.», su `figure` no tiene `figcaption` y no hay ningún `.ds-photo__caption` en inicio. Observación para legal (O-8): la comprobación de LEG-104 (`rg "niebla de la mañana|montañas de Santander" src out` vacío) no puede quedar vacía, porque el h1 de inicio dice «El café que crece entre cañones y *montañas de Santander*». Es texto de portada, no el alt ni el crédito de la foto, así que no lo cuento como defecto. Conviene que legal ajuste el criterio o confirme el titular.
- **/envios/ (diseño #12 y #13) → Verificado.** `leyenda-iva` y `comision-incluida` llevan clase `small` (14/22 px) en `text-ink-muted`, con contraste ≥ 4,5:1. A 320, 360 y 1440 px, cada `th` «Zona N» tiene `white-space: nowrap` y ocupa una sola línea. No hay desborde de página (la tabla se desplaza dentro de su región, como en QA-001) y axe está limpio. Captura: `envios-tabla-320.png`.

### Regresión del estilo `37ae67c` (pruebas y revisión visual)
- **Ficha**: bajo 640 px las filas de la ficha técnica se apilan (rótulo arriba, valor abajo; también la de «Notificación sanitaria INVIMA») y desde `sm` van a dos columnas. Leyenda de IVA con `margin-top: 4px` y alineada a la derecha. Con un fabricante de 80 caracteres inyectado en la ficha a 320 px no hay desborde. Axe limpio a 320, 360 y 1440 px. Capturas: `ficha-tecnica-320.png` y `ficha-tecnica-360.png`.
- **Pie**: los cuatro enlaces legales miden ≥ 28 px de alto, el `address` lleva filete de 1 px, no hay desborde ni elementos fuera de la ventana a 320, 360 y 1440 px, y axe está limpio. Capturas: `pie-vendedor-320.png` (nueva), `pie-vendedor-360.png` y `pie-vendedor-1440.png` (regeneradas). En las capturas de elemento a 320 px aparece encima el encabezado fijo: es un efecto de la captura, no del sitio.
- **Línea «por cotizar» (Leticia)**: bajo 640 px va en `flex-direction: column`, con el valor a ancho completo, alineado a la izquierda y debajo del plazo. A 1440 px vuelve a una fila con el valor a la derecha. Captura: `linea-por-cotizar-360.png`.
- **Aviso de retracto**: `small` de 14 px en `text-ink`, contraste ≥ 7:1 y texto exacto (lo comprueba la suite). Captura: `aviso-retracto-360.png`.
- **Tarjeta con marca larga**: la columna `marca` del CSV está vacía, así que inyecté en el DOM dos filas «Marca» (una de 70 caracteres con espacios y otra de 45 sin puntos de corte). A 320, 360 y 1440 px el `dd` parte la palabra (`overflow-wrap: anywhere`), no desborda la tarjeta ni la página, y axe está limpio. Captura: `tarjeta-marca-larga-320.png`.
- Revisé visualmente `resumen-leticia-360.png`, `legal-privacidad-320.png`, `legal-terminos-1440.png` y las anteriores: no hay solapes, cortes ni textos fuera de su caja.

### Capturas
Regeneradas y conservadas, porque cambian por el estilo, la microayuda o el pie (todas cambian de alto): `autorizacion-datos-320/360`, `documento-postal-errores-320/360`, `envio-bogota-360/1440`, `envio-leticia-360/1440`, `envios-pagina-360/1440`, `pie-vendedor-360/1440`, `resumen-bogota-360/1440`, `resumen-leticia-360/1440` y `resumen-retracto-320/360/1440`. Restauré `ppt-360.png`, que no tenía ningún píxel distinto por encima del umbral. Nuevas: `aviso-retracto-360`, `boton-aria-disabled-360`, `envios-tabla-320`, `ficha-tecnica-320/360`, `legal-privacidad-320`, `legal-terminos-1440`, `linea-por-cotizar-360`, `pie-vendedor-320` y `tarjeta-marca-larga-320`.

### Defecto nuevo
#### QA-009 — El título del índice «En este documento» no sale en negrita
- Severidad: Baja (visual; no afecta a la accesibilidad ni a la función).
- Entorno: Chromium, cualquier viewport, `e030eb7`. Viene de `81bdbff`.
- Pasos: 1. Abrir `/legal/terminos/`. 2. Inspeccionar `#indice-legal`.
- Esperado: peso 700, según la clase `font-bold` que escribió el desarrollador en `src/app/legal/[slug]/page.tsx`, línea 82, para separar el rótulo de la lista de enlaces.
- Obtenido: `font-weight: 500`. La clase `.small` de `src/styles/marca.css` (línea 119, fuera de `@layer`) gana a la utilidad `font-bold` de Tailwind, que va en capa. En la captura `docs/qa/capturas/legal-terminos-1440.png` el rótulo se ve con el mismo peso que los enlaces. Es el único caso en `src/` donde una clase tipográfica (`small`, `caption`, `body`) se combina con una utilidad de peso.
- Corrección sugerida: `!font-bold`, o un rótulo con `overline`, según decida disenador-marca. El peso del rótulo no está especificado en `docs/diseno/2026-11-06-paquete-legal-v1.md`.
- Criterio de cierre: `getComputedStyle(#indice-legal).fontWeight` igual a "700", o la variante que especifique diseño. Lo mido con Playwright en la siguiente ronda (no dejé una prueba fija porque el valor esperado depende de diseño).
- Responsable sugerido: desarrollador-fullstack (con disenador-marca).
- Estado: **Abierto**.

---

## Ronda inicial (HEAD `6a53341`)

Rama `feat/paquete-legal-v1`, HEAD `6a53341` (código en `212322c`, `a2aa0ee`, `36ec25b`, `c785cb1`, `63d93d3`). Chromium (Playwright 1.64) contra `out/` servido con `serve`. Entrega verificada: `docs/legal/revisiones/2026-11-06-paquete-v1.md` («Entrega para desarrollador-fullstack» y «Puntos para que QA verifique») y `docs/legal/microcopy-legal.md` v1.0.

**Estado del árbol durante la ronda.** Al empezar, el árbol estaba limpio. A las 20:48, después del primer `npm run build` (20:47), aparecieron cambios **sin commit** de otra sesión en `src/styles/componentes.css`, `totales-pedido.tsx`, `flujo-pedido.tsx`, `bloque-compra.tsx`, `ficha-cafe.tsx`, `pie.tsx` y `docs/diseno/2026-11-06-paquete-legal-v1.md`. Para probar exactamente HEAD copié ese `out/` (build de 20:47, sin los cambios) a una carpeta temporal y corrí todo el e2e contra esa copia. **Esos cambios no están verificados en esta ronda.** No había ningún proceso escuchando en el puerto 3000 al empezar ni al terminar; no maté nada ahí (solo mis `serve` de 4173 y 4180).

## Comandos ejecutados
| Comando | Resultado |
|---|---|
| `npm run lint` | pasa |
| `npm run typecheck` | pasa |
| `npm test -- --coverage` | pasa: 24 archivos, 370 pruebas. Cobertura `src/domain`: 99,71 % sentencias, 96,41 % ramas, 99,55 % funciones, 100 % líneas |
| `npm run datos` | pasa: 2 cafés, 7 provincias, 87 municipios, 8 tarifas, 61 reglas, 5 plazos; 3 avisos, entre ellos «Café Arreboles está activo sin notificación sanitaria… Riesgo aceptado por el dueño (LEG-024/066)»; «Documentos legales publicables: 4 (versión 1, vigentes desde 2026-11-06)» |
| `npm run build` | pasa (17 páginas, 4 legales SSG) |
| `npm run e2e` (suite existente, HEAD) | 101 pasan, 3 omitidas (basePath sin variable) |
| `e2e/paquete-legal-v1.spec.ts` (nuevo, 30 pruebas) | 26 pasan, 3 fallan: QA-006, QA-007 (320 px) y QA-008. 1 omitida sin `E2E_BASEPATH_URL` |
| `npx playwright test` completo, final | 127 pasan, 3 fallan (QA-006, QA-007, QA-008), 4 omitidas (basePath) |
| `GITHUB_PAGES=true next build --webpack` desde `git archive HEAD` (carpeta temporal), servido bajo `/coffee-santander-shop/` en 4180 | `E2E_BASEPATH_URL=http://localhost:4180`: `basepath.spec.ts` 3/3 y «paquete legal v1 bajo basePath» 1/1 pasan, sin recursos con 4xx/5xx (después de corregir la prueba, ver O-3). Se usó webpack porque Turbopack no acepta el `node_modules` enlazado fuera de la raíz; `out/` del repositorio sigue siendo el build normal de HEAD (sin prefijo) |
| `git grep -nE "no admite retracto\|finalizar mi pedido\|Registro sanitario\|marca propia\|Café de Santander" HEAD -- src e2e data` | solo pruebas y la regla de marca (`reglas-texto.ts`, `reglas-texto.test.ts`, `legal-md.test.ts`), que buscan esas frases para rechazarlas. 0 en textos publicados |
| Las mismas frases + `gourmet\|premium\|exótic\|mágic\|el mejor\|Trabajamos con fincas\|Recolección manual\|Secado al sol\|cafés de De Santander\|sin IVA\|DS-[0-9]\|en preparación` en `out/**/*.html` | 0 coincidencias |
| `grep -E "Rueda Duarte\|740574" out/index.html` | 0. Solo aparecen en `/legal/vendedor/`, `/legal/terminos/` y `/legal/privacidad/`, porque son parte del texto público de los documentos v1.0 |
| Secretos en `out/` (`service_role\|SANITY_API_TOKEN\|sk…`) | 0 |

## Veredicto: APTO CON OBSERVACIONES
Ningún defecto Bloqueante ni Alto abierto. Tres defectos nuevos: dos Medios (accesibilidad) y uno Bajo. Se aplicó la entrega de legal (bloques A a D). Nota: el dictamen de lanzamiento de legal sigue «No conforme» por motivos que no son de QA: LEG-024/066 (Arreboles sin NSA, riesgo aceptado), LEG-082 (concepto del contador sobre el IVA del 5 %, que se publica por decisión del dueño, P20 = a) y el cotejo D-1/D-2.

## Verificación por punto
1. **Páginas legales**: ✅. Las cuatro responden 200. Tienen h1 exacto («Envíos, devoluciones, retracto y garantía» incluido) y el rótulo «Versión 1 · vigente desde 2026-11-06». Comparé el texto bloque por bloque (h2/p/li) contra la sección «## Texto para el consumidor» de cada `.md`, con un extractor propio: es idéntico. No aparecen «en preparación», TODO, VERIFICAR, DECISIÓN, BORRADOR, corchetes, `**` ni acentos graves. El `dl` de `/legal/vendedor/` tiene las 8 filas exactas, tomadas de `config.csv`. Axe sin violaciones serias a 320, 360 y 1440 px. ❌ Desborde horizontal a 320 px: **QA-007**.
2. **Resumen**: ✅ con defecto. Las casillas cargan sin marcar, con los textos exactos de §4.3 y §5.1 («…versión 1 del 6 de noviembre de 2026…» desde `config.csv`). El botón queda deshabilitado hasta marcar las dos. `aviso-retracto`, `nota-precio-total` (con sus dos enlaces), `leyenda-iva` y `linea-vendedor` («Te vende De Santander SAS · NIT 902.121.184-8 · Bucaramanga, Santander · Calle 37 n.° 23-77, apartamento 702, Bucaramanga, Santander · desantander.tienda@gmail.com · WhatsApp +57 300 112 9874. Información del vendedor», sin representante ni matrícula) salen exactos. `linea-plazo` es exacta en la zona 1 (Bucaramanga), la 4 (Quibdó) y la 5 (Leticia). ❌ El botón deshabilitado no dice qué falta: **QA-006**.
3. **Mensaje de WhatsApp**: ✅. Empieza con «¡Hola, De Santander! Envío mi solicitud de compra…» y lleva «Subtotal de productos: $60.000 (IVA del 5 % incluido)», `Envío (…)` y `Total:`. Penúltima línea: «Forma de pago: …»; después, una línea en blanco y la constancia exacta, con «versión 1» dos veces. No hay «DS-» ni «finalizar». Peor caso: 8 líneas × 20 bolsas, correo, barrio y 300 caracteres de indicaciones (más de 5 kg, por cotizar). El mensaje queda por debajo de 2.000 caracteres, «Quedo atento…» va antes de la constancia y la constancia queda intacta.
4. **Pie** a 360 y 1440 px: ✅. Las 5 líneas del vendedor son exactas, el correo enlaza con `mailto:` y la última línea dice «© 2026 De Santander SAS. Precios en pesos colombianos, con IVA del 5 % incluido.». El descriptor es el del modelo C. Axe limpio y sin desborde. El HTML de inicio no contiene «Rueda Duarte» ni «740574». Capturas: `docs/qa/capturas/pie-vendedor-360.png`, `pie-vendedor-1440.png`.
5. **Fichas**: ✅. Casa Martínez: fila «Notificación sanitaria INVIMA» / «N.° NSA-003219-2017», sin «Titular:» ni «Fabricante:». Última fila «Comercializa» / «De Santander SAS». Ayuda de molienda y leyenda de IVA exactas. JSON-LD `Product` sin `brand` (la columna `marca` está vacía) y sin `aggregateRating`. Arreboles: sin fila sanitaria ni marcador, activo y se agrega al carrito; `npm run datos` avisa sin fallar. No hay «Registro sanitario» en ninguna fila. Axe limpio a 320, 360 y 1440 px.
6. **/envios/**: ✅. «Plazos de entrega» muestra las 5 zonas desde `plazos_envio.csv` (incluida la zona 5 «se informa al cotizar…»). La frase de §5.8 es exacta. Están `plazo-legal`, `leyenda-iva` (tarifas), `comision-incluida` y la sección «Retracto» con el texto de §5.3, que termina en «Más en envíos, devoluciones, retracto y garantía.» con enlace. El enlace final y `metadata.description` son exactos. No aparecen «¿Tu destino no aparece», «Plazos orientativos» ni «sin IVA».
7. **Formulario**: ✅. `ayuda-contraentrega` aparece solo con «Efectivo contraentrega», con el texto exacto, y es la descripción accesible del grupo de forma de pago. Desaparece al elegir Bre-B.
8. **Cambios del desarrollador en `e2e/*`**: ver «Revisión de las pruebas del desarrollador». No se debilitó la cobertura de los textos; sí se perdió la de los mensajes de error de las casillas (se deriva de QA-006). La prueba de basePath estaba rota (O-3).
9. **Palabras prohibidas y modelo C**: ✅ (comandos arriba). En inicio, pie, metadatos (`description` y `og:` de inicio y de `/cafes/`), Historia y «Cómo pedir» no aparecen «marca propia», fincas, recolección ni secado. Historia párrafo 2: ver O-5. ❌ «bre-b» en minúscula en «Cómo pedir»: **QA-008** (anterior a esta rama).
10. **Regresión**: ✅ (tabla de comandos). Sin datos personales en la URL (salvo `wa.me`), en `localStorage` ni en `sessionStorage`. El flujo completo no hace peticiones a terceros (no hay analítica). Sin desborde a 320 y 360 px en inicio, pedido, `/envios/` (la tabla desplaza dentro de su región, QA-001) y ficha. El desborde está solo en las páginas legales a 320 px (QA-007).

## Defectos
| ID | Severidad | Área | Título | Responsable |
|---|---|---|---|---|
| QA-006 | Media | Accesibilidad / checkout | «Preparar pedido para WhatsApp» deshabilitado sin explicar qué falta; los errores de §4.3 y §5.1 ya no pueden aparecer | desarrollador-fullstack (texto con disenador-marca) |
| QA-007 | Media | Accesibilidad (reflujo) | Páginas legales desbordan 16 px a 320 px por el correo sin puntos de corte | desarrollador-fullstack |
| QA-008 | Baja | Contenido / inicio | «Cómo pedir» paso 3 dice «efectivo contraentrega y transferencia bre-b» | desarrollador-fullstack |
| QA-009 | Baja | Visual / legal | Título del índice «En este documento» sin negrita (`.small` anula `font-bold`) | desarrollador-fullstack (con disenador-marca) |

Estados al cierre de la ronda de verificación: QA-006 **Cerrado**, QA-007 **Cerrado**, QA-008 **Cerrado**, QA-009 **Abierto**.

### QA-006 — Botón «Preparar pedido para WhatsApp» deshabilitado sin explicación
- Severidad: Media.
- Entorno: Chromium, 360 × 740 y 1440 × 900, `feat/paquete-legal-v1`, `6a53341`.
- Pasos: 1. Agregar un café y completar el envío (Bucaramanga). 2. «Revisar el pedido». 3. Sin marcar las casillas, recorrer con Tab o con lector de pantalla.
- Esperado: quien no puede avanzar sabe por qué. La indicación es visible junto al botón y está asociada con `aria-describedby` (p. ej. «Marca las dos casillas para continuar.»), o el botón sigue enfocable (`aria-disabled="true"`) y, al pulsarlo, muestra los errores de microcopy §4.3 («Debes autorizar el tratamiento de tus datos para continuar.») y §5.1 («Debes aceptar los términos para continuar.»).
- Obtenido: `<button disabled>` sin `aria-describedby` ni texto de ayuda. Tab salta el botón (los botones `disabled` no reciben foco), así que con lector de pantalla el paso termina en la segunda casilla sin aviso. El botón se ve como una píldora beige de bajo contraste (captura `docs/qa/capturas/resumen-retracto-360.png`). Los mensajes de error de las casillas (`e-aut`, `e-ter` en `flujo-pedido.tsx`) son código muerto: nada los muestra. WCAG 3.3.2 (instrucciones) y buena práctica de 4.1.2. Axe no lo detecta.
- Nota: microcopy §4.3 pide a la vez «error sin cambio» y «botón deshabilitado». Con `disabled` el error nunca aparece. La variante `aria-disabled` cumple las dos cosas; el texto de ayuda nuevo, si se elige esa vía, conviene pasarlo por disenador-marca.
- Evidencia y criterio de cierre: `e2e/paquete-legal-v1.spec.ts` › «QA-006: el botón deshabilitado explica qué falta…». Falla con «el botón deshabilitado no tiene aria-describedby». Traza: `test-results/paquete-legal-v1-resumen-d-0d33d-ciado-con-aria-describedby--chromium/trace.zip`. Si se elige `aria-disabled`, ajusto la prueba para exigir los dos errores al pulsar.
- Estado: **Cerrado** (2026-11-06, ronda de verificación sobre `e030eb7`; criterio: `e2e/verificacion-paquete-legal-v1.spec.ts` y `e2e/paquete-legal-v1.spec.ts` en verde). Corregido en el commit `efbb699`. Causa raíz: el botón usaba `disabled`, que no recibe foco ni explica qué falta, y dejaba muertos los errores `e-aut`/`e-ter`. Vía de microcopy §5.9 v1.1: `aria-disabled`, microayuda por caso con `aria-describedby` y errores con `aria-invalid` al pulsar.

### QA-007 — Páginas legales con desborde horizontal a 320 px
- Severidad: Media (WCAG 1.4.10 Reflujo, AA, que se mide justo a 320 px CSS; axe no lo detecta).
- Entorno: Chromium, 320 × 740, `6a53341`. A 360 y 1440 px pasa.
- Pasos: 1. Abrir `/legal/terminos/`, `/legal/privacidad/`, `/legal/envios-devoluciones/` o `/legal/vendedor/` a 320 px. 2. Medir `document.documentElement.scrollWidth`.
- Esperado: 320. Obtenido: 336 en las cuatro. El responsable es «desantander.tienda@gmail.com.», que en `body-l` (18 px) no cabe en los 260 px del `li` ni en los 280 px del `p` y no tiene puntos de corte (`LI sw=296 cw=260`, `P sw=296 cw=280`). En el pie y la ficha, los cambios sin commit de la otra sesión añaden `[overflow-wrap:anywhere]`, pero no en `src/app/legal/[slug]/page.tsx`.
- Corrección sugerida: `[overflow-wrap:anywhere]` (o `break-words`) en el contenedor `.body-l` de la página legal y en el `dd` del `dl` del vendedor.
- Evidencia y criterio de cierre: `e2e/paquete-legal-v1.spec.ts` › «QA-007 a 320 px: las cuatro páginas legales sin violaciones serias de axe ni desborde». Traza: `test-results/paquete-legal-v1-páginas-l-618d4-s-serias-de-axe-ni-desborde-chromium/trace.zip`. Captura: `docs/qa/capturas/legal-vendedor-320.png`.
- Estado: **Cerrado** (2026-11-06, ronda de verificación sobre `e030eb7`; criterio: `e2e/verificacion-paquete-legal-v1.spec.ts` y `e2e/paquete-legal-v1.spec.ts` en verde). Corregido en el commit `81bdbff`. Causa raíz: el correo sin puntos de corte no podía partirse en el cuerpo `.body-l` ni en el `dd` del vendedor; ahora llevan `[overflow-wrap:anywhere]`.

### QA-008 — «bre-b» en minúscula en «Cómo pedir»
- Severidad: Baja.
- Entorno: Chromium, cualquier viewport, `6a53341`. Viene de `afa834f` (`secciones-inicio.tsx`, línea 61: `tienda.formasPago.map((p) => p.toLowerCase())`).
- Pasos: abrir `/` e ir a «Cómo pedir», paso 3.
- Esperado: «Pagas con efectivo contraentrega o transferencia Bre-B.». Bre-B es nombre propio, como en `config.csv`, el pie y el formulario; además se paga con una forma u otra.
- Obtenido: «Pagas con efectivo contraentrega y transferencia bre-b.».
- Corrección sugerida: poner en minúscula solo la primera letra de cada forma de pago, o redactar las formas en minúscula en un campo aparte. Si se cambia «y» por «o», que legal lo confirme (microcopy §2 lo da como «{formas de pago}»).
- Evidencia y criterio de cierre: `e2e/paquete-legal-v1.spec.ts` › «QA-008: «Cómo pedir» paso 3…».
- Estado: **Cerrado** (2026-11-06, ronda de verificación sobre `e030eb7`; criterio: `e2e/verificacion-paquete-legal-v1.spec.ts` y `e2e/paquete-legal-v1.spec.ts` en verde). Corregido en el commit `bb1b5f4`. Causa raíz: `toLowerCase()` sobre el texto completo de cada forma de pago y unión con «y»; ahora solo la primera letra va en minúscula y se unen con «o».

## Revisión de las pruebas del desarrollador (`git diff 5331c9c HEAD -- e2e/`)
- **Textos**: las pruebas pasaron a usar `textosCasillas()` y `AVISO_RETRACTO` (`e2e/ayudas.ts`), que leen versión y fecha de `config.csv`. Las comparaciones exactas se conservan.
- **Errores de casillas eliminados**: `autorizacion-datos.spec.ts` y `pedido.spec.ts` ya no comprueban los textos de error, los `aria-describedby="e-aut"`/`"e-ter"` ni axe con el error visible. Lo sustituyen por `toBeDisabled()`. Esa cobertura se perdió porque el comportamiento cambió, no por descuido; queda cubierta por QA-006.
- **`legal-resumen-envios.spec.ts`**: la búsqueda pasó de `/retracto/` a `/retract/` (más estricta). Se añadieron `linea-plazo`, `leyenda-iva`, `nota-precio-total` y `ayuda-contraentrega`.
- **`envios.spec.ts`**: se quitó la prueba «no se publican máximos» porque ahora sí se publican; la reemplazan comparaciones con `plazos_envio.csv`. Correcto.
- **Tolerancia a P20**: las pruebas de `leyenda-iva` del desarrollador aceptan las dos variantes («IVA del N % incluido» o «todos los impuestos incluidos»). Las mías exigen el texto exacto según `iva_tarifa` de `config.csv`.
- **O-3 (prueba rota, corregida por QA)**: en `basepath.spec.ts`, `getByRole("link", { name: "Información del vendedor" })` encuentra dos enlaces (resumen y pie) y falla en modo estricto. El desarrollador no la vio porque se omite sin `E2E_BASEPATH_URL`. La acoté a `getByTestId("linea-vendedor")`, solo en el archivo de prueba.

## Observaciones
- **O-1.** Cambios sin commit de otra sesión en `src/` y `docs/diseno/` durante la ronda (arriba). Hay que volver a pasar la suite cuando se confirmen.
- **O-2.** El build con basePath se hizo con webpack desde `git archive HEAD`. El de GitHub Pages usa Turbopack; conviene repetir `basepath.spec.ts` con el build real antes de desplegar.
- **O-4.** `docs/qa/capturas/`: se regeneraron 17 capturas rastreadas que cambian por los textos nuevos (resumen, casillas, plazos, `/envios/`, pie en todas las de página completa). Restauré `ppt-360.png`, que cambió solo por ruido de píxeles. Hay 3 capturas nuevas: `pie-vendedor-360.png`, `pie-vendedor-1440.png` y `legal-vendedor-320.png`.
- **O-5 (para legal).** Historia, párrafo 2: el sitio publica «En cada café verás la provincia, el municipio, la altitud, la variedad y el proceso.». Microcopy §2 dice «…verás la marca, quién lo fabrica, la provincia…» y lo condiciona a que ningún campo esté vacío; `marca` y `fabricante` están vacíos en los dos cafés. La adaptación es honesta, pero no es el texto literal.
- **O-6 (para legal).** `informacion-vendedor.md` («Dónde se muestra») da la línea del resumen con «Calle 37 n.° 23-77, apartamento 702» sin ciudad. Microcopy §5.4 usa `{direccion_notificacion}` completa, que es lo que implementa el sitio. Los documentos no coinciden entre sí.
- **O-7.** LEG-082/P20: la leyenda «IVA del 5 % incluido» se publica en la ficha, el resumen, el pie, `/envios/` y el mensaje sin el concepto del contador (D-18).

## Paridad v1
No se recorrió en esta ronda (el alcance es el paquete legal). Cambios de comportamiento respecto a la v1, todos por decisión documentada: se concede el retracto de 5 días hábiles, las casillas tienen versión y el mensaje nuevo pide confirmar el total.

## Cobertura
- Ronda de verificación: E2E 164 pruebas (160 + 4 de basePath), todas en verde. Nuevo `e2e/verificacion-paquete-legal-v1.spec.ts` (30 pruebas): QA-006 con teclado, 0 y 1 casillas y contraste; QA-007 con reflujo por elemento, 68ch e índice de anclas con salto y foco; QA-008 en el texto visible de `out/`; LEG-104; `/envios/` #12 y #13; ficha apilada, pie, «por cotizar», aviso de retracto y tarjeta con marca larga a 320, 360 y 1440 px.
- Unitarias: 370 pruebas; `src/domain` 99,71 % sentencias y 96,41 % ramas (≥ 90 %).
- E2E: 134 pruebas (130 sin basePath + 4 con basePath). Nuevo `e2e/paquete-legal-v1.spec.ts` (30 pruebas): páginas legales letra por letra y `dl` del vendedor; axe y reflujo a 320, 360 y 1440 px en páginas legales, resumen y ficha; plazos de las zonas 1, 4 y 5; mensaje en el caso normal y en el peor caso; pie a 360 y 1440 px; fichas Casa Martínez y Arreboles; `/envios/`; ayuda de contraentrega; privacidad (URL, almacenamiento, peticiones a terceros); basePath; QA-006, QA-007 y QA-008.
