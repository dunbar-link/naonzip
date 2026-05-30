import type { NextRequest } from 'next/server'
import { submitRestaurantReport } from '@/lib/reports'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'invalid json' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return Response.json({ ok: false, error: 'invalid body' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const slug = typeof b.slug === 'string' ? b.slug : ''
  const reason = typeof b.reason === 'string' ? b.reason : ''
  const message = typeof b.message === 'string' ? b.message : null

  const result = await submitRestaurantReport(
    { slug, reason, message },
    { headers: request.headers },
  )
  if (!result.ok) {
    // rate-limit 초과는 429, 그 외 검증 실패는 400.
    const status = result.error === 'rate_limited' ? 429 : 400
    return Response.json(result, { status })
  }
  return Response.json(result, { status: 200 })
}
