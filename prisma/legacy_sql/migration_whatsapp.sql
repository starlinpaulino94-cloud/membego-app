-- Migration: add whatsapp_config table
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS "whatsapp_config" (
  "id"               TEXT         NOT NULL,
  "companyId"        TEXT         NOT NULL,
  "numero"           TEXT         NOT NULL,
  "mensajePlantilla" TEXT         NOT NULL DEFAULT 'Hola, quisiera más información.',
  "activo"           BOOLEAN      NOT NULL DEFAULT true,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt"        TIMESTAMP(3) NOT NULL,

  CONSTRAINT "whatsapp_config_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "whatsapp_config_companyId_key" UNIQUE ("companyId"),
  CONSTRAINT "whatsapp_config_companyId_fkey" FOREIGN KEY ("companyId")
    REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
