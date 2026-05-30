import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import { REPORT_STATUSES, type ReportStatus } from '@/types/supabase'
import StatusSelect from './StatusSelect'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TABS: { key: string; label: string; href: string }[] = [
  { key: 'pending', label: 'pending', href: '/admin/reports' },
  { key: 'reviewed', label: 'reviewed', href: '/admin/reports?status=reviewed' },
  { key: 'applied', label: 'applied', href: '/admin/reports?status=applied' },
  { key: 'rejected', label: 'rejected', href: '/admin/reports?status=rejected' },
  { key: 'all', label: 'all', href: '/admin/reports?all=1' },
]

function isValidStatus(s: string | undefined): s is ReportStatus {
  return (REPORT_STATUSES as readonly string[]).includes(s ?? '')
}

function formatKST(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

type Props = {
  searchParams: Promise<{ status?: string; all?: string }>
}

export default async function AdminReportsPage({ searchParams }: Props) {
  const sp = await searchParams
  const filter: ReportStatus | null = isValidStatus(sp.status)
    ? sp.status
    : sp.all
      ? null
      : 'pending'

  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from('restaurant_reports')
    .select('id, restaurant_slug, reason, message, status, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(200)
  if (filter) query = query.eq('status', filter)

  const { data, error } = await query
  const rows = data ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm font-bold text-gray-900">나온집 — 신고함</h1>
          <span className="text-xs text-gray-500">{rows.length}건</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <nav className="mb-4 flex flex-wrap gap-2 text-xs">
          {TABS.map((tab) => {
            const active =
              (tab.key === 'pending' && filter === 'pending') ||
              (tab.key === 'all' && filter === null) ||
              filter === tab.key
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={[
                  'rounded-full border px-3 py-1.5',
                  active
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                ].join(' ')}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>

        {error && (
          <p className="mb-4 text-xs text-red-600">조회 실패: {error.message}</p>
        )}

        <div className="space-y-3">
          {rows.map((r) => (
            <article
              key={r.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <Link
                  href={`/restaurants/${r.restaurant_slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-gray-900 hover:underline truncate"
                  title={r.restaurant_slug}
                >
                  {r.restaurant_slug}
                </Link>
                <StatusSelect id={r.id} current={r.status} />
              </div>
              <div className="text-xs text-gray-600 mb-1">
                <span className="font-medium">사유:</span> {r.reason}
              </div>
              {r.message && (
                <details className="text-xs text-gray-700 mt-1">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-900">
                    메시지 보기
                  </summary>
                  <p className="mt-2 whitespace-pre-wrap break-words bg-gray-50 rounded px-3 py-2">
                    {r.message}
                  </p>
                </details>
              )}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400">
                <span>created: {formatKST(r.created_at)}</span>
                <span>updated: {formatKST(r.updated_at)}</span>
                <span className="font-mono text-gray-300">{r.id.slice(0, 8)}</span>
              </div>
            </article>
          ))}

          {rows.length === 0 && !error && (
            <p className="text-center text-sm text-gray-500 py-10">
              표시할 신고가 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
