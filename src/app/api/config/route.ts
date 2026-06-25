import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRol } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/config — público (para landing, prueba social)
export async function GET() {
  try {
    let config = await db.config.findUnique({ where: { id: 1 } });
    if (!config) {
      config = await db.config.create({ data: { id: 1 } });
    }
    return ok({ config });
  } catch (e) {
    return apiError(e);
  }
}

// PATCH /api/config — solo admin/superadmin actualiza números de prueba social
export async function PATCH(req: NextRequest) {
  try {
    await requireRol("SUPERADMIN", "ADMIN_EMPRESA");
    const body = await req.json();
    const allowed = ["socialClientes", "socialVisitas", "socialPromociones", "socialNegocios", "socialVehiculos", "heroTitulo", "heroSubtitulo"];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (body[k] !== undefined) {
        if (["socialClientes", "socialVisitas", "socialPromociones", "socialNegocios", "socialVehiculos"].includes(k)) {
          data[k] = Number(body[k]) || 0;
        } else {
          data[k] = body[k] === "" ? null : body[k];
        }
      }
    }
    let config = await db.config.findUnique({ where: { id: 1 } });
    if (!config) config = await db.config.create({ data: { id: 1 } });
    const updated = await db.config.update({ where: { id: 1 }, data });
    return ok({ config: updated });
  } catch (e) {
    return apiError(e);
  }
}
