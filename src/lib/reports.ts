/**
 * 정보 수정 제보(report) 저장 레이어
 *
 * - Supabase 환경변수가 있으면 → restaurant_reports 테이블에 insert
 * - 없거나 실패하면 → console 경고 후 mock 성공 반환
 *
 * Route Handler 에서만 호출한다.
 */

import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase'

export const REPORT_REASONS = [
  '폐업',
  '위치 틀림',
  '가격 틀림',
  '식당 다름',
  '기타',
] as const

export type ReportReason = (typeof REPORT_REASONS)[number]

export type ReportInput = {
  slug: string
  reason: string
  message?: string | null
}

export type ReportResult =
  | { ok: true; mocked?: boolean }
  | { ok: false; error: string }

const MAX_SLUG = 200
const MAX_REASON = 50
const MAX_MESSAGE = 1000

export function validateReport(input: ReportInput): string | null {
  const slug = input.slug?.trim()
  const reason = input.reason?.trim()
  if (!slug || slug.length > MAX_SLUG) return 'slug invalid'
  if (!reason || reason.length > MAX_REASON) return 'reason invalid'
  if (!REPORT_REASONS.includes(reason as ReportReason)) return 'reason not allowed'
  const message = input.message?.trim()
  if (message && message.length > MAX_MESSAGE) return 'message too long'
  return null
}

export async function submitRestaurantReport(input: ReportInput): Promise<ReportResult> {
  const err = validateReport(input)
  if (err) return { ok: false, error: err }

  const message = input.message?.trim() ? input.message.trim() : null

  if (!isSupabaseConfigured()) {
    console.warn('[reports] Supabase 미설정 — mock 성공 처리:', {
      slug: input.slug,
      reason: input.reason,
      message,
    })
    return { ok: true, mocked: true }
  }

  try {
    const supabase = getSupabaseClient()
    // defaultToNull: false → Prefer: missing=default 헤더로 status 컬럼이 DB default 'pending' 으로 채워지게 한다.
    // 그렇지 않으면 RLS WITH CHECK `status = 'pending'` 가 위반된다.
    const { error } = await supabase.from('restaurant_reports').insert(
      {
        restaurant_slug: input.slug.trim(),
        reason: input.reason.trim(),
        message,
      },
      { defaultToNull: false },
    )
    if (error) {
      console.error('[reports] insert 실패:', error)
      return { ok: false, error: 'insert failed' }
    }
    return { ok: true }
  } catch (e) {
    console.error('[reports] 예외:', e)
    return { ok: false, error: 'unexpected' }
  }
}
