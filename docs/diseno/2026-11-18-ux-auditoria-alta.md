# Auditoría UX, severidad alta: flujo del pedido (A1), ficha a 360 px (A2) y color de error (M9)

Fecha: 2026-11-18 · Autor: disenador-marca · Rama: `feat/ux-auditoria` · Estado: especificación, pendiente de implementar
Fuentes: `docs/marca-v4.1.md`, `PRODUCT.md` (principios 1, 2, 3 y 4; decisiones del 2026-11-04 y del 2026-11-14), `docs/legal/terminos-y-condiciones.md` (D1 §5), **`docs/legal/revisiones/2026-11-18-flujo-pedido-un-clic.md` (LEG-171 a LEG-177; dictamen «Conforme con observaciones», borrador 0.1 pendiente del abogado)**, `docs/legal/microcopy-legal.md` (§2, §5.5, §5.9), `docs/legal/revisiones/2026-11-14-paquete-abogado-v1.md` (LEG-159), tokens de `src/styles/marca.css` y clases de `src/styles/componentes.css`. Código revisado: `src/ui/componentes/checkout/flujo-pedido.tsx`, `checkout/formulario-envio.tsx`, `carrito/cajon-contenido.tsx`, `ficha/ficha-cafe.tsx`, `ficha/bloque-compra.tsx`, `marca/etiquetas.tsx`, `marca/iconos.tsx`.

Esta especificación no crea tokens. Crea dos clases de componente (`.ds-error`, `.ds-alerta`) y dos iconos (`IconoAlerta`, `IconoNoDisponible`), hechos solo con tokens que ya existen.

## Textos legales: convención

- **[LEGAL: fuente]**: texto que existe en `docs/legal/*.md` o que legal ya aprobó. Va **letra por letra** y diseño solo decide dónde va.
- **[UI]**: rótulo de interfaz sin contenido legal. Lo decide diseño.
- Ningún texto de esta especificación cambia una casilla, el aviso de privacidad, el aviso de retracto, la leyenda de IVA, la nota de precio total ni la línea del vendedor. Todos se quedan con su texto y su orden actuales.

---

## A1. Flujo del pedido en tres pasos

### Objetivo del usuario

Elegí mis cafés en el cajón, escribo a dónde los envían, reviso y con **un solo clic** se abre WhatsApp con el pedido escrito. Hoy hay cinco pantallas o botones entre el cajón y WhatsApp, y dos dicen «Enviar por WhatsApp». El segundo es el único que abre WhatsApp, así que la pantalla contradice D1 §5 («Pulsas «Enviar por WhatsApp». Se abre WhatsApp con el pedido escrito»). Esto aplica la alternativa (b) de LEG-159: el botón del resumen es el enlace `wa.me` y el panel de Confirmación desaparece.

**Condiciones de legal, que esta especificación incorpora:**
- **LEG-171:** el texto de cómo sigue la compra va encima del botón, en dos variantes.
- **LEG-172 (bloqueante):** sin las casillas 1 y 2 no se genera número DS, texto ni enlace. Con las dos, `wa.me` se abre en el mismo manejador, sin `await`.
- **LEG-173:** el respaldo «Copiar mensaje» aparece solo tras un clic válido, copia el mismo texto y número, y se oculta si algo cambia.
- **LEG-174:** nombres de los botones.
- **LEG-175:** el paso «Confirmación» sale del indicador.
- El aviso de privacidad se queda en Envío.

**Salvaguarda (LEG-171):** retirar el panel de D5 §6.3 y adaptar sus textos lo valida el abogado. Si no lo valida antes de implementar, **no se implementa A1 tal como está aquí**: se conserva el panel de Confirmación y solo se renombra el botón del resumen (LEG-159, alternativa a). Para ese caso, diseño entrega una variante aparte.

### Flujo nuevo

```
Cajón «Tu pedido»  ──[Continuar con el envío]──▶  /pedido/  (paso Envío)
                                                   │ [Ver el resumen]
                                                   ▼
                                          /pedido/?paso=resumen  (paso Resumen)
                                                   │ [Enviar por WhatsApp]  = validar + abrir wa.me en el mismo clic
                                                   ▼
                                          WhatsApp (pestaña o app nueva)
                                          El Resumen se queda y muestra el respaldo «¿No se abrió WhatsApp?»
```

**Decisión sobre el paso Carrito: se retira.** No queda como paso 0. La revisión editable vive en el cajón, que ya existe: el paso Envío abre con un bloque compacto «Tu pedido» y un botón «Editar», que abre el mismo cajón. Razones:
- No hay dos pantallas que editen lo mismo, ni dos sitios que mantener.
- A 360 px, poner las líneas editables dentro del formulario lo alarga unos 300 px. El bloque compacto ocupa unos 120 px.
- Quien entra directo a `/pedido/` (marcador, botón atrás, enlace viejo) ve sus cafés arriba y puede editarlos sin salir del paso.

Rutas:

| URL | Muestra |
|---|---|
| `/pedido/` (sin `paso`) | Paso Envío |
| `/pedido/?paso=envio` | Paso Envío (se acepta por compatibilidad y se reemplaza por `/pedido/` con `router.replace`) |
| `/pedido/?paso=resumen` | Resumen. Si se perdieron los datos de envío (recarga), `replace` a `/pedido/`, como hoy |
| `/pedido/?paso=carrito`, `?paso=confirmacion`, otro valor | `replace` a `/pedido/` |

### Etiquetas de los botones

| Lugar | Hoy | Nuevo | Variante | Tipo |
|---|---|---|---|---|
| Cajón, pie (`cajon-contenido.tsx:85`) | Revisar el pedido → | **Continuar con el envío →** (`href="/pedido/"`) | `BotonEnlace` primario, `bloque`, `lg` | [UI], el propuesto en LEG-174 |
| Envío, bloque «Tu pedido» | (no existe) | **Editar** (abre el cajón) | `Boton variante="enlace" tamano="sm"` | [UI] |
| Envío, envío del formulario (`flujo-pedido.tsx:266`) | Finalizar el pedido → | **Ver el resumen →** | `Boton type="submit" tamano="lg"`, `max-sm:w-full` | [UI]. Entre las dos opciones de LEG-174 se elige «Ver el resumen»: es más corta (cabe en una línea a 360 px) y repite el nombre del paso 3 del indicador. «Finalizar» hacía creer que la compra se cerraba (LEG-174, LEG-053, regla 3 de §5.9) |
| Envío, secundario (`:263`) | ← Volver al carrito | Se retira. «Editar» del bloque compacto y «Seguir viendo cafés» lo reemplazan | — | — |
| Envío, enlace bajo el botón principal | (no existe) | **Seguir viendo cafés** (`/cafes/`) | `BotonEnlace variante="enlace" tamano="sm"` | [UI] |
| Resumen, principal (`:369-377`) | Enviar por WhatsApp (solo iba a Confirmación) | **Enviar por WhatsApp**, con `IconoWhatsapp`, y abre `wa.me` | primario `lg`, `max-sm:w-full` | **[LEGAL: D1 §5; microcopy T7]**. No se cambia |
| Resumen, secundario (`:365`) | ← Volver | **← Volver al envío** | `Boton variante="secundario"` | [UI] |
| Resumen, bloque «Envío a» (`:294`) | Editar | Editar (sin cambio) | enlace `sm` | [UI] |
| Resumen, respaldo tras abrir | (en Confirmación) | **Copiar mensaje**, con `IconoCopiar` | `Boton variante="secundario"` | **[LEGAL: LEG-173 (3)]** |
| Resumen, respaldo | (en Confirmación) | **Ver el mensaje** (`<summary>`) | `details` | [UI] |
| Resumen, respaldo | Vaciar pedido (en Confirmación) | **Vaciar pedido** | `Boton variante="enlace" tamano="sm"` | [UI], sin cambio |

No se usa «Abrir WhatsApp» en ningún botón, nombre accesible ni prueba (criterio de legal del 2026-11-05). El reintento es el **mismo** botón «Enviar por WhatsApp»: no hay un segundo botón con otro texto.

### Indicador de pasos

Tres pasos: **1 Pedido · 2 Envío · 3 Resumen**. Sin «Confirmación» (LEG-175). «Pedido» es el cajón, que ya pasó al llegar a `/pedido/`. WhatsApp no es un paso: es a donde lleva el botón final, y el indicador no lo promete.

LEG-175 sugiere «Carrito» como paso 1, solo para quien entra directo. Aquí el paso 1 se llama **«Pedido»** y existe siempre, porque: (a) el cajón, que es donde se edita, se titula «Tu pedido»; (b) no hay pantalla Carrito, así que el paso no puede aparecer y desaparecer según cómo se llegó. Lo que pide LEG-175 se cumple igual: no se anuncia ningún paso que no exista.

```
360 px (área útil 320 px)
┌────────────────────────────────────┐
│ (✓) Pedido   (2) Envío   (3) Resumen │   ← una línea, sin conectores
└────────────────────────────────────┘
Escritorio
 (✓) Pedido ──── (2) Envío ──── (3) Resumen
```

| Estado | Círculo de 24 px | Rótulo |
|---|---|---|
| Actual | relleno `bg-monte-900`, número `text-pergamino-50` en 800 (≈ 11:1) | `font-extrabold text-ink-title`; `aria-current="step"` |
| Hecho | borde 1,5 px `border-monte-900`, `IconoCheck` de 14 px en `text-monte-900` | `font-semibold text-ink`, más «, hecho» en `sr-only` |
| Pendiente | borde 1,5 px `border-line-strong` (≈ 3,8:1, no es texto), número `text-ink-muted` | `font-medium text-ink-muted` (≈ 6,6:1 sobre `surface`) |

- Contenedor: `<ol aria-label="Pasos del pedido" class="small mb-8 flex flex-nowrap items-center gap-x-4 whitespace-nowrap md:mb-10 sm:gap-x-6">`. Clase `small`: Montserrat 14/22.
- Cuentas a 360 px (Montserrat 14, 700–800): 24 + 8 + ≈ 52 («Pedido») + 24 + 8 + ≈ 44 («Envío») + 24 + 8 + ≈ 64 («Resumen») + 2 × 16 de separación ≈ **288 px de 320**. Cabe en una línea.
- Conectores (desde `sm`): `<span aria-hidden="true" class="hidden h-px w-8 bg-line-strong sm:block">` entre los pasos.
- Por debajo de 360 px (320 px de ancho, zoom del 400 %): `max-[359px]:sr-only` en los rótulos de los pasos que no son el actual. Siempre queda «(✓) (2) Envío (3)» en una línea.
- Los pasos hechos se pueden pulsar: «Pedido» es un `<button>` que abre el cajón. «Envío», visto desde Resumen, es un `<Link href="/pedido/">`. Los pendientes son texto. Área táctil de 44 px de alto con `py-2.5`; el anillo de foco es el de siempre, `outline-2 outline-focus`.
- Con el carrito vacío o mientras se carga, no hay indicador.

### Paso Envío, 360 px

```
TU PEDIDO                                   ← Antetitulo (chicamocha-600, overline)
(✓) Pedido  (2) Envío  (3) Resumen
¿A dónde enviamos?                          ← h1 .h2, ink-title
Despachamos desde Bucaramanga a todo Colombia.   ← body, ink-muted
┌ Tu pedido ──────────────────── Editar ┐   ← bloque compacto
│ Café Casa Martínez · 250 g · grano × 2│     caption, ink
│ Café Arreboles · 500 g · molido × 1   │
│ 3 bolsas                              │     caption, ink-muted
└───────────────────────────────────────┘
[Resumen de errores, si los hay]            ← .ds-alerta (ver M9)
Nombre … (formulario sin cambios)
Aviso de privacidad                         ← [LEGAL: D2], sin cambio y SE QUEDA AQUÍ (dictamen, pregunta 2)
┌ Totales (TotalesPedido con destino) ──┐   ← sin cambio
└───────────────────────────────────────┘
[          Ver el resumen  →          ]     ← primario lg, ancho completo
          Seguir viendo cafés               ← enlace sm, centrado
```

Bloque compacto «Tu pedido»:
- `<section aria-labelledby="t-mi-pedido" class="mt-6 rounded-lg border border-line bg-surface-raised p-4">`.
- Cabecera en una fila: `<h2 id="t-mi-pedido" class="overline text-ink-muted">Tu pedido</h2>` a la izquierda y «Editar» a la derecha. Nombre accesible: «Editar el pedido» (`aria-label`).
- Una línea por café, `caption text-ink`: `{nombre} · {gramos} g · {presentación en minúscula} × {cantidad}`. Sin precios, porque la caja de totales del mismo paso ya los da.
- Con más de 3 líneas se muestran 3 y luego «y {n} más» (`caption text-ink-muted`).
- Pie: «{n} bolsas» (`caption text-ink-muted`).
- No es editable en sitio. «Editar» llama a `abrirCajon()`. Al cerrar el cajón, el foco vuelve a «Editar» (`devolverFoco`, que ya existe). Si el cliente vacía el pedido en el cajón, la página pasa al estado vacío.

Escritorio (`md`+): la misma columna de `max-w-2xl`. El botón principal tiene ancho natural, con «Seguir viendo cafés» a su derecha (`flex items-center gap-4`).

### Paso Resumen, 360 px

El orden y los textos se quedan como hoy, con tres cambios: **(1)** encima del botón va el texto de cómo sigue la compra (LEG-171); **(2)** el botón abre WhatsApp (LEG-172); **(3)** el respaldo aparece debajo del botón después de un clic válido (LEG-173).

```
TU PEDIDO
(✓) Pedido  (✓) Envío  (3) Resumen
Revisa tu pedido                                  ← h1
Líneas (no editables) · Totales · nota de precio total · aviso de retracto   ← sin cambio
┌ Envío a ─────────────────────── Editar ┐      ← sin cambio
Casillas de términos y datos · errores bajo cada una            ← [LEGAL], sin cambio (errores con .ds-error)
─────────────────────────────────────────
Casillas de promociones                                         ← [LEGAL], sin cambio
Te vende De Santander SAS · NIT … · Información del vendedor    ← sin cambio
[Error de líneas, si lo hay]                                    ← .ds-alerta
Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido  ← [LEGAL: LEG-171], small ink,
escrito. Con ese mensaje nos pides el pedido. Te respondemos       data-testid="texto-siguiente-paso"
con el total para que lo aceptes y te damos los datos para pagar.
Para enviar tu pedido, marca las dos casillas: …                ← [LEGAL: §5.9 con el cambio de LEG-172 (4)], caption ink-muted, solo si faltan casillas
[  (wa)  Enviar por WhatsApp            ]                       ← primario lg, ancho completo
[  ←  Volver al envío                   ]                       ← secundario, ancho completo
── solo después de un clic válido (LEG-173) ──
┌───────────────────────────────────────┐
│ ¿No se abrió WhatsApp? Copia el mensaje y envíalo al          │  ← [LEGAL: LEG-173 (3)], role="status"
│ +57 300 112 9874.                                             │
│ [ ⧉ Copiar mensaje ]                                          │  ← secundario, ancho completo
│ ▸ Ver el mensaje                            ← details/summary (LEG-173 (4)) │
│ Acortamos tus indicaciones …                ← solo si aplica (:394) │
│ Vaciar pedido                               ← enlace sm        │
└───────────────────────────────────────┘
```

Detalle:
- **Texto de cómo sigue la compra (LEG-171)**, letra por letra, `<p data-testid="texto-siguiente-paso" class="small mt-6 text-ink">`. Va en `small` (14/22) para que no separe el botón de las casillas. La variante sale de `envioCalculado.tipo === "por_cotizar"`, que se conoce antes del clic:
  - Con tarifa: `Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido escrito. Con ese mensaje nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.`
  - Por cotizar: `Al pulsar «Enviar por WhatsApp» se abre WhatsApp con tu pedido escrito. Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.`
  - Los textos T5 y T6 «Pulsa «Enviar por WhatsApp»…» (`flujo-pedido.tsx:387`, `:391`) se retiran con el panel.
- **Microayuda §5.9**: misma posición, clase y `aria-describedby` de hoy, entre el texto de LEG-171 y el botón. Por LEG-172 (4), el arranque «Para preparar tu pedido» cambia a **«Para enviar tu pedido»**, en los tres casos y en la variante de una sola frase. El resto del texto, sin cambio.
- **Botones** (360 px): `flex flex-col gap-3`, el principal primero. Desde `sm`: `flex-row-reverse justify-end`, con «Volver al envío» a la izquierda y el principal a la derecha. El orden del DOM es: principal, secundario.
- **El botón no se separa de las casillas (pedido de legal, a 360 × 740).** Entre la casilla 2 y el botón solo van, en este orden: las casillas de promociones, la línea del vendedor, el error de líneas (solo si lo hay), el texto de LEG-171 y la microayuda. Presupuesto a 360 px sin errores, desde el borde superior de la casilla 1 hasta el borde inferior del botón: casillas 1 y 2 ≈ 180 px, promociones ≈ 150 px, vendedor ≈ 40 px, LEG-171 ≈ 110 px (5 líneas de `small`), microayuda ≈ 50 px, botón 54 px, más separaciones ≈ 80 px: **≈ 660 px**. Cabe en la altura útil de 740 px menos el encabezado fijo (≈ 676 px). Por eso: (a) entre bloques se usan `mt-5`/`mt-6` y no `mt-8`; (b) ningún elemento nuevo entra en ese tramo; (c) el respaldo va **debajo** del botón, nunca entre las casillas y el botón. *Corregido el 2026-11-18 (QA-023):* el presupuesto subestimó las casillas (medido: 789 px). Rige la sección «QA-023» de este documento.
- **Panel de respaldo (LEG-173)**: `<div class="mt-6 rounded-lg bg-surface-sunken p-5">`. Sin borde de color, porque no es un error (`ink` sobre `surface-sunken` ≥ 13:1).
  - Primera línea: `<p role="status" class="small font-semibold text-ink">¿No se abrió WhatsApp? Copia el mensaje y envíalo al {formatearWhatsapp(tienda.whatsapp)}.</p>`. El número sale de `config.csv` y no se escribe a mano. La línea se anuncia una sola vez, al aparecer. Reemplaza la nota de hoy, «Si WhatsApp no se abre, copia el mensaje y envíalo al …» (`:403`).
  - «Copiar mensaje» copia `resultado.texto`, el mismo objeto que dio `resultado.enlace`. Mismo texto y mismo número DS.
  - `<pre id="mensaje-pedido">` vive dentro de `<details>` cerrado (`<summary class="text-sm font-bold">Ver el mensaje</summary>`), con `whitespace-pre-wrap rounded-lg bg-surface-raised p-4 text-sm`. Si el portapapeles falla, el código abre el `<details>` antes de seleccionar el texto.
  - Desde `sm`, «Copiar mensaje» tiene ancho natural.
- **Se retira**: el título «Tu pedido está listo para enviar por WhatsApp», la sección Confirmación, el segundo «Enviar por WhatsApp» y `?paso=confirmacion`.

### Comportamiento del clic en «Enviar por WhatsApp»

Microcopy §5.5 exige que «el enlace `wa.me` se abre con un clic del cliente, no con `window.open` tras una espera». LEG-172 es **bloqueante**: si las casillas 1 y 2 no están marcadas, no existen ni número DS, ni texto, ni enlace. Las casillas 3 y 4 nunca bloquean. Por eso:

1. **Es el `Boton` actual** (`<button type="button">`, primario, `lg`), con `IconoWhatsapp` y `aria-disabled="true"` mientras falte una casilla (el estilo de `.ds-btn[aria-disabled="true"]` ya existe). No se usa un `<a>` sin `href` al que se le pone el `href` durante el clic: el navegador decide si un elemento es un enlace antes de despachar el evento, así que ese truco no navega de forma fiable. Además, un `<a>` con el `href` armado de antemano generaría número y texto antes del clic, que es justo lo que LEG-172 prohíbe.
2. En `onClick`, **sin nada asíncrono antes de decidir**:
   - Si falta la casilla 1 o la 2: `preventDefault()`. No se llama a `generarNumeroSolicitud` ni a `prepararPedido` (no hay número, texto ni enlace). Errores bajo cada casilla y foco a la primera sin marcar (§5.9, regla 1; igual que hoy). No aparece el respaldo.
   - Si `prepararPedido` falla (café agotado, precio cambiado, mensaje inválido): `preventDefault()`, se muestra `.ds-alerta` y el foco va a esa caja (`tabIndex={-1}`). No se arma ningún enlace.
   - Si las casillas 1 y 2 están marcadas y `prepararPedido` sale bien: se genera el número DS (P39 = a, al pulsar), se arma el texto y se llama a `window.open(resultado.enlace, "_blank", "noopener,noreferrer")` **en el mismo manejador, de forma síncrona, sin `await`, `setTimeout` ni `requestAnimationFrame` antes** (LEG-172 (2); microcopy §5.5: lo prohibido es abrir «tras una espera»). Al ser síncrono dentro del gesto del usuario, Chrome, Safari iOS y Firefox no lo bloquean. Después se guarda `resultado` y aparece el respaldo. Con `noopener`, `window.open` devuelve `null`: el sitio no sabe si WhatsApp se abrió, y por eso el respaldo se muestra siempre tras un clic válido.
3. **Reintento**: con `resultado` vigente, otro clic abre el mismo `resultado.enlace`, con el mismo número DS, y el respaldo sigue copiando ese mismo texto (LEG-173 (2)). No se genera un número nuevo por cada clic ([CONSULTAR-LEGAL] 1).
4. **Cuándo se invalida `resultado` (LEG-173 (2))**: si cambia cualquiera de las cuatro casillas, cualquier dato de envío (también al volver a Envío) o el carrito (líneas o cantidades, desde el cajón o desde otra pestaña por `localStorage`). Entonces se borra `resultado`, el respaldo se oculta y el siguiente clic vuelve a validar y a generar número y texto. Cuando el respaldo se oculta, `role="status"` no anuncia nada: el cambio lo provocó el propio cliente.
5. **El carrito no se vacía solo**: el sitio no sabe si el cliente mandó el mensaje (decisión del 2026-11-04: el pedido existe solo cuando se envía). «Vaciar pedido» lo hace el cliente; el aviso con «Deshacer» es el que ya existe.

### Estados

| Estado | Qué ve el usuario |
|---|---|
| Cargando el carrito | «Cargando tu pedido…» (sin cambio), sin indicador de pasos |
| Carrito vacío en Envío o Resumen | El estado vacío de hoy («Tu pedido está vacío», «Agrega un café para armar tu pedido.», «Ver los cafés»), sin indicador. Foco al h1 |
| Vació el pedido después de abrir WhatsApp | El mismo estado vacío |
| Errores del formulario de envío | `.ds-alerta` encima del formulario («Revisa los campos marcados: …», texto actual) y foco al primer campo inválido (sin cambio). Cada campo, con `.ds-error` |
| Faltan casillas al pulsar | Errores bajo cada casilla con `.ds-error` y foco a la primera sin marcar. No se genera número, texto ni enlace, y no aparece el respaldo (LEG-172) |
| Cambió algo después de un clic válido | El respaldo desaparece y el siguiente clic vuelve a validar (LEG-173) |
| Falla `prepararPedido` (líneas) | `.ds-alerta` con el mensaje y la lista (textos de hoy), foco a la caja y, dentro, un botón enlace **Editar el pedido** [UI] que abre el cajón |
| Envío por cotizar | El texto de LEG-171 usa la variante «por cotizar» y la nota «Este valor no incluye el envío…» sigue en totales (sin cambio) |
| Mensaje recortado | La nota «Acortamos tus indicaciones…» en el panel de respaldo (sin cambio) |
| Recarga en Resumen | `replace` a `/pedido/` (los datos de envío están solo en memoria; sin cambio) |

### Foco y anuncios

- Al cambiar de paso, el foco va al h1 del paso (`tabIndex={-1}`, como hoy).
- Tras abrir WhatsApp, el foco **se queda en el botón**. El respaldo aparece justo debajo y su primera línea («¿No se abrió WhatsApp? …») se anuncia con `role="status"`. Al volver de WhatsApp, el siguiente Tab lleva a «Copiar mensaje».
- «Copiar mensaje» usa `avisar(...)` con los textos actuales (`:156`, `:166`).
- Errores: `role="alert"` en `.ds-alerta` y en los errores de las casillas (como hoy). Errores de campo, por `aria-describedby` con `aria-invalid` (como hoy).
- El orden de tabulación sigue el visual en todos los anchos.
- `prefers-reduced-motion`: esta especificación no agrega animación. Si el panel entra con un fundido, que sea de 150 ms en `opacity` y que quede sin transición con `motion-reduce:transition-none`.

---

## A2. Ficha `/cafes/<slug>/` a 360 px

### Objetivo

A 360 px, el nombre del café va al principio y el precio con «Agregar al pedido» quedan a una sola pantalla de desplazamiento, sin perder el principio 1: provincia y municipio se ven antes que el precio. Hoy, el H1 queda a ≈ 1.000 px y el botón a ≈ 1.500 px, detrás de las migas, la foto 3:4 (≈ 427 px), las miniaturas y el mini mapa.

### Orden

Bloques de `ficha-cafe.tsx`: **A** cabecera (antetítulo provincia·municipio, H1, notas, tueste) · **B** foto principal · **D** bloque de compra · **E** resto (perfil de taza, puntaje SCA solo si está verificado, ficha técnica con glosario, historia) · **G** medios secundarios (miniaturas, si hay más de una foto, y mini mapa).

| Ancho | Orden visual |
|---|---|
| < `lg` (360 px a 1.023 px) | migas → A → B → D → E → G |
| ≥ `lg` (escritorio) | **sin cambios visibles**: columna izquierda B y luego G; columna derecha A, luego D y luego E |

```
360 px
Cafés / Comunera / Café Arreboles        ← migas (caption)
SOCORRO · COMUNERA                       ← Antetitulo (chicamocha-600)
Café Arreboles                           ← H1 display-l a 36/42
panela, cítricos, chocolate              ← .quote, ink
▬ TUESTE MEDIO                           ← BarraAcento terracota + texto accent
┌──────────────────────────────┐
│   foto 4:3 o BolsaIlustrada  │         ← ≈ 240 px de alto, tope 55vh
└──────────────────────────────┘
┌ Bloque de compra ────────────┐         ← sin cambios internos
│ PRESENTACIÓN  [Grano][Molido]│
│ TAMAÑO  [250 g $…][500 g $…] │
│ (− 1 +)              $25.000 │
│ [   Agregar al pedido      ] │
└──────────────────────────────┘
Perfil de taza · Ficha técnica · Historia
Más fotos (miniaturas) · mini mapa
```

Cuentas aproximadas a 360 px, desde el inicio del `<article>`: H1 a ≈ 110 px, foto de ≈ 330 a 570 px, precio a ≈ 830 px y botón a ≈ 900 px. En un teléfono de 360 × 780, el H1 y el antetítulo se ven sin desplazar, y el botón aparece tras un desplazamiento de menos de una pantalla. Hoy aparece tras dos.

### Implementación (solo marcado y clases)

El orden del DOM pasa a ser **A, B, D, E, G**, el orden de lectura móvil. Así el lector de pantalla y el Tab leen primero el H1 y no la foto, y el orden visual coincide con el del DOM en móvil (WCAG 1.3.2 y 2.4.3). El escritorio se arma con áreas de cuadrícula:

```
Contenedor: grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:grid-rows-[auto_auto_1fr] lg:gap-x-16 lg:gap-y-8 lg:items-start
A  cabecera  lg:col-start-2 lg:row-start-1
B  foto      lg:col-start-1 lg:row-start-1 lg:row-span-2
D+E cuerpo   lg:col-start-2 lg:row-start-2 lg:row-span-2   (un solo contenedor con D y E dentro; E con mt-12 como hoy)
G  medios    lg:col-start-1 lg:row-start-3 space-y-8
```

- La fila 1 la mide A. La foto, que ocupa las filas 1 y 2, empuja la fila 2. El cuerpo empieza justo debajo de A, a 32 px (`gap-y-8`, igual que el `mt-8` de hoy), y los medios empiezan debajo de la foto, a 32 px (igual que el `space-y-8` de hoy). En escritorio se ve como hoy. **QA lo compara con una captura de la rama `main` a 1.280 px.**
- Foto B: `relative overflow-hidden rounded-lg aspect-[4/3] max-h-[55vh] w-full lg:aspect-[3/4] lg:max-h-none`. Con `max-h` activo, la altura queda en 55vh y `object-cover` recorta. `BolsaIlustrada` se centra sola (`viewBox` con `meet`). El sello SCA (solo si está verificado) sigue arriba a la derecha.
- Separación vertical en móvil: `gap-6` (24 px) entre bloques, en lugar del `gap-10` actual. Las migas, con `mt-6` en móvil y `md:mt-8`.
- La foto ya no es lo primero que se ve: sin `prioridad`, `loading="lazy"` está bien en móvil. En escritorio la foto se ve al cargar; si QA mide un LCP peor a 1.280 px, se pone `prioridad`.
- No cambian `BloqueCompra`, la ficha técnica, el glosario ni «Más cafés de…».

**Lo que no se hace:** no se agrega una barra fija de compra en móvil (exige lógica de visibilidad y tapa contenido con una mano) ni se repite el precio junto al H1. Si después de implementar el botón sigue lejos, se especifica aparte.

**Fotos reales** (hoy no hay ninguna): en móvil se recortan a 4:3 desde un original 3:4. El producto tiene que ir centrado, con aire arriba y abajo. Va en la guía de fotografía (ver TODO(dato)).

---

## M9. Color de error y pastilla «Agotado»

### Regla

La grana (`--danger` = grana-600 #b8162c en claro) **nunca es texto** (marca v4.1). En errores y estados queda solo como **borde del campo o de la caja e ícono indicador**. El texto va en `--ink` (tostado-900 #24170f en claro, pergamino en oscuro) y lleva siempre un **ícono más el texto**, para no depender del color (WCAG 1.4.1).

| Elemento | Token | Sobre | Contraste |
|---|---|---|---|
| Texto de error | `text-ink` (#24170f) | `surface` #f7f1e6 / `surface-raised` #fffcf6 | ≈ 15,5:1 / ≈ 17,0:1 |
| Ícono de alerta (no es texto) | `text-danger` (#b8162c) | ídem | ≈ 5,9:1 / ≈ 6,4:1 (≥ 3:1) |
| Borde de campo inválido y de caja | `border-danger` | ídem | ≈ 5,9:1 / ≈ 6,4:1 (≥ 3:1) |
| Tema oscuro | texto `--ink` #f7f1e6; ícono y borde `--danger` #ffb3b9 | `surface` #0a3f25 | ≥ 10:1 |
| Pastilla «Agotado», texto | `text-ink` | `surface-raised` / `surface` | ≈ 17:1 / ≈ 15,5:1 |
| Pastilla «Agotado», borde | `border-line-strong` (#857868) | ídem | ≈ 4,2:1 / ≈ 3,8:1 (≥ 3:1) |

### Iconos nuevos (`marca/iconos.tsx`, con el `Base` actual: trazo de 2 px y `currentColor`)

- `IconoAlerta`: `<circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5" /><path d="M12 16.5h.01" />`, un círculo con signo de admiración.
- `IconoNoDisponible`: `<circle cx="12" cy="12" r="9" /><path d="M5.6 18.4 18.4 5.6" />`, un círculo tachado.

Los dos son decorativos (`aria-hidden`, que `Base` ya pone): el significado lo lleva el texto.

### Clases nuevas (`componentes.css`, solo con tokens existentes)

```css
/* Mensaje de error en línea (campo o casilla): texto en tinta, ícono grana. */
.ds-error{display:flex;align-items:flex-start;gap:var(--space-2);margin:0;
  font-family:var(--font-sans);font-size:14px;line-height:22px;font-weight:600;color:var(--ink)}
.ds-error__icon{flex:none;width:18px;height:18px;margin-top:2px;color:var(--danger)}
/* Caja de errores (resumen del formulario, líneas del pedido). */
.ds-alerta{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3) var(--space-4);
  border:1.5px solid var(--danger);border-left-width:4px;border-radius:var(--radius-md);
  background:var(--surface-raised);color:var(--ink);font-size:14px;line-height:22px}
.ds-alerta__icon{flex:none;width:20px;height:20px;margin-top:1px;color:var(--danger)}
/* Cambia la línea 73: «Agotado» deja de usar la grana como texto. */
.ds-badge--soldout{background:transparent;color:var(--ink);border-color:var(--line-strong)}
```

### Aplicación, por ubicación

| # | Ubicación | Hoy | Corrección |
|---|---|---|---|
| 1 | `formulario-envio.tsx:107`, error de campo | `text-sm font-semibold text-danger` | `<p id="{id}-error" class="ds-error mt-1"><IconoAlerta class="ds-error__icon" /><span>{error}</span></p>` |
| 2 | `formulario-envio.tsx:68`, campo inválido | `aria-[invalid=true]:border-danger` | Se mantiene y se agrega `aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-inset aria-[invalid=true]:ring-danger`: el borde visible queda en 2 px sin mover el diseño. Aplica también a los `select` superpuestos |
| 3 | `flujo-pedido.tsx:236`, resumen de errores de Envío | `border border-danger … text-danger` | `<p role="alert" class="ds-alerta mt-4 font-semibold"><IconoAlerta class="ds-alerta__icon" /><span>…texto actual…</span></p>` |
| 4 | `flujo-pedido.tsx:319` y `:328`, errores de casillas | `text-sm font-semibold text-danger` | `ds-error pl-8` (alineado con el texto de la etiqueta: 20 px de casilla + 12 px de separación), con el ícono. Texto [LEGAL §5.9], sin cambio. La casilla con `aria-invalid` lleva la clase `ds-casilla` (anillo grana pegado, ver la regla de foco y error abajo; sustituye a `outline-offset-2 outline-danger`, QA-021) |
| 5 | `flujo-pedido.tsx:354`, error de líneas | `border border-danger … text-danger` | `<div role="alert" tabIndex={-1} class="ds-alerta mt-4">` con el ícono. Dentro: título en `font-semibold`, lista en `text-ink` y el botón enlace «Editar el pedido» (A1) |
| 6 | `componentes.css:73`, `.ds-badge--soldout` | texto y borde `--danger` | Clase de arriba. En `Pastilla` con `variante="agotado"` (`etiquetas.tsx`), anteponer `<IconoNoDisponible width={12} height={12} />` a los hijos. No cambian las props públicas |
| 7 | `bloque-compra.tsx:104-107`, ficha agotada | botón deshabilitado «Agotado» y, al lado, la pastilla «Agotado» | Quitar la pastilla: el botón deshabilitado ya lo dice y la pastilla repetía la palabra. Queda solo el `Boton` deshabilitado de ancho completo (`ink-muted` sobre `surface-sunken` ≈ 5,8:1) |

**Regla de foco y error (QA-021, 2026-11-18).** El contorno separado (2 px con offset) es solo del foco; el error nunca lo imita, porque `--focus` y `--danger` están demasiado cerca en el tema claro (1,16:1) y en el oscuro (oro y rosa claro). El error se marca pegado al control y el foco convive con él sin reemplazarlo:

- Casilla con error (`.ds-casilla[aria-invalid="true"]`, `componentes.css`): anillo grana de 2 px pegado a la casilla (`box-shadow 0 0 0 2px` + `outline` grana con offset 0, para navegadores que no pintan sombras en la casilla nativa).
- Casilla con error y foco: el mismo anillo grana más el contorno de foco a 4 px, con 2 px de fondo entre ambos. La forma distingue los estados; no depende de comparar dos colores.
- Campo de texto o `select` con error: borde grana + `ring-inset` (dentro de la caja); el foco es el contorno de `globals.css`, fuera de la caja. Ya cumplía la regla, sin cambio.
- Cualquier control nuevo con estado de error sigue la misma regla: error dentro o pegado; foco separado.

Observación (baja, fuera de M9): las píldoras de tamaño agotado usan `opacity-50` (`bloque-compra.tsx:17`). Los controles inactivos están exentos del 1.4.3, pero el texto «Agotado» de la píldora es información. Se propone después borde punteado `border-dashed border-line-strong` y texto `text-ink-muted` sin opacidad. No se incluye aquí.

QA: después del cambio no debe quedar `text-danger` en `src/` (`grep -rn "text-danger" src/` vacío). `--danger` queda solo en bordes, anillos, contornos e iconos.

---

## QA-023. Casilla 1 y «Enviar por WhatsApp» a 360 × 740

Defecto: `docs/qa/2026-11-18-verificacion-a1-fotos-qa-020.md`, QA-023 (Media). Captura: `docs/qa/capturas/2026-11-18-a1-resumen-360-casilla1.png`. Componente: `src/ui/componentes/checkout/flujo-pedido.tsx` (Resumen).

### Diagnóstico

El presupuesto de A1 («El botón no se separa de las casillas», ≈ 660 px) subestimó las casillas legales: calculó 180 px para las casillas 1 y 2, y miden ≈ 292 px (3 + 9 líneas); calculó 150 px para promociones, y miden ≈ 161 px (6 líneas). Medido: **789 px** desde el borde superior de la casilla 1 hasta el borde inferior del botón, con **665 px** útiles (740 − 75 del encabezado fijo). Sobran 124 px.

Reparto medido (360 px, sin correo, por lo tanto sin casilla 4; envío con tarifa; casillas sin marcar; sin errores):

| Bloque | Alto | Separación previa |
|---|---|---|
| Casillas 1 y 2 (`text-sm`, 3 + 9 líneas, `space-y-3`) | 292 | — |
| Promociones (borde 1 px + `pt-5` + casilla 3 de 6 líneas ≈ 140) | 161 | `mt-5` = 20 |
| Línea del vendedor (`caption`, 2 líneas) | 36 | `mt-4` = 16 |
| Texto de LEG-171 (`small` 14/22, 5 líneas) | 110 | `mt-6` = 24 |
| Microayuda §5.9, variante «faltan las dos» (`caption`, 3 líneas) | 54 | `mt-2` = 8 |
| «Enviar por WhatsApp» (`lg`: 16 + 22 + 16) | 54 | `mt-4` = 16 |
| **Total** | **789** (≈ 791 sumado) | |

Ningún bloque sobra: todos son legales o los pidió legal en ese lugar (§5.4, §5.9, §9.3). Los textos no se tocan.

**Sobre el criterio.** La condición de legal (revisión 2026-11-18, «Para disenador-marca») es «sin separar el botón de las casillas»: que entre las casillas y el botón no se interponga nada ajeno. Eso **ya se cumple** (QA lo verificó por orden). «La casilla 1 y el botón en la misma pantalla» fue una traducción de diseño a una medida, no una exigencia literal de legal. Aun así es una buena medida: quien marca las casillas ve el botón sin buscarlo. La propuesta la conserva donde se puede y, donde no, la sustituye por otra medida con salvaguardas.

### Propuesta en dos partes

**Parte 1. Compactar sin tocar textos ni orden (diseño; se implementa ya).** Ganancia ≈ 58 px.

| # | Cambio | Clases | Ganancia | Tipo |
|---|---|---|---|---|
| 1 | Microayuda en la **variante de una sola frase** de §5.9: `Para enviar tu pedido, marca las dos casillas.` (46 caracteres; cabe en una línea de `caption` en 320 px). §5.9 la autoriza tal cual («si diseño prefiere no cambiar el texto según el caso»). Qué casilla falta ya lo dicen los errores bajo cada una al pulsar | `caption mt-2 text-ink-muted` (sin cambio) | 54 → 18: **−36** | [LEGAL: §5.9, variante aprobada]. Exige cambiar `microayudaCasillas` (`src/domain/pedido/flujo.ts`): lo hace el desarrollador |
| 2 | Separación sobre el bloque de promociones | `mt-5 pt-5` → `mt-4 pt-4` (sigue el filete `border-t border-line`: separación visual clara, LEG-145) | **−8** | [UI] |
| 3 | Línea del vendedor | `mt-4` → `mt-3` | **−4** | [UI] |
| 4 | Texto de LEG-171 | `mt-6` → `mt-4` | **−8** | [UI] |
| 5 | Contenedor de los botones | `mt-4` → `mt-3` | **−4** | [UI] |
| 6 | Casillas 1 y 2: al enfocarlas (clic con casillas faltantes) no deben quedar bajo el encabezado fijo | `scroll-mt-24` en los dos `<input>` (96 px; el encabezado mide 75) | 0 (salvaguarda) | [UI] |

Ritmo resultante, de arriba abajo: casillas → 16 → filete → 16 → promociones → 12 → vendedor → 16 → [LEG-171 → 8 → microayuda → 12 → botón]. El texto de LEG-171, la microayuda y el botón quedan como una unidad (8 y 12 px), separada del vendedor (16 px). Todo con la escala de `--space-*` (12, 16) y las clases de tipo de la marca; no hay tokens nuevos.

Con la parte 1 sola: casilla 1 → botón ≈ **731 px** (sigue sin caber en 665) y casilla 2 → botón ≈ **649 px** (cabe, con 16 px de aire).

**Parte 2. Las casillas de promociones encima de las obligatorias [CONSULTAR-LEGAL] (opción B3, recomendada).** Ganancia ≈ 173 px más dentro del tramo.

Orden visual y del DOM en el Resumen: … «Envío a» → **casillas 3 y 4 (promociones)** → filete → **casillas 1 y 2 (obligatorias)** → vendedor → LEG-171 → microayuda → botón. Los nombres «Casilla 1 … 4», los textos, el estado sin marcar, los errores y la lógica no cambian; solo cambia el orden en pantalla.

- Las obligatorias quedan pegadas a la acción que habilitan; las opcionales, antes y apartadas por el filete. Es más claro que hoy: lo que bloquea el botón está junto al botón.
- Nada queda oculto: las cuatro casillas se ven completas, sin desplegables.
- La casilla 4 (solo con correo) aparece encima del tramo, así que tampoco lo alarga. Hoy, con correo, el tramo crece ≈ 120 px más.
- Clases: promociones `<fieldset class="mt-6 space-y-3 border-b border-line pb-4">`; obligatorias `<fieldset class="mt-4 space-y-3">`. El resto, como en la parte 1.

Con las partes 1 y 2: casilla 1 → botón ≈ **558 px** (107 px de aire en 665), con o sin casilla 4.

**Alternativas si legal no acepta B3** (también [CONSULTAR-LEGAL]; ninguna se implementa sin respuesta):

| Opción | Qué hace | Ganancia en el tramo | Casilla 1 → botón (con la parte 1) | Contra |
|---|---|---|---|---|
| B2 | Promociones en `<details>` cerrado, `<summary>` «Promociones (opcional)» [UI] de 44 px, dentro del mismo filete | ≈ −112 | ≈ 619 | Oculta un consentimiento opcional: probablemente menos autorizaciones (lo debe saber el dueño). Si una casilla está marcada, el `<details>` debe quedar abierto (lógica del desarrollador) |
| B1 | Línea del vendedor debajo de los botones (sigue «bajo las casillas», §5.4, y antes del respaldo) | ≈ −48 | ≈ 683 | No basta sola para la casilla 1; sí deja casilla 2 → botón ≈ 601 |

**Descartadas:**
- Promociones **después** del botón: entran en el mensaje (D5 §6.4); marcarlas después del clic invalida el envío (LEG-173) y obliga a reenviar. Además pondría un consentimiento después de la acción.
- Casillas en `caption` (12 px): ganancia incierta (≈ 12 a 30 px, según cómo partan las líneas) a costa de la legibilidad de un consentimiento.
- Barra fija inferior con el botón: separa el texto de LEG-171 del botón (§9.3: «justo encima»).
- Botón de tamaño medio: −10 px a cambio de restar jerarquía al CTA final.
- Quitar la microayuda o el texto de LEG-171: §5.9 y §9.3 los exigen.

### Wireframe a 360 × 740, partes 1 y 2 (B3), con la casilla 1 justo bajo el encabezado

```
y=0    ┌──────────────────────────────────────┐
       │ De Santander              [Pedido 1] │  encabezado fijo, 75 px
y=75   ├──────────────────────────────────────┤
       │ [ ] Leí y acepto los Términos y      │  casilla 1, text-sm, 3 líneas ≈ 70
       │     condiciones versión 1.0 del 17   │
       │     de noviembre de 2026.            │
       │                                      │  space-y-3 = 12
       │ [ ] Autorizo a De Santander SAS a    │  casilla 2, 9 líneas ≈ 210
       │     tratar mis datos personales …    │
       │     … versión 1.0 del 17 de          │
       │     noviembre de 2026.               │
       │                                      │  mt-3 = 12
       │ Te vende De Santander SAS · NIT …    │  vendedor, caption, 2 líneas = 36
       │ Información del vendedor             │
       │                                      │  mt-4 = 16
       │ Al pulsar «Enviar por WhatsApp» se   │  LEG-171, small 14/22, 5 líneas = 110
       │ abre WhatsApp con tu pedido escrito. │
       │ …                                    │
       │                                      │  mt-2 = 8
       │ Para enviar tu pedido, marca las dos │  microayuda §5.9, 1 línea = 18
       │ casillas.  (una sola línea)          │
       │                                      │  mt-3 = 12
       │ [ (wa)  Enviar por WhatsApp        ] │  primario lg, 54
y≈633  │                                      │  gap-3 = 12
       │ [ ←  Volver al envío               ] │  secundario, 44
y≈689  │                                      │
y=740  └──────────────────────────────────────┘
Arriba (desplazando hacia arriba): «Envío a» → mt-6 → casilla 3 (6 líneas) [→ casilla 4 si hay correo] → pb-4 → filete.
```

### Wireframe a 360 × 740, solo la parte 1 (si legal no responde o no acepta B1–B3), con la casilla 2 justo bajo el encabezado

```
y=75   ├──────────────────────────────────────┤  (la casilla 1 queda ≈ 82 px arriba, fuera de la pantalla)
       │ [ ] Autorizo a De Santander SAS …    │  casilla 2, 9 líneas ≈ 210
       │                                      │  mt-4 = 16
       │ ──────────────────────────────────── │  filete
       │                                      │  pt-4 = 16
       │ [ ] Quiero recibir novedades … BAJA  │  casilla 3, 6 líneas ≈ 140
       │                                      │  mt-3 = 12
       │ Te vende De Santander SAS · NIT …    │  36
       │                                      │  mt-4 = 16
       │ Al pulsar «Enviar por WhatsApp» …    │  110
       │                                      │  mt-2 = 8
       │ Para enviar tu pedido, marca las dos casillas. │  18
       │                                      │  mt-3 = 12
       │ [ (wa)  Enviar por WhatsApp        ] │  54
y≈724  └──── (Volver al envío, debajo del borde) ┘
```

En este caso, que la casilla 1 quede fuera de la pantalla se acepta con estas **salvaguardas, que ya existen o entran en la parte 1**: (a) la microayuda, justo encima del botón, dice que faltan las dos casillas y está enlazada al botón con `aria-describedby`; (b) el botón lleva `aria-disabled` y su estilo de inactivo mientras falte una; (c) al pulsarlo sin las dos, no se genera nada (LEG-172), aparece el error bajo cada casilla y el foco va a la primera sin marcar; (d) con `scroll-mt-24`, esa casilla queda visible bajo el encabezado y no tapada por él.

### Presupuesto final por bloque (360 px, sin errores)

| Bloque | Hoy | Parte 1 | Partes 1 + B3 |
|---|---|---|---|
| Casillas 1 y 2 | 292 | 292 | 292 |
| Separación + filete + promociones (casilla 3) | 20 + 161 | 16 + 157 | fuera del tramo |
| Vendedor | 16 + 36 | 12 + 36 | 12 + 36 |
| LEG-171 | 24 + 110 | 16 + 110 | 16 + 110 |
| Microayuda | 8 + 54 | 8 + 18 | 8 + 18 |
| Botón | 16 + 54 | 12 + 54 | 12 + 54 |
| **Casilla 1 → botón** | **789** | **≈ 731** | **≈ 558** |
| **Casilla 2 → botón** | ≈ 707 | **≈ 649** | ≈ 476 |
| Con correo (casilla 4, ≈ +122) | ≈ 911 | ≈ 853 | ≈ 558 (sin cambio) |

### Criterio de aceptación para qa-pruebas

Condiciones de medida: Chromium, 360 × 740, DPR 1, tema claro, después de `document.fonts.ready`; Resumen con envío a Bucaramanga (variante de LEG-171 con tarifa, la más larga); sin correo (sin casilla 4) salvo donde se indique; casillas sin marcar; sin errores. `U` = 740 − alto del encabezado (hoy 75 → 665). `M1` = borde inferior del botón «Enviar por WhatsApp» − borde superior de la etiqueta de la casilla 1. `M2` = lo mismo desde la etiqueta de la casilla 2.

Siempre (parte 1):
1. La microayuda dice exactamente `Para enviar tu pedido, marca las dos casillas.` (con una o con las dos casillas sin marcar) y mide una línea (alto ≤ 19 px). Desaparece con las dos marcadas.
2. Separaciones calculadas: filete de promociones a 16 px por encima y por debajo; vendedor `margin-top` 12; LEG-171 16; microayuda 8; contenedor de botones 12.
3. Los textos de las casillas, la línea del vendedor, LEG-171 y los errores siguen letra por letra (`toHaveText` contra la microcopy v1.10).
4. Entre la última casilla y el botón solo están, en este orden del DOM, los bloques de la tabla de presupuesto: promociones (solo sin B3), vendedor, error de líneas (si lo hay), LEG-171, microayuda.
5. Al pulsar con las dos casillas sin marcar: el foco queda en la casilla 1 y el borde superior de su etiqueta queda en `y ≥ 75` (visible bajo el encabezado), con su error visible.
6. axe sin violaciones serias ni críticas en el Resumen a 360 y 1.280 px, claro y oscuro.

Si legal acepta B3 (prueba de cierre de QA-023 tal como está hoy):
7. `M1 ≤ U − 16` (≤ 649), esperado ≈ 558. También con correo (casilla 4 visible): `M1 ≤ U − 16`.
8. Orden del DOM: `casillas-promociones` antes de `casillas-obligatorias`; filete entre los dos.

Si legal no acepta B3 ni B2 (criterio sustituto, con la decisión citada en la aserción):
7'. `M2 ≤ U` (≤ 665), esperado ≈ 649. `M1` se registra como anotación, sin aserción (esperado ≈ 731).
8'. Se mantienen las salvaguardas 1 y 5.

Si legal acepta B2 en vez de B3: `M1 ≤ U − 16`, esperado ≈ 619, con el `<details>` cerrado; con una casilla de promociones marcada, el `<details>` sigue abierto tras recargar el paso.

Antes de medir, QA anota el `line-height` calculado de las etiquetas de las casillas. La suma de 292 px para 12 líneas (más 12 de separación) da ≈ 23 px por línea, y `text-sm` debería dar 20. Si el calculado no es 20 px, se reporta aparte: esa diferencia (≈ 40 px en las casillas 1 y 2) no la crea esta propuesta y conviene entenderla antes de fijar el criterio.

---

## Decisiones y su razón en la marca

| Decisión | Razón |
|---|---|
| El paso Carrito se retira; la edición es el cajón, abierto desde un bloque compacto en Envío | Celular primero (principio 4): un paso menos y un formulario más corto. Se reutiliza un componente existente |
| Indicador «Pedido · Envío · Resumen», sin «WhatsApp» | WhatsApp es el destino del botón, no una pantalla del sitio; prometerlo como paso confunde |
| Un solo «Enviar por WhatsApp», y abre WhatsApp | D1 §5 y LEG-159, alternativa (b) |
| El texto de LEG-171 va encima del botón, en `small` | La página hace el trabajo del chat (principio 2): el cliente sabe qué pasa antes de pulsar. En `small`, el botón queda en la misma pantalla que las casillas a 360 × 740 |
| `<button>` con `window.open` síncrono, en vez de un enlace preparado de antemano | LEG-172: no puede haber número ni texto antes del clic válido. Es la única forma fiable de abrir en el mismo gesto |
| Envío: «Ver el resumen»; cajón: «Continuar con el envío» | LEG-174. Cada botón nombra a dónde lleva; ninguno dice «finalizar» |
| Respaldo debajo del botón, en `surface-sunken` y sin color de alerta | No se interpone entre las casillas y el botón; no es un error, y la marca reserva la grana |
| Ficha móvil: A, B, D, E, G con el DOM en ese orden | Origen antes que precio (principio 1), compra a una mano y orden de lectura correcto |
| Foto 4:3 con tope de 55vh solo en móvil | Recupera ≈ 190 px sin quitar la foto; el escritorio conserva el 3:4 |
| Error en tinta con ícono grana | Marca v4.1: grana nunca como texto; WCAG 1.4.1 y 1.4.11 |
| «Agotado» en contorno `line-strong`, sin grana | La pastilla grana significa «edición limitada» en la marca; agotado no es un error |
| QA-023: compactar con la escala `--space-*` y la microayuda de una frase; proponer las promociones encima de las obligatorias | Celular primero (principio 4): lo que bloquea el botón queda junto al botón, sin ocultar ni recortar ningún texto legal (principio 3) |

## TODO(dato)

Esta especificación no inventa datos. Para que `desarrollador-fullstack` o la sesión principal los agreguen a `docs/PENDIENTES.md` (este agente solo escribe en `docs/diseno/`):
- `TODO(dato):` guía de encuadre de las fotos de producto: el original 3:4 se recorta a 4:3 en la ficha móvil, así que el producto va centrado con aire arriba y abajo. Depende de que existan fotos reales (hoy ninguna).

## Preguntas abiertas

**[CONSULTAR-LEGAL]** (las tramita la sesión principal con `legal-cumplimiento`):
LEG-171 a LEG-175 ya respondieron las preguntas sobre el panel, la microayuda, el texto del respaldo y los botones. Quedan dos:
1. **Reintento y número DS (P39)**: si el cliente pulsa otra vez «Enviar por WhatsApp» sin cambiar nada, se abre el **mismo** enlace con el **mismo** número DS. LEG-173 lo pide para «Copiar mensaje», pero no lo dice para el segundo clic. ¿Es correcto?
2. **Orden de la microayuda §5.9**: el código (`flujo-pedido.tsx:121`) dice «los términos y condiciones y la autorización de tus datos»; §5.9 v1.1 dice el orden inverso. Con el cambio de LEG-172 (4) a «Para enviar tu pedido», ¿qué orden rige? (Lo puede fijar la microcopy v1.10, LEG-176.) *Con QA-023, parte 1, la microayuda pasa a la variante de una sola frase y la pregunta deja de afectar a la interfaz.*
3. **QA-023, B3**: ¿se pueden mostrar las casillas 3 y 4 (promociones) **encima** de las casillas 1 y 2, separadas por un filete, sin cambiar textos, numeración ni comportamiento? D5 §6.3 y LEG-145 fijan el orden 1-2-3-4.
4. **QA-023, si no B3**: ¿se acepta B2 (promociones dentro de un `<details>` cerrado «Promociones (opcional)») o B1 (línea del vendedor debajo de los botones, que sigue «bajo las casillas», §5.4)?
5. **QA-023, criterio**: la condición «sin separar el botón de las casillas» se cumple por orden. Si no se acepta ninguna opción B, ¿basta con que la casilla 2 y el botón quepan en una pantalla, con las salvaguardas de la parte 1?

**Bloqueo de implementación:** LEG-171 necesita que **el abogado** valide la adaptación de los textos de D5 §6.3 y el retiro del panel. Hasta entonces, A1 no se publica. Si el abogado no lo valida, rige la alternativa (a) (ver «Salvaguarda»).

**[CONSULTAR] al dueño:** ninguna. La dirección de A1, A2 y M9 ya está aprobada.

## Entrega para desarrollador-fullstack

1. A1, después de que el abogado valide LEG-171:
   - rutas y redirecciones de la tabla «Rutas»;
   - retirar `carrito` y `confirmacion` de `PASOS` (LEG-175) e indicador «Pedido · Envío · Resumen»;
   - bloque compacto «Tu pedido» en Envío, con el aviso de privacidad que se queda en Envío;
   - botones «Continuar con el envío» y «Ver el resumen» (LEG-174);
   - texto de LEG-171 con `data-testid="texto-siguiente-paso"`, y la microayuda con «Para enviar tu pedido»;
   - `<button>` «Enviar por WhatsApp» que valida las casillas 1 y 2 y solo entonces genera número y texto y llama a `window.open(resultado.enlace, …)` de forma síncrona (LEG-172);
   - respaldo de LEG-173, invalidado al cambiar casillas, envío o carrito;
   - foco y anuncios.

   Las casillas, el aviso de privacidad, el retracto, el IVA, la nota de precio total y la línea del vendedor no se tocan. Actualizar `e2e/` y las pruebas: «Finalizar el pedido» pasa a ser «Ver el resumen», ya no hay paso Confirmación y el enlace `wa.me` ahora se abre con `window.open`.
2. A2: reordenar el DOM de `ficha-cafe.tsx` a A, B, D+E, G con las clases de cuadrícula indicadas; foto `aspect-[4/3] max-h-[55vh] lg:aspect-[3/4] lg:max-h-none`.
3. M9: `IconoAlerta` e `IconoNoDisponible`; `.ds-error`, `.ds-alerta` y `.ds-badge--soldout` en `componentes.css`; las siete correcciones de la tabla. Los commits citan A1, A2 o M9 (y el QA-### que abra QA).

## Entrega para qa-pruebas

- axe a 360 px y a 1.280 px en `/pedido/`, `/pedido/?paso=resumen` (con errores de casillas, error de líneas y panel de respaldo) y `/cafes/<slug>/` (con un café agotado si hay uno).
- Indicador de pasos en una línea a 360 px; a 320 px solo se ve el rótulo del paso actual.
- Un solo clic en «Enviar por WhatsApp» abre `wa.me` (pestaña nueva, sin bloqueo de ventanas emergentes en Chrome, Safari iOS y Firefox), con la constancia v1.0 y el número DS en `text`. Sin las casillas 1 y 2: no se abre `wa.me`, no aparece el respaldo, no se copia nada y el foco va a la primera sin marcar. El segundo clic abre el mismo mensaje.
- «Copiar mensaje» copia un texto idéntico al del enlace. Si después cambia una casilla, un dato de envío o el carrito, el respaldo se oculta.
- A 360 × 740, sin errores: la casilla 1 y el botón caben en la misma pantalla. *Sustituido por el criterio de la sección «QA-023».*
- Con envío por cotizar, el texto de LEG-171 sale en su variante. El aviso de privacidad sigue en Envío. No queda ningún «Finalizar» ni paso «Confirmación».
- No hay «Abrir WhatsApp» ni un segundo «Enviar por WhatsApp» en la página.
- Ficha a 360 px: orden A, B, D, E, G y orden de Tab igual al visual; a 1.280 px, comparación visual con `main` (sin cambios).
- `grep -rn "text-danger" src/` vacío; contraste de bordes e iconos ≥ 3:1 y de textos ≥ 4,5:1 en tema claro y oscuro.
- `prefers-reduced-motion`: sin transición en el panel de respaldo.
