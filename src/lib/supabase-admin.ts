/**
 * Supabase service_role 클라이언트 (서버 전용).
 *
 * - 절대 client component 에서 import 하지 말 것.
 * - 이 파일 import 자체가 클라이언트 번들에 포함되면 module-load 시점에 throw 한다.
 * - `server-only` 패키지를 추가하지 않기 위해 런타임 가드로 대체.
 *
 * SUPABASE_SERVICE_ROLE_KEY 는 `NEXT_PUBLIC_` 접두사 없는 server-only 환경변수.
 * Next.js 번들러는 이 변수를 클라이언트 번들에서 자동으로 제거(빈 문자열로 치환)하므로,
 * 만에 하나 client component 가 이 파일을 import 해도 service_role 키 자체는 노출되지 않는다.
 */

// 클라이언트 번들 로드 시 즉시 throw → 노출 사고 방지.
if (typeof window !== 'undefined') {
  throw new Error(
    '[supabase-admin] 이 모듈은 server-only 입니다. Client Component 에서 import 하지 마세요.',
  )
}

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let cached: SupabaseClient<Database> | null = null

/**
 * service_role 클라이언트 팩토리.
 * - RLS 우회 (관리자 조회/수정 용).
 * - Server Component / Server Action / Route Handler 에서만 호출.
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase admin 환경변수 누락. .env.local 에 ' +
        'NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 설정하세요.',
    )
  }
  if (cached) return cached
  cached = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  return cached
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(supabaseUrl && serviceRoleKey)
}
