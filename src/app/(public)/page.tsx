import Link from 'next/link'
import { Car, UtensilsCrossed, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SEED_COMPANIES } from '@/lib/data/companies'

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-DO').format(n)
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      {/* Nav */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-6 w-6 text-sky-400" />
            PASE Digital
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/empresas">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Empresas
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-sky-500 hover:bg-sky-400">
                Iniciar sesión
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <Badge className="mb-6 bg-sky-500/20 text-sky-300 hover:bg-sky-500/20">
          Membresías digitales
        </Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
          Una membresía, beneficios sin límites
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Elige tu plan en CARTOWN Wash & Detailing o Toni&apos;s Restaurante.
          Lleva tu código QR siempre contigo y disfruta cada visita.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/empresas">
            <Button size="lg" className="bg-sky-500 hover:bg-sky-400">
              Ver empresas
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              Ya soy miembro
            </Button>
          </Link>
        </div>
      </section>

      {/* Companies & Plans */}
      {SEED_COMPANIES.map((company) => (
        <section key={company.slug} className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-500/20">
              {company.type === 'carwash' ? (
                <Car className="h-7 w-7 text-sky-400" />
              ) : (
                <UtensilsCrossed className="h-7 w-7 text-amber-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{company.name}</h2>
              <p className="text-slate-400">{company.description}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {company.plans.map((plan) => (
              <div
                key={plan.nombre}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-sky-400/50"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{plan.nombre}</h3>
                  {plan.esIlimitado && (
                    <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/20">
                      Ilimitado
                    </Badge>
                  )}
                </div>
                <p className="mb-4 text-3xl font-extrabold">
                  RD${formatPrice(plan.precio)}
                  <span className="text-base font-normal text-slate-400">
                    /mes
                  </span>
                </p>
                <ul className="mb-6 flex-1 space-y-2">
                  {plan.beneficios.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-sm text-slate-300"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link href={`/registro/${company.slug}`}>
                  <Button className="w-full bg-sky-500 hover:bg-sky-400">
                    Registrarme
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-16 border-t border-white/10 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} PASE Digital. Todos los derechos
        reservados.
      </footer>
    </main>
  )
}
