/**
 * 프로그램(방송/유튜브 채널) 메타 — 한국어 표시명 ↔ 영어 slug 매핑
 *
 * 운영 DB에 입력되는 source_title / program_name / creator_name 값은
 * 한국어 raw 문자열이라 URL slug에 그대로 쓰기 어렵다. 또한 같은 프로그램이
 * "생활의달인" / "생활의 달인" 처럼 표기 흔들림으로 들어올 수 있다.
 *
 * - normalizeProgramName: trim / lowercase / NFC / 공백 제거
 * - PROGRAM_SLUGS: 정규화된 한국어 이름 → 영어 slug
 * - PROGRAM_NAMES: 영어 slug → 대표 한국어 표시명
 *
 * 이 파일은 서버/클라이언트 양쪽에서 안전하게 import 가능하다.
 * 외부 의존성 없음.
 */

// ─────────────────────────────────────────────
// 정규화 함수
// ─────────────────────────────────────────────

export function normalizeProgramName(name: string): string {
  return name.trim().toLowerCase().normalize('NFC').replace(/\s+/g, '')
}

// ─────────────────────────────────────────────
// 매핑 — 한국어 raw 이름 → 영어 slug
//   같은 slug에 다양한 alias를 허용 (표기 흔들림 흡수)
// ─────────────────────────────────────────────

const RAW_PROGRAM_SLUGS: Record<string, string> = {
  // 생활의 달인 (SBS)
  '생활의달인': 'lifemaster',
  '생활의 달인': 'lifemaster',

  // 식객 허영만의 백반기행 (TV조선)
  '식객 허영만의 백반기행': 'baekban-gihaeng',
  '식객허영만의 백반기행': 'baekban-gihaeng',
  '백반기행': 'baekban-gihaeng',

  // 쯔양 (유튜브)
  '쯔양': 'tzuyang',
  'tzuyang쯔양': 'tzuyang',

  // 성시경 먹을텐데 (유튜브)
  '성시경의 먹을텐데': 'sungsik',
  '성시경 먹을텐데': 'sungsik',
  '먹을텐데': 'sungsik',
  '성시경': 'sungsik',

  // 풍자 또간집 (유튜브)
  '또간집': 'ddoganjip',
  '풍자 또간집': 'ddoganjip',
  '풍자': 'ddoganjip',

  // 전현무계획 (예능)
  '전현무계획': 'jeonhyun-plan',

  // 히밥 (유튜브)
  '히밥': 'hibab',

  // 맛있는 녀석들 (코미디TV)
  '맛있는녀석들': 'tasty-guys',
  '맛있는 녀석들': 'tasty-guys',

  // 백종원의 3대 천왕 / 삼대천왕 (SBS)
  '백종원의 3대 천왕': 'samdae-cheonwang',
  '백종원의 3대천왕': 'samdae-cheonwang',
  '삼대천왕': 'samdae-cheonwang',
  '3대천왕': 'samdae-cheonwang',

  // 생방송 투데이 (SBS)
  '생방송투데이': 'live-today',
  '생방송 투데이': 'live-today',

  // 2TV 생생정보 / 생생정보통 (KBS)
  '2TV 생생정보': 'live-info',
  '2tv 생생정보': 'live-info',
  '생생정보통': 'live-info',
  '생생정보': 'live-info',

  // 한국인의 밥상 (KBS)
  '한국인의 밥상': 'korean-table',

  // 빠니보틀 (유튜브)
  '빠니보틀': 'pani-bottle',

  // 푸디랜드 FoodieLand (유튜브)
  '푸디랜드 FoodieLand': 'foodieland',
  '푸디랜드': 'foodieland',
  'FoodieLand': 'foodieland',
  'foodieland': 'foodieland',

  // 6시 내고향 (KBS)
  '6시내고향': 'six-oclock-hometown',
  '6시 내고향': 'six-oclock-hometown',

  // 수요미식회 (tvN)
  '수요미식회': 'wednesday-food-talk',

  // 미친맛집: 미식가 친구의 맛집 (넷플릭스 — 성시경·마츠시게 유타카)
  '미친맛집': 'michinmatjip',
  '미친맛집 미식가 친구의 맛집': 'michinmatjip',
  '미친맛집: 미식가 친구의 맛집': 'michinmatjip',
}

// 정규화된 키 형태로 변환해 두면 lookup이 빠르고 표기 흔들림에 강함
export const PROGRAM_SLUGS: Record<string, string> = Object.fromEntries(
  Object.entries(RAW_PROGRAM_SLUGS).map(([k, v]) => [normalizeProgramName(k), v]),
)

// ─────────────────────────────────────────────
// 매핑 — 영어 slug → 대표 한국어 표시명
//   사용자에게 보여지는 이름이므로 가장 자연스러운 단일 표기 선택
// ─────────────────────────────────────────────

export const PROGRAM_NAMES: Record<string, string> = {
  'lifemaster': '생활의달인',
  'baekban-gihaeng': '식객 허영만의 백반기행',
  'tzuyang': '쯔양',
  'sungsik': '성시경 먹을텐데',
  'ddoganjip': '풍자 또간집',
  'jeonhyun-plan': '전현무계획',
  'hibab': '히밥',
  'tasty-guys': '맛있는 녀석들',
  'samdae-cheonwang': '백종원의 3대 천왕',
  'live-today': '생방송 투데이',
  'live-info': '2TV 생생정보',
  'korean-table': '한국인의 밥상',
  'pani-bottle': '빠니보틀',
  'foodieland': '푸디랜드 FoodieLand',
  'six-oclock-hometown': '6시 내고향',
  'wednesday-food-talk': '수요미식회',
  'michinmatjip': '미친맛집',
}

// ─────────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────────

/**
 * 임의의 source_title / program_name / creator_name 값에서 안전하게 slug 반환.
 * 정규화 후 매핑에 없으면 null.
 */
export function getProgramSlugFromName(
  name: string | null | undefined,
): string | null {
  if (!name) return null
  const key = normalizeProgramName(name)
  if (!key) return null
  return PROGRAM_SLUGS[key] ?? null
}

/**
 * slug에서 대표 한국어 표시명 반환. 매핑에 없으면 null.
 */
export function getProgramNameFromSlug(slug: string): string | null {
  return PROGRAM_NAMES[slug] ?? null
}
