'use client'

import { useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, ScanLine } from 'lucide-react'
import { buscarPorToken, type ClienteLookup } from '@/modules/visitas/actions'
import { ConfirmVisit } from '@/components/scanner/ConfirmVisit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const QRScanner = dynamic(
  () => import('@/components/scanner/QRScanner').then((m) => m.QRScanner),
  { ssr: false, loading: () => <p className="text-center text-slate-500">Cargando cámara...</p> }
)

export function ScannerClient() {
  const [scanning, setScanning] = useState(false)
  const [manual, setManual] = useState('')
  const [cliente, setCliente] = useState<ClienteLookup | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function lookup(token: string) {
    setError(null)
    setScanning(false)
    startTransition(async () => {
      const res = await buscarPorToken(token)
      if (res.error) {
        setError(res.error)
      } else if (res.cliente) {
        setCliente(res.cliente)
      }
    })
  }

  function reset() {
    setCliente(null)
    setError(null)
    setManual('')
    setScanning(false)
  }

  if (cliente) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Confirmar visita</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfirmVisit cliente={cliente} onDone={reset} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-sky-500" />
          Escanear código QR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {scanning ? (
          <>
            <QRScanner onScan={lookup} />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setScanning(false)}
            >
              Detener cámara
            </Button>
          </>
        ) : (
          <Button
            className="w-full bg-sky-500 hover:bg-sky-400"
            onClick={() => setScanning(true)}
            disabled={pending}
          >
            Abrir cámara
          </Button>
        )}

        <div className="space-y-2">
          <Label htmlFor="manual">O ingresa el código manualmente</Label>
          <div className="flex gap-2">
            <Input
              id="manual"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Token del QR"
            />
            <Button
              onClick={() => manual && lookup(manual)}
              disabled={pending || !manual}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Buscar'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
