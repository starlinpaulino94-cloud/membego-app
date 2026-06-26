import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const scanSchema = z.object({ token: z.string().min(1) });

// POST /api/qr/scan  { token }
// Valida el QR y devuelve la info del cliente + beneficios. NO consume nada.
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(`scan:${ip}`, 60, 60 * 1000)) {
      return err("Demasiadas solicitudes. Intenta más tarde.", 429);
    }
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA", "EMPLEADO");
    const parsed = scanSchema.safeParse(await req.json());
    if (!parsed.success) return err("Datos inválidos", 422);
    const { token } = parsed.data;

    const qr = await db.qrToken.findUnique({
      where: { token: String(token) },
      include: {
        cliente: {
          include: {
            tipoNegocio: true,
            empresa: true,
            camposDinamicos: true,
            estrategias: {
              include: { estrategia: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });
    if (!qr || !qr.activo) return err("QR inválido o inactivo", 404);
    if (!qr.cliente) return err("Cliente no encontrado", 404);
    if (qr.cliente.estado !== "ACTIVO") return err("Cliente inactivo", 422);

    // Aislamiento: el empleado solo puede escanear QR de su empresa
    if (user.rol !== "SUPERADMIN") {
      assertEmpresaAccess(user, qr.empresaId);
    }

    // Validar membresías vencidas
    const now = new Date();
    for (const ce of qr.cliente.estrategias) {
      if (ce.estado === "ACTIVA" && ce.fechaVencimiento && ce.fechaVencimiento < now) {
        await db.clienteEstrategia.update({ where: { id: ce.id }, data: { estado: "VENCIDA" } });
        await syncEventSafe(qr.empresaId, "ESTRATEGIA_VENCIDA", { clienteId: qr.cliente.id, estrategiaId: ce.estrategiaId });
        ce.estado = "VENCIDA";
      }
    }

    const historial = await db.transaccion.findMany({
      where: { clienteId: qr.cliente.id, empresaId: qr.empresaId },
      orderBy: { fechaTransaccion: "desc" },
      take: 10,
    });

    return ok({
      cliente: {
        id: qr.cliente.id,
        nombre: qr.cliente.nombre,
        telefono: qr.cliente.telefono,
        email: qr.cliente.email,
        tipoNegocio: qr.cliente.tipoNegocio,
        empresa: { id: qr.cliente.empresa.id, nombre: qr.cliente.empresa.nombre },
        camposDinamicos: qr.cliente.camposDinamicos,
      },
      estrategias: qr.cliente.estrategias.map((ce) => ({
        id: ce.id,
        estado: ce.estado,
        fechaInicio: ce.fechaInicio,
        fechaVencimiento: ce.fechaVencimiento,
        usosDisponibles: ce.usosDisponibles,
        usosConsumidos: ce.usosConsumidos,
        visitasAcumuladas: ce.visitasAcumuladas,
        puntosAcumulados: ce.puntosAcumulados,
        pagoConfirmado: ce.pagoConfirmado,
        estrategia: ce.estrategia,
      })),
      historial,
    });
  } catch (e) {
    return apiError(e);
  }
}

async function syncEventSafe(empresaId: string, evento: string, payload: Record<string, any>) {
  const { syncEvent } = await import("@/lib/integration");
  await syncEvent(empresaId, evento, payload);
}
