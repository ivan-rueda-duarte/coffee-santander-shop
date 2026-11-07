# Paquete legal v1: presentación de los textos legales en la tienda

Fecha: 2026-11-06 · Rama `feat/paquete-legal-v1` · Autor: disenador-marca
Fuentes: `docs/marca-v4.1.md`, `PRODUCT.md` (modelo C), `docs/legal/microcopy-legal.md`. Los textos son de legal y no se cambian aquí; esta especificación solo fija dónde y cómo se ven.

## Objetivo del usuario

Comprar con una mano a 360 px sabiendo, sin buscar, qué incluye el precio (IVA), cuánto y cuándo llega el envío, cómo retractarse y quién le vende. La información legal se lee, pero no le quita protagonismo al café ni al botón verde bosque.

## Escala de jerarquía para texto legal

| Nivel | Uso | Clase | Color |
|---|---|---|---|
| 1. Aviso que condiciona la decisión | retracto en el resumen; casillas | `small` (14/22, 500) | `text-ink` |
| 2. Aclaración pegada a una cifra | leyenda de IVA, plazo, ayuda de contraentrega, ayuda de molienda | `caption` (12/18, 500) | `text-ink-muted` |
| 3. Referencias y vendedor | nota de precio total, línea de vendedor, pie | `caption` o `text-sm` | `text-ink-muted` |
| Documento largo | `/legal/<slug>/` | `body-l` en columna de 65–70 caracteres | `text-ink` |

Reglas: la aclaración de una cifra va justo debajo de su rótulo, dentro del mismo `dt`, alineada a la línea base del importe (`items-baseline`). Nunca oro ni grana como texto sobre pergamino. Sin terracota en textos legales (se reserva a origen y tueste).

## Componentes

- **Totales (`totales-pedido.tsx`).** Filas con `items-baseline`. Fila «por cotizar»: en celular se apila (rótulo y plazo, luego el valor a ancho completo, alineado a la izquierda); desde `sm` vuelve a dos columnas con el valor a la derecha.
- **Ficha técnica.** Filas apiladas por debajo de `sm` (rótulo arriba en gris, valor abajo) y a dos columnas `9rem 1fr` desde `sm`. Valores con `overflow-wrap:anywhere` para notificación sanitaria, titular y fabricante. Las expresiones «Marca», «FABRICADO POR» o equivalentes se muestran tal como en la bolsa (Res. 5109 de 2005): no se normaliza su caja.
- **Tarjeta de café.** «Marca» es dato técnico (nivel 1 de la marca), dentro de `ds-card__meta`, sin relleno ni pastilla. Nunca como pastilla ni en terracota.
- **Bloque de compra.** Leyenda de IVA a 4 px del precio, alineada a la derecha con él.
- **Pie.** Enlaces legales con área táctil de al menos 28 px (`inline-block py-1`). Datos del vendedor separados de los enlaces con un filete `border-line` y `overflow-wrap:anywhere` para el correo y la dirección a 320 px.
- **Resumen del pedido.** Aviso de retracto en nivel 1. El botón «Preparar pedido para WhatsApp» deshabilitado necesita una microayuda visible y enlazada con `aria-describedby`; el texto lo redacta legal (no se inventa aquí).
- **Páginas legales.** Columna de lectura `max-w-[68ch]`, H1 Fraunces 700 con `text-balance`, H2 con más aire arriba que abajo, índice de secciones con anclas cuando el documento tenga más de cinco títulos.

## Estados

- Sin datos del vendedor: no se muestra el bloque `address` ni el filete.
- Sin tarifa de IVA: la leyenda alternativa ocupa el mismo lugar.
- Sin plazo publicado: no hay `linea-plazo`; la fila conserva su alineación.
- Documento legal sin contenido: tarjeta «en preparación» con botón verde bosque a WhatsApp (ya existe).

## Teclado y foco

Los enlaces del pie, la nota de precio y las casillas conservan el anillo `--focus`. El botón deshabilitado no recibe foco; por eso la microayuda debe ser texto visible, no un tooltip.
