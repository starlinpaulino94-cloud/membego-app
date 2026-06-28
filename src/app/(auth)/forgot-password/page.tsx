import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata = {
  title: 'Recuperar contraseña — PASE Digital',
}

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Recuperar contraseña</h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
          ← Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}
