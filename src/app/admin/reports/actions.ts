'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from '@/lib/admin-auth'
import { REPORT_STATUSES, type ReportStatus } from '@/types/supabase'

function isValidStatus(s: unknown): s is ReportStatus {
  return typeof s === 'string' && (REPORT_STATUSES as readonly string[]).includes(s)
}

/**
 * 신고 상태 변경.
 * 1) 쿠키 기반 인증 재검증 (proxy 우회 방어)
 * 2) status 화이트리스트
 * 3) service_role 클라이언트로 UPDATE
 * 4) /admin/reports 캐시 무효화
 *
 * updated_at 은 DB trigger 가 자동 갱신하므로 application 레벨에서 set 하지 않는다.
 */
export async function updateReportStatus(
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
    .from('restaurant_reports')
    .update({ status: nextStatus })
    .eq('id', id)

  if (error) {
    console.error('[admin/reports] update 실패:', error)
    return { ok: false, error: 'update failed' }
  }

  revalidatePath('/admin/reports')
  return { ok: true }
}
