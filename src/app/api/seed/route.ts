import { NextRequest } from "next/server";
import { runSeed } from "@/lib/seed";
import { ok, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/seed — ejecuta el seed idempotente
export async function POST(_req: NextRequest) {
  try {
    const result = await runSeed();
    return ok(result);
  } catch (e) {
    return apiError(e);
  }
}
