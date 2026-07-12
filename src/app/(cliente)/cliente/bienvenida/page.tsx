import { requireRole } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { getOnboardingCliente } from '@/modules/social/queries'
import { WizardCliente } from '@/components/onboarding/WizardCliente'

export const dynamic = 'force-dynamic'

export default async function BienvenidaPage() {
  const user = await requireRole('CLIENTE')
  const [onboarding, cliente] = await Promise.all([
    getOnboardingCliente(user.metadata.dbUserId, user.supabaseId),
    prisma.cliente
      .findFirst({
        where: { supabaseId: user.supabaseId },
        select: { nombre: true },
      })
      .catch(() => null),
  ])
  // Primer nombre para un saludo más cercano.
  const nombre = (cliente?.nombre ?? user.email.split('@')[0]).split(' ')[0]

  return (
    <div className="mx-auto max-w-2xl py-4">
      <WizardCliente onboarding={onboarding} nombre={nombre} />
    </div>
  )
}
