import { getRestaurants } from '@/lib/restaurants'
import { SavedClient } from '@/components/saved/SavedClient'

export const revalidate = 3600

export default async function SavedPage() {
  const restaurants = await getRestaurants()
  return <SavedClient restaurants={restaurants} />
}
