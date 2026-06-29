// Run once: node scripts/create-superadmin.mjs
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Manual .env loader (avoids dotenv ESM issues)
const envPath = resolve(process.cwd(), '.env')
const envContent = readFileSync(envPath, 'utf8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  const key = trimmed.slice(0, idx).trim()
  const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
  if (!process.env[key]) process.env[key] = val
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const EMAIL = 'starlin.eltanquemotors@gmail.com'
const PASSWORD = 'Admin1234!'

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
}

async function adminFetch(path, method = 'GET', body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || data.error || JSON.stringify(data))
  return data
}

const prisma = new PrismaClient()

async function main() {
  console.log(`\nCreating SUPERADMIN: ${EMAIL}\n`)

  // 1. List users and find by email
  const { users } = await adminFetch('/users?per_page=1000')
  let authUser = users?.find(u => u.email === EMAIL)

  if (!authUser) {
    authUser = await adminFetch('/users', 'POST', {
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    })
    console.log('✅  Supabase auth user created')
  } else {
    console.log('ℹ️   Supabase auth user already exists:', authUser.id)
  }

  // 2. Create or update DB User
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
  await adminFetch(`/users/${authUser.id}`, 'PUT', {
    app_metadata: { role: 'SUPERADMIN', dbUserId: dbUser.id },
  })
  console.log('✅  app_metadata set')

  console.log('\n🎉  SUPERADMIN listo!')
  console.log(`   Email:    ${EMAIL}`)
  console.log(`   Password: ${PASSWORD}`)
  console.log('   ⚠️  Cambia la contraseña después de iniciar sesión.\n')
}

main().catch(e => { console.error('❌', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
