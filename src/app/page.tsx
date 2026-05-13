import { getRestaurants } from '@/lib/restaurants'
import HomeClient from '@/components/home/HomeClient'

export const revalidate = 3600

const SITE_URL = 'https://naonzip.vercel.app'

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '나온집',
  url: SITE_URL,
  description: '부산에서 방송·유튜브에 나온 맛집을 보고, 공유하고, 길찾기까지',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export default async function HomePage() {
  const restaurants = await getRestaurants()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeClient restaurants={restaurants} />
    </>
  )
}
