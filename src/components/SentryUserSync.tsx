'use client'

import { useEffect } from 'react'

interface Props {
  userId?: string
  email?: string
  role?: string
  companyId?: string | null
}

export function SentryUserSync({ userId, email, role, companyId }: Props) {
  useEffect(() => {
    import('@sentry/nextjs')
      .then((Sentry) => {
        if (userId) {
          Sentry.setUser({ id: userId, email })
          Sentry.setTag('user.role', role ?? 'unknown')
          if (companyId) Sentry.setTag('company.id', companyId)
        }
      })
      .catch(() => {})
    return () => {
      import('@sentry/nextjs')
        .then((Sentry) => Sentry.setUser(null))
        .catch(() => {})
    }
  }, [userId, email, role, companyId])

  return null
}
