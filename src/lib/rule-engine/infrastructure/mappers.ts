/**
 * Mappers: traducen las filas de Prisma a los tipos PUROS del dominio.
 *
 * Aíslan el núcleo del detalle de persistencia: si mañana cambia el esquema o
 * el ORM, solo cambian estos mappers. El dominio no importa nada de Prisma.
 */

import type {
  Rule as PrismaRule,
  RuleCondition as PrismaCondition,
  RuleAction as PrismaAction,
  RuleGroup as PrismaGroup,
} from '@prisma/client'
import type {
  ConditionValueType,
  Rule,
  RuleAction,
  RuleCondition,
} from '../domain/types'

/** Fila de Prisma con sus relaciones ya incluidas. */
export type PrismaRuleWithRelations = PrismaRule & {
  conditions: PrismaCondition[]
  actions: PrismaAction[]
  group: PrismaGroup | null
}

const VALUE_TYPES: readonly ConditionValueType[] = [
  'STRING',
  'NUMBER',
  'BOOLEAN',
  'DATE',
  'ARRAY',
  'NULL',
]

function toValueType(raw: string): ConditionValueType {
  return (VALUE_TYPES as readonly string[]).includes(raw)
    ? (raw as ConditionValueType)
    : 'STRING'
}

/**
 * Normaliza el valor esperado según su tipo declarado. La columna `valor` es
 * JSON, así que las fechas llegan como string ISO y hay que rehidratarlas para
 * que los operadores ordinales funcionen.
 */
function coerceValue(raw: unknown, valueType: ConditionValueType): unknown {
  if (raw === null || raw === undefined) return null
  switch (valueType) {
    case 'DATE': {
      const date = new Date(raw as string)
      return Number.isNaN(date.getTime()) ? raw : date
    }
    case 'NUMBER':
      return typeof raw === 'number' ? raw : Number(raw)
    case 'BOOLEAN':
      return Boolean(raw)
    default:
      return raw
  }
}

function mapCondition(row: PrismaCondition): RuleCondition {
  const valueType = toValueType(row.tipoValor)
  return {
    id: row.id,
    field: row.campo,
    operator: row.operador,
    value: coerceValue(row.valor, valueType),
    valueType,
    order: row.orden,
  }
}

function mapAction(row: PrismaAction): RuleAction {
  return {
    id: row.id,
    type: row.tipo,
    params: (row.params ?? {}) as Record<string, unknown>,
    order: row.orden,
  }
}

/** Traduce una fila de regla (con relaciones) al agregado de dominio. */
export function mapRule(row: PrismaRuleWithRelations): Rule {
  return {
    id: row.id,
    companyId: row.companyId,
    group: row.group
      ? { id: row.group.id, key: row.group.key, name: row.group.nombre }
      : null,
    name: row.nombre,
    description: row.descripcion,
    status: row.status,
    isActive: row.activo,
    priority: row.prioridad,
    version: row.version,
    matchType: row.matchType,
    validFrom: row.validoDesde,
    validUntil: row.validoHasta,
    conditions: row.conditions.map(mapCondition).sort((a, b) => a.order - b.order),
    actions: row.actions.map(mapAction).sort((a, b) => a.order - b.order),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
