import type { Restaurant } from '@/types/restaurant'
import type { ContentSource } from '@/lib/content-discovery'
import { getContentGroups } from '@/lib/content-discovery'
import RestaurantCard from '@/components/restaurant/RestaurantCard'

type Props = {
  restaurants: Restaurant[]
  slug: string
  kind: ContentSource['kind']
}

export default function ContentPlaceGroups({ restaurants, slug, kind }: Props) {
  const groups = getContentGroups(restaurants, slug, kind)

  if (groups.length === 0) return null

  return (
    <section className="px-4 pt-5 pb-2">
      <h2 className="text-sm font-bold text-gray-900 mb-1">어디서 봤는지 따라보기</h2>
      <p className="text-xs text-gray-500 mb-4">회차·영상 정보가 있는 출연 기록부터 묶어 보여드려요.</p>
      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.key} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{group.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">소개된 식당 {group.restaurants.length}곳</p>
                </div>
                {group.sourceUrl ? (
                  <a
                    href={group.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs font-semibold text-orange-600 underline underline-offset-2"
                  >
                    출처 보기
                  </a>
                ) : (
                  <span className="shrink-0 text-xs text-gray-400">출처 링크 미등록</span>
                )}
              </div>
            </div>
            <div className="p-3 flex flex-col gap-3">
              {group.restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} variant="vertical" />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
