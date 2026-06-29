import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
