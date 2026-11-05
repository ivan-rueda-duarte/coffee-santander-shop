> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.2 — 2026-11-05.

# Microcopy legal

Contiene tres secciones: **envío** (§1), **inicio, Historia y confirmación** (§2) y **ficha del café: fabricante y registro** (§3). Las secciones de casillas de autorización y términos y de información del vendedor se agregan cuando se redacten esos documentos.

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

**Plazo de entrega.** El art. 50 lit. h) (modificado por la Ley 2439 de 2024) exige informar el plazo de entrega antes de finalizar la transacción. Hoy el carrito y el resumen no lo muestran (ver LEG-001 hallazgo 4). Texto propuesto para el resumen: `Entrega estimada: {plazo de la zona}. Te lo confirmamos por WhatsApp.` El plazo máximo es una decisión del cliente (documento de envíos, decisión 1).

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
