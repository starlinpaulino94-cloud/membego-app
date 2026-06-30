import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { SEED_COMPANIES } from '../src/lib/data/companies'

const prisma = new PrismaClient()

// Cliente admin de Supabase (usa service role key) para crear usuarios de auth.
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno. ' +
        'Cópialas desde Supabase → Settings → API.'
    )
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Usuarios de prueba a crear en Supabase Auth + en la BD.
// Las contraseñas son para desarrollo; cámbialas en producción.
const SEED_USERS = [
  {
    email: 'superadmin@pasedigital.com',
    password: 'admin123',
    nombre: 'Super Admin',
    role: 'SUPERADMIN',
    companySlug: null, // sin empresa
  },
  {
    email: 'admin.cartown@pasedigital.com',
    password: 'admin123',
    nombre: 'Carlos Lavado',
    role: 'ADMIN_EMPRESA',
    companySlug: 'cartown',
  },
  {
    email: 'admin.tonis@pasedigital.com',
    password: 'admin123',
    nombre: 'María Sabor',
    role: 'ADMIN_EMPRESA',
    companySlug: 'tonis',
  },
  {
    email: 'empleado.cartown@pasedigital.com',
    password: 'admin123',
    nombre: 'Juan Esponja',
    role: 'EMPLEADO',
    companySlug: 'cartown',
  },
  {
    email: 'cliente@pasedigital.com',
    password: 'cliente123',
    nombre: 'Pedro Cliente',
    role: 'CLIENTE',
    companySlug: 'cartown',
    vehiculo: { marca: 'Toyota', modelo: 'Corolla', anio: 2021, color: 'Blanco', placa: 'A123456' },
  },
] as const

async function upsertAuthUser(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  u: { email: string; password: string; nombre: string }
) {
  // Buscar si ya existe por email (listUsers devuelve hasta 1000 por página)
  const { data: existing } = await supabaseAdmin.auth.admin.listUsers()
  const found = existing?.users?.find((x) => x.email === u.email)

  let userId: string
  if (found) {
    // Actualizar password y metadata
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(found.id, {
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.nombre },
    })
    if (error) throw new Error(`updateUserById ${u.email}: ${error.message}`)
    userId = data.user!.id
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.nombre },
    })
    if (error) throw new Error(`createUser ${u.email}: ${error.message}`)
    userId = data.user!.id
  }
  return userId
}

async function main() {
  console.log('🌱 Seeding PASE Digital...\n')
  const supabaseAdmin = createAdminClient()

  // 1. Upsert de empresas y planes en la BD
  const companiesBySlug: Record<string, { id: string; name: string; type: string }> = {}
  for (const company of SEED_COMPANIES) {
    const c = await prisma.company.upsert({
      where: { slug: company.slug },
      update: {
        name: company.name,
        type: company.type,
        description: company.description,
        isActive: true,
      },
      create: {
        name: company.name,
        slug: company.slug,
        type: company.type,
        description: company.description,
      },
    })
    companiesBySlug[company.slug] = { id: c.id, name: c.name, type: c.type }
    console.log(`🏢 Empresa: ${c.name} (${c.slug})`)

    for (const plan of company.plans) {
      const existing = await prisma.plan.findFirst({
        where: { companyId: c.id, nombre: plan.nombre },
      })
      const data = {
        precio: plan.precio,
        lavadosIncluidos: plan.lavadosIncluidos,
        esIlimitado: plan.esIlimitado,
        descripcion: plan.descripcion,
        beneficios: plan.beneficios,
        activo: true,
      }
      if (existing) {
        await prisma.plan.update({ where: { id: existing.id }, data })
      } else {
        await prisma.plan.create({ data: { companyId: c.id, nombre: plan.nombre, ...data } })
      }
      console.log(`   📋 Plan: ${plan.nombre} — RD$${plan.precio}`)
    }
  }

  // 2. Upsert de usuarios en Supabase Auth + en la BD
  console.log('\n👥 Usuarios de prueba:')
  for (const u of SEED_USERS) {
    const supabaseId = await upsertAuthUser(supabaseAdmin, u)
    const companyId = u.companySlug ? companiesBySlug[u.companySlug]?.id : null

    // Upsert en tabla users (vinculada por supabaseId)
    const dbUser = await prisma.user.upsert({
      where: { supabaseId },
      update: { email: u.email, name: u.nombre, role: u.role, companyId },
      create: { supabaseId, email: u.email, name: u.nombre, role: u.role, companyId },
    })

    // Si es CLIENTE, crear perfil de cliente + QR + vehículo
    let clienteId: string | null = null
    if (u.role === 'CLIENTE' && companyId) {
      const cliente = await prisma.cliente.upsert({
        where: { supabaseId_companyId: { supabaseId, companyId } },
        update: { nombre: u.nombre, email: u.email },
        create: { companyId, supabaseId, nombre: u.nombre, email: u.email },
      })
      clienteId = cliente.id

      // Asegurar QR token
      const existingQr = await prisma.qrToken.findFirst({ where: { clienteId: cliente.id } })
      if (!existingQr) {
        await prisma.qrToken.create({ data: { clienteId: cliente.id } })
      }

      // Vehículo (si viene en el seed y es carwash)
      if ('vehiculo' in u && u.vehiculo) {
        const existingVeh = await prisma.vehiculo.findFirst({
          where: { clienteId: cliente.id, placa: u.vehiculo.placa ?? null },
        })
        if (!existingVeh) {
          await prisma.vehiculo.create({ data: { clienteId: cliente.id, ...u.vehiculo } })
        }
      }
    }

    // Actualizar app_metadata en Supabase para que el middleware sepa el rol
    await supabaseAdmin.auth.admin.updateUserById(supabaseId, {
      app_metadata: {
        role: u.role,
        dbUserId: dbUser.id,
        clienteId,
        companyId,
      },
    })

    console.log(`   ✅ ${u.email} / ${u.password}  (${u.role})`)
  }

  console.log('\n✅ Seed completo.')
  console.log('\n📋 Cuentas de prueba:')
  console.log('   superadmin@pasedigital.com / admin123')
  console.log('   admin.cartown@pasedigital.com / admin123')
  console.log('   admin.tonis@pasedigital.com / admin123')
  console.log('   empleado.cartown@pasedigital.com / admin123')
  console.log('   cliente@pasedigital.com / cliente123')
}

main()
  .catch((e) => {
    console.error('❌ Seed falló:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
