# Revisión LEG-101 a LEG-105: Observaciones de QA y de marca sobre el paquete legal v1 implementado (2026-11-06)

> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.1 — 2026-11-06.

Sigue a `2026-11-06-paquete-v1.md` (LEG-081 a LEG-100).

**Fuentes.** `docs/qa/2026-11-06-paquete-legal-v1.md` (QA-006 y QA-008); `docs/diseno/2026-11-06-paquete-legal-v1.md` («Resumen del pedido», «Teclado y foco», opcional #11); `src/ui/componentes/layout/secciones-inicio.tsx` (líneas 61-62 y 119); `src/ui/componentes/marca/superficies.tsx` (línea 76); `data/config.csv` (`formas_pago`); `page_style/assets/Fotografia/README.md`; `docs/INVENTARIO-V1.md` (punto 16); `PRODUCT.md` («Evidence on Hand»); `legacy/index.html` (línea 137); la imagen `public/assets/fotografia/cafetal-montana.jpg` (vista directa).

**Límite.** Legal no tiene acceso a `git log` (sin terminal en este rol). El origen de la foto se rastreó en `docs/`, `legacy/` y `page_style/`. Si el desarrollador puede, que adjunte `git log --follow --format='%h %ad %an %s' -- public/assets/fotografia/cafetal-montana.jpg legacy/assets/fotografia/cafetal-montana.jpg page_style/assets/Fotografia/cafetal-montana.jpg` y los metadatos EXIF (autor, fecha, cámara, GPS) a la respuesta del dueño.

## Hallazgos

| # | Severidad | Ubicación | Texto o práctica | Riesgo y norma | Corrección propuesta |
|---|---|---|---|---|---|
| LEG-101 | Media (QA-006) | `flujo-pedido.tsx`, resumen: botón «Preparar pedido para WhatsApp» | El botón queda con `disabled` mientras falte una casilla y no dice por qué. Con `disabled` no recibe foco y los errores de las casillas ya no aparecen nunca. | Información poco clara sobre el paso que falta para hacer el pedido (Ley 1480, art. 23). Barrera para quien usa teclado o lector de pantalla (WCAG 2.2, 3.3.1, 3.3.2 y 4.1.2: buena práctica, no norma colombiana obligatoria para particulares; VERIFICAR NTC 5854). No afecta la validez del consentimiento: el botón no avanza sin las dos casillas. | Microcopy §5.9 (v1.1). **Recomendada:** `aria-disabled="true"` + microayuda visible según el caso, enlazada con `aria-describedby` + errores exactos al pulsar y foco en la primera casilla sin marcar. Alternativa válida: mantener `disabled` con la microayuda visible (pierde los errores por casilla). |
| LEG-102 | Baja | `microcopy-legal.md` v1.0 §4.3 | El documento pedía «error sin cambio» y «botón deshabilitado» a la vez: con `disabled` el error no puede mostrarse (nota de QA-006). | Instrucción contradictoria de legal. | Corregido por legal: §4.3 y §5.1 remiten a §5.9 (v1.1). |
| LEG-103 | Baja (QA-008) | `secciones-inicio.tsx` líneas 61-62, «Cómo pedir», paso 3 | «Pagas con efectivo contraentrega y transferencia bre-b.» `toLowerCase` sobre todo el texto y unión con «y». | «Bre-B» es el nombre del sistema de pagos y así figura en `config.csv`, el pie, el formulario y los documentos (términos §11, envíos §10); escribirlo distinto resta claridad (art. 23). «y» puede leerse como que se paga con ambos medios a la vez. | Texto exacto: `Pagas con efectivo contraentrega o transferencia Bre-B.` Regla: solo la primera letra de cada forma en minúscula; unir con «o» («a, b o c» si hay tres). Microcopy §2. |
| LEG-104 | Media | `secciones-inicio.tsx` línea 119 (foto de respaldo de la Historia, visible mientras Sanity no traiga foto) y `legacy/index.html` línea 137 | Texto alternativo «Cafetal entre montañas de Santander con niebla de la mañana» y crédito visible «De Santander». En el repositorio no consta autor, lugar, fecha ni licencia: solo la nota interna «Fotografías propias de la marca» del kit de diseño (`page_style/assets/Fotografia/README.md`), sin soporte; `PRODUCT.md` dice que «no existen todavía» fotografías de producto ni de fincas. En la imagen se ve una ladera cultivada con un camino de tierra y nubes bajas; no se puede comprobar que sea Santander, que sea un cafetal ni la hora. | (a) Atribución de autoría no demostrada y uso de una obra sin licencia conocida (Ley 23 de 1982 y Decisión 351 de 1993 de la CAN, derechos morales de paternidad y derechos patrimoniales: VERIFICAR artículos). (b) La foto junto a «Santander en cada taza» y «café de origen santandereano», con un texto alternativo que afirma «Santander», sugiere un origen no acreditado (Ley 1480, arts. 23 y 30). (c) Términos §14 afirma que las fotos del sitio son de la sociedad o de quien la autorizó. (d) Regla del proyecto: no inventar fotos ni sus datos. | Mientras el dueño no responda (P24): texto alternativo `Montañas verdes con cultivos en ladera, un camino de tierra y nubes bajas.` y **sin crédito** (`credito: ""`, no se pinta `figcaption`). Ni «Santander», ni «cafetal», ni «finca», ni «De Santander» como autor. Si el dueño confirma autor, lugar y permiso: `Foto: {autor} · {municipio}, Santander · {año}` y un texto alternativo que nombre el lugar. Si no puede confirmar el permiso: retirar la foto. Microcopy §2. |
| LEG-105 | Informativa (marca #11) | Páginas `/legal/<slug>/`, H1 | ¿El título legal puede llevar una palabra de remate en itálica? | Ninguna norma lo impide; el riesgo sería que el título visible no coincida con el nombre del documento que se acepta. | **Sí, solo como tipografía**: el texto del H1 debe ser letra por letra el nombre usado en las casillas, el pie y los enlaces (p. ej. «Términos *y condiciones*»), sin añadir ni quitar palabras. |

## Estado de hallazgos anteriores

Sin cambios respecto a `2026-11-06-paquete-v1.md`. LEG-024/066 sigue **Bloqueante, abierto, riesgo aceptado por el dueño**.

## Dictamen

- **LEG-101 a LEG-105: Conforme con observaciones** una vez implementada la entrega. Ninguno es bloqueante por sí solo.
- **Lanzamiento: No conforme**, sin cambio, por LEG-024/066 (Café Arreboles sin notificación sanitaria) y los demás bloqueos de `2026-11-06-paquete-v1.md`.

## Decisiones que requiere el cliente

1. **P24. Foto de la Historia (`cafetal-montana.jpg`).** a) El dueño (u otra persona de la sociedad) la tomó: indicar autor, municipio y año; se publica con crédito y texto alternativo con el lugar. b) La tomó un tercero: indicar autor y entregar el permiso escrito de uso; se publica con su crédito. c) No consta el origen: se publica con el texto alternativo neutro y sin crédito **solo si el dueño confirma por escrito que tiene derecho a usarla**; si no, se retira (**recomendada** mientras no haya respuesta: texto neutro y sin crédito; retirarla antes del lanzamiento si no llega la confirmación).
2. **Botón del resumen.** a) `aria-disabled` con microayuda y errores (**recomendada**). b) `disabled` con microayuda. Decisión de producto y diseño; las dos son lícitas.

## Entrega para desarrollador-fullstack

Textos exactos en `docs/legal/microcopy-legal.md` v1.1.

1. **`src/ui/componentes/checkout/flujo-pedido.tsx`, resumen (LEG-101; §5.9).** Quitar `disabled` del botón «Preparar pedido para WhatsApp»; poner `aria-disabled="true"` mientras falte una casilla y `aria-describedby` hacia la microayuda. Microayuda visible (`caption`, junto al botón), según el caso:
   - faltan las dos: `Para preparar tu pedido, marca las dos casillas: la autorización de tus datos y los términos y condiciones.`
   - falta la de datos: `Para preparar tu pedido, falta que autorices el tratamiento de tus datos.`
   - falta la de términos: `Para preparar tu pedido, falta que aceptes los términos y condiciones.`
   - las dos marcadas: sin microayuda y sin `aria-disabled`.
   Al pulsar con `aria-disabled="true"`: no se arma el mensaje ni el enlace `wa.me`; se muestran bajo cada casilla sin marcar `Debes autorizar el tratamiento de tus datos para continuar.` y `Debes aceptar los términos para continuar.` (con `aria-invalid` y `aria-describedby` en la casilla, como antes); el foco va a la primera casilla sin marcar. Las casillas nunca se marcan solas. Si diseño elige `disabled` (alternativa b), basta la microayuda; en ese caso puede usarse la frase única `Para preparar tu pedido, marca las dos casillas.`
2. **`src/ui/componentes/layout/secciones-inicio.tsx` líneas 61-62 (LEG-103; §2).** Pasar a minúscula solo la primera letra de cada forma de pago y unir con «o»: resultado exacto con la configuración actual `Pagas con efectivo contraentrega o transferencia Bre-B.`
3. **`src/ui/componentes/layout/secciones-inicio.tsx` línea 119 (LEG-104; §2).** Foto de respaldo: `alt: "Montañas verdes con cultivos en ladera, un camino de tierra y nubes bajas."`, `credito: ""`. No tocar `legacy/` (no se publica); si se llegara a publicar, el mismo cambio. Si el dueño responde P24 c) sin confirmar el permiso antes del lanzamiento, retirar la foto del respaldo.
4. **`src/app/legal/[slug]/page.tsx` (LEG-105).** Si diseño aplica la itálica de remate en el H1, el texto del título no cambia (solo el marcado).

**Para `disenador-marca`:** ubicación y estilo de la microayuda del botón (nivel `caption`, contraste ≥ 4,5:1 en el resumen) y elección entre la vía a) y b); itálica de los títulos legales según LEG-105.

## Puntos para que QA verifique

- QA-006: con las casillas sin marcar, el botón es enfocable, tiene `aria-disabled="true"` y `aria-describedby` hacia la microayuda; la microayuda dice exactamente el texto del caso (probar los tres casos); al pulsar no se abre ni se prepara el enlace `wa.me`, aparecen los dos errores exactos y el foco queda en la primera casilla sin marcar; con las dos marcadas, sin microayuda ni `aria-disabled`. Axe sin violaciones serias con los errores visibles. Ninguna casilla carga marcada.
- QA-008: «Cómo pedir», paso 3, termina exactamente en `Pagas con efectivo contraentrega o transferencia Bre-B.`; `bre-b` en minúscula no aparece en `out/`.
- LEG-104: `rg -n "niebla de la mañana|montañas de Santander" src out` vacío; la foto de la Historia no tiene `figcaption`; el `alt` es el texto neutro exacto.
- LEG-105: si hay itálica, el texto plano del H1 de cada página legal coincide con el de su enlace en el pie.

## Normas marcadas VERIFICAR

- Ley 1480 de 2011, arts. 23 y 30 (letra oficial; no releídos en esta sesión).
- Ley 527 de 1999, art. 14.
- Ley 23 de 1982 (derechos morales y patrimoniales sobre obra fotográfica; artículos exactos) y Decisión 351 de 1993 de la CAN (arts. 11 y 13).
- NTC 5854 y WCAG 2.2 (aplicabilidad a particulares; se citan como buena práctica).
