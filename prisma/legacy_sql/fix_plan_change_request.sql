-- FIX/feature de prod: columna memberships.planIdSolicitado (solicitud de cambio
-- de plan). Idempotente. Ejecutar en el SQL Editor de Supabase.
ALTER TABLE "memberships" ADD COLUMN IF NOT EXISTS "planIdSolicitado" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'memberships_planIdSolicitado_fkey'
  ) THEN
    ALTER TABLE "memberships"
      ADD CONSTRAINT "memberships_planIdSolicitado_fkey"
      FOREIGN KEY ("planIdSolicitado") REFERENCES "plans"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
