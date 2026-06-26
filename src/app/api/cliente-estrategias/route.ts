import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError, ensureQrToken } from "@/lib/api";
import { syncEvent } from "@/lib/integration";

export const dynamic = "force-dynamic";

// GET /api/cliente-estrategias?empresaId=&estado=&clienteId=
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return err("No autorizado", 401);
    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get("empresaId") || undefined;
    const estado = searchParams.get("estado") || undefined;
    const clienteId = searchParams.get("clienteId") || undefined;

    if (user.rol === "CLIENTE") {
      const perfiles = await db.cliente.findMany({ where: { userId: user.id }, select: { id: true } });
      const ids = perfiles.map((p) => p.id);
      const where: Record<string, any> = { clienteId: { in: ids } };
      if (estado) where.estado = estado;
      const items = await db.clienteEstrategia.findMany({
        where,
        include: { estrategia: { include: { tipoNegocio: true } }, cliente: { include: { empresa: true } } },
        orderBy: { createdAt: "desc" },
      });
      return ok({ clienteEstrategias: items });
    }

    if (!empresaId) return err("empresaId es obligatorio", 422);
    assertEmpresaAccess(user, empresaId);
    const where: Record<string, any> = { empresaId };
    if (estado) where.estado = estado;
    if (clienteId) where.clienteId = clienteId;
    const items = await db.clienteEstrategia.findMany({
      where,
      include: { estrategia: true, cliente: { include: { tipoNegocio: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok({ clienteEstrategias: items });
  } catch (e) {
    return apiError(e);
  }
}

// POST /api/cliente-estrategias — asigna una estrategia a un cliente
// Body: { clienteId, estrategiaId }  (clienteId pertenece a una empresa; la estrategia también)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return err("No autorizado", 401);
    const body = await req.json();
    const { clienteId, estrategiaId } = body;
    if (!clienteId || !estrategiaId) return err("clienteId y estrategiaId son obligatorios", 422);

    const cliente = await db.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) return err("Cliente no encontrado", 404);
    const estrategia = await db.estrategia.findUnique({ where: { id: estrategiaId } });
    if (!estrategia) return err("Estrategia no encontrada", 404);
    if (estrategia.empresaId !== cliente.empresaId) return err("La estrategia no pertenece a la misma empresa del cliente", 422);
    if (estrategia.estado !== "ACTIVA") return err("La estrategia no está activa", 422);

    // Permisos
    if (user.rol === "CLIENTE") {
      if (cliente.userId !== user.id) return err("Sin permiso", 403);
    } else {
      assertEmpresaAccess(user, cliente.empresaId);
    }

    // Validar promoción por tiempo (fecha)
    if (estrategia.tipoEstrategia === "PROMOCION_TIEMPO") {
      const now = new Date();
      if (estrategia.fechaInicio && now < estrategia.fechaInicio) return err("La promoción aún no inicia", 422);
      if (estrategia.fechaFin && now > estrategia.fechaFin) return err("La promoción ya venció", 422);
    }

    // No duplicar estrategia activa igual
    const dup = await db.clienteEstrategia.findFirst({
      where: { clienteId, estrategiaId, estado: { in: ["PENDIENTE", "ACTIVA"] } },
    });
    if (dup) return err("El cliente ya tiene esta estrategia activa o pendiente", 409);

    const requierePago = estrategia.requierePago;
    const estadoCE = requierePago ? "PENDIENTE" : "ACTIVA";
    const fechaInicio = requierePago ? null : new Date();
    const fechaVencimiento = requierePago
      ? null
      : new Date(Date.now() + estrategia.duracionDias * 24 * 60 * 60 * 1000);

    const usosIniciales = estrategia.tipoEstrategia === "MEMBRESIA" ? estrategia.cantidadUsos : 0;

    const ce = await db.clienteEstrategia.create({
      data: {
        clienteId,
        estrategiaId,
        empresaId: cliente.empresaId,
        estado: estadoCE,
        fechaInicio,
        fechaVencimiento,
        usosDisponibles: usosIniciales,
        pagoConfirmado: !requierePago,
        montoPagado: requierePago ? 0 : estrategia.precio,
      },
      include: { estrategia: true },
    });

    // Asegurar QR
    await ensureQrToken(cliente.id, cliente.empresaId);

    if (!requierePago) {
      await syncEvent(cliente.empresaId, "MEMBRESIA_ACTIVADA", { clienteId, estrategiaId });
    }
    return ok({ clienteEstrategia: ce });
  } catch (e) {
    return apiError(e);
  }
}
