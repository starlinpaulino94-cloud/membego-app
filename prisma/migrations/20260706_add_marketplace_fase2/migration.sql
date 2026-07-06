-- FASE 2: Marketplace de Empresas - Migration
-- Adds marketplace discovery features while maintaining backward compatibility

-- 1. Add marketplace fields to companies
ALTER TABLE "companies"
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "featuredOrder" INTEGER,
ADD COLUMN "bannerUrl" TEXT,
ADD COLUMN "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "provincia" VARCHAR(100),
ADD COLUMN "pais" VARCHAR(100),
ADD COLUMN "whatsapp" VARCHAR(20),
ADD COLUMN "instagram" TEXT,
ADD COLUMN "facebook" TEXT,
ADD COLUMN "tiktok" TEXT,
ADD COLUMN "googleMapsUrl" TEXT,
ADD COLUMN "totalMembersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "activePromotionsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "averageRating" NUMERIC(3,2);

-- 2. Add indexes for marketplace discovery
CREATE INDEX "idx_companies_published_featured" ON "companies"("isPublished", "isFeatured");
CREATE INDEX "idx_companies_city_province" ON "companies"("ciudad", "provincia");
CREATE INDEX "idx_companies_type" ON "companies"("type");
CREATE INDEX "idx_companies_created" ON "companies"("createdAt");

-- 3. Add marketplace fields to promociones
ALTER TABLE "promociones"
ADD COLUMN "slug" VARCHAR(200),
ADD COLUMN "tipo" VARCHAR(50) NOT NULL DEFAULT 'general',
ADD COLUMN "descuento" INTEGER,
ADD COLUMN "codigo" VARCHAR(50),
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "featuredOrder" INTEGER,
ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "shareCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 4. Add indexes for promociones
CREATE INDEX "idx_promociones_featured" ON "promociones"("isFeatured", "vigenciaHasta");
CREATE INDEX "idx_promociones_tipo" ON "promociones"("tipo");
CREATE INDEX "idx_promociones_created_at" ON "promociones"("createdAt");

-- 5. Create business_categories table
CREATE TABLE "business_categories" (
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

CREATE INDEX "idx_business_categories_active_order" ON "business_categories"("active", "order");

-- 6. Create company_to_categories junction table
CREATE TABLE "company_to_categories" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "company_to_categories_companyId_categoryId_key" UNIQUE("companyId", "categoryId"),
  CONSTRAINT "company_to_categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE,
  CONSTRAINT "company_to_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "business_categories" ("id") ON DELETE CASCADE
);

CREATE INDEX "idx_company_to_categories_companyId" ON "company_to_categories"("companyId");
CREATE INDEX "idx_company_to_categories_categoryId" ON "company_to_categories"("categoryId");

-- 7. Create company_ratings table (future-ready for reviews)
CREATE TABLE "company_ratings" (
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

CREATE INDEX "idx_company_ratings_companyId" ON "company_ratings"("companyId");
CREATE INDEX "idx_company_ratings_rating" ON "company_ratings"("rating");
