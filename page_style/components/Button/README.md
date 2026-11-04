Botones en forma de pastilla (`radius-pill`), Montserrat 700, 15 px. Siete variantes; una sola acción primaria por vista, y esa acción es siempre **verde bosque** (`brand`): comprar, suscribirse, añadir, ver fechas.

| Variante | Fondo / texto | Cuándo |
|---|---|---|
| `--primary` | `brand` / `on-brand` | La acción principal: comprar, suscribirse. En tema oscuro se vuelve oro con texto carbón. |
| `--accent` | transparente, borde y texto `accent` (terracota) | **Ya no es un CTA.** Enlace de origen ("Conoce el origen", "Ver la finca"); va junto a un primario, nunca solo. |
| `--gold` | `highlight` / `on-highlight` | Solo sobre fondos oscuros (monte, tostado, foto con scrim): "Desliza →", "Suscribirme". |
| `--secondary` | transparente, borde `line-strong` | Acción de apoyo. |
| `--ghost` | texto `brand` subrayado | Enlaces en línea. |
| `--on-photo` | `on-photo` (pergamino) / `monte-900` | Único botón permitido sobre fotografía con `scrim`, junto con `--gold`. |
| `[disabled]` | `surface-sunken` / `ink-muted` | Agotado; siempre con la palabra. |

Tamaños: `--sm` (13 px) en tarjetas y posts; normal (15 px) en web; `--lg` (16 px) en héroes. Foco: anillo `focus` de 2 px con 2 px de separación. El consumidor aporta el texto (verbo en infinitivo o imperativo, máximo 4 palabras) y el `href`.