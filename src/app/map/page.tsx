import { getRestaurants } from '@/lib/restaurants'
import KakaoMapView from '@/components/map/KakaoMapView'

export const revalidate = 3600

export default async function MapPage() {
  const restaurants = await getRestaurants()
  return (
    <main className="pt-14 pb-24">
      <KakaoMapView restaurants={restaurants} />

      {/* 지도탭은 지도 중심 — 하단 반복 목록은 제거하고 요약 안내만 유지 */}
      <section className="px-4 py-4 text-center">
        <p className="text-sm text-gray-500">
          지도 위 핀을 눌러{' '}
          <span className="font-bold text-gray-900">부산 맛집 {restaurants.length}곳</span>
          을 확인하세요
        </p>
      </section>
    </main>
  )
}
