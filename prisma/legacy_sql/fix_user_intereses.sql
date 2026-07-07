-- ============================================================================
-- F5.2 · Intereses del cliente (categorías favoritas)
-- ============================================================================
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
CREATE TABLE IF NOT EXISTS "user_intereses" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_intereses_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "user_intereses_categoryId_fkey" FOREIGN KEY ("categoryId")
    REFERENCES "business_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_intereses_userId_categoryId_key" ON "user_intereses"("userId", "categoryId");
CREATE INDEX IF NOT EXISTS "user_intereses_categoryId_idx" ON "user_intereses"("categoryId");
