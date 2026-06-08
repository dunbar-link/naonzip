'use client'

import { useState } from 'react'

type MapInfo = {
  name: string
  address: string
  lat: number
  lng: number
  kakaoMapUrl?: string
  naverMapUrl?: string
  tmapUrl?: string
}

type ShareInfo = {
  name: string
  mainMenu: string
  address: string
  pageUrl: string
}

type Props = {
  mapInfo: MapInfo
  shareInfo: ShareInfo
  phone?: string
}

function buildKakaoUrl(info: MapInfo): string {
  if (info.kakaoMapUrl) return info.kakaoMapUrl
  return `https://map.kakao.com/link/map/${encodeURIComponent(info.name)},${info.lat},${info.lng}`
}

function buildNaverUrl(info: MapInfo): string {
  if (info.naverMapUrl) return info.naverMapUrl
  const query = encodeURIComponent(`${info.name} ${info.address}`)
  return `https://map.naver.com/v5/search/${query}`
}

function buildTmapUrl(info: MapInfo): string | null {
  // 데이터에 들어온 tmap 링크 사용 (단, SK OpenAPI 서버 URL은 인증키 필요 → 사용 금지)
  if (info.tmapUrl && !/openapi\.sk\.com/i.test(info.tmapUrl)) {
    return info.tmapUrl
  }
  const lat = Number(info.lat)
  const lng = Number(info.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat === 0 && lng === 0) return null
  const name = encodeURIComponent(info.name)
  // T맵 앱 URL scheme — goalx=경도(lng), goaly=위도(lat)
  return `tmap://route?goalname=${name}&goalx=${lng}&goaly=${lat}`
}

function buildShareText(info: ShareInfo): string {
  return `부산 방송 나온집 찾았어.\n여기 어때?\n\n${info.name}\n${info.mainMenu}\n${info.address}\n\n나온집에서 보기:\n${info.pageUrl}`
}

export default function ShareButtons({ mapInfo, shareInfo, phone }: Props) {
  const [copyDone, setCopyDone] = useState(false)
  const tmapHref = buildTmapUrl(mapInfo)

  async function handleShare() {
    const text = buildShareText(shareInfo)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${shareInfo.name} - 나온집`,
          text,
          url: shareInfo.pageUrl,
        })
      } catch {
        // 사용자가 취소하면 아무것도 하지 않음
      }
      return
    }
    // Web Share API 미지원 → 클립보드 복사 fallback
    try {
      await navigator.clipboard.writeText(text)
      setCopyDone(true)
      setTimeout(() => setCopyDone(false), 2000)
    } catch {
      // 클립보드도 막힌 경우 (iOS 구형 등) prompt로 대체
      window.prompt('아래 내용을 복사하세요', text)
    }
  }

  return (
    <section className="px-4 py-4 bg-white">
      {/* 길찾기 — 지도 앱 */}
      <div className="grid grid-cols-3 gap-2">
        <a
          href={buildKakaoUrl(mapInfo)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-yellow-50 border border-yellow-200 active:scale-95 transition-transform"
        >
          <span className="text-lg">🗺️</span>
          <span className="text-xs font-semibold text-yellow-700">카카오맵</span>
        </a>
        <a
          href={buildNaverUrl(mapInfo)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-green-50 border border-green-200 active:scale-95 transition-transform"
        >
          <span className="text-lg">🧭</span>
          <span className="text-xs font-semibold text-green-700">네이버지도</span>
        </a>
        {tmapHref ? (
          <a
            href={tmapHref}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-blue-50 border border-blue-200 active:scale-95 transition-transform"
          >
            <span className="text-lg">📍</span>
            <span className="text-xs font-semibold text-blue-700">티맵</span>
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gray-50 border border-gray-200 opacity-50 cursor-not-allowed"
          >
            <span className="text-lg">📍</span>
            <span className="text-xs font-semibold text-gray-500">티맵</span>
          </span>
        )}
      </div>

      {/* 전화 · 공유 */}
      <div className={`grid gap-2 mt-2 ${phone ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 border border-blue-200 active:scale-95 transition-transform"
          >
            <span className="text-base">📞</span>
            <span className="text-sm font-bold text-blue-700">전화</span>
          </a>
        )}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 active:bg-orange-600 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span className="text-sm font-bold text-white">
            {copyDone ? '✓ 복사됐어요!' : '공유하기'}
          </span>
        </button>
      </div>

      {copyDone && (
        <p className="text-xs text-center text-gray-400 mt-2">
          공유 문구가 클립보드에 복사됐어요
        </p>
      )}
    </section>
  )
}
