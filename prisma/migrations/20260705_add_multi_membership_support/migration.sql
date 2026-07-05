-- AddColumn companyId to memberships
ALTER TABLE "memberships" ADD COLUMN "companyId" TEXT;

-- Populate companyId from cliente.companyId relationship
UPDATE "memberships" m
SET "companyId" = c."companyId"
FROM "clientes" c
WHERE m."clienteId" = c."id" AND m."companyId" IS NULL;

-- Make companyId NOT NULL
ALTER TABLE "memberships" ALTER COLUMN "companyId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;

-- Add indexes
CREATE INDEX "memberships_companyId_idx" ON "memberships"("companyId");

-- Add unique constraint (clienteId, companyId)
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_clienteId_companyId_key" UNIQUE("clienteId", "companyId");

-- AddColumn membresiaId to qr_tokens
ALTER TABLE "qr_tokens" ADD COLUMN "membresiaId" TEXT;

-- Populate membresiaId from latest membership per client
UPDATE "qr_tokens" q
SET "membresiaId" = (
  SELECT m."id"
  FROM "memberships" m
  WHERE m."clienteId" = q."clienteId"
  ORDER BY m."createdAt" DESC
  LIMIT 1
);

-- Make membresiaId NOT NULL
ALTER TABLE "qr_tokens" ALTER COLUMN "membresiaId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "qr_tokens" ADD CONSTRAINT "qr_tokens_membresiaId_fkey"
  FOREIGN KEY ("membresiaId") REFERENCES "memberships"("id") ON DELETE CASCADE;

-- Add index
CREATE INDEX "qr_tokens_membresiaId_idx" ON "qr_tokens"("membresiaId");
