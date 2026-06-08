import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getRestaurantBySlug, getRestaurantSlugs, getRelatedRestaurants } from '@/lib/restaurants'
import { getProgramSlugFromName } from '@/lib/programs'
import { getAreaSlugFromName } from '@/lib/areas'
import { getCategorySlugForRestaurant } from '@/lib/categories'
import type { Restaurant, Appearance } from '@/types/restaurant'
import ShareButtons from '@/components/restaurant/ShareButtons'
import SaveButton from '@/components/restaurant/SaveButton'
import RestaurantCard from '@/components/restaurant/RestaurantCard'
import RestaurantImage from '@/components/restaurant/RestaurantImage'
import ReportButton from '@/components/restaurant/ReportButton'
import { resolveSourceBadges, sourceToneClass } from '@/lib/sources'

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

function getSourceTypeLabel(sourceType: string): string {
  if (sourceType === 'youtube') return '유튜브'
  if (sourceType === 'tv') return 'TV방송'
  return 'SNS'
}

// 방송 기록 표시용 방어적 정렬: broadcastDate 있음 우선 → 최신 DESC → createdAt 최신 DESC.
// (lib/restaurants.ts 의 대표 선정 로직은 건드리지 않고, 뷰에서 한 번 더 안전하게 정렬한다.)
function compareAppearancesForView(a: Appearance, b: Appearance): number {
  const ad = a.broadcastDate ?? ''
  const bd = b.broadcastDate ?? ''
  if (ad && !bd) return -1
  if (!ad && bd) return 1
  if (ad !== bd) return ad < bd ? 1 : -1
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1
  return 0
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
    { '@type': 'ListItem', position: 1, name: '부산 맛집', item: SITE_URL },
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

  // 상세 하단 추천은 최대 3개로 제한 — 화면을 짧게 유지하고 반복 목록 느낌을 줄인다.
  const related = await getRelatedRestaurants(restaurant, 3)

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

  // 방송 기록: 2건 이상일 때만 노출. 대표 방송 로직은 변경하지 않고 뷰에서 방어적 정렬만.
  const appearanceHistory = [...(restaurant.appearances ?? [])].sort(
    compareAppearancesForView,
  )

  // 출처 칩(중복 제거) + 대표 방영일 + "방송 자세히" 접힘 노출 조건.
  const sourceBadges = resolveSourceBadges(restaurant)
  const repDate =
    formatBroadcastDate(restaurant.broadcastDate) ?? restaurant.appearedAt ?? null
  const hasHistory = appearanceHistory.length >= 2
  const hasBroadcastDetails = hasHistory || Boolean(restaurant.episodeTitle)

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

      {/* 상단 이미지 영역 — thumbnail 있으면 표시, 없으면 카테고리 fallback */}
      <div className="relative h-40">
        <RestaurantImage
          thumbnail={restaurant.thumbnail}
          category={restaurant.category}
          alt={restaurant.name}
          className="h-40 w-full"
          emojiClassName="text-6xl"
        />
        <div className="absolute top-4 right-4 z-10 bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm border border-gray-100">
          <SaveButton id={restaurant.id} size="md" />
        </div>
      </div>

      {/* 기본 정보 — 어디 / 뭐 먹음 / 왜 믿음 / 얼마 (첫 화면 압축) */}
      <section className="px-4 py-4 bg-white">
        <p className="text-xs text-gray-400 font-medium">
          {areaHref ? (
            <Link href={areaHref} className="hover:text-gray-600">
              {restaurant.area}
            </Link>
          ) : (
            <span>{restaurant.area}</span>
          )}
          {restaurant.category && (
            <span className="text-gray-300"> · {restaurant.category}</span>
          )}
        </p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">{restaurant.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{restaurant.mainMenu}</p>

        {/* 출처 칩 — "어디서 봤는지" 한눈에 (기존 방송/유튜브 데이터에서만 파생) */}
        {sourceBadges.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {sourceBadges.map((b) => (
              <span
                key={b.key}
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${sourceToneClass(b.tone)}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2.5">
          <span className="text-base font-bold text-orange-500">{restaurant.priceText}</span>
        </div>

        {restaurant.description && (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-2">
            {restaurant.description}
          </p>
        )}
      </section>

      {/* 핵심 CTA — 길찾기 / 전화 / 공유 (첫 화면에서 "어떻게 감"이 바로 보이도록 상단 배치) */}
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
        phone={restaurant.phone}
      />

      <div className="h-2 bg-gray-50" />

      {/* 위치 */}
      <section className="px-4 py-4 bg-white">
        <h2 className="text-sm font-bold text-gray-900 mb-3">위치</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">주소</span>
            <span className="text-sm text-gray-800">{restaurant.address}</span>
          </div>
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

      {/* 어디서 봤나요 — 출처 요약(한 줄) + 방송 세부는 접힘으로 */}
      <section className="px-4 py-4 bg-white">
        <h2 className="text-sm font-bold text-gray-900 mb-3">어디서 봤나요</h2>

        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {restaurant.sourceType === 'youtube' ? '📺' : '📡'}
          </span>
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-900 truncate">
              {programHref ? (
                <Link href={programHref} className="hover:underline">
                  {getContentLabel(restaurant)}
                </Link>
              ) : (
                getContentLabel(restaurant)
              )}
            </p>
            {repDate && <p className="text-xs text-gray-500 mt-0.5">{repDate}</p>}
          </div>
          <span
            className={`ml-auto flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${getContentBadgeColor(restaurant.sourceType)}`}
          >
            {getSourceTypeLabel(restaurant.sourceType)}
          </span>
        </div>

        {(restaurant.videoUrl || programHref) && (
          <div className="mt-3 flex flex-col gap-2">
            {restaurant.videoUrl && (
              <a
                href={restaurant.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-500 font-semibold underline underline-offset-2"
              >
                유튜브에서 영상 보기 →
              </a>
            )}
            {programHref && (
              <Link
                href={programHref}
                className="text-sm text-orange-500 font-semibold underline underline-offset-2"
              >
                {getContentLabel(restaurant)} 맛집 더 보기 →
              </Link>
            )}
          </div>
        )}

        {/* 방송 세부 (에피소드 / 여러 방송 출연) — 접힘 */}
        {hasBroadcastDetails && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-semibold text-gray-500 py-1 marker:text-gray-400">
              방송 자세히 보기
            </summary>
            <div className="mt-3">
              {hasHistory ? (
                <ul className="flex flex-col gap-3">
                  {appearanceHistory.map((ap) => {
                    const label = ap.creatorName ?? ap.programName ?? ap.sourceTitle
                    const dateText = formatBroadcastDate(ap.broadcastDate)
                    return (
                      <li key={ap.id} className="rounded-xl bg-gray-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate">{label}</p>
                          <span
                            className={`ml-auto flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${getContentBadgeColor(ap.sourceType)}`}
                          >
                            {getSourceTypeLabel(ap.sourceType)}
                          </span>
                        </div>
                        {ap.episodeTitle && (
                          <p className="mt-1 text-sm text-gray-700">{ap.episodeTitle}</p>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {dateText ?? '방영일 미확인'}
                          </span>
                          {ap.videoUrl && (
                            <a
                              href={ap.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-orange-500 font-semibold underline underline-offset-2"
                            >
                              출처 보기 →
                            </a>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                restaurant.episodeTitle && (
                  <div className="rounded-xl bg-gray-50 px-4 py-3">
                    <span className="text-xs text-gray-400">에피소드</span>
                    <p className="mt-0.5 text-sm text-gray-800">{restaurant.episodeTitle}</p>
                  </div>
                )
              )}
            </div>
          </details>
        )}
      </section>

      {/* 정보 수정 제보 */}
      <div className="h-2 bg-gray-50" />
      <section className="px-4 py-4 bg-white text-center">
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
      </section>

      {/* 관련 맛집 */}
      {related.length > 0 && (
        <>
          <div className="h-2 bg-gray-50" />
          <section className="px-4 py-4 bg-white">
            <h2 className="text-sm font-bold text-gray-900 mb-3">이런 맛집도 있어요</h2>
            <div className="flex flex-col gap-3">
              {related.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
              ))}
            </div>
          </section>
        </>
      )}

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

export async function generateStaticParams() {
  const slugs = await getRestaurantSlugs()
  return slugs.map((slug) => ({ slug }))
}
