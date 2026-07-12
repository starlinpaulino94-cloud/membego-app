# MembeGo v2.0 — Arquitectura Objetivo del Ecosistema

> Guía oficial de arquitectura. Documento de **diseño** (no implementa cambios).
> Stack base: Next.js 16 (App Router) · Supabase (Postgres + Auth + Storage) ·
> Prisma · Sentry · multi-tenant por `companyId` (shared-schema).
> Principio rector: **Monolito Modular evolutivo** — se extrae por carga de
> trabajo, no por moda; sin microservicios prematuros.

## 1. Dominios

| Dominio | Rol | ¿Cuándo? | Veredicto |
|---|---|---|---|
| **membego.com** | Landing + Marketplace + blog + legal + ayuda | Ya | ✅ |
| **app.membego.com** | Aplicación Web (login, cliente, admin, empleado, superadmin) | Etapa 6 | ✅ |
| **api.membego.com** | API/BFF (móvil + API pública) | 1er consumidor no-web | ⏳ diferir |
| **cdn** (o CDN gestionado) | Imágenes/estáticos (Supabase Storage + CDN) | Al crecer tráfico | ✅ gestionado |
| **docs.membego.com** | Documentación de API/producto | Con API pública | ⏳ diferir |
| **developers.membego.com** | Portal de desarrolladores | Con integraciones 3os | ⏳ fusionar con docs |
| **status.membego.com** | Estado del servicio | Con SLA | ⚠️ usar SaaS (Statuspage/Instatus) |

Decisiones clave:
- **Marketplace en el dominio raíz** (`/empresas`, `/promociones`), no en
  subdominio → consolida autoridad SEO en un solo host.
- **`app.` como subdominio**, no path → despliegue, CSP, headers y caché
  independientes.
- **`api.` diferido**: hoy la web co-loca su backend (RSC + Server Actions);
  añadir un salto de red ahora es complejidad sin retorno.
- **Cookie de sesión en `.membego.com`** (dominio padre) → SSO entre `app.` y el
  marketplace sin re-login. **Configurar ANTES del corte físico.**

## 2. Ecosistema (diagrama textual)

```
   Landing        Web App         PWA/Móvil        Android        iOS
   membego.com    app.membego     (instalable)     (futuro)       (futuro)
        └──────────────┴───────────────┬──────────────┴─────────────┘
                                        ▼
                 EDGE / CDN (caché, WAF, TLS, rate-limit de borde)
                 ISR/SSG (Landing+Marketplace) · assets
        ┌───────────────┬───────────────────────────┬───────────────┐
        ▼               ▼                           ▼
   LANDING+MKT     WEB APP (SSR)              API / BFF (futuro)
   Next.js RSC     Next.js RSC                api.membego.com
   solo lectura    server actions             REST/OpenAPI, versionado
        └───────────────┴───────────────┬───────────┴───────────────┘
                                         ▼
        CAPA DE DOMINIO (Monolito Modular) — comunicación por EVENTOS
        Membership · Promotions · Referral/Growth · Rewards/Benefits ·
        Rules · Transaction · Receipt · Scanner
                    │                              │ (async / desacoplable)
                    ▼                              ▼
        DATOS (Supabase)                 PLANO ASÍNCRONO (futuro)
        Postgres OLTP (RLS, companyId)   Cola (QStash/pg-boss/SQS)
        + réplica de lectura             Workers: Notifications, Analytics,
        Storage · Auth (JWT)             Rewards, Webhooks → OLAP · Search

        Observabilidad: Sentry · OpenTelemetry · logs estructurados
```

Todos los clientes consumen la **misma capa de dominio**; los motores se hablan
por **eventos** (strangler fig), lo que permite extraer workers sin reescribir el
núcleo.

## 3. Autenticación unificada (Web · Android · iOS)

Identidad única = **Supabase Auth como IdP**; un solo contrato de JWT.

| Plataforma | Sesión | Mecanismo |
|---|---|---|
| Web | Cookie httpOnly en `.membego.com` (SSR) | `@supabase/ssr`, refresh en middleware |
| Android/iOS | Token en Keychain/Keystore | Supabase SDK, PKCE, refresh token |
| API/BFF | Verifica el mismo JWT (firma) | Middleware compartido |

- Claims mínimos y estables: `sub`, `role`, `companyId`. Autorización real =
  **RLS** + guards por rol (fail-closed).
- Nunca autorizar por JWT sin verificar firma (ya se respeta con `getUser()`).
- La lógica de negocio vive en el servidor; el móvil solo autentica y consume.
- Encapsular Supabase Auth tras una interfaz propia (`AuthProvider`) para poder
  migrar de proveedor sin tocar la app.

## 4. Motores internos — mantener vs. desacoplar

| Motor | Futuro | Motivo |
|---|---|---|
| Membership | **Permanece** | Núcleo transaccional, consistencia fuerte. |
| Promotions | **Permanece** (lectura → caché/CDN + API) | Público read-heavy; escritura transaccional. |
| Referral/Growth | **Permanece**; procesamiento → worker | Ya event-driven; entrega async sin mover el núcleo. |
| Rewards/Benefits | **Permanece como librería** | Primitivo compartido por todos; es biblioteca, no servicio. |
| Rules Engine | **Permanece embebido (in-process)** | Evaluación en el hot path; jamás un salto de red. |
| **Notification** | **1º a EXTRAER** (worker + cola) | Asíncrono, I/O-bound, ráfagas, reintentos. |
| **Analytics** | **EXTRAER** (pipeline + OLAP) | Write-heavy/analítico; no correr sobre el OLTP. |

Regla: monolito modular con contratos limpios; extraer **Notifications** y
**Analytics** primero (por workload), vía el bus de eventos.

## 5. Marketplace

Público, solo-lectura, SEO-crítico, con picos. (`marketplace/queries.ts` ya es
100% read-only.)

- ISR/SSG + caché de borde/CDN.
- **Réplica de lectura** para aislar el tráfico público del transaccional.
- Búsqueda: Postgres FTS hoy; **índice dedicado** (Meilisearch/Typesense/Algolia)
  a escala.
- Denormalización / vistas materializadas para tarjetas (evita N+1).
- Imágenes en Storage + CDN + `next/image`.
- SEO: canónicos/OG (hecho), `robots.ts`, sitemap por dominio, JSON-LD.
- Contrato de datos estable → luego servido por `api.membego.com` sin tocar UI.

## 6. Aplicaciones móviles

- Recomendado: **React Native + Expo** (comparte TS/zod/tipos con la web).
- Comunicación contra **`api.membego.com`** (REST/OpenAPI o tRPC). No lógica de
  negocio ni DB directa (salvo Auth SDK).
- Auth: Supabase SDK (PKCE), tokens en almacenamiento seguro; mismo JWT.
- Offline (QR sin conexión), push vía Notification service (FCM/APNs).
- Versionado de API + feature flags + forced-update.
- **PWA primero** (ya diseñada) para validar demanda antes de invertir en nativo.

## 7. API

Hoy **no** es necesaria. Se crea cuando ocurra el 1º de: llega el **móvil**, se
ofrece **API pública/partners**, o se **extrae un servicio**.

- Exponer (autenticado/versionado): marketplace público (solo lectura),
  operaciones de cliente para móvil, webhooks.
- **Nunca público**: admin/superadmin, internos del Rules Engine y del pipeline
  de analítica, acceso crudo a DB, `service_role`, cron/operativos, consultas
  cross-tenant.
- Diseño: **BFF** (para móvil) + **API pública** separada (OpenAPI, API keys,
  `/v1`, rate limit). No mezclar ambas.

## 8. Escalabilidad

- Datos: shared-schema (`companyId`) con **RLS obligatorio**; réplicas de
  lectura + pgBouncer; **particionar** tablas calientes (`referral_events`,
  `transactions`, `producto_compras`, `qr_tokens`); sharding/Citus solo en
  escala extrema; idempotencia en dinero (`dedupeKey`).
- Cómputo: edge/CDN + ISR; **Redis/Upstash** para rate-limit/caché/locks
  (hoy `lru-cache` en memoria no sirve multi-instancia); **cola** para
  notificaciones/analítica/recompensas/webhooks.
- Búsqueda/analítica: índice dedicado + pipeline de eventos → OLAP.
- Internacional: multi-moneda ✅, i18n ✅, timezones ✅; residencia de datos y
  multi-región a futuro.
- Fiabilidad: WAF/DDoS, rate limiting, Sentry + OpenTelemetry + logs, backups/DR.

## 9. Roadmap de arquitectura

| Fase | Objetivo | Prioridad | Riesgo |
|---|---|---|---|
| A · Fundaciones | Separación Landing/App, **RLS**, cookies `.membego.com`, ISR/CDN, observabilidad, Redis | 🔴 | Medio |
| B · Async | Bus de eventos + cola, **extraer Notification**, réplica de lectura | 🟠 | Medio |
| C · API | `api.membego.com` (BFF), OpenAPI, API pública read-only | 🟠 | Medio |
| D · Móvil | RN/Expo sobre la API, push, feature flags | 🟡 | Medio |
| E · Datos | **Extraer Analytics** a pipeline + OLAP, búsqueda dedicada | 🟡 | Medio |
| F · Escala | Particionado/sharding, multi-región, docs/dev portal + API GA | 🟢 | Alto |

Orden: **seguridad + separación + observabilidad primero** → async/notifications
→ API + móvil → analítica/búsqueda → geo-escala.

## Riesgos · Ventajas · Desventajas

Ventajas: velocidad hoy; extracción por evidencia; contratos + eventos = camino
limpio a servicios; SEO consolidado; auth unificado.
Desventajas: release acoplado (mitiga: separar Landing/App/API); shared-schema
exige RLS impecable; `lru-cache` no escala horizontal (mitiga: Redis).

| Riesgo | Sev. | Mitigación |
|---|---|---|
| Falta de RLS multi-tenant | 🔴 | RLS en todas las tablas antes de escalar |
| Cookies/sesión al separar dominios | 🔴 | Cookie `.membego.com` en Fase A + QA cross-subdominio |
| OLAP sobre OLTP | 🟠 | Extraer Analytics + réplica |
| Notificaciones bloqueando requests | 🟠 | Cola + worker |
| Microservicios prematuros | 🟠 | Extraer solo por workload medido |
| Acoplar API pública con BFF | 🟡 | Separar ambas superficies desde el diseño |

## Recomendaciones y prioridades

1. Primero cimientos: RLS + separación + observabilidad + Redis.
2. Mantener el monolito modular; extraer por eventos (Notifications, Analytics).
3. Diferir `api.membego.com` hasta el 1er consumidor no-web; BFF ≠ API pública.
4. PWA antes que nativo.
5. Marketplace en dominio raíz + ISR/CDN + réplica + búsqueda dedicada.
6. Auth como IdP único tras una abstracción propia; JWT mínimo + RLS.
7. `status.` con SaaS; `docs`/`developers` fusionados hasta tener API pública.

**Prioridad #1 inmediata:** completar la separación Landing/App (Etapa 6) con la
cookie de sesión en `.membego.com` desde el día uno y RLS habilitado.
