-- ============================================================================
-- FASE 3 · Capa social: seguir empresas + guardar promociones
-- ============================================================================
-- Ejecutar en el SQL Editor de Supabase. Idempotente: puede correrse varias
-- veces sin duplicar ni fallar.
--
-- Crea:
--   - company_follows        (User sigue Company, con bandera esFavorita)
--   - promociones_guardadas  (promociones guardadas por el cliente)
-- Backfill:
--   - Los clientes existentes de cada empresa quedan como seguidores, para
--     que no dejen de recibir notificaciones al pasar a "solo seguidores".
-- ============================================================================

-- 1. company_follows
CREATE TABLE IF NOT EXISTS "company_follows" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "esFavorita" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "company_follows_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "company_follows_companyId_fkey" FOREIGN KEY ("companyId")
    REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "company_follows_userId_companyId_key"
  ON "company_follows"("userId", "companyId");
CREATE INDEX IF NOT EXISTS "company_follows_companyId_idx"
  ON "company_follows"("companyId");
CREATE INDEX IF NOT EXISTS "company_follows_userId_esFavorita_idx"
  ON "company_follows"("userId", "esFavorita");

-- 2. promociones_guardadas
CREATE TABLE IF NOT EXISTS "promociones_guardadas" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "promocionId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "promociones_guardadas_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "promociones_guardadas_promocionId_fkey" FOREIGN KEY ("promocionId")
    REFERENCES "promociones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "promociones_guardadas_userId_promocionId_key"
  ON "promociones_guardadas"("userId", "promocionId");
CREATE INDEX IF NOT EXISTS "promociones_guardadas_userId_createdAt_idx"
  ON "promociones_guardadas"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "promociones_guardadas_promocionId_idx"
  ON "promociones_guardadas"("promocionId");

-- 3. Backfill de seguidores desde clientes existentes.
INSERT INTO "company_follows" ("id", "userId", "companyId")
SELECT gen_random_uuid()::text, u."id", c."companyId"
FROM "clientes" c
JOIN "users" u ON u."supabaseId" = c."supabaseId"
ON CONFLICT DO NOTHING;

-- Verificación rápida (opcional):
-- SELECT count(*) AS seguidores FROM "company_follows";
