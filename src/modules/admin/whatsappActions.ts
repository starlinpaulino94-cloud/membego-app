'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

async function requireAdmin() {
  const user = await getUser()
  if (!user || !['ADMIN_EMPRESA', 'SUPERADMIN'].includes(user.metadata.role)) {
    return null
  }
  return user
}

export interface WhatsAppConfigState {
  error?: string
  success?: boolean
}

export async function guardarWhatsAppConfig(
  _prev: WhatsAppConfigState,
  formData: FormData
): Promise<WhatsAppConfigState> {
  const user = await requireAdmin()
  if (!user) return { error: 'No autorizado.' }

  const companyId =
    user.metadata.role === 'SUPERADMIN'
      ? String(formData.get('companyId') ?? '').trim()
      : (user.metadata.companyId ?? '')
  if (!companyId) return { error: 'Empresa requerida.' }

  const numero = String(formData.get('numero') ?? '').trim().replace(/\D/g, '')
  const mensajePlantilla = String(formData.get('mensajePlantilla') ?? '').trim()
  const activo = formData.get('activo') !== 'false'

  if (!numero || numero.length < 8) {
    return { error: 'Ingresa un número de WhatsApp válido (con código de país).' }
  }

  await prisma.whatsAppConfig.upsert({
    where: { companyId },
    create: {
      companyId,
      numero,
      mensajePlantilla: mensajePlantilla || undefined,
      activo,
    },
    update: { numero, mensajePlantilla: mensajePlantilla || undefined, activo },
  })

  revalidatePath('/admin/whatsapp')
  revalidatePath('/cliente/perfil')
  return { success: true }
}
