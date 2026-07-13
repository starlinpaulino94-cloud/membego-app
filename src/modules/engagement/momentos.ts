import { prisma } from '@/lib/prisma'

/**
 * Engagement Engine · Fase 1 — "Momentos vivos" del Home.
 *
 * Arma, desde datos REALES del cliente, las tarjetas con sentido de urgencia y
 * recompensa que hacen que el Home nunca se vea vacío. Sin datos inventados y
 * sin cambios de base de datos: todo sale de lo que ya existe (wallet de
 * beneficios activos + atribución de invitaciones).
 */

export type MomentoTipo = 'REGALO' | 'VENCE' | 'INVITA'

export interface MomentoRegalo {
  tipo: 'REGALO'
  compraId: string
  titulo: string
  usosRestantes: number
}
export interface MomentoVence {
  tipo: 'VENCE'
  compraId: string
  titulo: string
  /** Instante de vencimiento en ISO (el navegador solo lo anima). */
  expiraEn: string
}
export interface MomentoInvita {
  tipo: 'INVITA'
  registrados: number
}
export type Momento = MomentoRegalo | MomentoVence | MomentoInvita

export interface MomentosVivos {
  nombre: string | null
  momentos: Momento[]
}

const DIA_MS = 86_400_000

export async function getMomentosVivos(
  clienteId: string,
  companyId: string
): Promise<MomentosVivos> {
  try {
    const ahora = new Date()
    const limiteVence = new Date(Date.now() + 3 * DIA_MS)

    const [cliente, activas, registrados] = await Promise.all([
      prisma.cliente.findUnique({
        where: { id: clienteId },
        select: { nombre: true },
      }),
      prisma.productoCompra.findMany({
        where: { clienteId, companyId, estado: 'ACTIVA' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          usosRestantes: true,
          fechaVencimiento: true,
          promocion: { select: { titulo: true } },
        },
      }),
      prisma.referido.count({
        where: { referenteClienteId: clienteId, sospechoso: false },
      }),
    ])

    const momentos: Momento[] = []

    // 🎁 Beneficio listo para usar (el más reciente con usos disponibles).
    const regalo = activas.find((c) => c.usosRestantes > 0)
    if (regalo) {
      momentos.push({
        tipo: 'REGALO',
        compraId: regalo.id,
        titulo: regalo.promocion?.titulo ?? 'Tu beneficio',
        usosRestantes: regalo.usosRestantes,
      })
    }

    // ⏰ Beneficio que vence pronto (≤ 3 días), distinto del ya mostrado.
    const vence = activas
      .filter(
        (c) =>
          c.fechaVencimiento &&
          c.fechaVencimiento > ahora &&
          c.fechaVencimiento <= limiteVence
      )
      .sort(
        (a, b) => a.fechaVencimiento!.getTime() - b.fechaVencimiento!.getTime()
      )[0]
    if (vence && vence.id !== regalo?.id) {
      momentos.push({
        tipo: 'VENCE',
        compraId: vence.id,
        titulo: vence.promocion?.titulo ?? 'Tu beneficio',
        expiraEn: vence.fechaVencimiento!.toISOString(),
      })
    }

    // 🎯 Invita y Gana (progreso real). Siempre presente: es el motor viral.
    momentos.push({ tipo: 'INVITA', registrados })

    return {
      nombre: cliente?.nombre?.trim().split(/\s+/)[0] ?? null,
      momentos,
    }
  } catch (e) {
    console.error('[engagement] getMomentosVivos:', e)
    return { nombre: null, momentos: [] }
  }
}
