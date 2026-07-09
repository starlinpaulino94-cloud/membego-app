/**
 * RuleEngine: el orquestador de la capa de aplicación.
 *
 * Coordina el caso de uso completo "evaluar las reglas de una empresa contra un
 * contexto": carga → evalúa → (si aplica) ejecuta acciones → audita. No conoce
 * Prisma ni el negocio: solo depende de puertos (RuleRepository, ExecutionLogSink)
 * y de colaboradores del dominio (RuleEvaluator, ActionExecutor), todos
 * inyectados por el constructor (Dependency Injection).
 */

import type { RuleContext } from '../domain/context'
import { isRuleEvaluable, type Rule } from '../domain/types'
import type { ActionOutcome } from '../domain/actions'
import type { ActionExecutor } from './action-executor'
import type { RuleEvaluator, RuleMatchResult } from './rule-evaluator'
import {
  snapshotContext,
  type ExecutionLogSink,
  type RuleRepository,
} from './ports'

export interface RuleEngineDeps {
  readonly repository: RuleRepository
  readonly evaluator: RuleEvaluator
  readonly executor: ActionExecutor
  readonly logSink: ExecutionLogSink
}

export interface RuleEngineQuery {
  readonly companyId: string
  /** Restringe la evaluación a un grupo de reglas (por su `key`). */
  readonly groupKey?: string
  /** Momento de referencia (por defecto: el timestamp del contexto). */
  readonly at?: Date
}

/** Resultado de evaluar UNA regla. */
export interface RuleEvaluationResult {
  readonly rule: Rule
  readonly match: RuleMatchResult
  readonly actions: readonly ActionOutcome[]
  readonly durationMs: number
}

/** Resultado agregado de una corrida del motor. */
export interface RuleEngineRunResult {
  readonly companyId: string
  readonly evaluated: number
  readonly matched: number
  readonly results: readonly RuleEvaluationResult[]
}

export class RuleEngine {
  constructor(private readonly deps: RuleEngineDeps) {}

  /**
   * Ejecuta el motor: evalúa todas las reglas aplicables, en orden de prioridad
   * (mayor primero), y ejecuta las acciones de las que se cumplen. Devuelve un
   * informe detallado. Cada regla se aísla: un error evaluando una no aborta el
   * resto (se registra en su auditoría y se continúa).
   */
  async run(query: RuleEngineQuery, context: RuleContext): Promise<RuleEngineRunResult> {
    const at = query.at ?? context.timestamp
    const rules = await this.deps.repository.findApplicable({
      companyId: query.companyId,
      groupKey: query.groupKey,
      at,
    })

    // Doble red de seguridad: el repositorio ya filtra, pero volvemos a validar
    // la ventana de vigencia con la definición canónica del dominio.
    const evaluable = rules
      .filter((rule) => isRuleEvaluable(rule, at))
      .sort((a, b) => b.priority - a.priority)

    const results: RuleEvaluationResult[] = []
    let matchedCount = 0

    for (const rule of evaluable) {
      const startedAt = Date.now()
      let match: RuleMatchResult | null = null
      let actions: readonly ActionOutcome[] = []
      let error: string | null = null

      try {
        match = this.deps.evaluator.evaluate(rule, context)
        if (match.matched) {
          const report = await this.deps.executor.execute(rule, context)
          actions = report.outcomes
          matchedCount++
        }
      } catch (err) {
        error = err instanceof Error ? err.message : String(err)
      }

      const durationMs = Date.now() - startedAt

      // Auditoría (el sink por defecto la descarta).
      await this.deps.logSink.record({
        ruleId: rule.id,
        companyId: query.companyId,
        matched: match?.matched ?? false,
        result: {
          matched: match?.matched ?? false,
          actions: actions.map((a) => ({ type: a.type, status: a.status })),
          error,
        },
        context: snapshotContext(context),
        durationMs,
        error,
      })

      results.push({
        rule,
        match: match ?? {
          ruleId: rule.id,
          matched: false,
          matchType: rule.matchType,
          conditionResults: [],
        },
        actions,
        durationMs,
      })
    }

    return {
      companyId: query.companyId,
      evaluated: results.length,
      matched: matchedCount,
      results,
    }
  }
}
