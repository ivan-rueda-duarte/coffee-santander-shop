# Inventario de la v1 y plan de migración a la v2

Resultado de la FASE 0 (solo lectura). Fecha: 2026-11-04. No se ha escrito código ni se ha movido ningún archivo.

## 1. Lo que encontré

| Documento | Resumen |
|---|---|
| `CLAUDE.md` (19 líneas) | Contiene el prompt de marca v4.1 completo. Es idéntico a `page_style/PROMPT.md` (`diff` sin diferencias). |
| `PRODUCT.md` | Tres tipos de usuario (casa, regalo, negocio). El pedido "existe solo cuando el cliente envía el mensaje". Despacho desde Bucaramanga. Pagos: contraentrega y Bre-B. Sin filtro por marca. Máximo 20 bolsas por línea. Sin fotos, fincas, testimonios ni reseñas. |
| `README.md` | Describe la v1: atlas con mapa y índice, filtro por provincia en la URL, orden, ficha, carrito, checkout por WhatsApp. |
| `.impeccable/surfaces/index-html.md` | "OWN-WORLD" con Young Serif, Public Sans, fondo blanco frío y botón bermellón. Contradice la v4.1. |
| `.impeccable/config.json` | Solo `{"telemetry": false}`. No existe `DESIGN.md`, aunque el brief lo menciona en FINISH. |
| `page_style/` | Tokens, `bundle.css`, 14 componentes con README (Badge, Button, Carousel, Cover, Etiqueta, Fotografia, Franja, PostFeed, ProductCard, Region, Stat, Story, Textura, WebBanner), assets y manual. `Carousel`, `PostFeed`, `Story` y `Cover` son piezas de redes, no de web. |
| `index.html` | 246 líneas. Header, `#atlas` (mapa + índice), `#pedir`, `#historia` (tema oscuro, con foto), footer con franja, barra móvil, modal de ficha y cajón del carrito. |
| `js/data.js` | `TIENDA`, `PRESENTACIONES`, `MOLIENDAS`, `MAX_CANTIDAD`, 7 `PROVINCIAS` con color, `MUNICIPIO_PROVINCIA` (86 municipios), `CAFES` (5 cafés). |
| `js/app.js` | 1.314 líneas, clase `CoffeeShop`. Todos los métodos nombrados en el prompt existen. |
| `js/mapa.js` | `MAPA_SANTANDER`: `viewBox` [0,0,1048,1246.5], `proyeccion` {lon0, lat0, cos, k, dx, dy}, **87** municipios `{nombre, provincia, d, c, lonlat}`, `contorno`, `limitesProvincia` y `provincias[prov] = {c, bbox}`. |
| `tools/build_mapa.py` | Lleva la tabla municipio→provincia **dentro del script**. Genera `js/mapa.js` y la tabla. Necesita descargar el GeoJSON del DANE (red). |
| `css/` | `tokens.css` es el de `page_style` con las rutas de fuentes ajustadas. `styles.css` tiene 2.406 líneas en bloques: botones, cabecera, atlas, mapa, índice, cómo pedir, historia, pie, barra de pedido, ficha, control segmentado, carrito, aviso, movimiento reducido, responsive. |

**Confirmado: no hay `package.json`.** Tampoco hay `.git`. Los datos de la v1 son los 5 cafés (Socorro, Barichara, San Gil, Málaga, Oiba), repartidos en 3 provincias (Comunera, Guanentá, García Rovira). Los 5 tienen 250 g a $25.000 y 500 g a $50.000.

## 2. Matriz de paridad (v1 → v2)

| # | Función de la v1 | Dónde vive hoy | Reemplazo en la v2 | Estado |
|---|---|---|---|---|
| 1 | Filtro por provincia con URL compartible (`?provincia=guanenta`) | `readFiltersFromUrl`, `writeFiltersToUrl`, `update` | `domain/catalogo/url.ts` + `useFiltrosCatalogo`. Acepta `provincia=a,b` y el formato v1. Ignora valores inválidos y `?marca=`. | Paridad + ampliación |
| 2 | Orden: catálogo agrupado, SCA, precio ↑↓, altitud | `update` (`sorters`), `renderIndex` | `ordenar` en `filtros.ts`. Con orden distinto al catálogo, lista plana con provincia en cada fila. | Paridad |
| 3 | Mapa SVG por provincias, municipios con color, bordes, contorno | `drawDepartment`, `buildMap` | `ui/componentes/mapa/` desde `src/data/mapa-santander.json` | Paridad |
| 4 | Provincias sin café atenuadas y no clicables, "Próximamente" | `buildMap`, `renderLegend` | Mapa + chips | Paridad |
| 5 | Tona rayada "por verificar" | `drawDepartment` (patrón `#hatch`) | Mapa; `municipios.por_verificar` | Paridad |
| 6 | Zoom animado a la provincia, "Ver todo Santander", instantáneo con movimiento reducido | `targetViewBox`, `zoomTo`, `#mapReset` | `useMapaInteraccion`; la caja une las provincias elegidas | Paridad + ampliación |
| 7 | Etiquetas de provincia y pines sin solapar, gratícula, marcas de grados | `buildOverlay`, `placeOverlay`, `formatDegrees` | Portar `placeOverlay` como lógica pura + `ResizeObserver` | Paridad |
| 8 | Escala gráfica (km) | `placeOverlay` | Mapa | **Falta en el prompt v2**: confirmar que se conserva |
| 9 | Pin del mapa abre la ficha | `buildOverlay` | Pin enlaza a `/cafes/[slug]/` | Paridad |
| 10 | Pie del mapa con fuentes (DANE, Wikipedia, "Tona por verificar") | `index.html` `#mapDesc` | Pie del mapa | Paridad |
| 11 | Leyenda de provincias con conteo | `renderLegend` | Chips con conteo (facetas) | Paridad |
| 12 | Contador "2 cafés en Guanentá" con `aria-live` | `resultsLabel` | Contador con foco desde el mapa | Paridad |
| 13 | Estado vacío con acción | `renderIndex` | Estado vacío útil | Paridad |
| 14 | Índice: lote con datos, notas, tueste con barra, "desde", Ficha, Agregar/Agotado | `createLot` | `ProductCard` | Paridad |
| 15 | Sello SCA y rótulo "Mejor puntaje SCA del catálogo" | `createLot`, `bestCafe` | `SelloSCA` solo con `puntaje_verificado` | **Cambio: ver inconsistencia 4** |
| 16 | Ficha: mini mapa con coordenadas | `renderMiniMap`, `openModal` | `MapaMunicipio` en `/cafes/[slug]/` | Paridad |
| 17 | Ficha: perfil, SCA con barra y explicación, ficha técnica, glosario "¿Qué significa cada dato?", origen, historia | `openModal` | Ficha | Paridad |
| 18 | Ficha: tamaño + molienda con precio vivo | `renderSeg`, `refreshPrice` | Bloque de compra fijo | Paridad |
| 19 | Ficha como modal con foco atrapado, `inert`, Esc, clic en el fondo | `openModal`, `closeModal` | **Ruta propia** (`/cafes/[slug]/`), ya no es modal | **Cambio de patrón: ver §3, punto 11** |
| 20 | Carrito: agregar, ±, quitar con deshacer, cambiar tamaño/molienda (fusiona idénticas) | `addToCart`, `changeQty`, `removeLine`, `updateLine` | `domain/pedido/carrito.ts` | Paridad |
| 21 | Máximo 20 por línea + aviso con WhatsApp para más | `MAX_CANTIDAD`, `addToCart` | Reducer + `config_tienda.max_cantidad` | Paridad |
| 22 | **Vaciar pedido con deshacer** | `clearCart` | Reducer | **Falta en el prompt v2** (solo menciona deshacer al eliminar) |
| 23 | Persistencia `desantander.carrito.v1`, sincronización entre pestañas | `saveCart`, `loadCart`, evento `storage` | `v2` + migración. Las líneas v1 usan `cafeId` numérico; hay que mapear id→slug | Paridad + migración |
| 24 | Descarta líneas de cafés que ya no existen o no están disponibles | `loadCart` | `CarritoAlmacen` | Paridad |
| 25 | Cajón lateral y botón con contador animado | `openCart`, `renderCart` | Cajón en escritorio | Paridad |
| 26 | Barra inferior móvil "Tu pedido · N bolsas · $…" | `renderOrderBar` | Barra móvil | Paridad |
| 27 | Ciudad de entrega y forma de pago opcionales | `#cartOptions` | Se vuelven el paso 2 obligatorio | **Cambio: ver inconsistencia 10** |
| 28 | `Finalizar compra` = enlace real a `wa.me` | `renderCheckoutLink`, `checkout` | `<a href>` después de la respuesta de `crear-pedido` | Paridad |
| 29 | Panel "Tu pedido está listo en WhatsApp": mensaje, Copiar, Abrir otra vez, Editar, Vaciar, número | `renderSentPanel`, `copyMessage` | Panel de confirmación | Paridad |
| 30 | Copiar con respaldo (selecciona el texto si no hay portapapeles) | `copyMessage` | Mantener el respaldo | Paridad |
| 31 | Mensaje de WhatsApp | `buildOrderMessage` | `construirMensaje` con plantilla nueva (número, provincia, dirección) | **Cambia el texto** |
| 32 | Foco atrapado, `inert` del fondo, Esc | `trapFocus`, `setBackgroundInert` | `@radix-ui/react-dialog` | Paridad |
| 33 | Movimiento reducido | `prefersReducedMotion`, CSS | Hook `useMediaQuery` + CSS | Paridad |
| 34 | Aviso (toast) con acción | `showToast` | Componente de aviso | Paridad |
| 35 | Enlace "saltar al índice" | `.skip-link` | Layout | Paridad |
| 36 | "Cómo pedir", enlace de negocio (>20 bolsas), historia con foto y proceso, footer con contacto/envío/pagos | `index.html`, `renderStaticCopy` | Secciones de inicio; textos desde Sanity con respaldo v1 | Paridad |
| 37 | Textos de provincia con "por completar" ocultos | `isPlaceholder` | `descripcion` null → no se muestra | Paridad |
| 38 | Copy dinámico del resumen del atlas | `renderStaticCopy` | Portada | Paridad |
| 39 | Franja, tramas topo y grano, velo cálido en foto | `styles.css` | `Franja`, `Textura`, `Foto` | Paridad |
| 40 | Navegación por anclas (`#atlas`, `#pedir`, `#historia`) | header, footer | Anclas en inicio + rutas | Paridad |

## 3. Inconsistencias y riesgos

### Las 10 que lista el prompt

1. **Filtro por marca.** Confirmada. `PRODUCT.md` lo excluye y el README lo sigue anunciando (línea 3: "filter it … by brand"). El campo `marca` repite `nombre` en los 5 cafés. Propuesta del prompt: filtro "Productor / finca", oculto (hoy `finca` está vacío). Corregir el README.
2. **Procesos.** Confirmada. Hay cuatro textos "Lavado …", ninguno es honey, natural ni fermentación. Con los datos de hoy el filtro Proceso muestra 1 opción real y 3 vacías. Además, "Lavado premium" infringe la marca (palabra vetada) y está en el dato actual.
3. **Tueste.** Confirmada. La v1 tiene 5 niveles y el filtro 3. En los datos: Medio ×2, Medio claro, Medio oscuro, Claro. La agrupación propuesta funciona.
4. **Puntajes SCA sin verificar.** Confirmada, y es la de mayor impacto. Los 5 cafés tienen 86–91 y `PRODUCT.md` dice que no se verificaron. Con `puntaje_verificado = false` desaparecen el sello, el filtro SCA y el rótulo "Mejor puntaje", y el orden por SCA ordena datos no verificados. Es una pérdida visible respecto a la v1 y `PRODUCT.md` presenta el puntaje como dato central. Necesito su decisión.
5. **Tona.** Confirmada: sin provincia. El script la deja `None`.
6. **Descripciones faltantes.** Confirmada: Metropolitana, Soto, Vélez, Yariguíes ("Descripción por completar.").
7. **Molienda.** Confirmada: hoy solo "Grano entero" y "Molido".
8. **Brief de impeccable.** Confirmada (ver bloque "OWN-WORLD").
9. **Datos legales del vendedor.** Confirmada: no hay razón social, NIT ni domicilio. Solo existe el WhatsApp.
10. **Envío.** Confirmada: hoy solo ciudad (opcional) y pago (opcional). La v2 pide dirección completa.

### Otras que encontré

11. **La ficha pasa de modal a página.** Es un cambio de patrón no declarado en la matriz del prompt. Se pierde el "agregar sin salir de la primera pantalla" de la tesis del brief. Propongo conservar el "Agregar" en la tarjeta (con 250 g y grano por defecto, como hoy) y la ficha como ruta.
12. **El pedido "existe cuando el cliente lo envía" (`PRODUCT.md`) contra el número DS-2026-000123 creado antes de enviar.** La v2 registra pedidos que nunca se envían por WhatsApp. Hace falta definir un criterio (por ejemplo, limpiar `pendiente_whatsapp` a los 7 días) y actualizar `PRODUCT.md`, que además dice "sin framework ni paso de compilación".
13. **Preview en GitHub Pages.** GitHub Pages sirve un solo sitio por repositorio; no existe un "entorno de preview" por rama. Desplegar `v2-nextjs` reemplazaría la v1 de `main`. Propongo desplegar solo desde `main` y probar la rama con `npx serve out` o con el CI.
14. **`repository_dispatch` solo ejecuta workflows de la rama por defecto.** El webhook de Sanity no disparará nada hasta que `deploy.yml` llegue a `main`.
15. **No hay repositorio git.** El Paso 1 usa `git checkout -b` y `git mv`, y las reglas piden commits por fase. Hay que ejecutar `git init` (con un commit base de la v1) antes. Esto es una acción local, pero necesito su confirmación. Tampoco hay `.gitignore`.
16. **Rutas de assets duplicadas.** `assets/fotografia/` (minúsculas, 1 foto, la usa `index.html`) y `page_style/assets/Fotografia/` (2 fotos, mayúsculas). El Paso 1 mueve `page_style/assets/` a `public/assets/` mientras `assets/` va a `legacy/`. Hay que decidir un único destino y cuidar mayúsculas (Linux distingue). `chicamocha-canon.jpg` (614 KB) solo existe en `page_style`. Además hay `topo-arcilla.svg` y `topo-tierra.svg` ausentes de `assets/tramas/`.
17. **Tokens de Tailwind v4.** Las variables son `--monte-900`, `--surface`. En Tailwind v4 los colores solo generan utilidades (`bg-monte-900`) con prefijo `--color-` en `@theme`. Para conservar los nombres de la marca hay que mapear `--color-monte-900: var(--monte-900)`. Además, `page_style/tokens.css` dice "v3" en su cabecera, aunque es v4.1.
18. **SQL del prompt.**
    - `alter table a, b, c enable row level security` no es sintaxis válida (el propio prompt lo anota).
    - `revoke execute … from anon, authenticated` no basta: Postgres concede `EXECUTE` a `PUBLIC` por defecto, así que hay que revocar también de `public`.
    - La vista `catalogo_publico` debería usar `with (security_invoker = true)`, o se ejecuta con los privilegios de su dueño y se salta RLS.
    - `check (gramos in (250,500))` contradice a `PRODUCT.md`, que dice que cada café define sus tamaños.
    - La disponibilidad pasa de `cafe.disponible` (v1) a `presentaciones.disponible`.
    - `select c.*` expone `registro_sanitario` y `puntaje_fuente`; confirmar que es lo deseado.
    - Enum `molienda`: `grano`/`molido`, mientras la interfaz dice "Grano entero". Falta la tabla de equivalencia.
19. **`output: 'export'` y rutas especiales.** `sitemap.ts` y `robots.ts` necesitan `export const dynamic = 'force-static'`. `not-found.tsx` genera `404.html`, que sí sirve GitHub Pages.
20. **Turnstile.** Requiere cuenta de Cloudflare y sumar a Cloudflare a la política de datos. Es un dato que no tengo.
21. **Filtros con un solo valor.** Con los datos de hoy, Precio es un rango degenerado ($25.000–$25.000) y Proceso casi inútil. Propongo ocultar toda faceta con menos de 2 valores distintos, como ya se hace con Productor y SCA.
22. **Variedad.** El prompt menciona Geisha, que no está en los datos; sí está Typica (Málaga) y no se menciona. Castillo® aparece sin ® en la v1 (regla de marca).
23. **Perfiles de taza.** La tabla `notas_cata → perfil_taza` necesita decisión de contenido. Notas de hoy: Caramelo, Cacao, Frutos rojos, Naranja, Miel, Jazmín, Chocolate, Nuez, Especias, Floral, Manzana, Cereza, Canela. Ambiguas: Miel y Canela. La nota "Panela" del README no existe en los datos.
24. **Honestidad de los textos v1.** Estos textos no están respaldados por `PRODUCT.md` y pasarían al sitio como respaldo de Sanity:
    - "más de 30 años de tradición" (Socorro).
    - "enfoque en calidad y sostenibilidad" (Barichara).
    - "Una marca nacida en San Gil… perfil fuerte" (San Gil; además sugiere una marca de terceros).
    - "Los Santanderes fueron de las primeras regiones cafeteras de Colombia" (Historia).
    - "Despulpado, fermentación y lavado" (Historia; `PRODUCT.md` solo confirma recolección manual, secado al sol y tueste por lotes).
    - Notas de cata y puntajes no verificados.
    Propongo no usar esos textos como respaldo hasta que usted los confirme.
25. **Plantilla de WhatsApp.** Usa "Grano" y el enum/UI dice "Grano entero". Define cuál se escribe. La plantilla v2 ya no incluye la pregunta final "¿Me confirman el costo del envío…?" y la v1 la tenía.
26. **Datos personales.** La cédula es opcional, pero no se justifica para qué se usa; evalúe pedirla solo si la logística la requiere (principio de finalidad, Ley 1581).
27. **README.** Sigue diciendo "filter by brand" y menciona `marca`. El id `brandModal` es un resto de la versión con marcas.

## 4. Plan por fases

Las estimaciones son de trabajo efectivo mío con sus aprobaciones, sin contar los pasos que dependen de usted (Docker, `sanity login`, cuentas, datos legales).

| Fase | Contenido | Estimación |
|---|---|---|
| 0 | Esta fase | hecha |
| 1 | `git init` + base v1, memoria del proyecto (`docs/marca-v4.1.md`, `CLAUDE.md` nuevo, brief de impeccable corregido), proyecto Next.js, Tailwind v4 con tokens, scripts, `.env.example`, fuentes y assets | 0,5–1 día |
| 2 | Dominio puro con pruebas: catálogo, filtros, URL (compat. v1), perfiles, carrito, totales, mensaje, envío, migración v1→v2 | 1–1,5 días |
| 3 | Geometría del mapa y Supabase (migraciones, RLS, seed desde la v1, pruebas pgTAP) | 1–1,5 días |
| 4 | Edge Function `crear-pedido` + pruebas con Deno | 0,5–1 día |
| 5 | Sanity Studio, esquemas, GROQ y respaldo con textos v1 | 1 día |
| 6 | UI: marca, catálogo con filtros, tarjeta, ficha | 2 días |
| 7 | Mapa interactivo y sincronización con filtros | 1,5–2 días |
| 8 | Carrito, `/pedido`, checkout y confirmación | 1,5 días |
| 9 | Rutas, SEO, JSON-LD, cumplimiento, `impeccable` audit/polish | 1 día |
| 10 | CI/CD, `docs/DEPLOY.md`, e2e, axe, Lighthouse, cierre | 1–1,5 días |

Total aproximado: 11–14 días. Los riesgos mayores son las fases 7 y 3.

## 5. Decisiones que necesito de usted

Con su "sigue" puedo avanzar con los valores por defecto marcados en cada una.

1. `git init` con un commit base de la v1 y la rama `v2-nextjs`. *(Por defecto: sí.)*
2. Puntajes SCA (inconsistencia 4). *(Por defecto: ocultar en la v2 hasta tener fuente y fecha; la v1 queda intacta en `legacy/`.)*
3. Ficha como ruta, con "Agregar" rápido en la tarjeta (punto 11). *(Por defecto: sí.)*
4. Despliegue solo desde `main`; la rama se prueba en el CI (punto 13). *(Por defecto: sí.)*
5. Ocultar facetas con menos de 2 valores (punto 21). *(Por defecto: sí.)*
6. Tratamiento de los textos v1 no respaldados (punto 24). *(Por defecto: no usarlos como respaldo.)*
7. Escala gráfica y "Vaciar con deshacer" se conservan (filas 8 y 22). *(Por defecto: sí.)*
8. Política para pedidos que nunca se envían (punto 12). *(Por defecto: limpieza a los 7 días, a confirmar.)*
9. Propuesta de `.impeccable/surfaces/index-html.md` corregido (fase 1; la redacto y se la muestro antes de guardarla).

## 6. Estado de la migración (2026-11-04)

Resultado de recorrer la matriz de la sección 2 contra la v2.

| Fila | Estado en la v2 |
|---|---|
| 1–2, 11–13 (filtro, URL, orden, leyenda, contador, estado vacío) | Hecho: `useFiltrosCatalogo` + `domain/catalogo`. URL con varias provincias; acepta `?provincia=` de la v1 e ignora `?marca=`. |
| 3–10 (mapa, pines, zoom, escala, fuentes) | Hecho: `MapaProvincias`. Incluye gratícula, escala gráfica, etiquetas sin solape, encuadre animado (instantáneo con movimiento reducido) y «Ver todo Santander». |
| 14, 16–18 (tarjeta, mini mapa, ficha, compra) | Hecho. La ficha pasa a ser ruta propia (decisión 3). |
| 15 (sello SCA, «Mejor puntaje») | **Cambia:** solo con puntaje verificado; hoy no se ve (decisión 2). El rótulo «Mejor puntaje SCA del catálogo» se retiró. |
| 19 (modal con foco atrapado) | Reemplazado por ruta. El **cajón** del pedido y la **hoja** de filtros conservan foco atrapado, `inert` (Radix), Esc y devolución del foco. |
| 20–26 (carrito, 20 por línea, vaciar con deshacer, persistencia, pestañas, cajón, barra móvil) | Hecho. Migra `desantander.carrito.v1`. |
| 27–31 (ciudad y pago, WhatsApp, panel de confirmación, mensaje) | Hecho con cambios: envío completo obligatorio en `/pedido/` y mensaje nuevo (plantilla del prompt, sin número de pedido). «Copiar mensaje», «Abrir WhatsApp», «Editar pedido» y «Vaciar pedido» se conservan. |
| 32–35 (foco, movimiento reducido, avisos, salto al contenido) | Hecho. |
| 36–38, 40 (cómo pedir, historia, footer, anclas) | Hecho; los textos sin respaldo de la v1 no se reutilizan (punto 24). |
| 39 (franja, tramas, velo cálido) | Hecho con los componentes de marca. |

Qué se agregó (no estaba en la v1): provincia(s) múltiples, municipio, proceso, variedad, tueste, perfil de taza, altitud, precio, stock, chips de filtros activos, hoja de filtros en celular, páginas de provincia, páginas legales, sitemap, JSON-LD de producto, departamentos y municipios de Colombia (DANE) en el envío.

**Verificación:** 233 pruebas unitarias (cobertura de `domain/` ≥ 94 %), 27 pruebas e2e (incluye axe sin violaciones serias, teclado, 360 × 740 y migración del carrito de la v1), Lighthouse móvil 91–92 / 100 / 100.

**Decisiones del plan original que cambiaron:** sin Supabase ni Edge Function (CSV); sin Turnstile; sin número de pedido; sin `useDisponibilidad` (la disponibilidad se actualiza al reconstruir); consultas de Sanity validadas con zod en lugar de `sanity typegen`; despliegue solo desde `main` (Pages no tiene vista previa por rama).
