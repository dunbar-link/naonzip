import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  getCreatorSlugs,
  getRestaurantsByCreatorSlug,
} from '@/lib/restaurants'
import { getIntro } from '@/lib/intros'
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
  const { name, restaurants } = await getRestaurantsByCreatorSlug(slug)

  if (!name || restaurants.length === 0) {
    return {
      title: '크리에이터를 찾을 수 없습니다 | 나온집',
      description: '요청하신 크리에이터의 부산 맛집 목록을 찾을 수 없습니다.',
    }
  }

  const title = `${name} 맛집 모음 | 나온집`
  const description = `${name}이 소개한 부산 맛집 모음`
  const path = `/creator/${slug}`

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
  const slugs = await getCreatorSlugs()
  return slugs.map((slug) => ({ slug }))
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function CreatorLandingPage({ params }: Props) {
  const { slug } = await params
  const { name, restaurants } = await getRestaurantsByCreatorSlug(slug)

  if (!name || restaurants.length === 0) notFound()

  return (
    <main className="pt-14 pb-24">
      {/* Hero */}
      <section className="px-4 pt-6 pb-5 bg-white">
        <p className="text-xs text-red-500 font-semibold">유튜브 크리에이터</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{name} 맛집</h1>
        <p className="mt-2 text-sm text-gray-500">
          부산 맛집 {restaurants.length}곳
        </p>
        <div className="mt-3 space-y-2">
          {getIntro('creator', slug, name).paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed">
              {p}
            </p>
          ))}
        </div>
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
