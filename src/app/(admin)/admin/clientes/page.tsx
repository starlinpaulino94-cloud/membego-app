import Link from 'next/link'
import { requireRole } from '@/lib/auth/guards'
import { companyFilter } from '@/modules/admin/queries'
import { prisma } from '@/lib/prisma'
import { EstadoBadge } from '@/components/EstadoBadge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { MembershipEstado } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const user = await requireRole(['ADMIN_EMPRESA', 'SUPERADMIN'])
  const { q } = await searchParams
  const companyId = companyFilter(user)

  const fetchClientes = () =>
    prisma.cliente.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
        ...(q
          ? {
              OR: [
                { nombre: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        company: true,
        memberships: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

  let clientes: Awaited<ReturnType<typeof fetchClientes>> = []
  try {
    clientes = await fetchClientes()
  } catch (e) {
    console.error('[admin-clientes]', e)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
        <p className="text-slate-500">{clientes.length} resultados</p>
      </div>

      <form>
        <Input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por nombre o correo..."
          className="max-w-sm"
        />
      </form>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((c) => {
                const m = c.memberships[0]
                return (
                  <TableRow key={c.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/admin/clientes/${c.id}`}
                        className="font-medium text-sky-600 hover:underline"
                      >
                        {c.nombre}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-600">{c.email}</TableCell>
                    <TableCell>{m?.plan.nombre ?? '—'}</TableCell>
                    <TableCell>
                      {m ? (
                        <EstadoBadge estado={m.estado as MembershipEstado} />
                      ) : (
                        <span className="text-slate-400">Sin plan</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {clientes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500">
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
