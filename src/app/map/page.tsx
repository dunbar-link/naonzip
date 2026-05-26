import { getRestaurants } from '@/lib/restaurants'
import KakaoMapView from '@/components/map/KakaoMapView'
import RestaurantCard from '@/components/restaurant/RestaurantCard'

export const revalidate = 3600

export default async function MapPage() {
  const restaurants = await getRestaurants()
  return (
    <main className="pt-14 pb-24">
      <KakaoMapView restaurants={restaurants} />

      <div className="h-2 bg-gray-50" />

      {/* 방송맛집 리스트 — discovery 강화: 지도 아래 콘텐츠 즉시 노출 */}
      <section className="px-4 pt-5 pb-2">
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          방송맛집 {restaurants.length}곳
        </h2>
        <div className="flex flex-col gap-3">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
          ))}
        </div>
      </section>
    </main>
  )
}
