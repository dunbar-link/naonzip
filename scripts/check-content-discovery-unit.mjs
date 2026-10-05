/**
 * 콘텐츠-장소 묶음 안전성 회귀 테스트.
 *
 * 동일 제목/날짜라도 영상 URL이 다르거나 URL이 없으면 절대 합쳐지지 않아야 한다.
 * 실행: npm run content:unit
 */
import process from 'node:process'
import { getContentGroups, getContentSources } from '../src/lib/content-discovery.ts'

const base = {
  sourceType: 'tv',
  sourceTitle: '2TV 생생정보',
  programName: '2TV 생생정보',
  creatorName: undefined,
  episodeTitle: '부산 맛집 특집',
  broadcastDate: '2026-01-02',
  createdAt: '2026-01-03T00:00:00.000Z',
}

function restaurant(id, appearances) {
  return {
    id,
    slug: id,
    name: id,
    sourceType: 'tv',
    sourceTitle: '2TV 생생정보',
    programName: '2TV 생생정보',
    appearances: appearances.map((appearance, index) => ({
      ...base,
      id: `${id}:${index}`,
      restaurantId: id,
      ...appearance,
    })),
  }
}

const fixtures = [
  restaurant('same-video-a', [{ videoUrl: 'https://example.test/video-a' }]),
  restaurant('same-video-b', [{ videoUrl: 'https://example.test/video-a' }]),
  restaurant('different-video', [{ videoUrl: 'https://example.test/video-b' }]),
  restaurant('linkless-a', [{ videoUrl: undefined }]),
  restaurant('linkless-b', [{ videoUrl: undefined }]),
  restaurant('unknown-record', [{ episodeTitle: undefined, broadcastDate: undefined, videoUrl: undefined }]),
  restaurant('creator-record', [{
    sourceType: 'youtube',
    sourceTitle: '쯔양',
    programName: undefined,
    creatorName: '쯔양',
    episodeTitle: '부산편',
    videoUrl: 'https://example.test/creator-video',
  }]),
]

let fail = 0
function check(label, value) {
  console.log(`  [${value ? 'PASS' : 'FAIL'}] ${label}`)
  if (!value) fail += 1
}

const groups = getContentGroups(fixtures, 'live-info', 'program')
const byUrl = new Map(groups.map((group) => [group.sourceUrl ?? group.key, group]))

console.log('=== 콘텐츠-장소 묶음 회귀 ===')
check('동일 영상 URL은 한 묶음', byUrl.get('https://example.test/video-a')?.restaurants.length === 2)
check('같은 제목·날짜의 다른 영상은 분리', byUrl.get('https://example.test/video-b')?.restaurants.length === 1)
check('링크 없는 동명 기록은 각각 분리', groups.filter((group) => !group.sourceUrl).length === 3)
check('링크 없는 기록은 다른 출처 URL을 표시하지 않음', groups.filter((group) => !group.sourceUrl).every((group) => group.restaurants.length === 1))

const sources = getContentSources(fixtures)
check('비대표 유튜브 출연도 크리에이터 탐색에 포함', sources.some((source) => source.kind === 'creator' && source.slug === 'tzuyang' && source.restaurantCount === 1))

console.log(`=== 콘텐츠-장소 묶음: ${fail === 0 ? 'PASS' : 'FAIL'} (${5 - fail}/5) ===`)
process.exit(fail === 0 ? 0 : 1)
