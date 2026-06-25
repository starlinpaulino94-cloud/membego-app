import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";
import { retryLog } from "@/lib/integration";

export const dynamic = "force-dynamic";

// POST /api/integration-logs/[id]/retry — reintentar un log fallido
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA");
    const log = await db.integrationLog.findUnique({ where: { id }, include: { integracion: true } });
    if (!log) return err("Log no encontrado", 404);
    assertEmpresaAccess(user, log.empresaId);
    await retryLog(id);
    return ok({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
