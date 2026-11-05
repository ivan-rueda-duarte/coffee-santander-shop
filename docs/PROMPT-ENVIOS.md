# Prompt para Claude Code — Cálculo de envío por zonas (De Santander)

Uso: guarde este archivo como `docs/PROMPT-ENVIOS.md` y en la terminal, en la raíz del repo, ejecute
`claude "Lee docs/PROMPT-ENVIOS.md completo y ejecútalo empezando por la FASE 0."`

~~~~markdown
# MISIÓN

Implementa el cálculo del costo de envío en la tienda De Santander a partir de dos CSV nuevos en `data/` y la política descrita en `docs/ENVIOS.md`. Sin API externa, sin Supabase para tarifas, sin cotizador en vivo: tabla de zonas × escalones de peso, evaluada en el cliente. El resultado se muestra en el carrito y viaja sumado en el mensaje de WhatsApp.

Reglas de trabajo:
- Modo plan. No escribas código hasta terminar la FASE 0 y que yo apruebe el plan.
- Rama `feat/envios-zonas`. Commits pequeños en español (`feat(envios): …`).
- Respeta `CLAUDE.md` (marca v4.1, arquitectura por capas, "no inventar datos"). Un dato que falte → `TODO(dato):` en `docs/PENDIENTES.md`, no en la interfaz.
- No toques precios de café, catálogo ni el flujo de WhatsApp más allá de lo que este prompt pide.
- Si algo aquí contradice `PRODUCT.md`, `docs/PENDIENTES.md` o el código, detente y pregúntame.

# FASE 0 — Inspección (solo lectura)

1. `docs/ENVIOS.md`: política completa (zonas, escalones, regla "por cotizar", textos). Es norma.
2. `data/tarifas_envio.csv` y `data/zonas_envio.csv`: fuente de verdad de los números.
3. `data/LEEME.md` y cómo se cargan hoy `data/catalogo.csv`, `data/municipios.csv`, `data/provincias.csv`, `data/config.csv` (busca el loader en `src/` o `tools/`). Los dos CSV nuevos deben cargarse por el mismo mecanismo.
4. `src/domain/pedido/` (carrito, totales, mensaje-whatsapp, envio) y `src/application/`: dónde se calcula el total y dónde se construye el mensaje.
5. El formulario de envío: qué campos de departamento y municipio existen, de dónde sale la lista (DIVIPOLA en JSON local según `docs/PROMPT-V2.md`) y con qué nombres se guardan. La resolución de zona debe casar por nombre normalizado (sin tildes, minúsculas) o por código DIVIPOLA si está disponible.
6. `docs/PENDIENTES.md` y `PRODUCT.md`: qué dicen hoy sobre envío ("se confirma por WhatsApp").

Entrega de la FASE 0: resumen de dónde se enchufa cada pieza, lista de inconsistencias y plan por pasos. ESPERA mi aprobación.

# DISEÑO ESPERADO

## Dominio (`src/domain/pedido/envio.ts` o módulo nuevo `src/domain/envio/`)
- Tipos: `Zona = 1|2|3|4|5`, `TarifaEnvio { zona, clave, nombre, medio, escalones: [number, number, number] | null }`, `ResultadoEnvio = { tipo: 'tarifa', zona, clave, pesoFacturableG, escalonKg, valorCop } | { tipo: 'por_cotizar', zona, pesoFacturableG, motivo: 'zona_especial' | 'mas_de_5kg' }`.
- `calcularPesoFacturable(items, EMPAQUE_G = 80)`: suma de gramos de las bolsas × cantidad + empaque.
- `resolverZona(departamento, municipio, reglas)`: precedencia municipio > departamento > 4. Normaliza tildes y mayúsculas. Devuelve también la `clave` de tarifa (en zona 1 la clave es el municipio; en 2–5, `zona2`…`zona5`).
- `calcularEnvio(items, destino, tarifas, reglas)`: aplica la regla: > 5.080 g (5 kg + empaque) → `por_cotizar/mas_de_5kg`; zona 5 → `por_cotizar/zona_especial`; en otro caso el primer escalón (1, 2, 5 kg) cuyo límite sea ≥ al peso.
- Funciones puras, sin React ni acceso a datos. Cobertura ≥ 90 % con Vitest: bordes exactos (1.080/1.081 g, 2.080/2.081 g, 5.080/5.081 g), zona 1 por municipio, departamento con excepción municipal (Florencia → 4, resto de Caquetá → 5), municipio desconocido → 4, tildes ("Giron" = "Girón").

## Datos
- Loader de `tarifas_envio.csv` y `zonas_envio.csv` con el mismo patrón de los CSV existentes; validación con zod al cargar (zona entre 1 y 5, escalones numéricos ascendentes, `por_cotizar` solo en zona 5).
- `EMPAQUE_G` y `ESCALONES_KG` en `data/config.csv` si ese archivo ya guarda constantes de tienda; si no, en el módulo de dominio.

## UI
- Carrito y resumen: línea "Envío" con el valor y el nombre de zona ("Envío a Bogotá · zona 3: $18.000"). Si es `por_cotizar`: "Envío por cotizar · te confirmamos el valor por WhatsApp antes de que pagues", sin sumarlo al total, y el total rotulado "Total sin envío".
- El envío se recalcula al cambiar departamento, municipio o el contenido del carrito.
- Nada de "premium", "gourmet" ni promesas de fecha. Plazos por zona según `docs/ENVIOS.md`, como orientación.

## Mensaje de WhatsApp (`mensaje-whatsapp.ts`)
Agrega las líneas de envío al bloque de totales, con snapshot en pruebas:
```
Subtotal: $96.000
Envío (Bogotá · zona 3): $18.000
Total: $114.000
```
Caso por cotizar:
```
Subtotal: $96.000
Envío: POR COTIZAR (zona especial)      ← o (más de 5 kg)
Total sin envío: $96.000
```
Conserva el límite de ≈ 2.000 caracteres.

## Página de envíos y legales
- Sección o página "Envíos" con la tabla de zonas y tarifas generada desde el CSV (no escrita a mano), los plazos orientativos y la advertencia de "reclamar en oficina" en municipios sin reparto. Enlázala desde el footer y desde el resumen del pedido.
- Actualiza `PRODUCT.md` (decisión: envío calculado por zonas; "por cotizar" solo en zona 5 y > 5 kg) y `docs/PENDIENTES.md` (los TODO(dato) de `docs/ENVIOS.md` §7).

# DEFINICIÓN DE TERMINADO
- `npm run lint && npm run typecheck && npm test && npm run build` en verde; e2e: pedido a Bogotá 2 × 500 g (1.080 g con el empaque, dentro del escalón de 1 kg) muestra $18.000 y el `href` de WhatsApp contiene "Envío (Bogotá · zona 3): $18.000"; pedido a Leticia muestra "por cotizar" y el total "sin envío".
- Tabla de envíos en la página renderizada desde `data/tarifas_envio.csv`.
- Resumen de 5 líneas al final de cada paso; espera mi "sigue".
~~~~
