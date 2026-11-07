# Prompt para Claude Code — De Santander v2 (Next.js + Supabase + Sanity)

Uso recomendado: guarde este archivo en la raíz del repositorio como `docs/PROMPT-V2.md` y en la terminal ejecute
`claude "Lee docs/PROMPT-V2.md completo y ejecútalo empezando por la FASE 0."`
También puede copiar el bloque de abajo y pegarlo directamente en `claude`.

~~~~markdown
# MISIÓN

Actúa como Senior Full-Stack Architect (Next.js App Router, TypeScript, Tailwind, Supabase, Sanity). Vas a migrar la tienda estática "De Santander" (HTML/CSS/JS sin framework) a una v2 en Next.js con catálogo filtrable, mapa interactivo de provincias, carrito y checkout que registra el pedido en Supabase y lo entrega por WhatsApp. La interfaz va en español de Colombia; el código (identificadores) puede ir en español, como el proyecto actual. Hosting de pruebas: GitHub Pages.

Reglas de trabajo:
- NO escribas código de producción hasta terminar la FASE 0 y que yo apruebe el plan. Usa modo plan.
- Trabaja en la rama `v2-nextjs`. Commits pequeños por fase, con mensajes en español (`feat(catalogo): …`).
- Nunca inventes datos de negocio (NIT, fincas, puntajes, registros INVIMA, textos legales, fotos, testimonios). Si falta un dato, deja un `TODO(dato):` visible en `docs/PENDIENTES.md` y no lo muestres en la interfaz.
- Ningún comando que toque servicios remotos (`supabase db push`, `functions deploy`, `sanity deploy`, crear secretos, push a GitHub) sin pedirme confirmación antes.
- Si algo de este prompt contradice el código o los documentos del repo, detente y pregúntame; no elijas en silencio.

# FASE 0 — Inspección obligatoria (solo lectura)

Lee, en este orden, y resume lo que encuentres:
1. `CLAUDE.md`: sistema de marca De Santander v4.1 (paleta, tipografía, componentes, reglas de tono). Es norma, no sugerencia.
2. `PRODUCT.md`: usuarios, principios, terminología ("provincia", "puntaje SCA"), decisiones y pendientes.
3. `README.md`: funciones actuales y flujo.
4. `.impeccable/surfaces/index-html.md` y `.impeccable/config.json`.
5. `page_style/README.md`, `page_style/tokens.json`, `page_style/tokens.css`, `page_style/components/*/README.md` (Button, Badge, Etiqueta, ProductCard, Region, Stat, Franja, Textura, Fotografia, WebBanner).
6. `index.html` (secciones: header, `#atlas`, `#pedir`, `#historia`, footer, ficha/modal, `#cartDrawer`).
7. `js/data.js` (TIENDA, PRESENTACIONES, MOLIENDAS, MAX_CANTIDAD, PROVINCIAS con `color`, MUNICIPIO_PROVINCIA con 86 municipios y Tona por verificar, CAFES).
8. `js/app.js` (clase `CoffeeShop`: readFiltersFromUrl, buildMap, buildOverlay, placeOverlay, renderLegend, update, zoomTo, renderIndex, createLot, openModal, renderMiniMap, addToCart, changeQty, updateLine, removeLine, renderCart, renderOrderBar, saveCart/loadCart con clave `desantander.carrito.v1`, buildOrderMessage, renderCheckoutLink, checkout, trapFocus).
9. `js/mapa.js` (solo la estructura de `MAPA_SANTANDER`: viewBox, proyección, municipios, bordes, centros y cajas por provincia; no lo imprimas completo) y `tools/build_mapa.py`.
10. `css/tokens.css` y la estructura de `css/styles.css` (busca los bloques, no lo leas entero).
11. `.claude/skills/`: usa `impeccable` para el trabajo de interfaz (sigue su Setup). Ignora `last30days`; no aplica.
No hay `package.json`: el proyecto actual no tiene build. Confírmalo.

Entrega de la FASE 0 (en `docs/INVENTARIO-V1.md`):
- Matriz de paridad: cada función de la v1 → componente o hook de la v2 que la reemplaza. Nada se pierde sin que yo lo apruebe: URL compartible, orden (catálogo, SCA, precio ↑↓, altitud), ficha con mini mapa y glosario "¿Qué significa cada dato?", carrito con deshacer, máximo 20 bolsas por línea, barra inferior móvil "Tu pedido", panel "Tu pedido está listo en WhatsApp" con "Copiar mensaje" / "Abrir WhatsApp otra vez" / "Editar" / "Vaciar", foco atrapado e `inert`, movimiento reducido, Esc.
- Lista de inconsistencias detectadas (ver la sección INCONSISTENCIAS CONOCIDAS) y cualquier otra que encuentres.
- Plan por fases con estimación. Luego ESPERA mi aprobación.

# MEMORIA DEL PROYECTO (contexto persistente)

Reorganiza la memoria sin perder nada:
- Mueve el contenido actual de `CLAUDE.md` (sistema de marca) a `docs/marca-v4.1.md` sin cambiar una palabra.
- Escribe un `CLAUDE.md` nuevo, corto (≤ 120 líneas), con: (a) imports `@docs/marca-v4.1.md` y `@PRODUCT.md`; (b) stack y comandos (`npm run dev`, `build`, `test`, `e2e`, `lint`, `supabase start`); (c) reglas de arquitectura (sección ARQUITECTURA); (d) la restricción de GitHub Pages; (e) "no inventar datos"; (f) dónde vive cada dato (Supabase = comercio; Sanity = editorial).
- Actualiza `.impeccable/surfaces/index-html.md`: su "OWN-WORLD" (Young Serif, Public Sans, fondo blanco frío, botón bermellón) contradice la marca v4.1 que ya usa el código (Fraunces/Montserrat, pergamino, CTA verde bosque). Prevalece v4.1; propón el texto corregido y pídeme visto bueno.
- Mantén `PRODUCT.md` como fuente de verdad del producto y agrega allí las decisiones nuevas que yo apruebe.

# ARQUITECTURA DECIDIDA

## Restricción clave: GitHub Pages es solo estático
GitHub Pages no ejecuta servidor: **no hay API Routes, Server Actions, middleware, ISR ni `next/image` optimizado**. Por eso:
- `next.config.ts` con `output: 'export'`, `trailingSlash: true`, `images: { unoptimized: true }` y `basePath`/`assetPrefix` = `/<nombre-del-repo>` solo cuando `GITHUB_PAGES=true`. Crea un helper `asset(path)` para rutas de `public/` con basePath.
- La lógica "de servidor" del checkout va en una **Supabase Edge Function** (`crear-pedido`). Esto reemplaza a las API Routes del plan original.
- Los Server Components se ejecutan **en el build**: leen catálogo (Supabase) y contenido editorial (Sanity) y generan HTML estático. Las rutas dinámicas usan `generateStaticParams` y `dynamicParams = false`.
- Datos que cambian sin rebuild (disponibilidad, precio vigente) se consultan en el cliente desde una vista pública de Supabase; el precio que vale es el que devuelve `crear-pedido`.
- Rebuild automático: webhook de Sanity al publicar → `repository_dispatch` (tipo `contenido-publicado`) de GitHub → workflow de deploy.
- Si después se migra a Vercel, la arquitectura no cambia: la Edge Function se queda.

## CMS: Sanity (no Directus)
Directus requiere un servidor propio, que este hosting no ofrece. Sanity es hosted y tiene plan gratuito. Reparto de responsabilidades:
- **Supabase (comercio, fuente de verdad):** provincias, municipios, productores, cafés (datos técnicos), presentaciones y precios, disponibilidad, pedidos, configuración de tienda.
- **Sanity (editorial):** historia de cada café, provincia y productor; fotos; textos de inicio, "Cómo pedir", "Historia", páginas legales. Se enlaza a Supabase por `slug`.
- Si un campo existe en ambos lados, gana Supabase y el build falla con un mensaje claro si el slug no coincide.

## Capas (Clean Architecture)
```
src/
  domain/            # TS puro. Sin React, Next, Supabase ni Sanity.
    catalogo/        # tipos Cafe, Provincia, Municipio, Presentacion, Productor; enums Proceso, Tueste, Perfil, Molienda
      filtros.ts     # FiltrosCatalogo, aplicarFiltros, calcularFacetas, ordenar
      url.ts         # parseFiltros(searchParams) / serializarFiltros(filtros)  (valores inválidos se ignoran)
      perfiles.ts    # nota de cata → familia de perfil (tabla de equivalencias)
    pedido/
      carrito.ts     # reducer puro: agregar, cambiarCantidad, actualizarLinea (fusiona idénticas), eliminar, deshacer
      totales.ts
      mensaje-whatsapp.ts  # construirMensaje(pedidoConfirmado) y construirEnlace(numero, texto)
      envio.ts       # esquema zod del formulario de envío
    comun/           # Dinero (COP, formato $25.000), slug, normalización de tildes
  application/
    puertos.ts       # CatalogoRepositorio, ContenidoRepositorio, PedidoGateway, CarritoAlmacen
    casos-uso/       # obtenerCatalogo, obtenerFichaCafe, confirmarPedido
  infrastructure/
    supabase/        # cliente (clave pública), repositorio de catálogo, gateway crear-pedido
    sanity/          # cliente, consultas GROQ tipadas, repositorio de contenido
    almacenamiento/  # carrito en localStorage (clave v2 + migración desde desantander.carrito.v1)
  ui/
    componentes/     # marca/ (Boton, Etiqueta, Pastilla, SelloSCA, Franja, Textura, Foto), catalogo/, mapa/, ficha/, carrito/, checkout/, layout/
    hooks/           # useFiltrosCatalogo, useFacetas, useCarrito, useDisponibilidad, useMapaInteraccion, useMediaQuery
app/                 # rutas (ver MAPA DEL SITIO)
supabase/            # migrations/, seed.sql, functions/crear-pedido/
studio/              # Sanity Studio (schemas)
tools/               # build_mapa.py adaptado
```
Reglas:
- `domain` no importa nada de fuera de `domain`. Hazlo cumplir con `eslint` (`no-restricted-imports` o `eslint-plugin-boundaries`).
- `ui` no llama a Supabase/Sanity directamente: usa casos de uso o hooks que reciben repositorios.
- Server Components por defecto. `'use client'` solo en: explorador de catálogo (filtros + resultados), mapa, selector de presentación/molienda, carrito, formularios, diálogos. Los Server Components pasan datos serializables.
- Todo `useSearchParams` envuelto en `<Suspense>` (obligatorio con `output: 'export'`).
- TypeScript `strict`, sin `any`. Tipos de BD generados con `supabase gen types typescript --local > src/infrastructure/supabase/tipos.ts`.

## Sistema de diseño
- Traslada `page_style/tokens.css` y `tokens.json` al `@theme` de Tailwind (v4, configuración en CSS). Nombres de token iguales a los de la marca (`monte-900`, `pergamino-50`, `chicamocha-600`, `oro-500`, `grana-600`, etc.).
- Fuentes locales con `next/font/local` desde `fonts/` (Fraunces y Montserrat variables).
- Reproduce los componentes de `page_style/components/` como componentes React con las mismas reglas (CTA principal verde bosque; terracota solo para origen y tueste; oro nunca como texto sobre claro; grana nunca como texto; sello SCA circular solo con puntaje real ≥ 80).
- Contraste ≥ 4,5:1 verificado con axe.

# PASOS Y COMANDOS (ejecútalos en orden después de mi aprobación)

## Paso 1. Preservar la v1 y crear el proyecto
```bash
git checkout -b v2-nextjs
mkdir -p legacy && git mv index.html css js assets legacy/   # la v1 queda para comparar paridad
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
# si create-next-app se niega por el directorio no vacío, créalo en ./tmp-next y mueve los archivos; no borres nada sin preguntar
npm i @supabase/supabase-js @sanity/client groq zod @floating-ui/react @radix-ui/react-slider @radix-ui/react-dialog clsx
npm i -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event jsdom @playwright/test @axe-core/playwright eslint-plugin-boundaries supabase prettier
npx playwright install --with-deps chromium
```
Mueve `fonts/` → `public/fonts/` (o `src/app/fonts/` para next/font), `page_style/assets/` → `public/assets/`. `page_style/` queda como referencia de marca.

## Paso 2. next.config y scripts
- `next.config.ts` como en ARQUITECTURA.
- Scripts: `dev`, `build`, `start` (sirve `out/` con `npx serve out`), `lint`, `typecheck`, `test`, `test:watch`, `e2e`, `db:types`, `mapa` (regenera la geometría).
- `.env.example` (sin valores reales): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (clave pública/publishable; nunca la service role en el front), `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_READ_TOKEN` (solo build, si el dataset es privado), `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_FUNCION_PEDIDO_URL`, `GITHUB_PAGES`.

## Paso 3. Geometría del mapa
- Adapta `tools/build_mapa.py` para que, además de lo actual, emita `src/data/mapa-santander.json` (viewBox, proyección, municipios con `divipola` si el GeoJSON lo trae, bordes de provincia, contorno, centros y bbox por provincia). La tabla municipio→provincia deja de vivir en el script: se lee de `supabase/seed/municipios.csv`.
- Verifica que el JSON reproduzca exactamente el mapa de la v1 (compara conteo de municipios y bbox).

## Paso 4. Supabase: esquema, seguridad y datos
```bash
npx supabase init
npx supabase start                      # requiere Docker
npx supabase migration new catalogo
npx supabase migration new pedidos
npx supabase migration new rls
```
Contenido mínimo de las migraciones (ajusta tipos y nombres, pero conserva la intención):
```sql
-- catalogo
create type proceso_cafe as enum ('lavado','honey','natural','fermentacion_controlada');
create type tueste_cafe  as enum ('claro','medio_claro','medio','medio_oscuro','oscuro');
create type molienda     as enum ('grano','molido');
create type perfil_taza  as enum ('chocolate','frutal','floral','caramelo','citrico','especiado','panela','nueces');

create table provincias (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, nombre text not null, nombre_corto text not null,
  color_hex text not null check (color_hex ~ '^#[0-9a-fA-F]{6}$'),
  descripcion text, orden int not null
);
create table municipios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique, slug text unique not null, divipola text unique,
  provincia_id uuid references provincias(id),        -- null = por verificar (Tona)
  por_verificar boolean not null default false
);
create table productores (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, nombre text not null,
  tipo text not null check (tipo in ('finca','productor','marca_aliada')),
  municipio_id uuid references municipios(id), activo boolean default true
);
create table cafes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, nombre text not null,
  municipio_id uuid not null references municipios(id),
  productor_id uuid references productores(id),
  altura_msnm int check (altura_msnm between 0 and 4000),
  variedades text[] not null default '{}',
  proceso proceso_cafe not null, proceso_detalle text,   -- conserva "Lavado tradicional", etc. hasta que se decida
  tueste tueste_cafe not null,
  notas_cata text[] not null default '{}', perfiles perfil_taza[] not null default '{}',
  puntaje_sca numeric(4,2) check (puntaje_sca between 0 and 100),
  puntaje_verificado boolean not null default false, puntaje_fuente text, puntaje_fecha date,
  registro_sanitario text,                             -- INVIMA; TODO(dato)
  moliendas molienda[] not null default '{grano,molido}',
  destacado boolean default false, activo boolean default true, orden int default 0,
  creado_en timestamptz default now(), actualizado_en timestamptz default now()
);
create table presentaciones (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references cafes(id) on delete cascade,
  gramos int not null check (gramos in (250,500)),
  precio_cop int not null check (precio_cop > 0),
  disponible boolean not null default true, stock int,
  unique (cafe_id, gramos)
);
create table config_tienda (clave text primary key, valor jsonb not null);
-- whatsapp, ciudad_despacho, nota_envio, formas_pago, max_cantidad, politica_datos_version

create view catalogo_publico as  -- lo que lee el front; solo activos
select c.*, m.nombre municipio, m.slug municipio_slug, p.slug provincia_slug, p.nombre provincia,
       (select jsonb_agg(jsonb_build_object('gramos',pr.gramos,'precio_cop',pr.precio_cop,'disponible',pr.disponible) order by pr.gramos)
          from presentaciones pr where pr.cafe_id = c.id) presentaciones
from cafes c join municipios m on m.id = c.municipio_id left join provincias p on p.id = m.provincia_id
where c.activo;

-- pedidos
create type estado_pedido as enum ('pendiente_whatsapp','confirmado','pagado','despachado','entregado','cancelado');
create sequence pedido_consecutivo;
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  numero text unique not null default ('DS-' || to_char(now() at time zone 'America/Bogota','YYYY') || '-' || lpad(nextval('pedido_consecutivo')::text, 6, '0')),
  creado_en timestamptz not null default now(),
  estado estado_pedido not null default 'pendiente_whatsapp',
  nombre text not null, celular text not null check (celular ~ '^3\d{9}$'),
  cedula text, correo text,
  departamento text not null, municipio text not null, direccion text not null, barrio text, indicaciones text,
  forma_pago text not null, subtotal_cop int not null, envio_cop int,      -- envío null = por confirmar
  autorizacion_datos_en timestamptz not null, politica_datos_version text not null,
  acepta_terminos_en timestamptz not null,
  origen text default 'web', user_agent text
);
create table pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  cafe_id uuid not null references cafes(id), cafe_nombre text not null, provincia text,
  gramos int not null, molienda molienda not null,
  cantidad int not null check (cantidad between 1 and 20),
  precio_unitario_cop int not null, total_cop int not null
);
create or replace function registrar_pedido(p_pedido jsonb, p_items jsonb) returns pedidos
language plpgsql security definer set search_path = public as $$ … $$;  -- inserta pedido + items en una transacción; solo service_role puede ejecutarla

-- rls
alter table provincias, municipios, productores, cafes, presentaciones, config_tienda, pedidos, pedido_items enable row level security;  -- (una sentencia por tabla)
-- lectura anónima SOLO del catálogo activo y de config_tienda pública; pedidos y pedido_items sin ninguna política para anon/authenticated
revoke execute on function registrar_pedido from anon, authenticated;
```
- `supabase/seed.sql` generado desde `legacy/js/data.js`: 7 provincias con sus colores y descripciones (las "por completar" quedan null), 86 municipios + Tona con `por_verificar = true`, los 5 cafés, sus presentaciones y `config_tienda` (WhatsApp 573001129874, Bucaramanga, nota de envío, formas de pago "Efectivo contraentrega" y "Transferencia Bre-B", max 20). Escribe un script `tools/seed-desde-v1.ts` que lo genere, en vez de copiarlo a mano.
- Mapeo de la v1: `proceso` "Lavado …" → `lavado` + `proceso_detalle` con el texto original; `tueste` a su enum; `puntaje_cata` → `puntaje_sca` con `puntaje_verificado = false` (los datos no están verificados según PRODUCT.md).
- `npm run db:types`. Pruebas SQL con `supabase test db` (pgTAP) para: anon no lee pedidos, anon no ejecuta `registrar_pedido`, cantidad > 20 falla, numeración consecutiva.

## Paso 5. Edge Function `crear-pedido`
```bash
npx supabase functions new crear-pedido
```
- Entrada (zod): `{ items: [{ cafeSlug, gramos, molienda, cantidad }], envio: { nombre, celular, cedula?, correo?, departamento, municipio, direccion, barrio?, indicaciones? }, formaPago, autorizacionDatos: true, aceptaTerminos: true, politicaVersion, turnstileToken }`.
- Pasos: CORS solo para el dominio de GitHub Pages y `localhost` → verifica Turnstile → carga presentaciones vigentes (rechaza agotados o moliendas no ofrecidas, con mensaje por línea) → recalcula precios y totales en servidor (ignora cualquier precio del cliente) → `registrar_pedido` con service role → responde `{ numero, lineas, subtotal_cop, envio: 'por_confirmar', whatsapp }`.
- Límite: máximo 20 bolsas por línea, 30 líneas, cuerpo ≤ 10 KB; respuesta 429 si una IP crea más de 5 pedidos en 10 minutos (tabla auxiliar o KV).
- Pruebas con `deno test` y prueba local con `npx supabase functions serve`.
- Despliegue y secretos (`supabase secrets set TURNSTILE_SECRET=…`) SOLO con mi confirmación.

## Paso 6. Sanity Studio
```bash
npm create sanity@latest -- --template clean --typescript --output-path studio --dataset production
# el login (sanity login) lo hago yo; detente y avísame cuando lo necesites
```
Schemas: `cafeContenido` (slug que debe existir en Supabase, historia en Portable Text, galería con alt obligatorio y crédito de foto), `provinciaContenido` (slug, historia, cifras: `{valor, contexto, fuente, fecha}` con fuente y fecha obligatorias, foto), `productorContenido`, `paginaInicio`, `paginaHistoria`, `paginaLegal` (términos, privacidad, envíos y devoluciones, información del vendedor), `ajustesSitio`. Validaciones de marca en el Studio: advertir si un texto contiene "gourmet", "premium", "exótico", "mágico", "el mejor" o "Café de Santander"; exigir ® en "Castillo" la primera vez.
Consultas GROQ tipadas (`sanity typegen`). El build no falla si Sanity está vacío: usa los textos de la v1 como respaldo.

## Paso 7. Rutas (MAPA DEL SITIO)
```
app/
  layout.tsx                    # fuentes, metadatos, header, franja de marca, footer, proveedor de carrito
  page.tsx                      # Inicio (orden en la sección UI)
  cafes/page.tsx                # catálogo completo con filtros (misma vista que en inicio, a pantalla completa)
  cafes/[slug]/page.tsx         # ficha (generateStaticParams)
  provincias/[slug]/page.tsx    # provincia: historia, municipios, cifras con fuente, sus cafés (catálogo pre-filtrado)
  productores/[slug]/page.tsx   # solo si hay productores con datos
  pedido/page.tsx               # carrito → envío → resumen → confirmación (pasos en una sola ruta, con ?paso=)
  legal/[slug]/page.tsx
  not-found.tsx
```
`sitemap.ts` y `robots.ts` estáticos; metadatos Open Graph por café y provincia; JSON-LD `Product` con `offers` en COP y sin `aggregateRating` (no hay reseñas).

# UI/UX

## Orden de la página de inicio (el mapa baja)
1. Portada (tema monte): titular Fraunces con remate en itálica, una línea de bajada, CTA "Ver cafés" (oro con texto carbón sobre oscuro), franja de marca.
2. **Catálogo con filtros** (pergamino): barra de filtros + resultados. Las provincias aparecen como chips de selección múltiple al principio de la barra.
3. **Mapa "Explora por provincia"**: sección propia debajo del catálogo, con tramas topo según la marca.
4. "Cómo pedir" (tres pasos).
5. Historia / origen (tema oscuro, cita de caficultor solo si existe una real).
6. Footer con contacto, envío, pagos, enlaces legales e información del vendedor.

## Mapa interactivo de provincias (`ui/componentes/mapa/`)
- SVG desde `src/data/mapa-santander.json`; cada provincia es un `<g>` con sus municipios rellenos con `provincias.color_hex` (familias arcilla, neutro, oro, tierra, verde). Límites municipales en filete fino y bordes de provincia más marcados.
- Provincias sin cafés: atenuadas, no seleccionables, con la etiqueta "Próximamente". Tona: rayado "por verificar", como en la v1.
- **Hover (puntero fino) / tap (táctil):** tarjeta flotante (Floating UI, `flip` + `shift`, siempre dentro del viewport) con nombre, descripción corta (si no es null), número de cafés disponibles ("3 cafés"), los dos primeros nombres y el botón "Ver cafés de Guanentá" (lleva al catálogo con scroll suave y foco en el contador de resultados). En celular la tarjeta es una hoja inferior, no un tooltip.
- **Clic / Enter / Espacio:** alterna la provincia en el filtro (selección múltiple, igual que los chips). Cada provincia es `role="button"` con `tabindex="0"`, `aria-pressed` y `aria-label="Provincia de Guanentá, 2 cafés"`; Esc cierra la tarjeta.
- **Sincronización bidireccional:** el mapa NO tiene estado propio de selección. Lee y escribe a través de `useFiltrosCatalogo` (la URL es la única fuente de verdad). Seleccionar en chips → se resalta en el mapa; seleccionar en el mapa → cambian chips, municipios y resultados. Pruébalo en e2e en ambos sentidos.
- Encuadre: el `viewBox` se anima a la caja que une las provincias seleccionadas ("Ver todo Santander" vuelve al departamento); instantáneo con `prefers-reduced-motion`.
- Pines por municipio con café (como la v1), con etiquetas que no se solapan (porta la lógica de `placeOverlay`).
- Mini mapa reutilizable para la ficha (`MapaMunicipio`).

## Filtros (`useFiltrosCatalogo` + `domain/catalogo/filtros.ts`)
| Filtro | Control | Regla |
|---|---|---|
| Provincia | chips múltiples + mapa | principal; parámetro `provincia=guanenta,comunera` (acepta el formato v1 `?provincia=guanenta`) |
| Municipio | lista múltiple dependiente | solo municipios de las provincias elegidas que tengan cafés; al quitar una provincia se descartan sus municipios |
| Productor / finca | lista múltiple | **oculto mientras haya menos de 2 productores con datos** (ver INCONSISTENCIAS) |
| Proceso | chips | Lavado, Honey, Natural, Fermentación controlada |
| Variedad | lista múltiple | Castillo®, Caturra, Colombia, Geisha, Bourbon y las que existan en datos |
| Tueste | chips | Claro (claro + medio_claro), Medio, Oscuro (medio_oscuro + oscuro) |
| Perfil de taza | chips | familias derivadas de `notas_cata` con la tabla de `perfiles.ts` |
| Altitud | rango doble (Radix Slider) | límites = mín/máx del catálogo, pasos de 50 msnm |
| Puntaje SCA | opción única | ≥ 80 / ≥ 84 / ≥ 86; solo considera cafés con `puntaje_verificado = true`; si ninguno lo está, el filtro se oculta |
| Precio | rango doble | sobre el precio "desde" (presentación más barata), en COP con formato $25.000 |
| Disponibilidad | interruptor "Solo en stock" | usa `useDisponibilidad` (dato vivo) |
Además: orden (catálogo agrupado por provincia, puntaje SCA, precio ↑, precio ↓, altitud), contador "4 cafés en Guanentá", "Limpiar filtros", y chips de filtros activos removibles.
- Facetas con conteo por opción calculado excluyendo su propia dimensión; opciones con 0 se muestran deshabilitadas.
- Filtros dentro de una dimensión = O; entre dimensiones = Y.
- URL: `parseFiltros`/`serializarFiltros` puros, con pruebas; `router.replace` sin scroll; valores desconocidos se ignoran (como la v1).
- Celular: botón fijo "Filtros (3)" que abre una hoja con el botón "Ver 4 cafés".
- Estado vacío útil: "No hay cafés con esos filtros" + quitar el último filtro.

## Tarjeta y ficha de café
- Tarjeta según `page_style/components/ProductCard`: foto 3:4 o bolsa ilustrada si no hay foto, pastilla de provincia, sello SCA (solo si está verificado y ≥ 80), antetítulo de origen en terracota, nombre en Fraunces, notas en itálica, tueste con barra corta, datos técnicos en gris con punto medio, precio "desde", botón "Agregar" verde bosque.
- Ficha: mini mapa con coordenadas, perfil de taza, sello SCA con explicación de la escala, datos técnicos con glosario, historia (Sanity), productor, registro sanitario cuando exista, y bloque de compra fijo: **Molienda** (Grano / Molido, como radios con aspecto de píldora) + **Presentación** (250 g / 500 g con su precio) + cantidad + "Agregar al pedido". El precio se actualiza con la selección; agotado = deshabilitado con "Agotado".

## Carrito y checkout (`/pedido`)
- `useCarrito` sobre el reducer puro; persistencia en localStorage (`desantander.carrito.v2`) con migración desde `v1`, sincronización entre pestañas (`storage` event), máximo 20 por línea, deshacer al eliminar. Cajón lateral en escritorio + barra inferior móvil "Tu pedido · N bolsas · $…".
- Pasos: **1. Carrito** → **2. Envío** (nombre, celular colombiano, cédula opcional, correo opcional, departamento y municipio de Colombia —lista DIVIPOLA en JSON local—, dirección, barrio, indicaciones, forma de pago) → **3. Resumen** (líneas, subtotal, "El envío se confirma por WhatsApp", casilla de términos y casilla de autorización de datos, ambas sin marcar por defecto, con enlace a las políticas) → **4. Confirmación**.
- El botón "Finalizar compra" llama a `crear-pedido`. **No abras WhatsApp con `window.open` después del `await`: los navegadores lo bloquean.** Al responder, muestra el panel "Tu pedido DS-2026-000123 está listo" con un enlace `<a href="https://wa.me/…">Abrir WhatsApp</a>` (gesto del usuario), "Copiar mensaje", "Editar pedido" y "Vaciar pedido", como la v1.
- Si la función falla o no hay red: permite enviar igual por WhatsApp con el aviso "No pudimos registrar el pedido en la tienda; tu mensaje llega igual", sin número, y registra el error en consola.
- El mensaje se construye con `construirMensaje` usando SOLO los datos devueltos por el servidor. Plantilla:
```
¡Hola, De Santander! Quiero finalizar mi pedido N.° DS-2026-000123

• Café Barichara (Guanentá) — Grano — 500 g × 2 = $100.000
• Café Oiba (Comunera) — Molido — 250 g × 1 = $25.000

Subtotal: $125.000
Envío: por confirmar según la ciudad

Envío a:
Nombre: …
Celular: …
Ciudad: Bucaramanga, Santander
Dirección: … · Barrio: …
Indicaciones: …
Forma de pago: Transferencia Bre-B
```
- Mantén el texto por debajo de 2.000 caracteres; si se pasa, resume las indicaciones y avisa.
- El estado `pendiente_whatsapp` refleja la regla de PRODUCT.md: el pedido se cierra cuando el cliente envía el mensaje.

# CUMPLIMIENTO (no negociable; textos legales los redacta el cliente)
- Ley 1581 de 2012 y Decreto 1377 de 2013: autorización previa, expresa e informada, casilla sin marcar, enlace a la política, guardar fecha/hora y versión de la política. La política debe mencionar que los datos pasan por WhatsApp (Meta) y se alojan en Supabase fuera de Colombia (transferencia internacional): elige la región de Supabase más cercana (`sa-east-1`) y deja el punto en PENDIENTES.
- Ley 1480 de 2011 (comercio electrónico): visibles en el footer y en el resumen la razón social, el NIT, el domicilio y el contacto del vendedor (`TODO(dato)` hasta que los dé), el precio total con impuestos, que el envío se confirma antes del pago, y el enlace a envíos, devoluciones y retracto.
- Marca: nunca "Café de Santander" como nombre o titular; nada de "premium" o "gourmet" en la interfaz (el proceso "Lavado premium" de la v1 se muestra como "Lavado" mientras se decide); toda cifra lleva fuente y fecha.
- Notificación sanitaria INVIMA por café (`nsa`, con titular y fabricante): se muestra solo cuando exista; un café activo sin `nsa` solo genera aviso en `npm run datos` (decisión del dueño, 2026-11-06).
- Sin datos personales en analítica ni en la URL. La URL de `wa.me` sí lleva el mensaje: es aceptable porque la abre el propio cliente.

# CI/CD — GitHub Pages
`.github/workflows/deploy.yml`:
- Disparadores: `push` a `main` y `v2-nextjs` (este último a un entorno de preview si se configura), `workflow_dispatch`, `repository_dispatch: types: [contenido-publicado]`.
- Trabajos: `npm ci` → `lint` → `typecheck` → `test` → `build` con `GITHUB_PAGES=true` y secretos de Actions (solo las claves públicas y el token de lectura de Sanity) → `touch out/.nojekyll` → `actions/upload-pages-artifact` (`path: out`) → `actions/deploy-pages`. Permisos `pages: write`, `id-token: write`.
- Un segundo workflow `ci.yml` para PR: lint, typecheck, test, e2e (Playwright contra `out/` servido con `npx serve`).
- Instrucciones en `docs/DEPLOY.md` para: activar Pages con "GitHub Actions" como fuente, crear los secretos y configurar el webhook de Sanity (POST a `https://api.github.com/repos/<owner>/<repo>/dispatches` con un token fine-grained de permisos mínimos guardado en Sanity, nunca en el repo).

# CALIDAD Y PRUEBAS
- Vitest (cobertura ≥ 90 % en `domain/`): filtros y facetas, parse/serialize de URL (incluye compatibilidad v1), perfiles, reducer del carrito (fusión, deshacer, máximo 20), totales, mensaje de WhatsApp (snapshot), migración del carrito v1→v2, validación del envío.
- Playwright: (1) filtrar por provincia en chips → el mapa la resalta; (2) clic en provincia del mapa → chips y resultados cambian; (3) URL compartida reproduce los filtros; (4) ficha → Molido + 500 g → carrito → envío → resumen → confirmación con número (función simulada con `page.route`) → `href` de WhatsApp contiene número, líneas y dirección; (5) recarga conserva el carrito; (6) teclado completo y axe sin violaciones serias en inicio, ficha y pedido; (7) viewport 360 × 740.
- Lighthouse en móvil: Performance ≥ 90, Accesibilidad ≥ 95, SEO ≥ 95. JS inicial de inicio ≤ 150 KB gzip (el mapa puede cargarse con `dynamic()` cuando su sección se acerca al viewport).
- Ejecuta la revisión de acabado de la skill `impeccable` (audit/polish) sobre inicio, ficha y pedido antes de cerrar la fase de UI.

# INCONSISTENCIAS CONOCIDAS (confírmalas en la FASE 0 y pregúntame)
1. **Filtro por marca vs. PRODUCT.md:** PRODUCT.md (modelo C, 2026-11-06) dice que De Santander es una tienda que vende café de otras marcas y que el filtro por marca se decidirá cuando haya al menos dos marcas con datos (P17). Propuesta: filtro "Productor / finca", oculto hasta que haya datos (hoy `finca` está vacío en los 5 cafés).
2. **Procesos:** "Lavado tradicional / controlado / premium / especial": ¿son distintos? Mientras tanto, todos van a `lavado` con `proceso_detalle`.
3. **Tueste:** la v1 tiene 5 niveles y el filtro pedido tiene 3; propuesta de agrupación en la tabla de filtros.
4. **Puntajes SCA (86–91) sin verificar:** el sello y el filtro solo se muestran con `puntaje_verificado = true`. ¿Hay soporte (fuente y fecha) para alguno?
5. **Tona:** ¿Metropolitana o Soto?
6. **Descripciones faltantes:** Metropolitana, Soto, Vélez y Yariguíes.
7. **Grado de molienda:** ¿"Molido" único, o espresso / filtrado / prensa francesa?
8. **Surface brief de impeccable** desactualizado frente a la marca v4.1.
9. **Datos legales del vendedor** (razón social, NIT, domicilio) y políticas: no existen en el repo.
10. **Envío:** hoy solo se pide la ciudad; la v2 pide dirección completa. Confirmar campos obligatorios.

# DEFINICIÓN DE TERMINADO
- `npm run lint && npm run typecheck && npm test && npm run build && npm run e2e` en verde.
- Matriz de paridad de `docs/INVENTARIO-V1.md` completa, sin funciones perdidas.
- `docs/PENDIENTES.md` con todos los `TODO(dato)`; `docs/DEPLOY.md`; `CLAUDE.md` nuevo; `PRODUCT.md` actualizado.
- Al final de cada fase: resumen de 5 líneas, qué quedó pendiente y la siguiente fase. Espera mi "sigue" antes de continuar.
~~~~
