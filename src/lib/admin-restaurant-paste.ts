/**
 * 식당 등록/수정 폼용 "빠른 붙여넣기" 파서.
 *
 * 순수 모듈 — 'use client' 폼에서 import 가능. 외부 API / 서버 의존성 없음.
 * ChatGPT 등이 정리한 "라벨: 값" 줄 블록을 폼 필드 부분 객체로 변환한다.
 *
 * 규칙:
 *   - 줄 단위 파싱, 첫 ":" 기준 split (URL 의 https:// 콜론 보존)
 *   - key/value 모두 trim
 *   - 빈 값은 무시 (기존 입력 값을 지우지 않기 위해 set 하지 않는다)
 *   - 알 수 없는 라벨 무시
 *   - area / source_type 은 허용값일 때만 채우고, 아니면 ignored 로 보고
 */
import { RESTAURANT_SOURCE_TYPES, type RestaurantSourceType } from '@/types/supabase'
import { AREA_TYPES } from '@/types/restaurant'

/** 파서가 채울 수 있는 식당 폼 필드. (ConvertForm / EditForm 공통) */
export type RestaurantPasteFields = {
  slug?: string
  name?: string
  area?: string
  address?: string
  lat?: string
  lng?: string
  category?: string
  main_menu?: string
  price_text?: string
  source_type?: RestaurantSourceType
  source_title?: string
  phone?: string
  thumbnail?: string
  creator_name?: string
  program_name?: string
  episode_title?: string
  broadcast_date?: string
  description?: string
  video_url?: string
  kakao_map_url?: string
  naver_map_url?: string
  tmap_url?: string
}

type PasteField = keyof RestaurantPasteFields

/**
 * 라벨(소문자 정규화) → 필드 매핑.
 *   - 한글 라벨 + 영문 snake_case alias 둘 다 지원.
 *   - 조회 시 key.toLowerCase() 로 찾으므로 영문은 소문자, "URL"→"url" 로 저장.
 *   - 한글은 toLowerCase 영향 없음.
 */
const FIELD_ALIASES: Record<string, PasteField> = {
  slug: 'slug',
  식당명: 'name',
  name: 'name',
  지역: 'area',
  area: 'area',
  카테고리: 'category',
  category: 'category',
  주소: 'address',
  address: 'address',
  위도: 'lat',
  lat: 'lat',
  latitude: 'lat',
  경도: 'lng',
  lng: 'lng',
  longitude: 'lng',
  대표메뉴: 'main_menu',
  '대표 메뉴': 'main_menu',
  main_menu: 'main_menu',
  가격대: 'price_text',
  price_text: 'price_text',
  소스유형: 'source_type',
  source_type: 'source_type',
  출처명: 'source_title',
  source_title: 'source_title',
  크리에이터명: 'creator_name',
  creator_name: 'creator_name',
  프로그램명: 'program_name',
  program_name: 'program_name',
  에피소드: 'episode_title',
  episode: 'episode_title',
  방영일: 'broadcast_date',
  broadcast_date: 'broadcast_date',
  전화: 'phone',
  phone: 'phone',
  썸네일: 'thumbnail',
  thumbnail: 'thumbnail',
  영상url: 'video_url',
  video_url: 'video_url',
  카카오맵url: 'kakao_map_url',
  kakao_map_url: 'kakao_map_url',
  네이버맵url: 'naver_map_url',
  naver_map_url: 'naver_map_url',
  티맵url: 'tmap_url',
  tmap_url: 'tmap_url',
  설명: 'description',
  description: 'description',
}

function isAreaValue(v: string): boolean {
  return (AREA_TYPES as readonly string[]).includes(v)
}

function isSourceTypeValue(v: string): v is RestaurantSourceType {
  return (RESTAURANT_SOURCE_TYPES as readonly string[]).includes(v)
}

/**
 * 붙여넣은 텍스트를 폼 필드 부분 객체 + 무시된 항목 안내로 변환.
 *   - fields: setForm 으로 병합할 채워진 필드만 (빈 값/미인식 라벨 제외)
 *   - ignored: 허용값이 아니어서 적용하지 않은 area/source_type 안내 문구
 */
export function parseRestaurantPaste(text: string): {
  fields: RestaurantPasteFields
  ignored: string[]
} {
  const fields: RestaurantPasteFields = {}
  const ignored: string[] = []

  for (const line of text.split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const rawKey = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (value === '') continue

    const field = FIELD_ALIASES[rawKey.toLowerCase()]
    if (!field) continue

    if (field === 'area') {
      if (isAreaValue(value)) fields.area = value
      else ignored.push(`지역 “${value}”은(는) 허용 목록에 없어 무시했어요.`)
    } else if (field === 'source_type') {
      if (isSourceTypeValue(value)) fields.source_type = value
      else ignored.push(`소스유형 “${value}”은(는) youtube/tv/sns 가 아니어서 무시했어요.`)
    } else {
      fields[field] = value
    }
  }

  return { fields, ignored }
}

/** 두 폼이 공유하는 붙여넣기 placeholder 예시. */
export const RESTAURANT_PASTE_PLACEHOLDER = [
  'slug: jungang-gomtang',
  '식당명: 중앙곰탕',
  '지역: 기타',
  '카테고리: 한식',
  '주소: 부산 중구 충장대로9번길 9',
  '위도: 35.1074',
  '경도: 129.0374',
  '대표메뉴: 양수백',
  '가격대: 1만원대',
  '소스유형: tv',
  '출처명: 전현무계획3',
  '프로그램명: 전현무계획3',
  '에피소드: 부산 편 양수백 맛집',
  '전화: 0507-1396-4117',
  '카카오맵URL: http://kko.to/...',
  '네이버맵URL: https://naver.me/...',
  '설명: 전현무계획3 부산 편에 나온 중앙동 양수백 맛집.',
].join('\n')
