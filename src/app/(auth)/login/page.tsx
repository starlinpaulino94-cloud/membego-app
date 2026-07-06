import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={<div className="text-slate-400">Cargando...</div>}>
        <LoginForm />
      </Suspense>

      {/* Additional Context */}
      <div className="mt-8 space-y-6">
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-4">¿Aún no tienes cuenta?</p>
          <Link
            href="/empresas"
            className="inline-block bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-400 transition-colors text-sm font-semibold"
          >
            Explorar Empresas
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
          <p className="text-slate-300 text-xs">
            Descubre promociones y beneficios exclusivos antes de registrarte
          </p>
          <Link
            href="/promociones"
            className="text-sky-400 hover:text-sky-300 font-semibold text-xs mt-2 inline-block"
          >
            Ver todas las promociones →
          </Link>
        </div>
      </div>
    </>
  )
}
