'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import type { Restaurant } from '@/types/restaurant'
import { useSavedIds } from '@/hooks/useSaved'
import RestaurantCard from '@/components/restaurant/RestaurantCard'

type SavedClientProps = {
  restaurants: Restaurant[]
}

export function SavedClient({ restaurants }: SavedClientProps) {
  const savedIds = useSavedIds()

  const savedRestaurants = useMemo(
    () => restaurants.filter((restaurant) => savedIds.includes(restaurant.id)),
    [restaurants, savedIds],
  )

  return (
    <main className="pt-14 pb-20">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-lg font-bold text-gray-900">저장한 맛집</h1>
        {savedRestaurants.length > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">{savedRestaurants.length}개</p>
        )}
      </div>

      {savedRestaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-16 gap-4 px-8">
          <span className="text-5xl">🤍</span>
          <div className="text-center">
            <p className="text-base font-bold text-gray-800">아직 저장한 맛집이 없어요</p>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              카드의 하트를 눌러<br />나중에 가고 싶은 맛집을 저장해보세요
            </p>
          </div>
          <Link
            href="/"
            className="mt-2 px-6 py-3 bg-orange-500 text-white text-sm font-bold rounded-xl"
          >
            맛집 둘러보기
          </Link>
        </div>
      ) : (
        <section className="px-4 flex flex-col gap-3">
          {savedRestaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
          ))}
        </section>
      )}
    </main>
  )
}
