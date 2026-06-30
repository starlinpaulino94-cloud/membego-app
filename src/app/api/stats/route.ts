import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/stats
 * Métricas públicas (prueba social) para mostrar en la landing.
 * Solo devuelve conteos agregados, nunca datos personales.
 */
export async function GET() {
  try {
    const [empresasActivas, clientesTotal, membresiasActivas, visitasTotal] =
      await Promise.all([
        prisma.company.count({ where: { isActive: true } }),
        prisma.cliente.count(),
        prisma.membership.count({ where: { estado: 'ACTIVA' } }),
        prisma.visit.count(),
      ])

    return NextResponse.json({
      empresas: empresasActivas,
      clientes: clientesTotal,
      membresiasActivas,
      visitas: visitasTotal,
    })
  } catch {
    // Si la BD no está disponible, devolver ceros para que la landing no rompa
    return NextResponse.json({
      empresas: 0,
      clientes: 0,
      membresiasActivas: 0,
      visitas: 0,
    })
  }
}
