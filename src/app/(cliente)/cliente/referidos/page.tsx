import { Users, Gift, CheckCircle2, Clock } from 'lucide-react'
import { requireRole } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { getClienteReferidos } from '@/modules/referidos/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CopyReferralLink } from '@/components/cliente/CopyReferralLink'

export const dynamic = 'force-dynamic'

export default async function ReferidosClientePage() {
  const user = await requireRole('CLIENTE')

  const cliente = user.metadata.clienteId
    ? await prisma.cliente.findUnique({
        where: { id: user.metadata.clienteId },
        include: { company: true },
      })
    : null

  if (!cliente) {
    return <p className="text-slate-600">No se encontró tu información.</p>
  }

  const referidos = await getClienteReferidos(cliente.id)
  const completados = referidos.filter((r) => r.estado === 'COMPLETADO').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Refiere y gana</h1>
        <p className="text-slate-500">
          Comparte tu enlace con amigos. Cuando se registren y activen su
          membresía en {cliente.company.name}, sumas un referido.
        </p>
      </div>

      <Card className="border-sky-200 bg-sky-50">
        <CardContent className="space-y-3 py-5">
          <p className="text-sm font-medium text-sky-700">Tu enlace de referido</p>
          <CopyReferralLink code={cliente.codigoReferido} companySlug={cliente.company.slug} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="rounded-lg bg-sky-100 p-2">
              <Users className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{referidos.length}</p>
              <p className="text-sm text-slate-500">Referidos totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="rounded-lg bg-green-100 p-2">
              <Gift className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{completados}</p>
              <p className="text-sm text-slate-500">Completados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent>
          {referidos.length === 0 ? (
            <p className="text-sm text-slate-500">Aún no has referido a nadie.</p>
          ) : (
            <ul className="space-y-2">
              {referidos.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <span>{r.referidoCliente.nombre}</span>
                  {r.estado === 'COMPLETADO' ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Completado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="mr-1 h-3 w-3" />
                      Pendiente
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
