# Pase Digital QR

Sistema interno de promociones y pases digitales QR para negocios participantes.

Los clientes se registran, activan su **Pase Digital** y reciben un código QR único. Los empleados escanean ese QR en el establecimiento para validar y registrar el uso de la promoción.

> **Nota:** Este es un sistema interno de gestión, no un producto SaaS público.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 + React 19 |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Base de datos | SQLite (local) · Supabase PostgreSQL (producción) |
| ORM | Prisma 6 |
| Auth | Sesiones custom — scrypt + cookies httpOnly |
| Estado | Zustand |
| QR | `qrcode` (generación) + `html5-qrcode` (escaneo por cámara) |
| Runtime | Bun |
| Deploy | Vercel (serverless) |

---

## Requisitos previos

- [Bun](https://bun.sh) `>= 1.0`
- Node.js `>= 18` (para Prisma CLI)

---

## Instalación local (SQLite)

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPO>
cd pase-digital-qr

# 2. Instalar dependencias
bun install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env y activar la OPCIÓN A (SQLite local):
#   DATABASE_URL="file:./db/custom.db"
#   DIRECT_URL="file:./db/custom.db"
#   SESSION_SECRET="cualquier-cadena-local"

# 4. Generar el cliente Prisma
bun run db:generate

# 5. Inicializar la base de datos (primera vez)
bun run db:push

# 6. Cargar datos de prueba
bun run dev
# En otra terminal:
curl -X POST http://localhost:3000/api/seed
```

---

## Variables de entorno

Copia `.env.example` a `.env`. Nunca subas `.env` a Git.

### Desarrollo local con SQLite

```env
DATABASE_URL="file:./db/custom.db"
DIRECT_URL="file:./db/custom.db"
SESSION_SECRET="dev-secret-local"
```

### Producción con Supabase PostgreSQL

```env
# Transaction pooler (pgBouncer) — para la app
DATABASE_URL="postgresql://postgres.XXXXX:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Conexión directa — solo para migraciones
DIRECT_URL="postgresql://postgres.XXXXX:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"

# Genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET="cadena-aleatoria-larga-para-produccion"
```

---

## Comandos principales

```bash
# Desarrollo
bun run dev              # Inicia en http://localhost:3000

# Base de datos (local)
bun run db:generate      # Genera el cliente Prisma
bun run db:push          # Sincroniza el schema sin migraciones (dev / primera vez)
bun run db:migrate       # Crea y aplica una migración nueva (dev)
bun run db:reset         # Resetea la base de datos ¡destruye datos!

# Base de datos (producción)
bun run db:migrate:deploy  # Aplica migraciones pendientes en producción

# Producción
bun run build            # Compila el proyecto
bun run start            # Inicia el servidor compilado

# Calidad
bun run lint             # Revisa el código con ESLint
```

---

## Correr localmente

```bash
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000). La app usa routing por hash — todo está bajo `/`:

| Hash | Vista |
|------|-------|
| `/` | Landing pública (Pase Digital) |
| `/#registro` | Registro de cliente |
| `/#mi-qr` | Login / panel de cliente |
| `/#admin-login` | Login del panel interno *(no enlazado desde la landing)* |
| `/#admin` | Panel interno *(requiere autenticación)* |

---

## Cuentas de prueba

> Disponibles después de ejecutar `POST /api/seed`.

| Rol | Email | Contraseña |
|-----|-------|------------|
| Superadmin | `superadmin@fidelix.com` | `admin123` |
| Admin Carwash | `admin.carwash@fidelix.com` | `admin123` |
| Admin Restaurante | `admin.restaurante@fidelix.com` | `admin123` |
| Empleado Carwash | `empleado.carwash@fidelix.com` | `admin123` |
| Cliente | `cliente@fidelix.com` | `cliente123` |

---

## Despliegue en producción: Supabase + Vercel

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. En **Settings → Database → Connection string**, copia:
   - **Transaction pooler** (puerto `6543`) → `DATABASE_URL` (agrega `?pgbouncer=true` al final)
   - **Direct connection** (puerto `5432`) → `DIRECT_URL`

### 2. Crear las tablas en Supabase (primera vez)

Con las variables apuntando a Supabase en tu `.env` local:

```bash
# Opción A — push directo (sin historial de migraciones)
bun run db:push

# Opción B — con migraciones formales
bun run db:migrate       # crea la migración inicial
bun run db:migrate:deploy  # aplica en producción
```

### 3. Cargar datos iniciales

Con la app corriendo localmente (apuntando a Supabase):

```bash
curl -X POST http://localhost:3000/api/seed
```

O una vez que esté en Vercel:

```bash
curl -X POST https://TU-DOMINIO.vercel.app/api/seed
```

### 4. Configurar Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com).
2. En **Settings → Environment Variables**, agrega:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Transaction pooler de Supabase (`?pgbouncer=true`) |
| `DIRECT_URL` | Conexión directa de Supabase |
| `SESSION_SECRET` | Cadena aleatoria larga (mín. 32 caracteres) |

3. En **Settings → General → Build & Output Settings**:
   - Build Command: `next build` (o deja el que Vercel detecta)
   - Output Directory: `.next`

4. Haz deploy. Vercel ejecuta `bun install` → `prisma generate` (via `postinstall`) → `next build`.

> **Sin migraciones en Vercel:** Vercel no ejecuta migraciones automáticamente. Ejecuta `bun run db:migrate:deploy` desde tu máquina local antes de cada release que cambie el schema.

---

## Estructura del proyecto

```
pase-digital-qr/
├── .env.example              # Variables de entorno documentadas
├── prisma/
│   └── schema.prisma         # Modelos de datos (13 modelos)
├── db/                       # Base de datos SQLite local (excluida de Git)
├── public/                   # Archivos estáticos
└── src/
    ├── app/
    │   ├── page.tsx          # Punto de entrada → <AppRoot />
    │   ├── layout.tsx        # Layout raíz con metadatos
    │   └── api/              # Rutas API (Next.js Route Handlers)
    │       ├── auth/         # Login, logout, registro
    │       ├── empresas/     # CRUD empresas
    │       ├── clientes/     # CRUD clientes
    │       ├── estrategias/  # CRUD promociones
    │       ├── qr/           # Escaneo y confirmación de QR
    │       ├── transacciones/
    │       ├── reportes/
    │       └── datos-publicos/ # Datos para la landing (sin auth)
    ├── components/
    │   ├── fidelix/          # Lógica de negocio
    │   │   ├── AppRoot.tsx   # Enrutador principal (por hash)
    │   │   ├── AuthScreens.tsx # Landing + Login + Registro
    │   │   ├── AdminShell.tsx  # Panel interno (admin/empleado)
    │   │   ├── AdminLogin.tsx  # Login del panel interno
    │   │   ├── ClienteShell.tsx # Panel del cliente
    │   │   ├── QrComponents.tsx # QrDisplay + QrScanner
    │   │   ├── api-client.ts   # Cliente HTTP del frontend
    │   │   ├── store.ts        # Estado global (Zustand)
    │   │   └── panels/         # Paneles por rol
    │   │       ├── SuperadminPanel.tsx
    │   │       ├── EmpresaPanel.tsx
    │   │       ├── EmpleadoPanel.tsx
    │   │       └── ScannerFlow.tsx
    │   └── ui/               # Componentes shadcn/ui
    └── lib/
        ├── auth.ts           # Hashing, sesiones, permisos
        ├── db.ts             # Singleton PrismaClient
        ├── constants.ts      # Roles, tipos, servicios por negocio
        ├── seed.ts           # Datos iniciales idempotentes
        └── api.ts            # Helpers ok/err/apiError
```

---

## Modelos de datos principales

```
User              → Todos los usuarios del sistema (4 roles)
Session           → Sesiones activas
Empresa           → Negocios participantes
TipoNegocio       → Carwash, Restaurante, etc.
Cliente           → Perfil de cliente por empresa
Estrategia        → Definición de una promoción
ClienteEstrategia → Promoción asignada a un cliente
QrToken           → Pase Digital QR único por cliente/empresa
Transaccion       → Historial de usos registrados
```

---

## Roles del sistema

| Rol | Acceso |
|-----|--------|
| `SUPERADMIN` | Acceso total: empresas, clientes, reportes globales, configuración |
| `ADMIN_EMPRESA` | Su empresa: clientes, promociones, pagos, usos, reportes |
| `EMPLEADO` | Solo escáner QR y usos registrados |
| `CLIENTE` | Su Pase Digital, establecimientos, historial de actividad |

---

## Tipos de promociones implementadas

| Tipo | Descripción |
|------|-------------|
| `MEMBRESIA` | Plan con N usos en X días (ej. 4 lavados al mes por RD$999) |
| `CONTEO_VISITAS` | Acumula visitas, al llegar a la meta recibe recompensa (ej. 5+1 gratis) |
| `CUPON` | Descuento directo en la próxima visita (uso único) |

---

## Flujo del cliente

1. Entra a la landing → presiona **"Quiero mi Pase Digital"**
2. Elige tipo de establecimiento
3. Elige empresa y promoción disponible
4. Completa su registro
5. Recibe su **Pase Digital QR**
6. Visita el establecimiento y presenta el QR
7. El empleado escanea, valida y confirma el uso
8. El sistema registra la transacción y descuenta usos

---

## Seguridad

- Las contraseñas se hashean con **scrypt** + salt aleatorio por usuario
- Las sesiones usan cookies **httpOnly + sameSite:lax** con TTL de 7 días
- El QR contiene solo un **UUID anónimo**, nunca datos personales
- El aislamiento por empresa está forzado en el backend
- Las rutas del panel interno no están enlazadas desde la landing pública
- `.env` nunca se sube a Git (está en `.gitignore`)
