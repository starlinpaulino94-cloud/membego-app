import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, requireRol, assertEmpresaAccess, hashPassword } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/usuarios?empresaId=
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return err("No autorizado", 401);
    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get("empresaId") || undefined;

    if (user.rol === "SUPERADMIN") {
      const usuarios = await db.user.findMany({
        where: empresaId ? { empresaId } : { rol: { in: ["ADMIN_EMPRESA", "EMPLEADO"] } },
        include: { empresa: { include: { tipoNegocio: true } } },
        orderBy: { createdAt: "desc" },
      });
      return ok({ usuarios });
    }
    if (user.rol === "ADMIN_EMPRESA") {
      if (!empresaId && !user.empresaId) return ok({ usuarios: [] });
      const empId = empresaId || user.empresaId!;
      assertEmpresaAccess(user, empId);
      const usuarios = await db.user.findMany({
        where: { empresaId: empId, rol: { in: ["ADMIN_EMPRESA", "EMPLEADO"] } },
        orderBy: { createdAt: "desc" },
      });
      return ok({ usuarios });
    }
    return ok({ usuarios: [] });
  } catch (e) {
    return apiError(e);
  }
}

// POST /api/usuarios — superadmin crea admin empresa; admin empresa crea empleados
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return err("No autorizado", 401);
    const body = await req.json();
    const { nombre, email, password, telefono, rol, empresaId } = body;
    if (!nombre || !email || !password || !rol) return err("Faltan campos", 422);
    if (!["ADMIN_EMPRESA", "EMPLEADO"].includes(rol)) return err("Rol no permitido para creación", 422);

    let empId = empresaId;
    if (user.rol === "ADMIN_EMPRESA") {
      if (rol !== "EMPLEADO") return err("Solo puedes crear empleados", 422);
      empId = user.empresaId;
    } else if (user.rol === "SUPERADMIN") {
      if (!empId) return err("empresaId es obligatorio", 422);
    } else {
      return err("Sin permisos", 403);
    }
    assertEmpresaAccess(user, empId!);

    const existe = await db.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (existe) return err("Ya existe un usuario con ese email", 409);

    const nuevo = await db.user.create({
      data: {
        nombre, email: String(email).toLowerCase(), password: hashPassword(password),
        telefono: telefono || null, rol, empresaId: empId,
      },
      include: { empresa: true },
    });
    return ok({ usuario: nuevo });
  } catch (e) {
    return apiError(e);
  }
}
