-- Onboarding Fase 3B (paso 2 B2C): perfil ampliado del cliente. Aditivo.

ALTER TABLE "clientes" ADD COLUMN IF NOT EXISTS "ciudad" TEXT;
ALTER TABLE "clientes" ADD COLUMN IF NOT EXISTS "genero" TEXT;
ALTER TABLE "clientes" ADD COLUMN IF NOT EXISTS "idioma" TEXT;
ALTER TABLE "clientes" ADD COLUMN IF NOT EXISTS "notifPromos" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "clientes" ADD COLUMN IF NOT EXISTS "notifRecordatorios" BOOLEAN NOT NULL DEFAULT true;
