import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncEvent } from "@/lib/integration";
import { randomUUID } from "crypto";

// Genera (o reutiliza) un QR token único por cliente+empresa
export async function ensureQrToken(clienteId: string, empresaId: string) {
  let qr = await db.qrToken.findFirst({
    where: { clienteId, empresaId, activo: true },
  });
  if (!qr) {
    qr = await db.qrToken.create({
      data: {
        clienteId,
        empresaId,
        token: randomUUID(),
        activo: true,
      },
    });
    // Sincronizar evento QR_GENERADO
    await syncEvent(empresaId, "QR_GENERADO", { clienteId, qrToken: qr.token });
  }
  return qr;
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Manejo central de errores de API
export function apiError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg === "NO_AUTORIZADO") return err("No autorizado", 401);
  if (msg === "SIN_PERMISO") return err("Sin permisos suficientes", 403);
  if (msg === "EMPRESA_INVALIDA") return err("Acceso a empresa no permitido", 403);
  return err(msg, 400);
}
