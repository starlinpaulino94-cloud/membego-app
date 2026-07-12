-- ============================================================================
-- F3.3 · Publicaciones de empresa: eventos, noticias y beneficios
-- ============================================================================
-- Ejecutar en el SQL Editor de Supabase. Idempotente: puede correrse varias
-- veces sin duplicar ni fallar.
-- ============================================================================

-- 1. Enum PostTipo
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PostTipo') THEN
    CREATE TYPE "PostTipo" AS ENUM ('EVENTO', 'NOTICIA', 'BENEFICIO');
  END IF;
END $$;

-- 2. Tabla company_posts
CREATE TABLE IF NOT EXISTS "company_posts" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "tipo" "PostTipo" NOT NULL,
  "titulo" TEXT NOT NULL,
  "contenido" TEXT NOT NULL,
  "imagenUrl" TEXT,
  "fechaEvento" TIMESTAMP(3),
  "lugar" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "publicadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "company_posts_companyId_fkey" FOREIGN KEY ("companyId")
    REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "company_posts_companyId_tipo_activo_idx"
  ON "company_posts"("companyId", "tipo", "activo");
CREATE INDEX IF NOT EXISTS "company_posts_tipo_fechaEvento_idx"
  ON "company_posts"("tipo", "fechaEvento");

-- Verificación rápida (opcional):
-- SELECT count(*) FROM "company_posts";
