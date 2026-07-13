import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { RegistroEmpresaForm } from '@/components/auth/RegistroEmpresaForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Registra tu empresa - MembeGo',
  description:
    'Crea el perfil de tu negocio en MembeGo: membresías digitales con QR, promociones y una comunidad de seguidores.',
}

/**
 * Alta de empresa (B2B). Crea la cuenta del propietario + la empresa mediante
 * el server action `registrarEmpresa`. Vive en la app (no en la landing)
 * porque escribe en la base de datos; la landing enlaza aquí vía appUrlFor().
 */
export default async function RegistroEmpresaPage() {
  // Si ya hay una sesión con empresa, no tiene sentido registrar otra.
  const user = await getUser()
  if (user?.metadata.companyId) {
    redirect('/admin/dashboard')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Registra tu empresa</CardTitle>
        <CardDescription>
          Crea tu cuenta en un minuto. Después te guiamos paso a paso para
          completar tu perfil, tu primer plan y tu primera promoción.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegistroEmpresaForm />
      </CardContent>
    </Card>
  )
}
