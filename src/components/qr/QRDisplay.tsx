'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Loader2 } from 'lucide-react'

export function QRDisplay({
  token,
  size = 240,
}: {
  token: string
  size?: number
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    QRCode.toDataURL(token, { width: size, margin: 1 })
      .then((url) => {
        if (active) setDataUrl(url)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [token, size])

  return (
    <div
      className="flex items-center justify-center rounded-xl bg-white p-4"
      style={{ width: size + 32, height: size + 32 }}
    >
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt="Código QR de membresía" width={size} height={size} />
      ) : (
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      )}
    </div>
  )
}
