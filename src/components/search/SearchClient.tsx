'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Restaurant } from '@/types/restaurant'
import RestaurantCard from '@/components/restaurant/RestaurantCard'
import {
  SOURCE_TABS,
  type SourceTab,
  isSourceTab,
  restaurantMatchesSourceTab,
} from '@/lib/sources'

const SUGGESTED_QUERIES = [
  '미슐랭', '부산의 맛', '돼지국밥', '밀면',
  '성시경', '생활의달인', '쯔양', '백반기행',
  '해운대', '광안리', '곱창', '회',
]

// 마지막으로 선택한 출처 탭 저장 키 — 목록 페이지(naonzip:last-area-filter)와 동일한 네이밍 규칙.
const LS_TAB_KEY = 'naonzip:last-source-tab'
// 추천 검색어 펼침/접힘 상태 저장 키.
const LS_SUGGEST_KEY = 'naonzip:search-suggestions-open'

// 검색 동의어 맵 — 토큰이 key와 정확히 일치하면 expansion 배열로 OR 매칭한다.
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
  // 출처 동의어 — 표기 흔들림(미슐랭/미쉐린/미쉘린)을 모두 출처명에 매칭시킨다.
  '미슐랭': ['미슐랭', '미쉐린', 'michelin'],
  '미쉐린': ['미슐랭', '미쉐린', 'michelin'],
  '미쉘린': ['미슐랭', '미쉐린', 'michelin'],
  'michelin': ['미슐랭', '미쉐린', 'michelin'],
  '미슐랭가이드': ['미슐랭', '미쉐린', 'michelin'],
  '미쉐린가이드': ['미슐랭', '미쉐린', 'michelin'],
  '미쉘린가이드': ['미슐랭', '미쉐린', 'michelin'],
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
      if (bestField && CORE_FIELDS.has(bestField)) coreFieldMatched = true
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
  const tabParam = searchParams.get('tab')
  const urlHasTabParam = tabParam !== null
  const initialTab: SourceTab = isSourceTab(tabParam) ? tabParam : 'all'

  const [query, setQuery] = useState(initialQuery)
  const [tab, setTab] = useState<SourceTab>(initialTab)
  const [showSuggest, setShowSuggest] = useState(false)
  const [showSourceFilter, setShowSourceFilter] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const restoredRef = useRef(false)

  // 마운트 후 출처 탭 복원(읽기) — URL의 tab이 우선, 없으면 저장된 마지막 탭.
  // (서버 렌더는 항상 URL 기준 initialTab 으로 일치 → hydration 안전, 복원은 클라이언트 1회)
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    // URL이 tab을 명시하면(유효/무효 모두) 저장값보다 우선 → initialTab 유지.
    if (urlHasTabParam) return
    // URL에 tab이 없으면 저장된 마지막 탭 복원. 유효한 값만 적용(잘못된 값은 아래 sync가 정리).
    try {
      const saved = window.localStorage.getItem(LS_TAB_KEY)
      if (isSourceTab(saved)) setTab(saved)
    } catch {
      // localStorage 미지원 환경(시크릿 브라우저 등) — 무시
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 확정된 출처 탭을 localStorage에 동기화(쓰기) — URL 직접 접근·복원·클릭 모두 일관 저장.
  // 복원 effect(위에서 먼저 선언)가 저장값을 읽은 뒤 setTab 하므로 항상 최종값으로 수렴한다.
  useEffect(() => {
    try {
      window.localStorage.setItem(LS_TAB_KEY, tab)
    } catch {}
  }, [tab])

  // 추천 검색어 펼침은 이 페이지에 머무는 동안만 쓰는 임시 상태다(저장·복원하지 않음).
  // 과거 버전이 남긴 저장값이 있으면 mount 시 1회 정리 → 재진입·새로고침 시 항상 접힘.
  useEffect(() => {
    try {
      window.localStorage.removeItem(LS_SUGGEST_KEY)
    } catch {}
  }, [])

  const queryResults = useMemo(
    () => searchRestaurants(query, restaurants),
    [query, restaurants],
  )

  const results = useMemo(() => {
    const hasQuery = query.trim().length > 0
    const base = hasQuery ? queryResults : tab === 'all' ? [] : restaurants
    if (tab === 'all') return base
    return base.filter((r) => restaurantMatchesSourceTab(r, tab))
  }, [query, tab, queryResults, restaurants])

  // 탭별 결과 수(필터 칩 배지). 검색어 미반영(탭 자체 식당 수).
  const tabCounts = useMemo(() => {
    const counts: Record<SourceTab, number> = {
      all: restaurants.length, tv: 0, michelin: 0, busan: 0, youtube: 0,
    }
    for (const r of restaurants) {
      if (restaurantMatchesSourceTab(r, 'tv')) counts.tv += 1
      if (restaurantMatchesSourceTab(r, 'michelin')) counts.michelin += 1
      if (restaurantMatchesSourceTab(r, 'busan')) counts.busan += 1
      if (restaurantMatchesSourceTab(r, 'youtube')) counts.youtube += 1
    }
    return counts
  }, [restaurants])

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

  // 탭 선택 — state 갱신(localStorage 저장은 위 sync effect 가 담당) + 방송 검색 메뉴 자동 접힘.
  const handleTabChange = (key: SourceTab) => {
    setTab(key)
    setShowSourceFilter(false)
  }

  const handleSuggest = (q: string) => {
    setQuery(q)
    // 추천어 선택 시: 검색 적용 + 추천 영역 접힘(상태 저장) + 키보드 닫기.
    setShowSuggest(false)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const isActive = query.trim().length > 0 || tab !== 'all'
  const activeTabLabel = SOURCE_TABS.find((t) => t.key === tab)?.label ?? '전체'

  const conditionLabel = (() => {
    const q = query.trim()
    if (q && tab !== 'all') return `${q} · ${activeTabLabel} ${results.length}곳`
    if (q) return `‘${q}’ 검색 ${results.length}곳`
    return `${activeTabLabel} 맛집 ${results.length}곳`
  })()

  // 한 줄(grid-cols-5) 출처 필터 칩 — 필터명 위, 결과 수 아래(세로). 줄바꿈/잘림 방지.
  const renderTab = ({ key, label }: { key: SourceTab; label: string }) => {
    const selected = tab === key
    const count = tabCounts[key]
    return (
      <button
        key={key}
        onClick={() => handleTabChange(key)}
        aria-pressed={selected}
        className={`flex flex-col items-center justify-center min-h-[38px] px-0.5 py-1 rounded-md border transition-colors ${
          selected
            ? 'bg-orange-500 border-orange-500 text-white'
            : 'bg-white border-gray-300 text-gray-800 active:bg-gray-100'
        }`}
      >
        <span className={`text-[12px] leading-tight whitespace-nowrap ${selected ? 'font-semibold' : 'font-medium'}`}>
          {label}
        </span>
        <span className={`text-[10px] leading-tight ${selected ? 'text-orange-100' : 'text-gray-400'}`}>
          {count}
        </span>
      </button>
    )
  }

  return (
    <main className="pt-14 pb-20">
      {/* 1. 검색 입력창 (sticky) */}
      <div className="sticky top-14 z-10 bg-white border-b border-gray-100 px-4 py-2.5">
        <div className="relative flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
          <svg
            className="w-4 h-4 text-gray-400 flex-shrink-0"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="식당명, 메뉴, 방송·출처..."
            className="flex-1 bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none"
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

      {/* 2. 추천 검색어 — 기본 접힘. 토글로만 펼침(focus 자동 펼침 없음). 진입 동안만 쓰는 임시 상태(저장 안 함). */}
      <section className="px-4 pt-2">
        <button
          type="button"
          onClick={() => setShowSuggest((v) => !v)}
          aria-expanded={showSuggest}
          aria-controls="suggest-panel"
          className="flex w-full items-center justify-between min-h-[38px] text-[14px] font-medium text-gray-600"
        >
          <span>추천 검색어</span>
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showSuggest ? 'rotate-90' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
        {showSuggest && (
          <div id="suggest-panel" className="mt-1.5 flex flex-wrap gap-1.5">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggest(q)}
                className="min-h-[38px] text-[14px] font-medium px-3 py-1.5 rounded-full border border-gray-300 text-gray-800 bg-white active:bg-gray-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 3. 방송 검색 — 추천 검색어와 같은 접힘 토글. 펼치면 5개 출처 필터 한 줄(저장 안 함). */}
      <section className="px-4 pt-2">
        <button
          type="button"
          onClick={() => setShowSourceFilter((v) => !v)}
          aria-expanded={showSourceFilter}
          aria-controls="source-filter-panel"
          className="flex w-full items-center justify-between min-h-[38px] text-[14px] font-medium text-gray-600"
        >
          <span>방송 검색</span>
          <span className="flex items-center gap-1">
            <span className="text-[13px] font-semibold text-orange-600">{activeTabLabel}</span>
            <span className="text-[12px] text-gray-400">{tabCounts[tab]}</span>
            <svg
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showSourceFilter ? 'rotate-90' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </button>
        {showSourceFilter && (
          <div id="source-filter-panel" className="mt-1.5 grid grid-cols-5 gap-1">
            {SOURCE_TABS.map(renderTab)}
          </div>
        )}
      </section>

      {/* 4. 결과 / 안내 */}
      {isActive ? (
        <section className="px-4 pt-2">
          <p className="text-xs text-gray-500 mb-2 font-medium">{conditionLabel}</p>
          {results.length > 0 ? (
            <div className="flex flex-col gap-3">
              {results.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-14 gap-3 text-center">
              <span className="text-5xl">😅</span>
              {tab !== 'all' && !query.trim() ? (
                <p className="text-base font-bold text-gray-800">{activeTabLabel} 출처의 등록 식당이 아직 없어요</p>
              ) : (
                <p className="text-base font-bold text-gray-800">
                  ‘{query.trim()}’{tab !== 'all' && <> · {activeTabLabel}</>} 결과가 없어요
                </p>
              )}
              {tab !== 'all' && (
                <button
                  onClick={() => handleTabChange('all')}
                  className="text-sm px-4 py-2 rounded-full border border-orange-300 text-orange-600 bg-orange-50 active:bg-orange-100 font-medium"
                >
                  전체에서 다시 보기
                </button>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="px-4 pt-8 flex flex-col items-center text-center">
          <span className="text-3xl">🔍</span>
          <p className="mt-2 text-sm text-gray-400">
            검색어를 입력하거나 위 출처로 골라보세요
          </p>
        </section>
      )}
    </main>
  )
}
