import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/datos-publicos — tipos de negocio + empresas activas (para landing de registro)
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
      orderBy: { nombre: "asc" },
    });
    return ok({ tipos, empresas });
  } catch (e) {
    return apiError(e);
  }
}
