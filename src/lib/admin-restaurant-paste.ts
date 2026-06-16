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
 * 라벨 정규화: 앞뒤·내부 공백 제거 + 소문자.
 *   - "영상 URL" / "영상URL" / "video url" / "video_url" 을 모두 같은 키로 취급.
 *   - 한글은 toLowerCase 영향 없음.
 */
function normalizeLabel(s: string): string {
  return s.replace(/\s+/g, '').toLowerCase()
}

/**
 * 정규화된 라벨 → 필드 매핑. (키는 모두 normalizeLabel 결과 형태: 공백없음·소문자)
 *   - 한글 라벨 + 영문 snake_case + 공백/언더스코어 변형 alias 지원.
 */
const FIELD_ALIASES: Record<string, PasteField> = {
  // slug
  slug: 'slug',
  슬러그: 'slug',
  // name
  식당명: 'name',
  상호: 'name',
  이름: 'name',
  name: 'name',
  restaurant_name: 'name',
  // area
  지역: 'area',
  area: 'area',
  // category
  카테고리: 'category',
  category: 'category',
  // address
  주소: 'address',
  address: 'address',
  // lat
  위도: 'lat',
  lat: 'lat',
  latitude: 'lat',
  // lng
  경도: 'lng',
  lng: 'lng',
  longitude: 'lng',
  // main_menu (대표 메뉴 → 대표메뉴 로 정규화됨)
  대표메뉴: 'main_menu',
  main_menu: 'main_menu',
  menu: 'main_menu',
  // price_text (가격정보/가격 정보 → 가격정보 로 정규화됨)
  가격대: 'price_text',
  가격: 'price_text',
  가격정보: 'price_text',
  price_text: 'price_text',
  price: 'price_text',
  // source_type
  소스유형: 'source_type',
  출처유형: 'source_type',
  source_type: 'source_type',
  // source_title (출처명/방송명/소스명/소스/출처/source_name)
  출처명: 'source_title',
  방송명: 'source_title',
  소스명: 'source_title',
  소스: 'source_title',
  출처: 'source_title',
  source_title: 'source_title',
  source_name: 'source_title',
  // program_name
  프로그램명: 'program_name',
  프로그램: 'program_name',
  program_name: 'program_name',
  // creator_name
  크리에이터명: 'creator_name',
  크리에이터: 'creator_name',
  creator_name: 'creator_name',
  // episode_title
  에피소드: 'episode_title',
  episode: 'episode_title',
  episode_title: 'episode_title',
  // broadcast_date (방영일/방송일/date)
  방영일: 'broadcast_date',
  방송일: 'broadcast_date',
  broadcast_date: 'broadcast_date',
  date: 'broadcast_date',
  // phone
  전화: 'phone',
  전화번호: 'phone',
  phone: 'phone',
  // thumbnail (썸네일 URL → 썸네일url)
  썸네일: 'thumbnail',
  썸네일url: 'thumbnail',
  thumbnail: 'thumbnail',
  // video_url (영상 URL/비디오 URL/video url)
  영상url: 'video_url',
  비디오url: 'video_url',
  video_url: 'video_url',
  videourl: 'video_url',
  // kakao_map_url (카카오맵 URL/kakao url)
  카카오맵url: 'kakao_map_url',
  kakao_map_url: 'kakao_map_url',
  kakaourl: 'kakao_map_url',
  // naver_map_url (네이버맵 URL/naver url)
  네이버맵url: 'naver_map_url',
  naver_map_url: 'naver_map_url',
  naverurl: 'naver_map_url',
  // tmap_url (티맵 URL/tmap url)
  티맵url: 'tmap_url',
  tmap_url: 'tmap_url',
  tmapurl: 'tmap_url',
  // description (한줄소개/한 줄 소개/소개 → 한줄소개/소개 로 정규화됨)
  설명: 'description',
  한줄소개: 'description',
  소개: 'description',
  description: 'description',
  desc: 'description',
}

/** input type="date" 가 받는 완전한 날짜(YYYY-MM-DD)인지 검사. (월 01-12, 일 01-31) */
const FULL_DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

// URL 자동 분류용 패턴. 라벨이 없거나 멀티라인으로 URL 만 있을 때 적절한 필드로 보낸다.
const URL_RE = /https?:\/\/[^\s]+/gi
const KAKAO_URL_RE = /(map\.kakao\.com|place\.map\.kakao\.com|kko\.to)/i
const NAVER_MAP_URL_RE = /(map\.naver\.com|naver\.me)/i
const TMAP_URL_RE = /tmap/i
const VIDEO_URL_RE = /(youtube\.com|youtu\.be|tv\.naver\.com|sbs\.co\.kr|programs\.|\/vod\/)/i

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
    const rawKey = line.slice(0, idx)
    const value = line.slice(idx + 1).trim()
    if (value === '') continue

    const field = FIELD_ALIASES[normalizeLabel(rawKey)]
    if (!field) continue

    if (field === 'area') {
      if (isAreaValue(value)) fields.area = value
      else ignored.push(`지역 “${value}”은(는) 허용 목록에 없어 무시했어요.`)
    } else if (field === 'source_type') {
      if (isSourceTypeValue(value)) fields.source_type = value
      else ignored.push(`소스유형 “${value}”은(는) youtube/tv/sns/guide 가 아니어서 무시했어요.`)
    } else if (field === 'broadcast_date') {
      // 방영일은 input type="date" 가 받는 완전한 날짜만 채운다.
      // YYYY 나 YYYY-MM 같은 부분 날짜는 임의로 01 을 붙이지 않고 비워둔 뒤 안내한다.
      if (FULL_DATE_RE.test(value)) fields.broadcast_date = value
      else
        ignored.push(
          `방영일 “${value}”은(는) 정확한 날짜(YYYY-MM-DD)가 아니어서 비웠어요. 방영일을 직접 입력해 주세요.`
        )
    } else {
      fields[field] = value
    }
  }

  // URL 자동 감지 fallback — 라벨 누락/멀티라인 대응.
  //   본문의 http(s) URL 들을 종류별로 분류해 비어있는 URL 필드를 보완한다.
  //   라벨로 이미 채워진 필드는 덮어쓰지 않는다.
  const urls = text.match(URL_RE) ?? []
  if (urls.length > 0) {
    if (!fields.kakao_map_url) {
      const u = urls.find((x) => KAKAO_URL_RE.test(x))
      if (u) fields.kakao_map_url = u
    }
    if (!fields.naver_map_url) {
      const u = urls.find((x) => NAVER_MAP_URL_RE.test(x))
      if (u) fields.naver_map_url = u
    }
    if (!fields.tmap_url) {
      const u = urls.find((x) => TMAP_URL_RE.test(x))
      if (u) fields.tmap_url = u
    }
    if (!fields.video_url) {
      // 영상성 URL 우선, 없으면 지도/티맵으로 분류되지 않은 첫 URL.
      const isMapLike = (x: string) =>
        KAKAO_URL_RE.test(x) || NAVER_MAP_URL_RE.test(x) || TMAP_URL_RE.test(x)
      const u =
        urls.find((x) => VIDEO_URL_RE.test(x)) ?? urls.find((x) => !isMapLike(x))
      if (u) fields.video_url = u
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
  '방영일: 2026-05-04',
  '전화: 0507-1396-4117',
  '영상 URL: https://...',
  '카카오맵 URL: https://map.kakao.com/...',
  '설명: 전현무계획3 부산 편에 나온 중앙동 양수백 맛집.',
].join('\n')
