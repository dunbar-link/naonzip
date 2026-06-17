'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Restaurant } from '@/types/restaurant'
import RestaurantCard from '@/components/restaurant/RestaurantCard'
import {
  SOURCE_TABS,
  type SourceTab,
  isSourceTab,
  restaurantMatchesSourceTab,
} from '@/lib/sources'

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
  // 출처 동의어 — 출처명(trustSourceText)에 매칭시켜 "미쉐린"·"부산의맛" 검색을 흡수.
  '미쉐린': ['미쉐린', '미슐랭', 'michelin'],
  '미슐랭': ['미쉐린', '미슐랭', 'michelin'],
  'michelin': ['미쉐린', 'michelin'],
  '미쉐린가이드': ['미쉐린', '미슐랭', 'michelin'],
  '미슐랭가이드': ['미쉐린', '미슐랭', 'michelin'],
  '부산의맛': ['부산의 맛', '비짓부산'],
  '부산미식': ['부산의 맛', '비짓부산'],
  '비짓부산': ['비짓부산', '부산의 맛'],
  '부산관광공사': ['비짓부산', '부산의 맛'],
  '부산공식': ['부산의 맛', '비짓부산'],
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
  | 'trustSourceText'

// 필드 가중치 — 정확매칭 우선순위를 결정한다.
const FIELD_WEIGHTS: Record<SearchableField, number> = {
  name: 10,
  mainMenu: 6,
  category: 6,
  area: 5,
  creatorName: 5,
  programName: 5,
  trustSourceText: 5,
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
  'trustSourceText',
])

const SEARCHABLE_FIELDS = Object.keys(FIELD_WEIGHTS) as SearchableField[]

function normalize(value: string | undefined | null): string {
  return (value ?? '').toString().toLowerCase().normalize('NFC')
}

function expandToken(token: string): string[] {
  return SYNONYMS[token] ?? [token]
}

/** 공개 신뢰 출처의 출처명·라벨을 한 문자열로(출처명 검색용). */
function trustSourceText(r: Restaurant): string {
  return (r.trustSources ?? [])
    .filter((t) => t.isPublic)
    .map((t) => `${t.sourceName} ${t.trustLabel ?? ''}`)
    .join(' ')
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
      trustSourceText: normalize(trustSourceText(r)),
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

    if (!allTokensMatched) return
    if (!coreFieldMatched) return

    scored.push({ restaurant: r, score: totalScore, index })
  })

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
  const initialTabRaw = searchParams.get('tab')
  const initialTab: SourceTab = isSourceTab(initialTabRaw) ? initialTabRaw : 'all'

  const [query, setQuery] = useState(initialQuery)
  const [tab, setTab] = useState<SourceTab>(initialTab)
  const inputRef = useRef<HTMLInputElement>(null)

  // 검색어 결과(있을 때만). 탭 필터는 그 위에 AND 로 적용.
  const queryResults = useMemo(
    () => searchRestaurants(query, restaurants),
    [query, restaurants],
  )

  const results = useMemo(() => {
    const hasQuery = query.trim().length > 0
    // 검색어 없고 탭만 선택: 해당 출처 전체. 검색어 있으면 검색 결과를 베이스로.
    const base = hasQuery ? queryResults : tab === 'all' ? [] : restaurants
    if (tab === 'all') return base
    return base.filter((r) => restaurantMatchesSourceTab(r, tab))
  }, [query, tab, queryResults, restaurants])

  // URL query 동기화 (q + tab). 잘못된 tab 은 저장하지 않음(all 은 생략).
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const trimmed = query.trim()
    if (trimmed) params.set('q', trimmed)
    else params.delete('q')
    if (tab !== 'all') params.set('tab', tab)
    else params.delete('tab')
    const qs = params.toString()
    router.replace(qs ? `/search?${qs}` : '/search', { scroll: false })
  }, [query, tab]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSuggest = (q: string) => {
    setQuery(q)
    inputRef.current?.focus()
  }

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const isActive = query.trim().length > 0 || tab !== 'all'
  const activeTabLabel = SOURCE_TABS.find((t) => t.key === tab)?.label ?? '전체'

  return (
    <main className="pt-14 pb-20">
      {/* 검색 입력창 + 출처 탭 */}
      <div className="sticky top-14 z-10 bg-white border-b border-gray-100">
        <div className="px-4 py-3">
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
            {query.trim().length > 0 && (
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

        {/* 출처 탭 — 한 줄 가로 스크롤(모바일 줄바꿈 금지) */}
        <div className="flex gap-2 px-4 pb-2.5 overflow-x-auto">
          {SOURCE_TABS.map(({ key, label }) => {
            const selected = tab === key
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                aria-pressed={selected}
                className={`flex-shrink-0 text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                  selected
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600 active:bg-gray-100'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 비활성(전체 탭 + 검색어 없음): 안내 + 추천 검색어 */}
      {!isActive && (
        <section className="px-4 pt-5">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">무엇을 찾으세요?</h2>
            <p className="mt-1 text-sm text-gray-500">
              식당명·메뉴·방송명으로 찾거나, 위 출처 탭으로 골라보세요
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
              방송·유튜브·미쉐린·부산공식 부산 맛집을 모았어요
            </p>
          </div>
        </section>
      )}

      {/* 활성(검색어 또는 출처 탭): 결과 */}
      {isActive && (
        <section className="px-4 pt-4">
          {results.length > 0 ? (
            <>
              <p className="text-xs text-gray-400 mb-3">
                {query.trim() ? (
                  <>
                    <span className="font-semibold text-gray-700">&ldquo;{query.trim()}&rdquo;</span>
                    {tab !== 'all' && <> · {activeTabLabel}</>} 검색 결과 {results.length}개
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-gray-700">{activeTabLabel}</span> {results.length}곳
                  </>
                )}
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
                {tab !== 'all' && !query.trim() ? (
                  <p className="text-base font-bold text-gray-800">
                    {activeTabLabel} 출처의 등록 식당이 아직 없어요
                  </p>
                ) : (
                  <>
                    <p className="text-base font-bold text-gray-800">
                      &ldquo;{query.trim()}&rdquo;
                      {tab !== 'all' && <> · {activeTabLabel}</>} 결과가 없어요
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      다른 키워드를 쓰거나 출처 탭을 바꿔보세요
                    </p>
                  </>
                )}
              </div>
              {tab !== 'all' && (
                <button
                  onClick={() => setTab('all')}
                  className="text-xs px-3 py-1.5 rounded-full border border-orange-200 text-orange-600 bg-orange-50 active:bg-orange-100 transition-colors"
                >
                  전체에서 다시 보기
                </button>
              )}
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
