/**
 * Fase E6.1 · Script de CERTIFICACIÓN del Referral Engine.
 *
 * Prueba de extremo a extremo: siembra los 10 escenarios ejercitando el código
 * REAL (eventos, fraude, conversión, recompensas), ejecuta las funciones REALES
 * del dashboard y compara TRIPLE — dashboard == SQL crudo == valor esperado.
 *
 * ⚠️  CREA y borra datos: ejecutar SOLO contra una base DESECHABLE, nunca en
 *     producción. Uso:
 *       createdb membego_test
 *       DATABASE_URL=postgresql://.../membego_test npx prisma db push
 *       DATABASE_URL=... npx tsx --tsconfig tsconfig.json scripts/certificar-referidos.ts
 *
 * Resultado esperado: "45 PASS · 0 FAIL".
 */
import { prisma } from '@/lib/prisma'
import { logReferralEvent, hashIp } from '@/lib/referidos'
import { vincularReferido } from '@/lib/referidos-attribution'
import {
  getReferidosDashboard,
  getEmpresaReferidosDashboard,
  getReferidoTimeline,
  procesarReferidoCompletado,
} from '@/modules/referidos/actions'

const TZ = 'America/Santo_Domingo'
let PASS = 0
let FAIL = 0
const fails: string[] = []

function check(nombre: string, dashboard: unknown, sql: unknown, esperado?: unknown) {
  const d = JSON.stringify(dashboard)
  const s = JSON.stringify(sql)
  const okDS = d === s
  const okE = esperado === undefined ? true : d === JSON.stringify(esperado)
  if (okDS && okE) {
    PASS++
    console.log(`  ✅ ${nombre}: ${d}${esperado !== undefined ? ` (esperado ${JSON.stringify(esperado)})` : ''}`)
  } else {
    FAIL++
    const msg = `${nombre}: dashboard=${d} sql=${s}${esperado !== undefined ? ` esperado=${JSON.stringify(esperado)}` : ''}`
    fails.push(msg)
    console.log(`  ❌ ${msg}`)
  }
}

async function raw<T = { n: bigint }>(q: string, ...args: unknown[]): Promise<T[]> {
  return prisma.$queryRawUnsafe<T[]>(q, ...args)
}
const num = (rows: { n: bigint | number }[]) => Number(rows[0]?.n ?? 0)

let seq = 0
async function crearCliente(companyId: string, nombre: string, opts: { activa?: boolean; planId?: string } = {}) {
  seq++
  const supabaseId = `sup-${companyId}-${seq}`
  const email = `c${seq}@test.local`
  const user = await prisma.user.create({
    data: { supabaseId, email, name: nombre, role: 'CLIENTE', companyId },
  })
  const cliente = await prisma.cliente.create({
    data: { supabaseId, email, nombre, companyId, codigoReferido: `REF-${companyId}-${seq}` },
  })
  if (opts.activa && opts.planId) {
    await prisma.membership.create({
      data: {
        clienteId: cliente.id, companyId, planId: opts.planId, estado: 'ACTIVA',
        pagoConfirmado: true, fechaInicio: new Date(), lavadosRestantes: 10, montoPagado: 500,
      },
    })
  }
  return { cliente, user }
}

/** Mirror EXACTO del CLICK que emite src/app/r/[code]/route.ts. */
async function click(referrerId: string, companyId: string, visitorId: string, canal: string, ip: string, campana?: string) {
  await logReferralEvent({
    clienteId: referrerId, companyId, tipo: 'CLICK', canal, visitorId,
    meta: { dispositivo: 'móvil', ipHash: hashIp(ip), ...(campana ? { campana } : {}) },
  })
}

/** Registro real (vincularReferido) + fija el visitorId en el evento REGISTRO
 *  como lo hace producción cuando la cookie de visitante está presente. */
async function registrar(refCode: string, companyId: string, referidoClienteId: string, ip: string, visitorId: string | null) {
  // Fase E6.1: se pasa el visitorId explícito (como hará el registro real),
  // de modo que el antifraude por visitante lo evalúe EN el registro.
  await vincularReferido(refCode, companyId, referidoClienteId, ip, { visitorId })
}

async function main() {
  console.log('\n══════ SIEMBRA DE ESCENARIOS (código real) ══════')
  const company = await prisma.company.create({
    data: { name: 'CertCo', slug: 'certco', type: 'carwash', zonaHoraria: TZ },
  })
  const cId = company.id
  const plan = await prisma.plan.create({
    data: { companyId: cId, nombre: 'Plan Test', precio: 500, lavadosIncluidos: 10 },
  })
  // Regla: 2 referidos completados → 3 usos gratis.
  const regla = await prisma.reglaRecompensa.create({
    data: { companyId: cId, nombre: '2 referidos', condicion: 'N_REFERIDOS_COMPLETADOS', valorCondicion: 2, tipoRecompensa: 'LAVADOS_GRATIS', valorRecompensa: 3 },
  })

  // Referente con membresía ACTIVA (para que la recompensa sea ENTREGADA).
  const ref = await crearCliente(cId, 'Referente', { activa: true, planId: plan.id })
  const refId = ref.cliente.id
  const refCode = ref.cliente.codigoReferido

  // S1: link → click → registro → (luego compra)
  await logReferralEvent({ clienteId: refId, companyId: cId, tipo: 'LINK', meta: { codigoCorto: 'ABC123' } })
  const u1 = await crearCliente(cId, 'Ana')
  await click(refId, cId, 'vis-1', 'whatsapp', '10.0.0.1')
  await registrar(refCode, cId, u1.cliente.id, '10.0.0.1', 'vis-1')

  // S2: mismo enlace abierto varias veces. vis-2 dos veces (1 único), vis-3 una vez.
  await click(refId, cId, 'vis-2', 'copy', '10.0.0.2')
  await click(refId, cId, 'vis-2', 'copy', '10.0.0.2') // repetido → mismo visitante
  await click(refId, cId, 'vis-3', 'qr', '10.0.0.3', 'verano')
  // total CLICK = 1(s1)+3 = 4 ; visitantes únicos = vis-1,vis-2,vis-3 = 3

  // S3: varios usuarios registran desde el mismo referente.
  const u2 = await crearCliente(cId, 'Beto')
  await click(refId, cId, 'vis-2', 'copy', '10.0.0.2') // otro clic de vis-2
  await registrar(refCode, cId, u2.cliente.id, '10.0.0.20', 'vis-2b') // ip nueva, visitante nuevo → legítimo

  // S4: u1 compra MEMBRESÍA → conversión origen MEMBRESIA
  await procesarReferidoCompletado(u1.cliente.id, cId, { origen: 'MEMBRESIA', monto: 500 })

  // S5: u2 compra PROMOCIÓN → conversión origen COMPRA (dispara 2do referido → recompensa)
  await procesarReferidoCompletado(u2.cliente.id, cId, { origen: 'COMPRA', monto: 300 })

  // u1 (Ana, referido convertido) obtiene membresía ACTIVA → cuenta en "activos".
  await prisma.membership.create({
    data: { clienteId: u1.cliente.id, companyId: cId, planId: plan.id, estado: 'ACTIVA', pagoConfirmado: true, fechaInicio: new Date(), lavadosRestantes: 10, montoPagado: 500 },
  })

  // S6: u3 registra pero NUNCA compra → queda PENDIENTE, sin recompensa extra
  const u3 = await crearCliente(cId, 'Carla')
  await click(refId, cId, 'vis-6', 'native', '10.0.0.6')
  await registrar(refCode, cId, u3.cliente.id, '10.0.0.60', 'vis-6')

  // S7: AUTO-REFERIDO → vincularReferido debe rechazar (mismo supabaseId).
  //     Creamos un segundo Cliente del mismo referente en otra empresa ficticia
  //     no aplica; probamos el guard por id directo:
  const antesAuto = await prisma.referido.count({ where: { companyId: cId } })
  await vincularReferido(refCode, cId, refId, '10.0.0.99') // referirse a sí mismo
  const despuesAuto = await prisma.referido.count({ where: { companyId: cId } })

  // S8: FRAUDE por huella de IP repetida. Dos registros desde la MISMA IP.
  const f1 = await crearCliente(cId, 'Fraude1')
  const f2 = await crearCliente(cId, 'Fraude2')
  await registrar(refCode, cId, f1.cliente.id, '66.66.66.66', 'vis-f1') // primero: legítimo
  await registrar(refCode, cId, f2.cliente.id, '66.66.66.66', 'vis-f2') // misma IP → sospechoso

  // S9: DUPLICIDAD por visitante. Mismo visitorId con 2 registros.
  //     (el 2do registro con el mismo visitante debe marcarse sospechoso)
  const d1 = await crearCliente(cId, 'Dup1')
  const d2 = await crearCliente(cId, 'Dup2')
  // Sembramos el visitorId en el evento REGISTRO como en producción; para que
  // el antifraude por visitante lo vea, primero registramos d1 con vis-dup.
  await registrar(refCode, cId, d1.cliente.id, '77.0.0.1', 'vis-dup')
  await registrar(refCode, cId, d2.cliente.id, '77.0.0.2', 'vis-dup') // mismo visitante → sospechoso

  console.log('  ✅ siembra completa')

  // ═══════ VALIDACIÓN: dashboard admin vs SQL crudo vs esperado ═══════
  console.log('\n══════ MÉTRICAS: dashboard admin == SQL == esperado ══════')
  const dash = await getEmpresaReferidosDashboard(cId)
  const k = dash.kpis

  check('links generados', k.linksGenerados,
    num(await raw(`SELECT count(*)::int AS n FROM referral_events WHERE "companyId"=$1 AND tipo='LINK'`, cId)), 1)

  check('clics totales', k.clicks,
    num(await raw(`SELECT count(*)::int AS n FROM referral_events WHERE "companyId"=$1 AND tipo='CLICK'`, cId)), 6)

  check('visitantes únicos', k.visitantesUnicos,
    num(await raw(`SELECT count(DISTINCT "visitorId")::int AS n FROM referral_events WHERE "companyId"=$1 AND tipo='CLICK' AND "visitorId" IS NOT NULL`, cId)), 4)

  check('registros iniciados', k.registrosIniciados,
    num(await raw(`SELECT count(*)::int AS n FROM referral_events WHERE "companyId"=$1 AND tipo='REGISTRO_INICIADO'`, cId)), 0)

  check('registros completados (legítimos)', k.registros,
    num(await raw(`SELECT count(*)::int AS n FROM referidos WHERE "companyId"=$1 AND sospechoso=false`, cId)))

  check('referidos válidos (convertidos)', k.membresias,
    num(await raw(`SELECT count(*)::int AS n FROM referidos WHERE "companyId"=$1 AND estado='COMPLETADO' AND sospechoso=false`, cId)), 2)

  check('compras (eventos)', k.compras,
    num(await raw(`SELECT count(*)::int AS n FROM referral_events WHERE "companyId"=$1 AND tipo='COMPRA'`, cId)), 2)

  check('recompensas entregadas', k.recompensasEntregadas,
    num(await raw(`SELECT count(*)::int AS n FROM referral_recompensas WHERE "companyId"=$1 AND estado='ENTREGADA'`, cId)))

  check('recompensas pendientes', k.recompensasPendientes,
    num(await raw(`SELECT count(*)::int AS n FROM referral_recompensas WHERE "companyId"=$1 AND estado='PENDIENTE'`, cId)))

  check('sospechosos', k.sospechosos,
    num(await raw(`SELECT count(*)::int AS n FROM referidos WHERE "companyId"=$1 AND sospechoso=true`, cId)), 2)

  check('eventos de fraude', k.fraudes,
    num(await raw(`SELECT count(*)::int AS n FROM referral_events WHERE "companyId"=$1 AND tipo='FRAUDE'`, cId)), 2)

  check('ingresos por referidos', k.ingresosReferidos,
    Number((await raw<{ n: number }>(`SELECT COALESCE(sum(m."montoPagado"),0)::float AS n FROM memberships m WHERE m."pagoConfirmado"=true AND EXISTS (SELECT 1 FROM referidos r WHERE r."referidoClienteId"=m."clienteId" AND r.estado='COMPLETADO' AND r.sospechoso=false AND r."companyId"=$1)`, cId))[0]?.n ?? 0))

  check('clientes activos (referidos con membresía activa)', k.activos,
    num(await raw(`SELECT count(DISTINCT r."referidoClienteId")::int AS n FROM referidos r JOIN memberships m ON m."clienteId"=r."referidoClienteId" AND m.estado='ACTIVA' AND m."companyId"=r."companyId" WHERE r."companyId"=$1 AND r.sospechoso=false`, cId)), 1)

  // porCanal (last-touch, sin fan-out): suma de registros por canal == registros
  // legítimos con visitante rastreable. u1(whatsapp), u2(directo: su clic fue de
  // otro visitante 'vis-2', su registro usó 'vis-2b' sin clic previo), u3(native).
  const canalTotal = dash.porCanal.reduce((s, c) => s + c.registros, 0)
  check('porCanal: suma registros == registros legítimos con visitante (sin fan-out)',
    canalTotal,
    num(await raw(`SELECT count(DISTINCT reg."referidoClienteId")::int AS n
      FROM referral_events reg JOIN referidos rf ON rf."referidoClienteId"=reg."referidoClienteId" AND rf.sospechoso=false
      WHERE reg."companyId"=$1 AND reg.tipo='REGISTRO' AND reg."visitorId" IS NOT NULL`, cId)))
  const canalWa = dash.porCanal.find((c) => c.canal === 'whatsapp')?.registros ?? 0
  check('porCanal: u1 atribuido a whatsapp (su canal de clic)', canalWa >= 1 ? 1 : 0, 1, 1)

  // valor promedio por referido = ingresos / referidos válidos
  const espValorProm = k.membresias > 0 ? Math.round(k.ingresosReferidos / k.membresias) : 0
  check('valor promedio por referido', k.valorPromedioPorReferido, espValorProm)

  // conversión = válidos / registros ; conversión clic = registros / visitantes únicos
  check('conversión (registro→compra) %', k.conversionPct,
    k.registros > 0 ? Math.round((k.membresias / k.registros) * 100) : 0)
  check('conversión (visitante→registro) %', k.conversionClickPct,
    k.visitantesUnicos > 0 ? Math.round((k.registros / k.visitantesUnicos) * 100) : 0)

  // Embudo: cada etapa == su fuente
  const embudoMap = Object.fromEntries(dash.embudo.map((e) => [e.etapa, e.valor]))
  check('embudo: Referidos válidos', embudoMap['Referidos válidos'], k.membresias)
  check('embudo: Compras realizadas', embudoMap['Compras realizadas'], k.compras)
  check('embudo: Recompensas entregadas', embudoMap['Recompensas entregadas'], k.recompensasEntregadas)

  // ═══════ ESCENARIO 7: auto-referido rechazado ═══════
  console.log('\n══════ ESCENARIO 7: auto-referido ══════')
  check('auto-referido NO crea vínculo', despuesAuto, antesAuto, antesAuto)

  // ═══════ ESCENARIO 10: recompensa — Rule/Reward/Tx/Analytics/Historial ═══════
  console.log('\n══════ ESCENARIO 10: recompensa otorgada — motores ══════')
  const rec = await prisma.referralRecompensa.findFirst({ where: { companyId: cId, reglaId: regla.id, referenteClienteId: refId } })
  check('recompensa existe (Reward Engine)', rec ? 1 : 0, 1, 1)
  check('recompensa estado ENTREGADA (referente con membresía activa)', rec?.estado ?? 'NONE',
    (await raw<{ n: string }>(`SELECT estado::text AS n FROM referral_recompensas WHERE id=$1`, rec?.id ?? ''))[0]?.n ?? 'NONE', 'ENTREGADA')
  check('recompensa umbral auditado', rec?.umbral ?? -1, 2, 2)
  check('transacción REFERRAL creada (Transaction Engine)',
    num(await raw(`SELECT count(*)::int AS n FROM transactions WHERE "companyId"=$1 AND tipo='REFERRAL'`, cId)), 1, 1)
  check('evento RECOMPENSA en el embudo (Analytics)',
    num(await raw(`SELECT count(*)::int AS n FROM referral_events WHERE "companyId"=$1 AND tipo='RECOMPENSA'`, cId)), 1, 1)
  check('auditoría RECOMPENSA_OTORGADA (Historial)',
    num(await raw(`SELECT count(*)::int AS n FROM audit_logs WHERE "companyId"=$1 AND accion='RECOMPENSA_OTORGADA'`, cId)), 1, 1)
  check('usos gratis aplicados a la membresía del referente (Action Engine)',
    Number((await raw<{ n: number }>(`SELECT m."lavadosRestantes"::int AS n FROM memberships m WHERE m."clienteId"=$1 AND m.estado='ACTIVA'`, refId))[0]?.n ?? 0), 13, 13)

  // ═══════ ESCENARIO 6: sin compra, sin recompensa extra ═══════
  console.log('\n══════ ESCENARIO 6: sin compra → sin conversión ══════')
  check('u3 (Carla) sigue PENDIENTE',
    (await raw<{ n: string }>(`SELECT estado::text AS n FROM referidos WHERE "referidoClienteId"=$1`, u3.cliente.id))[0]?.n ?? 'NONE',
    'PENDIENTE', 'PENDIENTE')

  // ═══════ ESCENARIO 8/9: fraude y duplicidad marcados ═══════
  console.log('\n══════ ESCENARIO 8/9: fraude y duplicidad ══════')
  check('S8 f2 (misma IP) marcado sospechoso',
    (await raw<{ n: boolean }>(`SELECT sospechoso AS n FROM referidos WHERE "referidoClienteId"=$1`, f2.cliente.id))[0]?.n ?? null,
    true, true)
  check('S8 f1 (primero) legítimo',
    (await raw<{ n: boolean }>(`SELECT sospechoso AS n FROM referidos WHERE "referidoClienteId"=$1`, f1.cliente.id))[0]?.n ?? null,
    false, false)
  check('S9 d2 (mismo visitante) marcado sospechoso',
    (await raw<{ n: boolean }>(`SELECT sospechoso AS n FROM referidos WHERE "referidoClienteId"=$1`, d2.cliente.id))[0]?.n ?? null,
    true, true)

  // ═══════ HISTORIAL: timeline == eventos reales ═══════
  console.log('\n══════ HISTORIAL: timeline de un referido == BD ══════')
  const tl = await getReferidoTimeline(u1.cliente.id)
  const tlSql = num(await raw(
    `SELECT count(*)::int AS n FROM referral_events e
      WHERE e."referidoClienteId"=$1
         OR e."visitorId" = (SELECT "visitorId" FROM referral_events WHERE tipo='REGISTRO' AND "referidoClienteId"=$1 LIMIT 1)`,
    u1.cliente.id))
  check('timeline u1: nº eventos == BD', tl.length, tlSql)
  const tiposTL = tl.map((e) => e.tipo).sort()
  console.log('     tipos en timeline u1:', tiposTL.join(', '))
  check('timeline u1 sin duplicados', tl.length, new Set(tl.map((e) => e.id)).size)

  // ═══════ INTEGRIDAD ═══════
  console.log('\n══════ INTEGRIDAD DE DATOS ══════')
  check('sin COMPLETADO+sospechoso (estado imposible)',
    num(await raw(`SELECT count(*)::int AS n FROM referidos WHERE estado='COMPLETADO' AND sospechoso=true`)), 0, 0)
  check('sin recompensas duplicadas (referente+regla)',
    num(await raw(`SELECT COALESCE(sum(c-1),0)::int AS n FROM (SELECT count(*) c FROM referral_recompensas GROUP BY "referenteClienteId","reglaId" HAVING count(*)>1) x`)), 0, 0)
  check('sin conversión COMPLETADO sin evento COMPRA',
    num(await raw(`SELECT count(*)::int AS n FROM referidos r WHERE r.estado='COMPLETADO' AND NOT EXISTS (SELECT 1 FROM referral_events e WHERE e.tipo='COMPRA' AND e."referidoClienteId"=r."referidoClienteId")`)), 0, 0)
  check('sin referral_events huérfanos (clienteId inexistente)',
    num(await raw(`SELECT count(*)::int AS n FROM referral_events e WHERE NOT EXISTS (SELECT 1 FROM clientes c WHERE c.id=e."clienteId")`)), 0, 0)
  check('sin recompensa sin regla',
    num(await raw(`SELECT count(*)::int AS n FROM referral_recompensas rr WHERE NOT EXISTS (SELECT 1 FROM reglas_recompensa g WHERE g.id=rr."reglaId")`)), 0, 0)

  // ═══════ DASHBOARD CLIENTE ═══════
  console.log('\n══════ DASHBOARD CLIENTE (referente) == BD ══════')
  const cli = await getReferidosDashboard(refId, cId, ref.user.supabaseId)
  check('cliente: registros == BD legítimos del referente',
    cli.stats.registros,
    num(await raw(`SELECT count(*)::int AS n FROM referidos WHERE "referenteClienteId"=$1 AND sospechoso=false`, refId)))
  check('cliente: conversiones == BD',
    cli.stats.membresias,
    num(await raw(`SELECT count(*)::int AS n FROM referidos WHERE "referenteClienteId"=$1 AND estado='COMPLETADO' AND sospechoso=false`, refId)), 2)
  check('cliente: recompensas == referral_recompensas del referente',
    cli.stats.recompensas,
    num(await raw(`SELECT count(*)::int AS n FROM referral_recompensas WHERE "referenteClienteId"=$1`, refId)))
  check('cliente: clics == BD',
    cli.stats.clicks,
    num(await raw(`SELECT count(*)::int AS n FROM referral_events WHERE "clienteId"=$1 AND tipo='CLICK'`, refId)), 6)
  check('cliente: visitantes únicos == BD',
    cli.stats.clicksUnicos,
    num(await raw(`SELECT count(DISTINCT "visitorId")::int AS n FROM referral_events WHERE "clienteId"=$1 AND tipo='CLICK' AND "visitorId" IS NOT NULL`, refId)), 4)

  // ═══════ RESUMEN ═══════
  console.log(`\n══════ RESULTADO: ${PASS} PASS · ${FAIL} FAIL ══════`)
  if (FAIL > 0) {
    console.log('\nFALLOS:')
    fails.forEach((f) => console.log('  · ' + f))
  }
  await prisma.$disconnect()
  process.exit(FAIL > 0 ? 1 : 0)
}

main().catch(async (e) => {
  console.error('\nHARNESS ERROR:', e?.message)
  console.error(e?.stack?.split('\n').slice(0, 6).join('\n'))
  await prisma.$disconnect().catch(() => {})
  process.exit(2)
})
