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
      <section className="px-4 py-4 bg-gradient-to-br from-orange-50 to-amber-50">
        <p className="text-[11px] font-semibold text-orange-400 tracking-wide uppercase">Busan Naon-jip</p>
        <h1 className="text-[22px] font-bold text-gray-900 mt-1 leading-tight">
          방송에 나온 <span className="text-orange-500">부산 맛집</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">히밥·성시경·생활의달인이 다녀간 그 집</p>
      </section>

      {/* 먼저 가볼 만한 나온집 — 최신 방송순 5개. 목록 탭(전체)과 역할/표현 구분. */}
      <section className="mt-5">
        <div className="px-4 mb-2.5">
          <h2 className="text-lg font-bold text-gray-900">먼저 가볼 만한 나온집</h2>
          <p className="text-xs text-gray-400 mt-0.5">방송에 나온 집 중 다섯 곳을 골라봤어요</p>
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
