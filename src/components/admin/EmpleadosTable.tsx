'use client'

import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'

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

export function EmpleadosTable({ data }: { data: EmpleadoRow[] }) {
  return (
    <DataTable
      columns={columns as unknown as ColumnDef<Record<string, unknown>, unknown>[]}
      data={data as unknown as Record<string, unknown>[]}
      searchPlaceholder="Buscar por nombre o correo..."
      searchKey="name"
      pageSize={10}
      exportable
      exportFilename="empleados.csv"
    />
  )
}
