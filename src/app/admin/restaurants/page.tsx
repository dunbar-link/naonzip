import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import PublishToggle from './PublishToggle'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type FilterKey = 'all' | 'unpublished' | 'published'

const TABS: { key: FilterKey; label: string; href: string }[] = [
  { key: 'unpublished', label: '비공개', href: '/admin/restaurants' },
  { key: 'published', label: '공개', href: '/admin/restaurants?filter=published' },
  { key: 'all', label: '전체', href: '/admin/restaurants?filter=all' },
]

function resolveFilter(v: string | undefined): FilterKey {
  if (v === 'published' || v === 'all') return v
  return 'unpublished'
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
  searchParams: Promise<{ filter?: string }>
}

export default async function AdminRestaurantsPage({ searchParams }: Props) {
  const sp = await searchParams
  const filter = resolveFilter(sp.filter)

  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from('restaurants')
    .select(
      'id, slug, name, area, category, main_menu, source_type, source_title, is_published, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(200)
  if (filter === 'unpublished') query = query.eq('is_published', false)
  if (filter === 'published') query = query.eq('is_published', true)

  const { data, error } = await query
  const rows = data ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm font-bold text-gray-900">나온집 — 식당 공개 관리</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/candidates"
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              후보 검토 →
            </Link>
            <span className="text-xs text-gray-500">{rows.length}건</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <nav className="mb-4 flex flex-wrap gap-2 text-xs">
          {TABS.map((tab) => {
            const active = filter === tab.key
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
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="text-xs font-medium text-gray-900 truncate"
                    title={r.name}
                  >
                    {r.name}
                  </span>
                  <span
                    className={[
                      'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                      r.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500',
                    ].join(' ')}
                  >
                    {r.is_published ? '공개됨' : '비공개'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/restaurants/${r.slug}/preview`}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-400"
                  >
                    미리보기
                  </Link>
                  <PublishToggle slug={r.slug} isPublished={r.is_published} />
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-1">
                <span className="font-mono text-gray-400">/{r.slug}</span>
                <span>
                  <span className="font-medium">지역:</span> {r.area}
                </span>
                <span>
                  <span className="font-medium">카테고리:</span> {r.category}
                </span>
                <span>
                  <span className="font-medium">대표 메뉴:</span> {r.main_menu}
                </span>
              </div>

              {(r.source_type || r.source_title) && (
                <div className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">출처:</span> {r.source_type}
                  {r.source_title ? ` / ${r.source_title}` : ''}
                </div>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-400">
                <span>created: {formatKST(r.created_at)}</span>
                <span className="font-mono text-gray-300">{r.id.slice(0, 8)}</span>
              </div>
            </article>
          ))}

          {rows.length === 0 && !error && (
            <p className="text-center text-sm text-gray-500 py-10">
              표시할 식당이 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
