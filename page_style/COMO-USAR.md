# Cómo usar De Santander v4.1 en el sitio web

## 1. Copiar la carpeta
Copie esta carpeta completa dentro del proyecto, por ejemplo en `public/de-santander/` (sitio estático, Vite, Next.js con carpeta `public`) o en `src/styles/de-santander/` si el bundler procesa el CSS. Las rutas de las fuentes en `tokens.css` son relativas (`fonts/…`), así que la carpeta debe conservarse junta.

## 2. Enlazar dos hojas de estilo, en este orden
```html
<link rel="stylesheet" href="/de-santander/tokens.css">
<link rel="stylesheet" href="/de-santander/components/bundle.css">
```
`tokens.css` define las variables (`--monte-900`, `--surface`, `--font-display`, `--space-5`, `--radius-lg`, …) y las clases de texto (`.display-l`, `.h2`, `.body`, `.overline`, …); `bundle.css` trae los componentes (`.ds-btn`, `.ds-tag`, `.ds-seal`, `.ds-card`, `.ds-region`, `.ds-banner`, `.ds-franja`, `.ds-topo`, `.ds-grano`, `.ds-photo`, …).

## 3. Activar el tema
Ponga `data-theme="light"` (pergamino) o `data-theme="dark"` (monte) en `<html>`. Todos los tokens semánticos cambian solos.

## 4. Ver ejemplos
- `ejemplo.html`: héroe + tarjeta de producto, listo para abrir en el navegador.
- `components/<Nombre>/preview.html`: cada componente aislado; `components/<Nombre>/README.md` explica sus reglas y qué datos aporta usted.

## 5. Para Claude en Visual Studio Code
Pegue el contenido de `PROMPT.md` como instrucción del proyecto (por ejemplo en `CLAUDE.md` en la raíz del repositorio, o al inicio de la conversación) e indíquele la ruta de esta carpeta. Con eso Claude construirá cada página con los tokens y las clases del sistema en lugar de inventar colores o estilos. `README.md` es el manual completo si necesita el porqué de cada regla.

## 6. Fotografías y tramas
Las fotos están en `assets/Fotografia/` y pasan siempre por `ds-photo`. Los SVG de curvas de nivel y grano están en `assets/Tramas/` por si los necesita fuera de la web; en la web ya van incrustados en `bundle.css`.
