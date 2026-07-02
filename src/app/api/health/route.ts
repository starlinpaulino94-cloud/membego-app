import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, string> = {}

  checks.supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ok' : 'MISSING'
  checks.supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'ok' : 'MISSING'
  checks.service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'ok' : 'MISSING'
  checks.database_url = process.env.DATABASE_URL ? 'ok' : 'MISSING'
  checks.direct_url = process.env.DIRECT_URL ? 'ok' : 'MISSING'

  const diagnostics: Record<string, unknown> = {}

  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)
      diagnostics.db_host = url.hostname
      diagnostics.db_port = url.port
      diagnostics.db_name = url.pathname.replace('/', '')
      diagnostics.db_has_pgbouncer = url.searchParams.has('pgbouncer')
    } catch {
      diagnostics.db_url_parse = 'invalid URL format'
    }
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch (e) {
    checks.database = 'error'
    diagnostics.raw_query_error = e instanceof Error ? e.message : String(e)
  }

  try {
    const companies = await prisma.company.count()
    const users = await prisma.user.count()
    const clientes = await prisma.cliente.count()
    diagnostics.companies = companies
    diagnostics.users = users
    diagnostics.clientes = clientes
    checks.orm = 'ok'
  } catch (e) {
    checks.orm = 'error'
    diagnostics.orm_error = e instanceof Error ? e.message : String(e)
  }

  const allOk = ['supabase_url', 'supabase_anon_key', 'service_role_key', 'database_url', 'database', 'orm']
    .every((k) => checks[k] === 'ok')
  return NextResponse.json({ status: allOk ? 'ok' : 'degraded', checks, diagnostics })
}
