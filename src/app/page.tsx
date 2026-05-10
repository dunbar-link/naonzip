import { mockRestaurants } from '@/data/mock-restaurants'
import HomeClient from '@/components/home/HomeClient'

export default function HomePage() {
  const published = mockRestaurants.filter((r) => r.isPublished)
  return <HomeClient restaurants={published} />
}
