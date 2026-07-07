-- ============================================================================
-- Seed de categorías de negocio (FASE 2 · Marketplace)
-- ============================================================================
-- Rellena la tabla business_categories con el catálogo base de categorías.
-- Sin estas filas, las pestañas y filtros de categoría del directorio público
-- (getCategoriesPublic) aparecen vacíos.
--
-- Idempotente: puede ejecutarse varias veces sin duplicar (ON CONFLICT DO
-- NOTHING cubre las restricciones UNIQUE de name y slug).
-- El icono se renderiza como texto directo en <CategoryTabs>, por eso son emojis.
-- ============================================================================

INSERT INTO "business_categories" ("id", "name", "slug", "icon", "order", "active", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Restaurantes',    'restaurantes',    '🍽️', 1,  true, now(), now()),
  (gen_random_uuid()::text, 'Cafeterías',      'cafeterias',      '☕',  2,  true, now(), now()),
  (gen_random_uuid()::text, 'Lavados',         'lavados',         '🚗',  3,  true, now(), now()),
  (gen_random_uuid()::text, 'Gimnasios',       'gimnasios',       '💪',  4,  true, now(), now()),
  (gen_random_uuid()::text, 'Spa',             'spa',             '💆',  5,  true, now(), now()),
  (gen_random_uuid()::text, 'Salud',           'salud',           '🩺',  6,  true, now(), now()),
  (gen_random_uuid()::text, 'Clínicas',        'clinicas',        '🏥',  7,  true, now(), now()),
  (gen_random_uuid()::text, 'Farmacias',       'farmacias',       '💊',  8,  true, now(), now()),
  (gen_random_uuid()::text, 'Belleza',         'belleza',         '💅',  9,  true, now(), now()),
  (gen_random_uuid()::text, 'Veterinarias',    'veterinarias',    '🐾',  10, true, now(), now()),
  (gen_random_uuid()::text, 'Tiendas',         'tiendas',         '🛍️', 11, true, now(), now()),
  (gen_random_uuid()::text, 'Entretenimiento', 'entretenimiento', '🎉',  12, true, now(), now()),
  (gen_random_uuid()::text, 'Hoteles',         'hoteles',         '🏨',  13, true, now(), now()),
  (gen_random_uuid()::text, 'Servicios',       'servicios',       '🔧',  14, true, now(), now()),
  (gen_random_uuid()::text, 'Educación',       'educacion',       '📚',  15, true, now(), now()),
  (gen_random_uuid()::text, 'Automotriz',      'automotriz',      '🚙',  16, true, now(), now()),
  (gen_random_uuid()::text, 'Otros',           'otros',           '📦',  17, true, now(), now())
ON CONFLICT DO NOTHING;

-- Verificación rápida (opcional): debería devolver 17 filas activas.
-- SELECT "order", "name", "slug", "icon" FROM "business_categories" ORDER BY "order";
