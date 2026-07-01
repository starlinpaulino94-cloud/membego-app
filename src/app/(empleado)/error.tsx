'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function EmpleadoError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[empleado-error]', error)
  }, [error])

  return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Ocurrió un error</AlertTitle>
        <AlertDescription className="mt-1">
          No se pudo completar la operación. Intenta de nuevo.
        </AlertDescription>
      </Alert>
      <Button onClick={reset} className="mt-4" variant="outline">
        Reintentar
      </Button>
    </div>
  )
}
