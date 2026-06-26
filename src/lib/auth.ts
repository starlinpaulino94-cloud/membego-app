import { cookies } from "next/headers";
import { randomUUID, scryptSync, timingSafeEqual, createHmac } from "crypto";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "pd_session";
const SESSION_TTL_DAYS = 7;

// HMAC signing for session tokens
function getSessionSecret(): string {
  return process.env.SESSION_SECRET || "dev-secret-change-in-prod";
}

export function signToken(token: string): string {
  const hmac = createHmac("sha256", getSessionSecret()).update(token).digest("hex");
  return token + "." + hmac;
}

export function verifyToken(signed: string): string | null {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;
  const token = signed.slice(0, lastDot);
  const hmac = signed.slice(lastDot + 1);
  const expected = createHmac("sha256", getSessionSecret()).update(token).digest("hex");
  const hmacBuf = Buffer.from(hmac, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (hmacBuf.length !== expectedBuf.length) return null;
  try {
    if (!timingSafeEqual(hmacBuf, expectedBuf)) return null;
  } catch {
    return null;
  }
  return token;
}

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
  // Return the signed token to be stored in cookie
  return signToken(token);
}

export async function destroySession(token: string): Promise<void> {
  await db.session.deleteMany({ where: { token } }).catch(() => {});
}

export async function setSessionCookie(signedToken: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, signedToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function logoutCurrent() {
  const rawCookie = await getSessionToken();
  if (rawCookie) {
    const token = verifyToken(rawCookie);
    if (token) await destroySession(token);
  }
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
  const rawCookie = await getSessionToken();
  if (!rawCookie) return null;
  const token = verifyToken(rawCookie);
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
