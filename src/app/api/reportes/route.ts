import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/reportes?tipo=general|empresa&empresaId=
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return err("No autorizado", 401);
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo") || "general";
    const empresaId = searchParams.get("empresaId") || user.empresaId || undefined;

    if (tipo === "general") {
      if (user.rol !== "SUPERADMIN") return err("Sin permisos", 403);
      const [totalEmpresas, empresasActivas, totalClientes, totalTransacciones, tipos] = await Promise.all([
        db.empresa.count(),
        db.empresa.count({ where: { estado: "ACTIVA" } }),
        db.cliente.count(),
        db.transaccion.count(),
        db.tipoNegocio.findMany({ include: { empresas: true, _count: { select: { clientes: true, estrategias: true } } } }),
      ]);

      // transacciones por tipo de negocio
      const transaccionesPorTipo: { tipo: string; total: number }[] = [];
      for (const t of tipos) {
        const count = await db.transaccion.count({
          where: { empresa: { tipoNegocioId: t.id } },
        });
        transaccionesPorTipo.push({ tipo: t.nombre, total: count });
      }

      // estrategias más usadas
      const estrategiasUsadasRaw = await db.clienteEstrategia.groupBy({
        by: ["estrategiaId"],
        _count: { _all: true },
        orderBy: { _count: { estrategiaId: "desc" } },
        take: 5,
      });
      const estrIds = estrategiasUsadasRaw.map((e) => e.estrategiaId);
      const estrategiasInfo = await db.estrategia.findMany({ where: { id: { in: estrIds } }, include: { empresa: true } });
      const estrategiasMasUsadas = estrategiasUsadasRaw.map((e) => {
        const info = estrategiasInfo.find((i) => i.id === e.estrategiaId);
        return { nombre: info?.nombre || "?", empresa: info?.empresa.nombre || "?", total: e._count._all };
      });

      // transacciones últimos 14 días
      const hace14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const txs = await db.transaccion.findMany({
        where: { fechaTransaccion: { gte: hace14 } },
        select: { fechaTransaccion: true, empresaId: true },
      });
      const porDia: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        porDia[d.toISOString().slice(0, 10)] = 0;
      }
      for (const t of txs) {
        const k = t.fechaTransaccion.toISOString().slice(0, 10);
        if (k in porDia) porDia[k] += 1;
      }

      return ok({
        tipo: "general",
        totalEmpresas,
        empresasActivas,
        totalClientes,
        totalTransacciones,
        tiposNegocio: tipos.map((t) => ({ id: t.id, nombre: t.nombre, empresas: t.empresas.length, clientes: t._count.clientes, estrategias: t._count.estrategias })),
        transaccionesPorTipo,
        estrategiasMasUsadas,
        transaccionesPorDia: Object.entries(porDia).map(([fecha, total]) => ({ fecha, total })),
      });
    }

    // Reporte de empresa
    if (!empresaId) return err("empresaId es obligatorio", 422);
    assertEmpresaAccess(user, empresaId);

    const [clientesRegistrados, clientesActivos, clientesInactivos, estrategiasActivas, totalConsumos, erroresSync, ingresosRaw, ces] = await Promise.all([
      db.cliente.count({ where: { empresaId } }),
      db.cliente.count({ where: { empresaId, estado: "ACTIVO" } }),
      db.cliente.count({ where: { empresaId, estado: "INACTIVO" } }),
      db.estrategia.count({ where: { empresaId, estado: "ACTIVA" } }),
      db.transaccion.count({ where: { empresaId } }),
      db.integrationLog.count({ where: { empresaId, estado: "ERROR" } }),
      db.clienteEstrategia.aggregate({ where: { empresaId, pagoConfirmado: true }, _sum: { montoPagado: true } }),
      db.clienteEstrategia.findMany({ where: { empresaId }, include: { cliente: true, estrategia: true } }),
    ]);

    // beneficios usados (transacciones con beneficio aplicado que no sea "regular")
    const txs = await db.transaccion.findMany({ where: { empresaId }, select: { beneficioAplicado: true, fechaTransaccion: true, tipoConsumo: true, montoConsumo: true, clienteId: true } });
    const beneficiosUsados = txs.filter((t) => t.beneficioAplicado && !t.beneficioAplicado.includes("regular") && !t.beneficioAplicado.includes("Sin estrategia") && !t.beneficioAplicado.includes("Membresía sin usos")).length;

    // clientes frecuentes (top 5 por nº de transacciones)
    const porCliente: Record<string, number> = {};
    for (const t of txs) porCliente[t.clienteId] = (porCliente[t.clienteId] || 0) + 1;
    const topIds = Object.entries(porCliente).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
    const topClientesInfo = await db.cliente.findMany({ where: { id: { in: topIds } } });
    const clientesFrecuentes = topIds.map((id) => {
      const c = topClientesInfo.find((x) => x.id === id);
      return { nombre: c?.nombre || "?", visitas: porCliente[id], telefono: c?.telefono || null };
    });

    // consumos por tipo
    const porTipo: Record<string, number> = {};
    for (const t of txs) porTipo[t.tipoConsumo] = (porTipo[t.tipoConsumo] || 0) + 1;

    // transacciones últimos 14 días
    const hace14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const txsRecientes = await db.transaccion.findMany({ where: { empresaId, fechaTransaccion: { gte: hace14 } }, select: { fechaTransaccion: true } });
    const porDia: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      porDia[d.toISOString().slice(0, 10)] = 0;
    }
    for (const t of txsRecientes) {
      const k = t.fechaTransaccion.toISOString().slice(0, 10);
      if (k in porDia) porDia[k] += 1;
    }

    // estado de estrategias de clientes
    const estrategiasClienteEstado = {
      activas: ces.filter((c) => c.estado === "ACTIVA").length,
      pendientes: ces.filter((c) => c.estado === "PENDIENTE").length,
      vencidas: ces.filter((c) => c.estado === "VENCIDA").length,
    };

    return ok({
      tipo: "empresa",
      empresaId,
      clientesRegistrados,
      clientesActivos,
      clientesInactivos,
      estrategiasActivas,
      totalConsumos,
      beneficiosUsados,
      ingresosMembresias: ingresosRaw._sum.montoPagado || 0,
      erroresSync,
      clientesFrecuentes,
      consumosPorTipo: Object.entries(porTipo).map(([tipo, total]) => ({ tipo, total })),
      transaccionesPorDia: Object.entries(porDia).map(([fecha, total]) => ({ fecha, total })),
      estrategiasClienteEstado,
    });
  } catch (e) {
    return apiError(e);
  }
}
