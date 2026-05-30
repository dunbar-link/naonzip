'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

export async function logout() {
  const c = await cookies()
  c.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  redirect('/admin/login')
}
