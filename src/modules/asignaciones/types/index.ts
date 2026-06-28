export type AssignmentStatus =
  | 'PENDING_PAYMENT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'USED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'BLOCKED'

export interface Assignment {
  id: string
  customerId: string
  promotionId: string
  companyId: string
  status: AssignmentStatus
  usesAllowed: number | null
  usesConsumed: number
  progress: number
  progressTarget: number | null
  paymentConfirmed: boolean
  paymentConfirmedAt?: Date | string | null
  paymentAmount?: string | number | null
  startedAt?: Date | string | null
  expiresAt?: Date | string | null
  completedAt?: Date | string | null
  notes?: string | null
  createdAt: Date | string
  updatedAt: Date | string
  customer?: {
    id: string
    firstName: string
    lastName: string
    user: { email: string }
  }
  promotion?: {
    id: string
    name: string
    type: string
    config: Record<string, unknown>
  }
}
