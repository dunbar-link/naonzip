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
import { revalidateRestaurantPublicPaths } from '@/lib/revalidate-restaurants'

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

export type DuplicateStrength = 'strong' | 'medium' | 'weak'

export type DuplicateMatch = {
  id: string
  slug: string
  name: string
  area: string
  address: string
  is_published: boolean
  source_title: string | null
  program_name: string | null
  creator_name: string | null
  kakao_map_url: string | null
  phone: string | null
  lat: number | null
  lng: number | null
  score: number
  strength: DuplicateStrength
  reasons: string[]
}

const normText = (v: unknown): string => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '')
const normPhone = (v: unknown): string => String(v ?? '').replace(/[^0-9]/g, '')

function strengthOf(score: number): DuplicateStrength {
  if (score >= 80) return 'strong'
  if (score >= 40) return 'medium'
  return 'weak'
}

/**
 * 빠른 등록용 중복 후보 조회 + 가중 점수 (읽기 전용).
 * name/slug/address/phone/kakao 로 후보를 모은 뒤, 입력값과 비교해 점수·이유·강도를 부여한다.
 * (or 필터 특수문자 이슈 회피 위해 분리 쿼리 + id dedupe.)
 */
export async function findPossibleDuplicates(input: {
  name?: string
  slug?: string
  address?: string
  phone?: string
  kakao_map_url?: string
  lat?: string | number
  lng?: string | number
  source_title?: string
  program_name?: string
  creator_name?: string
  episode_title?: string
}): Promise<{ ok: true; matches: DuplicateMatch[] } | { ok: false; error: string }> {
  const c = await cookies()
  const token = c.get(ADMIN_COOKIE_NAME)?.value
  const authed = await verifyAdminSessionToken(token)
  if (!authed) return { ok: false, error: 'unauthorized' }

  const supabase = getSupabaseAdminClient()
  const cols =
    'id, slug, name, area, address, is_published, source_title, program_name, creator_name, kakao_map_url, phone, lat, lng'
  const byId = new Map<string, Record<string, unknown>>()

  const name = trimToNull(input.name)
  const slug = trimToNull(input.slug)
  const address = trimToNull(input.address)
  const phone = trimToNull(input.phone)
  const kakao = trimToNull(input.kakao_map_url)

  const add = (rows: Array<Record<string, unknown>> | null | undefined) => {
    for (const r of rows ?? []) byId.set(r.id as string, r)
  }

  if (name) add((await supabase.from('restaurants').select(cols).ilike('name', `%${name}%`).limit(10)).data)
  if (slug) add((await supabase.from('restaurants').select(cols).eq('slug', slug).limit(5)).data)
  if (address) add((await supabase.from('restaurants').select(cols).ilike('address', `%${address}%`).limit(10)).data)
  if (phone) add((await supabase.from('restaurants').select(cols).eq('phone', phone).limit(5)).data)
  if (kakao) add((await supabase.from('restaurants').select(cols).eq('kakao_map_url', kakao).limit(5)).data)

  const inLat = Number(input.lat)
  const inLng = Number(input.lng)
  const inSource = normText(input.source_title) + normText(input.program_name) + normText(input.creator_name) + normText(input.episode_title)

  const matches: DuplicateMatch[] = []
  for (const r of byId.values()) {
    const rSlug = (r.slug as string) ?? ''
    const rName = (r.name as string) ?? ''
    const rAddress = (r.address as string) ?? ''
    const rKakao = (r.kakao_map_url as string | null) ?? null
    const rPhone = (r.phone as string | null) ?? null
    const rLat = typeof r.lat === 'number' ? r.lat : null
    const rLng = typeof r.lng === 'number' ? r.lng : null
    let score = 0
    const reasons: string[] = []
    if (slug && rSlug === slug) { score += 100; reasons.push('slug 일치') }
    if (kakao && rKakao && rKakao === kakao) { score += 90; reasons.push('카카오맵 URL 일치') }
    if (address && normText(rAddress) === normText(address)) { score += 80; reasons.push('주소 일치') }
    if (phone && normPhone(rPhone) && normPhone(rPhone) === normPhone(phone)) { score += 70; reasons.push('전화 일치') }
    if (name && rName === name) { score += 60; reasons.push('이름 일치') }
    else if (name && normText(rName) === normText(name)) { score += 40; reasons.push('이름 유사') }
    if (Number.isFinite(inLat) && Number.isFinite(inLng) && rLat !== null && rLng !== null) {
      if (Math.abs(rLat - inLat) < 0.0008 && Math.abs(rLng - inLng) < 0.0008) { score += 30; reasons.push('좌표 근접') }
    }
    if (inSource) {
      const rSource = normText(r.source_title) + normText(r.program_name) + normText(r.creator_name)
      if (rSource && (inSource.includes(rSource) || rSource.includes(inSource))) { score += 20; reasons.push('출처 유사') }
    }
    matches.push({
      id: r.id as string, slug: rSlug, name: rName, area: (r.area as string) ?? '', address: rAddress,
      is_published: r.is_published === true,
      source_title: (r.source_title as string | null) ?? null,
      program_name: (r.program_name as string | null) ?? null,
      creator_name: (r.creator_name as string | null) ?? null,
      kakao_map_url: rKakao, phone: rPhone, lat: rLat, lng: rLng,
      score, strength: strengthOf(score), reasons,
    })
  }
  matches.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
  return { ok: true, matches: matches.slice(0, 12) }
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

/** addAppearanceToRestaurant 입력 (기존 식당에 출연만 추가). */
export type AddAppearanceInput = {
  restaurantId: string
  source_type: string
  source_title: string
  program_name?: string
  creator_name?: string
  episode_title?: string
  broadcast_date?: string
  video_url?: string
}

/**
 * 강한 중복 후보가 있을 때, 새 restaurant 를 만들지 않고 기존 식당에 출연(appearance)만 추가한다.
 * - restaurants insert 없음. restaurant_appearances insert 만.
 * - source_type(youtube/tv/sns) · source_title · (program_name|creator_name) 필수.
 * - (restaurant_id, source_title, program/creator, episode_title, broadcast_date) 동일 조합이면 중복 차단.
 */
export async function addAppearanceToRestaurant(
  input: AddAppearanceInput,
): Promise<{ ok: true; slug: string; name: string } | { ok: false; error: string }> {
  const c = await cookies()
  const token = c.get(ADMIN_COOKIE_NAME)?.value
  const authed = await verifyAdminSessionToken(token)
  if (!authed) return { ok: false, error: 'unauthorized' }

  if (!input.restaurantId || typeof input.restaurantId !== 'string') {
    return { ok: false, error: '대상 식당이 선택되지 않았어요.' }
  }
  if (!isValidRestaurantSourceType(input.source_type)) {
    return { ok: false, error: '소스 유형은 youtube/tv/sns 중에서 선택해주세요.' }
  }
  const sourceTitle = trimToNull(input.source_title)
  if (!sourceTitle) return { ok: false, error: '출처명을 입력해주세요.' }
  const programName = trimToNull(input.program_name)
  const creatorName = trimToNull(input.creator_name)
  if (!programName && !creatorName) {
    return { ok: false, error: '프로그램명 또는 크리에이터명이 있어야 출연을 추가할 수 있어요.' }
  }
  const episodeTitle = trimToNull(input.episode_title)
  const broadcastDate = trimToNull(input.broadcast_date)
  const videoUrl = trimToNull(input.video_url)
  if (videoUrl && !videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
    return { ok: false, error: '영상 URL은 http:// 또는 https:// 로 시작해야 해요.' }
  }

  const supabase = getSupabaseAdminClient()

  // 대상 restaurant 존재 확인(읽기만). slug/name 회수.
  let restaurantSlug = ''
  let restaurantName = ''
  {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, slug, name')
      .eq('id', input.restaurantId)
      .single()
    if (error || !data) return { ok: false, error: '대상 식당을 찾을 수 없어요.' }
    restaurantSlug = data.slug
    restaurantName = data.name
  }

  // 중복 출연 가드: 같은 (source_title + program/creator + episode + date) 조합이 이미 있으면 차단.
  {
    const { data, error } = await supabase
      .from('restaurant_appearances')
      .select('id, program_name, creator_name, episode_title, broadcast_date')
      .eq('restaurant_id', input.restaurantId)
      .eq('source_title', sourceTitle)
    if (error) {
      console.error('[admin/quick-register] appearance 중복 검사 실패:', error)
      return { ok: false, error: 'insert failed' }
    }
    const dup = (data ?? []).some(
      (a) =>
        (a.program_name ?? null) === programName &&
        (a.creator_name ?? null) === creatorName &&
        (a.episode_title ?? null) === episodeTitle &&
        (a.broadcast_date ?? null) === broadcastDate,
    )
    if (dup) return { ok: false, error: '이미 등록된 출연이에요.' }
  }

  // restaurant_appearances 에만 INSERT. restaurants row 는 건드리지 않는다.
  const { error: insErr } = await supabase.from('restaurant_appearances').insert(
    {
      restaurant_id: input.restaurantId,
      source_type: input.source_type,
      source_title: sourceTitle,
      program_name: programName,
      creator_name: creatorName,
      episode_title: episodeTitle,
      broadcast_date: broadcastDate,
      video_url: videoUrl,
      candidate_id: null,
      note: '빠른 등록 — 기존 식당에 출연 추가',
    },
    { defaultToNull: false },
  )
  if (insErr) {
    console.error('[admin/quick-register] appearance insert 실패:', insErr)
    return { ok: false, error: 'insert failed' }
  }

  // 대상 식당이 공개 상태일 수 있으므로 public 경로 무효화.
  revalidateRestaurantPublicPaths([restaurantSlug])
  revalidatePath('/admin/restaurants')
  return { ok: true, slug: restaurantSlug, name: restaurantName }
}
