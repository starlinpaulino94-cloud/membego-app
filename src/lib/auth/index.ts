import { createClient } from '@/lib/supabase/server'
import type { AppMetadata, SessionUser } from '@/types'

export async function getUser(): Promise<SessionUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const metadata = (user.app_metadata ?? {}) as Partial<AppMetadata>

  return {
    supabaseId: user.id,
    email: user.email ?? '',
    metadata: {
      role: metadata.role ?? 'CLIENTE',
      dbUserId: metadata.dbUserId ?? '',
      clienteId: metadata.clienteId ?? null,
      companyId: metadata.companyId ?? null,
    },
  }
}
