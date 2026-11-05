# Agentes del proyecto De Santander

Cuatro subagentes de Claude Code para diseñar, desarrollar, probar y revisar legalmente la tienda web.

| Agente | Archivo | Modelo | Puede editar | Uso típico |
|---|---|---|---|---|
| `disenador-marca` | `.claude/agents/disenador-marca.md` | opus | estilos y componentes de presentación | especificar pantallas, auditar marca v4.1 y accesibilidad |
| `desarrollador-fullstack` | `.claude/agents/desarrollador-fullstack.md` | opus | todo el código (con confirmación para acciones remotas) | implementar fases del PROMPT-V2, corregir defectos |
| `qa-pruebas` | `.claude/agents/qa-pruebas.md` | sonnet | solo pruebas y reportes | pruebas unitarias, e2e, axe, Lighthouse, paridad v1 |
| `legal-cumplimiento` | `.claude/agents/legal-cumplimiento.md` | opus | `docs/legal/**` | términos, datos personales, retracto, revisión de textos |

## Instalación

1. Copie la carpeta `.claude/agents/` en la raíz del repositorio (junto a `CLAUDE.md`).
2. Copie el bloque de la sección siguiente al final de su `CLAUDE.md`.
3. Cree las carpetas `docs/qa/` y `docs/legal/` (los agentes también pueden crearlas).
4. Abra Claude Code en la raíz y ejecute `/agents`: deben aparecer los cuatro. Desde ahí puede editar herramientas o modelo.

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

```markdown
## Agentes del proyecto
- Diseño y marca: `disenador-marca`. Toda pantalla nueva o cambio visual pasa primero por él.
- Código: `desarrollador-fullstack`. Sigue docs/PROMPT-V2.md; pide confirmación antes de cualquier acción remota.
- Pruebas: `qa-pruebas`. Se ejecuta después de cada cambio y antes de cada merge; no corrige código de producción.
- Legal: `legal-cumplimiento`. Redacta los documentos legales en docs/legal/ y revisa todo el contenido del sitio con dictamen (LEG-### en docs/legal/revisiones/); nada legal se publica sin aprobación del abogado responsable.
- Ciclo de defectos: qa-pruebas reporta → desarrollador-fullstack corrige y marca "Corregido — pendiente verificación" → qa-pruebas verifica y cierra.
- Ningún agente inventa datos de negocio: usan TODO(dato) en docs/PENDIENTES.md.
- Defectos con ID QA-### en docs/qa/; los commits que los corrigen citan el ID.
```

## Ajustes frecuentes

- **Costos**: cambie `model: opus` por `sonnet` en diseño o desarrollo si quiere bajar consumo; `inherit` usa el modelo de la sesión.
- **Herramientas**: diseño y desarrollo no tienen campo `tools`, por lo que heredan todas (incluidas skills como `impeccable` y servidores MCP). QA y legal están restringidos a propósito.
- **Capturas de pantalla**: sin servidores MCP, QA usa Playwright desde la terminal (`npx playwright screenshot …`) y guarda la evidencia en `docs/qa/capturas/`. Si más adelante instala Playwright MCP, agregue sus herramientas al campo `tools` de `qa-pruebas`.
