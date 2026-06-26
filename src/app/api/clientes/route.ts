import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, requireRol, assertEmpresaAccess, hashPassword } from "@/lib/auth";
import { ok, err, apiError, ensureQrToken } from "@/lib/api";
import { syncEvent } from "@/lib/integration";

export const dynamic = "force-dynamic";

// GET /api/clientes?empresaId=
// - CLIENTE: devuelve sus propios perfiles (todas sus empresas)
// - ADMIN/EMPLEADO: clientes de su empresa (requiere empresaId o usa user.empresaId)
// - SUPERADMIN: requiere empresaId
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return err("No autorizado", 401);
    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get("empresaId") || user.empresaId || undefined;
    const q = searchParams.get("q") || undefined;

    if (user.rol === "CLIENTE") {
      const clientes = await db.cliente.findMany({
        where: { userId: user.id },
        include: {
          empresa: { include: { tipoNegocio: true } },
          tipoNegocio: true,
          camposDinamicos: true,
          qrTokens: { where: { activo: true } },
          estrategias: { include: { estrategia: true }, orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      });
      return ok({ clientes });
    }

    if (!empresaId) return err("empresaId es obligatorio", 422);
    assertEmpresaAccess(user, empresaId);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const where: Record<string, any> = { empresaId };
    if (q) where.OR = [{ nombre: { contains: q } }, { email: { contains: q } }, { telefono: { contains: q } }];
    const [clientes, total] = await Promise.all([
      db.cliente.findMany({
        where,
        include: {
          tipoNegocio: true,
          camposDinamicos: true,
          qrTokens: { where: { activo: true } },
          estrategias: { include: { estrategia: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.cliente.count({ where }),
    ]);
    return ok({ clientes, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (e) {
    return apiError(e);
  }
}

// POST /api/clientes — admin/empleado/superadmin crea cliente en una empresa
export async function POST(req: NextRequest) {
  try {
    const user = await requireRol("SUPERADMIN", "ADMIN_EMPRESA", "EMPLEADO");
    const body = await req.json();
    const { nombre, telefono, email, fechaNacimiento, empresaId, tipoNegocioId, campos, crearUsuario, password } = body;
    const empId = empresaId || user.empresaId;
    if (!empId) return err("empresaId es obligatorio", 422);
    assertEmpresaAccess(user, empId);
    if (!nombre || !tipoNegocioId) return err("Nombre y tipo de negocio son obligatorios", 422);

    const empresa = await db.empresa.findUnique({ where: { id: empId } });
    if (!empresa) return err("Empresa inválida", 422);
    if (empresa.tipoNegocioId !== tipoNegocioId) return err("Tipo de negocio no coincide con la empresa", 422);

    let userId = "manual-" + Math.random().toString(36).slice(2, 12);
    if (crearUsuario && email) {
      const existe = await db.user.findUnique({ where: { email: String(email).toLowerCase() } });
      if (existe) {
        userId = existe.id;
      } else {
        const u = await db.user.create({
          data: {
            email: String(email).toLowerCase(),
            password: hashPassword(password || "Pase" + Math.random().toString(36).slice(2, 8) + "!"),
            nombre,
            telefono: telefono || null,
            rol: "CLIENTE",
          },
        });
        userId = u.id;
      }
    }

    const cliente = await db.cliente.create({
      data: {
        userId,
        nombre,
        telefono: telefono || null,
        email: email ? String(email).toLowerCase() : null,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        empresaId: empId,
        tipoNegocioId,
        estado: "ACTIVO",
      },
    });

    if (campos && typeof campos === "object") {
      const defs = await db.campoDef.findMany({ where: { tipoNegocioId } });
      const validKeys = new Set(defs.map((d) => d.clave));
      const data = Object.entries(campos)
        .filter(([k, v]) => validKeys.has(k) && v !== undefined && v !== null && v !== "")
        .map(([clave, valor]) => ({ clienteId: cliente.id, clave, valor: String(valor) }));
      if (data.length) await db.clienteCampo.createMany({ data });
    }

    const qr = await ensureQrToken(cliente.id, empId);
    await syncEvent(empId, "CLIENTE_CREADO", { clienteId: cliente.id, nombre });

    const full = await db.cliente.findUnique({
      where: { id: cliente.id },
      include: { camposDinamicos: true, qrTokens: { where: { activo: true } } },
    });
    return ok({ cliente: full, qr });
  } catch (e) {
    return apiError(e);
  }
}
