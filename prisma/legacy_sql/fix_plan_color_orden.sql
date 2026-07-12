-- ============================================================================
-- F4.3 · Color y orden de los planes
-- ============================================================================
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "color" TEXT;
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "orden" INTEGER NOT NULL DEFAULT 0;
