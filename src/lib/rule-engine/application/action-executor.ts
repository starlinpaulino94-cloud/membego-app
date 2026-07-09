/**
 * ActionExecutor: ejecuta las acciones de una regla que SÍ se cumplió.
 *
 * Resuelve cada acción contra el ActionRegistry y delega en su handler. En
 * Fase 1 el registro está vacío, así que toda acción se resuelve como
 * `NO_HANDLER`: el motor deja constancia de qué se habría ejecutado sin
 * disparar ningún efecto de negocio. Cada acción se aísla: el fallo de una
 * (FAILED) no impide intentar las siguientes.
 */

import type { RuleContext } from '../domain/context'
import {
  type ActionOutcome,
  type ActionRegistry,
} from '../domain/actions'
import type { Rule } from '../domain/types'

export interface ActionExecutionReport {
  readonly ruleId: string
  readonly outcomes: readonly ActionOutcome[]
}

export class ActionExecutor {
  constructor(private readonly registry: ActionRegistry) {}

  async execute(rule: Rule, context: RuleContext): Promise<ActionExecutionReport> {
    const ordered = [...rule.actions].sort((a, b) => a.order - b.order)
    const outcomes: ActionOutcome[] = []

    for (const action of ordered) {
      const handler = this.registry.get(action.type)

      if (!handler) {
        // Fase 1: sin handler registrado. Se documenta, no se ejecuta nada.
        outcomes.push({
          actionId: action.id,
          type: action.type,
          status: 'NO_HANDLER',
        })
        continue
      }

      try {
        const outcome = await handler.execute({ rule, action, context })
        outcomes.push(outcome)
      } catch (err) {
        outcomes.push({
          actionId: action.id,
          type: action.type,
          status: 'FAILED',
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    return { ruleId: rule.id, outcomes }
  }
}
