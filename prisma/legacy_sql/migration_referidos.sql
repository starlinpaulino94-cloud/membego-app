-- Migration: add referral engine (referidos + reglas_recompensa)
-- Run this in the Supabase SQL editor

ALTER TYPE "AuditAccion" ADD VALUE 'REFERIDO_COMPLETADO';
ALTER TYPE "AuditAccion" ADD VALUE 'RECOMPENSA_OTORGADA';
ALTER TYPE "NotifTipo" ADD VALUE 'RECOMPENSA_REFERIDO';

ALTER TABLE "clientes" ADD COLUMN "codigoReferido" TEXT;
UPDATE "clientes" SET "codigoReferido" = "id" WHERE "codigoReferido" IS NULL;
ALTER TABLE "clientes" ALTER COLUMN "codigoReferido" SET NOT NULL;
CREATE UNIQUE INDEX "clientes_codigoReferido_key" ON "clientes"("codigoReferido");

CREATE TYPE "ReferidoEstado" AS ENUM ('PENDIENTE', 'COMPLETADO');
CREATE TYPE "CondicionRecompensa" AS ENUM ('N_REFERIDOS_COMPLETADOS');
CREATE TYPE "TipoRecompensa" AS ENUM ('LAVADOS_GRATIS', 'DESCUENTO_PORCENTAJE', 'DESCUENTO_MONTO');

CREATE TABLE IF NOT EXISTS "referidos" (
  "id"                 TEXT             NOT NULL,
  "companyId"          TEXT             NOT NULL,
  "referenteClienteId" TEXT             NOT NULL,
  "referidoClienteId"  TEXT             NOT NULL,
  "estado"             "ReferidoEstado" NOT NULL DEFAULT 'PENDIENTE',
  "recompensaAplicada" BOOLEAN          NOT NULL DEFAULT false,
  "createdAt"          TIMESTAMP(3)     NOT NULL DEFAULT now(),
  "completadoEn"       TIMESTAMP(3),

  CONSTRAINT "referidos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "referidos_referidoClienteId_key" UNIQUE ("referidoClienteId"),
  CONSTRAINT "referidos_companyId_fkey" FOREIGN KEY ("companyId")
    REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "referidos_referenteClienteId_fkey" FOREIGN KEY ("referenteClienteId")
    REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "referidos_referidoClienteId_fkey" FOREIGN KEY ("referidoClienteId")
    REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "referidos_companyId_referenteClienteId_idx"
  ON "referidos"("companyId", "referenteClienteId");

CREATE TABLE IF NOT EXISTS "reglas_recompensa" (
  "id"              TEXT                   NOT NULL,
  "companyId"       TEXT                   NOT NULL,
  "nombre"          TEXT                   NOT NULL,
  "condicion"       "CondicionRecompensa"  NOT NULL,
  "valorCondicion"  INTEGER                NOT NULL,
  "tipoRecompensa"  "TipoRecompensa"       NOT NULL,
  "valorRecompensa" DECIMAL(10,2)          NOT NULL,
  "activo"          BOOLEAN                NOT NULL DEFAULT true,
  "createdAt"       TIMESTAMP(3)           NOT NULL DEFAULT now(),
  "updatedAt"       TIMESTAMP(3)           NOT NULL,

  CONSTRAINT "reglas_recompensa_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "reglas_recompensa_companyId_fkey" FOREIGN KEY ("companyId")
    REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "reglas_recompensa_companyId_activo_idx"
  ON "reglas_recompensa"("companyId", "activo");
