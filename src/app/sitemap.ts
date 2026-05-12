import type { MetadataRoute } from 'next'
import { getRestaurantSlugs } from '@/lib/restaurants'

export const revalidate = 3600

const BASE_URL = 'https://naonzip.vercel.app'

/**
 * /sitemap.xml 자동 생성
 *
 * - 정적 경로: /, /restaurants, /map, /search, /saved
 * - 동적 경로: /restaurants/[slug] × 전체 공개 맛집 수
 *
 * getRestaurantSlugs()는 Supabase 미설정/오류 시 mock 22개로 자동 fallback.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getRestaurantSlugs()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/restaurants`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/map`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/saved`,
      lastModified: new Date(),
      changeFrequency: 'never',
      priority: 0.3,
    },
  ]

  const restaurantRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/restaurants/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...restaurantRoutes]
}
