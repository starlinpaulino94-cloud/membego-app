import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";
import { syncEvent } from "@/lib/integration";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const confirmSchema = z.object({
  token: z.string().min(1),
  clienteEstrategiaId: z.string().optional(),
  tipoConsumo: z.string().min(1).max(100),
  montoConsumo: z.number().min(0).max(10000000).optional(),
  aplicarBeneficio: z.boolean().optional(),
});

// POST /api/qr/confirm
// Body: { token, clienteEstrategiaId?, tipoConsumo, montoConsumo, aplicarBeneficio?: boolean }
// El empleado confirma el consumo. Aquí se descuentan usos, acumulan puntos y aplican beneficios.
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(`confirm:${ip}`, 60, 60 * 1000)) {
      return err("Demasiadas solicitudes. Intenta más tarde.", 429);
    }
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA", "EMPLEADO");
    const parsed = confirmSchema.safeParse(await req.json());
    if (!parsed.success) return err("Datos inválidos", 422);
    const { token, clienteEstrategiaId, tipoConsumo, montoConsumo, aplicarBeneficio } = parsed.data;
    if (montoConsumo !== undefined && montoConsumo < 0) return err("El monto no puede ser negativo", 422);

    const qr = await db.qrToken.findUnique({
      where: { token: String(token) },
      include: { cliente: true },
    });
    if (!qr || !qr.activo || !qr.cliente) return err("QR inválido", 404);
    if (user.rol !== "SUPERADMIN") assertEmpresaAccess(user, qr.empresaId);

    const monto = Number(montoConsumo) || 0;
    const now = new Date();

    // Buscar la estrategia a aplicar
    let ce = null;
    if (clienteEstrategiaId) {
      ce = await db.clienteEstrategia.findUnique({ where: { id: clienteEstrategiaId }, include: { estrategia: true } });
      if (!ce || ce.clienteId !== qr.cliente.id) return err("Estrategia no válida para este cliente", 422);
    } else {
      // Tomar la estrategia ACTIVA más reciente
      ce = await db.clienteEstrategia.findFirst({
        where: { clienteId: qr.cliente.id, empresaId: qr.empresaId, estado: "ACTIVA" },
        include: { estrategia: true },
        orderBy: { createdAt: "desc" },
      });
    }

    let beneficioAplicado: string | null = null;
    let usosDescontados = 0;
    let puntosGenerados = 0;
    let estadoNuevo = ce?.estado;

    if (ce && ce.estado === "ACTIVA") {
      const est = ce.estrategia;
      // Vencimiento
      if (ce.fechaVencimiento && ce.fechaVencimiento < now) {
        await db.clienteEstrategia.update({ where: { id: ce.id }, data: { estado: "VENCIDA" } });
        await syncEvent(qr.empresaId, "ESTRATEGIA_VENCIDA", { clienteId: qr.cliente.id, estrategiaId: est.id });
        ce.estado = "VENCIDA";
        estadoNuevo = "VENCIDA";
        ce = null; // no se aplica
      } else {
        switch (est.tipoEstrategia) {
          case "MEMBRESIA": {
            if (ce.usosDisponibles > 0) {
              usosDescontados = 1;
              beneficioAplicado = `Incluido en membresía (${est.nombre})`;
              const nuevosUsos = ce.usosDisponibles - 1;
              const nuevosConsumidos = ce.usosConsumidos + 1;
              await db.clienteEstrategia.update({
                where: { id: ce.id },
                data: { usosDisponibles: nuevosUsos, usosConsumidos: nuevosConsumidos },
              });
            } else {
              beneficioAplicado = "Membresía sin usos disponibles - consumo regular";
            }
            break;
          }
          case "CONTEO_VISITAS": {
            const nuevasVisitas = ce.visitasAcumuladas + 1;
            if (nuevasVisitas >= est.metaVisitas) {
              // Recompensa alcanzada: gratis o descuento
              if (est.descuentoPct >= 100) beneficioAplicado = `¡Visita ${nuevasVisitas} GRATIS! (${est.nombre})`;
              else beneficioAplicado = `Descuento ${est.descuentoPct}% aplicado (visita ${nuevasVisitas})`;
              await db.clienteEstrategia.update({
                where: { id: ce.id },
                data: { visitasAcumuladas: 0 },
              });
            } else {
              beneficioAplicado = `Visita ${nuevasVisitas} de ${est.metaVisitas} registrada`;
              await db.clienteEstrategia.update({
                where: { id: ce.id },
                data: { visitasAcumuladas: nuevasVisitas },
              });
            }
            break;
          }
          case "PUNTOS": {
            const pts = est.puntosPorConsumo + (est.puntosPorMonto > 0 ? Math.floor(monto / est.puntosPorMonto) : 0);
            puntosGenerados = pts;
            await db.clienteEstrategia.update({
              where: { id: ce.id },
              data: { puntosAcumulados: { increment: pts } },
            });
            beneficioAplicado = `+${pts} puntos (total: ${(ce.puntosAcumulados + pts).toFixed(0)})`;
            break;
          }
          case "CUPON": {
            if (aplicarBeneficio !== false) {
              beneficioAplicado = `Cupón aplicado: ${est.descuentoPct}% de descuento`;
              estadoNuevo = "VENCIDA";
              await db.clienteEstrategia.update({
                where: { id: ce.id },
                data: { estado: "VENCIDA" },
              });
            } else {
              beneficioAplicado = "Cupón disponible (no aplicado)";
            }
            break;
          }
          case "PROMOCION_TIEMPO": {
            const dentroRango = (!est.fechaInicio || now >= est.fechaInicio) && (!est.fechaFin || now <= est.fechaFin);
            if (dentroRango) {
              beneficioAplicado = `Promoción vigente: ${est.descuentoPct}% de descuento`;
            } else {
              beneficioAplicado = "Promoción fuera de rango de fechas";
            }
            break;
          }
        }
      }
    } else if (ce && ce.estado !== "ACTIVA") {
      beneficioAplicado = `Estrategia ${ce.estado.toLowerCase()} - consumo regular`;
      ce = null;
    } else {
      beneficioAplicado = "Sin estrategia activa - consumo regular";
    }

    // Crear la transacción
    const tx = await db.transaccion.create({
      data: {
        clienteId: qr.cliente.id,
        empresaId: qr.empresaId,
        estrategiaId: ce?.estrategiaId || null,
        clienteEstrategiaId: ce?.id || null,
        tipoConsumo,
        montoConsumo: monto,
        puntosGenerados,
        beneficioAplicado,
        usosDescontados,
        empleadoId: user.id,
        fechaTransaccion: now,
      },
      include: { empleado: true },
    });

    await syncEvent(qr.empresaId, "VISITA_REGISTRADA", {
      clienteId: qr.cliente.id,
      transaccionId: tx.id,
      tipoConsumo,
      monto,
    });
    if (beneficioAplicado && beneficioAplicado.includes("GRATIS") || beneficioAplicado?.includes("descuento") || beneficioAplicado?.includes("Cupón") || beneficioAplicado?.includes("Promoción")) {
      await syncEvent(qr.empresaId, "BENEFICIO_USADO", {
        clienteId: qr.cliente.id,
        transaccionId: tx.id,
        beneficio: beneficioAplicado,
      });
    }

    return ok({ transaccion: tx, beneficioAplicado, usosDescontados, puntosGenerados, estadoEstrategia: estadoNuevo });
  } catch (e) {
    return apiError(e);
  }
}
