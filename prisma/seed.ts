import { PrismaClient } from '@prisma/client'
import { runSeed } from '../src/lib/seed'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding PASE Digital...\n')
  const result = await runSeed()
  console.log(`\n✅ Seed completo:`)
  console.log(`   Empresas: ${result.companies}`)
  console.log(`   Planes nuevos: ${result.plans}`)
  console.log(`   Usuarios: ${result.users}`)
  console.log(`   Clientes: ${result.clientes}`)
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
