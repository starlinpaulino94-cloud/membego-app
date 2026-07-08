import { FULL_ADMIN_ROLES, type AppRole } from '@/types'

/**
 * Autorización FINA del panel /admin por sección (Onboarding Fase 2 · O-5).
 *
 * Los roles de `FULL_ADMIN_ROLES` (admin/gerente/cajero/superadmin) acceden a
 * TODAS las secciones. Los roles acotados (MARKETING, SUPERVISOR) solo a las
 * suyas. La fuente de verdad se consume tanto en el middleware (bloqueo real)
 * como en la navegación (para no mostrar lo que no pueden abrir).
 */
export type AdminSection =
  | 'dashboard'
  | 'clientes'
  | 'membresias'
  | 'promociones'
  | 'publicaciones'
  | 'campanas'
  | 'referidos'
  | 'scanner'
  | 'pagos'
  | 'perfil'
  | 'sucursales'
  | 'metodos-pago'
  | 'planes'
  | 'notificaciones'
  | 'automatizaciones'
  | 'comunicacion'
  | 'tickets'
  | 'empleados'
  | 'reportes'
  | 'audiencia'

const KNOWN_SECTIONS: readonly AdminSection[] = [
  'dashboard', 'clientes', 'membresias', 'promociones', 'publicaciones',
  'campanas', 'referidos', 'scanner', 'pagos', 'perfil', 'sucursales',
  'metodos-pago', 'planes', 'notificaciones', 'automatizaciones',
  'comunicacion', 'tickets', 'empleados', 'reportes', 'audiencia',
]

// Secciones permitidas por rol acotado (Decisión 2 del plan de onboarding).
// MARKETING = difusión; SUPERVISOR = operación. Ambos incluyen 'dashboard'
// como aterrizaje. Todo lo no listado queda denegado (fail-closed).
const RESTRICTED_ACCESS: Partial<Record<AppRole, AdminSection[]>> = {
  MARKETING: ['dashboard', 'promociones', 'publicaciones', 'campanas', 'audiencia', 'notificaciones'],
  SUPERVISOR: ['dashboard', 'reportes', 'clientes', 'membresias', 'pagos', 'scanner'],
}

/** ¿Puede este rol abrir esta sección del panel? */
export function canAccessAdminSection(role: AppRole, section: AdminSection): boolean {
  if (FULL_ADMIN_ROLES.includes(role)) return true
  return RESTRICTED_ACCESS[role]?.includes(section) ?? false
}

/**
 * Deriva la sección de un path del panel: `/admin/promociones/nuevo` →
 * `promociones`. `/admin` (sin segmento) → `dashboard`. Devuelve null si el
 * path no es de /admin o la sección no es reconocida.
 */
export function adminSectionForPath(path: string): AdminSection | null {
  if (path !== '/admin' && !path.startsWith('/admin/')) return null
  const seg = path.split('/')[2]
  if (!seg) return 'dashboard'
  return KNOWN_SECTIONS.includes(seg as AdminSection) ? (seg as AdminSection) : null
}
