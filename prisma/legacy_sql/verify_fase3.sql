-- ============================================================================
-- Verificación de BD de producción · FASE 2 + FASE 3
-- ============================================================================
-- Ejecutar en el SQL Editor de Supabase.
-- RESULTADO ESPERADO: 0 filas ("Success. No rows returned").
-- Cada fila devuelta indica un elemento FALTANTE y qué SQL lo corrige.
-- ============================================================================

-- 1. Tablas requeridas
SELECT 'TABLA FALTANTE: ' || t.nombre || '  → ejecutar ' || t.fix AS problema
FROM (VALUES
  ('business_categories',    'fix_marketplace_fase2.sql'),
  ('company_to_categories',  'fix_marketplace_fase2.sql'),
  ('company_ratings',        'fix_marketplace_fase2.sql'),
  ('company_follows',        'fix_social_follow.sql'),
  ('promociones_guardadas',  'fix_social_follow.sql'),
  ('company_posts',          'fix_company_posts.sql')
) AS t(nombre, fix)
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = t.nombre
)

UNION ALL

-- 2. Enum PostTipo
SELECT 'ENUM FALTANTE: PostTipo  → ejecutar fix_company_posts.sql'
WHERE NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PostTipo')

UNION ALL

-- 3. Catálogo de categorías sembrado (17 esperadas)
SELECT 'CATEGORÍAS INCOMPLETAS: hay ' || count(*)::text ||
       ' de 17  → ejecutar seed_business_categories.sql'
FROM "business_categories"
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'business_categories'
)
HAVING count(*) < 17

UNION ALL

-- 4. Backfill de seguidores (cada cliente con usuario debe seguir su empresa)
SELECT 'BACKFILL SEGUIDORES INCOMPLETO: faltan ' || count(*)::text ||
       ' seguimientos  → re-ejecutar el paso 3 de fix_social_follow.sql'
FROM "clientes" c
JOIN "users" u ON u."supabaseId" = c."supabaseId"
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'company_follows'
  )
  AND NOT EXISTS (
    SELECT 1 FROM "company_follows" f
    WHERE f."userId" = u."id" AND f."companyId" = c."companyId"
  )
HAVING count(*) > 0;
