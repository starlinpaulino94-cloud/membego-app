import { requireRole } from '@/lib/auth/guards'
import { ADMIN_ROLES } from '@/types'
import { PostForm } from '@/components/admin/PostForm'

export default async function NuevaPublicacionPage() {
  await requireRole(ADMIN_ROLES)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nueva publicación</h1>
        <p className="text-slate-500">
          Se notificará automáticamente a los seguidores de tu empresa.
        </p>
      </div>
      <PostForm />
    </div>
  )
}
