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

      {/* 방영일 최신순 5개 */}
      <div className="mt-3 px-4 flex flex-col gap-3">
        {recentRestaurants.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
        ))}
      </div>
    </main>
  )
}
