/**
 * 맛집 데이터 fetching 레이어
 *
 * - Supabase 환경변수가 있으면 → DB에서 slug 기준으로 조회
 * - 없거나 실패하면 → mock 데이터로 fallback
 *
 * 이 파일은 서버 컴포넌트 / 서버 함수에서만 호출한다.
 */

import type {
  RestaurantRow,
  RestaurantAppearanceRow,
  RestaurantTrustSourceRow,
} from '@/types/supabase'
import type { Restaurant, Appearance, TrustSource } from '@/types/restaurant'
import { mockRestaurants } from '@/data/mock-restaurants'
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase'
import {
  getProgramSlugFromName,
  getProgramNameFromSlug,
} from '@/lib/programs'
import {
  getCategoryNameFromSlug,
  matchesCategorySlug,
  CATEGORY_NAMES,
} from '@/lib/categories'
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
// 방송 출연(appearance) 어댑터
//   - 대표 방송 선정: broadcast_date 있는 것 우선 → 최신 DESC → 동률/없음이면 created_at DESC
//   - appearance 가 없으면(미backfill/조회실패) restaurants row 의 방송 컬럼을 단일 appearance 로 fallback
//     → 기존 화면 출력이 그대로 유지된다(Step 1: 화면 변화 없음).
// ─────────────────────────────────────────────

function appearanceRowToAppearance(a: RestaurantAppearanceRow): Appearance {
  return {
    id: a.id,
    restaurantId: a.restaurant_id,
    sourceType: a.source_type,
    sourceTitle: a.source_title,
    programName: a.program_name ?? undefined,
    creatorName: a.creator_name ?? undefined,
    episodeTitle: a.episode_title ?? undefined,
    broadcastDate: a.broadcast_date ?? undefined,
    videoUrl: a.video_url ?? undefined,
    candidateId: a.candidate_id ?? undefined,
    note: a.note ?? undefined,
    createdAt: a.created_at,
  }
}

// ─────────────────────────────────────────────
// 신뢰 출처(trust source) 어댑터 [TRUST-H4]
//   - restaurant_trust_sources 1행 → 앱 TrustSource. null 컬럼은 undefined 로.
//   - source_kind 는 DB CHECK 화이트리스트로 보장되므로 그대로 사용한다.
// ─────────────────────────────────────────────
function trustSourceRowToTrustSource(row: RestaurantTrustSourceRow): TrustSource {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    sourceKind: row.source_kind,
    sourceName: row.source_name,
    sourceUrl: row.source_url ?? undefined,
    sourceTitle: row.source_title ?? undefined,
    sourceNote: row.source_note ?? undefined,
    trustLabel: row.trust_label ?? undefined,
    verifiedAt: row.verified_at ?? undefined,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// restaurant_trust_sources 조회 실패(테이블 미적용/네트워크 등)는 1회만 경고한다(로그 스팸 방지).
// 실패해도 throw 하지 않고, 사이트는 기존 appearances 출처 칩으로 계속 동작한다.
let trustSourcesWarned = false
function warnTrustSourcesOnce(detail: string): void {
  if (trustSourcesWarned) return
  trustSourcesWarned = true
  console.warn(
    '[restaurants] restaurant_trust_sources 조회 실패 — 기존 출처만 표시(테이블 미적용일 수 있음): ' +
      detail,
  )
}

/** restaurants row 의 방송 컬럼으로 만든 단일 fallback appearance. */
function fallbackAppearanceFromRow(row: RestaurantRow): Appearance {
  return {
    id: `${row.id}:legacy`,
    restaurantId: row.id,
    sourceType: row.source_type,
    sourceTitle: row.source_title,
    programName: row.program_name ?? undefined,
    creatorName: row.creator_name ?? undefined,
    episodeTitle: row.episode_title ?? undefined,
    broadcastDate: row.broadcast_date ?? undefined,
    videoUrl: row.video_url ?? undefined,
    createdAt: row.created_at,
  }
}

/** 대표 방송이 앞에 오도록 정렬: broadcastDate desc(없으면 뒤) → createdAt desc. */
function compareAppearances(a: Appearance, b: Appearance): number {
  const ad = a.broadcastDate ?? ''
  const bd = b.broadcastDate ?? ''
  if (ad && !bd) return -1
  if (!ad && bd) return 1
  if (ad !== bd) return ad < bd ? 1 : -1
  // 동률 또는 둘 다 없음 → created_at 최신순
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1
  return 0
}

// ─────────────────────────────────────────────
// DB 행 → 앱 타입 변환
// ─────────────────────────────────────────────

function rowToRestaurant(
  row: RestaurantRow,
  appearanceRows: RestaurantAppearanceRow[] = [],
): Restaurant {
  // appearance 가 있으면 그걸로, 없으면 row 방송컬럼 단일 fallback. 최신순 정렬.
  const appearances =
    appearanceRows.length > 0
      ? appearanceRows.map(appearanceRowToAppearance).sort(compareAppearances)
      : [fallbackAppearanceFromRow(row)]

  // 대표 방송 = 정렬 후 첫 번째. 기존 Restaurant 방송 필드는 이 값으로 채운다.
  const rep = appearances[0]
  const broadcastDate = rep.broadcastDate
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
    creatorName: rep.creatorName,
    programName: rep.programName,
    episodeTitle: rep.episodeTitle,
    broadcastDate,
    appearedAt,
    description: row.description ?? undefined,
    videoUrl: rep.videoUrl,
    kakaoMapUrl: row.kakao_map_url ?? undefined,
    naverMapUrl: row.naver_map_url ?? undefined,
    tmapUrl: row.tmap_url ?? undefined,
    sourceType: rep.sourceType,
    sourceTitle: rep.sourceTitle,
    isPublished: row.is_published,
    appearances,
  }
}

/** mock Restaurant 에 appearances 가 없으면 기존 방송 필드로 단일 fallback 을 채운다. */
function withFallbackAppearance(r: Restaurant): Restaurant {
  if (r.appearances && r.appearances.length > 0) return r
  return {
    ...r,
    appearances: [
      {
        id: `${r.id}:legacy`,
        restaurantId: r.id,
        sourceType: r.sourceType,
        sourceTitle: r.sourceTitle,
        programName: r.programName,
        creatorName: r.creatorName,
        episodeTitle: r.episodeTitle,
        broadcastDate: r.broadcastDate,
        videoUrl: r.videoUrl,
        createdAt: '',
      },
    ],
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
  const mockBySlug = () => {
    const r = mockRestaurants.find((m) => m.slug === slug && m.isPublished)
    return r ? withFallbackAppearance(r) : null
  }

  if (!isSupabaseConfigured()) {
    return mockBySlug()
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
      return mockBySlug()
    }

    // 대상 식당의 appearance 만 1회 조회(쿼리 총 2회, N+1 아님).
    // 조회 실패해도 rowToRestaurant 가 row 방송컬럼으로 fallback → 화면 유지.
    const { data: appData } = await supabase
      .from('restaurant_appearances')
      .select('*')
      .eq('restaurant_id', data.id)

    const restaurant = rowToRestaurant(data, (appData as RestaurantAppearanceRow[]) ?? [])

    // 신뢰 출처(공개분) 조회 — [TRUST-H4].
    //   - is_public=true 만, verified_at desc(NULL 뒤) → created_at desc.
    //   - 테이블 미적용/조회 실패해도 throw 하지 않고 기존 출처 칩을 유지한다
    //     (trustSources 미설정 → sources.ts resolver 가 빈 배열로 처리, append-only).
    try {
      const { data: tsData, error: tsError } = await supabase
        .from('restaurant_trust_sources')
        .select('*')
        .eq('restaurant_id', data.id)
        .eq('is_public', true)
        .order('verified_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
      if (tsError) {
        warnTrustSourcesOnce(tsError.message)
      } else if (tsData) {
        restaurant.trustSources = (tsData as RestaurantTrustSourceRow[]).map(
          trustSourceRowToTrustSource,
        )
      }
    } catch (e) {
      warnTrustSourcesOnce(e instanceof Error ? e.message : String(e))
    }

    return restaurant
  } catch (err) {
    console.error('[restaurants] getRestaurantBySlug 예외, mock fallback:', err)
    return mockBySlug()
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
  const mockList = () =>
    sortRestaurants(
      mockRestaurants.filter((r) => r.isPublished).map(withFallbackAppearance),
    )

  if (!isSupabaseConfigured()) {
    return mockList()
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
      return mockList()
    }

    const rows = data as RestaurantRow[]

    // appearance 일괄 조회(.in) — 식당 N건이어도 쿼리 1회. 전체 2쿼리, N+1 아님.
    // 조회 실패 시 빈 맵 → rowToRestaurant 가 row 방송컬럼으로 fallback → 화면 유지.
    const byRestaurant = new Map<string, RestaurantAppearanceRow[]>()
    const { data: appData, error: appError } = await supabase
      .from('restaurant_appearances')
      .select('*')
      .in(
        'restaurant_id',
        rows.map((r) => r.id),
      )
    if (appError) {
      console.error('[restaurants] appearances 조회 실패, row fallback 사용:', appError)
    } else {
      for (const a of (appData as RestaurantAppearanceRow[]) ?? []) {
        const arr = byRestaurant.get(a.restaurant_id) ?? []
        arr.push(a)
        byRestaurant.set(a.restaurant_id, arr)
      }
    }

    return rows.map((r) => rowToRestaurant(r, byRestaurant.get(r.id) ?? []))
  } catch (err) {
    console.error('[restaurants] getRestaurants 예외, mock fallback:', err)
    return mockList()
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

// ─────────────────────────────────────────────
// category landing — slug 목록
// ─────────────────────────────────────────────

/**
 * MVP 정의된 category slug 중, 운영 DB에 1건 이상 매칭이 있는 slug 만 노출.
 * 곱창은 main_menu 키워드 매칭(category 컬럼이 '고기'/'한식' 등에 분산).
 *
 * /category/[slug] 의 generateStaticParams 와 sitemap에서 사용.
 */
export async function getCategorySlugs(): Promise<string[]> {
  const restaurants = await getRestaurants()
  const result: string[] = []
  for (const slug of Object.keys(CATEGORY_NAMES)) {
    const has = restaurants.some((r) =>
      matchesCategorySlug(slug, r.category, r.mainMenu),
    )
    if (has) result.push(slug)
  }
  return result.sort()
}

// ─────────────────────────────────────────────
// category landing — slug 기반 맛집 조회
// ─────────────────────────────────────────────

/**
 * 주어진 category slug 에 매칭되는 공개 맛집 목록 반환.
 * - 정렬은 getRestaurants() 의 broadcast_date desc 정책 그대로.
 * - 매칭 0건 → { name: null, restaurants: [] } → landing page 가 notFound 처리.
 */
export async function getRestaurantsByCategorySlug(
  slug: string,
): Promise<{ name: string | null; restaurants: Restaurant[] }> {
  const name = getCategoryNameFromSlug(slug)
  if (!name) return { name: null, restaurants: [] }

  const all = await getRestaurants()
  const matched = all.filter((r) =>
    matchesCategorySlug(slug, r.category, r.mainMenu),
  )

  if (matched.length === 0) return { name: null, restaurants: [] }
  return { name, restaurants: matched }
}

// ─────────────────────────────────────────────
// creator landing — slug 목록
// ─────────────────────────────────────────────

/**
 * 공개된 맛집 중 sourceType==='youtube' 이고 creatorName이 있는 레코드를
 * 대상으로 한 creator slug 목록.
 *
 * slug 은 기존 PROGRAM_SLUGS 매핑(getProgramSlugFromName)을 그대로 재사용한다.
 * PROGRAM_NAMES에 없는 creatorName은 자동 제외.
 *
 * /creator/[slug] 의 generateStaticParams 와 sitemap에서 사용.
 */
export async function getCreatorSlugs(): Promise<string[]> {
  const restaurants = await getRestaurants()
  const slugSet = new Set<string>()

  for (const r of restaurants) {
    if (r.sourceType !== 'youtube') continue
    if (!r.creatorName) continue
    const slug = getProgramSlugFromName(r.creatorName)
    if (slug) slugSet.add(slug)
  }

  return Array.from(slugSet).sort()
}

// ─────────────────────────────────────────────
// creator landing — slug 기반 맛집 조회
// ─────────────────────────────────────────────

/**
 * 주어진 creator slug에 매칭되는 공개 유튜브 맛집 목록 반환.
 *
 * - 필터: sourceType==='youtube' && getProgramSlugFromName(creatorName) === slug
 * - 표시명: getProgramNameFromSlug(slug)를 우선 사용,
 *   매칭이 없으면 첫 매칭 레코드의 creatorName fallback.
 * - 매칭 0건 → { name: null, restaurants: [] } (landing page가 notFound 처리)
 *
 * 정렬은 getRestaurants() 의 broadcast_date desc 정책 그대로 승계.
 */
export async function getRestaurantsByCreatorSlug(
  slug: string,
): Promise<{ name: string | null; restaurants: Restaurant[] }> {
  const all = await getRestaurants()
  const matched = all.filter(
    (r) =>
      r.sourceType === 'youtube' &&
      r.creatorName &&
      getProgramSlugFromName(r.creatorName) === slug,
  )

  if (matched.length === 0) return { name: null, restaurants: [] }

  const name =
    getProgramNameFromSlug(slug) ?? matched[0].creatorName ?? null

  return { name, restaurants: matched }
}

// ─────────────────────────────────────────────
// 관련 맛집 추천
// ─────────────────────────────────────────────

/**
 * 현재 식당과 관련된 맛집을 점수 기반으로 추천한다.
 * - 같은 area +5, 같은 program +4, 같은 category +3
 * - 자기 자신 제외, score 0 제외
 * - score desc → broadcastDate desc 정렬
 */
export async function getRelatedRestaurants(
  current: Restaurant,
  limit = 6,
): Promise<Restaurant[]> {
  const all = await getRestaurants()

  const currentProgramSlug =
    getProgramSlugFromName(current.creatorName) ??
    getProgramSlugFromName(current.programName) ??
    getProgramSlugFromName(current.sourceTitle)

  type Scored = { restaurant: Restaurant; score: number }
  const scored: Scored[] = []

  for (const r of all) {
    if (r.id === current.id) continue

    let score = 0
    if (r.area === current.area) score += 5

    const rProgramSlug =
      getProgramSlugFromName(r.creatorName) ??
      getProgramSlugFromName(r.programName) ??
      getProgramSlugFromName(r.sourceTitle)
    if (currentProgramSlug && rProgramSlug && currentProgramSlug === rProgramSlug) score += 4

    if (r.category === current.category) score += 3

    if (score > 0) scored.push({ restaurant: r, score })
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const aDate = a.restaurant.broadcastDate ?? ''
    const bDate = b.restaurant.broadcastDate ?? ''
    if (aDate && !bDate) return -1
    if (!aDate && bDate) return 1
    return bDate.localeCompare(aDate)
  })

  return scored.slice(0, limit).map((s) => s.restaurant)
}
