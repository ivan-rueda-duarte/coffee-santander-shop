# De Santander v2: tienda web

Tienda de café de especialidad de Santander, Colombia. La v1 (HTML/CSS/JS sin framework) vive en `legacy/` y es la referencia de paridad: `docs/INVENTARIO-V1.md`. La v2 es Next.js con exportación estática.

@docs/marca-v4.1.md
@PRODUCT.md

## Stack y comandos

Next.js 16 (App Router, `output: 'export'`), TypeScript estricto, Tailwind v4 (config en CSS), Vitest, Playwright. Contenido editorial en Sanity. Datos de comercio en archivos CSV editados a mano.

- `npm run dev`: desarrollo local.
- `npm run build`: genera el sitio estático en `out/`.
- `npm start`: sirve `out/` (equivale a lo que verá GitHub Pages).
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run e2e`.
- `npm run datos`: valida los CSV (columnas, tipos, referencias) y, si Sanity está configurado, que sus slugs existan en los CSV. Corre solo antes de `build`.
- `cd studio && npm run dev`: Sanity Studio local. Guía en `docs/SANITY.md`; no ejecutes `sanity login/init/deploy` sin que lo pidan.
- `npm run mapa -- <geojson>`: regenera `src/data/mapa-santander.json` desde el GeoJSON del DANE (`tools/build_mapa.py`). Las instrucciones para editar los CSV están en `data/LEEME.md`.

Lee `node_modules/next/dist/docs/` antes de usar una API de Next que no conozcas: esta versión cambió respecto a lo que suele recordarse (ver `AGENTS.md`).

## Restricción de hosting: GitHub Pages es solo estático

- No hay API Routes, Server Actions, middleware, ISR ni `next/image` optimizado. No actives `cacheComponents` (exige runtime Node).
- `next.config.ts`: `output: 'export'`, `trailingSlash`, `images.unoptimized`. El `basePath` solo se aplica con `GITHUB_PAGES=true`. Para rutas de `public/` usa el helper `asset()`.
- Los Server Components corren en el build. Rutas dinámicas: `generateStaticParams` y `dynamicParams = false`.
- Todo `useSearchParams` va dentro de `<Suspense>`.
- `sitemap.ts` y `robots.ts` llevan `export const dynamic = 'force-static'`.
- No hay base de datos ni función de servidor: el pedido sale directo por WhatsApp (enlace `wa.me`). No guardes pedidos ni datos personales en ningún servicio.

## Dónde vive cada dato

- **CSV en `data/` (comercio, fuente de verdad):** provincias, municipios, cafés, presentaciones y precios, disponibilidad, configuración de la tienda (WhatsApp, ciudad de despacho, formas de pago, máximo por línea). Se editan a mano; el build los valida y falla con un mensaje claro si algo no cuadra.
- **Sanity (editorial):** historia de cada café y provincia, fotos, textos de inicio, "Cómo pedir", "Historia" y páginas legales. Se enlaza con los CSV por `slug`.
- Si un campo existe en ambos lados, gana el CSV y el build falla si el `slug` no coincide.
- Cambiar un CSV exige reconstruir y desplegar el sitio.

## Arquitectura (capas)

```
src/domain/          TS puro: catálogo (filtros, url, perfiles), pedido (carrito, totales, mensaje WhatsApp, envío), común (dinero COP, slug)
src/application/     puertos (CatalogoRepositorio, ContenidoRepositorio, CarritoAlmacen) y casos de uso
src/infrastructure/  lector de CSV, cliente Sanity, carrito en localStorage
src/ui/              componentes (marca, catalogo, mapa, ficha, carrito, checkout, layout) y hooks
src/app/             rutas
data/                CSV de comercio
tools/               scripts (mapa, validación de datos)
studio/              Sanity Studio
```

- `domain` no importa nada de fuera de `domain`; `application` solo importa `domain`; `ui` no importa `infrastructure`. ESLint lo hace cumplir (`no-restricted-imports`).
- Server Components por defecto. `'use client'` solo en explorador de catálogo, mapa, selector de presentación/molienda, carrito, formularios y diálogos.
- La URL es la única fuente de verdad de los filtros. El mapa no tiene estado propio.
- TypeScript `strict`, sin `any`.

## Marca y diseño

- La marca v4.1 es norma (ver `docs/marca-v4.1.md`). Tokens en `src/styles/marca.css`; nombres de Tailwind iguales a los de la marca (`bg-monte-900`, `text-chicamocha-600`).
- CTA principal en verde bosque. Terracota solo para origen y tueste. Oro y grana nunca como texto sobre claro.
- Sello SCA solo con puntaje real verificado y ≥ 80.
- Contraste ≥ 4,5:1, verificado con axe. Respeta `prefers-reduced-motion`.
- Para trabajo de interfaz usa la skill `impeccable`; la skill `last30days` no aplica.

## No inventar datos

Nunca inventes NIT, razón social, fincas, puntajes, registros INVIMA, textos legales, fotos ni testimonios. Si falta un dato, déjalo como `TODO(dato):` en `docs/PENDIENTES.md` y no lo muestres en la interfaz. Los textos de la v1 sin respaldo (ver `docs/INVENTARIO-V1.md`, punto 24) no se usan como respaldo.

## Reglas de trabajo

- Rama `v2-nextjs`. Commits pequeños por fase, en español (`feat(catalogo): …`).
- Nada que toque servicios remotos (push, despliegue, secretos, Sanity) sin pedir confirmación.
- Si algo contradice el código o los documentos, detente y pregunta.
- Al cerrar cada fase: resumen de 5 líneas, qué quedó pendiente y la siguiente fase. Espera "sigue".
