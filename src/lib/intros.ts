/**
 * Landing 페이지(category / area / creator) hero 하단 SEO intro.
 *
 * - 정적 카피. 운영 데이터 아님.
 * - 누락 slug 는 종류별 fallback 1문장으로 자동 노출 (thin content 방지).
 * - 분량: 2문단(또는 1문단 fallback), 평서형 `~다`.
 * - 변경 빈도 낮음 → git 추적이 더 유리. Supabase 이관은 향후 100건+ 시 재검토.
 */

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────

export type Intro = {
  paragraphs: string[]
}

export type IntroKind = 'category' | 'area' | 'creator'

// ─────────────────────────────────────────────
// slug → intro 매핑 (시범 적용)
// ─────────────────────────────────────────────

export const categoryIntros: Record<string, Intro> = {
  'dwaeji-gukbap': {
    paragraphs: [
      '돼지국밥은 돼지뼈와 살코기를 오래 끓여 만든 국물에 밥을 말아 먹는 부산 향토 음식으로, 6·25 피란 시기 서면·범일동 일대에서 자리잡은 것으로 알려져 있다.',
      '이 페이지에는 백반기행, 생활의 달인, 성시경 먹을텐데 등 방송과 유튜브에 소개된 부산 돼지국밥집을 최신 방영순으로 정리해두었다.',
    ],
  },
}

export const areaIntros: Record<string, Intro> = {
  'nampodong': {
    paragraphs: [
      '남포동은 중구에 속한 부산의 옛 중심 상권으로, 자갈치시장·국제시장과 이어지며 회·낙곱새·씨앗호떡 같은 노포 갈래가 모여 있는 지역이다.',
      '이 페이지에는 남포동 일대에서 방송과 유튜브에 소개된 가게를 최신 방영순으로 모아두었다.',
    ],
  },
}

export const creatorIntros: Record<string, Intro> = {
  'sungsik': {
    paragraphs: [
      "성시경의 유튜브 채널 '먹을텐데'는 가수 성시경이 직접 지역 노포를 찾아 식사 장면을 담는 시리즈로, 부산 편에서는 돼지국밥·밀면·횟집을 중심으로 다뤘다.",
      "이 페이지에는 '먹을텐데' 부산 편에 소개된 가게를 영상 공개일 기준 최신순으로 정리해두었다.",
    ],
  },
}

// ─────────────────────────────────────────────
// fallback
// ─────────────────────────────────────────────

function getFallback(kind: IntroKind, name: string): Intro {
  if (kind === 'category') {
    return {
      paragraphs: [
        `부산 ${name} 카테고리의 방송·유튜브 출연 가게를 최신 방영순으로 정리한 페이지다.`,
      ],
    }
  }
  if (kind === 'area') {
    return {
      paragraphs: [
        `부산 ${name} 일대에서 방송·유튜브에 소개된 가게를 최신 방영순으로 정리한 페이지다.`,
      ],
    }
  }
  return {
    paragraphs: [
      `${name}이 부산에서 소개한 가게를 영상 공개일 기준 최신순으로 정리한 페이지다.`,
    ],
  }
}

// ─────────────────────────────────────────────
// helper
// ─────────────────────────────────────────────

function getMap(kind: IntroKind): Record<string, Intro> {
  if (kind === 'category') return categoryIntros
  if (kind === 'area') return areaIntros
  return creatorIntros
}

export function getIntro(
  kind: IntroKind,
  slug: string,
  name: string,
): Intro {
  return getMap(kind)[slug] ?? getFallback(kind, name)
}
