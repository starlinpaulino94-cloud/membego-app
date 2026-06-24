import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA", "EMPLEADO");
    const estrategia = await db.estrategia.findUnique({
      where: { id },
      include: { tipoNegocio: true, empresa: true },
    });
    if (!estrategia) return err("Estrategia no encontrada", 404);
    if (user.rol !== "SUPERADMIN") assertEmpresaAccess(user, estrategia.empresaId);
    return ok({ estrategia });
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA");
    const estrategia = await db.estrategia.findUnique({ where: { id } });
    if (!estrategia) return err("Estrategia no encontrada", 404);
    assertEmpresaAccess(user, estrategia.empresaId);
    const body = await req.json();
    const allowed = [
      "nombre", "tipoEstrategia", "descripcion", "requierePago", "precio", "duracionDias",
      "cantidadUsos", "metaVisitas", "puntosPorConsumo", "puntosPorMonto", "recompensa", "descuentoPct",
      "fechaInicio", "fechaFin", "estado",
    ];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (body[k] !== undefined) {
        if (k === "fechaInicio" || k === "fechaFin") data[k] = body[k] ? new Date(body[k]) : null;
        else if (["precio", "puntosPorMonto", "descuentoPct"].includes(k)) data[k] = Number(body[k]) || 0;
        else if (["duracionDias", "cantidadUsos", "metaVisitas", "puntosPorConsumo"].includes(k)) data[k] = Number(body[k]) || 0;
        else if (k === "requierePago") data[k] = !!body[k];
        else data[k] = body[k];
      }
    }
    const updated = await db.estrategia.update({ where: { id }, data, include: { tipoNegocio: true } });
    return ok({ estrategia: updated });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA");
    const estrategia = await db.estrategia.findUnique({ where: { id } });
    if (!estrategia) return err("Estrategia no encontrada", 404);
    assertEmpresaAccess(user, estrategia.empresaId);
    await db.estrategia.update({ where: { id }, data: { estado: "INACTIVA" } });
    return ok({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
