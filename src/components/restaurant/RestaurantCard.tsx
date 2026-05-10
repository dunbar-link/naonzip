'use client'

import Link from 'next/link'
import { Restaurant } from '@/types/restaurant'
import SaveButton from '@/components/restaurant/SaveButton'

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
  const label = getContentLabel(restaurant)
  const badgeColor = getContentBadgeColor(restaurant)
  const dateText = formatBroadcastDate(restaurant.broadcastDate ?? restaurant.appearedAt)

  if (variant === 'horizontal') {
    return (
      <Link href={`/restaurants/${restaurant.slug}`} className="block min-w-[160px] w-40">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm active:scale-95 transition-transform">
          <div className="relative h-28 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
            <span className="text-4xl">{getCategoryEmoji(restaurant.category)}</span>
            <div className="absolute top-2 right-2">
              <SaveButton id={restaurant.id} size="sm" />
            </div>
          </div>
          <div className="p-3">
            <p className="text-xs font-medium text-gray-400 truncate">{restaurant.area}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{restaurant.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{restaurant.mainMenu}</p>
            <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
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
        <div className="w-24 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center flex-shrink-0">
          <span className="text-4xl">{getCategoryEmoji(restaurant.category)}</span>
        </div>
        <div className="p-4 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium">{restaurant.area}</p>
              <p className="font-bold text-gray-900 mt-0.5 truncate">{restaurant.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{restaurant.mainMenu}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <SaveButton id={restaurant.id} size="sm" />
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
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
