import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/guards'
import { ADMIN_ROLES } from '@/types'
import { companyFilter } from '@/modules/admin/queries'
import { prisma } from '@/lib/prisma'
import { PostForm } from '@/components/admin/PostForm'

export const dynamic = 'force-dynamic'

export default async function EditarPublicacionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireRole(ADMIN_ROLES)
  const companyId = companyFilter(user)
  const { id } = await params

  const post = await prisma.companyPost.findUnique({ where: { id } })
  if (!post) notFound()
  // Aislamiento: solo la empresa dueña (o superadmin) puede editar.
  if (companyId && post.companyId !== companyId) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Editar publicación</h1>
        <p className="text-slate-500">{post.titulo}</p>
      </div>
      <PostForm
        existing={{
          id: post.id,
          tipo: post.tipo,
          titulo: post.titulo,
          contenido: post.contenido,
          imagenUrl: post.imagenUrl,
          fechaEvento: post.fechaEvento,
          lugar: post.lugar,
          activo: post.activo,
        }}
      />
    </div>
  )
}
