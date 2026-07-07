-- F4.3: color y orden de presentación de los planes.
ALTER TABLE "plans" ADD COLUMN "color" TEXT;
ALTER TABLE "plans" ADD COLUMN "orden" INTEGER NOT NULL DEFAULT 0;
