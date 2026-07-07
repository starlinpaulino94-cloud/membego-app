-- ============================================================================
-- F4.4 · Notas internas del CRM por cliente
-- ============================================================================
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
CREATE TABLE IF NOT EXISTS "cliente_notas" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clienteId" TEXT NOT NULL,
  "autorId" TEXT,
  "texto" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cliente_notas_clienteId_fkey" FOREIGN KEY ("clienteId")
    REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "cliente_notas_autorId_fkey" FOREIGN KEY ("autorId")
    REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "cliente_notas_clienteId_createdAt_idx"
  ON "cliente_notas"("clienteId", "createdAt");
