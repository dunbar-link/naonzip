import { getRestaurants } from '@/lib/restaurants'
import HomeClient from '@/components/home/HomeClient'

export const revalidate = 3600

const SITE_URL = 'https://naonzip.vercel.app'

// Organization: 나온집의 운영주체·정체성을 기계가 읽을 entity 신호(AEO/entity recognition).
//   실제 서비스 성격에 맞는 필드만 둔다(과장·미보유 기능 금지). 개인 연락처 등 민감정보는 넣지 않는다.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: '나온집',
  url: SITE_URL,
  description: '방송·유튜브에 소개된 부산 맛집을 출처(프로그램·회차)와 함께 모아 보는 아카이브 서비스.',
  areaServed: { '@type': 'AdministrativeArea', name: '부산' },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: '나온집',
  url: SITE_URL,
  description: '방송·유튜브 출처와 함께 모아 보는 부산 맛집. 보고, 공유하고, 길찾기까지.',
  publisher: { '@id': `${SITE_URL}/#organization` },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeClient restaurants={restaurants} />
    </>
  )
}
