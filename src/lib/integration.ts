import { db } from "@/lib/db";

// Intenta sincronizar un evento hacia las integraciones activas de la empresa.
// No lanza: siempre registra el resultado en IntegrationLog.
export async function syncEvent(
  empresaId: string,
  evento: string,
  payload: Record<string, unknown>
): Promise<void> {
  const integraciones = await db.integracion.findMany({
    where: { empresaId, estado: "ACTIVA" },
  });
  if (integraciones.length === 0) return;

  for (const integ of integraciones) {
    // Filtrar por eventos configurados
    let eventosConfig: string[] = [];
    try {
      eventosConfig = integ.eventos ? JSON.parse(integ.eventos) : [];
    } catch {
      eventosConfig = [];
    }
    if (eventosConfig.length > 0 && !eventosConfig.includes(evento)) continue;

    if (integ.tipoIntegracion === "MANUAL") {
      await db.integrationLog.create({
        data: {
          integracionId: integ.id,
          empresaId,
          evento,
          payload: JSON.stringify(payload),
          estado: "PENDIENTE",
          respuesta: "Sincronización manual pendiente",
        },
      });
      continue;
    }

    if (integ.tipoIntegracion === "WEBHOOK" || integ.tipoIntegracion === "API_REST") {
      const url = integ.webhookUrl || integ.apiUrl;
      if (!url) {
        await db.integrationLog.create({
          data: {
            integracionId: integ.id,
            empresaId,
            evento,
            payload: JSON.stringify(payload),
            estado: "ERROR",
            error: "No hay URL configurada para la integración",
          },
        });
        continue;
      }
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (integ.apiKey) headers["x-api-key"] = integ.apiKey;
        if (integ.tokenSecreto) headers["x-token-secreto"] = integ.tokenSecreto;
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ evento, empresaId, data: payload, timestamp: new Date().toISOString() }),
          signal: AbortSignal.timeout(8000),
        });
        const texto = await res.text();
        const ok = res.ok;
        await db.integrationLog.create({
          data: {
            integracionId: integ.id,
            empresaId,
            evento,
            payload: JSON.stringify(payload),
            respuesta: texto.slice(0, 2000),
            estado: ok ? "EXITOSO" : "ERROR",
            error: ok ? null : `HTTP ${res.status}`,
          },
        });
        if (ok) {
          await db.integracion.update({
            where: { id: integ.id },
            data: { ultimaSincronizacion: new Date() },
          });
        }
      } catch (err) {
        await db.integrationLog.create({
          data: {
            integracionId: integ.id,
            empresaId,
            evento,
            payload: JSON.stringify(payload),
            estado: "ERROR",
            error: err instanceof Error ? err.message : String(err),
          },
        });
      }
    }

    if (integ.tipoIntegracion === "CSV") {
      // Para CSV solo registramos el evento; la exportación se hace por endpoint
      await db.integrationLog.create({
        data: {
          integracionId: integ.id,
          empresaId,
          evento,
          payload: JSON.stringify(payload),
          estado: "EXITOSO",
          respuesta: "Evento encolado para exportación CSV",
        },
      });
    }
  }
}

// Reintenta un log fallido
export async function retryLog(logId: string): Promise<void> {
  const log = await db.integrationLog.findUnique({ where: { id: logId }, include: { integracion: true } });
  if (!log || !log.integracion) return;
  if (log.estado !== "ERROR") return;
  const payload = log.payload ? JSON.parse(log.payload) : {};
  await syncEvent(log.empresaId, log.evento, payload);
}
