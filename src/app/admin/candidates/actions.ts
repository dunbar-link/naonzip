'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from '@/lib/admin-auth'
import {
  CANDIDATE_STATUSES,
  CANDIDATE_SOURCE_TYPES,
  RESTAURANT_SOURCE_TYPES,
  type CandidateStatus,
  type CandidateSourceType,
  type RestaurantSourceType,
} from '@/types/supabase'
import { AREA_TYPES, type AreaType } from '@/types/restaurant'
import { isInBusanRange } from '@/lib/coords'
import { isValidSlug, SLUG_INVALID_MESSAGE } from '@/lib/slug'
import { revalidateRestaurantPublicPaths } from '@/lib/revalidate-restaurants'

function isValidStatus(s: unknown): s is CandidateStatus {
  return typeof s === 'string' && (CANDIDATE_STATUSES as readonly string[]).includes(s)
}

function isValidSourceType(s: unknown): s is CandidateSourceType {
  return typeof s === 'string' && (CANDIDATE_SOURCE_TYPES as readonly string[]).includes(s)
}

function isValidRestaurantSourceType(s: unknown): s is RestaurantSourceType {
  return typeof s === 'string' && (RESTAURANT_SOURCE_TYPES as readonly string[]).includes(s)
}

function isValidArea(s: unknown): s is AreaType {
  return typeof s === 'string' && (AREA_TYPES as readonly string[]).includes(s)
}

/** 빈/공백 문자열은 null 로 정규화. */
function trimToNull(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t.length > 0 ? t : null
}

/**
 * 후보 상태 변경.
 * 1) 쿠키 기반 인증 재검증 (proxy 우회 방어)
 * 2) status 화이트리스트
 * 3) service_role 클라이언트로 UPDATE
 * 4) /admin/candidates 캐시 무효화
 *
 * 승인(VERIFIED)은 단순 상태 마킹일 뿐 restaurant 자동 등록은 하지 않는다.
 * reviewed_at 은 DB trigger 가 자동 기록하므로 application 레벨에서 set 하지 않는다.
 */
export async function updateCandidateStatus(
  id: string,
  nextStatus: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const c = await cookies()
  const token = c.get(ADMIN_COOKIE_NAME)?.value
  const authed = await verifyAdminSessionToken(token)
  if (!authed) {
    return { ok: false, error: 'unauthorized' }
  }

  if (!id || typeof id !== 'string') {
    return { ok: false, error: 'invalid id' }
  }
  if (!isValidStatus(nextStatus)) {
    return { ok: false, error: 'invalid status' }
  }

  const supabase = getSupabaseAdminClient()
  const { error } = await supabase
    .from('candidate_queue')
    .update({ status: nextStatus })
    .eq('id', id)

  if (error) {
    console.error('[admin/candidates] update 실패:', error)
    return { ok: false, error: 'update failed' }
  }

  revalidatePath('/admin/candidates')
  return { ok: true }
}

/** addCandidate 입력 (client component 에서 plain object 로 전달). */
export type AddCandidateInput = {
  source_type: string
  source_name: string
  episode_title?: string
  restaurant_name: string
  area_guess?: string
  source_url?: string
  confidence_score?: string | number
  operator_note?: string
}

/**
 * 후보 수동 추가.
 * 1) 쿠키 기반 인증 재검증 (proxy 우회 방어)
 * 2) source_type 화이트리스트 / 필수값 검증
 * 3) service_role 클라이언트로 INSERT
 *    - status 는 넘기지 않아 DB default 'PENDING' 사용 (defaultToNull: false)
 *    - reviewed_at 은 손대지 않는다.
 * 4) /admin/candidates 캐시 무효화
 *
 * 수동 추가는 단순 큐 적재일 뿐 restaurant 자동 등록은 하지 않는다.
 */
export async function addCandidate(
  input: AddCandidateInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const c = await cookies()
  const token = c.get(ADMIN_COOKIE_NAME)?.value
  const authed = await verifyAdminSessionToken(token)
  if (!authed) {
    return { ok: false, error: 'unauthorized' }
  }

  if (!isValidSourceType(input.source_type)) {
    return { ok: false, error: 'invalid source_type' }
  }

  const sourceName = trimToNull(input.source_name)
  if (!sourceName) {
    return { ok: false, error: 'source_name required' }
  }

  const restaurantName = trimToNull(input.restaurant_name)
  if (!restaurantName) {
    return { ok: false, error: 'restaurant_name required' }
  }

  // source_url: 빈 값은 null. 형식검증·중복검사·INSERT 에서 모두 이 변수를 재사용한다.
  const sourceUrl = trimToNull(input.source_url)

  // 품질 검증은 B/C 중복검사에서도 같은 client 를 쓰므로 여기서 한 번만 획득.
  const supabase = getSupabaseAdminClient()

  // A) source_url 형식 검증 — 값이 있으면 http(s) 스킴만 허용.
  if (sourceUrl && !sourceUrl.startsWith('http://') && !sourceUrl.startsWith('https://')) {
    return { ok: false, error: '소스 URL은 http:// 또는 https:// 로 시작해야 해요.' }
  }

  // B) restaurant_name + source_name 조합 중복 검사 (status 필터 없음 = REJECTED 포함 전체).
  {
    const { data, error } = await supabase
      .from('candidate_queue')
      .select('id')
      .eq('restaurant_name', restaurantName)
      .eq('source_name', sourceName)
      .limit(1)
    if (error) {
      // 조회 실패 시 보수적으로 차단.
      console.error('[admin/candidates] 중복 검사(식당/소스) 실패:', error)
      return { ok: false, error: 'insert failed' }
    }
    if (data?.length) {
      return { ok: false, error: '이미 같은 식당/소스 후보가 있어요.' }
    }
  }

  // C) source_url 중복 검사 (값이 있을 때만).
  if (sourceUrl) {
    const { data, error } = await supabase
      .from('candidate_queue')
      .select('id')
      .eq('source_url', sourceUrl)
      .limit(1)
    if (error) {
      // 조회 실패 시 보수적으로 차단.
      console.error('[admin/candidates] 중복 검사(URL) 실패:', error)
      return { ok: false, error: 'insert failed' }
    }
    if (data?.length) {
      return { ok: false, error: '이미 같은 URL 후보가 있어요.' }
    }
  }

  // confidence_score: 숫자 파싱 → 0~1 clamp, 미입력/비정상이면 기본 0.500.
  let confidence = 0.5
  const raw = input.confidence_score
  if (raw !== undefined && raw !== null && `${raw}`.trim() !== '') {
    const n = typeof raw === 'number' ? raw : Number(raw)
    if (Number.isFinite(n)) {
      confidence = Math.min(1, Math.max(0, n))
    }
  }

  // defaultToNull: false → status 컬럼이 DB default 'PENDING' 으로 채워지게 한다.
  const { error } = await supabase.from('candidate_queue').insert(
    {
      source_type: input.source_type,
      source_name: sourceName,
      episode_title: trimToNull(input.episode_title),
      restaurant_name: restaurantName,
      area_guess: trimToNull(input.area_guess),
      source_url: sourceUrl,
      confidence_score: confidence,
      operator_note: trimToNull(input.operator_note),
    },
    { defaultToNull: false },
  )

  if (error) {
    console.error('[admin/candidates] insert 실패:', error)
    return { ok: false, error: 'insert failed' }
  }

  revalidatePath('/admin/candidates')
  return { ok: true }
}

/**
 * convertCandidateToRestaurant 입력 (client component 에서 plain object 로 전달).
 * 모든 값은 문자열로 받아 서버에서 trim/숫자 변환/검증한다.
 */
export type ConvertCandidateInput = {
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
}

/**
 * VERIFIED 후보를 restaurants 로 등록(보조 흐름).
 * 1) 쿠키 기반 인증 재검증 (proxy 우회 방어)
 * 2) source_type 화이트리스트(youtube/tv/sns) · area enum · 필수 문자열 · lat/lng 숫자 검증
 * 3) slug 중복 SELECT 검사
 * 4) service_role 클라이언트로 INSERT (is_published: false 고정, defaultToNull: false)
 *    - 23505(unique_violation) 도 잡아 slug 중복 메시지로 변환
 * 5) /admin/candidates 캐시 무효화
 *
 * 자동 등록이 아니라 운영자가 폼에서 명시적으로 저장하는 흐름이다.
 * candidate row 는 건드리지 않는다(삭제/상태변경 없음).
 */
export async function convertCandidateToRestaurant(
  candidateId: string,
  payload: ConvertCandidateInput,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const c = await cookies()
  const token = c.get(ADMIN_COOKIE_NAME)?.value
  const authed = await verifyAdminSessionToken(token)
  if (!authed) {
    return { ok: false, error: 'unauthorized' }
  }

  if (!candidateId || typeof candidateId !== 'string') {
    return { ok: false, error: 'invalid candidate id' }
  }

  // source_type: youtube/tv/sns 화이트리스트 (candidate 의 'other' 는 불가).
  if (!isValidRestaurantSourceType(payload.source_type)) {
    return { ok: false, error: '소스 유형은 youtube/tv/sns 중에서 선택해주세요.' }
  }

  // area: 부산 11종 enum 검증.
  if (!isValidArea(payload.area)) {
    return { ok: false, error: '지역을 목록에서 선택해주세요.' }
  }

  // 필수 문자열 검증 (trim 후 빈값 차단).
  const slug = trimToNull(payload.slug)
  const name = trimToNull(payload.name)
  const address = trimToNull(payload.address)
  const category = trimToNull(payload.category)
  const mainMenu = trimToNull(payload.main_menu)
  const priceText = trimToNull(payload.price_text)
  const sourceTitle = trimToNull(payload.source_title)

  if (!slug) return { ok: false, error: 'slug 를 입력해주세요.' }
  // 신규 생성이므로 항상 전체 slug 형식 검증.
  if (!isValidSlug(slug)) return { ok: false, error: SLUG_INVALID_MESSAGE }
  if (!name) return { ok: false, error: '식당명을 입력해주세요.' }
  if (!address) return { ok: false, error: '주소를 입력해주세요.' }
  if (!category) return { ok: false, error: '카테고리를 입력해주세요.' }
  if (!mainMenu) return { ok: false, error: '대표 메뉴를 입력해주세요.' }
  if (!priceText) return { ok: false, error: '가격대를 입력해주세요.' }
  if (!sourceTitle) return { ok: false, error: '출처명을 입력해주세요.' }

  // lat / lng: Number 변환 + 유한수 검증.
  const lat = Number(payload.lat)
  const lng = Number(payload.lng)
  if (!Number.isFinite(lat)) {
    return { ok: false, error: '위도(lat)는 숫자여야 해요.' }
  }
  if (!Number.isFinite(lng)) {
    return { ok: false, error: '경도(lng)는 숫자여야 해요.' }
  }
  if (lat === 0 || lng === 0) {
    return { ok: false, error: '좌표값을 다시 확인해 주세요.' }
  }
  if (!isInBusanRange(lat, lng)) {
    return { ok: false, error: '좌표가 부산 범위를 벗어난 것 같아요.' }
  }

  const supabase = getSupabaseAdminClient()

  // 변환 완료 가드 — 이미 restaurants 로 등록된 후보면 재변환을 차단한다.
  //   - converted_restaurant_slug 가 채워져 있으면 (status 와 무관하게) 차단.
  {
    const { data, error } = await supabase
      .from('candidate_queue')
      .select('id, converted_restaurant_slug')
      .eq('id', candidateId)
      .single()
    if (error || !data) {
      console.error('[admin/candidates] candidate 조회 실패:', error)
      return { ok: false, error: 'candidate not found' }
    }
    if (data.converted_restaurant_slug) {
      return { ok: false, error: '이미 식당 등록이 완료된 후보예요.' }
    }
  }

  // slug 중복 검사 (INSERT 전 선검사). UNIQUE 제약과 23505 도 아래에서 한 번 더 잡는다.
  {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .limit(1)
    if (error) {
      console.error('[admin/candidates] slug 중복 검사 실패:', error)
      return { ok: false, error: 'insert failed' }
    }
    if (data?.length) {
      return { ok: false, error: '이미 존재하는 slug예요. 다른 slug로 바꿔주세요.' }
    }
  }

  // defaultToNull: false → 넘기지 않은 컬럼이 DB default 로 채워지게 한다.
  const { error } = await supabase.from('restaurants').insert(
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
      creator_name: trimToNull(payload.creator_name),
      program_name: trimToNull(payload.program_name),
      episode_title: trimToNull(payload.episode_title),
      broadcast_date: trimToNull(payload.broadcast_date),
      description: trimToNull(payload.description),
      video_url: trimToNull(payload.video_url),
      kakao_map_url: trimToNull(payload.kakao_map_url),
      naver_map_url: trimToNull(payload.naver_map_url),
      tmap_url: trimToNull(payload.tmap_url),
      source_type: payload.source_type,
      source_title: sourceTitle,
      is_published: false,
    },
    { defaultToNull: false },
  )

  if (error) {
    // 선검사와 INSERT 사이의 경합(race) 또는 UNIQUE 위반은 slug 중복 메시지로 변환.
    if (error.code === '23505') {
      return { ok: false, error: '이미 존재하는 slug예요. 다른 slug로 바꿔주세요.' }
    }
    console.error('[admin/candidates] restaurant insert 실패:', error)
    return { ok: false, error: 'insert failed' }
  }

  // restaurant 등록 성공 후 candidate 에 변환 완료 마킹 (재변환 차단용).
  //   - status 는 건드리지 않는다.
  //   - 이 UPDATE 가 실패해도 restaurant 는 이미 등록되었으므로 로깅만 하고 성공 반환.
  {
    const { error: convertError } = await supabase
      .from('candidate_queue')
      .update({
        converted_restaurant_slug: slug,
        converted_at: new Date().toISOString(),
      })
      .eq('id', candidateId)
    if (convertError) {
      console.error('[admin/candidates] candidate 변환 마킹 실패:', convertError)
    }
  }

  revalidatePath('/admin/candidates')
  return { ok: true, slug }
}

/**
 * addCandidateAppearanceToRestaurant 입력 (client component 에서 plain object 로 전달).
 */
export type AddAppearanceInput = {
  restaurantId: string
  source_type: string
  source_title: string
  program_name?: string
  creator_name?: string
  episode_title?: string
  broadcast_date?: string
  video_url?: string
  note?: string
}

/**
 * 기존 restaurant 에 candidate 의 방송 출연(appearance)을 추가한다(중복 식당 row 생성 방지).
 * 1) 쿠키 기반 인증 재검증
 * 2) candidate 존재 + 이미 변환완료(converted_restaurant_slug)면 차단
 * 3) 대상 restaurant 존재 확인(읽기만 — restaurants row 는 생성/수정하지 않는다)
 * 4) source_type youtube/tv/sns · source_title 필수 · video_url 형식 검증
 * 5) (restaurant_id, source_type, source_title, video_url) 동일 출연 중복 차단
 * 6) restaurant_appearances INSERT (candidate_id 기록)
 * 7) candidate 를 converted 로 마킹(converted_restaurant_slug/converted_at 두 필드만)
 * 8) public 경로 revalidate
 *
 * 자동 등록이 아니라 운영자가 기존 식당을 직접 선택해 출연을 추가하는 흐름이다.
 * restaurants 의 source_title/program_name 등 기존 컬럼은 절대 덮어쓰지 않는다.
 */
export async function addCandidateAppearanceToRestaurant(
  candidateId: string,
  input: AddAppearanceInput,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const c = await cookies()
  const token = c.get(ADMIN_COOKIE_NAME)?.value
  const authed = await verifyAdminSessionToken(token)
  if (!authed) {
    return { ok: false, error: 'unauthorized' }
  }

  if (!candidateId || typeof candidateId !== 'string') {
    return { ok: false, error: 'invalid candidate id' }
  }
  if (!input.restaurantId || typeof input.restaurantId !== 'string') {
    return { ok: false, error: 'invalid restaurant id' }
  }

  // source_type: youtube/tv/sns 화이트리스트 (candidate 의 'other' 는 불가).
  if (!isValidRestaurantSourceType(input.source_type)) {
    return { ok: false, error: '소스 유형은 youtube/tv/sns 중에서 선택해주세요.' }
  }

  const sourceTitle = trimToNull(input.source_title)
  if (!sourceTitle) {
    return { ok: false, error: '출처명을 입력해주세요.' }
  }

  // video_url: 빈 값은 null, 있으면 http(s) 스킴만 허용.
  const videoUrl = trimToNull(input.video_url)
  if (videoUrl && !videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
    return { ok: false, error: '영상 URL은 http:// 또는 https:// 로 시작해야 해요.' }
  }
  const programName = trimToNull(input.program_name)
  const creatorName = trimToNull(input.creator_name)
  const episodeTitle = trimToNull(input.episode_title)
  const broadcastDate = trimToNull(input.broadcast_date)
  const note = trimToNull(input.note)

  const supabase = getSupabaseAdminClient()

  // candidate 존재 + 변환완료 가드.
  {
    const { data, error } = await supabase
      .from('candidate_queue')
      .select('id, converted_restaurant_slug')
      .eq('id', candidateId)
      .single()
    if (error || !data) {
      return { ok: false, error: 'candidate not found' }
    }
    if (data.converted_restaurant_slug) {
      return { ok: false, error: '이미 식당 등록 또는 출연 추가가 완료된 후보예요.' }
    }
  }

  // 대상 restaurant 존재 확인(읽기만). slug 회수.
  let restaurantSlug: string
  {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, slug')
      .eq('id', input.restaurantId)
      .single()
    if (error || !data) {
      return { ok: false, error: '대상 식당을 찾을 수 없어요.' }
    }
    restaurantSlug = data.slug
  }

  // 동일 출연 중복 차단: (restaurant_id, source_type, source_title, video_url).
  //   - schema.sql backfill 가드와 동일 기준(coalesce(video_url,'')).
  {
    let query = supabase
      .from('restaurant_appearances')
      .select('id')
      .eq('restaurant_id', input.restaurantId)
      .eq('source_type', input.source_type)
      .eq('source_title', sourceTitle)
    query = videoUrl ? query.eq('video_url', videoUrl) : query.is('video_url', null)
    const { data, error } = await query.limit(1)
    if (error) {
      console.error('[admin/candidates] appearance 중복 검사 실패:', error)
      return { ok: false, error: 'insert failed' }
    }
    if (data?.length) {
      return { ok: false, error: '이미 이 식당에 등록된 방송 출연이에요.' }
    }
  }

  // restaurant_appearances INSERT. restaurants row 는 건드리지 않는다.
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
      candidate_id: candidateId,
      note,
    },
    { defaultToNull: false },
  )
  if (insErr) {
    console.error('[admin/candidates] appearance insert 실패:', insErr)
    return { ok: false, error: 'insert failed' }
  }

  // candidate 변환 완료 마킹 (재변환 차단용). status/reviewed_at 는 건드리지 않는다.
  //   - 마킹 실패해도 appearance 는 이미 추가됐으므로 로깅만 하고 성공 반환.
  {
    const { error: markErr } = await supabase
      .from('candidate_queue')
      .update({
        converted_restaurant_slug: restaurantSlug,
        converted_at: new Date().toISOString(),
      })
      .eq('id', candidateId)
    if (markErr) {
      console.error('[admin/candidates] candidate 변환 마킹 실패:', markErr)
    }
  }

  // 출연이 추가된 식당이 검색/목록/지도/홈/상세/landing 에 반영되도록 public 경로 무효화.
  revalidateRestaurantPublicPaths([restaurantSlug])
  revalidatePath('/admin/candidates')
  return { ok: true, slug: restaurantSlug }
}
