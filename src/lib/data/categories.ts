/**
 * Catálogo base de categorías de negocio (FASE 2 · Marketplace).
 * Fuente única de verdad para el seed local (`runSeed`) y espejo del SQL
 * idempotente `prisma/legacy_sql/seed_business_categories.sql` usado en prod.
 *
 * El `icon` se renderiza como texto directo en <CategoryTabs>, por eso son emojis.
 * Las categorías son extensibles: basta con añadir una fila aquí y en el SQL.
 */
export interface SeedCategory {
  name: string
  slug: string
  icon: string
  order: number
}

export const BUSINESS_CATEGORIES: SeedCategory[] = [
  { name: 'Restaurantes', slug: 'restaurantes', icon: '🍽️', order: 1 },
  { name: 'Cafeterías', slug: 'cafeterias', icon: '☕', order: 2 },
  { name: 'Lavados', slug: 'lavados', icon: '🚗', order: 3 },
  { name: 'Gimnasios', slug: 'gimnasios', icon: '💪', order: 4 },
  { name: 'Spa', slug: 'spa', icon: '💆', order: 5 },
  { name: 'Salud', slug: 'salud', icon: '🩺', order: 6 },
  { name: 'Clínicas', slug: 'clinicas', icon: '🏥', order: 7 },
  { name: 'Farmacias', slug: 'farmacias', icon: '💊', order: 8 },
  { name: 'Belleza', slug: 'belleza', icon: '💅', order: 9 },
  { name: 'Veterinarias', slug: 'veterinarias', icon: '🐾', order: 10 },
  { name: 'Tiendas', slug: 'tiendas', icon: '🛍️', order: 11 },
  { name: 'Entretenimiento', slug: 'entretenimiento', icon: '🎉', order: 12 },
  { name: 'Hoteles', slug: 'hoteles', icon: '🏨', order: 13 },
  { name: 'Servicios', slug: 'servicios', icon: '🔧', order: 14 },
  { name: 'Educación', slug: 'educacion', icon: '📚', order: 15 },
  { name: 'Automotriz', slug: 'automotriz', icon: '🚙', order: 16 },
  { name: 'Otros', slug: 'otros', icon: '📦', order: 17 },
]
