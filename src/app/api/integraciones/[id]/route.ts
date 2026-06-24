import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA");
    const integ = await db.integracion.findUnique({ where: { id } });
    if (!integ) return err("Integración no encontrada", 404);
    assertEmpresaAccess(user, integ.empresaId);
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const k of ["tipoIntegracion", "apiUrl", "apiKey", "webhookUrl", "tokenSecreto", "estado"]) {
      if (body[k] !== undefined) data[k] = body[k];
    }
    if (body.eventos !== undefined) data.eventos = body.eventos ? JSON.stringify(body.eventos) : null;
    const updated = await db.integracion.update({ where: { id }, data });
    return ok({ integracion: updated });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA");
    const integ = await db.integracion.findUnique({ where: { id } });
    if (!integ) return err("Integración no encontrada", 404);
    assertEmpresaAccess(user, integ.empresaId);
    await db.integracion.delete({ where: { id } });
    return ok({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
