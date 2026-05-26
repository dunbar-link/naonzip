'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Restaurant, AreaType } from '@/types/restaurant'

const BUSAN_LAT = 35.1796
const BUSAN_LNG = 129.0756

type Status = 'loading' | 'ready' | 'error' | 'no-key'
type AreaFilter = '전체' | AreaType

const AREA_FILTERS: AreaFilter[] = [
  '전체', '해운대', '서면', '광안리', '남포동', '기장', '동래', '사상', '기타',
]

function getAreaCount(area: AreaFilter, restaurants: Restaurant[]): number {
  if (area === '전체') return restaurants.length
  return restaurants.filter((r) => r.area === area).length
}

function toCoord(value: unknown): number | null {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return null
  if (num === 0) return null
  return num
}

function getAreaCenter(area: AreaFilter, restaurants: Restaurant[]): { lat: number; lng: number; level: number } {
  if (area === '전체' || restaurants.length === 0) {
    return { lat: BUSAN_LAT, lng: BUSAN_LNG, level: 8 }
  }
  const validCoords = restaurants
    .map((r) => ({ lat: toCoord(r.lat), lng: toCoord(r.lng) }))
    .filter((c): c is { lat: number; lng: number } => c.lat !== null && c.lng !== null)
  if (validCoords.length === 0) {
    return { lat: BUSAN_LAT, lng: BUSAN_LNG, level: 8 }
  }
  const lat = validCoords.reduce((s, c) => s + c.lat, 0) / validCoords.length
  const lng = validCoords.reduce((s, c) => s + c.lng, 0) / validCoords.length
  return { lat, lng, level: validCoords.length === 1 ? 4 : 6 }
}

function getContentLabel(r: Restaurant): string {
  return r.creatorName ?? r.programName ?? r.sourceTitle
}

function getContentBadgeColor(sourceType: string): string {
  if (sourceType === 'youtube') return 'bg-red-50 text-red-600'
  if (sourceType === 'tv') return 'bg-blue-50 text-blue-700'
  return 'bg-pink-50 text-pink-600'
}

function formatBroadcastDate(date?: string): string | null {
  if (!date) return null
  const [year, month, day] = date.split('-')
  if (!year || !month) return null
  return day ? `${year}.${month}.${day}` : `${year}.${month}`
}

type MarkerEntry = {
  marker: KakaoMarker
  restaurant: Restaurant
}

type Props = {
  restaurants: Restaurant[]
}

export default function KakaoMapView({ restaurants }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<KakaoMap | null>(null)
  const markersRef = useRef<MarkerEntry[]>([])

  const [status, setStatus] = useState<Status>('loading')
  const [selected, setSelected] = useState<Restaurant | null>(null)
  const [selectedArea, setSelectedArea] = useState<AreaFilter>('전체')

  // 지도 초기화 (1회)
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
    if (!key) {
      setStatus('no-key')
      return
    }

    let mounted = true

    function initMap() {
      if (!mounted || !containerRef.current) return

      const { Map, LatLng, Marker, event } = window.kakao.maps

      const map = new Map(containerRef.current, {
        center: new LatLng(BUSAN_LAT, BUSAN_LNG),
        level: 8,
      })
      mapRef.current = map

      const entries: MarkerEntry[] = []
      restaurants.forEach((restaurant) => {
        const lat = toCoord(restaurant.lat)
        const lng = toCoord(restaurant.lng)
        if (lat === null || lng === null) return
        try {
          const marker = new Marker({
            position: new LatLng(lat, lng),
            map,
            title: restaurant.name,
          })
          event.addListener(marker, 'click', () => {
            if (mounted) setSelected(restaurant)
          })
          entries.push({ marker, restaurant })
        } catch {
          // 단일 마커 생성 실패는 전체 지도 실패로 만들지 않는다
        }
      })
      markersRef.current = entries

      if (mounted) setStatus('ready')
    }

    if (window.kakao?.maps) {
      initMap()
      return () => { mounted = false }
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`
    script.addEventListener('load', () => window.kakao.maps.load(initMap))
    script.addEventListener('error', () => { if (mounted) setStatus('error') })
    document.head.appendChild(script)

    return () => { mounted = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 지역 필터 변경 → 마커 on/off + 지도 이동
  useEffect(() => {
    const map = mapRef.current
    if (!map || status !== 'ready') return

    const { LatLng } = window.kakao.maps

    const filtered: Restaurant[] = []

    markersRef.current.forEach(({ marker, restaurant }) => {
      const visible = selectedArea === '전체' || restaurant.area === selectedArea
      marker.setMap(visible ? map : null)
      if (visible) filtered.push(restaurant)
    })

    const { lat, lng, level } = getAreaCenter(selectedArea, filtered)
    map.setLevel(level)
    map.panTo(new LatLng(lat, lng))

    // 필터 변경 시 선택 카드 닫기
    setSelected(null)
  }, [selectedArea, status])

  const handleAreaSelect = (area: AreaFilter) => {
    setSelectedArea(area)
  }

  return (
    <div className="relative w-full h-[55dvh] min-h-[360px]">
      {/* 카카오맵 컨테이너 */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 지역 필터 탭 (지도 위 오버레이) */}
      {status === 'ready' && (
        <div className="absolute top-3 left-0 right-0 z-10 px-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide bg-white/90 backdrop-blur-sm rounded-2xl shadow-md px-3 py-2 border border-gray-100">
            {AREA_FILTERS.map((area) => {
              const count = getAreaCount(area, restaurants)
              const active = selectedArea === area
              if (count === 0 && area !== '전체') return null
              return (
                <button
                  key={area}
                  onClick={() => handleAreaSelect(area)}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                  }`}
                >
                  {area}
                  <span className={`text-[10px] font-bold ${active ? 'text-orange-100' : 'text-gray-400'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 로딩 오버레이 */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-3">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
        </div>
      )}

      {/* 키 없음 fallback */}
      {status === 'no-key' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 px-8 gap-4">
          <span className="text-5xl">🗺️</span>
          <p className="text-base font-bold text-gray-800 text-center">카카오맵 키를 설정해주세요</p>
          <div className="bg-gray-100 rounded-xl p-4 w-full">
            <p className="text-xs text-gray-500 font-mono leading-relaxed">
              .env.local 파일에<br />
              NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=<br />
              를 추가하면 지도가 표시됩니다
            </p>
          </div>
          <Link href="/restaurants" className="mt-2 px-6 py-3 bg-orange-500 text-white text-sm font-bold rounded-xl">
            목록으로 보기
          </Link>
        </div>
      )}

      {/* 로드 오류 */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 px-8 gap-3">
          <span className="text-5xl">😢</span>
          <p className="text-base font-bold text-gray-800 text-center">지도를 불러오지 못했어요</p>
          <p className="text-sm text-gray-400 text-center">네트워크 연결을 확인하거나<br />잠시 후 다시 시도해주세요</p>
          <Link href="/restaurants" className="mt-2 px-6 py-3 bg-orange-500 text-white text-sm font-bold rounded-xl">
            목록으로 보기
          </Link>
        </div>
      )}

      {/* 선택된 맛집 카드 */}
      {selected && status === 'ready' && (
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">{getCategoryEmoji(selected.category)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400 font-medium">{selected.area}</p>
                    <p className="font-bold text-gray-900 truncate">{selected.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{selected.mainMenu}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <button
                      onClick={() => setSelected(null)}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
                      aria-label="닫기"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getContentBadgeColor(selected.sourceType)}`}>
                      {getContentLabel(selected)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs font-bold text-orange-500">{selected.priceText}</p>
                  {(selected.broadcastDate ?? selected.appearedAt) && (
                    <p className="text-[10px] text-gray-400">
                      {formatBroadcastDate(selected.broadcastDate) ?? selected.appearedAt} 방영
                    </p>
                  )}
                </div>
                {selected.episodeTitle && (
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">&ldquo;{selected.episodeTitle}&rdquo;</p>
                )}
              </div>
            </div>

            <Link
              href={`/restaurants/${selected.slug}`}
              className="flex items-center justify-center gap-1 py-3 bg-orange-500 text-white text-sm font-bold active:bg-orange-600 transition-colors"
            >
              상세 보기 · 길찾기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    '돼지국밥': '🍲',
    '고기': '🥩',
    '해산물': '🦀',
    '밀면': '🍜',
    '회': '🐟',
    '분식/길거리': '🥢',
    '한식': '🍱',
    '버거/양식': '🍔',
    '아시안': '🍜',
    '베이커리/디저트': '🥐',
  }
  return map[category] ?? '🍽️'
}
