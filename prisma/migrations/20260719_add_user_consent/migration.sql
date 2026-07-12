-- Onboarding Fase 1 (cumplimiento): rastro auditable de consentimiento.
-- Aceptación de términos (versión + momento) y opt-in de marketing.
-- Aditivo; los usuarios existentes quedan con NULL / marketing en false.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "termsVersion" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketingConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketingConsentAt" TIMESTAMP(3);
