/**
 * 출처(source) 배지 resolver — "어디서 봤는지"를 한눈에 보여주는 칩 목록을 만든다.
 *
 * 설계 원칙
 *  - 현재는 기존 데이터(restaurant.appearances / 방송 필드)에서만 배지를 파생한다.
 *  - 블루리본·로컬추천·인기예약·파워블로거 등 신뢰 출처는 실제 데이터가 들어오기
 *    전까지 화면에 표시하지 않는다. (tone 팔레트만 미리 열어 두어 확장 가능하게 유지)
 *  - DB schema 를 바꾸지 않는다. 알려진 프로그램명은 programs.ts 의 정규 표기로 보정한다.
 *
 * 이 파일은 서버/클라이언트 양쪽에서 import 가능하다. (외부 의존성 없음)
 */

import type { Restaurant, SourceType } from '@/types/restaurant'
import { getProgramSlugFromName, getProgramNameFromSlug } from '@/lib/programs'

// 현재 사용 tone + 향후 신뢰 출처용 tone(데이터 들어오면 활성화).
export type SourceTone =
  | 'tv'
  | 'youtube'
  | 'sns'
  | 'guide' // 향후: 블루리본/가이드북
  | 'local' // 향후: 로컬 추천
  | 'reservation' // 향후: 인기 예약
  | 'blog' // 향후: 파워블로거

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
 * appearances 가 비어 있으면 대표 방송 필드로 단일 배지를 만든다.
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
  for (const a of list) {
    const label = appearanceLabel(a)
    const key = label.normalize('NFC')
    if (!key || seen.has(key)) continue
    seen.add(key)
    badges.push({ key, label, tone: sourceTypeTone(a.sourceType) })
    if (badges.length >= max) break
  }
  return badges
}
