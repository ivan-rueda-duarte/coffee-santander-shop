# Despliegue a GitHub Pages

El sitio es estático: `npm run build` genera la carpeta `out/` y GitHub Pages la sirve tal cual. No hay servidor ni base de datos.

## Cómo se actualiza el sitio

| Qué cambia | Qué hacer |
|---|---|
| Precios, disponibilidad, cafés, provincias, configuración (`data/*.csv`) | Editar el CSV, correr `npm run datos`, hacer commit y push a `main`. El workflow publica solo. |
| Historias, fotos y textos (Sanity) | Publicar en el Studio. El webhook (más abajo) dispara el despliegue. |
| Código o diseño | Pull request: `ci.yml` corre lint, tipos, pruebas y e2e. Al unir a `main`, `deploy.yml` publica. |

Un cambio de precio o de disponibilidad no se ve hasta que termine el despliegue (unos 2 a 3 minutos).

## Primera vez

Estos pasos se hacen en GitHub; el código del repositorio no los ejecuta.

1. **Activar Pages.** En el repositorio: *Settings → Pages → Build and deployment → Source: GitHub Actions*.
2. **Variables** (*Settings → Secrets and variables → Actions → Variables*):
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`: ID del proyecto de Sanity (ver `docs/SANITY.md`). Sin él, el sitio se construye solo con los datos técnicos.
   - `NEXT_PUBLIC_SANITY_DATASET`: normalmente `production`.
   - `URL_SITIO` *(opcional)*: URL pública si tienes dominio propio. Por defecto es `https://<usuario>.github.io/<repositorio>`.
   - `DOMINIO_PROPIO` *(opcional)*: pon `true` si el sitio vive en la raíz de un dominio propio (sin `/<repositorio>` en la ruta).
3. **Secretos** (misma página, pestaña *Secrets*):
   - `SANITY_READ_TOKEN`: token de solo lectura, solo si el dataset de Sanity es privado.
   No pongas aquí claves de escritura ni ningún dato personal.
4. **Primer despliegue:** *Actions → Desplegar a GitHub Pages → Run workflow*.

`deploy.yml` y `ci.yml` deben llegar a `main` antes de que el webhook funcione: los eventos `repository_dispatch` solo ejecutan los workflows de la rama por defecto.

## Rama de pruebas

GitHub Pages publica un único sitio por repositorio, así que **no hay vista previa por rama**: `v2-nextjs` solo pasa por `ci.yml`. Para ver la rama antes de unirla:

```bash
npm run build   # genera out/
npm start       # sirve out/ en http://localhost:3000
```

Para probar la ruta con `basePath` como en Pages: `GITHUB_PAGES=true GITHUB_REPOSITORY=usuario/repositorio npm run build`.

## Webhook de Sanity → despliegue automático

Cuando alguien publica en el Studio, Sanity llama a GitHub y este ejecuta `deploy.yml`.

1. **Token de GitHub (fine-grained):** *Settings → Developer settings → Personal access tokens → Fine-grained tokens*. Solo este repositorio; permisos: *Metadata: read* y *Contents: read and write* (lo exige el endpoint de `dispatches`). Ponle una caducidad corta y renuévalo. **No lo guardes en el repositorio**, solo en Sanity.
2. **Webhook en Sanity** (*manage.sanity.io → proyecto → API → Webhooks → Create*):
   - URL: `https://api.github.com/repos/<usuario>/<repositorio>/dispatches`
   - Método: `POST`
   - Dataset: `production`; disparar al *crear, actualizar y eliminar*; sin borradores.
   - Cabeceras HTTP: `Authorization: Bearer <token>`, `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`.
   - Proyección (cuerpo): `{"event_type": "contenido-publicado"}`
3. Publica un cambio de prueba y comprueba en *Actions* que aparece una ejecución con el evento `repository_dispatch`.

## Presupuestos de calidad

Medidos en el sitio exportado (Lighthouse móvil, 4G simulada):

| Métrica | Objetivo | Medido |
|---|---|---|
| Rendimiento | ≥ 90 | 91–92 |
| Accesibilidad | ≥ 95 | 100 |
| SEO | ≥ 95 | 100 (con `NEXT_PUBLIC_SITE_URL` definida) |
| JavaScript inicial de la portada (gzip, navegador moderno) | ≤ 150 KB | 150 KB |

El mapa, la hoja de filtros, el deslizador y el cajón del pedido se descargan al usarlos para mantener el presupuesto. Si se agrega una dependencia al código de todas las páginas, vuelve a medir.

## Si el despliegue falla

- **`npm run datos` falla:** el mensaje dice archivo, línea y columna del CSV, o el slug de Sanity que no existe en los CSV.
- **El sitio carga sin estilos o sin imágenes:** `basePath` mal configurado. En Pages sin dominio propio debe estar `GITHUB_PAGES=true`; con dominio propio, la variable `DOMINIO_PROPIO=true`.
- **El contenido de Sanity no aparece:** revisa que `NEXT_PUBLIC_SANITY_PROJECT_ID` esté definida como *variable* (no como secreto) y que el contenido esté *publicado*, no en borrador.
