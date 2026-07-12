-- Onboarding Fase 2A: roles de equipo (Marketing, Supervisor) y campos de
-- empresa para el wizard (razón social, código postal, coordenadas, cobertura).
-- Aditivo e idempotente.

-- Nuevos valores del enum de roles. ADD VALUE es válido fuera de uso en la
-- misma transacción; solo se agregan, no se usan aquí.
ALTER TYPE "AppRole" ADD VALUE IF NOT EXISTS 'MARKETING';
ALTER TYPE "AppRole" ADD VALUE IF NOT EXISTS 'SUPERVISOR';

-- Campos nuevos de Company.
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "razonSocial" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "codigoPostal" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "latitud" DOUBLE PRECISION;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "longitud" DOUBLE PRECISION;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "zonaCobertura" TEXT;
