> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.5 — 2026-11-05.

# Información del vendedor

Cambios de la v0.5 (decisiones del dueño del 2026-11-05, revisión LEG-063 a LEG-068): «Cómo te atendemos» ya no menciona el retracto (P2 = C) y describe el radicado manual `PQR-AAAA-NNN` con el plazo de 15 días hábiles (P3 = a). La versión salta de 0.1 a 0.5 para alinearla con los demás documentos.

Se publica en `/legal/vendedor/` y alimenta el pie del sitio y el resumen del pedido. Los datos salen de `data/config.csv`, que es la fuente de verdad: este documento no los repite como texto fijo para que no queden desactualizados, salvo en la sección «Texto para el consumidor», que es el texto que se publica.

Convención: `[TODO(dato): …]` es un dato que debe entregar el cliente. No se publica un marcador: la línea se omite hasta que exista el dato. Los comentarios `<!-- -->` son para el abogado y no se publican.

## Fundamento

- **Exige la norma.** En el comercio electrónico, el proveedor debe informar, de forma cierta, fidedigna, suficiente, clara, accesible y actualizada, su identidad e información legal y de contacto: razón social, NIT, dirección de notificación judicial, teléfono y correo electrónico (Ley 1480 de 2011, art. 50 lit. a). VERIFICAR la letra exacta del literal contra SUIN-Juriscol; se leyó en una transcripción secundaria (ver LEG-021 a LEG-030).
- **Exige la norma.** Quien trata datos personales debe identificarse como responsable, con su razón social, domicilio, dirección, correo y teléfono, en la política de tratamiento (Decreto 1377 de 2013, art. 13, compilado en el Decreto 1074 de 2015; VERIFICAR la numeración del artículo compilado).
- **Se recomienda.** Que el nombre que se muestra coincida letra por letra con el certificado de existencia y representación legal de la Cámara de Comercio y con el RUT.

## Datos disponibles al 2026-11-05

| Dato | Valor | Fuente | Estado |
|---|---|---|---|
| Razón social | De Santander SAS | `data/config.csv`, `razon_social` | Cargado. VERIFICAR con el certificado de Cámara de Comercio si se escribe «S.A.S.» o «SAS» (se usa tal como figura en el certificado). |
| NIT | 902121184 | `data/config.csv`, `nit` | Cargado. Falta el dígito de verificación. [TODO(dato): dígito de verificación del NIT, tal como figura en el RUT] |
| Domicilio y dirección de notificación judicial | — | `data/config.csv`, `domicilio` (vacío) | [TODO(dato): dirección física de notificación judicial y municipio, tal como figuran en el certificado de Cámara de Comercio]. **Bloquea el lanzamiento.** |
| Correo de contacto | desantander.tienda@gmail.com | `data/config.csv`, `correo_contacto` | Cargado. |
| Teléfono y WhatsApp | +57 300 112 9874 | `data/config.csv`, `whatsapp` | Cargado. |
| Ciudad de despacho | Bucaramanga | `data/config.csv`, `ciudad_despacho` | Cargado. No sustituye el domicilio social. |
| Matrícula mercantil | — | — | [TODO(dato): número de matrícula mercantil y Cámara de Comercio]. Se recomienda; no es requisito literal del art. 50 lit. a. |
| Representante legal | — | — | [TODO(dato): nombre del representante legal]. Se recomienda para la política de datos; no se publica en el pie. |
| Área o persona que atiende consultas y reclamos de datos | — | — | [TODO(dato): área o cargo responsable]. Exige la norma que la política lo indique (Decreto 1377, art. 13; VERIFICAR). |

## Texto para el consumidor

**Quién te vende**

De Santander SAS es la sociedad que vende los cafés de esta tienda. Atendemos tus pedidos, pagos, envíos, garantías y reclamos.

- Razón social: De Santander SAS
- NIT: 902121184[-TODO(dato): dígito de verificación]
- Domicilio y dirección de notificación judicial: [TODO(dato): dirección y municipio]
- Correo: desantander.tienda@gmail.com
- WhatsApp y teléfono: +57 300 112 9874
- Despachamos desde: Bucaramanga, Santander

**Cómo te atendemos**

Escríbenos por WhatsApp o al correo para hacer un pedido, preguntar por tu envío, pedir la garantía o presentar una queja, un reclamo o una solicitud. Cada queja, reclamo o solicitud recibe por el mismo canal un número de radicado (con la forma PQR-2026-001), con fecha y hora, y la respondemos en máximo 15 días hábiles. El café es un alimento y no admite retracto; la garantía legal se mantiene. El detalle está en «Envíos, devoluciones, retracto y garantía».

También puedes acudir a la Superintendencia de Industria y Comercio (www.sic.gov.co).

<!-- Quién fabrica cada café: no va aquí. Va en la ficha de cada café («FABRICADO POR» o «ENVASADO POR», según el rótulo) y en la bolsa (Res. 5109 de 2005, art. 5 num. 5.4.1). LEG-024. -->

## Dónde se muestra

| Lugar | Qué se muestra | Regla |
|---|---|---|
| Pie (`pie.tsx`) | Razón social · NIT, domicilio, correo | Hoy solo se muestra si están los cuatro datos (`vendedorCompleto`). Ver la recomendación de abajo. |
| `/legal/vendedor/` | Tabla con razón social, NIT, domicilio, contacto | Misma regla. |
| Resumen del pedido | Recomendado: una línea «Te vende: De Santander SAS · NIT …» con enlace a esta página | Se recomienda (art. 50 lit. a). Hoy no se muestra. |

**Recomendación (no es exigencia literal).** Mostrar ya los datos que existen (razón social, NIT, correo y WhatsApp) en lugar de ocultarlos todos mientras falta el domicilio. Es información cierta y reduce el riesgo. El domicilio se agrega cuando llegue. Ocultar los cuatro no corrige la falta del domicilio: el lanzamiento sigue bloqueado hasta tenerlo.

## Notas para el abogado

- Confirmar si la dirección de notificación judicial puede ser distinta del lugar de despacho (Bucaramanga) y cuál debe publicarse.
- Confirmar si la sociedad está obligada a inscribir bases de datos en el Registro Nacional de Bases de Datos: según el Decreto 090 de 2018, solo las sociedades con activos totales superiores a 100.000 UVT (fuentes secundarias; VERIFICAR en el Decreto 1074 de 2015). [TODO(dato): activos totales de la sociedad.]
