'use client'

import { useState, useTransition } from 'react'
import { Share2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { registrarShareCampana } from '@/modules/invitaciones/clienteActions'
import { Button } from '@/components/ui/button'

interface Props {
  campanaId: string
  url: string
  titulo: string
  descripcion: string
}

export function InvitaShareButton({ campanaId, url, titulo, descripcion }: Props) {
  const [copied, setCopied] = useState(false)
  const [, startTransition] = useTransition()

  const track = (canal: string) => {
    startTransition(() => {
      registrarShareCampana(campanaId, canal)
    })
  }

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: titulo, text: descripcion, url })
        track('native')
      } catch {
        // user cancelled
      }
      return
    }
    handleCopy()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Enlace copiado')
      track('copy')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleShare} size="lg" className="w-full gap-2 text-base font-bold">
        <Share2 className="h-5 w-5" />
        Compartir ahora
      </Button>
      <Button variant="outline" onClick={handleCopy} className="w-full gap-2">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copiado' : 'Copiar enlace'}
      </Button>
    </div>
  )
}
