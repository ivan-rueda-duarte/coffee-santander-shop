Dos tramas que dan profundidad a los fondos planos: **curvas de nivel** del cañón del Chicamocha (`ds-topo`) y **grano de papel artesanal** (`ds-grano`). Las curvas son isolíneas de un único relieve (una cordillera diagonal y tres cerros, 26 niveles de altura), así que **nunca se cruzan ni se tocan**, como en una carta topográfica del IGAC; si se dibujan a mano o en otra herramienta, debe conservarse esa regla. Ambas son utilidades: se añaden a cualquier contenedor con `position` propia y no cambian el color del fondo ni el contraste del texto.

| Clase | Fondo | Trazo / opacidad | Token |
|---|---|---|---|
| `ds-topo` | pergamino-50, crema-50, menta-50, niebla-100 | tostado al 7,5 % | `topo-stroke-light` |
| `ds-topo--oscuro` | monte-900, monte-800, tostado-900 | pergamino al 8,5 % | `topo-stroke-dark` |
| `ds-topo--tierra` | arenisca-200 | sombra de risco al 11 % | `topo-stroke-tierra` |
| `ds-topo--arcilla` | arcilla-50 | terracota al 10 % | `topo-stroke-arcilla` |
| `ds-grano` | cualquiera | multiplicar al 7 % (claro) · pantalla al 5 % (oscuro) | `grain-opacity`, `grain-opacity-dark` |

**Reglas**
- Las curvas de nivel van en portadas, tarjetas de región, banners, bloques de cita y empaques; **no** en zonas de texto corrido ni detrás de tablas. El grano puede ir en cualquier fondo.
- Una sola trama topográfica por pieza; nunca dos contenedores vecinos con curvas.
- El trazo se mantiene entre 7 % y 11 % de opacidad: debe sentirse, no leerse. Si una curva atraviesa un titular y distrae, se desplaza el contenedor con `background-position`, no se sube la opacidad.
- A 1080 px el trazo pasa a 2 px (`topo-stroke-width` ×1,5).
- Los SVG fuente están en `assets/Tramas/` para usarlos en Canva, Illustrator o empaque; en web viven incrustados en `bundle.css`.