import type { Metadata } from 'next'
import { getRestaurants } from '@/lib/restaurants'
import RestaurantsClient from '@/components/restaurant/RestaurantsClient'

export const revalidate = 3600

const LIST_TITLE = '부산 방송맛집 목록 | 나온집'
const LIST_DESCRIPTION = '부산에서 방송·유튜브에 나온 맛집을 한눈에 찾아보세요.'

export const metadata: Metadata = {
  title: LIST_TITLE,
  description: LIST_DESCRIPTION,
  alternates: {
    canonical: '/restaurants',
  },
  openGraph: {
    title: LIST_TITLE,
    description: LIST_DESCRIPTION,
    url: '/restaurants',
    siteName: '나온집',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: LIST_TITLE,
    description: LIST_DESCRIPTION,
  },
}

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants()
  return <RestaurantsClient restaurants={restaurants} />
}
