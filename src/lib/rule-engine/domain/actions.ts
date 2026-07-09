/**
 * Contrato y registro de ACCIONES.
 *
 * IMPORTANTE (Fase 1): aquí solo vive la ARQUITECTURA. No se registra ningún
 * handler real —ni beneficios, ni membresías, ni QR—. El motor, al ejecutar una
 * acción sin handler, devuelve un resultado `NO_HANDLER` en lugar de fallar.
 * Las fases futuras registrarán handlers (grant_benefit, add_points, notify…)
 * SIN modificar el motor (Open/Closed + Dependency Injection).
 */

import type { RuleContext } from './context'
import { DuplicateRegistrationError } from './errors'
import type { Rule, RuleAction } from './types'

/** Estado del intento de ejecutar una acción. */
export type ActionOutcomeStatus = 'EXECUTED' | 'SKIPPED' | 'NO_HANDLER' | 'FAILED'

export interface ActionOutcome {
  readonly actionId: string
  readonly type: string
  readonly status: ActionOutcomeStatus
  /** Datos devueltos por el handler (libre). */
  readonly detail?: unknown
  /** Mensaje de error si status === 'FAILED'. */
  readonly error?: string
}

/** Todo lo que un handler necesita para ejecutar una acción. */
export interface ActionExecutionInput {
  readonly rule: Rule
  readonly action: RuleAction
  readonly context: RuleContext
}

/**
 * Puerto (interface) que implementará cada acción de negocio en el futuro.
 * El motor depende de esta abstracción, nunca de implementaciones concretas
 * (Dependency Inversion).
 */
export interface ActionHandler {
  /** Clave que enlaza con RuleAction.type. */
  readonly type: string
  execute(input: ActionExecutionInput): Promise<ActionOutcome> | ActionOutcome
}

/**
 * Registro extensible de handlers de acción. En Fase 1 se instancia vacío: el
 * ActionExecutor tratará toda acción como `NO_HANDLER`.
 */
export class ActionRegistry {
  private readonly handlers = new Map<string, ActionHandler>()

  register(handler: ActionHandler): this {
    if (this.handlers.has(handler.type)) {
      throw new DuplicateRegistrationError('acción', handler.type)
    }
    this.handlers.set(handler.type, handler)
    return this
  }

  has(type: string): boolean {
    return this.handlers.has(type)
  }

  get(type: string): ActionHandler | undefined {
    return this.handlers.get(type)
  }

  list(): ActionHandler[] {
    return [...this.handlers.values()]
  }
}
