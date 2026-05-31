'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from '@/lib/admin-auth'
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

/** restaurants.source_type 화이트리스트(youtube/tv/sns) 검증. */
function isValidRestaurantSourceType(s: unknown): s is RestaurantSourceType {
  return typeof s === 'string' && (RESTAURANT_SOURCE_TYPES as readonly string[]).includes(s)
}

/** 부산 지역 enum(11종) 검증. */
function isValidArea(s: unknown): s is AreaType {
  return typeof s === 'string' && (AREA_TYPES as readonly string[]).includes(s)
}

/**
 * restaurant 공개/비공개 토글.
 * 1) 쿠키 기반 인증 재검증 (proxy 우회 방어)
 * 2) published=true(공개 전환)일 때만 필수값 검증.
 *    - 클라이언트 값은 신뢰하지 않고 service_role 로 해당 row 를 SELECT 해
 *      실제 저장값으로 검증한다.
 *    - name/slug/address/category/main_menu/price_text: trim 후 빈값 차단
 *    - lat/lng: Number.isFinite
 *    - 하나라도 실패하면 '필수 정보가 부족해 공개할 수 없어요.'
 *    - unpublish(true→false)는 검증 없이 허용.
 * 3) service_role 클라이언트로 is_published 한 컬럼만 UPDATE
 * 4) 공개 목록/상세/admin 목록 캐시 무효화
 *
 * 자동 publish 는 없으며 운영자가 명시적으로 버튼을 눌러야만 호출된다.
 * is_published 외 다른 컬럼은 절대 건드리지 않는다.
 */
export async function setRestaurantPublished(
  idOrSlug: string,
  published: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const c = await cookies()
  const token = c.get(ADMIN_COOKIE_NAME)?.value
  const authed = await verifyAdminSessionToken(token)
  if (!authed) {
    return { ok: false, error: 'unauthorized' }
  }

  if (!idOrSlug || typeof idOrSlug !== 'string') {
    return { ok: false, error: 'invalid slug' }
  }

  const supabase = getSupabaseAdminClient()

  // 공개 전환 시에만, 실제 저장된 row 값으로 필수 정보 검증.
  if (published) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('name, slug, address, category, main_menu, price_text, lat, lng')
      .eq('slug', idOrSlug)
      .single()

    if (error || !data) {
      console.error('[admin/restaurants] 공개 전 row 조회 실패:', error)
      return { ok: false, error: '필수 정보가 부족해 공개할 수 없어요.' }
    }

    const requiredOk =
      trimToNull(data.name) &&
      trimToNull(data.slug) &&
      trimToNull(data.address) &&
      trimToNull(data.category) &&
      trimToNull(data.main_menu) &&
      trimToNull(data.price_text)

    if (!requiredOk || !Number.isFinite(data.lat) || !Number.isFinite(data.lng)) {
      return { ok: false, error: '필수 정보가 부족해 공개할 수 없어요.' }
    }
    // 공개 게이트 강화: 저장값 0 차단 + 부산 범위 검증.
    if (data.lat === 0 || data.lng === 0) {
      return { ok: false, error: '좌표값을 다시 확인해 주세요.' }
    }
    if (!isInBusanRange(data.lat, data.lng)) {
      return { ok: false, error: '좌표가 부산 범위를 벗어난 것 같아요.' }
    }
  }

  const { error } = await supabase
    .from('restaurants')
    .update({ is_published: published })
    .eq('slug', idOrSlug)

  if (error) {
    console.error('[admin/restaurants] is_published update 실패:', error)
    return { ok: false, error: 'update failed' }
  }

  // 공개 목록 / 상세(dynamic route) / admin 목록 캐시 무효화.
  //   - '/restaurants/[slug]' 는 dynamic segment 이므로 type 'page' 필수
  //     (revalidatePath docs: dynamic segment 포함 시 'page'/'layout' 인자 필요).
  revalidatePath('/restaurants')
  revalidatePath('/restaurants/[slug]', 'page')
  revalidatePath('/admin/restaurants')
  return { ok: true }
}

/**
 * 비공개(is_published=false) restaurant 삭제.
 * 1) 쿠키 기반 인증 재검증 (proxy 우회 방어)
 * 2) slug 로 row 를 재조회해 실제 저장된 is_published 로 가드:
 *    - row 없음 → '식당을 찾을 수 없어요.'
 *    - is_published === true → '공개된 식당은 삭제할 수 없어요.' (서버 가드)
 * 3) DELETE WHERE slug=? AND is_published=false (선조회~삭제 사이 race 방어)
 * 4) /admin/restaurants 만 무효화 (공개 경로는 건드리지 않음)
 *
 * 삭제 성공 후, 이 slug 로 변환되어 있던 candidate_queue 의 converted 상태
 * (converted_restaurant_slug / converted_at) 를 null 로 되돌린다.
 *   - reset 은 delete 성공 후에만 수행한다.
 *   - status / reviewed_at 는 절대 건드리지 않는다(converted 두 필드만).
 *   - reset 실패 시에도 restaurant 는 이미 삭제됐으므로 ok:true + warning 으로 알린다.
 * reports / saved 등 다른 테이블은 절대 건드리지 않는다.
 * published 삭제는 서버 재조회 가드 + DELETE WHERE + UI 숨김으로 3중 방어한다.
 */
export async function deleteRestaurantDraft(
  slug: string,
): Promise<
  | { ok: true }
  | { ok: true; warning: string }
  | { ok: false; error: string }
> {
  const c = await cookies()
  const token = c.get(ADMIN_COOKIE_NAME)?.value
  const authed = await verifyAdminSessionToken(token)
  if (!authed) {
    return { ok: false, error: 'unauthorized' }
  }

  if (!slug || typeof slug !== 'string') {
    return { ok: false, error: 'invalid slug' }
  }

  const supabase = getSupabaseAdminClient()

  // 실제 저장된 row 의 is_published 로 가드 (클라이언트 값 불신).
  const { data, error } = await supabase
    .from('restaurants')
    .select('id, is_published')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return { ok: false, error: '식당을 찾을 수 없어요.' }
  }
  if (data.is_published === true) {
    return { ok: false, error: '공개된 식당은 삭제할 수 없어요.' }
  }

  // race 방어: 선조회 이후 공개되었을 수도 있으므로 WHERE 에 is_published=false 재명시.
  const { error: delErr } = await supabase
    .from('restaurants')
    .delete()
    .eq('slug', slug)
    .eq('is_published', false)

  if (delErr) {
    console.error('[admin/restaurants] restaurant 삭제 실패:', delErr)
    return { ok: false, error: 'delete failed' }
  }

  // 삭제 성공 후에만 candidate 변환 상태 reset.
  //   - converted 두 필드(converted_restaurant_slug/converted_at)만 null 로.
  //   - status/reviewed_at 는 payload 에 절대 넣지 않는다.
  //   - 매칭 0개여도 에러가 아니다(.eq 만 사용).
  const { error: resetErr } = await supabase
    .from('candidate_queue')
    .update({ converted_restaurant_slug: null, converted_at: null })
    .eq('converted_restaurant_slug', slug)

  if (resetErr) {
    // restaurant 는 이미 삭제됨. reset 실패는 warning 으로만 알린다(민감정보 없이).
    console.error('[admin/restaurants] candidate 변환 상태 reset 실패:', resetErr.message)
  }

  // 공개 경로는 무효화하지 않는다(비공개 식당이므로 공개 캐시에 존재하지 않음).
  revalidatePath('/admin/restaurants')
  revalidatePath('/admin/candidates')

  if (resetErr) {
    return {
      ok: true,
      warning:
        '식당은 삭제했지만 후보 변환 상태 초기화에 실패했어요. 후보 목록을 확인해 주세요.',
    }
  }
  return { ok: true }
}

/**
 * updateRestaurant 입력 (client component 에서 plain object 로 전달).
 * 모든 값은 문자열로 받아 서버에서 trim/숫자 변환/검증한다.
 * is_published 는 의도적으로 받지 않는다(수정과 공개를 분리).
 */
export type UpdateRestaurantInput = {
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
 * 비공개/공개 restaurant 보완 편집(보조 흐름).
 * 1) 쿠키 기반 인증 재검증 (proxy 우회 방어)
 * 2) source_type 화이트리스트(youtube/tv/sns) · area enum · 필수 문자열 · lat/lng 숫자 검증
 * 3) 자기제외 slug 중복 SELECT 검사(.neq('id', id)) — slug 변경/유지 모두 안전
 * 4) service_role 클라이언트로 UPDATE 후 .select('is_published') 회수
 *    - is_published 키는 payload 에 절대 포함하지 않는다(수정/공개 분리).
 *    - 23505(unique_violation) 도 잡아 slug 중복 메시지로 변환.
 * 5) 항상 /admin/restaurants 무효화. 공개 식당이면 /restaurants 와 상세도 무효화.
 *
 * 자동 publish 는 없으며, 공개 상태는 미리보기 토글에서만 변경한다.
 * id 기준 update 라 slug 변경에도 안전하다.
 */
export async function updateRestaurant(
  id: string,
  payload: UpdateRestaurantInput,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const c = await cookies()
  const token = c.get(ADMIN_COOKIE_NAME)?.value
  const authed = await verifyAdminSessionToken(token)
  if (!authed) {
    return { ok: false, error: 'unauthorized' }
  }

  if (!id || typeof id !== 'string') {
    return { ok: false, error: 'invalid id' }
  }

  // source_type: youtube/tv/sns 화이트리스트.
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

  // slug 형식 검증은 "변경 시에만". 현재 저장된 slug 를 서버에서 조회해 비교한다.
  //   - 클라이언트 전달값은 신뢰하지 않는다(서버 SELECT 가 원본 기준).
  //   - 제출 slug 가 원본과 같으면(한글 slug 유지 등) 형식 검증을 건너뛴다.
  //   - 다를 때만 URL-safe 형식 검증.
  {
    const { data, error } = await supabase
      .from('restaurants')
      .select('slug')
      .eq('id', id)
      .single()
    if (error || !data) {
      console.error('[admin/restaurants] 원본 slug 조회 실패:', error)
      return { ok: false, error: '식당을 찾을 수 없어요.' }
    }
    if (slug !== data.slug && !isValidSlug(slug)) {
      return { ok: false, error: SLUG_INVALID_MESSAGE }
    }
  }

  // slug 자기제외 중복 검사 (.neq('id', id)) — slug 를 유지해도 안전하다.
  // UNIQUE 제약과 23505 도 아래 UPDATE 에서 한 번 더 잡는다.
  {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .limit(1)
    if (error) {
      console.error('[admin/restaurants] slug 중복 검사 실패:', error)
      return { ok: false, error: 'update failed' }
    }
    if (data?.length) {
      return { ok: false, error: '이미 존재하는 slug예요. 다른 slug로 바꿔주세요.' }
    }
  }

  // is_published 키는 절대 포함하지 않는다(수정/공개 분리).
  // 갱신된 is_published 는 revalidate 분기를 위해 .select() 로 회수.
  const { data: updated, error } = await supabase
    .from('restaurants')
    .update({
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
    })
    .eq('id', id)
    .select('is_published')
    .single()

  if (error) {
    // 선검사와 UPDATE 사이의 경합(race) 또는 UNIQUE 위반은 slug 중복 메시지로 변환.
    if (error.code === '23505') {
      return { ok: false, error: '이미 존재하는 slug예요. 다른 slug로 바꿔주세요.' }
    }
    console.error('[admin/restaurants] restaurant update 실패:', error)
    return { ok: false, error: 'update failed' }
  }

  // 항상 admin 목록 무효화. 공개 식당이면 공개 목록/상세(dynamic route)도 무효화.
  //   - '/restaurants/[slug]' 는 dynamic segment 이므로 type 'page' 필수.
  revalidatePath('/admin/restaurants')
  if (updated?.is_published) {
    revalidatePath('/restaurants')
    revalidatePath('/restaurants/[slug]', 'page')
  }

  return { ok: true, slug }
}
