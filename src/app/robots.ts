import type { MetadataRoute } from 'next'
import { getAppUrl } from '@/lib/site'

/**
 * La app (membego-app) es privada: todas las rutas requieren auth.
 * Solo se permite /api/health para monitoreo.
 * El SEO público vive en membego-web (landing).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/'],
      },
    ],
    host: getAppUrl(),
  }
}
