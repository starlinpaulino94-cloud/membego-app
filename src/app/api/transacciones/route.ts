import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/transacciones?empresaId=&clienteId=&desde=&hasta=&limit=
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return err("No autorizado", 401);
    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get("empresaId") || undefined;
    const clienteId = searchParams.get("clienteId") || undefined;
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");
    const limit = Number(searchParams.get("limit")) || 100;

    if (user.rol === "CLIENTE") {
      const perfiles = await db.cliente.findMany({ where: { userId: user.id }, select: { id: true } });
      const ids = perfiles.map((p) => p.id);
      const where: Record<string, unknown> = { clienteId: { in: ids } };
      if (clienteId && ids.includes(clienteId)) where.clienteId = clienteId;
      if (desde || hasta) {
        where.fechaTransaccion = {};
        if (desde) (where.fechaTransaccion as Record<string, unknown>).gte = new Date(desde);
        if (hasta) (where.fechaTransaccion as Record<string, unknown>).lte = new Date(hasta);
      }
      const transacciones = await db.transaccion.findMany({
        where,
        include: { empresa: true, cliente: true },
        orderBy: { fechaTransaccion: "desc" },
        take: limit,
      });
      return ok({ transacciones });
    }

    if (!empresaId) return err("empresaId es obligatorio", 422);
    assertEmpresaAccess(user, empresaId);
    const where: Record<string, unknown> = { empresaId };
    if (clienteId) where.clienteId = clienteId;
    if (desde || hasta) {
      where.fechaTransaccion = {};
      if (desde) (where.fechaTransaccion as Record<string, unknown>).gte = new Date(desde);
      if (hasta) (where.fechaTransaccion as Record<string, unknown>).lte = new Date(hasta);
    }
    const transacciones = await db.transaccion.findMany({
      where,
      include: { cliente: true, estrategia: true, empleado: true },
      orderBy: { fechaTransaccion: "desc" },
      take: limit,
    });
    return ok({ transacciones });
  } catch (e) {
    return apiError(e);
  }
}
