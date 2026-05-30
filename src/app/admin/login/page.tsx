import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE_SECONDS,
  deriveSessionToken,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function sanitizeRedirect(v: string | undefined | null): string {
  if (!v || typeof v !== 'string') return '/admin/reports'
  if (!v.startsWith('/admin/')) return '/admin/reports'
  if (v === '/admin/login') return '/admin/reports'
  return v
}

async function login(formData: FormData): Promise<void> {
  'use server'
  const password = String(formData.get('password') ?? '')
  const redirectRaw = String(formData.get('redirect') ?? '')
  const safeRedirect = sanitizeRedirect(redirectRaw)

  if (!verifyAdminPassword(password)) {
    const qs = new URLSearchParams({ error: '1' })
    if (redirectRaw) qs.set('redirect', redirectRaw)
    redirect('/admin/login?' + qs.toString())
  }

  const pw = process.env.ADMIN_PASSWORD
  if (!pw) {
    redirect('/admin/login?error=config')
  }
  const token = await deriveSessionToken(pw)

  const c = await cookies()
  c.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
  })

  redirect(safeRedirect)
}

type Props = {
  searchParams: Promise<{ error?: string; redirect?: string }>
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const sp = await searchParams

  // 이미 로그인된 세션이면 곧장 진입
  const c = await cookies()
  const existing = c.get(ADMIN_COOKIE_NAME)?.value
  if (await verifyAdminSessionToken(existing)) {
    redirect(sanitizeRedirect(sp.redirect))
  }

  const errorMsg =
    sp.error === 'config'
      ? '서버 환경변수 미설정 (ADMIN_PASSWORD).'
      : sp.error
        ? '비밀번호가 올바르지 않습니다.'
        : null

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        action={login}
        className="w-full max-w-xs bg-white rounded-lg shadow border border-gray-200 p-6"
      >
        <h1 className="text-base font-bold text-gray-900 mb-4">관리자 로그인</h1>
        {errorMsg && (
          <p className="mb-3 text-xs text-red-600">{errorMsg}</p>
        )}
        <label className="block">
          <span className="block text-xs font-medium text-gray-600 mb-1">비밀번호</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
          />
        </label>
        {sp.redirect && (
          <input type="hidden" name="redirect" value={sp.redirect} />
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          로그인
        </button>
      </form>
    </main>
  )
}
