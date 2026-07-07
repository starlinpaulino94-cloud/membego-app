import Link from 'next/link'
import { ArrowRight, QrCode, ShieldCheck, Sparkles } from 'lucide-react'
import type { PlatformStats } from '@/modules/marketplace/queries'

function fmt(n: number) {
  return new Intl.NumberFormat('es-DO').format(n)
}

export function HeroSection({ stats }: { stats: PlatformStats }) {
  // Solo mostramos métricas reales con valor; nada inventado.
  const metrics = [
    { label: 'Empresas afiliadas', value: stats.empresas },
    { label: 'Membresías activas', value: stats.membresiasActivas },
    { label: 'Promociones vigentes', value: stats.promocionesVigentes },
    { label: 'Ciudades', value: stats.ciudades },
  ].filter((m) => m.value > 0)

  return (
    <section className="relative overflow-hidden bg-slate-950">
      {/* Fondo con gradiente de marca + glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-sky-600 to-indigo-800" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-sky-400/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Membresías digitales para tu negocio
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Tus membresías,
              <br />
              <span className="bg-gradient-to-r from-white to-sky-200 bg-clip-text text-transparent">
                digitales y con QR
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-sky-100">
              MembeGo conecta a las mejores empresas con sus clientes: activa tu
              membresía, recibe tu código QR único y disfruta beneficios,
              promociones y planes exclusivos — todo desde tu teléfono.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/empresas"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg shadow-blue-900/20 transition hover:bg-sky-50"
              >
                Explorar empresas
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/promociones"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Ver promociones
              </Link>
            </div>

            {/* Métricas reales */}
            {metrics.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
                {metrics.map((m) => (
                  <div key={m.label}>
                    <div className="text-2xl font-bold sm:text-3xl">{fmt(m.value)}</div>
                    <div className="text-sm text-sky-200">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual: tarjeta de membresía digital */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-3xl bg-white/10 backdrop-blur" />
            <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 shadow-2xl ring-1 ring-white/20">
              <div className="flex items-center justify-between text-white">
                <span className="text-lg font-bold">MembeGo</span>
                <ShieldCheck className="h-6 w-6 text-sky-200" />
              </div>
              <p className="mt-1 text-xs uppercase tracking-widest text-sky-200">
                Membresía digital
              </p>

              <div className="mt-6 flex items-center justify-center rounded-2xl bg-white p-4">
                {/* QR estilizado (decorativo) */}
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, i) => {
                    const on = [0, 1, 2, 4, 5, 7, 9, 10, 12, 14, 15, 18, 20, 21, 22, 24].includes(i)
                    return (
                      <div
                        key={i}
                        className={`h-5 w-5 rounded-sm ${on ? 'bg-slate-900' : 'bg-slate-100'}`}
                      />
                    )
                  })}
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between text-white">
                <div>
                  <p className="text-xs text-sky-200">Titular</p>
                  <p className="font-semibold">Tu nombre</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-sky-200">Plan</p>
                  <p className="font-semibold">Premium</p>
                </div>
              </div>
            </div>

            {/* Chip flotante */}
            <div className="absolute -left-4 top-8 hidden rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-lg sm:flex sm:items-center sm:gap-1.5">
              <QrCode className="h-4 w-4 text-blue-600" /> Válida al instante
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
