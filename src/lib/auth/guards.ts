import { redirect } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { getUser } from '@/lib/auth'
import type { AppRole, SessionUser } from '@/types'

function setSentryContext(user: SessionUser) {
  try {
    Sentry.setUser({ id: user.metadata.dbUserId || user.supabaseId, email: user.email })
    Sentry.setTag('user.role', user.metadata.role)
    if (user.metadata.companyId) Sentry.setTag('company.id', user.metadata.companyId)
  } catch {
    // Sentry not initialized — safe to ignore
  }
}

export async function requireUser(): Promise<SessionUser> {
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
