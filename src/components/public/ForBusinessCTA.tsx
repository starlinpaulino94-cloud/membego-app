import Link from 'next/link'
import { ArrowRight, Store, BarChart3, Users } from 'lucide-react'

const PUNTOS = [
  { icon: Store, texto: 'Publica tu negocio y tus planes de membresía.' },
  { icon: Users, texto: 'Gestiona clientes, pagos y validación por QR.' },
  { icon: BarChart3, texto: 'Mide tu programa de referidos y crece.' },
]

export function ForBusinessCTA() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-blue-900 px-6 py-12 sm:px-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="text-white">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                ¿Tienes un negocio?
              </h2>
              <p className="mt-4 max-w-lg text-lg text-slate-300">
                Convierte a tus clientes en miembros fieles. Ofrece membresías
                digitales, promociones y un programa de referidos que hace crecer
                tu comunidad.
              </p>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Registrar mi empresa
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <ul className="space-y-4">
              {PUNTOS.map((p) => (
                <li
                  key={p.texto}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm text-slate-200">{p.texto}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
