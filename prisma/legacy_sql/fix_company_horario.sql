-- ============================================================================
-- F4.1 · Horario de atención de la empresa
-- ============================================================================
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "horario" TEXT;
