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
| Base de datos | SQLite (local) · PostgreSQL (producción) |
| ORM | Prisma 6 |
| Auth | Sesiones custom — scrypt + cookies httpOnly |
| Estado | Zustand |
| QR | `qrcode` (generación) + `html5-qrcode` (escaneo por cámara) |
| Runtime | Bun |

---

## Requisitos previos

- [Bun](https://bun.sh) `>= 1.0`
- Node.js `>= 18` (para Prisma CLI)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPO>
cd pase-digital-qr

# 2. Instalar dependencias
bun install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario (ver sección Variables de entorno)

# 4. Generar el cliente Prisma
bun run db:generate

# 5. Inicializar la base de datos (primera vez)
bun run db:push

# 6. Cargar datos de prueba (opcional)
# Hacer POST a /api/seed desde el navegador o con curl:
curl -X POST http://localhost:3000/api/seed
```

---

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```env
# Base de datos local (SQLite para desarrollo)
DATABASE_URL="file:./db/custom.db"

# Secreto de sesión (usa una cadena larga y aleatoria en producción)
SESSION_SECRET="change-this-to-a-long-random-secret"
```

### Para producción con Supabase PostgreSQL (Fase 2)

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

> El `SESSION_SECRET` no está implementado como variable de entorno en el código actual. La autenticación usa `scrypt` con salt aleatorio por contraseña. Esta variable queda documentada para implementación futura.

---

## Comandos principales

```bash
# Desarrollo
bun run dev          # Inicia en http://localhost:3000

# Base de datos
bun run db:generate  # Genera el cliente Prisma (requiere después de cambiar schema.prisma)
bun run db:push      # Sincroniza el schema con la base de datos (sin migraciones)
bun run db:migrate   # Crea y aplica una migración nueva
bun run db:reset     # Resetea la base de datos (¡destruye datos!)

# Producción (standalone)
bun run build        # Compila el proyecto
bun run start        # Inicia el servidor de producción

# Calidad
bun run lint         # Revisa el código con ESLint
```

---

## Correr localmente

```bash
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

La app usa routing por hash — todo está bajo `/`. Las rutas principales son:

| Hash | Vista |
|------|-------|
| `/` | Landing pública (Pase Digital) |
| `/#registro` | Registro de cliente |
| `/#mi-qr` | Login / panel de cliente |
| `/#admin-login` | Login del panel interno *(no enlazado desde la landing)* |
| `/#admin` | Panel interno *(requiere autenticación)* |

---

## Cuentas de prueba

> Disponibles después de ejecutar el seed (`POST /api/seed`).

| Rol | Email | Contraseña |
|-----|-------|------------|
| Superadmin | `superadmin@fidelix.com` | `admin123` |
| Admin Carwash | `admin.carwash@fidelix.com` | `admin123` |
| Admin Restaurante | `admin.restaurante@fidelix.com` | `admin123` |
| Empleado Carwash | `empleado.carwash@fidelix.com` | `admin123` |
| Cliente | `cliente@fidelix.com` | `cliente123` |

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
User          → Todos los usuarios del sistema (4 roles)
Session       → Sesiones activas
Empresa       → Negocios participantes
TipoNegocio   → Carwash, Restaurante, etc.
Cliente       → Perfil de cliente por empresa
Estrategia    → Definición de una promoción
ClienteEstrategia → Promoción asignada a un cliente
QrToken       → Pase Digital QR único por cliente/empresa
Transaccion   → Historial de usos registrados
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

## Notas importantes sobre la base de datos

- En desarrollo se usa **SQLite** (`db/custom.db`).
- El archivo `db/` está excluido de Git (`db/` en `.gitignore`).
- Cada desarrollador debe inicializar su propia DB con `bun run db:push`.
- Si quieres cargar datos de prueba: `curl -X POST http://localhost:3000/api/seed`

---

## Próximo paso: Producción con Supabase (Fase 2)

Para desplegar en **Vercel**, SQLite no es viable (serverless). La migración planificada es:

1. Crear proyecto en [Supabase](https://supabase.com)
2. Cambiar `provider = "postgresql"` en `prisma/schema.prisma`
3. Actualizar `DATABASE_URL` en Vercel con la connection string de Supabase
4. Ejecutar `prisma migrate deploy` contra la DB de producción
5. Configurar variables de entorno en Vercel

---

## Seguridad

- Las contraseñas se hashean con **scrypt** + salt aleatorio por usuario
- Las sesiones usan cookies **httpOnly + sameSite:lax**
- El QR contiene solo un **UUID anónimo**, nunca datos personales
- El aislamiento por empresa está forzado en el backend: un empleado no puede ver datos de otra empresa
- Las rutas del panel interno no están enlazadas desde la landing pública
