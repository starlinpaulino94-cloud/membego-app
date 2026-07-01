import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, string> = {}

  checks.supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ok' : 'MISSING'
  checks.supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'ok' : 'MISSING'
  checks.service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'ok' : 'MISSING'
  checks.database_url = process.env.DATABASE_URL ? 'ok' : 'MISSING'

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch (e) {
    // Never expose technical error details in health check
    checks.database = 'error'
  }

  const allOk = Object.values(checks).every((v) => v === 'ok')
  return NextResponse.json({ status: allOk ? 'ok' : 'degraded', checks })
}
