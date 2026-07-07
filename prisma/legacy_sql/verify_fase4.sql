-- ============================================================================
-- Verificación de BD de producción · FASE 4 (panel empresarial)
-- ============================================================================
-- Ejecutar en el SQL Editor de Supabase.
-- RESULTADO ESPERADO: 0 filas ("Success. No rows returned").
-- Cada fila devuelta indica un elemento FALTANTE y qué SQL lo corrige.
-- ============================================================================

-- 1. Columnas requeridas
SELECT 'COLUMNA FALTANTE: ' || c.tabla || '.' || c.columna ||
       '  → ejecutar ' || c.fix AS problema
FROM (VALUES
  -- F4.1
  ('companies',     'horario',     'fix_company_horario.sql'),
  -- F4.2
  ('promociones',   'visibilidad', 'fix_promociones_v2.sql'),
  ('promociones',   'maxCanjes',   'fix_promociones_v2.sql'),
  ('promociones',   'canjes',      'fix_promociones_v2.sql'),
  ('promociones',   'prioridad',   'fix_promociones_v2.sql'),
  ('promociones',   'archivada',   'fix_promociones_v2.sql'),
  -- F4.3
  ('plans',         'color',       'fix_plan_color_orden.sql'),
  ('plans',         'orden',       'fix_plan_color_orden.sql'),
  -- F4.6
  ('promociones',   'campanaId',   'fix_campanas.sql'),
  ('company_posts', 'campanaId',   'fix_campanas.sql')
) AS c(tabla, columna, fix)
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.columns col
  WHERE col.table_schema = 'public'
    AND col.table_name = c.tabla
    AND col.column_name = c.columna
)

UNION ALL

-- 2. Tablas requeridas
SELECT 'TABLA FALTANTE: ' || t.nombre || '  → ejecutar ' || t.fix
FROM (VALUES
  ('cliente_notas', 'fix_cliente_notas.sql'),  -- F4.4
  ('campanas',      'fix_campanas.sql')        -- F4.6
) AS t(nombre, fix)
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = t.nombre
)

UNION ALL

-- 3. Foreign keys de campañas
SELECT 'FK FALTANTE: ' || f.nombre || '  → re-ejecutar fix_campanas.sql'
FROM (VALUES
  ('promociones_campanaId_fkey'),
  ('company_posts_campanaId_fkey')
) AS f(nombre)
WHERE NOT EXISTS (
  SELECT 1 FROM pg_constraint WHERE conname = f.nombre
);
