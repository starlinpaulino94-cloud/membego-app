-- ============================================================================
-- F4.6 · Campañas (agrupan promociones y publicaciones)
-- ============================================================================
-- Ejecutar en el SQL Editor de Supabase. Idempotente.

CREATE TABLE IF NOT EXISTS "campanas" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "fechaInicio" TIMESTAMP(3),
  "fechaFin" TIMESTAMP(3),
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "campanas_companyId_fkey" FOREIGN KEY ("companyId")
    REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "campanas_companyId_activo_idx" ON "campanas"("companyId", "activo");

ALTER TABLE "promociones" ADD COLUMN IF NOT EXISTS "campanaId" TEXT;
ALTER TABLE "company_posts" ADD COLUMN IF NOT EXISTS "campanaId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'promociones_campanaId_fkey') THEN
    ALTER TABLE "promociones" ADD CONSTRAINT "promociones_campanaId_fkey"
      FOREIGN KEY ("campanaId") REFERENCES "campanas" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'company_posts_campanaId_fkey') THEN
    ALTER TABLE "company_posts" ADD CONSTRAINT "company_posts_campanaId_fkey"
      FOREIGN KEY ("campanaId") REFERENCES "campanas" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
