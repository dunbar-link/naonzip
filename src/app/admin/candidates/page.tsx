import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import { CANDIDATE_STATUSES, type CandidateStatus } from '@/types/supabase'
import CandidateActions from './CandidateActions'
import AddCandidateForm from './AddCandidateForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TABS: { key: string; label: string; href: string }[] = [
  { key: 'PENDING', label: 'PENDING', href: '/admin/candidates' },
  { key: 'VERIFIED', label: 'VERIFIED', href: '/admin/candidates?status=VERIFIED' },
  { key: 'REJECTED', label: 'REJECTED', href: '/admin/candidates?status=REJECTED' },
  { key: 'all', label: 'all', href: '/admin/candidates?all=1' },
]

function isValidStatus(s: string | undefined): s is CandidateStatus {
  return (CANDIDATE_STATUSES as readonly string[]).includes(s ?? '')
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

export default async function AdminCandidatesPage({ searchParams }: Props) {
  const sp = await searchParams
  const filter: CandidateStatus | null = isValidStatus(sp.status)
    ? sp.status
    : sp.all
      ? null
      : 'PENDING'

  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from('candidate_queue')
    .select(
      'id, source_type, source_name, episode_title, restaurant_name, area_guess, source_url, status, confidence_score, operator_note, created_at, reviewed_at, converted_restaurant_slug',
    )
    .order('created_at', { ascending: false })
    .limit(200)
  if (filter) query = query.eq('status', filter)

  const { data, error } = await query
  const rows = data ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm font-bold text-gray-900">나온집 — 후보 검토</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/restaurants"
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              식당 공개 관리 →
            </Link>
            <span className="text-xs text-gray-500">{rows.length}건</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <nav className="mb-4 flex flex-wrap gap-2 text-xs">
          {TABS.map((tab) => {
            const active =
              (tab.key === 'PENDING' && filter === 'PENDING') ||
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

        <AddCandidateForm />

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
                <span
                  className="text-xs font-medium text-gray-900 truncate"
                  title={r.restaurant_name}
                >
                  {r.restaurant_name}
                </span>
                <CandidateActions id={r.id} current={r.status} />
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-1">
                <span>
                  <span className="font-medium">소스:</span> {r.source_type} / {r.source_name}
                </span>
                {r.area_guess && (
                  <span>
                    <span className="font-medium">추정 지역:</span> {r.area_guess}
                  </span>
                )}
                {r.confidence_score != null && (
                  <span>
                    <span className="font-medium">신뢰도:</span> {r.confidence_score}
                  </span>
                )}
              </div>

              {r.episode_title && (
                <div className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">에피소드:</span> {r.episode_title}
                </div>
              )}

              {r.source_url && (
                <div className="text-xs mb-1">
                  <Link
                    href={r.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {r.source_url}
                  </Link>
                </div>
              )}

              {r.operator_note && (
                <details className="text-xs text-gray-700 mt-1">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-900">
                    운영자 메모 보기
                  </summary>
                  <p className="mt-2 whitespace-pre-wrap break-words bg-gray-50 rounded px-3 py-2">
                    {r.operator_note}
                  </p>
                </details>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-400">
                <span>created: {formatKST(r.created_at)}</span>
                {r.reviewed_at && <span>reviewed: {formatKST(r.reviewed_at)}</span>}
                <span className="font-mono text-gray-300">{r.id.slice(0, 8)}</span>
                {r.converted_restaurant_slug ? (
                  <Link
                    href={`/admin/restaurants/${r.converted_restaurant_slug}/preview`}
                    className="ml-auto font-medium text-green-600 hover:underline"
                  >
                    등록 완료(미리보기): /restaurants/{r.converted_restaurant_slug}
                  </Link>
                ) : (
                  r.status === 'VERIFIED' && (
                    <Link
                      href={`/admin/candidates/${r.id}/convert`}
                      className="ml-auto rounded-md border border-gray-900 px-2 py-0.5 text-[10px] font-medium text-gray-900 hover:bg-gray-900 hover:text-white"
                    >
                      등록 준비
                    </Link>
                  )
                )}
              </div>
            </article>
          ))}

          {rows.length === 0 && !error && (
            <p className="text-center text-sm text-gray-500 py-10">
              표시할 후보가 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
