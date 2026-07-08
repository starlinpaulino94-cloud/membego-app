import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'
import { isTransientAuthError } from '@/lib/auth/transient'
import { ROLE_HOME, ROUTE_PROTECTION, type AppMetadata } from '@/types'

type CookieToSet = { name: string; value: string; options?: CookieOptions }

/**
 * Devuelve la regla de protección que aplica a un path, o undefined si es
 * público. Fuente única de verdad: `ROUTE_PROTECTION` en `src/types`.
 */
function matchProtected(path: string) {
  return ROUTE_PROTECTION.find((r) => path.startsWith(r.prefix))
}

/**
 * Redirect que conserva los Set-Cookie ya escritos en `from` (tokens de
 * sesión refrescados durante getUser). Un redirect "limpio" descartaría el
 * refresh token recién rotado y el navegador reutilizaría el anterior →
 * "Invalid Refresh Token: Already Used" → sesión muerta.
 */
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url)
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const path = request.nextUrl.pathname
  const matched = matchProtected(path)
  const isLoginPage = path === '/login' || path === '/acceso'

  // Rutas públicas: continuar sin verificación de auth. Evita una llamada
  // de red a Supabase por cada request público, prefetch o telemetría, que
  // bajo carga agota el rate limit de Auth y provoca fallos intermitentes.
  if (!matched && !isLoginPage) return response

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

    const { data, error } = await supabase.auth.getUser()
    let user = data.user

    // Fallo transitorio de Supabase Auth (429/5xx/red): NO tratar como
    // sesión inexistente. Usamos la sesión de la cookie para que un
    // problema puntual de infraestructura no expulse a usuarios válidos.
    if (!user && isTransientAuthError(error)) {
      const { data: sessionData } = await supabase.auth.getSession()
      user = sessionData.session?.user ?? null
    }

    if (matched) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', path)
        return redirectWithCookies(url, response)
      }
      const metadata = (user.app_metadata ?? {}) as Partial<AppMetadata>
      const role = metadata.role ?? 'CLIENTE'
      if (!matched.roles.includes(role)) {
        const url = request.nextUrl.clone()
        url.pathname = ROLE_HOME[role]
        return redirectWithCookies(url, response)
      }
    }

    // Redirect logged-in users away from the login pages
    if (isLoginPage && user) {
      const metadata = (user.app_metadata ?? {}) as Partial<AppMetadata>
      const role = metadata.role ?? 'CLIENTE'
      const url = request.nextUrl.clone()
      url.pathname = ROLE_HOME[role]
      return redirectWithCookies(url, response)
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
      return redirectWithCookies(url, response)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Excluye estáticos, imágenes, el túnel de Sentry (/monitoring) y
    // endpoints operativos que nunca requieren sesión.
    '/((?!_next/static|_next/image|favicon.ico|monitoring|api/health|api/cron|sitemap\\.xml|robots\\.txt|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
