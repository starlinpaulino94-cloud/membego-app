// Run once: node scripts/create-superadmin.mjs
// Requires .env with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const EMAIL = 'starlin.eltanquemotors@gmail.com'
const PASSWORD = 'Admin1234!'  // Change after first login

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const prisma = new PrismaClient()

async function main() {
  console.log(`Creating SUPERADMIN: ${EMAIL}`)

  // 1. Create or find Supabase auth user
  const { data: listData } = await supabase.auth.admin.listUsers()
  let authUser = listData?.users?.find(u => u.email === EMAIL)

  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    })
    if (error) { console.error('❌  Supabase error:', error.message); process.exit(1) }
    authUser = data.user
    console.log('✅  Supabase auth user created')
  } else {
    console.log('ℹ️   Supabase auth user already exists')
  }

  // 2. Create or find DB User
  let dbUser = await prisma.user.findUnique({ where: { supabaseId: authUser.id } })
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        supabaseId: authUser.id,
        email: EMAIL,
        name: 'Starlin Admin',
        role: 'SUPERADMIN',
      },
    })
    console.log('✅  DB user created')
  } else {
    await prisma.user.update({ where: { id: dbUser.id }, data: { role: 'SUPERADMIN' } })
    console.log('ℹ️   DB user updated to SUPERADMIN')
  }

  // 3. Set app_metadata
  const { error: metaError } = await supabase.auth.admin.updateUserById(authUser.id, {
    app_metadata: { role: 'SUPERADMIN', dbUserId: dbUser.id },
  })
  if (metaError) { console.error('❌  app_metadata error:', metaError.message); process.exit(1) }
  console.log('✅  app_metadata set')

  console.log('\n🎉  SUPERADMIN listo!')
  console.log(`   Email:    ${EMAIL}`)
  console.log(`   Password: ${PASSWORD}`)
  console.log('   ⚠️  Cambia la contraseña después de iniciar sesión.')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
