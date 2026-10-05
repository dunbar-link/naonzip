import Link from 'next/link'
import type { Metadata } from 'next'
import { getRestaurants } from '@/lib/restaurants'
import { getContentSources } from '@/lib/content-discovery'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '방송·유튜브에서 본 부산 맛집 찾기 | 나온집',
  description: '프로그램, 크리에이터, 회차·영상 출처에서 부산 맛집을 찾아보세요.',
  alternates: { canonical: '/from' },
}

export default async function ContentDiscoveryPage() {
  const sources = getContentSources(await getRestaurants())

  return (
    <main className="pt-14 pb-24">
      <section className="px-4 pt-6 pb-5 bg-gradient-to-br from-orange-50 to-amber-50">
        <p className="text-xs font-semibold text-orange-600">CONTENT → PLACE</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">어디서 봤지?</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          방송·유튜브에서 본 부산 맛집을 출처부터 찾아보고, 저장·길찾기로 이어가세요.
        </p>
      </section>

      <section className="px-4 pt-5">
        <h2 className="text-sm font-bold text-gray-900">프로그램·크리에이터로 찾기</h2>
        <p className="mt-1 text-xs text-gray-500">등록된 출연 식당 수를 기준으로 정렬했어요.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {sources.map((source) => {
            const href = source.kind === 'creator' ? `/creator/${source.slug}` : `/program/${source.slug}`
            return (
              <Link
                key={`${source.kind}:${source.slug}`}
                href={href}
                className="min-h-24 rounded-2xl border border-gray-200 bg-white p-3 active:bg-orange-50"
              >
                <p className="text-[11px] font-semibold text-orange-500">
                  {source.kind === 'creator' ? '유튜브 크리에이터' : '방송 프로그램'}
                </p>
                <h3 className="mt-1 text-sm font-bold leading-snug text-gray-900">{source.name}</h3>
                <p className="mt-2 text-xs text-gray-500">부산 맛집 {source.restaurantCount}곳</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="px-4 mt-6">
        <Link
          href="/search"
          className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700"
        >
          회차·메뉴·동네로 직접 검색하기 <span aria-hidden>→</span>
        </Link>
      </section>
    </main>
  )
}
