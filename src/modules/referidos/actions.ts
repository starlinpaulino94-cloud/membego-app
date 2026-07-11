/**
 * Módulo interno de servidor (sin 'use server'). `procesarReferidoCompletado`
 * otorga recompensas de referido y solo debe llamarse server-to-server desde un
 * flujo ya autorizado (activación de membresía). `getClienteReferidos` se invoca
 * desde un Server Component. Ninguna de las dos debe ser un endpoint público.
 */

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { logReferralEvent, PUNTOS, TIPOS_EMPRESA, TIPOS_GLOBAL } from '@/lib/referidos'
import { emitirEventoEstrategia } from '@/modules/estrategias/eventos'
import { crearTransaccionAplicada } from '@/lib/transactions'

/**
 * Fase E6: conversión del referido en su PRIMERA compra confirmada — membresía
 * (origen 'MEMBRESIA') o promoción E5 (origen 'COMPRA'). Reglas:
 * - Un vínculo `sospechoso` NUNCA convierte ni empuja recompensas; genera un
 *   evento FRAUDE auditable en su lugar.
 * - La completación es atómica (guard PENDIENTE) y queda como eventos reales:
 *   COMPRA (+MEMBRESIA si aplica) enlazados al referido concreto.
 * - Las recompensas salen de ReglaRecompensa (umbral >=, sin pérdidas) y se
 *   registran en referral_recompensas con estado real.
 */
export async function procesarReferidoCompletado(
  clienteId: string,
  companyId: string,
  opts: { origen?: 'MEMBRESIA' | 'COMPRA'; monto?: number } = {}
) {
  const origen = opts.origen ?? 'MEMBRESIA'
  // Centro global MembeGo: si este cliente llegó referido desde OTRA empresa,
  // el referente gana los puntos globales de membresía (una sola vez).
  if (origen === 'MEMBRESIA') await procesarMembresiaGlobal(clienteId).catch(() => {})

  try {
    const referido = await prisma.referido.findUnique({
      where: { referidoClienteId: clienteId },
      include: { referenteCliente: { select: { nombre: true } } },
    })
    if (!referido || referido.companyId !== companyId) return

    if (referido.sospechoso) {
      // El antifraude aplica en TODAS las etapas (antes solo en el registro):
      // sin puntos, sin COMPLETADO, sin recompensa — pero auditado.
      await logReferralEvent({
        clienteId: referido.referenteClienteId,
        companyId,
        tipo: 'FRAUDE',
        referidoClienteId: clienteId,
        meta: { motivo: 'conversion_bloqueada_vinculo_sospechoso', origen },
      })
      return
    }
    if (referido.estado !== 'PENDIENTE') return

    // Guard atómico anti doble-conversión (dos activaciones concurrentes).
    const upd = await prisma.referido.updateMany({
      where: { id: referido.id, estado: 'PENDIENTE' },
      data: { estado: 'COMPLETADO', completadoEn: new Date() },
    })
    if (upd.count === 0) return

    // Eventos reales del embudo, enlazados al referido concreto.
    await logReferralEvent({
      clienteId: referido.referenteClienteId,
      companyId,
      tipo: 'COMPRA',
      referidoClienteId: clienteId,
      meta: { origen, ...(opts.monto != null ? { monto: opts.monto } : {}) },
      // La conversión vale 200 pts: van en MEMBRESIA si el origen es membresía
      // (semántica histórica) o en COMPRA si convirtió con una promoción.
      puntos: origen === 'COMPRA' ? PUNTOS.MEMBRESIA : 0,
    })
    if (origen === 'MEMBRESIA') {
      await logReferralEvent({
        clienteId: referido.referenteClienteId,
        companyId,
        tipo: 'MEMBRESIA',
        referidoClienteId: clienteId,
      })
    }

    await prisma.auditLog.create({
      data: {
        companyId,
        accion: 'REFERIDO_COMPLETADO',
        entidadTipo: 'Referido',
        entidadId: referido.id,
        payload: {
          referenteClienteId: referido.referenteClienteId,
          referidoClienteId: clienteId,
          origen,
          ...(opts.monto != null ? { monto: opts.monto } : {}),
        },
      },
    })

    // Bus de estrategias: la conversión ahora SÍ se emite (antes solo existía
    // el evento de registro; el journey de automatizaciones quedaba a ciegas).
    await emitirEventoEstrategia({
      companyId,
      type: 'referido.convirtio',
      subjectId: referido.referenteClienteId,
      payload: {
        cliente: { nombre: referido.referenteCliente.nombre },
        referido: { clienteId, origen, monto: opts.monto ?? null },
      },
    }).catch(() => {})

    await evaluarRecompensas(referido.referenteClienteId, companyId)
  } catch (e) {
    console.error('[referidos] procesarReferidoCompletado error:', e)
  }
}

/**
 * Otorga el evento MEMBRESIA_GLOBAL al referente global (si existe una
 * atribución REGISTRO_GLOBAL para este cliente y aún no se contó su membresía).
 */
async function procesarMembresiaGlobal(referidoClienteId: string) {
  const registroGlobal = await prisma.referralEvent.findFirst({
    where: {
      tipo: 'REGISTRO_GLOBAL',
      meta: { path: ['referidoClienteId'], equals: referidoClienteId },
    },
    orderBy: { createdAt: 'asc' },
  })
  if (!registroGlobal) return

  const yaContada = await prisma.referralEvent.findFirst({
    where: {
      tipo: 'MEMBRESIA_GLOBAL',
      meta: { path: ['referidoClienteId'], equals: referidoClienteId },
    },
    select: { id: true },
  })
  if (yaContada) return

  const meta = (registroGlobal.meta ?? {}) as Record<string, unknown>
  await logReferralEvent({
    clienteId: registroGlobal.clienteId,
    companyId: registroGlobal.companyId,
    tipo: 'MEMBRESIA_GLOBAL',
    meta: {
      global: true,
      referidoClienteId,
      ...(typeof meta.targetCompanyId === 'string'
        ? { targetCompanyId: meta.targetCompanyId }
        : {}),
    },
    // Si el registro fue marcado sospechoso, la membresía tampoco puntúa.
    ...(meta.sospechoso ? { puntos: 0 } : {}),
  })
}

/**
 * Fase E6: evalúa las reglas activas y otorga recompensas con REGISTRO real.
 * - Umbral `>=` (antes igualdad exacta: si el conteo saltaba el número, la
 *   recompensa se perdía en silencio).
 * - Solo cuentan referidos COMPLETADOS legítimos (sospechoso:false).
 * - Cada regla alcanzada crea UNA fila en referral_recompensas (unique por
 *   referente+regla → sin dobles entregas bajo concurrencia).
 * - Estados reales: ENTREGADA (efecto aplicado) o PENDIENTE (entrega manual:
 *   descuentos, o usos sin membresía activa donde aplicarlos).
 * - Cada entrega genera: transacción oficial (Transaction Engine, REFERRAL),
 *   evento RECOMPENSA, auditoría y notificación.
 */
async function evaluarRecompensas(referenteClienteId: string, companyId: string) {
  const completados = await prisma.referido.count({
    where: { companyId, referenteClienteId, estado: 'COMPLETADO', sospechoso: false },
  })
  if (completados === 0) return

  const reglas = await prisma.reglaRecompensa.findMany({
    where: {
      companyId,
      activo: true,
      condicion: 'N_REFERIDOS_COMPLETADOS',
      valorCondicion: { lte: completados },
    },
  })
  if (reglas.length === 0) return

  const referente = await prisma.cliente.findUnique({
    where: { id: referenteClienteId },
    include: { company: { select: { name: true, zonaHoraria: true } } },
  })
  if (!referente) return

  const referenteUser = await prisma.user.findUnique({
    where: { supabaseId: referente.supabaseId },
    select: { id: true },
  })

  const notificacionesACrear = []

  for (const regla of reglas) {
    const valor = Number(regla.valorRecompensa)
    if (!Number.isFinite(valor)) {
      console.error('[referidos] Invalid valorRecompensa:', regla.valorRecompensa)
      continue
    }

    // Descripción legible de la recompensa (para registro, ticket y aviso).
    const descripcion =
      regla.tipoRecompensa === 'LAVADOS_GRATIS'
        ? `${valor} uso${valor !== 1 ? 's' : ''} gratis`
        : regla.tipoRecompensa === 'DESCUENTO_PORCENTAJE'
          ? `${valor}% de descuento`
          : `RD$${valor} de descuento`

    // Entrega tangible solo para usos gratis con membresía ACTIVA; el resto
    // queda PENDIENTE hasta que el negocio la aplique (estado real, no un
    // mensaje al vacío).
    let estado: 'ENTREGADA' | 'PENDIENTE' = 'PENDIENTE'
    let mensaje = ''
    if (regla.tipoRecompensa === 'LAVADOS_GRATIS') {
      const activa = await prisma.membership.findUnique({
        where: { clienteId_companyId: { clienteId: referenteClienteId, companyId } },
      })
      if (activa && activa.estado === 'ACTIVA') {
        estado = 'ENTREGADA'
        mensaje = `¡Ganaste ${descripcion} por tus referidos! Ya se aplicaron a tu membresía.`
      } else {
        mensaje = `¡Ganaste ${descripcion} por tus referidos! Se aplicarán cuando actives tu membresía.`
      }
    } else {
      mensaje = `¡Ganaste ${descripcion} por tus referidos! El negocio la tiene registrada como pendiente de aplicar.`
    }

    // Registro real de la recompensa. El unique (referente, regla) hace la
    // creación idempotente: si otra conversión concurrente ya la otorgó, se
    // salta sin duplicar.
    let recompensaId: string
    try {
      const creada = await prisma.referralRecompensa.create({
        data: {
          companyId,
          referenteClienteId,
          reglaId: regla.id,
          estado,
          tipo: regla.tipoRecompensa,
          valor,
          descripcion,
          umbral: regla.valorCondicion,
          completadosAlOtorgar: completados,
          entregadaAt: estado === 'ENTREGADA' ? new Date() : null,
        },
      })
      recompensaId = creada.id
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') continue
      throw e
    }

    // Efecto tangible (después de asegurar la fila: sin fila no hay efecto).
    if (estado === 'ENTREGADA') {
      await prisma.membership.updateMany({
        where: { clienteId: referenteClienteId, companyId, estado: 'ACTIVA' },
        data: { lavadosRestantes: { increment: valor } },
      })
    }

    // Transacción oficial (Transaction Engine): la recompensa es una operación
    // auditable con TX-ID, como cualquier otra del sistema.
    await crearTransaccionAplicada(prisma, {
      tipo: 'REFERRAL',
      companyId,
      clienteId: referenteClienteId,
      snapshot: {
        cliente: referente.nombre,
        empresa: referente.company.name,
        servicio: `Recompensa por referidos: ${descripcion}`,
        restantes: undefined,
      },
      auditoria: { origen: 'referral_engine', reglaId: regla.id, recompensaId },
      resultado: `Umbral: ${regla.valorCondicion} referidos completados (${completados} al otorgar)`,
      timeZone: referente.company.zonaHoraria,
      userId: null,
    }).catch((e) => console.error('[referidos] tx recompensa:', e))

    // Evento del embudo + auditoría + notificación.
    await logReferralEvent({
      clienteId: referenteClienteId,
      companyId,
      tipo: 'RECOMPENSA',
      meta: { reglaId: regla.id, recompensaId, descripcion, estado },
    })
    await prisma.auditLog.create({
      data: {
        companyId,
        accion: 'RECOMPENSA_OTORGADA',
        entidadTipo: 'ReferralRecompensa',
        entidadId: recompensaId,
        payload: { referenteClienteId, reglaId: regla.id, completados, estado, descripcion },
      },
    })
    if (referenteUser) {
      notificacionesACrear.push({
        userId: referenteUser.id,
        tipo: 'RECOMPENSA_REFERIDO' as const,
        titulo: '¡Recompensa por referidos!',
        mensaje,
        href: '/cliente/referidos',
      })
    }
  }

  if (notificacionesACrear.length > 0) {
    await prisma.notificacion.createMany({
      data: notificacionesACrear,
    }).catch((e) => {
      console.error('[referidos-notifications]', e)
    })
  }

  // Compatibilidad con vistas existentes: el booleano legacy se mantiene,
  // pero la fuente de verdad de recompensas es referral_recompensas.
  await prisma.referido.updateMany({
    where: { companyId, referenteClienteId, estado: 'COMPLETADO', sospechoso: false, recompensaAplicada: false },
    data: { recompensaAplicada: true },
  })
}

export async function getClienteReferidos(clienteId: string) {
  return prisma.referido.findMany({
    where: { referenteClienteId: clienteId },
    include: { referidoCliente: { select: { nombre: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
}

export interface ReferidosDashboard {
  stats: {
    compartidos: number
    clicks: number
    registros: number
    membresias: number
    conversionPct: number // membresías / clics
    recompensas: number
    puntos: number
  }
  historial: {
    id: string
    nombre: string
    fecha: Date
    estado: 'REGISTRADO' | 'MEMBRESIA_ACTIVA' | 'RECOMPENSA_ENTREGADA'
  }[]
  ranking: { posicion: number; nombre: string; puntos: number; esYo: boolean }[]
  miPosicion: number | null
  /** Retos activos de la empresa (reglas de recompensa) con progreso. */
  retos: {
    id: string
    nombre: string
    meta: number
    progreso: number
    recompensa: string
  }[]
  /** Centro global MembeGo (suma de todas tus cuentas). */
  global: { puntos: number; registros: number; membresias: number }
}

const RECOMPENSA_LABEL: Record<string, string> = {
  LAVADOS_GRATIS: 'usos gratis',
  DESCUENTO_PORCENTAJE: '% de descuento',
  DESCUENTO_MONTO: 'RD$ de descuento',
}

/**
 * Panel completo de referidos del cliente: embudo (compartidos → clics →
 * registros → membresías), puntos, historial con estados y ranking de la
 * empresa (aislado por companyId). Server-only.
 */
export async function getReferidosDashboard(
  clienteId: string,
  companyId: string,
  supabaseId: string
): Promise<ReferidosDashboard> {
  const [eventos, referidos, topRaw, reglas, misClientes] = await Promise.all([
    prisma.referralEvent.groupBy({
      by: ['tipo'],
      where: { clienteId, companyId, tipo: { in: TIPOS_EMPRESA } },
      _count: { _all: true },
      _sum: { puntos: true },
    }),
    prisma.referido.findMany({
      where: { referenteClienteId: clienteId, companyId },
      include: { referidoCliente: { select: { nombre: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.referralEvent.groupBy({
      by: ['clienteId'],
      where: { companyId, tipo: { in: TIPOS_EMPRESA } },
      _sum: { puntos: true },
      orderBy: { _sum: { puntos: 'desc' } },
      take: 50,
    }),
    prisma.reglaRecompensa.findMany({
      where: { companyId, activo: true },
      orderBy: { valorCondicion: 'asc' },
    }),
    prisma.cliente.findMany({
      where: { supabaseId },
      select: { id: true },
    }),
  ])

  // Centro global MembeGo: eventos globales de TODAS tus cuentas.
  const globalAgg = await prisma.referralEvent.groupBy({
    by: ['tipo'],
    where: {
      clienteId: { in: misClientes.map((c) => c.id) },
      tipo: { in: TIPOS_GLOBAL },
    },
    _count: { _all: true },
    _sum: { puntos: true },
  })

  const byTipo = new Map(eventos.map((e) => [e.tipo, e]))
  const compartidos = byTipo.get('SHARE')?._count._all ?? 0
  const clicks = byTipo.get('CLICK')?._count._all ?? 0
  // Registros/membresías: la fuente autoritativa son las filas de Referido, pero
  // SOLO las legítimas. Las sospechosas (autoreferido / huella repetida) se
  // conservan para auditoría pero no inflan el embudo ni la conversión.
  const legitimos = referidos.filter((r) => !r.sospechoso)
  const registros = legitimos.length
  const membresias = legitimos.filter((r) => r.estado === 'COMPLETADO').length
  const recompensas = legitimos.filter((r) => r.recompensaAplicada).length
  const puntos = eventos.reduce((acc, e) => acc + (e._sum.puntos ?? 0), 0)
  const conversionPct = clicks > 0 ? Math.round((membresias / clicks) * 100) : 0

  // Ranking de la empresa (top 5 + posición propia), con nombres.
  const top5 = topRaw.slice(0, 5)
  const nombres = await prisma.cliente.findMany({
    where: { id: { in: top5.map((t) => t.clienteId) } },
    select: { id: true, nombre: true },
  })
  const nombreDe = new Map(nombres.map((n) => [n.id, n.nombre]))
  const ranking = top5.map((t, i) => ({
    posicion: i + 1,
    nombre: nombreDe.get(t.clienteId) ?? 'Cliente',
    puntos: t._sum.puntos ?? 0,
    esYo: t.clienteId === clienteId,
  }))
  const idx = topRaw.findIndex((t) => t.clienteId === clienteId)
  const miPosicion = idx >= 0 ? idx + 1 : null

  const globalPorTipo = new Map(globalAgg.map((g) => [g.tipo, g]))

  return {
    stats: { compartidos, clicks, registros, membresias, conversionPct, recompensas, puntos },
    historial: legitimos.map((r) => ({
      id: r.id,
      nombre: r.referidoCliente.nombre,
      fecha: r.createdAt,
      estado: r.recompensaAplicada
        ? 'RECOMPENSA_ENTREGADA'
        : r.estado === 'COMPLETADO'
          ? 'MEMBRESIA_ACTIVA'
          : 'REGISTRADO',
    })),
    ranking,
    miPosicion,
    retos: reglas.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      meta: r.valorCondicion,
      progreso: Math.min(membresias, r.valorCondicion),
      recompensa: `${Number(r.valorRecompensa)} ${RECOMPENSA_LABEL[r.tipoRecompensa] ?? ''}`.trim(),
    })),
    global: {
      puntos: globalAgg.reduce((acc, g) => acc + (g._sum.puntos ?? 0), 0),
      registros: globalPorTipo.get('REGISTRO_GLOBAL')?._count._all ?? 0,
      membresias: globalPorTipo.get('MEMBRESIA_GLOBAL')?._count._all ?? 0,
    },
  }
}

// ---------------------------------------------------------------------------
// Dashboard ROI del programa de referidos para la empresa (/admin/referidos).
// ---------------------------------------------------------------------------

export interface EmpresaReferidosDashboard {
  kpis: {
    compartidos: number
    clicks: number
    registros: number
    membresias: number
    conversionPct: number
    recompensasEntregadas: number
    ingresosReferidos: number
    sospechosos: number
    embajadoresActivos: number
    embajadoresInactivos: number
  }
  porCanal: { canal: string; clicks: number; compartidos: number }[]
  porCampana: { campana: string; clicks: number }[]
  registrosDiarios: { dia: string; registros: number }[]
  evolucionMensual: { mes: string; registros: number; membresias: number }[]
  topEmbajadores: { nombre: string; puntos: number; registros: number; membresias: number }[]
  topConversion: { nombre: string; clicks: number; membresias: number; pct: number }[]
}

/**
 * Métricas del programa de referidos de la empresa. `companyId` null =
 * superadmin (toda la plataforma). Server-only.
 */
export async function getEmpresaReferidosDashboard(
  companyId: string | null
): Promise<EmpresaReferidosDashboard> {
  const whereRef = companyId ? { companyId } : {}
  const companySql = companyId
    ? Prisma.sql`"companyId" = ${companyId}`
    : Prisma.sql`TRUE`

  const hace30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const hace6m = new Date()
  hace6m.setMonth(hace6m.getMonth() - 5)
  hace6m.setDate(1)

  // Ronda 1: agregaciones independientes. Antes esta función ejecutaba ~9
  // rondas secuenciales, con `distinct` resuelto en memoria (traía todas las
  // filas) y listas de IDs materializadas para contar.
  const [
    eventosTipo,
    referidosTotal,
    membresias,
    recompensadas,
    canalRows,
    topPuntos,
    porClienteTipo,
    activosCountRows,
  ] = await Promise.all([
    prisma.referralEvent.groupBy({
      by: ['tipo'],
      where: { ...whereRef, tipo: { in: TIPOS_EMPRESA } },
      _count: { _all: true },
    }),
    // Solo referidos legítimos cuentan en el embudo (los sospechosos van aparte).
    prisma.referido.count({ where: { ...whereRef, sospechoso: false } }),
    prisma.referido.count({ where: { ...whereRef, estado: 'COMPLETADO', sospechoso: false } }),
    prisma.referido.count({ where: { ...whereRef, recompensaAplicada: true } }),
    prisma.referralEvent.groupBy({
      by: ['tipo', 'canal'],
      where: { ...whereRef, tipo: { in: ['SHARE', 'CLICK'] } },
      _count: { _all: true },
    }),
    prisma.referralEvent.groupBy({
      by: ['clienteId'],
      where: { ...whereRef, tipo: { in: TIPOS_EMPRESA } },
      _sum: { puntos: true },
      orderBy: { _sum: { puntos: 'desc' } },
      take: 5,
    }),
    prisma.referralEvent.groupBy({
      by: ['clienteId', 'tipo'],
      where: { ...whereRef, tipo: { in: ['CLICK', 'MEMBRESIA'] } },
      _count: { _all: true },
    }),
    // COUNT(DISTINCT) en la BD; antes se traían todas las filas para contar.
    prisma.$queryRaw<{ n: bigint }[]>(
      Prisma.sql`SELECT count(DISTINCT "clienteId")::bigint AS n
        FROM "referral_events"
        WHERE ${companySql} AND "createdAt" >= ${hace30d}`
    ),
  ])

  const countTipo = (t: string) =>
    eventosTipo.find((e) => e.tipo === t)?._count._all ?? 0
  const clicks = countTipo('CLICK')

  // Ronda 2: agregados y series (independientes entre sí; antes secuenciales).
  const [ingresosAgg, sospechosos, campanaRows, diariosRows, mensualRows, historicosCountRows] =
    await Promise.all([
      // Ingresos atribuibles: membresías pagadas de clientes que llegaron
      // referidos. Filtro por relación (sin materializar la lista de IDs).
      prisma.membership.aggregate({
        where: {
          pagoConfirmado: true,
          cliente: {
            referidoComo: {
              some: { estado: 'COMPLETADO', ...(companyId ? { companyId } : {}) },
            },
          },
        },
        _sum: { montoPagado: true },
      }),
      // Registros marcados sospechosos por el anti-fraude (huella repetida).
      prisma.referido.count({ where: { ...whereRef, sospechoso: true } }),
      // Clics por campaña (utm_campaign capturado en /r/[code]).
      prisma.$queryRaw<{ campana: string; n: bigint }[]>(
        Prisma.sql`SELECT meta->>'campana' AS campana, count(*)::bigint AS n
          FROM "referral_events"
          WHERE ${companySql} AND tipo = 'CLICK' AND meta->>'campana' IS NOT NULL
          GROUP BY 1 ORDER BY 2 DESC LIMIT 10`
      ),
      // Registros por día (últimos 30 días).
      prisma.$queryRaw<{ dia: Date; n: bigint }[]>(
        Prisma.sql`SELECT date_trunc('day', "createdAt") AS dia, count(*)::bigint AS n
          FROM "referidos" WHERE ${companySql} AND "sospechoso" = false AND "createdAt" >= ${hace30d}
          GROUP BY 1 ORDER BY 1`
      ),
      // Evolución mensual (últimos 6 meses).
      prisma.$queryRaw<{ mes: Date; registros: bigint; membresias: bigint }[]>(
        Prisma.sql`SELECT date_trunc('month', "createdAt") AS mes,
            count(*)::bigint AS registros,
            count(*) FILTER (WHERE estado = 'COMPLETADO')::bigint AS membresias
          FROM "referidos" WHERE ${companySql} AND "sospechoso" = false AND "createdAt" >= ${hace6m}
          GROUP BY 1 ORDER BY 1`
      ),
      prisma.$queryRaw<{ n: bigint }[]>(
        Prisma.sql`SELECT count(DISTINCT "clienteId")::bigint AS n
          FROM "referral_events" WHERE ${companySql}`
      ),
    ])

  const ingresosReferidos = Number(ingresosAgg._sum.montoPagado ?? 0)

  // Nombres + registros/membresías de los tops.
  const clicksPor = new Map<string, number>()
  const membresiasPor = new Map<string, number>()
  for (const r of porClienteTipo) {
    if (r.tipo === 'CLICK') clicksPor.set(r.clienteId, r._count._all)
    if (r.tipo === 'MEMBRESIA') membresiasPor.set(r.clienteId, r._count._all)
  }
  const conversionCandidatos = [...clicksPor.entries()]
    .filter(([, c]) => c >= 5)
    .map(([id, c]) => ({ id, clicks: c, membresias: membresiasPor.get(id) ?? 0 }))
    .map((x) => ({ ...x, pct: Math.round((x.membresias / x.clicks) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5)

  const idsNecesarios = [
    ...new Set([...topPuntos.map((t) => t.clienteId), ...conversionCandidatos.map((c) => c.id)]),
  ]

  // Ronda 3: dependen de los tops de la ronda 1.
  const [nombres, referidosPorReferente, completadosPorReferente] = await Promise.all([
    prisma.cliente.findMany({
      where: { id: { in: idsNecesarios } },
      select: { id: true, nombre: true },
    }),
    prisma.referido.groupBy({
      by: ['referenteClienteId'],
      where: { ...whereRef, referenteClienteId: { in: topPuntos.map((t) => t.clienteId) } },
      _count: { _all: true },
    }),
    prisma.referido.groupBy({
      by: ['referenteClienteId'],
      where: {
        ...whereRef,
        estado: 'COMPLETADO',
        referenteClienteId: { in: topPuntos.map((t) => t.clienteId) },
      },
      _count: { _all: true },
    }),
  ])
  const nombreDe = new Map(nombres.map((n) => [n.id, n.nombre]))
  const regDe = new Map(referidosPorReferente.map((r) => [r.referenteClienteId, r._count._all]))
  const memDe = new Map(completadosPorReferente.map((r) => [r.referenteClienteId, r._count._all]))

  // Embajadores: con actividad histórica vs con actividad en los últimos 30 días.
  const embajadoresActivos = Number(activosCountRows[0]?.n ?? 0)
  const embajadoresInactivos = Math.max(
    0,
    Number(historicosCountRows[0]?.n ?? 0) - embajadoresActivos
  )

  const fmtMes = new Intl.DateTimeFormat('es-DO', { timeZone: 'America/Santo_Domingo', month: 'short', year: '2-digit' })
  const fmtDia = new Intl.DateTimeFormat('es-DO', { timeZone: 'America/Santo_Domingo', day: '2-digit', month: 'short' })

  return {
    kpis: {
      compartidos: countTipo('SHARE'),
      clicks,
      registros: referidosTotal,
      membresias,
      conversionPct: clicks > 0 ? Math.round((membresias / clicks) * 100) : 0,
      recompensasEntregadas: recompensadas,
      ingresosReferidos,
      sospechosos,
      embajadoresActivos,
      embajadoresInactivos,
    },
    porCanal: (() => {
      const mapa = new Map<string, { clicks: number; compartidos: number }>()
      for (const r of canalRows) {
        const canal = r.canal ?? 'directo'
        const item = mapa.get(canal) ?? { clicks: 0, compartidos: 0 }
        if (r.tipo === 'CLICK') item.clicks += r._count._all
        else item.compartidos += r._count._all
        mapa.set(canal, item)
      }
      return [...mapa.entries()]
        .map(([canal, v]) => ({ canal, ...v }))
        .sort((a, b) => b.clicks + b.compartidos - (a.clicks + a.compartidos))
    })(),
    porCampana: campanaRows.map((c) => ({ campana: c.campana, clicks: Number(c.n) })),
    registrosDiarios: diariosRows.map((d) => ({ dia: fmtDia.format(d.dia), registros: Number(d.n) })),
    evolucionMensual: mensualRows.map((m) => ({
      mes: fmtMes.format(m.mes),
      registros: Number(m.registros),
      membresias: Number(m.membresias),
    })),
    topEmbajadores: topPuntos.map((t) => ({
      nombre: nombreDe.get(t.clienteId) ?? 'Cliente',
      puntos: t._sum.puntos ?? 0,
      registros: regDe.get(t.clienteId) ?? 0,
      membresias: memDe.get(t.clienteId) ?? 0,
    })),
    topConversion: conversionCandidatos.map((c) => ({
      nombre: nombreDe.get(c.id) ?? 'Cliente',
      clicks: c.clicks,
      membresias: c.membresias,
      pct: c.pct,
    })),
  }
}
