-- Fase E6.1 · Índice funcional para agregación por campaña (porCampana):
-- acelera GROUP BY meta->>'campana' sobre los clics de una empresa a escala.
CREATE INDEX IF NOT EXISTS "referral_events_meta_campana_idx"
  ON "referral_events" ((meta->>'campana'))
  WHERE tipo = 'CLICK';
