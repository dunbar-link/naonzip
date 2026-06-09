'use server'

/**
 * 신뢰 출처(restaurant_trust_sources) Admin CRUD server actions. [TRUST-H5]
 *
 * - 모든 변경은 service_role 클라이언트로 수행하고, 쿠키 기반 admin 인증을 재검증한다.
 * - source_kind 는 화이트리스트(TRUST_SOURCE_KINDS)만 허용한다.
 * - source_url 은 비어 있으면 허용, 있으면 http/https 만 허용한다.
 * - 빈 문자열은 null 로 정규화한다. updated_at 은 DB 트리거가 갱신한다.
 * - 기존 restaurants/restaurant_appearances 는 절대 건드리지 않는다.
 */

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth'
import { TRUST_SOURCE_KINDS, type TrustSourceKind } from '@/types/supabase'

type Result = { ok: true } | { ok: false; error: string }

/** client → server 로 넘기는 입력(모두 문자열/boolean, 서버에서 trim·검증). */
export type TrustSourceInput = {
  source_kind: string
  source_name: string
  source_url?: string
  source_title?: string
  source_note?: string
  trust_label?: string
  verified_at?: string
  is_public?: boolean
}

function trimToNull(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t.length > 0 ? t : null
}

function isValidKind(s: unknown): s is TrustSourceKind {
  return typeof s === 'string' && (TRUST_SOURCE_KINDS as readonly string[]).includes(s)
}

/** 비어 있으면 OK, 있으면 http/https URL 만 허용. */
function isValidOptionalHttpUrl(v: string | null): boolean {
  if (!v) return true
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

async function isAuthed(): Promise<boolean> {
  const c = await cookies()
  return verifyAdminSessionToken(c.get(ADMIN_COOKIE_NAME)?.value)
}

/** trust source 변경은 해당 식당 상세페이지에만 영향(출처 칩). 공개 상세 경로만 무효화. */
function revalidateDetail(slug: string): void {
  const s = typeof slug === 'string' ? slug.trim() : ''
  if (!s) return
  revalidatePath(`/restaurants/${s}`)
  revalidatePath('/restaurants/[slug]', 'page')
}

type CleanPayload = {
  source_kind: TrustSourceKind
  source_name: string
  source_url: string | null
  source_title: string | null
  source_note: string | null
  trust_label: string | null
  verified_at: string | null
  is_public: boolean
}

function buildPayload(
  input: TrustSourceInput,
): { ok: true; payload: CleanPayload } | { ok: false; error: string } {
  if (!isValidKind(input.source_kind)) {
    return { ok: false, error: '출처 종류를 목록에서 선택하세요.' }
  }
  const sourceName = trimToNull(input.source_name)
  if (!sourceName) {
    return { ok: false, error: '출처명(source_name)을 입력하세요.' }
  }
  const sourceUrl = trimToNull(input.source_url)
  if (!isValidOptionalHttpUrl(sourceUrl)) {
    return { ok: false, error: '출처 URL은 http/https 형식이어야 해요. (비워두면 생략됩니다)' }
  }
  const verifiedAt = trimToNull(input.verified_at)
  if (verifiedAt && !/^\d{4}-\d{2}-\d{2}$/.test(verifiedAt)) {
    return { ok: false, error: '확인일(verified_at)은 YYYY-MM-DD 형식이어야 해요.' }
  }
  return {
    ok: true,
    payload: {
      source_kind: input.source_kind,
      source_name: sourceName,
      source_url: sourceUrl,
      source_title: trimToNull(input.source_title),
      source_note: trimToNull(input.source_note),
      trust_label: trimToNull(input.trust_label),
      verified_at: verifiedAt,
      is_public: input.is_public !== false, // 기본 공개(true)
    },
  }
}

/** 신뢰 출처 추가. */
export async function createTrustSource(
  restaurantId: string,
  slug: string,
  input: TrustSourceInput,
): Promise<Result> {
  if (!(await isAuthed())) return { ok: false, error: 'unauthorized' }
  if (!restaurantId || typeof restaurantId !== 'string') {
    return { ok: false, error: '대상 식당을 찾을 수 없어요.' }
  }
  const built = buildPayload(input)
  if (!built.ok) return built

  const supabase = getSupabaseAdminClient()
  const { error } = await supabase
    .from('restaurant_trust_sources')
    .insert({ restaurant_id: restaurantId, ...built.payload })
  if (error) {
    console.error('[admin/trust-sources] insert 실패:', error.message)
    return { ok: false, error: '추가에 실패했어요. 잠시 후 다시 시도해 주세요.' }
  }
  revalidateDetail(slug)
  return { ok: true }
}

/** 신뢰 출처 수정. restaurant_id/created_at 은 변경하지 않는다(updated_at 은 트리거가 갱신). */
export async function updateTrustSource(
  id: string,
  slug: string,
  input: TrustSourceInput,
): Promise<Result> {
  if (!(await isAuthed())) return { ok: false, error: 'unauthorized' }
  if (!id || typeof id !== 'string') return { ok: false, error: '대상을 찾을 수 없어요.' }
  const built = buildPayload(input)
  if (!built.ok) return built

  const supabase = getSupabaseAdminClient()
  const { error } = await supabase
    .from('restaurant_trust_sources')
    .update(built.payload)
    .eq('id', id)
  if (error) {
    console.error('[admin/trust-sources] update 실패:', error.message)
    return { ok: false, error: '수정에 실패했어요. 잠시 후 다시 시도해 주세요.' }
  }
  revalidateDetail(slug)
  return { ok: true }
}

/** 신뢰 출처 삭제. (비공개 전환만 원하면 update 로 is_public=false 처리) */
export async function deleteTrustSource(id: string, slug: string): Promise<Result> {
  if (!(await isAuthed())) return { ok: false, error: 'unauthorized' }
  if (!id || typeof id !== 'string') return { ok: false, error: '대상을 찾을 수 없어요.' }

  const supabase = getSupabaseAdminClient()
  const { error } = await supabase
    .from('restaurant_trust_sources')
    .delete()
    .eq('id', id)
  if (error) {
    console.error('[admin/trust-sources] delete 실패:', error.message)
    return { ok: false, error: '삭제에 실패했어요. 잠시 후 다시 시도해 주세요.' }
  }
  revalidateDetail(slug)
  return { ok: true }
}
