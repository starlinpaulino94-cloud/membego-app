/**
 * Lanzamiento gradual del marketplace: mientras MembeGo tenga pocas empresas,
 * el directorio público "aparenta" tener solo las empresas listadas en
 * NEXT_PUBLIC_EMPRESAS_VISIBLES (slugs separados por coma, p. ej.
 * "car-town-wash"). Con la variable vacía o ausente se muestran TODAS las
 * empresas publicadas (comportamiento normal del marketplace).
 *
 * Las categorías se ocultan mientras la lista esté activa: con una sola
 * empresa no aportan nada. Los perfiles por enlace directo (/empresas/slug)
 * NO se filtran: registrar clientes de otras empresas sigue siendo posible
 * compartiendo su enlace.
 */
export function empresasVisibles(): string[] | null {
  const raw = process.env.NEXT_PUBLIC_EMPRESAS_VISIBLES ?? ''
  const slugs = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return slugs.length > 0 ? slugs : null
}
