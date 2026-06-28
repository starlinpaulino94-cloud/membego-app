import { z } from 'zod'

const PHONE_REGEX = /^[\d\s\-\+\(\)]{7,20}$/

export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .regex(PHONE_REGEX, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  role: z.enum(['ADMIN_EMPRESA', 'EMPLEADO']),
  branchId: z.string().uuid('Sucursal inválida').optional().or(z.literal('')),
})

export const updateEmployeeSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z
    .string()
    .regex(PHONE_REGEX, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  role: z.enum(['ADMIN_EMPRESA', 'EMPLEADO']).optional(),
  branchId: z.string().uuid('Sucursal inválida').optional().or(z.literal('')),
})

export const updateEmployeeStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
})

export type CreateEmployeeValues = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeValues = z.infer<typeof updateEmployeeSchema>
