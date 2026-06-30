import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export function WhatsAppButton({
  numero,
  mensaje,
}: {
  numero: string
  mensaje: string
}) {
  const href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
    >
      <MessageCircle className="h-4 w-4" />
      Contactar por WhatsApp
    </Link>
  )
}
