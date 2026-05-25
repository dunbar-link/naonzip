/**
 * 맛집 데이터 fetching 레이어
 *
 * - Supabase 환경변수가 있으면 → DB에서 slug 기준으로 조회
 * - 없거나 실패하면 → mock 데이터로 fallback
 *
 * 이 파일은 서버 컴포넌트 / 서버 함수에서만 호출한다.
 */

import type { RestaurantRow } from '@/types/supabase'
import type { Restaurant } from '@/types/restaurant'
import { mockRestaurants } from '@/data/mock-restaurants'
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase'
import {
  getProgramSlugFromName,
  getProgramNameFromSlug,
} from '@/lib/programs'
import {
  getAreaSlugFromName,
  getAreaNameFromSlug,
} from '@/lib/areas'

// ─────────────────────────────────────────────
// 정렬 정책 (전역 안정 정렬)
//   1순위: 방송일 broadcastDate 내림차순 (없으면 뒤)
//   2순위: slug 오름차순 (tie-breaker, 안정성 확보)
//   * Supabase 쿼리에서는 추가로 created_at desc 를 2순위에 끼워넣어
//     실데이터 양이 늘어났을 때도 일관성을 유지한다.
// ─────────────────────────────────────────────

function compareForList(a: Restaurant, b: Restaurant): number {
  const aDate = a.broadcastDate ?? ''
  const bDate = b.broadcastDate ?? ''
  // 방송일이 있는 데이터가 항상 앞으로
  if (aDate && !bDate) return -1
  if (!aDate && bDate) return 1
  // 둘 다 있으면 최신순(내림차순)
  if (aDate !== bDate) return aDate < bDate ? 1 : -1
  // tie-breaker: slug 오름차순
  return a.slug.localeCompare(b.slug)
}

function sortRestaurants(list: Restaurant[]): Restaurant[] {
  return [...list].sort(compareForList)
}

// ─────────────────────────────────────────────
// DB 행 → 앱 타입 변환
// ─────────────────────────────────────────────

function rowToRestaurant(row: RestaurantRow): Restaurant {
  const broadcastDate = row.broadcast_date ?? undefined
  const appearedAt = broadcastDate ? broadcastDate.slice(0, 7) : undefined

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    area: row.area as Restaurant['area'],
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    category: row.category,
    mainMenu: row.main_menu,
    priceText: row.price_text,
    phone: row.phone ?? undefined,
    thumbnail: row.thumbnail ?? undefined,
    creatorName: row.creator_name ?? undefined,
    programName: row.program_name ?? undefined,
    episodeTitle: row.episode_title ?? undefined,
    broadcastDate,
    appearedAt,
    description: row.description ?? undefined,
    videoUrl: row.video_url ?? undefined,
    kakaoMapUrl: row.kakao_map_url ?? undefined,
    naverMapUrl: row.naver_map_url ?? undefined,
    tmapUrl: row.tmap_url ?? undefined,
    sourceType: row.source_type,
    sourceTitle: row.source_title,
    isPublished: row.is_published,
  }
}

// ─────────────────────────────────────────────
// slug 기반 단일 조회
// ─────────────────────────────────────────────

/**
 * slug 로 게시된 맛집 1건 조회
 *
 * Supabase 미설정  → mock fallback
 * Supabase 오류   → mock fallback
 * 데이터 없음     → mock fallback (없으면 null)
 */
export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  if (!isSupabaseConfigured()) {
    return mockRestaurants.find((r) => r.slug === slug && r.isPublished) ?? null
  }

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error || !data) {
      return mockRestaurants.find((r) => r.slug === slug && r.isPublished) ?? null
    }

    return rowToRestaurant(data)
  } catch (err) {
    console.error('[restaurants] getRestaurantBySlug 예외, mock fallback:', err)
    return mockRestaurants.find((r) => r.slug === slug && r.isPublished) ?? null
  }
}

// ─────────────────────────────────────────────
// 게시된 맛집 전체 목록
// ─────────────────────────────────────────────

/**
 * 게시된 맛집 전체 목록 반환
 *
 * Supabase 미설정  → mock fallback
 * Supabase 오류   → mock fallback
 * 데이터 없음     → mock fallback
 */
export async function getRestaurants(): Promise<Restaurant[]> {
  if (!isSupabaseConfigured()) {
    return sortRestaurants(mockRestaurants.filter((r) => r.isPublished))
  }

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_published', true)
      .order('broadcast_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .order('slug', { ascending: true })

    if (error || !data || data.length === 0) {
      return sortRestaurants(mockRestaurants.filter((r) => r.isPublished))
    }

    return (data as RestaurantRow[]).map(rowToRestaurant)
  } catch (err) {
    console.error('[restaurants] getRestaurants 예외, mock fallback:', err)
    return sortRestaurants(mockRestaurants.filter((r) => r.isPublished))
  }
}

// ─────────────────────────────────────────────
// generateStaticParams 전용 — slug 목록
// ─────────────────────────────────────────────

/**
 * 게시된 맛집 slug 목록 반환
 * generateStaticParams 에서 사용
 */
export async function getRestaurantSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return sortRestaurants(mockRestaurants.filter((r) => r.isPublished)).map((r) => r.slug)
  }

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_published', true)
      .order('broadcast_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .order('slug', { ascending: true })

    if (error || !data || data.length === 0) {
      return sortRestaurants(mockRestaurants.filter((r) => r.isPublished)).map((r) => r.slug)
    }

    return (data as RestaurantRow[]).map((r) => r.slug)
  } catch {
    return sortRestaurants(mockRestaurants.filter((r) => r.isPublished)).map((r) => r.slug)
  }
}

// ─────────────────────────────────────────────
// program landing — slug 목록
// ─────────────────────────────────────────────

/**
 * 공개된 맛집 전체에서 등장하는 program slug 목록 반환.
 *
 * 각 row의 sourceTitle / programName / creatorName 중 매핑 가능한 값을
 * 영어 slug로 변환한 뒤 중복 제거. PROGRAM_NAMES에 없는 raw 값은 제외된다.
 * /program/[slug] 의 generateStaticParams 와 sitemap에서 사용.
 *
 * getRestaurants() 를 그대로 활용하므로 Supabase/mock fallback 동작도 자동 승계.
 */
export async function getProgramSlugs(): Promise<string[]> {
  const restaurants = await getRestaurants()
  const slugSet = new Set<string>()

  for (const r of restaurants) {
    const candidates: Array<string | undefined> = [
      r.sourceTitle,
      r.programName,
      r.creatorName,
    ]
    for (const candidate of candidates) {
      const slug = getProgramSlugFromName(candidate)
      if (slug) slugSet.add(slug)
    }
  }

  return Array.from(slugSet).sort()
}

// ─────────────────────────────────────────────
// program landing — slug 기반 맛집 조회
// ─────────────────────────────────────────────

/**
 * 주어진 program slug에 매칭되는 공개 맛집 목록 반환.
 *
 * 매칭 규칙: row 의 sourceTitle / programName / creatorName 중 하나라도
 * 정규화 후 해당 slug에 매핑되면 포함.
 *
 * 정렬은 getRestaurants() 에서 이미 broadcast_date desc 정책이 적용되어 있으므로
 * filter 가 정렬을 흐트러뜨리지 않는다.
 *
 * PROGRAM_NAMES 에 없는 slug → { name: null, restaurants: [] }.
 * 매칭 결과가 비어 있어도 name 은 유지되며 (landing page 가 notFound 처리).
 */
export async function getRestaurantsByProgramSlug(
  slug: string,
): Promise<{ name: string | null; restaurants: Restaurant[] }> {
  const name = getProgramNameFromSlug(slug)
  if (!name) return { name: null, restaurants: [] }

  const all = await getRestaurants()
  const matched = all.filter((r) => {
    const fromSource = getProgramSlugFromName(r.sourceTitle)
    if (fromSource === slug) return true
    const fromProgram = getProgramSlugFromName(r.programName)
    if (fromProgram === slug) return true
    const fromCreator = getProgramSlugFromName(r.creatorName)
    if (fromCreator === slug) return true
    return false
  })

  return { name, restaurants: matched }
}

// ─────────────────────────────────────────────
// area landing — slug 목록
// ─────────────────────────────────────────────

/**
 * 공개된 맛집 전체에서 등장하는 area slug 목록 반환.
 * "기타"(etc)는 제외. 3건 미만 area도 제외.
 * /area/[slug] 의 generateStaticParams 와 sitemap에서 사용.
 */
export async function getAreaSlugs(): Promise<string[]> {
  const restaurants = await getRestaurants()
  const countMap = new Map<string, number>()

  for (const r of restaurants) {
    const slug = getAreaSlugFromName(r.area)
    if (!slug) continue
    countMap.set(slug, (countMap.get(slug) ?? 0) + 1)
  }

  return Array.from(countMap.entries())
    .filter(([, count]) => count >= 3)
    .map(([slug]) => slug)
    .sort()
}

// ─────────────────────────────────────────────
// area landing — slug 기반 맛집 조회
// ─────────────────────────────────────────────

/**
 * 주어진 area slug에 매칭되는 공개 맛집 목록 반환.
 *
 * - "etc" 및 매핑 없는 slug → { name: null, restaurants: [] }
 * - 결과 3건 미만 → { name: null, restaurants: [] } (notFound 처리)
 * - 정렬은 getRestaurants() broadcast_date desc 정책 승계.
 */
export async function getRestaurantsByAreaSlug(
  slug: string,
): Promise<{ name: string | null; restaurants: Restaurant[] }> {
  const areaName = getAreaNameFromSlug(slug)
  if (!areaName) return { name: null, restaurants: [] }

  const all = await getRestaurants()
  const matched = all.filter((r) => r.area === areaName)

  if (matched.length < 3) return { name: null, restaurants: [] }

  return { name: areaName, restaurants: matched }
}
