import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { ROLE_HOME } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * Fase 0 · Separación web/app: este proyecto es LA APLICACIÓN
 * (app.membego.com). El marketing vive en membego-web (membego.com).
 * La raíz manda a cada quien a su casa: sesión → su panel; sin sesión → login.
 */
export default async function AppRootPage() {
  const user = await getUser()
  if (user) {
    const home = ROLE_HOME[user.metadata.role as keyof typeof ROLE_HOME]
    redirect(home ?? '/login')
  }
  redirect('/login')
}
