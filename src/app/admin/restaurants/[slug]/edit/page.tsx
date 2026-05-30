import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import type { RestaurantRow, RestaurantSourceType } from '@/types/supabase'
import { RESTAURANT_SOURCE_TYPES } from '@/types/supabase'
import EditForm, { type EditPrefill } from './EditForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: Promise<{ slug: string }>
}

function buildPrefill(row: RestaurantRow): EditPrefill {
  // source_type 이 restaurant 3종 화이트리스트에 들면 그대로, 아니면 빈값.
  const sourceType: RestaurantSourceType | '' =
    (RESTAURANT_SOURCE_TYPES as readonly string[]).includes(row.source_type)
      ? (row.source_type as RestaurantSourceType)
      : ''

  return {
    slug: row.slug ?? '',
    name: row.name ?? '',
    area: row.area ?? '',
    address: row.address ?? '',
    lat: row.lat != null ? String(row.lat) : '',
    lng: row.lng != null ? String(row.lng) : '',
    category: row.category ?? '',
    main_menu: row.main_menu ?? '',
    price_text: row.price_text ?? '',
    source_type: sourceType,
    source_title: row.source_title ?? '',
    phone: row.phone ?? '',
    thumbnail: row.thumbnail ?? '',
    creator_name: row.creator_name ?? '',
    program_name: row.program_name ?? '',
    episode_title: row.episode_title ?? '',
    broadcast_date: row.broadcast_date ?? '',
    description: row.description ?? '',
    video_url: row.video_url ?? '',
    kakao_map_url: row.kakao_map_url ?? '',
    naver_map_url: row.naver_map_url ?? '',
    tmap_url: row.tmap_url ?? '',
  }
}

export default async function RestaurantEditPage({ params }: Props) {
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
  const prefill = buildPrefill(r)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <h1 className="text-sm font-bold text-gray-900">나온집 — 식당 정보 수정</h1>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/restaurants/${r.slug}/preview`}
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              미리보기
            </Link>
            <Link
              href="/admin/restaurants"
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              ← 목록으로
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <p className="mb-4 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
          수정과 공개는 분리됩니다. 공개는 미리보기에서 토글하세요.
        </p>

        <EditForm
          restaurantId={r.id}
          isPublished={r.is_published}
          prefill={prefill}
        />
      </main>
    </div>
  )
}
