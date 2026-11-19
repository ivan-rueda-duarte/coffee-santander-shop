# Auditoría UX, severidad media: objetivos táctiles (M1), barra «Tu pedido» (M2), navegación móvil (M3), mapa e inicio (M4), tarifas de /envios/ (M8), leyenda de promociones y ficha agotada

Fecha: 2026-11-18 · Autor: disenador-marca · Rama: `feat/ux-auditoria` · Estado: especificación, pendiente de implementar
Fuentes: `docs/marca-v4.1.md`, `PRODUCT.md` (principios 1, 3, 4 y 5; terminología «provincia»; decisiones del 2026-11-14), `docs/diseno/2026-11-18-ux-auditoria-alta.md` (A1, A2, M9, QA-023), tokens de `src/styles/marca.css` y clases de `src/styles/componentes.css`.
Fuera de alcance (otro desarrollador, en paralelo): M5, M6, M7, M10 y QA-018. Nada de esta especificación los toca.

Esta especificación **no crea tokens ni clases de componente**. Solo usa utilidades de Tailwind sobre los tokens que ya existen (`min-h-11`, `text-ink-muted`, `border-line-strong`, `bg-surface-raised`…) y pseudo-elementos para ampliar áreas táctiles.

Convención de textos: **[UI]** rótulo de interfaz que decide diseño; **[LEGAL: fuente]** texto que va letra por letra; **[CONSULTAR]** lo decide el dueño; **[CONSULTAR-LEGAL]** lo dictamina `legal-cumplimiento`.

Líneas verificadas el 2026-11-18 en la rama `feat/ux-auditoria`:

| Hallazgo | Ubicación comprobada |
|---|---|
| `.ds-btn--sm` a 40 px | `src/app/globals.css:23` |
| «Pedido» de la cabecera | `encabezado.tsx:41` |
| «Agregar» de tarjeta | `boton-agregar.tsx:14` |
| «Filtros» / «Limpiar filtros» | `explorador.tsx:62`, `:114` |
| «Deshacer» / «Vaciar pedido» del cajón | `cajon-contenido.tsx:68`, `:89` |
| «Editar» del Resumen y del bloque compacto | `flujo-pedido.tsx:283`, `:351`, `:430` |
| Acción de avisos | `avisos.tsx:47` |
| Botones del mapa | `tarjeta-provincia.tsx:74`, `:78`; `mapa-provincias.tsx:306` |
| Chips de filtro `min-h-9` | `controles-filtro.tsx:42`, `:79`; filtros activos `explorador.tsx:107` |
| Selects ≈ 38 px | `explorador.tsx:86`; `linea-pedido.tsx:13` |
| Migas ≈ 18 px | `ficha-cafe.tsx:28` (componente `Migas`, también en `/envios/`) |
| Enlaces del pie ≈ 30 px | `pie.tsx:62`; enlace de WhatsApp del pie `pie.tsx:36` |
| Pines del mapa 26 px | `mapa.css:24-25` |
| Barra fija «Tu pedido» | `cajon-carrito.tsx:27`, montada en `src/app/proveedores.tsx:26` **después** del `Pie` |
| Navegación oculta en celular | `encabezado.tsx:30` (`hidden … md:flex`) |
| Texto del mapa | `seccion-mapa.tsx:42`; comportamiento táctil `mapa-provincias.tsx:232-236` |
| Orden del inicio | `src/app/page.tsx:11-15` |
| «Elige por origen» | `seccion-catalogo.tsx:19` |
| Tabla de tarifas `min-w-[44rem]` | `src/app/envios/page.tsx:68` |
| Leyenda «Promociones (opcional)» | `flujo-pedido.tsx:369` |
| Ficha agotada | `bloque-compra.tsx:16-18`, `:33-35`, `:67-92` |

---

## M1. Objetivos táctiles de 44 px

### Regla

Todo control que se pulsa con el dedo tiene **un área táctil de al menos 44 × 44 px** (celular primero, principio 4; WCAG 2.5.5). Hay dos formas de llegar, y se elige según el control:

- **(a) Subir el tamaño visual a 44 px** cuando el control ya tiene caja visible (botones con relleno o borde, selects) y crecer 4 a 6 px no rompe la composición.
- **(b) Ampliar solo el área táctil** con un pseudo-elemento transparente, sin cambiar lo que se ve, cuando el control vive en una composición densa (chips en filas, migas, pines del mapa).

Patrón (b), en utilidades de Tailwind sobre el propio control (que pasa a `relative`):

```
relative before:absolute before:content-[''] before:inset-x-{X} before:-inset-y-{Y}
```

El pseudo-elemento recibe el toque y el clic (es parte del elemento), no tiene color, no cambia el flujo y no aparece en el árbol de accesibilidad. El anillo de foco sigue siendo el del control (`:focus-visible` de `globals.css`), no el del área ampliada.

**Cálculo del desplazamiento (corregido por QA-025):** un `::before` absoluto se coloca respecto a la **caja de relleno** (por dentro del borde), no respecto a la caja exterior. Por eso el valor de `inset` se calcula así, en cada eje:

```
desplazamiento = (44 − medida exterior del control) / 2 + ancho del borde
```

Sin borde (migas, pines, enlaces, `<summary>`) el último término es 0. Con el borde de 1 px de `.ds-tag--outline`, un chip de 36 px necesita `(44 − 36) / 2 + 1 = 5 px`, no 4. Si el resultado no es entero se redondea hacia arriba. Detalle completo en «QA-025 y QA-026».

Los enlaces **dentro de una frase** (p. ej. «Zonas, tarifas y plazos» en el pie, «Ver plazos» en la ficha, el correo del vendedor) quedan como están: la excepción «en línea» de WCAG 2.5.5/2.5.8 los cubre y agrandarlos rompería el renglón.

### Tabla de cambios

| # | Control | Hoy | Corrección | Forma |
|---|---|---|---|---|
| 1 | `.ds-btn--sm` (todos: «Pedido», «Agregar», «Filtros», «Limpiar filtros», «Deshacer», «Vaciar pedido», «Editar», «Editar el pedido», acción de avisos, «Ver cafés de…», «Agregar/Quitar del filtro», «Ver todo Santander», «Seguir viendo cafés») | `min-height: 40px` (`globals.css:23`) | `min-height: 44px`. Se conserva el tipo de 13/16 y el relleno `8px 16px`: el botón gana 4 px de alto y sigue siendo «pequeño» por su tipo y su ancho. El comentario de la línea 21 pasa a «44 px todos» | (a) |
| 2 | Chips de filtro (`GrupoChips`, `GrupoOpcionUnica`, filtros activos) | `min-h-9` = 36 px | Se queda `min-h-9` visual y se agrega `relative before:absolute before:content-[''] before:inset-x-0 before:-inset-y-[5px]` (36 − 2 de borde + 5 + 5 = 44; con `-inset-y-1` daba 42, QA-025). Con `gap-2` (8 px) entre filas, las áreas de dos filas se tocan sin solaparse. En `GrupoOpcionUnica` las clases van en el `<span>` dentro del `<label>` | (b) |
| 3 | Selects «Ordenar» (`explorador.tsx:86`) y de tamaño/presentación de cada línea (`linea-pedido.tsx:13`) | `px-3 py-2 text-sm` ≈ 38 px | `h-11 px-3 text-base md:text-sm` (44 px). **`text-base` en celular**: con menos de 16 px, Safari de iOS hace zoom al enfocar el select y descoloca la página | (a) |
| 4 | Migas (`Migas`, `ficha-cafe.tsx:28`) | `caption` 12/18, ≈ 18 px | En el `<Link>`: `relative before:absolute before:content-[''] before:-inset-x-1.5 before:-inset-y-[13px]` (18 + 26 = 44 de alto; «Cafés» ≈ 32 + 12 = 44 de ancho). La fila de migas no cambia de alto. Por debajo, el área entra 13 px en el `mt-6` (24 px) que la separa del antetítulo: no lo toca | (b) |
| 5 | Enlaces de «Información legal» del pie (`pie.tsx:62`) | `inline-block py-1` ≈ 30 px | `inline-flex min-h-11 items-center` y la lista pasa de `space-y-1` a `space-y-0`. La columna crece ≈ 44 px; el pie tiene aire de sobra | (a) |
| 6 | Enlace «WhatsApp +57 …» del pie (`pie.tsx:36`) | texto `text-sm` ≈ 20 px | `inline-flex min-h-11 items-center` | (a) |
| 7 | Pines del mapa (`mapa.css:24`) | `min-height: 26px` | Visual sin cambio. Se agrega a `mapa.css`: `.mapa-pin::before{content:"";position:absolute;left:0;right:0;top:-9px;bottom:-9px}` (26 + 18 = 44) y `.mapa-pin--compacto::before{left:-9px;right:-9px}` (el pin compacto mide 26 de ancho: 16 de punto + 2 × 5 de margen). El pin ya es `position:absolute`, así que el pseudo-elemento se coloca respecto a él | (b) |
| 8 | Botón «Pedido» de la cabecera a menos de 360 px (desborda 7 px a 280 px, nota de QA) | rótulo «Pedido» siempre visible | En el `<span>Pedido</span>`: `max-[359px]:sr-only`. Queda la bolsa más la pastilla con el número; el nombre accesible sigue siendo «Pedido, N bolsas». La fila del encabezado pasa de `gap-4` a `gap-3 sm:gap-4`. A 280 px: marca ≈ 140 + 12 + botón ≈ 80 = 232 de 240 útiles | (a) |
| 9 | Aviso con acción (`avisos.tsx:42`) | `py-3`; con el botón a 44, la píldora mediría 68 px | `py-2 pl-5 pr-2` cuando hay acción (la píldora queda en 60 px). Sin acción, como hoy. El botón sigue siendo `ds-btn--gold` sobre `tostado-900` (oro con texto carbón sobre oscuro, regla de marca) | (a) |
| 10 | Fila «Cambiaste tu pedido. Deshacer» del cajón (`cajon-contenido.tsx:66`) | `py-2` | `py-1`: el botón enlace ya da los 44 px | (a) |

Controles que **ya cumplen** y no se tocan: «−» y «+» de cantidad y «Quitar» de cada línea (`h-11 w-11`), píldoras de presentación y tamaño de la ficha (`min-h-11`), botones `md` y `lg`, cerrar la hoja de provincia (`h-11 w-11`), las provincias del mapa (formas grandes).

### Efectos sobre otras especificaciones

- **Encabezado:** con «Pedido» a 44 px, la fila del encabezado no puede pasar del alto actual (75 px, medido en QA-023). Si crece, se compensa con `py-2.5` en lugar de `py-3` en el contenedor del encabezado. El presupuesto de QA-023 (B3) tiene 107 px de aire, pero `U = 740 − alto del encabezado` es parte del criterio: QA vuelve a medir el encabezado.
- **Resumen (A1):** los «Editar» de «Tu pedido» y de «Envío a» pasan de 40 a 44 px; están **encima** del tramo casillas → botón, así que no cambian `M1` ni `M2` de QA-023.
- **Mapa:** `colocarPines` reserva 26 px de alto por pin (`mapa-provincias.tsx:109`). Con el área ampliada, dos pines muy cercanos podrían solapar sus áreas táctiles (gana el último en el DOM). Con los cinco cafés de hoy no pasa a 360 px; si QA lo encuentra, el desarrollador decide si pasa `alto: 44` a `colocarPines` (es lógica: no lo decide diseño).

### Wireframe, tarjeta de café a 360 px (pie de la tarjeta)

```
│ $25.000                       ( Agregar ) │   ← precio 20/24 + nota 12/16 = 40; botón 44 (antes 40)
│ 250 g                                     │
```

### Wireframe, filtros de provincia a 360 px

```
PROVINCIA                                      ← overline ink-muted
( ● Comunera 2 ) ( ● Guanentá 1 ) ( ● García Rovira 1 )   ← 36 visibles; área táctil 44 (líneas punteadas no se ven)
( ● Soto Norte 0 ) …
( ⚲ Filtros )                                  ← sm, 44
```

---

## QA-025 y QA-026. Áreas táctiles que faltaban en M1

Mismo criterio de M1: área táctil ≥ 44 × 44 a 360 px, forma (a) o (b), sin tokens ni clases nuevas. Líneas verificadas el 2026-11-18 en `bbd2923`.

### QA-025: regla general del área ampliada

La regla de cálculo de M1 («Cálculo del desplazamiento») se aplica a todo `::before` de área ampliada: **el área se mide desde el borde exterior del control y el desplazamiento suma el ancho del borde**. Controles afectados hoy:

| Control | Borde | Medida exterior | Desplazamiento vertical | Resultado |
|---|---|---|---|---|
| Chips de filtro y filtros activos (`.ds-tag--outline`) | 1 px | 36 | `before:-inset-y-[5px]` | 34 + 10 = 44 |
| Migas | 0 | 18 | `before:-inset-y-[13px]` (sin cambio) | 44 |
| Pines del mapa | 0 | 26 | 9 px (sin cambio) | 44 |

El eje horizontal de los chips se queda en `before:inset-x-0`: el chip ya mide más de 44 de ancho y su propio borde también recibe el toque. Si en el futuro un control con borde necesita área ampliada también a lo ancho, la regla es la misma (`-inset-x-[(44 − ancho)/2 + borde]`).

### QA-026: forma de cada control

| # | Control | Hoy | Corrección | Forma |
|---|---|---|---|---|
| 1 | «Cómo calculamos el envío» (`totales-pedido.tsx:125`), en el cajón, `/pedido/` (envío) y el resumen | 159 × 15, enlace dentro de un `<p class="caption">` | En el `<Link>`: `relative before:absolute before:content-[''] before:inset-x-0 before:-inset-y-[15px]` (15 + 30 = 45). **No está exento:** es el único contenido de su párrafo, no un enlace dentro de una frase, así que la excepción «en línea» de M1 no lo cubre (sí pasa 2.5.8 por espaciado, pero el criterio de M1 es 44). Se elige (b) para no mover el botón «Continuar con el envío» del cajón ni el tramo del resumen que mide QA-023. Holguras: debajo, 16 px hasta «Continuar con el envío» en el cajón (`mt-4`), 12 hasta el aviso de «por cotizar» y 32 hasta los botones del envío; arriba, la línea del total, que no es interactiva. Ninguna área se solapa con otro control | (b) |
| 2 | `<summary>` «¿Qué significa cada dato?» (`ficha-cafe.tsx:136`) | 288 × 20 (`text-sm`, 20 de interlineado) | En el `<summary>`: `relative before:absolute before:content-[''] before:inset-x-0 before:-inset-y-3` (20 + 24 = 44). El área entra 12 px en el relleno `p-4` de la caja: no sale de ella cerrada y, abierta, toca 0 px de la lista (`mt-3` = 12). **No se cambia el `display` del `<summary>`** (nada de `flex` ni `block`): con otro valor que `list-item`, Chromium quita el triángulo nativo, que es la señal de que se despliega | (b) |
| 3 | Pulgares de «Altitud» y «Precio desde» (`filtro-rango.tsx:51`), raíz `h-6` (`:37`) | pulgar 20 × 20, raíz 24 | La que recibe el toque es la **raíz** del Slider de Radix (cualquier punto de la raíz mueve el pulgar más cercano), así que se amplía la raíz y no el pulgar: `h-6` pasa a **`h-11`** (44). El riel y los pulgares no cambian de tamaño ni de dibujo (riel de 4 px, pulgar de 20 con borde `monte-900` de 2 px). Para que el bloque no crezca de más: la leyenda pasa de `mb-2` a `mb-0` (leyenda → riel: 18 → 20 px) y los valores se quedan en `mt-1` (riel → valores: 14 → 24 px). **Sin margen negativo** en los valores: el `<p>` se pintaría encima de la raíz y le quitaría área. Ojo: la raíz es `touch-none`, así que la franja de 44 px no desplaza la hoja de filtros al deslizar en vertical sobre ella; es lo esperado en un deslizador, y el resto de la hoja sigue desplazándose | (a) sobre la raíz, pulgar sin cambio visual |
| 4 | Índice «En este documento» (`documento-legal.tsx:81`), en `/envios/` y las páginas legales | `inline-block py-1`, 30 de alto, lista `space-y-1` | En el `<a>`: `inline-flex min-h-11 items-center py-1` (sustituye a `inline-block`). En el `<ol>`: `space-y-1` pasa a `space-y-0`. Con un renglón el enlace mide 44; con dos (títulos largos a 360 px) mide 44 + 8 = 52 y el `py-1` deja 8 px entre un título y el siguiente, para que dos subrayados seguidos no se lean como uno. **No está exento:** es una lista de enlaces, no un enlace dentro de una frase. Se elige (a) porque los enlaces van uno debajo de otro: con (b) las áreas de dos títulos seguidos se solaparían. Solo presentación: ni el texto ni el orden de los títulos cambian (el índice sale de los títulos del documento, letra por letra). El índice de `/envios/` crece ≈ 10 px por título | (a) |
| 5 | «Cerrar» de la tarjeta de provincia en hoja (`tarjeta-provincia.tsx:65`) | `h-11 w-11` encogido por flex a 42,5 | Se agrega **`shrink-0`** al botón y **`min-w-0`** al `<h3>` (`:60`), para que un nombre largo («García Rovira») parta renglón en vez de empujar el botón. El botón queda en 44 × 44 | (a) |

Controles con el mismo problema que QA no midió (no estaban en los escenarios) y se corrigen con la misma regla:

| # | Control | Hoy | Corrección | Forma |
|---|---|---|---|---|
| 6 | `<summary>` «Ver el mensaje» del respaldo de WhatsApp (`flujo-pedido.tsx:465`) | `text-sm`, 20 de alto | Igual que el n.º 2: `relative before:absolute before:content-[''] before:inset-x-0 before:-inset-y-3`. Arriba hay 16 px (`mt-4`) hasta «Copiar mensaje»: no se solapan | (b) |
| 7 | `<summary>` «Cómo consulto de qué comuna soy» (`formulario-envio.tsx:241`), solo con municipio Bucaramanga | `caption`, 18 de alto, a 4 px (`mt-1`) del select «Comuna» | Aquí no sirve (b): el área se metería 9 px en el select. En el `<summary>`: `py-3.5` (18 + 28 = 46) y el `<details>` pasa de `mt-1` a `mt-0`. El texto se separa 14 px del select en lugar de 4, que además lo despega del borde del campo. Sin cambio de `display` (n.º 2) | (a) |

Sin exentos en esta ronda. Siguen exentos, como dice M1, los enlaces **dentro de una frase**: «Escríbenos por WhatsApp» del café agotado, «Zonas, tarifas y plazos» del pie, «Ver plazos» de la ficha, el correo del vendedor y los enlaces del cuerpo de los documentos legales.

### Wireframe, hoja de filtros a 360 px (deslizador)

```
ALTITUD                                     ← overline ink-muted, mb-0
┆                                       ┆   ← raíz del Slider, 44 px (no se ve)
┆   ○━━━━━━━━━━━━━━━━━━━━━━━━━━━━○      ┆   ← riel 4 px, pulgares 20 px (sin cambio)
┆                                       ┆
1.450 m                          1.900 m   ← text-sm, mt-1
```

---

## M2. Espaciador de la barra fija «Tu pedido»

### Problema

`BarraPedido` (`cajon-carrito.tsx:27`) es `fixed bottom-0`, mide ≈ 69 px (borde 1 + `py-3` 24 + contenido 44) y aparece en celular cuando hay bolsas, fuera de `/pedido/` y con el cajón cerrado. Al llegar al final de la página tapa la línea del vendedor, el © con la leyenda de IVA y la franja de marca del pie. La línea del vendedor y el © son información obligatoria (D4, microcopy §1.4): no pueden quedar ocultos.

### Corrección

`BarraPedido` devuelve dos elementos: un **espaciador en el flujo** y la barra fija. Como `BarraPedido` se monta después del `Pie` (`proveedores.tsx:26`), el espaciador queda **debajo de la franja**, al final del `<body>`.

```
Final de la página a 360 px, desplazada hasta abajo

Sin espaciador (hoy)                 Con espaciador
┌──────────────────────────┐        ┌──────────────────────────┐
│ De Santander SAS · NIT … │        │ De Santander SAS · NIT … │
│ Domicilio: …             │        │ Domicilio: …             │
│┌────────────────────────┐│        │ WhatsApp +57 …           │
││ Tu pedido · 2 bolsas   ││        │ © 2026 De Santander SAS… │
││ $50.000   [Ver pedido] ││        │ ▬▬▬▬ franja ▬▬▬▬▬▬▬▬▬▬▬▬ │
│└────────────────────────┘│        │┌────────────────────────┐│
└──────────────────────────┘        ││ Tu pedido · 2 bolsas   ││  ← la barra cubre exactamente
  (© y franja tapados)              ││ $50.000   [Ver pedido] ││    el espaciador
                                    │└────────────────────────┘│
                                    └──────────────────────────┘
```

- Espaciador: `<div aria-hidden="true" className="h-[calc(69px+env(safe-area-inset-bottom))] bg-surface-raised md:hidden" />`. Mismo color que la barra: si en iOS el rebote del desplazamiento lo deja ver, no se nota.
- Barra: se agrega `pb-[calc(0.75rem+env(safe-area-inset-bottom))]` (la barra de inicio del iPhone no tapa «Ver pedido»). El alto del contenido queda fijo en 44 px (el texto de dos líneas, 20 + 24, y el botón `md`, 44), así que **el espaciador y la barra miden lo mismo por construcción**. Si un cambio futuro altera ese alto, se cambian los dos en el mismo commit.
- `env(safe-area-inset-bottom)` vale 0 si el `viewport` no declara `viewport-fit=cover`; así no estorba. Declararlo o no es decisión del desarrollador (`src/app/layout.tsx`).
- El espaciador vive y muere con la barra (misma condición: bolsas > 0, fuera de `/pedido/`, cajón cerrado). No hay espacio vacío cuando la barra no está.
- Por qué debajo de la franja y no dentro del pie: la franja es el borde inferior de la pieza (marca v4.1). Con el espaciador debajo, cuando la barra está visible la franja queda justo encima de la barra, que es el borde inferior visible; sin barra, la franja vuelve a ser el borde de la página.
- El aviso (toast) ya sube a `bottom-24` (96 px) en celular (`avisos.tsx:40`): queda encima de la barra. Sin cambio.

---

## M3. Navegación en celular

### Problema

`encabezado.tsx:30` oculta la navegación por debajo de `md`. En celular solo se llega al catálogo (botón de la portada) y al pedido; Mapa, Cómo pedir, Historia y Envíos quedan sin camino salvo desplazando o por el pie (Envíos).

### Opciones

| | Tira deslizable bajo el encabezado | Menú (botón «Menú» + diálogo) |
|---|---|---|
| Descubrimiento | Los enlaces se ven sin tocar nada | Ocultos detrás de un botón |
| Toques para llegar | 1 | 2 |
| Ancho en la cabecera | Ninguno: va en su propia fila | Un botón de 44 px más; a 360 px la fila ya va justa (marca ≈ 140 + «Pedido» ≈ 130) y a 280 px ya desborda |
| Accesibilidad | Una lista de enlaces; sin trampa de foco, sin Escape, sin estado | Diálogo: trampa de foco, Escape, devolver el foco, `aria-expanded`, bloqueo del desplazamiento |
| Movimiento | Ninguno | Entrada del panel (con `prefers-reduced-motion`) |
| Código | Solo marcado | Estado y diálogo (Radix ya está en el proyecto) |
| Escala | Hasta ≈ 6 enlaces cortos | Cualquiera |

### Recomendación: tira deslizable, **no fija**

Con cinco enlaces cortos, la tira los muestra todos, cuesta un toque y no agrega estado. **No es fija**: va debajo del encabezado fijo y se va con el desplazamiento. Así el encabezado fijo conserva su alto (lo usa QA-023 en `U`) y la tira no le quita pantalla a quien compra con una mano. A mitad de página, el encabezado fijo sigue dando «De Santander» (vuelve al inicio) y «Pedido».

```
360 px, arriba de la página
┌────────────────────────────────────┐
│ De Santander      ([bolsa] Pedido 2)│  ← encabezado fijo (sin cambio de alto)
│ CAFÉ DE ORIGEN                     │
├────────────────────────────────────┤
│ Mapa  Cafés  Cómo pedir  Historia  En░│  ← tira, 44 px + filete; se desliza en horizontal;
├────────────────────────────────────┤     fundido de 24 px en el borde derecho
│ (portada)                          │
```

(`[bolsa]` es el `IconoBolsa` de siempre.)

Enlaces, en el orden de las secciones del inicio (ver M4), en celular y en escritorio:

| Texto [UI] | Destino |
|---|---|
| Mapa | `/#mapa` |
| Cafés | `/#catalogo` |
| Cómo pedir | `/#pedir` |
| Historia | `/#historia` |
| **Envíos** (nuevo, también en escritorio) | `/envios/` |

«Envíos» se agrega a `ENLACES` para que celular y escritorio tengan los mismos destinos. En escritorio caben con el `gap-7` actual.

### Marcado y estilos

```
<nav aria-label="Principal" class="border-b border-line bg-surface md:hidden">
  <ul class="flex overflow-x-auto overscroll-x-contain px-2 pr-6
             [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
             [mask-image:linear-gradient(to_right,#000_calc(100%-24px),transparent)]">
    <li><Link class="inline-flex min-h-11 items-center whitespace-nowrap px-3
                     small font-semibold text-ink underline-offset-8 hover:underline
                     focus-visible:-outline-offset-2">Mapa</Link></li>
    …
  </ul>
</nav>
```

- Va **fuera** del `<header>` fijo, como hermano inmediato, dentro de `Encabezado`. La navegación de escritorio (`encabezado.tsx:30`) se queda dentro del `<header>`. Las dos se llaman «Principal»; nunca coinciden en pantalla (una es `md:hidden`, la otra `hidden md:flex`, y `display:none` las saca del árbol de accesibilidad), así que el lector de pantalla siempre encuentra una sola.
- Tipo: `small` (Montserrat 14/22) en 600, `text-ink` sobre `surface` (≈ 15,5:1). Cada enlace mide 44 px de alto.
- Cuentas a 360 px (320 útiles): «Mapa» ≈ 38, «Cafés» ≈ 40, «Cómo pedir» ≈ 80, «Historia» ≈ 58, «Envíos» ≈ 50 = 266 + 5 × 24 de relleno = 386. Se ven completos los cuatro primeros y «Envíos» asoma bajo el fundido: eso indica que hay más. A 390 px o más caben casi todos.
- **Fundido** del borde derecho con `mask-image` (no es color nuevo: desvanece el contenido sobre el fondo `surface`). El `pr-6` deja que el último enlace salga entero del fundido al llegar al final.
- Barra de desplazamiento oculta: el fundido y el enlace cortado ya dicen que la tira se desliza.
- **Foco:** al tabular, el navegador desplaza la tira para mostrar el enlace enfocado. El contorno de foco va hacia dentro (`-outline-offset-2`) para que `overflow-x-auto` no lo recorte. El enlace «Ir al contenido» (`proveedores.tsx:20`) salta la tira.
- **Enlace actual:** en `/envios/`, «Envíos» lleva `aria-current="page"` y subrayado de 2 px permanente (`aria-[current=page]:underline aria-[current=page]:decoration-2`). Los enlaces con `#` del inicio no llevan `aria-current`. (Requiere `usePathname`: lo hace el desarrollador.)
- **En `/pedido/` la tira no aparece** (misma condición que ya usa `BarraPedido`): en el pedido el foco es terminar, y así el Envío y el Resumen de A1 no cambian de posición.
- **Movimiento:** ninguno. El salto a `/#mapa` y demás respeta `prefers-reduced-motion` porque `globals.css:18` ya anula `scroll-behavior`.
- Sin Escape, sin `aria-expanded`, sin trampa de foco: no hay nada que abrir ni cerrar.

Si en el futuro hay más de seis destinos, se cambia a menú en un diálogo de Radix (trampa de foco, Escape, foco devuelto al botón «Menú», `aria-expanded`, entrada de 150 ms en `opacity` con `motion-reduce:transition-none`). Hoy no hace falta.

---

## M4. Mapa e inicio

Aprobado por el dueño: (1) tocar una provincia con el dedo **sigue abriendo la tarjeta**; (2) se corrige el texto; (3) el mapa sube antes del catálogo; (4) «Elige por origen» pasa a «Elige por provincia».

### Texto del mapa (`seccion-mapa.tsx:42`)

Hoy: «Toca una provincia para filtrar el catálogo; vuelve a tocarla para quitarla. Los puntos marcan el municipio de cada café.» Con el dedo, tocar no filtra (abre la tarjeta) y tocar otra vez no quita nada (vuelve a abrirla).

**Nuevo [UI]:**

> Elige una provincia para ver sus cafés y filtrar el catálogo. Los puntos marcan el municipio de cada café.

- «Elige» vale para dedo, ratón y teclado: con el dedo se abre la tarjeta con el número de cafés y «Ver cafés de…»; con ratón o teclado se filtra al instante. Las dos cosas son «ver sus cafés y filtrar».
- No promete cómo se quita el filtro: con el dedo es «Quitar del filtro» en la tarjeta, y con cualquier puntero es «Ver todo Santander», que aparece en el mapa al filtrar. Los dos botones ya se explican solos.
- Una sola versión del texto, no dos según el tipo de puntero: el código decide por `pointerType` en cada toque (`mapa-provincias.tsx:234`), y una consulta CSS (`hover`, `pointer`) se equivocaría en pantallas táctiles con ratón.
- 19 palabras (regla de ≤ 25). Terminología: «provincia», nunca «región» ni «origen».

### Orden del inicio (`src/app/page.tsx`)

| # | Hoy | Nuevo | Fondo |
|---|---|---|---|
| 1 | Portada | Portada | monte (oscuro) + franja |
| 2 | Catálogo | **Mapa** | `surface-sunken` + curvas de nivel claras |
| 3 | Mapa | **Catálogo** | `surface` |
| 4 | Cómo pedir | Cómo pedir | `surface`, **con filete superior** `border-t border-line` |
| 5 | Historia | Historia | monte (oscuro) |

- Catálogo y Cómo pedir quedan juntos y con el mismo fondo `surface`. Para que no se lean como una sola sección, Cómo pedir lleva `border-t border-line` en su `<section>` (`secciones-inicio.tsx:75`). No se cambia su fondo: tiene dentro una caja `surface-sunken` (`:99`) que perdería contraste.
- La alternancia queda oscuro → arena hundida con trama → pergamino → pergamino con filete → oscuro: una sola trama por bloque (marca v4.1).
- El botón de la portada («Ver cafés», `#catalogo`) sigue yendo al catálogo y salta el mapa: quien ya sabe qué quiere no pasa por él.
- El orden de la tira y de la navegación de escritorio (M3) sigue este orden.

### Enlace para saltar el mapa [UI]

En celular, el mapa y su texto ocupan ≈ 700 px antes del catálogo. En la columna de texto del mapa, después de la bajada y antes de la nota de fuente:

```
SANTANDER POR PROVINCIAS
Explora por provincia
Elige una provincia para ver sus cafés y filtrar el catálogo.
Los puntos marcan el municipio de cada café.
Ir a los cafés                     ← BotonEnlace variante="enlace" tamano="sm", href="#catalogo"
Fuente: DANE, MGN 2018 …           ← caption ink-muted (sin cambio)
┌──────────── mapa ────────────┐
```

- En escritorio está a la izquierda del mapa (columna de texto), así que también sirve a quien filtra con el ratón: el catálogo ahora está debajo y el enlace lo lleva a ver el resultado.
- No necesita lógica: es un ancla fija. (El contador del catálogo ya es `aria-live`, así que el lector de pantalla oye el resultado del filtro sin moverse.)

### Titulares de las dos secciones

| Sección | Antetítulo | Titular |
|---|---|---|
| Mapa | Santander por provincias (sin cambio) | Explora por *provincia* (sin cambio) |
| Catálogo | Nuestros cafés (ver [CONSULTAR-LEGAL] 3) | Elige por *provincia* (aprobado) |

**[CONSULTAR] 1, al dueño:** con el nuevo orden, los dos titulares quedan seguidos y con el mismo remate: «Explora por *provincia*» y, justo debajo, «Elige por *provincia*». Propuesta de diseño: cambiar solo el del mapa a **«Santander, *provincia a provincia*»** (Fraunces 700 con remate en itálica 400, mismo tamaño). El del catálogo queda como lo aprobó el dueño. Si el dueño prefiere conservar los dos, se implementa sin cambio: no es un error de marca, solo una repetición.

---

## M8. Tarifas de `/envios/` en celular

### Problema

La tabla de tarifas (`src/app/envios/page.tsx:68`) tiene `min-w-[44rem]` (704 px) dentro de una caja con desplazamiento horizontal. A 360 px el cliente tiene que deslizar para ver los precios de 2 y 5 kg, y la columna «Cubre» de las zonas 3, 4 y 5 (listas largas de municipios y departamentos) alarga cada fila.

`/envios/` publica el documento legal D3. **La tabla no es texto de D3**: es contenido generado de los CSV que la página inserta antes del numeral 4 (`antesDeNumeral`), y D3 §2 remite a ella («La lista de municipios de cada zona está en esta página»). Esta propuesta **cambia solo la presentación**: mismos datos, mismo orden de zonas, mismo orden de los datos dentro de cada zona (Zona → Cubre → Hasta 1 kg → Hasta 2 kg → Hasta 5 kg), mismos textos, misma posición en el documento. El título del bloque, el párrafo del peso, la leyenda de IVA y la recomendación de pedido mínimo no cambian.

### Por debajo de `lg` (360 a 1.023 px): una tarjeta por zona

`lg` y no `md`: el artículo mide `max-w-3xl` y la caja tiene `p-5`; a 768 px quedan ≈ 664 px útiles, menos que los 704 de la tabla.

```
360 px
┌ Tarifas por zona y municipios de cada zona ─────────┐   ← h3 sin cambio
│ El peso incluye las bolsas más 80 g de empaque, …   │   ← sin cambio
│ ┌───────────────────────────────────────────────┐   │
│ │ Zona 1                                        │   │  ← h4 body 700 ink-title
│ │ Bucaramanga                                   │   │  ← cubre (zonas 1 y 2: completo, sin desplegable)
│ │ Mensajero                                     │   │  ← small ink-muted
│ │ Envío gratis en siete comunas: condiciones    │   │  ← nota de la promoción, solo si aplica (enlace)
│ │ ─────────────────────────────────────────     │   │
│ │ Hasta 1 kg                          $8.000    │   │  ← dl en dos columnas
│ │ Hasta 2 kg                          $9.000    │   │
│ │ Hasta 5 kg                         $12.000    │   │
│ └───────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────────┐   │
│ │ Zona 3                                        │   │
│ │ ▸ Qué cubre la zona 3                         │   │  ← details cerrado, summary de 44 px
│ │   (abierto: «{nombre}: Floridablanca, Girón…»)│   │
│ │ Transportadora                                │   │
│ │ ─────────────────────────────────────────     │   │
│ │ Hasta 1 kg                         $…         │   │
│ │ …                                             │   │
│ └───────────────────────────────────────────────┘   │
│ ┌ Zona 5 ───────────────────────────────────────┐   │
│ │ ▸ Qué cubre la zona 5                         │   │
│ │ Transportadora                                │   │
│ │ ─────────────────────────────────────────     │   │
│ │ Por cotizar por WhatsApp antes de que pagues  │   │  ← en lugar de los tres precios
│ └───────────────────────────────────────────────┘   │
│ Precios con IVA … (leyenda, sin cambio)             │
│ Sugerimos pedir al menos … (sin cambio)             │
└─────────────────────────────────────────────────────┘
```

(Las cifras del dibujo son de relleno para el esquema; los valores salen de `data/tarifas_envio.csv`.)

Marcado:

```
<ul aria-label="Tarifas de envío por zona" class="mt-4 space-y-3 lg:hidden" data-testid="tarjetas-envios">
  <li class="rounded-lg border border-line bg-surface p-4" data-testid="tarjeta-zona-{clave}">
    <h4 class="body font-bold text-ink-title">Zona {n}</h4>
    <!-- Cubre -->
    zonas 1 y 2:  <p class="small mt-1 text-ink">{cubre(t)}</p>
    zonas 3, 4, 5: <details class="mt-1">
                     <summary class="flex min-h-11 cursor-pointer items-center small font-bold text-ink-title
                                     underline underline-offset-4">Qué cubre la zona {n}</summary>
                     <p class="small pb-2 text-ink">{cubre(t)}</p>
                   </details>
    <p class="small text-ink-muted">{medio}</p>
    {nota de la promoción, mismo enlace y data-testid de la tabla}
    <!-- Precios -->
    <dl class="small mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t border-line pt-3">
      <dt class="text-ink-muted">Hasta 1 kg</dt><dd class="text-right font-semibold tabular-nums text-ink">$…</dd>
      …
    </dl>
    o, sin escalones: <p class="small mt-3 border-t border-line pt-3 font-semibold text-ink">Por cotizar por WhatsApp antes de que pagues</p>
  </li>
</ul>
```

- `cubre(t)` es la misma función de hoy: **el texto del desplegable es el mismo, letra por letra**, que el de la celda «Cubre». En las zonas 3 y 4 empieza por el nombre de la zona, así que no hace falta repetirlo fuera.
- Desplegable solo para las zonas cuya celda «Cubre» es una lista (3, 4 y 5). En las zonas 1 y 2 «Cubre» es el nombre de la zona y se muestra entero.
- Rótulo del desplegable [UI]: «Qué cubre la zona {n}». No dice «municipios» porque la zona 4 y la 5 incluyen departamentos y excepciones.
- Contraste: `ink-title` y `ink` sobre `surface` ≥ 11:1; `ink-muted` ≈ 6,6:1; filete `line` decorativo.
- `details`/`summary` nativos: teclado (Enter y Espacio), estado anunciado y sin JavaScript. El triángulo nativo se conserva (no es un ícono nuevo). Sin animación al abrir.
- Búsqueda en la página: Chrome y Edge abren un `details` cerrado cuando la búsqueda (Ctrl+F) encuentra texto dentro; Safari no. Por eso el desplegable es una pregunta para legal (abajo).

### Desde `lg` (≥ 1.024 px): la tabla de hoy

`<div class="hidden lg:block …">` con la tabla sin cambios, salvo `min-w-[44rem]`, que se mantiene (desde `lg` cabe sin desplazar). La caja con `overflow-x-auto`, `role="region"` y `tabIndex={0}` se conserva para el zoom del 200 %.

Las dos versiones están en el HTML; solo una se ve y solo una está en el árbol de accesibilidad (`display:none`). Pruebas: la tabla conserva `tabla-envios` y `tarifa-{clave}`; las tarjetas usan `tarjetas-envios` y `tarjeta-zona-{clave}`.

**[CONSULTAR-LEGAL] 1:** ¿se puede mostrar en celular la lista de municipios y departamentos de las zonas 3, 4 y 5 dentro de un desplegable cerrado («Qué cubre la zona {n}»), con el mismo texto, en el mismo orden y en el mismo lugar de D3? D3 §2 dice que la lista «está en esta página»: sigue en la página y en el HTML, pero no a la vista hasta tocar. Alternativa si legal no lo acepta: la misma tarjeta con «Cubre» siempre abierto (`<p class="small mt-1 text-ink">`). Se quita el desplazamiento horizontal igual, pero la tarjeta de la zona 5 se alarga.

---

## Pendiente de A1: leyenda «Promociones (opcional)»

Hoy (`flujo-pedido.tsx:369`): `caption font-semibold text-ink`, provisional.

**Cambia a `overline text-ink-muted`** (Montserrat 800, 12/16, mayúsculas, tracking 0,2 em), sin cambiar el texto [UI] «Promociones (opcional)» ni su `data-testid`:

- Es el estilo de leyenda de grupo que ya usa el sitio: «Presentación» y «Tamaño» en la ficha (`bloque-compra.tsx:52`, `:65`), «Provincia» en filtros (`controles-filtro.tsx:30`) y «Tu pedido» en el bloque compacto de A1. Un grupo de casillas opcionales es lo mismo: un rótulo de grupo, no un titular.
- `ink-muted` y no terracota: la marca reserva `chicamocha-600` para origen y tueste, y una leyenda de formulario no es ninguna de las dos. `ink-muted` sobre `surface` ≈ 6,6:1.
- Alto: 16 px en vez de 18. Está **encima** del tramo de QA-023 (B3), así que no cambia `M1`.

```
PROMOCIONES (OPCIONAL)                  ← overline ink-muted
[ ] Quiero recibir novedades … por WhatsApp …
[ ] … por correo … (solo con correo)
───────────────────────────────────────  ← filete (sin cambio)
[ ] Leí y acepto los Términos …
```

---

## Ficha con tamaños agotados (observación de QA sin ID)

### Problema (`bloque-compra.tsx`)

- `Pildora` pone `opacity-50` a todo el `<label>` de un tamaño agotado (`:16`): el texto «Agotado» de la píldora queda a ≈ 2,5:1, y es información, no decoración.
- Con **todos** los tamaños agotados, `primera` cae en `presentaciones[0]` (`:33`), así que esa píldora sale **marcada** (relleno `monte-900` al 50 %), el selector de cantidad sigue activo y se ve un precio total (`:87`) de algo que no se puede pedir.

### Píldora de tamaño agotado (agotado parcial o total)

| Parte | Hoy | Nuevo |
|---|---|---|
| `<label>` | `cursor-not-allowed opacity-50` | `cursor-not-allowed`, **sin opacidad** |
| `<span>` | estilo normal al 50 % | `peer-disabled:border-dashed peer-disabled:border-line-strong peer-disabled:bg-transparent peer-disabled:text-ink-muted` |
| `<small>` «Agotado» | `opacity-80` | `peer-disabled:[&>small]:opacity-100` en el `<span>` (o quitar `opacity-80` del `<small>` y darle `text-ink-muted` solo cuando está agotado) |
| Marcado | puede salir marcada | **nunca** marcada: `marcado={gramos === p.gramos && p.disponible}` (lógica, desarrollador) |

Contraste: `ink-muted` sobre `surface-raised` ≈ 7:1; borde punteado `line-strong` ≈ 4,2:1 (≥ 3:1). El borde punteado y la palabra «Agotado» dicen el estado sin depender del color ni de la opacidad (WCAG 1.4.1). Es la corrección que M9 dejó anotada como «observación baja».

### Café totalmente agotado

```
360 px
┌ Bloque de compra ─────────────────────┐
│ PRESENTACIÓN                          │  ← overline ink-muted
│ Grano · Molido                        │  ← ds-tags (nivel 1: dato, sin relleno, ink-muted)
│ Grano o molido, tal como lo empaca…   │  ← ayuda de molienda, sin cambio [LEGAL: LEG-083/155]
│ TAMAÑO                                │
│ ┆250 g  ┆ ┆500 g  ┆                    │  ← píldoras punteadas, deshabilitadas, ninguna marcada
│ ┆Agotado┆ ┆Agotado┆                    │
│                                       │
│ [            Agotado               ]  │  ← Boton lg deshabilitado (M9, sin cambio)
│ Este café está agotado por ahora.     │  ← small ink, role ninguno (no es error)
│ Escríbenos por WhatsApp y te avisamos │
│ cuando vuelva.                        │  ← «Escríbenos por WhatsApp»: enlace wa.me
└───────────────────────────────────────┘
```

- **Presentación:** con el café agotado no hay nada que elegir. Las píldoras de Grano/Molido pasan a texto (`<p class="ds-tags">` con un `<span class="ds-tag">` por presentación): se sigue viendo en qué presentaciones existe, sin controles muertos. La ayuda de molienda se queda.
- **Tamaño:** las píldoras se quedan, deshabilitadas y sin marcar, con el estilo de arriba: dicen qué tamaños existen y que están agotados.
- **Se ocultan** el selector de cantidad, el precio total con su línea «1 × 250 g · grano», la nota «Hasta 20 bolsas por tamaño y presentación…» y «Entrega estimada y plazo máximo…»: describen una compra que no se puede hacer. Ver [CONSULTAR-LEGAL] 2 sobre la leyenda de IVA.
- **Botón:** el `Boton` deshabilitado «Agotado» de M9, sin cambio.
- **Texto nuevo [UI]**, `small mt-3 text-ink`: «Este café está agotado por ahora. [Escríbenos por WhatsApp](https://wa.me/{whatsapp}) y te avisamos cuando vuelva.» Sigue el texto que ya usa la portada sin café («Por ahora no tenemos café disponible. Escríbenos por WhatsApp y te avisamos cuando haya.», `secciones-inicio.tsx:32`). El enlace es en línea (subrayado, `font-semibold`), no un botón: el único botón del bloque sigue siendo el principal. El número sale de `config.csv`.
- El origen, las notas, la ficha técnica y la historia de la ficha no cambian: el café se sigue presentando.
- Agotado **parcial** (algún tamaño disponible): solo cambia el estilo de las píldoras agotadas; la primera disponible sale marcada (como hoy) y el resto del bloque no cambia.

**[CONSULTAR-LEGAL] 2:** con el café totalmente agotado, ¿la ficha puede no mostrar precio ni la leyenda de IVA (D5 §6.2 la pone «bajo el precio»)? Si legal pide mostrar el precio de referencia, alternativa: cada píldora agotada muestra su precio (sin tachar) en `ink-muted` con «Agotado» debajo, y la leyenda de IVA se queda; el total y la cantidad se ocultan igual.

---

## QA-029. Utilidades de peso y tamaño que no se pintan

Decisión del 2026-11-19 sobre `docs/qa/2026-11-19-cierre-baja.md` (QA-029, Baja). Líneas verificadas en `a52a81b`.

### Causa y alcance

`globals.css` importa `marca.css`, `componentes.css` y `mapa.css` **fuera de capa**. Una regla fuera de capa gana a cualquier regla de `@layer utilities`, sin importar la especificidad. Por eso, cuando un elemento lleva **a la vez** una clase de marca (`.body`, `.small`, `.caption`, `.ds-tag`…) y una utilidad que pide otra cosa, se pinta la clase de marca. Las utilidades sobre elementos **sin** clase de marca funcionan bien. Por ejemplo, la navegación de escritorio (`text-sm font-semibold`) sí sale en 600. El código ya rodea el problema con `!` en varios sitios (`!bg-monte-900` en los chips, `!px-4` en las píldoras, `font-bold!` en el índice legal).

Hay utilidades muertas que no son de tipo y tienen la misma causa: `hover:border-ink` de los chips (el borde de `.ds-tag--outline` no cambia al pasar el puntero), `gap-1.5` de los filtros activos (se pinta el `gap` de 4 px de `.ds-tag`) e `items-start` de las píldoras de la ficha (se pinta el `align-items:center` de `.ds-tag`). Entran en esta decisión.

### Criterio

- **Controles de selección** (chips de filtro, píldoras de presentación y tamaño): Montserrat **14/20 en 600**, igual que las demás etiquetas de control del mismo panel, que ya se pintan así: «Solo en stock» (`controles-filtro.tsx:92`), «Ordenar» (`explorador.tsx:97`) y la navegación de escritorio. Hoy salen en 12/16 y 500, que es el estilo del **dato técnico** (nivel 1 de etiquetas de la marca: «Montserrat 500 de 12 px gris, sin relleno»). Ese estilo es para leer un dato, no para tocarlo con el pulgar a 360 px. El dato dentro del control (el conteo del chip, el precio y «Agotado» de la píldora) se queda en 12 y 500. Así hay jerarquía: hoy «250 g» y «$30.000» tienen el mismo tamaño y el mismo peso.
- **`.ds-tag--outline` sin interacción** (perfiles de taza de la ficha, presentaciones del café agotado) se queda en 12 y 500. La clase de marca no cambia.
- **Rótulos que abren o titulan un bloque** (título de la tabla, «Zona n», «Qué cubre…»): **700**, como ya pedían las especificaciones (M8: «h4 body 700»; el `<summary>` de la ficha, «¿Qué significa cada dato?», ya se pinta en 700). En 400, un título se lee como si fuera un párrafo.
- **Dato destacado dentro de una tarjeta o un panel** («Por cotizar…», primera línea del respaldo): **600**, el mismo peso que la celda equivalente de la tabla y que los precios.
- **Notas y cuerpo**: valen las clases de marca (`caption` 12/18 en 500, `body` 16/26 en 400). Las utilidades que las contradicen se quitan.

### Decisión por elemento

**Grupo A: gana la utilidad (sí hay cambio visual).** Se conserva la clase de marca, que aporta la familia, el tamaño y el interlineado. A la utilidad se le agrega `!` **al final** (forma de Tailwind v4, la misma de `documento-legal.tsx:77`).

| # | Elemento | Ubicación | Hoy | Correcto | Cambio de marcado |
|---|---|---|---|---|---|
| A1 | Título «Tarifas por zona y municipios de cada zona» (`h3`) | `src/app/envios/page.tsx:64` | 16/26 · 400 | 16/26 · **700** | `font-bold` → `font-bold!` |
| A2 | «Zona n» de cada tarjeta (`h4`, bajo `lg`) | `envios/page.tsx:72` | 400 | **700** | `font-bold` → `font-bold!` |
| A3 | `<summary>` «Qué cubre la zona n» | `envios/page.tsx:77` | 14/22 · 500 | 14/22 · **700** | `font-bold` → `font-bold!` |
| A4 | «Por cotizar por WhatsApp antes de que pagues» de la tarjeta | `envios/page.tsx:99` | 500 | **600** (como la celda de la tabla, `:134`) | `font-semibold` → `font-semibold!` |
| A5 | Enlaces de la tira de navegación en celular (M3) | `src/ui/componentes/layout/encabezado.tsx:90` | 14/22 · 500 | 14/22 · **600** (M3: «`small` en 600»; igual que en escritorio) | `font-semibold` → `font-semibold!` |
| A6 | Primera línea del respaldo «¿No se abrió WhatsApp?…» (`role="status"`) | `src/ui/componentes/checkout/flujo-pedido.tsx:460` | 500 | **600** | `font-semibold` → `font-semibold!` |
| A7 | Chips de filtro (`GrupoChips`) | `src/ui/componentes/catalogo/controles-filtro.tsx:42` | 12/16 · 500 | **14/20 · 600** | `text-sm font-semibold` → `text-sm! font-semibold!`. En la línea 43, `hover:border-ink` → `enabled:hover:border-ink!` (con `enabled:`, el chip deshabilitado no reacciona) |
| A8 | Chips de opción única (`GrupoOpcionUnica`, el SCA mínimo; hoy oculto) | `controles-filtro.tsx:79` | 12/16 · 500 | **14/20 · 600** | `text-sm font-semibold` → `text-sm! font-semibold!` |
| A9 | Filtros activos («Quitar filtro …») | `src/ui/componentes/catalogo/explorador.tsx:123` | 12/16 · 500 | **14/20 · 600** | `text-sm font-semibold` → `text-sm! font-semibold!`; `hover:border-ink` → `hover:border-ink!`; se **quita** `gap-1.5` (se queda el `gap` de 4 px que se pinta hoy entre el texto y la ×) |
| A10 | Píldoras de presentación y tamaño de la ficha (`Pildora`) | `src/ui/componentes/ficha/bloque-compra.tsx:20` | 12/16 · 500, contenido centrado | **14/20 · 600**, contenido centrado en los dos ejes | `text-sm font-semibold` → `text-sm! font-semibold!`; se **quita** `items-start` (se queda el centrado horizontal de hoy, el que muestran las capturas) y se **agrega** `justify-center`, para que «Grano» y «Molido» (una sola línea en 44 px de alto) queden centrados en vertical. Hoy quedan 5 px más arriba. Los `<small>` del precio y de «Agotado» (`:88-89`, `text-xs font-medium`) no cambian |

Efecto en el tamaño de los controles (A7 a A10): el alto visible de los chips se queda en 36 px (`min-h-9`; el contenido mide 20 + 8 + 2 = 30). El área de 44 px de QA-025 no cambia. Los chips se ensanchan ≈ 17 %, y a 360 px la lista de provincias puede ocupar una fila más (≈ 44 px). Se acepta. Las píldoras de la ficha se quedan en 44 px de alto; las de tamaño ya medían 50 (dos líneas) y pasan a 54.

**Grupo B: gana la clase de marca (no hay cambio visual).** Se quita la utilidad.

| # | Elemento | Ubicación | Se pinta (correcto) | Cambio de marcado |
|---|---|---|---|---|
| B1 | «(IVA incluido)» bajo el total del cajón y del pedido | `src/ui/componentes/carrito/totales-pedido.tsx:82` | `caption` 12/18 · 500 (nota) | quitar `font-normal` |
| B2 | Nota de precio de la línea del pedido | `src/ui/componentes/carrito/linea-pedido.tsx:109` | `caption` 12/18 · 500 | quitar `font-medium` (repite lo que ya pinta la clase; es limpieza) |
| B3 | Descripción de la provincia en la tarjeta del mapa | `src/ui/componentes/mapa/tarjeta-provincia.tsx:70` | `body` 16/26 · 400 (cuerpo de marca, 16–18 px en web) | quitar `text-sm` |
| B4 | Explicación bajo el sello SCA de la ficha (no se ve hoy: no hay puntajes verificados) | `src/ui/componentes/ficha/ficha-cafe.tsx:92` | — | `body … text-sm` → `small` (14/22 · 500, nota bajo el sello). No hay captura que cambie |

**Sin cambio:** `documento-legal.tsx:77` (`small font-bold!`, ya se pinta en 700), los títulos con `!text-[…]` (`ficha-cafe.tsx:55`, `pagina-provincia.tsx:34`), `totales-pedido.tsx:97` (`!font-bold`) y todas las utilidades de peso sobre elementos sin clase de marca (celdas de la tabla de `/envios/`, ficha técnica, glosario, totales, formulario).

### Estrategia técnica

**Ahora (QA-029): corregir el marcado elemento por elemento, como en las tablas.** No se tocan las capas de `globals.css`.

- Riesgo bajo y acotado. Cambian solo los 14 puntos de las tablas, y cada cambio visual es uno decidido aquí. Sigue la convención de `!` que el código ya usa para ganarle a `.ds-tag--outline`.
- Costo: el `!` sigue siendo necesario cada vez que se combine una clase de marca con una utilidad que la contradiga. Regla para el desarrollador, desde hoy: **o la clase de marca, o la utilidad, nunca las dos con valores distintos; si hacen falta las dos, la utilidad lleva `!`**.

**Después, en una tarea aparte (deuda técnica, no en esta rama): mover los estilos de marca a `@layer components`** con `@import "../styles/marca.css" layer(components);`, y lo mismo para `componentes.css` y `mapa.css`. Es la corrección de fondo. Con ella las utilidades ganan siempre y se pueden retirar casi todos los `!`. No va ahora porque cambia **de una vez** todo lo que hoy está muerto, y eso no está inventariado. Riesgos conocidos:

1. **Foco (el riesgo ya visto).** Si solo se mueven los `@import`, el `:focus-visible` de `globals.css:16` (fuera de capa) pasa a ganarle a `.ds-casilla[aria-invalid="true"]:focus-visible`. La casilla con error y foco pierde el `outline-offset: 4px` y la franja entre el anillo grana y el contorno de foco (QA-021). Si además se mueve `:focus-visible` a `@layer base`, se recupera QA-021, pero entonces `outline-none` gana en los cuatro títulos que reciben el foco por código (`explorador.tsx:94`, `flujo-pedido.tsx:248`, `:277`, `:333`) y el contorno deja de verse en ellos. Esa migración necesita decidir eso antes.
2. **Utilidades muertas que reviven**, como las de este inventario. Hay que buscar todas las combinaciones clase de marca + utilidad (`display`, `align`, `gap`, `padding`, `color`, `border`, `text-*`) y decidirlas antes de mover nada.
3. **Orden de los tokens:** `:root` y `[data-theme]` de `marca.css` quedarían en `components`, después de `@layer theme`. Hoy no se pisan nombres, pero hay que comprobarlo.
4. Todas las capturas aprobadas de `/`, la ficha, `/envios/` y `/pedido/` se vuelven a comparar.

Las reglas propias de `globals.css` (`.overline{text-decoration:none}`, `.ds-btn{min-height}`, `prefers-reduced-motion`) se quedan fuera de capa en cualquier caso.

### Entrega para desarrollador-fullstack (QA-029)

1. Grupo A, filas A1 a A10, tal como están en la tabla.
2. Grupo B, filas B1 a B4.
3. Un solo commit `fix(estilos): pesos y tamaños de control según marca (QA-029)`. No se toca CSS de `src/styles/` ni `globals.css`.
4. Actualizar el comentario de `bloque-compra.tsx:17`: ahora también `text-sm!` y `font-semibold!` usan `!` para ganarle a `.ds-tag--outline`.

### Entrega para qa-pruebas (QA-029)

- **La prueba de cierre sigue valiendo, con un ajuste.** La expresión de `e2e/qa-2026-11-19-cierre-baja.spec.ts:385` exige un espacio o el final de la cadena después de la utilidad, así que `font-bold!` deja de coincidir. Con la regex tal como está, los elementos corregidos con `!` **saldrían de la prueba** y esta pasaría sin comprobarlos. Hay que aceptar el `!` delante o detrás: `(?:^|\s)!?(font-(?:normal|medium|semibold|bold|extrabold))!?(?:\s|$)`. Con ese cambio, a 360 y 1.280 px, en `/`, la ficha y `/envios/`, la lista debe quedar vacía. Los elementos del grupo B ya no llevan la utilidad, así que salen de la prueba con razón.
- **Tamaño:** agregar a la misma prueba, o a una nueva, que todo elemento con `text-sm` o `text-sm!` se pinte a 14 px. Hoy los chips con `text-sm` se pintan a 12, y la prueba solo mira el peso.
- Chips (inicio, hoja de filtros, filtros activos) y píldoras de la ficha: 14 px y 600 en el rótulo. Conteo, precio y «Agotado» en 12 px y 500. Perfiles de taza de la ficha sin cambio: 12 px y 500.
- QA-025: el chip sigue midiendo 36 px de alto visible y 44 px de área táctil.
- Píldoras de la ficha: con «Grano» o «Molido» (una línea), la diferencia entre el espacio de arriba y el de abajo es de 1 px o menos. Con dos líneas, el contenido sigue centrado en horizontal. Píldora agotada sin cambio (borde punteado, `ink-muted`).
- A 1.280 px, con el puntero sobre un chip no marcado, el borde cambia a `ink`. Sobre uno deshabilitado no cambia.
- `/envios/` a 360 y 768 px: título y «Zona n» en 700, `<summary>` en 700, «Por cotizar» en 600, sin desplazamiento horizontal.
- Tira de navegación a 360 px: enlaces en 600 y de 44 px de alto. «Envíos» sigue asomando bajo el fundido.
- Volver a aprobar estas capturas: `/envios/` (tarjetas, 360 y 768), ficha (bloque de compra, 360 y 1.280), inicio (chips y tira, 360; filtros, 1.280) y resumen con respaldo. El resto no debe cambiar.
- Volver a correr la guardia de QA-018: cambian cadenas de clases en componentes cliente del inicio (unos pocos bytes) y hoy quedan 385 B de margen.
- axe a 360 y 1.280 px sin violaciones serias ni críticas en `/`, la ficha y `/envios/`.

---

## QA-032 revisión visual

Revisión del 2026-11-19 de `5d2b5a6` (rótulos de provincia sin solaparse) con las capturas `docs/qa/capturas/2026-11-19-qa-032-{head,head-sin-js,main}-{300,320,360,390,412,460,1280}.png` y el reporte `docs/qa/2026-11-19-verificacion-qa-031-032.md`. Solo lectura: no se tocó código ni capturas.

**Dictamen: aprobado con ajustes.** La corrección cumple lo que pedía QA-032. Los ajustes 1 y 2 no reabren QA-032 (no son regresiones de `5d2b5a6`). Van como defectos o tareas aparte.

### Lo que queda bien

| Ancho | Resultado |
|---|---|
| 300 | «VÉLEZ / Próximamente» queda dentro del verde de Vélez, sin tocar «COMUNERA». «Próximamente» empieza a ≈ 8 px del borde y queda ≈ 17 px sobre «6°00'N». El margen es justo pero se lee bien. Se acepta. |
| 320 | En `main`, «VÉLEZ» y «COMUNERA» se pisaban. Ahora Vélez se corre a la izquierda y queda en pleno verde, y los dos rótulos se leen cada uno en su provincia. Guanentá aparece (en `main` no salía). |
| 360 | En `main`, «Próximamente» de Vélez y de Comunera formaban una sola cadena ilegible. Ahora Vélez sube 20 px y queda en la parte alta del verde, con su provincia. Comunera no cambia. |
| 390 / 412 | Iguales a `main` en lo que importa. Guanentá queda dentro del amarillo, bajo el pin de Casa Martínez. |
| 460 | Guanentá baja 40 px y queda más adentro del amarillo, lejos de la píldora del pin. Mejora. |
| 1.280 | Sin cambios. |

- **Nada cortado** en ningún ancho. La versión sin JS coincide con la interactiva en las capturas, salvo QA-034 (366 px), que sigue abierto.
- **Jerarquía con los pines:** el pin (punto grana y píldora pergamino con el nombre en caja baja) sigue por encima de los rótulos de provincia (versalitas con tracking, sin fondo). «Próximamente» se queda en segundo plano. Ningún rótulo se monta sobre una píldora.
- **Marca:** no cambian colores, tipografías ni pesos. El contraste no cambia (el texto sigue en tinta sobre los tintes de provincia).

### Ajustes para el desarrollador

| # | Severidad | Rótulo y anchos | Problema | Regla o posición |
|---|---|---|---|---|
| 1 | Media (ya estaba en `main`; no es de `5d2b5a6`) | **Guanentá** de 355 a 367 px (incluye **360**, el ancho de referencia) y por debajo de 304. **Soto Norte** a 360 (y en los demás anchos donde se oculte) | Las únicas dos provincias **con cafés** (sin «Próximamente») quedan sin nombre, mientras que las cinco «Próximamente» sí lo tienen. Se invierte la jerarquía: la provincia es el hilo conductor (PRODUCT.md, principio 5) y el origen se ve antes que el precio (principio 1). | **Prioridad de colocación:** en `colocarRotulos` (`src/domain/mapa/etiquetas.ts`), primero se colocan las provincias con cafés (`vacia = false`) y después las vacías, cada grupo en su orden actual. El arreglo de salida conserva el índice original, para no cambiar el orden del DOM ni las claves de `capaEstatica`. Si con esto se oculta una provincia «Próximamente» en algún ancho, se acepta. Criterio: de 320 a 1.500 px ninguna provincia con cafés queda oculta (sin provincia elegida), y siguen valiendo «0 solapes y 0 cortes». |
| 2 | Baja | **Guanentá** de 304 a 316 px | El nombre toca 1 px el punto del pin de Casa Martínez. Se lee, pero el punto marca el origen y no debe rozarlo ningún texto. | **Reserva del punto del pin:** pasar la caja del punto de ± 9 a **± 11 px** en `colocarPines`. Con el margen de 3 px de `choca`, el nombre del pin (que empieza en `x ± 14`) no cambia de lugar. Criterio: entre el rótulo de cualquier provincia y el punto de cualquier pin quedan al menos 2 px. |
| 3 | Baja (QA-034, abierto) | **Vélez** a 366 px | Sin JS, el rótulo queda 80 px más arriba y salta cuando llega la interacción. El salto de un rótulo se nota y rompe la estabilidad del mapa. | Respaldo la corrección que propone QA: que `tramosCapa` y la isla usen la misma altura redondeada. No hace falta otra regla de diseño. |

Observaciones sin ajuste:
- Yariguíes («Próximamente») se oculta a 300 y 320.
- Metropolitana, a 360, queda en la franja alta donde se juntan Metropolitana y Soto Norte. Con el ajuste 1, Soto Norte toma su sitio primero. QA debe revisar que Metropolitana siga leyéndose en su provincia a 360. Si no, que se oculte antes que montarse sobre Soto Norte.

### Entrega para qa-pruebas (cuando el desarrollador haga 1 y 2)

- Barrido de 280 a 1.500 px, sin JS y con la interacción: ninguna provincia con cafés oculta de 320 en adelante, 0 solapes y 0 cortes, y al menos 2 px entre los rótulos y los puntos de los pines.
- Capturas a 320, 360 y 390, con y sin JS, para revisión de marca: Guanentá y Soto Norte con nombre, y cada rótulo dentro de su provincia o en su borde inmediato.
- La prueba «posiciones frente a main» necesitará aceptar los cambios del ajuste 1. Que la tabla los mida y los liste, como hizo con `CAMBIOS_QA_032`.

### Ronda 2: capturas finales de `b6f1614` (2026-11-19)

Revisé `docs/qa/capturas/2026-11-19-rotulos-final-{con-js,sin-js,main}-{320,360,390,1280}.png` con los tramos medidos en `docs/qa/2026-11-19-verificacion-qa-031-032.md` (ronda 2, R2-3). Solo lectura: no se tocó código ni capturas.

**Dictamen: aprobado.** Los ajustes 1 y 2 cumplen. Nada de lo que sigue bloquea la publicación.

| Ancho | Resultado |
|---|---|
| 320 | Guanentá y Soto Norte con nombre. «SOTO NORTE» queda en el borde entre Metropolitana y Soto Norte, encima del pin de Arreboles, que está en el verde. Cuenta como borde inmediato y se acepta. Vélez y Comunera ya no se pisan (en main sí). «Próximamente» de Metropolitana queda justo sobre «SOTO NORTE», pero no lo toca: uno va en versalitas 800 y el otro en 500 caja baja, así que se leen como dos rótulos. Esa vecindad ya estaba en main. Yariguíes sigue oculta (se aceptó en la ronda 1). |
| 360 | Era el ancho de referencia y es el que más mejora. En main, «VÉLEZ COMUNERA» y sus dos «Próximamente» formaban una sola cadena y Soto Norte no tenía nombre. Ahora se leen seis de las siete provincias, cada una en su sitio: Soto Norte y Guanentá (con cafés), Yariguíes, García Rovira, Vélez y Comunera. Metropolitana se oculta. Es la salida que se pidió en la ronda 1 para que no se monte sobre Soto Norte: una provincia «Próximamente» cede el sitio a una con cafés (principios 1 y 5). «SOTO» cae sobre el beige de Metropolitana porque a ese ancho el verde mide ≈ 45 px y el nombre ≈ 90 px. Se acepta: el pin ancla la provincia. |
| 390 | Igual a main salvo Guanentá. En main, «COMUNERA» quedaba a pocos px del pin de Casa Martínez y Guanentá 20 px más abajo, contra el borde sur. Ahora Comunera baja a su sitio y «GUANENTÁ» queda en pleno amarillo, debajo del pin y sin rozar el punto. |
| 1.280 | Soto Norte baja 20 px y queda centrada en el verde, sobre el pin de Arreboles. Mejora: en main estaba arriba, contra el borde norte. Metropolitana baja 60 px frente a main (≈ 40 px por debajo de su centro) y queda en la mitad baja del beige, encima de la lengua gris de Yariguíes. Sigue entera dentro de su provincia, a más de 15 px de la píldora «Arreboles» y sin tocar el trazo del borde. Se acepta. Se ve menos centrada que en main, pero no confunde la lectura. |

- **Sin JS = con JS** en los cuatro anchos de las capturas. Con QA-034 cerrado, el mapa no salta al llegar la interacción.
- **Punto del pin:** el mínimo medido es de 5 px; en las capturas ningún texto roza un punto grana. Cumple: se pedían 2 px.
- **Jerarquía:** las píldoras de los pines siguen por encima de los rótulos, y ningún rótulo pisa una píldora. Colores, tipografías, pesos y contraste no cambian.
- **Ocultos nuevos frente a main**, todos «Próximamente»: Comunera de 280 a 301 px y Metropolitana de 280 a 317 y de 332 a 376 px. Los dos están por debajo de 360 o en la franja de 360. Se aceptan con la regla del ajuste 1.

**Mejora opcional, puede ir después de publicar (Baja, sin ID):** en escritorio (desde 429 px), Metropolitana podría quedar más cerca de su centro. Hoy `SITIOS_ROTULO` solo prueba desplazamientos en vertical o en horizontal, y por eso baja hasta +40. Propuesta: probar sitios en diagonal (`[-40, -40]` y `[-60, -40]`) **después** de los nueve actuales. Así ningún rótulo que hoy se coloca cambia de sitio, y solo se mueve el que hoy cae en un sitio peor. Criterio: a 1.280 px el rótulo de Metropolitana queda entero dentro del beige y con su centro a 30 px o menos del centro de la provincia. Siguen valiendo 0 solapes, 0 cortes, ≥ 2 px al punto y Guanentá y Soto Norte siempre rotuladas. Si ningún sitio en diagonal cumple, se deja como está. No vale la pena tocar el mapa antes de publicar solo por esto, con QA-037 abierto en el mismo componente.

---

## Decisiones y su razón en la marca

| Decisión | Razón |
|---|---|
| Todos los botones a 44 px; chips, migas y pines con área ampliada sin cambio visual | Celular primero (principio 4): se compra con una mano. Donde la composición es densa, el área crece y el dibujo no |
| Selects en 16 px en celular | Sin zoom de iOS al elegir tamaño u orden |
| «Pedido» solo con ícono por debajo de 360 px | Cabe a 280 px y conserva el nombre accesible |
| Espaciador de la barra debajo de la franja | Los datos del vendedor y el © no se tapan; la franja sigue siendo el borde inferior visible |
| Tira deslizable no fija, en vez de menú | Cinco destinos se ven sin abrir nada; sin trampa de foco ni movimiento; no cambia el alto del encabezado fijo |
| Texto del mapa «Elige una provincia…» | Honestidad (principio 3): el texto dice lo que pasa con dedo, ratón y teclado. Terminología «provincia» |
| Mapa antes del catálogo; filete sobre Cómo pedir | La provincia es el hilo conductor (principio 5), aprobado por el dueño. Una trama por bloque; dos secciones pergamino seguidas se separan con un filete, sin color nuevo |
| Tarjeta por zona en celular, tabla desde `lg` | Sin desplazamiento horizontal a 360 px; mismos datos y orden que D3 |
| Leyenda de promociones en `overline ink-muted` | Mismo rótulo de grupo que el resto del sitio; terracota reservada para origen y tueste |
| Agotado con borde punteado, sin opacidad, y sin compra simulada | WCAG 1.4.1 y 1.4.3; no se muestra un precio ni una cantidad de algo que no se puede pedir |
| QA-029: controles de selección en 14/600, títulos de bloque en 700, notas y cuerpo con su clase de marca | Los 12 px en 500 son del dato técnico (nivel 1), no de un control que se toca con el pulgar. Los títulos tienen que verse como títulos. Arreglo en el marcado ahora; la migración a `@layer components` queda como deuda, con sus riesgos de foco |

## TODO(dato)

Esta especificación no necesita datos nuevos: usa los CSV y textos que ya existen. Ninguno pendiente.

## Preguntas abiertas

**[CONSULTAR] al dueño**
1. Titular del mapa: ¿se cambia «Explora por *provincia*» por «Santander, *provincia a provincia*» para no repetir el remate de «Elige por *provincia*», que queda justo debajo? (M4.)

**[CONSULTAR-LEGAL]** (las tramita la sesión principal con `legal-cumplimiento`)
1. `/envios/` en celular: ¿se aceptan las tarjetas por zona con «Cubre» de las zonas 3, 4 y 5 en un desplegable cerrado, mismo texto, orden y lugar? Si no, «Cubre» siempre abierto. (M8.)
2. Ficha totalmente agotada: ¿se puede omitir el precio y la leyenda de IVA? Si no, se muestran el precio por tamaño en `ink-muted` y la leyenda. (Ficha agotada.)
3. Antetítulo del catálogo «Nuestros cafés» (`seccion-catalogo.tsx:17`): con el modelo C (la tienda vende café de otras marcas; LEG-069 a LEG-071), ¿«nuestros» se puede leer como marca propia? Si sí, propuesta [UI]: «Los cafés». No se cambia sin respuesta.

## Entrega para desarrollador-fullstack

1. **M1**
   - `globals.css:23`: `.ds-btn--sm { min-height: 44px; }` y el comentario de la línea 21.
   - Chips (`controles-filtro.tsx:42`, `:79`; `explorador.tsx:123`): `relative before:absolute before:content-[''] before:inset-x-0 before:-inset-y-[5px]` (QA-025).
   - Selects (`explorador.tsx:86`, `linea-pedido.tsx:13`): `h-11 px-3 text-base md:text-sm`, sin `py-2`.
   - `Migas` (`ficha-cafe.tsx:28`): `relative before:absolute before:content-[''] before:-inset-x-1.5 before:-inset-y-[13px]` en el `Link`.
   - Pie (`pie.tsx:62` y `:36`): `inline-flex min-h-11 items-center`; la lista, `space-y-0`.
   - `mapa.css`: `.mapa-pin::before` y `.mapa-pin--compacto::before` como en la tabla.
   - Encabezado: `max-[359px]:sr-only` en «Pedido» y `gap-3 sm:gap-4`; si el encabezado pasa de 75 px, `py-2.5`.
   - Avisos con acción: `py-2 pl-5 pr-2`. Cajón, fila «Cambiaste tu pedido.»: `py-1`.
2. **M2:** `BarraPedido` devuelve el espaciador (`h-[calc(69px+env(safe-area-inset-bottom))] bg-surface-raised md:hidden`, `aria-hidden`) y la barra con `pb-[calc(0.75rem+env(safe-area-inset-bottom))]`. Decidir si se agrega `viewportFit: "cover"` al `viewport`.
3. **M3:** tira `<nav aria-label="Principal" class="md:hidden">` como hermana del `<header>`, oculta en `/pedido/`; «Envíos» (`/envios/`) en `ENLACES`, con `aria-current="page"` en `/envios/`; orden Mapa, Cafés, Cómo pedir, Historia, Envíos.
4. **M4:**
   - `src/app/page.tsx`: Portada, Mapa, Catálogo, Cómo pedir, Historia.
   - `seccion-mapa.tsx:42`: el texto nuevo, más el enlace «Ir a los cafés» (`BotonEnlace variante="enlace" tamano="sm" href="#catalogo"`) antes de la nota de fuente.
   - `seccion-catalogo.tsx:19`: «Elige por <em>provincia</em>».
   - `secciones-inicio.tsx:75`: `border-t border-line` en Cómo pedir.
   - El titular del mapa espera la respuesta de [CONSULTAR] 1.
5. **M8** (después de [CONSULTAR-LEGAL] 1): tarjetas `lg:hidden` y tabla `hidden lg:block` en `src/app/envios/page.tsx`, con `cubre(t)` sin cambios y los `data-testid` nuevos. Actualizar las pruebas que buscan textos de la tabla: cada texto queda dos veces en el HTML y solo una visible.
6. **Leyenda de promociones:** `flujo-pedido.tsx:369`, `caption font-semibold text-ink` pasa a `overline text-ink-muted`.
7. **Ficha agotada** (`bloque-compra.tsx`):
   - estilo de la píldora agotada;
   - `marcado` solo si el tamaño está disponible;
   - con `!estaDisponible(cafe)`, presentaciones como `ds-tags`, sin cantidad, total, notas de máximo y plazo, y con el texto nuevo y el enlace `wa.me`;
   - la leyenda de IVA espera [CONSULTAR-LEGAL] 2.
8. Los commits citan M1, M2, M3, M4 y M8 (y el QA-### que abra QA para la ficha agotada).
9. **QA-025** (cita el ID): chips de filtro y filtros activos, `before:-inset-y-1` pasa a `before:-inset-y-[5px]` (`controles-filtro.tsx:42`, `:79`; `explorador.tsx:123`).
10. **QA-026** (cita el ID):
    - `totales-pedido.tsx:125`, el `<Link>` «Cómo calculamos el envío»: `relative before:absolute before:content-[''] before:inset-x-0 before:-inset-y-[15px]`.
    - `ficha-cafe.tsx:136` y `flujo-pedido.tsx:465`, los `<summary>`: `relative before:absolute before:content-[''] before:inset-x-0 before:-inset-y-3`, sin cambiar su `display`.
    - `formulario-envio.tsx:240-241`: `<details>` de `mt-1` a `mt-0`; `<summary>` con `py-3.5`.
    - `filtro-rango.tsx`: raíz `h-6` pasa a `h-11`; leyenda `mb-2` pasa a `mb-0`; pulgar y valores sin cambio.
    - `documento-legal.tsx:78-81`: `<ol>` `space-y-0`; `<a>` `inline-flex min-h-11 items-center py-1` en lugar de `inline-block py-1`.
    - `tarjeta-provincia.tsx`: `shrink-0` en «Cerrar» (`:65`) y `min-w-0` en el `<h3>` (`:60`).

## Entrega para qa-pruebas

- **M1:** script a 360 × 740 en `/`, `/cafes/<slug>/`, `/envios/`, `/pedido/` y `/pedido/?paso=resumen`, con el cajón, la hoja de filtros y la tarjeta de provincia abiertos. Ningún control interactivo con área táctil menor de 44 × 44. Se excluyen los enlaces en línea dentro de una frase. En chips, migas y pines se mide el `::before` y no la caja visible.
- **M1:** a 280 px el botón «Pedido» no desborda; su nombre accesible sigue siendo «Pedido» (más «N bolsas»).
- **M1:** el encabezado sigue midiendo 75 px o menos. Si cambia, se vuelve a calcular `U` en QA-023 y se repiten `M1` y `M2`.
- **M1:** en WebKit (iPhone), enfocar los selects no hace zoom.
- **M1:** pines a 360 px: dos áreas ampliadas no se solapan. Si se solapan, se reporta.
- **M2:** a 360 px, con bolsas en el pedido y desplazado hasta el final: el © con la leyenda de IVA y la franja quedan completos encima de la barra. Sin bolsas no hay espacio vacío bajo la franja. En `/pedido/` no hay barra ni espaciador.
- **M3:**
  - a 360 px la tira se ve bajo el encabezado, se desliza y se va con el desplazamiento; el encabezado fijo no cambia de alto;
  - Tab recorre los cinco enlaces, cada uno se ve al enfocarlo y el contorno de foco no queda recortado;
  - hay una sola navegación «Principal» en el árbol de accesibilidad en cada ancho;
  - en `/envios/`, «Envíos» lleva `aria-current="page"`; en `/pedido/` no hay tira.
- **M4:**
  - orden del inicio: Portada, Mapa, Catálogo, Cómo pedir, Historia;
  - el texto del mapa es exactamente el nuevo;
  - «Elige por provincia» en el catálogo;
  - «Ir a los cafés» lleva a `#catalogo`;
  - con el dedo (emulación táctil), tocar una provincia abre la tarjeta; con ratón y con Enter, filtra;
  - medir el LCP y el JS de la portada en celular antes y después: el mapa ahora carga antes.
- **M8:**
  - a 360 y a 768 px no hay desplazamiento horizontal en `/envios/`;
  - hay una tarjeta por zona, en el orden de la tabla, y el texto de cada desplegable es igual al de la celda «Cubre»;
  - el desplegable funciona con Enter y con Espacio;
  - a 1.280 px la tabla se ve igual que en `main` (captura).
- **Leyenda de promociones:** se ve en mayúsculas, `ink-muted`, con el texto «Promociones (opcional)»; QA-023 (B3) sigue pasando.
- **Ficha agotada:**
  - con un café totalmente agotado (dato de prueba), ninguna píldora sale marcada;
  - no hay cantidad ni total; está el texto nuevo con el enlace `wa.me`;
  - axe sin violaciones y la palabra «Agotado» de las píldoras con contraste ≥ 4,5:1;
  - con agotado parcial, la primera disponible sale marcada.
- **axe:** sin violaciones serias ni críticas a 360 y 1.280 px en todas las páginas tocadas, claro y oscuro (pie).
- **QA-025:** con `elementFromPoint`, cada chip da 44 px de alto en el inicio, la hoja de filtros y la tarjeta de provincia.
- **QA-026:**
  - repetir los escenarios M1; todos los controles de la tabla QA-026 dan ≥ 44 × 44;
  - en los deslizadores se mide la **raíz** (44 de alto), no el pulgar;
  - las áreas de «Cómo calculamos el envío», de los `<summary>` y de los títulos del índice no se solapan con otro control;
  - el `<summary>` de la ficha conserva el triángulo nativo en Chromium y Firefox;
  - en la hoja, «Cerrar» mide 44 × 44 con «García Rovira», y el nombre parte renglón sin desbordar a 360 y 320 px;
  - QA-023 (B3) sigue pasando: el resumen no cambia de alto, porque el n.º 1 es (b);
  - casos no medidos: «Ver el mensaje» (resumen con el mensaje preparado) y «Cómo consulto de qué comuna soy» (municipio Bucaramanga).
