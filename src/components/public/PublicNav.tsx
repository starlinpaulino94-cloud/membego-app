'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/empresas', label: 'Explorar empresas' },
  { href: '/promociones', label: 'Promociones' },
]

export function PublicNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="MembeGo" width={32} height={32} priority />
            <span className="text-xl font-bold text-slate-900">MembeGo</span>
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive(l.href) ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Ingresar
            </Link>
            <Link
              href="/empresas"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Registrarse
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-slate-700 md:hidden"
            aria-label="Menú"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="space-y-1 border-t border-slate-200 py-3 md:hidden">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 space-y-2 border-t border-slate-200 pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
              >
                Ingresar
              </Link>
              <Link
                href="/empresas"
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-blue-600 px-3 py-2 text-center font-semibold text-white"
              >
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
