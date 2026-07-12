import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'
import { sessionCookieDomain } from '@/lib/site'
import { ROLE_HOME, ROUTE_PROTECTION, FULL_ADMIN_ROLES, type AppMetadata } from '@/types'
import { adminSectionForPath, canAccessAdminSection } from '@/lib/auth/permissions'

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

/** ¿El request trae una cookie de sesión de Supabase? (sb-<ref>-auth-token). */
function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'))
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const path = request.nextUrl.pathname
  const matched = matchProtected(path)
  const isLoginPage = path === '/login' || path === '/acceso'

  // Rutas públicas SIN sesión: continuar sin tocar Supabase. Evita una llamada
  // de red por cada request anónimo, prefetch o telemetría (el grueso del
  // tráfico) que bajo carga agotaba el rate limit de Auth. Si el request SÍ
  // trae cookie de sesión, seguimos adelante aunque la ruta sea pública: hay
  // que refrescar/rotar el token (getUser lo hace) para no dejar la sesión sin
  // renovar mientras el usuario navega páginas públicas.
  if (!matched && !isLoginPage && !hasSupabaseAuthCookie(request)) {
    return response
  }

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
            // Etapa 6 · dominio de cookie (SSO cross-subdominio). undefined = host-only.
            const domain = sessionCookieDomain()
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, domain ? { ...options, domain } : options)
            )
          },
        },
      }
    )

    // getUser() valida el token contra el servidor de Supabase (verifica la
    // firma). NO usamos getSession() como fallback: decodifica el JWT de la
    // cookie SIN verificar la firma, y usarlo para autorización permitiría un
    // rol falsificado durante un 429/outage. Si getUser falla, fail-closed.
    const {
      data: { user },
    } = await supabase.auth.getUser()

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
      // Autorización fina del panel: roles acotados (Marketing/Supervisor)
      // solo acceden a sus secciones; el resto se les redirige al dashboard.
      // 'dashboard' siempre se permite para cualquier rol admin, para que el
      // destino del redirect nunca vuelva a fallar el gate (evita bucles).
      if (path.startsWith('/admin') && !FULL_ADMIN_ROLES.includes(role)) {
        const section = adminSectionForPath(path)
        if (section !== 'dashboard' && (!section || !canAccessAdminSection(role, section))) {
          const url = request.nextUrl.clone()
          url.pathname = '/admin/dashboard'
          return redirectWithCookies(url, response)
        }
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
