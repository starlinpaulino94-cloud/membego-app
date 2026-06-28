export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { listAllCompanies } from '@/modules/empresas/queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Empresas — PASE Digital',
  description: 'Descubre las empresas disponibles en la plataforma PASE Digital.',
}

export default async function EmpresasPublicasPage() {
  const { items: empresas, total } = await listAllCompanies({ status: 'ACTIVE' })

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">PASE Digital</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/empresas" className="font-medium">Empresas</Link>
            <Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
            <Button size="sm" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 space-y-8 w-full">
        <div>
          <h1 className="text-3xl font-bold">Empresas en PASE</h1>
          <p className="text-muted-foreground mt-1">{total} empresa{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}</p>
        </div>

        {empresas.length === 0 ? (
          <p className="text-muted-foreground">No hay empresas disponibles por el momento.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {empresas.map((empresa) => (
              <Card key={empresa.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{empresa.name}</CardTitle>
                    <Badge variant="outline" className="text-xs shrink-0">{empresa.industry}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {empresa.city && (
                    <p className="text-sm text-muted-foreground">{empresa.city}</p>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/empresas/${empresa.id}`}>Ver empresa</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PASE Digital. Todos los derechos reservados.
      </footer>
    </div>
  )
}
