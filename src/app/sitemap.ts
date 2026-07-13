import type { MetadataRoute } from 'next'

/**
 * La app (membego-app) no tiene páginas públicas indexables.
 * El sitemap SEO vive en membego-web (landing).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return []
}
