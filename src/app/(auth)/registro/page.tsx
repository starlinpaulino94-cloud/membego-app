import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegistroPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">Regístrate en PASE Digital</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
