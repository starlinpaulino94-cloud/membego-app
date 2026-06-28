import { z } from 'zod'

const PHONE_REGEX = /^[\d\s\-\+\(\)]{7,20}$/

export const createCompanySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  legalName: z.string().max(200).optional().or(z.literal('')),
  industry: z.string().min(1, 'La industria es requerida').max(80),
  description: z.string().max(1000).optional().or(z.literal('')),
  phone: z
    .string()
    .regex(PHONE_REGEX, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
})

export const updateCompanySchema = createCompanySchema.partial()

export const updateCompanyStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED']),
})

export const createBranchSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  address: z.string().max(300).optional().or(z.literal('')),
  phone: z
    .string()
    .regex(PHONE_REGEX, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
})

export const updateBranchSchema = createBranchSchema.partial()

export type CreateCompanyValues = z.infer<typeof createCompanySchema>
export type UpdateCompanyValues = z.infer<typeof updateCompanySchema>
export type CreateBranchValues = z.infer<typeof createBranchSchema>
export type UpdateBranchValues = z.infer<typeof updateBranchSchema>
