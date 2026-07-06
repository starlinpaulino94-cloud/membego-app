-- Fase G (Auditoría): índices de rendimiento faltantes.
-- Postgres no crea índices para claves foráneas automáticamente, y varios
-- filtros calientes (por companyId / clienteId / fechaVisita) hacían scans.
-- Todos son aditivos e idempotentes.

-- clientes: filtros solo por empresa (adminMetrics, reportes, /admin/clientes).
CREATE INDEX IF NOT EXISTS "clientes_companyId_idx" ON "clientes"("companyId");

-- visits: historial por cliente, detalle por membresía y rangos por fecha.
CREATE INDEX IF NOT EXISTS "visits_clienteId_idx" ON "visits"("clienteId");
CREATE INDEX IF NOT EXISTS "visits_membershipId_idx" ON "visits"("membershipId");
CREATE INDEX IF NOT EXISTS "visits_fechaVisita_idx" ON "visits"("fechaVisita");

-- vehiculos: FK por cliente.
CREATE INDEX IF NOT EXISTS "vehiculos_clienteId_idx" ON "vehiculos"("clienteId");

-- users: listados/conteos de empleados por empresa.
CREATE INDEX IF NOT EXISTS "users_companyId_idx" ON "users"("companyId");
