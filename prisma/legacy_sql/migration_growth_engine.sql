-- Growth Engine: Campañas de Invitación ("Invita y Gana")
-- Migración para crear las tablas del sistema de campañas de invitación.
-- Ejecutar manualmente contra la BD de producción.

-- Enums
DO $$ BEGIN
  CREATE TYPE "CampanaInvitacionEstado" AS ENUM ('BORRADOR', 'ACTIVA', 'PAUSADA', 'FINALIZADA');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "InvitacionEventoTipo" AS ENUM (
    'COMPARTIDA', 'ENLACE_ABIERTO', 'LANDING_VISTA',
    'REGISTRO_INICIADO', 'REGISTRO_COMPLETADO', 'PREMIO_RECLAMADO',
    'MEMBRESIA_ADQUIRIDA', 'PRIMER_CANJE', 'CONVERSION_FINAL'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tabla principal: campañas de invitación
CREATE TABLE IF NOT EXISTS "campanas_invitacion" (
  "id"                 TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "companyId"          TEXT NOT NULL,
  "slug"               TEXT NOT NULL,
  "nombre"             TEXT NOT NULL,
  "titulo"             TEXT NOT NULL,
  "descripcion"        TEXT NOT NULL,
  "textoLanding"       TEXT,
  "imagenUrl"          TEXT,
  "bannerUrl"          TEXT,
  "metaRegistros"      INTEGER NOT NULL,
  "beneficioInvitante" JSONB NOT NULL,
  "beneficioInvitado"  JSONB NOT NULL,
  "fechaInicio"        TIMESTAMP(3) NOT NULL,
  "fechaFin"           TIMESTAMP(3) NOT NULL,
  "maxPremios"         INTEGER,
  "premiosOtorgados"   INTEGER NOT NULL DEFAULT 0,
  "estado"             "CampanaInvitacionEstado" NOT NULL DEFAULT 'BORRADOR',
  "colorPrimario"      TEXT,
  "colorSecundario"    TEXT,
  "orden"              INTEGER NOT NULL DEFAULT 0,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "campanas_invitacion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "campanas_invitacion_slug_key" UNIQUE ("slug"),
  CONSTRAINT "campanas_invitacion_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "campanas_invitacion_companyId_estado_idx"
  ON "campanas_invitacion"("companyId", "estado");
CREATE INDEX IF NOT EXISTS "campanas_invitacion_estado_fechaFin_idx"
  ON "campanas_invitacion"("estado", "fechaFin");

-- Tabla de progreso por cliente por campaña
CREATE TABLE IF NOT EXISTS "invitacion_progresos" (
  "id"                    TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "campanaId"             TEXT NOT NULL,
  "clienteId"             TEXT NOT NULL,
  "companyId"             TEXT NOT NULL,
  "registrosCompletados"  INTEGER NOT NULL DEFAULT 0,
  "metaAlcanzada"         BOOLEAN NOT NULL DEFAULT false,
  "premioReclamado"       BOOLEAN NOT NULL DEFAULT false,
  "benefitGrantId"        TEXT,
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "invitacion_progresos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "invitacion_progresos_campanaId_clienteId_key"
    UNIQUE ("campanaId", "clienteId"),
  CONSTRAINT "invitacion_progresos_campanaId_fkey"
    FOREIGN KEY ("campanaId") REFERENCES "campanas_invitacion"("id") ON DELETE CASCADE,
  CONSTRAINT "invitacion_progresos_clienteId_fkey"
    FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "invitacion_progresos_clienteId_idx"
  ON "invitacion_progresos"("clienteId");

-- Tabla de eventos del embudo
CREATE TABLE IF NOT EXISTS "invitacion_eventos" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "campanaId"   TEXT NOT NULL,
  "clienteId"   TEXT,
  "companyId"   TEXT NOT NULL,
  "tipo"        "InvitacionEventoTipo" NOT NULL,
  "canal"       TEXT,
  "dispositivo" TEXT,
  "ipHash"      TEXT,
  "meta"        JSONB NOT NULL DEFAULT '{}',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "invitacion_eventos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "invitacion_eventos_campanaId_fkey"
    FOREIGN KEY ("campanaId") REFERENCES "campanas_invitacion"("id") ON DELETE CASCADE,
  CONSTRAINT "invitacion_eventos_clienteId_fkey"
    FOREIGN KEY ("clienteId") REFERENCES "clientes"("id")
);

CREATE INDEX IF NOT EXISTS "invitacion_eventos_campanaId_tipo_idx"
  ON "invitacion_eventos"("campanaId", "tipo");
CREATE INDEX IF NOT EXISTS "invitacion_eventos_campanaId_clienteId_idx"
  ON "invitacion_eventos"("campanaId", "clienteId");

-- Agregar FK opcional de campaña al modelo Referido existente
ALTER TABLE "referidos"
  ADD COLUMN IF NOT EXISTS "campanaInvitacionId" TEXT;

DO $$ BEGIN
  ALTER TABLE "referidos"
    ADD CONSTRAINT "referidos_campanaInvitacionId_fkey"
    FOREIGN KEY ("campanaInvitacionId") REFERENCES "campanas_invitacion"("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "referidos_campanaInvitacionId_idx"
  ON "referidos"("campanaInvitacionId");
