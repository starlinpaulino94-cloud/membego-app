import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { CompanyRegistroHeader } from '@/components/auth/CompanyRegistroHeader'

export const dynamic = 'force-dynamic'

export default async function RegistroPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { companySlug } = await params
  const { ref } = await searchParams

  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
  })

  if (!company || !company.isActive) notFound()

  return (
    <>
      <CompanyRegistroHeader
        name={company.name}
        logoUrl={company.logoUrl}
        bannerUrl={company.bannerUrl}
        colorPrimario={company.colorPrimario}
        referido={!!ref}
      />
      <RegisterForm
        companySlug={company.slug}
        companyName={company.name}
        isCarwash={company.type === 'carwash'}
        colorPrimario={company.colorPrimario}
      />
    </>
  )
}
