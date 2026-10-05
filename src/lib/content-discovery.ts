import type { Appearance, Restaurant } from '@/types/restaurant'
import { getProgramNameFromSlug, getProgramSlugFromName } from '@/lib/programs'

export type ContentSource = {
  slug: string
  name: string
  kind: 'program' | 'creator'
  restaurantCount: number
}

export type ContentGroup = {
  key: string
  title: string
  date?: string
  sourceUrl?: string
  restaurants: Restaurant[]
}

function appearancesOf(restaurant: Restaurant): Appearance[] {
  return restaurant.appearances?.length
    ? restaurant.appearances
    : [{
        id: `${restaurant.id}:fallback`,
        restaurantId: restaurant.id,
        sourceType: restaurant.sourceType,
        sourceTitle: restaurant.sourceTitle,
        programName: restaurant.programName,
        creatorName: restaurant.creatorName,
        episodeTitle: restaurant.episodeTitle,
        broadcastDate: restaurant.broadcastDate,
        videoUrl: restaurant.videoUrl,
        createdAt: '',
      }]
}

function appearanceMatches(
  appearance: Appearance,
  slug: string,
  kind: ContentSource['kind'],
): boolean {
  if (kind === 'creator') {
    return appearance.sourceType === 'youtube' && getProgramSlugFromName(appearance.creatorName) === slug
  }

  return [appearance.sourceTitle, appearance.programName, appearance.creatorName]
    .some((name) => getProgramSlugFromName(name) === slug)
}

/**
 * 공개 식당의 출연 기록을 소비자 탐색용 출처 카드로 집계한다.
 * DB를 새로 만들지 않고 기존 appearances의 다대일 관계를 그대로 사용한다.
 */
export function getContentSources(restaurants: Restaurant[]): ContentSource[] {
  const restaurantsBySource = new Map<string, Set<string>>()

  for (const restaurant of restaurants) {
    for (const appearance of appearancesOf(restaurant)) {
      const isCreator = appearance.sourceType === 'youtube' && Boolean(appearance.creatorName)
      const rawName = isCreator
        ? appearance.creatorName
        : appearance.programName ?? appearance.creatorName ?? appearance.sourceTitle
      const slug = getProgramSlugFromName(rawName)
      if (!slug) continue
      const kind: ContentSource['kind'] = isCreator ? 'creator' : 'program'
      const key = `${kind}:${slug}`
      const ids = restaurantsBySource.get(key) ?? new Set<string>()
      ids.add(restaurant.id)
      restaurantsBySource.set(key, ids)
    }
  }

  return Array.from(restaurantsBySource, ([key, ids]) => {
    const [kind, slug] = key.split(':') as [ContentSource['kind'], string]
    return {
      slug,
      kind,
      name: getProgramNameFromSlug(slug) ?? slug,
      restaurantCount: ids.size,
    }
  }).sort((a, b) =>
    b.restaurantCount - a.restaurantCount || a.name.localeCompare(b.name, 'ko'),
  )
}

/** 같은 출처의 식당을 회차·영상 단위로 묶는다. 제목이 없으면 날짜만 표시하며, 사실을 추정하지 않는다. */
export function getContentGroups(
  restaurants: Restaurant[],
  slug: string,
  kind: ContentSource['kind'],
): ContentGroup[] {
  const groups = new Map<string, ContentGroup>()

  for (const restaurant of restaurants) {
    for (const appearance of appearancesOf(restaurant)) {
      if (!appearanceMatches(appearance, slug, kind)) continue
      const date = appearance.broadcastDate
      const title = appearance.episodeTitle?.trim() || (date ? `${date} 출연 기록` : '출연 기록')
      const key = `${title}\u0000${date ?? ''}`
      const current = groups.get(key) ?? {
        key,
        title,
        date,
        sourceUrl: appearance.videoUrl,
        restaurants: [],
      }
      if (!current.sourceUrl && appearance.videoUrl) current.sourceUrl = appearance.videoUrl
      if (!current.restaurants.some((item) => item.id === restaurant.id)) {
        current.restaurants.push(restaurant)
      }
      groups.set(key, current)
    }
  }

  return Array.from(groups.values()).sort((a, b) => {
    const aDate = a.date ?? ''
    const bDate = b.date ?? ''
    if (aDate !== bDate) return bDate.localeCompare(aDate)
    return a.title.localeCompare(b.title, 'ko')
  })
}
