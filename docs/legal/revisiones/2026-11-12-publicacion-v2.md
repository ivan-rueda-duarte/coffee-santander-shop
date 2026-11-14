> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.1 — 2026-11-12.

# Revisión LEG-133 a LEG-138: documentos versión 2 para encender el envío gratis en comunas de Bucaramanga

**Pedido.** El dueño pide publicar la versión 2 de los documentos legales para encender el envío gratis en siete comunas de Bucaramanga (LEG-106). Fuentes: `microcopy-legal.md` §8 (v1.6), notas E de los cuatro documentos, LEG-106, LEG-109, LEG-114, LEG-116, LEG-131 y LEG-132, `data/comunas_envio_gratis.csv`. Cambios que el dueño ya hizo y que los documentos deben recoger: se eliminó el pago contraentrega (solo transferencia Bre-B) y se retiró la dirección de notificación judicial de los documentos, del pie y del resumen.

**Alcance.** Texto público de `terminos-y-condiciones.md`, `politica-tratamiento-datos.md`, `envios-devoluciones-retracto.md` e `informacion-vendedor.md` (versión 2.0); `microcopy-legal.md` (v1.7); control de publicación de `src/domain/legal/envio-gratis.ts` y `src/domain/legal/texto-legal.ts` (solo lectura); `data/config.csv` y `src/app/legal/[slug]/page.tsx` (solo lectura).

**Importante.** Los cuatro documentos son **borradores**. **La publicación efectiva depende de la aprobación del abogado responsable (L1).** Si el dueño despliega antes, publica bajo su decisión y su riesgo, como con la versión 1 (LEG-094). Legal no marca nada como aprobado.

## Comprobación del control de publicación (lectura del código)

| Requisito de `npm run datos` | Dónde se cumple | Estado |
|---|---|---|
| Numeral «Envío gratis en comunas de Bucaramanga» en el texto publicado de envíos | Envíos, numeral 13 | Cumple |
| El numeral nombra las siete comunas de `data/comunas_envio_gratis.csv` | Primer párrafo del numeral 13 | Cumple |
| El numeral dice la fecha de `envio_gratis_desde` en letras y no tiene `{` | «rige desde el 12 de noviembre de 2026» | Cumple **solo si** `envio_gratis_desde = 2026-11-12` (LEG-133) |
| Salvedad «La única salvedad es el envío gratis en comunas de Bucaramanga» en envíos | Envíos §3, tercera viñeta | Cumple |
| La misma salvedad en términos | Términos §6, última viñeta | Cumple |
| `fecha_terminos ≤ envio_gratis_desde` | 2026-11-12 ≤ 2026-11-12 | Cumple con `config.csv` actualizado |
| La política menciona «comuna» (aviso) | Política §2, §3 y §7 | Cumple |
| Rótulo «Versión N · vigente desde AAAA-MM-DD» igual a `config.csv` | Línea 5 de cada documento: versión 2, 2026-11-12 | Cumple **cuando el desarrollador cambie `config.csv`**; hasta entonces `npm run datos` falla por versión distinta |
| Sin corchetes, `TODO(`, `DECISIÓN`, `VERIFICAR` ni `<!--` en el texto público; al menos un `###` | Los cuatro documentos | Cumple (revisado a mano) |

## Hallazgos

| # | Severidad | Ubicación | Texto o práctica | Riesgo y norma | Corrección propuesta |
|---|---|---|---|---|---|
| LEG-133 | Alta (condición para publicar) | Envíos, numeral 13, viñeta «Vigencia»; `data/config.csv` | La versión 2 dice «rige desde el 12 de noviembre de 2026». El dueño encenderá la promoción «tras validar», con `desde` igual o posterior al 2026-11-12. | Si se publica el numeral sin encender la promoción, el sitio anuncia una oferta que no aplica: lo anunciado obliga (Ley 1480, arts. 29 y 33; VERIFICAR la letra). Si `desde` es posterior, `npm run datos` falla, porque el numeral no dice esa fecha. | Publicar la versión 2 y `envio_gratis_desde,2026-11-12` **en el mismo build y despliegue**. Si el dueño prefiere otra fecha, se avisa a legal antes para cambiar la viñeta «Vigencia» y las fechas de los cuatro documentos y de `config.csv`. Y en todo caso, después de la aprobación del abogado. |
| LEG-134 | **Bloqueante** (lanzamiento; no impide encender la promoción) | `/legal/vendedor/`, fila «Dirección de notificación judicial» (`src/app/legal/[slug]/page.tsx`, línea 79) | Muestra al público el texto fijo `[nueva dirección inscrita en Cámara de Comercio: ___]`. El pie y el resumen ya no muestran la dirección. | Falta de identificación del vendedor: la dirección de notificación judicial es información obligatoria en el comercio electrónico (Ley 1480, art. 50 lit. a; VERIFICAR la letra). Además se publica un marcador interno, y el sitio no puede mostrar `TODO` ni marcadores (`CLAUDE.md`). `config.csv` conserva la dirección anterior, que el código ya no usa. | Decisión del dueño (P36): (a) **recomendada**: mientras la nueva no conste en el certificado, publicar en la fila la dirección inscrita hoy, leída de `direccion_notificacion`; (b) publicar la nueva cuando esté inscrita (D-25), el mismo día; (c) quitar la fila: no cumple el art. 50 y legal lo desaconseja. En ningún caso un marcador. Legal no reintroduce la dirección en los documentos. |
| LEG-135 | Media | Términos §7 y §8; envíos §3, §5, §6, §10 y numeral 13; política §3 y §7; microcopy §1.7, §2, §5.8 y §8.1 | Eliminación del pago contraentrega (decisión del dueño). | Hay que informar antes de contratar los medios de pago disponibles (Ley 1480, art. 50; VERIFICAR el literal). Si los documentos siguieran ofreciendo contraentrega, el cliente podría exigirla (art. 29). Los pedidos enviados con la versión 1 siguen con la versión 1 (términos §15). | **Hecho en los documentos:** se retiraron todas las menciones a contraentrega, efectivo y comisión de recaudo; los plazos se cuentan desde la recepción del pago por Bre-B; el numeral 13 cuenta el plazo desde la validación del pago. D-19 (la tarifa cubre la comisión) queda sin objeto. **Pendiente fuera de legal:** `PRODUCT.md` («Pagos: efectivo contraentrega y transferencia Bre-B» y la decisión del 2026-11-06 sobre la comisión) lo edita quien tenga autorización; los datos de prueba con «Efectivo contraentrega» no se publican, pero conviene revisarlos (QA). |
| LEG-136 | Baja | `/envios/`, frase bajo «Plazos de entrega» (microcopy §5.8) | «Los dos se cuentan en días hábiles desde que aceptas el total en el chat y, si pagas por transferencia Bre-B, desde que recibimos el pago.» | Con solo Bre-B el resultado es el mismo que en envíos §6 versión 2, así que no hay contradicción (art. 34). Pero menciona un caso que ya no existe. | Cambiar por el texto de microcopy v1.7 §5.8 (entrega, punto 3). |
| LEG-137 | Media | Numeral 13 de envíos; términos §4 | Pendientes que la versión 2 no cierra: D-18 y D-23 (contador: IVA del 5 % y facturación con envío gratis); D-19 (que el mensajero cumpla 1 día hábil con cualquier peso en las siete comunas); D-22 (fuente oficial de la división en comunas que cita el numeral 13); confirmar si el dueño atiende los festivos; D-1 (cotejo con el certificado y el RUT). | Un máximo publicado obliga (arts. 29 y 50 lit. h). La leyenda de IVA es una afirmación tributaria del dueño sin concepto escrito. «Según la división en comunas de la Alcaldía» necesita una fuente identificable. | No bloquean encender la promoción por decisión del dueño, pero quedan como riesgo aceptado hasta tener el soporte. Si D-19 sale negativo, legal sube el máximo en una versión nueva **antes** de anunciar. |
| LEG-138 | Baja (informativo) | Rótulo de la versión | El rótulo «Versión 2 · vigente desde 2026-11-12» va en la línea 5 de cada documento, fuera de «Texto para el consumidor». | El parser lo busca en todo el archivo y la página lo pinta sola desde `config.csv` («Versión {n} · vigente desde {fecha}»). Si fuera dentro de la sección, saldría dos veces, con comillas. | Sin cambio. Se mantiene la convención de la versión 1. Las fechas en letras sí van dentro del texto público: numeral 13 de envíos y §13 de la política. |

## Lo que no cambia
- Retracto de 5 días hábiles desde la entrega, salvo empaque abierto o sello roto; transporte de la devolución a cargo del cliente; devolución en 15 días calendario (envíos §9, términos §9).
- Plazos máximos por zona (1, 3, 3 y 6 días hábiles; zona 5 y más de 5 kg al cotizar, máximo 30 días calendario), con la salvedad de las siete comunas.
- Reversión para Bre-B con aviso en 5 días hábiles (envíos §10, términos §11).
- Casillas: mismo texto; la versión y la fecha salen de `config.csv` («versión 2 del 12 de noviembre de 2026»). No se pide nueva autorización a quienes pidieron con la versión 1: las finalidades no cambian (política, nota E).
- Ningún texto menciona la promoción en JSON-LD ni en metadatos (LEG-116).

## Dictamen

- **Documentos versión 2 (como borradores):** **Conforme con observaciones.** Cumplen el control de publicación y recogen las decisiones vigentes. Observaciones: LEG-135 a LEG-138.
- **Encender el envío gratis:** **Conforme con observaciones**, con cuatro condiciones: (1) aprobación del abogado responsable o decisión expresa del dueño de publicar sin ella; (2) `config.csv` con versión 2 y fecha 2026-11-12 en términos y política; (3) `envio_gratis_desde,2026-11-12` en el mismo build y despliegue (LEG-133); (4) `npm run datos` sin errores.
- **Lanzamiento del sitio:** **No conforme.** Siguen abiertos el Bloqueante LEG-024/066/089 (Café Arreboles sin notificación sanitaria, riesgo aceptado por el dueño) y el nuevo Bloqueante LEG-134 (marcador en la dirección de notificación judicial).

## Entrega para desarrollador-fullstack

1. **`data/config.csv`** (legal no edita `data/`). Cambia estas cuatro líneas en el mismo commit que los documentos versión 2:
   ```
   version_terminos,2
   fecha_terminos,2026-11-12
   version_politica_datos,2
   fecha_politica_datos,2026-11-12
   ```
   No toques `envio_gratis_desde`: lo pone el dueño. Debe ser `2026-11-12` y salir en el mismo despliegue (LEG-133). Corre `npm run datos` con la promoción apagada (debe pasar) y con `ENVIO_GRATIS_PRUEBA=si` y `envio_gratis_desde,2026-11-12` (no debe listar errores).
2. **`src/app/legal/[slug]/page.tsx`, línea 79 (LEG-134).** Quita el marcador fijo. La fila «Dirección de notificación judicial» muestra `v.direccionNotificacion` y, sin dato, no se pinta. El valor de `direccion_notificacion` en `config.csv` lo decide el dueño (P36). Hasta entonces no se publica ningún marcador.
3. **`/envios/`, frase bajo «Plazos de entrega» (LEG-136, Baja).** Texto exacto: `El estimado es lo que suele tardar. El máximo es el plazo que nos comprometemos a cumplir. Los dos se cuentan en días hábiles desde que recibimos tu pago por transferencia Bre-B. Si no entregamos en el máximo, puedes cancelar y te devolvemos todo en 15 días calendario.`
4. Comprueba que ningún texto de la interfaz diga «contraentrega», «efectivo» ni «comisión de recaudo» (`src/` y `out/`; los archivos `*.test.ts` pueden conservar los datos de prueba).
5. `PRODUCT.md` (Operating Context, «Pagos», y la decisión del 2026-11-06 sobre la comisión) lo edita quien tenga autorización (LEG-135).

No hay cambios de presentación para `disenador-marca`.

## Puntos para qa-pruebas
- `/legal/terminos/`, `/legal/privacidad/`, `/legal/envios-devoluciones/` y `/legal/vendedor/` muestran «Versión 2 · vigente desde 2026-11-12» y el texto de la sección «Texto para el consumidor», letra por letra.
- Casillas y última línea del mensaje: «versión 2 del 12 de noviembre de 2026».
- `/envios/#envio-gratis` reproduce el numeral 13 letra por letra (sin «contraentrega»).
- `/legal/vendedor/` sin corchetes ni «___».
- Ninguna página del sitio publicado contiene «contraentrega», «efectivo» ni «recaudo».
- Con la promoción apagada, la versión 2 **no** se despliega (LEG-133).
