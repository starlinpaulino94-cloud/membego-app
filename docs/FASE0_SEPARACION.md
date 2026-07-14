# Fase 0 · Separación Web (marketing) / App (aplicación)

**Estado:** código listo en ambos repos. Falta solo la configuración de Vercel/DNS (pasos abajo).

## Mapa final

| Pieza | Repo | Dominio | Contenido |
|---|---|---|---|
| Landing | `membego-web` | `membego.com` | Home, características, directorios de empresas/promos (SEO), blog, FAQ, contacto, descargar, legal |
| Aplicación | `membego-app` (este) | `app.membego.com` | Login, registro, portales (cliente/admin/empleado/superadmin), QR, campañas `/invita`, `/i`, `/r`, compra de planes/promos |
| Monolito actual | `pase-digital-platform` | `membego.com` (hoy) | Se retira tras el corte; queda como respaldo |

La app conserva `/terms` y `/privacy` (el registro los exige) y `empresas/[slug]`, `promocion/[id]`, `plan/[id]` como rutas funcionales (deep links y compra). Los directorios de marketing (`/empresas`, `/promociones` sin slug) y las páginas de contenido redirigen a la landing vía `next.config.ts`.

## Variables de entorno por proyecto (Vercel)

**Proyecto membego-app** (además de las actuales del monolito — copiar TODAS las de BD/Supabase/Sentry):

```
NEXT_PUBLIC_APP_URL=https://app.membego.com
NEXT_PUBLIC_APP_ORIGIN=https://app.membego.com
NEXT_PUBLIC_LANDING_URL=https://membego.com
NEXT_PUBLIC_COOKIE_DOMAIN=.membego.com
```

**Proyecto membego-web:**

```
NEXT_PUBLIC_APP_URL=https://membego.com
NEXT_PUBLIC_LANDING_URL=https://membego.com
NEXT_PUBLIC_APP_ORIGIN=https://app.membego.com
DATABASE_URL=<misma BD, solo lectura pública>
```

## Pasos del corte (en orden)

1. **Deploy de prueba:** ambos proyectos de Vercel construyendo desde `main` de su repo. Probar con los dominios `*.vercel.app`.
2. **Dominio de la app:** en Vercel, asignar `app.membego.com` al proyecto `membego-app`. Crear el CNAME en el DNS.
3. **Prueba de SSO:** definir `NEXT_PUBLIC_COOKIE_DOMAIN=.membego.com` en la app ANTES del corte; iniciar sesión en `app.membego.com` y verificar que la sesión sobrevive navegando entre subdominios.
4. **Sincronizar datos frescos:** justo antes del corte, mergear el último `main` del monolito a `membego-app` (`git fetch source main && git merge source/main`) para no perder trabajo del otro chat.
5. **El corte:** mover `membego.com` del proyecto del monolito al proyecto `membego-web`.
6. **Redirects del dominio viejo:** los QRs y enlaces impresos apuntan a `membego.com/...`. En `membego-web` deben existir redirects hacia la app para TODAS las rutas de flujo:
   - `/login`, `/acceso`, `/registro/:path*`, `/registro-empresa`
   - `/cliente/:path*`, `/admin/:path*`, `/superadmin/:path*`, `/empleado/:path*`
   - `/i/:code*`, `/r/:code*`, `/invita/:path*`, `/invitacion/:path*`, `/confirmar`
   - `/mis-membresias`, `/membresia/:path*`, `/plan/:path*`, `/promocion/:path*`, `/onboarding`
   (→ `https://app.membego.com/<misma ruta>`, `permanent: false` las primeras semanas.)
7. **Verificación post-corte (checklist):**
   - [ ] `membego.com` muestra la landing y carga rápido (ISR)
   - [ ] `membego.com/login` redirige a `app.membego.com/login` y el login funciona
   - [ ] Un QR viejo impreso (`membego.com/i/CODE`) llega a la app y valida
   - [ ] Enlace de campaña compartido (`membego.com/invita/slug?ref=X`) conserva la atribución
   - [ ] Registro completo end-to-end en `app.membego.com`
   - [ ] El scanner del empleado funciona en el dominio nuevo
8. **PWA/instalación:** el manifest e "instalar app" viven SOLO en `app.membego.com` (objetivo original de la separación: quien instala la app no arrastra el marketing).

## Regla operativa hasta el corte

`pase-digital-platform` sigue siendo producción. Todo feature nuevo va allá; `membego-app` se re-sincroniza con `git merge source/main` (las historias ya están enlazadas, es un merge normal). Después del corte, la dirección se invierte: el desarrollo vive en `membego-app` y el monolito se archiva.
