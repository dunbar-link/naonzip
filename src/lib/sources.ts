/**
 * 출처(source) 배지 resolver — "어디서 봤는지"를 한눈에 보여주는 칩 목록을 만든다.
 *
 * 설계 원칙
 *  - 기본 배지는 기존 데이터(restaurant.appearances / 방송 필드)에서 파생한다.
 *  - [TRUST-H3] 운영자가 확인한 신뢰 출처(restaurant.trustSources, 공개분)가 있으면
 *    기존 칩 뒤에 덧붙인다. trustSources 가 비어 있으면(현재 기본 상태) 아무 변화 없음.
 *  - 블루리본·로컬추천·인기예약·파워블로거 등은 실제 데이터가 들어오기 전까지 표시되지 않는다.
 *  - DB schema 를 바꾸지 않는다. 알려진 프로그램명은 programs.ts 의 정규 표기로 보정한다.
 *
 * 이 파일은 서버/클라이언트 양쪽에서 import 가능하다. (외부 의존성 없음)
 */

import type { Restaurant, SourceType, TrustSource } from '@/types/restaurant'
import { getProgramSlugFromName, getProgramNameFromSlug } from '@/lib/programs'

// 방송/유튜브 tone + 신뢰 출처(trustSources)용 tone.
export type SourceTone =
  | 'tv'
  | 'youtube'
  | 'sns'
  | 'guide' // 가이드북(블루리본 등)
  | 'local' // 로컬 추천
  | 'reservation' // 예약 인기
  | 'blog' // 블로그
  | 'operator' // 운영자 확인

export type SourceBadge = {
  /** 중복 제거 및 React key 용 */
  key: string
  /** 화면 표시 라벨 (예: '생활의달인', '쯔양', '백반기행') */
  label: string
  tone: SourceTone
}

const TONE_CLASS: Record<SourceTone, string> = {
  tv: 'bg-blue-50 text-blue-700',
  youtube: 'bg-red-50 text-red-600',
  sns: 'bg-pink-50 text-pink-600',
  guide: 'bg-emerald-50 text-emerald-700',
  local: 'bg-amber-50 text-amber-700',
  reservation: 'bg-indigo-50 text-indigo-700',
  blog: 'bg-violet-50 text-violet-700',
  operator: 'bg-teal-50 text-teal-700',
}

/** 신뢰 출처 종류 → tone. ('other' 는 sns tone 으로 fallback) */
export function trustSourceKindTone(kind: TrustSource['sourceKind']): SourceTone {
  switch (kind) {
    case 'tv':
      return 'tv'
    case 'youtube':
      return 'youtube'
    case 'guide':
      return 'guide'
    case 'local':
      return 'local'
    case 'reservation':
      return 'reservation'
    case 'blog':
      return 'blog'
    case 'operator':
      return 'operator'
    default:
      return 'sns'
  }
}

/** 신뢰 출처 종류 → 짧은 공개 라벨. (과장 표현 없이 사실 범주만) */
export function trustSourceKindLabel(kind: TrustSource['sourceKind']): string {
  switch (kind) {
    case 'tv':
      return '방송'
    case 'youtube':
      return '유튜브'
    case 'guide':
      return '가이드'
    case 'local':
      return '로컬 추천'
    case 'reservation':
      return '예약 인기'
    case 'blog':
      return '블로그'
    case 'operator':
      return '운영자 확인'
    default:
      return '출처'
  }
}

/** tone → Tailwind 색상 클래스. */
export function sourceToneClass(tone: SourceTone): string {
  return TONE_CLASS[tone]
}

function sourceTypeTone(t: SourceType): SourceTone {
  if (t === 'youtube') return 'youtube'
  if (t === 'tv') return 'tv'
  if (t === 'guide') return 'guide'
  return 'sns'
}

/** sourceType 의 짧은 한국어 라벨. */
export function sourceTypeLabel(t: SourceType): string {
  if (t === 'youtube') return '유튜브'
  if (t === 'tv') return '방송'
  if (t === 'guide') return '가이드'
  return 'SNS'
}

type BadgeInput = {
  sourceType: SourceType
  sourceTitle: string
  programName?: string
  creatorName?: string
}

/**
 * 한 출연 기록의 표시 라벨.
 * creator > program > sourceTitle 우선순위로 고르고, 알려진 프로그램이면 정규 표기로 보정한다.
 */
function appearanceLabel(a: BadgeInput): string {
  const raw = a.creatorName ?? a.programName ?? a.sourceTitle
  const slug = getProgramSlugFromName(raw)
  return (slug && getProgramNameFromSlug(slug)) || raw
}

/**
 * 식당의 출처 배지 목록(중복 제거, 최대 max개).
 * - 1순위: appearances(방송/유튜브). 비어 있으면 대표 방송 필드로 단일 배지.
 * - 2순위: [TRUST-H3] trustSources 중 공개(is_public)인 것을 뒤에 덧붙인다.
 *   trustSources 가 비어 있으면(현재 기본 상태) 기존 동작과 동일하다(append-only).
 */
export function resolveSourceBadges(r: Restaurant, max = 3): SourceBadge[] {
  const list: BadgeInput[] =
    r.appearances && r.appearances.length > 0
      ? r.appearances
      : [
          {
            sourceType: r.sourceType,
            sourceTitle: r.sourceTitle,
            programName: r.programName,
            creatorName: r.creatorName,
          },
        ]

  const badges: SourceBadge[] = []
  const seen = new Set<string>()

  const pushBadge = (rawLabel: string, tone: SourceTone) => {
    const label = toDisplayLabel(rawLabel)
    const key = label.normalize('NFC')
    if (!key || seen.has(key) || badges.length >= max) return
    seen.add(key)
    badges.push({ key, label, tone })
  }

  for (const a of list) {
    if (badges.length >= max) break
    pushBadge(appearanceLabel(a), sourceTypeTone(a.sourceType))
  }

  // 신뢰 출처(운영자가 확인한 공개 출처)를 기존 칩 뒤에 덧붙인다.
  // is_public=false(운영자 비공개 메모)는 표시하지 않는다.
  for (const t of r.trustSources ?? []) {
    if (badges.length >= max) break
    if (!t.isPublic) continue
    pushBadge(t.sourceName, trustSourceKindTone(t.sourceKind))
  }

  return badges
}

// ─────────────────────────────────────────────
// 신뢰 출처 상세 표시(추가 출처) — [TRUST-H6]
//   상세페이지 "어디서 봤나요" 섹션에서 칩보다 한 단계 자세한 한 줄 요약 + 링크를 만든다.
// ─────────────────────────────────────────────

function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/** 빈값/중복(NFC) 제거 후 ' · ' 결합. */
function joinDistinct(parts: Array<string | undefined>): string {
  const out: string[] = []
  const seen = new Set<string>()
  for (const p of parts) {
    const t = (p ?? '').trim()
    if (!t) continue
    const key = t.normalize('NFC')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(t)
  }
  return out.join(' · ')
}

export type TrustSourceView = {
  key: string
  tone: SourceTone
  kindLabel: string
  /** trust_label · source_name (중복 제거) */
  primary: string
  /** source_title · verified_at (중복 제거) 또는 null. */
  meta: string | null
  /** http/https URL 만. 없으면 null. */
  url: string | null
}

/**
 * 공개 상세페이지용 신뢰 출처 뷰 목록.
 * - is_public=true 만 (anon 조회가 이미 거르지만 방어적으로 한 번 더).
 * - source_name 이 비어 있으면(이론상 NOT NULL) 건너뛴다.
 * - source_url 은 http/https 만 통과시킨다.
 * - **source_note 는 공개 표시에서 의도적으로 제외한다**(내부 검증/메모 문구 노출 방지).
 * - 과장 표현을 새로 만들지 않고, 입력된 사실 값만 조합한다.
 */
export function resolveTrustSourceViews(
  trustSources: TrustSource[] | undefined,
  max = 4,
): TrustSourceView[] {
  if (!trustSources || trustSources.length === 0) return []
  const views: TrustSourceView[] = []
  for (const t of trustSources) {
    if (!t.isPublic) continue
    const primary = toDisplayLabel(joinDistinct([t.trustLabel, t.sourceName]))
    if (!primary) continue
    const meta = toDisplayLabel(joinDistinct([t.sourceTitle, t.verifiedAt])) || null
    const url = t.sourceUrl && isHttpUrl(t.sourceUrl) ? t.sourceUrl : null
    views.push({
      key: t.id,
      tone: trustSourceKindTone(t.sourceKind),
      kindLabel: trustSourceKindLabel(t.sourceKind),
      primary,
      meta,
      url,
    })
    if (views.length >= max) break
  }
  return views
}

// ─────────────────────────────────────────────
// 검색 출처 탭 — 대표 source_type(방송/유튜브) + 공개 trust_sources(미쉐린/부산공식)
//   다중 출처: 한 식당이 여러 탭에 동시 노출될 수 있다(배타적 아님).
// ─────────────────────────────────────────────

export type SourceTab = 'all' | 'tv' | 'michelin' | 'busan' | 'youtube' | 'postoffice'

// 펼침 목록(표시 순서). all 은 펼침에 노출하지 않고 내부 상태로만 유지(× 로 해제).
export const SOURCE_TABS: ReadonlyArray<{ key: SourceTab; label: string }> = [
  { key: 'tv', label: '방송' },
  { key: 'michelin', label: '미슐랭' },
  { key: 'busan', label: '부산공식' },
  { key: 'youtube', label: '유튜브' },
  { key: 'postoffice', label: '우슐랭' },
]

export function isSourceTab(v: string | null | undefined): v is SourceTab {
  return v === 'all' || v === 'tv' || v === 'michelin' || v === 'busan' || v === 'youtube' || v === 'postoffice'
}

/**
 * 사용자 표시용 라벨 변환 — 내부 데이터(source_name 등)의 '미쉐린/미쉘린'을
 * 화면에는 '미슐랭'으로 통일한다. DB/필터키/동의어는 그대로 유지(표시만 변환).
 */
export function toDisplayLabel(s: string): string {
  return s.replace(/미쉐린|미쉘린/g, '미슐랭')
}

/** 미쉐린 출처 판정 — source_kind=guide 만으론 부족(부산의 맛도 guide). 출처명/공식 도메인 사용. */
function isMichelinTrust(t: TrustSource): boolean {
  if (!t.isPublic) return false
  return /미쉐린|michelin/i.test(t.sourceName) || (t.sourceUrl ?? '').includes('guide.michelin.com')
}

/** 부산공식(부산시·부산관광공사·비짓부산) 출처 판정. 일반 로컬/운영자확인은 제외. */
function isBusanOfficialTrust(t: TrustSource): boolean {
  if (!t.isPublic) return false
  return (
    /부산의\s*맛|비짓\s*부산|visit\s*busan/i.test(t.sourceName) ||
    (t.sourceUrl ?? '').includes('visitbusan.net')
  )
}

export function restaurantHasMichelin(r: Restaurant): boolean {
  return (r.trustSources ?? []).some(isMichelinTrust)
}

export function restaurantHasBusanOfficial(r: Restaurant): boolean {
  return (r.trustSources ?? []).some(isBusanOfficialTrust)
}

/** 우슐랭(우체국 추천 맛집가이드) 출처 판정 — 공개 trust_source 의 source_name 기준.
 *  guide 종류엔 미쉐린/부산의맛도 섞여 있으므로 source_type 이 아니라 출처명으로 판정한다.
 *  source_url 이 null 이어도 is_public 이면 포함한다. */
function isPostofficeTrust(t: TrustSource): boolean {
  if (!t.isPublic) return false
  return t.sourceName.includes('우체국 추천 맛집가이드')
}

export function restaurantHasPostoffice(r: Restaurant): boolean {
  return (r.trustSources ?? []).some(isPostofficeTrust)
}

/** 식당이 해당 출처 탭에 노출되는지. 대표 source_type 우선, 없으면 appearances 보조. */
export function restaurantMatchesSourceTab(r: Restaurant, tab: SourceTab): boolean {
  switch (tab) {
    case 'all':
      return true
    case 'tv':
      return r.sourceType === 'tv' || (r.appearances ?? []).some((a) => a.sourceType === 'tv')
    case 'youtube':
      return (
        r.sourceType === 'youtube' || (r.appearances ?? []).some((a) => a.sourceType === 'youtube')
      )
    case 'michelin':
      return restaurantHasMichelin(r)
    case 'busan':
      return restaurantHasBusanOfficial(r)
    case 'postoffice':
      return restaurantHasPostoffice(r)
    default:
      return true
  }
}
