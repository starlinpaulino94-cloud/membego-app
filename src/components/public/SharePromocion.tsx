'use client'

import { recordPromotionShare } from '@/modules/marketplace/actions'
import { landingUrlFor } from '@/lib/site'
import { ShareButton } from './ShareButton'

interface SharePromocionProps {
  promocionId: string
  titulo: string
  companyName: string
}

/** Compartir una promoción registrando el contador de compartidas. */
export function SharePromocion({
  promocionId,
  titulo,
  companyName,
}: SharePromocionProps) {
  return (
    <ShareButton
      title={titulo}
      text={`${titulo} — promoción de ${companyName} en MembeGo.`}
      path={landingUrlFor(`/promocion/${promocionId}`)}
      onShared={() => {
        recordPromotionShare(promocionId).catch(console.error)
      }}
    />
  )
}
