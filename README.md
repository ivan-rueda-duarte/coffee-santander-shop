# De Santander · tienda de café de origen

Tienda web de **De Santander**, café de especialidad de marca propia de las provincias de Santander, Colombia. El visitante explora el catálogo por provincia (en filtros o en un mapa interactivo), abre la ficha de un café, elige molienda y presentación, arma su pedido y lo envía por WhatsApp con todos los datos de envío ya escritos. La interfaz va en español de Colombia.

Es un sitio estático (Next.js, `output: 'export'`) pensado para GitHub Pages: no hay servidor ni base de datos. El pedido nace cuando la persona envía el mensaje desde WhatsApp.

## Para quien edita datos

- **Precios, cafés, disponibilidad, provincias y configuración** viven en los CSV de [`data/`](data/). Guía: [data/LEEME.md](data/LEEME.md).
- **Historias, fotos y textos** viven en Sanity. Guía: [docs/SANITY.md](docs/SANITY.md).
- **Publicar** los cambios: [docs/DEPLOY.md](docs/DEPLOY.md).
- Lo que falta por confirmar con el negocio (datos legales, puntajes, fincas…): [docs/PENDIENTES.md](docs/PENDIENTES.md).

## Para quien desarrolla

```bash
npm install
npm run dev        # http://localhost:3000
npm run datos      # valida los CSV (y Sanity, si está configurado)
npm run lint && npm run typecheck && npm test
npm run build      # genera el sitio estático en out/ (valida los datos antes)
npm start          # sirve out/ como lo verá GitHub Pages
npm run e2e        # Playwright contra out/ (construye el sitio)
```

Requiere Node 22. La primera vez que corras `npm run e2e`: `npx playwright install chromium`.

### Estructura

```
data/                 CSV de comercio (fuente de verdad)
src/domain/           reglas del negocio en TypeScript puro (catálogo, filtros, URL, carrito, mensaje de WhatsApp…)
src/application/      casos de uso y puertos (CatalogoRepositorio, ContenidoRepositorio, CarritoAlmacen)
src/infrastructure/   lector de CSV, cliente de Sanity, carrito en localStorage
src/ui/               componentes (marca, catálogo, mapa, ficha, carrito, checkout) y hooks
src/app/              rutas de Next.js y ensamblado de las capas
src/styles/           tokens de marca v4.1, componentes y tramas
studio/               Sanity Studio (paquete aparte)
tools/                scripts: validar datos, mapa (DANE), municipios de Colombia, siembra desde la v1
e2e/                  pruebas de Playwright (catálogo, mapa, pedido, accesibilidad, celular)
legacy/               la v1 estática, para comparar paridad
docs/                 marca, inventario y plan, Sanity, despliegue, pendientes
```

Las capas se hacen cumplir con ESLint: `domain` no importa nada de fuera; `application` solo importa `domain`; `ui` no importa `infrastructure`.

### Rutas

`/` inicio (portada, catálogo con filtros, mapa, cómo pedir, historia) · `/cafes/` catálogo · `/cafes/<slug>/` ficha · `/provincias/<slug>/` · `/pedido/` carrito → envío → resumen → confirmación · `/legal/<sección>/`.

### Marca

El sistema v4.1 es norma: [docs/marca-v4.1.md](docs/marca-v4.1.md). Reglas que el código hace cumplir: el CTA principal es verde bosque; el sello SCA solo aparece con puntaje verificado y ≥ 80; «Castillo®» lleva ®; los textos editoriales se revisan contra las palabras vetadas en el Studio.

### Datos y privacidad

El pedido no se guarda en ningún servidor. El carrito (cafés, tamaños, cantidades y forma de pago) se guarda solo en el navegador; los datos de envío viven en memoria hasta que la persona abre WhatsApp. No hay analítica.
