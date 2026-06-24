import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/empresas/[id]
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA", "EMPLEADO");
    assertEmpresaAccess(user, id);
    const empresa = await db.empresa.findUnique({
      where: { id },
      include: { tipoNegocio: { include: { camposDef: { orderBy: { orden: "asc" } } } } },
    });
    if (!empresa) return err("Empresa no encontrada", 404);
    return ok({ empresa });
  } catch (e) {
    return apiError(e);
  }
}

// PATCH /api/empresas/[id] — superadmin o admin de esa empresa
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA");
    assertEmpresaAccess(user, id);
    const body = await req.json();
    const { nombre, logo, telefono, direccion, estado } = body;
    const empresa = await db.empresa.update({
      where: { id },
      data: {
        ...(nombre !== undefined ? { nombre } : {}),
        ...(logo !== undefined ? { logo } : {}),
        ...(telefono !== undefined ? { telefono } : {}),
        ...(direccion !== undefined ? { direccion } : {}),
        ...(estado !== undefined ? { estado } : {}),
      },
      include: { tipoNegocio: true },
    });
    return ok({ empresa });
  } catch (e) {
    return apiError(e);
  }
}

// DELETE /api/empresas/[id] — solo superadmin (desactiva)
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await requireRol("SUPERADMIN");
    await db.empresa.update({ where: { id }, data: { estado: "INACTIVA" } });
    return ok({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
