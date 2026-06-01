import Link from 'next/link'
import QuickRegisterForm from './QuickRegisterForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function QuickRegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm font-bold text-gray-900">나온집 — 빠른 등록</h1>
          <div className="flex items-center gap-3">
            <Link href="/admin/candidates" className="text-xs text-gray-500 hover:text-gray-900">
              후보 검토 →
            </Link>
            <Link href="/admin/restaurants" className="text-xs text-gray-500 hover:text-gray-900">
              식당 공개 관리 →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-28">
        <p className="mb-4 text-xs text-gray-500">
          방송 맛집 정보를 한 번 붙여넣고 등록까지 진행합니다. 등록은 비공개로 저장되며,
          공개는 등록 후 같은 화면에서 직접 진행해요.
        </p>
        <QuickRegisterForm />
      </main>
    </div>
  )
}
