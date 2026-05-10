import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/saved'],
    },
    sitemap: 'https://naonzip.vercel.app/sitemap.xml',
  }
}
