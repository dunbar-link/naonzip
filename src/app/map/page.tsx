import { getRestaurants } from '@/lib/restaurants'
import KakaoMapView from '@/components/map/KakaoMapView'

export const revalidate = 3600

export default async function MapPage() {
  const restaurants = await getRestaurants()
  return (
    <main className="pt-14">
      <KakaoMapView restaurants={restaurants} />
    </main>
  )
}
