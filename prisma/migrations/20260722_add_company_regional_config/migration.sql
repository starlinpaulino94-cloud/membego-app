-- Onboarding Fase 3A (paso 4 del wizard): configuración regional y de marca
-- por empresa. Aditivo e idempotente. Los defaults reflejan el estado actual
-- (RD$ / es-DO / America/Santo_Domingo) para no cambiar el comportamiento.

ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "moneda" TEXT NOT NULL DEFAULT 'DOP';
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "zonaHoraria" TEXT NOT NULL DEFAULT 'America/Santo_Domingo';
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "idioma" TEXT NOT NULL DEFAULT 'es-DO';
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "colorPrimario" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "politicaCancelacion" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "politicaPrivacidad" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "terminosEmpresa" TEXT;
