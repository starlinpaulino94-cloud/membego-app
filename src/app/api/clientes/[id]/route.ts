import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/clientes/[id]
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA", "EMPLEADO", "CLIENTE");
    const cliente = await db.cliente.findUnique({
      where: { id },
      include: {
        empresa: { include: { tipoNegocio: true } },
        tipoNegocio: true,
        camposDinamicos: true,
        qrTokens: { where: { activo: true } },
        estrategias: { include: { estrategia: true } },
        transacciones: { orderBy: { fechaTransaccion: "desc" }, take: 50, include: { empleado: true } },
      },
    });
    if (!cliente) return err("Cliente no encontrado", 404);
    if (user.rol === "CLIENTE" && cliente.userId !== user.id) return err("Sin permiso", 403);
    if (user.rol !== "SUPERADMIN" && user.rol !== "CLIENTE") assertEmpresaAccess(user, cliente.empresaId);
    return ok({ cliente });
  } catch (e) {
    return apiError(e);
  }
}

// PATCH /api/clientes/[id]
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA", "EMPLEADO", "CLIENTE");
    const cliente = await db.cliente.findUnique({ where: { id } });
    if (!cliente) return err("Cliente no encontrado", 404);
    if (user.rol === "CLIENTE" && cliente.userId !== user.id) return err("Sin permiso", 403);
    if (user.rol !== "SUPERADMIN" && user.rol !== "CLIENTE") assertEmpresaAccess(user, cliente.empresaId);

    const body = await req.json();
    const { nombre, telefono, email, fechaNacimiento, estado, campos } = body;
    const updated = await db.cliente.update({
      where: { id },
      data: {
        ...(nombre !== undefined ? { nombre } : {}),
        ...(telefono !== undefined ? { telefono } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(fechaNacimiento !== undefined ? { fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null } : {}),
        ...(estado !== undefined ? { estado } : {}),
      },
    });

    if (campos && typeof campos === "object") {
      const defs = await db.campoDef.findMany({ where: { tipoNegocioId: cliente.tipoNegocioId } });
      const validKeys = new Set(defs.map((d) => d.clave));
      for (const [clave, valor] of Object.entries(campos)) {
        if (!validKeys.has(clave)) continue;
        const v = valor === null || valor === undefined || valor === "" ? "" : String(valor);
        const exist = await db.clienteCampo.findFirst({ where: { clienteId: id, clave } });
        if (exist) {
          if (v === "") {
            await db.clienteCampo.delete({ where: { id: exist.id } });
          } else {
            await db.clienteCampo.update({ where: { id: exist.id }, data: { valor: v } });
          }
        } else if (v !== "") {
          await db.clienteCampo.create({ data: { clienteId: id, clave, valor: v } });
        }
      }
    }
    return ok({ cliente: updated });
  } catch (e) {
    return apiError(e);
  }
}
