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
// generateStaticParams 전용 — slug 목록
// ─────────────────────────────────────────────

/**
 * 게시된 맛집 slug 목록 반환
 * generateStaticParams 에서 사용
 */
export async function getRestaurantSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return mockRestaurants.filter((r) => r.isPublished).map((r) => r.slug)
  }

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_published', true)

    if (error || !data || data.length === 0) {
      return mockRestaurants.filter((r) => r.isPublished).map((r) => r.slug)
    }

    return (data as RestaurantRow[]).map((r) => r.slug)
  } catch {
    return mockRestaurants.filter((r) => r.isPublished).map((r) => r.slug)
  }
}
