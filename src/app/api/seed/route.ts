import { NextResponse } from 'next/server'
import { runSeed } from '@/lib/seed'

export const dynamic = 'force-dynamic'

/**
 * POST /api/seed
 * Ejecuta el seed idempotente (empresas, planes, usuarios de prueba en Supabase Auth + BD).
 *
 * Ideal para inicializar datos en producción (Vercel) sin correr comandos locales.
 *
 * Uso:
 *   curl -X POST https://TU-DOMINIO.vercel.app/api/seed
 *
 * Respuesta:
 *   { ok: true, result: { companies, plans, users, clientes, details } }
 */
export async function POST() {
  try {
    const result = await runSeed()
    return NextResponse.json({ ok: true, result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    )
  }
}
