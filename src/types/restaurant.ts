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

export type SourceType = 'youtube' | 'tv' | 'sns'

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
}
