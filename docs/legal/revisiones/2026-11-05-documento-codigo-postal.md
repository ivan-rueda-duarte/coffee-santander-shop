# Revisión LEG-040 a LEG-048: documento de identidad obligatorio y código postal (2026-11-05)

> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.1 — 2026-11-05.

Sigue a `2026-11-05-ajuste-textos-dueno.md` (LEG-031 a LEG-039).

**Pedidos del dueño.**
- (A) Volver **obligatoria** la cédula y agregar un selector de tipo de documento: CC, CE, PPT y pasaporte.
- (B) Agregar el **código postal** a los datos de envío. El dueño pregunta si se puede llenar solo.

**Alcance revisado (árbol de trabajo del 2026-11-05).**
- `src/ui/componentes/checkout/formulario-envio.tsx`, líneas 15 a 28 y 85 a 86.
- `src/ui/componentes/checkout/flujo-pedido.tsx`, líneas 236 a 259 (resumen y casillas).
- `src/domain/pedido/envio.ts`, línea 45 (validación de la cédula).
- `src/domain/pedido/mensaje-whatsapp.ts`, líneas 66 y 95 (línea de la cédula y enlace `wa.me`).
- `src/domain/pedido/persistencia.ts`: el navegador guarda solo líneas, forma de pago y municipio. La cédula no se guarda. Cumple.
- `PRODUCT.md`, decisión del 2026-11-04 (cédula opcional).
- `docs/legal/microcopy-legal.md` v0.2 y `docs/legal/envios-devoluciones-retracto.md` v0.2.
- En `src/` no hay analítica: no aparecen gtag, plausible, umami ni posthog.
- La política de tratamiento de datos **no está redactada**. No existe `docs/legal/politica-tratamiento-datos.md`.

## Normas y estado de verificación

| Norma | Qué se usa | Estado |
|---|---|---|
| Ley 1581 de 2012, art. 4 lit. b) (finalidad) y lit. c) (libertad) | El tratamiento debe tener una finalidad legítima que se informa al titular, y requiere consentimiento previo, expreso e informado | Verificado en el Régimen Legal de Bogotá (Secretaría Jurídica Distrital). Cotejo con SUIN pendiente: el certificado falló |
| Ley 1581 de 2012, art. 5 (datos sensibles) | Lista cerrada: origen racial o étnico, orientación política, convicciones, afiliaciones, salud, vida sexual y datos biométricos | Verificado en la misma fuente |
| Ley 1581 de 2012, art. 12 (deber de informar) | Al pedir la autorización se informa el tratamiento y su finalidad, el carácter facultativo de las respuestas sobre datos sensibles, los derechos del titular y la identificación del responsable | Verificado en la misma fuente |
| Ley 1581 de 2012, art. 4 lit. g) (seguridad) | Medidas para evitar el uso no autorizado | VERIFICAR (no se consultó en esta sesión) |
| Decreto 1377 de 2013, art. 4 (recolección) | No se recolectan datos sin autorización. Los datos deben ser pertinentes y adecuados para la finalidad | Primera frase verificada. La regla de pertinencia y adecuación: VERIFICAR el texto literal |
| Decreto 1377 de 2013, art. 5 (autorización) | La autorización se pide a más tardar al recolectar el dato e informa los datos y las finalidades específicas | Verificado (resumen de la fuente) |
| Decreto 1074 de 2015, arts. 2.2.2.25.2.1 y 2.2.2.25.2.2 (compilación de los arts. 4 y 5 del Decreto 1377) | La misma regla | VERIFICAR la numeración |
| Resolución 3571 de 2003 de la Registraduría | El NUIP tiene 10 dígitos numéricos y empieza en 1.000.000.000. Las cédulas ya expedidas conservan su número | Verificado en el normograma de la Cancillería |
| Resolución DIAN 000042 de 2020, art. 11 num. 3 lit. c), según el Oficio DIAN 900223 de 2022 | Si el adquirente no da su identificación, la factura se expide a «consumidor final» con el número 222222222222 | Verificado en el normograma de la DIAN (Oficio 900223 de 2022) |
| Resolución DIAN 000165 de 2023, que reemplazó a la 042 de 2020 | ¿Mantiene la regla de «consumidor final»? | VERIFICAR con el contador. No se encontró el artículo en esta sesión |
| Anexo técnico de factura electrónica (DIAN) | Códigos de tipo de documento del adquirente (CC, CE, pasaporte, PPT, NIT…) | VERIFICAR con el contador |
| Conjunto «Códigos Postales Nacionales», datos.gov.co, id `ixig-z8b5` | Atribución «Servicios Postales Nacionales - 472, Bogotá D.C.». Licencia CC BY-SA 4.0. 3.681 filas. Filas actualizadas el 2025-05-20 | Verificado en los metadatos y la API del portal |
| Visor oficial del código postal | `https://visor.codigopostal.gov.co/472/visor/`, enlazado como «Conoce tu código postal» desde `https://www.4-72.com.co/`. Permite buscar por departamento, municipio y dirección | Verificado el 2026-11-05 |
| UPU, ficha de direccionamiento de Colombia (10/2022) | 6 dígitos: departamento (2), zona postal (2) y distrito (2) | Verificado |

## Hallazgos

| # | Severidad | Ubicación | Texto o práctica | Riesgo y norma | Corrección propuesta |
|---|---|---|---|---|---|
| LEG-040 | **Alta** (pedido A tal como se pide: **no conforme** hoy) | `envio.ts` línea 45; `formulario-envio.tsx` línea 85 | Volver obligatorio el número de documento para todo pedido | No hay hoy una finalidad demostrable que exija el documento en **todos** los pedidos:<br>(1) **Factura.** Según la regla de «consumidor final» (Res. 042 de 2020, Oficio DIAN 900223 de 2022), la factura puede expedirse aunque el comprador no se identifique. Falta confirmar que la Res. 165 de 2023 la mantiene (VERIFICAR, contador).<br>(2) **Transportadora o agregador.** No consta que la guía exija el documento del destinatario. No se encontró documentación de Mipaquete ni de Envia.com que lo pida (TODO(dato)).<br>(3) **Entrega en oficina.** Allí se muestra el documento físico. No hace falta enviar el número antes.<br>Pedirlo sin necesidad va contra los principios de finalidad y libertad (Ley 1581, art. 4 lits. b y c) y contra la regla de pertinencia y adecuación del Decreto 1377, art. 4 (VERIFICAR el texto literal). Además condiciona la compra a un dato que no se necesita. | **Alternativa recomendada:** número de documento **opcional**, con selector de tipo, y solo para la factura a nombre del comprador (textos de la §4 de `microcopy-legal.md` v0.3, modo opcional).<br>**Obligatorio** solo si se acredita por escrito una de estas condiciones: (a) la transportadora o el agregador exige el documento del destinatario para generar la guía, también en contraentrega; o (b) el contador confirma que la sociedad debe identificar a todo comprador. En ese caso se usan los textos del modo obligatorio, con la finalidad que se haya acreditado. |
| LEG-041 | Media | `formulario-envio.tsx` línea 85, ayuda | «Solo si la necesitas para factura o la transportadora.» | La finalidad es ambigua. El cliente no «necesita» la cédula para la transportadora: si alguien la necesita, es la tienda. La ayuda menciona una finalidad (transportadora) que no está acreditada (LEG-040). Va contra el deber de informar la finalidad (Ley 1581, art. 12 lit. a). | Texto de ayuda de la §4.2 del microcopy, modo opcional. |
| LEG-042 | Media | `formulario-envio.tsx` línea 85, etiqueta; `envio.ts` línea 45, validación `^\d{6,10}$` y error «La cédula debe tener entre 6 y 10 dígitos.» | La etiqueta «Cédula» y la validación solo sirven para la cédula de ciudadanía | Quien se identifica con cédula de extranjería, PPT o pasaporte no puede escribir su número, que puede llevar letras. El mínimo de 6 dígitos no tiene fuente: la Res. 3571 de 2003 solo fija el máximo de 10 dígitos del NUIP, y las cédulas anteriores conservan su número. El mínimo puede rechazar cédulas antiguas válidas (VERIFICAR con la Registraduría). Afecta la información clara (art. 23 de la Ley 1480) y el trato igual a los consumidores extranjeros. | Etiqueta «Número de documento», selector «Tipo de documento» y las reglas de validación de la sección «Reglas de validación». |
| LEG-043 | Media | `mensaje-whatsapp.ts` líneas 66 y 95 | El número va completo en el texto del mensaje, y el mensaje va en la URL `wa.me/…?text=` | Es necesario y proporcionado si el número se usa para la factura o la guía: un número enmascarado no le sirve a la tienda y la obligaría a pedirlo otra vez por el chat. Si no se necesita, **no se recoge**; enmascararlo no corrige la falta de finalidad. Riesgos de seguridad (Ley 1581, art. 4 lit. g, VERIFICAR):<br>(1) la URL queda en el historial del navegador y pasa por los servidores de Meta;<br>(2) el mensaje queda en el teléfono del cliente y en el de la tienda.<br>Lo mitiga que el dato no se guarde en el navegador (cumple hoy) y que no haya analítica (cumple hoy). | No enmascarar. Incluir el número completo solo si el cliente lo escribió. Mantener que no se guarde en `localStorage` ni en ninguna analítica futura. La política debe informar que el dato viaja en el mensaje por WhatsApp (Meta). Línea exacta en §4.4 del microcopy. |
| LEG-044 | Media | `flujo-pedido.tsx` líneas 247 a 248, casilla de autorización | «…para gestionar este pedido… Entiendo que el pedido se envía por WhatsApp (Meta).» | «Gestionar este pedido» es una finalidad genérica: no dice que el documento se usa para la factura ni que los datos se entregan a la transportadora. Tampoco identifica al responsable, como exige el art. 12 lit. d de la Ley 1581 (al menos con un enlace a la política). | Casilla de la §4.3 del microcopy: identifica al responsable y enumera las finalidades. Sigue separada de la de términos y sin marcar. |
| LEG-045 | Baja (**corregido** en `docs/legal/`) | `envios-devoluciones-retracto.md` v0.2, §6 | «Lleva tu cédula para reclamar el paquete.» | Excluye a quien se identifica con cédula de extranjería, PPT o pasaporte (art. 23 de la Ley 1480). | Cambiado en la v0.3 a «Lleva tu documento de identidad para reclamar el paquete.». Si la página `/legal/envios-devoluciones/` ya carga el texto de Sanity, hay que actualizarlo. |
| LEG-046 | Informativa (pedido B) | Formulario de envío, campo nuevo | Código postal, ¿autocompletado? | **No se puede autocompletar sin inventar.** El conjunto oficial de 4-72 tiene 3.681 filas para unos 1.100 municipios. En Santander, **ninguno** de los 87 municipios tiene un solo código: Bucaramanga tiene 9, Barichara 3 (1 urbano y 2 rurales). En todo el país solo 3 municipios (DIVIPOLA 91430, 94885 y 19300) tienen un código único. Dentro de un municipio, el código depende de la zona urbana o rural y de la dirección, y en muchas filas el campo de barrios dice «Sin Informacion de Barrios». Asignar el código por municipio llevaría a códigos equivocados, que es peor que dejar el campo vacío (art. 23 de la Ley 1480, información veraz). **Finalidad:** completar la guía de la transportadora. No consta que el agregador lo exija; hay indicios de que Envia.com lo deriva de la ciudad (documentación de integración de Odoo, VERIFICAR con el agregador). Por eso no se justifica hacerlo obligatorio. | Campo **manual y opcional**, con enlace al visor oficial de 4-72. Validación verificada: 6 dígitos, y los 2 primeros deben coincidir con el código DIVIPOLA del departamento elegido (comprobado en los 33 departamentos del conjunto oficial). Textos en §4.5 del microcopy. No se guarda en el navegador. Debe figurar en la política. |
| LEG-047 | **Bloqueante para el lanzamiento** (ya existía; se registra aquí) | Casilla de autorización → `/legal/privacidad/` | La casilla remite a una política de tratamiento que no está redactada ni aprobada | Sin política, la autorización no es informada (Ley 1581, arts. 4 lit. c y 12; Decreto 1377, art. 13, política de tratamiento: VERIFICAR la numeración en el Decreto 1074 de 2015). Agregar un dato de identificación aumenta este riesgo. | Redactar `politica-tratamiento-datos.md`. La sección «Contenido mínimo para la política» de esta revisión fija lo que debe decir sobre el documento y el código postal. |
| LEG-048 | Informativa (decisión del cliente) | Selector de tipo de documento | El dueño pide CC, CE, PPT y pasaporte. No incluye NIT | Los clientes «Negocios» (`PRODUCT.md`) pueden pedir la factura a nombre de una empresa, y para eso se usa el NIT. No es una exigencia legal para el sitio: depende de lo que diga el contador sobre la facturación. | Decisión 3. Si se agrega el NIT, se usan los textos de la §4.2 (opción NIT). |

## 1. Dictamen sobre el documento obligatorio

**¿Es un dato sensible?** No. El número de documento no está en la lista del art. 5 de la Ley 1581. Es un dato personal de identificación: requiere autorización previa e informada y medidas de seguridad, porque permite la suplantación. Su clasificación como dato público o semiprivado no cambia el resultado: VERIFICAR la doctrina de la SIC.

**¿Hay una finalidad concreta y demostrable para pedirlo siempre?**

| Finalidad posible | ¿Justifica pedirlo siempre? | Qué falta |
|---|---|---|
| Factura electrónica a nombre del comprador | No. Justifica pedirlo **como opcional**, a quien quiera la factura a su nombre. Con la regla de «consumidor final», la factura se puede expedir aunque el comprador no se identifique | Confirmación del contador: (i) la sociedad factura electrónicamente estas ventas; (ii) la Res. 165 de 2023 mantiene la regla de «consumidor final»; (iii) códigos de tipo de documento del anexo técnico |
| Guía de la transportadora o del agregador | Solo si el agregador exige el documento del destinatario | Confirmación escrita del agregador (Envia.com o Mipaquete.com), también para contraentrega |
| Entrega en oficina («reclamar en oficina») | No. Se muestra el documento físico al recoger | Nada |
| Prevención de fraude en contraentrega | No está acreditada. Sería una finalidad nueva, y habría que informarla y justificarla | No se propone |

**Conclusión.** Con la información disponible al 2026-11-05, volver obligatorio el número de documento **no es conforme**: no hay una finalidad que lo exija en todos los pedidos. La alternativa conforme es:
1. Mantener el campo **opcional**, con selector de tipo de documento.
2. Usarlo solo para la factura a nombre del comprador.
3. Informar esa finalidad en la ayuda, en la casilla y en la política.

Si el agregador o el contador acreditan por escrito una necesidad general, el campo puede pasar a obligatorio con los textos del modo obligatorio. En ese caso hay que dejar el soporte en `docs/PENDIENTES.md` y actualizar la decisión del 2026-11-04 en `PRODUCT.md`.

**Nombre del campo.** Debe ser **«Número de documento»**, con el selector **«Tipo de documento»**. «Cédula» no comprende el pasaporte ni el PPT, y sería información inexacta para un extranjero (art. 23 de la Ley 1480). En el mensaje de WhatsApp se usa «Documento:» seguido de la sigla del tipo.

## 2. Reglas de validación

Se distinguen dos tipos de reglas:
- **Verificado:** tiene fuente oficial.
- **Decisión de producto:** es un control de tipeo sin fuente oficial y no debe presentarse como requisito legal.

**Normalización (todos los tipos).** Quitar espacios, puntos y guiones, y pasar a mayúsculas antes de validar. Limitar la entrada a 20 caracteres.

| Tipo | Regla | Fundamento |
|---|---|---|
| Cédula de ciudadanía (CC) | Solo dígitos. **Máximo 10**. | Verificado: Res. 3571 de 2003 (NUIP de 10 dígitos). |
| CC, mínimo | **3 dígitos** como control de tipeo. Se recomienda no exigir 6: las cédulas anteriores a 2003 conservan su número y pueden ser más cortas. | Decisión de producto. VERIFICAR con la Registraduría la longitud mínima histórica. |
| Cédula de extranjería (CE) | Letras A–Z y dígitos, de 3 a 20 caracteres. | Decisión de producto. No se encontró una especificación oficial de longitud ni de formato (VERIFICAR con Migración Colombia). |
| Permiso por Protección Temporal (PPT) | Letras A–Z y dígitos, de 3 a 20 caracteres. | Decisión de producto. Las respuestas de Migración Colombia que se consultaron muestran números de 7 dígitos, pero ninguna fuente lo fija como regla. No se impone una longitud exacta (VERIFICAR con Migración Colombia). |
| Pasaporte | Letras A–Z y dígitos, de 3 a 20 caracteres. | Decisión de producto. El formato depende del país emisor. |
| NIT (solo si se decide la decisión 3) | Dígitos, con el dígito de verificación opcional después de un guion. | VERIFICAR la longitud con el contador. |
| Modo opcional | Si el número está vacío, se ignora el tipo. Si hay número, el tipo es obligatorio. | Decisión de producto. |
| Modo obligatorio | Tipo y número obligatorios. | Solo con la condición de LEG-040. |

## 3. Código postal

- **¿Obligatorio u opcional?** Opcional. Su finalidad (ubicar la dirección en la guía) no está acreditada como exigencia del agregador. El pedido se puede gestionar sin él. TODO(dato): ¿el agregador lo pide o lo calcula?
- **¿Autocompletado?** No. Hay fuente oficial y abierta (datos.gov.co `ixig-z8b5`, 4-72, CC BY-SA 4.0), pero el código **no es único por municipio** (LEG-046). Autocompletar solo sería exacto en 3 municipios del país, y ninguno es de Santander.
- **Si en el futuro se usa el conjunto oficial** (por ejemplo, para validar que el código pertenece al municipio):
  - Se debe dar crédito «Fuente: Servicios Postales Nacionales S.A.S. (4-72), datos.gov.co, licencia CC BY-SA 4.0», y la tabla derivada queda bajo la misma licencia.
  - Se debe registrar la fecha de la copia; la última actualización de filas es del 2025-05-20.
  - No se recomienda para esta fase.
- **Validación con fuente.** 6 dígitos, con los 2 primeros iguales al código DIVIPOLA del departamento (comprobado: en el conjunto oficial, el menor y el mayor código de cada uno de los 33 departamentos empiezan por su código). El formulario ya tiene ese código (`DEPARTAMENTOS[].codigo`).
- **Enlace.** Al visor oficial `https://visor.codigopostal.gov.co/472/visor/`, en una pestaña nueva. El sitio no le envía ningún dato al visor: el cliente consulta por su cuenta.
- **Política.** Debe listar el código postal entre los datos de envío.

## Contenido mínimo para la política de tratamiento (cuando se redacte)

Exige la norma (Ley 1581, art. 12; Decreto 1377, arts. 5 y 13, VERIFICAR):
1. **Datos tratados.** Nombre, celular, correo (opcional), departamento, municipio, dirección, barrio (opcional), código postal (opcional), indicaciones (opcional), forma de pago y, solo si el cliente lo escribe, tipo y número de documento.
2. **Finalidad de cada dato.**
   - Documento: emitir la factura electrónica a nombre del comprador.
   - Dirección y código postal: generar la guía y entregar.
   - Celular: coordinar el pedido y la entrega.
   - Ninguno se usa con fines promocionales sin una autorización aparte (Ley 2300 de 2023, VERIFICAR su alcance).
3. **Carácter facultativo.** El documento, el correo, el barrio, el código postal y las indicaciones son opcionales. El número de documento no es un dato sensible.
4. **Cómo viajan los datos.** El sitio no guarda los datos: el cliente los envía en su mensaje por WhatsApp (Meta Platforms), que puede tratarlos fuera de Colombia. Hay que analizar la transmisión o transferencia internacional (art. 26 de la Ley 1581), que es el riesgo conocido 4.
5. **Terceros.** La transportadora o el agregador, con su país, y el proveedor de facturación electrónica [TODO(dato)].
6. **Conservación del documento.** Solo por el tiempo que exija la norma tributaria y contable para la factura. TODO(dato): plazo, que lo define el contador. No se concluye aquí.

Se recomienda que la política sea la v1.0 y que `data/config.csv` lleve `politica_datos_version` con el mismo valor. Hoy ese campo no existe en `data/config.csv`: VERIFICAR con el desarrollador.

## Decisiones que requiere el cliente

1. **Documento (pedido A).**
   - (a) **Opcional**, con selector de tipo, solo para la factura a nombre del comprador. **Recomendado.**
   - (b) **Obligatorio.** Solo con soporte escrito del agregador (guía) o del contador (identificación de todo comprador). Hay que indicar cuál de las dos finalidades se acredita, porque cambia el texto de ayuda.
   - (c) **Quitar el campo** y pedir el documento por el chat solo a quien quiera la factura a su nombre. Es la opción de mayor minimización. Requiere un texto en la confirmación.
2. **Código postal (pedido B).**
   - (a) Opcional y manual, con enlace al visor de 4-72. **Recomendado.**
   - (b) No agregarlo hasta que el agregador diga si lo necesita.
   - El autocompletado se descarta por falta de una correspondencia única (LEG-046).
3. **NIT en el selector (LEG-048).**
   - (a) Agregar «NIT» para negocios.
   - (b) No agregarlo; los negocios dan su NIT por el chat.
   - Depende del contador.

## Datos faltantes

Se registran en `docs/PENDIENTES.md`.
- TODO(dato): ¿el agregador (Envia.com o Mipaquete.com) exige el documento del destinatario para generar la guía, también en contraentrega? ¿Exige el código postal o lo calcula a partir de la ciudad?
- TODO(dato): confirmación del contador:
  - si la sociedad emite factura electrónica por estas ventas;
  - si la regla de «consumidor final» sigue vigente con la Res. 165 de 2023;
  - los códigos de tipo de documento;
  - el plazo de conservación del documento.
- TODO(dato): decisiones 1 a 3.

## Puntos para que QA verifique

- No hay ninguna casilla premarcada. La casilla de autorización sigue separada de la de términos.
- En el modo opcional se puede enviar el pedido con el documento vacío y no aparece ningún error.
- Con un número escrito y sin tipo, aparece «Elige el tipo de documento.».
- CC: se rechazan las letras y los números de más de 10 dígitos. Se acepta «1.098.765.432», que queda normalizado como `1098765432`.
- CE, PPT y pasaporte: se aceptan letras y números. Se rechazan los símbolos.
- El código postal se rechaza si no tiene 6 dígitos o si no empieza por el código del departamento elegido (por ejemplo, Santander exige 68).
- El enlace del visor abre `https://visor.codigopostal.gov.co/472/visor/` en una pestaña nueva, con `rel="noopener noreferrer"`.
- El mensaje de WhatsApp lleva `Documento: {sigla} {número}` y `Código postal: {código}` solo si el cliente los escribió. Las líneas «Cédula:» ya no aparecen.
- `localStorage` (clave `desantander.carrito.v2`) no contiene el documento ni el código postal.
- `rg -n "Cédula" src out` no devuelve etiquetas de interfaz. Se permite el texto «Cédula de ciudadanía» como opción del selector.

## Dictamen

- **Pedido A tal como se pide (documento obligatorio): No conforme**, mientras no exista el soporte de LEG-040.
- **Pedido A con la alternativa recomendada** (opcional, con selector y textos de la §4): **Conforme con observaciones**. Las observaciones son la confirmación del contador sobre la factura y la redacción de la política (LEG-047).
- **Pedido B** (código postal opcional y manual, con enlace oficial): **Conforme con observaciones**. La observación es confirmar con el agregador.
- **Lanzamiento: No conforme**, sin cambios: LEG-024 (registro sanitario y fabricante), la falta del domicilio del vendedor y LEG-047 (política de datos sin redactar).

## Entrega para desarrollador-fullstack

Los textos exactos están en `docs/legal/microcopy-legal.md` v0.3, §4. Hay que copiarlos sin cambios. Resumen de lo que se toca:

1. **`src/ui/componentes/checkout/formulario-envio.tsx`**
   - `ValoresEnvio` y `ENVIO_VACIO`: agregar `tipoDocumento` y `codigoPostal`. Cambiar el nombre de `cedula` a `numeroDocumento`.
   - Reemplazar el campo de la línea 85 por el selector «Tipo de documento» y el campo «Número de documento» (§4.1 y §4.2). En el modo opcional, ambos llevan «(opcional)».
   - `inputMode` del número: `numeric` si el tipo es CC (o NIT); `text` en los demás. `autoComplete="off"`.
   - Agregar el campo «Código postal» (opcional) después de «Municipio», con `inputMode="numeric"`, `autoComplete="postal-code"`, `maxLength={6}`, y la ayuda con el enlace al visor (§4.5).
   - Ni el documento ni el código postal van a `guardarPreferencias`.
2. **`src/domain/pedido/envio.ts`**
   - Esquema `tipoDocumento`: enumeración `CC | CE | PPT | PAS` (y `NIT` si se decide la decisión 3).
   - `numeroDocumento`: normalizar y validar según la sección 2 de esta revisión, con los mensajes de §4.2.
   - `codigoPostal`: `^\d{6}$` y prefijo igual al código DIVIPOLA del departamento. Para eso, el esquema necesita el mapa nombre → código del departamento: se recomienda pasarlo a `crearEsquemaEnvio` para que `domain` no importe `src/data`.
   - Un parámetro o una constante `DOCUMENTO_OBLIGATORIO = false`, de modo que la decisión 1 (b) se active sin reescribir.
3. **`src/domain/pedido/mensaje-whatsapp.ts`**, línea 66
   - Reemplazar por `Documento: {sigla} {numeroDocumento}`, solo si existe (§4.4).
   - Después de `Ciudad:` agregar `Código postal: {codigoPostal}`, solo si existe.
   - Siglas: CC, CE, PPT, Pasaporte (y NIT).
4. **`src/ui/componentes/checkout/flujo-pedido.tsx`**
   - Líneas 247 a 248: casilla de autorización de la §4.3. La razón social sale de `data/config.csv` (`razon_social`).
   - Resumen, bloque «Envío a» (líneas 236 a 239): agregar `Documento: {sigla} {número}` y `Código postal: {código}` cuando existan, para que el cliente los revise antes de enviar.
5. **Pruebas.**
   - Actualizar `envio.test.ts` y `mensaje-whatsapp.test.ts`: el texto «Cédula: 1098765432» pasa a ser «Documento: CC 1098765432».
   - Agregar casos por tipo y casos del código postal.
6. **`PRODUCT.md`.** Si el cliente elige la decisión 1 (b), hay que actualizar la decisión del 2026-11-04. Si elige (a), se agrega: «tipo y número de documento y código postal, opcionales».

**Para `disenador-marca`.** El selector y el campo de documento van en una sola fila en escritorio y apilados en celular. El enlace del visor va dentro de la ayuda, subrayado, sin icono de marca de terceros.
