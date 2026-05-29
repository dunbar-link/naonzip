import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getRestaurantBySlug, getRestaurantSlugs, getRelatedRestaurants } from '@/lib/restaurants'
import { getProgramSlugFromName } from '@/lib/programs'
import { getAreaSlugFromName } from '@/lib/areas'
import { getCategorySlugForRestaurant } from '@/lib/categories'
import type { Restaurant } from '@/types/restaurant'
import ShareButtons from '@/components/restaurant/ShareButtons'
import SaveButton from '@/components/restaurant/SaveButton'
import RestaurantCard from '@/components/restaurant/RestaurantCard'
import ReportButton from '@/components/restaurant/ReportButton'

const SITE_URL = 'https://naonzip.vercel.app'

export const revalidate = 3600

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
// JSON-LD (schema.org Restaurant)
//   - undefined/null/빈 문자열은 포함하지 않는다.
//   - geo 는 lat/lng 가 유효한 숫자일 때만 포함한다.
//   - sameAs / subjectOf 등 부가 필드는 데이터가 있을 때만 포함한다.
// ─────────────────────────────────────────────

function toAbsoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value
  return `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`
}

function buildRestaurantJsonLd(r: Restaurant): Record<string, unknown> {
  const url = `${SITE_URL}/restaurants/${r.slug}`
  const description = buildDescription(r)

  const servesCuisine = Array.from(
    new Set([r.category, r.mainMenu].filter((v): v is string => Boolean(v))),
  )

  const sameAs = [r.kakaoMapUrl, r.naverMapUrl, r.videoUrl].filter(
    (v): v is string => typeof v === 'string' && v.length > 0,
  )

  const hasGeo =
    Number.isFinite(r.lat) &&
    Number.isFinite(r.lng) &&
    !(r.lat === 0 && r.lng === 0)

  let subjectOf: Record<string, unknown> | undefined
  if (r.videoUrl) {
    subjectOf = {
      '@type': 'VideoObject',
      name:
        r.episodeTitle ?? r.programName ?? r.creatorName ?? r.sourceTitle,
      url: r.videoUrl,
      ...(r.broadcastDate && { uploadDate: r.broadcastDate }),
    }
  } else if (r.programName || r.episodeTitle || r.broadcastDate) {
    subjectOf = {
      '@type': 'CreativeWork',
      name: r.episodeTitle ?? r.programName ?? r.sourceTitle,
      ...(r.broadcastDate && { datePublished: r.broadcastDate }),
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${url}#restaurant`,
    name: r.name,
    description,
    url,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      addressLocality: '부산',
      addressRegion: r.area,
      streetAddress: r.address,
    },
    ...(hasGeo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: r.lat,
        longitude: r.lng,
      },
    }),
    ...(servesCuisine.length > 0 && { servesCuisine }),
    ...(r.priceText && { priceRange: r.priceText }),
    ...(r.phone && { telephone: r.phone }),
    ...(r.thumbnail && { image: toAbsoluteUrl(r.thumbnail) }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(subjectOf && { subjectOf }),
  }
}

// ─────────────────────────────────────────────
// BreadcrumbList JSON-LD
// ─────────────────────────────────────────────

function buildBreadcrumbJsonLd(
  r: Restaurant,
  areaHref: string | null,
  programHref: string | null,
): Record<string, unknown> {
  const items: Array<Record<string, unknown>> = [
    { '@type': 'ListItem', position: 1, name: '부산 방송맛집', item: SITE_URL },
  ]
  let pos = 2
  if (areaHref) {
    items.push({ '@type': 'ListItem', position: pos++, name: r.area, item: `${SITE_URL}${areaHref}` })
  }
  if (programHref) {
    const progName = r.creatorName ?? r.programName ?? r.sourceTitle
    items.push({ '@type': 'ListItem', position: pos++, name: progName, item: `${SITE_URL}${programHref}` })
  }
  items.push({ '@type': 'ListItem', position: pos, name: r.name })
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
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

  const related = await getRelatedRestaurants(restaurant)

  const reportFormUrl = (() => {
    const tpl = process.env.NEXT_PUBLIC_REPORT_FORM_URL
    if (!tpl) return null
    return tpl.includes('{slug}')
      ? tpl.replace('{slug}', encodeURIComponent(restaurant.slug))
      : tpl
  })()

  const pageUrl = `${SITE_URL}/restaurants/${restaurant.slug}`
  const jsonLd = buildRestaurantJsonLd(restaurant)
  const isYoutubeCreator =
    restaurant.sourceType === 'youtube' && !!restaurant.creatorName
  const creatorSlug = isYoutubeCreator
    ? getProgramSlugFromName(restaurant.creatorName)
    : null
  const programSlug =
    getProgramSlugFromName(restaurant.creatorName) ??
    getProgramSlugFromName(restaurant.programName) ??
    getProgramSlugFromName(restaurant.sourceTitle)
  const programHref = creatorSlug
    ? `/creator/${creatorSlug}`
    : programSlug
      ? `/program/${programSlug}`
      : null
  const areaSlug = getAreaSlugFromName(restaurant.area)
  const areaHref = areaSlug ? `/area/${areaSlug}` : null
  const categorySlug = getCategorySlugForRestaurant(restaurant.category, restaurant.mainMenu)
  const categoryHref = categorySlug ? `/category/${categorySlug}` : null
  const categoryDisplay = categorySlug
    ? (categorySlug === 'gopchang' ? '곱창' : restaurant.category)
    : null

  return (
    <main className="pt-14 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(restaurant, areaHref, programHref)) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="px-4 py-2 bg-white border-b border-gray-50">
        <ol className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
          <li><Link href="/" className="hover:text-gray-600">부산</Link></li>
          <li aria-hidden="true">/</li>
          {areaHref ? (
            <li><Link href={areaHref} className="hover:text-gray-600">{restaurant.area}</Link></li>
          ) : (
            <li>{restaurant.area}</li>
          )}
          {programHref && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={programHref} className="hover:text-gray-600 max-w-[120px] truncate inline-block align-bottom">
                  {restaurant.creatorName ?? restaurant.programName ?? restaurant.sourceTitle}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li className="text-gray-600 max-w-[120px] truncate">{restaurant.name}</li>
        </ol>
      </nav>

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
            {areaHref ? (
              <Link href={areaHref} className="text-xs text-gray-400 font-medium hover:text-gray-600">
                {restaurant.area}
              </Link>
            ) : (
              <span className="text-xs text-gray-400 font-medium">{restaurant.area}</span>
            )}
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{restaurant.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{restaurant.mainMenu}</p>
          </div>
          {programHref ? (
            <Link href={programHref} className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full hover:opacity-75 transition-opacity ${getContentBadgeColor(restaurant.sourceType)}`}>
              {getContentLabel(restaurant)}
            </Link>
          ) : (
            <span className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full ${getContentBadgeColor(restaurant.sourceType)}`}>
              {getContentLabel(restaurant)}
            </span>
          )}
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
              {programHref ? (
                <Link href={programHref} className="hover:underline">
                  {restaurant.creatorName ?? restaurant.programName ?? restaurant.sourceTitle}
                </Link>
              ) : (
                restaurant.creatorName ?? restaurant.programName ?? restaurant.sourceTitle
              )}
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
          {programHref && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-16 flex-shrink-0">더 보기</span>
              <Link
                href={programHref}
                className="text-sm text-orange-500 font-semibold underline underline-offset-2"
              >
                {getContentLabel(restaurant)} 맛집 더 보기 →
              </Link>
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
          {areaHref && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-16 flex-shrink-0">더 보기</span>
              <Link
                href={areaHref}
                className="text-sm text-orange-500 font-semibold underline underline-offset-2"
              >
                부산 {restaurant.area} 맛집 더 보기 →
              </Link>
            </div>
          )}
          {categoryHref && categoryDisplay && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-16 flex-shrink-0">더 보기</span>
              <Link
                href={categoryHref}
                className="text-sm text-orange-500 font-semibold underline underline-offset-2"
              >
                부산 {categoryDisplay} 맛집 더 보기 →
              </Link>
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

      {/* 관련 맛집 */}
      {related.length > 0 && (
        <>
          <div className="h-2 bg-gray-50" />
          <section className="px-4 py-5 bg-white">
            <h2 className="text-sm font-bold text-gray-900 mb-3">이런 맛집도 있어요</h2>
            <div className="flex flex-col gap-3">
              {related.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
              ))}
            </div>
          </section>
        </>
      )}

      {/* 정보 수정 제보 */}
      <div className="px-4 mt-4 text-center">
        <ReportButton slug={restaurant.slug} />
        {reportFormUrl && (
          <div className="mt-2">
            <a
              href={reportFormUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-[11px] text-gray-300 underline underline-offset-2 hover:text-gray-500"
            >
              외부 폼으로 신고
            </a>
          </div>
        )}
      </div>

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
