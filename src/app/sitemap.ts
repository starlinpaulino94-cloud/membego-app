import type { MetadataRoute } from 'next'
import { getAppUrl } from '@/lib/site'

/**
 * Sitemap de la APLICACIÓN (app.membego.com). Tras la separación web/app
 * (Fase 0), el marketing indexable (home, directorios, blog, FAQ) vive en
 * membego-web con su propio sitemap. Aquí solo quedan las pocas rutas
 * públicas de flujo con valor de indexación; los paneles privados y las
 * entradas de app (/login) los excluye además `robots.ts`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl()
  const now = new Date()

  const rutas = ['/registro', '/registro-empresa', '/terms', '/privacy']

  return rutas.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  }))
}
