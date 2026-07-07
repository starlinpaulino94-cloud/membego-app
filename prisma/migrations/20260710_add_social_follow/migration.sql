-- FASE 3: capa social del marketplace — seguir empresas y guardar promociones.

-- 1. company_follows: User sigue Company (cross-empresa), con favorita.
CREATE TABLE "company_follows" (
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

CREATE UNIQUE INDEX "company_follows_userId_companyId_key"
  ON "company_follows"("userId", "companyId");
CREATE INDEX "company_follows_companyId_idx" ON "company_follows"("companyId");
CREATE INDEX "company_follows_userId_esFavorita_idx"
  ON "company_follows"("userId", "esFavorita");

-- 2. promociones_guardadas: promociones guardadas por el cliente.
CREATE TABLE "promociones_guardadas" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "promocionId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "promociones_guardadas_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "promociones_guardadas_promocionId_fkey" FOREIGN KEY ("promocionId")
    REFERENCES "promociones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "promociones_guardadas_userId_promocionId_key"
  ON "promociones_guardadas"("userId", "promocionId");
CREATE INDEX "promociones_guardadas_userId_createdAt_idx"
  ON "promociones_guardadas"("userId", "createdAt");
CREATE INDEX "promociones_guardadas_promocionId_idx"
  ON "promociones_guardadas"("promocionId");

-- 3. Backfill: los clientes existentes de cada empresa quedan como seguidores
-- para que sigan recibiendo notificaciones de promociones tras el cambio a
-- "solo seguidores".
INSERT INTO "company_follows" ("id", "userId", "companyId")
SELECT gen_random_uuid()::text, u."id", c."companyId"
FROM "clientes" c
JOIN "users" u ON u."supabaseId" = c."supabaseId"
ON CONFLICT DO NOTHING;
