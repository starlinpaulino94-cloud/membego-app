import { prisma } from '@/lib/prisma'

// F4.7: motor de automatizaciones. Reglas basadas en tiempo que generan
// notificaciones a clientes. Sin tablas nuevas: la deduplicación usa un
// marcador único en `href` (si ya existe una notificación con ese href para
// el usuario, la regla no se repite).
// Módulo interno sin 'use server' — se invoca desde una action guarded y
// desde el endpoint de cron protegido.

export interface ResultadoAutomatizaciones {
  cumpleanos: number
  porVencer: number
  inactivos: number
}

/** userIds por supabaseId de clientes (solo los que tienen cuenta). */
async function mapaUserIds(supabaseIds: string[]): Promise<Map<string, string>> {
  if (supabaseIds.length === 0) return new Map()
  const users = await prisma.user.findMany({
    where: { supabaseId: { in: [...new Set(supabaseIds)] } },
    select: { id: true, supabaseId: true },
  })
  return new Map(users.map((u) => [u.supabaseId, u.id]))
}

/** Crea la notificación solo si no existe ya una con ese href para el user. */
async function notificarUnaVez(
  userId: string,
  data: { tipo: 'SISTEMA' | 'MEMBRESIA_POR_VENCER'; titulo: string; mensaje: string; href: string }
): Promise<boolean> {
  const existente = await prisma.notificacion.findFirst({
    where: { userId, href: data.href },
    select: { id: true },
  })
  if (existente) return false
  await prisma.notificacion.create({ data: { userId, ...data } })
  return true
}

/**
 * Ejecuta las 3 reglas de automatización para una empresa. Idempotente:
 * puede correrse cuantas veces se quiera sin duplicar avisos.
 */
export async function ejecutarAutomatizacionesEmpresa(
  companyId: string
): Promise<ResultadoAutomatizaciones> {
  const now = new Date()
  const hoyMes = now.getMonth()
  const hoyDia = now.getDate()
  const anio = now.getFullYear()
  const en7dias = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const hace30dias = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true },
  })
  if (!company) return { cumpleanos: 0, porVencer: 0, inactivos: 0 }

  let cumpleanos = 0
  let porVencer = 0
  let inactivos = 0

  // ── Regla 1: cumpleaños hoy → felicitación (una vez por año) ──────────────
  const conNacimiento = await prisma.cliente.findMany({
    where: { companyId, fechaNacimiento: { not: null } },
    select: { supabaseId: true, fechaNacimiento: true },
  })
  const cumpleaneros = conNacimiento.filter((c) => {
    const f = new Date(c.fechaNacimiento!)
    return f.getMonth() === hoyMes && f.getDate() === hoyDia
  })
  if (cumpleaneros.length > 0) {
    const usuarios = await mapaUserIds(cumpleaneros.map((c) => c.supabaseId))
    for (const c of cumpleaneros) {
      const userId = usuarios.get(c.supabaseId)
      if (!userId) continue
      const creada = await notificarUnaVez(userId, {
        tipo: 'SISTEMA',
        titulo: `¡Feliz cumpleaños! 🎉`,
        mensaje: `${company.name} te desea un excelente día. Revisa tus promociones: puede haber un detalle para ti.`,
        href: `/cliente/promociones?auto=cumple-${anio}`,
      })
      if (creada) cumpleanos++
    }
  }

  // ── Regla 2: membresía por vencer (7 días) → recordatorio ─────────────────
  const proximasAVencer = await prisma.membership.findMany({
    where: {
      companyId,
      estado: 'ACTIVA',
      fechaVencimiento: { gte: now, lte: en7dias },
    },
    select: {
      id: true,
      fechaVencimiento: true,
      cliente: { select: { supabaseId: true } },
    },
  })
  if (proximasAVencer.length > 0) {
    const usuarios = await mapaUserIds(proximasAVencer.map((m) => m.cliente.supabaseId))
    for (const m of proximasAVencer) {
      const userId = usuarios.get(m.cliente.supabaseId)
      if (!userId || !m.fechaVencimiento) continue
      const fechaStr = new Intl.DateTimeFormat('es-DO', { dateStyle: 'long' }).format(
        m.fechaVencimiento
      )
      const marca = m.fechaVencimiento.toISOString().slice(0, 10)
      const creada = await notificarUnaVez(userId, {
        tipo: 'MEMBRESIA_POR_VENCER',
        titulo: 'Tu membresía está por vencer',
        mensaje: `Tu membresía en ${company.name} vence el ${fechaStr}. Renuévala para no perder tus beneficios.`,
        href: `/cliente/pagos?auto=vence-${m.id}-${marca}`,
      })
      if (creada) porVencer++
    }
  }

  // ── Regla 3: sin visitas en 30 días → incentivo (una vez al mes) ──────────
  const inactivosRows = await prisma.cliente.findMany({
    where: {
      companyId,
      memberships: { some: { estado: 'ACTIVA' } },
      visits: { none: { fechaVisita: { gte: hace30dias } } },
    },
    select: { supabaseId: true },
  })
  if (inactivosRows.length > 0) {
    const usuarios = await mapaUserIds(inactivosRows.map((c) => c.supabaseId))
    const mes = String(now.getMonth() + 1).padStart(2, '0')
    for (const c of inactivosRows) {
      const userId = usuarios.get(c.supabaseId)
      if (!userId) continue
      const creada = await notificarUnaVez(userId, {
        tipo: 'SISTEMA',
        titulo: 'Te extrañamos 👋',
        mensaje: `Hace más de 30 días que no visitas ${company.name}. Tu membresía sigue activa: pásate y aprovecha tus beneficios.`,
        href: `/cliente/promociones?auto=inactivo-${anio}-${mes}`,
      })
      if (creada) inactivos++
    }
  }

  return { cumpleanos, porVencer, inactivos }
}

/** Ejecuta las automatizaciones para todas las empresas activas (cron). */
export async function ejecutarAutomatizacionesGlobal(): Promise<
  { companyId: string; resultado: ResultadoAutomatizaciones }[]
> {
  const companies = await prisma.company.findMany({
    where: { isActive: true },
    select: { id: true },
  })
  const resultados = []
  for (const c of companies) {
    try {
      resultados.push({
        companyId: c.id,
        resultado: await ejecutarAutomatizacionesEmpresa(c.id),
      })
    } catch (e) {
      console.error('[automatizaciones] empresa', c.id, e)
    }
  }
  return resultados
}
