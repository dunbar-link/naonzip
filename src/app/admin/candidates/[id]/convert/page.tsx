import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import type { CandidateQueueRow, RestaurantSourceType } from '@/types/supabase'
import { RESTAURANT_SOURCE_TYPES } from '@/types/supabase'
import ConvertForm, { type ConvertPrefill } from './ConvertForm'
import AddAppearancePanel, {
  type ExistingMatch,
  type AppearancePrefill,
} from './AddAppearancePanel'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: Promise<{ id: string }>
}

/**
 * 후보의 식당명에서 slug 초안 생성.
 * 영문 소문자/숫자만 유지하고, 공백·구분자는 하이픈으로, 그 외(한글 포함)는 제거.
 * 자동 로마자 변환은 하지 않으므로 한글 name 이면 결과가 빈값이 될 수 있다.
 * 운영자가 폼에서 자유롭게 수정할 수 있으므로 "초안" 수준이면 충분하다.
 */
function draftSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
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

  // 기존 식당 이름 정확 일치 조회(service_role — 공개/비공개 모두). 변환 전일 때만.
  //   - 너무 넓은 유사검색은 하지 않는다(정확 일치만).
  let matches: ExistingMatch[] = []
  if (!candidate.converted_restaurant_slug && candidate.restaurant_name) {
    const { data: matchRows } = await supabase
      .from('restaurants')
      .select('id, slug, name, source_title, is_published')
      .eq('name', candidate.restaurant_name)
      .limit(5)
    matches = (matchRows ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      sourceTitle: r.source_title,
      isPublished: r.is_published,
    }))
  }

  // appearance 추가 폼 prefill (candidate 값 기반).
  const appearancePrefill: AppearancePrefill = {
    source_type: prefill.source_type,
    source_title: candidate.source_name ?? '',
    program_name: prefill.program_name,
    creator_name: prefill.creator_name,
    episode_title: candidate.episode_title ?? '',
    broadcast_date: '',
    video_url: candidate.source_url ?? '',
    note: '',
  }

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
            <p className="font-medium">식당 등록 또는 방송 출연 추가를 완료했습니다.</p>
            <Link
              href={`/restaurants/${candidate.converted_restaurant_slug}`}
              className="mt-1 inline-block text-green-700 hover:underline"
            >
              연결된 식당 보기
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

        {/* 기존 식당 정확 일치가 있으면 "방송 출연 추가" 경로를 먼저 안내. */}
        {!candidate.converted_restaurant_slug && matches.length > 0 && (
          <AddAppearancePanel
            candidateId={candidate.id}
            matches={matches}
            prefill={appearancePrefill}
          />
        )}

        {!candidate.converted_restaurant_slug && (
          <>
            {matches.length > 0 && (
              <p className="mb-2 text-xs font-medium text-gray-500">
                또는 — 정말 다른 식당이라면 새 식당으로 등록하세요.
              </p>
            )}
            <ConvertForm candidateId={candidate.id} prefill={prefill} />
          </>
        )}
      </main>
    </div>
  )
}
