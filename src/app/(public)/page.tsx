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
  // getUser va en try/catch: si Supabase no responde (o falta una env en el
  // proyecto de Vercel), la raíz JAMÁS debe mostrar "Algo salió mal" — como
  // mínimo siempre aterriza en /login.
  let destino = '/login'
  try {
    const user = await getUser()
    if (user) {
      destino = ROLE_HOME[user.metadata.role as keyof typeof ROLE_HOME] ?? '/login'
    }
  } catch (e) {
    console.error('[app-root] getUser falló, redirigiendo a /login:', e)
  }
  redirect(destino)
}
