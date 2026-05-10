import { notFound } from 'next/navigation'
import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { getRestaurantBySlug, getRestaurantSlugs } from '@/lib/restaurants'
import type { Restaurant } from '@/types/restaurant'
import ShareButtons from '@/components/restaurant/ShareButtons'
import SaveButton from '@/components/restaurant/SaveButton'

function getContentLabel(r: { creatorName?: string; programName?: string; sourceTitle: string }): string {
  return r.creatorName ?? r.programName ?? r.sourceTitle
}

function getContentBadgeColor(sourceType: string): string {
  if (sourceType === 'youtube') return 'bg-red-50 text-red-600'
  if (sourceType === 'tv') return 'bg-blue-50 text-blue-700'
  return 'bg-pink-50 text-pink-600'
}

function formatBroadcastDate(date?: string): string | null {
  if (!date) return null
  const [year, month, day] = date.split('-')
  if (!year || !month) return null
  return day ? `${year}년 ${month}월 ${day}일` : `${year}년 ${month}월`
}

type Props = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

// ─────────────────────────────────────────────
// SEO 헬퍼
// ─────────────────────────────────────────────

function buildTitle(r: Restaurant): string {
  const source = r.creatorName ?? r.programName
  return source
    ? `${r.name} (${source}) - ${r.area} ${r.category} | 나온집`
    : `${r.name} - ${r.area} ${r.category} | 나온집`
}

function buildDescription(r: Restaurant): string {
  if (r.description) return r.description
  const parts: string[] = [`${r.area} ${r.category} 맛집.`]
  const source = r.creatorName ?? r.programName
  if (source) parts.push(`${source}에 나온 ${r.mainMenu}.`)
  if (r.episodeTitle) parts.push(r.episodeTitle + '.')
  parts.push(`주소: ${r.address}`)
  return parts.join(' ')
}

// ─────────────────────────────────────────────
// generateMetadata
// ─────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const restaurant = await getRestaurantBySlug(slug)

  if (!restaurant) {
    return {
      title: '맛집을 찾을 수 없습니다 | 나온집',
      description: '요청하신 맛집 정보를 찾을 수 없습니다.',
    }
  }

  const title = buildTitle(restaurant)
  const description = buildDescription(restaurant)

  // thumbnail이 있을 때만 OG 이미지 포함
  const ogImages = restaurant.thumbnail
    ? [{ url: restaurant.thumbnail, width: 1200, height: 630, alt: restaurant.name }]
    : undefined

  return {
    title,
    description,
    alternates: {
      canonical: `/restaurants/${restaurant.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/restaurants/${restaurant.slug}`,
      siteName: '나온집',
      locale: 'ko_KR',
      type: 'article',
      ...(ogImages && { images: ogImages }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImages && { images: ogImages }),
    },
  }
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { slug } = await params
  const restaurant = await getRestaurantBySlug(slug)

  if (!restaurant) notFound()

  const headersList = await headers()
  const host = headersList.get('host') ?? 'naonzip.vercel.app'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const pageUrl = `${protocol}://${host}/restaurants/${restaurant.slug}`

  return (
    <main className="pt-14 pb-24">
      {/* 상단 이미지 영역 */}
      <div className="relative h-52 bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center">
        <span className="text-7xl">{getCategoryEmoji(restaurant.category)}</span>
        <div className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm border border-gray-100">
          <SaveButton id={restaurant.id} size="md" />
        </div>
      </div>

      {/* 기본 정보 */}
      <section className="px-4 py-5 bg-white">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs text-gray-400 font-medium">{restaurant.area}</span>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{restaurant.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{restaurant.mainMenu}</p>
          </div>
          <span className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full ${getContentBadgeColor(restaurant.sourceType)}`}>
            {getContentLabel(restaurant)}
          </span>
        </div>

        <div className="mt-3">
          <span className="text-base font-bold text-orange-500">{restaurant.priceText}</span>
        </div>

        {restaurant.description && (
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">{restaurant.description}</p>
        )}
      </section>

      <div className="h-2 bg-gray-50" />

      {/* 방송 출처 */}
      <section className="px-4 py-5 bg-white">
        <h2 className="text-sm font-bold text-gray-900 mb-4">방송 정보</h2>

        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-3 flex items-center gap-3">
          <span className="text-2xl">
            {restaurant.sourceType === 'youtube' ? '📺' : '📡'}
          </span>
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-900 truncate">
              {restaurant.creatorName ?? restaurant.programName ?? restaurant.sourceTitle}
            </p>
            {restaurant.creatorName && restaurant.programName && (
              <p className="text-xs text-gray-500 mt-0.5">{restaurant.programName}</p>
            )}
          </div>
          <span className={`ml-auto flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${getContentBadgeColor(restaurant.sourceType)}`}>
            {restaurant.sourceType === 'youtube' ? '유튜브' : 'TV방송'}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {restaurant.episodeTitle && (
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">에피소드</span>
              <span className="text-sm text-gray-800">{restaurant.episodeTitle}</span>
            </div>
          )}
          {(restaurant.broadcastDate ?? restaurant.appearedAt) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-16 flex-shrink-0">방영일</span>
              <span className="text-sm font-medium text-gray-800">
                {formatBroadcastDate(restaurant.broadcastDate) ?? restaurant.appearedAt}
              </span>
            </div>
          )}
          {restaurant.videoUrl && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-16 flex-shrink-0">영상</span>
              <a
                href={restaurant.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-500 font-semibold underline underline-offset-2"
              >
                유튜브에서 보기 →
              </a>
            </div>
          )}
        </div>
      </section>

      <div className="h-2 bg-gray-50" />

      {/* 위치 정보 */}
      <section className="px-4 py-5 bg-white">
        <h2 className="text-sm font-bold text-gray-900 mb-3">위치 정보</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">주소</span>
            <span className="text-sm text-gray-800">{restaurant.address}</span>
          </div>
          {restaurant.phone && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-16 flex-shrink-0">전화</span>
              <a href={`tel:${restaurant.phone}`} className="text-sm text-blue-600">
                {restaurant.phone}
              </a>
            </div>
          )}
        </div>
      </section>

      <div className="h-2 bg-gray-50" />

      {/* 길찾기 + 공유 (클라이언트 컴포넌트) */}
      <ShareButtons
        mapInfo={{
          name: restaurant.name,
          address: restaurant.address,
          lat: restaurant.lat,
          lng: restaurant.lng,
          kakaoMapUrl: restaurant.kakaoMapUrl,
          naverMapUrl: restaurant.naverMapUrl,
          tmapUrl: restaurant.tmapUrl,
        }}
        shareInfo={{
          name: restaurant.name,
          mainMenu: restaurant.mainMenu,
          address: restaurant.address,
          pageUrl,
        }}
      />

      {/* 뒤로가기 */}
      <div className="px-4 mt-2 mb-4">
        <Link
          href="/"
          className="block text-center text-sm text-gray-400 py-3 rounded-xl border border-gray-200"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>
    </main>
  )
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    '돼지국밥': '🍲',
    '고기': '🥩',
    '해산물': '🦀',
    '밀면': '🍜',
    '회': '🐟',
    '분식/길거리': '🥢',
    '한식': '🍱',
    '버거/양식': '🍔',
    '아시안': '🍜',
    '베이커리/디저트': '🥐',
  }
  return map[category] ?? '🍽️'
}

export async function generateStaticParams() {
  const slugs = await getRestaurantSlugs()
  return slugs.map((slug) => ({ slug }))
}
