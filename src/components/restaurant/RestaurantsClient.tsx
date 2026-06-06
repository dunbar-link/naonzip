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
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-base font-bold text-gray-900">
          방송맛집 <span className="text-orange-500">{filtered.length}곳</span>
        </h1>
      </div>
      <AreaFilter selected={selectedArea} onChange={setSelectedArea} />
      <div className="mt-3 px-4 flex flex-col gap-3">
        {filtered.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
        ))}
      </div>
    </main>
  )
}
