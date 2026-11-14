# Ronda QA — contraentrega retirada, botones, historia de portada y vendedor — 2026-11-12

Rama `main`, commit base `043616a`, cambios sin commit. Chromium (Playwright), viewports de las suites existentes.
En paralelo, legal subió los documentos a versión 2 (docs/legal/*.md y `config.csv`); las fallas que vienen de eso van aparte y no son defectos de esta ronda.

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm run typecheck` | pasa |
| `npm run lint` | pasa |
| `npm test` (antes de v2 de legal) | pasa: 28 archivos, 503 pruebas |
| `npm test` (con v2 de legal) | 5 fallan en `src/infrastructure/legal/legal-md.test.ts` (bloque «envío gratis con los documentos de docs/legal/»): esperan que el numeral de envío gratis aún no esté publicado. Causa: documentos v2. |
| `npm run datos` | pasa (3 avisos conocidos). Durante la edición de legal falló un momento por versión 2 en los .md y 1 en `config.csv`; luego pasó con «versión 2, vigentes desde 2026-11-12». |
| `npm run build` | pasa (17 rutas) |
| `npx playwright test` (1.ª pasada, sin ajustar pruebas) | 97 pasan, 65 fallan, 47 omitidas: casi todo por los renombres de botones y la retirada de contraentrega |
| `npx playwright test` (pruebas ajustadas, build v1) | 153 pasan, 9 fallan (todas por v2 de legal), 47 omitidas |
| `npx playwright test` (pruebas ajustadas, build v2) | 154 pasan, 8 fallan (todas en `paquete-legal-v1.spec.ts` con «versión 1» fijo), 47 omitidas |
| `GITHUB_PAGES=true npm run build` + `E2E_BASEPATH_URL=… npx playwright test e2e/basepath.spec.ts` | 3 pasan |
| `npx playwright test e2e/qa-2026-11-12-cambios.spec.ts` | 3 fallan (criterio de cierre de QA-013, QA-014 y QA-015) |

Las 47 omitidas son las de `envio-gratis-comunas.spec.ts` que requieren la promoción encendida (`ENVIO_GRATIS_PRUEBA=si`); el desplegable de la comuna (cambio 5) no se pudo ejecutar porque la promoción está apagada.

Verificación manual en `out/` (texto visible con Playwright y búsqueda en el HTML):
- Portada: el texto nuevo de «Nuestra historia» aparece (ver QA-013).
- Pie y todas las páginas: sin «Notificaciones judiciales» ni «Calle 37» visibles. La dirección sigue en el payload RSC de 54 archivos (QA-015).
- `/legal/terminos/` (3 enlaces) y `/legal/privacidad/` (2 enlaces) enlazan a `/legal/vendedor/`. `/legal/envios-devoluciones/` también tiene 1.
- `/legal/vendedor/`: la fila «Dirección de notificación judicial» muestra «[nueva dirección inscrita en Cámara de Comercio: ___]» (QA-014).
- El cajón muestra «Revisar el pedido» y el paso de envío «Finalizar el pedido» (las pruebas de `pedido.spec.ts` pasan).
- «contraentrega»: no aparece en el texto visible de ninguna página con el build v2. En el build v1 seguía en 3 páginas legales; los documentos v2 de legal lo retiran.
- Paso 3 de «Cómo pedir»: «Pagas con transferencia Bre-B.»
- Secretos (`service_role|SANITY_API_TOKEN|sk…`): ninguno. Palabras prohibidas: «los mejores» ×3 en `index.html` (QA-013).

Veredicto: **NO APTO** (QA-013, de severidad Alta, sigue abierto).

## Defectos

| ID | Severidad | Área | Título | Responsable |
|---|---|---|---|---|
| QA-013 | Alta | Portada / contenido | La historia de portada trae superlativos, afirmaciones sin respaldo y un error gramatical | legal-cumplimiento (texto) → desarrollador-fullstack |
| QA-014 | Media | Legal / vendedor | `/legal/vendedor/` muestra un marcador de dato pendiente en la interfaz | desarrollador-fullstack (+ legal-cumplimiento) |
| QA-015 | Media | Privacidad / datos | La dirección de notificación retirada sigue publicada en el payload de todas las páginas | desarrollador-fullstack |
| QA-016 | Baja | Formulario / accesibilidad | El desplegable «Cómo consulto de qué comuna soy» va dentro de un `<p>` y su texto no está en el microcopy | desarrollador-fullstack (+ legal-cumplimiento) |

### QA-013 — La historia de portada trae superlativos, afirmaciones sin respaldo y un error gramatical
- Severidad: Alta
- Entorno: Chromium, 1280 px, `main` + cambios sin commit, `src/ui/componentes/layout/secciones-inicio.tsx` (`historiaRespaldo`)
- Pasos: 1. `npm run build`; 2. abrir `/`; 3. leer «Nuestra historia».
- Esperado: solo afirmaciones demostrables (CLAUDE.md, PRODUCT.md «Brand Commitments», modelo C, microcopy-legal §2) y sin «el mejor» ni equivalentes (marca v4.1).
- Obtenido: «De Santander es **mucho más una tienda**» (falta «que»); «puente directo entre **los mejores caficultores**» (superlativo prohibido; la tienda compra a marcas, no a caficultores); «**selección exclusiva**» (no demostrable); «tostados y empacados **directamente por sus productores**» (contradice el modelo C: el rótulo dice «FABRICADO POR» o «ENVASADO POR» y no siempre es el productor; PRODUCT.md retira las afirmaciones sobre procesos de terceros); «el proceso que lo hicieron único». Además se quitó la condición LEG-070 (nombrar marca y fabricante solo si todos los cafés los traen), aunque el comentario de la función todavía la cita. `grep "el mejor"` no lo detecta porque dice «los mejores».
- Evidencia: `e2e/qa-2026-11-12-cambios.spec.ts` › «QA-013» falla: el texto de `main` contiene «los mejores».
- Responsable: legal-cumplimiento (dictamen y texto) y luego desarrollador-fullstack.

### QA-014 — `/legal/vendedor/` muestra un marcador de dato pendiente en la interfaz
- Severidad: Media
- Entorno: Chromium, `src/app/legal/[slug]/page.tsx` (cadena fija en la tabla de vendedor)
- Pasos: 1. abrir `/legal/vendedor/`; 2. ver la fila «Dirección de notificación judicial».
- Esperado: CLAUDE.md, «No inventar datos»: si falta un dato, va como `TODO(dato)` en `docs/PENDIENTES.md` y **no se muestra en la interfaz**. La fila se omite (como las demás de la tabla, que solo salen si el dato existe) o muestra el dato real tomado de `config.csv`.
- Obtenido: «[nueva dirección inscrita en Cámara de Comercio: ___]», escrito a mano en el código de producción en vez de venir de `config.csv`. Nota para legal: términos y política ya no traen la dirección, y la política de datos la remite a «Información del vendedor». Legal debe confirmar que así se cumple el art. 13 del Decreto 1377 de 2013 (dirección del responsable en la política) y el deber de información del vendedor, ahora que esa página no tiene dirección.
- Evidencia: `e2e/qa-2026-11-12-cambios.spec.ts` › «QA-014» falla. `e2e/paquete-legal-v1.spec.ts:89` hoy **espera** el marcador. Cambiarlo cuando se corrija.
- Responsable: desarrollador-fullstack, con legal-cumplimiento para el texto o la omisión.

### QA-015 — La dirección de notificación retirada sigue publicada en el payload de todas las páginas
- Severidad: Media
- Entorno: `out/` de `npm run build`; `data/config.csv` sigue con `direccion_notificacion` = «Calle 37 n.° 23-77, apartamento 702, …»
- Pasos: 1. `npm run build`; 2. `grep -rl "Calle 37" out/ | wc -l`.
- Esperado: si la dirección se retiró de la interfaz porque ya no vale, no se publica en el sitio.
- Obtenido: 54 archivos (`index.html`, `*.txt` RSC) la llevan: el objeto `vendedor` completo se serializa a los componentes de cliente (`"direccionNotificacion":"Calle 37 …"`). Se ve en «ver código fuente».
- Evidencia: `e2e/qa-2026-11-12-cambios.spec.ts` › «QA-015» falla y lista los 54 archivos.
- Responsable: desarrollador-fullstack (no pasar el campo al cliente o vaciar `direccion_notificacion` en `config.csv` con `TODO(dato)` en PENDIENTES, según lo decida el dueño).

### QA-016 — El desplegable «Cómo consulto de qué comuna soy» va dentro de un `<p>` y su texto no está en el microcopy
- Severidad: Baja
- Entorno: `src/ui/componentes/checkout/formulario-envio.tsx`. `Campo` pinta `ayuda` dentro de `<p id="comuna-ayuda">`, y ahí queda el `<details>`.
- Pasos: con la promoción encendida (`ENVIO_GRATIS_PRUEBA=si`, no ejecutado en esta ronda), elegir Bucaramanga y ver la ayuda del campo «Comuna».
- Esperado: HTML válido (un `<p>` no puede contener `<details>`; React lo avisa en desarrollo) y una descripción accesible corta. Textos del campo tomados de `docs/legal/microcopy-legal.md` §8 (PRODUCT.md, decisión del 2026-11-09).
- Obtenido: `<details>` dentro de `<p>` y dentro de la descripción accesible del select (`aria-describedby="comuna-ayuda"`), con lo que el lector de pantalla también lee «Cómo consulto de qué comuna soy». El texto «Escríbenos tu dirección por WhatsApp y te decimos a qué comuna pertenece.» no está en el microcopy.
- Evidencia: revisión de código. No hay prueba automática porque la promoción está apagada. Al encenderla, agregar un caso en `envio-gratis-comunas.spec.ts`: sin `details` dentro de `p` y con una descripción accesible sin el `summary`.
- Responsable: desarrollador-fullstack; texto con legal-cumplimiento.

### Observaciones (no son defectos)
- UX: el botón del paso de envío dice «Finalizar el pedido», pero lleva al paso «Revisa tu pedido» y después hay que pulsar «Preparar pedido para WhatsApp». Puede hacer creer que el pedido ya se envió. Revisarlo con disenador-marca.
- Por la v2 de legal, deben actualizarse a las versiones de `config.csv` (no a «1» fijo): `e2e/paquete-legal-v1.spec.ts` líneas 62, 192, 193 y 279, y `src/infrastructure/legal/legal-md.test.ts` (5 casos de envío gratis). No se tocaron en esta ronda.
- Las suites e2e regeneran las capturas de `docs/qa/capturas/*.png` (aparecen modificadas en git).

## Pruebas cambiadas en esta ronda (solo por renombres y retiradas)
- Paso de envío `/Revisar el pedido/` → `/Finalizar el pedido/` (21 usos): `accesibilidad`, `autorizacion-datos`, `basepath`, `documento-postal`, `envios`, `legal-resumen-envios`, `paquete-legal-v1`, `pedido`, `select-superpuesto`, `verificacion-paquete-legal-v1`, `envio-gratis-comunas`.
- Cajón: `pedido.spec.ts` link `/Continuar con el pedido/` → `/Revisar el pedido/`.
- Radio «Efectivo contraentrega» → «Transferencia Bre-B»: `envios.spec.ts` (2), `envio-gratis-comunas.spec.ts`, `legal-resumen-envios.spec.ts` (además, la ayuda de contraentrega ahora se espera con `toHaveCount(0)`).
- `paquete-legal-v1.spec.ts`: la prueba de la ayuda de contraentrega se reemplazó por «solo transferencia Bre-B, sin opción ni ayuda de contraentrega».
- `envios.spec.ts`: `comision-incluida` ahora se espera con `toHaveCount(0)`. `verificacion-paquete-legal-v1.spec.ts`: se quitó `comision-incluida` del bucle de estilo y el paso 3 ahora espera «Pagas con transferencia Bre-B.».
- Ya venían del cambio y se revisaron: `paquete-legal-v1.spec.ts` (pie sin la línea de notificaciones, línea «Te vende…» sin dirección, tabla del vendedor con el marcador; ver QA-014) y `src/domain/pedido/tienda.test.ts`.
- Nuevo: `e2e/qa-2026-11-12-cambios.spec.ts` (QA-013 a QA-015).

## Paridad v1
Sin cambios de paridad en esta ronda, salvo que la v1 ofrecía «Efectivo contraentrega» y la v2 ya no (⚠️ distinta, por decisión del dueño). Falta registrar esa decisión en PRODUCT.md, que todavía dice «Pagos: efectivo contraentrega y transferencia Bre-B».

## Cobertura
Sin cambios en `src/domain/`. La cobertura no se volvió a medir en esta ronda.
