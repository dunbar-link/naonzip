/**
 * Next.js 16 Proxy (구 middleware).
 *
 * - /admin/** 보호. 미인증 접근은 /admin/login 로 redirect.
 * - 단, /admin/login 은 통과시킨다 (로그인 폼 자체는 공개).
 * - 이건 optimistic 1차 검사다. Server Action / Page 에서도 반드시 재검증한다.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth'

export const config = {
  matcher: ['/admin/:path*'],
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 로그인 페이지는 통과
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value
  const ok = await verifyAdminSessionToken(token)
  if (ok) return NextResponse.next()

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/admin/login'
  loginUrl.search = ''
  // 원래 가려던 경로를 redirect 파라미터로 보존 (안전: /admin/* 만 허용)
  if (pathname.startsWith('/admin/')) {
    loginUrl.searchParams.set('redirect', pathname)
  }
  return NextResponse.redirect(loginUrl)
}
