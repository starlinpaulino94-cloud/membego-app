-- F3.3: publicaciones de empresa — eventos, noticias y beneficios.

CREATE TYPE "PostTipo" AS ENUM ('EVENTO', 'NOTICIA', 'BENEFICIO');

CREATE TABLE "company_posts" (
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
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "company_posts_companyId_fkey" FOREIGN KEY ("companyId")
    REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "company_posts_companyId_tipo_activo_idx"
  ON "company_posts"("companyId", "tipo", "activo");
CREATE INDEX "company_posts_tipo_fechaEvento_idx"
  ON "company_posts"("tipo", "fechaEvento");
