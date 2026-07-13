-- CreateEnum
CREATE TYPE "MarketingCampaignTipo" AS ENUM ('FLASH_SALE', 'OFERTA_DIA', 'FIN_DE_SEMANA', 'HAPPY_HOUR', 'PRIMERA_COMPRA', 'BIENVENIDA', 'REGRESO', 'CUMPLEANOS', 'POR_VENCER', 'PERSONALIZADA');

-- CreateEnum
CREATE TYPE "MarketingCampaignEstado" AS ENUM ('BORRADOR', 'ACTIVA', 'PAUSADA', 'FINALIZADA');

-- CreateTable
CREATE TABLE "marketing_campaigns" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tipo" "MarketingCampaignTipo" NOT NULL DEFAULT 'FLASH_SALE',
    "estado" "MarketingCampaignEstado" NOT NULL DEFAULT 'BORRADOR',
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagenUrl" TEXT,
    "bannerUrl" TEXT,
    "ctaTexto" TEXT,
    "ctaHref" TEXT,
    "colorPrimario" TEXT,
    "colorSecundario" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "horaInicioMin" INTEGER,
    "horaFinMin" INTEGER,
    "diasSemana" INTEGER[],
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "destacada" BOOLEAN NOT NULL DEFAULT false,
    "maxReclamos" INTEGER,
    "reclamosCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketing_campaigns_companyId_estado_fechaInicio_fechaFin_idx" ON "marketing_campaigns"("companyId", "estado", "fechaInicio", "fechaFin");

-- CreateIndex
CREATE INDEX "marketing_campaigns_estado_fechaFin_idx" ON "marketing_campaigns"("estado", "fechaFin");

-- AddForeignKey
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
