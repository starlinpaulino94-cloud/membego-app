import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie, getCurrentUser } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(`login:${ip}`, 10, 60 * 1000)) {
      return err("Demasiadas solicitudes. Intenta más tarde.", 429);
    }
    const parsed = loginSchema.safeParse(await req.json());
    if (!parsed.success) return err("Datos inválidos", 422);
    const { email, password } = parsed.data;
    const user = await db.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user) return err("Credenciales inválidas", 401);
    if (!verifyPassword(password, user.password)) return err("Credenciales inválidas", 401);
    const token = await createSession(user.id);
    await setSessionCookie(token);
    return ok({
      user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol, empresaId: user.empresaId, telefono: user.telefono },
    });
  } catch (e) {
    return apiError(e);
  }
}

// GET /api/auth/me
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return ok({ user: null });
    return ok({ user });
  } catch (e) {
    return apiError(e);
  }
}
