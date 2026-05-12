import { getRestaurants } from '@/lib/restaurants'
import HomeClient from '@/components/home/HomeClient'

export const revalidate = 3600

export default async function HomePage() {
  const restaurants = await getRestaurants()
  return <HomeClient restaurants={restaurants} />
}
