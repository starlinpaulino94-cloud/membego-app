import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/datos-publicos — tipos de negocio + empresas activas + promociones + config social (para landing)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tipoNegocioId = searchParams.get("tipoNegocioId");
    const tipos = await db.tipoNegocio.findMany({
      include: { camposDef: { orderBy: { orden: "asc" } }, _count: { select: { empresas: true } } },
      orderBy: { createdAt: "asc" },
    });
    const where: Record<string, unknown> = { estado: "ACTIVA" };
    if (tipoNegocioId) where.tipoNegocioId = tipoNegocioId;
    const empresas = await db.empresa.findMany({
      where,
      include: { tipoNegocio: true, estrategias: { where: { estado: "ACTIVA" } } },
      orderBy: { destacada: "desc" },
    });

    // Conteo real de usos por estrategia (prueba social: "Miles de promociones ya utilizadas")
    const estrIds: string[] = [];
    for (const e of empresas) for (const es of e.estrategias) estrIds.push(es.id);
    const usosPorEstr: Record<string, number> = {};
    if (estrIds.length) {
      const grouped = await db.transaccion.groupBy({
        by: ["estrategiaId"],
        where: { estrategiaId: { in: estrIds } },
        _count: { _all: true },
      });
      for (const g of grouped) if (g.estrategiaId) usosPorEstr[g.estrategiaId] = g._count._all;
    }

    // Config de prueba social
    const config = await db.config.findUnique({ where: { id: 1 } });
    const clientesReales = await db.cliente.count();

    return ok({
      tipos,
      empresas,
      usosPorEstr,
      config: config || { socialClientes: 2500, socialVisitas: 5400, socialPromociones: 8200, socialNegocios: 2, socialVehiculos: 1850, heroTitulo: null, heroSubtitulo: null },
      clientesReales,
    });
  } catch (e) {
    return apiError(e);
  }
}
