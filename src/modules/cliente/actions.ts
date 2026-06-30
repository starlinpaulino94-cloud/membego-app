'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export interface ClienteActionState {
  error?: string
  success?: boolean
}

/** Lista todas las empresas donde el usuario logueado tiene una cuenta de cliente. */
export async function getClienteCompanies(supabaseId: string) {
  return prisma.cliente.findMany({
    where: { supabaseId },
    include: { company: true },
    orderBy: { createdAt: 'asc' },
  })
}

/**
 * Cambia el contexto de empresa activo del cliente (app_metadata.clienteId/companyId).
 * Requiere que ya exista un registro Cliente del usuario en esa empresa.
 */
export async function switchCompany(companyId: string) {
  const user = await getUser()
  if (!user || user.metadata.role !== 'CLIENTE') {
    throw new Error('No autorizado.')
  }

  const cliente = await prisma.cliente.findUnique({
    where: { supabaseId_companyId: { supabaseId: user.supabaseId, companyId } },
  })
  if (!cliente) {
    throw new Error('No tienes una cuenta en esa empresa.')
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.supabaseId },
  })

  const admin = createAdminClient()
  await admin.auth.admin.updateUserById(user.supabaseId, {
    app_metadata: {
      role: 'CLIENTE',
      dbUserId: dbUser?.id ?? user.metadata.dbUserId,
      clienteId: cliente.id,
      companyId: cliente.companyId,
    },
  })

  revalidatePath('/', 'layout')
  redirect('/cliente/dashboard')
}

/** Update the logged-in cliente's nombre and telefono. */
export async function actualizarPerfil(
  _prev: ClienteActionState,
  formData: FormData
): Promise<ClienteActionState> {
  try {
    const user = await getUser()
    if (!user || user.metadata.role !== 'CLIENTE' || !user.metadata.clienteId) {
      return { error: 'No autorizado.' }
    }

    const nombre = String(formData.get('nombre') ?? '').trim()
    const telefono = String(formData.get('telefono') ?? '').trim()

    if (!nombre) return { error: 'El nombre es obligatorio.' }

    await prisma.cliente.update({
      where: { id: user.metadata.clienteId },
      data: { nombre, telefono: telefono || null },
    })

    revalidatePath('/cliente/perfil')
    revalidatePath('/cliente/dashboard')
    return { success: true }
  } catch (e) {
    console.error('[cliente] actualizarPerfil error:', e)
    return { error: 'Ocurrió un error inesperado. Intenta de nuevo.' }
  }
}
