'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Restaurant } from '@/types/restaurant'
import SaveButton from '@/components/restaurant/SaveButton'
import RestaurantImage from '@/components/restaurant/RestaurantImage'
import { getProgramSlugFromName } from '@/lib/programs'
import { getAreaSlugFromName } from '@/lib/areas'

function getContentLabel(r: Restaurant): string {
  return r.creatorName ?? r.programName ?? r.sourceTitle
}

function getContentBadgeColor(r: Restaurant): string {
  if (r.sourceType === 'youtube') return 'bg-red-50 text-red-600'
  if (r.sourceType === 'tv') return 'bg-blue-50 text-blue-700'
  return 'bg-pink-50 text-pink-600'
}

function formatBroadcastDate(date?: string): string | null {
  if (!date) return null
  const [year, month, day] = date.split('-')
  if (!year || !month) return null
  return day ? `${year}.${month}.${day}` : `${year}.${month}`
}

type Props = {
  restaurant: Restaurant
  variant?: 'horizontal' | 'vertical'
}

export default function RestaurantCard({ restaurant, variant = 'vertical' }: Props) {
  const router = useRouter()
  const label = getContentLabel(restaurant)
  const badgeColor = getContentBadgeColor(restaurant)
  const dateText = formatBroadcastDate(restaurant.broadcastDate ?? restaurant.appearedAt)
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

  if (variant === 'horizontal') {
    return (
      <Link href={`/restaurants/${restaurant.slug}`} className="block shrink-0 min-w-[160px] w-40">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm active:scale-95 transition-transform">
          <div className="relative h-28">
            <RestaurantImage
              thumbnail={restaurant.thumbnail}
              category={restaurant.category}
              alt={restaurant.name}
              className="h-28 w-full"
              emojiClassName="text-4xl"
            />
            <div className="absolute top-2 right-2 z-10">
              <SaveButton id={restaurant.id} size="sm" />
            </div>
          </div>
          <div className="p-3">
            <p
              className={`text-xs font-medium text-gray-400 truncate${areaHref ? ' cursor-pointer hover:text-gray-600' : ''}`}
              onClick={areaHref ? (e) => { e.stopPropagation(); router.push(areaHref) } : undefined}
            >
              {restaurant.area}
            </p>
            <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{restaurant.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{restaurant.mainMenu}</p>
            <span
              className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}${programHref ? ' cursor-pointer hover:opacity-75' : ''}`}
              onClick={programHref ? (e) => { e.stopPropagation(); router.push(programHref) } : undefined}
            >
              {label}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/restaurants/${restaurant.slug}`} className="block">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm active:scale-[0.98] transition-transform flex">
        <RestaurantImage
          thumbnail={restaurant.thumbnail}
          category={restaurant.category}
          alt={restaurant.name}
          className="w-24 flex-shrink-0"
          emojiClassName="text-4xl"
        />
        <div className="p-4 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className={`text-xs text-gray-400 font-medium${areaHref ? ' cursor-pointer hover:text-gray-600' : ''}`}
                onClick={areaHref ? (e) => { e.stopPropagation(); router.push(areaHref) } : undefined}
              >
                {restaurant.area}
              </p>
              <p className="font-bold text-gray-900 mt-0.5 truncate">{restaurant.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{restaurant.mainMenu}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <SaveButton id={restaurant.id} size="sm" />
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}${programHref ? ' cursor-pointer hover:opacity-75' : ''}`}
                onClick={programHref ? (e) => { e.stopPropagation(); router.push(programHref) } : undefined}
              >
                {label}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-orange-500 font-semibold">{restaurant.priceText}</p>
            {dateText && (
              <p className="text-[10px] text-gray-400 flex-shrink-0">{dateText} 방영</p>
            )}
          </div>
          {restaurant.episodeTitle && (
            <p className="text-xs text-gray-400 mt-1 truncate">&ldquo;{restaurant.episodeTitle}&rdquo;</p>
          )}
        </div>
      </div>
    </Link>
  )
}
