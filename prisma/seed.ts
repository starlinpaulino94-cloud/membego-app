import { PrismaClient } from '@prisma/client'
import { SEED_COMPANIES } from '../src/lib/data/companies'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding PASE Digital...')

  for (const company of SEED_COMPANIES) {
    const c = await prisma.company.upsert({
      where: { slug: company.slug },
      update: {
        name: company.name,
        type: company.type,
        description: company.description,
      },
      create: {
        name: company.name,
        slug: company.slug,
        type: company.type,
        description: company.description,
      },
    })

    console.log(`Company: ${c.name} (${c.slug})`)

    for (const plan of company.plans) {
      const existing = await prisma.plan.findFirst({
        where: { companyId: c.id, nombre: plan.nombre },
      })

      if (existing) {
        await prisma.plan.update({
          where: { id: existing.id },
          data: {
            precio: plan.precio,
            lavadosIncluidos: plan.lavadosIncluidos,
            esIlimitado: plan.esIlimitado,
            descripcion: plan.descripcion,
            beneficios: plan.beneficios,
            activo: true,
          },
        })
      } else {
        await prisma.plan.create({
          data: {
            companyId: c.id,
            nombre: plan.nombre,
            precio: plan.precio,
            lavadosIncluidos: plan.lavadosIncluidos,
            esIlimitado: plan.esIlimitado,
            descripcion: plan.descripcion,
            beneficios: plan.beneficios,
          },
        })
      }
      console.log(`  Plan: ${plan.nombre} - RD$${plan.precio}`)
    }
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
