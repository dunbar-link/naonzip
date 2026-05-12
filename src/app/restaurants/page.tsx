import { getRestaurants } from '@/lib/restaurants'
import RestaurantsClient from '@/components/restaurant/RestaurantsClient'

export const revalidate = 3600

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants()
  return <RestaurantsClient restaurants={restaurants} />
}
