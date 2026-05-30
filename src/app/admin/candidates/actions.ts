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

  // confidence_score: 숫자 파싱 → 0~1 clamp, 미입력/비정상이면 기본 0.500.
  let confidence = 0.5
  const raw = input.confidence_score
  if (raw !== undefined && raw !== null && `${raw}`.trim() !== '') {
    const n = typeof raw === 'number' ? raw : Number(raw)
    if (Number.isFinite(n)) {
      confidence = Math.min(1, Math.max(0, n))
    }
  }

  const supabase = getSupabaseAdminClient()
  // defaultToNull: false → status 컬럼이 DB default 'PENDING' 으로 채워지게 한다.
  const { error } = await supabase.from('candidate_queue').insert(
    {
      source_type: input.source_type,
      source_name: sourceName,
      episode_title: trimToNull(input.episode_title),
      restaurant_name: restaurantName,
      area_guess: trimToNull(input.area_guess),
      source_url: trimToNull(input.source_url),
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
