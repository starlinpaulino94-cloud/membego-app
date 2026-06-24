import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/integraciones?empresaId=
export async function GET(req: NextRequest) {
  try {
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA");
    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get("empresaId") || user.empresaId || undefined;
    if (!empresaId) return err("empresaId es obligatorio", 422);
    assertEmpresaAccess(user, empresaId);
    const integraciones = await db.integracion.findMany({
      where: { empresaId },
      include: { _count: { select: { logs: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok({ integraciones });
  } catch (e) {
    return apiError(e);
  }
}

// POST /api/integraciones
export async function POST(req: NextRequest) {
  try {
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA");
    const body = await req.json();
    const { empresaId, tipoIntegracion, apiUrl, apiKey, webhookUrl, tokenSecreto, eventos, estado } = body;
    const empId = empresaId || user.empresaId;
    if (!empId) return err("empresaId es obligatorio", 422);
    assertEmpresaAccess(user, empId);
    if (!tipoIntegracion) return err("tipoIntegracion es obligatorio", 422);
    const integ = await db.integracion.create({
      data: {
        empresaId: empId,
        tipoIntegracion,
        apiUrl: apiUrl || null,
        apiKey: apiKey || null,
        webhookUrl: webhookUrl || null,
        tokenSecreto: tokenSecreto || null,
        eventos: eventos ? JSON.stringify(eventos) : null,
        estado: estado || "ACTIVA",
      },
    });
    return ok({ integracion: integ });
  } catch (e) {
    return apiError(e);
  }
}
