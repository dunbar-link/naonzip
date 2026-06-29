/**
 * 검색 로직 (dependency-free 순수 함수) — SearchClient(UI)와 유닛 테스트가 공유한다.
 *
 * - 런타임 의존성 0: `import type` 만 사용 → Node가 .ts 를 직접 import해 브라우저/DOM 없이 테스트 가능.
 * - searchRestaurants: 공백 토큰 분리 → 토큰별 동의어/접미어 확장 → 필드 includes + 가중치 점수 → 정렬.
 * - UI 동작(검색 결과/정렬)은 분리 전과 동일하다.
 */
import type { Restaurant } from '@/types/restaurant'

// 검색 동의어 맵 — 토큰이 key와 정확히 일치하면 expansion 배열로 OR 매칭한다.
export const SYNONYMS: Record<string, string[]> = {
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

export type SearchableField =
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
export const SEARCH_SUFFIXES = ['맛집', '집', '식당']
export function stripSearchSuffix(token: string): string {
  for (const suf of SEARCH_SUFFIXES) {
    if (token.length > suf.length && token.endsWith(suf)) return token.slice(0, -suf.length)
  }
  return token
}

export function expandToken(token: string): string[] {
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

export function searchRestaurants(query: string, restaurants: Restaurant[]): Restaurant[] {
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
