-- B-1.4: Backfill Legacy Promociones → Universal Promotions
--
-- Idempotente: solo inserta registros cuyo legacyId no exista ya en promotions.
-- Seguro de re-ejecutar cuantas veces sea necesario.
--
-- Mapeo de estados:
--   archivada = true                → 'ARCHIVED'
--   archivada = false, activo = true  → 'ACTIVE'
--   archivada = false, activo = false → 'PAUSED'
--
-- Ejecutar dentro de una transacción:
--   BEGIN; \i backfill-promotions-legacy-to-universal.sql; COMMIT;

-- 1. Insertar en promotions las legacy que aún no estén vinculadas.
INSERT INTO promotions (
  id,
  "companyId",
  nombre,
  descripcion,
  categoria,
  status,
  prioridad,
  "inicioEn",
  "finEn",
  config,
  metadata,
  version,
  "creadoPorId",
  "editadoPorId",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  p."companyId",
  p.titulo,
  p.descripcion,
  p.tipo,
  CASE
    WHEN p.archivada = true THEN 'ARCHIVED'::"PromotionStatus"
    WHEN p.activo = true    THEN 'ACTIVE'::"PromotionStatus"
    ELSE                         'PAUSED'::"PromotionStatus"
  END,
  p.prioridad,
  p."vigenciaDesde",
  p."vigenciaHasta",
  jsonb_build_object(
    'tipo',        p.tipo,
    'descuento',   p.descuento,
    'codigo',      p.codigo,
    'visibilidad', p.visibilidad,
    'imagenUrl',   p."imagenUrl",
    'campanaId',   p."campanaId",
    'tags',        COALESCE(to_jsonb(p.tags), '[]'::jsonb)
  ),
  jsonb_build_object('legacyId', p.id),
  1,
  NULL,
  NULL,
  p."createdAt",
  p."updatedAt"
FROM promociones p
WHERE NOT EXISTS (
  SELECT 1 FROM promotions u
  WHERE u.metadata->>'legacyId' = p.id
);

-- 2. Crear restricciones MAX_USES_TOTAL para las que tengan maxCanjes.
INSERT INTO promotion_restrictions (
  id,
  "promotionId",
  tipo,
  valor,
  config,
  activa,
  "createdAt"
)
SELECT
  gen_random_uuid()::text,
  u.id,
  'MAX_USES_TOTAL',
  p."maxCanjes",
  '{}'::json,
  true,
  NOW()
FROM promociones p
JOIN promotions u ON u.metadata->>'legacyId' = p.id
WHERE p."maxCanjes" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM promotion_restrictions r
    WHERE r."promotionId" = u.id
      AND r.tipo = 'MAX_USES_TOTAL'
  );

-- 3. Verificación (no modifica datos).
SELECT
  (SELECT count(*) FROM promociones) AS legacy_total,
  (SELECT count(*) FROM promotions WHERE metadata->>'legacyId' IS NOT NULL) AS universal_linked,
  (SELECT count(*) FROM promociones p
   WHERE NOT EXISTS (
     SELECT 1 FROM promotions u WHERE u.metadata->>'legacyId' = p.id
   )) AS missing;
