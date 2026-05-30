'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from '@/lib/admin-auth'

/** 빈/공백 문자열은 null 로 정규화. */
function trimToNull(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t.length > 0 ? t : null
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
