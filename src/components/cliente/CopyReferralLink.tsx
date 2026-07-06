'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { absoluteUrl } from '@/lib/site'

export function CopyReferralLink({
  code,
  companySlug,
}: {
  code: string
  companySlug: string
}) {
  const [copied, setCopied] = useState(false)
  // Siempre sobre el dominio oficial (NEXT_PUBLIC_APP_URL o membego.com),
  // nunca el dominio de preview de Vercel. Conserva el companySlug para que el
  // referido aterrice en la empresa correcta.
  const link = absoluteUrl(`/registro/${companySlug}?ref=${code}`)

  async function copy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex gap-2">
      <Input readOnly value={link} className="bg-white" />
      <Button type="button" onClick={copy} variant="outline">
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}
