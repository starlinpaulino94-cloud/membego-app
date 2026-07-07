-- Migration: add promociones table
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS "promociones" (
  "id"            TEXT         NOT NULL,
  "companyId"     TEXT         NOT NULL,
  "titulo"        TEXT         NOT NULL,
  "descripcion"   TEXT         NOT NULL,
  "imagenUrl"     TEXT,
  "vigenciaDesde" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "vigenciaHasta" TIMESTAMP(3),
  "activo"        BOOLEAN      NOT NULL DEFAULT true,
  "publicadaEn"   TIMESTAMP(3) NOT NULL DEFAULT now(),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMP(3) NOT NULL,

  CONSTRAINT "promociones_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "promociones_companyId_fkey" FOREIGN KEY ("companyId")
    REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "promociones_companyId_activo_idx"
  ON "promociones"("companyId", "activo");
