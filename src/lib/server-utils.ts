import { headers } from 'next/headers'

export async function getRequestMeta() {
  const h = await headers()
  return {
    ipAddress: h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? null,
    userAgent: h.get('user-agent') ?? null,
  }
}

export function periodEnd(from: Date, dias = 30) {
  const d = new Date(from)
  d.setDate(d.getDate() + dias)
  return d
}
