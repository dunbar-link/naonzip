'use client'

import { useMemo, useSyncExternalStore } from 'react'
import type { Restaurant, AreaType } from '@/types/restaurant'
import { AREA_TYPES } from '@/types/restaurant'
import AreaFilter from '@/components/home/AreaFilter'
import RestaurantCard from '@/components/restaurant/RestaurantCard'

const LS_KEY = 'naonzip:last-area-filter'
const AREA_CHANGE_EVENT = 'naonzip:area-filter-change'

// 최근 선택 지역(localStorage)을 외부 스토어로 노출 — 변경 시 이벤트로 구독자에게 알린다.
function subscribeAreaFilter(onChange: () => void) {
  window.addEventListener(AREA_CHANGE_EVENT, onChange)
  return () => window.removeEventListener(AREA_CHANGE_EVENT, onChange)
}
function writeAreaFilter(area: AreaType | '전체') {
  try {
    window.localStorage.setItem(LS_KEY, area)
  } catch {}
  window.dispatchEvent(new Event(AREA_CHANGE_EVENT))
}

type Props = {
  restaurants: Restaurant[]
}

export default function RestaurantsClient({ restaurants }: Props) {
  // 실제 데이터에 있는 area만 AREA_TYPES 순서대로 파생
  const availableAreas = useMemo<AreaType[]>(() => {
    const present = new Set(restaurants.map((r) => r.area))
    return AREA_TYPES.filter((a) => present.has(a))
  }, [restaurants])

  // 최근 선택 지역을 localStorage 외부 스토어로 구독 — setState-in-effect 없이 hydration 안전.
  // 서버/최초 렌더는 '전체', 마운트 후 저장값으로 복원(유효하지 않으면 '전체').
  const selectedArea = useSyncExternalStore<AreaType | '전체'>(
    subscribeAreaFilter,
    () => {
      try {
        const saved = window.localStorage.getItem(LS_KEY)
        if (saved === '전체' || (saved && availableAreas.includes(saved as AreaType))) {
          return saved as AreaType | '전체'
        }
      } catch {
        // localStorage 미지원 환경 (시크릿 브라우저 등) — 무시
      }
      return '전체'
    },
    () => '전체',
  )

  const handleAreaChange = (area: AreaType | '전체') => {
    writeAreaFilter(area)
  }

  const filtered = useMemo(() => {
    if (selectedArea === '전체') return restaurants
    return restaurants.filter((r) => r.area === selectedArea)
  }, [restaurants, selectedArea])

  return (
    <main className="pt-14 pb-20">
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-base font-bold text-gray-900">
          부산 맛집 <span className="text-orange-500">{filtered.length}곳</span>
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
