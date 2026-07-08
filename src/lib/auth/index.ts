import { cache } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { isTransientAuthError } from '@/lib/auth/transient'
import type { AppMetadata, SessionUser } from '@/types'

function toSessionUser(user: User): SessionUser {
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

/**
 * Usuario de la sesión actual, validado contra el servidor de Supabase.
 *
 * Envuelto en React.cache(): dentro de un mismo request RSC (layout +
 * page + guards) la validación de red se ejecuta UNA sola vez, en lugar
 * de una por cada guard/consulta que necesite el usuario.
 *
 * Un fallo transitorio de Supabase Auth (429/5xx/red) NO se interpreta
 * como "sin sesión": en ese caso se usa la sesión de la cookie (emitida y
 * firmada por Supabase, ya verificada por el middleware en este request)
 * para no expulsar al usuario por un problema de infraestructura.
 */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (data.user) return toSessionUser(data.user)

  if (isTransientAuthError(error)) {
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session?.user) return toSessionUser(sessionData.session.user)
  }

  return null
})
