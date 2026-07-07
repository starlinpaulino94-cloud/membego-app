import { Store, QrCode, TrendingUp, Users } from 'lucide-react'
import { RegistroEmpresaForm } from '@/components/public/RegistroEmpresaForm'

export const metadata = {
  title: 'Registra tu empresa - MembeGo',
  description:
    'Crea el perfil de tu negocio en MembeGo: membresías digitales con QR, promociones y una comunidad de seguidores.',
}

const BENEFICIOS = [
  {
    icon: QrCode,
    titulo: 'Membresías digitales con QR',
    texto: 'Tus clientes llevan su membresía en el teléfono y la validas al instante.',
  },
  {
    icon: Users,
    titulo: 'Comunidad de seguidores',
    texto: 'Tus promociones y novedades llegan automáticamente a quienes te siguen.',
  },
  {
    icon: TrendingUp,
    titulo: 'Panel completo de crecimiento',
    texto: 'CRM, campañas, automatizaciones, estadísticas y recomendaciones.',
  },
]

export default function RegistroEmpresaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-sky-600 to-indigo-800 py-14">
        <div className="absolute -top-16 right-10 h-56 w-56 rounded-full bg-sky-400/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-white sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-sky-100 ring-1 ring-inset ring-white/20">
            <Store className="h-4 w-4" /> Para negocios
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Registra tu empresa en MembeGo
          </h1>
          <p className="mt-2 max-w-xl text-lg text-sky-100">
            Crea tu cuenta en un minuto. Después te guiamos paso a paso para
            completar tu perfil, crear tu primer plan y tu primera promoción.
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Beneficios */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Qué obtienes
            </h2>
            {BENEFICIOS.map((b) => (
              <div key={b.titulo} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white">
                  <b.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{b.titulo}</h3>
                  <p className="mt-1 text-sm text-slate-600">{b.texto}</p>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              <p className="font-medium text-slate-800">Cómo funciona el proceso</p>
              <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>Creas tu cuenta y tu empresa (1 minuto).</li>
                <li>Completas tu perfil guiado: logo, banner, ubicación, categorías.</li>
                <li>Creas tu primer plan y tu primera promoción.</li>
                <li>Publicas tu empresa y apareces en el marketplace.</li>
              </ol>
            </div>
          </div>

          {/* Formulario */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <RegistroEmpresaForm />
          </div>
        </div>
      </section>
    </div>
  )
}
