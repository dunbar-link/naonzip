'use client'

import { useState, useMemo } from 'react'
import type { Restaurant, AreaType } from '@/types/restaurant'
import AreaFilter from '@/components/home/AreaFilter'
import RestaurantCard from '@/components/restaurant/RestaurantCard'

type Props = {
  restaurants: Restaurant[]
}

export default function RestaurantsClient({ restaurants }: Props) {
  const [selectedArea, setSelectedArea] = useState<AreaType | '전체'>('전체')

  const filtered = useMemo(() => {
    if (selectedArea === '전체') return restaurants
    return restaurants.filter((r) => r.area === selectedArea)
  }, [restaurants, selectedArea])

  return (
    <main className="pt-14 pb-20">
      <div className="px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">부산 방송맛집 목록</h1>
        <p className="text-xs text-gray-400 mt-0.5">총 {filtered.length}개</p>
      </div>
      <AreaFilter selected={selectedArea} onChange={setSelectedArea} />
      <div className="mt-4 px-4 flex flex-col gap-3">
        {filtered.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
        ))}
      </div>
    </main>
  )
}
