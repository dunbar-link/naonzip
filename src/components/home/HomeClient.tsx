'use client'

import { useMemo } from 'react'
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
      <section className="px-4 py-3 bg-gradient-to-br from-orange-50 to-amber-50">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">
          방송 나온 <span className="text-orange-500">부산 맛집</span>
        </h1>
      </section>

      {/* 최근 방송 나온집 — 방송일자 최신순 5개. 목록 탭(전체 탐색)과 역할 구분. */}
      <section className="mt-4">
        <div className="px-4 mb-2.5">
          <h2 className="text-lg font-bold text-gray-900">최근 방송 나온집</h2>
          <p className="text-xs text-gray-400 mt-0.5">방송일자 최신순</p>
        </div>
        <div className="px-4 grid grid-cols-1 gap-3">
          {recentRestaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
          ))}
        </div>
      </section>
    </main>
  )
}
