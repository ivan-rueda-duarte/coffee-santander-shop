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

| ID | Severidad | Área | Título | Responsable |
|---|---|---|---|---|
| QA-010 | Baja | Datos (`tools/validar-datos.ts`) | Con la promoción vencida, `npm run datos` dice «si empieza después, hay que reconstruir ese día» | desarrollador-fullstack |

### QA-010 — Mensaje de `npm run datos` engañoso con la promoción vencida
- Severidad: Baja
- Estado: Abierto
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
