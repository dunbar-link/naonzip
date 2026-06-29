'use client'

import { useState, useMemo, useEffect, useRef, useSyncExternalStore } from 'react'
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

// 출처 탭(localStorage)을 외부 스토어로 노출 — useSyncExternalStore 로 구독해
// setState-in-effect 없이 hydration 안전하게 복원한다(getServerSnapshot 은 'all').
const TAB_CHANGE_EVENT = 'naonzip:source-tab-change'
function subscribeStoredTab(onChange: () => void) {
  window.addEventListener(TAB_CHANGE_EVENT, onChange)
  return () => window.removeEventListener(TAB_CHANGE_EVENT, onChange)
}
function readStoredTab(): SourceTab {
  try {
    const saved = window.localStorage.getItem(LS_TAB_KEY)
    if (isSourceTab(saved)) return saved
  } catch {
    // localStorage 미지원 환경(시크릿 브라우저 등) — 무시
  }
  return 'all'
}
function writeStoredTab(tab: SourceTab) {
  try {
    window.localStorage.setItem(LS_TAB_KEY, tab)
  } catch {}
  window.dispatchEvent(new Event(TAB_CHANGE_EVENT))
}

// 검색 동의어 맵 — 토큰이 key와 정확히 일치하면 expansion 배열로 OR 매칭한다.
const SYNONYMS: Record<string, string[]> = {
  '빵집': ['빵집', '베이커리', '디저트', '빵'],
  '베이커리': ['베이커리', '디저트', '빵'],
  '국밥': ['국밥', '돼지국밥'],
  '노포': ['노포', '전통', '원조', '40년', '50년', '60년'],
  '또간집': ['또간집', '풍자'],
  '횟집': ['횟집', '회', '회센터'],
  '회': ['회', '회센터', '횟집', '아나고', '해산물', '조개구이'],
  '분식': ['분식', '떡볶이', '김밥', '순대'],
  '갈비집': ['갈비', '돼지갈비', '소갈비'],
  '카페': ['카페', '커피', '디저트'],
  '센텀': ['해운대', '센텀'],
  '남포': ['남포동'],
  '곱창전골': ['곱창', '양곱창'],
  // 음식 자연어 확장 — 접미어 제거(stripSearchSuffix)와 함께 "밀면맛집/국밥집/돼지/고기/회맛집" 흡수.
  //   확장폭은 1차(직접 관련어)만 — "돼지"가 모든 고기집을 무작정 끌어오지 않게 제한.
  '밀면': ['밀면'],
  '돼지국밥': ['돼지국밥', '국밥'],
  '돼지': ['돼지국밥', '수육', '삼겹살', '돼지갈비'],
  '수육': ['수육', '돼지국밥'],
  '고기': ['고기', '삼겹살', '갈비', '돼지갈비', '양곱창', '수육', '불고기'],
  '해장': ['국밥', '곰탕', '복국'],
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

// 검색 접미어(맛집/집/식당) 제거 — "밀면맛집"→"밀면", "국밥집"→"국밥", "회맛집"→"회". 제거 후 1자 이상 남을 때만.
const SEARCH_SUFFIXES = ['맛집', '집', '식당']
function stripSearchSuffix(token: string): string {
  for (const suf of SEARCH_SUFFIXES) {
    if (token.length > suf.length && token.endsWith(suf)) return token.slice(0, -suf.length)
  }
  return token
}

function expandToken(token: string): string[] {
  // 원형이 사전에 있으면 우선 — '또간집'·'갈비집'·'곱창전골' 등 '집' 포함 상호/출처 보호.
  if (SYNONYMS[token]) return SYNONYMS[token]
  const stripped = stripSearchSuffix(token)
  if (stripped !== token) return SYNONYMS[stripped] ?? [stripped, token]
  return [token]
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
  // 출처 탭 상태 분리 — effect 안에서 setState 하지 않고 파생값(tab)으로 결정한다.
  //  · userTab : 이 세션의 명시 선택 탭. URL 에 tab 파라미터가 있으면 그 값으로 마운트 시드
  //    (URL 우선 + hydration 안전). 없으면 null → 저장 탭(storedTab)으로 복원.
  //  · storedTab: localStorage 저장 탭(useSyncExternalStore). userTab 이 없을 때만 적용.
  const [userTab, setUserTab] = useState<SourceTab | null>(() =>
    urlHasTabParam ? initialTab : null,
  )
  const storedTab = useSyncExternalStore<SourceTab>(subscribeStoredTab, readStoredTab, () => 'all')
  const tab: SourceTab = userTab ?? storedTab

  const [showSuggest, setShowSuggest] = useState(false)
  const [showSourceFilter, setShowSourceFilter] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 확정된 출처 탭을 localStorage 에 저장 — URL 직접 접근·복원·클릭 모두 일관 저장.
  // (setState 가 아니라 외부 시스템 동기화라 effect 가 적절. deps 완전 명시 → eslint-disable 불필요.)
  // 복원 전 초기 'all'(선택·복원·URL 모두 없음) 상태에서는 저장값을 덮어쓰지 않는다.
  useEffect(() => {
    if (tab === 'all' && !urlHasTabParam && userTab === null) return
    writeStoredTab(tab)
  }, [tab, urlHasTabParam, userTab])

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
      all: restaurants.length, tv: 0, michelin: 0, busan: 0, youtube: 0, postoffice: 0,
    }
    for (const r of restaurants) {
      if (restaurantMatchesSourceTab(r, 'tv')) counts.tv += 1
      if (restaurantMatchesSourceTab(r, 'michelin')) counts.michelin += 1
      if (restaurantMatchesSourceTab(r, 'busan')) counts.busan += 1
      if (restaurantMatchesSourceTab(r, 'youtube')) counts.youtube += 1
      if (restaurantMatchesSourceTab(r, 'postoffice')) counts.postoffice += 1
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

  // 탭 선택 — userTab 갱신(localStorage 저장은 위 effect 가 담당) + 방송 검색 메뉴 자동 접힘.
  const handleTabChange = (key: SourceTab) => {
    setUserTab(key)
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

      {/* 3. 출처 검색 — 접힘 토글. 펼치면 5개 출처 필터 한 줄(저장 안 함). all 은 펼침에 없고 × 로 해제. */}
      <section className="px-4 pt-2">
        <div className="flex w-full items-center min-h-[38px] text-[14px] font-medium text-gray-600">
          <button
            type="button"
            onClick={() => setShowSourceFilter((v) => !v)}
            aria-expanded={showSourceFilter}
            aria-controls="source-filter-panel"
            className="flex flex-1 items-center justify-between"
          >
            <span>출처 검색</span>
            <span className="flex items-center gap-1">
              <span className="text-[13px] font-semibold text-orange-600">{activeTabLabel}</span>
              <span className="text-[12px] text-gray-400">{tabCounts[tab]}</span>
            </span>
          </button>
          {tab !== 'all' && (
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              aria-label="출처 필터 해제"
              className="ml-1 w-7 h-7 flex items-center justify-center rounded text-gray-400 active:bg-gray-100"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowSourceFilter((v) => !v)}
            aria-label={showSourceFilter ? '출처 필터 접기' : '출처 필터 펼치기'}
            className="w-5 h-5 ml-0.5 flex items-center justify-center text-gray-400"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${showSourceFilter ? 'rotate-90' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
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
