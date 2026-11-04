Vista del **nivel 2** del sistema de etiquetas (clasificación). Las reglas completas de los tres niveles —dato técnico `ds-tag`, clasificación `ds-badge` y sello SCA `ds-seal`— están en el componente **Etiqueta**.

Familias de color y su significado fijo:
- `--region` (monte-900): dato de producción o de área de la familia verde.
- `--accent` (grana-600): solo ediciones limitadas y el dato más importante de una lámina.
- `--gold` (oro-500, texto carbón): cifras de apoyo ("≈10% área").
- `--dark` (tostado-900): categoría o segmento ("Especialidad").
- `--earth` (borde terracota sobre arcilla): notas de tueste y origen destacados; es el único uso de la terracota en pastillas.
- `--soldout`: borde y texto `danger`, siempre con la palabra.
- Retirados en la v4.1: `--process` (ahora `ds-tag--outline`) y `--score` (ahora `ds-seal`).

`--overline` pone el texto en mayúsculas con tracking de 0,14 em para nombres propios (región, edición). Dentro de una tarjeta de región la pastilla toma el color de la familia de la tarjeta automáticamente. Máximo dos pastillas juntas.