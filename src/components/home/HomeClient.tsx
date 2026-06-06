'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Restaurant } from '@/types/restaurant'
import RestaurantCard from '@/components/restaurant/RestaurantCard'

type Props = {
  restaurants: Restaurant[]
}

export default function HomeClient({ restaurants }: Props) {
  // 홈은 짧게 — 최근 방송 나온집 5개만 노출하고, 전체 탐색은 목록 탭으로 유도한다.
  const recentRestaurants = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => (b.appearedAt ?? '').localeCompare(a.appearedAt ?? ''))
      .slice(0, 5)
  }, [restaurants])

  return (
    <main className="pt-14 pb-24">
      {/* 히어로 */}
      <section className="px-4 py-5 bg-gradient-to-br from-orange-50 to-amber-50">
        <p className="text-xs font-semibold text-orange-400 tracking-wide uppercase">Busan Naon-jip</p>
        <h1 className="text-[26px] font-bold text-gray-900 mt-1 leading-tight">
          방송에 나온<br />
          <span className="text-orange-500">부산 맛집</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1.5">히밥·성시경·생활의달인이 다녀간 그 집</p>
      </section>

      {/* 최근 방송 나온집 — 최신 5개. 가로스크롤 없이 세로로 배치. */}
      <section className="mt-5">
        <div className="px-4 mb-2.5">
          <h2 className="text-lg font-bold text-gray-900">최근 방송 나온집</h2>
        </div>
        <div className="px-4 grid grid-cols-1 gap-3">
          {recentRestaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
          ))}
        </div>
      </section>

      {/* 전체 목록은 목록 탭으로 유도 — 홈/목록 역할 분리로 중복 노출 제거 */}
      <section className="mt-5 px-4">
        <Link
          href="/restaurants"
          className="flex items-center justify-center gap-1 w-full py-3.5 rounded-xl border border-orange-200 bg-orange-50 text-sm font-bold text-orange-600 active:bg-orange-100 transition-colors"
        >
          부산 방송맛집 전체 보기 ({restaurants.length}곳)
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
        <p className="mt-2 text-center text-xs text-gray-400">지역별 탐색은 목록 탭에서</p>
      </section>
    </main>
  )
}
