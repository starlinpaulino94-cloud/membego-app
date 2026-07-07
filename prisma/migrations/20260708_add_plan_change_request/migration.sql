-- Solicitud de cambio de plan: el cliente pide cambiar de plan mientras su
-- membresía sigue ACTIVA; el admin lo aprueba y se aplica. Aditivo.
ALTER TABLE "memberships" ADD COLUMN "planIdSolicitado" TEXT;

ALTER TABLE "memberships"
  ADD CONSTRAINT "memberships_planIdSolicitado_fkey"
  FOREIGN KEY ("planIdSolicitado") REFERENCES "plans"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
