/**
 * 신고(report) spam rate-limit (서버 전용).
 *
 * 정책: 동일 reporter_ip_hash + 동일 restaurant_slug 기준 10분에 1회.
 *
 * - request headers 에서 IP 후보를 추출한다 (x-forwarded-for → x-real-ip → 'unknown').
 * - IP 와 slug 를 SHA-256 으로 해시한다. 원문 IP 는 저장/로깅하지 않는다.
 * - service_role 클라이언트로 최근 10분 내 동일 (hash, slug) row 수를 센다.
 *   (anon 은 SELECT 정책이 없으므로 반드시 service_role 로 수행)
 * - 1건 이상이면 limited=true.
 *
 * 안전장치:
 * - 이 모듈은 server-only. 클라이언트 번들에 포함되면 즉시 throw.
 * - service_role(admin) 미설정 시 rate-limit 을 건너뛴다(fail-open).
 * - count 조회 실패 시에도 정상 사용자 보호를 위해 fail-open.
 */

// 클라이언트 번들 로드 시 즉시 throw → service_role 모듈 노출 사고 방지.
if (typeof window !== 'undefined') {
  throw new Error(
    '[report-rate-limit] 이 모듈은 server-only 입니다. Client Component 에서 import 하지 마세요.',
  )
}

import { createHash } from 'node:crypto'
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase-admin'

const WINDOW_MS = 10 * 60 * 1000 // 10분
const HASH_SALT = 'naonzip-report-ip-v1'

export type RateLimitResult = {
  limited: boolean
  /** 정상 통과 시 insert 에 저장할 해시. rate-limit 을 건너뛴 경우 null. */
  ipHash: string | null
}

/**
 * 프록시 헤더에서 클라이언트 IP 후보 추출.
 * 우선순위: x-forwarded-for 첫 번째 IP → x-real-ip → 'unknown'.
 * 원문 IP 는 반환만 하고 호출 측에서 절대 로깅하지 않는다.
 */
export function extractClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  const real = headers.get('x-real-ip')?.trim()
  if (real) return real
  return 'unknown'
}

/**
 * IP + slug → SHA-256 hex. 원문 IP 미저장 보장.
 */
export function hashReporter(ip: string, slug: string): string {
  return createHash('sha256').update(`${HASH_SALT}:${ip}:${slug}`).digest('hex')
}

/**
 * 동일 IP해시 + slug 의 최근 10분 신고 존재 여부 확인.
 * @returns limited=true 면 제한 대상. ipHash 는 정상 통과 시 insert 용.
 */
export async function checkReportRateLimit(
  headers: Headers,
  slug: string,
): Promise<RateLimitResult> {
  // service_role 미설정이면 rate-limit 불가 → 통과시키되 해시도 남기지 않는다.
  if (!isSupabaseAdminConfigured()) {
    return { limited: false, ipHash: null }
  }

  const ip = extractClientIp(headers)
  const ipHash = hashReporter(ip, slug)
  const cutoff = new Date(Date.now() - WINDOW_MS).toISOString()

  const supabase = getSupabaseAdminClient()
  const { count, error } = await supabase
    .from('restaurant_reports')
    .select('id', { count: 'exact', head: true })
    .eq('reporter_ip_hash', ipHash)
    .eq('restaurant_slug', slug)
    .gte('created_at', cutoff)

  if (error) {
    // 원문 IP/해시는 로깅하지 않는다.
    console.error('[report-rate-limit] count 조회 실패 — fail-open:', error.message)
    return { limited: false, ipHash }
  }

  return { limited: (count ?? 0) >= 1, ipHash }
}
