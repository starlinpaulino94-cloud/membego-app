# Motor Universal de Reglas (Rule Engine) — Fase 1

Infraestructura genérica, multi-tenant y **desacoplada del negocio** para
evaluar reglas configurables. Es la base sobre la que las fases futuras
construirán promociones, membresías, beneficios, QR inteligentes, puntos,
cashback, referidos, automatizaciones, cupones, campañas y gamificación **sin
volver a tocar el núcleo**.

> **Alcance de esta fase:** SOLO la arquitectura del motor. No hay lógica de
> promociones ni acciones de negocio implementadas, y **ningún flujo actual de
> la aplicación invoca el motor**. El comportamiento del sistema no cambia.

---

## 1. Principio rector

El motor **nunca** contiene código como `if empresa == "Car Wash"` o
`if tipo == "Restaurante"`. Toda la lógica vive como **datos** (reglas,
condiciones, acciones) que el motor interpreta. Añadir una estrategia comercial
nueva = insertar filas, no desplegar código.

Esto se logra con dos ideas:

1. **Campos genéricos**: una condición es `campo` (dot-path) + `operador` +
   `valor`. El motor resuelve la ruta contra un contexto genérico y compara. No
   sabe qué significa `cliente.puntos`; solo lo lee.
2. **Registros extensibles**: operadores y acciones se registran en runtime. Se
   añaden nuevos sin modificar el motor (Open/Closed).

---

## 2. Arquitectura por capas (Clean Architecture + DDD)

```
                         ┌───────────────────────────────────────────┐
                         │                 index.ts                   │
                         │      (API pública + composition root)      │
                         │        createRuleEngine(options?)          │
                         └───────────────────────────────────────────┘
                                            │ inyecta
                 ┌──────────────────────────┼──────────────────────────┐
                 ▼                          ▼                           ▼
        ┌─────────────────┐      ┌─────────────────────┐      ┌──────────────────┐
        │   APPLICATION   │      │       DOMAIN        │      │ INFRASTRUCTURE   │
        │  (orquestación) │──────│    (reglas puras)   │◄─────│   (Prisma)       │
        └─────────────────┘ usa  └─────────────────────┘ impl └──────────────────┘
        │ RuleEngine      │      │ types (Rule…)       │      │ PrismaRule       │
        │ RuleEvaluator   │      │ RuleContext         │      │   Repository     │
        │ ActionExecutor  │      │ OperatorRegistry    │      │ PrismaExecution  │
        │ ports (RuleRepo,│      │ ConditionEvaluator  │      │   LogSink        │
        │  ExecutionLog   │      │ ActionRegistry      │      │ mappers          │
        │  Sink)          │      │ errors              │      │                  │
        └─────────────────┘      └─────────────────────┘      └──────────────────┘

   Dirección de dependencias:  infrastructure ──► application ──► domain
   (el dominio no depende de NADA; la infraestructura depende de abstracciones)
```

### Capas

| Capa | Carpeta | Responsabilidad | Depende de |
|------|---------|-----------------|------------|
| **Dominio** | `domain/` | Tipos puros, contexto universal, operadores, evaluación de condiciones, registro de acciones, errores. Cero dependencias externas. | nada |
| **Aplicación** | `application/` | Orquesta el caso de uso (evaluar → ejecutar → auditar). Define los **puertos** que necesita. | dominio |
| **Infraestructura** | `infrastructure/` | Implementa los puertos con Prisma; traduce filas ↔ dominio. | aplicación + dominio |
| **Composition root** | `index.ts` | Cablea implementaciones por defecto y expone la API pública. | todo |

Los 5 módulos que pidió la especificación mapean así:

- **Rule Engine Core** → `application/rule-engine.ts` (orquestador) + dominio.
- **Rule Repository** → puerto `application/ports.ts` + `infrastructure/prisma-rule-repository.ts`.
- **Rule Evaluator** → `application/rule-evaluator.ts` + `domain/conditions.ts`.
- **Action Executor** → `application/action-executor.ts` + `domain/actions.ts`.
- **Rule Context** → `domain/context.ts`.

---

## 3. Modelo de datos

```
┌───────────────┐        ┌────────────────┐        ┌──────────────────┐
│   companies   │ 1    * │   rule_groups  │ 1    * │      rules       │
│  (existente)  │───────▶│  (agrupación   │───────▶│  (regla config.) │
└───────────────┘        │   funcional)   │  0..1  └──────────────────┘
        │                └────────────────┘                 │ 1
        │ 1                                                  │
        │                          ┌─────────────────────────┼───────────────┐
        │                          ▼ *                        ▼ *             │
        │                 ┌──────────────────┐      ┌──────────────────┐      │
        │                 │ rule_conditions  │      │   rule_actions   │      │
        │                 │ campo/operador/  │      │ tipo/params      │      │
        │                 │ valor/tipoValor  │      │ (sin handler aún)│      │
        │                 └──────────────────┘      └──────────────────┘      │
        │ 1                                                                    │
        │                          ┌──────────────────────┐                   │
        └─────────────────────────▶│  rule_execution_logs │◄──────────────────┘
                               *    │  matched/resultado/  │  0..1 (SetNull)
                                    │  contexto/duracionMs │
                                    └──────────────────────┘
```

**Relaciones y borrado:**

- `rule_groups`, `rules`, `rule_execution_logs` → `companies` con `ON DELETE CASCADE`
  (si se borra la empresa, se limpia todo su motor). Multi-tenant: todo cuelga de `companyId`.
- `rules.groupId` → `rule_groups` con `ON DELETE SET NULL` (borrar un grupo no borra sus reglas).
- `rule_conditions`, `rule_actions` → `rules` con `ON DELETE CASCADE`.
- `rule_execution_logs.ruleId` → `rules` con `ON DELETE SET NULL` (la auditoría sobrevive a la regla).

**Campos clave de `rules`:**

- `status` (`DRAFT`/`PUBLISHED`/`ARCHIVED`): ciclo de vida.
- `activo` (bool): interruptor de encendido, **independiente** del ciclo de vida.
- `prioridad` (int): mayor = se evalúa primero.
- `version` (int): se incrementa en cada cambio (base para versionado).
- `matchType` (`ALL`/`ANY`): AND / OR entre condiciones.
- `validoDesde` / `validoHasta`: ventana de vigencia opcional.

Una regla se evalúa **solo si**: `activo = true` **Y** `status = PUBLISHED` **Y**
está dentro de la ventana de vigencia (ver `isRuleEvaluable`).

---

## 4. Flujo interno de una evaluación

```
createRuleEngine()                → construye el motor con dependencias por defecto
        │
engine.run({ companyId, groupKey? }, context)
        │
        ├─▶ 1. repository.findApplicable()   → carga reglas PUBLISHED + activas + vigentes
        │                                       (SQL filtra por empresa/estado/ventana/grupo)
        │
        ├─▶ 2. filtra con isRuleEvaluable()   → red de seguridad (definición canónica del dominio)
        │       y ordena por prioridad desc
        │
        └─▶ 3. por cada regla:
                 │
                 ├─ RuleEvaluator.evaluate(rule, context)
                 │     └─ por cada condición: resolveField(context, campo)
                 │                            + OperatorRegistry.get(operador).evaluate(actual, valor)
                 │     └─ combina ALL (AND, corto-circuito) / ANY (OR, corto-circuito)
                 │
                 ├─ si matched → ActionExecutor.execute(rule, context)
                 │     └─ por cada acción: ActionRegistry.get(tipo)
                 │                          · sin handler (Fase 1) → NO_HANDLER
                 │                          · con handler          → EXECUTED / FAILED (aislado)
                 │
                 └─ logSink.record(...)       → auditoría (Noop por defecto: descarta)
        │
        ▼
   RuleEngineRunResult { evaluated, matched, results[] }
```

**Garantías:**

- **Aislamiento por regla**: un error evaluando/ejecutando una regla no aborta las demás; se captura y se audita.
- **Determinismo**: el `timestamp` del contexto es inyectable → pruebas reproducibles.
- **Sin efectos en Fase 1**: sin handlers registrados, `run()` no produce ningún cambio de negocio.

---

## 5. Justificación de decisiones técnicas

| Decisión | Por qué |
|----------|---------|
| **`campo`/`operador`/`valor` en vez de lógica fija** | Permite crear reglas sin desplegar código. El motor es un intérprete, no un catálogo de `if`. |
| **Operadores y acciones como registros (Map) inyectables** | Open/Closed + DIP: añadir un operador o una acción es registrar un objeto, no editar el núcleo. |
| **`operador` y `tipo` como `String`, no enum de Prisma** | Añadir operadores/acciones **no requiere migración** de BD. Enums (status, matchType) sí son cerrados y pequeños → ahí sí conviene el enum por integridad. |
| **`valor` como `JSON`** | Un valor esperado puede ser número, string, booleano, lista o rango. JSON lo cubre sin columnas por tipo. `tipoValor` guía la coerción al comparar. |
| **Puertos en `application`, implementación en `infrastructure`** | Dependency Inversion: el motor depende de `RuleRepository`/`ExecutionLogSink` (abstracciones), nunca de Prisma. Sustituible por memoria/tests. |
| **Dominio sin importar Prisma; mappers traducen** | El núcleo es testeable en aislamiento y sobrevive a cambios de ORM/esquema. |
| **`RuleContext` como bolsa de namespaces + dot-paths** | Extensible: cada fase añade `data.loquesea` sin que el motor cambie. |
| **`status` (ciclo de vida) separado de `activo` (interruptor)** | Se puede apagar temporalmente una regla publicada sin archivarla, y tener borradores que nunca se evalúan. |
| **`version` incremental** | Base para versionado/auditoría de cambios de reglas. |
| **`ExecutionLogSink` con Noop por defecto** | Cumple "preparar la arquitectura de logs sin registrar todavía". Activar auditoría = inyectar el sink Prisma. |
| **Acción sin handler → `NO_HANDLER` (no error)** | En Fase 1 las acciones existen como estructura; el motor documenta qué haría sin ejecutar nada. |
| **Corto-circuito en ALL/ANY** | Eficiencia: no evalúa condiciones de más una vez decidido el veredicto. |
| **Índices `(companyId, status, activo)` y `(companyId, prioridad)`** | La consulta caliente del motor filtra por empresa/estado y ordena por prioridad. |

---

## 6. Extensibilidad (cómo crecerá sin tocar el núcleo)

```ts
// Añadir un operador nuevo (ej. día de la semana):
const operators = createDefaultOperatorRegistry().register({
  id: 'day_of_week',
  description: 'El día de la semana está en la lista',
  evaluate: (actual, expected) =>
    Array.isArray(expected) && expected.includes(new Date(actual as string).getDay()),
})

// Registrar un handler de acción real (fase futura):
const actions = new ActionRegistry().register({
  type: 'grant_benefit',
  async execute({ action, context }) {
    // …lógica de negocio de la fase correspondiente…
    return { actionId: action.id, type: action.type, status: 'EXECUTED' }
  },
})

// Activar auditoría persistente:
const engine = createRuleEngine({
  operators,
  actions,
  logSink: new PrismaExecutionLogSink(prisma),
})
```

Todo esto se inyecta por `createRuleEngine(options)`; el motor no se modifica.

---

## 7. Mejoras futuras (deliberadamente fuera de Fase 1)

- **Grupos de condiciones anidados** (AND/OR arbitrariamente anidados) además del `matchType` plano actual.
- **Historial de versiones inmutable** (tabla `rule_versions` con snapshot por cambio) sobre el `version` int actual.
- **Caché de reglas por empresa/grupo** con invalidación, para evaluaciones de alta frecuencia.
- **Validación de esquema de condiciones/acciones** (Zod) al guardar, con catálogo de campos disponibles por namespace.
- **UI de constructor de reglas** que consuma `OperatorRegistry.list()` y el catálogo de acciones.
- **Modo "dry-run"/simulación** para probar una regla contra contextos de ejemplo (la estructura ya lo permite: `evaluate` devuelve el detalle por condición).
- **Ejecución transaccional de acciones** cuando los handlers toquen la BD (agrupar en `prisma.$transaction`).
- **Métricas/observabilidad** sobre `rule_execution_logs` (tasa de match, latencia por regla).

---

## 8. Confirmación de no-regresión

Esta fase **solo añade**:

- Enums y tablas nuevas (`rule_groups`, `rules`, `rule_conditions`, `rule_actions`, `rule_execution_logs`) + relaciones inversas en `companies`. La migración `20260725_add_rule_engine_core` **no altera ninguna tabla existente**.
- Un módulo nuevo y autocontenido en `src/lib/rule-engine/`.

**No se modificó** autenticación, usuarios, empresas, panel administrativo,
membresías, promociones, QR ni frontend. Ningún archivo existente cambió su
comportamiento, y **nada de la app invoca el motor todavía**. Verificado con
`tsc --noEmit` (0 errores), `eslint` (0 warnings) y un smoke test de 20
aserciones sobre el motor con repositorio en memoria.
