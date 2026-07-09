/**
 * Motor Universal de Reglas (Rule Engine) — API pública y composition root.
 *
 * FASE 1: solo infraestructura. El motor evalúa reglas configurables contra un
 * contexto genérico y deja preparada la ejecución de acciones, PERO no hay
 * acciones de negocio implementadas ni ningún flujo de la app lo invoca aún.
 *
 * Este archivo es lo único que el resto de la aplicación debería importar:
 * expone una fábrica que cablea las implementaciones por defecto y re-exporta
 * los tipos/piezas necesarios para configurarlo o extenderlo.
 *
 * @example
 *   import { createRuleEngine, RuleContextBuilder } from '@/lib/rule-engine'
 *
 *   const engine = createRuleEngine()
 *   const context = new RuleContextBuilder(companyId)
 *     .set('cliente', { puntos: 120 })
 *     .build()
 *   const result = await engine.run({ companyId }, context)
 */

import { prisma } from '@/lib/prisma'
import { ActionRegistry } from './domain/actions'
import {
  createDefaultOperatorRegistry,
  type OperatorRegistry,
} from './domain/operators'
import { ActionExecutor } from './application/action-executor'
import { RuleEvaluator } from './application/rule-evaluator'
import { RuleEngine } from './application/rule-engine'
import {
  NoopExecutionLogSink,
  type ExecutionLogSink,
  type RuleRepository,
} from './application/ports'
import { PrismaRuleRepository } from './infrastructure/prisma-rule-repository'

/** Dependencias sobreescribibles del motor (todas opcionales). */
export interface CreateRuleEngineOptions {
  /** Repositorio de reglas. Por defecto: Prisma sobre el cliente global. */
  repository?: RuleRepository
  /** Registro de operadores. Por defecto: catálogo estándar. */
  operators?: OperatorRegistry
  /** Registro de acciones. Por defecto: VACÍO (Fase 1, sin handlers). */
  actions?: ActionRegistry
  /** Sumidero de auditoría. Por defecto: no-op (no persiste). */
  logSink?: ExecutionLogSink
}

/**
 * Composition root: construye un RuleEngine con valores por defecto sensatos y
 * permite inyectar cualquier dependencia (Dependency Injection). Las fases
 * futuras pasarán un ActionRegistry con handlers y/o un PrismaExecutionLogSink.
 */
export function createRuleEngine(options: CreateRuleEngineOptions = {}): RuleEngine {
  const operators = options.operators ?? createDefaultOperatorRegistry()
  const actions = options.actions ?? new ActionRegistry()
  const repository = options.repository ?? new PrismaRuleRepository(prisma)
  const logSink = options.logSink ?? new NoopExecutionLogSink()

  return new RuleEngine({
    repository,
    evaluator: new RuleEvaluator(operators),
    executor: new ActionExecutor(actions),
    logSink,
  })
}

// ── Re-exports públicos ─────────────────────────────────────────────────────
// Dominio
export { RuleContextBuilder, resolveField, RESERVED_FIELDS } from './domain/context'
export type { RuleContext } from './domain/context'
export {
  OperatorRegistry,
  createDefaultOperatorRegistry,
} from './domain/operators'
export type { Operator } from './domain/operators'
export { ActionRegistry } from './domain/actions'
export type {
  ActionHandler,
  ActionOutcome,
  ActionOutcomeStatus,
  ActionExecutionInput,
} from './domain/actions'
export type {
  Rule,
  RuleAction,
  RuleCondition,
  RuleGroupRef,
  RuleStatus,
  RuleMatchType,
  ConditionValueType,
} from './domain/types'
export { isRuleEvaluable } from './domain/types'
export {
  RuleEngineError,
  UnknownOperatorError,
  DuplicateRegistrationError,
  InvalidConditionError,
} from './domain/errors'

// Aplicación
export { RuleEngine } from './application/rule-engine'
export type {
  RuleEngineQuery,
  RuleEngineRunResult,
  RuleEvaluationResult,
} from './application/rule-engine'
export { RuleEvaluator } from './application/rule-evaluator'
export type { RuleMatchResult } from './application/rule-evaluator'
export { ActionExecutor } from './application/action-executor'
export {
  NoopExecutionLogSink,
  snapshotContext,
} from './application/ports'
export type {
  RuleRepository,
  ExecutionLogSink,
  RuleExecutionLogEntry,
  FindApplicableRulesQuery,
} from './application/ports'

// Infraestructura
export { PrismaRuleRepository } from './infrastructure/prisma-rule-repository'
export { PrismaExecutionLogSink } from './infrastructure/prisma-execution-log-sink'
