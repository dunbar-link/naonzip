'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Restaurant } from '@/types/restaurant'
import RestaurantCard from '@/components/restaurant/RestaurantCard'

type Props = {
  restaurants: Restaurant[]
}

export default function HomeClient({ restaurants }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  // 홈은 짧게 — 최근 방송 나온집 5개만 노출하고, 전체 탐색은 검색/목록 진입으로 유도한다.
  const recentRestaurants = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => (b.appearedAt ?? '').localeCompare(a.appearedAt ?? ''))
      .slice(0, 5)
  }, [restaurants])

  // 홈 검색창은 진입 전용 — 실제 검색 로직은 /search(SearchClient + lib/search)가 담당한다.
  // 입력 후 Enter/버튼 → /search?q=... 이동. 빈 검색어는 /search 로(검색 화면 진입).
  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <main className="pt-14 pb-24">
      {/* 히어로 (축소 — 검색/목록 진입을 첫 화면에 띄우기 위해 여백 최소화) */}
      <section className="px-4 pt-3 pb-2.5 bg-gradient-to-br from-orange-50 to-amber-50">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">
          방송나온 부산맛집, <span className="text-orange-500">어디까지 가봤니?</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">방송·유튜브 출처를 모아 빠르게 골라요</p>
      </section>

      {/* 검색 진입 + 전체 목록 진입 (첫 화면 노출) */}
      <section className="px-4 pt-3">
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5"
        >
          <svg
            className="w-4 h-4 text-gray-400 flex-shrink-0"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="밀면, 돼지국밥, 고기, 회 검색"
            className="flex-1 bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none"
            aria-label="맛집 검색"
          />
          <button
            type="submit"
            className="flex-shrink-0 text-sm font-semibold text-orange-500 px-1"
          >
            검색
          </button>
        </form>

        <Link
          href="/restaurants"
          className="mt-2 flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 active:bg-gray-50"
        >
          <span className="text-sm font-medium text-gray-800">
            부산 맛집 전체{' '}
            <span className="text-orange-500 font-bold">{restaurants.length}곳</span> 보기
          </span>
          <svg
            className="w-4 h-4 text-gray-400 flex-shrink-0"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </section>

      {/* 최근 방송 나온집 5개 (정체성 유지 — CTA 아래로 배치) */}
      <section className="mt-4 px-4">
        <h2 className="text-sm font-bold text-gray-900 mb-2">최근 방송 나온집</h2>
        <div className="flex flex-col gap-3">
          {recentRestaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
          ))}
        </div>
      </section>
    </main>
  )
}
