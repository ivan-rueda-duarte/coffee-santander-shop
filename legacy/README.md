> **Versión 1 (archivada).** Este es el README de la tienda estática original, que se conserva en `legacy/` para comparar paridad. La v2 está en la raíz del proyecto.

# De Santander · Café de origen

The storefront for **De Santander**, a specialty-coffee brand with coffees from the provinces of Santander, Colombia. Visitors can browse the catalog, filter it by province of origin and by brand, open a detailed tasting sheet for each coffee and add coffees to a cart. The site's interface is in Spanish.

Built with plain HTML, CSS and JavaScript: no framework, no build step and no external dependencies (the Fraunces and Montserrat fonts are bundled in `fonts/`).

## Features

- **Atlas layout:** the first screen is an open atlas. The left page is a real map of Santander (municipal boundaries from DANE, coloured by province, with latitude/longitude graticule and a scale bar); each coffee is a pin on its municipality. The right page is the "Índice de cafés": the coffees grouped by province, each with altitude, variety, process, cup notes, roast, SCA score, price "desde" and working "Ficha" / "Agregar" buttons.
- **Province filter:** choose a province in the legend above the index or by clicking it on the map. The map zooms to the province and the index shows only its coffees ("2 cafés en Guanentá"). Provinces without coffees are drawn faded on the map, are not clickable, and are listed as "Próximamente". "Ver todo Santander" or "Todas" returns to the whole department.
- **Shareable links:** the chosen province is saved in the URL, e.g. `?provincia=guanenta`. Unknown values (and old `?marca=` links) are ignored.
- **Sorting:** catalogue order (grouped by province), SCA score, price (low to high or high to low) and altitude. Any sort other than catalogue order shows one flat list with the province on each row.
- **Coffee sheet ("ficha"):** a mini map locating the municipality (with its coordinates), cup profile, SCA score with an explanation of the scale, technical specs with a "¿Qué significa cada dato?" glossary, origin and history, and a sticky buy block with size and grind.
- **Sizes and grind:** each coffee lists its own bag sizes and prices in `presentaciones` (currently 250 g at $25.000 and 500 g at $50.000 for all five) and comes as whole bean or ground (`MOLIENDAS`, same price). The tasting sheet has a size/grind picker; the cart lets you change both afterwards.
- **Order ("Tu pedido"):** a side drawer with one line per coffee + size + grind, quantity controls (max `MAX_CANTIDAD` bags per line), a remove button with undo, an optional delivery city and a payment-method choice. The cart is saved in `localStorage`, so it survives reloads and is shared between tabs.
- **WhatsApp checkout:** "Finalizar compra por WhatsApp" is a plain link to `wa.me` (no pop-ups to block) with the order already written: each line with size and grind, the subtotal, the shipping note, the delivery city and the payment method. After the click the drawer shows a "Tu pedido está listo en WhatsApp" panel (the order only exists once the customer presses send in WhatsApp) with the message text, "Copiar mensaje", "Abrir WhatsApp otra vez", "Editar pedido" and "Vaciar pedido". On phones, a bottom bar "Tu pedido · N bolsas · $…" opens the order whenever it has items. Store number, dispatch city, shipping note and payment methods live in `TIENDA` in [js/data.js](js/data.js) and also feed the footer.
- **Design:** De Santander design system v4.1 (from `page_style/`): parchment background and toasted ink, forest green for identity and every main action, terracotta only for origin and roast notes, gold and flag-red accents as signals. Fraunces titles with one italic closing word, Montserrat for everything else, pill buttons, circular SCA seal with a gold ring, brand stripe at the foot of the page, contour-line and paper-grain textures, and a warm veil on photography. Province map fills use the five brand families (clay, neutral, gold, earth, green), set in `PROVINCIAS[...].color`. "Cómo pedir" explains the three steps, followed by the brand story (dark theme) and a footer with contact, shipping and payment details. Responsive from phones to desktop, with keyboard support (<kbd>Esc</kbd>, focus trapping in the sheet and the drawer, skip link) and reduced-motion support.

## Getting started

You don't need to install anything. Serve the folder with any static file server and open it in a browser:

```bash
cd coffee-santander-shop

# Option 1: Python
python3 -m http.server 8000

# Option 2: Node
npx serve .
```

Then go to <http://localhost:8000>.

Because the data is loaded with a plain `<script>` tag (no `fetch()`), opening `index.html` directly from disk also works.

## Project structure

```
coffee-santander-shop/
├── index.html         # Page markup: header, atlas (map + index), how to order, story, footer, coffee sheet, order drawer
├── css/
│   ├── tokens.css     # Design tokens and @font-face (from page_style/tokens.css)
│   └── styles.css     # All styles, built on the tokens
├── fonts/             # Fraunces and Montserrat (variable woff2)
├── assets/            # Textures (contour lines, grain) and origin photography
├── js/
│   ├── data.js        # TIENDA, PROVINCIAS, MUNICIPIO_PROVINCIA and CAFES: the data the app uses
│   ├── mapa.js        # MAPA_SANTANDER: generated SVG geometry of the 87 municipalities (do not edit by hand)
│   └── app.js         # CoffeeShop class: map, index, filtering, sorting, coffee sheet, order
├── tools/
│   └── build_mapa.py  # Regenerates js/mapa.js and the municipality table from the DANE boundaries
└── README.md
```

## How it works

1. `index.html` loads `js/data.js`, `js/mapa.js` and `js/app.js` as classic `<script>` tags.
2. `data.js` defines:
   - `TIENDA`: store name, WhatsApp number (country code + number, digits only), dispatch city, shipping note and payment methods
   - `PRESENTACIONES` (fallback sizes, used with a console warning if a coffee has none), `MOLIENDAS` (grind options) and `MAX_CANTIDAD` (per-line quantity cap)
   - `PROVINCIAS`: the seven provinces (Comunera, García Rovira, Guanentá, Metropolitana, Soto, Vélez, Yariguíes) with name, URL slug, map colour and short description. A description containing "por completar" is not shown on the page.
   - `MUNICIPIO_PROVINCIA`: the table of the 86 municipalities with a confirmed province. Tona is left out on purpose (the source places it between Metropolitana and Soto) and is drawn hatched on the map as "por verificar".
   - `CAFES`: the catalog. Each coffee's `provincia` is filled in from its `municipio` using the table.
3. `mapa.js` holds `MAPA_SANTANDER`: one SVG path per municipality, the province borders and department outline, each province's centre and bounding box, and the projection used to place the graticule. It is generated by `tools/build_mapa.py` (sources: DANE Marco Geoestadístico Nacional 2018 for boundaries; the Spanish Wikipedia annex of Santander municipalities for provinces).
4. When the DOM is ready, `app.js` creates `window.shop = new CoffeeShop()`, which reads `?provincia=` (`readFiltersFromUrl`), draws the map (`buildMap`) with its HTML overlay of province names, pins and graticule labels (`buildOverlay`, `placeOverlay`, which keeps labels from overlapping and hides those that don't fit), builds the legend (`renderLegend`) and wires up the events.
5. Every filter or sort change goes through `update()`: it filters and sorts `CAFES`, highlights the province on the map and animates the map's `viewBox` to it (`zoomTo`, instant when the visitor prefers reduced motion), re-renders the index (`renderIndex`, `createLot`) and writes the URL.
6. `openModal(cafe)` fills the coffee sheet, including a mini map (`renderMiniMap`) and the size/grind form. Order lines are `{ cafeId, gramos, molienda, qty }`; `addToCart`, `changeQty`, `updateLine` (merges lines that become identical), `removeLine` (with undo) and `renderCart` manage the drawer and the mobile bar (`renderOrderBar`), and `saveCart`/`loadCart` persist them under the `desantander.carrito.v1` key. `buildOrderMessage()` writes the WhatsApp text; the checkout link's `href` is refreshed on every change (`renderCheckoutLink`), and `checkout()` only switches the drawer to the confirmation panel.
7. While the sheet or the drawer is open, the rest of the page gets the `inert` attribute and <kbd>Tab</kbd> stays inside the open panel (`trapFocus`).

To change the look, edit the CSS variables at the top of [css/styles.css](css/styles.css) and the province colours in `PROVINCIAS`.

## Adding a coffee

Add an object to the `CAFES` array in [js/data.js](js/data.js). Don't write `provincia`: it comes from `municipio`.

```js
{
  id: 6,                                   // unique number
  nombre: "Café Ejemplo",
  marca: "Café Ejemplo",                   // product line name (not shown as a filter)
  municipio: "Socorro",                    // must exist in MUNICIPIO_PROVINCIA
  finca: "",                               // hidden while empty
  altura_msnm: 1750,
  variedad: "Caturra",
  proceso: "Lavado",
  perfil_taza: ["Panela", "Cacao"],        // shown as tags
  presentaciones: [                        // this coffee's bag sizes and prices (COP)
    { gramos: 250, precio_cop: 25000 },
    { gramos: 500, precio_cop: 50000 }
  ],
  imagen: "",                              // e.g. "img/ejemplo.jpg" (create the folder); empty shows the illustrated bag
  disponible: true,                        // false shows "Agotado" and disables buying
  descripcion_corta: "Short text for the card.",
  historia: "Shown in the modal.",
  origen: "Socorro, Santander.",
  tueste: "Medio",                         // Claro, Medio claro, Medio, Medio oscuro, Oscuro
  puntaje_cata: 88                         // SCA cup score, 80+ is specialty
}
```

The municipality must be one of the 86 in `MUNICIPIO_PROVINCIA` (spelled with its accents, e.g. "Málaga"); its province, map pin and position come from there. A coffee from a province that had none so far makes that province clickable automatically.

To edit a province's text in the summary, change its `descripcion` in `PROVINCIAS`. It is cut to two lines on screen.

## Roadmap

- Online payment (e.g. Wompi, ePayco or Mercado Pago) as an alternative to WhatsApp
- Real product photos in place of the illustrated bags
- Search
- More brands and municipalities

## Contributing

Issues and pull requests are welcome. Keep the project dependency-free unless there is a good reason not to, and check your changes in a browser through a local server.
