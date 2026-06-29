import { NextResponse } from 'next/server'
import { getActiveCompanyPromotions } from '@/modules/promociones/queries'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const promotions = await getActiveCompanyPromotions(id)
    return NextResponse.json({ promotions })
  } catch {
    return NextResponse.json({ promotions: [] })
  }
}
