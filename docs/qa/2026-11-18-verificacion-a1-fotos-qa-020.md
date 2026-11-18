# Ronda QA — Verificación de A1 (flujo en tres pasos), fotos de inicio e Historia y QA-020 — 2026-11-18

Rama `feat/ux-auditoria`, HEAD `2bc61e8`. Cambios verificados: A1 (`5fd2edc`, `2dad5c4`, `1c64aa2`, `e046bdc`), fotos de inicio e Historia (`2bc61e8`), QA-020 (`2cd6bb2`). Chromium (Playwright 1.64), Linux. Puertos 4173 y 4180 libres antes de empezar; `out/` servido a mano con `npx serve out -l 4173 -n` (el `webServer` lo reutiliza) y el build con basePath, copiado bajo `/coffee-santander-shop/`, en 4180. Los dos servidores se cerraron al terminar.

Fuentes: `docs/diseno/2026-11-18-ux-auditoria-alta.md` (A1), `docs/legal/revisiones/2026-11-18-flujo-pedido-un-clic.md` v0.2 (LEG-171 a LEG-175, §4 bis, «Puntos para que QA verifique»), `docs/legal/microcopy-legal.md` v1.10 (§5.9, §9).

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm run lint` | pasa (0 errores), también con las pruebas nuevas |
| `npm run typecheck` | pasa |
| `npm test` | pasa: 36 archivos, 586 pruebas |
| `npx vitest run --coverage --coverage.include='src/domain/**'` | `src/domain/`: 99,66 % de sentencias, 96,74 % de ramas, 99,84 % de líneas (≥ 90 %) |
| `npx vitest run tools/fotos-responsivas.test.ts` (prueba de cierre de QA-020) | pasa |
| `NEXT_PUBLIC_SITE_URL=https://ejemplo.test npm run build` | pasa. `npm run datos`: 4 avisos que no bloquean (los conocidos). Fotos: «6 foto(s), 14 variante(s) nuevas, 28 al día». Postbuild: «6 foto(s) original(es) quitada(s) (6.4 MB)» |
| `GITHUB_PAGES=true NEXT_PUBLIC_SITE_URL=https://ejemplo.github.io/coffee-santander-shop npm run build` | pasa (el primer intento falló por una expresión regular con la bandera `/s` en mi prueba nueva: Next también revisa los tipos de `e2e/`; la corregí antes de seguir) |
| `npx playwright test` (suite completa, primera corrida, antes de mis pruebas) | **282 pasan, 0 fallan**, 24 omitidas |
| `npx playwright test` (suite completa, final, con mis pruebas) | **307 pasan, 4 fallan**, 26 omitidas. Las 4 que fallan son las pruebas de cierre de QA-022 (2), QA-023 y QA-024. Las omitidas son las de basePath (sin `E2E_BASEPATH_URL`), las de fechas del envío gratis, las comparaciones A2 contra otros commits y la de la ficha agotada |
| `E2E_BASEPATH_URL=http://localhost:4180 npx playwright test e2e/basepath.spec.ts e2e/qa-2026-11-18-fotos-*.spec.ts e2e/qa-2026-11-18-flujo-tres-pasos.spec.ts -g basePath` | 3 + 13 + 1 pasan, 0 fallan |
| `npx playwright test e2e/qa-2026-11-18-flujo-tres-pasos.spec.ts e2e/qa-2026-11-18-fotos-inicio.spec.ts e2e/flujo-tres-pasos.spec.ts --repeat-each 4` | 128 pasan, 16 fallan (las 4 pruebas de defectos × 4, siempre las mismas). Ninguna intermitente |
| `grep -riE "gourmet|premium|exótic|mágic|el mejor|Café de Santander" out/` (HTML) | sin coincidencias |
| `grep -rEi "service_role|SANITY_API_TOKEN|sk[A-Za-z0-9]{20,}" out/` | sin coincidencias |
| `grep -rl` en `out/` de «Finalizar el pedido», «Revisar el pedido», «Preparar pedido», «Abrir WhatsApp», «Tu pedido está listo», «Confirmación», «Para preparar tu pedido», «paso=confirmacion» | 0 archivos con cada uno |

Sin verificar: Firefox (no está instalado) y WebKit/Safari iOS (no arranca sin `libavif16` ni `libmanette`, igual que en la ronda anterior). La apertura dentro del gesto se comprobó en Chromium con `navigator.userActivation.isActive` (prueba del desarrollador) y con la tecla Enter (prueba nueva).

**Veredicto: APTO CON OBSERVACIONES.** A1 cumple LEG-172 (bloqueante), LEG-171, LEG-174 y LEG-175. LEG-173 se cumple salvo un caso (QA-022, Media). Las fotos y QA-020 quedan cerrados. Quedan abiertos tres defectos de esta ronda (dos Media y uno Baja), además de QA-017 (Baja) y QA-018 (Media) de rondas anteriores. Ninguno es Bloqueante ni Alta.

## 1. A1, flujo del pedido en tres pasos: APTO CON OBSERVACIONES

| Punto | Resultado | Evidencia |
|---|---|---|
| Un clic con las casillas 1 y 2 abre `wa.me` dentro del gesto (`window.open` síncrono), con la constancia v1.0 y el número DS | ✅ | `flujo-tres-pasos.spec.ts` («window.open corre dentro del gesto…»: `userActivation.isActive = true`, una sola apertura). Prueba nueva con Enter: una sola llamada a `window.open`, `https://wa.me/573001129874?text=…`, constancia «Acepto los Términos v1.0 … Política v1.0 del 17 de noviembre de 2026.» y número `DS-AAMMDD-HHMM-XXXX`. El código llama a `window.open` sin `await`, `setTimeout` ni `requestAnimationFrame` antes |
| Sin la casilla 1 o la 2: ninguna pestaña, ningún respaldo, ningún número DS; el foco va a la primera casilla sin marcar | ✅ | Prueba nueva con espías: `crypto.getRandomValues` (de donde sale el sufijo DS) no se llama y `window.open` tampoco, ni con clic, ni con Enter, ni con Espacio. Tampoco con la casilla 3 marcada y la 2 sin marcar. Foco: sin ninguna → términos; solo términos → datos; solo datos → términos. Las casillas no se marcan solas |
| Microayuda y errores letra por letra (§5.9 v1.10) | ✅ | Los tres textos «Para enviar tu pedido…», con los términos antes de los datos, y «Debes aceptar los términos para continuar.» / «Debes autorizar el tratamiento de tus datos para continuar.» |
| El respaldo «Copiar mensaje» copia lo mismo que el enlace | ✅ | Portapapeles = `text` del enlace; `<pre>` de «Ver el mensaje» igual; `details` cerrado por defecto |
| El respaldo se oculta al cambiar una casilla, un dato o el carrito (también desde otra pestaña o desde el cajón) | ✅ con una excepción | Pasa al cambiar la casilla 3, la dirección, el carrito desde otra pestaña y la cantidad desde el cajón en la misma pestaña (y el clic siguiente da un DS nuevo). **Excepción, QA-022:** si se deshace el cambio (se marca y desmarca una casilla, o se desmarca y se vuelve a marcar la 1), el respaldo vuelve a aparecer sin un clic nuevo |
| Segundo clic sin cambios → mismo DS; con un cambio → DS nuevo (§4 bis) | ✅ | Mismo `href` en el segundo clic; DS distinto tras marcar promociones o cambiar la cantidad |
| `?paso=envio`, `carrito`, `confirmacion` u otro valor → `/pedido/` | ✅ | Prueba nueva (4 valores), también bajo basePath (`/coffee-santander-shop/pedido/`) |
| Recargar en el Resumen vuelve a Envío | ✅ | URL `/pedido/` y formulario vacío (los datos solo viven en memoria) |
| Indicador «Pedido · Envío · Resumen» en una línea a 360 px; a 320 px solo el rótulo del paso actual | ✅ | Alto del indicador < 50 px a 360 y a 320; a 320, los rótulos de los pasos no actuales miden ≤ 1 px (`sr-only`) |
| Nombre accesible del paso hecho | ⚠️ QA-024 | Chromium calcula `button "Pedido , hecho"` y `link "Envío , hecho"` |
| Variante «por cotizar» de LEG-171 | ✅ | Leticia: texto por cotizar exacto, nota «Este valor no incluye el envío…» y «Envío: POR COTIZAR (zona 5 o más de 5 kg)» en el mensaje; al volver a Bucaramanga, la variante con tarifa y sin nota |
| Aviso de privacidad sigue en Envío (y no en el Resumen) | ✅ | `aviso-privacidad` visible en Envío y con 0 apariciones en el Resumen |
| Sin «Finalizar», «Confirmación», «Abrir WhatsApp», «Preparar pedido» ni un segundo «Enviar por WhatsApp» | ✅ | `innerText` del `body` tras abrir el respaldo; un solo «Enviar por WhatsApp»; ningún `aria-label` con «Abrir WhatsApp»; `grep` en `out/` sin coincidencias |
| Textos de los botones (§9.1) | ✅ | «Continuar con el envío» (`href="/pedido/"`), «Ver el resumen», «Editar» (nombre «Editar el pedido»), «Seguir viendo cafés», «Volver al envío», «Copiar mensaje», «Ver el mensaje», «Vaciar pedido». Las flechas son iconos (`IconoFlecha`) y no forman parte del texto |
| Textos de LEG-171 y del respaldo (§9.3, §9.4) | ✅ | Comparados con `toHaveText`, letra por letra, contra la microcopy v1.10 |
| Foco tras abrir: se queda en el botón; el respaldo se anuncia con `role="status"`; dos Tab llevan a «Copiar mensaje» (pasando por «Volver al envío») | ✅ | Prueba nueva |
| axe (WCAG 2.2 AA, serias y críticas) a 360 y 1.280 px, tema claro y oscuro: Envío, Envío con errores, Resumen con errores de casillas, Resumen con el respaldo y «Ver el mensaje» abierto | ✅ 0 violaciones | 4 pruebas nuevas. Capturas del respaldo: `docs/qa/capturas/2026-11-18-a1-respaldo-{360,1280}-{light,dark}.png` |
| Error de líneas (M9, fila 5) | No alcanzable | El carrito descarta las líneas agotadas o inexistentes al cargar y al sincronizar entre pestañas, así que `prepararPedido` no falla por líneas desde la interfaz. Prueba nueva: con Casa Martínez 250 g agotada en el HTML servido (`page.route`, sin tocar los CSV) y agregada desde otra pestaña, el mensaje no la lleva. La caja `error-lineas` ya se había medido por inyección en la ronda A2/M9 |
| Presupuesto de altura a 360 × 740 (casilla 1 y botón en la misma pantalla) | ❌ QA-023 | 789 px medidos, con 665 px de altura útil |

**LEG-159: verificado.** «Enviar por WhatsApp» del resumen abre `wa.me` en el mismo clic, como dice D1 §5. Legal puede cerrarlo. LEG-172 (bloqueante) y LEG-171 también quedan verificados. LEG-173 queda verificado salvo QA-022.

## 2. Fotos de inicio e Historia (`2bc61e8`): APTO

| Punto | Resultado |
|---|---|
| Variantes en `/fotos-optimizadas/assets/fotografia/` (AVIF/WebP 400/800/1200 y JPEG 1200) de `cafetal-montana` y `chicamocha-canon` | ✅ |
| Historia del inicio en `<picture>` con AVIF y WebP, `<img>` con el JPEG 1200, `loading="lazy"`, sin `fetchpriority`, con `width` y `height` | ✅ |
| No se pide antes de desplazarse (lazy) | ✅ ninguna petición a `cafetal-montana` antes de desplazarse, en los 5 viewports |
| Variante elegida (AVIF) = menor ≥ ancho CSS × DPR | ✅ 360 DPR 1: caja de 320 px → 400 · 390 DPR 3: 350 px → 1200 · 1024: 456 px → 800 · 1100: 494 px → 800 · 1440: 552 px → 800 |
| CLS al desplazarse hasta la Historia | ✅ 0 a 360 y a 1440 |
| `out/assets/fotografia/` sin originales; ninguna página HTML de `out/` enlaza el original | ✅ |
| Postbuild falla y no borra si se inyecta `/assets/fotografia/cafetal-montana.jpg` en el HTML, en un `style` en línea con basePath o en el CSS de `_next/static` con `?v=` | ✅ (3 casos y el control negativo, que pasa y borra) |
| `GITHUB_PAGES=true`: la foto sale de `/coffee-santander-shop/fotos-optimizadas/assets/fotografia/…`, todos los `srcset` llevan el prefijo y ninguna respuesta da 404; `og:image` y JSON-LD de la ficha con `NEXT_PUBLIC_SITE_URL` responden 200 `image/jpeg` | ✅ |
| LEG-104 (alt neutro exacto, sin `figcaption`) | ✅ pasa `verificacion-paquete-legal-v1.spec.ts` |

**Cambio del desarrollador en `e2e/qa-2026-11-18-fotos-responsivas.spec.ts`: no se queda.** Con `rutaVariante()` la ruta esperada salía del mismo código de producción que genera las variantes: si el mapeo se equivoca, el build y la prueba se equivocan igual y la prueba no lo detecta. Lo reemplacé por un mapeo escrito en la prueba (`/fotos/` → `/fotos-optimizadas/`, `/assets/fotografia/` → `/fotos-optimizadas/assets/fotografia/`), con una aserción que falla si aparece un original fuera de esas dos carpetas. La comprobación de «sin originales» se amplió a `out/assets/fotografia/`. Ya no importa nada de `src/`.

## 3. QA-020: Cerrado

`sharp ^0.35.5` en `devDependencies`. En `package-lock.json`, `node_modules/sharp` deja de ser `optional` (`npm ls sharp`: directo y deduplicado bajo `next`). La prueba de cierre `tools/fotos-responsivas.test.ts` pasa y los dos builds pasan. Queda una salvedad, propia de sharp: sus binarios por plataforma (`@img/sharp-*`) siguen siendo dependencias opcionales de sharp, así que con `--omit=optional` el build seguiría fallando. No es un defecto del repositorio.

## Defectos

| ID | Severidad | Área | Título | Responsable | Estado |
|---|---|---|---|---|---|
| QA-020 | Media | Build / dependencias | `sharp` no está declarado como dependencia | desarrollador-fullstack | **Cerrado** |
| QA-022 | Media | Pedido / LEG-173 | El respaldo «¿No se abrió WhatsApp?» reaparece sin un clic nuevo al deshacer un cambio | desarrollador-fullstack | Abierto |
| QA-023 | Media | Diseño / Resumen 360 px | La casilla 1 y «Enviar por WhatsApp» no caben en una pantalla de 360 × 740 (789 px de 665) | disenador-marca (especificación), luego desarrollador-fullstack | Abierto |
| QA-024 | Baja | Accesibilidad / indicador | El nombre accesible del paso hecho es «Pedido , hecho» | desarrollador-fullstack | Abierto |

### QA-022 — El respaldo «¿No se abrió WhatsApp?» reaparece sin un clic nuevo al deshacer un cambio
- Severidad: Media
- Entorno: Chromium 1.64 (headless), 1280 × 720, rama `feat/ux-auditoria`, commit `2bc61e8`
- Pasos para reproducir: 1. Llegar al Resumen con un café y Bucaramanga. 2. Marcar las casillas 1 y 2 y pulsar «Enviar por WhatsApp» (aparece el respaldo). 3. Marcar la casilla de promociones por WhatsApp (el respaldo se oculta). 4. Desmarcarla. Variante: en el paso 3, desmarcar la casilla 1, y en el 4 volver a marcarla.
- Resultado esperado: LEG-173 (2) y microcopy §9.4: si cambia cualquiera de las cuatro casillas, el respaldo «se oculta hasta un nuevo clic válido» y el siguiente clic genera número y texto nuevos.
- Resultado obtenido: en el paso 4 el respaldo vuelve a aparecer, con el número DS anterior, sin que la persona pulse nada. La causa es que `vigente` compara la firma actual con la del último `resultado`, y `resultado` no se borra al cambiar algo (`flujo-pedido.tsx`, `const vigente = resultado && resultado.firma === firma ? …`). Al deshacer el cambio, la firma vuelve a coincidir. Además, la línea `role="status"` se monta de nuevo y se anuncia otra vez. Riesgo legal bajo, porque el texto que reaparece corresponde al estado de la pantalla, casillas 1 y 2 incluidas. Pero el comportamiento no es el que aprobó legal y deja copiar un mensaje que no salió de un clic.
- Evidencia: `e2e/qa-2026-11-18-flujo-tres-pasos.spec.ts`, pruebas «LEG-173: el respaldo no reaparece sin un nuevo clic al deshacer un cambio (casilla opcional)» y «… al desmarcar y volver a marcar la casilla 1»: `Expected: 0, Received: 1` (4 de 4 repeticiones). Traza: `test-results/qa-2026-11-18-flujo-tres-p-c207a-un-cambio-casilla-opcional--chromium/trace.zip`.
- Prueba de cierre: esas dos pruebas. También debe seguir pasando «§4 bis 1: segundo clic sin cambios, mismo enlace y mismo número» de `e2e/flujo-tres-pasos.spec.ts`.
- Responsable sugerido: desarrollador-fullstack

### QA-023 — La casilla 1 y «Enviar por WhatsApp» no caben en una pantalla de 360 × 740
- Severidad: Media (el flujo funciona; falla una condición de diseño que legal pidió: «sin separar el botón de las casillas» a 360 × 740)
- Entorno: Chromium 1.64, 360 × 740, DPR 1, rama `feat/ux-auditoria`, commit `2bc61e8`, Resumen con envío a Bucaramanga, sin errores
- Pasos para reproducir: 1. Llegar al Resumen a 360 × 740. 2. Medir desde el borde superior de la casilla 1 hasta el borde inferior de «Enviar por WhatsApp».
- Resultado esperado: A1, «El botón no se separa de las casillas»: presupuesto ≈ 660 px, que cabe en 740 px menos el encabezado fijo.
- Resultado obtenido: **789 px**, con una altura útil de **665 px** (740 − 75 px del encabezado). Sobran 124 px. Con la casilla 1 justo bajo el encabezado, la pantalla termina a mitad del texto de LEG-171; la microayuda y el botón quedan abajo. El presupuesto de la especificación subestimó las casillas legales: la casilla 2 ocupa nueve líneas a 360 px y la de promociones, seis. Entre la casilla 1 y el botón solo está lo que la especificación enumera (promociones, vendedor, LEG-171, microayuda), así que no hay nada que sobre: hace falta una decisión de diseño. Por ejemplo, reducir las separaciones, poner la microayuda dentro del botón o justo encima, o aceptar el desplazamiento y aclararlo con legal. Esos textos legales no se pueden recortar.
- Evidencia: prueba «altura a 360 × 740: casilla 1 → borde inferior del botón» (`Expected: <= 665, Received: 789`); captura `docs/qa/capturas/2026-11-18-a1-resumen-360-casilla1.png`; la anotación `casilla-1-a-boton-360` de `e2e/flujo-tres-pasos.spec.ts` da la misma medida.
- Prueba de cierre: esa prueba. Si diseño y legal deciden que el presupuesto no aplica, se cambia la aserción con la decisión citada.
- Responsable sugerido: disenador-marca (nueva especificación de alturas); después desarrollador-fullstack. Conviene informar a legal-cumplimiento, porque la condición salió de su dictamen («Para disenador-marca»).

### QA-024 — El nombre accesible del paso hecho es «Pedido , hecho»
- Severidad: Baja
- Entorno: Chromium 1.64, cualquier viewport, Resumen, commit `2bc61e8`
- Pasos para reproducir: 1. Llegar al Resumen. 2. Leer el árbol de accesibilidad de `list "Pasos del pedido"`.
- Resultado esperado: `button "Pedido, hecho"` y `link "Envío, hecho"`, como dice la especificación («más ", hecho" en sr-only»).
- Resultado obtenido: `button "Pedido , hecho"` y `link "Envío , hecho"`. El `span.sr-only` tiene `position:absolute`, Chromium lo trata como bloque y mete un espacio al calcular el nombre. Los lectores suelen leer igual la pausa de la coma, así que el impacto es pequeño. Pero el nombre no es el especificado, y una prueba o un comando de voz («pulsar Pedido, hecho») no lo encuentra con ese texto. Corrección posible: `aria-label={`${titulo}, hecho`}` en el botón y en el enlace, o el sufijo sin un elemento `sr-only` aparte.
- Evidencia: prueba «indicador: árbol de accesibilidad de los pasos (nombre del paso hecho)» (falla con el árbol `button "Pedido , hecho"` en el mensaje).
- Prueba de cierre: esa prueba.
- Responsable sugerido: desarrollador-fullstack

## Paridad v1

Sin cambios respecto a la ronda anterior en las funciones del inventario. El paso «Carrito» de `/pedido/` desaparece. Su función (editar líneas y cantidades) sigue en el cajón, al que se llega desde «Editar» del bloque «Tu pedido» y desde «Pedido» del indicador: ⚠️ distinta (pantalla propia → cajón), ✅ en capacidad.

## Cobertura

- Pruebas nuevas: `e2e/qa-2026-11-18-flujo-tres-pasos.spec.ts` (17: 16 contra `out/` y 1 bajo basePath) y `e2e/qa-2026-11-18-fotos-inicio.spec.ts` (14: 13 contra `out/` y 1 bajo basePath).
- Modificada: `e2e/qa-2026-11-18-fotos-responsivas.spec.ts` (mapeo independiente de `rutaVariante()` y `out/assets/fotografia/` en la comprobación de originales).
- Capturas regeneradas por la suite (flujo nuevo): `docs/qa/capturas/resumen-*.png`, `envio-*.png`, `autorizacion-datos-*.png`, `boton-aria-disabled-360.png`, `documento-postal-errores-*.png`, `ppt-*.png`, `qa-005-departamento-360.png`, `2026-11-14-resumen-casillas-*.png` y `2026-11-18-m9-*.png`.
- `src/domain/`: 99,66 % de sentencias (≥ 90 %).
- No cubierto: Firefox y Safari iOS (sin navegador en el entorno), y la caja de error de líneas en uso real (no se puede provocar desde el cliente).
