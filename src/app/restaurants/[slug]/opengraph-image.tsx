import { ImageResponse } from 'next/og'
import { getRestaurantBySlug, getRestaurantSlugs } from '@/lib/restaurants'

export const alt = '나온집 부산 방송맛집'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function generateStaticParams() {
  const slugs = await getRestaurantSlugs()
  return slugs.map((slug) => ({ slug }))
}

type ImageProps = { params: Promise<{ slug: string }> }

const BG = 'linear-gradient(135deg, #FFFBEB 0%, #FFEDD5 55%, #FED7AA 100%)'

export default async function Image({ params }: ImageProps) {
  const { slug } = await params
  const restaurant = await getRestaurantBySlug(slug)

  if (!restaurant) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: BG,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              letterSpacing: 8,
              color: '#EA580C',
              fontWeight: 800,
              marginBottom: 28,
            }}
          >
            BUSAN NAON-JIP
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 128,
              fontWeight: 900,
              color: '#1F2937',
            }}
          >
            나온집
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 36,
              color: '#6B7280',
              marginTop: 16,
              fontWeight: 600,
            }}
          >
            부산 방송맛집
          </div>
        </div>
      ),
      { ...size },
    )
  }

  const sourceLabel =
    restaurant.creatorName ?? restaurant.programName ?? restaurant.sourceTitle
  const sourceTag =
    restaurant.sourceType === 'youtube'
      ? 'YOUTUBE'
      : restaurant.sourceType === 'tv'
        ? 'TV'
        : 'SNS'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 72px',
          background: BG,
        }}
      >
        {/* Top row: brand label + source tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              letterSpacing: 6,
              color: '#EA580C',
              fontWeight: 800,
            }}
          >
            BUSAN NAON-JIP
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              fontWeight: 800,
              color: '#FFFFFF',
              background: '#F97316',
              padding: '8px 20px',
              borderRadius: 9999,
              letterSpacing: 2,
            }}
          >
            {sourceTag}
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            maxWidth: 1056,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: '#9CA3AF',
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {restaurant.area} · {restaurant.category}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 88,
              fontWeight: 900,
              color: '#111827',
              marginTop: 10,
              lineHeight: 1.1,
              maxWidth: 1056,
            }}
          >
            {restaurant.name}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 44,
              color: '#EA580C',
              fontWeight: 800,
              marginTop: 18,
            }}
          >
            {restaurant.mainMenu}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 28,
              padding: '16px 22px',
              background: 'rgba(255, 255, 255, 0.55)',
              borderRadius: 16,
              maxWidth: 1020,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                color: '#374151',
                fontWeight: 700,
              }}
            >
              {sourceLabel}
            </div>
            {restaurant.episodeTitle && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 22,
                  color: '#6B7280',
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {restaurant.episodeTitle}
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 24,
            borderTop: '2px solid rgba(249, 115, 22, 0.25)',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: '#1F2937',
              fontWeight: 900,
            }}
          >
            나온집
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: '#6B7280',
              fontWeight: 600,
            }}
          >
            부산 방송맛집
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
