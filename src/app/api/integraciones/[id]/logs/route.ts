import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/integraciones/[id]/logs?estado=&limit=
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA");
    const integ = await db.integracion.findUnique({ where: { id } });
    if (!integ) return err("Integración no encontrada", 404);
    assertEmpresaAccess(user, integ.empresaId);
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get("estado") || undefined;
    const limit = Number(searchParams.get("limit")) || 100;
    const where: Record<string, any> = { integracionId: id };
    if (estado) where.estado = estado;
    const logs = await db.integrationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return ok({ logs });
  } catch (e) {
    return apiError(e);
  }
}
