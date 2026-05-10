import { Suspense } from 'react'
import SearchClient from '@/components/search/SearchClient'

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="pt-14 pb-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </main>
    }>
      <SearchClient />
    </Suspense>
  )
}
