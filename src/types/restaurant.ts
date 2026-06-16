import type { TrustSourceKind } from '@/types/supabase'

/**
 * 부산 지역 enum 값 목록 (런타임 배열).
 * select 옵션 / 서버 검증에서 공유한다.
 * AreaType 은 이 배열의 멤버 union 으로 파생된다.
 */
export const AREA_TYPES = [
  '해운대',
  '서면',
  '광안리',
  '남포동',
  '기장',
  '동래',
  '사상',
  '영도',
  '남구',
  '연제',
  '기타',
] as const

export type AreaType = (typeof AREA_TYPES)[number]

export type SourceType = 'youtube' | 'tv' | 'sns' | 'guide'

/**
 * 방송 출연 기록 (restaurant_appearances 1행 ↔ 앱 타입).
 * 한 식당이 여러 방송/유튜브에 나올 수 있어 Restaurant.appearances[] 로 묶는다.
 * 대표 방송(최신)은 restaurants.ts 어댑터가 골라 기존 Restaurant 방송 필드에 반영한다.
 */
export type Appearance = {
  id: string
  restaurantId: string
  sourceType: SourceType
  sourceTitle: string
  programName?: string
  creatorName?: string
  episodeTitle?: string
  broadcastDate?: string
  videoUrl?: string
  candidateId?: string
  note?: string
  createdAt: string
}

/**
 * 신뢰 출처 (restaurant_trust_sources 1행 ↔ 앱 타입). [TRUST-H3]
 * 운영자가 확인한 "어디서 봤는지" 출처. 기존 appearances(방송/유튜브)를 보완한다.
 * (블루리본 등 가이드 / 로컬추천 / 예약인기 / 블로그 / 운영자확인 등)
 *
 * ⚠ 이 단계에선 read 경로에서 채워지지 않는다(migration 미적용 → trustSources 는 undefined).
 *    resolveSourceBadges 는 비어 있으면 무시하므로 기존 출처 칩 동작은 그대로 유지된다.
 */
export type TrustSource = {
  id: string
  restaurantId: string
  sourceKind: TrustSourceKind
  sourceName: string
  sourceUrl?: string
  sourceTitle?: string
  sourceNote?: string
  /** 화면 표시용 짧은 라벨 (예: '가이드 수록', '로컬 추천', '운영자 확인') */
  trustLabel?: string
  verifiedAt?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export type Restaurant = {
  id: string
  slug: string
  name: string
  area: AreaType
  address: string
  lat: number
  lng: number
  category: string
  mainMenu: string
  priceText: string
  phone?: string
  kakaoMapUrl?: string
  naverMapUrl?: string
  tmapUrl?: string
  sourceType: SourceType
  sourceTitle: string
  creatorName?: string
  programName?: string
  episodeTitle?: string
  broadcastDate?: string
  videoUrl?: string
  appearedAt?: string
  description?: string
  thumbnail?: string
  isPublished: boolean
  // 방송 출연 기록(최신순). 대표 방송은 위 sourceType/.../broadcastDate 필드에 반영됨.
  // Step 1: 읽기만 추가. 기존 필드는 그대로 유지(dual-write).
  appearances?: Appearance[]
  // 신뢰 출처(운영자 확인). [TRUST-H3] 현재 단계에선 채워지지 않음(undefined).
  // resolveSourceBadges 가 있으면 칩으로 덧붙이고, 없으면 기존 appearances 만 표시.
  trustSources?: TrustSource[]
}
