# Ronda QA — paquete del abogado v1.0 (LEG-140 a LEG-170) — 2026-11-14

Rama `main`, commit base `043616a`, cambios del desarrollador sin commit. Chromium (Playwright 1.64), viewports 320, 360 × 740, 768, 1280 y 1440 × 900 según la suite. Lanzamiento previsto: 2026-11-17.
Fuente de cotejo: texto del paquete «De Santander SAS — Textos legales v1.0 para publicación» (extracción de 581 líneas) y la sección 2 bis del dictamen `docs/legal/revisiones/2026-11-14-paquete-abogado-v1.md`.

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm run datos` | pasa. 4 avisos: SCA sin verificar (Casa Martínez), Casa Martínez sin `titular_nsa`/`marca`/`fabricante`/`fabricante_expresion`, notas «Afrutado» sin perfil, **Arreboles sin NSA ni rotulado (solo aviso, decisión del dueño)**. «Documentos legales publicables: 4 (versión 1.0, vigentes desde 2026-11-17)». Envío gratis «programada» (empieza el 2026-11-17). |
| `npm run typecheck` | pasa |
| `npm run lint` | pasa (también con las pruebas nuevas) |
| `npx vitest run --coverage` | pasa: 31 archivos, 537 pruebas. Cobertura de `src/domain/`: líneas 99,84 %, sentencias 99,65 %, ramas 96,69 %, funciones 99,27 % (≥ 90 %) |
| `npm run build` | pasa (17 rutas) |
| `npx playwright test` (modo normal, 1.ª pasada, antes de mis cambios) | 172 pasan, 47 omitidas (requieren la promoción encendida) |
| `ENVIO_GRATIS_PRUEBA=si FECHA_BUILD_PRUEBA=2026-11-17 npx playwright test` (1.ª pasada) | 203 pasan, **1 falla** (`envio-gratis-comunas.spec.ts:245`, orden de foco; ver abajo), 15 omitidas (basePath y «terminada»/«apagada») |
| `GITHUB_PAGES=true npm run build` + servir bajo `/coffee-santander-shop/` + `E2E_BASEPATH_URL=… npx playwright test e2e/basepath.spec.ts e2e/paquete-legal-v1.spec.ts -g basePath` | 4 pasan. Ningún `href`/`src` sin prefijo en el HTML ni `url(/…)` sin prefijo en el CSS |
| `NEXT_PUBLIC_SITE_URL=… GITHUB_PAGES=true npm run build` | `sitemap.xml` con 10 URL: incluye `/envios/`, excluye `/pedido/` y `/legal/envios-devoluciones/`; `robots.txt` con `Sitemap:`; la remisión tiene `noindex, follow` y canónica a `/envios/`; JSON-LD `Product` sin `brand` ni `aggregateRating` |
| `npx playwright test` (modo normal, final, con la prueba corregida y la spec nueva) | 190 pasan, **1 falla (QA-017, a propósito)**, 48 omitidas |
| Modo promoción (final) | 223 pasan, **1 falla (QA-017, a propósito)**, 15 omitidas |
| `--repeat-each=3` de la prueba de foco y de QA-016 (modo promoción) | 6/6 pasan, sin intermitencia |
| Secretos: `grep -rEi "service_role\|SANITY_API_TOKEN\|sk[A-Za-z0-9]{20,}"` en el `out/` normal, de promoción y de basePath | 0 coincidencias |
| JS inicial de inicio (`<script src>` de `out/index.html`, gzip -9) | 193.376 B (≈ 189 KB). Línea base con el commit `043616a` construido aparte: 193.511 B. No es regresión de esta ronda (QA-018) |
| Lighthouse | no ejecutado: no está instalado y no se descargan herramientas en esta ronda |

Veredicto: **APTO CON OBSERVACIONES** para el lanzamiento del 2026-11-17 desde el punto de vista de QA: no hay defectos Bloqueantes ni Altos abiertos. Quedan dos defectos Bajos/Medios (QA-017, QA-018), el texto de QA-016 sin respaldo en el microcopy y las decisiones pendientes del dueño, de diseño y del abogado que se listan al final. El dictamen legal (LEG-147, LEG-156, LEG-167) sigue siendo condición propia de legal, fuera de este veredicto.

## Prueba que fallaba: `envio-gratis-comunas.spec.ts:245` (orden de foco)

- Esperaba `comuna → «Condiciones» → codigoPostal`; obtenía `comuna → «Condiciones» → «Cómo consulto de qué comuna soy»`.
- Causa: al corregir QA-016, el desarrollador sacó el `<details>` del `<p id="comuna-ayuda">` y lo puso como hermano, después de la ayuda y antes de «Código postal». El `<summary>` es un control nativo enfocable: es correcto que reciba foco, y el orden sigue el orden visual y del DOM (columna de Comuna, debajo de su ayuda; luego Código postal).
- **Decisión: el defecto estaba en la prueba**, escrita antes del `<details>`. Se actualizó a 4 tabulaciones (`comuna → Condiciones → Cómo consulto… → codigoPostal`) y se añadió que Enter y Espacio abren y cierran el desplegable. Se agregó la prueba de cierre de QA-016 (sin `details` dentro de `p` y fuera de la descripción accesible de Comuna). Las dos pasan.

## Verificación manual en `out/` y en navegador (360 × 740 y 1440 × 900)

Texto visible extraído con Playwright de 12 rutas en los dos viewports (normal y con la promoción en modo de prueba) y cotejado con un script propio línea por línea contra el texto del paquete (no contra los .md del repositorio).

- **D1 `/legal/terminos/`**: las 16 secciones y «Normas citadas» idénticas al paquete. Solo difieren los añadidos A1, A2 y A3 de la sección 2 bis, letra por letra. H1 «Términos y condiciones de compra», rótulo «Versión 1.0 · vigente desde el 17 de noviembre de 2026».
- **D2 `/legal/privacidad/`**: idéntica salvo C1 (viñeta «Comuna (opcional…)», después de «Barrio, código postal e indicaciones»), C2 y C3 (DIAN en lugar del «proveedor tecnológico»), los tres de la sección 2 bis. §13: «Esta política rige desde el 17 de noviembre de 2026 (versión 1.0).», sin llaves. C4 a C6 no aplicados (correcto: esperan al abogado).
- **D3 `/envios/`**: §1 a §12 idénticos salvo B1 a B6 y B8 («, 33, 34» en Normas citadas). La tabla de tarifas, la nota de peso, la leyenda de IVA y la lista de municipios van después del numeral 3. El numeral 13 está una sola vez, dentro de D3, antes de «Normas citadas», que no se repite. Ancla `#envio-gratis` en el h2 del numeral 13 (1 sola en la página). Con la promoción encendida se agregan solo la nota de la fila Bucaramanga y la salvedad bajo la tabla, que son textos de microcopy §8.
- **D4 `/legal/vendedor/`**: «Quién te vende», la tabla como lista «Dato: Valor» (mismas palabras y orden) y «Cómo te atendemos», idénticos. Sin `dl` duplicado. Muestra la dirección de notificación judicial.
- **`/legal/envios-devoluciones/`**: «Este documento está en Envíos (/envios/).» con enlace, `noindex, follow`, fuera del sitemap.
- En ninguna página: `{`, `}`, `[`, `]`, «TODO», «VERIFICAR», «DECISIÓN». Ningún desborde horizontal a 360 ni a 1440.
- **Términos y textos retirados** en todo `out/` (HTML, payload RSC y JS): «contraentrega» y «efectivo» solo en «No recibimos pagos contraentrega ni en efectivo» de D1 §7 y D3 §5. Cero «Forma de pago», «molienda» visible, «Registro sanitario», «S.A.S.», «Quiero finalizar», «marca propia», «gourmet», «premium», «exótic», «mágic», «el mejor», «los mejores», «Café de Santander». **«grano entero»** aparece en el nombre accesible del botón «Agregar» de las tarjetas (QA-017). «molienda» solo como identificador interno en el JS; «Grano entero» solo en el mapa de migración del carrito v1.
- **Pie (360 y 1440)**: razón social, NIT, domicilio, «Correo de atención y de notificación judicial», WhatsApp, «Transferencia bancaria o Bre-B», texto de envíos de D5 §6.1 y los 4 enlaces (`/legal/terminos/`, `/legal/privacidad/`, `/envios/`, `/legal/vendedor/`), todos con 200. **Sin dirección de notificación** (decisión del dueño P38 = b). La dirección con mayúscula «Calle 37…» solo está en `/legal/vendedor/` (QA-015); en minúscula aparece en D1 §2, D2 §1 y D3 §1, que es el texto del abogado.
- **Ficha**: «PRESENTACIÓN: Grano / Molido», ayuda «Grano o molido, tal como lo empaca el fabricante. No molemos el café.», «Precio con IVA del 5 % incluido.», «Entrega estimada y plazo máximo según tu zona: Ver plazos», «Notificación sanitaria INVIMA N.° NSA-003219-2017» (Casa Martínez, sin titular porque el CSV no lo trae) y «Comercializa: De Santander SAS» al final. **Arreboles** se lista y se puede comprar sin fila sanitaria; `npm run datos` solo avisa: riesgo aceptado por el dueño, no defecto.
- **Historia**: variante B («Reunimos cafés de marcas de nuestra tierra, cada uno tal como lo empaca su fabricante. / Desde Bucaramanga los enviamos a todo Colombia…»), coherente con que faltan marca y fabricante (D-11).
- **Resumen y casillas**: verificados con la spec nueva usando textos copiados a mano del paquete (ver «Pruebas mínimas §7.4»). Captura: `docs/qa/capturas/2026-11-14-resumen-casillas-360.png` y `-1440.png`.
- **Plazos**: resumen con 3 / 6 / 6 / 10 días hábiles (Bucaramanga, San Gil, Bogotá, Quibdó) y «contado desde el día hábil siguiente a tu pago»; zona 5 «se informa al cotizar; máximo 30 días calendario». `/envios/` §6 igual que el paquete.
- **Envío gratis (modo de prueba, 2026-11-17)**: resumen «Plazo máximo: 1 día hábil desde que validamos tu pago…», mensaje «…desde que validen mi pago…», anuncio en inicio y cajón, comuna fuera de localStorage, URL y red. Todas las pruebas de la suite pasan.

## Pruebas mínimas de §7.4 del paquete, una por una

| # | Prueba | Resultado | Prueba automática |
|---|---|---|---|
| 1 | Las dos casillas obligatorias cargan sin marcar y bloquean; las de promociones no bloquean | Pasa. Orden 1 términos, 2 datos, 3 WhatsApp, 4 correo (solo con correo). 3 y 4 marcadas no desbloquean; 1 sola o 2 sola no desbloquean; 1 y 2 sin 3 ni 4 avanzan. Errores exactos y foco en la casilla 1. | `qa-2026-11-14-paquete-abogado.spec.ts` («casillas…») |
| 2 | Un café sin NSA no aparece | **No se cumple por decisión del dueño** (Arreboles activo, riesgo aceptado). Verificado que `npm run datos` solo avisa y la ficha omite la fila sanitaria sin marcador. | `paquete-legal-v1.spec.ts` («Arreboles: activo por decisión del dueño…») |
| 3 | No existe la opción contraentrega en ninguna pantalla | Pasa (solo el texto legal que la excluye). Sin radios en el formulario; texto fijo de pago de D5 §6.3. | spec nueva («formulario…») y `paquete-legal-v1.spec.ts` |
| 4 | El mensaje incluye solicitud, líneas, subtotal con IVA, envío, total, versiones y, si aplica, promociones | Pasa: el mensaje coincide **línea por línea** con D5 §6.4 con todos los campos (correo, documento, barrio, código postal, indicaciones, dos promociones); número `DS-AAMMDD-HHMM-XXXX` generado en el navegador, distinto en cada preparación y no guardado; < 2.000 caracteres (también en el peor caso de 8 líneas × 20). Por cotizar: «Total sin envío» y «Quedo atento…» al final. | spec nueva («mensaje D5 §6.4…», «resumen por cotizar…») |
| 5 | Las páginas legales muestran versión 1.0 y fecha 17/11/2026, leídas de config.csv | Pasa: «Versión 1.0 · vigente desde el 17 de noviembre de 2026» en las cuatro; mismas versiones en casillas y mensaje. | `paquete-legal-v1.spec.ts` |
| 6 | El pie muestra los datos completos del vendedor en 360 × 740 y en escritorio | Pasa con la salvedad decidida por el dueño (sin dirección de notificación en el pie). | spec nueva («pie a 360/1440…») |

Datos personales: tras el flujo completo desde la ficha (Molido + 500 g), `localStorage` tiene solo `desantander.carrito.v2` con `{version: 2, lineas: [{cafeSlug, gramos, molienda, cantidad}]}`; `sessionStorage` sin datos, sin cookies, ninguna URL de navegación con datos personales y **cero peticiones a dominios externos** (no hay analítica).

Accesibilidad: axe sin violaciones serias ni críticas en catálogo, provincia, `/envios/`, remisión, las tres páginas legales y el resumen con 4 casillas, a 360 y 1440 (además de las suites existentes en inicio, ficha, pedido, cajón). Foco atrapado en el cajón y Esc (suite existente), `prefers-reduced-motion` en el mapa y en el campo Comuna (suites existentes), contraste del botón `aria-disabled` y de la microayuda ≥ 4,5:1.

## Defectos

| ID | Severidad | Área | Título | Responsable | Estado |
|---|---|---|---|---|---|
| QA-017 | Baja | Accesibilidad / texto retirado (LEG-155) | El nombre accesible de «Agregar» en las tarjetas dice «en grano entero» | desarrollador-fullstack | Abierto |
| QA-018 | Media | Rendimiento | JS inicial de inicio ≈ 189 KB gzip, por encima del presupuesto de 150 KB (no es regresión) | desarrollador-fullstack | Abierto |
| QA-016 | Baja | Formulario / texto | El texto del desplegable «Cómo consulto de qué comuna soy» no está en el microcopy | legal-cumplimiento → desarrollador-fullstack | Estructura **cerrada**; texto **abierto** |
| QA-013 | Alta | Portada | Historia con superlativos | — | **Cerrado** (`qa-2026-11-12-cambios.spec.ts` pasa; variante B) |
| QA-014 | Media | `/legal/vendedor/` | Marcador de dato pendiente | — | **Cerrado** (prueba pasa; dirección desde `config.csv`) |
| QA-015 | Media | Privacidad | Dirección de notificación en el payload de todas las páginas | — | **Cerrado** (prueba pasa; solo `/legal/vendedor/` la trae con la forma de `config.csv`) |

### QA-017 — El nombre accesible de «Agregar» en las tarjetas dice «en grano entero»
- Severidad: Baja
- Entorno: Chromium, todos los viewports, `main` + cambios sin commit; `src/ui/componentes/carrito/boton-agregar.tsx:14`.
- Pasos: 1. Abrir `/`, `/cafes/` o `/provincias/guanenta/`. 2. Inspeccionar el botón «Agregar» de una tarjeta o escucharlo con un lector de pantalla.
- Esperado: sin «grano entero» (D5 §6.6 retira la terminología de molienda; LEG-155 y dictamen §9: «Ninguna página de `out/` contiene … «Grano entero»»). Por ejemplo, «Agregar Café Casa Martínez, 250 g en grano, al pedido». Además, el texto debe salir de la presentación que realmente se agrega (si un café solo tuviera «molido», hoy diría «grano entero» y agregaría molido).
- Obtenido: `aria-label="Agregar Café Casa Martínez, 250 g en grano entero, al pedido"` (también Arreboles) en el HTML estático y en el JS.
- Evidencia: `e2e/qa-2026-11-14-paquete-abogado.spec.ts` «QA-017…» falla con los dos `aria-label`.
- Prueba de cierre: esa misma prueba.
- Responsable sugerido: desarrollador-fullstack.

### QA-018 — JS inicial de inicio por encima de 150 KB gzip
- Severidad: Media (criterio de terminado de rendimiento; no bloquea por sí solo)
- Entorno: `npm run build`, `out/index.html`.
- Pasos: 1. `npm run build`. 2. Sumar el tamaño gzip -9 de cada `<script src>` de `out/index.html`.
- Esperado: ≤ 150 KB gzip (`docs/PROMPT-V2.md`, CALIDAD Y PRUEBAS).
- Obtenido: 193.376 B (≈ 189 KB). El mismo cálculo con el commit `043616a` construido aparte da 193.511 B: el exceso ya existía y esta ronda no lo aumenta. Mayores trozos: 71,7 KB, 45,5 KB y 39,4 KB (framework y bundle compartido).
- Evidencia: medición manual de esta ronda (no hay prueba automática; se recomienda agregarla con el presupuesto como umbral).
- Responsable sugerido: desarrollador-fullstack. Lighthouse móvil queda pendiente de ejecutar.

### QA-016 (seguimiento)
- Estructura: corregida. El `<details>` ya no va dentro del `<p>` ni dentro de la descripción accesible del select. Prueba nueva en `envio-gratis-comunas.spec.ts` («QA-016: el <details> no va dentro de un <p>…») pasa.
- Texto: «Cómo consulto de qué comuna soy» / «Escríbenos tu dirección por WhatsApp y te decimos a qué comuna pertenece.» sigue sin estar en `docs/legal/microcopy-legal.md` §8 ni en la sección 2 bis del dictamen. Pasa a legal-cumplimiento para aprobarlo o cambiarlo.

## Observaciones (no son defectos)
- El build de hoy (14/11, promoción «programada») ya publica en D1 y D3 los añadidos y el numeral 13 «rige desde el 17 de noviembre de 2026», aunque el resto del sitio no muestra la promoción. `npm run datos` dice «No aparece en el sitio», lo que es inexacto para los documentos. Sin efecto si, como está previsto, el único despliegue es el build del 17/11.
- La línea por cotizar del resumen se pinta como rótulo «Envío» + valor «por cotizar · te confirmamos el valor por WhatsApp antes de que pagues», con el plazo entre los dos en el texto lineal. Las palabras son las de D5 §6.3; el orden de lectura para un lector de pantalla queda «Envío, Entrega estimada…, por cotizar…». Revisar con disenador-marca.
- La descripción Open Graph de `/cafes/`, `/envios/` y las páginas legales es la genérica del sitio (la `meta description` sí es la propia).
- La línea por destino de Bogotá dice «Envío a Bogotá · zona 3» (nombre corto del municipio), no «Bogotá, D.C.». Es aceptable.
- Las suites e2e regeneran las capturas de `docs/qa/capturas/*.png`.

## Pruebas cambiadas o agregadas en esta ronda
- `e2e/envio-gratis-comunas.spec.ts`: el orden de foco ahora incluye el `<summary>` (el defecto estaba en la prueba) y Enter/Espacio sobre él; nueva prueba de cierre de QA-016.
- Nueva `e2e/qa-2026-11-14-paquete-abogado.spec.ts` (19 pruebas; los textos esperados se copiaron a mano del paquete): casillas, errores, casilla 4 sin correo, enlaces de las casillas 1 y 2, aviso de privacidad, resumen por zona 1 a 4 con plazos 3/6/6/10, por cotizar, mensaje D5 §6.4 línea por línea, número DS, flujo sin datos personales, pie a 360 y 1440, QA-017, axe a 360 y 1440, remisión.

## Paridad v1
Sin cambios de paridad funcional en esta ronda. Distintas a propósito (⚠️, decisiones del dueño o del abogado): sin contraentrega (solo transferencia o Bre-B), «Presentación: Grano · Molido» en lugar de «Molienda», número de solicitud DS generado en el navegador, cuatro casillas (dos de promociones nuevas), plazos máximos 3/6/6/10.

## Cobertura
`src/domain/`: líneas 99,84 %, ramas 96,69 %. Sin huecos relevantes (`numero-solicitud.ts`, rama 75 %, línea 20: el fallback `"00"` de `formatToParts`).

## Pendiente de decisión (no son defectos de QA)
- **Dueño**: LEG-147/D-11 (marca, fabricante, expresión del rótulo y titular de la NSA; hoy la Historia va en variante B y D1 §3 afirma datos que las fichas no traen); LEG-146 (Arreboles sin NSA, riesgo aceptado: el paquete dice lo contrario); LEG-156 (confirmaciones 1, 3 y 4 del numeral 8.3); LEG-159 (el botón del resumen sigue siendo «Preparar pedido para WhatsApp», D5 §6.3 dice «Enviar por WhatsApp»); LEG-164 (pedido mínimo sugerido y caja de zona 5 en `/envios/`); LEG-160 (operación de promociones); LEG-161 (contador).
- **Diseño (disenador-marca)**: casillas 3 y 4 sin enlace a la política (§7.3 del paquete pide que cada casilla enlace a su documento); ayuda bajo «Presentación»; estado «terminada» de la promoción; orden de lectura de la línea por cotizar.
- **Abogado**: validar los añadidos de la sección 2 bis (A1 a A3, B1 a B8, C1 a C3; LEG-167, LEG-169); C4 a C6 (DiDi y Uber, LEG-168); texto del desplegable de comuna (QA-016).
