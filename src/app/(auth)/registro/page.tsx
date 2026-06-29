export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { listAllCompanies } from '@/modules/empresas/queries'
import { RegisterWizard } from '@/components/auth/RegisterWizard'

export default async function RegistroPage() {
  let companies: Awaited<ReturnType<typeof listAllCompanies>>['items'] = []
  try {
    const result = await listAllCompanies({ status: 'ACTIVE' })
    companies = result.items
  } catch (err) {
    console.error('[registro] listAllCompanies error:', err)
  }

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Crea tu cuenta</h1>
        <p className="text-sm text-muted-foreground">Accede a promociones exclusivas con tu pase digital</p>
      </div>

      <RegisterWizard companies={companies} />

      <p className="text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
