import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  getCategorySlugs,
  getRestaurantsByCategorySlug,
} from '@/lib/restaurants'
import RestaurantCard from '@/components/restaurant/RestaurantCard'

const SITE_URL = 'https://naonzip.vercel.app'

export const revalidate = 3600

type Props = {
  params: Promise<{ slug: string }>
}

// ─────────────────────────────────────────────
// generateMetadata
// ─────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { name, restaurants } = await getRestaurantsByCategorySlug(slug)

  if (!name || restaurants.length === 0) {
    return {
      title: '카테고리를 찾을 수 없습니다 | 나온집',
      description: '요청하신 카테고리의 부산 방송맛집 목록을 찾을 수 없습니다.',
    }
  }

  const title = `부산 ${name} 맛집 ${restaurants.length}곳 | 나온집`
  const description = `방송과 유튜브에 나온 부산 ${name} 맛집을 한 곳에 모았어요. 백반기행, 생활의달인, 성시경 먹을텐데 등 출처별 정리.`
  const path = `/category/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: '나온집',
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// ─────────────────────────────────────────────
// generateStaticParams
// ─────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getCategorySlugs()
  return slugs.map((slug) => ({ slug }))
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function CategoryLandingPage({ params }: Props) {
  const { slug } = await params
  const { name, restaurants } = await getRestaurantsByCategorySlug(slug)

  if (!name || restaurants.length === 0) notFound()

  return (
    <main className="pt-14 pb-24">
      {/* Hero */}
      <section className="px-4 pt-6 pb-5 bg-white">
        <p className="text-xs text-orange-500 font-semibold">메뉴별 방송맛집</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">부산 {name} 맛집</h1>
        <p className="mt-2 text-sm text-gray-500">
          방송맛집 {restaurants.length}곳
        </p>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          백반기행·생활의달인·성시경 먹을텐데 등 방송과 유튜브에 소개된 부산 {name} 맛집을 한 곳에 모았어요. 최신 방영순으로 정렬됩니다.
        </p>
      </section>

      <div className="h-2 bg-gray-50" />

      {/* 맛집 목록 */}
      <section className="px-4 pt-5 pb-2">
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          맛집 목록 {restaurants.length}곳
        </h2>
        <div className="flex flex-col gap-3">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
          ))}
        </div>
      </section>

      {/* 뒤로가기 */}
      <div className="px-4 mt-4">
        <Link
          href="/"
          className="block text-center text-sm text-gray-400 py-3 rounded-xl border border-gray-200"
        >
          ← 홈으로 돌아가기
        </Link>
      </div>
    </main>
  )
}
