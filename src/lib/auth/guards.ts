import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import type { AppRole, SessionUser } from '@/types'

function setSentryContext(user: SessionUser) {
  import('@sentry/nextjs')
    .then((Sentry) => {
      Sentry.setUser({ id: user.metadata.dbUserId || user.supabaseId, email: user.email })
      Sentry.setTag('user.role', user.metadata.role)
      if (user.metadata.companyId) Sentry.setTag('company.id', user.metadata.companyId)
    })
    .catch(() => {})
}

export async function requireUser(): Promise<SessionUser> {
  // getUser() revalida el token contra el servidor de Supabase en cada
  // request (a diferencia de getSession(), que solo decodifica la cookie sin
  // verificar la firma). Es el método recomendado para decisiones de
  // autorización en código de servidor.
  const user = await getUser()
  if (!user) redirect('/login')

  setSentryContext(user)
  return user
}

export async function requireRole(
  roles: AppRole | AppRole[]
): Promise<SessionUser> {
  const user = await requireUser()
  const allowed = Array.isArray(roles) ? roles : [roles]
  if (!allowed.includes(user.metadata.role)) {
    redirect('/login')
  }
  return user
}
