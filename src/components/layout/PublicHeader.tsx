import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function PublicHeader({ activePath }: { activePath?: string }) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary-foreground">P</span>
          </div>
          <span className="font-semibold text-sm text-foreground">PASE Digital</span>
        </Link>
        <nav className="flex items-center gap-1">
          {[
            { label: 'Empresas', href: '/empresas' },
            { label: 'FAQ', href: '/faq' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activePath === item.href
                  ? 'text-foreground bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button size="sm" asChild>
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </div>
    </header>
  )
}
