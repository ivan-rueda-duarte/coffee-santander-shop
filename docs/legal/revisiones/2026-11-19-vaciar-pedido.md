> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.1 — 2026-11-19.

# Revisión LEG-188 a LEG-191: vaciar el pedido tras «Enviar por WhatsApp»

**Pedido.** El dueño pidió el 2026-11-19 que el pedido (carrito) se vacíe una vez se envíe por WhatsApp. Diseño lo especificó en `docs/diseno/2026-11-19-vaciar-carrito.md` (textos T1 a T6 marcados [CONSULTAR-LEGAL]). Se pide dictamen, validación de los textos, redacción de la regla 4 de microcopy §9.5 y respuesta sobre el número DS fuera del mensaje.

**Fuentes (solo lectura).** Esa especificación (completa); `revisiones/2026-11-18-flujo-pedido-un-clic.md` (LEG-171 a LEG-175, §4 bis); `microcopy-legal.md` v1.11, §9; `politica-tratamiento-datos.md` (D2) §2; `terminos-y-condiciones.md` (D1) §4 a §6; `revisiones/2026-11-14-paquete-abogado-v1.md` (LEG-149). Se buscó en `docs/legal/paquete-abogado/` cualquier regla sobre vaciar el carrito: **no hay ninguna**. La regla «El carrito no se vacía solo» es de legal (microcopy v1.10), no del paquete del abogado.

## 1. Qué cambia

Hoy, tras un clic válido en «Enviar por WhatsApp», el carrito sigue lleno. Con el cambio: (1) el sitio abre `wa.me` y, **después**, en el mismo manejador, vacía el carrito sin aviso; (2) guarda en memoria una copia del mensaje ya generado (texto, enlace, número DS, líneas y bolsas); (3) muestra la vista «Mensaje listo» con «Enviar por WhatsApp» (mismo enlace y mismo DS), el respaldo «Copiar mensaje» y «Recuperar el pedido» (devuelve las líneas). Recargar o salir de `/pedido/` pierde la copia.

## 2. Análisis

**Ley 1480 de 2011, información previa (arts. 23 y 50; VERIFICAR la letra del art. 50, modificado por la Ley 2439 de 2024).** Toda la información previa se da en el Resumen **antes** del clic, y el vaciado ocurre **después** de abrir `wa.me`. El cambio no quita nada de lo que el cliente ve antes de decidir. El resumen que el cliente puede verificar y corregir sigue disponible: el texto completo aparece en WhatsApp antes de mandarlo, en «Ver el mensaje» de la vista y, si quiere corregir, con «Recuperar el pedido». Riesgo nuevo: que el cliente lea el carrito en 0 como «compra hecha». Lo evitan T1 («Envía el mensaje en WhatsApp») y T2, que dicen que todavía falta mandar el mensaje y aceptar el total. La vista **nunca** debe decir «enviado», «recibido», «confirmado» ni «compra».

**Constancia (Ley 1480, art. 50; Ley 527 de 1999, arts. 14 y 15, VERIFICAR).** La prueba de la solicitud y de la aceptación es el mensaje que el cliente manda por WhatsApp y su «ACEPTO» en el chat (D1 §5 y §6). El sitio nunca fue el soporte de esa constancia: no guarda pedidos (CLAUDE.md; D2 §2). Vaciar el carrito no borra ninguna prueba. La regla de §4 bis (mismo contenido, mismo número DS) se mantiene en el reintento y al recuperar el pedido.

**Ley 1581 de 2012 (principios de libertad, finalidad, seguridad y circulación restringida, art. 4; VERIFICAR).** La copia del mensaje lleva datos personales (nombre, celular, dirección, documento si lo dio). Se admite **solo en memoria**, como hoy los datos del formulario. Nunca en `localStorage`, `sessionStorage`, `history.state`, la URL, la analítica ni entre pestañas. D2 §2 dice que en el navegador se guarda solo el carrito y que se puede borrar vaciándolo: con el cambio el sitio guarda **menos** tiempo el carrito, lo que es coherente con D2 y con LEG-149. «Recuperar el pedido» devuelve solo líneas del carrito (cafés, tamaños, presentaciones y cantidades), que no son datos personales. D2 no cambia.

**Paquete del abogado v1.0.** D1 §4 («El carrito se guarda solo en tu navegador»), D1 §5 y §6, D2 §2, D3 y D5 §6.4 siguen siendo ciertos. Ninguno dice que el carrito se conserve tras enviar. T2a y T2b son textos de §9.3 ya aprobados por el abogado (comunicación del dueño del 2026-11-18), usados después del clic, sin «Al pulsar…». No se crea texto contractual nuevo.

## 3. Hallazgos

| # | Severidad | Ubicación | Texto o práctica | Riesgo y norma | Corrección propuesta |
|---|---|---|---|---|---|
| LEG-188 | Baja (condiciones **bloqueantes** si no se cumplen las 1 a 3) | `flujo-pedido.tsx`, `enviar()`; proveedor del carrito; vista «Mensaje listo» | Vaciado en el mismo clic válido, después de `window.open`; copia del mensaje en memoria; reintento con el mismo DS; «Recuperar el pedido». | Sin las condiciones: aceptación sin casillas (LEG-172), mensaje distinto del enlace (LEG-173) o datos personales en el navegador (Ley 1581, art. 4; D2 §2; LEG-149). | **Conforme con condiciones:** (1) nada se vacía ni se guarda con un clic no válido; nada se ejecuta antes de `window.open` (LEG-172 sin cambio); (2) la copia vive solo en memoria: nunca en `localStorage`, `sessionStorage`, `history.state`, la URL, la analítica ni otra pestaña; (3) «Enviar por WhatsApp», «Copiar mensaje», «Ver el mensaje» y el bloque «En el mensaje» salen de la misma copia: mismo texto, mismo DS, mismas líneas; (4) la vista no dice «enviado», «recibido», «confirmado», «compra» ni «finalizado»; (5) al recuperar, rige §4 bis: sin cambios, el mismo DS; con un cambio en carrito, envío o cualquier casilla, DS y texto nuevos; (6) las casillas nunca se restauran tras recargar (siguen sin persistir). |
| LEG-189 | Media | Vista «Mensaje listo», nota T3 | `Quitamos estos cafés de tu pedido en este navegador para que puedas empezar uno nuevo.` | «Quitamos estos cafés de tu pedido» se puede leer como que la tienda sacó los cafés **de la solicitud** que va por WhatsApp, o que la canceló (Ley 1480, art. 23: información clara, sin ambigüedad). | Texto final: `Vaciamos «Tu pedido» en este navegador para que puedas armar uno nuevo. El mensaje de WhatsApp lleva todos los cafés.` Nombra el cajón tal como se rotula y dice expresamente que el mensaje no cambia. |
| LEG-190 | Baja | `microcopy-legal.md` §9.5, regla 4 (T6); §9.1 y §9.4 | «El carrito no se vacía solo: el sitio no sabe si el cliente mandó el mensaje.» contradice el cambio. §9.1 lista «Vaciar pedido» en el respaldo; §9.4 descarta el respaldo «si cambia el carrito». | Documento interno desactualizado (como LEG-176). | Microcopy v1.12: regla 4 nueva (T6, abajo), §9.1 sin «Vaciar pedido» en el respaldo, §9.4 con la salvedad del vaciado por el envío y §9.6 nueva con los textos de la vista. |
| LEG-191 | Informativa | Vista «Mensaje listo» | ¿Mostrar el número DS fuera del mensaje? | Ninguna norma lo exige: la identificación de la solicitud y el acuse se dan en el chat (D1 §6), y P39 deja el número en el mensaje. Mostrarlo aparte, sin el texto que identifica, podría tomarse como número de pedido confirmado. | **No mostrarlo fuera del mensaje.** Basta que esté en «Ver el mensaje», en lo copiado y en WhatsApp. Si en el futuro se muestra, solo como `Número de tu solicitud: {DS}`, nunca «Número de pedido». |

**T1, T2a, T2b, T4 y T5: conformes sin cambio.**

## 4. Textos finales (letra por letra)

| # | Dónde | Texto |
|---|---|---|
| T1 | h1 de la vista | `Envía el mensaje en WhatsApp` |
| T2a | Bajada, envío con tarifa (incluido envío gratis por comunas) | `Con ese mensaje nos pides el pedido. Te respondemos con el total para que lo aceptes y te damos los datos para pagar.` |
| T2b | Bajada, por cotizar | `Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.` |
| T3 | Nota bajo la bajada | `Vaciamos «Tu pedido» en este navegador para que puedas armar uno nuevo. El mensaje de WhatsApp lleva todos los cafés.` |
| T4 | Rótulo del bloque | `En el mensaje` |
| T5 | Enlace | `Recuperar el pedido` |
| T6 | Regla 4 de microcopy §9.5 | Ver `microcopy-legal.md` v1.12, §9.5 |

## 5. Dictamen

**Conforme con observaciones**, con las condiciones de LEG-188 y el T3 de LEG-189. Si se implementa con la copia del mensaje en almacenamiento del navegador o en la URL, o vaciando antes de `window.open` o con un clic no válido: **No conforme**.

**¿Validación del abogado?** **No es necesaria; basta informarle antes de publicar** (recomendado, no bloquea). Razones: no cambian D1 a D4 ni la plantilla D5 §6.4 ni la constancia; la regla que se modifica es de legal; T2a y T2b son textos que el abogado ya aprobó; T1, T3, T4 y T5 son de interfaz. `config.csv` sigue en 1.0 / 2026-11-17. Sigue abierto, sin relación con este cambio, el de Café Arreboles sin NSA (LEG-024/066/089/146, riesgo aceptado por el dueño).

## Entrega para desarrollador-fullstack

1. Implementar según `docs/diseno/2026-11-19-vaciar-carrito.md`, con las condiciones (1) a (6) de LEG-188.
2. Textos T1 a T5 de §4 de esta revisión (T3 con la redacción de LEG-189), letra por letra. No mostrar el número DS fuera del mensaje (LEG-191).
3. Retirar «Vaciar pedido» del respaldo del Resumen. Actualizar comentarios y pruebas que digan «el carrito no se vacía solo».

## Para disenador-marca

Sustituir T3 por el texto de LEG-189 en la especificación. Las comillas latinas de «Tu pedido» son parte del texto.

## Puntos para que QA verifique

- Clic sin casillas 1 y 2: el carrito no se vacía y no aparece la vista.
- Clic válido: `wa.me` se abre primero; luego carrito en 0 en `localStorage`; vista «Mensaje listo» con T1, T2 (según el envío), T3, T4 y T5.
- El texto de «Copiar mensaje», el de «Ver el mensaje» y el `text` del enlace son idénticos, con el mismo DS; el bloque «En el mensaje» coincide con las líneas del texto.
- Ningún dato del formulario ni el texto del mensaje en `localStorage`, `sessionStorage`, `history.state`, la URL ni eventos de analítica, antes ni después del vaciado.
- Ningún texto de la vista dice «enviado», «recibido», «confirmado», «compra», «finalizado» ni «Número de pedido». El DS no aparece fuera del mensaje.
- «Recuperar el pedido» sin cambios: mismo DS. Cambiar una casilla tras recuperar: DS nuevo.

## Normas marcadas VERIFICAR

Ley 1480 de 2011, arts. 23 y 50 (letra de los literales; modificación de la Ley 2439 de 2024); Ley 527 de 1999, arts. 14 y 15; Ley 1581 de 2012, art. 4. No se consultaron fuentes oficiales en esta revisión; se citan como en LEG-171 y LEG-183.
