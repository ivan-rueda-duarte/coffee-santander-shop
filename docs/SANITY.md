# Sanity: contenido editorial

Sanity guarda lo que se escribe y se fotografía: historia de cada café, provincia y productor, fotos, textos de inicio y páginas legales. Lo comercial (precios, altitud, puntaje, disponibilidad) vive en los CSV de `data/`. Los dos lados se enlazan por `slug`.

## Primera vez (lo hace el cliente)

Estos pasos crean cosas en un servicio externo; el código del repositorio no los ejecuta.

1. Crear una cuenta en <https://www.sanity.io> y, desde `studio/`, ejecutar `npx sanity login` y `npx sanity init --env` (elige "Crear proyecto nuevo", dataset `production`; **no** crees un esquema nuevo, ya existe en `studio/schemaTypes/`). Eso deja `SANITY_STUDIO_PROJECT_ID` en `studio/.env`.
2. Copiar el ID del proyecto a `.env.local` en la raíz como `NEXT_PUBLIC_SANITY_PROJECT_ID` (y `NEXT_PUBLIC_SANITY_DATASET`, normalmente `production`). Si el dataset es privado, crear un token de lectura y guardarlo como `SANITY_READ_TOKEN` (solo para el build, nunca en el repositorio).
3. Ejecutar `npm run dev` dentro de `studio/` para editar en local, o `npx sanity deploy` para publicar el Studio.

## Qué se edita

| Documento | Para qué |
|---|---|
| Cafés, Provincias, Productores | Historia, fotos y cifras. El `slug` debe ser idéntico al de la fila del CSV. |
| Página de inicio, Historia, Ajustes | Textos y fotos de esas secciones (documentos únicos). |
| Páginas legales | Términos, privacidad, envíos y devoluciones, información del vendedor (el texto lo redacta el cliente). |

Reglas que el Studio avisa al escribir (advertencia, no bloquea): no usar «gourmet», «premium», «exótico», «mágico», «el mejor» ni «Café de Santander»; escribir «Castillo®» con ® la primera vez. Las fotos exigen texto alternativo y crédito; las cifras, fuente y fecha.

## Cómo llega al sitio

- `npm run datos` y el build comprueban que cada slug de Sanity exista en los CSV y fallan con un mensaje claro si no.
- Si Sanity no está configurado o está vacío, el sitio se construye igual, solo con los datos técnicos. No se usan los textos de historia de la v1 como respaldo (ver `docs/INVENTARIO-V1.md`, punto 24).
- Una foto sin texto alternativo o sin crédito, o una cifra sin fuente o fecha, se omite del sitio y se avisa en la consola del build.
- Al publicar en Sanity hay que reconstruir el sitio. El webhook que lo hace solo (Sanity → GitHub `repository_dispatch`) se configura en la fase de despliegue (`docs/DEPLOY.md`).
