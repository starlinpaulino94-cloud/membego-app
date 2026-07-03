'use client'

import { useEffect, useRef } from 'react'

/**
 * Wraps html5-qrcode. Calls onScan once with the decoded text, then stops.
 */
export function QRScanner({ onScan }: { onScan: (text: string) => void }) {
  const containerId = 'qr-reader'
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(
    null
  )
  const handledRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return
        const scanner = new Html5Qrcode(containerId)
        scannerRef.current = scanner as unknown as {
          stop: () => Promise<void>
          clear: () => void
        }

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decoded) => {
            if (handledRef.current) return
            handledRef.current = true
            scanner
              .stop()
              .then(() => {
                try { scanner.clear() } catch {}
                onScan(decoded)
              })
              .catch(() => {
                onScan(decoded)
              })
          },
          () => {}
        )
      } catch {
        // camera unavailable or already initialised; user can use manual entry
      }
    }

    start()

    return () => {
      cancelled = true
      const s = scannerRef.current
      if (s) {
        s.stop().then(() => { try { s.clear() } catch {} }).catch(() => {})
        scannerRef.current = null
      }
    }
  }, [onScan])

  return (
    <div
      id={containerId}
      className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border bg-black"
    />
  )
}
