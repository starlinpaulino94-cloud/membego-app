-- ═══════════════════════════════════════════════════════════════════════════
-- FASE E6.1 · Índice de rendimiento del Referral Engine — IDEMPOTENTE
-- Ejecutar en el editor SQL de Supabase. Seguro de correr más de una vez.
-- Acelera la agregación por campaña (porCampana) a escala. El resto de las
-- métricas ya está cubierto por los índices compuestos de la Fase E6-A
-- (companyId,tipo,createdAt) y (companyId,tipo,visitorId).
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS "referral_events_meta_campana_idx"
  ON "referral_events" ((meta->>'campana'))
  WHERE tipo = 'CLICK';

-- Verificación (1 fila OK)
SELECT 'índice referral_events_meta_campana_idx' AS objeto,
       CASE WHEN to_regclass('public.referral_events_meta_campana_idx') IS NOT NULL
            THEN 'OK' ELSE 'FALTA' END AS estado;
