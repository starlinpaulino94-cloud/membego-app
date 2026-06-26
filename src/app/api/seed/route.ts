import { NextRequest } from "next/server";
import { runSeed } from "@/lib/seed";
import { ok, err, apiError } from "@/lib/api";
import { requireRol } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/seed — ejecuta el seed idempotente
export async function POST(_req: NextRequest) {
  try {
    await requireRol("SUPERADMIN");
    const result = await runSeed();
    return ok(result);
  } catch (e) {
    if (e instanceof Error && (e.message === "NO_AUTORIZADO" || e.message === "SIN_PERMISO")) {
      return err("No autorizado", 401);
    }
    return apiError(e);
  }
}
