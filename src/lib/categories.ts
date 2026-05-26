/**
 * 카테고리(category) 메타 — 한국어 표시명 ↔ 영어 slug 매핑
 *
 * 본 phase는 MVP 4개 category 만 운영:
 *   돼지국밥 / 밀면 / 회 / 곱창
 *
 * 매칭 규칙:
 *   - 기본: restaurant.category 컬럼이 표시명과 동일하면 매칭
 *   - 'gopchang' 만 예외: category 가 '고기' / '한식' 등으로 분산되어 있어
 *     main_menu (또는 category) 에 '곱창'/'양곱창' 키워드가 포함되면 매칭
 */

// ─────────────────────────────────────────────
// 매핑
// ─────────────────────────────────────────────

export const CATEGORY_SLUGS: Record<string, string> = {
  '돼지국밥': 'dwaeji-gukbap',
  '밀면':    'milmyeon',
  '회':      'hoe',
  '곱창':    'gopchang',
}

export const CATEGORY_NAMES: Record<string, string> = {
  'dwaeji-gukbap': '돼지국밥',
  'milmyeon':      '밀면',
  'hoe':           '회',
  'gopchang':      '곱창',
}

// ─────────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────────

export function getCategoryNameFromSlug(slug: string): string | null {
  return CATEGORY_NAMES[slug] ?? null
}

/**
 * 식당의 category 컬럼이 직접 대응되는 slug 반환.
 * (gopchang 은 category 컬럼만으로는 잡히지 않으므로 이 함수에서는 null)
 * 카드/상세의 cross-nav 직접 link 계산 시 사용.
 */
export function getCategorySlugFromCategory(
  category: string | null | undefined,
): string | null {
  if (!category) return null
  return CATEGORY_SLUGS[category] ?? null
}

/**
 * cross-nav 용 slug 추론.
 * category 일치가 없으면 main_menu 에 '곱창' 류 키워드가 있는지 확인하고 'gopchang' 반환.
 */
export function getCategorySlugForRestaurant(
  category: string | null | undefined,
  mainMenu: string | null | undefined,
): string | null {
  const direct = getCategorySlugFromCategory(category)
  if (direct) return direct
  const blob = `${mainMenu ?? ''} ${category ?? ''}`
  if (/곱창|양곱창/.test(blob)) return 'gopchang'
  return null
}

/**
 * 주어진 slug 에 식당이 매칭되는지 검사.
 * landing 페이지 / sitemap 의 filter 함수.
 */
export function matchesCategorySlug(
  slug: string,
  category: string | null | undefined,
  mainMenu: string | null | undefined,
): boolean {
  if (slug === 'gopchang') {
    const blob = `${mainMenu ?? ''} ${category ?? ''}`
    return /곱창|양곱창/.test(blob)
  }
  const expected = getCategoryNameFromSlug(slug)
  if (!expected) return false
  return category === expected
}
