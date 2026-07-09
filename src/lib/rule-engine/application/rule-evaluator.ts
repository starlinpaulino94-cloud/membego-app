/**
 * RuleEvaluator: decide si una regla COMPLETA se cumple.
 *
 * Recorre las condiciones de la regla y las combina según su `matchType`
 * (ALL = AND, ANY = OR). No ejecuta acciones; solo produce un veredicto y el
 * detalle por condición (útil para auditoría y para la futura UI de pruebas).
 */

import type { RuleContext } from '../domain/context'
import { ConditionEvaluator, type ConditionResult } from '../domain/conditions'
import type { OperatorRegistry } from '../domain/operators'
import type { Rule } from '../domain/types'

export interface RuleMatchResult {
  readonly ruleId: string
  readonly matched: boolean
  readonly matchType: Rule['matchType']
  readonly conditionResults: readonly ConditionResult[]
}

export class RuleEvaluator {
  private readonly conditionEvaluator: ConditionEvaluator

  constructor(operators: OperatorRegistry) {
    this.conditionEvaluator = new ConditionEvaluator(operators)
  }

  /**
   * Evalúa la regla contra el contexto.
   *
   * Convención de borde: una regla SIN condiciones se considera cumplida
   * (regla incondicional). Es coherente con "todas las condiciones se cumplen"
   * cuando el conjunto es vacío, y permite reglas de tipo "aplica siempre".
   */
  evaluate(rule: Rule, context: RuleContext): RuleMatchResult {
    const ordered = [...rule.conditions].sort((a, b) => a.order - b.order)
    const conditionResults: ConditionResult[] = []

    let matched = rule.matchType === 'ALL' // ALL parte de true; ANY parte de false
    for (const condition of ordered) {
      const result = this.conditionEvaluator.evaluate(condition, context)
      conditionResults.push(result)

      if (rule.matchType === 'ALL') {
        matched = matched && result.matched
        // Corto-circuito: en AND, un fallo ya determina el veredicto.
        if (!matched) break
      } else {
        matched = matched || result.matched
        // Corto-circuito: en OR, un acierto ya determina el veredicto.
        if (matched) break
      }
    }

    // Regla sin condiciones → siempre aplica.
    if (ordered.length === 0) matched = true

    return {
      ruleId: rule.id,
      matched,
      matchType: rule.matchType,
      conditionResults,
    }
  }
}
