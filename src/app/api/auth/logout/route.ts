import { NextRequest } from "next/server";
import { logoutCurrent } from "@/lib/auth";
import { ok, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/auth/logout
export async function POST(_req: NextRequest) {
  try {
    await logoutCurrent();
    return ok({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
