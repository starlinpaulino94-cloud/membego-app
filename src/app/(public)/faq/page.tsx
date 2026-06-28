import Link from 'next/link'
import { Button } from '@/components/ui/button'

const faqs = [
  {
    q: '¿Qué es PASE Digital?',
    a: 'PASE Digital es una plataforma SaaS que permite a empresas gestionar programas de promociones y fidelización mediante códigos QR únicos por cliente.',
  },
  {
    q: '¿Cómo obtengo mi pase?',
    a: 'Al registrarte en la plataforma, se genera automáticamente tu Pase Digital con un código QR único. Puedes encontrarlo en la sección "Mi Pase" de tu perfil.',
  },
  {
    q: '¿Cómo se valida una promoción?',
    a: 'Presenta tu código QR al empleado de la empresa. El empleado lo escanea, verifica tus promociones activas y confirma el uso. Recibirás un registro inmediato en tu historial.',
  },
  {
    q: '¿Puedo tener varias promociones activas?',
    a: 'Sí. Puedes tener múltiples promociones activas de distintas empresas al mismo tiempo. Cada una se gestiona de forma independiente.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Sí. Usamos Supabase con autenticación segura y cifrado. Los empleados solo ven la información necesaria para validar tus beneficios.',
  },
  {
    q: '¿Cómo mi empresa se une a PASE?',
    a: 'Contacta con nuestro equipo a través del formulario de registro empresarial. Un administrador configurará tu cuenta y podrás empezar a crear promociones de inmediato.',
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">PASE Digital</Link>
          <Button size="sm" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 space-y-8">
        <h1 className="text-3xl font-bold">Preguntas frecuentes</h1>

        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="space-y-2">
              <h2 className="font-semibold text-lg">{faq.q}</h2>
              <p className="text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t">
          <p className="text-muted-foreground mb-4">¿Tienes más preguntas?</p>
          <Button asChild>
            <Link href="/registro">Crear cuenta gratis</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PASE Digital. Todos los derechos reservados.
      </footer>
    </div>
  )
}
