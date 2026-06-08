'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Restaurant } from '@/types/restaurant'
import RestaurantCard from '@/components/restaurant/RestaurantCard'

const SUGGESTED_QUERIES = [
  '히밥', '성시경', '생활의달인', '맛있는녀석들',
  '백반기행', '삼대천왕', '쯔양', '전현무계획',
  '돼지국밥', '밀면', '해운대', '광안리',
]

// 검색 동의어 맵 — 토큰이 key와 정확히 일치하면 expansion 배열로 OR 매칭한다.
// 데이터에 직접 등장하지 않는 일반 단어("빵집", "노포" 등)를 흡수하기 위함.
const SYNONYMS: Record<string, string[]> = {
  '빵집': ['빵집', '베이커리', '디저트', '빵'],
  '베이커리': ['베이커리', '디저트', '빵'],
  '국밥': ['국밥', '돼지국밥'],
  '노포': ['노포', '전통', '원조', '40년', '50년', '60년'],
  '또간집': ['또간집', '풍자'],
  '횟집': ['횟집', '회', '회센터'],
  '회': ['회', '회센터', '횟집'],
  '분식': ['분식', '떡볶이', '김밥', '순대'],
  '갈비집': ['갈비', '돼지갈비', '소갈비'],
  '카페': ['카페', '커피', '디저트'],
  '센텀': ['해운대', '센텀'],
  '남포': ['남포동'],
  '곱창전골': ['곱창', '양곱창'],
}

type SearchableField =
  | 'name'
  | 'mainMenu'
  | 'category'
  | 'area'
  | 'creatorName'
  | 'programName'
  | 'episodeTitle'
  | 'address'
  | 'sourceTitle'
  | 'description'

// 필드 가중치 — 정확매칭 우선순위를 결정한다.
const FIELD_WEIGHTS: Record<SearchableField, number> = {
  name: 10,
  mainMenu: 6,
  category: 6,
  area: 5,
  creatorName: 5,
  programName: 5,
  episodeTitle: 3,
  address: 2,
  sourceTitle: 1,
  description: 1,
}

// description/sourceTitle/address/episodeTitle 단독 매칭만으로는 결과 노출 금지.
// row 안에서 최소 1개 토큰이 아래 핵심 필드에 매칭되어야 한다.
const CORE_FIELDS: ReadonlySet<SearchableField> = new Set([
  'name',
  'category',
  'mainMenu',
  'area',
  'creatorName',
  'programName',
])

const SEARCHABLE_FIELDS = Object.keys(FIELD_WEIGHTS) as SearchableField[]

function normalize(value: string | undefined | null): string {
  return (value ?? '').toString().toLowerCase().normalize('NFC')
}

function expandToken(token: string): string[] {
  return SYNONYMS[token] ?? [token]
}

function searchRestaurants(query: string, restaurants: Restaurant[]): Restaurant[] {
  const q = query.trim().toLowerCase().normalize('NFC')
  if (!q) return []

  const tokens = q.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []

  type Scored = { restaurant: Restaurant; score: number; index: number }

  const scored: Scored[] = []

  restaurants.forEach((r, index) => {
    const fieldValues: Record<SearchableField, string> = {
      name: normalize(r.name),
      mainMenu: normalize(r.mainMenu),
      category: normalize(r.category),
      area: normalize(r.area),
      creatorName: normalize(r.creatorName),
      programName: normalize(r.programName),
      episodeTitle: normalize(r.episodeTitle),
      address: normalize(r.address),
      sourceTitle: normalize(r.sourceTitle),
      description: normalize(r.description),
    }

    let totalScore = 0
    let coreFieldMatched = false
    let allTokensMatched = true

    for (const token of tokens) {
      const variants = expandToken(token)
      let bestScore = 0
      let bestField: SearchableField | null = null

      for (const field of SEARCHABLE_FIELDS) {
        const value = fieldValues[field]
        if (!value) continue
        const hit = variants.some((v) => value.includes(v))
        if (!hit) continue
        const weight = FIELD_WEIGHTS[field]
        if (weight > bestScore) {
          bestScore = weight
          bestField = field
        }
      }

      if (bestScore === 0) {
        allTokensMatched = false
        break
      }

      totalScore += bestScore
      if (bestField && CORE_FIELDS.has(bestField)) {
        coreFieldMatched = true
      }
    }

    // 모든 토큰이 어딘가에 매칭되어야 하고(AND),
    // row 단위로 최소 1개 토큰은 핵심 필드에 매칭되어야 함(noise 차단).
    // 모든 core 필드 가중치(5+)는 모든 non-core 가중치(3 이하)보다 높으므로,
    // 토큰의 best field가 non-core라는 것은 그 토큰이 core 필드에서는 매칭되지 않았다는 뜻이다.
    if (!allTokensMatched) return
    if (!coreFieldMatched) return

    scored.push({ restaurant: r, score: totalScore, index })
  })

  // 점수 desc, 동률은 원본 index asc (broadcastDate desc 정렬을 안정적으로 유지).
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.index - b.index
  })

  return scored.map((s) => s.restaurant)
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

      {/* 검색 전: 안내 + 추천 검색어 (빈 화면 느낌 완화) */}
      {!isSearching && (
        <section className="px-4 pt-5">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">무엇을 찾으세요?</h2>
            <p className="mt-1 text-sm text-gray-500">
              식당명·메뉴·방송명으로 찾아보세요
            </p>
          </div>

          <h3 className="text-[13px] font-bold text-gray-500 mb-2.5">추천 검색어</h3>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggest(q)}
                className="text-sm font-medium px-3.5 py-2 rounded-full border border-gray-200 text-gray-700 bg-gray-50 active:bg-gray-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="mt-7 flex flex-col items-center text-center">
            <span className="text-3xl">🔍</span>
            <p className="mt-2 text-sm text-gray-400">
              방송·유튜브에 소개된 부산 맛집을 모았어요
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
                  아직 등록 안 된 식당이거나 다른 키워드를 써보세요
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

              <div className="w-full mt-2 px-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">지역으로 찾기</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { label: '해운대', href: '/area/haeundae' },
                    { label: '서면', href: '/area/seomyeon' },
                    { label: '광안리', href: '/area/gwangalli' },
                    { label: '남포동', href: '/area/nampodong' },
                    { label: '기장', href: '/area/gijang' },
                  ] as const).map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      className="text-xs px-3 py-1.5 rounded-full border border-blue-100 text-blue-600 bg-blue-50 active:bg-blue-100 transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="w-full px-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">출처로 찾기</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { label: '생활의달인', href: '/program/lifemaster' },
                    { label: '히밥', href: '/program/hibab' },
                    { label: '쯔양', href: '/program/tzuyang' },
                    { label: '성시경 먹을텐데', href: '/program/sungsik' },
                  ] as const).map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      className="text-xs px-3 py-1.5 rounded-full border border-orange-200 text-orange-600 bg-orange-50 active:bg-orange-100 transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  )
}
