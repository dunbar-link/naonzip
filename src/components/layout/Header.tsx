import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14 flex items-center px-4">
      <Link href="/" className="flex items-center gap-1">
        <span className="text-xl font-bold text-orange-500">나온집</span>
        <span className="text-xs text-gray-400 font-medium mt-1">부산 방송맛집</span>
      </Link>
      <div className="ml-auto">
        <Link
          href="/search"
          className="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:bg-gray-50"
          aria-label="검색"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </Link>
      </div>
    </header>
  )
}
