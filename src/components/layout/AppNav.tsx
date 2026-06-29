'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { logout } from '@/modules/auth/actions'

export interface NavItem {
  href: string
  label: string
}

export function AppNav({
  items,
  title,
}: {
  items: NavItem[]
  title: string
}) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-[#0f172a]"
          >
            <Sparkles className="h-5 w-5 text-sky-500" />
            {title}
          </Link>
          <nav className="hidden gap-1 md:flex">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-sky-50 text-sky-600'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        </form>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium',
                active ? 'bg-sky-50 text-sky-600' : 'text-slate-600'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
