'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth'
import {
  RESTAURANT_SOURCE_TYPES,
  type RestaurantSourceType,
} from '@/types/supabase'
import { AREA_TYPES, type AreaType } from '@/types/restaurant'
import { isInBusanRange } from '@/lib/coords'
import { isValidSlug, SLUG_INVALID_MESSAGE } from '@/lib/slug'

/** 빈/공백 문자열은 null 로 정규화. */
function trimToNull(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t.length > 0 ? t : null
}

function isValidRestaurantSourceType(s: unknown): s is RestaurantSourceType {
  return typeof s === 'string' && (RESTAURANT_SOURCE_TYPES as readonly string[]).includes(s)
}

function isValidArea(s: unknown): s is AreaType {
  return typeof s === 'string' && (AREA_TYPES as readonly string[]).includes(s)
}

/** 빠른 등록 입력 (client 에서 plain object 로 전달). 모든 값 문자열. */
export type QuickRegisterInput = {
  slug: string
  name: string
  area: string
  address: string
  lat: string | number
  lng: string | number
  category: string
  main_menu: string
  price_text: string
  source_type: string
  source_title: string
  phone?: string
  thumbnail?: string
  creator_name?: string
  program_name?: string
  episode_title?: string
  broadcast_date?: string
  description?: string
  video_url?: string
  kakao_map_url?: string
  naver_map_url?: string
  tmap_url?: string
  confidence_score?: string | number
}

export type DuplicateMatch = {
  id: string
  slug: string
  name: string
  area: string
  address: string
  is_published: boolean
}

/**
 * 빠른 등록용 중복 후보 조회 (읽기 전용).
 * name ILIKE / slug exact / address ILIKE 를 각각 조회해 id 기준 dedupe.
 * (or 필터에 쉼표·특수문자 값을 넣으면 깨질 수 있어 분리 쿼리로 안전 처리.)
 */
export async function findPossibleDuplicates(input: {
  name?: string
  slug?: string
  address?: string
}): Promise<{ ok: true; matches: DuplicateMatch[] } | { ok: false; error: string }> {
  const c = await cookies()
  const token = c.get(ADMIN_COOKIE_NAME)?.value
  const authed = await verifyAdminSessionToken(token)
  if (!authed) return { ok: false, error: 'unauthorized' }

  const supabase = getSupabaseAdminClient()
  const cols = 'id, slug, name, area, address, is_published'
  const byId = new Map<string, DuplicateMatch>()

  const name = trimToNull(input.name)
  const slug = trimToNull(input.slug)
  const address = trimToNull(input.address)

  const add = (rows: DuplicateMatch[] | null) => {
    for (const r of rows ?? []) byId.set(r.id, r)
  }

  if (name) {
    const { data } = await supabase.from('restaurants').select(cols).ilike('name', `%${name}%`).limit(10)
    add(data as DuplicateMatch[] | null)
  }
  if (slug) {
    const { data } = await supabase.from('restaurants').select(cols).eq('slug', slug).limit(5)
    add(data as DuplicateMatch[] | null)
  }
  if (address) {
    const { data } = await supabase.from('restaurants').select(cols).ilike('address', `%${address}%`).limit(10)
    add(data as DuplicateMatch[] | null)
  }

  return { ok: true, matches: Array.from(byId.values()).slice(0, 12) }
}

/**
 * 빠른 등록 — 신규 restaurant 를 비공개(is_published=false)로 등록하고
 * restaurant_appearances 를 dual-write 하며, candidate_queue 에 VERIFIED+converted 로 기록한다.
 *
 * - 자동 공개 없음(is_published=false 고정). 공개는 별도 setRestaurantPublished 로.
 * - restaurant INSERT → appearance INSERT(실패 시 restaurant 롤백) → candidate 기록(best-effort).
 * - candidate 기록 실패는 로깅만 하고 성공 반환(핵심 데이터는 이미 적재됨).
 */
export async function quickRegisterRestaurant(
  payload: QuickRegisterInput,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const c = await cookies()
  const token = c.get(ADMIN_COOKIE_NAME)?.value
  const authed = await verifyAdminSessionToken(token)
  if (!authed) return { ok: false, error: 'unauthorized' }

  if (!isValidRestaurantSourceType(payload.source_type)) {
    return { ok: false, error: '소스 유형은 youtube/tv/sns 중에서 선택해주세요.' }
  }
  if (!isValidArea(payload.area)) {
    return { ok: false, error: '지역을 목록에서 선택해주세요.' }
  }

  const slug = trimToNull(payload.slug)
  const name = trimToNull(payload.name)
  const address = trimToNull(payload.address)
  const category = trimToNull(payload.category)
  const mainMenu = trimToNull(payload.main_menu)
  const priceText = trimToNull(payload.price_text)
  const sourceTitle = trimToNull(payload.source_title)

  if (!slug) return { ok: false, error: 'slug 를 입력해주세요.' }
  if (!isValidSlug(slug)) return { ok: false, error: SLUG_INVALID_MESSAGE }
  if (!name) return { ok: false, error: '식당명을 입력해주세요.' }
  if (!address) return { ok: false, error: '주소를 입력해주세요.' }
  if (!category) return { ok: false, error: '카테고리를 입력해주세요.' }
  if (!mainMenu) return { ok: false, error: '대표 메뉴를 입력해주세요.' }
  if (!priceText) return { ok: false, error: '가격대를 입력해주세요.' }
  if (!sourceTitle) return { ok: false, error: '출처명을 입력해주세요.' }

  const lat = Number(payload.lat)
  const lng = Number(payload.lng)
  if (!Number.isFinite(lat)) return { ok: false, error: '위도(lat)는 숫자여야 해요.' }
  if (!Number.isFinite(lng)) return { ok: false, error: '경도(lng)는 숫자여야 해요.' }
  if (lat === 0 || lng === 0) return { ok: false, error: '좌표값을 다시 확인해 주세요.' }
  if (!isInBusanRange(lat, lng)) return { ok: false, error: '좌표가 부산 범위를 벗어난 것 같아요.' }

  const supabase = getSupabaseAdminClient()

  // slug 중복 선검사 (UNIQUE 제약/23505 도 아래에서 한 번 더 잡는다).
  {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .limit(1)
    if (error) {
      console.error('[admin/quick-register] slug 중복 검사 실패:', error)
      return { ok: false, error: 'insert failed' }
    }
    if (data?.length) {
      return { ok: false, error: '이미 존재하는 slug예요. 다른 slug로 바꿔주세요.' }
    }
  }

  const programName = trimToNull(payload.program_name)
  const creatorName = trimToNull(payload.creator_name)
  const episodeTitle = trimToNull(payload.episode_title)
  const broadcastDate = trimToNull(payload.broadcast_date)
  const videoUrl = trimToNull(payload.video_url)

  // 1) restaurants INSERT (is_published=false 고정).
  const { data: inserted, error: insErr } = await supabase
    .from('restaurants')
    .insert(
      {
        slug,
        name,
        area: payload.area,
        address,
        lat,
        lng,
        category,
        main_menu: mainMenu,
        price_text: priceText,
        phone: trimToNull(payload.phone),
        thumbnail: trimToNull(payload.thumbnail),
        creator_name: creatorName,
        program_name: programName,
        episode_title: episodeTitle,
        broadcast_date: broadcastDate,
        description: trimToNull(payload.description),
        video_url: videoUrl,
        kakao_map_url: trimToNull(payload.kakao_map_url),
        naver_map_url: trimToNull(payload.naver_map_url),
        tmap_url: trimToNull(payload.tmap_url),
        source_type: payload.source_type,
        source_title: sourceTitle,
        is_published: false,
      },
      { defaultToNull: false },
    )
    .select('id')
    .single()

  if (insErr || !inserted) {
    if (insErr?.code === '23505') {
      return { ok: false, error: '이미 존재하는 slug예요. 다른 slug로 바꿔주세요.' }
    }
    console.error('[admin/quick-register] restaurant insert 실패:', insErr)
    return { ok: false, error: 'insert failed' }
  }

  // 2) restaurant_appearances dual-write. 실패 시 restaurant 롤백(ON DELETE CASCADE).
  {
    const { error: appErr } = await supabase.from('restaurant_appearances').insert(
      {
        restaurant_id: inserted.id,
        source_type: payload.source_type,
        source_title: sourceTitle,
        program_name: programName,
        creator_name: creatorName,
        episode_title: episodeTitle,
        broadcast_date: broadcastDate,
        video_url: videoUrl,
        candidate_id: null,
        note: '빠른 등록으로 생성된 출연 기록',
      },
      { defaultToNull: false },
    )
    if (appErr) {
      console.error('[admin/quick-register] appearance insert 실패, restaurant 롤백:', appErr)
      const { error: rbErr } = await supabase.from('restaurants').delete().eq('id', inserted.id)
      if (rbErr) console.error('[admin/quick-register] restaurant 롤백 삭제 실패:', rbErr.message)
      return { ok: false, error: 'insert failed' }
    }
  }

  // 3) candidate_queue 기록 (best-effort, VERIFIED + converted). 실패해도 핵심 적재는 완료.
  {
    let confidence = 0.9
    const raw = payload.confidence_score
    if (raw !== undefined && raw !== null && `${raw}`.trim() !== '') {
      const n = typeof raw === 'number' ? raw : Number(raw)
      if (Number.isFinite(n)) confidence = Math.min(1, Math.max(0, n))
    }
    const { error: candErr } = await supabase.from('candidate_queue').insert(
      {
        source_type: payload.source_type,
        source_name: sourceTitle,
        restaurant_name: name,
        area_guess: payload.area,
        source_url: videoUrl,
        episode_title: episodeTitle,
        confidence_score: confidence,
        operator_note: '빠른 등록 페이지에서 생성',
        status: 'VERIFIED' as const,
        converted_restaurant_slug: slug,
        converted_at: new Date().toISOString(),
      },
      { defaultToNull: false },
    )
    if (candErr) {
      console.error('[admin/quick-register] candidate_queue 기록 실패(무시):', candErr.message)
    }
  }

  // 비공개 등록이라 공개 캐시는 건드리지 않는다. 관리자 목록만 무효화.
  revalidatePath('/admin/restaurants')
  revalidatePath('/admin/candidates')
  return { ok: true, slug }
}
