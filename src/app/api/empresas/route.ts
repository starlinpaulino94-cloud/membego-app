import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, requireRol, assertEmpresaAccess } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/empresas?tipoNegocioId=&public=1
// - public=1: solo empresas activas (para registro de clientes, sin auth)
// - sin public: requiere auth (superadmin ve todas; admin/empleado ve la suya)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tipoNegocioId = searchParams.get("tipoNegocioId");
    const isPublic = searchParams.get("public") === "1";
    const q = searchParams.get("q") || undefined;

    if (isPublic) {
      const where: Record<string, unknown> = { estado: "ACTIVA" };
      if (tipoNegocioId) where.tipoNegocioId = tipoNegocioId;
      if (q) where.nombre = { contains: q };
      const empresas = await db.empresa.findMany({
        where,
        include: { tipoNegocio: true },
        orderBy: { nombre: "asc" },
      });
      return ok({ empresas });
    }

    const user = await getCurrentUser();
    if (!user) return err("No autorizado", 401);

    if (user.rol === "SUPERADMIN") {
      const where: Record<string, unknown> = {};
      if (tipoNegocioId) where.tipoNegocioId = tipoNegocioId;
      const empresas = await db.empresa.findMany({
        where,
        include: { tipoNegocio: true, _count: { select: { clientes: true, estrategias: true, usuarios: true } } },
        orderBy: { createdAt: "desc" },
      });
      return ok({ empresas });
    }
    // admin/empleado: solo su empresa
    if (!user.empresaId) return ok({ empresas: [] });
    const empresa = await db.empresa.findUnique({
      where: { id: user.empresaId },
      include: { tipoNegocio: true, _count: { select: { clientes: true, estrategias: true, usuarios: true } } },
    });
    return ok({ empresas: empresa ? [empresa] : [] });
  } catch (e) {
    return apiError(e);
  }
}

// POST /api/empresas — solo superadmin
export async function POST(req: NextRequest) {
  try {
    const user = await requireRol("SUPERADMIN");
    const body = await req.json();
    const data = pickEmpresaFields(body);
    if (!data.nombre || !data.tipoNegocioId) return err("Nombre y tipo de negocio son obligatorios", 422);
    const tipo = await db.tipoNegocio.findUnique({ where: { id: data.tipoNegocioId } });
    if (!tipo) return err("Tipo de negocio inválido", 422);
    const empresa = await db.empresa.create({
      data: { ...data, estado: body.estado || "ACTIVA" },
      include: { tipoNegocio: true },
    });
    void user;
    return ok({ empresa });
  } catch (e) {
    return apiError(e);
  }
}

function pickEmpresaFields(body: any) {
  const out: Record<string, unknown> = {};
  const allowed = [
    "nombre", "tipoNegocioId", "logo", "telefono", "whatsapp", "direccion", "ciudad",
    "colorPrincipal", "colorSecundario", "descripcionPublica", "imagenPortada", "horario",
    "redesSociales", "urlPersonalizada", "textoBienvenida", "terminosCondiciones", "estado",
  ];
  for (const k of allowed) {
    if (body[k] !== undefined) out[k] = body[k] === "" ? null : body[k];
  }
  return out;
}
