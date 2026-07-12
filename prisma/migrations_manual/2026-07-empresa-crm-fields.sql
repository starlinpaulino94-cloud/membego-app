-- Nuevos campos CRM para la tabla companies
-- Ejecutar en Supabase SQL Editor

ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now();
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "telefono" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "direccion" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "ciudad" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "categoria" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "website" TEXT;
