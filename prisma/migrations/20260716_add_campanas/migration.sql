-- F4.6: campañas que agrupan promociones y publicaciones.
CREATE TABLE "campanas" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "fechaInicio" TIMESTAMP(3),
  "fechaFin" TIMESTAMP(3),
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "campanas_companyId_fkey" FOREIGN KEY ("companyId")
    REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "campanas_companyId_activo_idx" ON "campanas"("companyId", "activo");

ALTER TABLE "promociones" ADD COLUMN "campanaId" TEXT;
ALTER TABLE "promociones" ADD CONSTRAINT "promociones_campanaId_fkey"
  FOREIGN KEY ("campanaId") REFERENCES "campanas" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "company_posts" ADD COLUMN "campanaId" TEXT;
ALTER TABLE "company_posts" ADD CONSTRAINT "company_posts_campanaId_fkey"
  FOREIGN KEY ("campanaId") REFERENCES "campanas" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
