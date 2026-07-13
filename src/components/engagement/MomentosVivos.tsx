'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Gift, Clock, Users, ArrowRight, Sparkles } from 'lucide-react'
import type { Momento, MomentosVivos as Data } from '@/modules/engagement/momentos'

const emptySubscribe = () => () => {}
const pad = (n: number) => n.toString().padStart(2, '0')

/** Contador compacto en vivo (SSR-safe: server render estable, cliente anima). */
function ContadorCompacto({ expiraEn }: { expiraEn: string }) {
  const target = new Date(expiraEn).getTime()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const [ms, setMs] = useState(() => Math.max(0, target - Date.now()))

  useEffect(() => {
    const id = setInterval(() => setMs(Math.max(0, target - Date.now())), 1000)
    return () => clearInterval(id)
  }, [target])

  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const bloques = d > 0 ? [{ v: d, t: 'd' }, { v: h, t: 'h' }, { v: m, t: 'm' }] : [{ v: h, t: 'h' }, { v: m, t: 'm' }, { v: sec, t: 's' }]

  return (
    <div className="flex items-center gap-1.5" aria-label={mounted ? undefined : 'placeholder'}>
      {bloques.map((b, i) => (
        <div key={i} className="flex items-baseline gap-0.5">
          <span className="rounded-md bg-white/25 px-1.5 py-0.5 font-mono text-sm font-bold tabular-nums text-white">
            {pad(b.v)}
          </span>
          <span className="text-[10px] font-semibold text-white/70">{b.t}</span>
        </div>
      ))}
    </div>
  )
}

/** Tarjeta viva individual. Colores y contenido según el tipo de momento. */
function TarjetaMomento({ m, delay }: { m: Momento; delay: string }) {
  if (m.tipo === 'REGALO') {
    return (
      <div
        className={`animate-fade-up ${delay} relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-glow`}
      >
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <span className="animate-float flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-inset ring-white/30">
          <Gift className="h-6 w-6" />
        </span>
        <div className="relative min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
            🎁 Beneficio disponible
          </p>
          <p className="truncate text-sm font-bold">{m.titulo}</p>
          <p className="text-xs text-white/80">
            {m.usosRestantes} uso{m.usosRestantes !== 1 ? 's' : ''} listo{m.usosRestantes !== 1 ? 's' : ''} para presentar tu QR
          </p>
        </div>
        <Link
          href={`/cliente/mis-promociones/${m.compraId}`}
          className="animate-pulse-soft relative shrink-0 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-md transition hover:scale-105"
        >
          Usar ahora
        </Link>
      </div>
    )
  }

  if (m.tipo === 'VENCE') {
    return (
      <div
        className={`animate-fade-up ${delay} relative flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white shadow-glow`}
      >
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-inset ring-white/30">
          <Clock className="h-6 w-6" />
        </span>
        <div className="relative min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
            ⏰ ¡No lo pierdas!
          </p>
          <p className="truncate text-sm font-bold">{m.titulo} vence pronto</p>
          <div className="mt-1">
            <ContadorCompacto expiraEn={m.expiraEn} />
          </div>
        </div>
        <Link
          href={`/cliente/mis-promociones/${m.compraId}`}
          className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-orange-700 shadow-md transition hover:scale-105"
        >
          Usar ahora
        </Link>
      </div>
    )
  }

  // INVITA
  const conRegistros = m.registrados > 0
  return (
    <div
      className={`animate-fade-up ${delay} relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-4 text-white shadow-glow`}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-inset ring-white/30">
        <Users className="h-6 w-6" />
      </span>
      <div className="relative min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
          🎯 Invita y gana
        </p>
        <p className="truncate text-sm font-bold">
          {conRegistros
            ? `Ya invitaste a ${m.registrados} ${m.registrados === 1 ? 'persona' : 'personas'}`
            : 'Invita a un amigo y ambos ganan'}
        </p>
        <p className="text-xs text-white/80">
          {conRegistros ? '¡Sigue sumando! No hay límite.' : 'Comparte tu enlace y gana beneficios.'}
        </p>
      </div>
      <Link
        href="/cliente/invita-y-gana"
        className="flex shrink-0 items-center gap-1 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-700 shadow-md transition hover:scale-105"
      >
        Invitar <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

const DELAYS = ['', 'delay-100', 'delay-200'] as const

/**
 * Franja de "momentos vivos" del Home: saludo personalizado + tarjetas con
 * urgencia y recompensa (datos reales). Es la primera impresión del Home.
 */
export function MomentosVivos({ nombre, momentos }: Data) {
  if (momentos.length === 0) return null

  return (
    <section className="mb-8 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4.5 w-4.5 text-primary" />
        <h2 className="text-base font-bold text-foreground">
          {nombre ? `Hola de nuevo, ${nombre}` : 'Tu momento MembeGo'}
        </h2>
      </div>
      <div className="grid gap-3">
        {momentos.map((m, i) => (
          <TarjetaMomento key={`${m.tipo}-${i}`} m={m} delay={DELAYS[i % DELAYS.length]} />
        ))}
      </div>
    </section>
  )
}
