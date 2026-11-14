> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 1.0 — 2026-11-14.

# Información del vendedor

Se publica en `/legal/vendedor/` con el rótulo «Versión 1.0 · vigente desde 2026-11-17» (misma versión y fecha que los términos: `version_terminos`, `fecha_terminos`).

**Fuente.** Sección 2 (D4) de «De Santander SAS — Textos legales v1.0 para publicación» (`docs/legal/paquete-abogado/`, 14/11/2026), que el dueño presenta como cerrada con su abogado. Sustituye las versiones 1 y 2 de este archivo. Según el paquete, este bloque de datos es el único que usan el pie, el resumen del pedido, D1 §2, D2 §1, D3 §1 y la ficha, y todos lo leen de `data/config.csv`. Legal no registra aquí la aprobación formal del abogado.

**Ajuste de formato (no de redacción).** D4 trae los datos en una tabla «Dato / Valor». La página legal solo muestra subtítulos, párrafos y listas, así que la tabla va como lista «Dato: Valor», con las mismas palabras y en el mismo orden. Por eso la lista de definiciones (`dl`) que hoy pinta `src/app/legal/[slug]/page.tsx` en `/legal/vendedor/` debe retirarse, para que los datos no salgan dos veces (LEG-148). Los valores coinciden hoy, uno por uno, con `data/config.csv`. Si cambia un dato en `config.csv`, legal cambia esta lista el mismo día.

**Qué no se publica.** La tabla «Dónde se muestran los datos» y la «Nota interna» de D4 son instrucciones para el desarrollo; van abajo, en «Dónde se muestra».

---

## Texto para el consumidor

### Quién te vende
De Santander SAS es la sociedad que opera esta tienda y comercializa los cafés que ves en ella. No los cultivamos, no los tostamos, no los molemos ni los empacamos: cada café lleva la marca y el nombre de su fabricante en la bolsa y en su ficha. Ante ti respondemos nosotros por el pedido, el pago, el envío, la garantía y los reclamos.

- Razón social: De Santander SAS
- NIT: 902.121.184-8
- Matrícula mercantil: 740574
- Representante legal: Ivan Fernando Rueda Duarte
- Domicilio: Bucaramanga, Santander
- Dirección de notificación judicial: Calle 37 n.° 23-77, apartamento 702, Bucaramanga, Santander
- Correo de notificación judicial: desantander.tienda@gmail.com
- Correo de atención: desantander.tienda@gmail.com
- WhatsApp y teléfono: +57 300 112 9874
- Despachamos desde: Bucaramanga, Santander

### Cómo te atendemos
Escríbenos por WhatsApp o al correo para hacer un pedido, preguntar por tu envío, ejercer el retracto, pedir la garantía o presentar una queja, un reclamo o una solicitud. Cada solicitud recibe por el mismo canal un número de radicado, con fecha y hora, y la respondemos en máximo 15 días hábiles. También puedes acudir a la Superintendencia de Industria y Comercio (www.sic.gov.co). El detalle está en «Envíos, devoluciones, retracto y garantía».

---

## Dónde se muestra (D4, requisitos para el desarrollador)

| Lugar | Qué se muestra (D4) | Estado hoy | Hallazgo |
|---|---|---|---|
| Pie de página | Razón social, NIT, domicilio, dirección y correo de notificación judicial, correo de atención, WhatsApp y enlaces a las cuatro páginas legales | Sin dirección de notificación (pedido del dueño del 2026-11-12); enlace «Envíos, devoluciones…» a `/legal/envios-devoluciones/` | LEG-148 (decisión del dueño), LEG-141 |
| `/legal/vendedor/` | El texto completo de la sección | Texto v2 + `dl` desde `config.csv` | LEG-148 |
| Resumen del pedido | `Te vende De Santander SAS · NIT 902.121.184-8` + enlace «Información del vendedor» | `Te vende De Santander SAS · NIT … · Bucaramanga, Santander · correo · WhatsApp.` + enlace | LEG-153 |
| Ficha de cada café | «Comercializa: De Santander SAS», en la última fila de la ficha técnica | Cumple (`ficha-cafe.tsx`) | — |

Nota interna de D4: el nombre del representante legal y la matrícula se publican en `/legal/vendedor/`, pero no en el pie.

## Notas para el abogado

- **Dirección de notificación judicial (LEG-148).** El paquete la publica en D1 §2, D2 §1, D3 §1, D4 y el pie. El 2026-11-12 el dueño había pedido mostrarla solo en `/legal/vendedor/` (y luego había anunciado una dirección nueva, D-25). El paquete es posterior y declara sin efecto los textos anteriores que lo contradigan; además cierra LEG-134 (ya no hay marcador). Que el pie la omita no incumple por sí solo la Ley 1480 (art. 50 lit. a; VERIFICAR la letra) si la página del vendedor la publica, pero contradice D4. Decide el dueño con su abogado (P38).
- **Confirmación 3 del numeral 8.3.** La dirección y el correo deben coincidir con el certificado de existencia y representación legal (D-1). Legal no tuvo el certificado.
- **«De Santander SAS» sin puntos.** Igual en `config.csv` y en este texto. `docs/marca-v4.1.md` (instrucción de diseño) todavía dice «De Santander S.A.S.» (LEG-162).
- **«Cada café lleva la marca y el nombre de su fabricante… en su ficha».** Hoy ningún café activo tiene `marca` ni `fabricante` en `data/catalogo.csv` (D-11; LEG-147).
