import Link from 'next/link'
import { Plus, ExternalLink } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { requireRole } from '@/lib/auth/guards'
import { companyFilter } from '@/modules/admin/queries'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'

export const dynamic = 'force-dynamic'

export interface EmpleadoRow {
  id: string
  name: string
  email: string
  createdAt: Date
}

const columns: ColumnDef<EmpleadoRow>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => (
      <Link
        href={`/admin/empleados/${row.original.id}`}
        className="font-medium text-sky-600 hover:underline"
      >
        {row.getValue('name')}
      </Link>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Correo',
  },
  {
    accessorKey: 'createdAt',
    header: 'Registrado',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt') as Date)
      return new Intl.DateTimeFormat('es-DO', { dateStyle: 'short' }).format(date)
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <Link href={`/admin/empleados/${row.original.id}`} title="Ver detalles">
        <ExternalLink className="h-4 w-4 text-slate-400 hover:text-slate-600" />
      </Link>
    ),
  },
]

export default async function EmpleadosPage() {
  const user = await requireRole(['ADMIN_EMPRESA', 'SUPERADMIN'])
  const companyId = companyFilter(user)

  let empleados: EmpleadoRow[] = []
  try {
    const data = await prisma.user.findMany({
      where: {
        role: 'EMPLEADO',
        ...(companyId ? { companyId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    empleados = data as unknown as EmpleadoRow[]
  } catch (e) {
    console.error('[admin-empleados]', e)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Empleados</h1>
          <p className="text-slate-500">{empleados.length} empleados</p>
        </div>
        <Button asChild>
          <Link href="/admin/empleados/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo empleado
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns as any}
        data={empleados as any}
        searchPlaceholder="Buscar por nombre o correo..."
        searchKey="name"
        pageSize={10}
        exportable
        exportFilename="empleados.csv"
      />
    </div>
  )
}
