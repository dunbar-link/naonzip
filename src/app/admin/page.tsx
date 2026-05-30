import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const LINKS: { href: string; label: string; desc: string }[] = [
  { href: '/admin/candidates', label: '후보 관리', desc: '수집 후보 검토 / 승인' },
  { href: '/admin/restaurants', label: '식당 공개 관리', desc: '비공개 식당 공개 전환' },
  { href: '/admin/reports', label: '신고 관리', desc: '사용자 신고 처리' },
  { href: '/admin/login', label: '로그인', desc: '관리자 세션 재로그인' },
]

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <h1 className="text-sm font-bold text-gray-900">나온집 — 관리자</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <h2 className="text-lg font-bold text-gray-900">나온집 관리자</h2>
        <p className="mt-1 text-sm text-gray-600">
          데이터 후보, 비공개 식당, 신고 관리를 할 수 있어요.
        </p>

        <nav className="mt-6 flex flex-col gap-3">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-gray-400"
            >
              <span className="block text-sm font-medium text-gray-900">{link.label}</span>
              <span className="mt-0.5 block text-xs text-gray-500">{link.desc}</span>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  )
}
