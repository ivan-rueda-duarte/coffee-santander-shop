# Revisión LEG-021 a LEG-030: marca propia sin tueste, Historia, descriptor e IVA (2026-11-05)

> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.1 — 2026-11-05.

Anexo a `2026-11-05-envios.md` (LEG-001 a LEG-012) y a `2026-11-05-textos-inicio-confirmacion.md` (LEG-013 a LEG-020).

**Hechos nuevos que informa el dueño (2026-11-05):**
1. La marca **comercializa** el café y **no lo tuesta**. Se retiró «tueste por lotes» del sitio y de `PRODUCT.md`.
2. El descriptor es «café de origen».
3. El café **no tiene IVA**, según el dueño. Falta la confirmación del contador.

**Alcance:** estado del árbol de trabajo del 2026-11-05.
- `src/ui/componentes/layout/secciones-inicio.tsx`: portada, «Cómo pedir» e Historia de respaldo.
- `src/ui/componentes/layout/pie.tsx`.
- `src/app/layout.tsx`: metadatos.
- `src/ui/componentes/checkout/flujo-pedido.tsx`: pantalla de confirmación.
- `data/catalogo.csv` y `data/productores.csv`.
- `PRODUCT.md`.

## Normas usadas y estado de verificación

| Norma | Contenido que se usa | Estado |
|---|---|---|
| Ley 1480 de 2011, art. 5 num. 9 («productor»), num. 11 («proveedor o expendedor») y num. 13 («publicidad engañosa») | El productor es quien diseña, produce, fabrica, ensambla o importa. El proveedor es quien ofrece, distribuye o comercializa. La publicidad engañosa es la que no corresponde a la realidad o es insuficiente, de modo que induce o puede inducir a error. | Leído en la transcripción de la Agencia Colombia Compra Eficiente (relatoria.colombiacompra.gov.co). VERIFICAR contra SUIN-Juriscol: la Secretaría del Senado y Función Pública no estuvieron accesibles. |
| Ley 1480, art. 10 | Productor y proveedor responden solidariamente por la garantía legal. | Misma fuente. VERIFICAR. |
| Ley 1480, arts. 23 y 24 | Información clara, veraz, suficiente y en castellano. Contenido mínimo de la información. | Misma fuente. VERIFICAR. |
| Ley 1480, arts. 29 y 30 | Las condiciones objetivas que se anuncian obligan al anunciante. Se prohíbe la publicidad engañosa. | Misma fuente. Con esto se resuelve el VERIFICAR del art. 29 que se dejó en LEG-013 a LEG-020, sujeto a cotejo con SUIN. |
| Ley 1480, art. 50 lit. c) | Hay que informar el precio total, con todos los impuestos, costos y gastos, y los gastos de envío por separado. | Misma fuente. La transcripción puede no reflejar la Ley 2439 de 2024, que modificó los literales b), g) y h) pero no el c). VERIFICAR la letra consolidada. |
| Resolución 5109 de 2005 (MinProtección): art. 4 num. 1 y art. 5 nums. 5.1, 5.4.1, 5.5, 5.6 y 5.8 | El rótulo no puede presentar el alimento de forma falsa, equívoca o engañosa. Debe llevar el nombre que indique la verdadera naturaleza del alimento. Debe llevar el nombre o la razón social y la dirección del fabricante, envasador o reempacador, precedidos de «FABRICADO POR» o «ENVASADO POR». Debe llevar lote, fecha de vencimiento o de duración mínima, y registro sanitario. | Leído en la Compilación Jurídica del Invima (normograma.invima.gov.co). La Resolución 557 de 2022 modificó el art. 4. VERIFICAR si esa modificación afecta el num. 1. |
| Resolución 2674 de 2013 | Registro, permiso o notificación sanitaria según el riesgo. Titular y fabricante en la maquila. | No leída en esta sesión. VERIFICAR: la clasificación de riesgo del café tostado, la modalidad que corresponde y si el titular puede ser De Santander cuando un tercero fabrica. |
| Decisión 486 de la CAN, art. 158 (agotamiento del derecho de marca) | Reventa de productos legítimos de marca ajena. | No verificada. VERIFICAR. Solo es relevante si se confirma el caso de LEG-023. |

## Hallazgos

| # | Severidad | Ubicación | Texto o práctica | Riesgo y norma | Corrección propuesta |
|---|---|---|---|---|---|
| LEG-021 | Alta (no publicar) | `secciones-inicio.tsx`, línea 101 (Historia de respaldo, párrafo 1) | «…y llevamos su café desde el productor hasta tu casa.» | No es demostrable. Hay cinco problemas. (1) «Hasta tu casa» no siempre es cierto: en zona 5 y en algunos municipios la guía queda en «reclamar en oficina» (`envios-devoluciones-retracto.md` §6). (2) «Llevamos» atribuye a la marca un transporte que hace una transportadora o un agregador. (3) «Desde el productor» omite un eslabón: un tercero tuesta y empaca el café. Además, puede sugerir una relación directa con la finca que no consta, porque no se sabe si la marca compra a la finca o al tostador (LEG-022). (4) Es una condición objetiva y, por el art. 29, obliga al anunciante. (5) Es en sustancia la misma promesa que se rechazó en LEG-015. Normas: arts. 23, 29 y 30 y art. 5 num. 13 de la Ley 1480. | **Aprobado con cambio.** Usar la redacción final de LEG-021 que aparece al final de este documento. |
| LEG-022 | Alta (decisión del cliente) | «marca propia» en la Historia (línea 101), la bajada de la portada (línea 27), `pie.tsx` (línea 23), `layout.tsx` (línea 27) y `PRODUCT.md` (líneas 19, 25 y 40) | «De Santander es una marca propia de café de origen» | «Marca propia» es veraz si el café se vende **con la marca De Santander en el empaque** y un tercero lo tuesta y empaca para la marca (maquila). No dice que la marca fabrique, y el consumidor sabe quién fabrica porque el rótulo lo identifica (Res. 5109, art. 5 num. 5.4.1). Induce a error si el café se compra ya tostado y empacado **con la marca del tostador** y la tienda solo lo revende (art. 5 num. 13 y art. 30 de la Ley 1480; Res. 5109, art. 4 num. 1). También induce a error si la ficha o el rótulo callan quién lo fabrica. `PRODUCT.md` (línea 19) dice que la marca «comercializa café de fincas… con su nombre». Eso apunta al primer caso, pero no consta cómo se compra el café ni quién lo empaca. | Decisión 1 del cliente. Mientras no se confirme el modelo A, «marca propia» queda **condicionado**. Si el modelo es B o C, se cambia por los textos alternativos de abajo. |
| LEG-023 | Alta (aclarar antes de publicar) | `data/catalogo.csv`: «Café Casa Martínez» y «Café Arreboles»; `PRODUCT.md`, línea 40 | Los nombres de los cafés cambiaron respecto a `PRODUCT.md` («Café Barichara», «Café Oiba»…). Los nuevos parecen nombre de familia o de finca, o marca de un tostador. | Si «Casa Martínez» o «Arreboles» son marcas de un tercero, presentarlas como líneas de una «marca propia» induce a error sobre el origen empresarial (arts. 23 y 30 de la Ley 1480), y el uso de la marca debe ajustarse a lo que permita su titular. Si «Martínez» es el apellido de una familia productora, se recomienda pedirle autorización escrita para usar su nombre. Esto es buena práctica y no una exigencia literal de las normas citadas. VERIFICAR el registro de esas marcas ante la SIC. `productores.csv` está vacío, así que el sitio no puede explicar a quién corresponden los nombres. | El cliente debe confirmar a quién pertenecen los nombres (decisión 2). `TODO(dato)`: titular de cada nombre, autorización de uso y registro marcario. |
| LEG-024 | **Bloqueante** (para lanzamiento; ya existía) | `data/catalogo.csv`, columna `registro_sanitario` vacía en los dos cafés; no hay columna para el fabricante o tostador; ficha del café | Producto sin registro, permiso o notificación sanitaria publicado, y sin identificar quién lo fabrica o envasa | Res. 2674 de 2013 (VERIFICAR modalidad y riesgo) y Res. 5109, art. 5 nums. 5.4.1 y 5.8. Arts. 23 y 24 de la Ley 1480 (información sobre el producto). Ahora que la marca no tuesta, el «FABRICADO POR» o «ENVASADO POR» del rótulo será un tercero, y la ficha no debe contradecir el rótulo. | El producto sin registro sanitario no se vende. Para la ficha, ver la entrega 3: el fabricante y el número se muestran solo cuando el dato exista. |
| LEG-025 | Media | Historia de respaldo (`secciones-inicio.tsx`, líneas 104 a 107 y 138): «Del cafetal a la taza», «Recolección manual en el punto de maduración», «Secado al sol» | Afirmaciones sobre prácticas que hacen terceros, las fincas | Las confirmó la marca (`PRODUCT.md`, Brand Commitments), pero la marca no cultiva ni beneficia. Se publican como generales, así que deben ser ciertas para **todos** los cafés que se venden (arts. 23 y 29). | Conservar solo con soporte escrito de cada finca o del proveedor (`TODO(dato)`). Si algún café no cumple, retirar el paso o decirlo café por café. El título «Del cafetal a la taza» se aprueba: describe el recorrido del café y no atribuye a la marca el cultivo ni el transporte. |
| LEG-026 | Informativa (**cierra LEG-013**) | Bajada (línea 27), antetítulo «Café de origen · Santander» (línea 35), pie (línea 23) y metadatos (`layout.tsx`, línea 27) | «café de origen» en lugar de «café de especialidad» | Es demostrable si cada café indica provincia y municipio con soporte del proveedor (LEG-017). El antetítulo no reproduce la denominación de origen «Café de Santander». | **Cerrado.** Se recomienda no combinar nunca las palabras de modo que se lea «Café de Santander», y conservar el punto medio del antetítulo. La explicación de la escala SCA en la ficha (`ficha-cafe.tsx`, línea 118) se puede mantener porque solo aparece con un puntaje verificado. |
| LEG-027 | Informativa (**cierra LEG-014**) | Bajada de la portada (T1) | «Café de origen de marca propia, de provincias de Santander. Elige tu provincia y pide por WhatsApp.» | Sin artículo definido: no promete cafés de todas las provincias. | **Aprobado**, con la condición de LEG-022 sobre «marca propia». Si el modelo es B o C, usar la alternativa de abajo. |
| LEG-028 | Informativa | T3 (Historia, párrafo 2), T4 (título), T5 (confirmación con tarifa) y T7 (botón) en `secciones-inicio.tsx` (línea 102) y `flujo-pedido.tsx` (líneas 279, 286 y 292) | Textos aprobados por el dueño | T3: los dos cafés del CSV tienen municipio, altitud, variedad y proceso. Sigue pendiente el soporte del proveedor (LEG-017). T4, T5 y T7 coinciden exactamente con los textos finales de LEG-013 a LEG-020. T5 es coherente con la alternativa (b) del momento de formación del contrato. | **Aprobados.** T3 queda condicionado a LEG-017. T5 queda condicionado a que los términos sigan la alternativa (b) y a que `PRODUCT.md` (línea 29) se alinee (LEG-030). |
| LEG-029 | Alta (condición previa al lanzamiento; **antes Bloqueante**, LEG-001 punto 5) | `totales-pedido.tsx` («Total», «Total sin envío»), precio de las fichas, mensaje de WhatsApp y página `/envios/` | Según el dueño, el café no tiene IVA. Hoy no se rotula «IVA incluido». | El art. 50 lit. c) exige el precio total con todos los impuestos. Si la declaración del dueño es correcta, el precio publicado ya es el total y no hace falta ningún rótulo. «IVA incluido» sería inexacto (art. 23). Este documento no concluye sobre la tarifa del café tostado ni sobre el flete. | Ver la sección «IVA: qué se muestra». El hallazgo deja de ser bloqueante como **declaración del cliente pendiente de confirmación escrita del contador**, y esa confirmación es condición para lanzar. |
| LEG-030 | Baja | `PRODUCT.md`, líneas 29 («el pedido existe solo cuando el cliente envía ese mensaje») y 40 (ejemplos de nombres de cafés) | Documento interno incoherente con T5 y T6 y con el catálogo | No es texto público, pero sirve de fuente a los demás agentes. | Alinear al resolver la decisión 1 de LEG-013 a LEG-020 y LEG-023. Lo edita quien tenga autorización. |

## Análisis de «marca propia» y del fabricante (LEG-022, LEG-024)

**Qué exige la norma.**
- **Ley 1480 de 2011.** Quien comercializa es **proveedor** (art. 5 num. 11). Quien tuesta es **productor**, porque fabrica (art. 5 num. 9). Los dos responden solidariamente por la garantía (art. 10) y deben dar información veraz y suficiente (arts. 23 y 24). Que De Santander no tueste no la libera frente al consumidor.
- **Rótulo (Res. 5109 de 2005, art. 5).** La bolsa debe llevar:
  - el nombre que indique la verdadera naturaleza del alimento, por ejemplo café tostado en grano o tostado y molido (num. 5.1);
  - el nombre o la razón social y la dirección del fabricante, envasador o reempacador, precedidos de «FABRICADO POR» o «ENVASADO POR» (num. 5.4.1);
  - el lote (num. 5.5);
  - la fecha de vencimiento o de duración mínima (num. 5.6);
  - el registro sanitario (num. 5.8);
  - el contenido neto y los demás requisitos del art. 5.
- **Marca De Santander en el rótulo.** La marca puede figurar como marca o nombre de fantasía, siempre que vaya con la denominación del alimento (num. 5.1). VERIFICAR si la Res. 2674 de 2013 o la Res. 5109 exigen o admiten una mención del tipo «fabricado por X para De Santander S.A.S.» cuando De Santander es titular del registro y otro fabrica.
- **Registro sanitario.** VERIFICAR con un asesor sanitario o con el Invima la modalidad y el titular que corresponden (Res. 2674 de 2013). No se concluye aquí.

**Qué se recomienda (buena práctica, no exigencia literal para la web).** La ficha web debe repetir lo que dice el rótulo sobre quién fabrica o envasa y el número de registro, para que la información en línea no contradiga la bolsa (art. 23). La Historia puede mencionar que un tostador aliado tuesta el café. Así se neutraliza la lectura de que la marca fabrica.

**Modelos posibles (decisión 1 del cliente).**
- **A. Marca propia con maquila.** De Santander compra el café, verde o en pergamino, a las fincas, o lo compra ya tostado, y un tercero lo tuesta y empaca **con la marca De Santander**. «Marca propia» es veraz. El rótulo identifica al fabricante o envasador. **Recomendado**, si es el caso real.
- **B. Compra de café tostado a granel, que De Santander reempaca con su marca.** «Marca propia» es veraz. En el rótulo, De Santander figura como «ENVASADO POR» (reempacador), con su propio registro o permiso sanitario. VERIFICAR qué exige la Res. 2674. Además, «Trabajamos con fincas» solo es cierto si la marca conoce la finca de cada lote y tiene soporte.
- **C. Reventa de café con marca del tostador.** «Marca propia» **no** es veraz y debe retirarse de la Historia, la bajada, el pie y los metadatos. La tienda se presenta como comercializadora y muestra la marca del tercero como tal (LEG-023).

## IVA: qué se muestra (LEG-029)

**Qué exige la norma.** El art. 50 lit. c) de la Ley 1480 exige mostrar el precio total, con todos los impuestos, costos y gastos, antes de contratar, y el envío por separado. No exige escribir la palabra «IVA».

**Texto que corresponde, con la declaración del dueño.**
- Se dejan los rótulos actuales: `Subtotal`, `Envío a {destino}`, `Total` y `Total sin envío` (este solo en el caso por cotizar). En el mensaje de WhatsApp, lo mismo.
- **No** mostrar «IVA incluido». Sería inexacto si el café no lleva IVA (art. 23).
- **Tampoco** mostrar, por ahora, «Sin IVA», «Excluido de IVA» ni «Exento de IVA». Es una afirmación tributaria que el sitio no necesita y que solo puede escribirse con concepto del contador. Si el contador lo pide para la factura, se redacta con él.
- El precio de la ficha y el de la tarjeta se muestran como hoy, sin rótulo tributario.

**Qué puede cambiar con el flete u otros conceptos (lo define el contador; no se concluye aquí).**
1. **Flete.** El envío lo cobra De Santander al cliente: la tarifa por zona y el mensajero en zona 1. Si el contador determina que ese cobro causa algún impuesto, el valor publicado en el carrito, en el mensaje y en `/envios/` debe ser el **valor final con ese impuesto**. Lo exige la norma: art. 50 lit. c), «todos los impuestos, costos y gastos». No se puede sumar el impuesto después.
2. **Café en grano frente a café molido, y otras presentaciones.** Si el contador da un tratamiento distinto a alguna presentación o a otro producto que se agregue, como un accesorio o un kit de regalo, el precio de esa línea debe incluir el impuesto. Entonces habrá que revisar el rótulo `Total`.
3. **Condición frente a la DIAN y facturación electrónica.** Si la sociedad está obligada a facturar, la factura debe coincidir con el total aceptado por WhatsApp. Esto incide en la cédula o el NIT del comprador, que hoy es opcional. Los textos de la casilla y de la política de datos dependen de esa respuesta.
4. **Cambio posterior.** Si el contador concluye que hay IVA, el cliente debe actualizar los precios del CSV para que el publicado sea el total, o cambiar el rótulo. Eso se hace **antes** del lanzamiento y se dejan sin efecto los pedidos que se cotizaron con el precio anterior. LEG-029 volvería a ser Bloqueante.

**Estado.** LEG-029 deja de ser bloqueante y queda como declaración del cliente, pendiente de confirmación del contador. **Condición para lanzar:** la confirmación escrita del contador sobre (i) el café en grano y el molido, (ii) el flete y el mensajero, y (iii) la obligación de facturar.

## Decisiones que requiere el cliente

1. **Modelo de comercialización (LEG-022).** A, B o C según el análisis de arriba. Hay que informar además quién tuesta y empaca cada café, con qué marca sale la bolsa, quién es el titular del registro sanitario y si la marca compra directamente a las fincas. Se recomienda A. Si el modelo es C, hay que cambiar todos los textos con «marca propia».
2. **Nombres «Café Casa Martínez» y «Café Arreboles» (LEG-023).** (a) Son líneas de De Santander y se tiene autorización de la familia o finca para usar el nombre. (b) Son marcas de un tercero, y la tienda las revende como tales. Si es (b), la decisión 1 debe ser C para esos cafés.
3. **Mención del tostador en la Historia (opcional).** Incluir o no la frase opcional del texto final. Se recomienda incluirla en el modelo A cuando la ficha ya muestre al fabricante.
4. Siguen abiertas: el momento de formación del contrato (LEG-013 a LEG-020, decisión 1; se recomienda (b)) y la frase «Si no lo aceptas, no pagas nada» (LEG-019).

## Datos faltantes

Se registran en `docs/PENDIENTES.md`. Este agente no lo edita.
- `TODO(dato)`: razón social y dirección del fabricante o envasador de cada café, tal como figuran en el rótulo.
- `TODO(dato)`: número de registro, permiso o notificación sanitaria de cada café, y su titular.
- `TODO(dato)`: modelo de compra: ¿a la finca o al tostador? ¿Con qué marca sale la bolsa?
- `TODO(dato)`: titular de los nombres «Casa Martínez» y «Arreboles», autorización de uso y registro marcario ante la SIC.
- `TODO(dato)`: soporte escrito de las fincas o del proveedor sobre recolección manual, secado al sol, altitud, variedad y proceso de cada café.
- `TODO(dato)`: confirmación escrita del contador sobre el IVA del café en grano y molido, el tratamiento del flete y del mensajero, y la obligación de facturación electrónica.
- Siguen abiertos de LEG-001: plazo máximo de entrega, canal de PQR con radicado y datos del vendedor (razón social, NIT, domicilio y correo).

## Entrega para desarrollador-fullstack

1. **Historia, párrafo 1** (`secciones-inicio.tsx`, línea 101, y el texto equivalente en Sanity si existe). Reemplazar por el texto exacto: `De Santander es una marca propia de café de origen. Trabajamos con fincas de familias productoras santandereanas con tradición cafetera y despachamos su café desde Bucaramanga a todo Colombia.` Mantener `Bucaramanga` como dato de la configuración (`tienda.ciudadDespacho`) si el componente lo permite.
   - Frase opcional, solo si el cliente la aprueba (decisión 3) y cuando la ficha ya muestre al fabricante. Se agrega al final del mismo párrafo: `Un tostador aliado tuesta y empaca el café; su nombre está en la bolsa y en la ficha de cada café.`
   - Si la decisión 1 es C, no publicar este párrafo. Usar: `De Santander es una tienda de café de origen santandereano. Vendemos café de fincas de familias productoras de Santander y lo despachamos desde Bucaramanga a todo Colombia.` En ese caso también hay que cambiar la bajada, el pie y los metadatos (punto 2).
2. **Bajada, pie y metadatos.** Sin cambio mientras la decisión 1 sea A o B. Si es C:
   - bajada (`secciones-inicio.tsx`, línea 27): `Café de origen de provincias de Santander. Elige tu provincia y pide por WhatsApp.`
   - pie (`pie.tsx`, línea 23): `Café de origen de provincias de Santander, Colombia.`
   - metadatos (`layout.tsx`, línea 27): `De Santander: café de origen organizado por provincias de Santander, Colombia. Elige por provincia, arma tu pedido y envíalo por WhatsApp.`
3. **Ficha del café: fabricante y registro sanitario** (LEG-024).
   - Agregar al CSV la columna `fabricante`, con la razón social del fabricante o envasador tal como figura en el rótulo, y validarla en `npm run datos`.
   - En la ficha, en el bloque de datos técnicos o bajo «Presentaciones», mostrar exactamente `{FABRICADO POR | ENVASADO POR, según el rótulo}: {fabricante}` y en la línea siguiente `Registro sanitario: {registro_sanitario}`.
   - Cada línea se muestra **solo si el dato existe**. Con la columna vacía no se escribe nada: no poner «pendiente» ni marcadores.
   - Requisito de lanzamiento: un café con `registro_sanitario` vacío no se publica (`activo = no`), o el build avisa. Lo decide el cliente con el desarrollador. La regla legal es que no se vende.
   - Para el modelo A también se puede mostrar `Comercializa: De Santander S.A.S.`. Es una recomendación y debe esperar a que exista el NIT y la razón social confirmada.
4. **IVA** (LEG-029). No agregar «IVA incluido», «Sin IVA» ni «Exento» en ningún lugar. Conservar `Total` y `Total sin envío`. Se retira el punto 9 de la entrega de LEG-001.
5. **Proceso en la Historia** (LEG-025). Sin cambio de texto. Si el cliente no entrega soporte para algún paso, retirarlo del respaldo y de Sanity.

No hay cambio de presentación para `disenador-marca`, salvo ubicar las dos líneas nuevas de la ficha (entrega 3) en el nivel 1 de etiquetas, como dato técnico en Montserrat 500 de 12 px gris.

## Puntos para que QA verifique

- No aparecen en `src/`, Sanity ni `out/`: «desde el productor hasta tu casa», «de la finca a tu casa», «lo tostamos», «tostamos» ni «tueste por lotes».
- No aparecen en ninguna página ni en el mensaje de WhatsApp: «IVA incluido», «Sin IVA», «Exento de IVA» ni «Excluido de IVA».
- El párrafo 1 de la Historia coincide exactamente con la entrega 1, y la ciudad sale de la configuración.
- No aparece «Café de Santander» como texto seguido en ningún lugar, metadatos incluidos.
- Ficha: con `fabricante` y `registro_sanitario` vacíos no se muestra ninguna línea ni ningún marcador. Con datos, las dos líneas aparecen con el texto exacto.
- La bajada, el pie y los metadatos dicen «café de origen» y no «especialidad».
- La confirmación con tarifa, la de por cotizar, el título y el botón coinciden con `microcopy-legal.md` §2.

## Normas marcadas VERIFICAR

- Ley 1480, arts. 5, 10, 23, 24, 29, 30 y 50 lit. c): cotejo con SUIN-Juriscol. Se leyeron en la transcripción de Colombia Compra Eficiente.
- Res. 5109 de 2005: efecto de la Res. 557 de 2022 sobre el art. 4 num. 1.
- Res. 2674 de 2013: riesgo del café tostado, modalidad del registro, titular frente a fabricante en la maquila y la mención «fabricado para».
- Decisión 486 de la CAN, art. 158.

## Textos finales

| Texto | Dictamen | Texto exacto |
|---|---|---|
| T1 bajada | Aprobado (condición LEG-022) | Café de origen de marca propia, de provincias de Santander. Elige tu provincia y pide por WhatsApp. |
| T2 Historia, párrafo 1 | **Aprobado con cambio** (LEG-021) | De Santander es una marca propia de café de origen. Trabajamos con fincas de familias productoras santandereanas con tradición cafetera y despachamos su café desde Bucaramanga a todo Colombia. |
| T2 frase opcional | Decisión 3 | Un tostador aliado tuesta y empaca el café; su nombre está en la bolsa y en la ficha de cada café. |
| T3 Historia, párrafo 2 | Aprobado (condición LEG-017) | En cada café verás la provincia, el municipio, la altitud, la variedad y el proceso. |
| T4 título | Aprobado | Tu pedido está listo para enviar por WhatsApp |
| T5 confirmación con tarifa | Aprobado | Pulsa «Enviar por WhatsApp» y manda el mensaje. Con él nos pides el pedido. Después te respondemos para confirmarlo y acordar el pago. |
| T6 confirmación por cotizar | Aprobado (ya implementado) | Pulsa «Enviar por WhatsApp» y manda el mensaje. Con este mensaje nos pides el pedido. Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor. |
| T7 botón | Aprobado | Enviar por WhatsApp |

## Dictamen

**Textos de esta revisión: Conforme con observaciones**, siempre que se aplique el cambio de LEG-021. Sin ese cambio, el párrafo 1 de la Historia es **No conforme**: es una afirmación no demostrable y ya está en el código. «Marca propia» queda condicionado a la decisión 1.

**Lanzamiento: No conforme.** El motivo ya no es el IVA (LEG-029 pasa a condición previa). Los bloqueos vigentes son:
- **LEG-024:** productos sin registro sanitario y sin identificar al fabricante.
- Falta la identificación del vendedor (razón social, NIT, domicilio y correo; `envios-devoluciones-retracto.md` §1).

Siguen como condiciones previas:
- LEG-029: confirmación del contador;
- LEG-001 punto 4: plazo de entrega;
- LEG-001 punto 11: PQR con radicado;
- LEG-022 y LEG-023: modelo de comercialización y nombres.
