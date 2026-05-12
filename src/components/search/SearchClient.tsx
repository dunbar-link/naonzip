'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Restaurant } from '@/types/restaurant'
import RestaurantCard from '@/components/restaurant/RestaurantCard'

const SUGGESTED_QUERIES = [
  '히밥', '성시경', '생활의달인', '맛있는녀석들',
  '백반기행', '삼대천왕', '쯔양', '전현무계획',
  '돼지국밥', '밀면', '해운대', '광안리',
]

function searchRestaurants(query: string, restaurants: Restaurant[]): Restaurant[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const tokens = q.split(/\s+/)

  return restaurants.filter((r) => {
    const haystack = [
      r.name,
      r.area,
      r.category,
      r.mainMenu,
      r.address,
      r.creatorName ?? '',
      r.programName ?? '',
      r.episodeTitle ?? '',
      r.description ?? '',
      r.sourceTitle,
    ]
      .join(' ')
      .toLowerCase()

    return tokens.every((token) => haystack.includes(token))
  })
}

type Props = {
  restaurants: Restaurant[]
}

export default function SearchClient({ restaurants }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => searchRestaurants(query, restaurants), [query, restaurants])

  // URL query parameter 동기화
  useEffect(() => {
    const trimmed = query.trim()
    const params = new URLSearchParams(searchParams.toString())
    if (trimmed) {
      params.set('q', trimmed)
    } else {
      params.delete('q')
    }
    router.replace(`/search?${params.toString()}`, { scroll: false })
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSuggest = (q: string) => {
    setQuery(q)
    inputRef.current?.focus()
  }

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const isSearching = query.trim().length > 0

  return (
    <main className="pt-14 pb-20">
      {/* 검색 입력창 */}
      <div className="sticky top-14 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="relative flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
          <svg
            className="w-4 h-4 text-gray-400 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="식당명, 크리에이터, 방송프로그램..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
          />
          {isSearching && (
            <button
              onClick={handleClear}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 flex-shrink-0"
              aria-label="검색어 지우기"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 검색 전: 추천 검색어 */}
      {!isSearching && (
        <section className="px-4 pt-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">추천 검색어</h2>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggest(q)}
                className="text-sm px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 bg-white active:bg-gray-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <span className="text-4xl">🔍</span>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              히밥, 성시경, 생활의달인<br />방송에 나온 부산 맛집을 찾아보세요
            </p>
          </div>
        </section>
      )}

      {/* 검색 중: 결과 */}
      {isSearching && (
        <section className="px-4 pt-4">
          {results.length > 0 ? (
            <>
              <p className="text-xs text-gray-400 mb-3">
                <span className="font-semibold text-gray-700">&ldquo;{query.trim()}&rdquo;</span> 검색 결과 {results.length}개
              </p>
              <div className="flex flex-col gap-3">
                {results.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center pt-16 gap-4">
              <span className="text-5xl">😅</span>
              <div className="text-center">
                <p className="text-base font-bold text-gray-800">
                  &ldquo;{query.trim()}&rdquo; 결과가 없어요
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  다른 키워드로 검색해보세요
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {SUGGESTED_QUERIES.slice(0, 6).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSuggest(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-orange-200 text-orange-600 bg-orange-50 active:bg-orange-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  )
}
