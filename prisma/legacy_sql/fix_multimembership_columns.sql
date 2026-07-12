-- FIX de producción: columnas de la migración multi-membresía que faltan.
-- Síntoma: "The column memberships.companyId does not exist in the current database"
-- en /mis-membresias. La migración 20260705_add_multi_membership_support no se
-- aplicó a prod.
--
-- Todo es idempotente (IF NOT EXISTS / WHERE IS NULL): seguro reejecutar y no
-- toca datos ya correctos. Ejecutar en el SQL Editor de Supabase.

-- 1. memberships.companyId + backfill desde el cliente
ALTER TABLE "memberships" ADD COLUMN IF NOT EXISTS "companyId" TEXT;

UPDATE "memberships" m
SET "companyId" = c."companyId"
FROM "clientes" c
WHERE m."clienteId" = c."id" AND m."companyId" IS NULL;

-- 2. qr_tokens.activo (usado para filtrar el QR vigente)
ALTER TABLE "qr_tokens" ADD COLUMN IF NOT EXISTS "activo" BOOLEAN NOT NULL DEFAULT true;

-- 3. qr_tokens.membresiaId + backfill a la última membresía del cliente
ALTER TABLE "qr_tokens" ADD COLUMN IF NOT EXISTS "membresiaId" TEXT;

UPDATE "qr_tokens" q
SET "membresiaId" = (
  SELECT m."id"
  FROM "memberships" m
  WHERE m."clienteId" = q."clienteId"
  ORDER BY m."createdAt" DESC
  LIMIT 1
)
WHERE q."membresiaId" IS NULL;

-- 4. Índices (rendimiento; el ORM los espera)
CREATE INDEX IF NOT EXISTS "memberships_companyId_idx" ON "memberships"("companyId");
CREATE INDEX IF NOT EXISTS "qr_tokens_membresiaId_idx" ON "qr_tokens"("membresiaId");

-- Verificación: ambas deben devolver la columna.
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'memberships' AND column_name = 'companyId';
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'qr_tokens' AND column_name IN ('activo','membresiaId');
