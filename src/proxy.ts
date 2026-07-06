import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'
import { ROLE_HOME, ROUTE_PROTECTION, type AppMetadata } from '@/types'

type CookieToSet = { name: string; value: string; options?: CookieOptions }

/**
 * Devuelve la regla de protección que aplica a un path, o undefined si es
 * público. Fuente única de verdad: `ROUTE_PROTECTION` en `src/types`.
 */
function matchProtected(path: string) {
  return ROUTE_PROTECTION.find((r) => path.startsWith(r.prefix))
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const path = request.nextUrl.pathname
  const matched = matchProtected(path)

  try {
    const supabase = createServerClient(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: CookieToSet[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (matched) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', path)
        return NextResponse.redirect(url)
      }
      const metadata = (user.app_metadata ?? {}) as Partial<AppMetadata>
      const role = metadata.role ?? 'CLIENTE'
      if (!matched.roles.includes(role)) {
        const url = request.nextUrl.clone()
        url.pathname = ROLE_HOME[role]
        return NextResponse.redirect(url)
      }
    }

    // Redirect logged-in users away from the login pages
    if ((path === '/login' || path === '/acceso') && user) {
      const metadata = (user.app_metadata ?? {}) as Partial<AppMetadata>
      const role = metadata.role ?? 'CLIENTE'
      const url = request.nextUrl.clone()
      url.pathname = ROLE_HOME[role]
      return NextResponse.redirect(url)
    }
  } catch (err) {
    // Fail-closed: si la verificación de auth falla (Supabase caído, env
    // faltante) NO dejamos pasar rutas protegidas — redirigimos a /login.
    // Las rutas públicas continúan normalmente.
    console.error('[proxy] auth check failed:', err)
    if (matched) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
