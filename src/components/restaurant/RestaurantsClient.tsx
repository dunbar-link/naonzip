'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Restaurant, AreaType } from '@/types/restaurant'
import { AREA_TYPES } from '@/types/restaurant'
import AreaFilter from '@/components/home/AreaFilter'
import RestaurantCard from '@/components/restaurant/RestaurantCard'

const LS_KEY = 'naonzip:last-area-filter'

type Props = {
  restaurants: Restaurant[]
}

export default function RestaurantsClient({ restaurants }: Props) {
  const [selectedArea, setSelectedArea] = useState<AreaType | '전체'>('전체')

  // 실제 데이터에 있는 area만 AREA_TYPES 순서대로 파생
  const availableAreas = useMemo<AreaType[]>(() => {
    const present = new Set(restaurants.map((r) => r.area))
    return AREA_TYPES.filter((a) => present.has(a))
  }, [restaurants])

  // 마운트 후 localStorage에서 최근 선택 지역 복원
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LS_KEY)
      if (saved === '전체' || (saved && availableAreas.includes(saved as AreaType))) {
        setSelectedArea(saved as AreaType | '전체')
      }
    } catch {
      // localStorage 미지원 환경 (시크릿 브라우저 등) — 무시
    }
  }, [availableAreas])

  const handleAreaChange = (area: AreaType | '전체') => {
    setSelectedArea(area)
    try {
      window.localStorage.setItem(LS_KEY, area)
    } catch {}
  }

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
      <AreaFilter selected={selectedArea} onChange={handleAreaChange} areas={availableAreas} />
      <div className="mt-3 px-4 flex flex-col gap-3">
        {filtered.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
        ))}
      </div>
    </main>
  )
}
