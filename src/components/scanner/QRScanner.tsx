'use client'

import { useEffect, useRef } from 'react'

/**
 * Wraps html5-qrcode. Calls onScan once with the decoded text, then stops.
 */
export function QRScanner({ onScan }: { onScan: (text: string) => void }) {
  const containerId = 'qr-reader'
  const handledRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    let scanner: { stop: () => Promise<void>; clear: () => void } | null = null

    async function start() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return
        const s = new Html5Qrcode(containerId)
        scanner = s as unknown as { stop: () => Promise<void>; clear: () => void }

        await s.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decoded) => {
            if (handledRef.current) return
            handledRef.current = true
            onScan(decoded)
          },
          () => {}
        )
      } catch {
        // camera unavailable or already initialised; user can use manual entry
      }
    }

    const starting = start()

    return () => {
      cancelled = true
      // Esperar a que el arranque termine antes de detener: si se desmonta
      // durante los 0.5-2 s que tarda start(), un stop() inmediato falla
      // ("not running") y el MediaStream que start() adquiere después
      // quedaba encendido (cámara ocupada + memoria en el móvil).
      starting.finally(() => {
        const s = scanner
        scanner = null
        if (s) {
          s.stop().then(() => { try { s.clear() } catch {} }).catch(() => {})
        }
      })
    }
  }, [onScan])

  return (
    <div
      id={containerId}
      className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border bg-black"
    />
  )
}
