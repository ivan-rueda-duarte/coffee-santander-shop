> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 1.0 — 2026-11-06.

# Información del vendedor

Se publica en `/legal/vendedor/` con el rótulo «Versión 1 · vigente desde 2026-11-06» y alimenta el pie del sitio, el resumen del pedido y el bloque «Quién vende» de los demás documentos. Los datos salen de `data/config.csv`; este documento fija el texto público y las claves que el desarrollador debe crear.

**Qué se publica.** La sección «Texto para el consumidor», tal cual (subtítulos, párrafos y listas; sin enlaces ni tablas). Lo demás no se publica.

**Estado.** Publicación instruida por el dueño (2026-11-06, «Paquete legal v1»). Revisión del abogado pendiente (L1). El paquete pide cotejar el domicilio y la dirección de notificación con el certificado de existencia y representación legal y con el RUT **antes de publicar** (D-1); legal no pudo hacerlo.

Cambios de la v1.0 (Paquete legal v1, 2026-11-06; revisión LEG-081 a LEG-100): datos completos (NIT con dígito de verificación, matrícula mercantil, representante legal, domicilio, dirección y correo de notificación judicial, correo de atención, área de datos); el pie y el resumen muestran razón social, NIT, domicilio, dirección y correo de notificación, correo de atención y WhatsApp; ya no se ocultan datos. «Cómo te atendemos» recoge el retracto de 5 días hábiles, la reversión para Bre-B y las PQR. Se conserva el modelo C (comercializadora de café de otras marcas).

## Fundamento

- **Exige la norma.** En el comercio electrónico, el proveedor debe informar de forma cierta, fidedigna, suficiente, clara, accesible y actualizada su identidad e información legal y de contacto: razón social, NIT, dirección de notificación judicial, teléfono y correo electrónico (Ley 1480 de 2011, art. 50 lit. a; VERIFICAR la letra contra SUIN-Juriscol).
- **Exige la norma.** El responsable del tratamiento debe identificarse en la política de datos con razón social, domicilio, dirección, correo y teléfono (Decreto 1377 de 2013, art. 13, compilado en el Decreto 1074 de 2015; VERIFICAR la numeración).
- **Se recomienda.** Que el nombre coincida letra por letra con el certificado de Cámara de Comercio y el RUT («De Santander SAS», según el paquete). Que la matrícula mercantil y el representante legal se publiquen solo en esta página y en los documentos legales, no en el pie ni en el resumen: la norma no los exige allí y el nombre del representante es un dato personal (LEG-085).

## Datos (fuente: Paquete legal v1 del dueño, 2026-11-06)

| Dato | Valor | Clave propuesta en `data/config.csv` | Estado |
|---|---|---|---|
| Razón social | De Santander SAS | `razon_social` (existe) | Cargado. Cotejar «SAS» con el certificado (D-2). |
| NIT | 902.121.184-8 | `nit` (existe; hoy `902121184`, sin dígito) | Actualizar a `902.121.184-8` o guardar el dígito en `nit_dv,8` y formatear en el código. |
| Matrícula mercantil | 740574 | `matricula_mercantil` (nueva) | Cámara de Comercio no indicada en el paquete: no se publica el nombre de la cámara. |
| Representante legal | Ivan Fernando Rueda Duarte | `representante_legal` (nueva) | Solo en `/legal/vendedor/` y en los documentos. |
| Domicilio | Bucaramanga, Santander | `domicilio` (existe, vacío) | Cargar. Cotejar con el certificado (D-1). |
| Dirección de notificación judicial | Calle 37 n.° 23-77, apartamento 702, Bucaramanga, Santander | `direccion_notificacion` (nueva) | Cotejar con el certificado y el RUT (D-1). |
| Correo de notificación judicial | desantander.tienda@gmail.com | `correo_notificacion` (nueva) | Igual al de atención: en el pie se muestra una sola vez con el rótulo doble. |
| Correo de atención | desantander.tienda@gmail.com | `correo_contacto` (existe) | Cargado. |
| WhatsApp | +57 300 112 9874 | `whatsapp` (existe) | Cargado. |
| Despacho | Bucaramanga | `ciudad_despacho` (existe) | Cargado. No sustituye el domicilio. |
| Área de datos personales | Área comercial, desantander.tienda@gmail.com | `area_datos` (nueva, opcional) | Se usa en la política §1. |

## Texto para el consumidor

### Quién te vende
De Santander SAS es la sociedad que opera esta tienda y comercializa los cafés que ves en ella. No los cultivamos, no los tostamos, no los molemos ni los empacamos: cada café lleva la marca y el nombre del fabricante en la bolsa y en su ficha. Ante ti respondemos nosotros por el pedido, el pago, el envío, la garantía y los reclamos.

- Razón social: De Santander SAS.
- NIT: 902.121.184-8.
- Matrícula mercantil: 740574.
- Representante legal: Ivan Fernando Rueda Duarte.
- Domicilio: Bucaramanga, Santander.
- Dirección de notificación judicial: Calle 37 n.° 23-77, apartamento 702, Bucaramanga, Santander.
- Correo de notificación judicial y de atención: desantander.tienda@gmail.com.
- WhatsApp y teléfono: +57 300 112 9874.
- Despachamos desde: Bucaramanga, Santander.
- Consultas y reclamos sobre datos personales: área comercial, en desantander.tienda@gmail.com.

### Cómo te atendemos
Escríbenos por WhatsApp o al correo para hacer un pedido, preguntar por tu envío, pedir la garantía, ejercer tu retracto o presentar una queja, un reclamo o una solicitud. Cada queja, reclamo o solicitud recibe por el mismo canal un número de radicado (con la forma PQR-2026-001), con fecha y hora, y la respondemos en máximo 15 días hábiles.

Puedes retractarte dentro de los 5 días hábiles siguientes a la entrega, salvo si el empaque está abierto o su sello está roto; el transporte de la devolución corre por tu cuenta y te devolvemos el dinero en máximo 15 días calendario. La garantía legal va hasta la fecha de vencimiento de la bolsa y la atendemos nosotros aunque el café sea de otra marca. Si pagaste por Bre-B y algo salió mal, avísanos dentro de los 5 días hábiles siguientes y te devolvemos lo pagado en máximo 15 días calendario. El detalle está en «Envíos, devoluciones, retracto y garantía».

También puedes acudir a la Superintendencia de Industria y Comercio (www.sic.gov.co).

## Dónde se muestra (requisitos para el desarrollador)

| Lugar | Qué se muestra | Regla |
|---|---|---|
| Pie (`pie.tsx`) | `De Santander SAS · NIT 902.121.184-8` / `Domicilio: Bucaramanga, Santander` / `Notificaciones judiciales: Calle 37 n.° 23-77, apartamento 702, Bucaramanga, Santander` / `Correo de atención y de notificación judicial: desantander.tienda@gmail.com` / `WhatsApp +57 300 112 9874` | Reemplaza `vendedorCompleto`: cada línea se pinta si el dato existe. Sin representante ni matrícula. Última línea del pie: `© 2026 De Santander SAS. Precios en pesos colombianos, con IVA del 5 % incluido.` |
| Resumen del pedido, bajo las casillas | `Te vende De Santander SAS · NIT 902.121.184-8 · Bucaramanga, Santander · Calle 37 n.° 23-77, apartamento 702 · desantander.tienda@gmail.com · WhatsApp +57 300 112 9874.` + enlace «Información del vendedor» (`/legal/vendedor/`) | Texto del paquete D4 (pie y resumen con los mismos datos). |
| `/legal/vendedor/` | El texto público completo; el `dl` actual de la página puede conservarse con las filas Razón social, NIT, Matrícula mercantil, Representante legal, Domicilio, Dirección de notificación judicial, Correo, WhatsApp | Misma regla: cada fila solo si el dato existe. |
| Ficha de cada café | `Comercializa: De Santander SAS` (recomendado, P18) junto a «Marca», «FABRICADO POR / ENVASADO POR» y «Notificación sanitaria INVIMA» | Ver `microcopy-legal.md` §3. |

## Notas para el abogado

- **Cotejo pendiente (D-1, D-2).** Domicilio, dirección de notificación, razón social y dígito de verificación deben coincidir con el certificado de existencia y representación legal y con el RUT. El paquete lo exige antes de publicar; legal no tuvo acceso a los documentos.
- **Dirección de notificación en un apartamento (LEG-085).** El art. 50 lit. a exige publicar la dirección de notificación judicial; si la registrada en Cámara es una vivienda, es la que debe publicarse. Es un dato que queda expuesto en el pie de todas las páginas: el dueño puede valorar registrar una dirección comercial o de apartado y actualizar el certificado; mientras tanto se publica la que consta.
- **Representante legal y matrícula.** No los exige el art. 50 lit. a; se publican en esta página por decisión del dueño (paquete §2). Se recomienda no repetirlos en el pie ni en el resumen.
- **RNBD.** Si los activos totales no superan 100.000 UVT (Decreto 1074 de 2015, art. 2.2.2.26.1.2, modificado por el Decreto 090 de 2018), no hay obligación de inscribir las bases de datos. Pendiente el dato (D-8); no se publica nada al respecto.
- **E. Versión 2 (2026-11-09; LEG-106 y LEG-130).** Se publica el mismo día que los Términos y «Envíos, devoluciones, retracto y garantía» versión 2. Además del rótulo «Versión 2 · vigente desde {D-21}», **se recomienda** agregar el horario de atención, para que coincida con el numeral 13 de envíos, donde el horario fija el plazo de validación de los pagos Bre-B. La norma no exige publicarlo aquí; sí exige que el mismo dato no se publique de dos formas distintas (arts. 23 y 34).
  1. «Quién te vende», nueva viñeta después de «WhatsApp y teléfono»: `- Horario de atención: de lunes a viernes, de 7:00 a. m. a 5:00 p. m., hora de Colombia, sin contar festivos.`
  2. «Cómo te atendemos», al final del primer párrafo: `Puedes escribirnos a cualquier hora; te respondemos en nuestro horario de atención. El horario no cambia tus plazos: un aviso de retracto, de garantía, de reversión del pago o un reclamo que nos envíes fuera de ese horario vale desde el día en que lo envías.`
  La segunda frase evita leer el horario como un límite para que el cliente ejerza sus derechos: un aviso de retracto enviado el sábado vale desde el sábado (Ley 1480, arts. 43 y 47: VERIFICAR la letra).
- **Dirección de notificación distinta del lugar de despacho.** Confirmar que puede publicarse Bucaramanga como ciudad de despacho junto con la dirección de notificación (son compatibles; la segunda es la que vale para notificaciones).
