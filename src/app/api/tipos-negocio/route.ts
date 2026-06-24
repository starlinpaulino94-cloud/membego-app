import { db } from "@/lib/db";
import { ok, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/tipos-negocio — lista tipos de negocio con sus campos dinámicos
export async function GET() {
  try {
    const tipos = await db.tipoNegocio.findMany({
      include: { camposDef: { orderBy: { orden: "asc" } } },
      orderBy: { createdAt: "asc" },
    });
    return ok({ tipos });
  } catch (e) {
    return apiError(e);
  }
}
