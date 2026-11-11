# Ronda QA — Envío gratis por comunas de Bucaramanga — 2026-11-09

Rama `feat/envio-gratis-comunas`, HEAD `7079157` (sin push). Chromium (Playwright 1.64), servidor propio `serve` en 4173, detenido al terminar. Fuentes: `docs/diseno/2026-11-09-envio-gratis-comunas.md`, `docs/legal/microcopy-legal.md` §8 (v1.4), `docs/legal/revisiones/2026-11-09-verificacion-envio-gratis.md` (LEG-128, «Puntos para que QA verifique»), `PRODUCT.md`, `docs/ENVIOS.md` §7.

Promoción encendida **solo en prueba**: `envio_gratis_desde,2026-11-06` en `data/config.csv` + `ENVIO_GRATIS_PRUEBA=si npm run build` (nunca con `GITHUB_PAGES=true`). Al terminar se restauró `config.csv` con `git checkout` (`envio_gratis_desde` y `envio_gratis_hasta` vacías; `git diff data/` vacío) y se reconstruyó `out/` apagado.

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm run lint` | pasa (exit 0) |
| `npm run typecheck` | pasa (exit 0) |
| `npx vitest run --coverage` | pasa: 28 archivos, 488 pruebas (antes 27/430; +58 nuevas). `src/domain`: 99,75 % sentencias, 96,73 % ramas, 99,6 % funciones, 100 % líneas |
| `npm run datos` (apagada) | pasa; «Envío gratis por comunas: apagado»; 3 avisos de siempre |
| `npm run build` (apagada) | pasa |
| `npm run e2e` (apagada, antes de las pruebas nuevas) | 160 pasan, 4 omitidas (basePath) |
| `npm run e2e` (apagada, final, con las pruebas nuevas) | **162 pasan**, 38 omitidas (4 basePath + 34 que exigen la promoción encendida) |
| Promoción encendida **sin** `ENVIO_GRATIS_PRUEBA`: `npm run datos` | **falla** (exit 1) con 3 errores claros (falta el numeral de la nota E y las salvedades de términos §6 y envíos §3; LEG-106) y 1 aviso (política sin «comuna») |
| Idem: `npx next build` | **falla** (exit 1) al prerenderizar `/envios`: «el texto publicado no tiene el numeral … (LEG-106)» |
| `GITHUB_PAGES=true ENVIO_GRATIS_PRUEBA=si npm run datos` | **falla** con «ENVIO_GRATIS_PRUEBA=si no se puede usar en el despliegue…» |
| `ENVIO_GRATIS_PRUEBA=si npm run datos` con `envio_gratis_hasta` = 2026-11-16 / 11-12 / 11-09 / 11-08 | exit 0 los cuatro, y **avisa** en los cuatro: a 7 días («vence en 7 días… reconstruir y desplegar el 2026-11-17»), a 3, «vence hoy» y «ya pasó». Ver QA-010 |
| Idem con `envio_gratis_hasta` 2026-11-05 (< desde) | falla con «es anterior a envio_gratis_desde» |
| `ENVIO_GRATIS_PRUEBA=si npm run build` | pasa |
| `e2e/envio-gratis-comunas.spec.ts` (nuevo) contra el build encendido | 34/34 pasan (4 corridas completas seguidas sin fallos; pruebas de axe con `--repeat-each=10`: 40/40) |
| `npx playwright test` completo contra el build encendido | 193 pasan, 1 falla, 6 omitidas. La falla era de la propia suite (`paquete-legal-v1.spec.ts:394` fijaba la leyenda sin la salvedad que §8.5 exige con la promoción). Corregida en la prueba; esa prueba vuelve a pasar en la corrida apagada |
| `rg -i "Envío gratis\|Cabecera del Llano\|comuna" out/**/*.html out/**/*.txt` (apagada) | 0 |
| `rg "Envío gratis en Bucaramanga\|Domicilio gratis\|envío gratis a todo\|Entrega el mismo día" src out` (apagada y encendida) | 0, salvo la lista de vigilancia de `envio-gratis.test.ts` |
| `rg "shippingRate\|OfferShippingDetails\|shippingDetails" out` (apagada y encendida) | 0 |
| Texto visible (texto + `href`/`id`/`content`/`alt`/`aria-label`) de las 22 páginas: build de `e4c4163` (anterior a la función) contra build apagado de `7079157` | **idéntico en todas**, también `/envios/`, JSON-LD y metadatos. Mismo conjunto de archivos fuera de `_next/` |
| Idem apagado contra encendido | solo cambian `/envios/` (§8.5) e inicio (§8.6). Ninguna otra página, ningún `meta` ni JSON-LD |

Veredicto: **APTO CON OBSERVACIONES** (con la promoción apagada, que es como queda la rama). Encender la promoción sigue bloqueado por legal (LEG-106, P33, D-19), no por QA.

## Verificación por punto (promoción encendida salvo que se diga)

**Dominio con los CSV reales** (`src/infrastructure/csv/envio-gratis-datos-reales.test.ts`, promoción encendida en memoria, sin tocar el disco):
- Las 7 comunas × 1, 2, 5, 6, 10 y 30 kg (42 casos): `$0`, `sinEnvio: false` («Total»), plazo `TEXTOS_ENVIO_GRATIS.plazoResumen` (nunca «5 a 12 días hábiles»), alternativa de zona 1 $8.800 / $11.600 / $15.400 hasta 5 kg y «por cotizar, más de 5 kg» desde 6 kg, frase de la región viva de LEG-120. Pasa.
- Sin comuna, `""`, «otra», «Norte», «Cabecera»: tarifa $8.800 con 1 kg; por cotizar y «Total sin envío» con 6 kg. Floridablanca, Piedecuesta y Girón con «Centro»: tarifa normal. Apagada: la comuna se ignora. Pasa.
- La comuna fuera de la lista y la de otro municipio se descartan al validar (`comuna: undefined`). Pasa.

**Interfaz, paso Envío (e2e):**
- Campo solo con Bucaramanga; no aparece con Floridablanca, Piedecuesta, Girón ni Bogotá. Opciones exactas de §8.2 (alfabéticas + «Otra comuna o no la sé»), `autocomplete="off"`, sin `aria-invalid`, `aria-describedby="comuna-ayuda"`, ayuda sin comuna y con comuna letra por letra, «Condiciones» → `/envios/#envio-gratis`. Pasa.
- Se vacía y desmonta al cambiar municipio (Floridablanca) y departamento (Antioquia); al volver a Bucaramanga queda en «Elige tu comuna» y el envío vuelve a $8.800. Pasa.
- Cada comuna con 1 kg: rótulo «Envío a Bucaramanga · zona 1 · {comuna}», «Envío gratis» + «$0», nota `referencia-tarifa` exacta («… el envío es de $8.800 y el total queda en $102.800; …»), plazo propio, `Total $94.000`. Cabecera del Llano con 2, 5, 6, 10 y 30 kg: «Total» = subtotal, nunca «Total sin envío» ni «Por cotizar». Pasa.
- «Otra comuna o no la sé» y sin elegir, con 6 kg: «Por cotizar», «Total sin envío $564.000», sin etiqueta. Pasa.
- Región `role="status"` (`aria-live="polite"`, `aria-atomic="true"`): vacía al entrar y al volver con «Editar» desde el resumen; «Envío: $8.800. Total: $102.800.» → «Envío gratis en Ciudadela Real de Minas, sujeto a verificar tu dirección: $0. Total: $94.000.» (LEG-120 exacto) → «Envío: $8.800…» con «Otra» → «Envío: $10.500. Total: $104.500.» con Girón. El contenedor de totales ya no es región viva; en el formulario hay una sola. Pasa. **No ejecutado:** prueba con NVDA/VoiceOver real (sin lector en este entorno).
- Foco con Tab: Municipio → Comuna → «Condiciones» → Código postal. Pasa.
- Rejilla: a 360 px Comuna bajo Municipio y Código postal debajo (gap 20 px); a 1280 px Comuna | Código postal en la misma fila y Dirección en la fila siguiente, sin celda vacía. Pasa.
- `prefers-reduced-motion`: sin la preferencia, `transition: opacity 0.15s cubic-bezier(0,0,.2,1)`; con `reduce`, 0,01 ms (regla global) y opacidad 1. El cambio de tarifa a $0 no crea animaciones. Pasa.
- Línea base: «Envío gratis», «$0» y «Envío a Bucaramanga» comparten línea base (± 1 px, sonda inline-block) a 360 y 1280 px. Pasa. Capturas: `docs/qa/capturas/envio-gratis-totales-360.png`, `envio-gratis-totales-1280.png`, `envio-gratis-campo-360.png`.
- Clases: ninguna `hoja-*`, `success`, `oro`, `grana`, `chicamocha`, `accent`, `terracota`, `ds-tag--origen` ni `ds-badge--region` en el campo, la línea de envío, el total, la sección y notas de `/envios/` ni el anuncio de inicio. Pasa.

**Resumen y mensaje de WhatsApp:**
- Resumen: «Comuna: Ciudadela Real de Minas» en la tarjeta «Envío a», etiqueta y «Total $94.000», sin aviso de por cotizar. Con «Otra», sin línea de comuna. Pasa.
- Mensaje (todos los campos al máximo: nombre 80, correo 110, pasaporte 20, código postal, dirección 120, barrio 60, indicaciones 300): líneas exactas de §8.4 (envío `$0 (envío gratis, sujeto a verificar la dirección)`, `Total:`, plazo bajo Total, `Comuna:` justo tras `Dirección:`, línea de verificación antes de la constancia), 2.000 caracteres o menos. Con 60 kg en 8 líneas de 20 bolsas: variante «quedo atento…», ≤ 2.000. Sin comuna: ninguna línea nueva. Pasa.

**Privacidad:** tras el recorrido completo con «Cabecera del Llano», nada con «cabecera» ni «comuna» en `localStorage`, `sessionStorage`, cookies, `history.state`, las URL navegadas ni la URL o el cuerpo de ninguna petición; ninguna petición sale de `localhost`. Pasa (LEG-114 confirmado en ejecución).

**`/envios/`:** párrafo inicial (LEG-121), nota enlazada solo en la fila de Bucaramanga, salvedad bajo la tabla, sección `#envio-gratis` con el numeral del borrador y la lista alfabética de 7 comunas dentro del ancho de los párrafos, enlace final a `/legal/envios-devoluciones/`, `dd` de zona 1 con «ver condiciones» enlazado (LEG-123), `dd` de zona 5, caja de cotizar (LEG-122), título visible bajo el encabezado fijo al llegar por el ancla, sin «gratis» en `meta` ni JSON-LD. Pasa. Captura: `envio-gratis-envios-360.png` (el encabezado y la barra «Ver pedido» fijos se superponen en la captura de elemento largo; no ocurre en la vista real).

**Cajón e inicio:** «Envío gratis en siete comunas de Bucaramanga. Ver condiciones», el enlace lleva a `/envios/#envio-gratis` y cierra el cajón; en inicio el enlace mide ≥ 24 px de alto. Captura: `envio-gratis-cajon-360.png`.

**Axe (wcag2a/aa, 21a/aa), 360 y 1280 px:** paso Envío en estados A, B, C (comuna más larga) y D, resumen en estado C, cajón, `/envios/#envio-gratis` e inicio: 0 violaciones serias o críticas; sin desborde horizontal. Nota: en una corrida axe midió durante el fundido de 150 ms del campo y dio violaciones transitorias de contraste; la prueba ahora espera a que terminen las animaciones (no es un defecto: un lector humano no lee a mitad de 150 ms; no se repitió en 40 corridas).

**Apagada:** Bucaramanga sin campo, 6 kg «por cotizar», cajón, `/envios/` e inicio sin «gratis» ni «comuna» (e2e). Visible idéntico al build anterior a la función (ver tabla). Observación: los bundles JS (`out/_next/static/chunks/`) sí contienen los textos fijos de `TEXTOS_ENVIO_GRATIS` (no los nombres de comunas, que salen del CSV); no se muestran ni se indexan.

## Defectos

| ID | Severidad | Área | Título | Responsable | Estado |
|---|---|---|---|---|---|
| QA-010 | Baja | Datos (`tools/validar-datos.ts`) | Con la promoción vencida, `npm run datos` dice «si empieza después, hay que reconstruir ese día» | desarrollador-fullstack | **Cerrado** (ronda 2) |

### QA-010 — Mensaje de `npm run datos` engañoso con la promoción vencida
- Severidad: Baja
- Estado: **Cerrado** (ronda 2, 2026-11-09, HEAD `dc10290`; ver abajo). Antes: Corregido — pendiente verificación (commit: ver `git log --grep QA-010`, `fix(datos)`). Causa raíz: `tools/validar-datos.ts` usaba una sola frase para todo caso «no rige hoy» sin distinguir inicio futuro de fecha final pasada; ahora la línea sale de `lineaPromocionNoVigente` (`src/domain/envio/envio-gratis.ts`, con pruebas) y dice «programada… hay que reconstruir y desplegar el {desde}» o «vencida… No aparece en el sitio construido hoy». Sigue avisando con código 0. *Actualización (`3df9d80`, P34 b):* `envio_gratis_hasta` se retiró (llenarla hace fallar `npm run datos`), así que los pasos de abajo ya no aplican tal cual: «vencida» pasa a ser «terminada» con `envio_gratis_terminada`. Para verificar: `envio_gratis_desde,2026-11-06` y `envio_gratis_terminada,2026-11-09` → «terminada el 2026-11-09…» sin hablar de empezar; `envio_gratis_desde,2026-11-12` vacía la otra → «programada… reconstruir y desplegar el 2026-11-12».
- Entorno: Node 22, rama `feat/envio-gratis-comunas`, commit `7079157`, fecha del sistema 2026-11-09.
- Pasos para reproducir: 1. En `data/config.csv`, `envio_gratis_desde,2026-11-06` y `envio_gratis_hasta,2026-11-08`. 2. `npm run datos`. 3. Restaurar `config.csv`.
- Resultado esperado: con `hasta` ya pasada, una línea que diga que la promoción terminó (y el aviso de LEG-125 que ya sale).
- Resultado obtenido: `Envío gratis por comunas: no rige hoy (2026-11-09); vigencia 2026-11-06 a 2026-11-08. No aparece en el sitio; si empieza después, hay que reconstruir ese día.` La segunda frase solo tiene sentido con `desde` en el futuro. El aviso de LEG-125 sí sale bien.
- Evidencia: salida de consola de la ronda (tabla de comandos). No es automatizable sin capturar la consola de `tools/`; criterio de cierre: repetir los pasos.
- Responsable sugerido: desarrollador-fullstack (`tools/validar-datos.ts`, línea 41: separar «programada» de «vencida»).

### Observaciones (no son defectos de QA)
- O-1: «Condiciones» de la ayuda del campo abre otra pestaña sin avisarlo. Ya está en `docs/PENDIENTES.md` como decisión pendiente de legal y diseño.
- O-2: anuncios con lector de pantalla real (NVDA/VoiceOver) no verificados: no hay lector en este entorno. Lo automatizable (texto, `role`, `aria-live`, `aria-atomic`, vacía al montar) pasa.
- O-3: LEG-125/LEG-127: el estado «terminada» no existe; `npm run datos` lo recuerda. Pendiente previsto, no defecto.

## Paridad v1
Sin cambios: la v1 no tenía envío gratis ni campo de comuna (función nueva de la v2).

## Cobertura
- Vitest nuevo: `src/infrastructure/csv/envio-gratis-datos-reales.test.ts` (58 pruebas, CSV reales).
- e2e nuevo: `e2e/envio-gratis-comunas.spec.ts` (34 pruebas con la promoción encendida, 2 con la apagada; cada bloque se omite solo según `envio_gratis_desde` y `ENVIO_GRATIS_PRUEBA`).
- e2e ajustado: `e2e/paquete-legal-v1.spec.ts:394` admite la salvedad de §8.5 en el build de prueba.
- Para repetir la ronda encendida: `envio_gratis_desde` con fecha, `ENVIO_GRATIS_PRUEBA=si npm run build`, `npx serve out -l 4173 -n` y `ENVIO_GRATIS_PRUEBA=si npx playwright test`. Después, restaurar `config.csv` y reconstruir.

---

# Ronda QA 2 (verificación): estado «terminada», QA-010 y LEG-120 a LEG-123 (2026-11-09)

Rama `feat/envio-gratis-comunas`, HEAD `dc10290` (sin push). Chromium (Playwright 1.64), `serve` propio en 4173, detenido al terminar. Fuentes: `docs/legal/microcopy-legal.md` v1.5 §8.6.1, `docs/legal/revisiones/2026-11-09-verificacion-envio-gratis.md` v0.3 (entrega v0.2, puntos 1 a 5, y «Para `qa-pruebas`»), commits `3df9d80`, `445d730`, `c8afa95`.

Los estados se prepararon con un `data/config.csv` temporal y **nunca** con `GITHUB_PAGES=true`. Como `envio_gratis_terminada` no puede ser anterior a `envio_gratis_desde`, los casos hoy − 30 y hoy − 31 usan `envio_gratis_desde,2026-10-01` (con `2026-11-06` fallarían por «anterior a desde», que es lo correcto). Al terminar: `git checkout data/config.csv` (las dos claves vacías, `git diff data/` vacío), `out/` reconstruido apagado y capturas regeneradas por la suite restauradas.

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm run datos` con `desde,2026-11-06` + `terminada,2026-11-09` | exit 0. «Envío gratis por comunas: terminada el 2026-11-09, no rige hoy (2026-11-09); sin campo «Comuna» ni $0. El sitio construido hoy muestra el aviso de terminación en portada, cajón y /envios/#envio-gratis (30 días más de los 30).» Sin «empieza» ni «programada». Más el aviso de numeral no publicado (ver QA-012) |
| `npm run datos` con `desde,2026-11-12`, terminada vacía | exit 0. «… programada, no rige hoy (2026-11-09); empieza el 2026-11-12. No aparece en el sitio; hay que reconstruir y desplegar el 2026-11-12 para que aparezca.» |
| `npm run datos`, terminada futura (`2026-11-10`) | **exit 1**: «envio_gratis_terminada (2026-11-10) es posterior a hoy (2026-11-09)… pon la fecha del día en que la apagas y despliegas» |
| Idem, terminada anterior a desde (`11-05` < `11-06`) | **exit 1**: «… es anterior a envio_gratis_desde (2026-11-06): la promoción no puede terminar antes de empezar» |
| Idem, terminada sin desde | **exit 1**: «… tiene fecha pero envio_gratis_desde está vacía…» |
| Idem, `envio_gratis_hasta` llena (con y sin `desde`) | **exit 1**: «envio_gratis_hasta ya no se usa (P34 b…). Déjala vacía y… escribe en envio_gratis_terminada…» |
| `ENVIO_GRATIS_PRUEBA=si npm run build`, terminada = hoy (`2026-11-09`) | pasa |
| `npx playwright test` completo contra ese build | **169 pasan**, 40 omitidas (36 «encendida» + 4 basePath). Ninguna otra suite se rompe en estado «terminada» |
| Bloque «TERMINADA» (nuevo) con `--repeat-each=5` | 45/45 |
| Build y bloque «TERMINADA» + `paquete-legal-v1` con terminada = hoy − 30 (`2026-10-10`) | build pasa («último día de los 30»); 38 pasan |
| Idem con terminada = hoy − 31 (`2026-10-09`) | build pasa («Pasaron los 30 días del aviso…»); 37 pasan; sin aviso en portada ni cajón; sección de `/envios/` presente |
| Build terminada = hoy **sin** `ENVIO_GRATIS_PRUEBA` | build pasa con aviso; `/envios/` sin `#envio-gratis`; la prueba «el enlace “Ver condiciones” lleva a una sección que existe» **falla** (QA-012) |
| Texto visible de `out/` (terminada = hoy) buscando `gratis\|comuna\|Cabecera del Llano` | solo en el aviso de inicio y la sección de `/envios/`; además «consultar gratis tus datos» de la política (texto previo, ajeno a la promoción). En los `.txt`/RSC solo aparecen las claves `envioGratis`/`finEnvioGratis` (fechas), no texto |
| `/envios/` fuera de la sección: terminada (hoy, hoy − 30, hoy − 31) contra apagada | **idéntico** en los tres |
| `ENVIO_GRATIS_PRUEBA=si npm run build` vigente (`desde,2026-11-06`) + `envio-gratis-comunas` y `paquete-legal-v1` | 63 pasan; LEG-120 (región `role="status"`) y LEG-121 a LEG-123 (`/envios/`) pasan letra por letra |
| **Apagada (repositorio):** `npm run lint` / `npm run typecheck` | exit 0 / exit 0 |
| `npx vitest run --coverage` | 28 archivos, **499 pruebas** pasan; cobertura global 99,76 % sentencias, 96,77 % ramas, 99,61 % funciones, 100 % líneas |
| `npm run datos` / `npm run build` | exit 0 («apagado»; 3 avisos de siempre) / exit 0 |
| `rg -il "Envío gratis\|Cabecera del Llano\|comuna" out --glob '*.html' --glob '*.txt'` | **0 archivos** |
| Texto visible + `href`/`id`/`content`/`alt`/`aria-label` + JSON-LD de las 15 páginas: build apagado de HEAD contra build de `7079157` | **idéntico en las 15** (solo cambia el hash de `/icon.svg`, del empaquetador). `/envios/` es el de antes |
| `npx playwright test` completo, apagada | **162 pasan**, 47 omitidas (4 basePath + 34 encendida + 9 terminada), 0 fallan |

Veredicto: **APTO CON OBSERVACIONES** con la promoción apagada (como queda la rama). QA-010 cerrado. Dos defectos nuevos de severidad Baja y Media, que no bloquean el merge con la promoción apagada; QA-012 debe corregirse antes de usar el estado «terminada» en un despliegue real.

## Verificación por punto

**QA-010 (cerrado).** Con los pasos nuevos, la línea distingue «terminada» de «programada» y no habla de «empezar» en la terminada. Exit 0 en ambos. Observación menor (no defecto): el día de la terminación dice «30 días más de los 30» (el aviso se ve 31 días: el de la terminación y 30 más; el último día dice «último día de los 30»). Es coherente con `hoy ≤ terminada + 30`.

**Estado «terminada» (terminada = hoy y hoy − 30, build de prueba):**
- Portada, bajo «Cómo pedir»: `El envío gratis en siete comunas de Bucaramanga terminó el 9 de noviembre de 2026. Si tu pedido por WhatsApp ya decía «envío gratis», lo respetamos con las mismas condiciones. Ver condiciones` (con hoy − 30, «10 de octubre de 2026»), enlace a `/envios/#envio-gratis`, mismo elemento y estilo del anuncio, sin clases de color prohibidas. Pasa. Captura: `docs/qa/capturas/envio-gratis-terminada-inicio-360.png`.
- Cajón: el mismo aviso bajo «Se calcula al elegir tu ciudad · desde Bucaramanga»; «Ver condiciones» lleva a `/envios/#envio-gratis` y cierra el cajón. Pasa. Captura: `envio-gratis-terminada-cajon-360.png`.
- Con hoy − 31: sin aviso en portada ni cajón, sin «gratis» en ellos. Pasa.
- `/envios/#envio-gratis`: título «Envío gratis en comunas de Bucaramanga», el aviso como primer párrafo, «Estas fueron sus condiciones:» y el numeral (borrador de la nota E en el build de prueba); sin `lista-comunas`, sin `nota-envio-gratis-tabla`, leyenda sin la salvedad, párrafo inicial, `dd` de zonas 1 y 5 y caja de cotizar como con la promoción apagada (fuera de la sección, idéntico al apagado). Sin «gratis» en `meta` ni JSON-LD. Pasa. Captura: `envio-gratis-terminada-envios-360.png` (encabezado y barra «Ver pedido» fijos superpuestos en la captura de elemento; no ocurre en la vista real). Ver QA-011.
- Checkout con Bucaramanga: sin campo «Comuna»; 1 kg (2 × 500 g) → «$8.800», «Total $102.800»; resumen sin «gratis» ni «comuna»; mensaje con `Envío (Bucaramanga · zona 1): $8.800` y `Total: $102.800`, sin «gratis» ni «Comuna». 6 kg → «Por cotizar», «Total sin envío», mensaje con «Quedo atento al valor del envío…», sin «gratis». Pasa.
- «gratis» solo en el aviso y la sección: catálogo, ficha, provincia, pedido y vendedor sin «gratis» ni «comuna» (e2e), y búsqueda en el texto visible de todo `out/` (tabla). Pasa.
- Axe (wcag2a/aa, 21a/aa) a 360 y 1280 px en inicio, cajón y `/envios/#envio-gratis`: 0 violaciones serias o críticas, sin desborde. Pasa.

**LEG-120 a LEG-123 (`ead557d`), build vigente de prueba:** región `role="status"` con «Envío gratis en {comuna}, sujeto a verificar tu dirección: $0. Total: $94.000.» para las siete comunas (LEG-120); párrafo inicial con «Ver condiciones» (LEG-121); caja de cotizar (LEG-122); `dd` de zona 1 con «contado desde que validamos tu pedido y te damos el aprobado por el chat (ver condiciones)» enlazado (LEG-123). Pasan letra por letra. Apagada: `/envios/` idéntico al build de `7079157` y sin esos textos.

**Suite e2e (pedido del desarrollador).** `ENCENDIDA` miraba solo `envio_gratis_desde` y la variable: con `envio_gratis_terminada` llena habría corrido las pruebas «encendida» (y `paquete-legal-v1.spec.ts:394` habría exigido la salvedad). Ahora el estado sale de `estadoEnvioGratisE2E()` (`e2e/ayudas.ts`), con la misma regla del build (`apagada`/`programada`/`vigente`/`terminada`, aviso 30 días), y hay un bloque permanente «TERMINADA» de 9 pruebas.

## Defectos (ronda 2)

| ID | Severidad | Área | Título | Responsable | Estado |
|---|---|---|---|---|---|
| QA-011 | Baja | Legal / `/envios/` | Tras «Estas fueron sus condiciones:» el numeral sigue en presente («Estas son las condiciones:», «No tiene fecha de terminación…») | legal-cumplimiento (texto); luego desarrollador-fullstack | Cerrado (2026-11-11) |
| QA-012 | Media | Datos / estado «terminada» | Con la promoción terminada y el numeral no publicado, «Ver condiciones» del aviso lleva a un ancla que no existe; `npm run datos` solo avisa | desarrollador-fullstack (con decisión de legal-cumplimiento) | Cerrado (2026-11-11) |

### QA-011 — Condiciones de la promoción terminada en presente y con dos introducciones seguidas
- Severidad: Baja
- Estado: Corregido — pendiente verificación
- Entorno: Chromium, 360 × 740, rama `feat/envio-gratis-comunas`, `dc10290`; `envio_gratis_desde,2026-11-06`, `envio_gratis_terminada,2026-11-09`, `ENVIO_GRATIS_PRUEBA=si npm run build`.
- Pasos para reproducir: 1. Preparar el build anterior. 2. Abrir `/envios/#envio-gratis`.
- Resultado esperado: tras el aviso «… terminó el 9 de noviembre de 2026…», unas condiciones que se lean como las que rigieron, sin contradecir el aviso.
- Resultado obtenido: «Estas fueron sus condiciones:» y, enseguida, «El envío es gratis para los pedidos que entregamos en una dirección de estas comunas… Estas son las condiciones:» (dos introducciones seguidas, pasado y presente), y al final «Vigencia: rige desde el 6 de noviembre de 2026. No tiene fecha de terminación: sigue vigente hasta que publiquemos…» justo debajo de un aviso que dice que terminó. Es lo que pide §8.6.1 (el numeral «letra por letra»), así que no es un error de implementación sino del texto especificado; para el cliente es contradictorio (Ley 1480, art. 23, claridad; lo decide legal).
- Evidencia: `docs/qa/capturas/envio-gratis-terminada-envios-360.png`; prueba `e2e/envio-gratis-comunas.spec.ts` «/envios/: título, aviso, «Estas fueron sus condiciones:» y el numeral…» (hoy fija el texto de §8.6.1; se ajusta cuando legal decida).
- Responsable sugerido: legal-cumplimiento (decidir: quitar «Estas fueron sus condiciones:», o una versión en pasado del numeral para el estado «terminada», o una nota que diga que la vigencia ya terminó); después desarrollador-fullstack.
- Corrección: commit `fix(envios): nota de vigencia terminada y numeral 13 citado (QA-011, LEG-131)`. Causa raíz: la sección mostraba el numeral en presente bajo un aviso de terminación y con dos introducciones. Ahora (microcopy v1.6 §8.6.1) `/envios/` pinta el aviso, la nota de vigencia terminada (`notaVigenciaTerminada`, letra por letra) y el numeral 13 sin cambios dentro de un `<blockquote>` con borde (tokens `line` y `surface-sunken`, sin color de alerta); se retira «Estas fueron sus condiciones:». Prueba e2e y unitaria ajustadas.

### QA-012 — «Ver condiciones» del aviso de terminación sin destino si el numeral no está publicado
- Severidad: Media
- Estado: Corregido — pendiente verificación
- Entorno: Chromium, rama `feat/envio-gratis-comunas`, `dc10290`; `envio_gratis_desde,2026-11-06`, `envio_gratis_terminada,2026-11-09`, `npm run build` **sin** `ENVIO_GRATIS_PRUEBA` (como sería en el despliegue mientras el numeral 13 no esté en el texto publicado de «Envíos, devoluciones, retracto y garantía»).
- Pasos para reproducir: 1. Preparar ese `config.csv`. 2. `npm run datos` → exit 0 con «Aviso, envío gratis: … /envios/ no tendrá la sección #envio-gratis y el enlace «Ver condiciones» del aviso de portada y cajón no llevará a las condiciones». 3. `npm run build` (pasa). 4. En inicio o en el cajón, «Ver condiciones».
- Resultado esperado: el aviso de terminación promete respetar los pedidos «con las mismas condiciones» y enlaza a ellas: si las condiciones no están publicadas, el build no debe salir así (o el aviso no debe enlazar a la nada). Puede ocurrir en la práctica si legal retira el numeral en una versión nueva antes de cumplirse los 30 días del aviso, o si el dueño llena `envio_gratis_terminada` por error.
- Resultado obtenido: `/envios/` sin `id="envio-gratis"` (0 coincidencias en `out/envios/index.html`); el enlace lleva al inicio de `/envios/`, sin condiciones; el aviso sigue en portada y cajón.
- Evidencia: `npx playwright test e2e/envio-gratis-comunas.spec.ts -g TERMINADA` contra ese build: «el enlace «Ver condiciones» del aviso lleva a una sección que existe (QA-012)» falla con `expect(locator("#envio-gratis")).toHaveCount(1)`, recibido 0. Traza: `test-results/…QA-012…/trace.zip` (regenerable con los pasos).
- Criterio de cierre: con esa configuración, o `npm run datos` sale con exit 1 y un mensaje claro, o la prueba anterior pasa.
- Responsable sugerido: desarrollador-fullstack (convertir el aviso de `tools/validar-datos.ts` en error mientras `avisoVisible`, o no enlazar), con la decisión de legal-cumplimiento sobre qué se publica si el numeral ya se retiró.
- Corrección: commit `fix(datos): … (QA-012)` en `feat/envio-gratis-comunas`. Causa raíz: `tools/validar-datos.ts` trataba el numeral ausente como aviso incluso con el aviso de terminación visible (≤ 30 días), que enlaza a `#envio-gratis`. Ahora `errorNumeralTerminacion` (`src/domain/envio/envio-gratis.ts`, con pruebas) hace fallar `npm run datos` y el build (exit 1) en esa ventana; pasados los 30 días solo avisa; el mensaje del error es el exacto de microcopy v1.6 §8.6.1 (LEG-132); `ENVIO_GRATIS_PRUEBA=si` sigue permitiendo builds de prueba. Pendiente de verificar por QA: build real sin `ENVIO_GRATIS_PRUEBA` debe fallar con ese config.

## Paridad v1
Sin cambios: la v1 no tenía envío gratis.

## Cobertura (ronda 2)
- `e2e/ayudas.ts`: `hoyEnColombia()` y `estadoEnvioGratisE2E()` (misma regla que el build).
- `e2e/envio-gratis-comunas.spec.ts`: modos por estado; bloque nuevo «TERMINADA» (9 pruebas: checkout 1 kg y 6 kg con mensaje, inicio, cajón, enlace a la sección (QA-012), `/envios/`, «gratis» fuera del aviso, axe a 360 y 1280). «APAGADA» corre también con la promoción programada.
- `e2e/paquete-legal-v1.spec.ts:394`: la salvedad solo con la promoción vigente.
- Para repetir el estado terminada: `envio_gratis_desde` y `envio_gratis_terminada` con fecha, `ENVIO_GRATIS_PRUEBA=si npm run build`, `npx serve out -l 4173 -n`, `ENVIO_GRATIS_PRUEBA=si npx playwright test`. Después, restaurar `config.csv` y reconstruir.

## Ronda 3 — verificación acotada de QA-011 y QA-012 (2026-11-11, HEAD 3c89188)

Config temporal `envio_gratis_desde,2026-11-06` y `envio_gratis_terminada,2026-11-11` (restaurada después).

- QA-012, sin `ENVIO_GRATIS_PRUEBA`: `npm run datos` y `npm run build` salen con exit 1 y el mensaje exacto de microcopy v1.6 §8.6.1 (fechas ISO 2026-11-11 y 2026-12-11). **Cerrado.**
- QA-012, terminada 2026-10-10 (más de 30 días) sin numeral: exit 0. Línea por consola: «Aviso, envío gratis: «Envíos, devoluciones, retracto y garantía» no publica el numeral del envío gratis; /envios/ no tendrá la sección #envio-gratis.» y «Pasaron los 30 días del aviso: no sale en portada ni cajón…». Observación: §8.6.1 dice «sin numeral no hay aviso ni sección, y no hay error»; el aviso por consola es solo informativo y no bloquea. Discrepancia menor, no pidió «ni aviso» de forma expresa.
- QA-011, un solo `ENVIO_GRATIS_PRUEBA=si npm run build`: en `/envios/#envio-gratis` el título y el párrafo 1 (aviso sin enlace «Ver condiciones») y el párrafo 2 (nota de vigencia) coinciden letra por letra con §8.6.1 (fechas «6 de noviembre de 2026» y «11 de noviembre de 2026»); el numeral 13 va en un único `<blockquote>` (borde `line`, fondo `surface-sunken`, sin color de alerta); «Estas fueron sus condiciones» ya no aparece (0). Pasan los 9 de `-g TERMINADA` (incluye axe a 360 y 1280: 0 serias/críticas). Capturas: `docs/qa/capturas/qa011-envios-terminada-360.png` y `-1280.png`; aspecto legible, sin superposición. **Cerrado.**
- Observación: no se pudo comparar el blockquote con `/legal/envios-devoluciones/` porque ese documento aún no publica el numeral 13 (el build de prueba usa el borrador de la nota E); la identidad se debe volver a comprobar cuando legal lo publique.
- Promoción apagada: lint 0, typecheck 0, `npm test` 28 archivos / 503 pruebas pasan, `npm run datos` y build exit 0; `rg -i "Envío gratis|comuna"` en `*.html`/`*.txt` de `out/`: sin coincidencias.

Veredicto: **APTO CON OBSERVACIONES** (QA-011 y QA-012 cerrados; sin defectos abiertos de esta rama).
