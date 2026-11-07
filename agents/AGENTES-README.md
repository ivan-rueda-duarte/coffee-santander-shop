# Agentes del proyecto De Santander

Cuatro subagentes de Claude Code para diseñar, desarrollar, probar y revisar legalmente la tienda web.

| Agente | Archivo | Modelo | Puede editar | Uso típico |
|---|---|---|---|---|
| `disenador-marca` | `.claude/agents/disenador-marca.md` | opus | `src/styles/`, presentación en `src/ui/` y especificaciones en `docs/diseno/` | especificar pantallas, auditar marca v4.1 y accesibilidad |
| `desarrollador-fullstack` | `.claude/agents/desarrollador-fullstack.md` | opus | `src/`, `tools/`, `studio/` y configuración (con confirmación para acciones remotas) | implementar fases del PROMPT-V2, corregir defectos |
| `qa-pruebas` | `.claude/agents/qa-pruebas.md` | opus | solo pruebas (`e2e/`, `*.test.ts`) y reportes (`docs/qa/`) | pruebas unitarias, e2e, axe, Lighthouse, paridad v1 |
| `legal-cumplimiento` | `.claude/agents/legal-cumplimiento.md` | opus | `docs/legal/**` (y `docs/PENDIENTES.md` para datos faltantes) | términos, datos personales, retracto, revisión de textos |

## Instalación

`agents/` es la fuente editable; Claude Code solo lee `.claude/agents/`. Tras cambiar un agente, sincronice (sin copiar este README, que no es un agente):

```bash
cp agents/{disenador-marca,desarrollador-fullstack,qa-pruebas,legal-cumplimiento}.md .claude/agents/
```

Los agentes se cargan al iniciar la sesión (el asistente `/agents` ya no existe): para ver un cambio, reinicie Claude Code. Para modificar modelo o herramientas, edite el encabezado del archivo en `agents/` y sincronice.

**Prioridad de documentos:** `CLAUDE.md` y `PRODUCT.md` mandan. Los agentes y `docs/PROMPT-V2.md` mencionan Supabase por herencia de un plan anterior; la v2 usa CSV en `data/` y el pedido sale por WhatsApp sin base de datos.

## Cómo invocarlos

Claude Code los elige solo según la descripción, pero es mejor nombrarlos:

```
Usa el agente disenador-marca para especificar la ficha de café en 360 px y escritorio.
Usa el agente desarrollador-fullstack para implementar la FASE 3 del PROMPT-V2 según esa especificación.
Usa el agente qa-pruebas para probar la ficha y el carrito; guarda el reporte.
Usa el agente legal-cumplimiento para redactar la política de tratamiento de datos y el texto de la casilla.
```

También puede mencionarlos con `@` (por ejemplo, `@qa-pruebas revisa la rama v2-nextjs`).

## Flujo recomendado por funcionalidad

```
disenador-marca (especificación)  ──►  desarrollador-fullstack (implementación + pruebas unitarias)
        ▲                                         │
        │                                         ▼
        └──── defectos visuales ◄──── qa-pruebas (ronda de pruebas, reporte docs/qa/)
                                                  │
legal-cumplimiento (textos y requisitos) ─────────┘ (verifica que estén implementados)
```

1. **Legal primero en lo que bloquea**: casillas, datos del vendedor y políticas cambian formularios y footer.
2. **Diseño** especifica → **Desarrollo** implementa → **QA** prueba → Desarrollo corrige citando `QA-###` → QA verifica y cierra.
3. Antes de cada despliegue a GitHub Pages: ronda completa de `qa-pruebas` + revisión legal integral con dictamen de `legal-cumplimiento`.

Los subagentes no se llaman entre sí. Cada uno termina con un bloque **"Entrega para …"**, y la sesión principal de Claude Code se lo pasa al siguiente agente. Para que el ciclo corra solo, pídalo así:

```
Haz el ciclo de calidad de la rama v2-nextjs:
1) qa-pruebas ejecuta la ronda completa y reporta;
2) desarrollador-fullstack corrige los defectos Bloqueante y Alta;
3) qa-pruebas verifica las correcciones;
repite hasta que no queden Bloqueante ni Alta, con un máximo de 3 vueltas, y me resumes al final.
```

```
Haz la revisión legal completa antes del lanzamiento: legal-cumplimiento revisa todo el contenido y emite dictamen;
desarrollador-fullstack aplica los cambios de interfaz que pida; qa-pruebas verifica que estén implementados;
legal-cumplimiento confirma la conformidad.
```

## Estados y responsables

| Registro | Carpeta | Quién abre | Quién corrige | Quién cierra |
|---|---|---|---|---|
| `QA-###` | `docs/qa/` | qa-pruebas | desarrollador-fullstack (marca "Corregido — pendiente verificación") | qa-pruebas |
| `LEG-###` | `docs/legal/revisiones/` | legal-cumplimiento | legal (textos legales) o desarrollador (interfaz) | legal-cumplimiento |

## Bloque para CLAUDE.md

Ya está incorporado en la sección «Agentes del proyecto» de `CLAUDE.md`; no hay que copiarlo.

## Herramientas y límites por agente

| Agente | `tools` | Límite de escritura |
|---|---|---|
| `disenador-marca` | Read, Grep, Glob, Edit, Write, Skill | estilos, presentación, `docs/diseno/**`; sin Bash |
| `desarrollador-fullstack` | Read, Grep, Glob, Edit, Write, Bash, WebFetch, Skill | código y configuración; sin `docs/legal/**`; acciones remotas con confirmación |
| `qa-pruebas` | Read, Grep, Glob, Bash, Write, Edit | pruebas y `docs/qa/**` (por instrucción; el campo `tools` no restringe rutas) |
| `legal-cumplimiento` | Read, Grep, Glob, Write, Edit, WebSearch, WebFetch | `docs/legal/**` y `docs/PENDIENTES.md`; sin Bash |

Ninguno incluye la herramienta Agent: los subagentes no se llaman entre sí.

## Ajustes frecuentes

- **Modelo y esfuerzo**: los cuatro agentes usan `model: opus` y `effort: medium` en su encabezado. Cambie esos dos campos en `agents/` y sincronice para subir o bajar costo; `inherit` usa el modelo de la sesión.
- **Herramientas**: los cuatro agentes tienen lista explícita de `tools`. Si añade un servidor MCP (por ejemplo Playwright MCP), agregue sus herramientas al agente que lo necesite.
- **Capturas de pantalla**: sin servidores MCP, QA usa Playwright desde la terminal (`npx playwright screenshot …`) y guarda la evidencia en `docs/qa/capturas/`. Si más adelante instala Playwright MCP, agregue sus herramientas al campo `tools` de `qa-pruebas`.
