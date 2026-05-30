/**
 * 관리자 인증 유틸 (Edge-safe).
 *
 * - 비밀번호 1개(ADMIN_PASSWORD)로 단순 인증한다.
 * - 쿠키 값은 비밀번호의 HMAC-SHA256 다이제스트라, 비밀번호가 바뀌면 즉시 무효화된다.
 * - `next/headers` / `node:crypto` 를 import 하지 않아 proxy(Edge runtime) 에서도 안전하게 사용할 수 있다.
 * - 쿠키 set/clear/get 은 호출 측(Server Action / Page)에서 `next/headers` 의 `cookies()` 로 처리한다.
 */

export const ADMIN_COOKIE_NAME = 'naonzip_admin'
export const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7d

const SESSION_SALT = 'naonzip-admin-session-v1'

/**
 * 비밀번호 → HMAC-SHA256 hex 토큰.
 * Web Crypto API 사용 (Edge + Node 모두 지원).
 */
export async function deriveSessionToken(password: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(SESSION_SALT))
  const bytes = new Uint8Array(sig)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

/**
 * timing-safe 문자열 비교 (constant-time).
 */
export function timingSafeStringEqual(
  a: string | undefined | null,
  b: string | undefined | null,
): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length === 0 || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/**
 * 입력 비밀번호가 ADMIN_PASSWORD 와 일치하는지 확인.
 */
export function verifyAdminPassword(input: string | undefined | null): boolean {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw || !input) return false
  return timingSafeStringEqual(input, pw)
}

/**
 * 쿠키에 담긴 세션 토큰이 현재 ADMIN_PASSWORD 의 HMAC 다이제스트와 일치하는지 확인.
 */
export async function verifyAdminSessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) return false
  const expected = await deriveSessionToken(pw)
  return timingSafeStringEqual(token, expected)
}
