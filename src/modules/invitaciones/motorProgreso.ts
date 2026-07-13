import { prisma } from '@/lib/prisma'

/**
 * Incrementa el progreso de un invitante dentro de una campaña cuando uno de
 * sus referidos completa el registro. Crea el registro de progreso si no
 * existe, incrementa `registrosCompletados`, y marca `metaAlcanzada` cuando
 * se cumple la meta de la campaña.
 *
 * No lanza: un fallo del motor nunca rompe el registro del referido.
 */
export async function incrementarProgresoCampana(
  campanaId: string,
  referenteClienteId: string,
  companyId: string
): Promise<void> {
  try {
    const campana = await prisma.campanaInvitacion.findUnique({
      where: { id: campanaId },
      select: { id: true, metaRegistros: true, estado: true },
    })
    if (!campana || campana.estado !== 'ACTIVA') return

    const progreso = await prisma.invitacionProgreso.upsert({
      where: { campanaId_clienteId: { campanaId, clienteId: referenteClienteId } },
      update: { registrosCompletados: { increment: 1 } },
      create: {
        campanaId,
        clienteId: referenteClienteId,
        companyId,
        registrosCompletados: 1,
      },
    })

    if (!progreso.metaAlcanzada && progreso.registrosCompletados >= campana.metaRegistros) {
      await prisma.invitacionProgreso.update({
        where: { id: progreso.id },
        data: { metaAlcanzada: true },
      })
    }

    await prisma.invitacionEvento.create({
      data: {
        campanaId,
        clienteId: referenteClienteId,
        companyId,
        tipo: 'REGISTRO_COMPLETADO',
      },
    })
  } catch (e) {
    console.error('[invitaciones] incrementarProgresoCampana error:', e)
  }
}
