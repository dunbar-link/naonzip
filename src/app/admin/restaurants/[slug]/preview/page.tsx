import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import type { RestaurantRow } from '@/types/supabase'
import PublishToggle from '../../PublishToggle'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: Promise<{ slug: string }>
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

/** 라벨 + 값 한 줄. 값이 비어있으면 렌더하지 않는다. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  if (children == null || children === '') return null
  return (
    <div className="flex flex-wrap gap-x-2 text-xs text-gray-700">
      <span className="w-24 shrink-0 font-medium text-gray-500">{label}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  )
}

export default async function RestaurantPreviewPage({ params }: Props) {
  const { slug } = await params

  const supabase = getSupabaseAdminClient()
  // is_published 무관 — 공개/비공개 모두 조회 (service_role 로 RLS 우회).
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) notFound()

  const r = data as RestaurantRow

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm font-bold text-gray-900">나온집 — 식당 미리보기</h1>
          <Link
            href="/admin/restaurants"
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            ← 목록으로
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* 공개 상태 안내 + 토글 */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            {r.is_published ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                공개됨
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                이 식당은 현재 비공개입니다
              </span>
            )}
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/restaurants/${r.slug}/edit`}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-400"
              >
                수정하기
              </Link>
              <PublishToggle slug={r.slug} isPublished={r.is_published} />
            </div>
          </div>
          <div className="text-xs text-gray-600">
            공개 페이지:{' '}
            <Link
              href={`/restaurants/${r.slug}`}
              className="text-blue-600 hover:underline break-all"
            >
              /restaurants/{r.slug}
            </Link>
            {!r.is_published && (
              <span className="ml-2 text-amber-600">
                (비공개 상태에서는 공개 페이지가 404 입니다)
              </span>
            )}
          </div>
        </section>

        {/* 썸네일 */}
        {r.thumbnail && (
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            {/* 운영자 미리보기용 단순 미리보기 — 공개 페이지의 next/image 최적화는 쓰지 않는다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={r.thumbnail}
              alt={r.name}
              className="max-h-64 w-full rounded object-cover"
            />
          </section>
        )}

        {/* 핵심 필드 */}
        <section className="space-y-1.5 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-xs font-bold text-gray-900">{r.name}</h2>
          <Field label="slug">
            <span className="font-mono">{r.slug}</span>
          </Field>
          <Field label="지역">{r.area}</Field>
          <Field label="카테고리">{r.category}</Field>
          <Field label="대표 메뉴">{r.main_menu}</Field>
          <Field label="가격대">{r.price_text}</Field>
          <Field label="주소">{r.address}</Field>
          <Field label="좌표">
            {r.lat}, {r.lng}
          </Field>
          <Field label="전화">{r.phone}</Field>
        </section>

        {/* 출처 / 방송 정보 */}
        <section className="space-y-1.5 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-xs font-bold text-gray-900">출처 정보</h2>
          <Field label="소스 유형">{r.source_type}</Field>
          <Field label="출처명">{r.source_title}</Field>
          <Field label="채널/크리에이터">{r.creator_name}</Field>
          <Field label="프로그램명">{r.program_name}</Field>
          <Field label="에피소드">{r.episode_title}</Field>
          <Field label="방송일">{r.broadcast_date}</Field>
        </section>

        {/* 링크 */}
        {(r.video_url || r.kakao_map_url || r.naver_map_url || r.tmap_url) && (
          <section className="space-y-1.5 rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-2 text-xs font-bold text-gray-900">링크</h2>
            {r.video_url && (
              <Field label="영상">
                <Link
                  href={r.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {r.video_url}
                </Link>
              </Field>
            )}
            {r.kakao_map_url && (
              <Field label="카카오맵">
                <Link
                  href={r.kakao_map_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {r.kakao_map_url}
                </Link>
              </Field>
            )}
            {r.naver_map_url && (
              <Field label="네이버맵">
                <Link
                  href={r.naver_map_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {r.naver_map_url}
                </Link>
              </Field>
            )}
            {r.tmap_url && (
              <Field label="티맵">
                <Link
                  href={r.tmap_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {r.tmap_url}
                </Link>
              </Field>
            )}
          </section>
        )}

        {/* 설명 */}
        {r.description && (
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-2 text-xs font-bold text-gray-900">설명</h2>
            <p className="whitespace-pre-wrap break-words text-xs text-gray-700">
              {r.description}
            </p>
          </section>
        )}

        <p className="text-[10px] text-gray-400">
          created: {formatKST(r.created_at)} · {r.id}
        </p>
      </main>
    </div>
  )
}
