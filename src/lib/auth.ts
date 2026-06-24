import { cookies } from "next/headers";
import { randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "fx_session";
const SESSION_TTL_DAYS = 7;

export function hashPassword(password: string): string {
  const salt = randomUUID().replace(/-/g, "").slice(0, 16);
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = scryptSync(password, salt, 64);
  if (hashBuf.length !== testBuf.length) return false;
  return timingSafeEqual(hashBuf, testBuf);
}

export async function createSession(userId: string): Promise<string> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({
    data: { token, userId, expiresAt },
  });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await db.session.deleteMany({ where: { token } }).catch(() => {});
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function logoutCurrent() {
  const token = await getSessionToken();
  if (token) await destroySession(token);
  await clearSessionCookie();
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export type SessionUser = {
  id: string;
  email: string;
  nombre: string;
  telefono: string | null;
  rol: string;
  empresaId: string | null;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return {
    id: session.user.id,
    email: session.user.email,
    nombre: session.user.nombre,
    telefono: session.user.telefono,
    rol: session.user.rol,
    empresaId: session.user.empresaId,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("NO_AUTORIZADO");
  return user;
}

export async function requireRol(...roles: string[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.rol)) throw new Error("SIN_PERMISO");
  return user;
}

// Asegura que un usuario de empresa solo acceda a datos de SU empresa
export function assertEmpresaAccess(user: SessionUser, empresaId: string) {
  if (user.rol === "SUPERADMIN") return;
  if (user.empresaId !== empresaId) throw new Error("EMPRESA_INVALIDA");
}
