import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/estrategias?empresaId=&public=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get("empresaId") || undefined;
    const isPublic = searchParams.get("public") === "1";

    if (isPublic && empresaId) {
      const estrategias = await db.estrategia.findMany({
        where: { empresaId, estado: "ACTIVA" },
        include: { tipoNegocio: true },
        orderBy: { createdAt: "desc" },
      });
      return ok({ estrategias });
    }

    const user = await getCurrentUser();
    if (!user) return err("No autorizado", 401);
    if (user.rol === "CLIENTE") {
      // estrategias activas de las empresas donde está registrado
      const perfiles = await db.cliente.findMany({ where: { userId: user.id }, select: { empresaId: true } });
      const ids = perfiles.map((p) => p.empresaId);
      const estrategias = await db.estrategia.findMany({
        where: { empresaId: { in: ids }, estado: "ACTIVA" },
        include: { tipoNegocio: true, empresa: true },
        orderBy: { createdAt: "desc" },
      });
      return ok({ estrategias });
    }

    if (!empresaId) return err("empresaId es obligatorio", 422);
    assertEmpresaAccess(user, empresaId);
    const estrategias = await db.estrategia.findMany({
      where: { empresaId },
      include: { tipoNegocio: true, _count: { select: { clienteEstrategias: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok({ estrategias });
  } catch (e) {
    return apiError(e);
  }
}

// POST /api/estrategias — admin/superadmin
export async function POST(req: NextRequest) {
  try {
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA");
    const body = await req.json();
    const {
      nombre, tipoEstrategia, descripcion, requierePago, precio, duracionDias,
      cantidadUsos, metaVisitas, puntosPorConsumo, puntosPorMonto, recompensa, descuentoPct,
      fechaInicio, fechaFin, estado, empresaId, tipoNegocioId,
    } = body;
    const empId = empresaId || user.empresaId;
    if (!empId) return err("empresaId es obligatorio", 422);
    assertEmpresaAccess(user, empId);
    if (!nombre || !tipoEstrategia || !tipoNegocioId) return err("Nombre, tipo de estrategia y tipo de negocio son obligatorios", 422);

    const empresa = await db.empresa.findUnique({ where: { id: empId } });
    if (!empresa || empresa.tipoNegocioId !== tipoNegocioId) return err("Tipo de negocio no coincide con la empresa", 422);

    const estrategia = await db.estrategia.create({
      data: {
        empresaId: empId,
        tipoNegocioId,
        nombre,
        tipoEstrategia,
        descripcion: descripcion || null,
        requierePago: !!requierePago,
        precio: Number(precio) || 0,
        duracionDias: Number(duracionDias) || 30,
        cantidadUsos: Number(cantidadUsos) || 0,
        metaVisitas: Number(metaVisitas) || 0,
        puntosPorConsumo: Number(puntosPorConsumo) || 0,
        puntosPorMonto: Number(puntosPorMonto) || 0,
        recompensa: recompensa || null,
        descuentoPct: Number(descuentoPct) || 0,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        estado: estado || "ACTIVA",
      },
      include: { tipoNegocio: true },
    });
    return ok({ estrategia });
  } catch (e) {
    return apiError(e);
  }
}
