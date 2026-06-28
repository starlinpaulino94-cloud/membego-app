import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold">PASE Digital</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/empresas" className="text-muted-foreground hover:text-foreground">Empresas</Link>
            <Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/registro">Registrarse</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 space-y-8">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Tus promociones, en un solo pase
          </h1>
          <p className="text-lg text-muted-foreground">
            PASE Digital conecta a clientes con las mejores promociones de sus empresas favoritas
            mediante un código QR único y seguro.
          </p>
        </div>

        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/registro">Comenzar gratis</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/faq">Saber más</Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 max-w-3xl w-full mt-12 text-left">
          {[
            { title: 'Pase único', desc: 'Un código QR que centraliza todas tus promociones en una sola app.' },
            { title: 'Validación instantánea', desc: 'Los empleados escanean tu pase y confirman el beneficio en segundos.' },
            { title: 'Historial completo', desc: 'Consulta cada uso, cuándo y dónde, sin perder ni un beneficio.' },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border p-4 space-y-2">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PASE Digital. Todos los derechos reservados.
      </footer>
    </div>
  )
}
