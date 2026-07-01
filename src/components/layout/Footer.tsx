'use client'

import { usePathname } from 'next/navigation'

// 전역 푸터 — 문의 창구(mailto)와 정보 수정 제보 안내를 노출한다.
// Header/BottomNav 와 동일하게 admin 화면에서는 숨긴다.
export default function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) {
    return null
  }

  // pb-24: 하단 고정 BottomNav(h-16)와 겹치지 않도록 여백 확보.
  return (
    <footer className="border-t border-gray-100 bg-white px-5 pt-6 pb-24">
      <div className="mx-auto max-w-[430px] text-center">
        <p className="text-sm font-bold text-gray-800">나온집</p>
        <p className="mt-1 text-xs text-gray-400">방송·유튜브에 나온 부산 맛집 아카이브</p>

        <div className="mt-4 flex flex-col items-center gap-1.5">
          <a
            href="mailto:duria2002@gmail.com"
            className="text-sm font-semibold text-orange-600 underline underline-offset-2 hover:text-orange-700"
          >
            제휴·제보·문의: duria2002@gmail.com
          </a>
          <p className="text-[11px] leading-relaxed text-gray-400">
            방송 출처 제보 · 콘텐츠 협업 · 광고/제휴 · 기타 운영 문의를 받습니다
          </p>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
          식당 정보 오류는 각 맛집 상세페이지의{' '}
          <span className="font-medium text-gray-500">‘정보 수정 제보’</span>를 이용해 주세요
        </p>

        <p className="mt-4 text-[10px] text-gray-300">© 2026 나온집</p>
      </div>
    </footer>
  )
}
