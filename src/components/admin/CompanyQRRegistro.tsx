'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * QR de registro de la empresa (Onboarding Fase 4 · O-14). Codifica la URL de
 * registro por empresa (/registro/[slug], ya con branding). Quien lo escanea
 * abre el registro de ese negocio. Descargable para imprimir/compartir.
 */
export function CompanyQRRegistro({
  url,
  companySlug,
}: {
  url: string
  companySlug: string
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    QRCode.toDataURL(url, { width: 480, margin: 2 })
      .then((u) => {
        if (active) setDataUrl(u)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [url])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-52 w-52 items-center justify-center rounded-xl border border-slate-200 bg-white p-3">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="QR de registro" className="h-full w-full" />
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        )}
      </div>
      <p className="max-w-full break-all text-center text-xs text-slate-500">{url}</p>
      {dataUrl && (
        <a href={dataUrl} download={`registro-${companySlug}.png`}>
          <Button type="button" size="sm" variant="outline" className="gap-1.5">
            <Download className="h-4 w-4" /> Descargar QR
          </Button>
        </a>
      )}
    </div>
  )
}
