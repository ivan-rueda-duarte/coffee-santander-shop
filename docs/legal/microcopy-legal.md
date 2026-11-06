> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.5 — 2026-11-05.

# Microcopy legal

Contiene cinco secciones: **envío** (§1), **inicio, Historia y confirmación** (§2), **ficha del café: fabricante y registro** (§3), **documento, código postal y casilla de autorización de datos** (§4) y **casilla de términos, prueba de la aceptación, retracto, vendedor, mensaje de WhatsApp, PQR y plazos** (§5).

Cambios de la v0.5 (decisiones del dueño del 2026-11-05, revisión LEG-063 a LEG-068): §5.3 queda con una sola línea de retracto (P2 = C); §5.6 queda con una sola redacción del plazo (P1 = B; los máximos siguen pendientes de confirmación con la transportadora); nueva §5.7 con la plantilla de radicado de PQR (P3 = a); nueva §5.8 con los textos de `/envios/`. Se retiran las alternativas descartadas.

Cada texto va con su fundamento. «Exige la norma» y «se recomienda» se distinguen. Los textos son exactos: el desarrollador los copia sin cambios. Los valores entre `{}` son variables que pone el código.

## 1. Envío

### 1.1 Envío con tarifa (zonas 1 a 4, hasta 5 kg)

| Dónde | Texto exacto |
|---|---|
| Carrito y resumen, rótulo de la línea | `Envío a {destino}` con la nota `· zona {n}` en gris |
| Carrito y resumen, valor | `{$ valor}` (formato COP, p. ej. `$18.000`) |
| Total | `Total` |
| WhatsApp, línea de envío | `Envío ({destino} · zona {n}): {$ valor}` → ejemplo `Envío (Bogotá · zona 3): $18.000` |
| WhatsApp, total | `Total: {$ total}` |

Fundamento: el art. 50 de la Ley 1480 exige informar antes de contratar el precio total del producto, con impuestos y costos de envío, y presentar un resumen del pedido para que el consumidor lo verifique y apruebe. Exige la norma. Mostrar el envío en el carrito y sumarlo en el mensaje cumple el componente de envío.

Condición: el rótulo `Total` es exacto si el precio publicado es el precio final, con cualquier impuesto incluido. Según el dueño, el café no tiene IVA. Falta la confirmación del contador (ver 1.4).

### 1.2 Envío por cotizar (zona 5 o más de 5 kg)

| Dónde | Texto exacto |
|---|---|
| Carrito y resumen, línea de envío | `Envío` / `Por cotizar · te confirmamos el valor por WhatsApp antes de que pagues` |
| Carrito y resumen, rótulo del total | `Total sin envío` |
| WhatsApp, línea de envío (zona 5) | `Envío: POR COTIZAR (zona especial)` |
| WhatsApp, línea de envío (más de 5 kg) | `Envío: POR COTIZAR (más de 5 kg)` |
| WhatsApp, total | `Total sin envío: {$ total}` |

Texto que se pide a los desarrolladores que se agregue (recomendación, no estaba en la solicitud):

| Dónde | Texto exacto |
|---|---|
| Resumen, bajo el total, solo si el envío es por cotizar | `Este valor no incluye el envío. Te lo informamos por WhatsApp y tú decides si lo aceptas antes de pagar.` |
| WhatsApp, línea final, solo si el envío es por cotizar | `Quedo atento al valor del envío para confirmar mi pedido.` |
| Pantalla de confirmación (reemplaza «el pedido se hace cuando lo envías» solo en por cotizar) | `Con este mensaje nos pides el pedido. Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.` |

Fundamento: art. 50 y deber de información (art. 23) y, además, coherencia con la formación del contrato. Véase la evaluación en 1.3.

### 1.3 Evaluación: ¿cumple el art. 50 y la información del precio total?

**Con tarifa (zonas 1 a 4).** Cumple en lo que toca al envío: el cliente ve el valor y el total sumados antes de enviar el mensaje.

**Por cotizar.** Cumple con observaciones. Razones:
- El art. 50 pide informar el precio total, con costos de envío, antes de contratar. En «por cotizar» el envío no se conoce al momento de enviar el pedido.
- Se cumple el fin de la norma si **el contrato no se perfecciona hasta que el cliente acepta el total con envío**. Por eso el texto dice que el valor se confirma «antes de que pagues», y la regla «nunca se cobra primero y se ajusta después» es esencial.
- Riesgo: la frase actual «el pedido se hace cuando lo envías» (inicio, pantalla de confirmación y PRODUCT.md) sugiere que el contrato nace con el mensaje, es decir, antes de conocer el total. Para por cotizar hay que corregirla (ver el texto de 1.2) y dejar en los términos y condiciones que la aceptación del valor del envío es previa al pago y que el cliente puede desistir sin costo.
- El rótulo `Total sin envío` es claro y no induce a error: no se presenta como precio final.
- El motivo debe ser verdadero. «Por cotizar» solo aplica a zona 5 y a más de 5 kg (ENVIOS.md §4). Usarlo para otros casos sería ocultar el precio.

**Zona y peso.** `zona 3` es un dato interno. Para que la información sea clara (art. 23), la página `/envios/` debe explicar las zonas y mostrar en qué zona cae cada destino. Se recomienda, no es exigencia literal.

**Plazo de entrega.** El art. 50 lit. h) (modificado por la Ley 2439 de 2024) exige informar el plazo de entrega antes de finalizar la transacción. Hoy el carrito y el resumen no lo muestran (ver LEG-001 hallazgo 4). El texto exacto está en la §5.6 (decisión 1 = B).

### 1.4 IVA (actualizado en la versión 0.2)

**Estado.** El dueño informa (2026-11-05) que el café no tiene IVA. Es una **declaración del cliente, pendiente de confirmación escrita del contador**. Ya no bloquea por sí sola. Es una condición previa al lanzamiento (LEG-001 punto 5 y LEG-029). No se concluye aquí la tarifa del café tostado ni el tratamiento del flete.

**Qué exige la norma.** El art. 50 lit. c) de la Ley 1480 exige informar el precio total con todos los impuestos, costos y gastos, y el envío por separado. No exige escribir «IVA».

**Textos que corresponden mientras se mantenga la declaración del dueño:**

| Dónde | Texto exacto |
|---|---|
| Resumen y carrito | `Subtotal`, `Envío a {destino}`, `Total` / `Total sin envío` (sin cambios) |
| Ficha y tarjeta, junto al precio | Ningún rótulo tributario |
| Mensaje de WhatsApp | `Subtotal:`, `Envío…:`, `Total:` / `Total sin envío:` (sin cambios) |

**No usar:**
- `IVA incluido`: sería inexacto si no hay IVA (art. 23).
- `Sin IVA`, `Excluido de IVA` o `Exento de IVA`: son afirmaciones tributarias que el sitio no necesita. Solo se usan con concepto del contador y con un texto nuevo de legal.

**El flete y otros conceptos pueden cambiar el resultado. Lo define el contador.**
- Si el cobro del envío (tarifa por zona o mensajero de zona 1) causa algún impuesto, el valor publicado en el carrito, el mensaje y `/envios/` debe ser el **valor final con el impuesto**. No se puede sumar el impuesto después. Lo exige la norma.
- Si alguna presentación, por ejemplo el café molido, o un producto nuevo, como un accesorio o un kit de regalo, recibe otro tratamiento, el precio de esa línea debe incluir el impuesto. En ese caso se revisa este apartado.
- La facturación electrónica y la necesidad de pedir cédula o NIT dependen de la respuesta del contador.

### 1.5 Línea corta para el pie y la configuración (reemplaza `nota_envio` de `data/config.csv`)

`Enviamos a todo Colombia desde Bucaramanga. Ves el valor del envío en tu carrito; en algunos destinos y en pedidos de más de 5 kg te lo confirmamos por WhatsApp antes de que pagues.`

Fundamento: el texto actual («El costo del envío se confirma por WhatsApp según tu ciudad») ya no es exacto con el cálculo por zonas. Es un deber de información cierta (art. 23 y art. 50 lit. b).

### 1.6 Frases que se deben dejar de usar

- `El costo del envío se confirma por WhatsApp según tu ciudad` (inexacta).
- `te decimos el costo del envío por WhatsApp` (en los pasos de «Cómo pedir»; inexacta para zonas con tarifa).
- `Se confirma por WhatsApp; no se paga en esta página.` (ambigua: no dice qué se confirma). Alternativa: `Confirmamos el pago por WhatsApp. En esta página no se paga.`
- `IVA incluido` (ver 1.4).

## 2. Inicio, Historia y confirmación

Fuente: LEG-013 a LEG-030. Fundamento común: información veraz y suficiente (art. 23 de la Ley 1480), afirmaciones demostrables (arts. 29 y 30, y art. 5 num. 13) y coherencia con el momento de formación del contrato (Ley 527 de 1999, art. 14; VERIFICAR).

| Dónde | Texto exacto | Estado |
|---|---|---|
| Portada, bajada | `Café de origen de marca propia, de provincias de Santander. Elige tu provincia y pide por WhatsApp.` | Aprobado. «Marca propia» depende del modelo de comercialización (LEG-022). |
| Portada, antetítulo | `Café de origen · Santander` | Aprobado. No juntar las palabras de modo que se lea «Café de Santander» (denominación de origen). |
| Pie | `Café de origen de marca propia, de provincias de Santander, Colombia.` | Aprobado, con la misma condición de LEG-022. |
| Historia, párrafo 1 | `De Santander es una marca propia de café de origen. Trabajamos con fincas de familias productoras santandereanas con tradición cafetera y despachamos su café desde Bucaramanga a todo Colombia.` | Aprobado con cambio (LEG-021). Reemplaza «…y llevamos su café desde el productor hasta tu casa». |
| Historia, párrafo 1, frase opcional | `Un tostador aliado tuesta y empaca el café; su nombre está en la bolsa y en la ficha de cada café.` | Decisión del cliente. Solo cuando la ficha muestre al fabricante (§3). |
| Historia, párrafo 2 | `En cada café verás la provincia, el municipio, la altitud, la variedad y el proceso.` | Aprobado, condicionado a LEG-017 (soporte del proveedor y ningún campo vacío). |
| Confirmación, título | `Tu pedido está listo para enviar por WhatsApp` | Aprobado |
| Confirmación con tarifa | `Pulsa «Enviar por WhatsApp» y manda el mensaje. Con él nos pides el pedido. Después te respondemos para confirmarlo y acordar el pago.` | Aprobado |
| Confirmación por cotizar | `Pulsa «Enviar por WhatsApp» y manda el mensaje. Con este mensaje nos pides el pedido. Te respondemos con el valor del envío y el total. Tu pedido queda en firme cuando aceptas ese valor.` | Aprobado |
| Botón | `Enviar por WhatsApp` | Aprobado |

Alternativas si la marca solo revende café con la marca del tostador (modelo C de LEG-022):
- Bajada: `Café de origen de provincias de Santander. Elige tu provincia y pide por WhatsApp.`
- Pie: `Café de origen de provincias de Santander, Colombia.`
- Historia, párrafo 1: `De Santander es una tienda de café de origen santandereano. Vendemos café de fincas de familias productoras de Santander y lo despachamos desde Bucaramanga a todo Colombia.`

Frases que se dejan de usar: `lo llevamos de la finca a tu casa`, `llevamos su café desde el productor hasta tu casa`, `lo tostamos por lotes`, `tueste por lotes`, `café de especialidad` como descriptor.

## 3. Ficha del café: fabricante y registro sanitario

| Dónde | Texto exacto | Cuándo se muestra |
|---|---|---|
| Ficha, datos técnicos | `{FABRICADO POR o ENVASADO POR, la misma expresión del rótulo}: {fabricante}` | Solo si existe el dato `fabricante` |
| Ficha, datos técnicos | `Registro sanitario: {registro_sanitario}` | Solo si existe el número |
| Ficha, datos técnicos (recomendado, modelo A) | `Comercializa: De Santander S.A.S.` | Solo cuando la razón social y el NIT estén confirmados |

Fundamento:
- **Exige la norma** que el rótulo identifique al fabricante, envasador o reempacador con «FABRICADO POR» o «ENVASADO POR» y que lleve el registro sanitario (Res. 5109 de 2005, art. 5 nums. 5.4.1 y 5.8). También exige la norma que el producto sin registro, permiso o notificación sanitaria no se venda (Res. 2674 de 2013; VERIFICAR la modalidad).
- **Se recomienda** repetir esos datos en la ficha web, para que la información en línea no contradiga la bolsa (art. 23 de la Ley 1480). Con el dato vacío no se muestra nada: no poner «pendiente» ni marcadores.

## 4. Documento, código postal y autorización de datos (nuevo en la v0.3)

Fuente: LEG-040 a LEG-048 (`revisiones/2026-11-05-documento-codigo-postal.md`).

Fundamento común:
- **Exige la norma.** Informar la finalidad de cada dato antes de recogerlo y pedir la autorización a más tardar en ese momento: Ley 1581 de 2012, art. 4 lits. b y c, y art. 12; Decreto 1377 de 2013, arts. 4 y 5 (la numeración en el Decreto 1074 de 2015 está por VERIFICAR).
- **Se recomienda.** Lo demás es buena práctica y se marca así en cada caso.

Hay dos modos. Hoy rige el **modo opcional**. El **modo obligatorio** solo se activa si el agregador o el contador acreditan por escrito la necesidad (LEG-040).

### 4.1 Selector de tipo de documento

| Dónde | Texto exacto |
|---|---|
| Etiqueta | `Tipo de documento` (en el modo opcional, seguido de ` (opcional)`, como los demás campos) |
| Primera opción, vacía | `Elige el tipo` |
| Opciones | `Cédula de ciudadanía` · `Cédula de extranjería` · `Permiso por Protección Temporal (PPT)` · `Pasaporte` |
| Opción adicional, solo con la decisión 3 (a) de LEG-048 | `NIT (empresas)` |
| Error | `Elige el tipo de documento.` |

### 4.2 Número de documento

| Dónde | Texto exacto |
|---|---|
| Etiqueta | `Número de documento` (en el modo opcional, seguido de ` (opcional)`) |
| Ayuda, modo opcional | `Escríbelo solo si quieres la factura electrónica a tu nombre. Si lo dejas vacío, tu pedido sigue igual.` |
| Ayuda, modo obligatorio por la guía | `Lo pide la transportadora para generar la guía de tu envío.` |
| Ayuda, modo obligatorio por la factura | `Lo necesitamos para la factura electrónica de tu compra.` |
| Error, vacío (solo en el modo obligatorio) | `Escribe el número de documento.` |
| Error, CC con letras o con más de 10 dígitos | `La cédula de ciudadanía lleva solo números, hasta 10 dígitos.` |
| Error, CC con menos de 3 dígitos | `Revisa el número: parece incompleto.` |
| Error, CE, PPT o pasaporte con símbolos | `Usa solo letras y números, sin espacios ni símbolos.` |
| Error, CE, PPT o pasaporte con menos de 3 o más de 20 caracteres | `Revisa el número: debe tener entre 3 y 20 caracteres.` |
| Error, NIT (solo con la decisión 3 (a)) | `El NIT lleva solo números; el dígito de verificación va después del guion.` |

Condiciones:
- La ayuda del modo opcional solo es cierta si el contador confirma que la sociedad emite factura electrónica a nombre del comprador. Si no la emite, no hay finalidad y **se quita el campo** (LEG-040). Exige la norma.
- En el modo obligatorio se usa solo la ayuda de la finalidad que se haya acreditado. No se ponen las dos si solo una está acreditada.
- Se usa «Número de documento» y no «Cédula», porque el pasaporte y el PPT no son cédulas (art. 23 de la Ley 1480). Se recomienda.

### 4.3 Casilla de autorización (v0.4: texto final, une el texto del dueño con el de la v0.3)

**Modo opcional (vigente):**

`Autorizo a {razon_social} a tratar mis datos personales para gestionar este pedido: confirmarlo, coordinar la entrega con la transportadora o el mensajero y, si escribí mi documento, emitir la factura a mi nombre. Entiendo que el pedido se envía por WhatsApp (Meta), que puede tratar mis datos fuera de Colombia. Más en la ` + enlace `política de tratamiento de datos` (a `/legal/privacidad/`) + `.`

Cambios frente a la v0.3 (que es lo que hoy está en `flujo-pedido.tsx`):
- «atender» pasa a «gestionar», la palabra del dueño.
- «con la transportadora» pasa a «con la transportadora o el mensajero»: la zona 1 va por mensajero.
- «Sé que el pedido viaja por WhatsApp (Meta), que puede tratar datos fuera de Colombia» pasa a «Entiendo que el pedido se envía por WhatsApp (Meta), que puede tratar mis datos fuera de Colombia», la frase del dueño completada.

Por qué no basta el texto propuesto por el dueño («Autorizo el tratamiento de mis datos personales para gestionar este pedido, según la política de tratamiento de datos. Entiendo que el pedido se envía por WhatsApp (Meta).»), ver LEG-054:
- no identifica al responsable (Ley 1581, art. 12 lit. d);
- «gestionar este pedido» sin detalle no dice que los datos se entregan a la transportadora ni que el documento se usa para la factura (art. 12 lit. a; LEG-044);
- no dice que Meta trata los datos fuera de Colombia, y en eso se apoya la autorización expresa del art. 26 lit. a.

**Modo obligatorio:** el mismo texto, pero cambiando «y, si escribí mi documento, emitir la factura a mi nombre» por una de estas frases, según la finalidad acreditada:
- `y usar mi documento para generar la guía de envío`
- `y usar mi documento para emitir la factura electrónica`

Reglas:
- `{razon_social}` sale de `data/config.csv`.
- La casilla va sin marcar y separada de la de términos. Exige la norma.
- El error no cambia: `Debes autorizar el tratamiento de tus datos para continuar.`
- La frase sobre Meta queda sujeta al análisis de la transmisión o transferencia internacional (art. 26 de la Ley 1581, VERIFICAR) que se hará en la política.

### 4.4 Resumen y mensaje de WhatsApp

| Dónde | Texto exacto | Cuándo |
|---|---|---|
| Resumen, bloque «Envío a» | `Documento: {sigla} {número}` | Solo si el cliente escribió el número |
| Resumen, bloque «Envío a» | `Código postal: {código}` | Solo si lo escribió |
| WhatsApp, después de `Correo:` (reemplaza `Cédula:`) | `Documento: {sigla} {número}` → ejemplo `Documento: CC 1098765432` | Solo si el cliente escribió el número |
| WhatsApp, después de `Ciudad:` | `Código postal: {código}` → ejemplo `Código postal: 680001` | Solo si lo escribió |

Siglas: `CC`, `CE`, `PPT`, `Pasaporte` (y `NIT`).

El número va **completo**, sin enmascarar. Si la tienda lo necesita para la factura o la guía, un número parcial no le sirve. Si no lo necesita, no se recoge. Ver LEG-043.

### 4.5 Código postal

| Dónde | Texto exacto |
|---|---|
| Etiqueta | `Código postal` + ` (opcional)` |
| Ayuda | `Ayuda a la transportadora a ubicar tu dirección. Si no lo sabes, búscalo en el ` + enlace `visor de 4-72` (a `https://visor.codigopostal.gov.co/472/visor/`, en una pestaña nueva) + `.` |
| Error, formato | `El código postal tiene 6 números.` |
| Error, no corresponde al departamento | `Este código no corresponde a {departamento}. Revísalo en el visor de 4-72.` |

Fundamento:
- El visor es la herramienta oficial a la que remite 4-72 («Conoce tu código postal», verificado el 2026-11-05).
- El código no se autocompleta: no es único por municipio (LEG-046). Se recomienda.
- La regla de que los 2 primeros dígitos coinciden con el código DIVIPOLA del departamento está comprobada en el conjunto oficial de datos.gov.co (`ixig-z8b5`).

### 4.6 Frases que se dejan de usar

- `Cédula` como etiqueta única del campo.
- `Solo si la necesitas para factura o la transportadora.`
- `La cédula debe tener entre 6 y 10 dígitos.`
- `Autorizo el tratamiento de mis datos personales para gestionar este pedido…`: queda reemplazada por la §4.3.
- `Sé que el pedido viaja por WhatsApp (Meta), que puede tratar datos fuera de Colombia.`: v0.3, reemplazada en la v0.4.

## 5. Casilla de términos, prueba de la aceptación, retracto, vendedor y mensaje (nuevo en la v0.4)

Fuente: LEG-049 a LEG-062 (`revisiones/2026-11-05-actualizacion-documentos.md`).

### 5.1 Casilla de términos

| Dónde | Texto exacto |
|---|---|
| Resumen, segunda casilla, sin marcar | `Acepto los ` + enlace `términos y condiciones` (a `/legal/terminos/`) + `.` |
| Error | `Debes aceptar los términos para continuar.` (sin cambio) |

Es el texto del dueño y coincide con el código actual. Se aprueba. Los términos remiten a «Envíos, devoluciones, retracto y garantía», y ese documento ya se enlaza en la nota del resumen. Exige la norma que las dos casillas estén separadas y sin marcar. La Ley 1581 pide que la autorización sea expresa e inequívoca y no se pueda inferir de la aceptación de los términos (art. 9; Decreto 1377, art. 7, VERIFICAR).

### 5.2 Prueba de la autorización y de la aceptación en el mensaje de WhatsApp

| Dónde | Texto exacto |
|---|---|
| WhatsApp, al final, después de `Forma de pago:` y antes de la línea de «por cotizar» si existe | `Acepté los términos y condiciones (v{version_terminos}) y autoricé el tratamiento de mis datos según la política de tratamiento de datos (v{version_politica_datos}).` |

Exige la norma: el responsable debe conservar prueba de la autorización (Ley 1581, art. 17 lit. b; Decreto 1377, art. 8, VERIFICAR). Como el sitio no guarda nada, la única prueba posible es el mensaje que llega al chat de la tienda. Las versiones salen de `data/config.csv`: hay que crear los campos `version_terminos` y `version_politica_datos`. Mientras los documentos sean borradores sin publicar, la línea no se agrega. Ver LEG-050.

### 5.3 Retracto en el resumen (decisión 2 = C, 2026-11-05)

| Dónde | Texto exacto |
|---|---|
| Resumen, en la nota bajo los totales, antes de las casillas (`flujo-pedido.tsx`, junto a la línea «La forma de pago se confirma por WhatsApp…») | `El café es un alimento: no admite retracto. Si llega dañado o equivocado, te respondemos con la garantía.` |

Dónde más se informa la exclusión (ya redactado): envíos §9 (`/legal/envios-devoluciones/`), términos §9 (`/legal/terminos/`) e información del vendedor («Cómo te atendemos»). No se agrega nada en la ficha ni en el carrito: la exclusión no es un dato del producto sino de la modalidad de venta, y el resumen es el último paso antes de enviar.

Exige la norma: informar en el medio electrónico el derecho de retracto y su procedimiento (Ley 1480, art. 50 lit. c, VERIFICAR la letra) y el deber general de información (art. 23). Cuando no procede, se cumple informando la exclusión y su razón antes de la compra. Se recomienda, además, una frase en «Cómo pedir» (contenido de Sanity): `El café es un alimento y no admite retracto; sí tiene garantía legal.` El texto de las alternativas A y B (v0.4) queda sin efecto.

### 5.4 Vendedor en el resumen

| Dónde | Texto exacto | Cuándo |
|---|---|---|
| Resumen, al final del bloque de totales o bajo las casillas | `Te vende {razon_social} · NIT {nit}. ` + enlace `Información del vendedor` (a `/legal/vendedor/`) | Cuando existan la razón social y el NIT (ya existen) |

Se recomienda (art. 50 lit. a). No es exigencia literal ponerlo en el resumen si el pie lo muestra, pero hoy el pie lo oculta (LEG-055).

### 5.5 Primera línea del mensaje de WhatsApp

| Hoy | Texto recomendado |
|---|---|
| `¡Hola, {nombre_tienda}! Quiero finalizar mi pedido` | `¡Hola, {nombre_tienda}! Quiero hacer este pedido:` |

Se recomienda (LEG-053). «Finalizar» sugiere que la compra se cierra con el mensaje, y según los términos (§6) el mensaje es la solicitud.

### 5.6 Plazo de entrega en el resumen (decisión 1 = B, 2026-11-05)

| Caso | Dónde | Texto exacto |
|---|---|---|
| Zonas 1 a 4 con tarifa y máximo confirmado | Resumen, bajo la línea de envío, en `caption` | `Entrega estimada: {plazo_estimado}. Máximo {plazo_maximo_dias_habiles} días hábiles desde que confirmamos tu pedido.` |
| Zona 5 (por cotizar) con máximo confirmado | Mismo lugar | `Entrega estimada: {plazo_estimado}, en la oficina de la transportadora. Máximo {plazo_maximo_dias_habiles} días hábiles desde que confirmamos tu pedido y el envío.` |
| Cualquier zona, mientras el máximo de esa zona esté vacío en el CSV | Mismo lugar | `Entrega estimada: {plazo_estimado}. Si no publicamos un plazo máximo para tu zona, entregamos en máximo 30 días calendario.` |

Ejemplo (zona 3, máximo 6): `Entrega estimada: 1 a 3 días hábiles. Máximo 6 días hábiles desde que confirmamos tu pedido.`

Reglas:
- Los valores salen de un CSV (columnas `plazo_estimado`, texto, y `plazo_maximo_dias_habiles`, entero o vacío, en `data/tarifas_envio.csv` o en un CSV nuevo por zona), nunca del componente.
- Los estimados son los que ya publica `/envios/` (zona 1 «mismo día o siguiente día hábil»; zonas 2 y 3 «1 a 3 días hábiles»; zona 4 «2 a 6 días hábiles»; zona 5 «5 a 12 días hábiles»).
- Los máximos propuestos por legal (3, 6, 10 y 20 días hábiles) **no se cargan en el CSV** hasta que el dueño los confirme con la transportadora (LEG-063). Mientras tanto la columna va vacía y el resumen muestra la tercera redacción, que es cierta por ley (art. 50 lit. h: sin plazo informado, 30 días calendario).
- Un máximo publicado obliga (art. 29). Si la transportadora no lo garantiza, se sube antes de publicar.

Exige la norma (art. 50 lit. h, Ley 2439 de 2024). El texto de la opción 1 A (v0.4) queda sin efecto.

### 5.7 Radicado de quejas, reclamos y solicitudes (decisión 3 = a, 2026-11-05)

No es texto del sitio: es la **plantilla que la tienda responde por el chat o el correo** y el formato del registro privado. Se entrega al dueño y a quien atienda el WhatsApp.

| Uso | Texto exacto |
|---|---|
| Respuesta de recepción (chat o correo), el mismo día | `Recibimos tu solicitud. Radicado {PQR-AAAA-NNN}, recibido el {DD/MM/AAAA} a las {HH:MM}. Te respondemos a más tardar el {fecha: 15 días hábiles contados desde el día siguiente}. Con ese número puedes preguntarnos cómo va.` |
| Respuesta a una consulta de estado | `Tu radicado {PQR-AAAA-NNN} está {en revisión / respondido el DD/MM/AAAA}. Fecha límite de respuesta: {fecha}.` |
| Cierre | `Radicado {PQR-AAAA-NNN}: {respuesta}. Si no estás de acuerdo, puedes acudir a la Superintendencia de Industria y Comercio (www.sic.gov.co).` |
| Formato del número | `PQR-` + año de cuatro dígitos + `-` + consecutivo de tres dígitos que empieza en `001` cada año (`PQR-2026-001`, `PQR-2026-002`…). Un solo consecutivo para quejas, reclamos, solicitudes y para las consultas y reclamos de datos personales. |
| Columnas del registro privado (hoja de cálculo) | `radicado · fecha y hora de recepción · canal (WhatsApp/correo) · nombre · celular o correo · fecha del pedido · tipo (queja/reclamo/solicitud/garantía/datos personales) · resumen · fecha límite · fecha de respuesta · quién respondió · resultado` |

Reglas:
- La hora se toma de la marca del mensaje recibido, no de cuando se lee.
- Plazo: 15 días hábiles para PQR de consumo (política de la tienda, envíos §12 y términos §12). Para consultas de datos personales, 10 + 5 días hábiles, y para reclamos de datos, 15 + 8 (Ley 1581, arts. 14 y 15): el mismo radicado, distinto plazo.
- El registro es una base de datos personal de la tienda: plazo de conservación según la política §6 (D-6).

Exige la norma el radicado con fecha, hora y seguimiento (Ley 1480, art. 50 lit. g, Ley 2439 de 2024). El formato, el consecutivo y la hoja son la forma elegida de cumplirlo (se recomienda).

### 5.8 Página `/envios/`: plazos (decisión 1 = B)

| Dónde | Hoy | Texto exacto (con los máximos confirmados) |
|---|---|---|
| Título de la sección (`page.tsx`, línea 95) | `Plazos orientativos` | `Plazos de entrega` |
| Frase bajo el título (línea 96) | `Son una referencia, no una fecha de entrega: dependen de la transportadora, del destino y de cuándo se confirme el pago.` | `El estimado es lo que suele tardar. El máximo es el plazo que nos comprometemos a cumplir. Los dos se cuentan en días hábiles desde que confirmamos tu pedido por el chat y, si pagas por transferencia, desde que recibimos el pago. Si no entregamos en el máximo, puedes cancelar y te devolvemos todo en 15 días calendario.` |
| Cada zona (`dd`) | `{PLAZOS[zona]}` | `Estimado: {plazo_estimado}. Máximo: {plazo_maximo_dias_habiles} días hábiles.` (zona 5: `Estimado: {plazo_estimado}, en la oficina de la transportadora. Máximo: {n} días hábiles.`) |
| `metadata.description` (línea 14) | `…tarifas por peso y plazos orientativos…` | `…tarifas por peso y plazos de entrega…` |

Mientras los máximos no estén confirmados, se conserva el texto de hoy («Plazos orientativos…»), que es cierto y no promete, y se agrega una línea al final de la sección: `Si no publicamos un plazo máximo para tu zona, entregamos en máximo 30 días calendario, como manda la ley.` Se recomienda para coherencia con el resumen (§5.6, tercera redacción).
