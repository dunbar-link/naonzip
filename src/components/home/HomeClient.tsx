'use client'

import { useState, useMemo } from 'react'
import { Restaurant, AreaType } from '@/types/restaurant'
import AreaFilter from '@/components/home/AreaFilter'
import RestaurantCard from '@/components/restaurant/RestaurantCard'

type Props = {
  restaurants: Restaurant[]
}

export default function HomeClient({ restaurants }: Props) {
  const [selectedArea, setSelectedArea] = useState<AreaType | '전체'>('전체')

  const recentRestaurants = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => (b.appearedAt ?? '').localeCompare(a.appearedAt ?? ''))
      .slice(0, 6)
  }, [restaurants])

  const filteredRestaurants = useMemo(() => {
    if (selectedArea === '전체') return restaurants
    return restaurants.filter((r) => r.area === selectedArea)
  }, [restaurants, selectedArea])

  return (
    <main className="pt-14 pb-20">
      {/* 히어로 */}
      <section className="px-4 py-6 bg-gradient-to-br from-orange-50 to-amber-50">
        <p className="text-xs font-semibold text-orange-400 tracking-wide uppercase">Busan Naon-jip</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1 leading-snug">
          방송에 나온<br />
          <span className="text-orange-500">부산 맛집</span>
        </h1>
        <p className="text-sm text-gray-500 mt-2">히밥·성시경·생활의달인이 다녀간 그 집</p>
      </section>

      {/* 최근 방송 나온집 */}
      <section className="mt-6">
        <div className="px-4 mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">최근 방송 나온집</h2>
          <span className="text-xs text-gray-400">가로 스크롤</span>
        </div>
        <div className="flex flex-nowrap gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide pl-4 pb-2 [-webkit-overflow-scrolling:touch] [touch-action:pan-x]">
          {recentRestaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} variant="horizontal" />
          ))}
          <div aria-hidden className="shrink-0 w-4" />
        </div>
      </section>

      {/* 지역 필터 */}
      <section className="mt-6">
        <div className="px-4 mb-3">
          <h2 className="text-base font-bold text-gray-900">지역별 맛집</h2>
        </div>
        <AreaFilter selected={selectedArea} onChange={setSelectedArea} />
      </section>

      {/* 맛집 목록 */}
      <section className="mt-4 px-4 flex flex-col gap-3">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            해당 지역의 맛집이 없습니다
          </div>
        ) : (
          filteredRestaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
          ))
        )}
      </section>
    </main>
  )
}
