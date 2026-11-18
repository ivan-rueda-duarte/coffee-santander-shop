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

Los enlaces **dentro de una frase** (p. ej. «Zonas, tarifas y plazos» en el pie, «Ver plazos» en la ficha, el correo del vendedor) quedan como están: la excepción «en línea» de WCAG 2.5.5/2.5.8 los cubre y agrandarlos rompería el renglón.

### Tabla de cambios

| # | Control | Hoy | Corrección | Forma |
|---|---|---|---|---|
| 1 | `.ds-btn--sm` (todos: «Pedido», «Agregar», «Filtros», «Limpiar filtros», «Deshacer», «Vaciar pedido», «Editar», «Editar el pedido», acción de avisos, «Ver cafés de…», «Agregar/Quitar del filtro», «Ver todo Santander», «Seguir viendo cafés») | `min-height: 40px` (`globals.css:23`) | `min-height: 44px`. Se conserva el tipo de 13/16 y el relleno `8px 16px`: el botón gana 4 px de alto y sigue siendo «pequeño» por su tipo y su ancho. El comentario de la línea 21 pasa a «44 px todos» | (a) |
| 2 | Chips de filtro (`GrupoChips`, `GrupoOpcionUnica`, filtros activos) | `min-h-9` = 36 px | Se queda `min-h-9` visual y se agrega `relative before:absolute before:content-[''] before:inset-x-0 before:-inset-y-1` (36 + 4 + 4 = 44). Con `gap-2` (8 px) entre filas, las áreas de dos filas se tocan sin solaparse. En `GrupoOpcionUnica` las clases van en el `<span>` dentro del `<label>` | (b) |
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
   - Chips (`controles-filtro.tsx:42`, `:79`; `explorador.tsx:107`): `relative before:absolute before:content-[''] before:inset-x-0 before:-inset-y-1`.
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
