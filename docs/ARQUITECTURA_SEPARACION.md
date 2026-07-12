# Arquitectura de separación Landing / Aplicación (FASE 2 · preparación)

> Estado: **preparación in-situ**. No se ha movido, copiado ni eliminado código,
> ni se han creado páginas nuevas. El proyecto sigue funcionando en **un solo
> dominio** con comportamiento **idéntico** al actual. Este documento fija el
> mapa objetivo y deja lista la abstracción de dominios para ejecutar la
> separación por etapas cuando se apruebe.

## Objetivo

- `membego.com` → **Landing** (marketing, SEO, blog).
- `app.membego.com` → **Aplicación** (auth + paneles).
- `api.membego.com` → **Backend futuro** (no se toca ahora).

Estrategia elegida (R1): **B → C** — el marketplace público mantiene por ahora
su capa de datos de solo-lectura y luego migra a `api.membego.com`. La base de
datos, Prisma, Supabase, auth, motores de negocio y APIs **no cambian**.

## Abstracción de dominios (ya preparada)

`src/lib/site.ts` expone:

| Función | Devuelve | Hoy |
|---|---|---|
| `getAppUrl()` | dominio único (retrocompatible) | `NEXT_PUBLIC_APP_URL` / `https://membego.com` |
| `landingUrl()` / `landingUrlFor(path)` | dominio de la Landing | = `getAppUrl()` |
| `appUrl()` / `appUrlFor(path)` | dominio de la Aplicación | = `getAppUrl()` |
| `absoluteUrl(path)` | URL absoluta (dominio actual) | sin cambios |

Env (opcionales, en `.env.example`): `NEXT_PUBLIC_LANDING_URL`,
`NEXT_PUBLIC_APP_ORIGIN`. **Mientras estén vacías, todo apunta al dominio único
→ cero cambio de comportamiento.** Ningún llamador se ha migrado todavía; la
migración de call-sites es una etapa posterior (ver checklist).

## Mapa de route-groups → proyecto futuro

| Route group / ruta | Proyecto | Naturaleza |
|---|---|---|
| `(public)/page.tsx` (Home) | Landing | Marketing + destacados (DB) |
| `(public)/empresas`, `/empresas/[slug]` | Landing | Marketplace/SEO (DB) |
| `(public)/promociones`, `/promocion/[id]` (+OG) | Landing | Marketplace/SEO (DB) |
| `(public)/plan/[id]` (+OG) | Landing | Marketplace/SEO (DB) |
| `(public)/registro-empresa` | Landing | Captación B2B (form) |
| `(public)/contact` `/terms` `/privacy` | Landing | Estáticas |
| *(nuevas: características, FAQ, blog, descarga)* | Landing | A crear (etapa 4) |
| `(auth)/*` (login, registro, recuperar, confirmar) | App | Auth |
| `(cliente)/*`, `/mis-membresias`, `/membresia/[id]` | App | Cliente |
| `(admin)/*` | App | Panel admin |
| `(superadmin)/*` | App | Panel superadmin |
| `(empleado)/*` | App | Scanner |
| `(onboarding)/*` | App | Onboarding B2B |
| `invitacion/[token]` | App | Invitación de equipo |
| `(public)/registro`, `(public)/i/[code]` | **Híbrido → App** | Entrada al registro |
| `r/[code]`, `auth/callback`, `confirmar` | App | Redirects / auth |
| `api/*`, `/monitoring` | App | Backend interno |
| `layout.tsx` (root), `error`, `not-found` | **Compartido** (duplicar) | Shell base |
| `sitemap.ts`, (falta `robots.ts`) | Landing | SEO |

## Límite de UI compartida (futuro `packages/ui`)

Componentes usados por **ambos** lados — fuente única a extraer (no duplicar
divergiendo):

- `src/components/ui/*` (design system, 27).
- `src/components/marketplace/*` (`PromotionDetail`, `CompanyProfile`).
- `src/components/public/Share*` (`ShareMenu`, `SharePromocionMenu`, `ShareButton`, `SharePromocion`).
- `src/components/growth/CountdownTimer` (landing) — separar de los de app
  (`ConfettiCelebration`, `GenerarInvitacionCard`).
- Infra: `ThemeProvider`, `ThemeToggle`, `EstadoBadge`, `PanelError`, `PanelNotFound`.

Exclusivos Landing: `src/components/public/*` (resto).
Exclusivos App: `admin/`, `cliente/`, `scanner/`, `superadmin/`, `membresia/`,
`onboarding/`, `qr/`, `charts/`, `auth/`, `layout/` (AppShell).

## Navegación cross-dominio (a cablear en etapa 7)

| Enlace | Destino futuro | Función a usar |
|---|---|---|
| `PublicNav` → empresas/promociones/para-empresas | Landing | relativo |
| `PublicNav` → login/registro | App | `appUrlFor('/login')` |
| `AppShell` / `nav-config.ts` | App | relativo |
| Logout / marca → Home | Landing | `landingUrlFor('/')` |
| Share/OG/QR/referidos | según recurso | `landingUrlFor` / `appUrlFor` |

## Dependencias que NO deben ir a la Landing pura

`@supabase/*`, `html5-qrcode`, `qrcode`, `leaflet`, `@tanstack/react-table`,
`recharts`, `lru-cache`, `input-otp`, `cmdk`, `vaul`, `embla-carousel-react`,
`react-day-picker`, `react-resizable-panels`. `@prisma/client` solo si la
Landing conserva el marketplace (opción B). **Nunca** claves `service_role` ni
`SENTRY_AUTH_TOKEN` en la Landing.

## Checklist de ejecución (siguientes etapas — requieren aprobación)

- [ ] **Etapa 3** — Extraer UI compartida a paquete/monorepo (Turborepo).
- [ ] **Etapa 4** — Landing estática (Home marketing, características, FAQ,
      contacto, términos, privacidad, descarga) + `robots.ts` + sitemap propio +
      metadata/JSON-LD movidos desde el layout raíz.
- [ ] **Etapa 5** — Ubicar el marketplace (B: capa de datos read-only en Landing)
      + 301/canónicos/Search Console.
- [ ] **Etapa 6** — App independiente: cookies en `.membego.com`, todos los
      grupos autenticados + APIs.
- [ ] **Etapa 7** — Migrar call-sites de `getAppUrl()` a `landingUrlFor`/
      `appUrlFor`, cablear cross-links y QA de sesión cross-subdominio.

## Invariantes (no romper)

DB, Prisma, Supabase, auth, membresías, promociones, referidos, Growth Engine,
panel admin, scanner y motor de reglas **no se modifican**. La separación es
puramente de **organización y dominios**.
