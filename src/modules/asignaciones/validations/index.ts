import { z } from 'zod'

export const createAssignmentSchema = z.object({
  promotionId: z.string().min(1, 'La promoción es requerida'),
  usesAllowed: z.coerce.number().int().positive().optional().nullable(),
  progressTarget: z.coerce.number().int().positive().optional().nullable(),
  paymentAmount: z.coerce.number().min(0).optional().nullable(),
  requiresPayment: z.coerce.boolean().default(false),
  expiresAt: z.coerce.date().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export const renewAssignmentSchema = z.object({
  expiresAt: z.coerce.date(),
})

export const confirmPaymentSchema = z.object({
  paymentAmount: z.coerce.number().min(0, 'El monto debe ser mayor o igual a 0'),
})

export type CreateAssignmentValues = z.infer<typeof createAssignmentSchema>
export type RenewAssignmentValues = z.infer<typeof renewAssignmentSchema>
export type ConfirmPaymentValues = z.infer<typeof confirmPaymentSchema>
