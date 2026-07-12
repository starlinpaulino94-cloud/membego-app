import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/health
 *
 * Público: devuelve solo un estado agregado (`ok` | `degraded`) apto para
 * monitores de uptime. NO expone hostnames, nombres de BD, conteos ni mensajes
 * de error, para no dar información de reconocimiento a un atacante.
 *
 * Diagnóstico detallado (checks + diagnostics): solo si se envía el header
 * `x-health-secret` igual a BOOTSTRAP_SECRET. Pensado para depuración puntual.
 */
export async function GET(req: NextRequest) {
  const envOk =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !!process.env.DATABASE_URL

  let dbOk = false
  let dbError: string | null = null
  try {
    await prisma.$queryRaw`SELECT 1`
    dbOk = true
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e)
  }

  const status = envOk && dbOk ? 'ok' : 'degraded'

  // Respuesta pública mínima.
  const secret = process.env.BOOTSTRAP_SECRET
  const authorized = !!secret && req.headers.get('x-health-secret') === secret
  if (!authorized) {
    return NextResponse.json({ status })
  }

  // Respuesta detallada (solo autorizada).
  const checks: Record<string, string> = {
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ok' : 'MISSING',
    supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'ok' : 'MISSING',
    service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'ok' : 'MISSING',
    database_url: process.env.DATABASE_URL ? 'ok' : 'MISSING',
    direct_url: process.env.DIRECT_URL ? 'ok' : 'MISSING',
    database: dbOk ? 'ok' : 'error',
  }

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
  if (dbError) diagnostics.raw_query_error = dbError

  try {
    diagnostics.companies = await prisma.company.count()
    diagnostics.users = await prisma.user.count()
    diagnostics.clientes = await prisma.cliente.count()
    checks.orm = 'ok'
  } catch (e) {
    checks.orm = 'error'
    diagnostics.orm_error = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json({ status, checks, diagnostics })
}
