# Envío gratis en siete comunas de Bucaramanga

Fecha: 2026-11-09 · Autor: disenador-marca · Estado: implementada (5c11cee, e775b0d, b5882ae) y auditada el 2026-11-09 (ver «Auditoría de lo construido» al final)
Fuentes: `docs/marca-v4.1.md`, `PRODUCT.md` (principios 2, 3 y 4; decisión de envíos por zonas), `docs/diseno/2026-11-06-paquete-legal-v1.md` (escala de texto legal), código actual de `src/ui/componentes/checkout/`, `src/ui/componentes/carrito/`, `src/ui/componentes/layout/` y `src/app/envios/page.tsx`.

Los textos exactos los redacta `legal-cumplimiento`. Aquí van como **[TEXTO-LEGAL: …]**: la descripción entre los dos puntos dice qué debe decir el texto, no cómo se redacta. Solo llevan texto definitivo el nombre de las comunas (pendiente de confirmar, ver «Preguntas abiertas») y los rótulos que ya existen.

## Objetivo del usuario

Quien vive en una de las siete comunas debe ver, antes de abrir WhatsApp, que su envío vale $0 y por qué, sin tener que preguntarlo en el chat (principio 2). Quien no vive ahí, o compra desde otra ciudad, no tiene que leer nada de la promoción en el formulario ni sentir que se le esconde algo (principio 3). La promoción es local: casi todos los visitantes no tienen derecho a ella, así que se anuncia poco y en los lugares donde el visitante ya está pensando en el envío.

## Decisión: dónde se anuncia

| Superficie | ¿Se anuncia? | Forma | Razón |
|---|---|---|---|
| Formulario de envío (checkout) | Sí | Campo «Comuna» opcional, solo con municipio = Bucaramanga, y una ayuda debajo | Es el lugar donde se decide el envío. |
| Resumen y totales (pasos Envío y Resumen) | Sí | Línea de envío en $0 con etiqueta «Envío gratis» y tarifa de referencia | Así se ve el beneficio en la cifra. |
| Cajón del carrito | Sí, una línea | Aclaración `caption` bajo «Envío · Se calcula al elegir tu ciudad» | El cajón no conoce el destino; basta una mención sin cifra. |
| `/envios/` | Sí | Sección propia con la lista de comunas y las condiciones | Es la referencia que enlazan las demás superficies. |
| Inicio | Sí, discreto | Una línea en «Cómo pedir», bajo los tres pasos | Junto a «Confirmamos envío y pago», que ya habla del envío. |
| Cinta o banner global (sobre el encabezado o en la portada) | **No** | — | Ocupa altura a 360 px en todas las páginas, encima del encabezado fijo, para una promoción que la mayoría no puede usar. Es el patrón de urgencia comercial que la marca evita y le quita protagonismo al origen en la portada. |
| Ficha de café | **No** | — | El principio 1 (el origen antes que el precio) manda en la ficha. El bloque de compra ya lleva precio, IVA, molienda y límite de bolsas; otra línea compite con «Agregar al pedido». El cliente ve la promoción en el cajón y en el checkout. |

Lenguaje: frases informativas («El envío es gratis en…»), nunca de oferta. Sin signos de exclamación, sin «¡gratis!», sin «aprovecha», «solo por hoy», «oferta», «promo», sin cuenta regresiva ni emojis. Que legal lo redacte en ese registro; diseño rechaza el texto si llega en tono de oferta.

## Tokens de color y contraste

Todo sobre fondos claros (`surface` #f7f1e6, `surface-raised` #fffcf6, `surface-sunken` #efe4d1). El cajón ya fuerza `data-theme="light"`.

| Elemento | Token | Sobre | Contraste aprox. |
|---|---|---|---|
| Texto de etiqueta «Envío gratis» | `text-ink-title` (monte-900 #0a3f25) | #fffcf6 | ≈ 11,7:1 |
| Borde de la etiqueta | `border-monte-900` | #fffcf6 | ≈ 11,7:1 (no textual, ≥ 3:1) |
| Valor «$0» | `text-ink-title`, 700, `tabular-nums` | #fffcf6 | ≈ 11,7:1 |
| Ayudas y referencias | `text-ink-muted` (#5f554c) | #fffcf6 / #efe4d1 | ≈ 7,1:1 / ≈ 5,8:1 |
| Enlaces | `text-ink` subrayado `underline-offset-4` | claros | ≈ 17:1 |

**Prohibido en esta función:** `text-success` y cualquier `hoja-600`/`hoja-400` como texto (la marca los veta como texto sobre claro, aunque «verde = gratis» tiente); oro y grana en cualquier forma; terracota (`chicamocha-600`, `text-accent`, `ds-tag--origen`, `BarraAcento color="terracota"`), que se reserva para origen y tueste; pastilla rellena de verde bosque, que en la marca significa «provincia». La etiqueta va en contorno para no confundirse con la pastilla de provincia.

Etiqueta «Envío gratis»: `ds-tag ds-tag--outline` con `!border-monte-900 text-ink-title font-bold` (Montserrat 700, 12/16, sin mayúsculas forzadas). Es una etiqueta de nivel 2 en contorno; no es CTA ni botón y no se le pone `hover`.

`qa-pruebas` verifica con axe los cuatro estados del resumen y la sección de `/envios/`.

## 1. Formulario de envío: campo «Comuna»

### Ubicación

Inmediatamente después de «Municipio» en el orden del DOM y del foco: Departamento → Municipio → **Comuna** → Código postal → Dirección.

- **360 px (una columna):** el campo aparece debajo de Municipio, a ancho completo, con el mismo `gap-5` del formulario.
- **Escritorio (`sm:grid-cols-2`):** la fila Departamento | Municipio no cambia. Con Bucaramanga, la fila siguiente es **Comuna | Código postal** y ocupa el hueco que hoy llena el `<div className="hidden sm:block" />` detrás de Código postal. Ese relleno solo se pinta cuando no hay campo Comuna, para que la rejilla no deje una celda vacía de más.

### Componente

Reutiliza `Campo` + `SelectSuperpuesto` (mismo alto, chevron, partición de líneas y colores forzados de QA-002/QA-005). No se crea un componente nuevo.

- Rótulo: «Comuna» + « (opcional)» con el estilo actual de `Campo opcional`.
- Opción vacía (valor `""`): «Elige tu comuna» como marcador.
- Siete opciones, en orden alfabético para que se encuentren rápido: Cabecera del Llano, Centro, Ciudadela Real de Minas, La Concordia, Mutis, Oriental, San Francisco. Los nombres salen del dato (ver «Entrega»), no se escriben en el componente.
- Última opción: «Otra / prefiero no decirlo». Tiene el mismo efecto que dejarla vacía, pero el cliente la marca a propósito.
- Ayuda bajo el campo (`caption text-ink-muted`, `id="comuna-ayuda"`, enlazada con `aria-describedby`): **[TEXTO-LEGAL: el envío es gratis si la dirección de entrega queda en una de estas comunas; qué pasa si la dirección no corresponde a la comuna elegida; enlace a las condiciones en /envios/#envio-gratis]**. Si la ayuda trae enlace, usa `ayudaFija` como el código postal.
- Sin error de validación: es opcional. No se marca `aria-invalid` en ningún caso.
- `autoComplete="off"`: ningún navegador autocompleta comunas y un valor sugerido equivocado cambiaría el precio.

### Visibilidad

- Solo se **monta** cuando `departamento = Santander` y `municipio = Bucaramanga`. No se muestra deshabilitado en otros municipios: un campo gris que no aplica es ruido en celular.
- Al aparecer, el foco se queda donde estaba (en Municipio). No se anuncia la aparición: quien navega con lector o teclado lo encuentra como el campo siguiente.
- Si el cliente cambia de municipio o de departamento, el campo se desmonta y su valor se vacía (lógica: desarrollador, igual que hoy `departamento` vacía `municipio`).
- Aparición con `motion-safe:` y solo opacidad, 150 ms con `ease-out`. Con `prefers-reduced-motion: reduce` aparece sin transición. Nada de desplegar altura, que mueve el resto del formulario mientras el pulgar está encima.

### Estados del formulario

| Estado | Campo Comuna | Ayuda |
|---|---|---|
| A. Municipio distinto de Bucaramanga (o sin municipio) | No existe | — |
| B. Bucaramanga, sin comuna (`""`) | Visible, marcador «Elige tu comuna» | [TEXTO-LEGAL] de arriba |
| C. Bucaramanga, comuna cubierta | Visible con la comuna | Igual que B (no cambia: el beneficio se ve en los totales, justo debajo) |
| D. Bucaramanga, «Otra / prefiero no decirlo» | Visible con esa opción | Igual que B |

## 2. Totales (`totales-pedido.tsx`): línea de envío

La fila «Envío a {municipio} · zona {n}» y su plazo no cambian de estructura. Solo cambia el estado C.

| Estado | `dt` | `dd` | Total |
|---|---|---|---|
| Sin destino (cajón, paso Carrito) | «Envío» | «Se calcula al elegir tu ciudad…» (actual) + en el cajón la línea de §3 | — |
| A. Otro municipio | actual | tarifa actual | «Total» actual |
| B y D. Bucaramanga sin comuna cubierta | actual | tarifa actual | «Total» actual. Sin aviso que invite a elegir comuna en los totales: ya lo hace la ayuda del campo. |
| **C. Comuna cubierta** | ver abajo | ver abajo | «Total» = subtotal |
| Por cotizar (> 5 kg) con comuna cubierta | Fila «por cotizar» actual, **sin** etiqueta (regla pendiente de negocio, ver preguntas) | actual | «Total sin envío» |

**Estado C, en orden de lectura:**

1. `dt` línea 1: «Envío a Bucaramanga» + « · zona 1» en `text-ink-muted` (como hoy).
2. `dt` línea 2, `mt-1 flex flex-wrap items-center gap-x-2 gap-y-1`: etiqueta en contorno **[TEXTO-LEGAL: rótulo corto, p. ej. «Envío gratis»]** + `caption text-ink-muted` con la comuna (**[TEXTO-LEGAL: «comuna {nombre}» o equivalente]**).
3. `dt` línea 3: el plazo de zona 1 (`linea-plazo`), sin cambios.
4. `dd`, alineado a la derecha y a la línea base de la línea 1 (`items-baseline`, como hoy): «$0» en `font-bold tabular-nums text-ink-title`.
5. Bajo «$0», en el mismo `dd`: `caption block text-ink-muted font-medium` con **[TEXTO-LEGAL: referencia a la tarifa normal de la zona, p. ej. «Tarifa de la zona: $8.800»]**.

Decisión: **$0, no precio tachado.** El tachado es la gramática visual de la rebaja de temporada, choca con la sobriedad de la marca y los lectores de pantalla leen `<del>`/`<s>` de forma irregular (muchos no dicen «tachado» y anuncian dos precios sin contexto). Con «$0» más una referencia rotulada en texto, la cifra que se paga queda sin ambigüedad y la tarifa normal se lee como referencia. Si legal exige el formato «antes / ahora», se rotula en texto («Tarifa de la zona»), no con tachado.

**360 px:** la caja de totales mide ≈ 280 px útiles (`p-5` dentro de `px-5`). La fila sigue en dos columnas: «$0» y su referencia son cortos. La línea 2 parte en dos renglones si la comuna es larga («Cabecera del Llano»): por eso `flex-wrap`. La referencia del `dd` puede partir en dos líneas; no lleva `whitespace-nowrap` salvo en la cifra (`$8.800` con `whitespace-nowrap`).

**Escritorio:** misma estructura; cabe en una línea.

`data-testid` nuevos y estables: `etiqueta-envio-gratis` (etiqueta), `referencia-tarifa` (caption del `dd`). `linea-envio` no cambia.

### Lectores de pantalla y aria-live (paso Envío)

Hoy el contenedor de totales del paso Envío tiene `aria-live="polite"` (`flujo-pedido.tsx`, línea 234): cada cambio de destino vuelve a leer todo el bloque (subtotal, IVA, envío, plazo, total y el enlace). Con la comuna habrá más cambios, así que se reemplaza:

- Quitar `aria-live` del contenedor visible.
- Añadir **una** región `role="status"` (`aria-live="polite"`, `aria-atomic="true"`, `sr-only`) junto a los totales, con una sola frase que cambia solo cuando cambian el envío o el total:
  - Estado C: **[TEXTO-LEGAL: anuncio breve, p. ej. «Envío gratis a la comuna {nombre}. Total: {total}.»]**
  - Al salir de C (otra comuna, otro municipio): «Envío: {valor}. Total: {total}.» (texto funcional; legal lo revisa con el resto).
  - Por cotizar: «Envío por cotizar. Total sin envío: {total}.»
- La región empieza **vacía** al montar el paso: no se anuncia nada al entrar ni al recargar, solo tras un cambio del cliente.
- La etiqueta visible no lleva `aria-hidden`: quien recorre los totales con el lector la lee como texto.

En el paso Resumen y en el cajón los totales son estáticos: sin región viva.

### Movimiento

El paso de tarifa a «$0» no se anima: ni cifras que cuentan, ni destellos, ni fondo que parpadea. Cambia en el sitio. Es la decisión más sobria y deja `prefers-reduced-motion` resuelto sin excepción.

## 3. Cajón del carrito

Bajo la fila «Envío · Se calcula al elegir tu ciudad · desde Bucaramanga», dentro de la misma fila y solo cuando `destino === null` y hay `ciudadDespacho` (es decir, en el cajón):

- `caption text-ink-muted`, alineada como el `dd` actual (derecha): **[TEXTO-LEGAL: mención breve de que el envío es gratis en siete comunas de Bucaramanga]**.
- Sin enlace propio: el enlace «Cómo calculamos el envío» ya va debajo y lleva a `/envios/`; si se cambia su destino a `/envios/#envio-gratis` se pierde la referencia general. Se deja igual.
- Sin etiqueta en contorno: no hay beneficio confirmado todavía.
- 360 px: el cajón ocupa todo el ancho; la línea pasa a dos renglones como mucho. El botón «Continuar con el pedido» no se mueve de la zona del pulgar (pie del cajón): sube como máximo 18 px.
- Actualizar `Dialog.Description` (sr-only) solo si legal lo pide; hoy dice «El envío se calcula al elegir tu ciudad», que sigue siendo cierto.

## 4. Paso Resumen

- Totales: estado C igual que en §2.
- Tarjeta «Envío a»: nueva línea `text-ink-muted` «Comuna: {nombre}» justo después de «{municipio}, {departamento}», solo si eligió una de las siete. Con «Otra / prefiero no decirlo» o vacío no se muestra.
- Si el envío es gratis, la frase «el envío se muestra por separado» de `nota-precio-total` sigue siendo cierta; legal decide si agrega algo ([TEXTO-LEGAL: posible aclaración de la condición en el resumen]).
- Confirmación y mensaje de WhatsApp: el mensaje debe llevar la comuna y la línea de envío gratis. El formato del mensaje es dominio y texto legal: lo definen desarrollador y legal; diseño no fija el texto.

## 5. `/envios/`

### Sección nueva «Envío gratis en Bucaramanga»

- Ubicación: justo después de las dos aclaraciones de la tabla (`leyenda-iva`, `comision-incluida`) y antes de «Plazos de entrega». Es una excepción a la tarifa y se lee al lado de la tabla.
- `id="envio-gratis"` en el `h2` (o en un `section` con `aria-labelledby`), con `scroll-mt-24` para que el encabezado fijo no lo tape al llegar por ancla.
- Jerarquía (igual a las demás secciones de la página; sin antetítulo, que ya lo tiene la página):
  - `h2.h3 mt-12 text-ink-title`: **[TEXTO-LEGAL: título, p. ej. «Envío gratis en siete comunas de Bucaramanga»]**. Sin remate en itálica: los `h2` de esta página no lo llevan; el remate es del titular de la página.
  - `p.body mt-2 max-w-2xl text-ink-muted`: **[TEXTO-LEGAL: condiciones: a qué pedidos aplica, peso o monto, vigencia (desde/hasta), qué pasa si la dirección no corresponde a la comuna, y que se elige en el formulario]**.
  - Lista de las siete comunas: `ul` sin viñetas en `grid gap-x-6 gap-y-1 sm:grid-cols-2 md:grid-cols-3`, `body text-ink`, mismo orden alfabético del selector. Va enmarcada como la tabla: `rounded-lg border border-line px-5 py-4` sobre `surface`. Sin pastillas por comuna: siete pastillas verdes parecerían provincias.
  - Si hay vigencia: `small text-ink-muted mt-3` con **[TEXTO-LEGAL: vigencia]**, desde el dato.
- Tabla de tarifas: en la celda «Cubre» de la fila de zona 1, debajo del medio («Mensajero»), una línea `block text-ink-muted` con **[TEXTO-LEGAL: «Gratis en siete comunas de Bucaramanga»]** enlazada a `#envio-gratis` (`underline underline-offset-4`). El valor de las tarifas **no** cambia: la tabla sigue diciendo lo que cuesta la zona.
- Sin bloque de color, banda ni CTA nuevo. La caja de WhatsApp del final no cambia.
- Sin la promoción activa (sin dato o vencida), la sección y la línea de la tabla no se pintan.

## 6. Inicio («Cómo pedir»)

- Una línea bajo la lista de tres pasos y antes de la caja «¿Compras para tu negocio…?»: `p.small mt-10 max-w-2xl text-ink` con **[TEXTO-LEGAL: mención de envío gratis en siete comunas de Bucaramanga]** y el enlace «[TEXTO-LEGAL: texto del enlace, p. ej. «Ver las comunas»]» a `/envios/#envio-gratis` (`font-semibold underline underline-offset-4`).
- Sin caja propia (la de negocio ya usa `surface-sunken`; dos cajas seguidas compiten), sin icono, sin barra de acento.
- No se toca el texto de los pasos (microcopy §2) ni la portada oscura.
- Si Sanity trae «Cómo pedir» (`contenido.comoPedir`), la línea se mantiene igual: no depende de Sanity.
- Sin la promoción activa, no se pinta.

## Teclado y foco

- Orden de tabulación del formulario: Departamento → Municipio → Comuna (si existe) → Código postal → … Sin `tabIndex` manual.
- El selector conserva el anillo `--focus` del `select` nativo (`outline` 2 px, desfase 2 px) como los otros `SelectSuperpuesto`.
- Los enlaces nuevos (ayuda, `/envios/`, inicio) usan el foco global de enlaces; área táctil ≥ 24 px de alto (`inline-block py-1` si van solos en una línea, como en el pie).
- La etiqueta «Envío gratis» no es enfocable.
- Al llegar a `/envios/#envio-gratis`, el título queda visible bajo el encabezado fijo (`scroll-mt-24`).

## Lo que no se hace

- Cinta global, banner en portada, ventana emergente, pastilla en tarjetas o ficha.
- Precio tachado como señal principal.
- Verde de hoja, oro, grana o terracota para la promoción.
- Mostrar la promoción cuando el dato no existe o está vencido.
- Inferir la comuna a partir del barrio o la dirección (necesitaría una tabla barrio → comuna que no tenemos; ver TODO).

## Preguntas abiertas (no las decide diseño)

0. **Plazo de la entrega gratis (2026-11-09):** el dueño decidió que es de un día hábil. Debe mostrarse junto a la etiqueta «Envío gratis» en el resumen, `/envios/` y el cajón; el texto exacto lo redacta legal.
1. **Nombres de las comunas.** *Resuelto el 2026-11-09:* el dueño aclaró que «Real de Minas» es la comuna 7, y el nombre que se muestra es «Ciudadela Real de Minas». Sigue abierto si los nombres van con número («Comuna 12 · Cabecera del Llano»), que ayuda a quien no sabe su comuna. El selector y la lista de `/envios/` usan lo que diga el dato.
2. **Regla de negocio:** ¿aplica a cualquier peso hasta 5 kg?, ¿hay monto mínimo?, ¿qué pasa con más de 5 kg (hoy «por cotizar»)?, ¿vigencia? Diseño asume «por cotizar» gana sobre «gratis» hasta que se decida.
3. **Comuna mal declarada.** Si la dirección no queda en la comuna elegida, ¿se cobra la tarifa de zona 1 en el chat? Es una condición que legal debe redactar y que debe verse antes de pagar (ayuda del campo y `/envios/`).
4. ¿La comuna se guarda en el navegador como el municipio (`guardarPreferencias`)? Recomendación de diseño: no, como el documento y el código postal; decide legal.

## Entrega para desarrollador-fullstack

1. Dato: la lista de comunas cubiertas (y su vigencia, si la hay) va en `data/` (CSV o claves de `config.csv`), validada por `npm run datos`; la UI no escribe nombres de comunas. La regla «Bucaramanga + comuna cubierta → envío $0» va en `src/domain/envio/` con la tarifa normal como referencia (p. ej. `{ tipo: "gratis", valorReferenciaCop, comuna }`), y el mensaje de WhatsApp la refleja.
2. `formulario-envio.tsx`: campo `comuna` en `ValoresEnvio` (opcional); `Campo` + `SelectSuperpuesto` montado solo con Santander/Bucaramanga, después de Municipio; vaciarlo al cambiar departamento o municipio; el relleno `hidden sm:block` detrás de Código postal solo sin Comuna; `autoComplete="off"`; aparición `motion-safe:` solo opacidad 150 ms.
3. `totales-pedido.tsx`: estado C según §2 (etiqueta en contorno `ds-tag ds-tag--outline !border-monte-900 text-ink-title font-bold`, «$0», referencia en `caption`, `data-testid` `etiqueta-envio-gratis` y `referencia-tarifa`); línea del cajón según §3. Recibe la comuna por el `destino` (decide la forma del tipo).
4. `flujo-pedido.tsx`: quitar `aria-live` del contenedor de totales del paso Envío y añadir la región `role="status"` sr-only con una sola frase, vacía al montar; línea «Comuna: …» en la tarjeta «Envío a» del Resumen.
5. `src/app/envios/page.tsx`: sección `#envio-gratis` y línea enlazada en la celda de zona 1 (§5). `secciones-inicio.tsx`: línea en «Cómo pedir» (§6). Todo condicionado a que el dato exista y esté vigente.
6. Todos los textos marcados [TEXTO-LEGAL] se toman de la entrega de `legal-cumplimiento`; no se publican marcadores.

## Entrega para qa-pruebas

- axe a 360 px y 1280 px en: paso Envío con estados A, B, C y D; Resumen en estado C; cajón con artículos; `/envios/` (sección y tabla); inicio («Cómo pedir»).
- Que ningún texto de la función use `hoja-*`, `success`, oro, grana ni terracota (inspección de clases).
- Lector de pantalla (NVDA o VoiceOver): cambiar de comuna cubierta a «Otra» y a otro municipio anuncia una sola frase cada vez; entrar al paso no anuncia nada.
- Orden de foco Municipio → Comuna → Código postal; la rejilla de escritorio no deja celdas vacías de más.
- `prefers-reduced-motion: reduce`: el campo aparece sin transición.
- Más de 5 kg con comuna cubierta: se ve «por cotizar» sin etiqueta (hasta que negocio decida otra regla).

## Auditoría de lo construido (2026-11-09)

Revisión estática del código (diseño no tiene Bash: no se hizo el build con la promoción encendida; `data/config.csv` sigue con `envio_gratis_desde` vacío). Lo que cambió frente a lo especificado arriba, por decisión de legal (microcopy §8.3 y §8.6) o de esta auditoría:

**Fila de envío gratis (§2, sustituye a «Estado C, en orden de lectura»).** Rejilla `grid-cols-[1fr_auto] items-baseline gap-x-4 pt-1`:

- Fila 1: `dt` «Envío a Bucaramanga» + « · zona 1 · {comuna}» en `text-ink-muted` (texto de §8.3) | `dd` con la etiqueta en contorno «Envío gratis» y «$0» (`flex flex-wrap items-baseline justify-end gap-x-2 gap-y-1`). La etiqueta va junto al valor, no en una segunda línea del rótulo (§8.3: «junto al valor»). Las dos piezas del `dd` comparten la línea base de «Envío a…»; si el `dd` no cabe, «$0» baja bajo la etiqueta, alineado a la derecha.
- Fila 2, `col-span-2`: la nota completa de legal (`referencia-tarifa`, `caption text-ink-muted`) y debajo el plazo propio de la promoción (`linea-plazo`). A todo el ancho porque a 360 px la nota tiene ≈ 200 caracteres: en la columna del `dd` serían más de diez renglones.
- `pt-1`: la etiqueta mide 26 px y la línea del rótulo 20 px; sin ese aire el contorno roza la leyenda de IVA del subtotal.
- Sin `self-start` ni `items-center` en el `dd` (lo había al implementar): desalineaba «$0» ≈ 3 px por debajo de la línea base del rótulo.

A 360 px (≈ 280 px útiles), con la comuna más larga («Ciudadela Real de Minas») el rótulo ocupa unos cuatro renglones en ≈ 130 px. Se acepta: el texto del rótulo lo fija legal y la comuna se repite al inicio de la nota.

**Cajón (§3).** Legal (§8.6, LEG-107) pide la condición en la misma frase, así que sí lleva el enlace «Ver condiciones» a `/envios/#envio-gratis`, dentro de la misma `caption`, que queda en `text-ink-muted` subrayada. Se acepta y sustituye a «Sin enlace propio». El enlace general «Cómo calculamos el envío» sigue debajo. La línea suma ≈ 36 px al pie del cajón, no 18: el botón «Continuar con el pedido» no se mueve (el pie está anclado abajo y crece hacia arriba); lo que se acorta es la lista desplazable.

**`/envios/` (§5).** La lista de comunas no lleva `max-w-2xl` y en escritorio es más ancha que los párrafos que la rodean (pendiente del desarrollador: `src/app/` no es de diseño). El texto de las condiciones lo pone legal (numeral 13, letra por letra), con lista con viñetas.

**Formulario (§1).** Conforme: orden del foco, relleno de la rejilla solo sin Comuna, `autoComplete="off"`, aparición `motion-safe:` solo con opacidad (`starting:opacity-0`, 150 ms `ease-out`). El enlace «Condiciones» de la ayuda abre otra pestaña (`target="_blank"`) sin avisarlo; ver la entrega.
