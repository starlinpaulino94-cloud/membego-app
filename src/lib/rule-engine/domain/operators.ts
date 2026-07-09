/**
 * Operadores de comparación del motor.
 *
 * Un Operator es una comparación pura y genérica (no de negocio): recibe el
 * valor real resuelto del contexto y el valor esperado de la condición, y
 * devuelve un booleano. Se registran en un OperatorRegistry, de modo que se
 * pueden añadir operadores nuevos SIN modificar el núcleo (Open/Closed).
 */

import { DuplicateRegistrationError, UnknownOperatorError } from './errors'

export interface Operator {
  /** Clave única, ej. "eq", "gte", "in". Es la que se guarda en la condición. */
  readonly id: string
  /** Descripción legible para la futura UI de constructor de reglas. */
  readonly description: string
  /**
   * Compara el valor real (del contexto) con el esperado (de la condición).
   * Debe ser TOTAL: nunca lanzar; ante tipos incompatibles, devolver false.
   */
  evaluate(actual: unknown, expected: unknown): boolean
}

/**
 * Registro extensible de operadores. Permite registrar, consultar y listar.
 * Inyectable en el evaluador (Dependency Injection): distintas configuraciones
 * pueden ofrecer distintos conjuntos de operadores.
 */
export class OperatorRegistry {
  private readonly operators = new Map<string, Operator>()

  /** Registra un operador. Lanza si la clave ya existe (evita pisar sin querer). */
  register(operator: Operator): this {
    if (this.operators.has(operator.id)) {
      throw new DuplicateRegistrationError('operador', operator.id)
    }
    this.operators.set(operator.id, operator)
    return this
  }

  has(id: string): boolean {
    return this.operators.has(id)
  }

  /** Devuelve el operador o lanza UnknownOperatorError si no existe. */
  get(id: string): Operator {
    const op = this.operators.get(id)
    if (!op) throw new UnknownOperatorError(id)
    return op
  }

  list(): Operator[] {
    return [...this.operators.values()]
  }
}

// ── Helpers de coerción (privados) ──────────────────────────────────────────

/** Convierte a número comparable; NaN si no es posible. */
function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'string' && value.trim() !== '') {
    const asDate = Date.parse(value)
    if (!Number.isNaN(asDate)) return asDate
    return Number(value)
  }
  return NaN
}

/** Igualdad laxa pero segura: fechas por timestamp, resto por ===. */
function looseEquals(a: unknown, b: unknown): boolean {
  if (a instanceof Date || b instanceof Date) {
    const na = toNumber(a)
    const nb = toNumber(b)
    return !Number.isNaN(na) && na === nb
  }
  return a === b
}

/** Comparación ordinal (-1, 0, 1) o null si no son comparables. */
function compare(a: unknown, b: unknown): number | null {
  const na = toNumber(a)
  const nb = toNumber(b)
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na < nb ? -1 : na > nb ? 1 : 0
  if (typeof a === 'string' && typeof b === 'string') {
    return a < b ? -1 : a > b ? 1 : 0
  }
  return null
}

function asArray(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null
}

/**
 * Crea un registro con el catálogo estándar de operadores genéricos. Cubre las
 * comparaciones habituales; las fases futuras pueden registrar más (ej.
 * "geo_within", "day_of_week") sin tocar este archivo.
 */
export function createDefaultOperatorRegistry(): OperatorRegistry {
  const registry = new OperatorRegistry()

  const defaults: Operator[] = [
    { id: 'eq', description: 'Igual a', evaluate: (a, b) => looseEquals(a, b) },
    { id: 'neq', description: 'Distinto de', evaluate: (a, b) => !looseEquals(a, b) },
    { id: 'gt', description: 'Mayor que', evaluate: (a, b) => compare(a, b) === 1 },
    {
      id: 'gte',
      description: 'Mayor o igual que',
      evaluate: (a, b) => {
        const c = compare(a, b)
        return c === 1 || c === 0
      },
    },
    { id: 'lt', description: 'Menor que', evaluate: (a, b) => compare(a, b) === -1 },
    {
      id: 'lte',
      description: 'Menor o igual que',
      evaluate: (a, b) => {
        const c = compare(a, b)
        return c === -1 || c === 0
      },
    },
    {
      id: 'in',
      description: 'Está contenido en la lista esperada',
      evaluate: (a, b) => {
        const arr = asArray(b)
        return arr ? arr.some((item) => looseEquals(a, item)) : false
      },
    },
    {
      id: 'not_in',
      description: 'No está en la lista esperada',
      evaluate: (a, b) => {
        const arr = asArray(b)
        return arr ? !arr.some((item) => looseEquals(a, item)) : false
      },
    },
    {
      id: 'contains',
      description: 'La lista/texto real contiene el valor esperado',
      evaluate: (a, b) => {
        const arr = asArray(a)
        if (arr) return arr.some((item) => looseEquals(item, b))
        if (typeof a === 'string') return a.includes(String(b))
        return false
      },
    },
    {
      id: 'starts_with',
      description: 'El texto real empieza por el esperado',
      evaluate: (a, b) => typeof a === 'string' && a.startsWith(String(b)),
    },
    {
      id: 'ends_with',
      description: 'El texto real termina en el esperado',
      evaluate: (a, b) => typeof a === 'string' && a.endsWith(String(b)),
    },
    {
      id: 'between',
      description: 'Está dentro del rango [min, max] esperado',
      evaluate: (a, b) => {
        const arr = asArray(b)
        if (!arr || arr.length !== 2) return false
        const lower = compare(a, arr[0])
        const upper = compare(a, arr[1])
        return (lower === 0 || lower === 1) && (upper === 0 || upper === -1)
      },
    },
    {
      id: 'exists',
      description: 'El campo tiene valor (no null/undefined)',
      evaluate: (a) => a !== null && a !== undefined,
    },
    {
      id: 'not_exists',
      description: 'El campo está vacío (null/undefined)',
      evaluate: (a) => a === null || a === undefined,
    },
    {
      id: 'is_true',
      description: 'Es verdadero',
      evaluate: (a) => a === true,
    },
    {
      id: 'is_false',
      description: 'Es falso',
      evaluate: (a) => a === false,
    },
    {
      id: 'matches',
      description: 'El texto real cumple la expresión regular esperada',
      evaluate: (a, b) => {
        if (typeof a !== 'string' || typeof b !== 'string') return false
        try {
          return new RegExp(b).test(a)
        } catch {
          return false
        }
      },
    },
  ]

  for (const op of defaults) registry.register(op)
  return registry
}
