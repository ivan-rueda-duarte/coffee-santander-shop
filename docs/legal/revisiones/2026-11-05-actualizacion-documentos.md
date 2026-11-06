# Revisión LEG-049 a LEG-062: redacción de los cuatro documentos legales, casillas y checklist de lanzamiento (2026-11-05)

> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.1 — 2026-11-05.

Sigue a `2026-11-05-documento-codigo-postal.md` (LEG-040 a LEG-048).

**Pedidos del dueño.**
1. Redactar o actualizar los términos, la política de datos, el documento de envíos y retracto, y la información del vendedor.
2. Confirmar las dos casillas del pedido con sus textos.
3. Formular los pendientes (plazo, retracto, PQR) como preguntas cerradas.
4. Explicar qué hacer con el «No conforme» y crear el checklist de lanzamiento.

**Alcance revisado (árbol de trabajo del 2026-11-05).** Otro agente edita en paralelo el formulario de envío; esta revisión no toca `src/`.
- `data/config.csv`: razón social, NIT y correo cargados; `domicilio` vacío.
- `data/catalogo.csv`: Casa Martínez con NSA-003219-2017; Arreboles activo y sin registro; no hay columna `fabricante`.
- `src/app/legal/[slug]/page.tsx`: slugs `terminos`, `privacidad`, `envios-devoluciones`, `vendedor`. El texto sale solo de Sanity (`paginaLegal`, con versión y fecha obligatorias). Sin Sanity muestra «en preparación». Solo pinta subtítulos h3, párrafos y listas: no enlaces, negritas ni tablas.
- `src/ui/componentes/layout/pie.tsx`: los cuatro enlaces; datos del vendedor ocultos mientras falte uno (`vendedorCompleto`).
- `src/ui/componentes/checkout/flujo-pedido.tsx`: casilla de datos con el texto v0.3 de §4.3; casilla de términos «Acepto los términos y condiciones.»; ninguna premarcada; separadas.
- `src/ui/componentes/checkout/formulario-envio.tsx` y `src/domain/pedido/envio.ts`: documento opcional (`DOCUMENTO_OBLIGATORIO = false`), código postal opcional con el visor de 4-72.
- `src/domain/pedido/mensaje-whatsapp.ts`: la primera línea dice «Quiero finalizar mi pedido»; no hay línea de aceptación.
- `src/domain/pedido/persistencia.ts`: localStorage guarda líneas, forma de pago y municipio.
- `src/app/envios/page.tsx`: plazos «orientativos… no una fecha de entrega».
- `src/ui/componentes/layout/secciones-inicio.tsx`: la Historia ya dice «de la finca a tu taza».
- Sin analítica; fuentes locales (`next/font/local`).

## Normas y estado de verificación (esta sesión)

| Norma | Qué se usa | Estado |
|---|---|---|
| Ley 1480, art. 47 (texto de las excepciones y de los costos de transporte) | Retracto | Leído en la transcripción del Concepto SIC 16-062808 de 2016. SUIN y la Secretaría del Senado no respondieron (certificado y conexión rechazada). VERIFICAR contra SUIN. |
| Concepto SIC 16-062808-00001-0000, 18 de abril de 2016 | «Sobre los bienes o productos tales como los alimentos, no procede el derecho de retracto», también a distancia; la fecha de vencimiento no cambia la conclusión | Leído en cdn.actualicese.com. VERIFICAR en sic.gov.co. No vinculante. |
| Ley 1581 de 2012, arts. 8, 14, 15, 17 lit. k, 25 y 26 | Derechos, plazos de consultas y reclamos, manual interno, RNBD, transferencia internacional | Leído en el Régimen Legal de Bogotá (alcaldiabogota.gov.co). |
| Circular Externa SIC 005 de 2017 (incorporada a la Circular Única) | Estados Unidos en la lista de países con nivel adecuado | Fuentes secundarias (firmas de abogados y Gaceta del Congreso). VERIFICAR el texto vigente de la Circular Única. |
| Decreto 1377 de 2013, art. 25 (Decreto 1074 de 2015, art. 2.2.2.25.5.2) | Contrato de transmisión | No se encontró fuente en esta sesión. VERIFICAR. |
| Decreto 090 de 2018 | RNBD solo para sociedades con activos de más de 100.000 UVT | Fuentes secundarias. VERIFICAR. |
| Ley 2300 de 2023, arts. 1 a 3 y 5 par. 3 | Canales autorizados; horarios (lunes a viernes de 7:00 a. m. a 7:00 p. m., sábados de 8:00 a. m. a 3:00 p. m., sin domingos ni festivos); una vez al día; mensajes publicitarios por aplicaciones dentro de esos horarios | Leído en el normograma de la DIAN. VERIFICAR el alcance para un comercio no vigilado por la Superintendencia Financiera (el art. 1 menciona a los vigilados y la cobranza). |
| Ley 1480, art. 51; Decreto 587 de 2016 | Reversión del pago; tarjetas y «cualquier otro instrumento de pago electrónico»; mención de PSE | Fuentes secundarias y resultados de búsqueda; existe un proyecto de decreto del MinComercio (2025-2026) que no está vigente. VERIFICAR su aplicación a Bre-B. |
| GitHub Pages, documentación oficial | «the visitor's IP address is logged and stored for security purposes» | Verificado en docs.github.com. |

## Hallazgos

| # | Severidad | Ubicación | Texto o práctica | Riesgo y norma | Corrección propuesta |
|---|---|---|---|---|---|
| LEG-049 | Informativa (**cierra en borrador LEG-047**) | `docs/legal/` | No existían la política, los términos ni la información del vendedor | Sin política, la autorización no es informada (Ley 1581, arts. 4 lit. c y 12). | Redactados: `politica-tratamiento-datos.md` v0.1 (con aviso y casilla), `terminos-y-condiciones.md` v0.1, `informacion-vendedor.md` v0.1; `envios-devoluciones-retracto.md` pasa a la v0.4. LEG-047 queda **abierto como «borrador listo»** hasta la aprobación y la publicación. |
| LEG-050 | **Alta** | `mensaje-whatsapp.ts`; el sitio no guarda nada | No queda prueba de que el cliente autorizó el tratamiento ni de que aceptó los términos, ni de qué versión | El responsable debe solicitar y conservar copia de la autorización (Ley 1581, art. 17 lit. b; Decreto 1377, art. 8, VERIFICAR). En un sitio sin servidor, la única evidencia posible es el mensaje que llega al chat. | Línea final del mensaje (microcopy §5.2) con las versiones de `data/config.csv` (`version_terminos`, `version_politica_datos`, campos nuevos). Se implementa cuando los documentos estén publicados. |
| LEG-051 | Alta (decisión del cliente; **cambia la recomendación**) | Envíos §9; términos §9 | Retracto del café: hasta la v0.3, la alternativa C se calificaba de «riesgo más alto» | El Concepto SIC 16-062808 de 2016 concluye que los alimentos no tienen retracto, ni siquiera a distancia. No es vinculante, pero apoya la C. Art. 47 nums. 4 y 6. | Se recomienda C. A es una opción comercial válida. B no se recomienda. Las tres redacciones están listas. Pregunta P2. |
| LEG-052 | **Alta** (dato) | Tarifa de envío; resumen; envíos §5 | Contraentrega: no consta si el agregador cobra comisión de recaudo ni quién la paga | Si existe y se cobra al cliente sin informarla antes, el total no es el precio total (Ley 1480, art. 50 lit. c). | P7. Recomendado: que la tienda la asuma dentro de la tarifa. Si se suma, hay que mostrarla en el resumen antes del pedido. |
| LEG-053 | Baja | `mensaje-whatsapp.ts`, línea 57 | «¡Hola, De Santander! Quiero finalizar mi pedido» | «Finalizar» sugiere que la compra se cierra con el mensaje. Es incoherente con los términos §6 y con la pantalla de confirmación (alternativa (b)). Art. 23. | «¡Hola, De Santander! Quiero hacer este pedido:» (microcopy §5.5). P11. |
| LEG-054 | Media | Casilla de autorización (`flujo-pedido.tsx`, líneas 263 a 264) | Comparación de tres textos: el del dueño, el de la v0.3 (hoy en el código) y el final v0.4 | El del dueño no identifica al responsable (art. 12 lit. d), usa una finalidad genérica (art. 12 lit. a; LEG-044) y no dice que los datos se tratan fuera de Colombia, que es el apoyo del art. 26 lit. a. El de la v0.3 cumple, pero omite al mensajero de la zona 1. | Texto final en la sección «Casillas». Conserva las palabras del dueño («gestionar este pedido», «Entiendo que el pedido se envía por WhatsApp (Meta)»). |
| LEG-055 | Media | `pie.tsx`, `legal/[slug]/page.tsx` (`vendedorCompleto`) | Si falta el domicilio, no se muestra ningún dato del vendedor, aunque ya están la razón social, el NIT y el correo | Art. 50 lit. a: identificación del proveedor. Ocultar los datos que existen no corrige el que falta. | Mostrar cada dato existente; el domicilio, cuando llegue. Agregar «Te vende…» en el resumen (microcopy §5.4). P10. El domicilio sigue siendo bloqueante. |
| LEG-056 | **Bloqueante** (publicación) | `/legal/terminos/`, `/legal/privacidad/`, `/legal/envios-devoluciones/` | Las casillas obligatorias enlazan a páginas que dicen «Este documento está en preparación» | No se pueden aceptar unas condiciones que no se dieron a conocer antes de contratar (Ley 1480, arts. 37 y 50; VERIFICAR la letra del art. 37). La autorización no es informada (Ley 1581, art. 12). | Publicar los textos aprobados (entrega 1). Hasta entonces, no abrir el pedido al público. |
| LEG-057 | Media (**cubierto en la política**) | Alojamiento y contenido | GitHub Pages registra la IP de los visitantes. Si las fotos vienen de cdn.sanity.io, Sanity también la recibe | Deber de informar (Ley 1581, art. 12) y transparencia. | La política (§2 y §7) lo informa. No hace falta un cambio de código. Si se agrega analítica, se actualiza antes la política. |
| LEG-058 | Baja | `src/app/envios/page.tsx`, línea 117 | «¿Tu destino no aparece o pides más de 5 kg?» | Todos los destinos tienen zona: los que no figuran son zona 4. La pregunta sugiere lo contrario. Art. 23. | `¿Tu destino es de zona 5 o pides más de 5 kg?` |
| LEG-059 | Alta (dato) | `data/catalogo.csv`, Casa Martínez, `NSA-003219-2017` | Notificación sanitaria de 2017, sin titular ni fabricante registrados | Hay que confirmar que está vigente, que corresponde a este producto y presentación y quién es su titular (Res. 2674 de 2013; VERIFICAR la vigencia de las notificaciones y si exigen renovación). | Pregunta T3 al tostador. Mientras tanto se puede mostrar en la ficha porque es el dato del rótulo, pero no cierra LEG-024 sin el fabricante. |
| LEG-060 | Baja | `data/config.csv` | No existe `version_politica_datos` (ni `version_terminos`) | `CAMBIOS.md` exige que la versión de la política coincida con la configuración; LEG-050 la necesita. | Crear los dos campos al publicar (valor `1.0` cuando el abogado apruebe). |
| LEG-061 | Informativa | Uso promocional de WhatsApp | Hoy no hay casilla promocional ni envíos promocionales | Si se usa: autorización aparte (Ley 1581, art. 12) y horarios de la Ley 2300 de 2023 (VERIFICAR el alcance). | P12. Recomendado: no por ahora. |
| LEG-062 | Informativa | Chats en el teléfono de la tienda y registro de PQR | «El sitio no guarda datos» es cierto, pero la tienda sí conserva chats, correos, facturas y el registro de PQR | Son bases de datos de De Santander, con finalidad y plazo (Ley 1581, art. 4 lit. b; Decreto 1377, art. 11, VERIFICAR). | La política lo dice de forma expresa (§2 y §6), sin afirmar que «no se guarda nada». Plazos: dato D-6. |

### Estado de hallazgos anteriores

| Hallazgo | Estado al 2026-11-05 |
|---|---|
| LEG-001 punto 4 (plazo de entrega) | Abierto. P1. |
| LEG-001 punto 5 / LEG-029 (IVA) | Abierto como condición previa. C1. |
| LEG-001 punto 7 (páginas enlazadas) | `/envios/` existe (cerrado en parte). Las páginas legales siguen sin texto: pasa a LEG-056. |
| LEG-001 punto 11 (PQR) | Abierto. P3. |
| LEG-021 / LEG-031 (Historia) | **Cerrado.** El código dice «Su café va de la finca a tu taza». `docs/PENDIENTES.md` decía que el dueño mantenía la frase rechazada: se corrigió. |
| LEG-022, LEG-023 | Abiertos. P6, P8. |
| LEG-024 | Abierto. Casa Martínez tiene número (LEG-059); falta el fabricante. Arreboles, sin número. P9 y T1 a T3. |
| LEG-037 | **Cerrado.** El botón dice «Preparar pedido para WhatsApp». |
| LEG-040 a LEG-046 | Implementados en el código con la alternativa recomendada (documento opcional, código postal manual). LEG-040 queda condicionado a C2. |
| LEG-044 | Sustituido por LEG-054. |
| LEG-047 | Borrador listo (LEG-049); abierto hasta la publicación (LEG-056). |
| LEG-048 | Abierto. C3. |

## Casillas: texto final recomendado (pedido 2)

| | Texto del dueño | Hoy en el código (v0.3) | **Texto final (v0.4)** |
|---|---|---|---|
| Autorización de datos | «Autorizo el tratamiento de mis datos personales para gestionar este pedido, según la política de tratamiento de datos. Entiendo que el pedido se envía por WhatsApp (Meta).» | «Autorizo a {razon_social} a tratar mis datos personales para atender este pedido: confirmarlo, coordinar la entrega con la transportadora y, si escribí mi documento, emitir la factura a mi nombre. Sé que el pedido viaja por WhatsApp (Meta), que puede tratar datos fuera de Colombia. Más en la [política de tratamiento de datos].» | **«Autorizo a {razon_social} a tratar mis datos personales para gestionar este pedido: confirmarlo, coordinar la entrega con la transportadora o el mensajero y, si escribí mi documento, emitir la factura a mi nombre. Entiendo que el pedido se envía por WhatsApp (Meta), que puede tratar mis datos fuera de Colombia. Más en la [política de tratamiento de datos].»** |
| Términos | «Acepto los términos y condiciones.» | «Acepto los [términos y condiciones].» | **«Acepto los [términos y condiciones].»** (sin cambio) |

Reglas que se mantienen (exige la norma): las dos casillas van sin marcar, por separado y obligatorias para continuar. La de datos enlaza a `/legal/privacidad/` y la de términos a `/legal/terminos/`, en una pestaña nueva. Los errores no cambian.

Coherencia comprobada:
- **Con la política.** Responsable (§1), finalidades (§3: confirmar, entregar, facturar), terceros (§7: transportadora, mensajero, Meta) y tratamiento fuera de Colombia (§7).
- **Con los términos.** §5 (las casillas en el resumen), §6 (el mensaje es la solicitud) y §13 (la autorización va aparte de los términos y no incluye publicidad).

## Dictamen

- **Documentos de esta revisión** (términos v0.1, política v0.1, envíos v0.4, vendedor v0.1, microcopy v0.4 y checklist v0.1): **Conforme con observaciones** como borradores para el abogado. Las observaciones son los TODO(dato) y las decisiones P1 a P12.
- **Casillas:** **Conforme** con el texto v0.4. El texto actual del código (v0.3) también es conforme; el cambio es una mejora.
- **Lanzamiento: No conforme.** Bloqueos:
  - domicilio del vendedor;
  - LEG-024 (Arreboles sin registro; fabricante sin mostrar);
  - LEG-056 (documentos legales sin aprobar ni publicar);
  - Alta abiertos: plazo de entrega (LEG-001 punto 4), retracto (LEG-051), PQR con radicado, IVA (LEG-029), comisión de contraentrega (LEG-052) y prueba de la autorización (LEG-050).
  - El camino más corto a «Conforme con observaciones» está en `checklist-lanzamiento.md` §1.

## Entrega para desarrollador-fullstack

No toques el formulario de envío mientras el otro agente lo edita. Estos cambios se aplican después de su fusión.

1. **Publicar los cuatro documentos en `/legal/<slug>/`** (LEG-056). Hacerlo solo cuando el abogado los apruebe.
   - **Slugs, sin cambio:**
     - `terminos` ← `docs/legal/terminos-y-condiciones.md`
     - `privacidad` ← `docs/legal/politica-tratamiento-datos.md`
     - `envios-devoluciones` ← `docs/legal/envios-devoluciones-retracto.md`
     - `vendedor` ← `docs/legal/informacion-vendedor.md`
   - **Qué se publica:** solo la sección «Texto para el consumidor» de cada documento (en la política, también «Aviso de privacidad»). No se publican las notas para el abogado, los comentarios `<!-- -->`, las alternativas no elegidas, los `[TODO(dato)…]`, los `[DECISIÓN n]` ni las marcas `VERIFICAR`.
   - **Fuente principal: Sanity** (`paginaLegal`, campos `seccion`, `version`, `vigenteDesde`, `contenido`), como dice `CLAUDE.md`. Los subtítulos `###` pasan a bloques h3, las listas a listas y el resto a párrafos. El dueño o el abogado pega el texto; no se ejecuta `sanity login/init/deploy` sin confirmación.
   - **Respaldo en el código.** Hoy no hay proyecto de Sanity (`docs/PENDIENTES.md`), así que se propone un respaldo versionado: `src/data/legal/<slug>.json` con la forma `{ seccion, version, vigenteDesde, aprobado: boolean, contenido: BloqueEstructurado[] }`.
     - `RepositorioContenidoVacio.legal()` (o un repositorio compuesto) lo devuelve **solo si `aprobado === true`**. Orden: Sanity → respaldo aprobado → «en preparación».
     - Mientras el abogado no apruebe, el archivo puede existir con `aprobado: false` y la página sigue en «en preparación».
     - El agente legal no marca nada como aprobado: cambia `aprobado` a `true` quien reciba la aprobación del abogado.
   - **Validación en `npm run datos` (recomendada):**
     - falla si un contenido legal publicado contiene `TODO(`, `[DECISIÓN`, `VERIFICAR` o `<!--`;
     - avisa si Sanity y el respaldo tienen versiones distintas;
     - falla si la versión de `privacidad` no coincide con `version_politica_datos` de `data/config.csv`, ni la de `terminos` con `version_terminos`.
   - **Formato.** El renderizador no admite enlaces, negritas ni tablas. Los documentos ya están escritos así: las direcciones van como texto (`/envios/`, `www.sic.gov.co`) y los plazos de entrega, como lista. Si más adelante se admiten enlaces, se recomienda enlazar `/envios/` y `/legal/…`.
   - **Título (recomendado).** Cambiar «Envíos, devoluciones y retracto» por «Envíos, devoluciones, retracto y garantía» en `SECCIONES` (`legal/[slug]/page.tsx`), en `LEGALES` (`pie.tsx`), en `SECCIONES_LEGALES` (`studio/schemaTypes/paginas.ts`) y en el enlace del resumen. El slug no cambia.
2. **Casilla de autorización** (`flujo-pedido.tsx`, líneas 263 a 264). Texto exacto de `microcopy-legal.md` §4.3 v0.4:
   `Autorizo a {responsableDatos} a tratar mis datos personales para gestionar este pedido: confirmarlo, coordinar la entrega con la transportadora o el mensajero {FINALIDAD_EN_AUTORIZACION[…]}. Entiendo que el pedido se envía por WhatsApp (Meta), que puede tratar mis datos fuera de Colombia. Más en la ` + enlace `política de tratamiento de datos` + `.`
   - `FINALIDAD_EN_AUTORIZACION` no cambia.
   - Las casillas siguen sin marcar y separadas.
   - La casilla de términos no cambia.
   - Si alguna prueba e2e busca el texto antiguo, hay que actualizarla.
3. **Datos del vendedor** (si P10 = sí; LEG-055).
   - En `pie.tsx` y `legal/[slug]/page.tsx`, mostrar cada dato que exista, en lugar de exigir los cuatro.
   - En el resumen, bajo las casillas: `Te vende {razon_social} · NIT {nit}. ` + enlace `Información del vendedor` (a `/legal/vendedor/`).
   - `vendedorCompleto` se puede conservar para un aviso de `npm run datos` («falta el domicilio del vendedor: bloquea el lanzamiento»).
4. **Plazo de entrega** (después de P1). Columnas `plazo_estimado` (texto) y `plazo_maximo_dias_habiles` (número, vacío en la opción A) en `data/tarifas_envio.csv` o en un CSV nuevo por zona.
   - Resumen, bajo la línea de envío: microcopy §5.6.
   - `/envios/`: reemplazar la constante `PLAZOS` por esos datos. El título pasa a «Plazos de entrega» y la frase a `El estimado es una referencia. El máximo es el plazo que nos comprometemos a cumplir; si no lo cumplimos, puedes cancelar y te devolvemos todo en 15 días calendario.` En la opción A, la frase es `Son estimados. Nos comprometemos a entregar en máximo 30 días calendario.`
5. **Retracto en el resumen** (después de P2). En el párrafo de la nota bajo los totales (línea 241), el texto de la alternativa elegida (microcopy §5.3). Si es la B, también en la ficha, junto al selector de molienda.
6. **`/envios/`, línea 117:** `¿Tu destino es de zona 5 o pides más de 5 kg?` (LEG-058).
7. **Catálogo** (LEG-024, P9).
   - Café Arreboles con `activo = no` mientras `registro_sanitario` esté vacío. Se recomienda que `npm run datos` falle si un café activo no tiene registro.
   - Columna `fabricante` (y `fabricante_expresion`: `FABRICADO POR` o `ENVASADO POR`), mostrada según microcopy §3 solo si existe.
8. **Mensaje de WhatsApp** (`mensaje-whatsapp.ts`, línea 57; si P11 = sí; LEG-053). `¡Hola, ${p.nombreTienda}! Quiero hacer este pedido:`. Actualizar `mensaje-whatsapp.test.ts`.
9. **Prueba de la aceptación** (LEG-050, con la entrega 1).
   - Agregar `version_terminos` y `version_politica_datos` a `data/config.csv` y validarlos.
   - En el mensaje, después de `Forma de pago:`, la línea exacta de microcopy §5.2. Debe contar dentro del límite de 2.000 caracteres: si no cabe, se resumen las indicaciones como hoy, y la línea nunca se recorta.

**Para `disenador-marca`.** La línea «Te vende…» y la línea de retracto van en `caption` gris, como la nota actual del resumen. No cambia nada más de la presentación.

## Puntos para que QA verifique

- `/legal/terminos/`, `/legal/privacidad/`, `/legal/envios-devoluciones/` y `/legal/vendedor/` muestran el texto aprobado con versión y fecha. Ninguna contiene `TODO`, `DECISIÓN`, `VERIFICAR`, `[` ni `<!--`.
- `/legal/privacidad/` muestra la misma versión que `version_politica_datos` y que la línea del mensaje de WhatsApp.
- Las dos casillas aparecen sin marcar, por separado, y sin ellas no se avanza. El texto de la de datos coincide exactamente con la v0.4.
- El mensaje de WhatsApp termina con la línea de aceptación y las versiones correctas, también cuando hay que resumir las indicaciones.
- El resumen muestra «Te vende De Santander SAS · NIT 902121184» y el enlace funciona.
- Café Arreboles no aparece en el catálogo, el sitemap ni `out/` mientras no tenga registro.
- El resumen muestra el plazo de entrega y la línea de retracto que se decidieron.
- `/envios/` ya no dice «¿Tu destino no aparece…?».
- `rg -n "finalizar mi pedido" src out` no devuelve nada (si P11 = sí).
- No hay analítica ni datos personales en localStorage (clave `desantander.carrito.v2`).

## Normas marcadas VERIFICAR

- Ley 1480, arts. 4, 8, 11, 16, 26, 37, 42, 43, 47 (cotejo con SUIN), 50 lits. a) y c), 51 y 58 num. 5.
- Concepto SIC 16-062808 de 2016 en sic.gov.co, y si hay doctrina posterior.
- Decreto 587 de 2016 y su aplicación a Bre-B.
- Decreto 1377 de 2013, arts. 7, 8, 11, 12, 13, 14, 15 y 25, y su numeración en el Decreto 1074 de 2015.
- Circular Única de la SIC, lista vigente de países con nivel adecuado (Estados Unidos; México).
- Decreto 090 de 2018 (umbral del RNBD).
- Ley 2300 de 2023 (alcance para un comercio no vigilado por la Superintendencia Financiera).
- Res. 2674 de 2013 (vigencia de las NSA, titular frente a fabricante).
- Ley 527 de 1999, arts. 14 y 15; Código de Comercio, arts. 845 y 864.
- País de Sanity y de Envia.com; modalidad de WhatsApp.
