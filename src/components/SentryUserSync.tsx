'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

interface Props {
  userId?: string
  email?: string
  role?: string
  companyId?: string | null
}

export function SentryUserSync({ userId, email, role, companyId }: Props) {
  useEffect(() => {
    try {
      if (userId) {
        Sentry.setUser({ id: userId, email })
        Sentry.setTag('user.role', role ?? 'unknown')
        if (companyId) Sentry.setTag('company.id', companyId)
      }
    } catch {
      // Sentry not initialized
    }
    return () => { try { Sentry.setUser(null) } catch {} }
  }, [userId, email, role, companyId])

  return null
}
