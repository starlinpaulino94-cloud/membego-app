'use client'

import Image from 'next/image'
import { useActionState, useEffect, useRef, useState } from 'react'
import { Loader2, Upload, Camera, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  enviarComprobante,
  type ComprobanteState,
} from '@/modules/membresia/actions'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  membershipId: string
  metodoPagoId?: string | null
}

const initial: ComprobanteState = {}

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_MB = 5

export function ComprobanteForm({ membershipId, metodoPagoId }: Props) {
  const [state, formAction, pending] = useActionState(enviarComprobante, initial)
  const [uploading, setUploading] = useState(false)
  const [comprobanteUrl, setComprobanteUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPdf, setIsPdf] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) toast.success('Comprobante enviado. Esperando validación.')
  }, [state.success])

  // Clean up object URL to avoid memory leaks
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  async function handleFile(file: File | undefined) {
    if (!file) return

    if (!ALLOWED.includes(file.type)) {
      toast.error('Solo se aceptan imágenes (JPG, PNG) o PDF.')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`El archivo no puede superar ${MAX_MB} MB.`)
      return
    }

    // Build preview for images
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (file.type !== 'application/pdf') {
      setPreviewUrl(URL.createObjectURL(file))
      setIsPdf(false)
    } else {
      setPreviewUrl(null)
      setIsPdf(true)
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `comprobantes/${membershipId}-${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('comprobantes')
        .upload(path, file, { upsert: true })
      if (error) throw error

      const { data } = supabase.storage.from('comprobantes').getPublicUrl(path)
      setComprobanteUrl(data.publicUrl)
      setFileName(file.name)
      toast.success('Archivo cargado. Revísalo antes de enviar.')
    } catch {
      toast.error('No se pudo cargar el archivo. Intenta de nuevo.')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  function clearFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setComprobanteUrl('')
    setFileName('')
    setIsPdf(false)
    if (fileRef.current) fileRef.current.value = ''
    if (cameraRef.current) cameraRef.current.value = ''
  }

  if (state.success) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-green-700">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">
          Comprobante enviado. El equipo lo revisará pronto.
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="membershipId" value={membershipId} />
      <input type="hidden" name="comprobanteUrl" value={comprobanteUrl} />
      {metodoPagoId && (
        <input type="hidden" name="metodoPagoId" value={metodoPagoId} />
      )}

      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Comprobante de pago *</Label>

        {/* Preview area */}
        {previewUrl ? (
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <Image
              src={previewUrl}
              alt="Vista previa del comprobante"
              width={600}
              height={400}
              className="max-h-64 w-full object-contain"
            />
            <button
              type="button"
              onClick={clearFile}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1 shadow hover:bg-white"
            >
              <X className="h-4 w-4 text-slate-600" />
            </button>
            <p className="px-3 py-2 text-xs text-slate-500">
              {fileName} · <button type="button" onClick={clearFile} className="text-sky-600 hover:underline">Cambiar</button>
            </p>
          </div>
        ) : isPdf ? (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">{fileName}</p>
            <button type="button" onClick={clearFile} className="text-xs text-sky-600 hover:underline">
              Cambiar
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500 transition hover:border-sky-400 hover:bg-sky-50"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <p className="text-sm">Toca para seleccionar un archivo</p>
                <p className="text-xs">JPG, PNG o PDF · máx {MAX_MB} MB</p>
              </>
            )}
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {/* Action buttons */}
        {!previewUrl && !isPdf && !uploading && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Seleccionar archivo
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => cameraRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              Tomar foto
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nota">Nota (opcional)</Label>
        <Textarea
          id="nota"
          name="nota"
          placeholder="Ej: Transferencia enviada el 30/06 desde cuenta BHD..."
          rows={2}
        />
      </div>

      <Button
        type="submit"
        disabled={!comprobanteUrl || uploading || pending}
        className="w-full bg-sky-500 hover:bg-sky-400"
      >
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enviar comprobante
      </Button>
    </form>
  )
}
