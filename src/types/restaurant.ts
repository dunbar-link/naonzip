export type AreaType =
  | '해운대'
  | '서면'
  | '광안리'
  | '남포동'
  | '기장'
  | '동래'
  | '사상'
  | '영도'
  | '남구'
  | '연제'
  | '기타'

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
