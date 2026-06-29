import Link from 'next/link'
import { Car, UtensilsCrossed, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function EmpresasPage() {
  let companies: Awaited<ReturnType<typeof prisma.company.findMany>> = []
  try {
    companies = await prisma.company.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: { _count: { select: { plans: true } } },
    })
  } catch (err) {
    console.error('[empresas] DB error:', err)
  }

  return (
    <main className="min-h-screen bg-[#0f172a] px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-sky-400 hover:underline">
          ← Volver al inicio
        </Link>
        <h1 className="mt-4 text-4xl font-extrabold">Nuestras empresas</h1>
        <p className="mt-2 text-slate-400">
          Selecciona dónde quieres registrarte.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {companies.map((company) => (
            <div
              key={company.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-sky-500/20">
                {company.type === 'carwash' ? (
                  <Car className="h-7 w-7 text-sky-400" />
                ) : (
                  <UtensilsCrossed className="h-7 w-7 text-amber-400" />
                )}
              </div>
              <h2 className="text-xl font-bold">{company.name}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {company.description}
              </p>
              <Link href={`/registro/${company.slug}`}>
                <Button className="mt-6 w-full bg-sky-500 hover:bg-sky-400">
                  Registrarme <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
          {companies.length === 0 && (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-sky-500/20">
                  <Car className="h-7 w-7 text-sky-400" />
                </div>
                <h2 className="text-xl font-bold">CARTOWN Wash &amp; Detailing</h2>
                <p className="mt-1 text-sm text-slate-400">Car wash premium con membresías digitales</p>
                <Link href="/registro/cartown-wash">
                  <Button className="mt-6 w-full bg-sky-500 hover:bg-sky-400">
                    Registrarme <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/20">
                  <UtensilsCrossed className="h-7 w-7 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold">Toni&apos;s Restaurante</h2>
                <p className="mt-1 text-sm text-slate-400">Restaurante con membresías y beneficios exclusivos</p>
                <Link href="/registro/tonis">
                  <Button className="mt-6 w-full bg-amber-500 hover:bg-amber-400">
                    Registrarme <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
