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
function trustSourceKindTone(kind: TrustSource['sourceKind']): SourceTone {
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

/** tone → Tailwind 색상 클래스. */
export function sourceToneClass(tone: SourceTone): string {
  return TONE_CLASS[tone]
}

function sourceTypeTone(t: SourceType): SourceTone {
  if (t === 'youtube') return 'youtube'
  if (t === 'tv') return 'tv'
  return 'sns'
}

/** sourceType 의 짧은 한국어 라벨. */
export function sourceTypeLabel(t: SourceType): string {
  if (t === 'youtube') return '유튜브'
  if (t === 'tv') return '방송'
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

  const pushBadge = (label: string, tone: SourceTone) => {
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
