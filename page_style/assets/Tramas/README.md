SVG fuente de las tramas de la v4.1, para usarlas fuera de la web (Canva, Illustrator, empaque, impresión).

- `topo-claro.svg`, `topo-oscuro.svg`, `topo-tierra.svg`, `topo-arcilla.svg` — curvas de nivel generadas como isolíneas de un único campo de alturas (una cordillera y tres cerros, 26 niveles): por construcción nunca se cruzan, como en un mapa topográfico real, con el trazo ya en el color y la opacidad del token correspondiente (`topo-stroke-*`). Se colocan a sangre, recortadas por el contenedor, con `preserveAspectRatio` en modo cubrir; en impresión el trazo se lleva a 0,3 pt.
- `grano.svg` — ruido fractal monocromo de 240 × 240 px para el grano de papel; se repite en mosaico y se aplica en multiplicar al 7 % (claro) o pantalla al 5 % (oscuro).

En web no hace falta cargarlos: viven incrustados en `components/bundle.css` como `ds-topo` y `ds-grano`.