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
    const allowed = [
      "nombre", "tipoNegocioId", "logo", "telefono", "whatsapp", "direccion", "ciudad",
      "colorPrincipal", "colorSecundario", "descripcionPublica", "imagenPortada", "horario",
      "redesSociales", "urlPersonalizada", "textoBienvenida", "terminosCondiciones", "estado",
      "calificacion", "servicios", "galeria", "destacada",
    ];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (body[k] !== undefined) {
        if (body[k] === "") data[k] = null;
        else if (k === "calificacion") data[k] = body[k] === null ? null : Number(body[k]);
        else if (k === "destacada") data[k] = !!body[k];
        else data[k] = body[k];
      }
    }
    const empresa = await db.empresa.update({
      where: { id },
      data,
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
