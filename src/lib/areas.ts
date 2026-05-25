/**
 * 지역(area) 메타 — 한국어 AreaType ↔ 영어 slug 매핑
 *
 * AreaType은 TypeScript enum으로 강제되므로 표기 흔들림 없음.
 * normalize 함수 불필요.
 *
 * - AREA_SLUGS: AreaType → 영어 slug
 * - AREA_NAMES: 영어 slug → 대표 한국어 표시명 (AreaType)
 * - getAreaSlugFromName: area 값에서 slug 반환, "기타"는 null
 */

import type { AreaType } from '@/types/restaurant'

// ─────────────────────────────────────────────
// 매핑 — AreaType → 영어 slug
// ─────────────────────────────────────────────

export const AREA_SLUGS: Record<AreaType, string> = {
  '해운대': 'haeundae',
  '서면': 'seomyeon',
  '광안리': 'gwangalli',
  '남포동': 'nampodong',
  '기장': 'gijang',
  '동래': 'dongrae',
  '사상': 'sasang',
  '영도': 'yeongdo',
  '남구': 'namgu',
  '연제': 'yeonje',
  '기타': 'etc',
}

// ─────────────────────────────────────────────
// 매핑 — 영어 slug → 대표 한국어 표시명
// ─────────────────────────────────────────────

export const AREA_NAMES: Record<string, AreaType> = {
  'haeundae': '해운대',
  'seomyeon': '서면',
  'gwangalli': '광안리',
  'nampodong': '남포동',
  'gijang': '기장',
  'dongrae': '동래',
  'sasang': '사상',
  'yeongdo': '영도',
  'namgu': '남구',
  'yeonje': '연제',
  'etc': '기타',
}

// ─────────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────────

/**
 * AreaType 값에서 slug 반환.
 * "기타"는 SEO 가치 없으므로 null 반환.
 * 매핑에 없는 값도 null.
 */
export function getAreaSlugFromName(area: string | null | undefined): string | null {
  if (!area) return null
  if (area === '기타') return null
  return AREA_SLUGS[area as AreaType] ?? null
}

/**
 * slug에서 AreaType 반환. 매핑에 없으면 null.
 * "etc"는 null (노출 제외).
 */
export function getAreaNameFromSlug(slug: string): AreaType | null {
  if (slug === 'etc') return null
  return AREA_NAMES[slug] ?? null
}
