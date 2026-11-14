> BORRADOR — Pendiente de revisión y aprobación por el abogado responsable. Versión 0.1 — 2026-11-12.

# Revisión LEG-139: historia de portada («Nuestra historia», párrafos 1 y 2)

**Pedido.** El dueño pidió un texto nuevo para «Nuestra historia» en la portada. QA lo marcó en QA-013 (`docs/qa/2026-11-12-cambios-pago-botones-vendedor.md`). Ubicación: `src/ui/componentes/layout/secciones-inicio.tsx`, función `historiaRespaldo` (solo lectura).

**Fuentes.** `PRODUCT.md` (modelo C, «Brand Commitments»), `docs/marca-v4.1.md` (tono y palabras que se evitan), `microcopy-legal.md` §2 (v1.7), LEG-069 a LEG-071, `data/catalogo.csv` y `data/config.csv` (solo lectura: los dos cafés activos tienen `marca` y `fabricante` vacíos; `ciudad_despacho` = Bucaramanga; `domicilio` = Bucaramanga, Santander).

## Hallazgo

| # | Severidad | Ubicación | Texto o práctica | Riesgo y norma | Corrección propuesta |
|---|---|---|---|---|---|
| LEG-139 | Alta | Portada, «Nuestra historia», párrafos 1 y 2 (`historiaRespaldo`) | (1) «mucho más una tienda» (falta «que»; y contradice la frase «es una tienda» del modelo C); (2) «puente directo entre los mejores caficultores de nuestra tierra y tu taza»; (3) «selección exclusiva»; (4) «tostados y empacados directamente por sus productores»; (5) «el proceso que lo hicieron único» (errata de concordancia y afirmación no demostrable); (6) se quitó la condición LEG-070 (marca y fabricante solo si todos los cafés los traen). | **Exige la norma:** la información y la publicidad deben ser veraces, suficientes y comprobables, y no inducir a error sobre el origen ni sobre quién elabora el producto (Ley 1480 de 2011, arts. 23, 29 y 30; VERIFICAR la letra vigente en SUIN-Juriscol). (2) «Los mejores» es un superlativo objetivo que no se puede probar; «puente directo» y «caficultores» afirman una relación con productores que la tienda no tiene: compra a marcas. (3) «Exclusiva» afirma un acuerdo de exclusividad que no consta. (4) El rótulo dice «FABRICADO POR» o «ENVASADO POR», y ese fabricante no siempre es el productor; además, hoy ninguna ficha muestra el fabricante (D-11), así que «tal como lo ves en cada ficha» es falso. **Se recomienda (marca v4.1):** evitar «el mejor» y equivalentes, y hacer solo afirmaciones demostrables. | Texto de `microcopy-legal.md` v1.8 §2, con variante A (todos los cafés activos con marca y fabricante) y variante B (rige hoy). Se conservan la intención y el tono del dueño: «nuestra tierra» (domicilio en Bucaramanga, Santander), «reunimos», «te contamos», el tuteo, el despacho desde Bucaramanga y la lista de datos de origen. |

## Texto corregido (microcopy v1.8 §2)

**Variante B, rige hoy** (algún café activo sin `marca` o sin `fabricante`):

> De Santander es una tienda de café de origen santandereano. Reunimos cafés de marcas de nuestra tierra, cada uno tal como lo empaca su fabricante.
>
> Desde {ciudad_despacho} los enviamos a todo Colombia. En cada café te contamos de dónde viene: la provincia, el municipio, la altitud, la variedad y el proceso.

**Variante A** (todos los cafés activos traen `marca` y `fabricante`):

> De Santander es una tienda de café de origen santandereano. Reunimos cafés de marcas de nuestra tierra, tostados y empacados por quien figura en cada bolsa y en cada ficha.
>
> Desde {ciudad_despacho} los enviamos a todo Colombia. En cada café te contamos quién lo hace y de dónde viene: la marca, quién lo fabrica, la provincia, el municipio, la altitud, la variedad y el proceso.

**Regla de la lista del párrafo 2.** Provincia, municipio, altitud, variedad y proceso se nombran solo si todos los cafés activos traen ese dato. Hoy los dos cafés traen los cinco.

**Por qué cada cambio.**
- «Es una tienda»: es lo que la tienda puede probar y lo que dice el modelo C. «Más que una tienda» desaparece con la errata.
- «Reunimos cafés de marcas de nuestra tierra»: conserva el orgullo regional sin «los mejores», «exclusiva» ni «puente directo». Depende de que las marcas sean de Santander (pregunta 1).
- «Cada uno tal como lo empaca su fabricante» (B): dice la verdad del modelo C sin prometer un dato que la ficha todavía no muestra. Coincide con «Cómo pedir», paso 1.
- «Te contamos de dónde viene»: reemplaza «su historia… que lo hicieron único». La ficha muestra datos de origen, no la historia de cada café, que todavía no existe en Sanity.

## Dictamen

- **Texto pedido por el dueño:** **No conforme** (LEG-139, Alta).
- **Texto de microcopy v1.8 §2, variante B con los datos de hoy:** **Conforme**, siempre que el dueño confirme la pregunta 1.
- **Lanzamiento:** sin cambio. Sigue **No conforme** por los Bloqueantes abiertos LEG-024/066/089 y LEG-134 (`2026-11-12-publicacion-v2.md`).

## Preguntas al dueño

1. **P37 (resuelta 2026-11-12: el dueño confirma que ambas marcas son de Santander y tienen domicilio legal allí; se mantiene «marcas de nuestra tierra»).** ¿Las dos marcas que vende hoy (Café Casa Martínez y Café Arreboles) son de Santander, es decir, su fabricante o titular tiene domicilio en Santander? «Marcas de nuestra tierra» lo afirma. Si alguna no lo es, la frase cambia a `Reunimos cafés de origen santandereano, cada uno tal como lo empaca su fabricante.`
2. Para pasar a la variante A hace falta D-11: la marca y el fabricante o envasador de cada café, tal como figuran en la bolsa.

## Entrega para desarrollador-fullstack

1. En `src/ui/componentes/layout/secciones-inicio.tsx`, `historiaRespaldo(catalogo)`, reemplaza los dos párrafos por los de microcopy v1.8 §2:
   - Variante A solo si **todos** los cafés activos tienen `marca` y `fabricante` no vacíos. Si no, variante B en los dos párrafos.
   - `{ciudad_despacho}` sale de `catalogo.tienda.ciudadDespacho`.
   - Cada dato de la lista del párrafo 2 (provincia, municipio, altitud, variedad, proceso) va solo si todos los cafés activos lo traen. Respeta el orden, une con comas y pon «y» antes del último. Si no queda ninguno, el párrafo termina en «… a todo Colombia.»
   - El comentario de la función ya cita LEG-070. Agrega LEG-139.
2. Prueba unitaria con tres casos: hoy (B, con los cinco datos); todos con marca y fabricante (A); un café sin altitud (la lista omite «la altitud»).
3. No cambian el titular («Santander *en cada taza*») ni la foto de respaldo (LEG-104).

No hay cambios de presentación para `disenador-marca`.

## Puntos para qa-pruebas

- `/` muestra la variante B, letra por letra, con «Bucaramanga».
- El HTML de `out/index.html` no contiene «los mejores», «mejor», «exclusiva», «puente directo», «directamente por sus productores», «más que una tienda», «mucho más» ni «único».
- `e2e/qa-2026-11-12-cambios.spec.ts` › «QA-013» pasa.
- Con datos de prueba con marca y fabricante en todos los cafés activos, se ve la variante A.
