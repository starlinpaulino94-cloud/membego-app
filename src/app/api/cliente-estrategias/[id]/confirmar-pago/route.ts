import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";
import { syncEvent } from "@/lib/integration";

export const dynamic = "force-dynamic";

// POST /api/cliente-estrategias/[id]/confirmar-pago
// Activa una estrategia pendiente tras confirmar el pago.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA", "EMPLEADO");
    const body = await req.json().catch(() => ({}));
    const ce = await db.clienteEstrategia.findUnique({ where: { id }, include: { estrategia: true } });
    if (!ce) return err("Registro no encontrado", 404);
    assertEmpresaAccess(user, ce.empresaId);
    if (ce.estado !== "PENDIENTE") return err("El registro no está pendiente", 422);

    const monto = Number(body.montoPagado ?? ce.estrategia.precio);
    const fechaInicio = new Date();
    const fechaVencimiento = new Date(Date.now() + ce.estrategia.duracionDias * 24 * 60 * 60 * 1000);

    const updated = await db.clienteEstrategia.update({
      where: { id },
      data: {
        estado: "ACTIVA",
        fechaInicio,
        fechaVencimiento,
        pagoConfirmado: true,
        montoPagado: monto,
        usosDisponibles: ce.estrategia.tipoEstrategia === "MEMBRESIA" ? ce.estrategia.cantidadUsos : ce.usosDisponibles,
      },
      include: { estrategia: true, cliente: true },
    });

    await syncEvent(ce.empresaId, "PAGO_CONFIRMADO", { clienteId: ce.clienteId, monto, estrategiaId: ce.estrategiaId });
    await syncEvent(ce.empresaId, "MEMBRESIA_ACTIVADA", { clienteId: ce.clienteId, estrategiaId: ce.estrategiaId });
    return ok({ clienteEstrategia: updated });
  } catch (e) {
    return apiError(e);
  }
}
