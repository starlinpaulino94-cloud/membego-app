import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, createSession, setSessionCookie, getCurrentUser } from "@/lib/auth";
import { ok, err, apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return err("Email y contraseña son obligatorios", 422);
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
