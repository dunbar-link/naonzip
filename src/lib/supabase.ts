import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Supabase anon 클라이언트 팩토리
 * 서버 컴포넌트 / Route Handler 에서 호출 가능
 */
export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase 환경변수가 설정되지 않았습니다.\n' +
        '.env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_ANON_KEY 를 추가하세요.',
    )
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Supabase 연결 가능 여부 (환경변수 존재 여부)
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
