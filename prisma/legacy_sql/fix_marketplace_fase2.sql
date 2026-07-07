-- FIX de producción: migración marketplace Fase 2 (20260706_add_marketplace_fase2)
-- que no se aplicó a prod. Detectado con verify_schema.sql (27 objetos faltantes:
-- 15 columnas en companies, 9 en promociones y 3 tablas).
--
-- Versión idempotente: ADD COLUMN / CREATE TABLE / CREATE INDEX IF NOT EXISTS.
-- Seguro reejecutar. Ejecutar en el SQL Editor de Supabase.

-- 1. Columnas de marketplace en companies
ALTER TABLE "companies"
  ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "featuredOrder" INTEGER,
  ADD COLUMN IF NOT EXISTS "bannerUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "provincia" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "pais" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "whatsapp" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "instagram" TEXT,
  ADD COLUMN IF NOT EXISTS "facebook" TEXT,
  ADD COLUMN IF NOT EXISTS "tiktok" TEXT,
  ADD COLUMN IF NOT EXISTS "googleMapsUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "totalMembersCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "activePromotionsCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "averageRating" NUMERIC(3,2);

CREATE INDEX IF NOT EXISTS "idx_companies_published_featured" ON "companies"("isPublished", "isFeatured");
CREATE INDEX IF NOT EXISTS "idx_companies_city_province" ON "companies"("ciudad", "provincia");
CREATE INDEX IF NOT EXISTS "idx_companies_type" ON "companies"("type");
CREATE INDEX IF NOT EXISTS "idx_companies_created" ON "companies"("createdAt");

-- 2. Columnas de marketplace en promociones
ALTER TABLE "promociones"
  ADD COLUMN IF NOT EXISTS "slug" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "tipo" VARCHAR(50) NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS "descuento" INTEGER,
  ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "featuredOrder" INTEGER,
  ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "shareCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE INDEX IF NOT EXISTS "idx_promociones_featured" ON "promociones"("isFeatured", "vigenciaHasta");
CREATE INDEX IF NOT EXISTS "idx_promociones_tipo" ON "promociones"("tipo");
CREATE INDEX IF NOT EXISTS "idx_promociones_created_at" ON "promociones"("createdAt");

-- 3. Tabla business_categories
CREATE TABLE IF NOT EXISTS "business_categories" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "slug" VARCHAR(100) NOT NULL UNIQUE,
  "icon" TEXT,
  "description" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_business_categories_active_order" ON "business_categories"("active", "order");

-- 4. Tabla company_to_categories (junction)
CREATE TABLE IF NOT EXISTS "company_to_categories" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "company_to_categories_companyId_categoryId_key" UNIQUE("companyId", "categoryId"),
  CONSTRAINT "company_to_categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE,
  CONSTRAINT "company_to_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "business_categories" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_company_to_categories_companyId" ON "company_to_categories"("companyId");
CREATE INDEX IF NOT EXISTS "idx_company_to_categories_categoryId" ON "company_to_categories"("categoryId");

-- 5. Tabla company_ratings
CREATE TABLE IF NOT EXISTS "company_ratings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "company_ratings_companyId_clienteId_key" UNIQUE("companyId", "clienteId"),
  CONSTRAINT "company_ratings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE,
  CONSTRAINT "company_ratings_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_company_ratings_companyId" ON "company_ratings"("companyId");
CREATE INDEX IF NOT EXISTS "idx_company_ratings_rating" ON "company_ratings"("rating");
