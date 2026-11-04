# De Santander — Manual de marca y sistema de diseño (v4.1)

**De Santander S.A.S.** comercializa café de especialidad y experiencias y productos de preparación provenientes de las regiones cafeteras de Santander, Colombia. Este sistema es la única fuente de verdad para posts, web, material comercial y piezas gráficas. Cualquier pieza nueva se construye con los tokens de `tokens.json`, los componentes de `components/` y las reglas de este documento.

**Qué es la v4.** Es la síntesis de las dos direcciones anteriores:

| De la v1 (tierra) | De la v3 (monte y bandera) |
|---|---|
| Fondo pergamino `#f7f1e6` en lugar de blanco puro | Verde monte `#0a3f25` como color de identidad y tema oscuro |
| Tinta grano tostado `#24170f` | Franja de bandera (grana + hoja/oro/carbón) como firma |
| Terracota del cañón `#a24f27` como acento cálido y antetítulo | Tarjetas de región tintadas con ficha de dato |
| Fraunces en titulares, con remate en itálica | Montserrat en texto, antetítulos y botones |
| Motivo de estratos del cañón y citas de caficultores | Hoja y cerezas ilustradas, pastillas píldora, cifras con filete |

El resultado: una marca cálida y editorial (pergamino, serif, tierra) sostenida por una identidad fuerte y reconocible (monte, franja, tarjetas). El rojo y el oro de la bandera quedan como señal (franja, cerezas, pastillas, cifras), nunca como fondo.

**Novedades de la v4.1 (profundidad y jerarquía).** Cuatro ajustes para salir del diseño plano sin cambiar la paleta ni la tipografía:

1. **Tramas de identidad geográfica.** Curvas de nivel del cañón (`ds-topo`, cuatro variantes por fondo) y grano de papel artesanal (`ds-grano`) como utilidades con tokens propios (`topo-stroke-*`, `grain-opacity`). Componente **Textura**.
2. **Etiquetas en tres niveles.** El dato técnico (municipio, proceso, variedad, altitud) pasa a `ds-tag`, silencioso; la clasificación queda en `ds-badge` con color de significado; el puntaje SCA se convierte en **sello circular** `ds-seal` con anillo oro y microborde. Componente **Etiqueta**.
3. **Tratamiento fotográfico.** `ds-photo` aplica un velo cálido `photo-warm` a toda fotografía; directriz de origen y producto en contexto, sin mockups estériles. Componente **Fotografía**.
4. **Verde bosque manda en los CTA.** Los botones de acción principal son siempre `verde-bosque` (alias de `monte-900`); la terracota se reserva para origen y notas de tueste (`ds-tag--origen`, `ds-badge--earth`, `ds-card__roast`, `ds-bar--terracota`); el botón `--accent` deja de ser un CTA relleno y pasa a enlace de origen con borde. Las barras de acento se unifican en `ds-bar` (una por bloque, cuatro colores).

Lectura rápida: `tokens.json` (valores) → `components/*/README.md` (reglas por componente) → `PROMPT.md` (versión condensada para usar como prompt de sistema).

---

## 1. Filosofía y personalidad de marca

**Idea central:** *De Santander* es un nombre de procedencia. Todo lo que la marca dice responde a la pregunta "¿de dónde viene esto?": de una provincia, de una vereda, de una familia, de una altitud.

**Arquetipo: el Explorador con raíces** (explorador + hombre corriente). Conoce las siete provincias cafeteras, las recorre y las cuenta sin solemnidad. No es el sabio que dicta ni el artesano nostálgico: es quien te lleva a la finca y te explica, con datos, por qué ese café sabe así.

**Pilares conceptuales**

| Pilar | Qué significa | Cómo se ve |
|---|---|---|
| Territorio | Santander como mapa: provincias, municipios, cañón, cordillera. | Verde monte, franja de bandera, tarjetas por provincia, mapas y cifras. |
| Tradición cafetera | Variedades, procesos, cosechas, familias que cultivan hace generaciones. | Fichas de dato ("Más cultivada · Castillo®"), notas con fuente, puntos de leyenda. |
| Origen y autenticidad | Trazabilidad: finca, altitud, proceso, tueste, puntaje. | Tarjeta de producto con cuatro datos, fotografía real sin filtros, lenguaje concreto. |
| Preparación en casa | La experiencia completa: del grano al método. | Guías paso a paso, experiencias y talleres, banners claros. |

**Tono de voz**
- *Claro y concreto:* nombra municipios, altitudes, variedades y procesos. "Castillo®, lavado, 1.650 m" vale más que "un café extraordinario".
- *Cercano, de usted a tú:* la marca tutea en redes ("Desliza", "Llévate el origen a casa") y usa usted en comunicación comercial formal (cotizaciones, correos a aliados).
- *Didáctico sin ser escolar:* explica una cosa por pieza; acompaña la cifra con su contexto y su fuente.
- *Orgullo sin folclor:* el territorio se muestra con datos y paisaje, no con costumbrismo ni estereotipos.
- *Honesto:* no promete lo que no es verificable. Toda afirmación sobre trato directo, origen o beneficio a caficultores debe poder demostrarse (Ley 1480 de 2011, publicidad engañosa).

**Vocabulario.** Se usa: *café de especialidad, provincia, vereda, finca, lote, microlote, caficultor/a, cosecha, traviesa, beneficio, lavado, honey, natural, tueste, taza, notas de cata, puntaje SCA, método, filtrado*. Se evita: *gourmet, premium, exótico, mágico, el mejor del mundo, 100 % artesanal* (sin sustento), y "Café de Santander" como nombre de producto (ver guardarraíles legales).

**Nombre.** Siempre "De Santander", con *D* mayúscula, en dos palabras. Nunca "DeSantander", "de Santander" en minúscula ni "Café De Santander" como marca.

---

## 2. Sistema de color

Dos temas: **Pergamino (claro)** para web, tienda y láminas educativas; **Monte (oscuro)** para portadas, historias y piezas de impacto. Todos los valores están en `tokens.json` con su uso semántico.

### Primaria — monte (v3) y tierra (v1)

| Token | HEX | RGB | Uso |
|---|---|---|---|
| `monte-900` | #0a3f25 | 10 63 37 | **Identidad.** Fondo del tema oscuro, titulares sobre pergamino, botón primario. |
| `monte-800` | #11542f | 17 84 47 | Tarjetas y paneles sobre monte-900. |
| `hoja-600` | #0b6b36 | 11 107 54 | Líneas de la franja, hojas, éxito. |
| `hoja-400` | #1a8c4e | 26 140 78 | Hojas y filetes sobre monte. Nunca texto sobre claro. |
| `menta-50` | #edf3ea | 237 243 234 | Tarjeta de región verde. |
| `pergamino-50` | #f7f1e6 | 247 241 230 | **Fondo base del tema claro.** |
| `pergamino-0` | #fffcf6 | 255 252 246 | Fichas de dato y tarjetas elevadas. |
| `tostado-900` | #24170f | 36 23 15 | Tinta de texto; empaque de tueste oscuro; post de cita. |
| `tostado-600` | #5a3a26 | 90 58 38 | Texto secundario cálido; antetítulo sobre arenisca. |
| `arenisca-200` | #e8d6b4 | 232 214 180 | Tarjeta tierra, post de producto, catálogo, banner claro. |

### Acento cálido — cañón (v1)

| Token | HEX | RGB | Uso |
|---|---|---|---|
| `chicamocha-600` | #a24f27 | 162 79 39 | Antetítulos sobre pergamino, chips de origen, botón de campaña, estrato. |
| `chicamocha-300` | #e3a27a | 227 162 122 | Acento sobre monte cuando no se usa oro; cita de caficultor. |
| `arcilla-50` | #f9e8dc | 249 232 220 | Tarjeta de región cálida (reemplaza al rosa de la v3). |

### Acento de bandera (v3)

| Token | HEX | RGB | Uso |
|---|---|---|---|
| `oro-500` | #e9b320 | 233 179 32 | Franja, cifras y antetítulos sobre monte, pastillas con texto carbón, botón oro. Nunca texto sobre claro. |
| `oro-900` | #4a3a00 | 74 58 0 | Título de tarjeta sobre crema-50. |
| `crema-50` | #fbf1d2 | 251 241 210 | Tarjeta de región oro. |
| `grana-600` | #b8162c | 184 22 44 | Bloque de la franja, cerezas, pastilla destacada, ediciones limitadas. |
| `grana-400` | #d9303f | 217 48 63 | Brillo de cereza. Nunca texto. |
| `carbon-900` | #1a1612 | 26 22 18 | Línea negra de la franja, texto sobre oro. |
| `niebla-100` | #e6e8e2 | 230 232 226 | Tarjeta neutra, divisores junto a fotografía. |
| `piedra-500` | #6b6158 | 107 97 88 | Texto secundario sobre pergamino. |

### Semánticos (claro / oscuro)

`surface` #f7f1e6 / #0a3f25 · `surface-raised` #fffcf6 / #11542f · `surface-sunken` #efe4d1 / #07301c · `ink` #24170f / #f7f1e6 · `ink-muted` #5f554c / #cfe0d5 · `ink-title` #0a3f25 / #f7f1e6 · `brand` #0a3f25 / #e9b320 · `on-brand` #f7f1e6 / #1a1612 · `accent` #a24f27 / #edb28c · `highlight` #e9b320 · `eyebrow` #a24f27 / #e9b320 · `danger` #b8162c / #ffb3b9 · `success` #0b6b36 / #8fd1a8 · `focus` #a24f27 / #e9b320 · `scrim` rgba(20,24,14,.60) / rgba(4,26,15,.70).

### Tokens añadidos en la v4.1

| Token | Valor (claro / oscuro) | Uso |
|---|---|---|
| `verde-bosque` | alias de `monte-900` | Nombre de uso del equipo para el verde de identidad y CTA. |
| `photo-warm` | rgba(162,79,39,.10) / .14 | Velo cálido sobre fotografía, modo multiplicar, antes del scrim. |
| `seal-ring` / `seal-ring-inner` | #e9b320 · #24170f / #f7f1e6 | Anillo y microborde del sello SCA. |
| `topo-stroke-light` | rgba(36,23,15,.075) | Curvas de nivel sobre pergamino, crema, menta, niebla. |
| `topo-stroke-dark` | rgba(247,241,230,.085) | Curvas sobre monte y tostado. |
| `topo-stroke-tierra` / `-arcilla` | rgba(122,75,38,.11) / rgba(162,79,39,.10) | Curvas sobre arenisca / arcilla. |
| `topo-stroke-width` | 1.4px (2 px en post) | Grosor del trazo. |
| `grain-opacity` / `-dark` | 0.07 / 0.05 | Grano de papel, multiplicar / pantalla. |

**Reglas de color**
1. Proporción: 60 % fondo (pergamino o monte), 30 % tintes y tarjetas (menta, arcilla, crema, niebla, arenisca), 10 % acentos (terracota, oro, grana).
2. **Verde bosque domina identidad y CTA**: botón primario, pastilla de región, franja, títulos sobre pergamino. **Terracota se reserva para origen y notas de tueste**: antetítulo de origen, `ds-tag--origen`, `ds-badge--earth`, `ds-card__roast`, `ds-bar--terracota`; nunca como relleno de botón de acción. Sobre oscuro el acento es el **oro**. La grana nunca es texto: vive en la franja, las cerezas y la pastilla de edición limitada.
3. Cada provincia conserva su familia (verde, arcilla, oro, neutro, tierra) en todas las piezas.
4. Texto ≥ 4,5:1 en ambos temas (verificado para todos los pares semánticos). Prohibidos para texto: oro y hoja-400 sobre claro, grana-400 en cualquier fondo, chicamocha-300 sobre pergamino.
5. En el tema oscuro el botón primario es oro con texto carbón.

## 3. Tipografía y jerarquía

**Validación de Roboto y Montserrat.** Ambas son gratuitas, variables y con cobertura completa del español. **Montserrat** tiene carácter geométrico y pesos hasta 900: funciona para texto, antetítulos y botones. **Roboto** es neutra y anónima; rinde en interfaces densas pero no distingue a la marca. La v4 conserva la recomendación: **Montserrat** para todo el texto y la interfaz; Roboto solo como alternativa de sistema (no se incluye en el paquete; se carga desde Google Fonts si se necesita en un panel de administración).

**Pareja de la v4: Fraunces + Montserrat.** Los titulares vuelven a la serif **Fraunces** de la v1 (700, tracking −0,01 a −0,02 em) con el remate en itálica 400 (`<em>`) para la palabra que importa: "Del cañón *a tu taza*", "Donde la niebla *madura el grano*". Es lo que da a la marca su tono editorial y cálido sobre el pergamino. Montserrat (v3) lleva todo lo demás: bajadas, cuerpo, municipios, antetítulos en mayúsculas con tracking 0,2 em y botones 700.

**Escala** (web; en post de 1080 px ×2–3): `display-xl` 64/66 700 · `display-l` 48/52 700 · `stat` 56/56 700 · `h1` 40/46 700 · `h2` 32/38 700 · `h3` 24/30 600 · `quote` 26/36 400 itálica · `subtitle` 20/30 500 · `body-l` 18/28 400 · `body` 16/26 400 · `small` 14/22 500 · `button` 15/20 700 · `overline` 12/16 800 MAYÚSCULAS 0,2 em · `caption` 12/18 500.

**Jerarquía fija de una pieza:** antetítulo (`overline`, color `eyebrow`) → titular Fraunces con una palabra en itálica → bajada Montserrat → contenido en tarjetas → nota de fuentes. Titulares en caja alta y baja; mayúsculas solo en el antetítulo; ¿¡ obligatorios; miles con punto; ≈ para aproximados. Un solo remate en itálica por titular.

Fuentes incluidas en `fonts/`: Fraunces y Montserrat variables, normal e itálica.

## 4. Estilo visual y dirección de arte

**Fotografía** (componente **Fotografía** y `assets/Fotografia/README.md`)
- *Tratamiento:* toda foto pasa por `ds-photo`, que aplica el velo cálido `photo-warm` (terracota al 10 %, multiplicar) para unificar la temperatura; con texto encima se suma el `scrim`.
- *Producto en contexto:* la bolsa se fotografía sobre yute, madera cruda, piedra o tierra, con manos o campo en cuadro. Un mockup sobre fondo blanco o gris no es una foto de marca; si solo existe el mockup, se compone sobre `arenisca-200` con `ds-topo--tierra` y `ds-grano`.
- *Sujeto:* paisaje de origen (cañón, cordillera, cafetal con niebla), manos que recolectan o benefician, grano en cereza y en pergamino, métodos de preparación en uso.
- *Luz:* natural. Primeras horas con niebla en el cafetal; tarde dorada en el cañón. Sin flash, sin HDR, sin filtros de color: el verde debe seguir siendo verde y la roca, ocre.
- *Composición:* horizonte en el tercio superior o inferior, nunca al centro; un elemento en primer plano (árbol, hoja, mano) para dar escala; aire a la izquierda o arriba para el texto.
- *Texturas de la región:* yute (costal), madera sin barnizar, piedra de la mesa, arcilla, hoja de plátano. Van como fondo de producto o detalle, en tonos de la paleta tierra.
- *Tratamiento sobre foto:* siempre velo `scrim` cuando hay texto encima; texto pergamino, antetítulo oro, titular Fraunces con remate en itálica, botón `--on-photo` o `--gold`.
- *No:* fotos de banco con tazas humeantes genéricas, personas posando con sonrisa publicitaria, viñetas, desenfoques artificiales, recorte de personas sin consentimiento.

**Ilustración**
- Estilo plano, sin contornos ni degradados: **hoja de cafeto** (elipse apuntada con nervadura central en el color del fondo) en `hoja-400`/`hoja-600`, siempre cortada por un borde de la pieza; **cerezas** en grupos de tres (`grana-600` + una en `grana-400`).
- **Franja de marca:** bloque grana al 20 % del ancho + cinco líneas hoja/oro/carbón/oro/hoja. Va a sangre en el borde inferior de posts, historias y héroes. Es la cita cromática de la bandera, no la bandera.
- **Estratos del cañón** (v1): cinco bandas de ancho desigual en terracota, arenisca, hoja, tostado y oro. Motivo de apoyo en posts de cita, fichas de origen e historias sobre fondo oscuro; nunca junto a la franja en la misma zona de la pieza.
- **Puntos de leyenda** en listas y tarjetas de variedad: grana = dominante, oro = destacada, pergamino = tradicional, terracota = de tierra.
- Iconografía: trazos de 2 px, esquinas redondeadas, un solo color (`ink` o pergamino). Sin emojis en piezas de marca.

**Tramas** (componente **Textura**)
- *Curvas de nivel* (`ds-topo`): trazo al 7–11 % según fondo, una sola trama por pieza, en portadas, tarjetas de región, banners, bloques de cita y empaque; nunca detrás de texto corrido.
- *Grano de papel* (`ds-grano`): multiplicar al 7 % sobre claro, pantalla al 5 % sobre oscuro; puede ir en cualquier fondo.
- Ambas se sienten, no se leen: si una curva distrae de un titular se desplaza el fondo, no se sube la opacidad.

**Composición de pieza**
- Esquinas amplias (`radius-lg`, 20 px web / 28 px post) en tarjetas, banners y marcos de foto. Botones y pastillas en forma de píldora.
- Rejilla de dos columnas en posts; cuatro tarjetas por lámina como máximo.
- Mucho aire: margen de 72 px en 1080 px; una idea por pieza.
- Sin sombras en redes; sombras `shadow-sm/md` solo en web.

---

## 5. Componentes web y de redes sociales

Cada componente tiene su vista previa y reglas en `components/<Nombre>/README.md`. Resumen:

| Componente | Para qué | Regla clave |
|---|---|---|
| **Button** | Acciones web y en pieza. | Píldora; el CTA principal es siempre verde bosque; `--accent` es enlace de origen con borde, no un CTA; `--gold` solo sobre fondos oscuros; `--on-photo` sobre fotografía. |
| **Etiqueta** | Tres niveles: `ds-tag` técnico, `ds-badge` clasificación, `ds-seal` sello SCA. | Técnico en silencio; color solo con significado; el sello únicamente con puntaje real. |
| **Badge** | Vista del nivel 2 (clasificación). | Máximo dos por tarjeta; terracota solo para notas de tueste y origen. |
| **Textura** | Curvas de nivel y grano de papel. | Una trama topográfica por pieza; grano libre. |
| **Fotografía** | Tratamiento cálido, scrim y pautas de encuadre. | Sin mockups estériles; velo `photo-warm` en toda foto. |
| **Franja** | Firma de bandera, estratos y barras de acento `ds-bar`. | Franja a sangre abajo; estratos solo en fondos oscuros; una barra por bloque. |
| **Region** | Tarjeta de provincia, región o variedad. | Seis familias (verde, arcilla, oro, neutro, tierra, monte); ficha pergamino con el dato grande en Fraunces. |
| **Stat** | Cifra con contexto. | Filete de color + número + línea; siempre con fuente al pie. |
| **ProductCard** | Cafés por región en tienda y catálogo. | Pastilla de región verde, sello SCA, notas de tueste en terracota, datos técnicos en silencio, precio COP, un botón verde. |
| **WebBanner** | Héroe fotográfico, banner monte, banner claro. | ≤ 7 palabras de título; franja en el héroe. |
| **PostFeed** | Post 4:5 en cinco familias: monte, pergamino, foto, tierra, cita tostado. | Alterna familias en la cuadrícula; franja en todas. |
| **Carousel** | Portada monte → láminas → ficha → cierre. | Índice "01/04"; fuentes en cada lámina con datos. |
| **Story** | Historias 9:16. | Zonas seguras de 250 px; ≤ 15 palabras. |

**Cuadrícula del perfil de Instagram:** monte → pergamino → foto → tierra → tostado → pergamino… para que nunca haya dos piezas vecinas del mismo fondo.

---

## Guardarraíles legales y de uso

- **Denominación de origen "Café de Santander"** (Res. SIC 50042 de 2014, administrada por la FNC): la expresión no se usa como nombre de producto, titular ni etiqueta en piezas comerciales de De Santander S.A.S. sin autorización. Se escribe "café de las provincias de Santander", "café santandereano" o se nombra la provincia. Las piezas de referencia de `assets/Piezas/` la usan como título editorial; al adaptarlas a piezas comerciales, reemplazar por "De Santander".
- **Bandera y escudo de Santander:** solo como referencia cromática (la franja). No se reproducen la bandera completa, las estrellas ni el escudo.
- **Marca "De Santander":** por tratarse de un nombre geográfico, su registro ante la SIC puede enfrentar oposición; conviene registrarla como marca mixta (nombre + signo gráfico) y mantener el signo gráfico cuando exista.
- **Datos y cifras:** toda cifra de producción, área o productores lleva fuente (Cenicafé, Comité de Cafeteros de Santander, FNC, Cámara de Comercio) y fecha; se marca con "≈" si es aproximada.
- **Castillo®** es marca registrada de la FNC/Cenicafé: se escribe con ® la primera vez en cada pieza.
- **Afirmaciones comerciales** ("trato directo", "familias caficultoras", "100 % trazable") solo si son demostrables.

## Activos

- `assets/Fotografia/` — fotografías propias del cañón del Chicamocha y del cafetal con niebla.
- `assets/Piezas/` — las cuatro láminas de referencia (portada, provincias 1/2 y 2/2, variedades) de las que viene la dirección de la v3.
- `assets/Referencias/` — bandera de Santander (solo referencia cromática).
- `assets/Tramas/` — SVG fuente de las curvas de nivel (cuatro variantes) y del grano, para Canva, Illustrator y empaque.
- `fonts/` — Fraunces y Montserrat variables.
