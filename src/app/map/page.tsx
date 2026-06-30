import { getRestaurants } from '@/lib/restaurants'
import KakaoMapView from '@/components/map/KakaoMapView'

export const revalidate = 3600

export default async function MapPage() {
  const restaurants = await getRestaurants()
  return (
    <main className="pt-14 pb-24">
      <KakaoMapView restaurants={restaurants} />

      {/* 지도탭은 지도 중심 — 하단 안내는 얇은 바로 압축(여백 최소화) */}
      <section className="px-4 py-2.5 text-center border-t border-gray-100">
        <p className="text-xs text-gray-500">
          핀을 눌러{' '}
          <span className="font-semibold text-gray-700">부산 맛집 {restaurants.length}곳</span>
          을 확인하세요
        </p>
      </section>
    </main>
  )
}
