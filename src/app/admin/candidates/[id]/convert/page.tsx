import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import type { CandidateQueueRow, RestaurantSourceType } from '@/types/supabase'
import { RESTAURANT_SOURCE_TYPES } from '@/types/supabase'
import ConvertForm, { type ConvertPrefill } from './ConvertForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: Promise<{ id: string }>
}

/**
 * 후보의 식당명에서 slug 초안 생성.
 * 한글/영문/숫자는 유지하고, 공백·구분자는 하이픈으로, 그 외는 제거.
 * 운영자가 폼에서 자유롭게 수정할 수 있으므로 "초안" 수준이면 충분하다.
 */
function draftSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/[\s_]+/g, '-')
    .replace(/[^가-힣a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildPrefill(row: CandidateQueueRow): ConvertPrefill {
  // candidate 의 source_type 이 restaurant 3종 화이트리스트에 들면 그대로, 아니면(other) 빈값.
  const sourceType: RestaurantSourceType | '' =
    (RESTAURANT_SOURCE_TYPES as readonly string[]).includes(row.source_type)
      ? (row.source_type as RestaurantSourceType)
      : ''

  return {
    name: row.restaurant_name ?? '',
    source_title: row.source_name ?? '',
    episode_title: row.episode_title ?? '',
    source_type: sourceType,
    // youtube 는 채널명을 creator, tv 는 프로그램명을 program 으로 추정 prefill.
    creator_name: row.source_type === 'youtube' ? (row.source_name ?? '') : '',
    program_name: row.source_type === 'tv' ? (row.source_name ?? '') : '',
    // youtube 후보의 source_url 은 영상 URL 로 추정.
    video_url: row.source_type === 'youtube' ? (row.source_url ?? '') : '',
    slug: draftSlug(row.restaurant_name ?? ''),
  }
}

export default async function ConvertCandidatePage({ params }: Props) {
  const { id } = await params

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from('candidate_queue')
    .select(
      'id, source_type, source_name, episode_title, restaurant_name, area_guess, source_url, status, confidence_score, operator_note, created_at, reviewed_at, converted_restaurant_slug',
    )
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const candidate = data as CandidateQueueRow
  const prefill = buildPrefill(candidate)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm font-bold text-gray-900">나온집 — 후보 등록 준비</h1>
          <Link
            href="/admin/candidates"
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            ← 목록으로
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-28">
        {candidate.converted_restaurant_slug && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
            <p className="font-medium">이미 식당으로 등록된 후보예요.</p>
            <Link
              href={`/restaurants/${candidate.converted_restaurant_slug}`}
              className="mt-1 inline-block text-green-700 hover:underline"
            >
              등록 완료: /restaurants/{candidate.converted_restaurant_slug}
            </Link>
          </div>
        )}

        {!candidate.converted_restaurant_slug && candidate.status !== 'VERIFIED' && (
          <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            이 후보는 아직 VERIFIED 상태가 아니에요(현재: {candidate.status}). 그래도 등록은
            가능하지만, 검토 후 진행하는 것을 권장해요.
          </p>
        )}

        {/* 참고용 — candidate 원본 정보 (수정 불가, prefill 근거) */}
        <section className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-xs font-bold text-gray-900">후보 원본 정보 (참고)</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            <span>
              <span className="font-medium">소스:</span> {candidate.source_type} /{' '}
              {candidate.source_name}
            </span>
            {candidate.area_guess && (
              <span>
                <span className="font-medium">추정 지역:</span> {candidate.area_guess}
              </span>
            )}
            {candidate.confidence_score != null && (
              <span>
                <span className="font-medium">신뢰도:</span> {candidate.confidence_score}
              </span>
            )}
          </div>
          {candidate.source_url && (
            <div className="mt-1 text-xs">
              <Link
                href={candidate.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {candidate.source_url}
              </Link>
            </div>
          )}
          {candidate.operator_note && (
            <p className="mt-2 whitespace-pre-wrap break-words rounded bg-gray-50 px-3 py-2 text-xs text-gray-700">
              {candidate.operator_note}
            </p>
          )}
        </section>

        {!candidate.converted_restaurant_slug && (
          <ConvertForm candidateId={candidate.id} prefill={prefill} />
        )}
      </main>
    </div>
  )
}
