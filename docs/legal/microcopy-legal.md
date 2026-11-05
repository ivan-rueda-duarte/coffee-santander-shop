> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.1 — 2026-11-05.

# Microcopy legal

Este archivo contiene por ahora la sección de **envío**. Las demás secciones (casillas de autorización y términos, panel de confirmación, información del vendedor) se agregan cuando se redacten los documentos respectivos.

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

Condición pendiente: el rótulo `Total` solo es exacto si los precios de los cafés incluyen IVA (ver 1.4).

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

### 1.4 ¿Bloquea el IVA?

Sí, pero **no bloquea los textos de envío**; bloquea el lanzamiento y el uso del rótulo `Total`.

- Los textos de arriba son válidos mientras se resuelva el IVA.
- El art. 50 exige el precio total **con impuestos**. Si los precios de los cafés no incluyen IVA, o si el flete lleva un tratamiento tributario distinto, `Total` sería incompleto o inexacto. Eso sería un hallazgo bloqueante, ya registrado en `docs/PENDIENTES.md` («confirmar si los precios incluyen IVA»).
- No se concluye la tarifa de IVA del café tostado ni el tratamiento del flete: lo define el contador.
- Mientras no esté resuelto, el rótulo `Total` es provisional. Cuando se confirme, alternativas:
  - Si los precios incluyen IVA: agregar `IVA incluido` al lado de `Total` (por ejemplo `Total · IVA incluido`) y en la ficha del café junto al precio.
  - Si hay bienes excluidos o exentos de IVA: texto a definir con el contador. No inventar la frase.

### 1.5 Línea corta para el pie y la configuración (reemplaza `nota_envio` de `data/config.csv`)

`Enviamos a todo Colombia desde Bucaramanga. Ves el valor del envío en tu carrito; en algunos destinos y en pedidos de más de 5 kg te lo confirmamos por WhatsApp antes de que pagues.`

Fundamento: el texto actual («El costo del envío se confirma por WhatsApp según tu ciudad») ya no es exacto con el cálculo por zonas. Es un deber de información cierta (art. 23 y art. 50 lit. b).

### 1.6 Frases que se deben dejar de usar

- `El costo del envío se confirma por WhatsApp según tu ciudad` (inexacta).
- `te decimos el costo del envío por WhatsApp` (en los pasos de «Cómo pedir»; inexacta para zonas con tarifa).
- `Se confirma por WhatsApp; no se paga en esta página.` (ambigua: no dice qué se confirma). Alternativa: `Confirmamos el pago por WhatsApp. En esta página no se paga.`
