import { Suspense } from 'react'
import { getRestaurants } from '@/lib/restaurants'
import SearchClient from '@/components/search/SearchClient'

export const revalidate = 3600

export default async function SearchPage() {
  const restaurants = await getRestaurants()
  return (
    <Suspense fallback={
      <main className="pt-14 pb-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </main>
    }>
      <SearchClient restaurants={restaurants} />
    </Suspense>
  )
}
