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
  type CandidateStatus,
  type CandidateSourceType,
} from '@/types/supabase'

function isValidStatus(s: unknown): s is CandidateStatus {
  return typeof s === 'string' && (CANDIDATE_STATUSES as readonly string[]).includes(s)
}

function isValidSourceType(s: unknown): s is CandidateSourceType {
  return typeof s === 'string' && (CANDIDATE_SOURCE_TYPES as readonly string[]).includes(s)
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
